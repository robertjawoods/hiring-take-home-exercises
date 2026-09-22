import { db } from "database";
import { Hono } from "hono";

export const crewRoutes = new Hono().get("/", async (c) => {
  const rows = await db.crew.findMany({ orderBy: { slug: "asc" } });
  return c.json({ crews: rows.map((row) => ({ id: row.slug, name: row.name, vehicle: row.vehicle })) });
});
