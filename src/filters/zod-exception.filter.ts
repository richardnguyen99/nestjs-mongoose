import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";
import { ZodError } from "zod";

import { ErrorResponse } from "src/interfaces/response.interface";

/**
 * Exception filter for handling Zod validation errors in NestJS.
 *
 * This filter catches exceptions of type `ZodError` and formats the validation
 * issues into a structured JSON response with HTTP status 400 (Bad Request).
 *
 * @catch ZodError
 * @implements ExceptionFilter
 */
@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ZodExceptionFilter");

  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.BAD_REQUEST;

    const exceptionMessage = exception.issues.reduce((acc, issue) => {
      const issuePath =
        issue.path.length > 0 ? issue.path.join(".") + ": " : "";

      return `${issuePath}${issue.message}\n${acc}`;
    }, "");

    const requestId = request.headers["X-Request-Id"] ?? "unknown-request-id";

    this.logger.error(`Zod Exception Filter: ${exception.message}`, {
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
      message: exceptionMessage,
    } satisfies ErrorResponse);
  }
}
