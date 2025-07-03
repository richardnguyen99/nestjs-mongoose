import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response, Request } from "express";
import { ZodError } from "zod";

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = 400; // Bad Request

    const exceptionMessage = exception.issues.reduce((acc, issue) => {
      return `${issue.path.join(".")}: ${issue.message}\n${acc}`;
    }, "");

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
    });
  }
}
