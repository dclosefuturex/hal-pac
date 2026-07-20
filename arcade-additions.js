(() => {
  const s = document.createElement("style");
  s.textContent =
    '.ember{background:linear-gradient(#5ecbe3 0 43%,#73bd69 43% 58%,#395c37 58%)}.ember:before{content:"";position:absolute;left:10%;right:10%;bottom:125px;height:105px;background:repeating-linear-gradient(90deg,#77354a 0 22px,#b75045 22px 44px);clip-path:polygon(0 100%,0 40%,8% 40%,8% 0,21% 0,21% 40%,72% 40%,72% 8%,88% 8%,88% 40%,100% 40%,100% 100%)}.emberhero{position:absolute;left:50%;top:145px;width:65px;height:82px;transform:translateX(-50%);background:#e94355;box-shadow:0 -20px #ffbd45,0 18px #26335c;clip-path:polygon(20% 0,80% 0,100% 30%,85% 100%,55% 85%,45% 85%,15% 100%,0 30%)}.ballpark{background:linear-gradient(#081725 0 31%,#163f43 31% 46%,#237046 46%)}.ballpark:before{content:"";position:absolute;left:50%;top:115px;width:230px;height:230px;transform:translateX(-50%) rotate(45deg);background:#b77b42;clip-path:polygon(0 50%,50% 0,100% 50%,50% 100%);box-shadow:0 0 0 13px #268452}.ballpark:after{content:"⚾";position:absolute;left:50%;top:145px;transform:translateX(-50%) rotate(-18deg);font-size:96px;filter:drop-shadow(0 18px 20px #0009)}.serpent{background:radial-gradient(circle at 50% 38%,#126246,#051912 45%,#020708 78%)}.serpent:before{content:"";position:absolute;width:210px;height:210px;left:50%;top:95px;transform:translateX(-50%);border:20px solid #5dffc0;border-radius:50%;box-shadow:0 0 35px #46ffc488,inset 0 0 30px #46ffc455;clip-path:polygon(0 0,100% 0,100% 58%,63% 58%,63% 100%,0 100%)}.serpent:after{content:"◆";position:absolute;left:67%;top:152px;color:#ffe367;font-size:48px;text-shadow:0 0 18px #ffe367}';
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
  const count = document.querySelector(".section-head small");
  if (count) count.textContent = "7 GAMES ONLINE";
})();
