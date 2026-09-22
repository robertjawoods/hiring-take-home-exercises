<script lang="ts">
	import type { getBookings } from '#lib/remote/bookings.remote';
	import type { getCrews } from '#lib/remote/crews.remote';
	import { assignCrew } from '#lib/remote/bookings.remote';
	import { formatDateTime, formatPence, summarizeLines } from '#lib/format';

	type Booking = Awaited<ReturnType<typeof getBookings>>['bookings'][number];
	type Crew = Awaited<ReturnType<typeof getCrews>>['crews'][number];

	let { booking, crews }: { booking: Booking; crews: Crew[] } = $props();

	const assign = $derived(assignCrew.for(booking.reference));
</script>

<tr>
	<td class="font-mono">{booking.reference}</td>
	<td class="text-muted">{formatDateTime(booking.createdAt)}</td>
	<td>{booking.customer.name}</td>
	<td>{booking.quote.postcode}</td>
	<td>{summarizeLines(booking.quote.lines)}</td>
	<td>
		{formatPence(booking.quote.totalPence)}
		<div class="text-text/50 text-[11px]">
			{formatPence(booking.quote.subtotalPence)} + {formatPence(
				booking.quote.postcodeSurchargePence
			)} surcharge
		</div>
	</td>
	<td>
		<form {...assign} class="flex items-center gap-2">
			<input {...assign.fields.reference.as('hidden', booking.reference)} />
			<select class="input min-h-8 text-[13px]" required {...assign.fields.crewId.as('select')}>
				<option value="" disabled selected>Choose crew…</option>
				{#each crews as crew (crew.id)}
					<option value={crew.id}>{crew.name}</option>
				{/each}
			</select>
			<button type="submit" class="btn btn-primary" disabled={assign.pending > 0}>Assign</button>
		</form>
		{#if assign.fields.crewId.issues()}
			<p class="mt-1 text-xs text-red-400">{assign.fields.crewId.issues()?.[0]?.message}</p>
		{/if}
		{#if assign.fields.issues()}
			<p class="mt-1 text-xs text-red-400">{assign.fields.issues()?.[0]?.message}</p>
		{/if}
	</td>
</tr>
