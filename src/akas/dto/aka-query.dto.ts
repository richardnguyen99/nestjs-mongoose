import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import { strictIntTransformer } from "src/libs/zod/transformers";
import * as z from "zod";

export const baseAkaQueryDto = z.object({
  /**
   * region for this version of the title
   *
   * @example {"region": "US"} -> "US"
   */
  region: z
    .string()
    .refine(nonEmptyStringRefiner)
    .optional()
    .transform(
      /* istanbul ignore next */ (value) =>
        value ? value.toUpperCase() : undefined,
    ),

  /**
   * language that the titles are written in
   *
   * @example {"language": "en"} -> "en"
   */
  language: z.string().refine(nonEmptyStringRefiner).optional(),

  /**
   * types that the titles are displayed as on different platforms
   *
   * @example {"types": ["imdbDisplay"]} -> "imdbDisplay"
   */
  types: z.array(z.string().refine(nonEmptyStringRefiner)).optional(),

  /**
   * extra information that the titles have
   *
   * @example {"attributes": ["short title"]} -> "short title"
   */
  attributes: z.array(z.string().refine(nonEmptyStringRefiner)).optional(),

  /**
   * the maximum number of results to return
   *
   * @example {"limit": "10"} -> 10
   */
  limit: z
    .string()
    .optional()
    .default("10")
    .transform(strictIntTransformer)
    .pipe(z.number().min(10).default(10)),

  /**
   * the page number to return
   *
   * @example {"page": "1"} -> 1
   */
  page: z
    .string()
    .optional()
    .default("1")
    .transform(strictIntTransformer)
    .pipe(z.number().min(1).default(1)),
});

export const akaQueryDto = baseAkaQueryDto.optional().default({});

export type AkaQueryDto = z.infer<typeof akaQueryDto>;
