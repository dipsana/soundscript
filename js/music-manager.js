/* MUSIC MANAGER: Syncs & stores music stats (like, dislike, plays) in browser local cache. It fully handles music related controls. */

import { SONG } from './event-emitter.js';
import { CDN_BASE, getId, getKey, getKeyRange, songArtist, songImg, songsLen, songTitle, songType } from './init.js';
import { hide, show } from './ui-util.js';

/* ************************************* INIT: DATA ************************************************

    Initializes required data for this entire module and exports critical getters used throughout this app.

    > Fetch & Store Protected Data
    # musicStats: Like, Dislike, Plays
    # songsList: Sorted songs in accordance to likes, dislikes & plays (trend, loved, hated songs)
    
    Stores musicStats & in local storage robustly merge stored & new stats (reset if fails) automatically.
*/

/* ---------- STORE SYNCED MUSIC STATS (OLD & NEW) ---------- */

const musicStats = (() => {

    /* ---------- SYNCS STATS LOCALLY: ---------- */

    // Old Stats
    function syncStatsLocally(oldStats = JSON.parse(localStorage.getItem('musicStats') || 'null')) {
        // Update stats locally
        function update(stats) { localStorage.setItem('musicStats', JSON.stringify(stats)); }

        // Return: Populated stats with init values locally
        function reset() {
            const stats = [];
            for (let i = 0; i < songsLen(); i++) {
                stats.push({ play: 0, like: 0, dislike: 0 });
            }
            update(stats); return stats;
        }

        // Sync Stats:
        try {
            if (oldStats) { // Retain old values
                const newStats = new Array(songsLen());
                for (let i = 0; i < songsLen(); i++) {
                    const songId = getId(i), oldSong = oldStats[songId];
                    if (oldSong) {
                        const plays = parseInt(oldSong.play), likes = parseInt(oldSong.like), dislikes = parseInt(oldSong.dislike);
                        newStats[songId] = {
                            play: isNaN(plays) ? 0 : plays,
                            like: isNaN(likes) ? 0 : likes,
                            dislike: isNaN(dislikes) ? 0 : dislikes
                        };
                    } else newStats[songId] = { play: 0, like: 0, dislike: 0 };
                }
                update(newStats); return newStats;
            } else { // Reset Stats in absence of old values
                return reset();
            }
        } catch (err) {
            return reset();
        }
    }

    // Music Stats
    function syncMusicStats() {
        syncStatsLocally(musicStats);
    }

    /* ---------- SYNC STATS WHEN IDLE ---------- */

    // Debounced sync to avoid firing too often
    let syncTimeout;
    function debouncedSync() {
        clearTimeout(syncTimeout);
        syncTimeout = setTimeout(syncMusicStats, 1000);
    }

    // Listeners
    window.addEventListener('beforeunload', syncMusicStats);
    document.addEventListener('visibilitychange', () => { if (document.hidden) syncMusicStats(); });
    window.addEventListener('online', debouncedSync);
    window.addEventListener('popstate', debouncedSync);
    setInterval(syncMusicStats, 60000);

    return syncStatsLocally();
})();

/* ---------- STORE SORTED SONGS ---------- */

const songsList = (() => {
    // GEN: TEMP STATS
    const tempStats = new Array(musicStats.length);
    for (let i = 0; i < musicStats.length; i++) {
        tempStats[i] = { ...musicStats[i], id: i }; // Copy properties, Add id
    }

    // SELECTION SORT
    function sortSongs(tempStats, comparator) {
        // Store
        const stats = tempStats,
            sortedList = new Array(Math.min(36, stats.length));

        for (let i = 0; i < Math.min(36, stats.length); i++) {
            // Find: Max Idx
            let maxIdx = i;
            for (let j = i + 1; j < stats.length; j++) {
                if (comparator(stats[j], stats[maxIdx]) < 0) {
                    maxIdx = j;
                }
            }
            // Swap Copied Stat
            [stats[i], stats[maxIdx]] = [stats[maxIdx], stats[i]];
            sortedList[i] = stats[i].id;
        }
        return sortedList;
    }

    // RETURN SORTED SONGS
    return {
        trendSongs: sortSongs(tempStats, (a, b) => b.play - a.play),
        lovedSongs: sortSongs(tempStats, (a, b) => (b.like - b.dislike) - (a.like - a.dislike)),
        hatedSongs: sortSongs(tempStats, (a, b) => (b.dislike - b.like) - (a.dislike - a.like))
    };
})();

