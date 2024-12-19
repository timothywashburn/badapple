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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));