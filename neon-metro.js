"use strict";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d", { alpha: false });
const ui = Object.fromEntries(
  ["score","coins","multi","missionText","missionBar","power","powerTime","curtain","message","summary","finalScore","finalDistance","best","start","pause","mute","countdown"]
    .map((id) => [id, document.querySelector(`#${id}`)]),
);

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const choose = (a) => a[(Math.random() * a.length) | 0];
const colors = ["#19a7e0", "#ef4d38", "#8857d8", "#f5b82e", "#32b96d"];
const store = {
  get(k, d = 0) { try { return JSON.parse(localStorage.getItem(`neonMetro.${k}`)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(`neonMetro.${k}`, JSON.stringify(v)); } catch {} },
};

let W = 0, H = 0, DPR = 1, horizon = 0, roadBottom = 0;
let audio = null, muted = store.get("muted", false);
let last = performance.now(), accumulator = 0;
let state = "menu", countdownTimer = 0, countdownValue = 3;
let shake = 0, flash = 0, time = 0, distance = 0, score = 0, runCoins = 0;
let speed = 32, multiplier = 1, combo = 0, comboTimer = 0, spawnAt = 40;
let objects = [], particles = [], floaters = [], skyline = [], stars = [];
let power = { type: "", time: 0 };
let mission = { type: "coins", target: 25, progress: 0, done: false };
const player = { lane: 0, xLane: 0, y: 0, vy: 0, rolling: 0, board: 0, alive: true, phase: 0 };

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  horizon = H * (H < 650 ? 0.28 : 0.31);
  roadBottom = H * .96;
  makeSkyline();
}

function makeSkyline() {
  skyline = [];
  let x = -20;
  while (x < W + 30) {
    const w = rand(28, 85), h = rand(H * 0.07, H * 0.27);
    skyline.push({ x, w, h, color: choose(["#e76b4e","#f29b4b","#3d83b8","#785db5","#45a486"]), seed: Math.random() });
    x += w + rand(2, 8);
  }
  stars = Array.from({ length: Math.min(120, W / 7) }, () => ({ x: Math.random() * W, y: Math.random() * horizon * .9, s: rand(.4, 1.8), p: rand(0, TAU) }));
}

function project(lane, z, lift = 0) {
  const p = clamp(1 - z / 120, 0, 1);
  const eased = p * p;
  const y = lerp(horizon, roadBottom, eased) - lift * lerp(.25, 1, p);
  const half = lerp(W * .035, Math.min(W * .46, 480), eased);
  return { x: W / 2 + lane * half * .63, y: y - lift * 13 * lerp(.25, 1, p), p, scale: lerp(.12, 1.16, eased), half };
}

function sound(type, value = 1) {
  if (muted) return;
  audio ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === "suspended") audio.resume();
  const o = audio.createOscillator(), g = audio.createGain();
  const now = audio.currentTime;
  const f = { coin: 880, jump: 260, roll: 150, hit: 75, power: 520, mission: 700, near: 420, start: 330 }[type] || 220;
  o.type = type === "hit" ? "sawtooth" : type === "coin" ? "sine" : "triangle";
  o.frequency.setValueAtTime(f, now);
  o.frequency.exponentialRampToValueAtTime(Math.max(40, f * (type === "coin" ? 1.45 : .72)), now + .12);
  g.gain.setValueAtTime(.0001, now);
  g.gain.exponentialRampToValueAtTime(.08 * value, now + .008);
  g.gain.exponentialRampToValueAtTime(.0001, now + (type === "hit" ? .35 : .16));
  o.connect(g).connect(audio.destination); o.start(now); o.stop(now + .4);
}

function newMission() {
  const pool = [
    { type: "coins", target: 25, text: "Collect 25 coins" },
    { type: "distance", target: 750, text: "Run 750 meters" },
    { type: "jumps", target: 8, text: "Clear 8 obstacles" },
    { type: "near", target: 5, text: "Score 5 near misses" },
  ];
  mission = { ...choose(pool), progress: 0, done: false };
  ui.missionText.textContent = mission.text;
  ui.missionBar.style.width = "0%";
}

