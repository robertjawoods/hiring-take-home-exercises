import { z } from 'zod';
import { query } from '$app/server';
import { api, unwrap } from '#lib/server/api';

const quoteInput = z.object({
	items: z
		.array(
			z.object({
				itemId: z.string().min(1),
				quantity: z.number().int().min(1).max(99)
			})
		)
		.min(1)
		.max(50),
	postcode: z.string().min(1)
});

export const getQuote = query(quoteInput, async ({ items, postcode }) =>
	unwrap(await api.quotes.$post({ json: { items, postcode } }))
);
