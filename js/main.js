let streamers = [];
let queue = {};
let sentLevels = {};
let banned = [];
let demons = [];
let songs = [];
let currentStreamer = null;
let loginTarget = null;
let bestScore = 0;
let currentIcon = 0;
let cubeSkin = 0;
let currentBg = 0;
let currentGameBg = 0;
let activeAudio = null;
let activeTrackEl = null;

const DEV_HASH = '82cd59125fd51edf979666c4dafae56556498987a9866e2879d12b8d0e0aed0c';

const BG_WALLPAPERS = [
  { name: 'Fondo 1', file: 'assets/imagenes/fondos/fondo1.jpg' },
  { name: 'Fondo 2', file: 'assets/imagenes/fondos/fondo2.jpg' },
  { name: 'Clasico', file: 'assets/imagenes/fondos/fondo3.jpg' },
];

const GAME_BG_OPTIONS = [
  { name: 'Fondo 1', file: 'assets/imagenes/fondos/fondo1game.jpg' },
  { name: 'Fondo 2', file: 'assets/imagenes/fondos/fondo2game.jpg' },
  { name: 'Clasico', file: 'assets/imagenes/fondos/fondo3game.jpg' },
];

async function sha256(msg) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
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
    if (bg) {
      currentBg = parseInt(bg.value, 10);
      applyBg(currentBg);
    }
    const gbg = await Storage.get('gd2_currentGameBg');
    if (gbg) currentGameBg = parseInt(gbg.value, 10);
  } catch (e) {
    console.warn('Error al cargar datos:', e);
  }

  if (!streamers.length) {
    streamers = [
      { id: 'st1', name: 'stremer1', passHash: await sha256('1234'), color: '#9B59B6', avatar: 'https://via.placeholder.com/42?text=S1' },
      { id: 'st2', name: 'Forttoxics', passHash: await sha256('5678'), color: '#00BFFF', avatar: 'https://via.placeholder.com/42?text=FX' },
      { id: 'st3', name: 'stremer2', passHash: await sha256('pass3'), color: '#FF6B35', avatar: 'https://via.placeholder.com/42?text=S2' },
      { id: 'st4', name: 'stremer3', passHash: await sha256('pass4'), color: '#39FF14', avatar: 'https://via.placeholder.com/42?text=S3' },
      { id: 'st5', name: 'stremer4', passHash: await sha256('pass5'), color: '#FF3A3A', avatar: 'https://via.placeholder.com/42?text=S4' },
      { id: 'st6', name: 'stremer5', passHash: await sha256('pass6'), color: '#FFD700', avatar: 'https://via.placeholder.com/42?text=S5' },
      { id: 'st7', name: 'stremer6', passHash: await sha256('pass7'), color: '#FF69B4', avatar: 'https://via.placeholder.com/42?text=S6' },
      { id: 'st8', name: 'stremer7', passHash: await sha256('pass8'), color: '#00FFCC', avatar: 'https://via.placeholder.com/42?text=S7' },
      { id: 'st9', name: 'stremer8', passHash: await sha256('pass9'), color: '#FF8C00', avatar: 'https://via.placeholder.com/42?text=S8' },
      { id: 'st10', name: 'stremer9', passHash: await sha256('pass10'), color: '#7B68EE', avatar: 'https://via.placeholder.com/42?text=S9' },
    ];
    queue = { st1: [], st2: [], st3: [], st4: [], st5: [], st6: [], st7: [], st8: [], st9: [], st10: [] };
  }

  if (!demons.length) {
    demons = [
      { name: 'Thinking Space 2', creator: 'cairoX', file: 'assets/demons/thinkingspaceII.mp3' },
      { name: 'Flamewall', creator: 'Narwall', file: 'assets/demons/flamewall.mp3' },
      { name: 'Amethyst', creator: 'iMist', file: 'assets/demons/amethyst.mp3' },
      { name: 'Tidal Wave', creator: 'OniLink', file: 'assets/demons/tidalwave.mp3' },
      { name: 'Orbit', creator: 'Mindcap', file: 'assets/demons/orbit.mp3' },
    ];
  }

  if (!songs.length) {
    songs = [
      { name: 'Back on Track', file: 'assets/songs/backontrack.mp3' },
      { name: 'Electroman Adventures', file: 'assets/songs/electromanadventures.mp3' },
      { name: 'Electrodynamix', file: 'assets/songs/electrodynamix.mp3' },
      { name: 'Fun Dance', file: 'assets/songs/fundance.mp3' },
      { name: 'Jumper', file: 'assets/songs/jumper.mp3' },
    ];
  }

  await save();
  renderStreamerList();
  renderDemonList();
  renderSongsList();
  renderBgSelector();
  renderGameBgSelector();
}

