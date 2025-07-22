import * as z from "zod";

export const baseCrewCreateSchema = z.object({});

export const crewCreateSchema = baseCrewCreateSchema.optional().default({});

export type CrewCreateDto = z.infer<typeof crewCreateSchema>;
