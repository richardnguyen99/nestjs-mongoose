import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { EpisodesService } from "./episodes.service";
import { EpisodesDocument, EpisodesModel } from "./schema/episodes.schema";
import { GetSeasonAggregation } from "./interfaces/get-season-aggregation.interface";
import { GetEpisodeAggregation } from "./interfaces/get-episode-aggregation.interface";
import { EpisodeCreateDto } from "./dto/episode-create.dto";
import { BaseEpisodeUpdateDto } from "./dto/episode-update.dto";

describe("EpisodesService", () => {
  let service: EpisodesService;
  let model: Model<EpisodesModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: getModelToken(EpisodesModel.name),
          useValue: Model,
        },
        EpisodesService,
      ],
    }).compile();

    service = module.get<EpisodesService>(EpisodesService);
    model = module.get<Model<EpisodesModel>>(getModelToken(EpisodesModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
  });

  it("should return episode records with getSeasonsByTconst()", async () => {
    const mockedResult = [
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
    ] as GetSeasonAggregation[];

    const mockAggregationChain = {
      match: jest.fn().mockReturnThis(),
      lookup: jest.fn().mockReturnThis(),
      unwind: jest.fn().mockReturnThis(),
      group: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedResult),
    };

    const spy = jest
      .spyOn(model, "aggregate")
      .mockReturnValue(mockAggregationChain as any);

    const result = await service.getSeasonsByTconst("tt0775431");

    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(mockedResult);
  });

  it("should return an episode record with getEpisodeByTconst()", async () => {
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

    const aggregationChain = {
      match: jest.fn().mockReturnThis(),
      lookup: jest.fn().mockReturnThis(),
      unwind: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockedResult]),
    };

    const spy = jest
      .spyOn(model, "aggregate")
      .mockReturnValue(aggregationChain as any);
    const result = await service.getEpisodeByTconst("tt0898266", "tt6674736");

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
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
    });
  });

  it("should create a new episode record with createEpisode()", async () => {
    const mockedResult = {
      tconst: "tt6674736",
      parentTconst: "tt0898266",
      seasonNumber: 12,
      episodeNumber: 24,
      _id: "object-id",
    } as EpisodesDocument;

    const createEpisodeDto = {
      tconst: "tt6674736",
      parentTconst: "tt0898266",
      seasonNumber: 12,
      episodeNumber: 24,
    } as EpisodeCreateDto;

    const spy = jest
      .spyOn(service as any, "episodesModel")
      .mockImplementation(() => ({
        ...createEpisodeDto,
        save: jest.fn().mockResolvedValue(mockedResult),
      }));

    const result = await service.createEpisode(createEpisodeDto);

    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(mockedResult);
  });

  it("should update an episode record with updateEpisode()", async () => {
    const mockedResult = {
      tconst: "tt6674736",
      parentTconst: "tt0898266",
      seasonNumber: 12,
      episodeNumber: 24,
      _id: "object-id",
    } as EpisodesDocument;

    const updateEpisodeDto = {
      episodeNumber: 24,
      seasonNumber: 12,
    } as BaseEpisodeUpdateDto;

    const spy = jest.spyOn(model, "findOneAndUpdate").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);
    const result = await service.updateEpisode(
      "tt6674736",
      "tt",
      updateEpisodeDto,
    );

    expect(result).toEqual({
      tconst: "tt6674736",
      parentTconst: "tt0898266",
      seasonNumber: 12,
      episodeNumber: 24,
      _id: "object-id",
    });
    expect(spy).toHaveBeenCalledWith(
      { parentTconst: "tt6674736", tconst: "tt" },
      {
        episodeNumber: 24,
        seasonNumber: 12,
      },
      { new: true },
    );
  });

  it("should delete an episode record with deleteEpisode()", async () => {
    const mockedResult = {
      tconst: "tt6674736",
      parentTconst: "tt0898266",
      seasonNumber: 12,
      episodeNumber: 24,
      _id: "object-id",
    } as EpisodesDocument;

    const spy = jest.spyOn(model, "findOneAndDelete").mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedResult),
    } as any);
    const result = await service.deleteEpisode("tt6674736", "tt0898266");

    expect(result).toEqual(mockedResult);
    expect(spy).toHaveBeenCalledWith({
      parentTconst: "tt6674736",
      tconst: "tt0898266",
    });
  });
});
