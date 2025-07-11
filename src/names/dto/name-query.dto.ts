import { z } from "zod";

import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import {
  booleanishTypeTransformer,
  safeIntWithDefaultTransformer,
  sortOrderTransformer,
} from "src/libs/zod/transformers";

export const baseNameQuerySchema = z.object({
  limit: z
    .string()
    .transform(safeIntWithDefaultTransformer(10))
    .pipe(z.number().int().min(1, "Limit must be at least 1"))
    .optional()
    .default("10"),

  page: z
    .string()
    .transform(safeIntWithDefaultTransformer(1))
    .pipe(z.number().int().min(1, "Page must be at least 1"))
    .optional()
    .default("1"),

  sort: z
    .object({
      birthYear: z
        .enum(["asc", "desc"])
        .optional()
        .transform(sortOrderTransformer),

      mostAppearance: z
        .enum(["asc", "desc"])
        .optional()
        .transform(sortOrderTransformer),
    })
    .optional(),

  filter: z
    .object({
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

      alive: z
        .enum(["true", "false", "0", "1"])
        .transform(booleanishTypeTransformer)
        .optional(),

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
            .optional(),
        ),
    })
    .optional(),
});

export const nameQuerySchema = baseNameQuerySchema.optional().default({});

export type NameQueryDto = z.infer<typeof nameQuerySchema>;
