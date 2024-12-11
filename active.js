let printDebug = false;

(async () => {
	const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
	try {
		while (true) {
			if (hasLabel('inject')) {
				await sleep(100);
				continue;
			}

			console.log('bad apple started');

			let contributionTable = document.querySelector('.js-calendar-graph-table > tbody');
			debug('initial contributionTable: ' + contributionTable);
			let contributionSettings = findContributionSettings();
			debug('initial contributionSettings: ' + contributionSettings);

			while (!contributionTable || !contributionSettings) {
				contributionTable = document.querySelector('.js-calendar-graph-table > tbody');
				debug('contributionTable: ' + contributionTable);
				contributionSettings = findContributionSettings();
				debug('contributionSettings: ' + contributionSettings);
				await sleep(100);
			}

			addLabel('inject');

			debugRaw('contributionSettings', contributionSettings);

			const listItem = document.createElement('li');
			listItem.setAttribute('data-targets', 'action-list.items');
			listItem.setAttribute('role', 'none');
			listItem.setAttribute('data-view-component', 'true');
			listItem.className = 'ActionListItem';

			const form = document.createElement('form');
			form.setAttribute('role', 'none');
			form.setAttribute('method', 'post');
			form.setAttribute('accept-charset', 'UTF-8');

			const button = document.createElement('button');
			button.tabIndex = '-1';
			button.setAttribute('type', 'button');
			button.setAttribute('role', 'menuitemcheckbox');
			button.setAttribute('data-view-component', 'true');
			button.className = 'ActionListContent';

			const visualSpan = document.createElement('span');
			visualSpan.className = 'ActionListItem-visual ActionListItem-action--leading';

			const descWrap = document.createElement('span');
			descWrap.setAttribute('data-view-component', 'true');
			descWrap.className = 'ActionListItem-descriptionWrap';

			const label = document.createElement('span');
			label.setAttribute('data-view-component', 'true');
			label.className = 'ActionListItem-label';
			label.textContent = 'Bad Apple!!';

			const description = document.createElement('span');
			description.setAttribute('data-view-component', 'true');
			description.className = 'ActionListItem-description';
			const inactiveText = 'Turning on Bad Apple!! will play Bad Apple!! with your GitHub contribution graph.';
			const activeText = 'Turning off Bad Apple!! will stop playing Bad Apple!! with your GitHub contribution graph.';
			description.textContent = inactiveText;

			descWrap.appendChild(label);
			descWrap.appendChild(description);
			button.appendChild(visualSpan);
			button.appendChild(descWrap);
			form.appendChild(button);
			listItem.appendChild(form);

			button.addEventListener('click', async () => {
				if (hasLabel('running')) {
					await addLabel('disable');
					description.textContent = inactiveText;
					visualSpan.innerHTML = '';
				} else {
					await addLabel('running');
					description.textContent = activeText;
					visualSpan.innerHTML = '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check ActionListItem-singleSelectCheckmark"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>';
					await display(contributionTable);
				}
			});

			contributionSettings.appendChild(listItem);
		}
	} catch (e) {
		console.error(e);
	}
})();

