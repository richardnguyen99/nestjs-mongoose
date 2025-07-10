import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UsePipes,
} from "@nestjs/common";

import { NamesService } from "./names.service";
import { ZodValidationPipe } from "src/validations/zod-validation.pipe";
import { nameCreateSchema, NameCreateDto } from "src/names/dto/name-create.dto";

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
  @UsePipes(new ZodValidationPipe(nameCreateSchema))
  async createName(@Body() dto: NameCreateDto) {
    const createName = await this.namesService.create(dto);

    if (!createName) {
      throw new NotFoundException("Failed to create name");
    }

    return createName;
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
    const name = await this.namesService.findByNconst(nconst);

    if (!name) {
      throw new NotFoundException(`Name with nconst=${nconst} not found`);
    }

    return name;
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
