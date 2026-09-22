import { db } from "database";
import { Hono } from "hono";

export const catalogueRoutes = new Hono().get("/", async (c) => {
  const rows = await db.item.findMany({ orderBy: { name: "asc" } });
  return c.json({
    items: rows.map((row) => ({ id: row.slug, name: row.name, category: row.category, baseFeePence: row.baseFeePence })),
  });
});
