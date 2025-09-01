import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Aggregate, Model } from "mongoose";

import { CrewsDocument, CrewsModel } from "src/crews/schema/crews.schema";
import { CrewQueryDto } from "src/crews/dto/crew-query.dto";
import { CrewUpdateDto } from "src/crews/dto/crew-update.dto";
import { CrewsAggregationInterface } from "src/crews/interfaces/crews-interface.interface";
import { ConfigService } from "@nestjs/config";
import { CrewCreateDto } from "./dto/crew-create.dto";
import { NamesModel } from "src/names/schema/names.schema";
import { BasicsModel } from "src/basics/schema/basics.schema";

@Injectable()
export class CrewsService {
  private readonly logger = new Logger("CrewsService");

  /* istanbul ignore next */
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(CrewsModel.name)
    private readonly crewsModel: Model<CrewsModel>,
  ) {
    if (this.configService.get<string>("NODE_ENV") === "development") {
      // Ensure indexes are created
      this.crewsModel.ensureIndexes().catch((error) => {
        console.error("Error creating indexes for CrewsModel:", error);

        process.exit(1);
      });
    }
  }

  async findAll(): Promise<CrewsDocument[]> {
    return this.crewsModel.find().exec();
  }

  async findByTconst(tconst: string, query: CrewQueryDto) {
    let aggregation = this.crewsModel.aggregate().match({ tconst });

    if (query && query.include) {
      if (query.include.directors) {
        aggregation = aggregation.lookup({
          from: "names",
          localField: "directors",
          foreignField: "nconst",
          as: "directorDetails",
          let: { directors: "$directors" },
          pipeline: [
            { $match: { $expr: { $in: ["$nconst", "$$directors"] } } },
            {
              $lookup: {
                from: "principals",
                localField: "nconst",
                foreignField: "nconst",
                as: "roleDetails",
                let: { nconst: "$nconst", tconst: "$tconst" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$nconst", "$$nconst"] } },
                        { $expr: { $eq: ["$tconst", tconst] } },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        });
      }

      if (query.include.writers) {
        aggregation = aggregation.lookup({
          from: "names",
          localField: "writers",
          foreignField: "nconst",
          as: "writerDetails",
          let: { writers: "$writers" },
          pipeline: [
            { $match: { $expr: { $in: ["$nconst", "$$writers"] } } },
            {
              $lookup: {
                from: "principals",
                localField: "nconst",
                foreignField: "nconst",
                as: "roleDetails",
                let: { nconst: "$nconst", tconst: "$tconst" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$nconst", "$$nconst"] } },
                        { $expr: { $eq: ["$tconst", tconst] } },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        });
      }

      if (query.include.title) {
        aggregation = aggregation.lookup({
          from: "basics",
          localField: "tconst",
          foreignField: "tconst",
          as: "titleInfo",
        });
      }
    }

    return aggregation.exec();
  }

  async findById(id: string): Promise<CrewsDocument | null> {
    return this.crewsModel.findById(id).exec();
  }

  async create(dto: CrewCreateDto): Promise<CrewsDocument> {
    const createdCrew = new this.crewsModel(dto);
    createdCrew.isNew = true;

    return createdCrew.save();
  }

  async addDirector(tconst: string, nconst: string) {
    return this.crewsModel
      .findOneAndUpdate(
        {
          tconst,
        },
        {
          $addToSet: { directors: nconst },
        },
        {
          new: true,
        },
      )
      .exec();
  }

  async addWriter(tconst: string, nconst: string) {
    return this.crewsModel
      .findOneAndUpdate(
        {
          tconst,
        },
        {
          $addToSet: { writers: nconst },
        },
        {
          new: true,
        },
      )
      .exec();
  }

  async update(
    tconst: string,
    updateDto: CrewUpdateDto,
    options?: { new?: boolean },
  ): Promise<CrewsDocument | null> {
    const updateQuery: mongoose.UpdateQuery<CrewsDocument> = {};

    if (updateDto.directors) {
      if (updateDto.directors.add) {
        updateQuery.$addToSet = {
          directors: { $each: updateDto.directors.add },
        };
      }

      if (updateDto.directors.remove) {
        updateQuery.$pull = { directors: { $in: updateDto.directors.remove } };
      }
    }

    if (updateDto.writers) {
      if (updateDto.writers.add) {
        updateQuery.$addToSet = {
          ...updateQuery.$addToSet,
          writers: { $each: updateDto.writers.add },
        };
      }

      if (updateDto.writers.remove) {
        updateQuery.$pull = {
          ...updateQuery.$pull,
          writers: { $in: updateDto.writers.remove },
        };
      }
    }

    return this.crewsModel
      .findOneAndUpdate({ tconst }, updateQuery, options)
      .exec();
  }

  async removeDirector(tconst: string, nconst: string) {
    return this.crewsModel
      .findOneAndUpdate(
        {
          tconst,
        },
        {
          $pull: { directors: nconst },
        },
      )
      .exec();
  }

  async removeWriter(tconst: string, nconst: string) {
    return this.crewsModel
      .findOneAndUpdate(
        {
          tconst,
        },
        {
          $pull: { writers: nconst },
        },
      )
      .exec();
  }
}
