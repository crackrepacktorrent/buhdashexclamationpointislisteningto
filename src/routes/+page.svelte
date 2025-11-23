<script lang="ts">
	import { onMount, tick } from 'svelte';

	let { data: initialData } = $props();
	let state = $state({
		status: initialData.status,
		title: initialData.title,
		artist: initialData.artist,
		album: initialData.album
	});
	let textEl: HTMLDivElement;
	let containerEl: HTMLDivElement;
	let fontSize = $state(100);

	async function fetchState() {
		try {
			const res = await fetch('/api/state');
			if (res.ok) {
				const newState = await res.json();
				state.status = newState.status;
				state.title = newState.title;
				state.artist = newState.artist;
				state.album = newState.album;
			}
		} catch (e) {
			console.error('Failed to fetch:', e);
		}
	}

	const pauseMessages = [
		'THE SILENCE OF A BRIEF PAUSE FROM THE NOISE',
		'NOTHING, BUT JUST FOR A LITTLE BIT',
		'A MOMENT OF STILLNESS'
	];

	const nothingMessages = [
		'NOTHING',
		'THEIR OWN THOUGHTS',
		'DREAMS FOLDING IN ON THEMSELVES',
		"SOMETHING THAT ISN'T MUSIC",
		'A LOT OF QUIET STRETCHED OUT OVER A LOT OF TIME'
	];

	function pick(arr: string[]) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function wobble(text: string, color?: string) {
		return text.split('').map((char) => {
			if (char === ' ') return { char: '\u00A0', style: '' };
			const rotation = (Math.random() - 0.5) * 20;
			const scaleX = 0.7 + Math.random() * 0.6;
			const scaleY = 0.7 + Math.random() * 0.6;
			const yOffset = (Math.random() - 0.5) * 10;
			const colorStyle = color ? `color: ${color};` : '';
			return {
				char,
				style: `transform: rotate(${rotation}deg) scaleX(${scaleX}) scaleY(${scaleY}) translateY(${yOffset}%); display: inline-block; ${colorStyle}`
			};
		});
	}

	let pauseMessage = $state(pick(pauseMessages));
	let nothingMessage = $state(pick(nothingMessages));
	let lastStatus = $state('');

	async function fit() {
		if (!textEl || !containerEl) return;

		const padding = 32;
		const maxWidth = containerEl.clientWidth - padding;
		const maxHeight = containerEl.clientHeight - padding;

		let min = 10;
		let max = 800;

		// Binary search for optimal font size
		while (max - min > 1) {
			const mid = Math.floor((min + max) / 2);
			fontSize = mid;
			await tick();

			const fits = textEl.scrollWidth <= maxWidth && textEl.scrollHeight <= maxHeight;
			if (fits) {
				min = mid; // Fits, try larger
			} else {
				max = mid; // Too big, try smaller
			}
		}

		fontSize = min;
	}

	$effect(() => {
		if (state.status !== lastStatus) {
			lastStatus = state.status;
			if (state.status === 'paused') pauseMessage = pick(pauseMessages);
			if (state.status === 'nothing') nothingMessage = pick(nothingMessages);
		}
	});

	// Separate effect to refit whenever displayed content changes
	$effect(() => {
		// Track all content that affects display
		const _ = [state.status, state.title, state.artist, state.album, pauseMessage, nothingMessage];
		// Wait for DOM to render new content, then fit
		tick().then(() => fit());
	});

	onMount(() => {
		fit();
		const interval = setInterval(fetchState, 10000);
		window.addEventListener('resize', fit);
		return () => {
			clearInterval(interval);
			window.removeEventListener('resize', fit);
		};
	});
</script>

<div bind:this={containerEl} class="viewport">
	<div bind:this={textEl} class="text-content" style="font-size: {fontSize}px">
		{#if state.status === 'playing'}
			{#each wobble(state.title.toUpperCase(), '#ff6b6b') as { char, style }}<span {style}
					>{char}</span
				>{/each}
			{#each wobble(' BY ') as { char, style }}<span {style}>{char}</span>{/each}
			{#each wobble(state.artist.toUpperCase(), '#4ecdc4') as { char, style }}<span {style}
					>{char}</span
				>{/each}
			{#each wobble(' FROM ') as { char, style }}<span {style}>{char}</span>{/each}
			{#each wobble(state.album.toUpperCase(), '#ffe66d') as { char, style }}<span {style}
					>{char}</span
				>{/each}
		{:else if state.status === 'paused'}
			{#each wobble(pauseMessage) as { char, style }}<span {style}>{char}</span>{/each}
		{:else if state.status === 'nothing'}
			{#each wobble(nothingMessage) as { char, style }}<span {style}>{char}</span>{/each}
		{:else}
			...
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
	}

	.viewport {
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		box-sizing: border-box;
	}

	.text-content {
		font-weight: bold;
		text-align: center;
		word-break: break-all;
		line-height: 1.1;
		max-width: 100%;
	}
</style>
