import { Test, TestingModule } from "@nestjs/testing";
import { BasicsService } from "./basics.service";
import { ConfigModule } from "@nestjs/config";
import { FilterQuery, Model } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";

import { BasicsDocument, BasicsModel } from "./schema/basics.schema";
import { NamesService } from "src/names/names.service";
import { PrincipalsService } from "src/principals/principals.service";
import { CrewsService } from "src/crews/crews.service";
import { AkasService } from "src/akas/akas.service";
import { EpisodesService } from "src/episodes/episodes.service";
import { NamesModel } from "src/names/schema/names.schema";
import { PrincipalsModel } from "src/principals/schema/principals.schema";
import { CrewsModel } from "src/crews/schema/crews.schema";
import { AkasDocument, AkasModel } from "src/akas/schema/akas.schema";
import {
  EpisodesDocument,
  EpisodesModel,
} from "src/episodes/schema/episodes.schema";
import { BasicCreateDto } from "./dto/basic-create.dto";
import { BasicUpdateDto } from "./dto/basic-update.dto";
import { BasicSearchDto } from "./dto/basic-search.dto";
import { PrincipalQueryDto } from "src/principals/dto/principal-query.dto";
import { CrewQueryDto } from "src/crews/dto/crew-query.dto";
import { PrincipalCreateDto } from "src/principals/dto/principal-create.dto";
import { PrincipalUpdateDto } from "src/principals/dto/principal-update.dto";
import { GetSeasonAggregation } from "src/episodes/interfaces/get-season-aggregation.interface";

