import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { VersioningType } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
