import * as z from "zod";

import { nonEmptyStringRefiner } from "src/libs/zod/refiners";

const updateOperationSchema = z.object(
  {
    add: z
      .array(
        z
          .string({ invalid_type_error: "must be a string" })
          .refine(nonEmptyStringRefiner, {
            message: "must be a non-empty string",
          }),
        {
          invalid_type_error: "must be an array of strings",
        },
      )
      .optional(),

    remove: z
      .array(
        z
          .string({
            invalid_type_error: "must be a string",
          })
          .refine(nonEmptyStringRefiner, {
            message: "must be a non-empty string",
          }),
        {
          invalid_type_error: "must be an array of strings",
        },
      )
      .optional(),
  },
  {
    invalid_type_error:
      "must be an object with optional 'add' and 'remove' arrays",
  },
);

export const baseCrewUpdateSchema = z.object({
  directors: updateOperationSchema.optional().default({}),

  writers: updateOperationSchema.optional().default({}),
});

export const crewUpdateSchema = baseCrewUpdateSchema.optional().default({});

export type CrewUpdateDto = z.infer<typeof crewUpdateSchema>;
