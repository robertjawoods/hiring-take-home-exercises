import { parsePostcode } from "./postcode.ts";
import { InvalidPostcodeError, postcodeSurcharge } from "./surcharge.ts";

export type CatalogueEntry = {
  name: string;
  baseFeePence: number;
};

export type BasketItem = {
  itemId: string;
  quantity: number;
};

export type QuoteLine = {
  itemId: string;
  name: string;
  quantity: number;
  unitPricePence: number;
  lineTotalPence: number;
};

export type Quote = {
  postcode: string;
  lines: QuoteLine[];
  subtotalPence: number;
  postcodeSurchargePence: number;
  totalPence: number;
};

export class UnknownItemError extends Error {
  constructor(readonly itemIds: string[]) {
    super(`Unknown item(s): ${itemIds.join(", ")}`);
    this.name = "UnknownItemError";
  }
}

// quote = sum(baseFee * quantity) + postcodeSurcharge(postcode)

export function computeQuote(
  catalogue: ReadonlyMap<string, CatalogueEntry>,
  items: readonly BasketItem[],
  postcode: string,
): Quote {
  const parsed = parsePostcode(postcode);
  if (!parsed) throw new InvalidPostcodeError(postcode);

  const unknown = items.filter((item) => !catalogue.has(item.itemId)).map((item) => item.itemId);
  if (unknown.length > 0) throw new UnknownItemError(unknown);

  const lines = items.map(({ itemId, quantity }): QuoteLine => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new RangeError(`Quantity for "${itemId}" must be a positive integer, got ${quantity}`);
    }
    const { name, baseFeePence } = catalogue.get(itemId)!;
    return { itemId, name, quantity, unitPricePence: baseFeePence, lineTotalPence: baseFeePence * quantity };
  });

  const subtotalPence = lines.reduce((sum, line) => sum + line.lineTotalPence, 0);
  const postcodeSurchargePence = postcodeSurcharge(parsed.normalised);

  return {
    postcode: parsed.normalised,
    lines,
    subtotalPence,
    postcodeSurchargePence,
    totalPence: subtotalPence + postcodeSurchargePence,
  };
}
