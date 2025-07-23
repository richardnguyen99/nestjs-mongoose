import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Aggregate, Model, StringExpression } from "mongoose";

import { CrewsDocument, CrewsModel } from "./schema/crews.schema";
import { CrewQueryDto } from "./dto/crew-query.dto";
import { CrewUpdateDto } from "./dto/crew-update.dto";

@Injectable()
export class CrewsService {
  private readonly logger = new Logger("CrewsService");

  constructor(
    @InjectModel(CrewsModel.name)
    private readonly crewsModel: Model<CrewsModel>,
  ) {
    this.crewsModel.syncIndexes().catch((error) => {
      this.logger.error("Error syncing indexes", error);
      process.exit(1);
    });
  }

  async findAll(): Promise<CrewsDocument[]> {
    return this.crewsModel.find().exec();
  }

  async findByTconst(
    tconst: string,
    query: CrewQueryDto,
  ): Promise<CrewsDocument[]> {
    let aggregation = this.crewsModel.aggregate<CrewsDocument>().match({
      tconst,
    });

    aggregation = this._prepareCrewAggregation(aggregation, query);

    return aggregation.exec();
  }

  async findById(id: string): Promise<CrewsDocument | null> {
    return this.crewsModel.findById(id).exec();
  }

  async addDirector(tconst: string, nconst: string) {
    return this.crewsModel.findOneAndUpdate(
      {
        tconst,
      },
      {
        $addToSet: { directors: nconst },
      },
      {
        new: true,
      },
    );
  }

  async addWriter(tconst: string, nconst: string) {
    return this.crewsModel.findOneAndUpdate(
      {
        tconst,
      },
      {
        $addToSet: { writers: nconst },
      },
      {
        new: true,
      },
    );
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
          writers: { $each: updateDto.writers.add },
        };
      }

      if (updateDto.writers.remove) {
        updateQuery.$pull = { writers: { $in: updateDto.writers.remove } };
      }
    }

    return this.crewsModel.findOneAndUpdate({ tconst }, updateQuery, options);
  }

  private _prepareCrewAggregation<T>(
    aggregation: Aggregate<T[]>,
    query: CrewQueryDto,
  ): Aggregate<T[]> {
    let _aggregation = aggregation;

    if (!query.lean) {
      _aggregation = aggregation
        .lookup({
          from: "names",
          localField: "directors",
          foreignField: "nconst",
          as: "directorsInfo",
          let: { tConst: "$tconst" },
          pipeline: [
            {
              $lookup: {
                from: "principals",
                localField: "nconst",
                foreignField: "nconst",
                as: "roleDetails",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$tconst", "$$tConst"],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      tconst: 0,
                      nconst: 0,
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$roleDetails",
            },
            {
              $project: {
                _id: 0,
                primaryProfession: 0,
                knownForTitles: 0,
              },
            },
          ],
        })
        .lookup({
          from: "names",
          localField: "writers",
          foreignField: "nconst",
          as: "writersInfo",
          let: { tConst: "$tconst" },
          pipeline: [
            {
              $lookup: {
                from: "principals",
                localField: "nconst",
                foreignField: "nconst",
                as: "roleDetails",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$tconst", "$$tConst"],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      tconst: 0,
                      nconst: 0,
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$roleDetails",
            },
            {
              $project: {
                _id: 0,
                primaryProfession: 0,
                knownForTitles: 0,
              },
            },
          ],
        });
    }

    return _aggregation;
  }
}
