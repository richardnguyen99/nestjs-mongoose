import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { BasicsService } from "./basics.service";
import { BasicsController } from "./basics.controller";
import { BasicsModel, BasicsSchema } from "./schema/basics.schema";
import { PrincipalsModule } from "src/principals/principals.module";
import { NamesModule } from "src/names/names.module";

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
  ],
})
export class BasicsModule {}
