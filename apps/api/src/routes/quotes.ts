import { Hono } from "hono";

import { quoteFor } from "../bookings/service.ts";
import { quoteBody, validate } from "../schemas.ts";

export const quoteRoutes = new Hono().post("/", validate("json", quoteBody), async (c) => {
  const { items, postcode } = c.req.valid("json");
  return c.json(await quoteFor(items, postcode));
});
