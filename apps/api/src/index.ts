import { serve } from "@hono/node-server";
import { db } from "database";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

app.get("/catalogue", async (c) => c.json(await db.item.findMany({ orderBy: { name: "asc" } })));



const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, ({ port }) => {
  console.log(`api listening on http://localhost:${port}`);
});
