import { basicSearchSchema } from "./basic-search.dto";

describe("BasicSearchDto", () => {
  it("should validate an empty query", () => {
    const result = basicSearchSchema.parse({
      q: "toy story",
    });

    expect(result).toEqual({
      q: "toy story",
      limit: 10,
      page: 1,
      filter: {},
      sort: {},
    });
  });

  it("should validate the date range refinement", async () => {
    const result = basicSearchSchema.parse({
      q: "toy story",
      filter: {
        since: "1980",
        until: "1990",
      },
    });

    expect(result).toEqual({
      q: "toy story",
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
    const result = basicSearchSchema.safeParse({
      q: "toy story",
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
    const result = basicSearchSchema.safeParse({
      q: "toy story",
      filter: {
        since: undefined,
        until: "1990",
      },
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      q: "toy story",
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
