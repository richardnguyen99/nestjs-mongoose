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

import { BasicsService } from "./basics.service";
import { ZodValidationPipe } from "src/validations/zod-validation.pipe";
import { BasicSearchDto, basicSearchSchema } from "./dto/basic-search.dto";
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
  @UsePipes(new ZodValidationPipe(basicSearchSchema))
  async searchByTitle(@Query() query: BasicSearchDto) {
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

  @Get(":tconst/cast")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  async getCastByTconst(@Param("tconst") tconst: string) {
    const cast = await this.basicsService.getCastByTconst(tconst);

    if (!cast || cast.length === 0) {
      throw new NotFoundException(`No cast found for tconst=${tconst}`);
    }

    return {
      tconst,
      titleUrl: `https://www.imdb.com/title/${tconst}`,
      cast,
    };
  }
}
