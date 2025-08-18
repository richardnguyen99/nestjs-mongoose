/* istanbul ignore file */

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { EpisodesService } from "./episodes.service";
import { EpisodesModel, EpisodesSchema } from "./schema/episodes.schema";

@Module({
  providers: [EpisodesService],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: EpisodesModel.name,
        useFactory: () => EpisodesSchema,
      },
    ]),
  ],
  exports: [EpisodesService],
})
export class EpisodesModule {}
