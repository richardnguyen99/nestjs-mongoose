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
  Version,
} from "@nestjs/common";

import { BasicsService } from "./basics.service";
import { ZodValidationPipe } from "src/validations/zod-validation.pipe";
import { BasicsSearchDto, basicsSearchSchema } from "./dto/basics-search.dto";
import { BasicCreateDto, basicCreateSchema } from "./dto/basic-create.dto";
import { BasicUpdateDto, basicUpdateSchema } from "./dto/basic-update.dto";

@Controller({
  version: "1",
  path: "basics",
})
export class BasicsController {
  constructor(private readonly basicsService: BasicsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Header("Cache-Control", "no-store")
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

  @Put(":tconst")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(basicUpdateSchema))
  async updateBasicByTconst(
    @Param("tconst") tconst: string,
    @Body() body: BasicUpdateDto,
  ) {
    const updatedBasic = await this.basicsService.updateByTconst(tconst, body);

    if (!updatedBasic) {
      throw new NotFoundException(`Title with tconst=${tconst} not found`);
    }

    return updatedBasic;
  }
}
