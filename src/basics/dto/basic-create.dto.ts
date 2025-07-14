import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import { z } from "zod";

export const basicCreateSchema = z
  .object({
    /**
     * The unique identifier for the title
     */
    tconst: z.string().min(2, "tconst must be at least 1 character long"),

    /**
     * The type of title, such as movie, short, tvEpisode, etc. Throws an error
     * if:
     * - The titleType is not one of the allowed values.
     */
    titleType: z.enum([
      "movie",
      "short",
      "tvEpisode",
      "tvMiniSeries",
      "tvMovie",
      "tvPilot",
      "tvSeries",
      "tvShort",
      "tvSpecial",
      "video",
      "videoGame",
    ]),

    /**
     * The primary title of the movie or show. Can be null if not applicable.
     * Throws an error if:
     * - The primary title is an empty string.
     *
     * @example { primaryTitle: "Inception" }
     */
    primaryTitle: z
      .string()
      .min(1, "Primary title must be at least 1 character long")
      .nullable(),

    /**
     * The original title of the movie or show, if different from the primary
     * title. Can be null if not applicable. Throws an error if:
     * - The original title is an empty string.
     *
     * @example { primaryTitle: "Attack on Titan", originalTitle: "Shingeki no Kyojin" }
     */
    originalTitle: z
      .string()
      .min(1, "Original title must be at least 1 character long")
      .nullable(),

    /**
     * Indicates if the title is for adults (1) or not (0)
     *
     * @example { isAdult: false }
     */
    isAdult: z.boolean().default(false),

    /**
     * The year the title was released. Can be null if not applicable.
     * Throws an error if:
     * - The start year is not a valid integer.
     * - The start year is less than 1890.
     */
    startYear: z
      .number()
      .int("Start year must be an integer")
      .min(1890, "Start year must be at least 1890")
      .nullable(),

    /**
     * The year the title ended, if applicable. Can be null if not applicable.
     * Throws an error if:
     * - The end year is not a valid integer.
     * - The end year is less than 1890.
     * - The end year is before the start year.
     */
    endYear: z
      .number()
      .int("End year must be an integer")
      .min(1890, "End year must be at least 1890")
      .nullable(),

    /**
     * The runtime of the title in minutes. Can be null if not applicable.
     * Throws an error if:
     * - The runtime is not a valid integer.
     * - The runtime is less than 1.
     */
    runtimeMinutes: z
      .number()
      .int("Runtime minutes must be an integer")
      .min(1, "Runtime minutes must be at least 1")
      .nullable(),

    /**
     * A list of genres associated with the title. Can be empty.
     * Throws an error if:
     * - The genres array contains more than 3 items.
     * - The genres array contains non-string items.
     * - The genres array is not an array.
     */
    genres: z
      .array(
        z.string().refine(nonEmptyStringRefiner, {
          message: "Genres must be non-empty strings",
        }),
      )
      .min(0)
      .max(3, "Genres can only store up to 3 items")
      .default([]),
  })
  .required();

export type BasicCreateDto = z.infer<typeof basicCreateSchema>;
