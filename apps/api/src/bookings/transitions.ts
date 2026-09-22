import type { Status } from "database";

export type BookingAction = "assign" | "complete";

/**
 * The whole booking lifecycle: PENDING -> ASSIGNED -> COMPLETED.
 * Nothing moves backwards, and COMPLETED is terminal.
 */
export const TRANSITIONS: Record<BookingAction, { from: Status; to: Status }> = {
  assign: { from: "PENDING", to: "ASSIGNED" },
  complete: { from: "ASSIGNED", to: "COMPLETED" },
};

export function canApply(action: BookingAction, current: Status): boolean {
  return TRANSITIONS[action].from === current;
}
