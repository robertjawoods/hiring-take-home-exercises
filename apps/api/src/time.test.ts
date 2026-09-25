import { describe, expect, it } from "vitest";

import { getDayBounds, getDate } from "./time.ts";

const iso = ({ start, end }: { start: Date; end: Date }) => [start.toISOString(), end.toISOString()];

describe("londonDayBounds", () => {
  it("is UTC midnight to midnight in winter", () => {
    expect(iso(getDayBounds("2026-01-15"))).toEqual(["2026-01-15T00:00:00.000Z", "2026-01-16T00:00:00.000Z"]);
  });

  it("starts an hour early (UTC) in summer", () => {
    expect(iso(getDayBounds("2026-07-15"))).toEqual(["2026-07-14T23:00:00.000Z", "2026-07-15T23:00:00.000Z"]);
  });

  it("is 23 hours long when the clocks go forward", () => {
    expect(iso(getDayBounds("2026-03-29"))).toEqual(["2026-03-29T00:00:00.000Z", "2026-03-29T23:00:00.000Z"]);
  });

  it("is 25 hours long when the clocks go back", () => {
    expect(iso(getDayBounds("2026-10-25"))).toEqual(["2026-10-24T23:00:00.000Z", "2026-10-26T00:00:00.000Z"]);
  });

  it("rolls over month and year ends", () => {
    expect(iso(getDayBounds("2025-12-31"))).toEqual(["2025-12-31T00:00:00.000Z", "2026-01-01T00:00:00.000Z"]);
  });
});

describe("londonToday", () => {
  it("uses the London date, not the UTC date, just after midnight in summer", () => {
    expect(getDate(new Date("2026-07-14T23:30:00Z"))).toBe("2026-07-15");
  });

  it("matches UTC in winter", () => {
    expect(getDate(new Date("2026-01-15T23:30:00Z"))).toBe("2026-01-15");
  });
});
