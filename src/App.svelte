<script>
	import { callWikiApi } from "./wiki-api.js";
	import { tick } from "svelte";
	import { scale } from "svelte/transition";
	import { flip } from "svelte/animate";

	export let wikiApiURL;

	let currentSort = "default";
	let limit = 10;
	let results = [];
	let query = "";

	// Reactive variable: if any of the variables on the right part are updated
	// then the left part is automatically updated as well. We also check first
	// if query is not empty
	$: searchURL = query && `${wikiApiURL}&search=${encodeURI(query)}&limit=${limit}`;
	// Reactive statement: same principle, if any of the variables is updated
	// then trigger the statement
	$: if (!query) {
		results = [];
	};

	function onKeydownHandler(e) {
		if (e.key === "Enter") {
			callWikiApi(searchURL).then(data => {
				results = data;
				sort();
			});
		}
	}

	async function fetchResults() {
		if (!query) return;
		// tick helps us wait for all the changes to occur before persuing
		// here we want to wait for searchURL to be updated with new limit
		await tick();
		callWikiApi(searchURL).then(data => {
			results = data
			sort();
		});
	}

	function sort(by = false) {
		if (!by) {
			by = currentSort;
			if (["+", "-"].includes(by[by.length - 1])) {
				by = by.slice(0, -1);
			}
		}
		switch(by) {
			case "default":
				currentSort = "default";
				results = results.sort((a, b) => a.index - b.index);
				break;
			case "az":
				if (currentSort.indexOf("+") !== -1) {
					currentSort = "az-";
					results = results.sort((a, b) => sortTitle(b, a));
				} else {
					currentSort = "az+";
					results = results.sort((a, b) => sortTitle(a, b));
				}
				break;
			case "last":
				if (currentSort.indexOf("+") !== -1) {
					currentSort = "last-";
					results = results.sort((a, b) => sortTime(b, a));
				} else {
					currentSort = "last+";
					results = results.sort((a, b) => sortTime(a, b));
				}
				break;
		}
	}

	function sortTitle(a, b) {
		const titleA = a.title.toLowerCase();
		const titleB = b.title.toLowerCase();
		if (titleA > titleB) return 1;
		if (titleA < titleB) return -1;
		return 0;
	}

	function sortTime(a, b) {
		const timeA = a.touched;
		const timeB = b.touched;
		if (timeA > timeB) return 1;
		if (timeA < timeB) return -1;
		return 0;
	}
</script>

<main>
	<img src="https://en.wikipedia.org/static/images/project-logos/enwiki.png" alt="Wikipedia" />
	<div class="search">
		<!-- use "bind:" to link a variable to an element's property -->
		<!-- use "on:" to link a listener to an element's event -->
		<input type="search" bind:value={query} on:keydown={onKeydownHandler}>
		<select bind:value={limit} on:change={fetchResults}>
			<option selected>10</option>
			<option>20</option>
			<option>50</option>
		</select>
		{#if results.length}
			Sort by:
			<!--
				class:className allows the "className" to be toggled on or off
				depending on a boolean value
			-->
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
		<!-- 
			in:scale triggers a scale + fade-in transition when the element is
			created. If you want to trigger the transition when the element is
			deleted, simply change "in:" for "out:". And if you want for both,
			use "transition:"
		-->
		<!--
			animate:flip animates the element from a visual state A to B,
			it will compare the initial state and the target state and automatically
			transition between the two. It only works in a keyed "#each" block
		-->
		{#each results as result, i (result.title)}
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