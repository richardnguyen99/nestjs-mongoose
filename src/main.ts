import { NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import mongoose from "mongoose";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { ZodExceptionFilter } from "./filters/zod-exception.filter";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { RequestIdInterceptor } from "./interceptors/request-id.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  mongoose.set("debug", process.env.NODE_ENV === "development");

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ZodExceptionFilter());

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new RequestIdInterceptor());

  app.set("query parser", "extended");

  app.enableCors({
    origin: "*", // Allow all origins, adjust as needed for production
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Accept",
    credentials: true, // Allow credentials if needed
  });

  app.enableVersioning({
    prefix: "api/v",
    defaultVersion: "1",
    type: VersioningType.URI,
  });

  await app.listen(3000);
}
bootstrap();
