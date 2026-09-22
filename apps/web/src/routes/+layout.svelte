<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import Nav from '#lib/components/Nav.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Nav />

<svelte:boundary>
	{@render children()}

	{#snippet pending()}
		<p class="text-muted p-8 text-sm">Loading…</p>
	{/snippet}
</svelte:boundary>
