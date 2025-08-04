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
import { CrewQueryDto, crewQuerySchema } from "src/crews/dto/crew-query.dto";
import { CrewUpdateDto, crewUpdateSchema } from "src/crews/dto/crew-update.dto";
import {
  AkaQueryDto,
  akaQueryDto,
  baseAkaQueryDto,
} from "src/akas/dto/aka-query.dto";
import {
  AkaCreateDto,
  akaCreateDto,
  baseAkaCreateDto,
  BaseAkaCreateDto,
} from "src/akas/dto/aka-create.dto";
import {
  akaUpdateDto,
  BaseAkaUpdateDto,
  baseAkaUpdateDto,
} from "src/akas/dto/aka-update.dto";
import {
  BaseEpisodeCreateDto,
  baseEpisodeCreateSchema,
} from "src/episodes/dto/episode-create.dto";
import {
  BaseEpisodeUpdateDto,
  baseEpisodeUpdateSchema,
} from "src/episodes/dto/episode-update.dto";

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

    if (!result) {
      throw new NotFoundException(
        `No cast found for tconst=${tconst} and nconst=${nconst}`,
      );
    }

    return;
  }

  @Get(":tconst/crews")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(crewQuerySchema))
  async getCrewsByTconst(
    @Param("tconst") tconst: string,
    @Query() query: CrewQueryDto,
  ) {
    this.logger.log(query);

    const crew = await this.basicsService.getCrewByTconst(tconst, query);

    // There is no crew record matching the tconst
    if (crew.totalCount === 0) {
      throw new NotFoundException(`No crew found for tconst=${tconst}`);
    }

    if (crew.currentPage > crew.totalPages) {
      throw new BadRequestException(
        `Current page ${crew.currentPage} exceeds total pages ${crew.totalPages}`,
      );
    }

    return crew;
  }

  @Post(":tconst/crews")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(principalCreateSchema))
  async addCrewsToTitle(
    @Param("tconst") tconst: string,
    @Body() body: PrincipalCreateDto,
  ) {
    this.logger.log(body);

    const newCrew = await this.basicsService.addCrewToTitle(tconst, body);

    return newCrew;
  }

  @Put(":tconst/crews")
  @Header("Cache-Control", "no-store")
  @Header("Content-Type", "application/json")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(crewUpdateSchema))
  async updateCrewsByTconst(
    @Param("tconst") tconst: string,
    @Body() body: CrewUpdateDto,
  ) {
    const updatedCrewRecord = await this.basicsService.updateCrewRecord(
      tconst,
      body,
    );

    if (!updatedCrewRecord) {
      throw new NotFoundException(`No crew found for tconst=${tconst}`);
    }

    return updatedCrewRecord;
  }

  @Get(":tconst/crews/:nconst")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(principalSingleQuerySchema))
  async getCrewByTconstAndNconst(
    @Param("tconst") tconst: string,
    @Param("nconst") nconst: string,
    @Query() options?: PrincipalSingleQueryDto,
  ) {
    this.logger.log(
      `Fetching crew member with nconst=${nconst} for title with tconst=${tconst}`,
    );

    const crew = await this.basicsService.findByTconstAndNconst(
      tconst,
      nconst,
      options,
    );

    if (!crew) {
      throw new NotFoundException(
        `No crew member found for tconst=${tconst} and nconst=${nconst}`,
      );
    }

    return crew;
  }

  @Put(":tconst/crews/:nconst")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(principalUpdateSchema))
  async updateCrewByTconstAndNconst(
    @Param("tconst") tconst: string,
    @Param("nconst") nconst: string,
    @Body() body: PrincipalUpdateDto,
  ) {
    this.logger.log(
      `Updating crew member with nconst=${nconst} for title with tconst=${tconst}`,
    );

    const ordering = body.ordering;

    const updateCrew = await this.basicsService.updateCrewInTitle(
      tconst,
      nconst,
      ordering,
      body,
    );

    if (!updateCrew) {
      throw new NotFoundException(
        `No crew member found for tconst=${tconst} and nconst=${nconst}`,
      );
    }

    return updateCrew;
  }

  @Delete(":tconst/crews/:nconst")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCrewByTconstAndNconst(
    @Param("tconst") tconst: string,
    @Param("nconst") nconst: string,
  ): Promise<void> {
    this.logger.log(
      `Deleting crew member with nconst=${nconst} for title with tconst=${tconst}`,
    );

    const result = await this.basicsService.removeCrewFromTitle(tconst, nconst);

    if (!result) {
      throw new NotFoundException(
        `No crew member found for tconst=${tconst} and nconst=${nconst}`,
      );
    }

    return;
  }

  @Get(":tconst/akas")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(akaQueryDto))
  async getAkasByTconst(
    @Param("tconst") tconst: string,
    @Query() query: AkaQueryDto,
  ) {
    this.logger.log(query);

    const akas = await this.basicsService.getAkasByTconst(tconst, query);

    if (akas.totalCount === 0) {
      throw new NotFoundException(`No akas found for tconst=${tconst}`);
    }

    if (akas.currentPage > akas.totalPages) {
      throw new BadRequestException(
        `Current page ${akas.currentPage} exceeds total pages ${akas.totalPages}`,
      );
    }

    return akas;
  }

  @Post(":tconst/akas")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(baseAkaCreateDto))
  async addAkasToTitle(
    @Param("tconst") tconst: string,
    @Body() body: BaseAkaCreateDto,
  ) {
    this.logger.log(body);

    const newAka = await this.basicsService.addAkasToTitle(tconst, body);

    return newAka;
  }

  @Put(":tconst/akas/:ordering")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(baseAkaUpdateDto))
  async updateAkaByTconstAndOrdering(
    @Param("tconst") tconst: string,
    @Param("ordering") ordering: number,
    @Body() body: BaseAkaUpdateDto,
  ) {
    this.logger.log(body);

    const updateAka = await this.basicsService.updateAkasInTitle(
      tconst,
      ordering,
      body,
    );

    return updateAka;
  }

  @Delete(":tconst/akas/:ordering")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAkaByTconstAndOrdering(
    @Param("tconst") tconst: string,
    @Param("ordering") ordering: number,
  ): Promise<void> {
    this.logger.log({
      tconst,
      ordering,
    });

    const deleteAka = await this.basicsService.removeAkasFromTitle(
      tconst,
      ordering,
    );

    if (!deleteAka) {
      throw new NotFoundException(
        `No aka found for tconst=${tconst} and ordering=${ordering}`,
      );
    }

    return;
  }

  @Get(":tconst/episodes")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  async getEpisodesByTconst(@Param("tconst") tconst: string) {
    const episodeResult = await this.basicsService.getEpisodesByTconst(tconst);

    this.logger.log(episodeResult);

    if (!episodeResult) {
      throw new NotFoundException(`No episodes found for tconst=${tconst}`);
    }

    return episodeResult;
  }

  @Post(":tconst/episodes")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(baseEpisodeCreateSchema))
  async addEpisodeToTitle(
    @Param("tconst") tconst: string,
    @Body() body: BaseEpisodeCreateDto,
  ) {
    this.logger.log(body);

    const newEpisode = await this.basicsService.addEpisodeToTitle(tconst, body);

    return newEpisode;
  }

  @Get(":parentTconst/episodes/:tconst")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  async getEpisodeByTconst(
    @Param("parentTconst") parentTconst: string,
    @Param("tconst") tconst: string,
  ) {
    this.logger.log({
      parentTconst,
      tconst,
    });

    const episode = await this.basicsService.getASingleEpisodeFromTitle(
      parentTconst,
      tconst,
    );

    if (!episode) {
      throw new NotFoundException(
        `No episode found for parentTconst=${parentTconst} and tconst=${tconst}`,
      );
    }

    return episode;
  }

  @Put(":parentTconst/episodes/:tconst")
  @Header("Cache-Control", "no-store")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(baseEpisodeUpdateSchema))
  async updateEpisodeByTconst(
    @Param("parentTconst") parentTconst: string,
    @Param("tconst") tconst: string,
    @Body() body: BaseEpisodeUpdateDto,
  ) {
    this.logger.log({
      parentTconst,
      tconst,
      body,
    });

    const updatedEpisode = await this.basicsService.updateEpisodeInTitle(
      parentTconst,
      tconst,
      body,
    );

    if (!updatedEpisode) {
      throw new NotFoundException(
        `No episode found for parentTconst=${parentTconst} and tconst=${tconst}`,
      );
    }

    return updatedEpisode;
  }
}
