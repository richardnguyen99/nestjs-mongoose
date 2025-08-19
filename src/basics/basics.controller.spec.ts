import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

import { BasicsController } from "./basics.controller";
import { BasicsService } from "./basics.service";
import { BasicCreateDto } from "./dto/basic-create.dto";
import { BasicsDocument } from "./schema/basics.schema";
import { BasicSearchDto } from "./dto/basic-search.dto";
import { BasicUpdateDto } from "./dto/basic-update.dto";
import { PrincipalsDocument } from "src/principals/schema/principals.schema";
import { PrincipalCreateDto } from "src/principals/dto/principal-create.dto";
import { PrincipalUpdateDto } from "src/principals/dto/principal-update.dto";
import { CrewsAggregationInterface } from "src/crews/interfaces/crews-interface.interface";
import { CrewUpdateDto } from "src/crews/dto/crew-update.dto";
import { CrewsDocument } from "src/crews/schema/crews.schema";
import { AkasAggregationInterface } from "src/akas/interfaces/akas-query.interface";
import { BaseAkaCreateDto } from "src/akas/dto/aka-create.dto";
import { AkasDocument } from "src/akas/schema/akas.schema";
import { BaseAkaUpdateDto } from "src/akas/dto/aka-update.dto";
import { GetSeasonAggregation } from "src/episodes/interfaces/get-season-aggregation.interface";
import {
  BaseEpisodeCreateDto,
  EpisodeCreateDto,
} from "src/episodes/dto/episode-create.dto";
import { EpisodesDocument } from "src/episodes/schema/episodes.schema";
import { GetEpisodeAggregation } from "src/episodes/interfaces/get-episode-aggregation.interface";
import { BaseEpisodeUpdateDto } from "src/episodes/dto/episode-update.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  BaseCrewCreateDto,
  baseCrewCreateSchema,
} from "src/crews/dto/crew-create.dto";

