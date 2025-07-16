import { Model, Query } from "mongoose";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { BasicsDocument, BasicsModel } from "./schema/basics.schema";
import { BasicSearchDto } from "./dto/basic-search.dto";
import { BasicCreateDto } from "./dto/basic-create.dto";
import { BasicUpdateDto } from "./dto/basic-update.dto";
import { PrincipalsService } from "src/principals/principals.service";
import { PrincipalsDocument } from "src/principals/schema/principals.schema";
import { NamesService } from "src/names/names.service";
import { NamesDocument } from "src/names/schema/names.schema";
import { PrincipalCreateDto } from "src/principals/dto/principal-create.dto";

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

  constructor(
    @InjectModel(BasicsModel.name) private basicsModel: Model<BasicsModel>,
    private readonly namesService: NamesService,
    private readonly principalsService: PrincipalsService,
  ) {
    // Ensure indexes are created
    this.basicsModel.ensureIndexes().catch((error) => {
      console.error("Error creating indexes for BasicsModel:", error);

      process.exit(1);
    });
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
        query = query.where("endYear").ne(null).lte(options.filter.until);
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

      if (options.sort.primaryTitle)
        sort.primaryTitle = options.sort.primaryTitle;
    }

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;

    return query.skip(skip).limit(limit).sort(sort).select("-score").exec();
  }

  async getCastByTconst(tconst: string) {
    const [result] = await this.principalsService.findCastByTconst(tconst);

    return result;
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
}
