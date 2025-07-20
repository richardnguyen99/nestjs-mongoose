import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Logger,
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
import {
  PrincipalCreateDto,
  principalCreateSchema,
} from "src/principals/dto/principal-create.dto";
import {
  PrincipalUpdateDto,
  principalUpdateSchema,
} from "src/principals/dto/principal-update.dto";
import {
  PrincipalQueryDto,
  principalQuerySchema,
  PrincipalSingleQueryDto,
  principalSingleQuerySchema,
} from "src/principals/dto/principal-query.dto";

@Controller({
  version: "1",
  path: "basics",
})
export class BasicsController {
  private readonly logger = new Logger(BasicsController.name);

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
  @Header("Content-Type", "application/json")
  @UsePipes(new ZodValidationPipe(principalQuerySchema))
  @HttpCode(HttpStatus.OK)
  async getCastByTconst(
    @Param("tconst") tconst: string,
    @Query() options?: PrincipalQueryDto,
  ) {
    const cast = await this.basicsService.getCastByTconst(tconst, options);

    if (cast.totalCount === 0) {
      throw new NotFoundException(`No cast found for tconst=${tconst}`);
    }

    if (cast.currentPage > cast.totalPages) {
      throw new BadRequestException(
        `Page exceeds. totalPages=${cast.totalPages}, currentPage=${cast.currentPage}`,
      );
    }

    return {
      tconst,
      titleUrl: `https://www.imdb.com/title/${tconst}`,
      ...cast,
    };
  }

  @Post(":tconst/cast")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(principalCreateSchema))
  async addCastToTitle(
    @Param("tconst") tconst: string,
    @Body() body: PrincipalCreateDto,
  ) {
    return this.basicsService.addCastToTitle(tconst, body);
  }

  @Get(":tconst/cast/:nconst")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(principalSingleQuerySchema))
  async getCastByTconstAndNconst(
    @Param("tconst") tconst: string,
    @Param("nconst") nconst: string,
    @Query() options?: PrincipalSingleQueryDto,
  ) {
    const cast = await this.basicsService.findByTconstAndNconst(
      tconst,
      nconst,
      options,
    );

    if (!cast) {
      throw new NotFoundException(
        `No cast found for tconst=${tconst} and nconst=${nconst}`,
      );
    }

    return cast;
  }

  @Put(":tconst/cast/:nconst")
  @Header("Cache-Control", "no-store")
  @Header("Content-Type", "application/json")
  @UsePipes(new ZodValidationPipe(principalUpdateSchema))
  async updateCastByTconstAndNconst(
    @Param("tconst") tconst: string,
    @Param("nconst") nconst: string,
    @Body() body: PrincipalUpdateDto,
  ) {
    const ordering = body.ordering;

    const updatedCast = await this.basicsService.updateCastInTitle(
      tconst,
      nconst,
      ordering,
      body,
    );

    if (!updatedCast) {
      throw new NotFoundException(
        `No cast found for tconst=${tconst}, nconst=${nconst} and ordering=${ordering}`,
      );
    }

    return updatedCast;
  }

  @Delete(":tconst/cast/:nconst")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCastByTconstAndNconst(
    @Param("tconst") tconst: string,
    @Param("nconst") nconst: string,
  ): Promise<void> {
    const result = await this.basicsService.removeCastFromTitle(tconst, nconst);

    if (!result || result.deletedCount === 0) {
      throw new NotFoundException(
        `No cast found for tconst=${tconst} and nconst=${nconst}`,
      );
    }

    return;
  }
}
