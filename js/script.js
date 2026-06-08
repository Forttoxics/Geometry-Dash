// =====================
// DATOS PRINCIPALES
// =====================

const streamers = [
{
id:"st1",
name:"Forttoxics",
pass:"1234"
}
];

let currentStreamer = null;


// =====================
// RENDER STREAMERS
// =====================

function renderStreamers(){

const container =
document.getElementById("streamer-list");

if(!container) return;

container.innerHTML = "";

streamers.forEach(st=>{

const div =
document.createElement("div");

div.className =
"streamer-card";

div.innerHTML = `
<h3>${st.name}</h3>
<p>Entrar sala</p>
`;

div.onclick = ()=>{

currentStreamer = st;

document
.getElementById("screen-select")
.classList.remove("active");

document
.getElementById("screen-user")
.classList.add("active");

};

container.appendChild(div);

});

}


// =====================
// LOGIN DEV
// =====================

function showDevLogin(){

document
.getElementById("login-modal")
.classList.remove("hidden");

}

function checkLogin(){

const pass =
document
.getElementById("login-pass")
.value
.trim();

if(pass === "TU_PASSWORD_DEV"){

alert("Acceso permitido");

}else{

alert("Contraseña incorrecta");

}

}


// =====================
// ENVIAR NIVEL
// =====================

function submitLevel(){

const levelID =
document
.getElementById("f-lid")
.value
.trim();

const gdUser =
document
.getElementById("f-gd")
.value
.trim();

const social =
document
.getElementById("f-soc")
.value
.trim();

if(!levelID || !gdUser || !social){

alert(
"Completa todos los campos"
);

return;

}

const data = {

levelID,
gdUser,
social,
streamer:
currentStreamer
? currentStreamer.name
: "none",

time:
Date.now()

};

console.log(
"Nuevo nivel:",
data
);

alert(
"Nivel enviado"
);

document
.getElementById("f-lid")
.value = "";

document
.getElementById("f-gd")
.value = "";

document
.getElementById("f-soc")
.value = "";

}


// =====================
// MINIJUEGO
// =====================

function initGame(){

const canvas =
document
.getElementById("game-canvas");

if(!canvas) return;

const ctx =
canvas.getContext("2d");

const W =
canvas.width;

const H =
canvas.height;

const floor =
H - 35;


// CUBO

const cube = {

x:60,
y:floor,

size:25,

vy:0,

jumping:false

};


// SPIKES
// misma Y que suelo

const spikes = [

{
x:350,
y:floor,
size:20,
type:"spike"
},

{
x:520,
y:floor,
size:20,
type:"spike"
}

];


// BLOQUES
// NO MATAN

const blocks = [

{
x:450,
y:floor,
w:40,
h:40
}

];


function jump(){

if(!cube.jumping){

cube.vy = -10;

cube.jumping = true;

}

}


canvas.onclick = jump;

document.addEventListener(
"keydown",
e=>{

if(e.code==="Space"){

e.preventDefault();

jump();

}

}
);


function physics(){

cube.vy += 0.5;

cube.y += cube.vy;

if(cube.y >= floor){

cube.y = floor;

cube.vy = 0;

cube.jumping = false;

}

}


function draw(){

ctx.clearRect(
0,
0,
W,
H
);


// suelo

ctx.fillStyle =
"#1e1e1e";

ctx.fillRect(
0,
floor+25,
W,
10
);


// spikes

ctx.fillStyle =
"red";

spikes.forEach(s=>{

ctx.beginPath();

ctx.moveTo(
s.x,
s.y
);

ctx.lineTo(
s.x+20,
s.y+20
);

ctx.lineTo(
s.x-20,
s.y+20
);

ctx.closePath();

ctx.fill();

});


// bloques

ctx.strokeStyle =
"cyan";

blocks.forEach(b=>{

ctx.strokeRect(

b.x,
b.y,

b.w,
b.h

);

});


// cubo

ctx.fillStyle =
"yellow";

ctx.fillRect(

cube.x,
cube.y,

cube.size,
cube.size

);

}


function loop(){

physics();

draw();

requestAnimationFrame(
loop
);

}

loop();

}


// =====================
// START
// =====================

renderStreamers();

initGame();
