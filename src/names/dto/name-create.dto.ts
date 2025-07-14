import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import { z } from "zod";

export const nameCreateSchema = z.object({
  /**
   * Unique identifier for the name
   *
   * @example { nconst: "nm0000123" }
   */
  nconst: z.string().min(1, "nconst is required"),

  /**
   * name by which the person is most often credited
   *
   * @example { primaryName: "Robert Downy Jr." }
   */
  primaryName: z.string().min(1, "primaryName is required"),

  /**
   * Birth year in YYYY format if applicable, else `null`. Throws an error if:
   * - The birth year is not a valid integer
   *
   * @example { birthYear: 1965 }
   * @example { birthYear: null }
   */
  birthYear: z
    .number({
      message: "birthYear must be a valid year",
    })
    .int({
      message: "birthYear must be an integer",
    })
    .nullable()
    .default(null),

  /**
   * Death year in YYYY format if applicable, else `null`. Throws an error if:
   * - The value is not a valid integer
   *
   * @example { deathYear: 2020 }
   * @example { deathYear: null }
   */
  deathYear: z
    .number({
      message: "deathYear must be a valid year",
    })
    .int({
      message: "deathYear must be an integer",
    })
    .nullable()
    .default(null),

  /**
   * the top-3 professions of the person. Can be empty. Throws an error if:
   * - The professions array contains more than 3 items
   * - The professions array contains non-string items
   * - The professions array is not an array
   *
   * @example { primaryProfessions: ["actor", "producer", "director"] }
   * @example { primaryProfessions: [] }
   */
  primaryProfession: z
    .array(
      z
        .string()
        .refine(
          nonEmptyStringRefiner,
          "primaryProfession must be a non-empty string",
        ),
      {
        message: "primaryProfession must be an array of strings",
      },
    )
    .max(3, "primaryProfession can only store up to 3 items")
    .default([]),

  /**
   * titles the person is known for. Can be empty. Throws an error if:
   * - The titles array contains non-string items
   * - The titles array is not an array
   *
   * @example { knownForTitles: ['tt0371746', 'tt1300854', 'tt0988045', 'tt4154796'] }
   */
  knownForTitles: z
    .array(
      z
        .string()
        .refine(
          nonEmptyStringRefiner,
          "knownForTitles must be a non-empty string",
        ),
      {
        message: "knownForTitles must be an array of strings",
      },
    )
    .default([]),
});

export type NameCreateDto = z.infer<typeof nameCreateSchema>;
