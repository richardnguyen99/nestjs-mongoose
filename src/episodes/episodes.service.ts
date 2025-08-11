import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { EpisodesDocument, EpisodesModel } from "./schema/episodes.schema";
import { EpisodeCreateDto } from "./dto/episode-create.dto";
import { EpisodeUpdateDto } from "./dto/episode-update.dto";
import { ConfigService } from "@nestjs/config";
import { GetSeasonAggregation } from "./interfaces/get-season-aggregation.interface";

@Injectable()
export class EpisodesService {
  private readonly logger = new Logger(EpisodesService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(EpisodesModel.name)
    private episodesModel: Model<EpisodesModel>,
  ) {
    if (this.configService.get<string>("NODE_ENV") === "development") {
      // Ensure indexes are created
      this.episodesModel.ensureIndexes().catch((error) => {
        console.error("Error creating indexes for EpisodesModel:", error);

        process.exit(1);
      });
    }
  }

  async getSeasonsByTconst(tconst: string) {
    let aggregation = this.episodesModel
      .aggregate<GetSeasonAggregation>()
      .match({
        parentTconst: tconst,
      });

    aggregation = aggregation
      .lookup({
        from: "basics",
        localField: "tconst",
        foreignField: "tconst",
        as: "episodeDetail",
        pipeline: [
          {
            $addFields: {
              imdbUrl: {
                $concat: [
                  "https://www.imdb.com/title/",
                  "$tconst",
                  "/?ref_=fn_al_tt_1",
                ],
              },
            },
          },
        ],
      })
      .unwind("$episodeDetail")
      .group({
        _id: {
          season: "$seasonNumber",
          parentTconst: "$parentTconst",
        },
        episodes: {
          $push: {
            tconst: "$tconst",
            episodeNumber: "$episodeNumber",
            titleType: "$episodeDetail.titleType",
            primaryTitle: "$episodeDetail.primaryTitle",
            originalTitle: "$episodeDetail.originalTitle",
            isAdult: "$episodeDetail.isAdult",
            startYear: "$episodeDetail.startYear",
            endYear: "$episodeDetail.endYear",
            runtimeMinutes: "$episodeDetail.runtimeMinutes",
            genres: "$episodeDetail.genres",
            imdbUrl: "$episodeDetail.imdbUrl",
          },
        },
      })
      .sort({ _id: 1 })
      .project({
        _id: 0,
        season: "$_id.season",
        episodes: {
          $sortArray: {
            input: "$episodes",
            sortBy: { episodeNumber: 1 },
          },
        },
      });

    return aggregation.exec();
  }

  async getEpisodeByTconst(parentTconst: string, tconst: string) {
    return this.episodesModel
      .aggregate()
      .match({
        parentTconst,
        tconst,
      })
      .lookup({
        from: "basics",
        localField: "tconst",
        foreignField: "tconst",
        as: "episodeDetail",
        pipeline: [
          {
            $addFields: {
              imdbUrl: {
                $concat: [
                  "https://www.imdb.com/title/",
                  "$tconst",
                  "/?ref_=fn_al_tt_1",
                ],
              },
            },
          },
        ],
      })
      .unwind("$episodeDetail")
      .project({
        _id: 0,
        tconst: 1,
        parentTconst: 1,
        seasonNumber: 1,
        episodeNumber: 1,
        titleType: "$episodeDetail.titleType",
        primaryTitle: "$episodeDetail.primaryTitle",
        originalTitle: "$episodeDetail.originalTitle",
        isAdult: "$episodeDetail.isAdult",
        startYear: "$episodeDetail.startYear",
        endYear: "$episodeDetail.endYear",
        runtimeMinutes: "$episodeDetail.runtimeMinutes",
        genres: "$episodeDetail.genres",
        imdbUrl: "$episodeDetail.imdbUrl",
      })
      .exec();
  }

  async createEpisode(
    episodeData: EpisodeCreateDto,
  ): Promise<EpisodesDocument> {
    const episode = new this.episodesModel(episodeData);
    episode.isNew = true;

    return episode.save();
  }

  async updateEpisode(
    parentTconst: string,
    tconst: string,
    episodeData: EpisodeUpdateDto,
  ): Promise<EpisodesDocument | null> {
    return this.episodesModel
      .findOneAndUpdate(
        { parentTconst, tconst },
        {
          episodeNumber: episodeData.episodeNumber,
          seasonNumber: episodeData.seasonNumber,
        },
        { new: true },
      )
      .exec();
  }

  async deleteEpisode(
    parentTconst: string,
    tconst: string,
  ): Promise<EpisodesDocument | null> {
    return this.episodesModel.findOneAndDelete({ parentTconst, tconst }).exec();
  }
}