function reset() {
  time = distance = score = runCoins = combo = comboTimer = 0;
  speed = 32; multiplier = 1; spawnAt = 28; shake = flash = 0;
  objects = []; particles = []; floaters = [];
  power = { type: "", time: 0 };
  Object.assign(player, { lane: 0, xLane: 0, y: 0, vy: 0, rolling: 0, board: 0, alive: true, phase: 0 });
  newMission();
  updateHUD();
}

function begin() {
  reset();
  ui.curtain.classList.add("hidden");
  state = "countdown"; countdownTimer = 0; countdownValue = 3;
  popCount("3"); sound("start");
}

function popCount(value) {
  ui.countdown.textContent = value;
  ui.countdown.classList.remove("pop");
  void ui.countdown.offsetWidth;
  ui.countdown.classList.add("pop");
}

function startRunning() {
  state = "playing";
  popCount("GO!");
  sound("power");
}

function pauseToggle() {
  if (state === "playing") { state = "paused"; ui.pause.textContent = "▶"; showFloater("PAUSED", W / 2, H * .42, "#fff", 2); }
  else if (state === "paused") { state = "playing"; ui.pause.textContent = "Ⅱ"; last = performance.now(); }
}

function move(dir) {
  if (state !== "playing") return;
  const next = clamp(player.lane + dir, -1, 1);
  if (next !== player.lane) { player.lane = next; sound("roll", .35); }
}
function jump() {
  if (state !== "playing" || player.y > 2 || player.rolling > 0) return;
  player.vy = 23; missionEvent("jumps", 0); sound("jump");
}
function roll() {
  if (state !== "playing") return;
  if (player.y > 4) player.vy = -28;
  player.rolling = .72; sound("roll");
}

function spawnSegment() {
  const z = 120 + rand(0, 8);
  const difficulty = clamp(distance / 2200, 0, 1);
  const roll = Math.random();
  if (roll < .23) {
    const lane = choose([-1, 0, 1]);
    objects.push({ type: "train", lane, z, w: .85, h: 2.5, color: choose(colors), moving: Math.random() < .35, near: false });
    if (Math.random() < .5) spawnCoinLine(-lane || choose([-1, 1]), z + 2, 6);
  } else if (roll < .52) {
    const open = choose([-1, 0, 1]);
    for (const lane of [-1,0,1]) if (lane !== open)
      objects.push({ type: Math.random() < .38 ? "sign" : "barrier", lane, z: z + rand(-1.5, 1.5), near: false });
    spawnCoinLine(open, z + 4, 5);
  } else if (roll < .68) {
    const lane = choose([-1,0,1]);
    objects.push({ type: "ramp", lane, z, near: false });
    spawnCoinArc(lane, z + 1);
  } else {
    const path = choose([[-1,0,1],[1,0,-1],[0,0,0]]);
    path.forEach((lane, i) => objects.push({ type: "coin", lane, z: z + i * 5, lift: 1.2, spin: rand(0,TAU) }));
    if (Math.random() < .42) {
      const type = choose(["magnet","board","jetpack","boost"]);
      objects.push({ type: "power", power: type, lane: path[path.length - 1], z: z + 18, spin: 0 });
    }
  }
  spawnAt = distance + rand(24 - difficulty * 6, 37 - difficulty * 8);
}

function spawnCoinLine(lane, z, count) {
  for (let i=0;i<count;i++) objects.push({ type:"coin", lane, z:z+i*4.2, lift:1.15, spin:i*.7 });
}
function spawnCoinArc(lane, z) {
  for (let i=0;i<8;i++) objects.push({ type:"coin", lane, z:z+i*3.6, lift:1.5+Math.sin(i/7*Math.PI)*7, spin:i });
}

function missionEvent(type, amount = 1) {
  if (mission.done || mission.type !== type) return;
  mission.progress = Math.min(mission.target, mission.progress + amount);
  if (mission.progress >= mission.target) {
    mission.done = true; score += 2500; multiplier = Math.min(10, multiplier + 1);
    showFloater("MISSION COMPLETE +2500", W/2, H*.28, "#66ffc8", 1.8);
    burst(W/2, H*.32, "#66ffc8", 28); sound("mission");
  }
}

