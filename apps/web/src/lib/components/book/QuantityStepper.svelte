<script lang="ts">
	let {
		quantity,
		onIncrement,
		onDecrement,
		min = 0,
		subtotalLabel
	}: {
		quantity: number;
		onIncrement: () => void;
		onDecrement: () => void;
		min?: number;
		subtotalLabel?: string;
	} = $props();
</script>

<div class="flex items-center gap-2">
	<button
		type="button"
		class="border-divider text-text flex h-[26px] w-[26px] items-center justify-center rounded-sm border bg-transparent text-[15px] leading-none"
		disabled={quantity <= min}
		onclick={onDecrement}
	>
		−
	</button>
	<span class="min-w-4 text-center text-sm">{quantity}</span>
	<button
		type="button"
		class="border-accent text-accent flex h-[26px] w-[26px] items-center justify-center rounded-sm border bg-transparent text-[15px] leading-none"
		onclick={onIncrement}
	>
		+
	</button>
	{#if subtotalLabel}
		<span class="text-accent-300 ml-auto text-sm">{subtotalLabel}</span>
	{/if}
</div>
