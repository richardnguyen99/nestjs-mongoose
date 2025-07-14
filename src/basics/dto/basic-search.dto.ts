import { z } from "zod";

import { baseBasicQuerySchema } from "./basic-query.dto";

export const baseBasicSearchSchema = baseBasicQuerySchema.extend({
  /**
   * Search query string for basic titles on primary title and original title.
   * Throws an error if:
   * - The search query is not provided.
   *
   * @example "q=toy%20story" -> { q: "toy story" }
   */
  q: z.string().min(1, "Search query must be at least 1 character long"),
});

export const basicSearchSchema = baseBasicSearchSchema.required().refine(
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

export type BasicSearchDto = z.infer<typeof basicSearchSchema>;
