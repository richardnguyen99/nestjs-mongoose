import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

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
}
