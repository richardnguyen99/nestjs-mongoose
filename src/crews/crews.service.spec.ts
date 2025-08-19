import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CrewsService } from "./crews.service";
import { CrewsDocument, CrewsModel } from "./schema/crews.schema";
import { CrewsAggregationInterface } from "./interfaces/crews-interface.interface";
import { CrewCreateDto } from "./dto/crew-create.dto";

describe("CrewsService", () => {
  let service: CrewsService;
  let model: Model<CrewsModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: getModelToken(CrewsModel.name),
          useValue: Model,
        },
        CrewsService,
      ],
    }).compile();

    service = module.get<CrewsService>(CrewsService);
    model = module.get<Model<CrewsModel>>(getModelToken(CrewsModel.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
  });

  it("should return all crews records with findAll()", async () => {
    const mockedResults = [
      {
        _id: "object-id-1",
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
      },
      {
        _id: "object-id-2",
        tconst: "tt4154756",
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
      },
    ] as CrewsDocument[];

    const spy = jest.spyOn(model, "find").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResults),
    } as any);
    const result = await service.findAll();

    expect(result).toEqual([
      {
        _id: "object-id-1",
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
      },
      {
        _id: "object-id-2",
        tconst: "tt4154756",
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
      },
    ]);
  });

  it("should return an aggregated crew object with findByTconst()", async () => {
    const mockedResult = {
      totalCount: 2,
      currentPage: 1,
      perPage: 10,
      totalPages: 1,
      results: [
        {
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
        },
        {
          tconst: "tt4154756",
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
        },
      ],
    } as CrewsAggregationInterface;

    const aggregationChain = {
      match: jest.fn().mockReturnThis(),
      facet: jest.fn().mockReturnThis(),
      addFields: jest.fn().mockReturnThis(),
      lookup: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockedResult]),
    };

    const spy = jest
      .spyOn(model, "aggregate")
      .mockReturnValue(aggregationChain as any);
    const result = await service.findByTconst("tt4154796", {
      limit: 10,
      page: 1,
      lean: false,
    });

    expect(result).toEqual([
      {
        totalCount: 2,
        currentPage: 1,
        perPage: 10,
        totalPages: 1,
        results: [
          {
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
          },
          {
            tconst: "tt4154756",
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
          },
        ],
      },
    ]);
  });

  it("should return a crew record with findById()", async () => {
    const mockedResult = {
      _id: "object-id-1",
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

    const spy = jest.spyOn(model, "findById").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);
    const result = await service.findById("object-id-1");

    expect(result).toEqual({
      _id: "object-id-1",
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
    });
    expect(spy).toHaveBeenCalledWith("object-id-1");
  });

  it("should return create a director crew with addDirector()", async () => {
    const createCrewDto = {
      tconst: "tt4154756",
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
    } as CrewCreateDto;

    const mockCrewModelInstance = {
      ...createCrewDto,
      save: jest.fn().mockResolvedValue(createCrewDto),
    };

    const spy = jest
      .spyOn(service as any, "crewsModel")
      .mockImplementation(() => mockCrewModelInstance);
    const result = await service.create(createCrewDto);

    expect(result).toEqual(createCrewDto);
  });

  it("should add a director crew record with addDirector()", async () => {
    const mockResult = {
      _id: "object-id-1",
      tconst: "tt4154756",
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

    const spy = jest.spyOn(model, "findOneAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockResult),
    } as any);
    const result = await service.addDirector("tt4154756", "nm0751577");

    expect(result).toEqual({
      _id: "object-id-1",
      tconst: "tt4154756",
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
    });
    expect(spy).toHaveBeenCalledWith(
      {
        tconst: "tt4154756",
      },
      {
        $addToSet: { directors: "nm0751577" },
      },
      {
        new: true,
      },
    );
  });

  it("should add a writer crew record with addWriter()", async () => {
    const mockedResult = {
      _id: "object-id-1",
      tconst: "tt4154756",
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

    const spy = jest.spyOn(model, "findOneAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);
    const result = await service.addWriter("tt4154756", "nm1321655");

    expect(result).toEqual({
      _id: "object-id-1",
      tconst: "tt4154756",
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
    });
    expect(spy).toHaveBeenCalledWith(
      {
        tconst: "tt4154756",
      },
      {
        $addToSet: { writers: "nm1321655" },
      },
      {
        new: true,
      },
    );
  });

  it("should update a crew record with update()", async () => {
    const mockedResult = {
      _id: "object-id-1",
      tconst: "tt4154756",
      directors: ["nm0751577"],
      writers: [
        "nm1321655",
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

    const spy = jest.spyOn(model, "findOneAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);
    const result = await service.update("tt4154756", {
      directors: {
        add: ["nm0751577"],
        remove: ["nm0751648"],
      },
      writers: {
        add: ["nm1321655"],
        remove: ["nm1321656"],
      },
    });

    expect(result).toEqual({
      _id: "object-id-1",
      tconst: "tt4154756",
      directors: ["nm0751577"],
      writers: [
        "nm1321655",
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
    });
    expect(spy).toHaveBeenCalledWith(
      { tconst: "tt4154756" },
      {
        $addToSet: {
          directors: { $each: ["nm0751577"] },
          writers: { $each: ["nm1321655"] },
        },
        $pull: {
          directors: { $in: ["nm0751648"] },
          writers: { $in: ["nm1321656"] },
        },
      },
      undefined,
    );
  });

  it("should remove director records with removeDirector()", async () => {
    const mockedResult = {
      _id: "object-id-1",
      tconst: "tt4154756",
      directors: ["nm0751648"],
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

    const spy = jest.spyOn(model, "findOneAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);
    const result = await service.removeDirector("tt4154756", "nm0751577");

    expect(result).toEqual({
      _id: "object-id-1",
      tconst: "tt4154756",
      directors: ["nm0751648"],
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
    });
    expect(spy).toHaveBeenCalledWith(
      {
        tconst: "tt4154756",
      },
      {
        $pull: { directors: "nm0751577" },
      },
    );
  });

  it("should remove writer records with removeWriter()", async () => {
    const mockedResult = {
      _id: "object-id-1",
      tconst: "tt4154796",
      directors: ["nm0751577", "nm0751648"],
      writers: [
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

    const spy = jest.spyOn(model, "findOneAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);
    const result = await service.removeWriter("tt4154796", "nm1321655");

    expect(result).toEqual({
      _id: "object-id-1",
      tconst: "tt4154796",
      directors: ["nm0751577", "nm0751648"],
      writers: [
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
    });
    expect(spy).toHaveBeenCalledWith(
      {
        tconst: "tt4154796",
      },
      {
        $pull: { writers: "nm1321655" },
      },
    );
  });
});
