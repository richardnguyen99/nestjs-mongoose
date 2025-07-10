import { PipeTransform, ArgumentMetadata, Logger } from "@nestjs/common";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger("ZodValidationPipe");

  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== "body" && metadata.type !== "query") {
      return value;
    }

    const parsedValue = this.schema.parse(value);
    return parsedValue;
  }
}
