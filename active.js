(async () => {
  try {
    console.log('bad apple started');

    if(document.querySelector('#badapple')) {
      console.log('Program already running');
      return;
    }
    let badAppleIdentifier = document.createElement('div');
    badAppleIdentifier.id = 'badapple';
    badAppleIdentifier.style.display = 'none';
    document.body.appendChild(badAppleIdentifier);

    const printDebug = false;
    const play_audio = true;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const debug = (message) => {
      if (printDebug) console.log(message);
    };

    const rows = 40
    const columns = 53;

    const animateFrameSpeed = 40;
    const randomAnimationDelay = 300;
    const brightnessAnimation = [1, 2, 3, 4, 4, 4, 4, 4, 3, 2, 1, 0];

    const url = chrome.runtime.getURL('video_data.json');
    const res = await fetch(url);
    const videoData = await res.json();
    debug('loaded video data');

    const audio_url = play_audio ? chrome.runtime.getURL('badapple.mp3') : null;
    const audio = play_audio ? new Audio(audio_url) : null;
    if(play_audio) {
      audio.volume = 0.5;
      audio.currentTime = 1;
      debug('loaded audio');
    } else {
      debug('skipping audio load');
    }

    const contributionTable = document.querySelector('.js-calendar-graph tbody');
    const contributionTableSave = contributionTable.cloneNode(true);

    if (!contributionTable) {
      alert('Could not find contribution table');
      return;
    } else debug('found contribution table');

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
    debug('canvas build instructions created');
    debug('beginning canvas build animation');

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
    debug('staged animation; awaiting completion');
    await sleep((rows + columns + (brightnessAnimation.length - 1)) * animateFrameSpeed + (randomAnimationDelay * 4));
    debug('animation should be complete; continuing code execution');

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
    debug(`found ${totalFrames} frame${totalFrames === 1 ? "" : "s"} to animate`);

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
        debug('contribution table reset');
        document.querySelector('#badapple').remove();
        debug('animation finished');
      }, animateFrameSpeed * (rows - 7));
      debug('staged contribution table reset');
    }

    // Code to draw frames with audio
    if(play_audio) {
      debug('starting audio');
      await audio.play().then(() => {
        debug('beginning animation');
        let intervalID = setInterval(() => {
          let currentFrameIndex = Math.floor(audio.currentTime * 30);
          if(currentFrameIndex === totalFrames || audio.ended || audio.paused) {
            debug('animation complete');
            clearInterval(intervalID);
            resetContributionTable();
            return;
          }
          drawFrame(currentFrameIndex);
        }, 1);
      });

    } else {
      debug('beginning animation');
      let currentFrameIndex = 30;
      const drawFramesContinuously = () => {
        if (currentFrameIndex < totalFrames) {
          drawFrame(currentFrameIndex);
          currentFrameIndex++;
        } else {
          debug('animation complete');
          clearInterval(intervalId);
          resetContributionTable();
        }
      };
      const intervalId = setInterval(drawFramesContinuously, 1000 / 30);
    }
  } catch (e) {
    console.error(e);
  }
})();