import { db } from "database";
import { Hono } from "hono";

import { AppError } from "../errors.ts";
import { createBooking, getBooking, listBookings, transitionBooking } from "../bookings/service.ts";
import { serializeBooking } from "../bookings/serialize.ts";
import { assignBody, createBookingBody, listBookingsQuery, referenceParam, validate } from "../schemas.ts";
import { getDate } from "../time.ts";

export const bookingRoutes = new Hono()
  .post("/", validate("json", createBookingBody), async (c) => {
    const booking = await createBooking(c.req.valid("json"));
    return c.json(serializeBooking(booking), 201);
  })
  .get("/", validate("query", listBookingsQuery), async (c) => {
    const { date = getDate() } = c.req.valid("query");
    const bookings = await listBookings(date);
    return c.json({ date, bookings: bookings.map(serializeBooking) }, 200);
  })
  .get("/:reference", validate("param", referenceParam), async (c) => {
    return c.json(serializeBooking(await getBooking(c.req.valid("param").reference)), 200);
  })
  .post("/:reference/assign", validate("param", referenceParam), validate("json", assignBody), async (c) => {
    const { reference } = c.req.valid("param");
    const { crewId } = c.req.valid("json");

    const crew = await db.crew.findUnique({ where: { slug: crewId } });
    if (!crew) throw new AppError(422, "UNKNOWN_CREW", `No crew with id ${crewId}`);

    const booking = await transitionBooking(reference, "assign", { assignedCrewId: crew.id, assignedAt: new Date() });
    return c.json(serializeBooking(booking), 200);
  })
  .post("/:reference/complete", validate("param", referenceParam), async (c) => {
    const booking = await transitionBooking(c.req.valid("param").reference, "complete", { completedAt: new Date() });
    return c.json(serializeBooking(booking), 200);
  });
