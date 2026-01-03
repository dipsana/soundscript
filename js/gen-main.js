/* GENERATOR MAIN: Use functions in gen-util.js to generate sections */

import { genAlbumSect, genArtistSect, genSongSect } from '/soundscript/js/gen-util.js';
import { loadingPage } from '/soundscript/js/ui-util.js';

// Song
genSongSect('trendSongs', 'Trending Songs', 0, 24);
genSongSect('lovedSongs', 'Loved Songs', 0, 24);
genSongSect('hatedSongs', 'Hated Songs', 0, 24);

// Artists
genArtistSect('artists', 'Songs by Artists', 0, 24);
document.getElementById('artists').querySelector('main').title = 'In Development';

// Albums
genAlbumSect('albums', 'Albums', 0, 24);
loadingPage();
console.log('Content Loaded! 🔃');