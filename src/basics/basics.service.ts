import { Model, Query } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { BasicsDocument, BasicsModel } from "./schema/basics.schema";
import { BasicsSearchDto } from "./dto/basics-search.dto";

@Injectable()
export class BasicsService {
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

  private readonly MEDIUM_RUNTIME_MINUTES = 40;
  private readonly LONG_RUNTIME_MINUTES = 90;

  constructor(
    @InjectModel(BasicsModel.name) private basicsModel: Model<BasicsModel>,
  ) {
    // Ensure indexes are created
    this.basicsModel.ensureIndexes().catch((error) => {
      console.error("Error creating indexes for BasicsModel:", error);

      process.exit(1);
    });
  }

  async findById(id: string): Promise<BasicsModel | null> {
    return this.basicsModel.findById(id).exec();
  }

  async findByTconst(tconst: string): Promise<BasicsModel | null> {
    return this.basicsModel.findOne({ tconst }).exec();
  }

  async searchByTitle(
    title: string,
    options?: Omit<BasicsSearchDto, "q">,
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
        query = query.where("titleType").in(options.filter.titleType);
      }

      if (options.filter.genres) {
        query = query.where("genreArrays").elemMatch({
          $in: options.filter.genres.map((genre) => genre.trim()),
        });
      }

      if (options.filter.since) {
        query = query.where("startYear").gte(options.filter.since);
      }

      if (options.filter.until) {
        query = query.where("startYear").lte(options.filter.until);
      }

      if (options.filter.duration) {
        switch (options.filter.duration) {
          case "short":
            query = query
              .where("runtimeMinutes")
              .lte(this.MEDIUM_RUNTIME_MINUTES);

            break;
          case "medium":
            query = query
              .where("runtimeMinutes")
              .gt(this.MEDIUM_RUNTIME_MINUTES)
              .lte(this.LONG_RUNTIME_MINUTES);

            break;
          case "long":
            query = query.where("runtimeMinutes").gt(this.LONG_RUNTIME_MINUTES);

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
}
