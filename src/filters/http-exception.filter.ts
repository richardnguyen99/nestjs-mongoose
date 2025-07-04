import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Response, Request } from "express";

import { ErrorResponse } from "src/interfaces/response.interface";

/**
 * Exception filter for handling HTTP exceptions in NestJS.
 *
 * This filter catches exceptions of type `HttpException` and formats the
 * validation issues into a structured JSON response with a corresponding HTTP
 * status code from the exception.
 *
 * @catch HttpException
 * @implements ExceptionFilter
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      requestCtx: {
        method: request.method,
        url: request.url,
        query: request.query,
        params: request.params,
      },
      timestamp: new Date().toISOString(),
      statusCode: status,
      message: exception.message,
    } satisfies ErrorResponse);
  }
}
