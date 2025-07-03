import { Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema({
  versionKey: false, // Disable the __v field
  id: false, // Disable the _id field
  collection: "basics",
  timestamps: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class BasicsModel {
  /**
   * alphanumeric unique identifier of the title
   */
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    index: true,
    unique: true,
  })
  tconst: string;

  /**
   * the type/format of the title (e.g. movie, short, tvseries, tvepisode,
   * video, etc)
   */
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  titleType: string;

  /**
   * the more popular title / the title used by the filmmakers on promotional
   * materials at the point of release
   *
   * primaryTitle can be empty for some titles
   */
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,

    // Required for fast and efficient text search on primaryTitle
    index: {
      name: "text",
      weights: {
        primaryTitle: 1,
      },
    },
  })
  primaryTitle: string;

  /**
   * original title, in the original language

   * originalTitle can be empty for some titles
   */
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  originalTitle: string;

  /**
   * 0: non-adult title; 1: adult title
   */
  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  isAdult: number;

  /**
   * represents the release year of a title. In the case of TV Series, it is
   * the series start year
   */
  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  startYear: number;

  /**
   * TV Series end year. null for all other title types
   */
  @Prop({ type: mongoose.Schema.Types.Number })
  endYear: number | null;

  /**
   * primary runtime of the title, in minutes
   */
  @Prop({ type: mongoose.Schema.Types.Number })
  runtimeMinutes: number | null;

  /**
   * A comma-concatenated string that includes up to three genres associated
   * with the title
   *
   * For example: "Action,Adventure,Sci-Fi"
   */
  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
  })
  genres: string;

  /**
   * An array of genres derived from the genres string.
   *
   * This is a virtual field that is computed during the serialization process,
   * not an actual field in the database.
   */
  @Virtual({
    options: {
      toJSON: {
        virtuals: true,
      },
      toObject: {
        virtuals: true,
      },
    },

    get: function (this: BasicsModel) {
      if (this.genres.length === 0) {
        return [];
      }

      return this.genres.split(",");
    },
  })
  genreArrays: string[];
}

export const BasicsSchema = SchemaFactory.createForClass(BasicsModel);
export type BasicsDocument = mongoose.HydratedDocument<BasicsModel>;
