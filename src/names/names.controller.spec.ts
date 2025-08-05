import { Test, TestingModule } from "@nestjs/testing";
import { NamesController } from "./names.controller";
import { NamesService } from "./names.service";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { NamesModel } from "./schema/names.schema";
import { Model } from "mongoose";

describe("NamesController", () => {
  let controller: NamesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [NamesController],
      providers: [
        {
          provide: getModelToken(NamesModel.name),
          useValue: Model,
        },
        NamesService,
      ],
    }).compile();

    controller = module.get<NamesController>(NamesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
