import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { EpisodesDocument, EpisodesModel } from "./schema/episodes.schema";

@Injectable()
export class EpisodesService {
  private readonly logger = new Logger(EpisodesService.name);

  constructor(
    @InjectModel(EpisodesModel.name)
    private episodesModel: Model<EpisodesModel>,
  ) {
    this.episodesModel.syncIndexes().catch((error) => {
      console.error("Error syncing indexes for EpisodesModel", error);
      process.exit(1);
    });
  }

  async getSeasonsByTconst(tconst: string): Promise<EpisodesDocument[]> {
    let aggregation = this.episodesModel.aggregate().match({
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
        parentDetail: 1,
        episodes: {
          $sortArray: {
            input: "$episodes",
            sortBy: { episodeNumber: 1 },
          },
        },
      });

    return aggregation.exec();
  }

  async getEpisodeByTconst(
    parentTconst: string,
    tconst: string,
  ): Promise<EpisodesDocument | null> {
    return this.episodesModel
      .findOne({
        parentTconst,
        tconst,
      })
      .exec();
  }

  async createEpisode(
    episodeData: Partial<EpisodesDocument>,
  ): Promise<EpisodesDocument> {
    const episode = new this.episodesModel(episodeData);
    return episode.save();
  }

  async updateEpisode(
    parentTconst: string,
    tconst: string,
    episodeData: Partial<EpisodesDocument>,
  ): Promise<EpisodesDocument | null> {
    return this.episodesModel
      .findOneAndUpdate({ parentTconst, tconst }, episodeData, { new: true })
      .exec();
  }

  async deleteEpisode(
    parentTconst: string,
    tconst: string,
  ): Promise<EpisodesDocument | null> {
    return this.episodesModel.findOneAndDelete({ parentTconst, tconst }).exec();
  }
}
