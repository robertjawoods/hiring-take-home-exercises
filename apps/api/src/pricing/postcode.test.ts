import { describe, expect, it } from "vitest";

import { parsePostcode } from "./postcode.ts";

describe("parsePostcode", () => {
  it.each([
    ["E1 6AN", "E1 6AN", "E"],
    ["e16an", "E1 6AN", "E"],
    ["  sw1a   1aa ", "SW1A 1AA", "SW"],
    ["EC1A 1BB", "EC1A 1BB", "EC"],
    ["M60 1NW", "M60 1NW", "M"],
    ["B33 8TH", "B33 8TH", "B"],
  ])("accepts %j as %s", (input, normalised, area) => {
    expect(parsePostcode(input)).toEqual({ normalised, area });
  });

  it.each(["", "E1", "12345", "E1 6A", "E1 6ANN", "1E 6AN", "SW1A-1AA", "not a postcode"])(
    "rejects %j",
    (input) => {
      expect(parsePostcode(input)).toBeNull();
    },
  );
});