async function display(contributionTable) {
	try {
		const contributionTableSave = contributionTable.cloneNode(true);

		const play_audio = true;

		const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

		const rows = 40
		const columns = 53;

		const animateFrameSpeed = 40;
		const randomAnimationDelay = 300;
		const brightnessAnimation = [1, 2, 3, 4, 4, 4, 4, 4, 3, 2, 1, 0];

		const url = chrome.runtime.getURL('video_data.json');
		const res = await fetch(url);
		const videoData = await res.json();

		const audio_url = play_audio ? chrome.runtime.getURL('badapple.mp3') : null;
		const audio = play_audio ? new Audio(audio_url) : null;
		if (play_audio) {
			audio.volume = 0.5;
			audio.currentTime = 1;
		}

		let genInstructions = [];
		for (let i = 0; i < rows; i++) {
			let rowGenInstructions = {
				'cells': []
			};
			genInstructions.push(rowGenInstructions);

			let row = contributionTable.children[i];
			if (!row) {
				rowGenInstructions['row'] = () => {
					row = document.createElement('tr');

					// Create a spacer cell where the day of the week would go
					const firstCell = document.createElement('td');
					firstCell.className = 'ContributionCalendar-label';
					firstCell.style.position = 'relative';
					row.appendChild(firstCell);

					row.style.height = '10px';
					contributionTable.appendChild(row);
				};
			}

			for (let j = 0; j < columns; j++) {
				rowGenInstructions['cells'].push((brightness) => {
					let cell = row.children[j + 1];
					let didCellExist = Boolean(cell);
					if (cell) {
						if (cell.getAttribute('data-ix')) {
							cell.setAttribute('data-level', brightness.toString());
							return
						}
					} else cell = document.createElement('td');

					cell.setAttribute('data-ix', j.toString());
					cell.setAttribute('tabindex', '-1');
					cell.setAttribute('aria-selected', 'false');
					cell.setAttribute('style', 'width: 10px');
					cell.setAttribute('data-date', '2024-01-07');
					cell.setAttribute('data-level', brightness.toString());
					cell.setAttribute('role', 'gridcell');
					cell.setAttribute('id', `contribution-day-component-0-${j}`);
					cell.setAttribute('aria-describedby', 'contribution-graph-legend-level-0');
					cell.setAttribute('class', 'ContributionCalendar-day');
					cell.setAttribute('data-view-component', 'true');
					if (!didCellExist) row.appendChild(cell);
				});
			}
		}

		const generateDiagonalCells = (index) => {
			for (let column = 0; column < index + 1; column++) {
				for (let row = 0; row < index - column + 1; row++) {
					let rowGenInstructions = genInstructions[row];
					if (!rowGenInstructions) continue;
					if (rowGenInstructions['row']) {
						setTimeout(rowGenInstructions['row'], index * animateFrameSpeed);
						delete rowGenInstructions['row']
					}
					if (rowGenInstructions['cells'][column]) {
						let random = 0;
						for (let i = 0; i < brightnessAnimation.length; i++) {
							let brightness = brightnessAnimation[i];
							if (i > brightnessAnimation.length / 2 && brightness !== 4) random += Math.random() * randomAnimationDelay;
							setTimeout(rowGenInstructions['cells'][column], (index + i) * animateFrameSpeed + random, brightness);
						}
						delete rowGenInstructions['cells'][column];
					}
				}
			}
		};

		for (let i = 0; i < rows + columns; i++) generateDiagonalCells(i);
		await sleep((rows + columns + (brightnessAnimation.length - 1)) * animateFrameSpeed + (randomAnimationDelay * 4));

		const setCellBrightness = (rowIndex, columnIndex, brightness) => {
			const row = contributionTable.children[rowIndex];
			const targetCell = row.children[columnIndex + 1];
			targetCell.setAttribute('data-level', brightness.toString());
		};

		const drawFrame = (frameIndex) => {
			let frame = videoData[frameIndex];
			for (let rowIndex = 0; rowIndex < frame.length; rowIndex++) {
				let rowData = frame[rowIndex];
				for (let columnIndex = 0; columnIndex < rowData.length; columnIndex++) {
					let cell = rowData[columnIndex];
					setCellBrightness(rowIndex, columnIndex, cell);
				}
			}
		}

		let totalFrames = videoData.length;

		const resetContributionTable = () => {
			for (let i = 0; i < rows - 7; i++) {
				let rowIndexToRemove = rows - i - 1;
				setTimeout(() => {
					let row = contributionTable.children[rowIndexToRemove];
					row.remove();
				}, animateFrameSpeed * i);
			}
			setTimeout(() => {
				contributionTable.innerHTML = contributionTableSave.innerHTML;
				removeLabel('running');
				removeLabel('disable');
			}, animateFrameSpeed * (rows - 7));
		}

		if (play_audio) {
			await audio.play().then(() => {
				let intervalID = setInterval(() => {
					if (hasLabel('disable')) audio.pause();

					let currentFrameIndex = Math.floor(audio.currentTime * 30);
					if (currentFrameIndex === totalFrames || audio.ended || audio.paused) {
						clearInterval(intervalID);
						resetContributionTable();
						return;
					}
					drawFrame(currentFrameIndex);
				}, 1);
			});

		} else {
			let currentFrameIndex = 30;
			const drawFramesContinuously = () => {
				if (currentFrameIndex < totalFrames && !hasLabel('disable')) {
					drawFrame(currentFrameIndex);
					currentFrameIndex++;
				} else {
					clearInterval(intervalId);
					resetContributionTable();
				}
			};
			const intervalId = setInterval(drawFramesContinuously, 1000 / 30);
		}
	} catch (e) {
		console.error(e);
	}
}

function findContributionSettings() {
	const privateText = Array.from(document.querySelectorAll('*')).find(
		el => el.textContent === 'Turning off private contributions will show only public activity on your profile.'
	);
	const overviewText = Array.from(document.querySelectorAll('*')).find(
		el => el.textContent === 'Turning off the activity overview will hide the section on your profile.'
	);

	if (!privateText || !overviewText) return null;

	let privateParent = privateText.parentElement;
	while (privateParent) {
		if (privateParent.contains(overviewText)) {
			return privateParent.closest('.ActionListWrap');
		}
		privateParent = privateParent.parentElement;
	}

	return null;
}

function addLabel(id) {
	if (hasLabel(id)) return;
	let badAppleIdentifier = document.createElement('div');
	badAppleIdentifier.id = 'badapple-' + id;
	badAppleIdentifier.style.display = 'none';
	debug('added label: ' + id);

	const yearlyContributions = document.querySelector('.js-yearly-contributions');
	yearlyContributions.appendChild(badAppleIdentifier);
}

function removeLabel(id) {
	let label = document.querySelector('#badapple-' + id);
	if (label) {
		label.remove();
		debug('label removed: ' + id);
	} else {
		debug('label not removed: ' + id);
	}
}

function hasLabel(id) {
	let hasLabel = document.querySelector('#badapple-' + id) != null;
	debug('checking for label: ' + id + ', ' + hasLabel);
	return hasLabel;
}

function debug(message) {
	if (printDebug) console.log('[badapple] ' + message);
}

function debugRaw(message, object) {
	if (printDebug) {
		console.log('[badapple] ' + message);
		console.log(object);
	}
}