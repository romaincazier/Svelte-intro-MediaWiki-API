<script>
	import { callWikiApi } from "./wiki-api.js";
	import { scale } from "svelte/transition";
	import { flip } from "svelte/animate";

	export let wikiApiURL;

	let currentSort = "default";
	let limit = 10;
	let query = "";
	let results = [];

	$: searchURL = query && `${wikiApiURL}?origin=*&format=json&action=opensearch&search=${encodeURI(query)}&limit=${limit}`;

	function onKeydownHandler(e) {
		if (e.key === "Enter") {
			fetchResults();
		}
	}

	function fetchResults() {
		if (!query) return;
		callWikiApi(searchURL).then(data => results = data);
	}

	function sort(by) {
		switch(by) {
			case "default":
				currentSort = "default";
				results = results.sort((a, b) => a.index - b.index);
				break;
			case "az":
				if (currentSort.indexOf("+") !== -1) {
					currentSort = "az-";
					results = results.sort((a, b) => a.title.toLowerCase() < b.title.toLowerCase());
				} else {
					currentSort = "az+";
					results = results.sort((a, b) => a.title.toLowerCase() > b.title.toLowerCase());
				}
				break;
			case "last":
				if (currentSort.indexOf("+") !== -1) {
					currentSort = "last-";
					results = results.sort((a, b) => a.touched < b.touched);
				} else {
					currentSort = "last+";
					results = results.sort((a, b) => a.touched > b.touched);
				}
				break;
		}
	}
</script>

<main>
	<img src="https://en.wikipedia.org/static/images/project-logos/enwiki.png" alt="Wikipedia" />
	<div class="search">
		<input type="search" bind:value={query} on:keydown={onKeydownHandler}>
		<select bind:value={limit} on:change={fetchResults}>
			<option selected>10</option>
			<option>20</option>
			<option>50</option>
		</select>
		{#if results.length}
			Sort by:
			<button on:click={() => sort("default")}
				class:active={currentSort === "default"}>Relevance</button>
			<button on:click={() => sort("az")}
				class:asc={currentSort === "az+"}
				class:desc={currentSort === "az-"}>A-Z</button>
			<button on:click={() => sort("last")}
				class:asc={currentSort === "last+"}
				class:desc={currentSort === "last-"}>Last edit</button>
		{/if}
	</div>
	<p>{searchURL}</p>
	<div class="results">
		{#each results as result, i (result)}
			<a class="result"
				href={result.url}
				target="_blank"
				in:scale={{ delay: i * 100, start: 0.8 }}
				animate:flip={{ duration: 300 }}>
				{#if result.thumbnail}
					<img src={result.thumbnail} />
				{/if}
				<h2>{result.title}</h2>
				<h6>Last edit: <time>{result.touched}</time></h6>
				<p>{result.extract}</p>
			</a>
		{/each}
	</div>
</main>

<style>
	img {
		max-width: 100%;
	}

	p {
		margin-top: 0;
	}

	main {
		box-sizing: border-box;
		max-height: 100%;
		overflow: auto;
		text-align: center;
	}

	main > img {
		display: block;
		margin: 0 auto;
	}

	button.active,
	button.asc,
	button.desc {
		background-color: #ddd;
	}

	button.asc::after {
		content: " (+)";
	}

	button.desc::after {
		content: " (-)";
	}

	.search {
		padding: 0.5em 0;
		position: sticky;
		top: 0;
		z-index: 1;
		background-color: white
	}

	.results {
		display: grid;
		align-items: start;
		gap: 1em;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		margin: 1em 0;
	}

	.result {
		padding: 1em;
		border-radius: 8px;
		color: inherit;
		text-decoration: none;
	}

	.result:hover {
		background-color: #eee;
	}

	.result > img {
		width: 100%;
	}

	.result > p {
		text-align: left;
	}
</style>