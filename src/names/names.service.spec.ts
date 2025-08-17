import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigModule } from "@nestjs/config";

import { NamesService } from "./names.service";
import { NamesDocument, NamesModel } from "./schema/names.schema";
import { NameCreateDto } from "./dto/name-create.dto";
import { NameUpdateDto } from "./dto/name-update.dto";
import { exec } from "child_process";
import { NameSearchDto } from "./dto/name-search.dto";

describe("NamesService", () => {
  let service: NamesService;
  let model: Model<NamesModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],

      providers: [
        {
          provide: getModelToken(NamesModel.name),
          useValue: Model,
        },
        NamesService,
      ],
    }).compile();

    service = module.get<NamesService>(NamesService);
    model = module.get<Model<NamesModel>>(getModelToken(NamesModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
  });

  it("should return a name record by id with findById()", async () => {
    const mockedResult = {
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NamesDocument;

    const spy = jest.spyOn(model, "findById").mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);

    const result = await service.findById("some-object-id");

    expect(result).toEqual({
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    });
    expect(spy).toHaveBeenCalledWith("some-object-id");
  });

  it("should return a name record by nconst with findByNconst()", async () => {
    const mockedResult = {
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NamesDocument;

    const spy = jest.spyOn(model, "findOne").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);

    const result = await service.findByNconst("nm0000375");

    expect(result).toEqual({
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    });
    expect(spy).toHaveBeenCalledWith({
      nconst: "nm0000375",
    });
  });

  it("should create a new name record with create()", async () => {
    const createNameDto = {
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NameCreateDto;

    const mockedResult = {
      id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NamesDocument;

    const modelInstance = {
      ...createNameDto,
      save: jest.fn().mockResolvedValue(mockedResult),
    };

    const spy = jest
      .spyOn(service as any, "namesModel")
      .mockImplementation(() => modelInstance);

    const result = await service.create(createNameDto);

    expect(result).toEqual({
      id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should update a name record by nconst with update()", async () => {
    const updateNameDto = {
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NameUpdateDto;

    const mockedResult = {
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NamesDocument;

    const spy = jest.spyOn(model, "findOneAndUpdate").mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);

    const result = await service.update("nm0000375", updateNameDto);

    expect(result).toEqual({
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    });
    expect(spy).toHaveBeenCalledWith(
      {
        nconst: "nm0000375",
      },
      {
        $set: updateNameDto,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  });

  it("should search name records with searching names and options", async () => {
    const mockedResult = [
      {
        _id: "686342335653a09119c7e8ea",
        nconst: "nm7786681",
        primaryName: "Scarlett Rose",
        birthYear: 1991,
        deathYear: null,
        primaryProfession: ["actress"],
        knownForTitles: ["tt4014320", "tt5266398", "tt4143774", "tt8146760"],
      },
      {
        _id: "686342175653a09119981100",
        nconst: "nm3900523",
        primaryName: "Scarlett Bruns",
        birthYear: 1988,
        deathYear: null,
        primaryProfession: ["talent_agent", "actress", "casting_director"],
        knownForTitles: ["tt0460681", "tt2735360", "tt1980132"],
      },
    ];

    const searchOptions = {
      q: "scarlett",
      page: 1,
      limit: 10,
      filter: {
        alive: true,
        appearInTitles: ["tt0114709", "tt29355505"],
        from: 1995,
        profession: ["actor", "producer"],
      },
      sort: {
        birthYear: -1,
        mostAppearance: 1,
      },
    } as NameSearchDto;

    const findChain = {
      where: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      ne: jest.fn().mockReturnThis(),
      equals: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedResult),
    };

    const spy = jest.spyOn(model, "find").mockReturnValue(findChain as any);

    const result = await service.search("scarlett", {
      page: searchOptions.page,
      limit: searchOptions.limit,
      filter: searchOptions.filter,
      sort: searchOptions.sort,
    });

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith(
      { $text: { $search: "scarlett" } },
      { score: { $meta: "textScore" } },
    );

    const result2 = await service.search("scarlett", {
      page: searchOptions.page,
      limit: searchOptions.limit,
      filter: {
        ...searchOptions.filter,
        alive: false,
      },
      sort: undefined,
    });

    expect(result2).toEqual(mockedResult);

    const result3 = await service.search("scarlett", {
      page: searchOptions.page,
      limit: searchOptions.limit,
      filter: {
        ...searchOptions.filter,
        profession: "actress",
      },
    });

    expect(result3).toEqual(mockedResult);

    const result4 = await service.search("scarlett", {
      page: searchOptions.page,
      limit: searchOptions.limit,
      filter: {
        ...searchOptions.filter,
        appearInTitles: "tt0114709",
      },
    });
  });

  it("should delete a name record by nconst with deleteByNconst()", async () => {
    const mockedResult = {
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NamesDocument;

    const spy = jest.spyOn(model, "findOneAndDelete").mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);

    const result = await service.deleteByNconst("nm0000375");

    expect(result).toEqual({
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    });
    expect(spy).toHaveBeenCalledWith({
      nconst: "nm0000375",
    });
  });
});
