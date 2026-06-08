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
