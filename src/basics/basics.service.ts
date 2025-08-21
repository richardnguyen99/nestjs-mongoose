import { Model } from "mongoose";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { BasicsDocument, BasicsModel } from "./schema/basics.schema";
import { BasicSearchDto } from "./dto/basic-search.dto";
import { BasicCreateDto } from "./dto/basic-create.dto";
import { BasicUpdateDto } from "./dto/basic-update.dto";
import { PrincipalsService } from "src/principals/principals.service";
import { PrincipalsDocument } from "src/principals/schema/principals.schema";
import { NamesService } from "src/names/names.service";
import { PrincipalCreateDto } from "src/principals/dto/principal-create.dto";
import { PrincipalUpdateDto } from "src/principals/dto/principal-update.dto";
import {
  PrincipalQueryDto,
  PrincipalSingleQueryDto,
} from "src/principals/dto/principal-query.dto";
import { CrewsService } from "src/crews/crews.service";
import { CrewQueryDto } from "src/crews/dto/crew-query.dto";
import { CrewUpdateDto } from "src/crews/dto/crew-update.dto";
import { AkasService } from "src/akas/akas.service";
import { AkasDocument } from "src/akas/schema/akas.schema";
import { AkaQueryDto } from "src/akas/dto/aka-query.dto";
import { AkaCreateDto, BaseAkaCreateDto } from "src/akas/dto/aka-create.dto";
import { BaseAkaUpdateDto } from "src/akas/dto/aka-update.dto";
import { EpisodesService } from "src/episodes/episodes.service";
import { BaseEpisodeCreateDto } from "src/episodes/dto/episode-create.dto";
import { BaseEpisodeUpdateDto } from "src/episodes/dto/episode-update.dto";
import { ConfigService } from "@nestjs/config";
import { BaseCrewCreateDto } from "src/crews/dto/crew-create.dto";

@Injectable()
export class BasicsService {
  private readonly logger = new Logger(BasicsService.name);

  private readonly selectedFields = {
    tconst: 1,
    titleType: 1,
    primaryTitle: 1,
    originalTitle: 1,
    isAdult: 1,
    startYear: 1,
    endYear: 1,
    runtimeMinutes: 1,
    genres: 1,
  };

  private readonly MEDIUM_RUNTIME_MINUTES_MARK = 30;
  private readonly LONG_RUNTIME_MINUTES_MARK = 70;

