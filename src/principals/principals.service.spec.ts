import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { DeleteResult, Model } from "mongoose";

import { PrincipalsService } from "./principals.service";
import {
  PrincipalsDocument,
  PrincipalsModel,
} from "./schema/principals.schema";
import { SinglePrincipalAggregation } from "./interfaces/principal-aggregation.interface";
import { PrincipalCreateDto } from "./dto/principal-create.dto";
import { PrincipalUpdateDto } from "./dto/principal-update.dto";
import { BulkWriteResult } from "mongodb";

describe("PrincipalsService", () => {
  let service: PrincipalsService;
  let model: Model<PrincipalsModel>;

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
    model = module.get<Model<PrincipalsModel>>(
      getModelToken(PrincipalsModel.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
  });

  it("should return principal records by findAll()", async () => {
    const mockResults = [
      {
        _id: "object-id-1",
        tconst: "tt4154796",
        ordering: 1,
        nconst: "nm0000375",
        category: "actor",
        job: null,
        characters: ["Tony Stark"],
      },
      {
        _id: "object-id-2",
        tconst: "tt4154796",
        ordering: 2,
        nconst: "nm0000375",
        category: "actor",
        job: null,
        characters: ["Iron Man"],
      },
    ] as PrincipalsDocument[];

    const spy = jest.spyOn(model, "find").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockResults),
    } as any);
    const result = await service.findAll();

    expect(result).toEqual(mockResults);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should return principal records with tconst by findByTconst()", async () => {
    const mockedResult = {
      _id: "object-id-1",
      tconst: "tt4154796",
      ordering: 1,
      nconst: "nm0000375",
      category: "actor",
      job: null,
      characters: ["Tony Stark"],
    } as PrincipalsDocument;

    const spy = jest.spyOn(model, "find").mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockedResult]),
    } as any);
    const result = await service.findByTconst("tt4154796");

    expect(result).toEqual([mockedResult]);
    expect(spy).toHaveBeenCalledWith({ tconst: "tt4154796" });
  });

  it("should return principal records with nconst by findByNconst()", async () => {
    const mockedResult = {
      _id: "object-id-1",
      tconst: "tt4154796",
      ordering: 1,
      nconst: "nm0000375",
      category: "actor",
      job: null,
      characters: ["Tony Stark"],
    } as PrincipalsDocument;

    const spy = jest.spyOn(model, "find").mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockedResult]),
    } as any);
    const result = await service.findByNconst("nm0000375");

    expect(result).toEqual([mockedResult]);
    expect(spy).toHaveBeenCalledWith({ nconst: "nm0000375" });
  });

  it("should return an aggregated principal record by findTconstAndNconst()", async () => {
    const mockedResult = {
      category: "actor",
      ordering: [1, 2],
      tconst: "tt4154796",
      nconst: "nm0000375",
      job: [],
      characters: ["Tony Stark", "Iron Man"],
    } as SinglePrincipalAggregation;

    const aggregationChain = {
      match: jest.fn().mockReturnThis(),
      group: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      lookup: jest.fn().mockReturnThis(),
      unwind: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedResult),
    };

    const spy = jest
      .spyOn(model, "aggregate")
      .mockReturnValue(aggregationChain as any);
    const result = await service.findByTconstAndNconst(
      "tt4154796",
      "nm0000375",
    );

    expect(result).toEqual({
      category: "actor",
      ordering: [1, 2],
      tconst: "tt4154796",
      nconst: "nm0000375",
      job: [],
      characters: ["Tony Stark", "Iron Man"],
    });

    spy.mockClear();

    const spy2 = jest.spyOn(model, "aggregate").mockReturnValue({
      ...aggregationChain,
      exec: jest.fn().mockResolvedValue({
        ...mockedResult,
        nameDetails: {
          primaryName: "Robert Downey Jr.",
          birthYear: 1965,
          deathYear: null,
          primaryProfession: ["actor", "producer", "writer"],
          knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
        },
        titleDetails: {
          titleType: "movie",
          primaryTitle: "Avengers: Endgame",
          originalTitle: "Avengers: Endgame",
          isAdult: false,
          startYear: 2019,
          endYear: null,
          runtimeMinutes: 181,
          genres: ["sci-fi", "adventure", "action"],
        },
      }),
    } as any);
    const result2 = await service.findByTconstAndNconst(
      "tt4154796",
      "nm0000375",
      {
        include: {
          name: true,
          title: true,
        },
      },
    );

    expect(result2).toEqual({
      category: "actor",
      ordering: [1, 2],
      tconst: "tt4154796",
      nconst: "nm0000375",
      job: [],
      characters: ["Tony Stark", "Iron Man"],
      nameDetails: {
        primaryName: "Robert Downey Jr.",
        birthYear: 1965,
        deathYear: null,
        primaryProfession: ["actor", "producer", "writer"],
        knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
      },
      titleDetails: {
        titleType: "movie",
        primaryTitle: "Avengers: Endgame",
        originalTitle: "Avengers: Endgame",
        isAdult: false,
        startYear: 2019,
        endYear: null,
        runtimeMinutes: 181,
        genres: ["sci-fi", "adventure", "action"],
      },
    });
  });

  it("should return an aggregated principal record by findCastByTconst()", async () => {
    const mockedResult = [
      {
        results: [
          {
            category: "actor",
            ordering: [1, 2],
            primaryName: "Robert Downey Jr.",
            tconst: "tt4154796",
            nconst: "nm0000375",
            characters: ["Tony Stark", "Iron Man"],
          },
          {
            category: "actor",
            ordering: [3, 4],
            primaryName: "Chris Evans",
            tconst: "tt4154796",
            nconst: "nm0262635",
            characters: ["Steve Rogers", "Captain America"],
          },
        ],
        totalCount: 2,
        currentPage: 1,
        perPage: 5,
        totalPages: 1,
      },
    ];

    const aggregationChain = {
      match: jest.fn().mockReturnThis(),
      lookup: jest.fn().mockReturnThis(),
      unwind: jest.fn().mockReturnThis(),
      group: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      facet: jest.fn().mockReturnThis(),
      replaceRoot: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedResult),
    };

    const spy = jest
      .spyOn(model, "aggregate")
      .mockReturnValue(aggregationChain as any);
    const result = await service.findCastByTconst("tt4154796", {
      limit: 10,
      page: 1,
    });

    expect(result).toEqual(mockedResult);

    const result2 = await service.findCastByTconst("tt4154796", undefined);

    expect(result2).toEqual(mockedResult);
  });

  it("should create a principal record by create()", async () => {
    const mockedResult = {
      tconst: "tt4154796",
      nconst: "nm1107001",
      category: "actor",
      job: null,
      characters: ["Sam Wilson"],
      _id: "687952703ce3144784b93efe",
      ordering: 34,
    } as PrincipalsDocument;

    const createPrincipalDto = {
      tconst: "tt4154796",
      nconst: "nm1107001",
      category: "actor",
      job: null,
      characters: ["Sam Wilson"],
    } as PrincipalCreateDto;

    const mockPrincipalInstance = {
      ...createPrincipalDto,
      save: jest.fn().mockResolvedValue(mockedResult),
    };

    const spy = jest
      .spyOn(service as any, "principalsModel")
      .mockImplementation(() => mockPrincipalInstance);
    const result = await service.create(createPrincipalDto);

    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(mockedResult);
  });

  it("should create a principal record with string character dto by create()", async () => {
    const mockedResult = {
      tconst: "tt4154796",
      nconst: "nm1107001",
      category: "actor",
      job: null,
      characters: ["Sam Wilson"],
      _id: "687952703ce3144784b93efe",
      ordering: 34,
    } as PrincipalsDocument;

    const createPrincipalDto = {
      tconst: "tt4154796",
      nconst: "nm1107001",
      category: "actor",
      job: null,
      characters: "Sam Wilson",
    } as PrincipalCreateDto;

    const mockPrincipalInstance = {
      ...createPrincipalDto,
      save: jest.fn().mockResolvedValue(mockedResult),
    };

    const spy = jest
      .spyOn(service as any, "principalsModel")
      .mockImplementation(() => mockPrincipalInstance);
    const result = await service.create(createPrincipalDto);

    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(mockedResult);
  });

  it("should update a principal record by update()", async () => {
    const mockedResult = {
      _id: "object-1",
      nconst: "nm1107001",
      ordering: 34,
      tconst: "tt4154796",
      category: "actor",
      characters: ["The Falcon"],
      job: null,
    } as PrincipalsDocument;

    const updatePrincipalDto = {
      ordering: 34,
      category: "actor",
      job: null,
      characters: ["The Falcon"],
    } as PrincipalUpdateDto;

    const spy = jest.spyOn(model, "findOneAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);
    const result = await service.update(
      "tt4154796",
      "nm1107001",
      34,
      updatePrincipalDto,
    );

    expect(result).toEqual({
      _id: "object-1",
      nconst: "nm1107001",
      ordering: 34,
      tconst: "tt4154796",
      category: "actor",
      characters: ["The Falcon"],
      job: null,
    });
    expect(spy).toHaveBeenCalledWith(
      {
        tconst: "tt4154796",
        nconst: "nm1107001",
        ordering: 34,
      },
      {
        category: "actor",
        job: null,
        characters: ["The Falcon"],
      },
      {
        new: true,
        runValidators: true,
      },
    );
  });

  it("should delete principal records by tconst with deleteByTconst()", async () => {
    const spy = jest.spyOn(model, "deleteMany").mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      } as DeleteResult),
    } as any);

    const result = await service.deleteByTconst("tt4154796");

    expect(spy).toHaveBeenCalledWith({ tconst: "tt4154796" });
    expect(result).toEqual({
      acknowledged: true,
      deletedCount: 1,
    });
  });

  it("should delete principal records by nconst with deleteByNconst()", async () => {
    const spy = jest.spyOn(model, "deleteMany").mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      } as DeleteResult),
    } as any);

    const result = await service.deleteByNconst("nm1107001");

    expect(spy).toHaveBeenCalledWith({ nconst: "nm1107001" });
    expect(result).toEqual({
      acknowledged: true,
      deletedCount: 1,
    });
  });

  it("should delete a principal record by deleteTconstAndNconst()", async () => {
    const mockedResult = {
      _id: "object-id-1",
      tconst: "tt4154796",
      ordering: 1,
      nconst: "nm0000375",
      category: "actor",
      job: null,
      characters: ["Tony Stark"],
    } as PrincipalsDocument;

    const spy = jest.spyOn(model, "findOneAndDelete").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);
    const result = await service.deleteByTconstAndNconst(
      "tt4154796",
      "nm0000375",
    );
  });

  it("should delete principals records with bulkDelete()", async () => {
    const mockedResult = {
      deletedCount: 1,
    } as BulkWriteResult;

    const records = [
      { tconst: "tt4154796", nconst: "nm1107001" },
      { tconst: "tt4154797", nconst: "nm1107002" },
    ];

    const spy = jest.spyOn(model, "bulkWrite").mockResolvedValue(mockedResult);
    const result = await service.bulkDelete(records);

    expect(spy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          deleteOne: expect.objectContaining({
            filter: { tconst: "tt4154796", nconst: "nm1107001" },
          }),
        }),
        expect.objectContaining({
          deleteOne: expect.objectContaining({
            filter: { tconst: "tt4154797", nconst: "nm1107002" },
          }),
        }),
      ]),
    );
    expect(result).toEqual(mockedResult);
  });

  it("should return undefined bulkDelete()", async () => {
    const records: { tconst: string; nconst: string }[] = [];

    const spy = jest
      .spyOn(model, "bulkWrite")
      .mockResolvedValue(undefined as any);
    const result = await service.bulkDelete(records);

    expect(spy).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