function collect(o, p) {
  if (o.dead) return;
  o.dead = true;
  runCoins++; score += 100 * multiplier; combo++; comboTimer = 2.7;
  multiplier = Math.min(10, 1 + Math.floor(combo / 8));
  missionEvent("coins");
  burst(p.x, p.y, "#ffd45b", 7); sound("coin", .65);
}

function activate(type) {
  const duration = { magnet: 9, board: 14, jetpack: 6.5, boost: 10 }[type];
  power = { type, time: duration };
  if (type === "board") player.board = 1;
  if (type === "jetpack") { player.y = 15; player.vy = 0; }
  if (type === "boost") multiplier = Math.max(multiplier, 5);
  showFloater(`${type.toUpperCase()}!`, W/2, H*.35, choose(colors), 1.2);
  burst(W/2, H*.65, "#6bf5ff", 24); sound("power");
}

function hit(o) {
  if (power.type === "jetpack") return;
  if (player.board || power.type === "board") {
    player.board = 0; power = { type:"", time:0 }; o.dead = true; shake = 13; flash = .35;
    showFloater("BOARD SAVED YOU", W/2, H*.48, "#61f7ff", 1.4); burst(W/2,H*.7,"#61f7ff",32); sound("hit",.8); return;
  }
  player.alive = false; state = "gameover"; shake = 20; flash = .55; sound("hit");
  const best = Math.max(store.get("best"), Math.floor(score));
  store.set("best", best); store.set("coins", store.get("coins") + runCoins);
  setTimeout(() => {
    ui.message.textContent = choose(["The city caught you. It won’t twice.","Good run. Meaner rails are waiting.","You made the midnight line nervous."]);
    ui.finalScore.textContent = Math.floor(score).toLocaleString();
    ui.finalDistance.textContent = `${Math.floor(distance)}m`;
    ui.best.textContent = best.toLocaleString();
    ui.summary.classList.add("show"); ui.start.textContent = "RUN AGAIN";
    ui.curtain.classList.remove("hidden");
  }, 650);
}

function update(dt) {
  time += dt;
  if (state === "countdown") {
    countdownTimer += dt;
    if (countdownTimer >= 1) {
      countdownTimer -= 1; countdownValue--;
      if (countdownValue > 0) { popCount(String(countdownValue)); sound("start"); } else startRunning();
    }
    return;
  }
  if (state !== "playing") { updateEffects(dt); return; }
  const pace = power.type === "boost" ? 1.18 : 1;
  speed = Math.min(66, (32 + distance / 180) * pace);
  distance += speed * dt; score += speed * dt * multiplier * 1.15;
  missionEvent("distance", speed * dt);
  player.phase += dt * (10 + speed * .13);
  player.xLane += (player.lane - player.xLane) * Math.min(1, dt * 13);
  if (power.type === "jetpack") {
    player.y += (17 - player.y) * Math.min(1,dt*5);
  } else {
    player.vy -= 48 * dt; player.y += player.vy * dt;
    if (player.y <= 0) { player.y = 0; player.vy = 0; }
  }
  player.rolling = Math.max(0, player.rolling - dt);
  if (distance >= spawnAt) spawnSegment();
  if (comboTimer > 0) comboTimer -= dt;
  else if (combo > 0) { combo = 0; if (power.type !== "boost") multiplier = 1; }
  if (power.time > 0) {
    power.time -= dt;
    if (power.time <= 0) {
      if (power.type === "board") player.board = 0;
      if (power.type === "jetpack") player.y = 6;
      power = { type:"",time:0 };
    }
  }
  for (const o of objects) {
    o.z -= speed * dt * (o.moving ? 1.32 : 1);
    if (o.spin != null) o.spin += dt * 6;
    const laneGap = Math.abs(o.lane - player.xLane);
    if (power.type === "magnet" && o.type === "coin" && o.z < 27 && o.z > -2) {
      o.lane += (player.xLane - o.lane) * Math.min(1, dt * 9);
    }
    if (!o.dead && o.z < 7.5 && o.z > -2.5 && laneGap < .43) {
      if (o.type === "coin") collect(o, project(o.lane,o.z,o.lift));
      else if (o.type === "power") { o.dead=true; activate(o.power); }
      else if (o.type === "ramp") { if (player.y < 1) { player.vy=27; missionEvent("jumps",0); sound("jump"); } }
      else {
        const clearsJump = player.y > (o.type === "train" ? 12 : 3.2);
        const clearsRoll = o.type === "sign" && player.rolling > 0;
        if (!clearsJump && !clearsRoll) hit(o);
        else if (clearsJump && !o.cleared) {
          o.cleared = true;
          missionEvent("jumps");
          score += 150 * multiplier;
          showFloater("CLEARED +150", W / 2, H * .6, "#7fffd2", .75);
        }
      }
    } else if (!o.dead && !o.near && o.z < -1 && laneGap < .8 && laneGap > .43 && !["coin","power","ramp"].includes(o.type)) {
      o.near = true; score += 300 * multiplier; combo += 2; comboTimer = 2.7; missionEvent("near");
      showFloater("NEAR MISS +300", W/2, H*.55, "#ff73cd", .8); sound("near",.5);
    }
  }
  objects = objects.filter((o) => !o.dead && o.z > -12);
  if (Math.random() < dt * (speed/10)) {
    particles.push({ x: rand(W*.15,W*.85), y: rand(horizon,H), vx:0, vy:rand(180,420), life:rand(.12,.35), max:.35, color:"#b7efff", size:rand(1,3), line:true });
  }
  updateEffects(dt);
  updateHUD();
}

