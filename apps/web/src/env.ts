import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

export const variables = defineEnvVars({
	API_URL: {
		schema: z.string().default('http://localhost:3000')
	}
});
