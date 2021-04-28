const wikiApiURL = "https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query";

let pageUrl = `${wikiApiURL}&prop=extracts|info|pageimages|images&exchars=300&explaintext&titles=`;
let imageUrl = `${wikiApiURL}&prop=imageinfo&iiprop=url&titles=`;

async function callWikiApi(searchURL) {
	const res = await fetch(searchURL);
	const json = await res.json();
	const promises = [];
	for (let i = 0; i < json[1].length; i++) {
		const pageTitle = json[1][i];
		const url = json[3][i];
		promises.push(fetchPage(pageTitle, url, i));
	}
	return Promise.all(promises);
}

async function fetchPage(pageTitle, url, index) {
	const res = await fetch(pageUrl + encodeURI(pageTitle));
	const json = await res.json();
	const page = json.query.pages[Object.keys(json.query.pages)[0]];
	page.index = index;
	page.url = url;
	let thumbnail = false;
	if (page.pageimage) {
		thumbnail = await fetchImage(`File:${page.pageimage}`);
	} else if (page.images && page.images.length) {
		thumbnail = await fetchImage(page.images[0].title);
	}
	if (thumbnail && thumbnail.indexOf(".pdf") === -1) page.thumbnail = thumbnail;
	return page;
}

async function fetchImage(imageTitle) {
 	const res = await fetch(imageUrl + encodeURI(imageTitle));
	const json = await res.json();
	const image = json.query.pages[Object.keys(json.query.pages)[0]];
	return image.imageinfo[0].url;
}

export { callWikiApi };