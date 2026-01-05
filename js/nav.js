/* NAVIGATION: Private Module that handles hamburger menu, active states for mobiles/tablets &
                navigation to different pages. E.g, Home, Browse Songs, etc.

    > NAV Events Published & Subscribed
    # (show, CONT_ID): travel to different pages on btns click (show-all, browse, home) based on container ids (trendSongs, home, etc)
*/

import { NAV } from './event-emitter.js';
import { genAlbumSect, genArtistSect, genSongSect } from './gen-util.js';
import { hideSect, showSect } from './ui-util.js';

/* ******************************** RESPONSIVENESS ******************************** */

window.addEventListener('resize', () => {
    const homeBtn = document.getElementById('home-btn'), hamburger = document.getElementById('hamburger'), melody = document.getElementById('melody');

    // REMOVE HOME FOR SMALL MOBILES
    if (window.innerWidth < 535) {
        homeBtn.classList.add('display-none');
    } else {
        homeBtn.classList.remove('display-none');
    }

    // HAMBURGER AUTO-CLOSE & ACTIVE STATE FOR MOBILE/TABLET
    if (window.innerWidth < 1025) {
        // Hamburger auto-close menu when clicking content
        melody.onclick = () => { if (!hamburger.checked) hamburger.checked = true; };

        // Active States: Card, Card Slider & its btns
        document.addEventListener('click', function (e) {
            const clickedCard = e.target.closest('.CarD'),
                clickedCont = e.target.closest('.cardConT'),
                prevBtn = e.target.closest('.prevBtN'),
                nextBtn = e.target.closest('.nextBtN'),
                playBar = e.target.closest('#play-bar');

            // Click outside - remove all
            document.querySelectorAll('.CarD.active').forEach(card => card.classList.remove('active'));
            document.querySelectorAll('.cardConT.active').forEach(cont => cont.classList.remove('active'));
            document.querySelectorAll('.prevBtN.active').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.nextBtN.active').forEach(btn => btn.classList.remove('active'));
            document.getElementById('play-bar').classList.remove('active');

            // Add back if it wasn't active before
            if (clickedCard) {
                clickedCard.classList.add('active');
                clickedCont.classList.add('active');
            } else if (prevBtn || nextBtn) {
                clickedCont.querySelector('.prevBtN').classList.add('active');
                clickedCont.querySelector('.nextBtN').classList.add('active');
            } else if (playBar) playBar.classList.add('active');
        });
    } else { // On larger screens, remove auto-close & ensure menu is visible
        melody.onclick = null;
        hamburger.checked = false;
    }
});

// Trigger once on page load
window.dispatchEvent(new Event('resize'));

/* ************************************** UTILITIES ************************************* */

// HIDE SLIDER BTNS
function hideSliderBtns(contMain) {
    hideSect(contMain.querySelector('.prevBtN'));
    hideSect(contMain.querySelector('.nextBtN'));
}

// HIDE/SHOW CARD CONTAINERS:
const [hideConts, showConts] = (() => {
    const conts = document.getElementById('melody').querySelectorAll('.cardConT');
    return [(except = null) => {
        if (except) {
            conts.forEach(cont => {
                if (cont.id === except.id) {
                    showSect(cont);
                    cont.querySelector('main').classList.add('flex-wrap');
                } else hideSect(cont);
            });
        } else conts.forEach(cont => hideSect(cont));
    },
    () => {
        conts.forEach(cont => {
            showSect(cont.querySelector('header button'));
            const main = cont.querySelector('main');
            main.classList.remove('flex-wrap');
            showSect(main.querySelector('.prevBtN'));
            showSect(main.querySelector('.nextBtN'));
            showSect(cont);
        });
    }];
})();

// LOAD A SECTION FULLY FROM CONT_ID
const respondToURLChange = (CONT_ID => {
    const cont = document.getElementById(CONT_ID);

    // Show/Hide required content
    if (cont) {
        // Hide sliders, btns & inactive content
        hideSliderBtns(cont.querySelector('main'));
        hideSect(cont.querySelector('header button'));
        hideConts(cont);

        // Generate rest cards if not loaded
        if (!cont.classList.contains('loaded-more')) {
            if (CONT_ID === 'albums') {
                genAlbumSect(CONT_ID, '', 24);
            } else if (CONT_ID === 'artists') {
                genArtistSect(CONT_ID, '', 24);
            } else {
                genSongSect(CONT_ID, '', 24);
            }
            cont.classList.add('loaded-more');
        }
    } else { // Display sliders, btns with content
        showConts();
    }
});

/* **************************************** MAIN **************************************** */

// HAMBURGER TAP: CHANGE TITLE & ARIA LABEL
{
    const hamburger = document.getElementById('hamburger'), label = document.querySelector('label[for="hamburger"]');
    hamburger.addEventListener('change', () => {
        if (hamburger.checked) {
            label.title = 'Show Library';
            label.ariaLabel = 'Show Library';
        } else {
            label.title = 'Hide Library';
            label.ariaLabel = 'Hide Library';
        }
    });
}

// ADD EVENT LISTENERS: LOGO, HOME & BROWSE SONGS, NAV.emit: show
document.getElementById('logo').addEventListener('click', () => NAV.emit('show', 'home'));
document.getElementById('home-btn').addEventListener('click', () => NAV.emit('show', 'home'));
document.getElementById('browse-songs').addEventListener('click', () =>
    NAV.emit('show', ['trendSongs', 'lovedSongs', 'hatedSongs'][Math.floor(Math.random() * 3)])
);

/* ---------- RESPOND TO URL CHANGES ---------- */

NAV.on('show', CONT_ID => {
    // Window history push
    const url = new URL(window.location), params = url.searchParams;
    if (params.get('showId') === CONT_ID) return;
    params.set('showId', CONT_ID);
    window.history.pushState(null, null, url);

    // Load requested page
    respondToURLChange(CONT_ID);
});

// RESPOND TO URL CHANGES
window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    respondToURLChange(urlParams.get('showId'));
});

console.log('Website Mapped! 🗺️');