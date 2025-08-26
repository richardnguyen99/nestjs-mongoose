/* istanbul ignore file */

import { ConflictException, NotFoundException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";

import { BasicsModel } from "src/basics/schema/basics.schema";
import {
  BaseEpisodeUpdateDto,
  EpisodeUpdateDto,
} from "../dto/episode-update.dto";

@Schema({
  versionKey: false,
  id: false,
  collection: "episodes",
  timestamps: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class EpisodesModel extends mongoose.Document {
  /**
   * alphanumeric identifier of episode
   *
   * @example "tt0583459" ("The One Where Monica Gets a Roommate" in Friends)
   */
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    index: true,
  })
  tconst: string;

  /**
   * alphanumeric identifier of the parent TV Series, referring to the original
   * title of the series
   *
   * @example "tt1234567" ("Friends" TV Series)
   */
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    index: true,
  })
  parentTconst: string;

  /**
   * season number the episode belongs to
   *
   * @example 1 (Season 1 of "Friends")
   */
  @Prop({
    type: mongoose.Schema.Types.Int32,
  })
  seasonNumber: number | null;

  /**
   * episode number of the tconst in the TV series
   *
   * @example 1 (Episode 1 of Season 1 of "Friends")
   */
  @Prop({
    type: mongoose.Schema.Types.Int32,
  })
  episodeNumber: number | null;
}

export const EpisodesSchema = SchemaFactory.createForClass(EpisodesModel);
export type EpisodesDocument = mongoose.HydratedDocument<EpisodesModel>;

EpisodesSchema.index({ tconst: 1, parentTconst: 1 }, { unique: true });

EpisodesSchema.pre("save", async function (next) {
  if (this.isNew) {
    const basicsModel = this.model<Model<BasicsModel>>("BasicsModel");

    const parentTconst = await basicsModel.findOne({
      tconst: this.parentTconst,
    });

    if (!parentTconst) {
      return next(
        new NotFoundException(
          `No title found for parentTconst=${this.parentTconst}`,
        ),
      );
    }

    const tconst = await basicsModel.findOne({
      tconst: this.tconst,
    });

    if (!tconst) {
      return next(
        new NotFoundException(
          `No episode title found for tconst=${this.tconst}`,
        ),
      );
    }

    const existingEpisode = await this.model<Model<EpisodesModel>>(
      "EpisodesModel",
    ).findOne({
      parentTconst: this.parentTconst,
      seasonNumber: this.seasonNumber,
      episodeNumber: this.episodeNumber,
    });

    if (
      existingEpisode &&
      (existingEpisode.seasonNumber !== null ||
        existingEpisode.episodeNumber !== null)
    ) {
      return next(
        new ConflictException(
          `Episode already exists for tconst=${this.tconst} and parentTconst=${this.parentTconst}`,
        ),
      );
    }
  }

  next();
});

EpisodesSchema.pre("findOneAndUpdate", async function (next) {
  const query = this.getFilter();
  const update = this.getUpdate() as BaseEpisodeUpdateDto;

  if (update.seasonNumber !== null || update.episodeNumber !== null) {
    const existingEpisode = await this.model.findOne({
      parentTconst: query.parentTconst,
      ...update,
    });

    if (existingEpisode) {
      return next(
        new ConflictException(
          `Episode with seasonNumber=${update.seasonNumber} and episodeNumber=${update.episodeNumber} already exists in title ${query.parentTconst}`,
        ),
      );
    }
  }

  next();
});
