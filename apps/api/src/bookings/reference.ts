import { randomInt } from "node:crypto";

// No I, L, O, 0 or 1, so references survive being read out over the phone.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LENGTH = 6;

export function generateBookingReference(): string {
  let code = "";
  for (let i = 0; i < LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `LT-${code}`;
}
