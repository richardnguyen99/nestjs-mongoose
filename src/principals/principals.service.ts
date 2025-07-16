import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  PrincipalsDocument,
  PrincipalsModel,
} from "./schema/principals.schema";
import { PrincipalCreateDto } from "./dto/principal-create.dto";

@Injectable()
export class PrincipalsService {
  private readonly logger = new Logger("PrincipalsService");

  constructor(
    @InjectModel(PrincipalsModel.name)
    private readonly principalsModel: Model<PrincipalsModel>,
  ) {
    this.principalsModel.syncIndexes().catch((error) => {
      this.logger.error("Error syncing indexes", error);

      process.exit(1);
    });
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
  ): Promise<PrincipalsDocument[]> {
    return this.principalsModel.find({ tconst, nconst }).exec();
  }

  async findCastByTconst(tconst: string) {
    return this.principalsModel
      .aggregate<{
        results: PrincipalsDocument[];
        totalCount: number;
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
        ordering: { $min: "$ordering" },
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
      })
      .facet({
        results: [{ $sort: { ordering: 1 } }, { $limit: 5 }],
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
          },
        ],
      })
      .exec();
  }

  async create(dto: PrincipalCreateDto): Promise<PrincipalsModel> {
    this.logger.log(JSON.stringify(dto, null, 2));

    const newPrincipal = new this.principalsModel({
      tconst: dto.tconst,
      nconst: dto.nconst,
      ordering: dto.ordering,
      category: dto.category,
      job: dto.job ?? null,
      characters: Array.isArray(dto.characters)
        ? dto.characters
        : [dto.characters],
    });
    newPrincipal.isNew = true;

    return newPrincipal.save();
  }
}
