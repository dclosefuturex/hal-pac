(() => {
  const s = document.createElement("style");
  s.textContent =
    '.ember{background:linear-gradient(#5ecbe3 0 43%,#73bd69 43% 58%,#395c37 58%)}.ember:before{content:"";position:absolute;left:10%;right:10%;bottom:125px;height:105px;background:repeating-linear-gradient(90deg,#77354a 0 22px,#b75045 22px 44px);clip-path:polygon(0 100%,0 40%,8% 40%,8% 0,21% 0,21% 40%,72% 40%,72% 8%,88% 8%,88% 40%,100% 40%,100% 100%)}.emberhero{position:absolute;left:50%;top:145px;width:65px;height:82px;transform:translateX(-50%);background:#e94355;box-shadow:0 -20px #ffbd45,0 18px #26335c;clip-path:polygon(20% 0,80% 0,100% 30%,85% 100%,55% 85%,45% 85%,15% 100%,0 30%)}.ballpark{background:linear-gradient(#081725 0 31%,#163f43 31% 46%,#237046 46%)}.ballpark:before{content:"";position:absolute;left:50%;top:115px;width:230px;height:230px;transform:translateX(-50%) rotate(45deg);background:#b77b42;clip-path:polygon(0 50%,50% 0,100% 50%,50% 100%,50% 100%);box-shadow:0 0 0 13px #268452}.ballpark:after{content:"⚾";position:absolute;left:50%;top:145px;transform:translateX(-50%) rotate(-18deg);font-size:96px;filter:drop-shadow(0 18px 20px #0009)}.serpent{background:radial-gradient(circle at 50% 38%,#126246,#051912 45%,#020708 78%)}.serpent:before{content:"";position:absolute;width:210px;height:210px;left:50%;top:95px;transform:translateX(-50%);border:20px solid #5dffc0;border-radius:50%;box-shadow:0 0 35px #46ffc488,inset 0 0 30px #46ffc455;clip-path:polygon(0 0,100% 0,100% 58%,63% 58%,63% 100%,0 100%)}.serpent:after{content:"◆";position:absolute;left:67%;top:152px;color:#ffe367;font-size:48px;text-shadow:0 0 18px #ffe367}.astryn{background:radial-gradient(circle at 50% 35%,#4d79d8,#182452 28%,#080b20 63%,#03040b)}.astryn:before{content:"";position:absolute;width:220px;height:220px;left:50%;top:100px;transform:translateX(-50%) rotateX(68deg);border:15px solid #72e7ff;border-radius:50%;box-shadow:0 0 38px #72e7ffaa,inset 0 0 30px #b55dff}.astryn:after{content:"✦";position:absolute;left:50%;top:113px;transform:translateX(-50%);font-size:145px;color:#090b16;text-shadow:0 0 32px #ff5ca8}.metro{background:linear-gradient(#58bdf0 0 40%,#f7cb78 40% 49%,#88705b 49%);perspective:400px}.metro:before{content:"";position:absolute;left:50%;top:172px;width:320px;height:300px;transform:translateX(-50%) rotateX(67deg);background:repeating-linear-gradient(90deg,transparent 0 21%,#e8f1ed 22% 23%,transparent 24% 44%);border-left:5px solid #4b3c32;border-right:5px solid #4b3c32;filter:drop-shadow(3px 5px 2px #40302688)}.metrocity{position:absolute;left:12%;right:12%;top:80px;height:170px;background:repeating-linear-gradient(90deg,#e76b4e 0 18px,#3d83b8 19px 37px,#785db5 38px 54px);clip-path:polygon(0 100%,0 35%,8% 35%,8% 12%,17% 12%,17% 44%,27% 44%,27% 0,39% 0,39% 55%,52% 55%,52% 19%,65% 19%,65% 48%,76% 48%,76% 7%,89% 7%,89% 37%,100% 37%,100% 100%)}.metrorunner{position:absolute;left:50%;top:175px;width:54px;height:96px;transform:translateX(-50%) rotate(-8deg);background:#e94837;border-radius:19px;box-shadow:0 -20px 0 -6px #bf744e,0 8px 14px #40291c88;clip-path:polygon(25% 0,77% 0,84% 47%,100% 100%,63% 100%,50% 62%,37% 100%,0 100%,17% 47%)}';
  document.head.appendChild(s);
  const games = document.querySelector(".games");
  games.insertAdjacentHTML(
    "beforeend",
    '<a class="game" href="ember-quest.html"><div class="poster ember"><div class="emberhero"></div></div><div class="info"><div class="num">GAME 004 · 16-BIT PLATFORMER</div><h3>EMBER QUEST</h3><p>Run three kingdoms, uncover hidden paths, hurl living fire, and steal back the sun.</p><span class="play"><b>▶</b> PLAY NOW</span></div></a>',
  );
  games.insertAdjacentHTML(
    "beforeend",
    '<a class="game" href="snowline.html"><div class="poster snowline"><div class="snowpeak"></div><div class="snowrider"></div></div><div class="info"><div class="num">GAME 005 · DOWNHILL ARCADE</div><h3>SNOWLINE</h3><p>Carve gates, launch ridges, throw reckless tricks, and outrun the mountain.</p><span class="play"><b>▶</b> PLAY NOW</span></div></a>',
  );
  games.insertAdjacentHTML(
    "beforeend",
    '<a class="game" href="grand-slam.html"><div class="poster ballpark"></div><div class="info"><div class="num">GAME 006 · BALLPARK SIM</div><h3>GRAND SLAM</h3><p>Read the pitch, work the count, move runners, and own the night under the lights.</p><span class="play"><b>▶</b> PLAY NOW</span></div></a>',
  );
  games.insertAdjacentHTML(
    "beforeend",
    '<a class="game" href="neon-serpent.html"><div class="poster serpent"></div><div class="info"><div class="num">GAME 007 · EVOLVED SNAKE</div><h3>NEON SERPENT</h3><p>Chain energy, bend through portals, steal strange powers, and survive a garden that fights back.</p><span class="play"><b>▶</b> PLAY NOW</span></div></a>',
  );
  games.insertAdjacentHTML(
    "beforeend",
    '<a class="game" href="echoes-of-astryn.html"><div class="poster astryn"></div><div class="info"><div class="num">GAME 008 · CINEMATIC 3D RPG</div><h3>ECHOES OF ASTRYN</h3><p>Cross six impossible realms, recover a stolen history, and decide what a dying world deserves to remember.</p><span class="play"><b>▶</b> PLAY NOW</span></div></a>',
  );
  games.insertAdjacentHTML(
    "beforeend",
    '<a class="game" href="neon-metro.html"><div class="poster metro"><div class="metrocity"></div><div class="metrorunner"></div></div><div class="info"><div class="num">GAME 009 · 3-LANE CITY RUNNER</div><h3>CITY RUSH</h3><p>Vault the barriers, thread colorful trains, stack wild combos, and outrun the city.</p><span class="play"><b>▶</b> PLAY NOW</span></div></a>',
  );
  const count = document.querySelector(".section-head small");
  if (count) count.textContent = "9 GAMES ONLINE";
})();