/* ********************************** EXPORT GETTERS ********************************** */

/* --------- SONGS LIST: --------- */

// LENGTH
export function songsListLen(CONT_ID) {
    return songsList[CONT_ID].length;
}

// STAT INDEX
export function statId(CONT_ID, IDX) {
    const queue = songsList[CONT_ID];
    return queue ? queue[IDX] : getId(IDX); // returns passed song id if not found in songList indices
}

/* ********************************************* SHOW/HIDE: CTA & PLAY BAR *********************************************

    Hide/show play bar, CTA boxes & nav tiles according to requests from music player and play bar

    > Custom SONG Events Listened:
    # showcontrols # hidecontrols
*/

SONG.on('showcontrols', () => {
    show(document.querySelector('body > footer'));
    show(document.getElementById('tiles-nav'));
    document.body.querySelectorAll('#library .ctaBoX').forEach(box => hide(box));
});

SONG.on('hidecontrols', () => {
    hide(document.querySelector('body > footer'));
    hide(document.getElementById('tiles-nav'));
    document.body.querySelectorAll('#library .ctaBoX').forEach(box => show(box));
});

/* ****************************************** UTILITY INSTANCE: MUSIC PLAYER ******************************************

    The main critical class instance of this module. Its functions control music related functions & handle local storage stats updation.

    > UI includes
    # Current queue library with synced music tiles
    # Bar: Play, Seek, Vol, Mini Play

    > Storage: Local (different stats for every individual)

    > Controls Supported: play, pause, play (next, prev, current), 10s (forward, reverse), vol adjustments, seek, 
                          like, dislike & display current queue via library

    It emits (publishes) custom events from `event-emitter.js` module that are listened in `MAIN`

    > Song
    # playall

    > UI-UX Sync (pass CONT_ID, NTH_CARD, NTH_TILE)
    # play: play current song & set _wasPlaying flag to true
    # pause: pause current song
    # set: change song details when changed
    # showcontrols # hidecontrols

    > Seek Bar
    # timeupdate: pass song current time & duration

    > Music Tiles & CTA boxes
    # syncmusictiles

    It listens (subscribes) custom events to `event-emitter.js` module
    
    > Current Song Change
    # change: song/artist/album
    # playall: play all songs
*/

