import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

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
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
    index: true,
  })
  nconst: string;

  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
  })
  primaryName: string;

  @Prop({
    type: mongoose.Schema.Types.Number,
    required: true,
  })
  birthYear: number;

  @Prop({
    type: mongoose.Schema.Types.Number,
    default: null,
  })
  deathYear: number | null;

  @Prop({
    type: mongoose.Schema.Types.Array,
    of: mongoose.Schema.Types.String,
    default: [],
  })
  primaryProfession: string[];

  @Prop({
    type: mongoose.Schema.Types.Array,
    of: mongoose.Schema.Types.String,
    default: [],
  })
  knownForTitles: string[];
}

export const NamesSchema = SchemaFactory.createForClass(NamesModel);
export type NamesDocument = mongoose.HydratedDocument<NamesModel>;

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

NamesSchema.path("primaryProfession").validate(function (value) {
  if (!Array.isArray(value)) {
    return false;
  }

  return (
    value.every((item) => typeof item === "string" && item.trim() !== "") &&
    value.length <= 3
  );
});

NamesSchema.path("knownForTitles").validate(function (value) {
  console.log("Validating knownForTitles:", value);
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => typeof item === "string" && item.trim() !== "");
});
