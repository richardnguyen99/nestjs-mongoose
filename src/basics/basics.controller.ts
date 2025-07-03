import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UsePipes,
  Version,
} from "@nestjs/common";

import { BasicsService } from "./basics.service";
import { ZodValidationPipe } from "src/validations/zod-validation.pipe";
import { BasicsSearchDto, basicsSearchSchema } from "./dto/basics-search.dto";

@Controller({
  version: "1",
  path: "basics",
})
export class BasicsController {
  constructor(private readonly basicsService: BasicsService) {}

  @Get("search")
  @UsePipes(new ZodValidationPipe(basicsSearchSchema))
  async searchByTitle(@Query() query: BasicsSearchDto) {
    const { q, limit, page, sort, filter } = query;
    console.log("Search query:", query);

    const result = await this.basicsService.searchByTitle(q, {
      limit,
      page,
      sort,
      filter,
    });

    return result;
  }

  @Get(":tconst")
  async getByTconst(@Param("tconst") tconst: string) {
    const result = await this.basicsService.findByTconst(tconst);

    if (!result) {
      throw new NotFoundException(`Title with tconst=${tconst} not found`);
    }

    return result;
  }
}
