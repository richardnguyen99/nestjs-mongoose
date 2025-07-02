import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { BasicsModel } from "./schema/basics.schema";

@Injectable()
export class BasicsService {
  constructor(
    @InjectModel(BasicsModel.name) private basicsModel: Model<BasicsModel>,
  ) {}

  async findById(id: string): Promise<BasicsModel | null> {
    return this.basicsModel.findById(id).exec();
  }

  async findByTconst(tconst: string): Promise<BasicsModel | null> {
    return this.basicsModel.findOne({ tconst }).exec();
  }
}
