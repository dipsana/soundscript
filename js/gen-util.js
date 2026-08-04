/* GENERATOR UTILITIES for gen-main.js

    > Custom Events Emitted
    * SONG # change
    * NAV # show

    > Exported Functions

    * GENERATE SECTIONS ROBUSTLY: Cards, Card Slider Btns in #melody>main
    # genSongSect # genArtistSect # genAlbumSect

*/

import { albumDesc, albumImg, albumsLen, albumTitle, artistImg, artistsLen, artistsName, correctRange, songArtist, songImg, songTitle } from './init.js';
import { songsListLen, statId } from './music-manager.js';
import { NAV, SONG } from './event-emitter.js';
import { hideLoadingPage, showLoadingPage } from './ui-util.js';

/* ************************************** HELPER FUNCTIONS ************************************** */

function genCardContWithSliderBtns(CONT_ID, heading) {
    // Select/Append: melody>main
    const main = (() => {
        const melody = document.getElementById('melody');
        if (melody) {
            let main = melody.querySelector('main');
            if (!main) {
                main = document.createElement('main');
                melody.appendChild(main);
            }
            return main;
        }
        return null;
    })();
    if (!main) {
        console.error('melody section not found!');
        return null;
    }

    /* --------- Create ---------- */

    const cont = document.createElement('div'), h2 = document.createElement('h2'), btn = document.createElement('button'),
        header = document.createElement('header'), contMain = document.createElement('main'),
        prevBtn = document.createElement('div'), nextBtn = document.createElement('div');

    /* ---------- Append & Add: Classes + ID + Text ---------- */

    // cont → main
    cont.classList.add('cardConT');
    cont.id = CONT_ID;
    main.appendChild(cont);

    // cont → header → h2 & show all btn
    h2.innerText = heading;
    btn.innerText = 'Show All';
    header.append(h2, btn);

    // cont → main → slider btns
    contMain.classList.add('no-wrap');
    prevBtn.classList.add('prevBtN');
    nextBtn.classList.add('nextBtN');
    contMain.append(prevBtn, nextBtn);

    // cont → header & main
    cont.append(header, contMain);

    // NAV.emit: show
    btn.addEventListener('click', () => NAV.emit('show', CONT_ID));
    return prevBtn;
}

function genCard(TYPE, CONT_ID, IDX, imgElem, title, desc, prevBtn) {
    // Create:
    const article = document.createElement('article'),
        fig = document.createElement('figure'), playBtn = document.createElement('div'),
        h3 = document.createElement('h3'), p = document.createElement('p');

    article.classList.add('CarD');

    // Play btn
    playBtn.classList.add('cardPlaY');
    playBtn.title = playBtn.ariaLabel = 'Play';
    playBtn.addEventListener('click', () => SONG.emit('change', { TYPE, CONT_ID, IDX })); // SONG.emit: change

    // Append: img & play btn to fig, fig to article
    fig.append(imgElem, playBtn);
    article.append(fig);

    // Card title, desc
    h3.innerText = title;
    p.innerText = desc;

    // Append: title & desc to article, article to cardConT>main
    article.append(h3, p);
    prevBtn.before(article);
}

/* *********************************** EXPORT SECTION GENERATING FUNCTIONS *********************************** */

// SONG
export function genSongSect(CONT_ID, heading, from = 0, to = undefined) {
    // Correct range & quit if start is end
    [from, to] = correctRange(from, to, songsListLen(CONT_ID));
    if (from === to) return;

    // Select Card Container
    const prevBtn = (() => {
        const prev = document.querySelector(`#${CONT_ID} > main > .prevBtN`);
        return prev ? prev : genCardContWithSliderBtns(CONT_ID, heading);
    })();

    // Gen Song Cards
    showLoadingPage();
    for (let i = from; i < to; i++) {
        const ID = statId(CONT_ID, i);
        genCard('song', CONT_ID, i, songImg(ID), songTitle(ID), songArtist(ID), prevBtn);
    }
    hideLoadingPage();
}

// ARTIST
export function genArtistSect(CONT_ID, heading, from = 0, to = undefined) {
    // Correct range & quit if start is end
    [from, to] = correctRange(from, to, artistsLen());
    if (from === to) return;

    // Select Card Container
    const prevBtn = (() => {
        const prev = document.querySelector(`#${CONT_ID} > main > .prevBtN`);
        return prev ? prev : genCardContWithSliderBtns(CONT_ID, heading);
    })();

    // Gen Artists Cards
    showLoadingPage();
    for (let i = from; i < to; i++) {
        genCard('artist', CONT_ID, i, artistImg(i), artistsName(i), 'Artist', prevBtn);
    }
    hideLoadingPage();
}

// ALBUM
export function genAlbumSect(CONT_ID, heading, from = 0, to = undefined) {
    // Correct range & quit if start is end
    [from, to] = correctRange(from, to, albumsLen());
    if (from === to) return;

    // Select Card Container
    const prevBtn = (() => {
        const prev = document.querySelector(`#${CONT_ID} > main > .prevBtN`);
        return prev ? prev : genCardContWithSliderBtns(CONT_ID, heading);
    })();

    // Gen Album Cards
    showLoadingPage();
    for (let i = from; i < to; i++) {
        genCard('album', CONT_ID, i, albumImg(i), albumTitle(i), albumDesc(i), prevBtn);
    }
    hideLoadingPage();
}