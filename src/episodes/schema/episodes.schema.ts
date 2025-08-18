/* istanbul ignore file */

import { NotFoundException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";

import { BasicsModel } from "src/basics/schema/basics.schema";

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
      return next(new NotFoundException("Parent TV Series not found"));
    }

    const tconst = await basicsModel.findOne({
      tconst: this.tconst,
    });

    if (!tconst) {
      return next(new NotFoundException("Episode not found"));
    }
  }

  next();
});
