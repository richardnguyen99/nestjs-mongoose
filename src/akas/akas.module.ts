/* istanbul ignore file */

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AkasService } from "./akas.service";
import { AkasModel, AkasSchema } from "./schema/akas.schema";

@Module({
  providers: [AkasService],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: AkasModel.name,
        useFactory: async () => AkasSchema,
      },
    ]),
  ],
  exports: [AkasService],
})
export class AkasModule {}