function applyBg(idx) {
  if (idx >= 0 && idx < BG_WALLPAPERS.length) {
    const bg = BG_WALLPAPERS[idx];
    document.body.style.backgroundImage = `url('${bg.file}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundColor = '#0a0a14';
    currentBg = idx;
    save();
  }
}

function renderBgSelector() {
  const el = document.getElementById('bg-selector');
  if (!el) return;
  el.innerHTML = '';
  BG_WALLPAPERS.forEach((bg, i) => {
    const div = document.createElement('div');
    div.className = 'bg-opt' + (i === currentBg ? ' selected' : '');
    div.onclick = () => selectBg(i);
    div.innerHTML = `
      <img src="${bg.file}" alt="${bg.name}" onerror="this.style.display='none'">
      <div class="bg-label">${bg.name}</div>
      <div class="check">✓</div>`;
    el.appendChild(div);
  });
}

function renderGameBgSelector() {
  const el = document.getElementById('bg-game-selector');
  if (!el) return;
  el.innerHTML = '';
  GAME_BG_OPTIONS.forEach((bg, i) => {
    const div = document.createElement('div');
    div.className = 'bg-opt-game' + (i === currentGameBg ? ' selected' : '');
    div.onclick = () => selectGameBg(i);
    div.textContent = bg.name;
    el.appendChild(div);
  });
}

function selectBg(i) {
  document.querySelectorAll('#bg-selector .bg-opt').forEach((e, j) => e.classList.toggle('selected', j === i));
  applyBg(i);
}

function selectGameBg(i) {
  document.querySelectorAll('.bg-opt-game').forEach((e, j) => e.classList.toggle('selected', j === i));
  currentGameBg = i;
  save();
  initGame();
}

function goTo(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
    if (activeTrackEl) activeTrackEl.classList.remove('playing');
  }
}

function renderStreamerList() {
  const el = document.getElementById('streamer-list');
  el.innerHTML = '';
  streamers.forEach((st) => {
    const q = (queue[st.id] || []).length;
    const d = document.createElement('div');
    d.className = 'streamer-item';
    const avatarHtml = st.avatar
      ? `<img src="${st.avatar}" alt="${st.name}">`
      : `<span style="font-size:18px;font-weight:700;">${st.name[0].toUpperCase()}</span>`;
    d.innerHTML = `
      <div class="s-avatar" style="background:${st.color}">${avatarHtml}</div>
      <div><div style="font-size:16px;font-weight:600;">${st.name}</div><div style="font-size:13px;color:#888;">${q} nivel${q !== 1 ? 'es' : ''} en cola</div></div>
      <div class="s-badge" style="${st.roomPass ? 'background:rgba(255,58,58,0.12);color:var(--r);border-color:rgba(255,58,58,0.3);' : ''}">${st.roomPass ? '🔒 Privada' : q > 0 ? 'Activo' : 'Libre'}</div>
    d.onclick = () => selectStreamer(st);
    el.appendChild(d);
  });
}

function selectStreamer(st) {
  currentStreamer = st;
  if (st.roomPass) {
    showRoomLogin(st);
  } else {
    document.getElementById('mode-st-name').textContent = st.name;
    goTo('screen-mode');
  }
}

function showRoomLogin(st) {
  document.getElementById('login-title').textContent = `🔒 Sala privada — ${st.name}`;
  document.getElementById('login-alert').innerHTML = '<div class="alert" style="background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.2);color:#ccc;font-size:13px;margin-bottom:10px;">El streamer ha puesto esta sala en modo privado. Pide la contraseña en su chat.</div>';
  document.getElementById('login-pass').value = '';
  loginTarget = 'room';
  document.getElementById('modal-login').classList.add('open');
}

