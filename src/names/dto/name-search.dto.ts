import * as z from "zod";

import { baseNameQuerySchema } from "./name-query.dto";

export const baseNameSearchSchema = baseNameQuerySchema.extend({
  /**
   * Query string to search for names
   *
   * @example "q=robert downey jr"
   */
  q: z.string().min(2).max(100),
});

export const nameSearchSchema = baseNameSearchSchema;

export type NameSearchDto = z.infer<typeof nameSearchSchema>;
