/*  INITIALIZE APP: Import & Export getters from organized data in O(n) time, creates maps inside for O(1) traversal */

import { showRetryBtn, hideRetryBtn, loadingPage } from './ui-util.js';

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
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error('HTTP Error!');
        }
        const data = await response.json();
        if (data.ok || data.success || data.status === 'success') {
            hideRetryBtn();
        }
        return data;
    } catch (err) {
        console.error('Unable to fetch Manifest! Error: ', err);
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

    Used helper functions to fetch: CDN BASE, ALBUMS, SONGS, ARTISTS, KEY MAP & INDEX MAP
*/

// RETURN: ORGANIZED DATA FOR USAGE
const [songs, albums, artists, keyMap, idxMap] = await (
    async function initApp() {
        // Fetch data
        const keyMap = [], idxMap = [], albums = await fetchAlbum(), artists = await fetchArtist();

        // songs push → song details
        const songs = await (async () => {
            let songDesc = [], range = 0;
            for (let i = 0; i < albums.length; i++) { // Store organized data album-wise
                const curAlb = albums[i];
                const song = await fetchAlbum(curAlb.album);

                // idxMap push → song id, key index
                song.map(s => {
                    idxMap.push({ id: s.id, kIdx: i });
                    delete s.id;
                });
                songDesc = songDesc.concat(song);

                // keyMap push → album name, no. of songs range
                range += song.length;
                keyMap.push({ key: curAlb.album, to: range });
            }
            return songDesc;
        })();
        return [songs, albums, artists, keyMap, idxMap];
    })();

console.log('Initialized SoundScript 🎧');

/* *************************************************** EXPORT GETTERS ***************************************************

    # CDN_BASE
    # correctRange: correct range if you pass from, to & length of a list.
                    E.g., Pass -> from: -1, to: 10, length: 8
                       Returns -> from:  0, to: 7

    > ID = SONG ID, KEY = ALBUM NAME, IDX = SONG IDX (FROM GENERATED MAPS)
    # getKey: KEY from ID'
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
    if (isNaN(from) || from < 0 || from > len) from = 0;
    if (isNaN(to) || to < 0 || to > len) to = len;
    return [from, to];
}

// KEY:
export function getKey(songIdx) {
    return keyMap[idxMap[songIdx].kIdx].key;
}

export function keyByKIdx(keyIdx) {
    return keyMap[keyIdx].key
}

// ID
export function getId(songIdx) {
    return idxMap[songIdx].id;
}

// KEY RANGE [FROM, TO]
export function getKeyRange(keyIdx) {
    return [keyMap[keyIdx - 1]?.to || 0, keyMap[keyIdx].to];
}

// SONGS:
export function songsLen() {
    return songs.length;
}

export function songImg(IDX, KEY = getKey(IDX)) {
    const img = new Image();
    img.src = `${CDN_BASE}songs/${KEY}/covers/${getId(IDX)}.${songs[IDX].img || 'jpg'}`;
    img.onerror = () => {
        img.src = `${CDN_BASE}songs/${KEY}/covers/${KEY}.jpg`;
        img.onerror = () => img.src = `${CDN_BASE}songs/default.svg`;
    }
    return img;
}

export function songTitle(IDX) {
    return songs[IDX].song;
}

export function songArtist(IDX) {
    return songs[IDX].artist.join(', ');
}

export function songType(IDX) {
    return songs[IDX].type;
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

loadingPage();