// MUSIC PLAYER INSTANCE
const PLAYER = (() => {

    /* ---------- INIT: REQUIRED VARIABLES ---------- */

    const _song = new Audio;
    let _queueId, _statId, _from, _to, _current, NTH_CARD, _wasPlaying = true, _listened = 0, _threshold, _lastTime;

    /* ---------- UTILITIES ---------- */

    // If 2 mins or 80% of song is heard, increment play in music stats by 1 & reset _listened
    function playTracker() {
        // 1. Fetch now & last time difference
        const now = _song.currentTime;
        const diff = now - _lastTime;

        // 2. Discard tracking if seeked
        if (diff > 0 && diff < 0.5) {
            _listened += diff;
            if (_listened > _threshold) { // 3. Check threshold to update/reset stats
                musicStats[_statId].play++;
                _listened = 0;
                _song.removeEventListener('timeupdate', playTracker);
            }
        }
        _lastTime = now; // 4. Store old _listened value
    }

    // SONG.emit: set
    function SET_SONG() {
        // Set New Current Song & Reset Play Counter Update
        if (_wasPlaying) _song.pause();
        _listened = 0;
        _statId = statId(_queueId, _current);
        if (_queueId !== 'albums') NTH_CARD = _current - _from + 1;
        _song.src = `${CDN_BASE}songs/${getKey(_statId)}/${_statId}.${songType(_statId) || 'mp3'}`;

        // Emit Custom Events
        SONG.emit('set', {
            LIKE: musicStats[_statId].like,
            DISLIKE: musicStats[_statId].dislike,
            TITLE: songTitle(_statId),
            DESC: songArtist(_statId),
            IMG: songImg(_statId)
        });

        // Restore play/pause
        _wasPlaying ? _song.play() : SONG.emit('pause', { CONT_ID: _queueId, NTH_CARD, NTH_TILE: _current - _from + 1 });
    }

    /* ---------- MUSIC PLAYER: CLASS & INSTANCE ---------- */

    class MusicPlayer {

        /* ---------- INIT ---------- */

        constructor() {

            // Hide play bar & set to full volume
            SONG.emit('hidecontrols');
            _song.volume = 1;

            /* ---------- Attach Song Events ---------- */

            _song.addEventListener('error', () => this.PLAY_NEXT()); // Error Prone
            _song.addEventListener('ended', () => this.PLAY_NEXT()); // Continuous Play
            _song.addEventListener('timeupdate', playTracker);       // Play Tracker

            // When fully loaded, update to accurate threshold
            _song.addEventListener('loadedmetadata', () => _threshold = _song.duration > 150 ? 120 : 0.8 * _song.duration);

            /* ---------- Custom SONG Event Emitters ---------- */

            _song.addEventListener('play', () => {
                _wasPlaying = true;
                if (_queueId !== 'albums') NTH_CARD = _current - _from + 1;
                SONG.emit('play', { CONT_ID: _queueId, NTH_CARD, NTH_TILE: _current - _from + 1 });
            });

            _song.addEventListener('pause', () => SONG.emit('pause', { CONT_ID: _queueId, NTH_CARD: _queueId === 'albums' ? NTH_CARD : _current - _from + 1, NTH_TILE: _current - _from + 1 }));

            _song.addEventListener('timeupdate', () => SONG.emit('timeupdate', { NOW: _song.currentTime, END: _song.duration }));

            /* ---------- Custom SONG Event Listeners ---------- */

            SONG.on('replay', () => this.REPLAY);

            SONG.on('playall', () => {
                _queueId = null; _from = _current = 0; _to = songsLen();
                _wasPlaying = true; SET_SONG();
                SONG.emit('syncmusictiles', { TYPE: 'song', CONT_ID: null, from: 0, to: _to });
            });

            SONG.on('change', ({ TYPE, CONT_ID, IDX }) => {
                let sameQueue = true;
                switch (TYPE) {
                    case 'song':
                        // Change: Queue
                        if (_queueId !== CONT_ID) {
                            _queueId = CONT_ID;
                            _from = 0; _to = songsListLen(CONT_ID);
                            sameQueue = false;
                            SONG.emit('syncmusictiles', { TYPE, CONT_ID: _queueId, from: 0, to: _to });
                        }

                        // No Change: toggle play/pause
                        if (sameQueue && _current === IDX) {
                            this.TOGGLE_PLAY();
                        }
                        // Change Current Song & SET NTH_CARD
                        else {
                            _current = IDX;
                            SET_SONG();
                            if (CONT_ID !== 'albums') NTH_CARD = _current - _from + 1;
                        }
                        break;

                    case 'album':
                        // Change: Song → Album
                        if (_queueId !== CONT_ID) {
                            _queueId = CONT_ID;
                            sameQueue = false;
                        }

                        // No Change: toggle play/pause
                        if (sameQueue && NTH_CARD === IDX + 1) {
                            this.TOGGLE_PLAY();
                        }
                        else { // Change: Album
                            [_from, _to] = getKeyRange(IDX);
                            _current = _from; NTH_CARD = IDX + 1;
                            SONG.emit('syncmusictiles', { TYPE: 'song', CONT_ID: 'albums', from: _from, to: _to });
                            SET_SONG();
                        }
                        break;

                    // 'artist' intentionally omitted for now
                    default: break;
                }
            });
            console.log('Initialized MusicPlayer 🎵');
        }

        /* ---------- SONG CONTROLS (Reset: Play Counter Update on REPLAY) ---------- */

        PLAY() {
            _song.play();
        }
        PAUSE() {
            _song.pause();
            _wasPlaying = false;
        }
        TOGGLE_PLAY() {
            _wasPlaying ? this.PAUSE() : this.PLAY();
        }
        REPLAY() {
            _song.currentTime = 0;
            _listened = 0;
            if (_song.paused) this.PLAY();
        }

        FORWARD() {
            if (!_song.duration || _song.duration <= 0) return;
            _song.currentTime = _song.duration - _song.currentTime > 10 ? _song.currentTime + 10 : _song.duration;
        }
        REVERSE() {
            if (!_song.duration || _song.duration <= 0) return;
            _song.currentTime = _song.currentTime < 10 ? 0 : _song.currentTime - 10;
        }

        PLAY_NEXT() {
            _current = _current < _to - 1 ? _current + 1 : _from;
            SET_SONG();
        }
        PLAY_PREV() {
            _current = _current <= _from ? _to - 1 : _current - 1;
            SET_SONG();
        }

        SEEK(percent) {
            if (!_song.duration || _song.duration <= 0) return;
            _song.currentTime = percent * _song.duration;
        }

        VOLUME(range = 1) {
            _song.volume = Math.max(Math.min(range, 1), 0);
        }

        LIKE() {
            return ++musicStats[_statId].like;
        }
        DISLIKE() {
            return ++musicStats[_statId].dislike;
        }
    }
    return new MusicPlayer();
})();

