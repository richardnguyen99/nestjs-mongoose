import { strictIntTransformer } from "src/libs/zod/transformers";
import * as z from "zod";

export const baseCrewQuerySchema = z.object({
  /**
   * Indicates whether the query should return a lean and short result.
   *
   * @example "lean=true" == { lean: true }
   * @example "lean=false" == { lean: false }
   * @example "lean=1" == { lean: true }
   * @example "lean=0" == { lean: false }
   * @example "lean" == { lean: true }
   * @default false
   */
  lean: z
    .enum(["true", "false", "0", "1", ""])
    .optional()
    .transform((val) => {
      if (val === "true" || val === "1" || val === "") return true;

      return false;
    }),

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

export const crewQuerySchema = baseCrewQuerySchema.optional().default({});

export type CrewQueryDto = z.infer<typeof crewQuerySchema>;
