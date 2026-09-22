<script lang="ts">
	import { getBookings } from '#lib/remote/bookings.remote';
	import { getCrews } from '#lib/remote/crews.remote';
	import { formatDateLabel } from '#lib/format';
	import Tag from '#lib/components/Tag.svelte';
	import PendingRow from '#lib/components/ops/PendingRow.svelte';
	import AssignedRow from '#lib/components/ops/AssignedRow.svelte';
	import CompletedRow from '#lib/components/ops/CompletedRow.svelte';

	const bookingsQuery = getBookings();
	const crewsQuery = getCrews();

	const all = $derived(bookingsQuery.current?.bookings ?? []);
	const pending = $derived(all.filter((b) => b.status === 'PENDING'));
	const assigned = $derived(all.filter((b) => b.status === 'ASSIGNED'));
	const completed = $derived(all.filter((b) => b.status === 'COMPLETED'));

	$effect(() => {
		const id = setInterval(() => bookingsQuery.refresh(), 10_000);
		return () => clearInterval(id);
	});
</script>

<main class="mx-auto max-w-[1360px] overflow-x-auto p-8">
	<h1 class="mb-1">Today's bookings</h1>
	<p class="text-muted mb-7 text-sm">
		{bookingsQuery.current ? formatDateLabel(bookingsQuery.current.date) : ''}
	</p>

	<div class="card mb-5 p-5">
		<div class="mb-3.5 flex items-baseline gap-2.5">
			<h3 class="mb-0">Pending</h3>
			<Tag variant="outline">{pending.length}</Tag>
		</div>
		<table class="table">
			<thead>
				<tr>
					<th>Reference</th>
					<th>Created</th>
					<th>Customer</th>
					<th>Postcode</th>
					<th>Items</th>
					<th>Quote</th>
					<th>Crew</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each pending as booking (booking.reference)}
					<PendingRow {booking} crews={crewsQuery.current?.crews ?? []} />
				{/each}
				{#if pending.length === 0}
					<tr
						><td colspan="8" class="text-text/55 p-4 text-sm">No pending bookings right now.</td
						></tr
					>
				{/if}
			</tbody>
		</table>
	</div>

	<div class="card mb-5 p-5">
		<div class="mb-3.5 flex items-baseline gap-2.5">
			<h3 class="mb-0">Assigned</h3>
			<Tag variant="accent">{assigned.length}</Tag>
		</div>
		<table class="table">
			<thead>
				<tr>
					<th>Reference</th>
					<th>Assigned at</th>
					<th>Customer</th>
					<th>Postcode</th>
					<th>Items</th>
					<th>Quote</th>
					<th>Crew</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each assigned as booking (booking.reference)}
					<AssignedRow {booking} />
				{/each}
				{#if assigned.length === 0}
					<tr><td colspan="8" class="text-text/55 p-4 text-sm">No jobs assigned yet.</td></tr>
				{/if}
			</tbody>
		</table>
	</div>

	<div class="card p-5">
		<div class="mb-3.5 flex items-baseline gap-2.5">
			<h3 class="mb-0">Completed</h3>
			<Tag variant="neutral">{completed.length}</Tag>
		</div>
		<table class="table">
			<thead>
				<tr>
					<th>Reference</th>
					<th>Completed at</th>
					<th>Job duration</th>
					<th>Customer</th>
					<th>Postcode</th>
					<th>Items</th>
					<th>Quote</th>
					<th>Crew</th>
				</tr>
			</thead>
			<tbody>
				{#each completed as booking (booking.reference)}
					<CompletedRow {booking} />
				{/each}
				{#if completed.length === 0}
					<tr><td colspan="8" class="text-text/55 p-4 text-sm">Nothing completed yet today.</td></tr
					>
				{/if}
			</tbody>
		</table>
	</div>
</main>
