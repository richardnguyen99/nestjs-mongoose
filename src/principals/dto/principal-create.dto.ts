import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import * as z from "zod";

export const basePrincipalCreateSchema = z.object({
  /**
   * The unique identifier for the person.
   *
   * @example { nconst: "nm0000001" }
   */
  nconst: z
    .string({
      required_error: "must be provided",
      invalid_type_error: "must be a string",
    })
    .refine(nonEmptyStringRefiner, "must be a non-empty string"),

  /**
   * The category of the principal, e.g. "actor", "actress", "
   *
   * @example { category: "actor" }
   */
  category: z
    .string({
      required_error: "must be provided",
      invalid_type_error: "must be a string",
    })
    .refine(nonEmptyStringRefiner, "must be a non-empty string"),

  /**
   * The job of the principal, e.g. "director", "writer", "producer".
   *
   * @example { job: "director" }
   */
  job: z
    .string({
      invalid_type_error: "must be a string",
    })
    .refine(nonEmptyStringRefiner, "must be a non-empty string")
    .optional()
    .nullable()
    .default(null),

  /**
   * The characters played by the principal in the title. This can be a single
   * string or an array of strings. If an array is provided, single records will
   * be created for each character.
   *
   * Throws an error if:
   * - The value is not an array of non-empty strings.
   * - Any string in the array is empty.
   *
   * @example { characters: ["Tony Stark", "Iron Man"] }
   */
  characters: z
    .array(
      z
        .string({
          invalid_type_error: "must be a string",
        })
        .refine(nonEmptyStringRefiner, "must be a non-empty string"),
      {
        invalid_type_error: "must be an array of strings",
      },
    )
    .optional()
    .default([]),
});

export const principalCreateSchema = basePrincipalCreateSchema
  .extend({
    /**
     * The unique identifier for the title.
     *
     * @example { tconst: "tt0000001" }
     */
    tconst: z.string().min(1, "tconst is required"),
  })
  .required();

export type BasePrincipalCreateDto = z.infer<typeof basePrincipalCreateSchema>;
export type PrincipalCreateDto = z.infer<typeof principalCreateSchema>;
