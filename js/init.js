/*  INITIALIZE APP: Import & Export getters from organized data in O(n) time, creates maps inside for O(1) traversal */

import { showRetryBtn, hideRetryBtn, showLoadingPage, hideLoadingPage } from './ui-util.js';

/* *********************************************** SET CDN BASE *********************************************** */

const CDN_BASE = '/assets/';

/* ********************************************** HELPER FUNCTIONS **********************************************

    > Helper functions used in INIT to fetch & store protected data

    # fetchManifest: extract data from the path
    # fetchAlbum, fetch Artist: extensions of fetchManifest
    # sortSongs: sorted songs based on their stats
*/

/* ---------- HELPER FUNCTIONS ---------- */

// EXTRACT DATA FROM PATH
async function fetchManifest(path) {
    try {
        showLoadingPage();
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error('HTTP Error!');
        }
        const data = await response.json();
        if (data.ok || data.success || data.status === 'success') {
            hideRetryBtn();
        }
        hideLoadingPage();
        return data;
    } catch (err) {
        console.error('Unable to fetch Manifest! Error: ', err);
        hideLoadingPage();
        showRetryBtn(path);
        return null;
    }
}

// FETCH ALBUM & ARTIST DATA:
async function fetchAlbum(album = '') {
    return await fetchManifest(`${CDN_BASE}songs${album ? '/' + album : ''}/info.json`);
}

async function fetchArtist() {
    return await fetchManifest(`${CDN_BASE}artists/info.json`);
}

/* ***************************************** FETCH & STORE PROTECTED DATA *****************************************

    Used helper functions to fetch: CDN BASE, ALBUMS, SONGS, ARTISTS
    MAPS: KEY, INDEX TO ID & ID TO KEY INDEX
*/

// RETURN: ORGANIZED DATA FOR USAGE
const [songs, albums, artists, KEY_MAP, IDX_TO_ID_MAP, ID_TO_KEY_IDX_MAP] = await (
    async function initApp() {
        // Fetch data
        const albums = await fetchAlbum(), artists = await fetchArtist(), keyMap = new Array(albums.length), idxMap = [], idMap = [];

        // songs push → song details
        const songs = await (async () => {
            // Store temp vars
            const songDesc = [];
            let range = 0;

            // Store organized data album-wise
            for (let i = 0; i < albums.length; i++) {
                const curAlb = albums[i];
                const song = await fetchAlbum(curAlb.album);

                // idxMap push → song id, key index
                song.map(s => {
                    const ID = s.id;
                    idxMap.push(ID);
                    idMap[ID] = i;
                    delete s.id;
                    songDesc[ID] = s;
                });

                // keyMap push → album name, no. of songs range
                range += song.length;
                keyMap[i] = { key: curAlb.album, to: range };
            }
            return songDesc;
        })();
        return [songs, albums, artists, keyMap, idxMap, idMap];
    })();

console.log('Initialized SoundScript 🎧');

/* *************************************************** EXPORT GETTERS ***************************************************

    # CDN_BASE
    # correctRange: correct range if you pass from, to & length of a list.
                    E.g., Pass -> from: -1, to: 10, length: 8
                       Returns -> from:  0, to: 7

    > ID = SONG ID, KEY = ALBUM NAME, IDX = SONG IDX (FROM GENERATED MAPS)
    # getKey: KEY from ID
    # getId: ID from IDX
    # keyByKIdx: KEY from KEY_IDX
    # getKeyRange: KEY RANGE[FROM, TO] from IDX

    > SONGS RELATED DATA FROM IDX
    # albumsLen, artistsLen, songsLen
    # albumImg, artistsImg, songImg (returns img element) 
    # albumTitle, artistsName, songTitle
    # albumDesc, songArtist
    # songType
*/

// CDN BASE
export { CDN_BASE };

// CORRECT RANGE
export function correctRange(from, to, len) {
    if (isNaN(to) || to < 0 || to > len) to = len;
    if (isNaN(from) || from < 0) from = 0;
    else if (from > len) from = len;
    return [from, to];
}

// KEY:
export function getKey(songId) {
    return KEY_MAP[ID_TO_KEY_IDX_MAP[songId]].key;
}

export function keyByKIdx(keyIdx) {
    return KEY_MAP[keyIdx].key
}

// ID
export function getId(songIdx) {
    return IDX_TO_ID_MAP[songIdx];
}

// KEY RANGE [FROM, TO]
export function getKeyRange(keyIdx) {
    return [KEY_MAP[keyIdx - 1]?.to || 0, KEY_MAP[keyIdx].to];
}

// SONGS:
export function songsLen() {
    return songs.length;
}

export function songImg(ID, KEY = getKey(ID)) {
    const img = new Image();
    img.src = `${CDN_BASE}songs/${KEY}/covers/${ID}.${songs[ID].img || 'jpg'}`;
    img.onerror = () => {
        img.src = `${CDN_BASE}songs/${KEY}/covers/${KEY}.jpg`;
        img.onerror = () => img.src = `${CDN_BASE}songs/default.svg`;
    }
    return img;
}

export function songTitle(ID) {
    return songs[ID].song;
}

export function songArtist(ID) {
    return songs[ID].artist.join(', ');
}

export function songType(ID) {
    return songs[ID].type;
}

// ARTISTS:
export function artistsLen() {
    return artists.length;
}

export function artistImg(IDX) {
    const img = new Image(), imgName = artists[IDX].img;
    img.src = `${CDN_BASE}artists/${imgName ? imgName : 'default.png'}`;
    img.onerror = () => img.src = `${CDN_BASE}artists/default.png`;
    return img;
}

export function artistsName(IDX) {
    return artists[IDX].name;
}

// ALBUMS:
export function albumsLen() {
    return albums.length;
}

export function albumImg(IDX, KEY = keyByKIdx(IDX)) {
    const img = new Image();
    img.src = `${CDN_BASE}songs/${KEY}/covers/${KEY}.jpg`;
    img.onerror = () => img.src = `${CDN_BASE}songs/default.svg`;
    return img;
}

export function albumTitle(IDX) {
    return albums[IDX].title;
}

export function albumDesc(IDX) {
    return albums[IDX].desc;
}