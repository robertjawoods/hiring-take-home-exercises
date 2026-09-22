import { describe, expect, it } from "vitest";

import {
  InvalidPostcodeError,
  LONDON_SURCHARGE_PENCE,
  STANDARD_SURCHARGE_PENCE,
  postcodeSurcharge,
} from "./surcharge.ts";

describe("postcodeSurcharge", () => {
  it.each(["E1 6AN", "E2 8AA", "SE1 7PB", "SW1A 1AA", "W1A 0AX", "WC2N 5DU", "EC1A 1BB", "N1 9GU", "NW1 6XE"])(
    "charges the London rate for %s",
    (postcode) => {
      expect(postcodeSurcharge(postcode)).toBe(LONDON_SURCHARGE_PENCE);
    },
  );

  it.each(["M1 1AE", "B33 8TH", "EH1 1YZ", "BS1 4DJ"])("charges the standard rate for %s", (postcode) => {
    expect(postcodeSurcharge(postcode)).toBe(STANDARD_SURCHARGE_PENCE);
  });

  // A prefix match on "E" or "W" would wrongly catch these.
  it.each(["EN1 1AA", "EH1 1YZ", "WD17 1AA", "WA1 1AA", "SS1 1AA", "SL1 1AA"])(
    "does not treat %s as London just because it starts with a London letter",
    (postcode) => {
      expect(postcodeSurcharge(postcode)).toBe(STANDARD_SURCHARGE_PENCE);
    },
  );

  it("ignores case and spacing", () => {
    expect(postcodeSurcharge("se17pb")).toBe(LONDON_SURCHARGE_PENCE);
  });

  it("throws on an invalid postcode", () => {
    expect(() => postcodeSurcharge("nope")).toThrow(InvalidPostcodeError);
  });
});