describe("BasicsService", () => {
  let service: BasicsService;
  let principalService: PrincipalsService;
  let crewService: CrewsService;
  let akaService: AkasService;
  let episodeService: EpisodesService;
  let basicMockModel: Model<BasicsModel>;

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
    crewService = module.get<CrewsService>(CrewsService);
    akaService = module.get<AkasService>(AkasService);
    episodeService = module.get<EpisodesService>(EpisodesService);
    basicMockModel = module.get<Model<BasicsModel>>(
      getModelToken(BasicsModel.name),
    );
  });

  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
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

  it("should return principals by tconst", async () => {
    const spy = jest
      .spyOn(principalService, "findCastByTconst")
      .mockResolvedValue([
        {
          results: [
            {
              _id: "mock-id",
              tconst: "tt1234567",
              nconst: "nm1234567",
              ordering: 1,
            } as any,
          ],
          totalCount: 1,
          currentPage: 2,
          perPage: 10,
          totalPages: 1,
        },
      ]);

    const tconst = "tt1234567";
    const options: PrincipalQueryDto = {
      page: 2,
      limit: 10,
      include: {
        name: true,
        title: true,
      },
    };

    const result = await service.getCastByTconst(tconst, options);

    expect(result).toEqual({
      results: [
        {
          _id: "mock-id",
          tconst: "tt1234567",
          nconst: "nm1234567",
          ordering: 1,
        },
      ],
      totalCount: 1,
      currentPage: 2,
      perPage: 10,
      totalPages: 1,
    });
    expect(spy).toHaveBeenCalledWith(tconst, options);
  });

  it("should return crews by tconst", async () => {
    const spy = jest.spyOn(crewService, "findByTconst").mockResolvedValue([
      {
        results: [
          {
            _id: "mock-id",
            tconst: "tt1234567",
            directors: ["nm1234567"],
            writers: ["nm2345678"],
            ordering: 1,
          } as any,
        ],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
      },
    ]);

    const tconst = "tt1234567";
    const options: CrewQueryDto = {
      lean: true,
    };

    const result = await service.getCrewByTconst(tconst, options);

    expect(result).toEqual({
      results: [
        {
          _id: "mock-id",
          tconst: "tt1234567",
          directors: ["nm1234567"],
          writers: ["nm2345678"],
          ordering: 1,
        },
      ],
      totalCount: 1,
      currentPage: 1,
      totalPages: 1,
    });
    expect(spy).toHaveBeenCalledWith(tconst, options);
  });

  it("should add cast to title", async () => {
    const spy = jest.spyOn(principalService, "create").mockResolvedValue({
      _id: "mock-id",
      tconst: "tt1234567",
      nconst: "nm1234567",
      category: "actor",
      job: null,
      characters: ["Character 1"],
    } as any);

    const tconst = "tt1234567";
    const nconst = "nm1234567";
    const principalDto: Omit<PrincipalCreateDto, "tconst"> = {
      nconst,
      category: "actor",
      job: null,
      characters: ["Character 1"],
    };

    const result = await service.addCastToTitle(tconst, principalDto);

    expect(result).toEqual({
      _id: "mock-id",
      tconst: "tt1234567",
      nconst: "nm1234567",
      category: "actor",
      job: null,
      characters: ["Character 1"],
    });
    expect(spy).toHaveBeenCalledWith({ ...principalDto, tconst });
  });

  it("should add crew to title", async () => {
    const principalCreate = jest
      .spyOn(principalService, "create")
      .mockImplementation((dto) => {
        const mockValues = {
          tt1234567: {
            nconst: "nm2345678",
            category: "writer",
            job: null,
            characters: [],
          },
          tt2345678: {
            nconst: "nm1234567",
            category: "director",
            job: null,
            characters: [],
          },
        };

        return Promise.resolve(mockValues[dto.tconst]);
      });

    const addDirectorSpy = jest
      .spyOn(crewService, "addDirector")
      .mockResolvedValue({} as any);

    const addWriterSpy = jest
      .spyOn(crewService, "addWriter")
      .mockResolvedValue({} as any);

    const writerDto: Omit<PrincipalCreateDto, "tconst"> = {
      nconst: "nm2345678",
      category: "writer",
      job: null,
      characters: [],
    };

    const directorDto: Omit<PrincipalCreateDto, "tconst"> = {
      nconst: "nm1234567",
      category: "director",
      job: null,
      characters: [],
    };

    const writerResult = await service.addCrewToTitle("tt1234567", writerDto);
    expect(writerResult).toEqual({
      nconst: "nm2345678",
      category: "writer",
      job: null,
      characters: [],
    });
    expect(addWriterSpy).toHaveBeenCalledWith("tt1234567", writerDto.nconst);

    const directorResult = await service.addCrewToTitle(
      "tt2345678",
      directorDto,
    );
    expect(directorResult).toEqual({
      nconst: "nm1234567",
      category: "director",
      job: null,
      characters: [],
    });
    expect(addDirectorSpy).toHaveBeenCalledWith(
      "tt2345678",
      directorDto.nconst,
    );
  });

  it("should update cast in title", async () => {
    const spy = jest
      .spyOn(principalService, "update")
      .mockResolvedValue({} as any);

    const tconst = "tt1234567";
    const nconst = "nm1234567";
    const updateDto: PrincipalUpdateDto = {
      category: "actor",
      job: "lead",
      characters: ["Character 1", "Character 2"],
      ordering: 1,
    };

    const result = await service.updateCastInTitle(
      tconst,
      nconst,
      updateDto.ordering,
      updateDto,
    );

    expect(result).toEqual({});
    expect(spy).toHaveBeenCalledWith(
      tconst,
      nconst,
      updateDto.ordering,
      updateDto,
    );
  });

  it("should update crew in title", async () => {
    const mockWriter = {
      tconst: "tt4154796",
      nconst: "nm1411347",
      category: "writer",
      job: "Mantis created by",
      characters: [],
      ordering: 40,
    };

    const mockDirector = {
      tconst: "tt4154796",
      ordering: 20,
      nconst: "nm0751648",
      category: "director",
      job: null,
      characters: [],
    };

    const crewServiceUpdateSpy = jest
      .spyOn(crewService, "update")
      .mockResolvedValue({} as any);

    const principalServiceUpdateSpy = jest
      .spyOn(principalService, "update")
      .mockImplementation((tconst, nconst, ordering, dto) => {
        if (
          tconst === "tt4154796" &&
          nconst === "nm0751648" &&
          ordering === 20
        ) {
          return Promise.resolve({
            ...mockDirector,
          }) as any;
        }

        if (
          tconst === "tt4154796" &&
          nconst === "nm1411347" &&
          ordering === 40
        ) {
          return Promise.resolve({
            ...mockWriter,
          }) as any;
        }

        return null;
      });

    const nullResult = await service.updateCrewInTitle(
      "tt1234567",
      "nm0751648",
      1,
      {
        category: "director",
        job: null,
        characters: [],
        ordering: 1,
      },
    );

    expect(nullResult).toBeNull();

    const directorResult = await service.updateCrewInTitle(
      "tt4154796",
      "nm0751648",
      20,
      {
        category: "director",
        job: null,
        characters: [],
        ordering: 20,
      },
    );
    expect(directorResult).toEqual({
      tconst: "tt4154796",
      nconst: "nm0751648",
      category: "director",
      job: null,
      characters: [],
      ordering: 20,
    });
    expect(crewServiceUpdateSpy).toHaveBeenCalledWith("tt4154796", {
      directors: {
        add: ["nm0751648"],
      },
      writers: {
        remove: ["nm0751648"],
      },
    });

    const writerResult = await service.updateCrewInTitle(
      "tt4154796",
      "nm1411347",
      40,
      {
        category: "writer",
        job: "Mantis created by",
        characters: [],
        ordering: 40,
      },
    );
    expect(writerResult).toEqual({
      tconst: "tt4154796",
      nconst: "nm1411347",
      category: "writer",
      job: "Mantis created by",
      characters: [],
      ordering: 40,
    });
    expect(crewServiceUpdateSpy).toHaveBeenCalledWith("tt4154796", {
      directors: {
        remove: ["nm1411347"],
      },
      writers: {
        add: ["nm1411347"],
      },
    });
  });

  it("should update crew records", async () => {
    const mockCrew = {
      tconst: "tt4154796",
      directors: ["nm0751577", "nm0751648"],
      writers: ["nm1321655", "nm1321656", "nm0498278"],
    };

    const crewServiceUpdateSpy = jest
      .spyOn(crewService, "update")
      .mockImplementation((tconst) => {
        if (tconst === "tt4154796") {
          return Promise.resolve(mockCrew as any);
        }
        return Promise.resolve(null);
      });

    const principalServiceBulkDeleteSpy = jest
      .spyOn(principalService, "bulkDelete")
      .mockResolvedValue({} as any);

    const nullResult = await service.updateCrewRecord("tt1234567", {
      directors: {
        add: [],
        remove: [],
      },
      writers: {
        add: [],
        remove: [],
      },
    });
    expect(nullResult).toBeNull();
    expect(principalServiceBulkDeleteSpy).toHaveBeenCalledTimes(0);

    const result = await service.updateCrewRecord("tt4154796", {
      directors: {
        add: ["nm0751577", "nm0751648"],
        remove: ["nm0751648"],
      },
      writers: {
        add: ["nm1321655", "nm1321656", "nm0498278"],
        remove: ["nm1321655", "nm1321656"],
      },
    });
    expect(result).toEqual(mockCrew);
    expect(principalServiceBulkDeleteSpy).toHaveBeenCalledWith([
      {
        tconst: "tt4154796",
        nconst: "nm1321655",
      },
      {
        tconst: "tt4154796",
        nconst: "nm1321656",
      },
      {
        tconst: "tt4154796",
        nconst: "nm0751648",
      },
    ]);
  });

  it("should remove cast from title", async () => {
    const spy = jest
      .spyOn(principalService, "deleteByTconstAndNconst")
      .mockResolvedValue({} as any);

    const result = await service.removeCastFromTitle("tt1234567", "nm1234567");

    expect(result).toEqual({});
    expect(spy).toHaveBeenCalledWith("tt1234567", "nm1234567");
  });

  it("should remove crew from title", async () => {
    const mockWriter = {
      tconst: "tt4154796",
      nconst: "nm1411347",
      category: "writer",
      job: "Mantis created by",
      characters: [],
      ordering: 40,
    };

    const mockDirector = {
      tconst: "tt4154796",
      ordering: 20,
      nconst: "nm0751648",
      category: "director",
      job: null,
      characters: [],
    };

    const principalServiceDeleteSpy = jest
      .spyOn(principalService, "deleteByTconstAndNconst")
      .mockImplementation((tconst, nconst) => {
        if (tconst === "tt4154796") {
          if (nconst === "nm1411347") {
            return Promise.resolve(mockWriter as any);
          }
          if (nconst === "nm0751648") {
            return Promise.resolve(mockDirector as any);
          }
        }
        return Promise.resolve(null);
      });

    const crewServiceDeleteDirectorSpy = jest
      .spyOn(crewService, "removeDirector")
      .mockResolvedValue({} as any);
    const crewServiceDeleteWriterSpy = jest
      .spyOn(crewService, "removeWriter")
      .mockResolvedValue({} as any);

    const nullResult = await service.removeCrewFromTitle(
      "tt1234567",
      "nm0751648",
    );
    expect(nullResult).toBeNull();
    expect(crewServiceDeleteDirectorSpy).toHaveBeenCalledTimes(0);
    expect(crewServiceDeleteWriterSpy).toHaveBeenCalledTimes(0);

    const directorResult = await service.removeCrewFromTitle(
      "tt4154796",
      "nm0751648",
    );
    expect(directorResult).toEqual(mockDirector);
    expect(crewServiceDeleteDirectorSpy).toHaveBeenCalledWith(
      "tt4154796",
      "nm0751648",
    );

    const writerResult = await service.removeCrewFromTitle(
      "tt4154796",
      "nm1411347",
    );
    expect(writerResult).toEqual(mockWriter);
    expect(crewServiceDeleteWriterSpy).toHaveBeenCalledWith(
      "tt4154796",
      "nm1411347",
    );
  });

  it("should get akas from title", async () => {
    const mockAkas = [
      {
        titleId: "tt4154796",
        ordering: 36,
        title: "Avengers: Endgame",
        region: "XWW",
        language: "en",
        types: "imdbDisplay",
        attributes: null,
        isOriginalTitle: false,
      },
      {
        titleId: "tt4154796",
        ordering: 35,
        title: "Avengers: Endgame",
        region: "UY",
        language: null,
        types: null,
        attributes: "3-D version",
        isOriginalTitle: false,
      },
    ];

    const spy = jest.spyOn(akaService, "getAkasByTitleId").mockResolvedValue([
      {
        totalCount: 2,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
        results: mockAkas as AkasDocument[],
      },
    ]);

    const result = await service.getAkasByTconst("tt4154796", {
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      totalCount: 2,
      totalPages: 1,
      currentPage: 1,
      perPage: 10,
      results: mockAkas,
    });
    expect(spy).toHaveBeenCalledWith("tt4154796", {
      page: 1,
      limit: 10,
    });
  });

  it("should create an aka for a title", async () => {
    const mockAka = {
      titleId: "tt4154796",
      ordering: 35,
      title: "Avengers: Endgame",
      region: "UY",
      language: null,
      types: null,
      attributes: "3-D version",
      isOriginalTitle: false,
    };

    const spy = jest
      .spyOn(akaService, "createAka")
      .mockResolvedValue(mockAka as AkasDocument);

    const result = await service.addAkasToTitle("tt4154796", {
      title: "Avengers: Endgame",
      region: "UY",
      attributes: ["3-D version"],
      isOriginalTitle: false,
      language: null,
      types: null,
    });

    expect(result).toEqual(mockAka);
    expect(spy).toHaveBeenCalledWith({
      titleId: "tt4154796",
      title: "Avengers: Endgame",
      region: "UY",
      attributes: ["3-D version"],
      isOriginalTitle: false,
      language: null,
      types: null,
    });
  });

  it("should update an aka for a title", async () => {
    const mockAka = {
      titleId: "tt4154796",
      ordering: 28,
      title: "Avengers: Endgame",
      region: "SE",
      language: null,
      types: "imdbDisplay",
      attributes: null,
      isOriginalTitle: false,
    };

    const spy = jest
      .spyOn(akaService, "updateAka")
      .mockResolvedValue(mockAka as AkasDocument);

    const result = await service.updateAkasInTitle("tt4154796", 28, {
      title: "Avengers: Endgame",
      region: "SE",
      language: null,
      types: ["imdbDisplay"],
      attributes: null,
      isOriginalTitle: false,
    });

    expect(result).toEqual(mockAka);
    expect(spy).toHaveBeenCalledWith({
      titleId: "tt4154796",
      ordering: 28,
      title: "Avengers: Endgame",
      region: "SE",
      language: null,
      types: ["imdbDisplay"],
      attributes: null,
      isOriginalTitle: false,
    });
  });

  it("should delete an aka from a title", async () => {
    const spy = jest
      .spyOn(akaService, "deleteAka")
      .mockResolvedValue({} as any);

    const result = await service.removeAkasFromTitle("tt4154796", 28);
    expect(result).toEqual({});
    expect(spy).toHaveBeenCalledWith("tt4154796", 28);
  });

  it("should return episodes by parent tconst", async () => {
    const basicMovieMock = {
      tconst: "tt0114709",
      titleType: "movie",
      primaryTitle: "Toy Story",
      originalTitle: "Toy Story",
      isAdult: false,
      startYear: 1995,
      endYear: null,
      runtimeMinutes: 81,
      genres: ["comedy", "adventure", "animation"],
    };

    const basicSeriesMock = {
      tconst: "tt0898266",
      titleType: "tvSeries",
      primaryTitle: "The Big Bang Theory",
      originalTitle: "The Big Bang Theory",
      isAdult: false,
      startYear: 2007,
      endYear: 2019,
      runtimeMinutes: 22,
      genres: ["comedy", "romance"],
    };

    const episodeMocks = [
      {
        season: 1,
        episodes: [
          {
            tconst: "tt1256599",
            episodeNumber: 1,
            titleType: "tvEpisode",
            primaryTitle: "The Bad Fish Paradigm",
            originalTitle: "The Bad Fish Paradigm",
            isAdult: false,
            startYear: 2008,
            endYear: null,
            runtimeMinutes: 22,
            genres: ["comedy", "romance"],
          },
          {
            tconst: "tt1256030",
            episodeNumber: 2,
            titleType: "tvEpisode",
            primaryTitle: "The Codpiece Topology",
            originalTitle: "The Codpiece Topology",
            isAdult: false,
            startYear: 2008,
            endYear: null,
            runtimeMinutes: 21,
            genres: ["comedy", "romance"],
          },
        ],
      },
    ];

    const basicServiceSpy = jest
      .spyOn(service, "findByTconst")
      .mockImplementation((tconst) => {
        const mockData = {
          tt0114709: basicMovieMock,
          tt0898266: basicSeriesMock,
        };

        return Promise.resolve(mockData[tconst] || null);
      });

    const episodeServiceSpy = jest
      .spyOn(episodeService, "getSeasonsByTconst")
      .mockResolvedValue(episodeMocks as unknown as GetSeasonAggregation[]);

    const nullResult = await service.getEpisodesByTconst("tt1234567");
    expect(nullResult).toBeNull();
    expect(basicServiceSpy).toHaveBeenCalledWith("tt1234567");
    expect(episodeServiceSpy).toHaveBeenCalledTimes(0);

    const movieResult = await service.getEpisodesByTconst("tt0114709");
    expect(movieResult).toBeNull();
    expect(basicServiceSpy).toHaveBeenCalledWith("tt0114709");
    expect(episodeServiceSpy).toHaveBeenCalledTimes(0);

    const seriesResult = await service.getEpisodesByTconst("tt0898266");
    expect(seriesResult).toEqual({
      _id: undefined,
      tconst: "tt0898266",
      titleType: "tvSeries",
      title: "The Big Bang Theory",
      totalSeasons: 1,
      totalEpisodes: 2,
      seasons: episodeMocks,
    });
    expect(basicServiceSpy).toHaveBeenCalledWith("tt0898266");
    expect(episodeServiceSpy).toHaveBeenCalledWith("tt0898266");
  });

  it("should return a single episode by tconst", async () => {
    const mockEpisode = [
      {
        tconst: "tt6674736",
        parentTconst: "tt0898266",
        seasonNumber: 12,
        episodeNumber: 24,
        titleType: "tvEpisode",
        primaryTitle: "The Stockholm Syndrome",
        originalTitle: "The Stockholm Syndrome",
        isAdult: false,
        startYear: 2019,
        endYear: null,
        runtimeMinutes: 23,
        genres: ["comedy", "romance"],
      },
    ];

    const spy = jest
      .spyOn(episodeService, "getEpisodeByTconst")
      .mockResolvedValue(mockEpisode as any);

    const result = await service.getASingleEpisodeFromTitle(
      "tt0898266",
      "tt6674736",
    );
    expect(result).toEqual(mockEpisode[0]);
    expect(spy).toHaveBeenCalledWith("tt0898266", "tt6674736");
  });

  it("should add an episode to a title", async () => {
    const mockEpisode = {
      tconst: "tt1127908",
      parentTconst: "tt0898266",
      seasonNumber: 1,
      episodeNumber: 17,
    };

    const spy = jest
      .spyOn(episodeService, "createEpisode")
      .mockResolvedValue(mockEpisode as EpisodesDocument);

    const result = await service.addEpisodeToTitle("tt0898266", {
      tconst: "tt1127908",
      seasonNumber: 1,
      episodeNumber: 17,
    });

    expect(result).toEqual(mockEpisode);
    expect(spy).toHaveBeenCalledWith({
      tconst: "tt1127908",
      parentTconst: "tt0898266",
      seasonNumber: 1,
      episodeNumber: 17,
    });
  });

  it("should update an episode in a title", async () => {
    const mockEpisode = {
      tconst: "tt1127908",
      parentTconst: "tt0898266",
      seasonNumber: 1,
      episodeNumber: 18,
    };

    const spy = jest
      .spyOn(episodeService, "updateEpisode")
      .mockResolvedValue(mockEpisode as EpisodesDocument);

    const result = await service.updateEpisodeInTitle(
      "tt0898266",
      "tt1127908",
      {
        seasonNumber: 1,
        episodeNumber: 17,
      },
    );

    expect(result).toEqual(mockEpisode);
    expect(spy).toHaveBeenCalledWith("tt0898266", "tt1127908", {
      seasonNumber: 1,
      episodeNumber: 17,
    });
  });

  it("should remove the episode from a title", async () => {
    const mockEpisode = {
      tconst: "tt1127908",
      parentTconst: "tt0898266",
      seasonNumber: 1,
      episodeNumber: 17,
    };

    const spy = jest
      .spyOn(episodeService, "deleteEpisode")
      .mockImplementation((parentTconst, tconst) => {
        if (parentTconst === "tt0898266" && tconst === "tt1127908") {
          return Promise.resolve(mockEpisode as EpisodesDocument);
        }

        return Promise.resolve(null);
      });

    const nullResult = await service.removeEpisodeFromTitle(
      "tt0898266",
      "tt9999999",
    );
    expect(nullResult).toBeNull();

    const result = await service.removeEpisodeFromTitle(
      "tt0898266",
      "tt1127908",
    );

    expect(result).toEqual(mockEpisode);
    expect(spy).toHaveBeenCalledWith("tt0898266", "tt1127908");
  });
});