/* ********************************************** MAIN **********************************************

    Create responsive & interactive app UI-UX that gets linked with PLAYER (Music Player).
    Emit/Listen (Publish/Subscribe) SONG Custom Events.
*/

/* --------------------------------------- PLAY ALL SONGS BTN ---------------------------------------
   Emit: playall
*/

document.getElementById('play-all').addEventListener('click', () => SONG.emit('playall'));

/* -------------- SYNC INTERACTIVE MUSIC TILES WITH CURRENT QUEUE & SHOW/HIDE CTA BOXES --------------
    Emit: change, hidecontrols, showcontrols
*/

SONG.on('syncmusictiles', ({ TYPE, CONT_ID, from = 0, to = songsLen() }) => {
    // Select #library>header & Remove prev music tiles
    const header = document.body.querySelector('#library > header');
    document.getElementById('tiles')?.remove();

    // If Empty Queue: SONG.emit: hidecontrols & EXIT
    if (from === to) {
        SONG.emit('hidecontrols');
        return;
    }

    // Create #tiles container
    const tiles = document.createElement('main');
    tiles.id = 'tiles';
    header.after(tiles);

    // Gen new music tiles
    for (let i = from; i < to; i++) {
        // Gen a music tile
        const tile = document.createElement('article'), figCap = document.createElement('figcaption'),
            h3 = document.createElement('h3'), p = document.createElement('p');

        // Add: Class, Title & Aria Label
        tile.classList.add('TilE');
        tile.title = tile.ariaLabel = 'Play';

        // Fetch Song Id
        const ID = statId(CONT_ID, i);

        // Fig cap: title & artist names
        h3.innerText = songTitle(ID);
        p.innerText = songArtist(ID);

        // Append: tiles → tile → img, fig cap
        figCap.append(h3, p);
        tile.append(songImg(ID), figCap);
        tiles.append(tile);
        tile.addEventListener('click', () => SONG.emit('change', { TYPE, CONT_ID, IDX: i })); // SONG.emit: change
    }

    // SONG.emit: showcontrols
    SONG.emit('showcontrols');
});

