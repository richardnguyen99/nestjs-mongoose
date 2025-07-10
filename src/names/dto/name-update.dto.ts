import { z } from "zod";

import { nameCreateSchema } from "./name-create.dto";

export const nameUpdateSchema = nameCreateSchema.partial();

export type NameUpdateDto = z.infer<typeof nameUpdateSchema>;
