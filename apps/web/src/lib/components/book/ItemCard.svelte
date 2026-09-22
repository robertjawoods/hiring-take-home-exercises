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
</script>

{#if quantity === 0}
	<button
		type="button"
		class="bg-surface shadow-sm hover:shadow-md flex min-h-[128px] flex-col justify-between gap-1.5 rounded-md p-3.5 text-left transition-shadow"
		onclick={onadd}
	>
		<span class="text-text/50 text-[10px] tracking-wide uppercase">{item.category}</span>
		<span class="font-heading text-[15px] leading-tight font-medium">{item.name}</span>
		<span class="text-text/65 text-sm">{formatPence(item.baseFeePence)}</span>
	</button>
{:else}
	<div
		class="bg-accent-900 ring-accent flex min-h-[128px] flex-col justify-between gap-1.5 rounded-md p-3.5 ring-[1.5px]"
	>
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
