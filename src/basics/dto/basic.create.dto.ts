import { z } from "zod";

export const basicCreateSchema = z
  .object({
    tconst: z.string().min(2, "tconst must be at least 1 character long"),

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

    primaryTitle: z
      .string()
      .min(1, "Primary title must be at least 1 character long")
      .nullable(),

    originalTitle: z
      .string()
      .min(1, "Original title must be at least 1 character long")
      .nullable(),

    isAdult: z.boolean().default(false),

    startYear: z
      .number()
      .int("Start year must be an integer")
      .min(1890, "Start year must be at least 1890")
      .nullable(),

    endYear: z.number().min(1890, "End year must be at least 1890").nullable(),

    runtimeMinutes: z
      .number()
      .int("Runtime minutes must be an integer")
      .min(1, "Runtime minutes must be at least 1")
      .nullable(),

    genres: z
      .array(z.string())
      // .min(0)
      // .max(3, "Genres can only store up to 3 items")
      .default([]),
  })
  .required();

export type BasicCreateDto = z.infer<typeof basicCreateSchema>;
