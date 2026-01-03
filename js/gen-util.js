/* GENERATOR UTILITIES for gen-main.js

    > Custom Events Emitted (Published)
    * SONG # change
    * NAV # show

    > Exported Functions

    * GENERATE SECTIONS ROBUSTLY: Cards, Card Slider Btns in #melody>main
    # genSongSect # genArtistSect # genAlbumSect

*/

import { albumDesc, albumImg, albumsLen, albumTitle, artistImg, artistsLen, artistsName, correctRange, songArtist, songImg, songTitle } from '/soundscript/js/init.js';
import { songsListLen, statIdx } from '/soundscript/js/music-manager.js';
import { NAV, SONG } from '/soundscript/js/event-emitter.js';

/* ************************************** HELPER FUNCTIONS ************************************** */

function genCardCont(CONT_ID, heading) {
    // Select/Append: melody>main
    const main = (() => {
        const melody = document.getElementById('melody');
        if (melody) {
            let main = melody.querySelector('main');
            if (!main) {
                main = document.createElement('main');
                melody.append(main);
            }
            return main;
        }
        return null;
    })();
    if (!main) {
        console.error('melody section not found!');
        return null;
    }

    const contMain = document.createElement('main');
    contMain.classList.add('no-wrap');
    // Create & Append:
    {
        const cardCont = document.createElement('div'), h2 = document.createElement('h2'),
            btn = document.createElement('button'), header = document.createElement('header');

        // cardCont to main
        cardCont.classList.add('cardConT');
        cardCont.id = CONT_ID;
        main.append(cardCont);

        // h2 & show all btn to header
        h2.innerText = heading;
        header.append(h2, btn);

        // header to cardCont
        btn.innerText = 'Show All';
        cardCont.append(header);
        cardCont.append(contMain); // contMain to card

        // NAV.emit: show
        btn.addEventListener('click', () => NAV.emit('show', CONT_ID));
    }
    return contMain;
}

function genCard(TYPE, CONT_ID, IDX, imgElem, title, desc, cont = document.getElementById(CONT_ID)) {
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
    cont.append(article);
}

/* *********************************** EXPORT SECTION GENERATING FUNCTIONS *********************************** */

// SONG
export function genSongSect(CONT_ID, heading, from = 0, to = null) {
    // Correct range & quit if start is end
    [from, to] = correctRange(from, to, songsListLen(CONT_ID));
    if (from === to) return;

    // Select Card Container
    const cont = (() => {
        const cardCont = document.getElementById(CONT_ID);
        return cardCont ? cardCont : genCardCont(CONT_ID, heading);
    })();

    // Gen Song Cards
    for (let i = from; i < to; i++) {
        const IDX = statIdx(CONT_ID, i);
        genCard('song', CONT_ID, i, songImg(IDX), songTitle(IDX), songArtist(IDX), cont);
    }
}

// ARTIST
export function genArtistSect(CONT_ID, heading, from = 0, to = null) {
    // Correct range & quit if start is end
    [from, to] = correctRange(from, to, artistsLen());
    if (from === to) return;

    // Select Card Container
    const cont = (() => {
        const cardCont = document.getElementById(CONT_ID);
        return cardCont ? cardCont : genCardCont(CONT_ID, heading);
    })();

    // Gen Artists Cards
    for (let i = from; i < to; i++) {
        genCard('artist', CONT_ID, i, artistImg(i), artistsName(i), 'Artist', cont);
    }
}

// ALBUM
export function genAlbumSect(CONT_ID, heading, from = 0, to = null) {
    // Correct range & quit if start is end
    [from, to] = correctRange(from, to, albumsLen());
    if (from === to) return;

    // Select Card Container
    const cont = (() => {
        const cardCont = document.getElementById(CONT_ID);
        return cardCont ? cardCont : genCardCont(CONT_ID, heading);
    })();

    // Gen Album Cards
    for (let i = from; i < to; i++) {
        genCard('album', CONT_ID, i, albumImg(i), albumTitle(i), albumDesc(i), cont);
    }
}