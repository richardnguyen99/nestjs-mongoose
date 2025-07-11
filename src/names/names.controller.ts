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
  Query,
  UsePipes,
} from "@nestjs/common";

import { NamesService } from "./names.service";
import { ZodValidationPipe } from "src/validations/zod-validation.pipe";
import { nameCreateSchema, NameCreateDto } from "src/names/dto/name-create.dto";
import { NameUpdateDto, nameUpdateSchema } from "./dto/name-update.dto";
import { NameSearchDto, nameSearchSchema } from "./dto/name-search.dto";

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
  @UsePipes(new ZodValidationPipe(nameSearchSchema))
  async searchByName(@Query() dto: NameSearchDto) {
    console.log(dto);

    const { q, ...options } = dto;
    const results = await this.namesService.search(q, options);

    return results;
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
  @UsePipes(new ZodValidationPipe(nameUpdateSchema))
  async updateByNconst(
    @Param("nconst") nconst: string,
    @Body() dto: NameUpdateDto,
  ) {
    const updatedName = await this.namesService.update(nconst, dto);

    if (!updatedName) {
      throw new NotFoundException(`Name with nconst=${nconst} not found`);
    }

    return updatedName;
  }

  @Delete(":nconst")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Header("Cache-Control", "no-store")
  async deleteByNconst(@Param("nconst") nconst: string) {
    const deletedName = await this.namesService.deleteByNconst(nconst);

    if (!deletedName) {
      throw new NotFoundException(`Name with nconst=${nconst} not found`);
    }

    return deletedName;
  }
}
