import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import * as z from "zod";

export const baseEpisodeUpdateSchema = z.object({
  /**
   * season that the episode belongs to. Can be null if not applicable
   */
  seasonNumber: z.number().int().nullable(),

  /**
   * episode number of the tconst in the TV series. Can be null if not applicable
   */
  episodeNumber: z.number().int().nullable(),
});

export const episodeUpdateSchema = baseEpisodeUpdateSchema
  .extend({})
  .required();

export type BaseEpisodeUpdateDto = z.infer<typeof baseEpisodeUpdateSchema>;
export type EpisodeUpdateDto = z.infer<typeof episodeUpdateSchema>;
