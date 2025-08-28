import {
  booleanishTypeTransformer,
  strictIntTransformer,
} from "src/libs/zod/transformers";
import * as z from "zod";

export const basePrincipalQuerySchema = z.object({
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
    .optional()
    .default("1")
    .transform(strictIntTransformer)
    .pipe(z.number().min(1, "must be at least 1")),

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
    .optional()
    .default("10")
    .transform(strictIntTransformer)
    .pipe(z.number().min(1, "must be at least 1")),
});

export const principalSingleQuerySchema = z.object({
  /**
   * Option to include related entities in the query results
   */
  include: z
    .object({
      /**
       * Option to include the name field of a principal document based on nconst
       */
      name: z
        .enum(["true", "false", "0", "1"])
        .optional()
        .transform(booleanishTypeTransformer),

      /**
       * Option to include the title field of a principal document based on tconst
       */
      title: z
        .enum(["true", "false", "0", "1"])
        .optional()
        .transform(booleanishTypeTransformer),
    })
    .optional(),
});

export const principalQuerySchema = z.object({
  ...basePrincipalQuerySchema.shape,
  ...principalSingleQuerySchema.shape,
});

export type PrincipalQueryDto = z.infer<typeof basePrincipalQuerySchema>;
export type PrincipalSingleQueryDto = z.infer<
  typeof principalSingleQuerySchema
>;
