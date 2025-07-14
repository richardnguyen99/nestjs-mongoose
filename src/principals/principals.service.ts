import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { PrincipalsModel } from "./schema/principals.schema";

@Injectable()
export class PrincipalsService {
  private readonly logger = new Logger("PrincipalsService");

  constructor(
    @InjectModel(PrincipalsModel.name)
    private readonly principals: Model<PrincipalsModel>,
  ) {
    this.principals.syncIndexes().catch((error) => {
      this.logger.error("Error syncing indexes", error);

      process.exit(1);
    });
  }
}
