import { nonEmptyStringRefiner } from "src/libs/zod/refiners";
import * as z from "zod";

export const baseCrewCreateSchema = z.object({
  /**
   * The unique identifier for the title.
   *
   * @example { directors: ['nm0751577', 'nm0751648'] }
   */
  directors: z.array(z.string().refine(nonEmptyStringRefiner)),

  /**
   * The unique identifier for the title.
   *
   * @example { writers: ['nm0751577', 'nm0751648'] }
   */
  writers: z.array(z.string().refine(nonEmptyStringRefiner)),
});

export const crewCreateSchema = baseCrewCreateSchema.extend({
  /**
   * The unique identifier for the title.
   *
   * @example { tconst: 'tt1234567' }
   */
  tconst: z.string().refine(nonEmptyStringRefiner),
});

export type CrewCreateDto = z.infer<typeof crewCreateSchema>;
