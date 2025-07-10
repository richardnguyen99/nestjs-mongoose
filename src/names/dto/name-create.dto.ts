import { z } from "zod";

export const nameCreateSchema = z.object({
  nconst: z.string().min(1, "nconst is required"),

  primaryName: z.string().min(1, "primaryName is required"),

  birthYear: z
    .number({
      message: "birthYear must be a valid year",
    })
    .int({
      message: "birthYear must be an integer",
    }),

  deathYear: z
    .number({
      message: "deathYear must be a valid year",
    })
    .int({
      message: "deathYear must be an integer",
    })
    .nullable()
    .default(null),

  primaryProfession: z
    .array(z.string().min(1, "primaryProfession must be a non-empty string"), {
      message: "primaryProfession must be an array of strings",
    })
    .max(3, "primaryProfession can only store up to 3 items")
    .default([]),

  knownForTitles: z.array(
    z.string().min(1, "knownForTitles must be a non-empty string"),
    {
      message: "knownForTitles must be an array of strings",
    },
  ),
});

export type NameCreateDto = z.infer<typeof nameCreateSchema>;