function enterUserMode() {
  document.getElementById('user-alert').innerHTML = '';
  ['f-lid', 'f-gd', 'f-soc', 'f-ln', 'f-vid', 'f-note'].forEach((id) => {
    const e = document.getElementById(id);
    if (e) {
      e.value = '';
      e.classList.remove('err');
    }
  });
  goTo('screen-user');
  setTimeout(initGame, 100);
}

function showStreamerLogin() {
  loginTarget = 'streamer';
  document.getElementById('login-title').textContent = `Acceso — ${currentStreamer.name}`;
  document.getElementById('login-alert').innerHTML = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('modal-login').classList.add('open');
}

function showDevLogin() {
  loginTarget = 'dev';
  document.getElementById('login-title').textContent = 'Acceso desarrollador';
  document.getElementById('login-alert').innerHTML = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('modal-login').classList.add('open');
}

async function checkLogin() {
  const pass = document.getElementById('login-pass').value;
  const h = await sha256(pass);
  if (loginTarget === 'dev') {
    if (h === DEV_HASH) {
      closeLoginModal();
      goTo('screen-dev');
      renderDevPanel();
    } else {
      document.getElementById('login-alert').innerHTML = '<div class="alert alert-r">Contraseña incorrecta</div>';
    }
  } else if (h === currentStreamer.passHash) {
    closeLoginModal();
    goTo('screen-streamer');
    renderStreamerPanel();
  } else {
    document.getElementById('login-alert').innerHTML = '<div class="alert alert-r">Contraseña incorrecta</div>';
  }
}

function closeLoginModal(e) {
  if (!e || e.target === document.getElementById('modal-login')) {
    document.getElementById('modal-login').classList.remove('open');
  }
}

function selectIcon(i) {
  currentIcon = i;
  document.querySelectorAll('.icon-opt').forEach((el, idx) => el.classList.toggle('selected', idx === i));
}

async function submitLevel() {
  const lid = document.getElementById('f-lid').value.trim();
  const gd = document.getElementById('f-gd').value.trim();
  const soc = document.getElementById('f-soc').value.trim();
  const ln = document.getElementById('f-ln').value.trim();
  const vid = document.getElementById('f-vid').value.trim();
  const note = document.getElementById('f-note').value.trim();
  const errs = [];
  if (!lid) errs.push('f-lid');
  if (!gd) errs.push('f-gd');
  if (!soc) errs.push('f-soc');
  ['f-lid', 'f-gd', 'f-soc'].forEach((id) => document.getElementById(id).classList.remove('err'));
  errs.forEach((id) => document.getElementById(id).classList.add('err'));
  if (errs.length) {
    document.getElementById('user-alert').innerHTML = '<div class="alert alert-r">Completa los campos obligatorios</div>';
    return;
  }
  if (banned.includes(gd.toLowerCase())) {
    document.getElementById('user-alert').innerHTML = '<div class="alert alert-r">Tu cuenta ha sido baneada de este portal.</div>';
    return;
  }
  const sid = currentStreamer.id;
  if (!sentLevels[sid]) sentLevels[sid] = {};
  if (sentLevels[sid][lid]) {
    document.getElementById('user-alert').innerHTML = '<div class="alert alert-r">Ya enviaste esta ID, espera a que revisen tu nivel según el orden 🕐</div>';
    return;
  }
  if (!queue[sid]) queue[sid] = [];
  queue[sid].push({
    levelId: lid,
    gdUser: gd,
    social: soc,
    levelName: ln,
    video: vid,
    note,
    rated: false,
    icon: currentIcon,
    ts: Date.now(),
    userId: 'user_' + Date.now(),
  });
  sentLevels[sid][lid] = true;
  await save();
  document.getElementById('user-alert').innerHTML = '<div class="alert alert-g">✓ ¡Nivel enviado! Estás en la cola 🎮</div>';
  ['f-lid', 'f-gd', 'f-soc', 'f-ln', 'f-vid', 'f-note'].forEach((id) => {
    const e = document.getElementById(id);
    if (e) e.value = '';
  });
}

