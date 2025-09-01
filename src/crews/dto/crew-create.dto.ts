import * as z from "zod";

import { nonEmptyStringRefiner } from "src/libs/zod/refiners";

export const baseCrewCreateSchema = z.object({
  /**
   * The unique identifier for the title.
   *
   * @example { directors: ['nm0751577', 'nm0751648'] }
   */
  directors: z.array(
    z
      .string({
        invalid_type_error: "must be a string",
      })
      .refine(nonEmptyStringRefiner, {
        message: "must be a non-empty string",
      }),
    {
      invalid_type_error: "must be an array of strings",
      required_error: "must be provided",
    },
  ),

  /**
   * The unique identifier for the title.
   *
   * @example { writers: ['nm0751577', 'nm0751648'] }
   */
  writers: z.array(
    z
      .string({
        invalid_type_error: "must be a string",
      })
      .refine(nonEmptyStringRefiner, {
        message: "must be a non-empty string",
      }),
    {
      invalid_type_error: "must be an array of strings",
      required_error: "must be provided",
    },
  ),
});

export const crewCreateSchema = baseCrewCreateSchema
  .extend({
    /**
     * The unique identifier for the title.
     *
     * @example { tconst: 'tt1234567' }
     */
    tconst: z.string().refine(nonEmptyStringRefiner),
  })
  .required();

export type CrewCreateDto = z.infer<typeof crewCreateSchema>;
export type BaseCrewCreateDto = z.infer<typeof baseCrewCreateSchema>;
