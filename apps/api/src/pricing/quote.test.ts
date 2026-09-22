import { describe, expect, it } from "vitest";

import { InvalidPostcodeError } from "./surcharge.ts";
import { computeQuote, type CatalogueEntry } from "./quote.ts";

const catalogue = new Map<string, CatalogueEntry>([
  ["sofa-2-seater", { name: "Sofa (2-seater)", baseFeePence: 3500 }],
  ["bin-bag", { name: "Bin bag", baseFeePence: 500 }],
  ["cardboard-bundle", { name: "Cardboard bundle", baseFeePence: 750 }],
]);

describe("computeQuote", () => {
  it("sums baseFee * quantity per line and adds the London surcharge", () => {
    const quote = computeQuote(
      catalogue,
      [
        { itemId: "sofa-2-seater", quantity: 1 },
        { itemId: "bin-bag", quantity: 3 },
      ],
      "e1 6an",
    );

    expect(quote).toEqual({
      postcode: "E1 6AN",
      lines: [
        { itemId: "sofa-2-seater", name: "Sofa (2-seater)", quantity: 1, unitPricePence: 3500, lineTotalPence: 3500 },
        { itemId: "bin-bag", name: "Bin bag", quantity: 3, unitPricePence: 500, lineTotalPence: 1500 },
      ],
      subtotalPence: 5000,
      postcodeSurchargePence: 1500,
      totalPence: 6500,
    });
  });

  it("uses the standard surcharge outside London", () => {
    const quote = computeQuote(catalogue, [{ itemId: "bin-bag", quantity: 2 }], "M1 1AE");
    expect(quote.subtotalPence).toBe(1000);
    expect(quote.postcodeSurchargePence).toBe(500);
    expect(quote.totalPence).toBe(1500);
  });

  it("stays exact for fees that are awkward in floating point", () => {
    // 3 x £7.50 with a £5 surcharge: 2250 + 500. No rounding step anywhere.
    const quote = computeQuote(catalogue, [{ itemId: "cardboard-bundle", quantity: 3 }], "M1 1AE");
    expect(quote.totalPence).toBe(2750);
  });

  it("rejects unknown items, naming all of them", () => {
    expect(() =>
      computeQuote(
        catalogue,
        [
          { itemId: "bin-bag", quantity: 1 },
          { itemId: "piano", quantity: 1 },
          { itemId: "hot-tub", quantity: 1 },
        ],
        "E1 6AN",
      ),
    ).toThrow(expect.objectContaining({ name: "UnknownItemError", itemIds: ["piano", "hot-tub"] }));
  });

  it("rejects an invalid postcode", () => {
    expect(() => computeQuote(catalogue, [{ itemId: "bin-bag", quantity: 1 }], "nope")).toThrow(InvalidPostcodeError);
  });

  it.each([0, -1, 1.5, Number.NaN])("rejects quantity %s", (quantity) => {
    expect(() => computeQuote(catalogue, [{ itemId: "bin-bag", quantity }], "E1 6AN")).toThrow(RangeError);
  });
});
