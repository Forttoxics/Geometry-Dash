const Storage = {
  async set(key, value) {
    localStorage.setItem(key, value);
  },
  async get(key) {
    const value = localStorage.getItem(key);
    return value === null ? null : { value };
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
    console.warn('Error al guardar datos:', e);
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
    if (bg) currentBg = parseInt(bg.value);
    const gbg = await Storage.get('gd2_currentGameBg');
    if (gbg) currentGameBg = parseInt(gbg.value);
  } catch(e) { console.warn('Error al cargar:', e); }
}
