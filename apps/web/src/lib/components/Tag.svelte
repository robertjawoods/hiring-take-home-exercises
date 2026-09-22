<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'neutral',
		children
	}: { variant?: 'accent' | 'outline' | 'neutral'; children: Snippet } = $props();

	const variantClass = {
		accent: 'tag-accent',
		outline: 'tag-outline',
		neutral: 'tag-neutral'
	} as const;
</script>

<span class="tag {variantClass[variant]}">{@render children()}</span>
