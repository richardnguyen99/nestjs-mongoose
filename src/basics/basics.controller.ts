import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Version,
} from "@nestjs/common";

import { BasicsService } from "./basics.service";

@Controller({
  version: "1",
  path: "basics",
})
export class BasicsController {
  constructor(private readonly basicsService: BasicsService) {}

  @Get(":tconst")
  async getByTconst(@Param("tconst") tconst: string) {
    const result = await this.basicsService.findByTconst(tconst);

    if (!result) {
      throw new NotFoundException(`Title with tconst=${tconst} not found`);
    }

    return result;
  }
}
