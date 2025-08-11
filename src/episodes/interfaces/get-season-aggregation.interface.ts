import { BasicsModel } from "src/basics/schema/basics.schema";

export interface GetSeasonAggregation {
  season: number;
  episodes: (BasicsModel & {
    seasonNumber: number | null;
  })[];
}