function updateEffects(dt) {
  shake = Math.max(0, shake - dt * 30); flash = Math.max(0, flash - dt);
  for (const p of particles) { p.x += p.vx*dt; p.y += p.vy*dt; p.vy += (p.line ? 0 : 80)*dt; p.life -= dt; }
  particles = particles.filter((p)=>p.life>0);
  for (const f of floaters) { f.y -= 32*dt; f.life -= dt; }
  floaters = floaters.filter((f)=>f.life>0);
}

function updateHUD() {
  ui.score.textContent = Math.floor(score).toLocaleString();
  ui.coins.textContent = runCoins;
  ui.multi.textContent = `×${multiplier}`;
  ui.missionBar.style.width = `${clamp(mission.progress/mission.target*100,0,100)}%`;
  ui.power.classList.toggle("show", power.time > 0);
  if (power.time > 0) {
    ui.power.querySelector("span").textContent = power.type.toUpperCase();
    ui.powerTime.textContent = power.time.toFixed(1);
  }
}

function burst(x,y,color,n) {
  for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(35,180);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.3,.75),max:.75,color,size:rand(2,6)});}
}
function showFloater(text,x,y,color="#fff",life=1) { floaters.push({text,x,y,color,life,max:life}); }

function draw() {
  ctx.save();
  if (shake) ctx.translate(rand(-shake,shake),rand(-shake,shake));
  drawWorld();
  const sorted = [...objects].sort((a,b)=>b.z-a.z);
  for (const o of sorted) drawObject(o);
  drawPlayer();
  drawEffects();
  if (state === "paused") { ctx.fillStyle="#020611aa";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="900 44px system-ui";ctx.fillText("PAUSED",W/2,H*.45); }
  if (flash) { ctx.globalAlpha=flash;ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H); }
  ctx.restore();
}

