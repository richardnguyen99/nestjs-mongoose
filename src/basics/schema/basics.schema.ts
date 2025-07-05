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
export class BasicsModel extends mongoose.Document {
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
    type: mongoose.Schema.Types.Array,
    of: mongoose.Schema.Types.String,
    default: [],
  })
  genres: string[];
}

export const BasicsSchema = SchemaFactory.createForClass(BasicsModel);
export type BasicsDocument = mongoose.HydratedDocument<BasicsModel>;

BasicsSchema.index(
  {
    primaryTitle: "text",
    originalTitle: "text",
  },
  {
    weights: {
      primaryTitle: 10,
      originalTitle: 5,
    },
  },
);
