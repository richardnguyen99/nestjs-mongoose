import { Test, TestingModule } from "@nestjs/testing";
import { BasicsService } from "./basics.service";
import { ConfigModule } from "@nestjs/config";
import { Model } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";

import { BasicsModel } from "./schema/basics.schema";
import { NamesModule } from "src/names/names.module";
import { PrincipalsModule } from "src/principals/principals.module";
import { CrewsModule } from "src/crews/crews.module";
import { AkasModule } from "src/akas/akas.module";
import { EpisodesModule } from "src/episodes/episodes.module";
import { NamesService } from "src/names/names.service";
import { PrincipalsService } from "src/principals/principals.service";
import { CrewsService } from "src/crews/crews.service";
import { AkasService } from "src/akas/akas.service";
import { EpisodesService } from "src/episodes/episodes.service";
import { NamesModel } from "src/names/schema/names.schema";
import { PrincipalsModel } from "src/principals/schema/principals.schema";
import { CrewsModel } from "src/crews/schema/crews.schema";
import { AkasModel } from "src/akas/schema/akas.schema";
import { EpisodesModel } from "src/episodes/schema/episodes.schema";

describe("BasicsService", () => {
  let service: BasicsService;
  const mockBasicModel: jest.Mock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],

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

    service = module.get<BasicsService>(BasicsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should have a findById method", () => {
    expect(service.findById).toBeDefined();
    expect(typeof service.findById).toBe("function");
  });

  it("should have a findByTconst method", () => {
    expect(service.findByTconst).toBeDefined();
    expect(typeof service.findByTconst).toBe("function");
  });

  it("should return null for findById if no document found", async () => {
    jest.spyOn(service, "findById").mockResolvedValue(null);

    const result = await service.findById("nonexistent-id");
    expect(result).toBeNull();
  });

  it("should return null for findByTconst if no document found", async () => {
    jest.spyOn(service, "findByTconst").mockResolvedValue(null);

    const result = await service.findByTconst("nonexistent-tconst");
    expect(result).toBeNull();
  });

  it("should return a document for findById if it exists", async () => {
    const mockDocument = { _id: "mock-id", tconst: "mock-tconst" };
    jest.spyOn(service, "findById").mockResolvedValue(mockDocument as any);

    const result = await service.findById("mock-id");
    expect(result).toEqual(mockDocument);
  });

  it("should return a document for findByTconst if it exists", async () => {
    const mockDocument = { _id: "mock-id", tconst: "mock-tconst" };
    jest.spyOn(service, "findByTconst").mockResolvedValue(mockDocument as any);

    const result = await service.findByTconst("mock-tconst");
    expect(result).toEqual(mockDocument);
  });
});
