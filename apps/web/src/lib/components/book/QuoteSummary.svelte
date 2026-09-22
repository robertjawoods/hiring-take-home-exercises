<script lang="ts">
	import type { getQuote } from '#lib/remote/quote.remote';
	import { formatPence } from '#lib/format';

	let { quote }: { quote: ReturnType<typeof getQuote> } = $props();
</script>

{#if quote.loading}
	<p class="text-muted text-sm">Calculating…</p>
{:else if quote.error}
	<p class="text-sm text-red-400">
		{quote.error?.message ?? 'Could not get a quote for that postcode.'}
	</p>
{:else if quote.current}
	<div class="flex flex-col gap-2 text-sm">
		{#each quote.current.lines as line (line.itemId)}
			<div class="flex justify-between">
				<span>{line.name} × {line.quantity}</span>
				<span class="text-text/70">{formatPence(line.lineTotalPence)}</span>
			</div>
		{/each}
	</div>
	<hr class="hr" />
	<div class="flex flex-col gap-1.5 text-sm">
		<div class="text-text/75 flex justify-between">
			<span>Subtotal</span><span>{formatPence(quote.current.subtotalPence)}</span>
		</div>
		<div class="text-text/75 flex justify-between">
			<span>Postcode surcharge</span><span>{formatPence(quote.current.postcodeSurchargePence)}</span
			>
		</div>
	</div>
	<div class="font-heading my-3.5 flex justify-between text-lg font-medium">
		<span>Total</span><span>{formatPence(quote.current.totalPence)}</span>
	</div>
{/if}