function drawWorld() {
  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,"#4eafe8");sky.addColorStop(.38,"#91d8f5");sky.addColorStop(.7,"#ffe09b");sky.addColorStop(1,"#f5b65f");
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  const sun=ctx.createRadialGradient(W*.82,H*.12,4,W*.82,H*.12,H*.16);sun.addColorStop(0,"#fffde9");sun.addColorStop(.28,"#fff1a8cc");sun.addColorStop(1,"#fff1a800");ctx.fillStyle=sun;ctx.fillRect(0,0,W,H*.45);
  ctx.fillStyle="#ffffffcc";
  for(let i=0;i<stars.length;i+=13){const s=stars[i],x=(s.x+time*(4+i%7))%(W+160)-80,y=35+s.y*.43;ctx.beginPath();ctx.ellipse(x,y,42+s.s*5,13+s.s*2,0,0,TAU);ctx.ellipse(x-28,y+3,24,10,0,0,TAU);ctx.ellipse(x+31,y+4,28,9,0,0,TAU);ctx.fill();}
  for(const b of skyline){
    const y=horizon-b.h;ctx.fillStyle="#26395033";ctx.fillRect(b.x+7,y+8,b.w,b.h);
    ctx.fillStyle=b.color;ctx.fillRect(b.x,y,b.w,b.h);
    ctx.fillStyle="#d9f4ffbb";
    for(let wx=b.x+7;wx<b.x+b.w-4;wx+=13)for(let wy=y+10;wy<horizon-5;wy+=17)if(((wx+wy+b.seed*100)|0)%3!==0)ctx.fillRect(wx,wy,5,7);
    ctx.fillStyle="#fff";ctx.globalAlpha=.22;ctx.fillRect(b.x+5,y+4,5,b.h-5);ctx.globalAlpha=1;
  }
  ctx.fillStyle="#5ca955";ctx.fillRect(0,horizon,W,H-horizon);
  const wallTop=horizon+12;
  ctx.fillStyle="#e2bb82";ctx.fillRect(0,wallTop,W,H-wallTop);
  ctx.fillStyle="#f5d5a4";ctx.fillRect(0,wallTop,W,9);
  const tags=["GO!","RUN","CITY","FAST"];
  for(let x=-40;x<W+80;x+=105){ctx.fillStyle=colors[((x/105+20)|0)%colors.length]+"cc";ctx.font="900 30px system-ui";ctx.save();ctx.translate(x,wallTop+52);ctx.rotate(-.08);ctx.fillText(tags[Math.abs((x/105)|0)%tags.length],0,0);ctx.restore();}
  const far=project(0,120), near=project(0,0);
  ctx.beginPath();ctx.moveTo(W/2-far.half,horizon);ctx.lineTo(W/2+far.half,horizon);ctx.lineTo(W/2+near.half,H);ctx.lineTo(W/2-near.half,H);ctx.closePath();
  const ground=ctx.createLinearGradient(0,horizon,0,H);ground.addColorStop(0,"#826d58");ground.addColorStop(1,"#554538");ctx.fillStyle=ground;ctx.fill();
  ctx.strokeStyle="#ffffff26";ctx.lineWidth=2;ctx.stroke();
  for(let i=0;i<22;i++){
    let z=(i*7-(distance%7)+140)%140;const p=project(0,z);ctx.strokeStyle=`rgba(54,39,29,${.3+p.p*.55})`;ctx.lineWidth=lerp(1,7,p.p);ctx.beginPath();ctx.moveTo(W/2-p.half,p.y);ctx.lineTo(W/2+p.half,p.y);ctx.stroke();
    ctx.strokeStyle=`rgba(234,191,126,${.15+p.p*.3})`;ctx.lineWidth=lerp(.5,2,p.p);ctx.beginPath();ctx.moveTo(W/2-p.half,p.y-2);ctx.lineTo(W/2+p.half,p.y-2);ctx.stroke();
  }
  for(const lane of [-1,0,1]){
    for(const rail of [-.18,.18]){
      const a=project(lane+rail,120),b=project(lane+rail,0);ctx.strokeStyle="#2e241f88";ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(a.x+3,a.y);ctx.lineTo(b.x+3,b.y);ctx.stroke();
      ctx.strokeStyle="#d7e0df";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      ctx.strokeStyle="#ffffff99";ctx.lineWidth=1;ctx.stroke();
    }
  }
  for(let i=0;i<9;i++){const side=i%2?-1:1,z=(i*17-(distance*.45%17)+140)%140,p=project(side*1.85,z);ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.scale,p.scale);ctx.fillStyle="#765032";ctx.fillRect(-4,-38,8,38);ctx.fillStyle=i%3?"#42a653":"#2e8c62";ctx.beginPath();ctx.arc(0,-52,26,0,TAU);ctx.arc(-18,-42,18,0,TAU);ctx.arc(18,-42,18,0,TAU);ctx.fill();ctx.restore();}
  const warm=ctx.createLinearGradient(0,horizon,0,H);warm.addColorStop(0,"#ffdc7100");warm.addColorStop(1,"#ffb24a20");ctx.fillStyle=warm;ctx.fillRect(0,horizon,W,H-horizon);
}

