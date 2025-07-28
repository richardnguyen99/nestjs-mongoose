import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Aggregate, Model } from "mongoose";

import { AkasDocument, AkasModel } from "./schema/akas.schema";
import { AkasAggregationInterface } from "./interfaces/akas-query.interface";
import { AkaQueryDto } from "./dto/aka-query.dto";
import { AkaCreateDto } from "./dto/aka-create.dto";
import { AkaUpdateDto } from "./dto/aka-update.dto";

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

  async getAkasByTitleId(
    titleId: string,
    query: AkaQueryDto,
  ): Promise<AkasAggregationInterface[]> {
    this.logger.log(query);
    let aggregation = this.akasModel
      .aggregate<AkasAggregationInterface>()
      .match({ titleId });

    aggregation = this._prepareAkasAggregation(aggregation, query);

    return aggregation
      .facet({
        totalCount: [{ $count: "count" }],
        results: [
          {
            $sort: { ordering: 1 },
          },
          {
            $skip: (query.page - 1) * query.limit,
          },
          {
            $limit: query.limit,
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
                $divide: [
                  { $arrayElemAt: ["$totalCount.count", 0] },
                  query.limit,
                ],
              },
            },
            else: 0,
          },
        },
        currentPage: query.page,
        perPage: query.limit,
      })
      .exec();
  }

  async getAkasByTitleIdWithRegion(tconst: string, region: string) {
    return;
  }

  async getAkaById(id: string): Promise<AkasDocument | null> {
    return this.akasModel.findById(id).exec();
  }

  async createAka(akaDto: AkaCreateDto): Promise<AkasModel> {
    this.logger.log(akaDto);

    const newAka = new this.akasModel({
      titleId: akaDto.titleId,
      title: akaDto.title,
      region: akaDto.region,
      language: akaDto.language,
      types: akaDto.types?.join(",") || null,
      attributes: akaDto.attributes?.join(",") || null,
      isOriginalTitle: akaDto.isOriginalTitle,
    });
    newAka.isNew = true;

    return newAka.save();
  }

  async updateAka(updateData: AkaUpdateDto): Promise<AkasDocument | null> {
    const types =
      updateData.types && updateData.types.length > 0
        ? updateData.types.join(",")
        : null;

    const attributes =
      updateData.attributes && updateData.attributes.length > 0
        ? updateData.attributes.join(",")
        : null;

    return this.akasModel
      .findOneAndUpdate(
        { titleId: updateData.titleId, ordering: updateData.ordering },
        {
          title: updateData.title,
          region: updateData.region,
          language: updateData.language,
          types,
          attributes,
          isOriginalTitle: updateData.isOriginalTitle,
        },
        { new: true },
      )
      .exec();
  }

  async deleteAka(
    titleId: string,
    ordering: number,
  ): Promise<AkasDocument | null> {
    return this.akasModel.findOneAndDelete({ titleId, ordering }).exec();
  }

  _prepareAkasAggregation(
    aggregation: Aggregate<AkasAggregationInterface[]>,
    query: AkaQueryDto,
  ): Aggregate<AkasAggregationInterface[]> {
    if (query) {
      if (query.language) {
        aggregation = aggregation.match({ language: query.language });
      }

      if (query.region) {
        aggregation = aggregation.match({ region: query.region });
      }

      if (query.types && query.types.length > 0) {
        aggregation = aggregation.match({ types: { $in: query.types } });
      }

      if (query.attributes && query.attributes.length > 0) {
        aggregation = aggregation.match({
          attributes: { $in: query.attributes },
        });
      }
    }

    return aggregation;
  }
}
