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
		const interval = setInterval(() => invalidate('/'), 10000);
		window.addEventListener('resize', fit);
		return () => {
			clearInterval(interval);
			window.removeEventListener('resize', fit);
		};
	});
</script>

<div bind:this={textEl} class="container">
	{#if data.status === 'playing'}
		<span class="title">{data.title.toUpperCase()}</span> BY <span class="artist">{data.artist.toUpperCase()}</span> FROM <span class="album">{data.album.toUpperCase()}</span>
	{:else if data.status === 'paused'}
		{pauseMessage}
	{:else if data.status === 'nothing'}
		{nothingMessage}
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

	.title {
		color: #ff6b6b;
	}

	.artist {
		color: #4ecdc4;
	}

	.album {
		color: #ffe66d;
	}
</style>
