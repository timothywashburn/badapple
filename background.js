const gitHubURL = 'https://github.com';

chrome.action.onClicked.addListener(function (tab) {
	if (!tab.url.startsWith(gitHubURL)) return;

	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		files: ["active.js"],
	});
});