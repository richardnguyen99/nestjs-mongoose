import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { AkasDocument, AkasModel } from "./schema/akas.schema";
import { AkasAggregationInterface } from "./interfaces/akas-query.interface";

@Injectable()
export class AkasService {
  private readonly logger = new Logger(AkasService.name);

  constructor(
    @InjectModel(AkasModel.name) private readonly akasModel: Model<AkasModel>,
  ) {
    this.akasModel.syncIndexes().catch((error) => {
      this.logger.error("Error syncing indexes for AkasModel", error);

      process.exit(1);
    });
  }

  async getAllAkas(): Promise<AkasModel[]> {
    return this.akasModel.find().exec();
  }

  async getAkasByTitleId(titleId: string): Promise<AkasAggregationInterface[]> {
    return this.akasModel
      .aggregate<AkasAggregationInterface>()
      .match({ titleId })
      .facet({
        totalCount: [{ $count: "count" }],
        results: [
          {
            $sort: { ordering: 1 },
          },
          {
            $skip: 0,
          },
          {
            $limit: 10,
          },
        ],
      })
      .addFields({
        totalCount: {
          $cond: {
            if: { $gt: [{ $size: "$totalCount" }, 0] },
            then: { $arrayElemAt: ["$totalCount.count", 0] },
            else: 0,
          },
        },
        totalPages: {
          $cond: {
            if: { $gt: [{ $size: "$totalCount" }, 0] },
            then: {
              $ceil: {
                $divide: [{ $arrayElemAt: ["$totalCount.count", 0] }, 10],
              },
            },
            else: 0,
          },
        },
        currentPage: 1,
        perPage: 10,
      })
      .exec();
  }

  async getAkaById(id: string): Promise<AkasDocument | null> {
    return this.akasModel.findById(id).exec();
  }

  async createAka(akaData: Partial<AkasModel>): Promise<AkasModel> {
    const newAka = new this.akasModel(akaData);
    return newAka.save();
  }

  async updateAka(
    titleId: string,
    updateData: Partial<AkasModel>,
  ): Promise<AkasDocument | null> {
    return this.akasModel
      .findOneAndUpdate({ titleId }, updateData, { new: true })
      .exec();
  }

  async deleteAka(titleId: string): Promise<AkasDocument | null> {
    return this.akasModel.findOneAndDelete({ titleId }).exec();
  }
}
