import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NotFoundException } from "@nestjs/common";

import { NamesController } from "./names.controller";
import { NamesService } from "./names.service";
import { NamesDocument, NamesModel } from "./schema/names.schema";
import { NameCreateDto } from "./dto/name-create.dto";
import { NameUpdateDto } from "./dto/name-update.dto";

describe("NamesController", () => {
  let controller: NamesController;
  let service: NamesService;

  const mockNameServiceInstance: Partial<NamesService> = {
    findById: jest.fn(),
    findByNconst: jest.fn(),
    create: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    deleteByNconst: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [NamesController],
      providers: [
        {
          provide: getModelToken(NamesModel.name),
          useValue: Model,
        },
        {
          provide: NamesService,
          useValue: mockNameServiceInstance,
        },
      ],
    }).compile();

    controller = module.get<NamesController>(NamesController);
    service = module.get<NamesService>(NamesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it("should return name records with getNames()", async () => {
    const result = await controller.getNames();

    expect(result).toEqual([]);
  });

  it("should create a name record with createName()", async () => {
    const mockedResult = {
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NamesDocument;

    const createNameDto = {
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NameCreateDto;

    const spy = jest.spyOn(service, "create").mockResolvedValue(mockedResult);
    const result = await controller.createName(createNameDto);

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith(createNameDto);
  });

  it("should return a name record with getByNconst()", async () => {
    const mockedResult = {
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NamesDocument;

    const spy = jest
      .spyOn(service, "findByNconst")
      .mockResolvedValue(mockedResult);
    const result = await controller.getByNconst("nm0000375");

    expect(result).toEqual({
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    });
    expect(spy).toHaveBeenCalledWith("nm0000375");
  });

  it("should throw a not-found exception when name is not found with getByNconst()", async () => {
    const spy = jest.spyOn(service, "findByNconst").mockResolvedValue(null);
    const throwErrorFn = async () => {
      await controller.getByNconst("nm0000375");
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      "Name with nconst=nm0000375 not found",
    );
  });

  it("should return name records with searchByName()", async () => {
    const mockedResults = [
      {
        _id: "object-id-1",
        nconst: "nm3699903",
        primaryName: "Robert Roberts",
        birthYear: 1984,
        deathYear: null,
        primaryProfession: ["actor", "camera_department", "casting_department"],
        knownForTitles: ["tt1544563"],
      },
      {
        _id: "object-id-2",
        nconst: "nm0000375",
        primaryName: "Robert Downey Jr.",
        birthYear: 1965,
        deathYear: null,
        primaryProfession: ["actor", "producer", "writer"],
        knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
      },
    ] as NamesDocument[];

    const spy = jest.spyOn(service, "search").mockResolvedValue(mockedResults);
    const result = await controller.searchByName({
      q: "robert downey",
      limit: 1,
      page: 2,
    });

    expect(result).toEqual([
      {
        _id: "object-id-1",
        nconst: "nm3699903",
        primaryName: "Robert Roberts",
        birthYear: 1984,
        deathYear: null,
        primaryProfession: ["actor", "camera_department", "casting_department"],
        knownForTitles: ["tt1544563"],
      },
      {
        _id: "object-id-2",
        nconst: "nm0000375",
        primaryName: "Robert Downey Jr.",
        birthYear: 1965,
        deathYear: null,
        primaryProfession: ["actor", "producer", "writer"],
        knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
      },
    ]);
    expect(spy).toHaveBeenCalledWith("robert downey", {
      limit: 1,
      page: 2,
    });
  });

  it("should update a name record with updateByNconst()", async () => {
    const updateNameDto = {
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NameUpdateDto;

    const mockedResult = {
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NamesDocument;

    const spy = jest.spyOn(service, "update").mockResolvedValue(mockedResult);
    const result = await controller.updateByNconst("nm0000375", updateNameDto);

    expect(result).toEqual({
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    });
    expect(spy).toHaveBeenCalledWith("nm0000375", updateNameDto);
  });

  it("should throw a not-found exception when updating a name that does not exist with updateByNconst()", async () => {
    const spy = jest.spyOn(service, "update").mockResolvedValue(null);
    const throwErrorFn = async () => {
      await controller.updateByNconst("nm0000375", {
        birthYear: 1965,
        deathYear: null,
      });
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      "Name with nconst=nm0000375 not found",
    );
  });

  it("should delete a name record with deleteByNconst()", async () => {
    const mockedResult = {
      _id: "some-object-id",
      nconst: "nm0000375",
      primaryName: "Robert Downey Jr.",
      birthYear: 1965,
      deathYear: null,
      primaryProfession: ["actor", "producer", "writer"],
      knownForTitles: ["tt0371746", "tt1300854", "tt0988045", "tt4154796"],
    } as NamesDocument;

    const spy = jest
      .spyOn(service, "deleteByNconst")
      .mockResolvedValue(mockedResult);
    const result = await controller.deleteByNconst("nm0000375");

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith("nm0000375");
  });

  it("should throw a not-found exception when deleting a name that does not exist with deleteByNconst()", async () => {
    const spy = jest.spyOn(service, "deleteByNconst").mockResolvedValue(null);
    const throwErrorFn = async () => {
      await controller.deleteByNconst("something");
    };

    await expect(throwErrorFn).rejects.toThrow(NotFoundException);
    await expect(throwErrorFn).rejects.toThrow(
      "Name with nconst=something not found",
    );
  });
});
