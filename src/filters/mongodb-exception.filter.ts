import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import * as mongoose from "mongoose";

import { ErrorResponse } from "src/interfaces/response.interface";

/**
 * Exception filter for handling MongoDB exceptions in NestJS.
 *
 * This filter catches exceptions of type `MongoServerError` and formats the
 * validation issues into a structured JSON response with a corresponding HTTP
 * status code from the exception.
 *
 * MongoDB errors are different from Mongoose Errors. They are relevant to
 * schema definitions and validations, not driver-level errors.
 *
 * @catch mongoose.mongo.MongoServerError
 * @implements ExceptionFilter
 */
@Catch(mongoose.mongo.MongoServerError)
export class MongodbExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("MongodbExceptionFilter");

  catch(exception: mongoose.mongo.MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers["X-Request-Id"] ?? "unknown-request-id";

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal Server Error";

    // MongoDB-specific duplicate key error
    if (exception.code === 11000) {
      const errorMessage = Object.keys(exception.errorResponse.keyValue || {})
        .map((key) => `${key}=${exception.errorResponse.keyValue[key]}`)
        .join(",");

      status = HttpStatus.CONFLICT;
      message = `Duplicate key error: ${errorMessage}`;
    } else if (exception.name === "MongoNetworkError") {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = "Database connection error";
    }

    this.logger.error(`MongoDB Exception Filter: ${exception.message}`, {
      exception,
      body: request.body,
      headers: request.headers,
      url: request.url,
      method: request.method,
      requestId,
    });

    response.status(status).json({
      requestCtx: {
        method: request.method,
        url: request.url,
        query: request.query,
        params: request.params,
      },
      timestamp: new Date().toISOString(),
      statusCode: status,
      message: message,
    } satisfies ErrorResponse);
  }
}
