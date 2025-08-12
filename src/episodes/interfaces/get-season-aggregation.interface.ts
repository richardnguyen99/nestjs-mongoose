import { BasicsDocument } from "src/basics/schema/basics.schema";

export interface GetSeasonAggregation {
  season: number;
  episodes: (BasicsDocument & {
    episodeNumber: number | null;
  })[];
}