function renderStreamerPanel() {
  document.getElementById('panel-name').textContent = currentStreamer.name;
  const sid = currentStreamer.id;
  const q = queue[sid] || [];
  document.getElementById('q-count').textContent = q.length;
  const el = document.getElementById('queue-list');
  if (!q.length) {
    el.innerHTML = '<div style="color:#888;font-size:14px;text-align:center;padding:20px;">La cola está vacía 👀</div>';
    return;
  }
  el.innerHTML = '';
  q.forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = 'queue-row';
    const iconSvgs = [
      `<svg width="22" height="22" viewBox="0 0 38 38"><rect x="4" y="4" width="30" height="30" rx="4" fill="#FFD700"/><circle cx="15" cy="17" r="3" fill="#000"/></svg>`,
      `<svg width="22" height="22" viewBox="0 0 38 38"><rect x="4" y="4" width="30" height="30" rx="4" fill="#00BFFF"/><polygon points="19,8 30,30 8,30" fill="rgba(0,0,0,0.25)"/></svg>`,
      `<svg width="22" height="22" viewBox="0 0 38 38"><rect x="4" y="4" width="30" height="30" rx="4" fill="#9B59B6"/><circle cx="19" cy="19" r="6" fill="rgba(255,255,255,0.3)"/></svg>`,
      `<svg width="22" height="22" viewBox="0 0 38 38"><rect x="4" y="4" width="30" height="30" rx="4" fill="#39FF14"/><polygon points="19,6 34,32 4,32" fill="rgba(0,0,0,0.18)"/></svg>`,
    ];
    row.innerHTML = `
      <div class="q-num">${i + 1}</div>
      <div style="flex-shrink:0;">${iconSvgs[entry.icon || 0]}</div>
      <div style="flex:1;min-width:0;">
        <div class="q-id">#${entry.levelId}</div>
        <div class="q-user">${entry.gdUser} · ${entry.social}</div>
      </div>
      <div class="rate-btn ${entry.rated ? 'rated' : ''}" title="RATE" onclick="toggleRate(${i},event)">${entry.rated ? '✓' : '⬛'}</div>
      <div class="ban-btn" title="Banear usuario" onclick="banFromQueue('${entry.gdUser}',${i},event)">🚫</div>`;
    row.onclick = (e) => {
      if (!e.target.classList.contains('rate-btn') && !e.target.classList.contains('ban-btn')) openLevelModal(i);
    };
    el.appendChild(row);
  });
}

function toggleRate(idx, e) {
  e.stopPropagation();
  const sid = currentStreamer.id;
  queue[sid][idx].rated = !queue[sid][idx].rated;
  save();
  renderStreamerPanel();
}

async function banFromQueue(gdUser, idx, e) {
  e.stopPropagation();
  if (!confirm(`¿Banear a "${gdUser}"? Solo el dev puede desbanear.`)) return;
  if (!banned.includes(gdUser.toLowerCase())) banned.push(gdUser.toLowerCase());
  removeEntryInternal(idx);
  await save();
  renderStreamerPanel();
}

