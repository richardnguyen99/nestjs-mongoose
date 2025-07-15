import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { NamesController } from "./names.controller";
import { NamesService } from "./names.service";
import { NamesModel, NamesSchema } from "./schema/names.schema";

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: NamesModel.name,
        useFactory: async () => {
          return NamesSchema;
        },
      },
    ]),
  ],
  controllers: [NamesController],
  providers: [NamesService],
  exports: [NamesService],
})
export class NamesModule {}
