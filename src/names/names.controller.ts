import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { NamesService } from "./names.service";

@Controller({
  version: "1",
  path: "names",
})
export class NamesController {
  constructor(private readonly namesService: NamesService) {}

  @Get("/")
  @HttpCode(HttpStatus.OK)
  @Header("Cache-Control", "no-store")
  @Header("Content-Type", "application/json")
  async getNames() {
    return [];
  }

  @Post("/")
  @HttpCode(HttpStatus.CREATED)
  @Header("Cache-Control", "no-store")
  @Header("Content-Type", "application/json")
  async createName() {
    return {};
  }

  @Get("search")
  @HttpCode(HttpStatus.OK)
  @Header("Cache-Control", "no-store")
  @Header("Content-Type", "application/json")
  async searchByName() {
    return [];
  }

  @Get(":nconst")
  @HttpCode(HttpStatus.OK)
  @Header("Cache-Control", "no-store")
  @Header("Content-Type", "application/json")
  async getByNconst(@Param("nconst") nconst: string) {
    return {};
  }

  @Put(":nconst")
  @HttpCode(HttpStatus.OK)
  @Header("Cache-Control", "no-store")
  @Header("Content-Type", "application/json")
  async updateByNconst(@Param("nconst") nconst: string) {
    return {};
  }

  @Delete(":nconst")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Header("Cache-Control", "no-store")
  @Header("Content-Type", "application/json")
  async deleteByNconst(@Param("nconst") nconst: string) {
    return {};
  }
}
