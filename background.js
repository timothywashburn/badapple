const gitHubURL = 'https://github.com';

// No longer needed as program starts on load and loops indefinitely
// chrome.action.onClicked.addListener(function (tab) {
// 	if (!tab.url.startsWith(gitHubURL)) return;
//
// 	chrome.scripting.executeScript({
// 		target: {tabId: tab.id},
// 		files: ["active.js"],
// 	});
// });