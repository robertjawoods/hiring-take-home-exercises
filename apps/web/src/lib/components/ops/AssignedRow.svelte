<script lang="ts">
	import type { getBookings } from '#lib/remote/bookings.remote';
	import { completeBooking } from '#lib/remote/bookings.remote';
	import { formatDateTime, formatPence, summarizeLines } from '#lib/format';

	type Booking = Awaited<ReturnType<typeof getBookings>>['bookings'][number];

	let { booking }: { booking: Booking } = $props();

	const complete = $derived(completeBooking.for(booking.reference));
</script>

<tr>
	<td class="font-mono">{booking.reference}</td>
	<td class="text-muted">{booking.assignedAt ? formatDateTime(booking.assignedAt) : '—'}</td>
	<td>{booking.customer.name}</td>
	<td>{booking.quote.postcode}</td>
	<td>{summarizeLines(booking.quote.lines)}</td>
	<td>{formatPence(booking.quote.totalPence)}</td>
	<td>{booking.crew?.name ?? '—'}</td>
	<td>
		<form {...complete}>
			<input {...complete.fields.reference.as('hidden', booking.reference)} />
			<button type="submit" class="btn btn-secondary" disabled={complete.pending > 0}
				>Mark complete</button
			>
		</form>
		{#if complete.fields.issues()}
			<p class="mt-1 text-xs text-red-400">{complete.fields.issues()?.[0]?.message}</p>
		{/if}
	</td>
</tr>
