const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const time = new Intl.DateTimeFormat('en-GB', {
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'Europe/London'
});

export function formatPence(pence: number): string {
	return money.format(pence / 100);
}

export function formatDateTime(iso: string): string {
	return time.format(new Date(iso));
}

/** `date` is a YYYY-MM-DD string (the API's Europe/London "today"), parsed as UTC midnight so the label never drifts a day off for a viewer in another timezone. */
export function formatDateLabel(date: string): string {
	return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

export function formatDuration(startIso: string, endIso: string | null): string {
	if (!endIso) return '—';
	const minutes = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000);
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function summarizeLines(lines: readonly { name: string; quantity: number }[]): string {
	return lines.map((line) => `${line.name} ×${line.quantity}`).join(', ');
}