/* ----------------------------------------------- PLAY BAR & PLAY/PAUSE UI -----------------------------------------------
 
    Make play bar interactive & functional. Syncs play/pause with the UI globally (#melody, #library, #play-bar).
    Uses Music Player Instance
    Listen: play, pause, timeupdate, set
*/
{
    /* ---------- INIT VARIABLES ---------- */

    // Controls
    const [like, dislike, forward, reverse, playPrev, playCurr, playNext, replayCurr, replaySong] = (() => {
        return [
            document.getElementById('like'),
            document.getElementById('dislike'),
            document.getElementById('forward'),
            document.getElementById('reverse'),
            document.getElementById('play-prev'),
            document.getElementById('play-curr'),
            document.getElementById('play-next'),
            document.getElementById('replay-curr'),
            document.getElementById('replay-song')
        ];
    })();

    // Song Cover, Now, End, Counters & Hearts
    const [songCover, songTitle, songArtist, now, end, counter, heart] = (() => {
        const songDetails = document.getElementById('song-details'),
            likes = songDetails.querySelector('.likes'),
            dislikes = songDetails.querySelector('.dislikes');

        return [
            document.getElementById('song-cover'),
            document.getElementById('song-title'),
            document.getElementById('song-artist'),
            songDetails.querySelector('.now'),
            songDetails.querySelector('.end'),
            {
                like: like.querySelector('.counter'), dislike: dislike.querySelector('.counter'),
                likes: likes.querySelector('.counter'), dislikes: dislikes.querySelector('.counter')
            },
            {
                likes: likes.querySelector('.heart'), dislikes: dislikes.querySelector('.heart')
            }
        ];
    })();

    // Store Current: Music Tile & Card Play Btn
    let curTile, curPlay;

    /* ---------- UTILITIES: RETRIGGER ANIMATIONS / TRANSITIONS ---------- 
        Use wisely: Not useful against elements with no CSS animations/transitions
    */

    function retriggerAnimations(className, ...elements) {
        elements.forEach(el => el.classList.remove(className));
        void elements[0].offsetWidth; // Force reflow
        elements.forEach(el => el.classList.add(className));
    }

    function retriggerTransitions(className, timeout, ...elements) {
        elements.forEach(el => el.classList.add(className));
        elements.forEach(el => setTimeout(() => el.classList.remove(className), timeout));
    }

    // Returns string formatted time
    function formatTime(t) {
        if (!isFinite(t) || t <= 0) return '--:--';
        return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
    }

    /* ---------- Custom SONG Event Listeners ---------- */

    SONG.on('play', ({ CONT_ID, NTH_CARD, NTH_TILE }) => {
        try {
            // Play Bar
            playCurr.classList.add('pause');
            playCurr.title = playCurr.ariaLabel = 'Pause Current Song';

            // Prev: Music Tile & Play Btn
            if (curTile) curTile.id = '';
            if (curPlay) curPlay.id = '';

            // Curr: Music Tile
            curTile = document.querySelector(`#tiles .TilE:nth-child(${NTH_TILE})`);
            curTile.id = 'active-tile';
            curTile.classList.remove('outline-red');
            curTile.title = curTile.ariaLabel = 'Pause';

            // Curr: Card Play Btn
            curPlay = document.querySelector(`#${CONT_ID} .CarD:nth-child(${NTH_CARD}) .cardPlaY`);
            curPlay.id = 'card-pause';
            curPlay.title = curPlay.ariaLabel = 'Pause';
        } catch (err) {
            console.log('Unaltered card play/pause btns!');
        }
    });

    SONG.on('pause', ({ CONT_ID, NTH_CARD, NTH_TILE }) => {
        try {
            // Play Bar
            playCurr.classList.remove('pause');
            playCurr.title = playCurr.ariaLabel = 'Play Current Song';

            // Prev: Music Tile & Play Btn
            if (curTile) curTile.id = '';
            if (curPlay) curPlay.id = '';
            
            // Curr: Music Tile
            curTile = document.querySelector(`#tiles .TilE:nth-child(${NTH_TILE})`);
            curTile.classList.add('outline-red');
            curTile.id = 'active-tile';
            curTile.title = curTile.ariaLabel = 'Play';
            
            // Curr: Card Play Btn
            curPlay = document.querySelector(`#${CONT_ID} .CarD:nth-child(${NTH_CARD}) .cardPlaY`);
            curPlay.title = curPlay.ariaLabel = 'Play';
        } catch (err) {
            console.log('Unaltered card play/pause btns!');
        }
    });

    SONG.on('timeupdate', ({ NOW, END }) => {
        now.textContent = formatTime(NOW) + ' / ' + formatTime(END);
        end.textContent = '-' + formatTime(END - NOW);
    });

    SONG.on('set', ({ LIKE, DISLIKE, TITLE, DESC, IMG }) => {
        // Counter
        counter.likes.textContent = LIKE;
        counter.dislikes.textContent = DISLIKE;

        // Song Details
        songTitle.textContent = TITLE;
        songArtist.textContent = DESC;
        songCover.querySelector('img')?.remove();
        songCover.append(IMG);
    });

    /* ---------- MAIN ---------- */

    like.addEventListener('click', () => {
        // Update stats locally
        const count = PLAYER.LIKE();

        // Like animation
        counter.like.textContent = '+' + count;
        retriggerAnimations('opinion', counter.like);

        // Show likes with animation
        counter.likes.textContent = count;
        retriggerAnimations('showLikes', counter.likes, heart.likes);
    });

    dislike.addEventListener('click', () => {
        // Update stats locally
        const count = PLAYER.DISLIKE();

        // Dislike animation
        counter.dislike.textContent = '-' + count;
        retriggerAnimations('opinion', counter.dislike);

        // Show dislikes with animation
        counter.dislikes.textContent = count;
        retriggerAnimations('showDislikes', counter.dislikes, heart.dislikes);
    });

    playCurr.addEventListener('click', () => PLAYER.TOGGLE_PLAY());

    playPrev.addEventListener('click', () => {
        PLAYER.PLAY_PREV();
        retriggerTransitions('active', 200, playPrev);
    });

    playNext.addEventListener('click', () => {
        PLAYER.PLAY_NEXT();
        retriggerTransitions('active', 200, playNext);
    });

    forward.addEventListener('click', () => {
        PLAYER.FORWARD();
        retriggerAnimations('forwardGlow', forward);
    });

    reverse.addEventListener('click', () => {
        PLAYER.REVERSE();
        retriggerAnimations('reverseGlow', reverse);
    });

    [replayCurr, replaySong].forEach(elem => elem.addEventListener('click', () => {
        PLAYER.REPLAY();
        retriggerTransitions('rotate-180', 400, replayCurr, replaySong);
    }));
}
console.log('Initialized PlayBar ⏯️');

