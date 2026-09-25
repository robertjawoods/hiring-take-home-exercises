<script lang="ts">
	import type { getCatalogue } from '#lib/remote/catalogue.remote';
	import { formatPence } from '#lib/format';
	import QuantityStepper from './QuantityStepper.svelte';

	type CatalogueItem = Awaited<ReturnType<typeof getCatalogue>>['items'][number];

	let {
		item,
		quantity,
		onadd,
		oninc,
		ondec
	}: {
		item: CatalogueItem;
		quantity: number;
		onadd: () => void;
		oninc: () => void;
		ondec: () => void;
	} = $props();

	// Images are stored locally at static/images/catalogue/<item id>.png — not every
	// item has one yet, so we fall back to a plain placeholder block on load error.
	let imageFailed = $state(false);
</script>

{#snippet thumbnail()}
	<div class="bg-bg -mx-3.5 -mt-3.5 aspect-4/3 w-[calc(100%+1.75rem)] overflow-hidden rounded-t-md">
		{#if !imageFailed}
			<img
				src="/images/catalogue/{item.id}.png"
				alt=""
				class="h-full w-full object-cover"
				loading="lazy"
				onerror={() => (imageFailed = true)}
			/>
		{/if}
	</div>
{/snippet}

{#if quantity === 0}
	<button
		type="button"
		class="bg-surface shadow-sm hover:shadow-md flex min-h-[128px] flex-col justify-between gap-1.5 overflow-hidden rounded-md p-3.5 text-left transition-shadow"
		onclick={onadd}
	>
		{@render thumbnail()}
		<span class="text-text/50 text-[10px] tracking-wide uppercase">{item.category}</span>
		<span class="font-heading text-[15px] leading-tight font-medium">{item.name}</span>
		<span class="text-text/65 text-sm">{formatPence(item.baseFeePence)}</span>
	</button>
{:else}
	<div
		class="bg-accent-900 ring-accent flex min-h-[128px] flex-col justify-between gap-1.5 overflow-hidden rounded-md p-3.5 ring-[1.5px]"
	>
		{@render thumbnail()}
		<span class="text-text/50 text-[10px] tracking-wide uppercase">{item.category}</span>
		<span class="font-heading text-[15px] leading-tight font-medium">{item.name}</span>
		<QuantityStepper
			{quantity}
			onIncrement={oninc}
			onDecrement={ondec}
			subtotalLabel={formatPence(item.baseFeePence * quantity)}
		/>
	</div>
{/if}
