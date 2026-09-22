import { parsePostcode } from "./postcode.ts";

export const LONDON_SURCHARGE_PENCE = 1500;
export const STANDARD_SURCHARGE_PENCE = 500;

// Royal Mail postcode areas that make up inner London. Deliberately excludes outer areas
// such as EN, HA, CR and BR, which are cheaper to reach and have easier parking.
const LONDON_AREAS: ReadonlySet<string> = new Set(["E", "EC", "N", "NW", "SE", "SW", "W", "WC"]);

export class InvalidPostcodeError extends Error {
  constructor(readonly postcode: string) {
    super(`"${postcode}" is not a valid UK postcode`);
    this.name = "InvalidPostcodeError";
  }
}

/** Surcharge in pence for collecting from the given postcode. Throws InvalidPostcodeError if unparseable. */
export function postcodeSurcharge(postcode: string): number {
  const parsed = parsePostcode(postcode);
  if (!parsed) throw new InvalidPostcodeError(postcode);
  return LONDON_AREAS.has(parsed.area) ? LONDON_SURCHARGE_PENCE : STANDARD_SURCHARGE_PENCE;
}
