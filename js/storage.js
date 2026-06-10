const db = firebase.database();

const Storage = {
  async set(key, value) {
    await db.ref('gd/' + key).set(value);
  },
  async get(key) {
    const snap = await db.ref('gd/' + key).get();
    if (!snap.exists()) return null;
    return { value: snap.val() };
  },
};

async function save() {
  try {
    await Storage.set('gd2_streamers', JSON.stringify(streamers));
    await Storage.set('gd2_queue', JSON.stringify(queue));
    await Storage.set('gd2_banned', JSON.stringify(banned));
    await Storage.set('gd2_demons', JSON.stringify(demons));
    await Storage.set('gd2_songs', JSON.stringify(songs));
    await Storage.set('gd2_currentBg', currentBg.toString());
    await Storage.set('gd2_currentGameBg', currentGameBg.toString());
  } catch (e) {
    console.warn('Error al guardar:', e);
  }
}

async function load() {
  try {
    const s = await Storage.get('gd2_streamers');
    if (s) streamers = JSON.parse(s.value);
    const q = await Storage.get('gd2_queue');
    if (q) queue = JSON.parse(q.value);
    const b = await Storage.get('gd2_banned');
    if (b) banned = JSON.parse(b.value);
    const d = await Storage.get('gd2_demons');
    if (d) demons = JSON.parse(d.value);
    const sg = await Storage.get('gd2_songs');
    if (sg) songs = JSON.parse(sg.value);
    const bg = await Storage.get('gd2_currentBg');
    if (bg) { currentBg = parseInt(bg.value, 10); applyBg(currentBg); }
    const gbg = await Storage.get('gd2_currentGameBg');
    if (gbg) currentGameBg = parseInt(gbg.value, 10);
  } catch (e) {
    console.warn('Error al cargar:', e);
  }

  if (!streamers.length) {
    streamers = [
      { id: 'st1',  name: 'stremer1',  passHash: await sha256('1234'),  color: '#9B59B6', avatar: '' },
      { id: 'st2',  name: 'Forttoxics',passHash: await sha256('5678'),  color: '#00BFFF', avatar: '' },
      { id: 'st3',  name: 'stremer2',  passHash: await sha256('pass3'), color: '#FF6B35', avatar: '' },
      { id: 'st4',  name: 'stremer3',  passHash: await sha256('pass4'), color: '#39FF14', avatar: '' },
      { id: 'st5',  name: 'stremer4',  passHash: await sha256('pass5'), color: '#FF3A3A', avatar: '' },
      { id: 'st6',  name: 'stremer5',  passHash: await sha256('pass6'), color: '#FFD700', avatar: '' },
      { id: 'st7',  name: 'stremer6',  passHash: await sha256('pass7'), color: '#FF69B4', avatar: '' },
      { id: 'st8',  name: 'stremer7',  passHash: await sha256('pass8'), color: '#00FFCC', avatar: '' },
      { id: 'st9',  name: 'stremer8',  passHash: await sha256('pass9'), color: '#FF8C00', avatar: '' },
      { id: 'st10', name: 'stremer9',  passHash: await sha256('pass10'),color: '#7B68EE', avatar: '' },
    ];
    queue = { st1:[], st2:[], st3:[], st4:[], st5:[], st6:[], st7:[], st8:[], st9:[], st10:[] };
  }

  if (!demons.length) {
    demons = [
      { name: 'Thinking Space 2', creator: 'cairoX',  file: 'assets/demons/thinkingspaceII.mp3' },
      { name: 'Flamewall',        creator: 'Narwall',  file: 'assets/demons/flamewall.mp3'       },
      { name: 'Amethyst',         creator: 'iMist',    file: 'assets/demons/amethyst.mp3'        },
      { name: 'Tidal Wave',       creator: 'OniLink',  file: 'assets/demons/tidalwave.mp3'       },
      { name: 'Orbit',            creator: 'Mindcap',  file: 'assets/demons/orbit.mp3'           },
    ];
  }

  if (!songs.length) {
    songs = [
      { name: 'Back on Track',        file: 'assets/songs/backontrack.mp3'         },
      { name: 'Electroman Adventures', file: 'assets/songs/electromanadventures.mp3'},
      { name: 'Electrodynamix',        file: 'assets/songs/electrodynamix.mp3'      },
      { name: 'Fun Dance',             file: 'assets/songs/fundance.mp3'            },
      { name: 'Jumper',                file: 'assets/songs/jumper.mp3'              },
    ];
  }

  await save();
  renderStreamerList();
  renderDemonList();
  renderSongsList();
  renderBgSelector();
  renderGameBgSelector();
}
