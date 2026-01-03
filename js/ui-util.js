/* UI UTILITIES: Exports UI utility functions

    # show/hideRetryBtn: Display retry screen if unable to fetch data; Retry btn retries to fetch data if clicked
    # loadingPage: Show & Hide Loading Page when DOM is ready (≈60%)
    # hide: Hide element with opacity transitions & display none property altogether
    # show: Display hidden element with opacity transitions & display none property altogether
*/

// RETRY BTN:
export function showRetryBtn(path = null) {
    // Hide:
    document.getElementById('melody').querySelector('.loadAtV')?.remove(); // Loading Page
    document.body.querySelector('#melody > main').style.display = 'none'; // Main Loaded Content

    // Store & Get/Set: Retry Screen
    const retry = (() => {
        let getRetry = document.getElementById('retry');
        if (getRetry) {
            getRetry.querySelector('h2').remove();
            getRetry.querySelector('.retryBtN').remove();
        }
        else {
            getRetry = document.createElement('div');
            getRetry.id = 'retry';
            document.getElementById('melody').prepend(getRetry);
        }
        return getRetry;
    })();

    // Create: h2 & btn
    const h2 = document.createElement('h2'), btn = document.createElement('button');
    h2.innerText = 'Something went wrong❗';
    btn.classList.add('retryBtN');
    btn.innerText = 'Retry';
    btn.addEventListener('click', () => fetchManifest(path)); // Fetch data again

    // Append: h2 & btn to Retry Screen
    retry.append(h2, btn);
}

export function hideRetryBtn() {
    document.getElementById('retry').remove(); // Hide: Retry Screen
    document.body.querySelector('#melody > main').style.display = 'block'; // Show: Loaded Main Content
}

// LOADING PAGE
export function loadingPage() {
    // Helper functions:
    function showLoadingPage() {
        // Gen:
        const cards = document.createElement('div');
        cards.classList.add('loadCardS');
        for (let i = 0; i < 8; i++) { // 8 Load Cards &
            const card = document.createElement('div');
            card.classList.add('loadCarD');
            // Append 3 Mini Cards in each of them
            for (let j = 0; j < 3; j++) {
                card.append(document.createElement('div'));
            }
            cards.append(card);
        }

        // Append Load: Title & Cards to Sect
        const title = document.createElement('div'), sect = document.createElement('section');
        title.classList.add('loadTitlE');
        sect.classList.add('loadAtV');
        sect.append(title, cards);
        document.getElementById('melody').prepend(sect); // Prepend: sect to melody
    }

    function hideLoadingPage() {
        document.getElementById('melody').querySelector('.loadAtV')?.remove();
    }

    // Main:
    showLoadingPage();
    document.addEventListener('DOMContentLoaded', hideLoadingPage());
}

// DISPLAY NONE WITH OPACITY TRANSITIONS:
export function hide(elem) {
    try {
        elem.classList.add('transition-opacity', 'opacity-none');
        setTimeout(() => {
            elem.classList.add('display-none');
            elem.classList.remove('transition-opacity', 'opacity-none');
        }, 400);
    } catch (err) {
        console.log('Failed to hide:', elem, err);
    }
}

export function show(elem) {
    try {
        elem.classList.add('transition-opacity', 'opacity-none');
        elem.classList.remove('display-none');
        elem.classList.add('opacity-1');
        setTimeout(() => elem.classList.remove('transition-opacity', 'display-none', 'opacity-none', 'opacity-1'), 400);
    } catch (err) {
        console.log('Failed to show:', elem, err);
    }
}