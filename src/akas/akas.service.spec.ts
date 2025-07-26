import { Test, TestingModule } from "@nestjs/testing";
import { AkasService } from "./akas.service";

describe("AkasService", () => {
  let service: AkasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AkasService],
    }).compile();

    service = module.get<AkasService>(AkasService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
