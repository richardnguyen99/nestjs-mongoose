import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

import { BasicsController } from "./basics.controller";
import { BasicsService } from "./basics.service";
import { BasicCreateDto } from "./dto/basic-create.dto";
import { BasicsDocument } from "./schema/basics.schema";
import { BasicSearchDto } from "./dto/basic-search.dto";
import { BasicUpdateDto } from "./dto/basic-update.dto";

describe("BasicsController", () => {
  let controller: BasicsController;
  let service: BasicsService;

  const mockBasicsService: Partial<BasicsService> = {
    createBasic: jest.fn(),
    searchByTitle: jest.fn(),
    findByTconst: jest.fn(),
    updateByTconst: jest.fn(),
    deleteByTconst: jest.fn(),
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
});
