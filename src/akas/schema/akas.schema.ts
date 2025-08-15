/* istanbul ignore file */

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Mongoose } from "mongoose";

@Schema({
  versionKey: false,
  id: false,
  collection: "akas",
  timestamps: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class AkasModel extends mongoose.Document {
  /**
   * a tconst, an alphanumeric unique identifier of the title
   *
   * @example tt0000001
   */
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    index: true,
  })
  titleId: string;

  /**
   * a number to uniquely identify rows for a given titleId
   *
   * @example 1
   */
  @Prop({
    type: mongoose.Schema.Types.Int32,
    default: 1,
  })
  ordering: number;

  /**
   * the localized title
   *
   * @example "Shawshank Redemption"
   */
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
  })
  title: string;

  /**
   * the region for this version of the title
   *
   * @example "US"
   */
  @Prop({
    type: mongoose.Schema.Types.String,
  })
  region: string | null;

  /**
   * the language of the title
   *
   * @example "en"
   */
  @Prop({
    type: mongoose.Schema.Types.String,
  })
  language: string | null;

  /**
   * the types of title, such as alternative, working, short, etc.
   *
   * @example "alternative"
   */
  @Prop({
    type: mongoose.Schema.Types.String,
  })
  types: string | null;

  /**
   * Additional terms to describe this alternative title, not enumerated
   *
   * @example "short title"
   */
  @Prop({
    type: mongoose.Schema.Types.String,
  })
  attributes: string | null;

  /**
   * indicates if this is the original title of the movie or show
   *
   * @example true
   */
  @Prop({
    type: mongoose.Schema.Types.Boolean,
    default: false,
  })
  isOriginalTitle: boolean;
}

export const AkasSchema = SchemaFactory.createForClass(AkasModel);
export type AkasDocument = mongoose.HydratedDocument<AkasModel>;

AkasSchema.pre("save", async function (next) {
  if (this.isNew) {
    const titleId = this.titleId;
    const latestOrdering = await this.model("AkasModel")
      .aggregate()
      .match({ titleId })
      .sort({ ordering: -1 })
      .limit(1)
      .exec();

    this.ordering =
      latestOrdering.length > 0 ? latestOrdering[0].ordering + 1 : 1;
  }

  next();
});

AkasSchema.index({ titleId: 1, ordering: 1 }, { unique: true });
