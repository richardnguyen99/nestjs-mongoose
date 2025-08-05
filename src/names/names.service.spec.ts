import { Test, TestingModule } from "@nestjs/testing";
import { NamesService } from "./names.service";
import { getModelToken } from "@nestjs/mongoose";
import { NamesModel } from "./schema/names.schema";
import { Model } from "mongoose";
import { ConfigModule } from "@nestjs/config";

describe("NamesService", () => {
  let service: NamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],

      providers: [
        {
          provide: getModelToken(NamesModel.name),
          useValue: Model,
        },
        NamesService,
      ],
    }).compile();

    service = module.get<NamesService>(NamesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
