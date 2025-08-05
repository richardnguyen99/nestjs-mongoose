import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CrewsService } from "./crews.service";
import { CrewsModel } from "./schema/crews.schema";

describe("CrewsService", () => {
  let service: CrewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: getModelToken(CrewsModel.name),
          useValue: Model,
        },
        CrewsService,
      ],
    }).compile();

    service = module.get<CrewsService>(CrewsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
