/* istanbul ignore file */

import { NotFoundException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

const validateStartAndEndYears = (
  err: mongoose.Error.ValidationError,
  startYear: number,
  endYear: number | null,
) => {
  if (endYear !== null && endYear < startYear) {
    err.addError(
      "startYear-endYear",
      new mongoose.Error.ValidatorError({
        path: "startYear-endYear",
        message: `endYear cannot be before startYear. Received startYear=${startYear} and endYear=${endYear}`,
      }),
    );
  }

  return true;
};

const validateTitleTypeAndEndYear = (
  err: mongoose.Error.ValidationError,
  titleType: string,
  endYear: number | null,
) => {
  if (
    titleType !== "tvSeries" &&
    titleType !== "tvMiniSeries" &&
    endYear !== null
  ) {
    err.addError(
      "titleType-endYear",
      new mongoose.Error.ValidatorError({
        path: "titleType-endYear",
        message: `Specific endYear must be specified for TV Series or Mini Series. Received endYear=${endYear} and titleType=${titleType}`,
      }),
    );
  }

  return true;
};

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
   * false: non-adult title; true: adult title
   */
  @Prop({ required: true, type: mongoose.Schema.Types.Boolean })
  isAdult: boolean;

  /**
   * represents the release year of a title. In the case of TV Series, it is
   * the series start year
   */
  @Prop({ type: mongoose.Schema.Types.Number })
  startYear: number | null;

  /**
   * TV Series end year. null for all other title types
   */
  @Prop({
    type: mongoose.Schema.Types.Number,
    default: null,
  })
  endYear: number | null;

  /**
   * Primary runtime of the title, in minutes. Field can be `null` if
   * - the title is a TV Series or Mini Series
   * - the runtime is unknown
   */
  @Prop({ type: mongoose.Schema.Types.Number })
  runtimeMinutes: number | null;

  /**
   * A comma-concatenated string that includes up to three genres associated
   * with the title
   *
   * @example ["Action", "Adventure", "Sci-Fi"]
   */
  @Prop({
    required: true,
    type: mongoose.Schema.Types.Array,
    of: mongoose.Schema.Types.String,
    default: [],
  })
  genres: string[];

  /**
   * Virtual property that generates a URL to official IMDB for the title
   *
   * @example "tt0111161" -> "https://www.imdb.com/title/tt0111161/"
   */
  @Virtual({
    get: function (this: BasicsModel) {
      return `https://www.imdb.com/title/${this.tconst}/`;
    },
  })
  imdbUrl: string;
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

BasicsSchema.path("genres").validate(function (value) {
  if (!Array.isArray(value)) {
    return false;
  }
  return (
    value.every((genre) => typeof genre === "string" && genre.trim() !== "") &&
    value.length <= 3
  );
}, "Genres must be an array of up to 3 non-empty strings");

BasicsSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() || {};
  const doc = await this.model.findOne<BasicsModel>(this.getQuery()).lean();

  if (!doc) {
    return next(new NotFoundException("Document not found"));
  }

  let updated = { ...doc };
  const err = new mongoose.Error.ValidationError();

  if (update["$set"]) {
    updated = { ...updated, ...update["$set"] };
  }

  validateStartAndEndYears(err, updated.startYear, updated.endYear);
  validateTitleTypeAndEndYear(err, updated.titleType, updated.endYear);

  if (err.errors && Object.keys(err.errors).length > 0) {
    return next(err);
  }

  next();
});