function openLevelModal(idx) {
  const sid = currentStreamer.id;
  const entry = queue[sid][idx];
  const fields = [
    ['ID del nivel', entry.levelId],
    ['Usuario GD', entry.gdUser],
    ['Twitch/TikTok/YT', entry.social],
    ['Nombre del nivel', entry.levelName || '—'],
    ['Nota', entry.note || '—'],
    ['Video', entry.video || '—'],
  ];
  const filled = [entry.levelId, entry.gdUser, entry.social, entry.levelName, entry.note, entry.video].filter(Boolean).length;
  const dots = Array.from({ length: 6 }, (_, i) =>
    `<span style="width:8px;height:8px;border-radius:50%;background:${i < filled ? 'var(--y)' : 'rgba(255,255,255,.12)'};display:inline-block;margin-right:4px;"></span>`
  ).join('');
  let html = `<div class="modal-hdr"><div class="modal-title">Nivel #${entry.levelId}</div><button class="modal-close" onclick="closeModal()">✕</button></div>
  <div style="margin-bottom:12px;font-size:13px;color:#888;">Datos completados: <span style="color:var(--g);font-weight:700;">${filled}</span>/6 ${dots}</div>`;
  fields.forEach(([l, v]) => {
    html += `<div class="info-row"><span class="info-lbl">${l}</span><span class="info-val">${v}</span></div>`;
  });
  html += `<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;"><button class="btn btn-r btn-sm" onclick="removeEntry(${idx})" style="flex:1;">Eliminar de la cola</button></div>`;
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

function removeEntryInternal(idx) {
  const sid = currentStreamer.id;
  const entry = queue[sid][idx];
  if (sentLevels[sid]) delete sentLevels[sid][entry.levelId];
  queue[sid].splice(idx, 1);
}

function removeEntry(idx) {
  removeEntryInternal(idx);
  save();
  closeModal();
  renderStreamerPanel();
}

async function reloadQueue() {
  try {
    const q = await Storage.get('gd2_queue');
    if (q) queue = JSON.parse(q.value);
    renderStreamerPanel();
  } catch (e) {
    console.warn('Error al recargar:', e);
  }
  async function reloadQueue() {
  try {
    const q = await Storage.get('gd2_queue');
    if (q) queue = JSON.parse(q.value);
    renderStreamerPanel();
  } catch (e) {
    console.warn('Error al recargar:', e);
  }
}
  
}
function resetQueue() {
  if (!confirm('¿Resetear toda la cola?')) return;
  const sid = currentStreamer.id;
  queue[sid] = [];
  sentLevels[sid] = {};
  save();
  renderStreamerPanel();
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.remove('open');
  }
}

function renderDevPanel() {
  const el = document.getElementById('dev-st-list');
  el.innerHTML = '';
  streamers.forEach((st, i) => {
    const d = document.createElement('div');
    d.className = 'dev-st-row';
    d.innerHTML = `
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <div class="s-avatar" style="background:${st.color};width:36px;height:36px;border-radius:7px;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;">
            ${st.avatar ? `<img src="${st.avatar}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:15px;font-weight:700;">${st.name[0].toUpperCase()}</span>`}
          </div>
          <span style="color:var(--y);font-weight:700;">${st.name}</span>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
          <input type="text" id="avatar-${st.id}" placeholder="assets/imagenes/perfil/nombre.png" value="${st.avatar||''}" style="flex:1;min-width:180px;font-size:12px;">
          <button class="btn btn-b btn-sm" onclick="changeAvatar('${st.id}')">Guardar avatar</button>
        </div>
        <div class="dev-pass-row">
          <input type="password" id="pass-${st.id}" placeholder="Nueva contraseña">
          <button class="btn btn-b btn-sm" onclick="changeStreamerPass('${st.id}')">Cambiar pass</button>
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" onclick="resetStQ('${st.id}')">Reset cola</button>
        <button class="btn btn-r btn-sm" onclick="removeStreamer(${i})">Eliminar</button>
      </div>`;
    el.appendChild(d);
  });

  const bl = document.getElementById('banned-list');
  bl.innerHTML = '';
  if (!banned.length) bl.innerHTML = '<div style="color:#888;font-size:14px;">Ningún usuario baneado.</div>';
  banned.forEach((u, i) => {
    const d = document.createElement('div');
    d.className = 'banned-row';
    d.innerHTML = `<span style="font-family:'Share Tech Mono',monospace;font-size:14px;color:var(--r);">${u}</span><button class="btn btn-ghost btn-sm" onclick="unban(${i})">Desbanear</button>`;
    bl.appendChild(d);
  });

  renderDemonEditor();
  renderSongsEditor();

  const dq = document.getElementById('dev-queues');
  dq.innerHTML = '';
  streamers.forEach((st) => {
    const q = queue[st.id] || [];
    const d = document.createElement('div');
    d.style.marginBottom = '12px';
    d.innerHTML = `<div style="font-size:14px;margin-bottom:4px;"><span style="color:var(--y);">${st.name}</span> · <span style="color:#888;">${q.length} en cola</span></div>`;
    q.forEach((e, i) => {
      d.innerHTML += `<div style="font-size:13px;color:#aaa;padding:4px 10px;background:#0d0d1a;border-radius:4px;margin-bottom:3px;">${i + 1}. #${e.levelId} — ${e.gdUser}</div>`;
    });
    dq.appendChild(d);
  });
}

