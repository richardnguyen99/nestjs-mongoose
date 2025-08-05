import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { PrincipalsService } from "./principals.service";
import { PrincipalsModel } from "./schema/principals.schema";

describe("PrincipalsService", () => {
  let service: PrincipalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: getModelToken(PrincipalsModel.name),
          useValue: Model,
        },
        PrincipalsService,
      ],
    }).compile();

    service = module.get<PrincipalsService>(PrincipalsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
