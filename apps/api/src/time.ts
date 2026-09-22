import { DateTime } from "luxon";

const ZONE = "Europe/London";

/** Today's calendar date in London, as YYYY-MM-DD. */
export function londonToday(now: Date = new Date()): string {
  return DateTime.fromJSDate(now, { zone: ZONE }).toFormat("yyyy-MM-dd");
}

/** True for a real calendar date in YYYY-MM-DD form. */
export function isCalendarDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && DateTime.fromISO(value, { zone: ZONE }).isValid;
}

/** The half-open UTC interval [start, end) covering a London calendar day. Days can be 23 or 25 hours long. */
export function londonDayBounds(date: string): { start: Date; end: Date } {
  const start = DateTime.fromISO(date, { zone: ZONE }).startOf("day");
  return { start: start.toJSDate(), end: start.plus({ days: 1 }).toJSDate() };
}
