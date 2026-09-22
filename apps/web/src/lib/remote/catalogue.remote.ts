import { query } from '$app/server';
import { api, unwrap } from '#lib/server/api';

export const getCatalogue = query(async () => unwrap(await api.catalogue.$get()));
