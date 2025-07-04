import { NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { ZodExceptionFilter } from "./filters/zod-exception.filter";
import { ResponseInterceptor } from "./interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ZodExceptionFilter());

  app.useGlobalInterceptors(new ResponseInterceptor());

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
