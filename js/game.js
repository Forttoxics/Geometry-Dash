// =============================================
//  GD MINI GAME — game.js
//  8 skins, 4 tipos de obstáculo, colisiones
// =============================================

const cubeSkins = [
  // 0 Clásico
  { body:'#FFD700', stroke:'#cc7700', eye:'#000',    inner:'rgba(0,0,0,0.18)',    detail:null },
  // 1 Neón azul
  { body:'#00BFFF', stroke:'#0077aa', eye:'#001a2a', inner:'rgba(255,255,255,0.12)', detail:'lines' },
  // 2 Galaxia
  { body:'#9B59B6', stroke:'#5b2c6f', eye:'#1a0024', inner:'rgba(255,255,255,0.1)',  detail:'dots' },
  // 3 Rojo fuego
  { body:'#FF3A3A', stroke:'#aa0000', eye:'#1a0000', inner:'rgba(255,255,255,0.1)',  detail:null },
  // 4 Verde matrix
  { body:'#39FF14', stroke:'#1a8800', eye:'#001a00', inner:'rgba(0,0,0,0.2)',        detail:'lines' },
  // 5 Naranja
  { body:'#FF8C00', stroke:'#aa5500', eye:'#1a0a00', inner:'rgba(255,255,255,0.1)',  detail:null },
  // 6 Rosa neón
  { body:'#FF69B4', stroke:'#cc1177', eye:'#1a0010', inner:'rgba(255,255,255,0.12)', detail:'dots' },
  // 7 Blanco hielo
  { body:'#E8F4FF', stroke:'#88aacc', eye:'#001133', inner:'rgba(0,100,200,0.12)',   detail:'lines' },
];

let gameAnimId  = null;
let gameKeyHandler = null;
let gameCanvas  = null;

function setCubeSkin(i) {
  cubeSkin = i;
  document.querySelectorAll('.cube-opt')
    .forEach((e, idx) => e.classList.toggle('selected', idx === i));
  // reinicia el juego para reflejar el nuevo skin
  if (gameCanvas) initGame();
}

