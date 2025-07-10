import { Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { NamesModel } from "./schema/names.schema";
import { NameCreateDto } from "./dto/name-create.dto";
import { NameUpdateDto, nameUpdateSchema } from "./dto/name-update.dto";

@Injectable()
export class NamesService {
  private readonly logger = new Logger(NamesService.name);

  constructor(
    @InjectModel(NamesModel.name) private namesModel: Model<NamesModel>,
  ) {
    // Ensure indexes are created
    this.namesModel.ensureIndexes().catch((error) => {
      console.error("Error creating indexes for NamesModel:", error);

      process.exit(1);
    });
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
