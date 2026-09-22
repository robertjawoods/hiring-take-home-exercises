import { query } from '$app/server';
import { api, unwrap } from '#lib/server/api';

export const getCrews = query(async () => unwrap(await api.crews.$get()));
