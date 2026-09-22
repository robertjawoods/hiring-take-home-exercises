import type { Prisma } from "database";

export const bookingInclude = {
  lineItems: { include: { item: true }, orderBy: { item: { name: "asc" } } },
  assignedCrew: true,
} satisfies Prisma.BookingInclude;

export type BookingRecord = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

/** Maps a stored booking to the public API shape: slugs as ids, status/reference renamed, nothing internal leaked. */
export function serializeBooking(booking: BookingRecord) {
  return {
    reference: booking.bookingReference,
    status: booking.bookingStatus,
    customer: {
      name: booking.customerName,
      email: booking.customerEmail,
      phone: booking.customerPhone,
    },
    quote: {
      postcode: booking.postcode,
      lines: booking.lineItems.map((line) => ({
        itemId: line.item.slug,
        name: line.item.name,
        quantity: line.quantity,
        unitPricePence: line.unitPricePence,
        lineTotalPence: line.lineTotalPence,
      })),
      subtotalPence: booking.subtotalPence,
      postcodeSurchargePence: booking.postcodeSurchargePence,
      totalPence: booking.quotePence,
    },
    crew: booking.assignedCrew
      ? { id: booking.assignedCrew.slug, name: booking.assignedCrew.name, vehicle: booking.assignedCrew.vehicle }
      : null,
    createdAt: booking.createdAt.toISOString(),
    assignedAt: booking.assignedAt?.toISOString() ?? null,
    completedAt: booking.completedAt?.toISOString() ?? null,
  };
}
