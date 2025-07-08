import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== "body" || metadata.data !== "query") {
      return value;
    }

    const parsedValue = this.schema.parse(value);
    return parsedValue;
  }
}
