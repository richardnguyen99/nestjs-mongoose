import { NotFoundException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";

import { BasicsModel } from "src/basics/schema/basics.schema";
import { NamesModel } from "src/names/schema/names.schema";

@Schema({
  collection: "crews",
  timestamps: false,
  id: false,
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class CrewsModel extends mongoose.Document {
  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
    index: true,
  })
  tconst: string;

  @Prop({
    type: mongoose.Schema.Types.Array,
    of: mongoose.Schema.Types.String,
    required: true,
  })
  directors: string[];

  @Prop({
    type: mongoose.Schema.Types.Array,
    of: mongoose.Schema.Types.String,
    required: true,
  })
  writers: string[];
}

export const CrewsSchema = SchemaFactory.createForClass(CrewsModel);
export type CrewsDocument = mongoose.HydratedDocument<CrewsModel>;

CrewsSchema.pre("save", async function (next) {
  const basicModel = this.model<Model<BasicsModel>>(BasicsModel.name);

  if (this.isNew) {
    const basic = await basicModel.findOne({ tconst: this.tconst });

    if (!basic) {
      return next(
        new NotFoundException(`No title found for tconst=${this.tconst}`),
      );
    }
  }

  next();
});

CrewsSchema.pre("findOneAndUpdate", async function (next) {
  const namesModel = this.model.db.model<Model<NamesModel>>(NamesModel.name);
  const update = this.getUpdate() as any;

  if (update && update.$addToSet) {
    const addDirectors = update.$addToSet.directors?.$each || [];
    const addWriters = update.$addToSet.writers?.$each || [];

    const nconstsToCheck = [...addDirectors, ...addWriters];

    if (nconstsToCheck.length > 0) {
      const names = await namesModel
        .find({ nconst: { $in: nconstsToCheck } })
        .lean()
        .select("nconst")
        .exec();

      const existingNconsts = new Set(names.map((name: any) => name.nconst));
      const nonExistingNconsts = nconstsToCheck.filter(
        (nconst) => !existingNconsts.has(nconst),
      );

      if (nonExistingNconsts.length > 0) {
        let errorMessage = "Some of the names are not found. (";

        const nonExistingDirectors = addDirectors.filter((nconst) =>
          nonExistingNconsts.includes(nconst),
        );
        const nonExistingWriters = addWriters.filter((nconst) =>
          nonExistingNconsts.includes(nconst),
        );

        if (nonExistingDirectors.length > 0) {
          errorMessage += `directors=${nonExistingDirectors.join(",")}`;
        }

        if (nonExistingWriters.length > 0) {
          if (nonExistingDirectors.length > 0) {
            errorMessage += "; ";
          }
          errorMessage += `writers=${nonExistingWriters.join(",")}`;
        }

        errorMessage += ")";

        return next(new NotFoundException(errorMessage));
      }
    }
  }

  next();
});
