/* istanbul ignore file */

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { PrincipalsService } from "./principals.service";
import { PrincipalsModel, PrincipalsSchema } from "./schema/principals.schema";

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: PrincipalsModel.name,
        useFactory: () => {
          return PrincipalsSchema;
        },
      },
    ]),
  ],
  providers: [PrincipalsService],
  exports: [PrincipalsService],
})
export class PrincipalsModule {}
