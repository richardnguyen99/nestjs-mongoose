import { z } from "zod";

import { baseBasicQuerySchema, basicQuerySchema } from "./basic-query.dto";

describe("BasicQueryDto", () => {
  it("should validate an empty query", () => {
    const result = baseBasicQuerySchema.parse({});

    expect(result).toEqual({
      limit: 10,
      page: 1,
      filter: {},
      sort: {},
    });
  });

  it("should validate the date range refinement", async () => {
    const result = basicQuerySchema.parse({
      filter: {
        since: "1980",
        until: "1990",
      },
    });

    expect(result).toEqual({
      limit: 10,
      page: 1,
      sort: {},
      filter: {
        since: 1980,
        until: 1990,
      },
    });
  });

  it("should invalidate an invalid date range filter", () => {
    const result = basicQuerySchema.safeParse({
      filter: {
        since: "2000",
        until: "1980",
      },
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.issues).toHaveLength(1);
    expect(result.error?.issues[0].message).toBe(
      "Filter 'until' must be greater than or equal to 'since'",
    );
  });

  it("should ignore the date range filter when either since or until is not a valid date", () => {
    const result = basicQuerySchema.safeParse({
      filter: {
        since: undefined,
        until: "1990",
      },
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      limit: 10,
      page: 1,
      sort: {},
      filter: {
        since: undefined,
        until: 1990,
      },
    });
  });
});
