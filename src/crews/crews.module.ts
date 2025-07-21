import { Module } from "@nestjs/common";

import { CrewsService } from "./crews.service";
import { MongooseModule } from "@nestjs/mongoose";
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
