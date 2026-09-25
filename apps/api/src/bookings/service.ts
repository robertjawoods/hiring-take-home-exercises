import { Prisma, db } from "database";

import { AppError } from "../errors.ts";
import { computeQuote, type BasketItem } from "../pricing/index.ts";
import { getDayBounds } from "../time.ts";
import { generateBookingReference } from "./reference.ts";
import { bookingInclude } from "./serialize.ts";
import { TRANSITIONS, type BookingAction } from "./transitions.ts";

export type NewBooking = {
  items: BasketItem[];
  postcode: string;
  customer: { name: string; email: string; phone?: string | undefined };
};

const MAX_REFERENCE_ATTEMPTS = 5;

/** Loads only the catalogue entries a basket refers to, keyed by slug. Unknown slugs are simply absent. */
async function loadCatalogue(items: readonly BasketItem[]) {
  const rows = await db.item.findMany({ where: { slug: { in: items.map((item) => item.itemId) } } });
  return new Map(rows.map((row) => [row.slug, { dbId: row.id, name: row.name, baseFeePence: row.baseFeePence }]));
}

export async function quoteFor(items: BasketItem[], postcode: string) {
  return computeQuote(await loadCatalogue(items), items, postcode);
}

export async function createBooking({ items, postcode, customer }: NewBooking) {
  // Price is always computed here; the client never supplies a total.
  const catalogue = await loadCatalogue(items);
  const quote = computeQuote(catalogue, items, postcode);

  // run until no collision
  for (let attempt = 1; ; attempt++) {
    try {
      return await db.booking.create({
        data: {
          bookingReference: generateBookingReference(),
          postcode: quote.postcode,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone ?? null,
          subtotalPence: quote.subtotalPence,
          postcodeSurchargePence: quote.postcodeSurchargePence,
          quotePence: quote.totalPence,
          lineItems: {
            create: quote.lines.map((line) => ({
              itemId: catalogue.get(line.itemId)!.dbId,
              quantity: line.quantity,
              unitPricePence: line.unitPricePence,
              lineTotalPence: line.lineTotalPence,
            })),
          },
        },
        include: bookingInclude,
      });
    } catch (error) {
      // The reference is the only unique column here, so P2002 means a collision: draw another.
      const collision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!collision || attempt >= MAX_REFERENCE_ATTEMPTS) throw error;
    }
  }
}

export function listBookings(date: string) {
  const { start, end } = getDayBounds(date);
  return db.booking.findMany({
    where: { createdAt: { gte: start, lt: end } },
    include: bookingInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function getBooking(reference: string) {
  const booking = await db.booking.findUnique({ where: { bookingReference: reference }, include: bookingInclude });
  if (!booking) throw new AppError(404, "NOT_FOUND", `No booking with reference ${reference}`);
  return booking;
}

/**
 * Applies a transition as a single conditional UPDATE ("... WHERE status = <expected>").
 * If two requests race, exactly one matches; the other sees count 0 and gets a 409.
 */
export async function transitionBooking(
  reference: string,
  action: BookingAction,
  data: Prisma.BookingUncheckedUpdateManyInput,
) {
  const { from, to } = TRANSITIONS[action];
  const { count } = await db.booking.updateMany({
    where: { bookingReference: reference, bookingStatus: from },
    data: { ...data, bookingStatus: to },
  });

  const booking = await getBooking(reference); // 404s if it never existed
  if (count === 0) {
    throw new AppError(
      409,
      "INVALID_TRANSITION",
      `Cannot ${action} a booking that is ${booking.bookingStatus}; it must be ${from}`,
      { from: booking.bookingStatus, attempted: to },
    );
  }
  return booking;
}
