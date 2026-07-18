(() => {
  "use strict";
  const canvas = document.querySelector("#game"),
    ctx = canvas.getContext("2d"),
    panel = document.querySelector("#panel"),
    startBtn = document.querySelector("#start"),
    scoreEl = document.querySelector("#score"),
    metaEl = document.querySelector("#meta");
  let W,
    H,
    DPR = 1,
    last = 0,
    state = "title",
    time = 0,
    distance = 0,
    score = 0,
    lives = 3,
    combo = 1,
    speed = 330,
    shake = 0,
    flash = 0,
    spawn = 0,
    gateSide = 1,
    objects = [],
    snow = [],
    keys = { left: false, right: false, jump: false },
    player = {
      x: 0,
      vx: 0,
      y: 0,
      vy: 0,
      angle: 0,
      spin: 0,
      air: false,
      crash: 0,
      inv: 0,
    };
  const rand = (a, b) => a + Math.random() * (b - a),
    clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function resize() {
    DPR = Math.min(2, devicePixelRatio || 1);
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    snow = Array.from({ length: Math.floor((W * H) / 6500) }, () => ({
      x: rand(0, W),
      y: rand(0, H * 0.72),
      s: rand(0.5, 2),
      v: rand(8, 24),
    }));
  }
  addEventListener("resize", resize);
  resize();
  function reset() {
    time = distance = score = 0;
    lives = 3;
    combo = 1;
    speed = 330;
    spawn = 0;
    gateSide = 1;
    objects = [];
    Object.assign(player, {
      x: 0,
      vx: 0,
      y: 0,
      vy: 0,
      angle: 0,
      spin: 0,
      air: false,
      crash: 0,
      inv: 0,
    });
    state = "play";
    panel.style.display = "none";
  }
  function input(name, on) {
    keys[name] = on;
    if (name === "jump" && on && state === "play") {
      if (!player.air && !player.crash) {
        player.air = true;
        player.vy = 480;
        player.spin = (keys.left ? -1 : keys.right ? 1 : 1) * 4.9;
      } else if (player.air)
        player.spin += (keys.left ? -1 : keys.right ? 1 : 1) * 2.2;
    }
  }
  addEventListener("keydown", (e) => {
    const m = {
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right",
      " ": "jump",
    };
    if (m[e.key]) {
      e.preventDefault();
      input(m[e.key], true);
    }
    if (e.key.toLowerCase() === "p" && state !== "title") {
      state = state === "pause" ? "play" : "pause";
      panel.style.display = state === "pause" ? "grid" : "none";
      if (state === "pause") {
        panel.querySelector("h1").innerHTML = "PAUSED";
        panel.querySelector("p").textContent =
          "The mountain will wait. Surprisingly polite of it.";
        startBtn.textContent = "RESUME";
      }
    }
  });
  addEventListener("keyup", (e) => {
    const m = {
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right",
      " ": "jump",
    };
    if (m[e.key]) input(m[e.key], false);
  });
  document.querySelectorAll("[data-key]").forEach((b) => {
    const k = b.dataset.key;
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      try {
        b.setPointerCapture(e.pointerId);
      } catch {}
      input(k, true);
    });
    ["pointerup", "pointercancel"].forEach((n) =>
      b.addEventListener(n, () => input(k, false)),
    );
  });
  startBtn.onclick = () =>
    state === "pause"
      ? ((state = "play"), (panel.style.display = "none"))
      : reset();
  function roadX(x, z) {
    const p = 1 - z / H;
    return W / 2 + x * (0.24 + p * 0.9);
  }
  function roadY(z) {
    const p = 1 - z / H;
    return H * 0.28 + p * p * H * 0.72;
  }
  function scale(z) {
    const p = 1 - z / H;
    return 0.2 + p * 1.05;
  }
  function addObject() {
    const z = H * 0.22;
    const r = Math.random();
    if (r < 0.32) {
      gateSide *= -1;
      objects.push({
        type: "gate",
        x: gateSide * rand(85, 190),
        z,
        hit: false,
      });
    } else if (r < 0.48)
      objects.push({ type: "ramp", x: rand(-180, 180), z, hit: false });
    else
      objects.push({
        type: r < 0.77 ? "tree" : "rock",
        x: rand(-330, 330),
        z,
        hit: false,
      });
  }
  function crash() {
    if (player.inv > 0) return;
    player.crash = 0.95;
    player.inv = 2;
    lives--;
    combo = 1;
    shake = 16;
    flash = 1;
    speed = Math.max(300, speed - 90);
    if (lives <= 0) setTimeout(gameOver, 650);
  }
  function gameOver() {
    state = "over";
    score = Math.floor(score);
    const best = Math.max(score, +localStorage.snowlineBest || 0);
    localStorage.snowlineBest = best;
    panel.style.display = "grid";
    panel.querySelector(".kicker").textContent =
      "RUN OVER · BEST " + String(best).padStart(6, "0");
    panel.querySelector("h1").innerHTML = "WHITE<span>OUT</span>";
    panel.querySelector("p").textContent =
      "The mountain won that round. It usually does. Your score: " +
      score.toLocaleString();
    startBtn.textContent = "DROP AGAIN";
  }
  function update(dt) {
    if (state !== "play") return;
    time += dt;
    distance += speed * dt;
    speed = Math.min(720, 330 + time * 7);
    player.inv = Math.max(0, player.inv - dt);
    player.crash = Math.max(0, player.crash - dt);
    flash = Math.max(0, flash - dt * 3);
    shake = Math.max(0, shake - dt * 28);
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (!player.crash) {
      player.vx += dir * 760 * dt;
      player.vx *= Math.pow(0.18, dt);
      player.x += player.vx * dt;
      player.angle += (dir * 0.52 - player.angle) * dt * 7;
    } else {
      player.angle += 8 * dt;
      player.x += player.vx * dt;
    }
    player.x = clamp(player.x, -330, 330);
    if (Math.abs(player.x) > 305 && !player.air)
      player.vx -= Math.sign(player.x) * 150 * dt;
    if (player.air) {
      player.vy -= 1050 * dt;
      player.y += player.vy * dt;
      player.angle += player.spin * dt;
      if (player.y <= 0) {
        const turns = Math.abs(player.angle) / (Math.PI * 2);
        player.y = 0;
        player.air = false;
        if (turns > 0.65 && !player.crash) {
          score += Math.floor(turns) * 500 * combo;
          combo = Math.min(8, combo + 1);
          player.angle = 0;
        } else if (turns > 0.25) {
          crash();
          player.angle = 0;
        } else player.angle = dir * 0.2;
      }
    }
    spawn -= speed * dt;
    if (spawn < 0) {
      addObject();
      spawn = rand(150, 260);
    }
    for (const o of objects) {
      o.z += speed * dt;
      const dz = Math.abs(o.z - H * 0.84),
        dx = Math.abs(o.x - player.x);
      if (!o.hit && dz < 34) {
        o.hit = true;
        if (o.type === "gate") {
          if (dx < 58) {
            score += 250 * combo;
            combo = Math.min(8, combo + 1);
          } else combo = 1;
        } else if (o.type === "ramp" && dx < 72 && !player.air) {
          player.air = true;
          player.vy = rand(500, 580);
          player.spin = dir * 5;
        } else if (
          (o.type === "tree" || o.type === "rock") &&
          dx < (o.type === "tree" ? 34 : 42) &&
          !player.air
        )
          crash();
      }
    }
    objects = objects.filter((o) => o.z < H * 1.08);
    score += speed * dt * 0.09 * combo;
    scoreEl.textContent = String(Math.floor(score)).padStart(6, "0");
    metaEl.textContent =
      "♥".repeat(Math.max(0, lives)) +
      "♡".repeat(3 - Math.max(0, lives)) +
      " · x" +
      combo;
  }
  function mountain() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#071426");
    g.addColorStop(0.43, "#387797");
    g.addColorStop(0.44, "#d9f4fb");
    g.addColorStop(1, "#eefcff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#b8e1ec";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.45);
    for (let x = 0; x <= W; x += W / 8)
      ctx.lineTo(x, H * 0.22 + Math.sin(x * 0.017) * H * 0.09 + rand(-12, 12));
    ctx.lineTo(W, H * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f3fdff";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.48);
    for (let x = 0; x <= W; x += W / 10)
      ctx.lineTo(x, H * 0.29 + Math.sin(x * 0.011 + 2) * H * 0.08);
    ctx.lineTo(W, H * 0.55);
    ctx.closePath();
    ctx.fill();
    for (const s of snow) {
      s.y += s.v * 0.016;
      if (s.y > H * 0.73) s.y = 0;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.s, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#b8dfe8";
    ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      const z = i * 95 + (distance % 95);
      if (z > H) continue;
      const y = roadY(z);
      ctx.beginPath();
      ctx.moveTo(roadX(-360, z), y);
      ctx.quadraticCurveTo(W / 2, y + 8, roadX(360, z), y);
      ctx.stroke();
    }
  }
  function drawObject(o) {
    const x = roadX(o.x, o.z),
      y = roadY(o.z),
      s = scale(o.z);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (o.type === "tree") {
      ctx.fillStyle = "#153e43";
      ctx.fillRect(-5, -15, 10, 30);
      ctx.fillStyle = "#0a5961";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, -76 + i * 20);
        ctx.lineTo(-28 + i * 3, -15 + i * 10);
        ctx.lineTo(28 - i * 3, -15 + i * 10);
        ctx.closePath();
        ctx.fill();
      }
    } else if (o.type === "rock") {
      ctx.fillStyle = "#68828c";
      ctx.beginPath();
      ctx.moveTo(-30, 5);
      ctx.lineTo(-18, -30);
      ctx.lineTo(12, -38);
      ctx.lineTo(32, 3);
      ctx.closePath();
      ctx.fill();
    } else if (o.type === "ramp") {
      ctx.fillStyle = "#91dcea";
      ctx.beginPath();
      ctx.moveTo(-50, 10);
      ctx.lineTo(-30, -20);
      ctx.lineTo(42, -5);
      ctx.lineTo(52, 10);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#f02d5e";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-43, 8);
      ctx.lineTo(-43, -65);
      ctx.moveTo(43, 8);
      ctx.lineTo(43, -65);
      ctx.stroke();
      ctx.fillStyle = "#ffec4b";
      ctx.fillRect(-43, -65, 86, 18);
    }
    ctx.restore();
  }
  function rider() {
    const x = roadX(player.x, H * 0.84),
      ground = roadY(H * 0.84),
      y = ground - player.y * 0.42;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.angle);
    if (player.inv && Math.floor(player.inv * 10) % 2) ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "#173448";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-28, 18);
    ctx.lineTo(31, 18);
    ctx.stroke();
    ctx.strokeStyle = "#ff446e";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-14, 4);
    ctx.lineTo(13, 13);
    ctx.stroke();
    ctx.fillStyle = "#ffcd7d";
    ctx.beginPath();
    ctx.arc(0, -24, 10, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#122a48";
    ctx.beginPath();
    ctx.arc(0, -27, 12, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = "#ecfaff";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(-7, 6);
    ctx.stroke();
    ctx.restore();
  }
  function draw() {
    ctx.save();
    if (shake) ctx.translate(rand(-shake, shake), rand(-shake, shake));
    mountain();
    [...objects].sort((a, b) => a.z - b.z).forEach(drawObject);
    rider();
    ctx.restore();
    if (flash) {
      ctx.fillStyle = `rgba(255,50,90,${flash * 0.25})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (state === "pause") {
      ctx.fillStyle = "#06111d88";
      ctx.fillRect(0, 0, W, H);
    }
  }
  function loop(t) {
    const dt = Math.min(0.033, (t - last) / 1000 || 0);
    last = t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.SNOWLINE = {
    get: () => ({
      state,
      score,
      lives,
      combo,
      speed,
      player: { ...player },
      objects: objects.length,
    }),
    reset,
  };
})();
