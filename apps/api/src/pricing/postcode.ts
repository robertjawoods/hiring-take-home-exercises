// Outward code: 1-2 letters (area), a digit, then an optional digit/letter (e.g. E1, SW1A, M60, EC1A).
// Inward code: a digit and two letters (e.g. 6AN).
const UK_POSTCODE = /^([A-Z]{1,2})([0-9][A-Z0-9]?)([0-9][A-Z]{2})$/;

export type ParsedPostcode = {
  /** Canonical form, e.g. "SW1A 1AA". */
  normalised: string;
  /** Leading letters of the outward code, e.g. "SW". */
  area: string;
};

/** Returns null when the input is not a plausible UK postcode. Case and spacing are ignored. */
export function parsePostcode(input: string): ParsedPostcode | null {
  const match = UK_POSTCODE.exec(input.replace(/\s+/g, "").toUpperCase());
  if (!match) return null;
  const [, area, district, inward] = match;
  return { normalised: `${area}${district} ${inward}`, area: area! };
}
