import { Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { NamesModel } from "./schema/names.schema";

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

  async findByNconst(nconst: string): Promise<NamesModel | null> {
    return this.namesModel.findOne({ nconst }).exec();
  }
}
