import { z } from "zod";

import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import {
  booleanishTypeTransformer,
  safeIntWithDefaultTransformer,
  sortOrderTransformer,
} from "src/libs/zod/transformers";

export const baseNameQuerySchema = z.object({
  /**
   * Pagination limit, number of records to return per page
   *
   * @example "limit=10" == { limit: 10 }
   * @default 10
   */
  limit: z
    .string()
    .transform(safeIntWithDefaultTransformer(10))
    .pipe(z.number().int().min(1, "Limit must be at least 1"))
    .optional()
    .default("10"),

  /**
   * Page number to return, starting from 1
   *
   * @example "page=1" == { page: 1 }
   * @default 1
   */
  page: z
    .string()
    .transform(safeIntWithDefaultTransformer(1))
    .pipe(z.number().int().min(1, "Page must be at least 1"))
    .optional()
    .default("1"),

  /**
   * Sort options for query results
   */
  sort: z
    .object({
      /**
       * Sort order for birth year
       *
       * @example "sort[birthYear]=asc" -> { birthYear: 1 }
       * @example "sort[birthYear]=desc" -> { birthYear: -1 }
       */
      birthYear: z
        .enum(["asc", "desc"])
        .optional()
        .transform(sortOrderTransformer),

      /**
       * Sort order for most appearance
       *
       * @example "sort[mostAppearance]=asc" -> { mostAppearance: 1 }
       * @example "sort[mostAppearance]=desc" -> { mostAppearance: -1 }
       */
      mostAppearance: z
        .enum(["asc", "desc"])
        .optional()
        .transform(sortOrderTransformer),
    })
    .optional(),

  /**
   * Filter options for query results
   */
  filter: z
    .object({
      /**
       * Profession filter, can be a single profession or an array of up to 3 professions
       *
       * @example "filter[profession]=actor" -> { profession: "actor" }
       * @example "filter[profession]=actor&filter[profession]=director" -> { profession: ["actor", "director"] }
       */
      profession: z
        .union([
          z.string().refine(nonEmptyStringRefiner, {
            message: "Profession must be a non-empty string",
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
       * Titles the person is known for, can be a single title or an array of titles
       *
       * @example "filter[appearInTitles]=tt0371746" -> { appearInTitles: "tt0371746" }
       * @example "filter[appearInTitles]=tt0371746&filter[appearInTitles]=tt1300854" -> { appearInTitles: ["tt0371746", "tt1300854"] }
       */
      appearInTitles: z
        .union([
          z.string().refine(nonEmptyStringRefiner, {
            message: "Title must be a non-empty string",
          }),
          z.array(
            z.string().refine(nonEmptyStringRefiner, {
              message: "Title must be a non-empty string",
            }),
          ),
        ])
        .optional(),

      /**
       * Alive status filter
       *
       * @example "filter[alive]=true" -> { alive: true }
       * @example "filter[alive]=false" -> { alive: false }
       * @example "filter[alive]=1" -> { alive: true }
       * @example "filter[alive]=0" -> { alive: false }
       */
      alive: z
        .enum(["true", "false", "0", "1"])
        .transform(booleanishTypeTransformer)
        .optional(),

      /**
       * Filter by birth year range
       *
       * @example "filter[from]=1980" -> { from: 1980 }
       * @example "filter[from]=something" -> { from: undefined }
       */
      from: z
        .string()
        .optional()
        .transform((val) => {
          if (typeof val === "undefined") {
            return undefined;
          }

          const parsed = parseInt(val, 10);
          return isNaN(parsed) ? undefined : parsed;
        })
        .pipe(
          z
            .number({
              message: "Filter 'From' must be a valid year",
            })
            .optional(),
        ),
    })
    .optional(),
});

export const nameQuerySchema = baseNameQuerySchema.optional().default({});

export type NameQueryDto = z.infer<typeof nameQuerySchema>;
