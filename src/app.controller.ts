import { Controller, Get, Version, VERSION_NEUTRAL } from "@nestjs/common";

@Controller()
export class AppController {
  constructor() {}

  @Get("health")
  @Version(VERSION_NEUTRAL)
  healthCheck(): string {
    return "OK";
  }
}