describe("BasicsController", () => {
  let controller: BasicsController;
  let service: BasicsService;

  const mockBasicsService: Partial<BasicsService> = {
    createBasic: jest.fn(),
    searchByTitle: jest.fn(),
    findByTconst: jest.fn(),
    updateByTconst: jest.fn(),
    deleteByTconst: jest.fn(),
    getCastByTconst: jest.fn(),
    addCastToTitle: jest.fn(),
    findByTconstAndNconst: jest.fn(),
    updateCastInTitle: jest.fn(),
    removeCastFromTitle: jest.fn(),
    getCrewByTconst: jest.fn(),
    createCrew: jest.fn(),
    addCrewToTitle: jest.fn(),
    updateCrewRecord: jest.fn(),
    updateCrewInTitle: jest.fn(),
    removeCrewFromTitle: jest.fn(),
    getAkasByTconst: jest.fn(),
    addAkasToTitle: jest.fn(),
    updateAkasInTitle: jest.fn(),
    removeAkasFromTitle: jest.fn(),
    getEpisodesByTconst: jest.fn(),
    addEpisodeToTitle: jest.fn(),
    getASingleEpisodeFromTitle: jest.fn(),
    updateEpisodeInTitle: jest.fn(),
    removeEpisodeFromTitle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [BasicsController],
      providers: [
        {
          provide: BasicsService,
          useValue: mockBasicsService,
        },
      ],
    }).compile();

    controller = module.get<BasicsController>(BasicsController);
    service = module.get<BasicsService>(BasicsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it("should create a basic entry", async () => {
    const createBasicDto: BasicCreateDto = {
      tconst: "tt4154796",
      titleType: "movie",
      primaryTitle: "Avengers: Endgame",
      originalTitle: "Avengers: Endgame",
      isAdult: false,
      startYear: 2019,
      endYear: null,
      runtimeMinutes: 181,
      genres: ["sci-fi", "adventure", "action"],
    };

    const spy = jest.spyOn(service, "createBasic").mockResolvedValue({
      ...createBasicDto,
      _id: "someObjectId",
    } as unknown as BasicsDocument);

    const result = await controller.createBasic(createBasicDto);

    expect(result).toEqual({
      ...createBasicDto,
      _id: "someObjectId",
    });
    expect(spy).toHaveBeenCalledWith(createBasicDto);
  });

  it("should search basics by title", async () => {
    const searchQuery: BasicSearchDto = {
      q: "Avengers: Endgame",
      limit: 10,
      page: 2,
      filter: {
        isAdult: false,
        duration: "long",
        genre: ["sci-fi", "action"],
        since: 2019,
        until: undefined,
        titleType: "movie",
      },
      sort: {},
    };

    const mockedResult = [
      {
        _id: "687309514d6c38ba2a1ebebf",
        tconst: "tt0114709",
        titleType: "movie",
        primaryTitle: "Toy Story",
        originalTitle: "Toy Story",
        isAdult: false,
        startYear: 1995,
        endYear: null,
        runtimeMinutes: 81,
        genres: ["comedy", "adventure", "animation"],
      },
      {
        _id: "687309574d6c38ba2a236977",
        tconst: "tt0435761",
        titleType: "movie",
        primaryTitle: "Toy Story 3",
        originalTitle: "Toy Story 3",
        isAdult: false,
        startYear: 2010,
        endYear: null,
        runtimeMinutes: 103,
        genres: ["comedy", "adventure", "animation"],
      },
    ] as BasicsDocument[];

    const spy = jest
      .spyOn(service, "searchByTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.searchByTitle(searchQuery);

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("Avengers: Endgame", {
      filter: searchQuery.filter,
      sort: searchQuery.sort,
      limit: searchQuery.limit,
      page: searchQuery.page,
    });
  });

  it("should get a basic by tconst", async () => {
    const mockedResult = {
      tconst: "tt4154796",
      titleType: "movie",
      primaryTitle: "Avengers: Endgame",
      originalTitle: "Avengers: Endgame",
      isAdult: false,
      startYear: 2019,
      endYear: null,
      runtimeMinutes: 181,
      genres: ["sci-fi", "adventure", "action"],
    } as BasicsDocument;

    const spy = jest
      .spyOn(service, "findByTconst")
      .mockResolvedValue(mockedResult);
    const result = await controller.getByTconst("tt4154796");

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796");
  });

  it("should throw a not-found exception when basic entry is not found", async () => {
    const spy = jest.spyOn(service, "findByTconst").mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.getByTconst("nonexistent");
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `Title with tconst=nonexistent not found`,
    );
  });

  it("should update a basic entry by tconst", async () => {
    const updateBasicDto = {} as BasicUpdateDto;

    const mockedResult = {
      tconst: "tt4154796",
      titleType: "movie",
      primaryTitle: "Avengers: Endgame",
      originalTitle: "Avengers: Endgame",
      isAdult: false,
      startYear: 2019,
      endYear: null,
      runtimeMinutes: 181,
      genres: ["sci-fi", "action"],
    } as BasicsDocument;

    const spy = jest
      .spyOn(service, "updateByTconst")
      .mockResolvedValue(mockedResult);

    const result = await controller.updateBasicByTconst(
      "tt4154796",
      updateBasicDto,
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", updateBasicDto);
  });

  it("should throw a not-found exception when basic entry is not found", async () => {
    const spy = jest.spyOn(service, "updateByTconst").mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.updateBasicByTconst("nonexistent", {});
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `Title with tconst=nonexistent not found`,
    );
  });

  it("should delete a basic entry by tconst", async () => {
    const mockedResult = {
      tconst: "tt4154796",
      titleType: "movie",
      primaryTitle: "Avengers: Endgame",
      originalTitle: "Avengers: Endgame",
      isAdult: false,
      startYear: 2019,
      endYear: null,
      runtimeMinutes: 181,
      genres: ["sci-fi", "action"],
    } as BasicsDocument;

    const spy = jest
      .spyOn(service, "deleteByTconst")
      .mockResolvedValue(mockedResult);

    const result = await controller.deleteByTconst("tt4154796");

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796");
  });

  it("should throw a not-found exception when basic entry is not found", async () => {
    const spy = jest.spyOn(service, "deleteByTconst").mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.deleteByTconst("nonexistent");
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `Title with tconst=nonexistent not found`,
    );
  });

  it("should return cast by tconst", async () => {
    const mockedResults = [
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
    ] as any[];

    const spy = jest.spyOn(service, "getCastByTconst").mockResolvedValue({
      currentPage: 1,
      perPage: 10,
      totalCount: mockedResults.length,
      totalPages: 1,
      results: mockedResults,
    });

    const result = await controller.getCastByTconst("tt4154796");

    expect(result).toEqual({
      currentPage: 1,
      perPage: 10,
      totalCount: mockedResults.length,
      totalPages: 1,
      tconst: "tt4154796",
      titleUrl: "https://www.imdb.com/title/tt4154796",
      results: mockedResults,
    });
    expect(spy).toHaveBeenCalledWith("tt4154796", undefined);
  });

  it("should throw a bad-request exception when current page exceeds total pages", async () => {
    const spy = jest.spyOn(service, "getCastByTconst").mockResolvedValue({
      currentPage: 2,
      totalCount: 1,
      totalPages: 0,
      perPage: 10,
      results: [],
    });

    const throwErrorFn = async () => {
      await controller.getCastByTconst("nonexistent", {
        limit: 10,
        page: 1,
      });
    };

    await expect(throwErrorFn).rejects.toThrow(BadRequestException);
    await expect(throwErrorFn).rejects.toThrow(
      `Page exceeds. totalPages=0, currentPage=2`,
    );
  });

  it("should throw a not-found exception when no cast is found", async () => {
    const spy = jest.spyOn(service, "getCastByTconst").mockResolvedValue({
      totalCount: 0,
      currentPage: 0,
      totalPages: 0,
      perPage: 10,
      results: [],
    });

    const throwErrorFn = async () => {
      await controller.getCastByTconst("nonexistent", {
        limit: 10,
        page: 1,
      });
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No cast found for tconst=nonexistent`,
    );
  });

  it("should create a new cast entry", async () => {
    const createCastDto = {
      category: "actor",
      ordering: 1,
      primaryName: "Robert Downey Jr.",
      tconst: "tt4154796",
      nconst: "nm0000375",
      characters: "Tony Stark",
      job: null,
    } as PrincipalCreateDto;

    const mockedResult = {
      ...createCastDto,
      _id: "someObjectId",
    } as PrincipalsDocument;

    const spy = jest
      .spyOn(service, "addCastToTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.addCastToTitle("tt4154796", createCastDto);

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", createCastDto);
  });

  it("should get a single cast by tconst and nconst", async () => {
    const mockedResult = {
      category: "actor",
      ordering: [1, 2],
      tconst: "tt4154796",
      nconst: "nm0000375",
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
    };

    const spy = jest
      .spyOn(service, "findByTconstAndNconst")
      .mockResolvedValue(mockedResult as any);

    const result = await controller.getCastByTconstAndNconst(
      "tt4154796",
      "nm0000375",
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", "nm0000375", undefined);
  });

  it("should throw a not-found exception when a cast entry is not found", async () => {
    const spy = jest
      .spyOn(service, "findByTconstAndNconst")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.getCastByTconstAndNconst("something", "nonexistent", {
        include: { name: true, title: true },
      });
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No cast found for tconst=something and nconst=nonexistent`,
    );
  });

  it("should update a cast entry by tconst and nconst", async () => {
    const updateCastDto: PrincipalUpdateDto = {
      ordering: 1,
      characters: ["Tony Stark"],
      category: "actor",
      job: null,
    };

    const mockedResult = {
      _id: "someObjectId",
      tconst: "tt4154796",
      nconst: "nm0000375",
      category: "actor",
      job: null,
      characters: ["Tony Stark"],
    } as PrincipalsDocument;

    const spy = jest
      .spyOn(service, "updateCastInTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.updateCastByTconstAndNconst(
      "tt4154796",
      "nm0000375",
      updateCastDto,
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith(
      "tt4154796",
      "nm0000375",
      updateCastDto.ordering,
      updateCastDto,
    );
  });

  it("should throw a not-found exception when updating a nonexistent cast", async () => {
    const spy = jest
      .spyOn(service, "updateCastInTitle")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.updateCastByTconstAndNconst("something", "nonexistent", {
        ordering: 1,
      });
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No cast found for tconst=something, nconst=nonexistent and ordering=1`,
    );
  });

  it("should delete a cast entry by tconst and nconst", async () => {
    const mockedResult = {
      _id: "someObjectId",
      tconst: "tt4154796",
      nconst: "nm0000375",
      category: "actor",
      job: null,
      characters: ["Tony Stark"],
    } as PrincipalsDocument;

    const spy = jest
      .spyOn(service, "removeCastFromTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.deleteCastByTconstAndNconst(
      "tt4154796",
      "nm0000375",
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", "nm0000375");
  });

  it("should throw a not-found exception when deleting a nonexistent cast", async () => {
    const spy = jest
      .spyOn(service, "removeCastFromTitle")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.deleteCastByTconstAndNconst("something", "nonexistent");
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No cast found for tconst=something and nconst=nonexistent`,
    );
  });

  it("should return crews by tconst", async () => {
    const mockedResult = {
      totalCount: 1,
      results: [
        {
          tconst: "tt4154796",
          directors: ["nm0751577"],
          writers: ["nm0317493"],
          directorsInfo: [
            {
              nconst: "nm0751577",
              primaryName: "Anthony Russo",
              birthYear: 1970,
              deathYear: null,
              roleDetails: {
                ordering: 19,
                category: "director",
                job: null,
                characters: [],
              },
            },
          ],
          writersInfo: [
            {
              nconst: "nm0317493",
              primaryName: "Keith Giffen",
              birthYear: 1952,
              deathYear: 2023,
              roleDetails: {
                category: "writer",
                job: "Rocket Raccoon created by",
                characters: [],
                ordering: 38,
              },
            },
          ],
        },
      ],
      perPage: 10,
      currentPage: 1,
      totalPages: 1,
    } as CrewsAggregationInterface;

    const spy = jest
      .spyOn(service, "getCrewByTconst")
      .mockResolvedValue(mockedResult);

    const result = await controller.getCrewsByTconst("tt4154796", {
      page: 1,
      limit: 10,
      lean: false,
    });

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", {
      page: 1,
      limit: 10,
      lean: false,
    });
  });

  it("should throw a bad-request exception when current page exceeds total pages", async () => {
    const spy = jest.spyOn(service, "getCrewByTconst").mockResolvedValue({
      totalCount: 1,
      currentPage: 2,
      totalPages: 0,
      perPage: 10,
      results: [],
    });

    const throwErrorFn = async () => {
      await controller.getCrewsByTconst("nonexistent", {
        lean: false,
        page: 2,
        limit: 10,
      });
    };

    await expect(throwErrorFn).rejects.toThrow(BadRequestException);
    await expect(throwErrorFn).rejects.toThrow(
      `Current page 2 exceeds total pages 0`,
    );
  });

  it("should throw a not-found exception when no crews are found", async () => {
    const spy = jest.spyOn(service, "getCrewByTconst").mockResolvedValue({
      totalCount: 0,
      currentPage: 0,
      totalPages: 0,
      perPage: 0,
      results: [],
    });

    const throwErrorFn = async () => {
      await controller.getCrewsByTconst("nonexistent", {
        lean: false,
        page: 1,
        limit: 10,
      });
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No crew found for tconst=nonexistent`,
    );
  });

  it("should create a new crew", async () => {
    const createCrewDto = {
      directors: ["nm0751577", "nm0751648"],
      writers: [
        "nm1321655",
        "nm1321656",
        "nm0498278",
        "nm0456158",
        "nm0800209",
        "nm1921680",
        "nm3053444",
        "nm2757098",
        "nm0317493",
        "nm4160687",
        "nm1293367",
        "nm1411347",
      ],
    } as BaseCrewCreateDto;

    const mockedResult = {
      tconst: "tt4154796",
      directors: ["nm0751577", "nm0751648"],
      writers: [
        "nm1321655",
        "nm1321656",
        "nm0498278",
        "nm0456158",
        "nm0800209",
        "nm1921680",
        "nm3053444",
        "nm2757098",
        "nm0317493",
        "nm4160687",
        "nm1293367",
        "nm1411347",
      ],
    } as CrewsDocument;

    const spy = jest
      .spyOn(service, "createCrew")
      .mockResolvedValue(mockedResult);

    const result = await controller.createCrew("tt4154796", createCrewDto);
    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", createCrewDto);
  });

  it("should get a single crew by tconst and nconst", async () => {
    const mockedResult = {
      category: "writer",
      ordering: [40],
      tconst: "tt4154796",
      nconst: "nm1411347",
      job: ["Mantis created by"],
      characters: [],
      nameDetails: {
        primaryName: "Don Heck",
        birthYear: 1929,
        deathYear: 1995,
        primaryProfession: ["writer", "art_department", "miscellaneous"],
        knownForTitles: ["tt0371746", "tt6791350", "tt1300854", "tt10648342"],
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
    };

    const spy = jest
      .spyOn(service, "findByTconstAndNconst")
      .mockResolvedValue(mockedResult);

    const result = await controller.getCrewByTconstAndNconst(
      "tt4154796",
      "nm1411347",
      {
        include: { name: true, title: true },
      },
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", "nm1411347", {
      include: { name: true, title: true },
    });
  });

  it("should throw a not-found exception when updating a nonexistent crew", async () => {
    const spy = jest
      .spyOn(service, "findByTconstAndNconst")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.getCrewByTconstAndNconst("something", "nonexistent", {
        include: { name: true, title: true },
      });
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No crew member found for tconst=something and nconst=nonexistent`,
    );
  });

  it("should update a crew entry by tconst", async () => {
    const mockedResult = {
      tconst: "tt4154796",
      directors: ["nm0751577"],
      writers: ["nm2757098", "nm0317493"],
    } as CrewsDocument;

    const crewUpdateDto = {
      directors: {
        add: ["nm0751648"],
        remove: ["nm0751577"],
      },
      writers: {
        add: ["nm1411347"],
        remove: ["nm0317493"],
      },
    } as CrewUpdateDto;

    const spy = jest
      .spyOn(service, "updateCrewRecord")
      .mockResolvedValue(mockedResult);

    const result = await controller.updateCrewsByTconst(
      "tt4154796",
      crewUpdateDto,
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", crewUpdateDto);
  });

  it("should throw a not-found exception when updating a nonexistent crew record", async () => {
    const spy = jest.spyOn(service, "updateCrewRecord").mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.updateCrewsByTconst("nonexistent", {
        directors: {},
        writers: {},
      });
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No crew found for tconst=nonexistent`,
    );
  });

  it("should update a single crew entry by tconst and nconst", async () => {
    const mockedResult = {
      tconst: "tt4154796",
      nconst: "nm1411347",
      category: "writer",
      job: "Mantis created by",
      characters: [] as string[],
      ordering: 40,
    } as PrincipalsDocument;

    const principalCrewUpdateDto = {
      category: "writer",
      job: "Mantis created by",
      characters: [],
      ordering: 40,
    } as PrincipalUpdateDto;

    const spy = jest
      .spyOn(service, "updateCrewInTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.updateCrewByTconstAndNconst(
      "tt4154796",
      "nm1411347",
      principalCrewUpdateDto,
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith(
      "tt4154796",
      "nm1411347",
      principalCrewUpdateDto.ordering,
      principalCrewUpdateDto,
    );
  });

  it("should throw a not-found exception when updating a nonexistent crew", async () => {
    const spy = jest
      .spyOn(service, "updateCrewInTitle")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.updateCrewByTconstAndNconst("tt4154796", "nm1411347", {
        ordering: 999,
        category: "writer",
        job: "Mantis created by",
        characters: [],
      });
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No crew member found for tconst=tt4154796 and nconst=nm1411347`,
    );
  });

  it("should delete a crew entry by tconst and nconst", async () => {
    const mockedResult = {
      tconst: "tt4154796",
      nconst: "nm1411347",
      category: "writer",
      job: "Mantis created by",
      characters: [] as string[],
      ordering: 40,
    } as PrincipalsDocument;

    const spy = jest
      .spyOn(service, "removeCrewFromTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.deleteCrewByTconstAndNconst(
      "tt4154796",
      "nm1411347",
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", "nm1411347");
  });

  it("should throw a not-found exception when deleting nonexistent crew", async () => {
    const spy = jest
      .spyOn(service, "removeCrewFromTitle")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.deleteCrewByTconstAndNconst("something", "nonexistent");
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No crew member found for tconst=something and nconst=nonexistent`,
    );
  });

  it("should return akas by tconst", async () => {
    const mockResult = {
      totalCount: 4,
      results: [
        {
          _id: "68633dc8637708bdb6b3552f",
          titleId: "tt0583459",
          ordering: 1,
          title: "The One Where Monica Gets a Roommate",
          region: null,
          language: null,
          types: "original",
          attributes: null,
          isOriginalTitle: true,
        },
        {
          _id: "68633f54fc25438cbe9165d8",
          titleId: "tt0583459",
          ordering: 1,
          title: "The One Where Monica Gets a Roommate",
          region: null,
          language: null,
          types: "original",
          attributes: null,
          isOriginalTitle: true,
        },
        {
          _id: "68633dc8637708bdb6b3552b",
          titleId: "tt0583459",
          ordering: 2,
          title: "The One Where Monica Gets a Roommate",
          region: "US",
          language: null,
          types: null,
          attributes: null,
          isOriginalTitle: false,
        },
        {
          _id: "68633f54fc25438cbe9165d9",
          titleId: "tt0583459",
          ordering: 2,
          title: "The One Where Monica Gets a Roommate",
          region: "US",
          language: null,
          types: null,
          attributes: null,
          isOriginalTitle: false,
        },
      ],
      totalPages: 1,
      currentPage: 1,
      perPage: 10,
    } as AkasAggregationInterface;

    const spy = jest
      .spyOn(service, "getAkasByTconst")
      .mockResolvedValue(mockResult);

    const result = await controller.getAkasByTconst("tt0583459", {
      page: 1,
      limit: 10,
    });

    expect(result).toEqual(mockResult);
    expect(spy).toHaveBeenCalledWith("tt0583459", {
      page: 1,
      limit: 10,
    });
  });

  it("should throw a not-found exception when no akas are found", async () => {
    const spy = jest.spyOn(service, "getAkasByTconst").mockResolvedValue({
      totalCount: 0,
      results: [],
      totalPages: 0,
      currentPage: 0,
      perPage: 10,
    });

    const throwErrorFn = async () => {
      await controller.getAkasByTconst("nonexistent", {
        page: 1,
        limit: 10,
      });
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No akas found for tconst=nonexistent`,
    );
  });

  it("should throw a bad-request exception when invalid page is provided", async () => {
    const spy = jest.spyOn(service, "getAkasByTconst").mockResolvedValue({
      totalCount: 1,
      results: [],
      totalPages: 0,
      currentPage: 2,
      perPage: 10,
    });

    const throwErrorFn = async () => {
      await controller.getAkasByTconst("tt0583459", {
        page: 2,
        limit: 10,
      });
    };

    await expect(throwErrorFn).rejects.toThrow(BadRequestException);
    await expect(throwErrorFn).rejects.toThrow(
      `Current page 2 exceeds total pages 0`,
    );
  });

  it("should create a new aka entry", async () => {
    const createAkaDto = {
      ordering: 21,
      title: "Avengers: Endgame",
      region: "IN",
      language: "fr",
      types: ["imdbDisplay"],
      attributes: null,
      isOriginalTitle: false,
    } as BaseAkaCreateDto;

    const mockedResult = {
      _id: "someObjectId",
      titleId: "tt4154796",
      ordering: 21,
      title: "Avengers: Endgame",
      region: "IN",
    } as AkasDocument;

    const spy = jest
      .spyOn(service, "addAkasToTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.addAkasToTitle("tt4154796", createAkaDto);

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", createAkaDto);
  });

  it("should update an aka entry by tconst and ordering", async () => {
    const updateAkaDto = {
      title: "Qisasçılar: Final",
      region: "AZ",
      language: "az",
      types: null,
      attributes: null,
      isOriginalTitle: false,
    } as BaseAkaUpdateDto;

    const mockedResult = {
      titleId: "tt4154796",
      ordering: 57,
      title: "Qisasçılar: Final",
      region: "AZ",
      language: "az",
      types: null,
      attributes: null,
      isOriginalTitle: false,
    } as AkasDocument;

    const spy = jest
      .spyOn(service, "updateAkasInTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.updateAkaByTconstAndOrdering(
      "tt4154796",
      57,
      updateAkaDto,
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", 57, updateAkaDto);
  });

  it("should throw a not-found exception when updating an aka entry that does not exist", async () => {
    const spy = jest
      .spyOn(service, "updateAkasInTitle")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.updateAkaByTconstAndOrdering("nonexistent", 999, {});
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No aka found for tconst=nonexistent and ordering=999`,
    );
  });

  it("should delete an aka entry by tconst and ordering", async () => {
    const mockedResult = {
      titleId: "tt4154796",
      ordering: 57,
      title: "Qisasçılar: Final",
      region: "AZ",
      language: "az",
      types: null,
      attributes: null,
      isOriginalTitle: false,
    } as AkasDocument;

    const spy = jest
      .spyOn(service, "removeAkasFromTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.deleteAkaByTconstAndOrdering(
      "tt4154796",
      57,
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt4154796", 57);
  });

  it("should throw a not-found exception when deleting an aka entry that does not exist", async () => {
    const spy = jest
      .spyOn(service, "removeAkasFromTitle")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.deleteAkaByTconstAndOrdering("nonexistent", 999);
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No aka found for tconst=nonexistent and ordering=999`,
    );
  });

  it("should return episodes by tconst", async () => {
    const mockedSeasons = [
      {
        season: 1,
        episodes: [
          {
            tconst: "tt0775431",
            episodeNumber: 1,
            titleType: "tvEpisode",
            primaryTitle: "Pilot",
            originalTitle: "Pilot",
            isAdult: false,
            startYear: 2007,
            endYear: null,
            runtimeMinutes: 23,
            genres: ["comedy", "romance"],
            imdbUrl: "https://www.imdb.com/title/tt0775431/?ref_=fn_al_tt_1",
          },
          {
            tconst: "tt1091289",
            episodeNumber: 2,
            titleType: "tvEpisode",
            primaryTitle: "The Big Bran Hypothesis",
            originalTitle: "The Big Bran Hypothesis",
            isAdult: false,
            startYear: 2007,
            endYear: null,
            runtimeMinutes: 21,
            genres: ["comedy", "romance"],
            imdbUrl: "https://www.imdb.com/title/tt1091289/?ref_=fn_al_tt_1",
          },
        ],
      },
      {
        season: 2,
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
            imdbUrl: "https://www.imdb.com/title/tt1256599/?ref_=fn_al_tt_1",
          },
        ],
      },
    ] as GetSeasonAggregation[];

    const spy = jest.spyOn(service, "getEpisodesByTconst").mockResolvedValue({
      _id: "someObjectId",
      tconst: "tt0775431",
      title: "The Big Bang Theory",
      titleType: "tvSeries",
      totalSeasons: 2,
      totalEpisodes: 3,
      seasons: mockedSeasons,
    });

    const result = await controller.getEpisodesByTconst("tt0775431");

    expect(result).toEqual({
      _id: "someObjectId",
      tconst: "tt0775431",
      title: "The Big Bang Theory",
      titleType: "tvSeries",
      totalSeasons: 2,
      totalEpisodes: 3,
      seasons: mockedSeasons,
    });

    expect(spy).toHaveBeenCalledWith("tt0775431");
  });

  it("should throw a not-found exception when getting episodes for a non-existent title", async () => {
    const spy = jest
      .spyOn(service, "getEpisodesByTconst")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.getEpisodesByTconst("nonexistent");
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No episodes found for tconst=nonexistent`,
    );
  });

  it("should create a new episode", async () => {
    const createEpisodeDto = {
      tconst: "tt6674736",
      seasonNumber: 12,
      episodeNumber: 24,
    } as BaseEpisodeCreateDto;

    const mockedResult = {
      tconst: "tt6674736",
      parentTconst: "tt0898266",
      seasonNumber: 12,
      episodeNumber: 24,
      _id: "68917787a1608e8091abc0a6",
    } as EpisodesDocument;

    const spy = jest
      .spyOn(service, "addEpisodeToTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.addEpisodeToTitle(
      "tt0898266",
      createEpisodeDto,
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt0898266", createEpisodeDto);
  });

  it("should return a single episode by tconst", async () => {
    const mockedResult = {
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
      imdbUrl: "https://www.imdb.com/title/tt6674736/?ref_=fn_al_tt_1",
    } as GetEpisodeAggregation;

    const spy = jest
      .spyOn(service, "getASingleEpisodeFromTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.getEpisodeByTconst(
      "tt0898266",
      "tt6674736",
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt0898266", "tt6674736");
  });

  it("should throw a not-found exception when getting a non-existent episode", async () => {
    const spy = jest
      .spyOn(service, "getASingleEpisodeFromTitle")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.getEpisodeByTconst("something", "nonexistent");
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No episode found for parentTconst=something and tconst=nonexistent`,
    );
  });

  it("should update an episode by tconst", async () => {
    const updateEpisodeDto = {
      episodeNumber: 24,
      seasonNumber: 12,
    } as BaseEpisodeUpdateDto;

    const mockedResult = {
      _id: "688d81340f3387b545db5108",
      tconst: "tt6674736",
      parentTconst: "tt0898266",
      seasonNumber: 12,
      episodeNumber: 24,
    } as EpisodesDocument;

    const spy = jest
      .spyOn(service, "updateEpisodeInTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.updateEpisodeByTconst(
      "tt0898266",
      "tt6674736",
      updateEpisodeDto,
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith(
      "tt0898266",
      "tt6674736",
      updateEpisodeDto,
    );
  });

  it("should throw a not-found exception when updating a non-existent episode", async () => {
    const spy = jest
      .spyOn(service, "updateEpisodeInTitle")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.updateEpisodeByTconst("something", "nonexistent", {
        episodeNumber: 1,
        seasonNumber: 1,
      });
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No episode found for parentTconst=something and tconst=nonexistent`,
    );
  });

  it("should delete an episode by tconst", async () => {
    const mockedResult = {
      _id: "688d81340f3387b545db5108",
      tconst: "tt6674736",
      parentTconst: "tt0898266",
      seasonNumber: 12,
      episodeNumber: 24,
    } as EpisodesDocument;

    const spy = jest
      .spyOn(service, "removeEpisodeFromTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.deleteEpisodeByTconst(
      "tt0898266",
      "tt6674736",
    );

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("tt0898266", "tt6674736");
  });

  it("should throw a not-found exception when deleting a non-existent episode", async () => {
    const spy = jest
      .spyOn(service, "removeEpisodeFromTitle")
      .mockResolvedValue(null);

    const throwErrorFn = async () => {
      await controller.deleteEpisodeByTconst("something", "nonexistent");
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      `No episode found for parentTconst=something and tconst=nonexistent`,
    );

    expect(spy).toHaveBeenCalledWith("something", "nonexistent");
  });
});
