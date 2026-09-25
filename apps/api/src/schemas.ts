import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import { z } from "zod";

import { errorBody } from "./errors.ts";
import { parsePostcode } from "./pricing/index.ts";
import { isValidDate } from "./time.ts";

const postcode = z
  .string()
  .refine((value) => parsePostcode(value) !== null, "Enter a valid UK postcode")
  .transform((value) => parsePostcode(value)!.normalised);

const basketItems = z
  .array(
    z.object({
      itemId: z.string().min(1),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .min(1, "Add at least one item")
  .max(50)
  .refine((items) => new Set(items.map((item) => item.itemId)).size === items.length, "Each item may only appear once");

export const quoteBody = z.object({ items: basketItems, postcode });

export const createBookingBody = z.object({
  items: basketItems,
  postcode,
  customer: z.object({
    name: z.string().trim().min(1, "Enter your name").max(100),
    email: z.string().trim().max(254).pipe(z.email("Enter a valid email address")),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{7,20}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  }),
});

export const assignBody = z.object({ crewId: z.string().min(1) });

export const listBookingsQuery = z.object({
  date: z.string().refine(isValidDate, "Use a real date in YYYY-MM-DD format").optional(),
});

export const referenceParam = z.object({
  reference: z.string().trim().min(1).transform((value) => value.toUpperCase()),
});

/** zValidator that reports failures in the API's error envelope. */
export const validate = <T extends z.ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
      return c.json(errorBody("VALIDATION_ERROR", issues[0]?.message ?? "Invalid request", { issues }), 400);
    }
  });