/* ----------------------------------------------- SEEK BAR ------------------------------------------------
    Listen: timeupdate
*/
{
    /* -------------- INIT: REQUIRED VARIABLES -------------- */

    // Select Bar: Base, Seek & Seeker
    const baseBar = document.getElementById('base-bar'),
        seekBar = document.getElementById('seek-bar'),
        barSeeker = document.getElementById('bar-seeker');

    // Store percentage seek bar moved & is seeking flag
    let percent, isSeeking;

    // Fetch responsive rect
    let rect = baseBar.getBoundingClientRect();
    const baseBarResizeObserver = new ResizeObserver(() => setTimeout(() => rect = baseBar.getBoundingClientRect(), 1020));
    baseBarResizeObserver.observe(baseBar);

    /* ------------ UTILITIES ------------ */

    function updateSeekPosition(e) {
        /* Fetch percentage of seek bar seeked:
            1. Round up range i.e. 0-1
            2. Fetch user's position in accordance to base bar
            3. Find percentage moved by diving result by total width */
        percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / (rect.width)));

        // Update seek bar & bar seeker position
        const percentUpdate = percent * 100;
        seekBar.style.width = percentUpdate + '%';
        barSeeker.style.left = `calc(${percentUpdate}% - 8px)`;
    }

    function cancelSeek() { // Reset flag & remove event listeners
        isSeeking = false;
        window.removeEventListener('pointermove', updateSeekPosition);
        window.removeEventListener('pointerup', endSeek);
        window.removeEventListener('pointerleave', cancelSeek);
        window.removeEventListener('pointercancel', cancelSeek);
    }

    function endSeek(e) {
        updateSeekPosition(e);
        cancelSeek();
        PLAYER.SEEK(percent);
    }

    /* -------------- MAIN -------------- */

    /* ==========================
        Attach Events When User: 
       ==========================
    */
    // presses on the bar
    baseBar.addEventListener('pointerdown', () => {
        isSeeking = true;                                           // set flag
        window.addEventListener('pointermove', updateSeekPosition); // moves anywhere on screen
        window.addEventListener('pointerup', endSeek);              // is released anywhere
        window.addEventListener('pointerleave', cancelSeek);        // suddenly exits
        window.addEventListener('pointercancel', cancelSeek);       // is interrupted by OS
    });

    /* =============================
        Custom SONG Event Listeners 
       =============================
    */
    // Update Seek Bar with Song
    SONG.on('timeupdate', ({ NOW, END }) => {
        if (isSeeking) return;
        const percent = NOW / END * 100;
        seekBar.style.width = percent + '%';
        barSeeker.style.left = `calc(${percent}% - 8px)`;
    });
}
console.log('Initialized Seek Bar ─•────');

