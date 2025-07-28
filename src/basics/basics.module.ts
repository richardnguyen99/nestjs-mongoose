import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { BasicsService } from "./basics.service";
import { BasicsController } from "./basics.controller";
import { BasicsModel, BasicsSchema } from "./schema/basics.schema";
import { PrincipalsModule } from "src/principals/principals.module";
import { NamesModule } from "src/names/names.module";
import { CrewsModule } from "src/crews/crews.module";
import { AkasModule } from "src/akas/akas.module";
import { EpisodesModule } from "src/episodes/episodes.module";

@Module({
  providers: [BasicsService],
  controllers: [BasicsController],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: BasicsModel.name,
        useFactory: async () => {
          return BasicsSchema;
        },
      },
    ]),

    NamesModule,
    PrincipalsModule,
    CrewsModule,
    AkasModule,
    EpisodesModule,
  ],
})
export class BasicsModule {}
