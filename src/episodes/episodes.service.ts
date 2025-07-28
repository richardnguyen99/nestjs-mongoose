import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { EpisodesModel } from "./schema/episodes.schema";

@Injectable()
export class EpisodesService {
  private readonly logger = new Logger(EpisodesService.name);

  constructor(
    @InjectModel(EpisodesModel.name)
    private episodesModel: Model<EpisodesModel>,
  ) {
    this.episodesModel.syncIndexes().catch((error) => {
      console.error("Error syncing indexes for EpisodesModel", error);
      process.exit(1);
    });
  }
}
