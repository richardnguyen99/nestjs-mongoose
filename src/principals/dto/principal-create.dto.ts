import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import * as z from "zod";

export const basePrincipalCreateSchema = z.object({
  /**
   * The unique identifier for the title.
   *
   * @example { tconst: "tt0000001" }
   */
  tconst: z.string().min(1, "tconst is required"),

  /**
   * The unique identifier for the person.
   *
   * @example { nconst: "nm0000001" }
   */
  nconst: z.string().min(1, "nconst is required"),

  /**
   * Ordering representation for the principal in the title. This is a number to
   *  uniquely identify rows for a given titleId.
   *
   * Throws an error if the value is not a positive integer.
   *
   * @example { ordering: 1 }
   */
  ordering: z
    .number()
    .int("ordering must be an integer")
    .min(1, "ordering must be at least 1"),

  /**
   * The category of the principal, e.g. "actor", "actress", "
   *
   * @example { category: "actor" }
   */
  category: z.string().refine(nonEmptyStringRefiner),

  /**
   * The job of the principal, e.g. "director", "writer", "producer".
   *
   * @example { job: "director" }
   */
  job: z.string().optional().nullable().default(null),

  /**
   * The characters played by the principal in the title. This can be a single
   * string or an array of strings. If an array is provided, single records will
   * be created for each character.
   *
   * Throws an error if:
   * - The value is not a non-empty string or an array of non-empty strings.
   * - Any string in the array is empty.
   *
   * @example { characters: "Tony Stark" }
   * @example { characters: ["Tony Stark", "Iron Man"] }
   */
  characters: z.union([
    z
      .string()
      .refine(nonEmptyStringRefiner, "characters must be a non-empty string"),
    z.array(
      z
        .string()
        .refine(nonEmptyStringRefiner, "characters must be a non-empty string"),
    ),
  ]),
});

export const principalCreateSchema = basePrincipalCreateSchema.required();

export type PrincipalCreateDto = z.infer<typeof principalCreateSchema>;
