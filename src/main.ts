import { NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
