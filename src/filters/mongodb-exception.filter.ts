import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import * as mongoose from "mongoose";

import { ErrorResponse } from "src/interfaces/response.interface";

@Catch(mongoose.mongo.MongoServerError)
export class MongodbExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("MongodbExceptionFilter");

  catch(exception: mongoose.mongo.MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500; // Default to 500 Internal Server Error
    let message = "Internal Server Error";

    if (exception.code === 11000) {
      const errorMessage = Object.keys(exception.errorResponse.keyValue || {})
        .map((key) => `${key}=${exception.errorResponse.keyValue[key]}`)
        .join(",");

      status = 409; // Conflict
      message = `Duplicate key error: ${errorMessage}`;
    } else if (exception.name === "MongoNetworkError") {
      status = 503; // Service Unavailable
      message = "Database connection error";
    }

    this.logger.error(`MongoDB Exception Filter: ${exception.message}`, {
      exception,
      body: request.body,
      headers: request.headers,
      url: request.url,
      method: request.method,
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