function rounded(x,y,w,h,r) { ctx.beginPath();ctx.roundRect(x,y,w,h,r); }
function drawObject(o) {
  const p=project(o.lane,o.z,o.lift||0);if(p.p<=.01)return;ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.scale,p.scale);
  if(o.type==="coin"){
    ctx.rotate(Math.sin(o.spin)*.25);ctx.scale(Math.max(.15,Math.abs(Math.cos(o.spin))),1);ctx.shadowColor="#ffca28";ctx.shadowBlur=12;ctx.fillStyle="#ffd648";ctx.beginPath();ctx.arc(0,-24,13,0,TAU);ctx.fill();ctx.strokeStyle="#fff5a3";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#d88613";ctx.font="900 13px system-ui";ctx.textAlign="center";ctx.fillText("★",0,-19);
  } else if(o.type==="power"){
    const c={magnet:"#ff4a71",board:"#6cf6ff",jetpack:"#ff9d4a",boost:"#b080ff"}[o.power];ctx.rotate(o.spin*.25);ctx.shadowColor=c;ctx.shadowBlur=24;ctx.fillStyle=c;rounded(-20,-62,40,40,12);ctx.fill();ctx.fillStyle="#07101f";ctx.font="900 22px system-ui";ctx.textAlign="center";ctx.fillText({magnet:"∩",board:"◆",jetpack:"↑",boost:"×"}[o.power],0,-34);
  } else if(o.type==="barrier"){
    ctx.shadowColor="#64311f55";ctx.shadowBlur=8;ctx.fillStyle="#ed4d35";rounded(-31,-57,62,57,7);ctx.fill();ctx.fillStyle="#ffe05b";for(let i=-24;i<25;i+=16){ctx.save();ctx.translate(i,-30);ctx.rotate(-.65);ctx.fillRect(-4,-25,8,50);ctx.restore();}ctx.fillStyle="#f8f5e9";ctx.fillRect(-34,-62,68,8);ctx.fillStyle="#5b4635";ctx.fillRect(-27,0,9,12);ctx.fillRect(18,0,9,12);
  } else if(o.type==="sign"){
    ctx.fillStyle="#69747a";ctx.fillRect(-35,-95,7,95);ctx.fillRect(28,-95,7,95);ctx.fillStyle="#f29435";rounded(-43,-105,86,35,7);ctx.fill();ctx.strokeStyle="#fff2ba";ctx.lineWidth=4;ctx.stroke();ctx.fillStyle="#fff";ctx.font="900 12px system-ui";ctx.textAlign="center";ctx.fillText("DUCK",0,-82);
  } else if(o.type==="ramp"){
    ctx.fillStyle="#3c9b62";ctx.beginPath();ctx.moveTo(-38,0);ctx.lineTo(38,0);ctx.lineTo(27,-42);ctx.lineTo(-27,-42);ctx.closePath();ctx.fill();ctx.strokeStyle="#d7f7bd";ctx.lineWidth=4;ctx.stroke();for(let y=-34;y<-3;y+=10){ctx.beginPath();ctx.moveTo(-26,y);ctx.lineTo(26,y);ctx.stroke();}
  } else if(o.type==="train"){
    ctx.shadowColor="#30251f77";ctx.shadowBlur=16;ctx.fillStyle="#f5eee2";rounded(-55,-195,110,195,18);ctx.fill();ctx.fillStyle=o.color;ctx.fillRect(-51,-168,102,15);ctx.fillRect(-51,-74,102,18);ctx.fillStyle="#bfeaff";rounded(-40,-145,80,48,10);ctx.fill();ctx.fillStyle="#31546b";ctx.fillRect(-34,-138,29,35);ctx.fillRect(6,-138,29,35);ctx.fillStyle="#fff7b5";ctx.beginPath();ctx.arc(-30,-31,9,0,TAU);ctx.arc(30,-31,9,0,TAU);ctx.fill();ctx.fillStyle="#26425b";ctx.font="900 13px system-ui";ctx.textAlign="center";ctx.fillText("CITY LINE",0,-174);ctx.strokeStyle="#ffffff";ctx.lineWidth=3;ctx.strokeRect(-45,-188,90,127);
  }
  ctx.restore();
}

