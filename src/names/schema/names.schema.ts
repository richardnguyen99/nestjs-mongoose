import { NotFoundException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

const validateBirthAndDeathYears = (
  err: mongoose.Error.ValidationError,
  birthYear: number,
  deathYear: number | null,
) => {
  if (deathYear !== null && birthYear !== null && deathYear < birthYear) {
    err.addError(
      "birthYear-deathYear",
      new mongoose.Error.ValidatorError({
        path: "birthYear-deathYear",
        message: `deathYear cannot be before birthYear. Received birthYear=${birthYear} and deathYear=${deathYear}`,
      }),
    );
  }

  return true;
};

@Schema({
  collection: "names",
  timestamps: false,
  versionKey: false,
  id: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class NamesModel extends mongoose.Document {
  /**
   * alphanumeric unique identifier of the name/person
   *
   * @example nm0000001
   */
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
    index: true,
  })
  nconst: string;

  /**
   * name by which the person is most often credited
   *
   * @example "Robert Downy Jr."
   */
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
  })
  primaryName: string;

  /**
   * Birth year in YYYY format if applicable, else `null`
   *
   * @example 1965
   */
  @Prop({
    type: mongoose.Schema.Types.Number,
    default: null,
  })
  birthYear: number | null;

  /**
   * Death year in YYYY format if applicable, else `null`
   */
  @Prop({
    type: mongoose.Schema.Types.Number,
    default: null,
  })
  deathYear: number | null;

  /**
   * the top-3 professions of the person
   *
   * @example ["actor", "producer", "director"]
   */
  @Prop({
    type: mongoose.Schema.Types.Array,
    of: mongoose.Schema.Types.String,
    default: [],
  })
  primaryProfession: string[];

  /**
   * titles the person is known for
   *
   * @example ['tt0371746', 'tt1300854', 'tt0988045', 'tt4154796']
   */
  @Prop({
    type: mongoose.Schema.Types.Array,
    of: mongoose.Schema.Types.String,
    default: [],
  })
  knownForTitles: string[];
}

export const NamesSchema = SchemaFactory.createForClass(NamesModel);
export type NamesDocument = mongoose.HydratedDocument<NamesModel>;

// Create a text index on primaryName for search functionality
NamesSchema.index(
  {
    primaryName: "text",
  },
  {
    weights: {
      primaryName: 10,
    },
  },
);

NamesSchema.path("primaryProfession").validate(
  function validatePrimaryProfession(value) {
    if (!Array.isArray(value)) {
      return false;
    }

    return (
      value.every((item) => typeof item === "string" && item.trim() !== "") &&
      value.length <= 3
    );
  },
);

NamesSchema.path("knownForTitles").validate(
  function validateKnownForTitles(value) {
    if (!Array.isArray(value)) {
      return false;
    }

    return value.every(
      (item) => typeof item === "string" && item.trim() !== "",
    );
  },
);

NamesSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() || {};
  const doc = await this.model.findOne<NamesModel>(this.getQuery()).lean();

  if (!doc) {
    return next(new NotFoundException("Document not found"));
  }

  let updated = { ...doc };
  const err = new mongoose.Error.ValidationError();

  if (update["$set"]) {
    updated = { ...updated, ...update["$set"] };
  }

  validateBirthAndDeathYears(err, updated.birthYear, updated.deathYear);

  if (err.errors && Object.keys(err.errors).length > 0) {
    return next(err);
  }

  next();
});
