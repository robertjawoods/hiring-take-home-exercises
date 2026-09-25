import { DateTime } from "luxon";

// hard coded timezone, would parameterise 
const ZONE = "Europe/London";

export function getDate(now: Date = new Date()): string {
  return DateTime.fromJSDate(now, { zone: ZONE }).toFormat("yyyy-MM-dd");
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && DateTime.fromISO(value, { zone: ZONE }).isValid;
}

export function getDayBounds(date: string): { start: Date; end: Date } {
  const start = DateTime.fromISO(date, { zone: ZONE }).startOf("day");
  return { start: start.toJSDate(), end: start.plus({ days: 1 }).toJSDate() };
}
