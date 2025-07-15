import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  PrincipalsDocument,
  PrincipalsModel,
} from "./schema/principals.schema";

@Injectable()
export class PrincipalsService {
  private readonly logger = new Logger("PrincipalsService");

  constructor(
    @InjectModel(PrincipalsModel.name)
    private readonly principals: Model<PrincipalsModel>,
  ) {
    this.principals.syncIndexes().catch((error) => {
      this.logger.error("Error syncing indexes", error);

      process.exit(1);
    });
  }

  async findAll(): Promise<PrincipalsModel[]> {
    return this.principals.find().exec();
  }

  async findByTconst(tconst: string): Promise<PrincipalsDocument[]> {
    return this.principals.find({ tconst }).exec();
  }

  async findByNconst(nconst: string): Promise<PrincipalsDocument[]> {
    return this.principals.find({ nconst }).exec();
  }

  async findByTconstAndNconst(
    tconst: string,
    nconst: string,
  ): Promise<PrincipalsDocument[]> {
    return this.principals.find({ tconst, nconst }).exec();
  }

  async findCastByTconst(tconst: string): Promise<PrincipalsDocument[]> {
    return this.principals
      .aggregate()
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
      .sort({ ordering: 1 })
      .limit(50)
      .exec();
  }
}
