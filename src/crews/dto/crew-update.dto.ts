import * as z from "zod";

import { nonEmptyStringRefiner } from "src/libs/zod/refiners";

export const baseCrewUpdateSchema = z.object({
  directors: z
    .object({
      add: z.array(z.string().refine(nonEmptyStringRefiner)).optional(),

      remove: z.array(z.string().refine(nonEmptyStringRefiner)).optional(),
    })
    .default({}),

  writers: z
    .object({
      add: z.array(z.string().refine(nonEmptyStringRefiner)).optional(),

      remove: z.array(z.string().refine(nonEmptyStringRefiner)).optional(),
    })
    .optional()
    .default({}),
});

export const crewUpdateSchema = baseCrewUpdateSchema.optional().default({});

export type CrewUpdateDto = z.infer<typeof crewUpdateSchema>;
