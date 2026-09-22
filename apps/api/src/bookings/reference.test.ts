import { describe, expect, it } from "vitest";

import { generateBookingReference } from "./reference.ts";

describe("generateBookingReference", () => {
  it("looks like LT-XXXXXX using only unambiguous characters", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateBookingReference()).toMatch(/^LT-[A-HJKMNP-Z2-9]{6}$/);
    }
  });
});
