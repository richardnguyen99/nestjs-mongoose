import { NestFactory } from "@nestjs/core";
import { Logger, VersioningType } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import mongoose from "mongoose";
import { WinstonModule } from "nest-winston";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { ZodExceptionFilter } from "./filters/zod-exception.filter";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { RequestIdInterceptor } from "./interceptors/request-id.interceptor";
import { MongooseExceptionFilter } from "./filters/mongoose-exception.filter";
import { MongodbExceptionFilter } from "./filters/mongodb-exception.filter";
import { loggerConfig } from "./libs/logger";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig()),
  });

  mongoose.set("debug", (collectionName, method, query, doc) => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const mongooseLogger = new Logger("Mongoose");

    mongooseLogger.log(`${collectionName}.${method}(${JSON.stringify(query)})`);
  });

  const logger = new Logger("App");

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ZodExceptionFilter());
  app.useGlobalFilters(new MongooseExceptionFilter());
  app.useGlobalFilters(new MongodbExceptionFilter());

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

  logger.log(`Application started on port: 3000`);
}

bootstrap();
