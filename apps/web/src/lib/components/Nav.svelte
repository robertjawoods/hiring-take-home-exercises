<script lang="ts">
	import { page } from '$app/state';
</script>

<nav class="nav">
	<span class="nav-brand">Litta</span>
	<a href="/book" aria-current={page.url.pathname === '/book' ? 'page' : undefined}
		>Book a collection</a
	>
	<a href="/ops" aria-current={page.url.pathname === '/ops' ? 'page' : undefined}>Dispatch</a>
</nav>
