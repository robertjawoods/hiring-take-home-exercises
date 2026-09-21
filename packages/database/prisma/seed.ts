import { readFile } from "node:fs/promises";

import { PrismaPg } from "@prisma/adapter-pg";

import { Category, PrismaClient, VehicleType } from "../generated/prisma/client.ts";

// Standalone runs (e.g. `tsx prisma/seed.ts`) don't go through prisma.config.ts.
try {
  process.loadEnvFile(new URL("../../../.env", import.meta.url));
} catch {}

type CatalogueEntry = {
  id: string;
  name: string;
  category: string;
  baseFee: number; // GBP
};

type CrewEntry = {
  id: string;
  name: string;
  vehicle: string;
};

const vehicleTypes: Record<string, VehicleType> = {
  "luton van": VehicleType.LUTON,
  "cage van": VehicleType.CAGE,
};

async function readSeed<T>(file: string): Promise<T> {
  const raw = await readFile(new URL(`../../../seed/${file}`, import.meta.url), "utf8");
  return JSON.parse(raw) as T;
}

function toCategory(value: string): Category {
  const category = Category[value.toUpperCase() as keyof typeof Category];
  if (!category) throw new Error(`Unknown category "${value}" in seed/catalogue.json`);
  return category;
}

function toVehicleType(value: string): VehicleType {
  const vehicle = vehicleTypes[value.trim().toLowerCase()];
  if (!vehicle) throw new Error(`Unknown vehicle "${value}" in seed/crews.json`);
  return vehicle;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env["DATABASE_URL"] }),
});

async function main() {
  const [catalogue, crews] = await Promise.all([
    readSeed<CatalogueEntry[]>("catalogue.json"),
    readSeed<CrewEntry[]>("crews.json"),
  ]);

  for (const entry of catalogue) {
    const data = {
      name: entry.name,
      category: toCategory(entry.category),
      baseFeePence: Math.round(entry.baseFee * 100),
    };
    await prisma.item.upsert({
      where: { slug: entry.id },
      create: { slug: entry.id, ...data },
      update: data,
    });
  }

  for (const entry of crews) {
    const data = {
      name: entry.name,
      vehicle: toVehicleType(entry.vehicle),
    };
    await prisma.crew.upsert({
      where: { slug: entry.id },
      create: { slug: entry.id, ...data },
      update: data,
    });
  }

  console.log(`Seeded ${catalogue.length} items and ${crews.length} crews`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
