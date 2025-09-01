import * as z from "zod";

import { booleanishTypeTransformer } from "src/libs/zod/transformers";

export const baseCrewQuerySchema = z.object({
  include: z
    .object({
      /**
       * Option to include the directors field of a crew document based on directors
       */
      directors: z
        .enum(["true", "false", "0", "1"])
        .optional()
        .transform(booleanishTypeTransformer),

      /**
       * Option to include the writers field of a crew document based on writers
       */
      writers: z
        .enum(["true", "false", "0", "1"])
        .optional()
        .transform(booleanishTypeTransformer),

      /**
       * Option to include the title field of a crew document based on tconst
       */
      title: z
        .enum(["true", "false", "0", "1"])
        .optional()
        .transform(booleanishTypeTransformer),
    })
    .optional(),
});

export const crewQuerySchema = baseCrewQuerySchema.optional().default({});

export type CrewQueryDto = z.infer<typeof crewQuerySchema>;
