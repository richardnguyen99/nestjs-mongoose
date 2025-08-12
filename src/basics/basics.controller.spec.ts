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
    addCrewToTitle: jest.fn(),
    updateCrewRecord: jest.fn(),
    updateCrewInTitle: jest.fn(),
    removeCrewFromTitle: jest.fn(),
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
        isAdult: 0,
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
        isAdult: 0,
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
      isAdult: 0,
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

  it("should update a basic entry by tconst", async () => {
    const updateBasicDto = {} as BasicUpdateDto;

    const mockedResult = {
      tconst: "tt4154796",
      titleType: "movie",
      primaryTitle: "Avengers: Endgame",
      originalTitle: "Avengers: Endgame",
      isAdult: 0,
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

  it("should delete a basic entry by tconst", async () => {
    const mockedResult = {
      tconst: "tt4154796",
      titleType: "movie",
      primaryTitle: "Avengers: Endgame",
      originalTitle: "Avengers: Endgame",
      isAdult: 0,
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

  it("should create a new crew", async () => {
    const createCrewDto = {
      tconst: "tt4154796",
      nconst: "nm1411347",
      category: "writer",
      job: "Mantis created by",
      characters: [],
    } as PrincipalCreateDto;

    const mockedResult = {
      _id: "someObjectId",
      tconst: "tt4154796",
      nconst: "nm1411347",
      category: "writer",
      job: "Mantis created by",
      ordering: 40,
      characters: [] as string[],
    } as PrincipalsDocument;

    const spy = jest
      .spyOn(service, "addCrewToTitle")
      .mockResolvedValue(mockedResult);

    const result = await controller.addCrewsToTitle("tt4154796", createCrewDto);
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
});
