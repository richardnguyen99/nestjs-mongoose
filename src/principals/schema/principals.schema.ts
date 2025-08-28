/* istanbul ignore file */

import { ConflictException, NotFoundException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { BasicsModel } from "src/basics/schema/basics.schema";
import { NamesModel } from "src/names/schema/names.schema";

@Schema({
  collection: "principals",
  versionKey: false,
  timestamps: false,
  id: false,
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
    ordering: 1,
  },
  {
    unique: true,
  },
);

PrincipalsSchema.pre("save", async function (next) {
  const model = this.model<Model<PrincipalsModel>>(PrincipalsModel.name);
  const basicModel = this.model<Model<BasicsModel>>(BasicsModel.name);
  const nameModel = this.model<Model<NamesModel>>(NamesModel.name);

  if (this.isNew) {
    const title = await basicModel.findOne({ tconst: this.tconst });

    if (!title) {
      return next(
        new NotFoundException(`No title found for tconst=${this.tconst}`),
      );
    }

    const name = await nameModel.findOne({ nconst: this.nconst });

    if (!name) {
      return next(
        new NotFoundException(`No name found for nconst=${this.nconst}`),
      );
    }

    const lastOrdering = await model
      .aggregate<{ ordering: number }>()
      .match({ tconst: this.tconst })
      .sort({ ordering: -1 })
      .limit(1)
      .exec();

    const existingCast = await model.find({
      tconst: this.tconst,
      nconst: this.nconst,
    });

    if (existingCast && existingCast.length > 0) {
      for (const cast of existingCast) {
        const sortedCast = cast.characters.sort();
        const sortedThis = this.characters.sort();

        if (JSON.stringify(sortedCast) === JSON.stringify(sortedThis)) {
          return next(
            new ConflictException(
              `Duplicate principal for nconst=${this.nconst}, tconst=${this.tconst} and characters=${JSON.stringify(this.characters)}`,
            ),
          );
        }
      }
    }

    this.ordering = lastOrdering.length > 0 ? lastOrdering[0].ordering + 1 : 1;
  }

  next();
});
