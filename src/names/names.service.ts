import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { NamesModel } from "./schema/names.schema";
import { NameCreateDto } from "./dto/name-create.dto";
import { NameUpdateDto, nameUpdateSchema } from "./dto/name-update.dto";
import { NameSearchDto } from "./dto/name-search.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NamesService {
  private readonly logger = new Logger(NamesService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(NamesModel.name) private namesModel: Model<NamesModel>,
  ) {
    if (this.configService.get<string>("NODE_ENV") === "development") {
      // Ensure indexes are created
      this.namesModel.ensureIndexes().catch((error) => {
        console.error("Error creating indexes for NamesModel:", error);

        process.exit(1);
      });
    }
  }

  async create(dto: NameCreateDto): Promise<NamesModel> {
    const {
      nconst,
      primaryName,
      birthYear,
      deathYear,
      primaryProfession,
      knownForTitles,
    } = dto;

    this.logger.log(dto);

    const createdName = new this.namesModel({
      nconst,
      primaryName,
      birthYear,
      deathYear: deathYear ?? null,
      primaryProfession: primaryProfession.map((p) => p.trim()),
      knownForTitles: knownForTitles.map((t) => t.trim()),
    });
    createdName.isNew = true;

    return createdName.save();
  }

  async update(nconst: string, dto: NameUpdateDto): Promise<NamesModel | null> {
    return this.namesModel
      .findOneAndUpdate(
        { nconst },
        { $set: dto },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();
  }

  async search(
    searchName: NameSearchDto["q"],
    options: Omit<NameSearchDto, "q">,
  ): Promise<NamesModel[]> {
    let query = this.namesModel.find(
      { $text: { $search: searchName } },
      { score: { $meta: "textScore" } },
    );

    if (options.filter) {
      if (options.filter.profession) {
        const professions = Array.isArray(options.filter.profession)
          ? options.filter.profession
          : [options.filter.profession];

        query = query.where("primaryProfession").in(professions);
      }

      if (options.filter.appearInTitles) {
        const titles = Array.isArray(options.filter.appearInTitles)
          ? options.filter.appearInTitles
          : [options.filter.appearInTitles];

        query = query.where("knownForTitles").in(titles);
      }

      if (typeof options.filter.alive !== "undefined") {
        query = query.where("birthYear").ne(null);

        if (options.filter.alive) {
          query = query.where("deathYear").equals(null);
        } else {
          query = query.where("deathYear").ne(null);
        }
      }

      if (options.filter.from) {
        query = query.where("birthYear").gte(options.filter.from);
      }
    }

    if (options.sort) {
      if (options.sort.birthYear) {
        query = query.sort({ birthYear: options.sort.birthYear });
      }

      if (options.sort.mostAppearance) {
        query = query.sort({ mostAppearance: options.sort.mostAppearance });
      }
    } else {
      query = query.sort({ score: { $meta: "textScore" } });
    }

    const page = options.page;
    const limit = options.limit;
    const skip = (page - 1) * limit;

    return query.skip(skip).limit(limit).lean().exec();
  }

  async findById(id: string): Promise<NamesModel | null> {
    return this.namesModel.findById(id).lean().exec();
  }

  async findByNconst(nconst: string): Promise<NamesModel | null> {
    return this.namesModel.findOne({ nconst }).exec();
  }

  async deleteByNconst(nconst: string): Promise<NamesModel | null> {
    return this.namesModel.findOneAndDelete({ nconst }).lean().exec();
  }
}
