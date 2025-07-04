import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { OkResponse } from "src/interfaces/response.interface";

/**
 * Basic response interceptor to append a consistent structure to all
 * successful responses.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: response.statusCode,
          message: this.getSuccessMessage(request.method),
          data: data ?? null,
          timestamp: new Date().toISOString(),
        } satisfies OkResponse;
      }),
    );
  }

  // Helper method to generate success messages based on HTTP method
  private getSuccessMessage(method: string): string {
    switch (method) {
      case "GET":
        return "Request successful";
      case "POST":
        return "Resource created successfully";
      case "PUT":
        return "Resource updated successfully";
      case "PATCH":
        return "Resource partially updated successfully";
      case "DELETE":
        return "Resource deleted successfully";
      default:
        return "Operation successful";
    }
  }
}
