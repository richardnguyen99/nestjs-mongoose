import { z } from "zod";

import { basicCreateSchema } from "./basic-create.dto";

export const basicUpdateSchema = basicCreateSchema
  .omit({ tconst: true })
  .partial();

export type BasicUpdateDto = z.infer<typeof basicUpdateSchema>;