async function changeStreamerPass(stId) {
  const input = document.getElementById('pass-' + stId);
  const pass = input.value.trim();
  if (!pass) {
    alert('Escribe una contraseña');
    return;
  }
  const st = streamers.find((s) => s.id === stId);
  if (!st) return;
  st.passHash = await sha256(pass);
  input.value = '';
  await save();
  alert(`Contraseña de "${st.name}" actualizada`);
}
async function changeAvatar(stId) {
  const input = document.getElementById('avatar-' + stId);
  const url = input.value.trim();
  const st = streamers.find((s) => s.id === stId);
  if (!st) return;
  st.avatar = url;
  await save();
  renderStreamerList();
  renderDevPanel();
}
async function addStreamer() {
  if (streamers.length >= 10) {
    alert('Máximo 10');
    return;
  }
  const name = document.getElementById('new-st').value.trim();
  const pass = document.getElementById('new-st-pass').value.trim();
  if (!name || !pass) return;
  const colors = ['#9B59B6', '#00BFFF', '#FF6B35', '#39FF14', '#FF3A3A', '#FFD700', '#FF69B4', '#00FFCC', '#FF8C00', '#7B68EE'];
  const id = 'st_' + Date.now();
  const passHash = await sha256(pass);
  streamers.push({ id, name, passHash, color: colors[streamers.length % colors.length], avatar: '' });
  queue[id] = [];
  document.getElementById('new-st').value = '';
  document.getElementById('new-st-pass').value = '';
  await save();
  renderStreamerList();
  renderDevPanel();
}

function removeStreamer(idx) {
  if (!confirm('¿Eliminar?')) return;
  const st = streamers[idx];
  delete queue[st.id];
  streamers.splice(idx, 1);
  save();
  renderStreamerList();
  renderDevPanel();
}

function resetStQ(id) {
  queue[id] = [];
  if (sentLevels[id]) sentLevels[id] = {};
  save();
  renderDevPanel();
}

function banUser() {
  const u = document.getElementById('ban-input').value.trim().toLowerCase();
  if (!u) return;
  if (!banned.includes(u)) banned.push(u);
  document.getElementById('ban-input').value = '';
  save();
  renderDevPanel();
}

function unban(i) {
  banned.splice(i, 1);
  save();
  renderDevPanel();
}

function renderDemonEditor() {
  const el = document.getElementById('demon-editor');
  el.innerHTML = '';
  demons.forEach((d, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;align-items:center;flex-wrap:wrap;';
    row.innerHTML = `<span style="color:var(--y);font-family:Share Tech Mono,monospace;font-size:14px;min-width:20px;">${i + 1}</span>
    <input type="text" placeholder="Nombre" value="${d.name}" style="flex:1;min-width:150px;" onchange="demons[${i}].name=this.value;save();renderDemonList();">
    <input type="text" placeholder="Creador" value="${d.creator}" style="flex:1;min-width:100px;" onchange="demons[${i}].creator=this.value;save();renderDemonList();">
    <input type="text" placeholder="assets/demons/archivo.mp3" value="${d.file}" style="flex:1.5;min-width:150px;" onchange="demons[${i}].file=this.value;save();renderDemonList();">`;
    el.appendChild(row);
  });
}

function renderSongsEditor() {
  const el = document.getElementById('songs-editor');
  el.innerHTML = '';
  songs.forEach((s, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;align-items:center;flex-wrap:wrap;';
    row.innerHTML = `<span style="color:var(--p);font-family:Share Tech Mono,monospace;font-size:14px;min-width:20px;">${i + 1}</span>
    <input type="text" placeholder="Nombre" value="${s.name}" style="flex:1;min-width:150px;" onchange="songs[${i}].name=this.value;save();renderSongsList();">
    <input type="text" placeholder="assets/songs/archivo.mp3" value="${s.file}" style="flex:1.5;min-width:150px;" onchange="songs[${i}].file=this.value;save();renderSongsList();">
    <button class="btn btn-ghost btn-sm" onclick="removeSong(${i})">✕</button>`;
    el.appendChild(row);
  });
  const add = document.createElement('button');
  add.className = 'btn btn-ghost btn-sm';
  add.textContent = '+ Añadir canción';
  add.onclick = () => {
    songs.push({ name: 'Nueva canción', file: 'assets/songs/archivo.mp3' });
    save();
    renderSongsEditor();
    renderSongsList();
  };
  el.appendChild(add);
}

