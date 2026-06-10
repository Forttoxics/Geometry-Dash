const cubeSkins = [
  { body: '#FFD700', stroke: '#ff8800', inner: 'rgba(0,0,0,0.2)', eye: '#000' },
  { body: '#00BFFF', stroke: '#0088cc', inner: 'rgba(255,255,255,0.15)', eye: '#001a2a' },
  { body: '#9B59B6', stroke: '#6c3483', inner: 'rgba(255,255,255,0.12)', eye: '#1a0024' },
];

let gameAnimId = null;
let gameKeyHandler = null;
let gameCanvas = null;

function setCubeSkin(i) {
  cubeSkin = i;
  document.querySelectorAll('.cube-opt').forEach((e, idx) => e.classList.toggle('selected', idx === i));
}

function initGame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  if (gameAnimId) cancelAnimationFrame(gameAnimId);
  if (gameKeyHandler) document.removeEventListener('keydown', gameKeyHandler);

  gameCanvas = canvas;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = H - 12;
  const CUBE_SIZE = 28;

  let cube = { x: 60, y: GROUND_Y - CUBE_SIZE, vy: 0, size: CUBE_SIZE, angle: 0, onGround: true };
  let obstacles = [];
  let particles = [];
  let score = 0;
  let frame = 0;
  let speed = 3;
  let alive = true;
  let started = false;
  let gameBg = null;

  const bgFile = GAME_BG_OPTIONS[currentGameBg].file;
  const bgImg = new Image();
  bgImg.onload = () => { gameBg = bgImg; };
  bgImg.src = bgFile;

  function reset() {
    cube = { x: 60, y: GROUND_Y - CUBE_SIZE, vy: 0, size: CUBE_SIZE, angle: 0, onGround: true };
    obstacles = [];
    particles = [];
    score = 0;
    frame = 0;
    speed = 3;
    alive = true;
    started = false;
  }

  function die() {
    if (!alive) return;
    alive = false;
    if (score > bestScore) {
      bestScore = score;
      document.getElementById('bsc').textContent = bestScore;
    }
    for (let i = 0; i < 12; i++) {
      particles.push({
        x: cube.x + cube.size / 2,
        y: cube.y + cube.size / 2,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 20,
        color: '#FF3A3A',
      });
    }
  }

  function jump() {
    if (!alive) {
      reset();
      return;
    }
    if (!started) started = true;
    if (cube.onGround) {
      cube.vy = -9;
      cube.onGround = false;
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: cube.x,
          y: cube.y + cube.size,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 15,
          color: 'rgba(255,215,0,0.6)',
        });
      }
    }
  }

  canvas.onclick = jump;
  gameKeyHandler = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    }
  };
  document.addEventListener('keydown', gameKeyHandler);

  function drawCube(x, y, size, angle, isAlive) {
    const sk = cubeSkins[cubeSkin];
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(angle);
    const s = size;
    ctx.fillStyle = isAlive ? sk.body : '#555';
    ctx.beginPath();
    ctx.roundRect(-s / 2, -s / 2, s, s, 4);
    ctx.fill();
    ctx.strokeStyle = isAlive ? sk.stroke : '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (cubeSkin === 2 && isAlive) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 3; i++) ctx.fillRect(-s / 2 + i * 10, -s / 2, 2, s);
    }
    ctx.fillStyle = sk.inner;
    ctx.beginPath();
    ctx.roundRect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.6, 2);
    ctx.fill();
    ctx.fillStyle = sk.eye;
    ctx.beginPath();
    ctx.arc(s * 0.15, -s * 0.1, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function spikeHit(o) {
    const pad = 4;
    return (
      cube.x + cube.size - pad > o.x + pad &&
      cube.x + pad < o.x + o.w - pad &&
      cube.y + cube.size - pad > o.y + pad &&
      cube.y + pad < o.y + o.h - pad
    );
  }

  function tick() {
    if (!started || !alive) return;
    frame++;
    score++;
    speed = 3 + score / 400;

    const prevVy = cube.vy;
    cube.vy += 0.5;
    cube.y += cube.vy;
    cube.onGround = false;

    if (cube.y + cube.size >= GROUND_Y) {
      cube.y = GROUND_Y - cube.size;
      cube.vy = 0;
      cube.onGround = true;
    } else {
      cube.angle += 0.08;
    }

  obstacles.forEach((o) => {
      if (o.type !== 'block') return;
      const feet = cube.y + cube.size;
      const prevFeet = feet - cube.vy;
      const head = cube.y;
      const prevHead = head - cube.vy;
      const right = cube.x + cube.size - 4;
      const left = cube.x + 4;
      const overlapX = right > o.x + 4 && left < o.x + o.w - 4;

      if (!overlapX) return;

      // Aterriza encima
      if (cube.vy >= 0 && prevFeet <= o.y + 2 && feet >= o.y) {
        cube.y = o.y - cube.size;
        cube.vy = 0;
        cube.onGround = true;
      }
      // Golpea la base desde abajo → rebota
      else if (cube.vy < 0 && prevHead >= o.y + o.h - 2 && head <= o.y + o.h) {
        cube.y = o.y + o.h;
        cube.vy = 2;
      }
      // Lateral → muere
      else if (feet > o.y + 4 && head < o.y + o.h - 4) {
        die();
      }
    
    if (frame % Math.max(50, 90 - Math.floor(score / 80)) === 0) {
      const types = ['spike', 'block'];
      const t = types[Math.floor(Math.random() * 2)];
      if (t === 'spike') {
        const spikeH = 20;
        obstacles.push({ x: W + 10, y: GROUND_Y - spikeH, w: 18, h: spikeH, type: 'spike' });
      } else {
        const bh = 28 + Math.floor(Math.random() * 20);
        obstacles.push({ x: W + 10, y: GROUND_Y - bh, w: 28, h: bh, type: 'block' });
      }
    }

    obstacles.forEach((o) => o.x -= speed);
    obstacles = obstacles.filter((o) => o.x > -50);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
    });
    particles = particles.filter((p) => p.life > 0);

    obstacles.forEach((o) => {
      if (o.type === 'spike' && spikeHit(o)) die();
    });

    document.getElementById('sc').textContent = score;
  }

  function draw() {
    if (gameBg) ctx.drawImage(gameBg, 0, 0, W, H);
    else ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(0,191,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = '#00BFFF';
    ctx.fillRect(0, GROUND_Y - 1, W, 1);

    obstacles.forEach((o) => {
      if (o.type === 'spike') {
        ctx.fillStyle = '#FF3A3A';
        ctx.beginPath();
        ctx.moveTo(o.x + o.w / 2, o.y);
        ctx.lineTo(o.x, o.y + o.h);
        ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#2a2a6a';
        ctx.strokeStyle = '#00BFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.w, o.h, 3);
        ctx.fill();
        ctx.stroke();
      }
    });

    particles.forEach((p) => {
      ctx.globalAlpha = p.life / 20;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    });
    ctx.globalAlpha = 1;

    drawCube(cube.x, cube.y, cube.size, cube.onGround ? 0 : cube.angle, alive);

    if (!started) {
      ctx.fillStyle = 'rgba(255,215,0,0.65)';
      ctx.font = '13px Oxanium,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click o Espacio para saltar', W / 2, 24);
    }
    if (!alive) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FF3A3A';
      ctx.font = 'bold 16px Oxanium,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER · Click para reintentar', W / 2, H / 2);
    }
  }

  function loop() {
    tick();
    draw();
    gameAnimId = requestAnimationFrame(loop);
  }

  reset();
  loop();
}
