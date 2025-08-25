import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import * as z from "zod";

export const baseAkaCreateDto = z.object({
  /**
   * The title of the AKA
   *
   * @example {"title": "Some Title"} -> "Some Title"
   */
  title: z
    .string({
      required_error: "must be provided",
      invalid_type_error: "must be a string type",
    })
    .refine(nonEmptyStringRefiner, "must be a non-empty string"),

  /**
   * The region for this AKA. null if not applicable.
   *
   * @example {"region": "US"} -> "US"
   */
  region: z
    .string({
      required_error: "must be provided",
      invalid_type_error: "must be a string or null type",
    })
    .refine(nonEmptyStringRefiner, "must be a non-empty string")
    .nullable(),

  /**
   * The language that the AKA is written in. null if not applicable.
   *
   * @example {"language": "en"} -> "en"
   */
  language: z
    .string({
      required_error: "must be provided",
      invalid_type_error: "must be a string or null type",
    })
    .refine(nonEmptyStringRefiner, "must be a non-empty string")
    .nullable(),

  /**
   * The types that the AKA is displayed as on different platforms.
   *
   * @example {"types": ["imdbDisplay"]} -> ["imdbDisplay"]
   */
  types: z
    .array(
      z
        .string({
          invalid_type_error: "must be a string",
        })
        .refine(nonEmptyStringRefiner, "must be a non-empty string"),
      {
        required_error: "must be provided",
        invalid_type_error: "must be an array of strings or null type",
      },
    )
    .nullable(),

  /**
   * Extra information that the AKA has, such as "short title".
   *
   * @example {"attributes": ["short title"]} -> ["short title"]
   */
  attributes: z
    .array(
      z
        .string({
          invalid_type_error: "must be a string",
        })
        .refine(nonEmptyStringRefiner, "must be a non-empty string"),
      {
        required_error: "must be provided",
        invalid_type_error: "must be an array of strings or null type",
      },
    )
    .nullable(),

  /**
   * Indicates if this AKA is the original title for the title.
   *
   * @example {"isOriginalTitle": true} -> true
   */
  isOriginalTitle: z.boolean({
    required_error: "must be provided",
    invalid_type_error: "must be a boolean",
  }),
});

export const akaCreateDto = baseAkaCreateDto.extend({
  /**
   * The title ID this AKA is associated with
   *
   * @example {"tconst": "tt1234567"} -> "tt1234567"
   */
  titleId: z
    .string()
    .refine(nonEmptyStringRefiner, "tconst must be a non-empty string"),
});

export type BaseAkaCreateDto = z.infer<typeof baseAkaCreateDto>;
export type AkaCreateDto = z.infer<typeof akaCreateDto>;
