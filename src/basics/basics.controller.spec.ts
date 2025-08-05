import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigModule } from "@nestjs/config";

import { BasicsController } from "./basics.controller";
import { BasicsService } from "./basics.service";
import { NamesService } from "src/names/names.service";
import { PrincipalsService } from "src/principals/principals.service";
import { CrewsService } from "src/crews/crews.service";
import { AkasService } from "src/akas/akas.service";
import { EpisodesService } from "src/episodes/episodes.service";
import { NamesModel } from "src/names/schema/names.schema";
import { BasicsModel } from "./schema/basics.schema";
import { PrincipalsModel } from "src/principals/schema/principals.schema";
import { CrewsModel } from "src/crews/schema/crews.schema";
import { AkasModel } from "src/akas/schema/akas.schema";
import { EpisodesModel } from "src/episodes/schema/episodes.schema";

describe("BasicsController", () => {
  let controller: BasicsController;
  let service: BasicsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [BasicsController],
      providers: [
        {
          provide: getModelToken(BasicsModel.name),
          useValue: Model,
        },
        {
          provide: getModelToken(NamesModel.name),
          useValue: Model,
        },
        {
          provide: getModelToken(PrincipalsModel.name),
          useValue: Model,
        },
        {
          provide: getModelToken(CrewsModel.name),
          useValue: Model,
        },
        {
          provide: getModelToken(AkasModel.name),
          useValue: Model,
        },
        {
          provide: getModelToken(EpisodesModel.name),
          useValue: Model,
        },
        BasicsService,
        NamesService,
        PrincipalsService,
        CrewsService,
        AkasService,
        EpisodesService,
      ],
    }).compile();

    controller = module.get<BasicsController>(BasicsController);
    service = module.get<BasicsService>(BasicsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
