<script lang="ts">
	import type { getBookings } from '#lib/remote/bookings.remote';
	import { formatDateTime, formatDuration, formatPence, summarizeLines } from '#lib/format';

	type Booking = Awaited<ReturnType<typeof getBookings>>['bookings'][number];

	let { booking }: { booking: Booking } = $props();
</script>

<tr>
	<td class="font-mono">{booking.reference}</td>
	<td class="text-muted">{booking.completedAt ? formatDateTime(booking.completedAt) : '—'}</td>
	<td class="text-muted">{formatDuration(booking.createdAt, booking.completedAt)}</td>
	<td>{booking.customer.name}</td>
	<td>{booking.quote.postcode}</td>
	<td>{summarizeLines(booking.quote.lines)}</td>
	<td>{formatPence(booking.quote.totalPence)}</td>
	<td>{booking.crew?.name ?? '—'}</td>
</tr>
