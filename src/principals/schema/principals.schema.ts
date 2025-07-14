import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({
  collection: "principals",
  versionKey: false,
  timestamps: false,
  _id: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class PrincipalsModel extends mongoose.Document {
  /**
   * alphanumeric unique identifier of the title
   *
   * @example tt0000001
   */
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    index: true,
  })
  tconst: string;

  /**
   * alphanumeric unique identifier of the person
   *
   * @example nm0000001
   */
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    index: true,
  })
  nconst: string;

  /**
   * a number to uniquely identify rows for a given titleId
   *
   * @example 1
   */
  @Prop({
    type: mongoose.Schema.Types.Int32,
    required: true,
  })
  ordering: number;

  /**
   * the category of the principal, e.g. "actor", "actress", "director"
   *
   * @example "actor"
   */

  /**
   * the category of job that person was in
   *
   * @example "actor", "actress", "director", "writer", "producer"
   */
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
  })
  category: string;

  /**
   * the specific job title if applicable, else null.
   *
   * @example "actor", "actress"
   */
  @Prop({
    type: mongoose.Schema.Types.String,
    default: null,
  })
  job: string | null;

  /**
   * the characters played by the person in the title, if applicable
   *
   * @example ["Tony Stark"]
   */
  @Prop({
    type: mongoose.Schema.Types.Array,
    of: mongoose.Schema.Types.String,
    default: [],
  })
  characters: string[];
}

export const PrincipalsSchema = SchemaFactory.createForClass(PrincipalsModel);
export type PrincipalsDocument = mongoose.HydratedDocument<PrincipalsModel>;

PrincipalsSchema.index(
  {
    tconst: 1,
    nconst: 1,
    ordering: 1,
  },
  {
    unique: true,
  },
);
