import { z } from 'zod';
import { error, invalid } from '@sveltejs/kit';
import { form, query } from '$app/server';
import { api, unwrap, parseFailure } from '#lib/server/api';
import type { SuccessJson } from '#lib/server/api';

const basketInput = z
	.array(
		z.object({
			itemId: z.string().min(1),
			quantity: z.number().int().min(1).max(99)
		})
	)
	.min(1, 'Add at least one item')
	.max(50);

const createBookingInput = z.object({
	items: basketInput,
	postcode: z.string().min(1, 'Enter a postcode'),
	customer: z.object({
		name: z.string().trim().min(1, 'Enter your name').max(100),
		email: z.string().trim().max(254).pipe(z.email('Enter a valid email address'))
	})
});

const assignInput = z.object({
	reference: z.string().min(1),
	crewId: z.string().min(1, 'Choose a crew')
});

const completeInput = z.object({
	reference: z.string().min(1)
});

/** Always "today" — the API's own Europe/London default; no date param is exposed. */
export const getBookings = query(async () => unwrap(await api.bookings.$get({ query: {} })));

export const createBooking = form(
	createBookingInput,
	async ({ items, postcode, customer }, issue) => {
		const res = await api.bookings.$post({ json: { items, postcode, customer } });
		const failure = await parseFailure(res);
		if (failure) {
			if (failure.code === 'VALIDATION_ERROR') throw invalid(issue.postcode(failure.message));
			if (failure.code === 'UNKNOWN_ITEM') throw invalid(failure.message);
			error(res.status as Parameters<typeof error>[0], failure.message);
		}
		return (await res.json()) as SuccessJson<typeof res>;
	}
);

export const assignCrew = form(assignInput, async ({ reference, crewId }, issue) => {
	const res = await api.bookings[':reference'].assign.$post({
		param: { reference },
		json: { crewId }
	});
	const failure = await parseFailure(res);
	if (failure) {
		if (failure.code === 'UNKNOWN_CREW') throw invalid(issue.crewId(failure.message));
		if (failure.code === 'INVALID_TRANSITION') throw invalid(failure.message);
		error(res.status as Parameters<typeof error>[0], failure.message);
	}
	await getBookings().refresh();
	return (await res.json()) as SuccessJson<typeof res>;
});

export const completeBooking = form(completeInput, async ({ reference }) => {
	const res = await api.bookings[':reference'].complete.$post({ param: { reference } });
	const failure = await parseFailure(res);
	if (failure) {
		if (failure.code === 'INVALID_TRANSITION') throw invalid(failure.message);
		error(res.status as Parameters<typeof error>[0], failure.message);
	}
	await getBookings().refresh();
	return (await res.json()) as SuccessJson<typeof res>;
});
