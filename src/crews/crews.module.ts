/* istanbul ignore file */

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CrewsService } from "./crews.service";
import { CrewsModel, CrewsSchema } from "./schema/crews.schema";
import { PrincipalsModule } from "src/principals/principals.module";

@Module({
  providers: [CrewsService],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: CrewsModel.name,
        useFactory: () => CrewsSchema,
      },
    ]),

    PrincipalsModule,
  ],

  exports: [CrewsService],
})
export class CrewsModule {}