function initGame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  if (gameAnimId)    cancelAnimationFrame(gameAnimId);
  if (gameKeyHandler) document.removeEventListener('keydown', gameKeyHandler);

  gameCanvas = canvas;
  const ctx  = canvas.getContext('2d');
  const W    = canvas.width;
  const H    = canvas.height;
  const GY   = H - 14;   // Y del suelo (tope)
  const CS   = 30;       // tamaño del cubo

  // ---- estado ----
  let cube, obstacles, particles, score, frame, speed, alive, started;

  // ---- fondo del juego ----
  let gameBg = null;
  const bgFile = GAME_BG_OPTIONS[currentGameBg] && GAME_BG_OPTIONS[currentGameBg].file;
  if (bgFile) {
    const img = new Image();
    img.onload = () => { gameBg = img; };
    img.src = bgFile;
  }

  function reset() {
    cube      = { x:60, y:GY-CS, vy:0, size:CS, angle:0, onGround:true };
    obstacles = [];
    particles = [];
    score     = 0;
    frame     = 0;
    speed     = 3;
    alive     = true;
    started   = false;
    document.getElementById('sc').textContent = '0';
  }

  // ---- muerte ----
  function die() {
    if (!alive) return;
    alive = false;
    if (score > bestScore) {
      bestScore = score;
      document.getElementById('bsc').textContent = bestScore;
    }
    for (let i = 0; i < 14; i++) {
      particles.push({
        x: cube.x + cube.size/2, y: cube.y + cube.size/2,
        vx:(Math.random()-0.5)*6, vy:(Math.random()-0.5)*6,
        life:22, color:'#FF3A3A',
      });
    }
  }

  // ---- salto ----
  function jump() {
    if (!alive) { reset(); return; }
    if (!started) started = true;
    if (cube.onGround) {
      cube.vy = -10;
      cube.onGround = false;
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: cube.x + cube.size/2, y: GY,
          vx:(Math.random()-0.5)*3, vy:-Math.random()*3-1,
          life:14, color:'rgba(255,215,0,0.7)',
        });
      }
    }
  }

  canvas.addEventListener('click', jump);
  canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); jump(); }, {passive:false});
  gameKeyHandler = (e) => { if (e.code==='Space'){ e.preventDefault(); jump(); } };
  document.addEventListener('keydown', gameKeyHandler);

  // ---- spawn obstáculos ----
  function spawn() {
    const roll = Math.random();
    if (roll < 0.28) {
      // spike simple
      const sh = 20 + Math.floor(Math.random()*10);
      obstacles.push({ type:'spike', x:W+10, y:GY-sh, w:20, h:sh });

    } else if (roll < 0.44) {
      // doble spike
      const sh = 20;
      obstacles.push({ type:'spike', x:W+10,    y:GY-sh, w:18, h:sh });
      obstacles.push({ type:'spike', x:W+10+26, y:GY-sh, w:18, h:sh });

    } else if (roll < 0.62) {
      // bloque en el suelo
      const bh = 28 + Math.floor(Math.random()*18);
      obstacles.push({ type:'block', x:W+10, y:GY-bh, w:30, h:bh });

    } else if (roll < 0.76) {
      // rampa (triángulo con hitbox de bloque pero dibujada diagonal)
      const rh = 30 + Math.floor(Math.random()*14);
      const rw = rh * 1.4;
      obstacles.push({ type:'ramp', x:W+10, y:GY-rh, w:rw, h:rh });

    } else {
      // plataforma flotante
      const ph = 12;
      const pw = 50 + Math.floor(Math.random()*40);
      const py = GY - CS*2 - 20 - Math.floor(Math.random()*30);
      obstacles.push({ type:'platform', x:W+10, y:py, w:pw, h:ph });
    }
  }

  // ---- dibuja el cubo ----
  function drawCube(x, y, size, angle, isAlive) {
    const sk = cubeSkins[cubeSkin] || cubeSkins[0];
    ctx.save();
    ctx.translate(x + size/2, y + size/2);
    ctx.rotate(angle);
    const s = size;

    // cuerpo
    ctx.fillStyle   = isAlive ? sk.body   : '#555';
    ctx.strokeStyle = isAlive ? sk.stroke : '#333';
    ctx.lineWidth   = 2.5;
    ctx.beginPath(); ctx.roundRect(-s/2,-s/2,s,s,5); ctx.fill(); ctx.stroke();

    if (isAlive) {
      // detalle según skin
      if (sk.detail === 'lines') {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (let i=0;i<4;i++) ctx.fillRect(-s/2+i*9,-s/2,3,s);
      } else if (sk.detail === 'dots') {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        const positions = [[-s*0.2,-s*0.2],[s*0.2,-s*0.2],[-s*0.2,s*0.2],[s*0.2,s*0.2]];
        positions.forEach(([px,py]) => {
          ctx.beginPath(); ctx.arc(px,py,s*0.07,0,Math.PI*2); ctx.fill();
        });
      }
      // cuadrado interior
      ctx.fillStyle = sk.inner;
      ctx.beginPath(); ctx.roundRect(-s*0.28,-s*0.28,s*0.56,s*0.56,2); ctx.fill();
      // ojo
      ctx.fillStyle = sk.eye;
      ctx.beginPath(); ctx.arc(s*0.13,-s*0.08,s*0.11,0,Math.PI*2); ctx.fill();
      // brillo
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(s*0.1,-s*0.15,s*0.05,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  // ---- colisión punto-triángulo (rampa) ----
  function rampHit(o) {
    // hitbox simplificada: triángulo inferior-derecho
    const pad = 5;
    const cx = cube.x + pad, cy = cube.y + pad;
    const cw = cube.size - pad*2, ch = cube.size - pad*2;
    // AABB primero
    if (cx+cw < o.x || cx > o.x+o.w || cy+ch < o.y || cy > o.y+o.h) return false;
    // punto más cercano del cubo a la hipotenusa
    const fx = (cx + cw/2 - o.x) / o.w;   // 0..1 horizontal en la rampa
    const surfaceY = o.y + o.h - fx * o.h; // Y de la superficie en ese X
    return (cy + ch) > surfaceY;
  }

  // ---- lógica por frame ----
  function tick() {
    if (!started || !alive) return;
    frame++;
    score++;
    speed = 3 + score / 380;
    document.getElementById('sc').textContent = score;

    // gravedad
    cube.vy   += 0.52;
    cube.y    += cube.vy;
    cube.onGround = false;

    // suelo principal
    if (cube.y + cube.size >= GY) {
      cube.y       = GY - cube.size;
      cube.vy      = 0;
      cube.onGround = true;
    } else {
      cube.angle += 0.09;
    }

    // colisión con obstáculos
    obstacles.forEach((o) => {
      const feet  = cube.y + cube.size;
      const head  = cube.y;
      const right = cube.x + cube.size - 4;
      const left  = cube.x + 4;
      const overX = right > o.x + 3 && left < o.x + o.w - 3;

      if (o.type === 'spike') {
        // spike: AABB estricto → muere
        const pad = 4;
        if (right-pad > o.x+pad && left+pad < o.x+o.w-pad &&
            feet-pad > o.y+pad  && head+pad < o.y+o.h-pad) die();

     } else if (o.type === 'ramp') {
        // La rampa funciona como suelo inclinado
        const pad = 4;
        const footX = cube.x + cube.size/2;
        if (footX > o.x && footX < o.x + o.w) {
          const fx = (footX - o.x) / o.w;
          const surfaceY = o.y + o.h - fx * o.h;
          const feet = cube.y + cube.size;
          if (feet >= surfaceY - 4 && feet <= surfaceY + speed + 4 && cube.vy >= 0) {
            cube.y = surfaceY - cube.size;
            cube.vy = 0;
            cube.onGround = true;
          }
        }

      } else if (o.type === 'block' || o.type === 'platform') {
        if (!overX) return;
        const prevFeet = feet - cube.vy;
        const prevHead = head - cube.vy;

        // aterriza encima
        if (cube.vy >= 0 && prevFeet <= o.y + 3 && feet >= o.y) {
          cube.y       = o.y - cube.size;
          cube.vy      = 0;
          cube.onGround = true;
        }
        // golpea desde abajo
        else if (cube.vy < 0 && prevHead >= o.y + o.h - 3 && head <= o.y + o.h) {
          cube.y  = o.y + o.h;
          cube.vy = 2;
        }
        // lateral → muere (solo bloques, no plataformas)
        else if (o.type === 'block' && feet > o.y + 5 && head < o.y + o.h - 5) {
          die();
        }
      }
    });

    // spawn
    const interval = Math.max(46, 88 - Math.floor(score/70));
    if (frame % interval === 0) spawn();

    // mover y limpiar
    obstacles.forEach((o) => o.x -= speed);
    obstacles = obstacles.filter((o) => o.x > -80);

    // partículas
    particles.forEach((p) => { p.x+=p.vx; p.y+=p.vy; p.vy+=0.22; p.life--; });
    particles = particles.filter((p) => p.life > 0);
  }

  // ---- render ----
  function draw() {
    // fondo
    if (gameBg) {
      ctx.drawImage(gameBg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#080810';
      ctx.fillRect(0, 0, W, H);
    }

    // líneas de fondo
    ctx.strokeStyle = 'rgba(0,191,255,0.04)';
    ctx.lineWidth   = 1;
    for (let i=0; i<W; i+=40) {
      ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke();
    }

    // suelo
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, GY, W, H - GY);
    ctx.fillStyle = '#00BFFF';
    ctx.fillRect(0, GY-1, W, 2);

    // obstáculos
    obstacles.forEach((o) => {
      if (o.type === 'spike') {
        ctx.fillStyle   = '#FF3A3A';
        ctx.strokeStyle = '#880000';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(o.x + o.w/2, o.y);
        ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.lineTo(o.x, o.y + o.h);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

      } else if (o.type === 'block') {
        ctx.fillStyle   = '#1e1e50';
        ctx.strokeStyle = '#00BFFF';
        ctx.lineWidth   = 1.5;
        ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 3); ctx.fill(); ctx.stroke();
        // detalle interior
        ctx.strokeStyle = 'rgba(0,191,255,0.2)';
        ctx.lineWidth   = 1;
        ctx.strokeRect(o.x+4, o.y+4, o.w-8, o.h-8);

      } else if (o.type === 'ramp') {
        ctx.fillStyle   = '#2a1a50';
        ctx.strokeStyle = '#9B59B6';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + o.h);         // abajo-izq
        ctx.lineTo(o.x + o.w, o.y + o.h);   // abajo-der
        ctx.lineTo(o.x + o.w, o.y);          // arriba-der
        ctx.closePath();
        ctx.fill(); ctx.stroke();

      } else if (o.type === 'platform') {
        ctx.fillStyle   = '#0d3d1a';
        ctx.strokeStyle = '#39FF14';
        ctx.lineWidth   = 1.5;
        ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 3); ctx.fill(); ctx.stroke();
        // brillo superior
        ctx.fillStyle = 'rgba(57,255,20,0.15)';
        ctx.fillRect(o.x+2, o.y+2, o.w-4, 3);
      }
    });

    // partículas
    particles.forEach((p) => {
      ctx.globalAlpha = p.life / 22;
      ctx.fillStyle   = p.color;
      ctx.fillRect(p.x-3, p.y-3, 6, 6);
    });
    ctx.globalAlpha = 1;

    // cubo
    drawCube(cube.x, cube.y, cube.size, cube.onGround ? 0 : cube.angle, alive);

    // mensajes
    if (!started) {
      ctx.fillStyle = 'rgba(255,215,0,0.75)';
      ctx.font      = '13px Oxanium,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click o Espacio para saltar', W/2, 22);
    }
    if (!alive) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FF3A3A';
      ctx.font      = 'bold 15px Oxanium,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER · Click para reintentar', W/2, H/2+5);
    }
  }

  function loop() { tick(); draw(); gameAnimId = requestAnimationFrame(loop); }

  reset();
  loop();
}
