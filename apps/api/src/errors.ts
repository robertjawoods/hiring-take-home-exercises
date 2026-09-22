import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { InvalidPostcodeError, UnknownItemError } from "./pricing/index.ts";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNKNOWN_ITEM"
  | "UNKNOWN_CREW"
  | "INVALID_TRANSITION"
  | "INTERNAL";

/** Every non-2xx response has this shape. */
export type ApiError = {
  error: { code: ErrorCode; message: string; details?: unknown };
};

export class AppError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorBody = (code: ErrorCode, message: string, details?: unknown): ApiError => ({
  error: { code, message, ...(details === undefined ? {} : { details }) },
});

export function onError(error: Error, c: Context) {
  if (error instanceof AppError) {
    return c.json(errorBody(error.code, error.message, error.details), error.status);
  }
  // Domain errors from the pricing module. Bodies are validated first, so these are backstops.
  if (error instanceof UnknownItemError) {
    return c.json(errorBody("UNKNOWN_ITEM", error.message, { itemIds: error.itemIds }), 422);
  }
  if (error instanceof InvalidPostcodeError) {
    return c.json(errorBody("VALIDATION_ERROR", error.message), 400);
  }
  // Raised by Hono itself, e.g. a malformed JSON body.
  if (error instanceof HTTPException && error.status === 400) {
    return c.json(errorBody("VALIDATION_ERROR", error.message), 400);
  }
  console.error(error);
  return c.json(errorBody("INTERNAL", "Something went wrong"), 500);
}

export function notFound(c: Context) {
  return c.json(errorBody("NOT_FOUND", `No route for ${c.req.method} ${c.req.path}`), 404);
}
