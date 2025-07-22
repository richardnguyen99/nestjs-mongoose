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
});

export const crewQuerySchema = baseCrewQuerySchema.optional().default({});

export type CrewQueryDto = z.infer<typeof crewQuerySchema>;
