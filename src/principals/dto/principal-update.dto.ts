import * as z from "zod";

import { basePrincipalCreateSchema } from "./principal-create.dto";

export const basePrincipalUpdateSchema = basePrincipalCreateSchema.pick({
  category: true,
  job: true,
  characters: true,
});

export const principalUpdateSchema = basePrincipalUpdateSchema
  .partial()
  .extend({
    /**
     * The required ordering of the principal role in the title.
     *
     * @example { ordering: 1 }
     */
    ordering: z.number().int().min(1, "ordering must be a positive integer"),
  });

export type PrincipalUpdateDto = z.infer<typeof principalUpdateSchema>;
