import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  PrincipalsDocument,
  PrincipalsModel,
} from "./schema/principals.schema";
import { PrincipalCreateDto } from "./dto/principal-create.dto";
import { PrincipalUpdateDto } from "./dto/principal-update.dto";
import {
  PrincipalQueryDto,
  PrincipalSingleQueryDto,
} from "./dto/principal-query.dto";
import { ConfigService } from "@nestjs/config";
import { SinglePrincipalAggregation } from "./interfaces/principal-aggregation.interface";

@Injectable()
export class PrincipalsService {
  private readonly logger = new Logger("PrincipalsService");

  private readonly DEFAULT_PER_PAGE = 5;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(PrincipalsModel.name)
    private readonly principalsModel: Model<PrincipalsModel>,
  ) {
    if (this.configService.get<string>("NODE_ENV") === "development") {
      // Ensure indexes are created
      this.principalsModel.ensureIndexes().catch((error) => {
        console.error("Error creating indexes for PrincipalsModel:", error);

        process.exit(1);
      });
    }
  }

  async findAll(): Promise<PrincipalsModel[]> {
    return this.principalsModel.find().exec();
  }

  async findByTconst(tconst: string): Promise<PrincipalsDocument[]> {
    return this.principalsModel.find({ tconst }).exec();
  }

  async findByNconst(nconst: string): Promise<PrincipalsDocument[]> {
    return this.principalsModel.find({ nconst }).exec();
  }

  async findByTconstAndNconst(
    tconst: string,
    nconst: string,
    options?: PrincipalSingleQueryDto,
  ) {
    // IMDB stores multiple roles for a person in a title in separate documents.
    // This will query the all documents for the given tconst and nconst, and
    // group the characters into a single array while maintains the other fields.
    // The ordering will be the minimum ordering value for the given tconst and
    // nconst.

    const aggregation = this.principalsModel
      .aggregate<SinglePrincipalAggregation>()
      .match({
        tconst,
        nconst,
      })
      .group({
        _id: { tconst: "$tconst", nconst: "$nconst" },
        characters: { $push: "$characters" },
        category: { $first: "$category" },
        ordering: { $push: "$ordering" },
        job: { $push: "$job" },
      })
      .project({
        _id: 0,
        tconst: "$_id.tconst",
        nconst: "$_id.nconst",
        category: 1,
        ordering: 1,
        job: {
          $filter: {
            input: "$job",
            as: "job",
            cond: { $ne: ["$$job", null] }, // Filter out null jobs
          },
        },
        characters: {
          $reduce: {
            input: "$characters",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] }, // Flatten the array of arrays
          },
        },
      });

    if (options) {
      if (options.include && options.include.name) {
        aggregation
          .lookup({
            from: "names",
            localField: "nconst",
            foreignField: "nconst",
            as: "nameDetails",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  nconst: 0,
                },
              },
            ],
          })
          .unwind("nameDetails");
      }

      if (options.include && options.include.title) {
        aggregation
          .lookup({
            from: "basics",
            localField: "tconst",
            foreignField: "tconst",
            as: "titleDetails",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  tconst: 0,
                },
              },
            ],
          })
          .unwind("titleDetails");
      }
    }

    return aggregation.exec();
  }

  async findCastByTconst(tconst: string, options?: PrincipalQueryDto) {
    // IMDB stores multiple roles for a person in a title in separate documents.
    // This will query the all documents for the given tconst and nconst, and
    // group the characters into a single array while maintains the other fields.
    // The ordering will be the minimum ordering value for the given tconst and
    // nconst.
    const aggregation = this.principalsModel
      .aggregate<{
        results: PrincipalsDocument[];
        totalCount: number;
        currentPage: number;
        perPage: number;
        totalPages: number;
      }>()
      .match({
        tconst,
        category: { $in: ["actor", "actress"] },
      })
      .lookup({
        from: "names",
        localField: "nconst",
        foreignField: "nconst",
        as: "nameDetails",
      })
      .unwind("nameDetails")
      .group({
        _id: { tconst: "$tconst", nconst: "$nconst" },
        characters: { $push: "$characters" },
        category: { $first: "$category" },
        ordering: { $push: "$ordering" },
        primaryName: { $first: "$nameDetails.primaryName" },
      })
      .project({
        _id: 0,
        tconst: "$_id.tconst",
        nconst: "$_id.nconst",
        category: 1,
        ordering: 1,
        primaryName: 1,
        characters: {
          $reduce: {
            input: "$characters",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] }, // Flatten the array of arrays
          },
        },
      });

    const currentPage = options?.page ?? 1;
    const limit = options?.limit ?? this.DEFAULT_PER_PAGE;
    const skip = (currentPage - 1) * limit;

    this.logger.log(`
      Aggregation pipeline for tconst=${tconst} with options: ${JSON.stringify(
        {
          tconst,
          currentPage,
          limit,
          skip,
        },
        null,
        2,
      )}`);

    return aggregation
      .facet({
        results: [
          { $skip: skip },
          { $sort: { ordering: 1 } },
          { $limit: limit },
        ],
        totalCount: [{ $count: "count" }],
      })
      .replaceRoot({
        $mergeObjects: [
          { results: [], totalCount: 0 }, // Default values
          "$$ROOT", // Include the facet output
          {
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
                      limit,
                    ],
                  },
                },
                else: 0,
              },
            },

            currentPage: currentPage,
            perPage: limit,
          },
        ],
      });
  }

  async create(dto: PrincipalCreateDto): Promise<PrincipalsModel> {
    this.logger.log(JSON.stringify(dto, null, 2));

    const newPrincipal = new this.principalsModel({
      tconst: dto.tconst,
      nconst: dto.nconst,
      category: dto.category,
      job: dto.job ?? null,
      characters: Array.isArray(dto.characters)
        ? dto.characters
        : [dto.characters],
    });
    newPrincipal.isNew = true;

    return newPrincipal.save();
  }

  async update(
    tconst: string,
    nconst: string,
    ordering: number,
    dto: PrincipalUpdateDto,
  ): Promise<PrincipalsModel | null> {
    return this.principalsModel
      .findOneAndUpdate({ tconst, nconst, ordering }, dto, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async deleteByTconst(tconst: string): Promise<void> {
    await this.principalsModel.deleteMany({ tconst }).exec();
  }

  async deleteByNconst(nconst: string): Promise<void> {
    await this.principalsModel.deleteMany({ nconst }).exec();
  }

  async deleteByTconstAndNconst(tconst: string, nconst: string) {
    return this.principalsModel.findOneAndDelete({ tconst, nconst }).exec();
  }

  async bulkDelete(records: { tconst: string; nconst: string }[]) {
    if (!records || records.length === 0) {
      return;
    }

    return this.principalsModel.bulkWrite(
      records.map((record) => ({
        deleteOne: {
          filter: { tconst: record.tconst, nconst: record.nconst },
        },
      })),
    );
  }
}
