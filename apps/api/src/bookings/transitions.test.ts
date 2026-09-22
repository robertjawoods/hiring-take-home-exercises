import { describe, expect, it } from "vitest";

import { canApply } from "./transitions.ts";

describe("booking transitions", () => {
  it("only assigns PENDING bookings", () => {
    expect(canApply("assign", "PENDING")).toBe(true);
    expect(canApply("assign", "ASSIGNED")).toBe(false);
    expect(canApply("assign", "COMPLETED")).toBe(false);
  });

  it("only completes ASSIGNED bookings", () => {
    expect(canApply("complete", "ASSIGNED")).toBe(true);
    expect(canApply("complete", "PENDING")).toBe(false);
    expect(canApply("complete", "COMPLETED")).toBe(false);
  });
});
