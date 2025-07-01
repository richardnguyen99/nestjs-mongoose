import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  let a = "Hello, World!";
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
