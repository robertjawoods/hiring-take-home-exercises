import { API_URL } from '$app/env/private';
import { error } from '@sveltejs/kit';
import { hc } from 'hono/client';
import type { ClientResponse } from 'hono/client';
import type { AppType, ApiError } from 'api/src/app.ts';

export const api = hc<AppType>(API_URL);

/** The JSON payload of whichever `ClientResponse` union member has a literal `ok: true` status. */
export type SuccessJson<R> = Extract<R, { ok: true }> extends ClientResponse<infer T, number, string>
	? T
	: never;

/**
 * Parses a Hono RPC response, throwing SvelteKit's error() with the API's own message on
 * failure. `R` is inferred from the endpoint itself — nothing to annotate at the call site.
 * Hono types each status code's `ok` as a literal (`true` for 2xx, `false` otherwise), so
 * narrowing on `res.ok` below correctly narrows the response union to the success member.
 */
export async function unwrap<R extends ClientResponse<unknown, number, string>>(
	res: R
): Promise<SuccessJson<R>> {
	if (res.ok) return (await res.json()) as SuccessJson<R>;
	const body = (await res.json()) as unknown as ApiError;
	return error(res.status as Parameters<typeof error>[0], body.error.message) as never;
}

/** For form handlers that need to branch on the error code before choosing invalid() vs error(). */
export async function parseFailure(
	res: ClientResponse<unknown>
): Promise<ApiError['error'] | null> {
	if (res.ok) return null;
	return ((await res.json()) as unknown as ApiError).error;
}
