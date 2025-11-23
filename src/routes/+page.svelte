<script lang="ts">
	import { onMount } from 'svelte';
	import textFit from 'textfit';

	let { data: initialData } = $props();
	let state = $state({
		status: initialData.status,
		title: initialData.title,
		artist: initialData.artist,
		album: initialData.album
	});
	let textEl: HTMLDivElement;

	async function fetchState() {
		try {
			const res = await fetch('/api/state');
			if (res.ok) {
				const newState = await res.json();
				console.log('Fetched state:', newState);
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
			if (char === ' ') return { char: '\u00A0', style: '' }; // non-breaking space
			const rotation = (Math.random() - 0.5) * 20; // -5 to 5 degrees
			const scaleX = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
			const scaleY = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
			const yOffset = (Math.random() - 0.5) * 10; // -5 to 5%
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

	function fit() {
		if (textEl) textFit(textEl, { multiLine: true, maxFontSize: 1000 });
	}

	$effect(() => {
		if (state.status !== lastStatus) {
			lastStatus = state.status;
			if (state.status === 'paused') pauseMessage = pick(pauseMessages);
			if (state.status === 'nothing') nothingMessage = pick(nothingMessages);
		}
		fit();
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

<div bind:this={textEl} class="container">
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

<style>
	:global(body) {
		margin: 0;
	}

	.container {
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		box-sizing: border-box;
		text-align: center;
		font-weight: bold;
		word-break: break-all;
	}
</style>
