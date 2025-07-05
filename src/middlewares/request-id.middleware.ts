import { Injectable, NestMiddleware } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Generate a unique request ID
    const requestId = uuidv4();
    req.headers["X-Request-Id"] = requestId;

    next();
  }
}
