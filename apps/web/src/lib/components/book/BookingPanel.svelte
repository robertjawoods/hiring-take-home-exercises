<script lang="ts">
	import { createBooking } from '#lib/remote/bookings.remote';
	import { getQuote } from '#lib/remote/quote.remote';
	import { formatPence } from '#lib/format';
	import Tag from '#lib/components/Tag.svelte';
	import QuoteSummary from './QuoteSummary.svelte';

	type Booking = NonNullable<(typeof createBooking)['result']>;

	let {
		basketLines,
		onreset
	}: { basketLines: { itemId: string; quantity: number }[]; onreset: () => void } = $props();

	let postcode = $state('');
	let debouncedPostcode = $state('');
	let booked = $state<Booking | null>(null);

	$effect(() => {
		const value = postcode;
		const id = setTimeout(() => (debouncedPostcode = value), 400);
		return () => clearTimeout(id);
	});

	$effect(() => {
		if (createBooking.result) booked = createBooking.result;
	});

	const hasQuote = $derived(basketLines.length > 0 && debouncedPostcode.trim().length >= 5);

	function makeAnotherBooking() {
		booked = null;
		postcode = '';
		debouncedPostcode = '';
		onreset();
	}
</script>

{#if booked}
	<div class="card-kicker">Confirmed</div>
	<h2 class="mb-2.5">Booking confirmed</h2>
	<Tag variant="accent">PENDING</Tag>
	<div class="my-3 font-mono text-xl tracking-wide">{booked.reference}</div>
	<p class="text-text/75 mb-5 text-sm">
		We'll be in touch to confirm the collection window for {booked.quote.postcode}.
	</p>
	<hr class="hr" />
	<div class="my-4 flex flex-col gap-2">
		{#each booked.quote.lines as line (line.itemId)}
			<div class="flex justify-between text-sm">
				<span>{line.name} × {line.quantity}</span>
				<span class="text-text/70">{formatPence(line.lineTotalPence)}</span>
			</div>
		{/each}
	</div>
	<hr class="hr" />
	<div class="font-heading my-4 flex justify-between text-base font-medium">
		<span>Total</span><span>{formatPence(booked.quote.totalPence)}</span>
	</div>
	<button type="button" class="btn btn-secondary btn-block" onclick={makeAnotherBooking}>
		Make another booking
	</button>
{:else}
	<div class="card-kicker">Live quote</div>
	<h2 class="mb-4">Your basket</h2>

	{#if basketLines.length === 0}
		<p class="text-muted text-sm">Your basket is empty. Tap an item to add it.</p>
	{:else if !hasQuote}
		<p class="text-muted text-sm">Enter a postcode to see your quote.</p>
	{:else}
		<QuoteSummary quote={getQuote({ items: basketLines, postcode: debouncedPostcode })} />
	{/if}

	<form {...createBooking} class="mt-6 flex flex-col gap-3.5">
		<div class="field">
			<label for="cust-postcode">Postcode</label>
			<input class="input" id="cust-postcode" bind:value={postcode} placeholder="E1 6AN" />
		</div>
		<input {...createBooking.fields.postcode.as('hidden', postcode)} />

		{#each basketLines as line, i (line.itemId)}
			<input {...createBooking.fields.items[i].itemId.as('hidden', line.itemId)} />
			<input {...createBooking.fields.items[i].quantity.as('hidden', line.quantity)} />
		{/each}

		<div class="field">
			<label for="cust-name">Full name</label>
			<input
				class="input"
				id="cust-name"
				{...createBooking.fields.customer.name.as('text')}
				placeholder="Jamie Ellis"
			/>
		</div>
		<div class="field">
			<label for="cust-email">Email</label>
			<input
				class="input"
				id="cust-email"
				{...createBooking.fields.customer.email.as('email')}
				placeholder="jamie@example.com"
			/>
		</div>

		<button
			type="submit"
			class="btn btn-primary btn-block"
			disabled={createBooking.pending > 0 || basketLines.length === 0}
		>
			Book collection
		</button>

		{#if createBooking.fields.issues()}
			<p class="text-sm text-red-400">{createBooking.fields.issues()?.[0]?.message}</p>
		{/if}
	</form>
{/if}
