import { Test, TestingModule } from "@nestjs/testing";
import { BasicsService } from "./basics.service";

describe("BasicsService", () => {
  let service: BasicsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BasicsService],
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
    const result = await service.findById("nonexistent-id");
    expect(result).toBeNull();
  });

  it("should return null for findByTconst if no document found", async () => {
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
