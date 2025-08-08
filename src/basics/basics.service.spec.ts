import { Test, TestingModule } from "@nestjs/testing";
import { BasicsService } from "./basics.service";
import { ConfigModule } from "@nestjs/config";
import { FilterQuery, Model } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";

import { BasicsModel } from "./schema/basics.schema";
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
import { BasicCreateDto } from "./dto/basic-create.dto";
import { BasicUpdateDto } from "./dto/basic-update.dto";
import { BasicSearchDto } from "./dto/basic-search.dto";

describe("BasicsService", () => {
  let service: BasicsService;
  let principalService: PrincipalsService;
  let basicMockModel: Model<BasicsModel>;
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
    principalService = module.get<PrincipalsService>(PrincipalsService);
    basicMockModel = module.get<Model<BasicsModel>>(
      getModelToken(BasicsModel.name),
    );
  });

  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
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

  it("should return documents by findById correctly", async () => {
    const spy = jest
      .spyOn(basicMockModel, "findById")
      .mockImplementation((val: string) => {
        if (val === "nonexistent-id") {
          return {
            exec: jest.fn().mockResolvedValue(null),
          } as any;
        }

        return {
          exec: jest
            .fn()
            .mockResolvedValue({ _id: val, tconst: "test-tconst" }),
        } as any;
      });

    const result1 = await service.findById("nonexistent-id");
    expect(result1).toBeNull();
    expect(spy).toHaveBeenCalledWith("nonexistent-id");

    const result2 = await service.findById("mock-id");
    expect(result2).toEqual({ _id: "mock-id", tconst: "test-tconst" });
    expect(spy).toHaveBeenCalledWith("mock-id");
  });

  it("should return documents for findByTconst correctly", async () => {
    const spy = jest
      .spyOn(basicMockModel, "findOne")
      .mockImplementation((query: FilterQuery<BasicsModel>) => {
        if (query.tconst === "nonexistent-tconst") {
          return {
            exec: jest.fn().mockResolvedValue(null),
          } as any;
        }

        return {
          exec: jest
            .fn()
            .mockResolvedValue({ _id: "mock-id", tconst: "test-tconst" }),
        } as any;
      });

    const result1 = await service.findByTconst("nonexistent-tconst");
    expect(result1).toBeNull();
    expect(spy).toHaveBeenCalledWith({ tconst: "nonexistent-tconst" });

    const result2 = await service.findByTconst("mock-tconst");
    expect(result2).toEqual({ _id: "mock-id", tconst: "test-tconst" });
    expect(spy).toHaveBeenCalledWith({ tconst: "mock-tconst" });
  });

  it("should return documents for findByTconstAndNconst correctly", async () => {
    const mockDocument = {
      _id: "mock-id",
      tconst: "mock-tconst",
      nconst: "mock-nconst",
    };

    const spy = jest
      .spyOn(principalService, "findByTconstAndNconst")
      .mockResolvedValue([mockDocument] as any);

    const result = await service.findByTconstAndNconst(
      "mock-tconst",
      "mock-nconst",
    );

    expect(result).toEqual(mockDocument);
  });

  it("should create a basic entry", async () => {
    const dto: BasicCreateDto = {
      tconst: "tt1234567",
      titleType: "movie",
      primaryTitle: "Inception",
      originalTitle: "Inception",
      isAdult: false,
      startYear: 2010,
      endYear: null,
      runtimeMinutes: 148,
      genres: [" Action ", "Sci-Fi"],
    };

    const mockSave = jest.fn().mockResolvedValue({
      ...dto,
      isAdult: 0,
      genres: ["Action", "Sci-Fi"],
      _id: "someObjectId",
    });

    const mockModelInstance = {
      ...dto,
      isAdult: 0,
      genres: ["Action", "Sci-Fi"],
      isNew: true,
      save: mockSave,
    };

    jest
      .spyOn(service as any, "basicsModel")
      .mockImplementation(() => mockModelInstance as any);

    const result = await service.createBasic(dto);

    expect(mockSave).toHaveBeenCalled();
    expect(result).toEqual({
      ...dto,
      isAdult: 0,
      genres: ["Action", "Sci-Fi"],
      _id: "someObjectId",
    });
  });

  it("should update a basic entry by tconst", async () => {
    const spy = jest
      .spyOn(basicMockModel, "findOneAndUpdate")
      .mockImplementation(
        (query: FilterQuery<BasicsModel>, update, options) => {
          if (query.tconst === "nonexistent-tconst") {
            return {
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
              }),
            } as any;
          }

          return {
            lean: jest.fn().mockReturnValue({
              exec: jest
                .fn()
                .mockResolvedValue({ _id: "mock-id", tconst: "test-tconst" }),
            }),
          } as any;
        },
      );

    const updateDto: BasicUpdateDto = {
      titleType: "movie",
      primaryTitle: "Updated Title",
      originalTitle: "Updated Original Title",
      isAdult: false,
      startYear: 2021,
      endYear: null,
      runtimeMinutes: 120,
      genres: ["Drama", "Action"],
    };

    const result1 = await service.updateByTconst(
      "nonexistent-tconst",
      updateDto,
    );
    expect(result1).toBeNull();
    expect(spy).toHaveBeenCalledWith(
      { tconst: "nonexistent-tconst" },
      { $set: updateDto },
      { new: true, runValidators: true },
    );

    const result2 = await service.updateByTconst("mock-tconst", updateDto);
    expect(result2).toEqual({ _id: "mock-id", tconst: "test-tconst" });
  });

  it("should delete a basic entry by tconst", async () => {
    const spy = jest
      .spyOn(basicMockModel, "findOneAndDelete")
      .mockImplementation((query: FilterQuery<BasicsModel>) => {
        if (query.tconst === "nonexistent-tconst") {
          return {
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(null),
            }),
          } as any;
        }

        return {
          lean: jest.fn().mockReturnValue({
            exec: jest
              .fn()
              .mockResolvedValue({ _id: "mock-id", tconst: "test-tconst" }),
          }),
        } as any;
      });

    const result1 = await service.deleteByTconst("nonexistent-tconst");
    expect(result1).toBeNull();
    expect(spy).toHaveBeenCalledWith({ tconst: "nonexistent-tconst" });

    const result2 = await service.deleteByTconst("mock-tconst");
    expect(result2).toEqual({ _id: "mock-id", tconst: "test-tconst" });
  });

  it("should return basics with searchByTitle", async () => {
    const findChain = {
      exec: jest.fn().mockResolvedValue([]),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      equals: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      ne: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
    } as any;

    const spy = jest.spyOn(basicMockModel, "find").mockImplementation(() => {
      return findChain;
    });

    const options1: Omit<BasicSearchDto, "q"> = {
      filter: {
        isAdult: false,
        titleType: ["movie", "short"],
        genre: "Drama",
        since: 2000,
        until: 2020,
        duration: "medium",
      },
      sort: {
        startYear: 1,
        primaryTitle: -1,
      },
      page: 2,
      limit: 5,
    };

    const options2: Omit<BasicSearchDto, "q"> = {
      ...options1,
      filter: {
        ...options1.filter,
        duration: "short",
      },
    };

    const options3: Omit<BasicSearchDto, "q"> = {
      ...options1,
      filter: {
        ...options1.filter,
        duration: "long",
      },
    };

    const result1 = await service.searchByTitle("test title", options1);
    expect(result1).toEqual([]);
    expect(spy).toHaveBeenCalledWith(
      { $text: { $search: "test title" } },
      { score: { $meta: "textScore" } },
    );

    expect(findChain.where).toHaveBeenCalledWith("isAdult");
    expect(findChain.where).toHaveBeenCalledWith("titleType");
    expect(findChain.where).toHaveBeenCalledWith("genres");
    expect(findChain.where).toHaveBeenCalledWith("startYear");
    expect(findChain.where).toHaveBeenCalledWith("endYear");

    expect(findChain.where).toHaveBeenCalledWith("runtimeMinutes");
    expect(findChain.gt).toHaveBeenCalledWith(30);
    expect(findChain.lte).toHaveBeenCalledWith(70);

    const result2 = await service.searchByTitle("test title", options2);
    expect(result2).toEqual([]);

    expect(findChain.where).toHaveBeenCalledWith("runtimeMinutes");
    expect(findChain.lte).toHaveBeenCalledWith(30);

    const result3 = await service.searchByTitle("test title", options3);
    expect(result3).toEqual([]);

    expect(findChain.where).toHaveBeenCalledWith("runtimeMinutes");
    expect(findChain.gt).toHaveBeenCalledWith(70);
  });
});