function drawPlayer() {
  const base=project(player.xLane,2,player.y);const s=clamp(Math.min(W/500,H/760),.72,1.1);ctx.save();ctx.translate(base.x,base.y);ctx.scale(s,s);
  const roll=player.rolling>0, air=player.y>1, run=Math.sin(player.phase), skin="#bf744e";
  ctx.globalAlpha=.18;ctx.fillStyle="#1c2630";ctx.beginPath();ctx.ellipse(0,8,air?20:38,air?5:10,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
  if(player.board){ctx.shadowColor="#f5cf3b";ctx.shadowBlur=15;ctx.fillStyle="#ffd94c";rounded(-40,5,80,10,6);ctx.fill();ctx.fillStyle="#e44f3d";ctx.fillRect(-23,7,46,4);}
  if(power.type==="jetpack"){ctx.fillStyle="#ff7b46";ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(-8,42+Math.random()*20);ctx.lineTo(0,0);ctx.fill();ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(16,48+Math.random()*22);ctx.lineTo(23,0);ctx.fill();}
  ctx.shadowColor="#3d291c33";ctx.shadowBlur=8;
  if(roll){
    ctx.rotate(-.35);ctx.fillStyle="#2768b1";rounded(-28,-28,57,31,15);ctx.fill();ctx.fillStyle=skin;ctx.beginPath();ctx.arc(22,-32,16,0,TAU);ctx.fill();ctx.fillStyle="#e94d39";ctx.beginPath();ctx.arc(19,-39,16,Math.PI,TAU);ctx.fill();ctx.strokeStyle="#f4d14e";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-15,-4);ctx.lineTo(16,-1);ctx.stroke();
  }else if(air){
    ctx.strokeStyle="#263b78";ctx.lineWidth=11;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-9,-58);ctx.lineTo(-25,-34);ctx.lineTo(-8,-18);ctx.stroke();
    ctx.beginPath();ctx.moveTo(9,-58);ctx.lineTo(25,-34);ctx.lineTo(8,-18);ctx.stroke();
    ctx.strokeStyle="#f4d14e";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-9,-18);ctx.lineTo(3,-18);ctx.stroke();ctx.beginPath();ctx.moveTo(8,-18);ctx.lineTo(21,-18);ctx.stroke();
    ctx.fillStyle="#e94837";rounded(-23,-107,46,60,15);ctx.fill();ctx.fillStyle="#fff0d5";ctx.fillRect(-18,-84,36,8);
    ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-126,21,0,TAU);ctx.fill();
    ctx.fillStyle="#502f22";ctx.beginPath();ctx.arc(2,-130,18,Math.PI*1.08,Math.PI*.08);ctx.lineTo(20,-125);ctx.closePath();ctx.fill();
    ctx.fillStyle="#e94d39";ctx.beginPath();ctx.arc(-2,-141,19,Math.PI,TAU);ctx.fill();ctx.fillRect(-23,-141,35,6);
    ctx.strokeStyle=skin;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-16,-94);ctx.lineTo(-35,-126);ctx.stroke();ctx.beginPath();ctx.moveTo(16,-94);ctx.lineTo(35,-126);ctx.stroke();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(7,-126,4,0,TAU);ctx.fill();ctx.fillStyle="#2c241e";ctx.beginPath();ctx.arc(8,-126,2,0,TAU);ctx.fill();
  }else{
    ctx.strokeStyle="#263b78";ctx.lineWidth=11;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-7,-57);ctx.lineTo(-12+run*11,-15);ctx.lineTo(-24+run*19,4);ctx.stroke();
    ctx.beginPath();ctx.moveTo(8,-57);ctx.lineTo(12-run*11,-17);ctx.lineTo(25-run*19,2);ctx.stroke();
    ctx.strokeStyle="#f4d14e";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-25+run*19,3);ctx.lineTo(-14+run*19,3);ctx.stroke();ctx.beginPath();ctx.moveTo(14-run*19,1);ctx.lineTo(27-run*19,1);ctx.stroke();
    ctx.fillStyle="#e94837";rounded(-23,-105,46,59,15);ctx.fill();ctx.fillStyle="#fff0d5";ctx.fillRect(-18,-83,36,8);ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-124,21,0,TAU);ctx.fill();
    ctx.fillStyle="#502f22";ctx.beginPath();ctx.arc(2,-128,18,Math.PI*1.08,Math.PI*.08);ctx.lineTo(20,-123);ctx.closePath();ctx.fill();
    ctx.fillStyle="#e94d39";ctx.beginPath();ctx.arc(-2,-139,19,Math.PI,TAU);ctx.fill();ctx.fillRect(-23,-139,35,6);
    ctx.strokeStyle=skin;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-16,-91);ctx.lineTo(-30-run*8,-59);ctx.stroke();ctx.beginPath();ctx.moveTo(16,-91);ctx.lineTo(30+run*8,-66);ctx.stroke();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(7,-124,4,0,TAU);ctx.fill();ctx.fillStyle="#2c241e";ctx.beginPath();ctx.arc(8,-124,2,0,TAU);ctx.fill();
  }
  ctx.restore();
}

