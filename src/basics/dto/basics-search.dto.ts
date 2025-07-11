import { z } from "zod";

import {
  booleanTypeTransformer,
  filterTypeTransformer,
  sortOrderTransformer,
} from "src/libs/zod/transformers";

export const basicsSearchSchema = z
  .object({
    q: z.string().min(1, "Search query must be at least 1 character long"),
    limit: z
      .string()
      .default("10")
      .transform((val) => {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) || parsed < 1 ? 10 : parsed;
      }),

    page: z
      .string()
      .default("1")
      .transform((val) => {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) || parsed < 1 ? 1 : parsed;
      }),

    sort: z
      .object({
        startYear: z
          .enum(["asc", "desc"])
          .optional()
          .transform(sortOrderTransformer),

        primaryTitle: z
          .enum(["asc", "desc"])
          .optional()
          .transform(sortOrderTransformer),

        endYear: z
          .enum(["asc", "desc"])
          .optional()
          .transform(sortOrderTransformer),
      })
      .optional()
      .default({}),

    filter: z
      .object({
        titleType: z.string().optional().transform(filterTypeTransformer),

        genres: z.string().optional().transform(filterTypeTransformer),

        isAdult: z
          .enum(["true", "false"])
          .optional()
          .transform(booleanTypeTransformer),

        since: z
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
                message: "Filter 'since' must be a valid year",
              })
              .gte(1890, "Year must be greater than or equal to 1890")
              .optional(),
          ),

        until: z
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
                message: "Filter 'until' must be a valid year",
              })
              .gte(1890, "Year must be greater than or equal to 1890")
              .optional(),
          ),

        duration: z.enum(["short", "medium", "long"]).optional(),
      })
      .optional()
      .default({}),
  })
  .required()
  .refine(
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

export type BasicsSearchDto = z.infer<typeof basicsSearchSchema>;
