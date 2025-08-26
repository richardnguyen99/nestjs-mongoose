import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import * as z from "zod";

export const baseEpisodeCreateSchema = z.object({
  /**
   * season that the episode belongs to. Can be null if not applicable
   */
  seasonNumber: z
    .number({
      required_error: "must be provided",
      invalid_type_error: "must be an integer or a null type",
    })
    .int({
      message: "must be an integer or a null type",
    })
    .nullable(),

  /**
   * episode number of the tconst in the TV series. Can be null if not applicable
   */
  episodeNumber: z
    .number({
      required_error: "must be provided",
      invalid_type_error: "must be an integer or a null type",
    })
    .int({
      message: "must be an integer or a null type",
    })
    .nullable(),

  /**
   * alphanumeric identifier of episode
   */
  tconst: z
    .string({
      required_error: "must be provided",
      invalid_type_error: "must be a string",
    })
    .refine(nonEmptyStringRefiner, "must be a non-empty string"),
});

export const episodeCreateSchema = baseEpisodeCreateSchema
  .extend({
    /**
     * alphanumeric identifier of the parent TV Series, referring to the original
     * title of the series
     */
    parentTconst: z.string().refine(nonEmptyStringRefiner),
  })
  .required();

export type BaseEpisodeCreateDto = z.infer<typeof baseEpisodeCreateSchema>;
export type EpisodeCreateDto = z.infer<typeof episodeCreateSchema>;