/* ---------------------------------------------- VOLUME BAR ------------------------------------------ */
{
    // Init: Required Variables
    const vol = document.getElementById('vol'),
        volIcon = vol.querySelector('span'),
        volBar = vol.querySelector('input');

    // Vol icon & input interactivity
    volBar.addEventListener('input', () => {
        // Fetch input
        const val = parseFloat(volBar.value);
        PLAYER.VOLUME(val); // Modify Volume

        // Volume Level CSS Adjustments:
        if (val > 0.66) volIcon.textContent = '🔊';      // High
        else if (val > 0.34) volIcon.textContent = '🔉'; // Medium
        else if (val > 0) volIcon.textContent = '🔈';    // Low
        else volIcon.textContent = '🔇';                 // Mute

        // Update vol bar msg: title & aria label
        vol.title = vol.ariaLabel = 'Volume is at ' + (val * 100) + '%';
    });

    // When vol icon is clicked, toggle mute/unmute
    volIcon.addEventListener('click', () => {

        // Based on volume level:
        if (parseFloat(volBar.value) > 0) { // Mute
            PLAYER.VOLUME(0);
            volIcon.textContent = '🔇';
            volBar.value = 0;
            msg += '0%';
        } else { // Unmute to Full Volume
            PLAYER.VOLUME(1);
            volIcon.textContent = '🔊';
            volBar.value = 1;
            msg += '100%';
        }

        // Set vol bar msg template: title & aria label
        vol.title = vol.ariaLabel = 'Volume is at ';
    });
    console.log('Initialized Volume Bar ─•────');
}

/* ------------------------------------------ MINI PLAY BAR ----------------------------------------------

    Attach a draggable responsive mini play bar that supports edge snapping on bottom & right.
    A toggle btn is provided with it that also acts a safety btn if user slides the mini bar to hide it.
*/
{
    // Init: toggle btn, footer, is dragging flag
    const toggleBtn = document.getElementById('toggle-bar'),
        footer = document.querySelector('body > footer'), playBar = document.getElementById('play-bar'),
        bottom = playBar.getBoundingClientRect().bottom;
    let drag = false, offsetX, offsetY;

    // Init: handlers
    const isDragging = (e) => {
        if (e.target === playBar) { // SET:
            // Flag, Class
            drag = true;
            playBar.classList.add('grabbing');

            // OffsetX, OffsetY
            const rect = playBar.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = window.innerHeight - rect.height;
        }
    }, startDrag = (e) => {
        if (drag) {
            // Set translateX & translateY with Edge Snapping:
            const translateX = (() => {
                const x = e.clientX - offsetX, right = window.innerWidth - playBar.offsetWidth - 35;
                return x > right ? right : x; // Right
            })(), translateY = (() => {
                const y = e.clientY - offsetY;
                return y < 0 ? y : 0; // Bottom
            })();
            // Transform Mini Bar
            playBar.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }
    }, stopDrag = () => {
        drag = false;
        playBar.classList.remove('grabbing');
    }

    // Add event listener to toggle btn
    toggleBtn.addEventListener('click', () => {
        // Switch to full bar
        if (footer.id === 'mini') {
            // Rotate btn + set aria-label & title
            toggleBtn.classList.remove('rotate-y-180');
            toggleBtn.title = toggleBtn.ariaLabel = 'Switch to Mini Play Bar?';

            // Remove tag (id) & title
            footer.id = '';
            footer.removeAttribute('title');
            playBar.style = '';

            // Remove event listeners to make mini bar not draggable
            playBar.removeEventListener('pointerdown', isDragging);
            window.removeEventListener('pointermove', startDrag);
            window.removeEventListener('pointerup', stopDrag);

            // Adjust CSS
            document.getElementById('play-bar').classList.remove('w-mini-bar');
            document.getElementById('preview-bar').querySelector('figcaption').classList.remove('w-mini-controls');

            // Show extra controls
            show(document.getElementById('base-bar'));
            show(document.getElementById('song-details'));
        }
        // Switch to mini bar
        else {
            // Rotate btn + set aria-label & title
            toggleBtn.classList.add('rotate-y-180');
            toggleBtn.title = toggleBtn.ariaLabel = 'Switch to Full Play Bar?';

            // Add tag (id) & title
            footer.id = 'mini';
            footer.setAttribute('title', 'You can drag me');

            // Add event listeners to make mini bar draggable
            playBar.addEventListener('pointerdown', isDragging);
            window.addEventListener('pointermove', startDrag);
            window.addEventListener('pointerup', stopDrag);

            // Adjust CSS
            document.getElementById('play-bar').classList.add('w-mini-bar');
            document.getElementById('preview-bar').querySelector('figcaption').classList.add('w-mini-controls');

            // Hide extra controls
            hide(document.getElementById('base-bar'));
            hide(document.getElementById('song-details'));
        }
    });
    console.log('Initialized Mini Bar 👧');
}
console.log('Loaded Music Manager 🎶');