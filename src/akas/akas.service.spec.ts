import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { AkasService } from "./akas.service";
import { AkasModel } from "./schema/akas.schema";

describe("AkasService", () => {
  let service: AkasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: getModelToken(AkasModel.name),
          useValue: Model,
        },
        AkasService,
      ],
    }).compile();

    service = module.get<AkasService>(AkasService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
