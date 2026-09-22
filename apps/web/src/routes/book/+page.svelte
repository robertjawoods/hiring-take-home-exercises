<script lang="ts">
	import type { Basket } from '#lib/types';
	import { getCatalogue } from '#lib/remote/catalogue.remote';
	import ItemCard from '#lib/components/book/ItemCard.svelte';
	import BookingPanel from '#lib/components/book/BookingPanel.svelte';

	const catalogue = await getCatalogue();

	let basket = $state<Basket>({});

	const basketLines = $derived(
		Object.entries(basket)
			.filter(([, qty]) => qty > 0)
			.map(([itemId, quantity]) => ({ itemId, quantity }))
	);

	function add(itemId: string) {
		basket[itemId] = (basket[itemId] ?? 0) + 1;
	}
	function inc(itemId: string) {
		basket[itemId] = (basket[itemId] ?? 0) + 1;
	}
	function dec(itemId: string) {
		basket[itemId] = Math.max(0, (basket[itemId] ?? 0) - 1);
	}
	function reset() {
		basket = {};
	}
</script>

<div class="flex min-h-[calc(100vh-56px)] min-w-0">
	<main class="min-w-0 flex-1 p-8">
		<h1 class="mb-1">Book a collection</h1>
		<p class="text-muted mb-6 max-w-[56ch] text-sm">
			Pick items for collection. Tap an item to add it — tap again or use the stepper to change
			quantity.
		</p>

		<div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
			{#each catalogue.items as item (item.id)}
				<ItemCard
					{item}
					quantity={basket[item.id] ?? 0}
					onadd={() => add(item.id)}
					oninc={() => inc(item.id)}
					ondec={() => dec(item.id)}
				/>
			{/each}
		</div>
	</main>

	<aside
		class="border-divider bg-surface sticky top-0 h-screen w-[380px] shrink-0 overflow-y-auto border-l py-7 px-6"
	>
		<BookingPanel {basketLines} onreset={reset} />
	</aside>
</div>