function removeSong(i) {
  songs.splice(i, 1);
  save();
  renderSongsEditor();
  renderSongsList();
}

function fmtTime(s) {
  s = Math.round(s);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function makePlayer(items, accent, numPrefix) {
  const wrap = document.createElement('div');
  items.forEach((item, i) => {
    const pid = numPrefix + '_' + i;
    const div = document.createElement('div');
    div.className = 'audio-player';
    div.innerHTML = `<div class="audio-row">
      <span class="track-num" style="color:${accent};">${String(i + 1).padStart(2, '0')}</span>
      <div class="track-info">
        <div class="track-name">${item.name}</div>
        ${item.creator ? `<div style="font-size:12px;color:#888;margin-top:1px;">by ${item.creator}</div>` : ''}
      </div>
      <div class="play-btn" id="pb_${pid}" onclick="togglePlay('${pid}','${item.file}',this)" aria-label="Reproducir ${item.name}">
        <img src="assets/imagenes/botones/play.svg" class="btn-icon" id="icon_${pid}">
      </div>
    </div>
    <div class="progress-wrap">
      <div class="progress-bar" onclick="seekAudio(event,'${pid}')">
        <div class="progress-fill" id="pf_${pid}" style="width:0%;"></div>
      </div>
      <div class="time-row">
        <span id="ct_${pid}">0:00</span>
        <span id="dt_${pid}">0:00</span>
      </div>
    </div>`;
    wrap.appendChild(div);
  });
  return wrap;
}

const audios = {};

function togglePlay(pid, file, btn) {
  if (activeAudio && activeAudio !== audios[pid]) {
    activeAudio.pause();
    if (activeTrackEl) {
      activeTrackEl.innerHTML = '<img src="assets/imagenes/botones/play.svg" style="width:16px;height:16px;">';
      activeTrackEl.classList.remove('playing');
    }
  }
  if (!audios[pid]) {
    audios[pid] = new Audio(file);
    audios[pid].addEventListener('timeupdate', () => {
      const a = audios[pid];
      const pct = a.duration ? (a.currentTime / a.duration) * 100 : 0;
      const pf = document.getElementById('pf_' + pid);
      const ct = document.getElementById('ct_' + pid);
      if (pf) pf.style.width = pct + '%';
      if (ct) ct.textContent = fmtTime(a.currentTime);
    });
    audios[pid].addEventListener('loadedmetadata', () => {
      const dt = document.getElementById('dt_' + pid);
      if (dt) dt.textContent = fmtTime(audios[pid].duration);
    });
    audios[pid].addEventListener('ended', () => {
      btn.innerHTML = '<img src="assets/imagenes/botones/play.svg" style="width:16px;height:16px;">';
      btn.classList.remove('playing');
      activeAudio = null;
      activeTrackEl = null;
      const pf = document.getElementById('pf_' + pid);
      if (pf) pf.style.width = '0%';
    });
  }
  if (audios[pid].paused) {
    audios[pid].play().catch(() => {});
    btn.innerHTML = '<img src="assets/imagenes/botones/play.svg" style="width:16px;height:16px;">';
    btn.classList.add('playing');
    activeAudio = audios[pid];
    activeTrackEl = btn;
  } else {
    audios[pid].pause();
    btn.innerHTML = '<img src="assets/imagenes/botones/play.svg" style="width:16px;height:16px;">';
    btn.classList.remove('playing');
    activeAudio = null;
    activeTrackEl = null;
  }
}

function seekAudio(e, pid) {
  const a = audios[pid];
  if (!a || !a.duration) return;
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  a.currentTime = pct * a.duration;
}

function renderDemonList() {
  const el = document.getElementById('demon-list-ui');
  el.innerHTML = '';
  el.appendChild(makePlayer(demons, 'var(--y)', 'dem'));
}

function renderSongsList() {
  const el = document.getElementById('songs-ui');
  el.innerHTML = '';
  el.appendChild(makePlayer(songs, 'var(--p)', 'song'));
}

load();
