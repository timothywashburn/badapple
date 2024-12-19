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

        const url = chrome.runtime.getURL('assets/video_data.json');
        const res = await fetch(url);
        const videoData = await res.json();

        const audio_url = play_audio ? chrome.runtime.getURL('assets/badapple.mp3') : null;
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
                let lastRenderTime = performance.now();
                const frameDelay = 1000 / 30;

                function renderFrame() {
                    if (hasLabel('disable')) {
                        audio.pause();
                        resetContributionTable();
                        return;
                    }

                    const currentTime = performance.now();
                    if (currentTime - lastRenderTime >= frameDelay) {
                        const currentFrameIndex = Math.floor(audio.currentTime * 30);
                        if (currentFrameIndex === totalFrames || audio.ended || audio.paused) {
                            resetContributionTable();
                            return;
                        }
                        drawFrame(currentFrameIndex);
                        lastRenderTime = currentTime;
                    }
                    requestAnimationFrame(renderFrame);
                }

                requestAnimationFrame(renderFrame);
            });
        } else {
            let currentFrameIndex = 30;
            let lastRenderTime = performance.now();
            const frameDelay = 1000 / 30;  // Target 30fps

            function renderFrame() {
                if (currentFrameIndex < totalFrames && !hasLabel('disable')) {
                    const currentTime = performance.now();
                    if (currentTime - lastRenderTime >= frameDelay) {
                        drawFrame(currentFrameIndex);
                        currentFrameIndex++;
                        lastRenderTime = currentTime;
                    }
                    requestAnimationFrame(renderFrame);
                } else {
                    resetContributionTable();
                }
            }

            requestAnimationFrame(renderFrame);
        }
    } catch (e) {
        console.error(e);
    }
}