import { parsePostcode } from "./postcode.ts";

// calling london more expensive than outside it for the purposes of this task
export const LONDON_SURCHARGE_PENCE = 1500;
export const STANDARD_SURCHARGE_PENCE = 500;

// fairly contrived
const LONDON_AREAS: ReadonlySet<string> = new Set(["E", "EC", "N", "NW", "SE", "SW", "W", "WC"]);

export class InvalidPostcodeError extends Error {
  constructor(readonly postcode: string) {
    super(`"${postcode}" is not a valid UK postcode`);
    this.name = "InvalidPostcodeError";
  }
}


export function postcodeSurcharge(postcode: string): number {
  const parsed = parsePostcode(postcode);
  if (!parsed) throw new InvalidPostcodeError(postcode);
  return LONDON_AREAS.has(parsed.area) ? LONDON_SURCHARGE_PENCE : STANDARD_SURCHARGE_PENCE;
}
