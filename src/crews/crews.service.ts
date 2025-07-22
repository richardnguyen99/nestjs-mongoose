import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Aggregate, Model } from "mongoose";

import { CrewsDocument, CrewsModel } from "./schema/crews.schema";

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

  async findByTconst(tconst: string): Promise<CrewsDocument[]> {
    let aggregation = this.crewsModel.aggregate().match({
      tconst,
    });

    aggregation = this._prepareCrewAggregation(aggregation);

    return aggregation.exec();
  }

  async findById(id: string): Promise<CrewsDocument | null> {
    return this.crewsModel.findById(id).exec();
  }

  private _prepareCrewAggregation<T>(
    aggregation: Aggregate<T[]>,
  ): Aggregate<T[]> {
    return aggregation
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
}
