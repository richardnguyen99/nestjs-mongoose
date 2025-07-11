import * as z from "zod";

import { baseNameQuerySchema } from "./name-query.dto";

export const baseNameSearchSchema = baseNameQuerySchema.extend({
  q: z.string().min(2).max(100).optional(),
});

export const nameSearchSchema = baseNameSearchSchema.optional().default({});

export type NameSearchDto = z.infer<typeof nameSearchSchema>;
