import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { notFound, onError } from "./errors.ts";
import { bookingRoutes } from "./routes/bookings.ts";
import { catalogueRoutes } from "./routes/catalogue.ts";
import { crewRoutes } from "./routes/crews.ts";
import { quoteRoutes } from "./routes/quotes.ts";

export const app = new Hono()
  .use(logger())
  .use(cors({ origin: (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(",") }))
  .get("/health", (c) => c.json({ ok: true }))
  .route("/catalogue", catalogueRoutes)
  .route("/crews", crewRoutes)
  .route("/quotes", quoteRoutes)
  .route("/bookings", bookingRoutes);

app.onError(onError);
app.notFound(notFound);

export type AppType = typeof app;
export type { ApiError } from "./errors.ts";
