import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UsePipes,
  Version,
} from "@nestjs/common";

import { BasicsService } from "./basics.service";
import { ZodValidationPipe } from "src/validations/zod-validation.pipe";
import { BasicsSearchDto, basicsSearchSchema } from "./dto/basics-search.dto";
import { BasicCreateDto, basicCreateSchema } from "./dto/basic.create.dto";
import mongoose from "mongoose";

@Controller({
  version: "1",
  path: "basics",
})
export class BasicsController {
  constructor(private readonly basicsService: BasicsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(basicCreateSchema))
  async createBasic(@Body() body: BasicCreateDto) {
    return this.basicsService.createBasic(body);
  }

  @Get("search")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(basicsSearchSchema))
  async searchByTitle(@Query() query: BasicsSearchDto) {
    const { q, limit, page, sort, filter } = query;

    const result = await this.basicsService.searchByTitle(q, {
      limit,
      page,
      sort,
      filter,
    });

    return result;
  }

  @Get(":tconst")
  @HttpCode(HttpStatus.OK)
  async getByTconst(@Param("tconst") tconst: string) {
    const result = await this.basicsService.findByTconst(tconst);

    if (!result) {
      throw new NotFoundException(`Title with tconst=${tconst} not found`);
    }

    return result;
  }

  @Delete(":tconst")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteByTconst(@Param("tconst") tconst: string) {
    const result = await this.basicsService.deleteByTconst(tconst);

    if (!result) {
      throw new NotFoundException(`Title with tconst=${tconst} not found`);
    }

    return result;
  }
}
