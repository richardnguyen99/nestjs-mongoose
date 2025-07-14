import { Module } from "@nestjs/common";
import { PrincipalsService } from "./principals.service";
import { MongooseModule } from "@nestjs/mongoose";
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
})
export class PrincipalsModule {}