  /* istanbul ignore next */
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(BasicsModel.name) private basicsModel: Model<BasicsModel>,
    private readonly namesService: NamesService,
    private readonly principalsService: PrincipalsService,
    private readonly crewsService: CrewsService,
    private readonly akasService: AkasService,
    private readonly episodesService: EpisodesService,
  ) {
    if (this.configService.get<string>("NODE_ENV") === "development") {
      // Ensure indexes are created
      this.basicsModel.ensureIndexes().catch((error) => {
        console.error("Error creating indexes for BasicsModel:", error);

        process.exit(1);
      });
    }
  }

  async createBasic(dto: BasicCreateDto): Promise<BasicsModel> {
    const {
      tconst,
      titleType,
      primaryTitle,
      originalTitle,
      isAdult,
      startYear,
      endYear,
      runtimeMinutes,
      genres,
    } = dto;

    this.logger.log(dto);

    const basic = new this.basicsModel({
      tconst,
      titleType,
      primaryTitle,
      originalTitle,
      isAdult: isAdult ? 1 : 0,
      startYear: startYear,
      endYear: endYear,
      runtimeMinutes: runtimeMinutes,
      genres: genres.map((genre) => genre.trim()),
    });
    basic.isNew = true;

    return basic.save();
  }

  async findById(id: string): Promise<BasicsModel | null> {
    return this.basicsModel.findById(id).exec();
  }

  async findByTconst(tconst: string): Promise<BasicsModel | null> {
    return this.basicsModel.findOne({ tconst }).exec();
  }

  async findByTconstAndNconst(
    tconst: string,
    nconst: string,
    options?: PrincipalSingleQueryDto,
  ) {
    const cast = await this.principalsService.findByTconstAndNconst(
      tconst,
      nconst,
      options,
    );

    if (!cast || cast.length === 0) {
      return null;
    }

    return cast[0];
  }

  async updateByTconst(
    tconst: string,
    dto: BasicUpdateDto,
  ): Promise<BasicsModel | null> {
    return this.basicsModel
      .findOneAndUpdate(
        { tconst },
        { $set: dto },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();
  }

  async deleteByTconst(tconst: string): Promise<BasicsModel | null> {
    return this.basicsModel.findOneAndDelete({ tconst }).lean().exec();
  }

  async searchByTitle(
    title: string,
    options?: Omit<BasicSearchDto, "q">,
  ): Promise<BasicsDocument[]> {
    let query = this.basicsModel.find(
      { $text: { $search: title } },
      { score: { $meta: "textScore" } },
    );

    if (options?.filter) {
      if (options.filter.isAdult !== undefined) {
        query = query.where("isAdult").equals(options.filter.isAdult ? 1 : 0);
      }

      if (options.filter.titleType) {
        const titleTypes = Array.isArray(options.filter.titleType)
          ? options.filter.titleType
          : [options.filter.titleType];

        query = query.where("titleType").in(titleTypes);
      }

      if (options.filter.genre) {
        const genres = Array.isArray(options.filter.genre)
          ? options.filter.genre
          : [options.filter.genre];

        query = query.where("genres").in(genres);
      }

      if (options.filter.since) {
        query = query.where("startYear").ne(null).gte(options.filter.since);
      }

      if (options.filter.until) {
        query = query.where("startYear").ne(null).lte(options.filter.until);
      }

      if (options.filter.duration) {
        switch (options.filter.duration) {
          case "short":
            query = query
              .where("runtimeMinutes")
              .lte(this.MEDIUM_RUNTIME_MINUTES_MARK);

            break;
          case "medium":
            query = query
              .where("runtimeMinutes")
              .gt(this.MEDIUM_RUNTIME_MINUTES_MARK)
              .lte(this.LONG_RUNTIME_MINUTES_MARK);

            break;
          case "long":
            query = query
              .where("runtimeMinutes")
              .gt(this.LONG_RUNTIME_MINUTES_MARK);

            break;
        }
      }
    }

    // Combine all sort options
    const sort: Record<string, any> = { score: { $meta: "textScore" } };
    if (options?.sort) {
      if (options.sort.startYear) sort.startYear = options.sort.startYear;

      if (options.sort.endYear) sort.endYear = options.sort.endYear;
    }

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;

    return query.skip(skip).limit(limit).sort(sort).select("-score").exec();
  }

  async getCastByTconst(tconst: string, options?: PrincipalQueryDto) {
    const [result] = await this.principalsService.findCastByTconst(
      tconst,
      options,
    );

    return result;
  }

  async getCrewByTconst(tconst: string, options: CrewQueryDto) {
    const [crew] = await this.crewsService.findByTconst(tconst, options);

    return crew;
  }

  async addCastToTitle(
    tconst: string,
    principalDto: Omit<PrincipalCreateDto, "tconst">,
  ) {
    const newPrincipal = await this.principalsService.create({
      ...principalDto,
      tconst,
    });

    return newPrincipal;
  }

  async createCrew(tconst: string, crewDto: BaseCrewCreateDto) {
    const newCrew = await this.crewsService.create({
      tconst,
      ...crewDto,
    });

    return newCrew;
  }

  async addCrewToTitle(
    tconst: string,
    crewDto: Omit<PrincipalCreateDto, "tconst">,
  ) {
    const newCrew = await this.principalsService.create({
      ...crewDto,
      tconst,
    });

    if (newCrew.category === "director") {
      await this.crewsService.addDirector(tconst, newCrew.nconst);
    } else if (newCrew.category === "writer") {
      await this.crewsService.addWriter(tconst, newCrew.nconst);
    }

    return newCrew;
  }

  async updateCastInTitle(
    tconst: string,
    nconst: string,
    ordering: number,
    principalDto: PrincipalUpdateDto,
  ) {
    return this.principalsService.update(
      tconst,
      nconst,
      ordering,
      principalDto,
    );
  }

  async updateCrewInTitle(
    tconst: string,
    nconst: string,
    ordering: number,
    principalDto: PrincipalUpdateDto,
  ) {
    const updatePrincipal = await this.principalsService.update(
      tconst,
      nconst,
      ordering,
      principalDto,
    );

    if (!updatePrincipal) {
      return null;
    }

    const updateCrewDto: CrewUpdateDto = {} as CrewUpdateDto;

    if (typeof principalDto.category !== "undefined") {
      updatePrincipal.category = principalDto.category;

      if (principalDto.category === "director") {
        updateCrewDto.directors = {
          add: [updatePrincipal.nconst],
        };

        updateCrewDto.writers = {
          remove: [updatePrincipal.nconst],
        };
      }

      if (principalDto.category === "writer") {
        updateCrewDto.writers = {
          add: [updatePrincipal.nconst],
        };

        updateCrewDto.directors = {
          remove: [updatePrincipal.nconst],
        };
      }
    }

    if (Object.keys(updateCrewDto).length > 0) {
      this.logger.log(updateCrewDto);
      await this.crewsService.update(tconst, updateCrewDto);
    }

    return updatePrincipal;
  }

  async updateCrewRecord(tconst: string, updateDto: CrewUpdateDto) {
    const updatedCrew = await this.crewsService.update(tconst, updateDto, {
      new: true,
    });

    if (!updatedCrew) {
      return null;
    }

    const removedPrincipals: { tconst: string; nconst: string }[] = [];

    if (updateDto.writers.remove) {
      for (const nconst of updateDto.writers.remove) {
        removedPrincipals.push({
          tconst,
          nconst,
        });
      }
    }

    if (updateDto.directors.remove) {
      for (const nconst of updateDto.directors.remove) {
        removedPrincipals.push({
          tconst,
          nconst,
        });
      }
    }

    if (removedPrincipals.length > 0) {
      const result = await this.principalsService.bulkDelete(removedPrincipals);

      this.logger.log(
        `Bulk delete result:\n${JSON.stringify(result, null, 2)}`,
      );
    }

    return updatedCrew;
  }

  async removeCastFromTitle(tconst: string, nconst: string) {
    return this.principalsService.deleteByTconstAndNconst(tconst, nconst);
  }

  async removeCrewFromTitle(tconst: string, nconst: string) {
    const deletedCrew = await this.principalsService.deleteByTconstAndNconst(
      tconst,
      nconst,
    );

    if (!deletedCrew) {
      return null;
    }

    if (deletedCrew.category === "director") {
      await this.crewsService.removeDirector(tconst, deletedCrew.nconst);
    } else if (deletedCrew.category === "writer") {
      await this.crewsService.removeWriter(tconst, deletedCrew.nconst);
    }

    return deletedCrew;
  }

  async getAkasByTconst(tconst: string, query: AkaQueryDto) {
    const [akas] = await this.akasService.getAkasByTitleId(tconst, query);

    return akas;
  }

  async addAkasToTitle(tconst: string, akaDto: BaseAkaCreateDto) {
    const newAka = await this.akasService.createAka({
      ...akaDto,
      titleId: tconst,
    });

    return newAka;
  }

  async updateAkasInTitle(
    tconst: string,
    ordering: number,
    body: BaseAkaUpdateDto,
  ) {
    const updatedAka = await this.akasService.updateAka({
      titleId: tconst,
      ordering,
      ...body,
    });

    return updatedAka;
  }

  async removeAkasFromTitle(tconst: string, ordering: number) {
    const deletedAka = await this.akasService.deleteAka(tconst, ordering);

    return deletedAka;
  }

  async getEpisodesByTconst(tconst: string) {
    const basics = await this.findByTconst(tconst);

    if (
      !basics ||
      (basics.titleType !== "tvSeries" && basics.titleType !== "tvMiniseries")
    ) {
      return null;
    }

    const episodes = await this.episodesService.getSeasonsByTconst(tconst);

    return {
      _id: basics._id,
      tconst: basics.tconst,
      title: basics.primaryTitle,
      titleType: basics.titleType,
      totalSeasons: episodes.length,
      totalEpisodes: episodes.reduce(
        (acc, season) => acc + (season as any).episodes.length,
        0,
      ),
      seasons: episodes,
    };
  }

  async getASingleEpisodeFromTitle(parentTconst: string, tconst: string) {
    const result = await this.episodesService.getEpisodeByTconst(
      parentTconst,
      tconst,
    );

    this.logger.log(`Result: ${JSON.stringify(result, null, 2)}`);

    if (!result || result.length === 0) {
      return null;
    }

    return result[0];
  }

  async addEpisodeToTitle(tconst: string, body: BaseEpisodeCreateDto) {
    return this.episodesService.createEpisode({
      ...body,
      parentTconst: tconst,
    });
  }

  async updateEpisodeInTitle(
    parentTconst: string,
    tconst: string,
    body: BaseEpisodeUpdateDto,
  ) {
    return this.episodesService.updateEpisode(parentTconst, tconst, body);
  }

  async removeEpisodeFromTitle(parentTconst: string, tconst: string) {
    const deletedEpisode = await this.episodesService.deleteEpisode(
      parentTconst,
      tconst,
    );

    if (!deletedEpisode) {
      return null;
    }

    return deletedEpisode;
  }
}
