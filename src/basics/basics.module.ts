import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { BasicsService } from "./basics.service";
import { BasicsController } from "./basics.controller";
import { BasicsModel, BasicsSchema } from "./schema/basics.schema";

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
  ],
})
export class BasicsModule {}
