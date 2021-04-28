import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		wikiApiURL: 'https://en.wikipedia.org/w/api.php'
	}
});

export default app;