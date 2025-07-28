import * as z from "zod";

import { baseAkaCreateDto } from "./aka-create.dto";

export const baseAkaUpdateDto = baseAkaCreateDto.partial();

export const akaUpdateDto = baseAkaUpdateDto.extend({
  /**
   * The title ID this AKA is associated with
   *
   * @example {"titleId": "tt1234567"} -> "tt1234567"
   */
  titleId: z.string(),

  /**
   * The ordering number for this AkA, which is unique for each titleId.
   */
  ordering: z.number().int().min(1),
});

export type BaseAkaUpdateDto = z.infer<typeof baseAkaUpdateDto>;
export type AkaUpdateDto = z.infer<typeof akaUpdateDto>;
