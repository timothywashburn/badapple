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

            const uiElements = createUIElements();
            setupEventListeners(uiElements, contributionTable);
            contributionSettings.appendChild(uiElements.listItem);
        }
    } catch (e) {
        console.error(e);
    }
})();

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