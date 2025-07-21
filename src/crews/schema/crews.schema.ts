import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

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
