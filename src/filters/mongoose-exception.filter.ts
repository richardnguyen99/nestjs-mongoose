import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import * as mongoose from "mongoose";

/**
 * Exception filter for handling Mongoose exceptions in NestJS.
 *
 * This filter catches exceptions of type `MongooseException` and formats the
 * validation issues into a structured JSON response with a corresponding HTTP
 * status code from the exception.
 *
 * @see https://mongoosejs.com/docs/api/error.html
 *
 * @catch mongoose.MongooseError
 * @implements ExceptionFilter
 */
@Catch(mongoose.MongooseError)
export class MongooseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("MongooseExceptionFilter");

  catch(exception: mongoose.MongooseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500; // Default to 500 Internal Server Error
    let message = "Internal Server Error";

    if (exception instanceof mongoose.Error.CastError) {
      status = 400; // Bad Request
      message = `Invalid value for field: <${exception.path}>. Value: <${exception.value}>`;
    } else if (exception instanceof mongoose.Error.ValidationError) {
      status = 422; // Unprocessable Entity
      message = `Validation failed: ${Object.values(exception.errors)
        .map((err) => err.message)
        .join(", ")}`;
    }

    this.logger.error(`Mongoose Exception Filter: ${exception.message}`, {
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
    });
  }
}
