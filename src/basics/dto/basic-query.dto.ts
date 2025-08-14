import { z } from "zod";

import {
  booleanishTypeTransformer,
  sortOrderTransformer,
  strictIntTransformer,
} from "src/libs/zod/transformers";
import { nonEmptyStringRefiner } from "src/libs/zod/refiners";

export const baseBasicQuerySchema = z.object({
  /**
   * Pagination limit, number of records to return per page. Throw an error if:
   * - The limit is not a valid integer
   * - The limit is less than 1
   *
   * @example "limit=10" == { limit: 10 }
   * @default 10
   */
  limit: z
    .string()
    .transform(strictIntTransformer)
    .pipe(z.number().int().min(1, "`limit` must be at least 1"))
    .optional()
    .default("10"),

  /**
   * Page number to return, starting from 1. Throws an error if:
   * - The page is not a valid integer
   * - The page is less than 1
   *
   * @example "page=1" == { page: 1 }
   * @default 1
   */
  page: z
    .string()
    .transform(strictIntTransformer)
    .pipe(z.number().int().min(1, "`page` must be at least 1"))
    .optional()
    .default("1"),

  /**
   * Sort options for query results
   */
  sort: z
    .object({
      /**
       * Sort order for the released/starting year of a basic
       *
       * @example "sort[releaseYear]=asc" -> { releaseYear: 1 }
       * @example "sort[releaseYear]=desc" -> { releaseYear: -1 }
       */
      startYear: z
        .enum(["asc", "desc"])
        .optional()
        .transform(sortOrderTransformer),

      /**
       * Sort order for the primary title of a basic
       *
       * @example "sort[primaryTitle]=asc" -> { primaryTitle: 1 }
       * @example "sort[primaryTitle]=desc" -> { primaryTitle: -1 }
       */
      primaryTitle: z
        .enum(["asc", "desc"])
        .optional()
        .transform(sortOrderTransformer),

      /**
       * Sort order for the end year of a basic
       *
       * @example "sort[endYear]=asc" -> { endYear: 1 }
       * @example "sort[endYear]=desc" -> { endYear: -1 }
       */
      endYear: z
        .enum(["asc", "desc"])
        .optional()
        .transform(sortOrderTransformer),
    })
    .optional()
    .default({}),

  /**
   * Filter options for basics
   */
  filter: z
    .object({
      /**
       * Title type filter, can be a single type or an array of up to 3
       * types. Throw an error if:
       * - The type is an empty string
       * - The type array contains more than 3 items
       *
       * @example "filter[titleType]=actor" -> { titleType: "actor" }
       * @example "filter[titleType]=actor&filter[titleType]=director" -> { titleType: ["actor", "director"] }
       */
      titleType: z
        .union([
          z.string().refine(nonEmptyStringRefiner, {
            message: "Type must be a non-empty string",
          }),
          z
            .array(
              z.string().refine(nonEmptyStringRefiner, {
                message: "Profession must be a non-empty string",
              }),
            )
            .max(3, "Profession array contains up to 3 items"),
        ])
        .optional(),

      /**
       * Genre filter, can be a single genre or an array of up to 3 genres.
       * Throws an error if:
       * - The genre is an empty string
       * - The genre array contains more than 3 items
       *
       * @example "filter[genres]=action" -> { genres: "action" }
       * @example "filter[genres]=action&filter[genres]=comedy" -> { genres: ["action", "comedy"] }
       */
      genre: z
        .union([
          z.string().refine(nonEmptyStringRefiner, {
            message: "Type must be a non-empty string",
          }),
          z
            .array(
              z.string().refine(nonEmptyStringRefiner, {
                message: "Genre must be a non-empty string",
              }),
            )
            .max(3, "Genre array contains up to 3 items"),
        ])
        .optional(),

      /**
       * adult status filter
       *
       * @example "filter[adult]=true" -> { adult: true }
       * @example "filter[adult]=false" -> { adult: false }
       * @example "filter[adult]=1" -> { adult: true }
       * @example "filter[adult]=0" -> { adult: false }
       */
      isAdult: z
        .enum(["true", "false", "0", "1"])
        .transform(booleanishTypeTransformer)
        .optional(),

      /**
       * Filter by released year range. Throw an error if the value is not a
       * valid year
       *
       * @example "filter[since]=1980" -> { since: 1980 }
       */
      since: z
        .string()
        .optional()
        .transform(strictIntTransformer)
        .pipe(
          z.number().gte(0, "Filter `since` must be a valid year").optional(),
        ),

      /**
       * Filter by end year range. Throw an error if the value is not a
       * valid year
       *
       * @example "filter[until]=2020" -> { until: 2020 }
       */
      until: z
        .string()
        .optional()
        .transform(strictIntTransformer)
        .pipe(
          z.number().gte(0, "Filter `since` must be a valid year").optional(),
        ),

      /**
       * Filter by duration of the title. Can be one of "short", "medium", or "long".
       *
       * @example "filter[duration]=short" -> { duration: "short" }
       */
      duration: z.enum(["short", "medium", "long"]).optional(),
    })
    .optional()
    .default({}),
});

export const basicQuerySchema = baseBasicQuerySchema.refine(
  (data) => {
    if (data.filter?.until && data.filter?.since) {
      return data.filter.until >= data.filter.since;
    }

    return true;
  },
  {
    path: ["filter", "until"],
    message: "Filter 'until' must be greater than or equal to 'since'",
  },
);

export type BasicQueryDto = z.infer<typeof basicQuerySchema>;
