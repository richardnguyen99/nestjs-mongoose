import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { EpisodesService } from "./episodes.service";
import { EpisodesModel } from "./schema/episodes.schema";

describe("EpisodesService", () => {
  let service: EpisodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: getModelToken(EpisodesModel.name),
          useValue: Model,
        },
        EpisodesService,
      ],
    }).compile();

    service = module.get<EpisodesService>(EpisodesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
