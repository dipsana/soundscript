/* SEARCH BAR: Loads search bar after sorting data. Accepts user input & displays required results using linear alphabetical search [O(n)].
                Currently, only song title searching is supported.
*/

import { hide, show } from '/js/ui-util.js';
import { SONG } from '/js/event-emitter.js';

/* ************************************************* INIT *************************************************

    Fetch & organize data. When done, make search bar visible.
    Custom SONG Event Listener: showcontrols
*/

// Select
const searchBtn = document.getElementById('search-btn'), searchBar = document.getElementById('search-bar');

// Fetch Data & Load Search Bar
const map = [];
SONG.on('showcontrols', () => {
    hide(searchBtn); hide(searchBar);
    fetchData();
    show(searchBar); show(searchBtn);
    console.log('Loaded Search Bar 🔍');
});

// Show Search Bar

/* ************************************************** UTILITIES **************************************************

    Core utility functions used in MAIN
    # fetchData # showResult
*/

function fetchData() {
    // Select
    const tiles = document.querySelectorAll('#tiles .TilE figcaption h3');
    // Fetch
    for (let i = 0; i < tiles.length; i++) {
        const text = tiles[i].textContent.toLowerCase();
        map.push({ title: text, tile: i + 1 });
    }
    map.sort(); // Sort
}

// Linear Search
function showResult(term) {
    for (let i = 0; i < map.length; i++) {
        const elem = map[i];
        if (elem.title.startsWith(term)) {
            // Select
            const targetTile = document.querySelector(`#tiles .TilE:nth-child(${elem.tile})`);
            if (targetTile) {
                // Redirect to search results
                targetTile.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                // Visual highlight
                targetTile.classList.add('highlight');
                setTimeout(() => targetTile.classList.remove('highlight'), 1000);
            }
        }
    }
}

/* *************************************************** MAIN ***************************************************

    Read search bar input & display search results in its accordance.
*/

// Store input & show results
let term;
searchBar.addEventListener('input', e => {
    term = e.target.value.toLowerCase().trim();
    if (term) showResult(term);
});