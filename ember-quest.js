(() => {
  "use strict";
  const c = document.querySelector("#game"),
    x = c.getContext("2d"),
    W = 384,
    H = 216,
    T = 16,
    G = 0.34,
    k = { left: 0, right: 0, jump: 0, fire: 0 };
  const stages = [
    [
      "MOSSLIGHT MEADOWS",
      ["#55cfe6", "#d8ed8b"],
      "............................................................|............................................................|...........c...........===.............c....................|....===......................c..............................|................e...........===.................g..........|..s......e....#####....###........e....####.........c......|######..###########..##########..###########..##############|######..###########..##########..###########..##############",
    ],
    [
      "MOONPIPE CITY",
      ["#60448e", "#e98283"],
      "............................................................|............................................................|........c.............===...................c...............|...===..........................===.........................|.............b..........g..............b....................|..s....e....#####....####.....e....#####.........c.........|########..#######..########..###########..##################|########..#######..########..###########..##################",
    ],
    [
      "CINDER CROWN",
      ["#211638", "#dc4a43"],
      "............................................................|............................................................|.........c.........===........c.........===................|............................................................|...===....e....g..........b........e...........c...........|..s......#####....#####....#####....#####..........B.......|#######..#####..#######..#######..#########..##############|#######..#####..#######..#######..#########..##############",
    ],
  ];
  let state = "title",
    L = 0,
    cam = 0,
    t = 0,
    banner = 0,
    p,
    blocks = [],
    enemies = [],
    coins = [],
    shots = [],
    bits = [];
  const $ = (s) => document.querySelector(s),
    hit = (a, b) =>
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  function load(n) {
    L = n;
    blocks = [];
    enemies = [];
    coins = [];
    shots = [];
    bits = [];
    let rows = stages[n][2].split("|");
    rows.forEach((r, y) =>
      [...r].forEach((q, z) => {
        let X = z * T,
          Y = y * T;
        if ("#=".includes(q)) blocks.push({ x: X, y: Y, w: T, h: T, q });
        if (q === "s")
          p = {
            x: X,
            y: Y - 10,
            w: 12,
            h: 15,
            vx: 0,
            vy: 0,
            ground: 0,
            face: 1,
            hp: 3,
            gems: p?.gems || 0,
            inv: 0,
            cool: 0,
          };
        if ("ebB".includes(q))
          enemies.push({
            x: X,
            y: Y - (q === "B" ? 14 : 0),
            w: q === "B" ? 28 : 14,
            h: q === "B" ? 28 : 14,
            vx: q === "b" ? -0.8 : -0.45,
            vy: 0,
            q,
            hp: q === "B" ? 12 : q === "b" ? 3 : 1,
            home: X,
          });
        if ("cg".includes(q))
          coins.push({
            x: X + 5,
            y: Y + 5,
            w: 7,
            h: 7,
            big: q === "g",
            got: 0,
          });
      }),
    );
    cam = 0;
    banner = 150;
    $("#world").textContent = `${n + 1}-1`;
    sync();
  }
  function sync() {
    $("#gems").textContent = p.gems;
    $("#hp").textContent = p.hp;
  }
  function solid(o, X, Y) {
    let a = { x: X, y: Y, w: o.w, h: o.h };
    return blocks.find((b) => hit(a, b));
  }
  function move(o) {
    o.x += o.vx;
    let b = solid(o, o.x, o.y);
    if (b) {
      o.x = o.vx > 0 ? b.x - o.w : b.x + b.w;
      o.vx = 0;
    }
    o.y += o.vy;
    b = solid(o, o.x, o.y);
    o.ground = 0;
    if (b) {
      if (o.vy > 0) {
        o.y = b.y - o.h;
        o.ground = 1;
      } else o.y = b.y + b.h;
      o.vy = 0;
    }
  }
  function burst(X, Y, col, n = 12) {
    while (n--)
      bits.push({
        x: X,
        y: Y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.8) * 4,
        life: 35,
        col,
      });
  }
  function hurt() {
    if (p.inv) return;
    p.hp--;
    p.inv = 90;
    sync();
    burst(p.x, p.y, "#ff5060");
    if (p.hp <= 0) {
      p.gems = Math.max(0, p.gems - 5);
      setTimeout(() => load(L), 350);
    } else {
      p.vy = -5;
      p.vx = -p.face * 3;
    }
  }
  function step() {
    if (state !== "play") return;
    t++;
    banner = Math.max(0, banner - 1);
    p.inv = Math.max(0, p.inv - 1);
    p.cool = Math.max(0, p.cool - 1);
    let a = k.left ? -1 : k.right ? 1 : 0;
    p.vx = (p.vx + a * 0.4) * (p.ground ? 0.78 : 0.94);
    p.vx = Math.max(-2.3, Math.min(2.3, p.vx));
    if (a) p.face = a;
    if (k.jump && p.ground) {
      p.vy = -6.2;
      p.ground = 0;
    }
    k.jump = 0;
    if (k.fire && !p.cool) {
      shots.push({
        x: p.x + (p.face > 0 ? 12 : -5),
        y: p.y + 5,
        w: 6,
        h: 6,
        vx: p.face * 4,
        life: 70,
      });
      p.cool = 22;
    }
    k.fire = 0;
    p.vy = Math.min(8, p.vy + G);
    move(p);
    if (p.y > H + 40) hurt();
    coins.forEach((o) => {
      if (!o.got && hit(p, o)) {
        o.got = 1;
        p.gems += o.big ? 5 : 1;
        sync();
        burst(o.x, o.y, o.big ? "#ffdc45" : "#68f5ff");
      }
    });
    shots.forEach((s) => {
      s.x += s.vx;
      s.life--;
      if (solid(s, s.x, s.y)) s.life = 0;
      enemies.forEach((e) => {
        if (e.hp > 0 && s.life && hit(s, e)) {
          s.life = 0;
          e.hp--;
          burst(e.x, e.y, "#ff9844");
          if (!e.hp) {
            p.gems += e.q === "B" ? 20 : 2;
            sync();
          }
        }
      });
    });
    shots = shots.filter((s) => s.life > 0);
    enemies.forEach((e) => {
      if (e.hp <= 0) return;
      e.vy = Math.min(7, e.vy + G);
      if (e.q === "B") {
        e.vx = Math.sign(p.x - e.x) * 0.7;
        if (t % 90 === 0) e.vy = -5;
      } else if (Math.abs(e.x - e.home) > 45) e.vx *= -1;
      let v = e.vx;
      move(e);
      if (!e.vx) e.vx = -v;
      if (hit(p, e)) {
        if (p.vy > 1 && p.y + p.h < e.y + 10) {
          e.hp--;
          p.vy = -4.5;
          burst(e.x, e.y, "#ffd050");
        } else hurt();
      }
    });
    cam += (Math.max(0, Math.min(p.x - W * 0.35, 60 * T - W)) - cam) * 0.1;
    if (p.x > 58 * T) {
      if (L < 2) load(L + 1);
      else if (!enemies.some((e) => e.q === "B" && e.hp > 0)) win();
    }
    bits.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.12;
      b.life--;
    });
    bits = bits.filter((b) => b.life > 0);
  }
  function box(X, Y, w, h, col) {
    x.fillStyle = col;
    x.fillRect(Math.round(X - cam), Math.round(Y), w, h);
  }
  function draw() {
    let d = devicePixelRatio || 1;
    if (c.width !== innerWidth * d || c.height !== innerHeight * d) {
      c.width = innerWidth * d;
      c.height = innerHeight * d;
    }
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.fillStyle = "#081020";
    x.fillRect(0, 0, c.width, c.height);
    const scale = Math.min(c.width / W, c.height / H);
    const offsetY = Math.max(0, (c.height - H * scale) * 0.34);
    x.setTransform(scale, 0, 0, scale, 0, offsetY);
    let g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, stages[L][1][0]);
    g.addColorStop(1, stages[L][1][1]);
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    for (let i = 0; i < 10; i++) {
      box(
        i * 90 - cam * 0.3,
        105,
        65,
        55,
        L === 0 ? "#398a66" : L === 1 ? "#4d3a74" : "#60253c",
      );
      box(
        i * 90 + 12 - cam * 0.3,
        92,
        38,
        20,
        L === 0 ? "#61ac72" : L === 1 ? "#6d528f" : "#843341",
      );
    }
    blocks.forEach((b) => {
      box(
        b.x,
        b.y,
        16,
        16,
        b.q === "="
          ? "#da9440"
          : L === 0
            ? "#477440"
            : L === 1
              ? "#49658a"
              : "#71353e",
      );
      box(b.x, b.y, 16, 3, b.q === "=" ? "#ffe16b" : "#8acc61");
    });
    coins.forEach((o) => {
      if (!o.got) {
        box(
          o.x,
          o.y + Math.sin(t / 8 + o.x) * 2,
          7,
          7,
          o.big ? "#ffdb43" : "#6ff5ff",
        );
        box(o.x + 2, o.y + 2, 2, 2, "#fff");
      }
    });
    enemies.forEach((e) => {
      if (e.hp > 0) {
        box(
          e.x,
          e.y,
          e.w,
          e.h,
          e.q === "B" ? "#952d64" : e.q === "b" ? "#773a94" : "#8b4236",
        );
        box(e.x + 2, e.y + 3, e.q === "B" ? 6 : 3, e.q === "B" ? 5 : 3, "#fff");
        box(e.x + e.w - 5, e.y + 3, 3, 3, "#fff");
      }
    });
    shots.forEach((s) => box(s.x, s.y, s.w, s.h, "#ffb83b"));
    if (!p.inv || t % 6 < 3) {
      box(p.x, p.y, 12, 15, "#e84356");
      box(p.x + 2, p.y + 2, 8, 6, "#ffbd47");
      box(p.x + (p.face > 0 ? 8 : 1), p.y + 4, 2, 2, "#17233d");
      box(p.x + 1, p.y + 12, 4, 3, "#26345d");
      box(p.x + 7, p.y + 12, 4, 3, "#26345d");
    }
    bits.forEach((b) => box(b.x, b.y, 3, 3, b.col));
    if (banner) {
      x.fillStyle = "#071225dd";
      x.fillRect(45, 68, 294, 63);
      x.textAlign = "center";
      x.fillStyle = "#ffcf48";
      x.font = "bold 14px monospace";
      x.fillText(stages[L][0], W / 2, 94);
      x.fillStyle = "#fff";
      x.font = "9px monospace";
      x.fillText(
        L === 2 ? "DEFEAT THE CLOCKWORK KING" : "REACH THE SUN GATE",
        W / 2,
        113,
      );
    }
    requestAnimationFrame(draw);
  }
  function win() {
    state = "win";
    $("#screen").classList.remove("hidden");
    $("#screen").innerHTML =
      `<div class="card"><h1>DAWN<br>RESTORED</h1><h2>THE SUN ENGINE LIVES</h2><p>You broke the Clockwork King and brought sunrise home with ${p.gems} star shards.</p><button class="start" onclick="location.reload()">PLAY AGAIN</button></div>`;
  }
  $("#start").onclick = () => {
    state = "play";
    $("#screen").classList.add("hidden");
    load(0);
  };
  addEventListener("keydown", (e) => {
    let q = {
      ArrowLeft: "left",
      a: "left",
      ArrowRight: "right",
      d: "right",
      " ": "jump",
      ArrowUp: "jump",
      x: "fire",
    }[e.key];
    if (q) {
      k[q] = 1;
      e.preventDefault();
    }
  });
  addEventListener("keyup", (e) => {
    let q = { ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right" }[
      e.key
    ];
    if (q) k[q] = 0;
  });
  document.querySelectorAll("[data-k]").forEach((b) => {
    let q = b.dataset.k;
    b.onpointerdown = (e) => {
      e.preventDefault();
      k[q] = 1;
    };
    b.onpointerup = b.onpointercancel = (e) => {
      e.preventDefault();
      if (q === "left" || q === "right") k[q] = 0;
    };
  });
  load(0);
  requestAnimationFrame(draw);
  setInterval(step, 1000 / 60);
  window.EQ = {
    stages,
    hit,
    start: () => {
      state = "play";
      load(0);
    },
    step,
    keys: k,
    get: () => ({ state, L, p, enemies, coins }),
  };
})();
