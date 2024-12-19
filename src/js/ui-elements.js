function createUIElements() {
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
    description.textContent = 'Turning on Bad Apple!! will play Bad Apple!! with your GitHub contribution graph.';

    descWrap.appendChild(label);
    descWrap.appendChild(description);
    button.appendChild(visualSpan);
    button.appendChild(descWrap);
    form.appendChild(button);
    listItem.appendChild(form);

    return {
        listItem,
        button,
        visualSpan,
        description
    };
}

function setupEventListeners(uiElements, contributionTable) {
    const { button, visualSpan, description } = uiElements;
    const inactiveText = 'Turning on Bad Apple!! will play Bad Apple!! with your GitHub contribution graph.';
    const activeText = 'Turning off Bad Apple!! will stop playing Bad Apple!! with your GitHub contribution graph.';

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
}