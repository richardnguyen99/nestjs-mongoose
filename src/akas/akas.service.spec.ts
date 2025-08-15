import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";

import { AkasService } from "./akas.service";
import { AkasDocument, AkasModel } from "./schema/akas.schema";
import { AkaCreateDto, BaseAkaCreateDto } from "./dto/aka-create.dto";
import { AkaUpdateDto } from "./dto/aka-update.dto";

describe("AkasService", () => {
  let service: AkasService;
  let model: Model<AkasModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: getModelToken(AkasModel.name),
          useValue: Model,
        },
        AkasService,
      ],
    }).compile();

    service = module.get<AkasService>(AkasService);
    model = module.get<Model<AkasModel>>(getModelToken(AkasModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return all aka records with getAllAkas()", async () => {
    const mockedResult = [
      {
        _id: "object-id-1",
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
        _id: "object-id-2",
        titleId: "tt0583459",
        ordering: 1,
        title: "The One Where Monica Gets a Roommate",
        region: null,
        language: null,
        types: "original",
        attributes: null,
        isOriginalTitle: true,
      },
    ];

    const spy = jest.spyOn(model, "find").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);

    const result = await service.getAllAkas();

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should return aka records based on titleId with getAkasByTitleId()", async () => {
    const mockedResult = {
      totalCount: 2,
      results: [
        {
          _id: "object-id-1",
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
          _id: "object-id-2",
          titleId: "tt0583459",
          ordering: 1,
          title: "The One Where Monica Gets a Roommate",
          region: null,
          language: null,
          types: "original",
          attributes: null,
          isOriginalTitle: true,
        },
      ],
      totalPages: 1,
      currentPage: 1,
      perPage: 10,
    };

    const aggregationChain = {
      match: jest.fn().mockReturnThis(),
      facet: jest.fn().mockReturnThis(),
      addFields: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedResult),
    };

    const spy = jest
      .spyOn(model, "aggregate")
      .mockReturnValue(aggregationChain as any);

    const result = await service.getAkasByTitleId("tt0583459", {
      page: 1,
      limit: 10,
    });

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should return an aka record based on id with getAkaById()", async () => {
    const mockedResult = {
      _id: "object-id",
      titleId: "tt0583459",
      ordering: 1,
      title: "The One Where Monica Gets a Roommate",
      region: null,
      language: null,
      types: "original",
      attributes: null,
      isOriginalTitle: true,
    };

    const spy = jest.spyOn(model, "findById").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);

    const result = await service.getAkaById("object-id");

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("object-id");
  });

  it("should create a new aka record with createAka()", async () => {
    const createAkaDto = {
      titleId: "tt0583459",
      ordering: 1,
      title: "The One Where Monica Gets a Roommate",
      region: null,
      language: null,
      types: null,
      attributes: null,
      isOriginalTitle: true,
    } as AkaCreateDto;

    const akaModelInstance = {
      ...createAkaDto,
      save: jest.fn().mockResolvedValue({ ...createAkaDto }),
    };

    const spy = jest
      .spyOn(service as any, "akasModel")
      .mockImplementation(() => akaModelInstance);

    const result = await service.createAka(createAkaDto);

    expect(result).toEqual({
      titleId: "tt0583459",
      ordering: 1,
      title: "The One Where Monica Gets a Roommate",
      region: null,
      language: null,
      types: null,
      attributes: null,
      isOriginalTitle: true,
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should update an aka record with updateAka()", async () => {
    const updateAkaDto = {
      titleId: "tt0583459",
      ordering: 1,
      title: "The One Where Monica Gets a Roommate",
      region: null,
      language: "en",
      types: null,
      attributes: null,
      isOriginalTitle: true,
    } as AkaUpdateDto;

    const mockedResult = {
      _id: "some-object-id",
      titleId: "tt0583459",
      ordering: 1,
      title: "The One Where Monica Gets a Roommate",
      region: null,
      language: "en",
      types: "original",
      attributes: null,
      isOriginalTitle: true,
    } as AkasDocument;

    const spy = jest.spyOn(model, "findOneAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);

    const result = await service.updateAka(updateAkaDto);

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      { titleId: "tt0583459", ordering: 1 },
      {
        title: "The One Where Monica Gets a Roommate",
        region: null,
        language: "en",
        types: null,
        attributes: null,
        isOriginalTitle: true,
      },
      { new: true },
    );
  });

  it("should update an aka record providing types and attributes fields with updateAka()", async () => {
    const updateAkaDto = {
      titleId: "tt0583459",
      ordering: 1,
      title: "The One Where Monica Gets a Roommate",
      region: null,
      language: "en",
      types: ["original"],
      attributes: ["short title", "teaser"],
      isOriginalTitle: true,
    } as AkaUpdateDto;

    const mockedResult = {
      _id: "some-object-id",
      titleId: "tt0583459",
      ordering: 1,
      title: "The One Where Monica Gets a Roommate",
      region: null,
      language: "en",
      types: "original",
      attributes: "short title,teaser",
      isOriginalTitle: true,
    } as AkasDocument;

    const spy = jest.spyOn(model, "findOneAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);

    const result = await service.updateAka(updateAkaDto);

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      { titleId: "tt0583459", ordering: 1 },
      {
        title: "The One Where Monica Gets a Roommate",
        region: null,
        language: "en",
        types: "original",
        attributes: "short title,teaser",
        isOriginalTitle: true,
      },
      { new: true },
    );
  });

  it("should delete an aka record with deleteAka()", async () => {
    const mockedResult = {
      _id: "some-object-id",
      titleId: "tt0583459",
      ordering: 1,
      title: "The One Where Monica Gets a Roommate",
      region: null,
      language: null,
      types: "original",
      attributes: null,
      isOriginalTitle: true,
    };

    const spy = jest.spyOn(model, "findOneAndDelete").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);

    const result = await service.deleteAka("tt0583459", 1);

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ titleId: "tt0583459", ordering: 1 });
  });

  it("should return aka records with query", async () => {
    const mockedResults = [
      {
        _id: "object-id-1",
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
        _id: "object-id-2",
        titleId: "tt0583459",
        ordering: 2,
        title: "The One Where Monica Gets a Roommate",
        region: "US",
        language: null,
        types: null,
        attributes: null,
        isOriginalTitle: false,
      },
    ];

    const aggregationChain = {
      match: jest.fn().mockReturnThis(),
      facet: jest.fn().mockReturnThis(),
      addFields: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedResults),
    };

    const spy = jest
      .spyOn(model, "aggregate")
      .mockReturnValue(aggregationChain as any);

    const result = await service.getAkasByTitleId("tt0583459", {
      page: 1,
      limit: 10,
      attributes: ["short title", "teaser"],
      types: ["imdbDisplay", "poster"],
      language: "en",
      region: "US",
    });

    expect(result).toEqual(mockedResults);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(aggregationChain.match).toHaveBeenCalledWith({
      region: "US",
    });
    expect(aggregationChain.match).toHaveBeenCalledWith({
      language: "en",
    });
    expect(aggregationChain.match).toHaveBeenCalledWith({
      types: { $in: ["imdbDisplay", "poster"] },
    });
    expect(aggregationChain.match).toHaveBeenCalledWith({
      attributes: { $in: ["short title", "teaser"] },
    });
  });
});
