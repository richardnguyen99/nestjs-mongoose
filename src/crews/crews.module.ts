/* istanbul ignore file */

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CrewsService } from "./crews.service";
import { CrewsModel, CrewsSchema } from "./schema/crews.schema";

@Module({
  providers: [CrewsService],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: CrewsModel.name,
        useFactory: () => CrewsSchema,
      },
    ]),
  ],

  exports: [CrewsService],
})
export class CrewsModule {}
