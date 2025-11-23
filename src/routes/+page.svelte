<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import textFit from 'textfit';

	let { data } = $props();
	let textEl: HTMLDivElement;

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
			const rotation = (Math.random() - 0.5) * 10; // -5 to 5 degrees
			const scaleX = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
			const scaleY = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
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
		if (data.status !== lastStatus) {
			lastStatus = data.status;
			if (data.status === 'paused') pauseMessage = pick(pauseMessages);
			if (data.status === 'nothing') nothingMessage = pick(nothingMessages);
		}
		fit();
	});

	onMount(() => {
		fit();
		const interval = setInterval(() => invalidate('app:state'), 10000);
		window.addEventListener('resize', fit);
		return () => {
			clearInterval(interval);
			window.removeEventListener('resize', fit);
		};
	});
</script>

<div bind:this={textEl} class="container">
	{#if data.status === 'playing'}
		{#each wobble(data.title.toUpperCase(), '#ff6b6b') as { char, style }}<span {style}>{char}</span>{/each}
		{#each wobble(' BY ') as { char, style }}<span {style}>{char}</span>{/each}
		{#each wobble(data.artist.toUpperCase(), '#4ecdc4') as { char, style }}<span {style}>{char}</span>{/each}
		{#each wobble(' FROM ') as { char, style }}<span {style}>{char}</span>{/each}
		{#each wobble(data.album.toUpperCase(), '#ffe66d') as { char, style }}<span {style}>{char}</span>{/each}
	{:else if data.status === 'paused'}
		{#each wobble(pauseMessage) as { char, style }}<span {style}>{char}</span>{/each}
	{:else if data.status === 'nothing'}
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