function drawEffects() {
  for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.strokeStyle=ctx.fillStyle=p.color;if(p.line){ctx.lineWidth=p.size;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y+p.vy*.07);ctx.stroke();}else{ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,TAU);ctx.fill();}}
  ctx.globalAlpha=1;ctx.textAlign="center";
  for(const f of floaters){ctx.globalAlpha=clamp(f.life/Math.min(.3,f.max),0,1);ctx.fillStyle=f.color;ctx.font=`900 ${clamp(W/32,18,34)}px system-ui`;ctx.shadowColor="#000";ctx.shadowBlur=8;ctx.fillText(f.text,f.x,f.y);}
  ctx.globalAlpha=1;ctx.shadowBlur=0;
}

function loop(now) {
  const frame=Math.min(.05,(now-last)/1000);last=now;accumulator+=frame;
  while(accumulator>=1/60){update(1/60);accumulator-=1/60;}
  draw();requestAnimationFrame(loop);
}

addEventListener("resize",resize);
addEventListener("keydown",(e)=>{
  if(["ArrowLeft","a","A"].includes(e.key))move(-1);
  if(["ArrowRight","d","D"].includes(e.key))move(1);
  if(["ArrowUp","w","W"," "].includes(e.key))jump();
  if(["ArrowDown","s","S"].includes(e.key))roll();
  if(e.key==="p"||e.key==="P"||e.key==="Escape")pauseToggle();
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key))e.preventDefault();
});
let touch=null;
canvas.addEventListener("pointerdown",(e)=>{
  e.preventDefault();
  touch={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};
  try { canvas.setPointerCapture?.(e.pointerId); } catch {}
});
canvas.addEventListener("pointerup",(e)=>{
  e.preventDefault();
  if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;
  if(Math.max(Math.abs(dx),Math.abs(dy))<18){jump();}
  else if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1);else if(dy<0)jump();else roll();
  touch=null;
});
canvas.addEventListener("pointercancel",()=>{touch=null;});
ui.start.addEventListener("click",begin);
ui.pause.addEventListener("click",pauseToggle);
ui.mute.addEventListener("click",()=>{muted=!muted;store.set("muted",muted);ui.mute.textContent=muted?"×":"♪";});
ui.mute.textContent=muted?"×":"♪";
resize();newMission();updateHUD();requestAnimationFrame(loop);
