(() => {
  "use strict";
  const canvas = document.querySelector("#game"), ctx = canvas.getContext("2d");
  const panel = document.querySelector("#panel"), startBtn = document.querySelector("#start");
  const ui = Object.fromEntries(["away","home","inning","count","bases"].map(id => [id, document.querySelector("#"+id)]));
  let W=0,H=0,DPR=1,last=0,state="title",clock=0,inning=1,home=0,away=0,outs=0,balls=0,strikes=0,bases=[false,false,false];
  let pitch=null,pitchDelay=0.8,message="",messageLife=0,particles=[],ballsInPlay=[],crowd=[],wind=0,high=+localStorage.grandSlamBest||0;
  let aim={x:0,y:0}, keys={}, shake=0, flash=0, pitcherStamina=100, hits=0;
  const rand=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
  function resize(){
    DPR=Math.min(2,devicePixelRatio||1); W=innerWidth; H=innerHeight; canvas.width=W*DPR; canvas.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
    crowd=Array.from({length:Math.max(120,Math.floor(W/5))},(_,i)=>({x:(i+.5)*W/Math.max(120,Math.floor(W/5)),y:rand(H*.1,H*.37),c:["#f4d35e","#ee6c4d","#70c1b3","#e9f1f7","#4464ad"][i%5]}));
  }
  addEventListener("resize",resize); resize();
  function reset(){ inning=1;home=away=outs=balls=strikes=hits=0;bases=[false,false,false];pitch=null;pitchDelay=1;clock=0;wind=rand(-1,1);pitcherStamina=100;particles=[];ballsInPlay=[];state="play";panel.style.display="none";announce("PLAY BALL!",1.3);updateUI(); }
  function updateUI(){ ui.home.textContent=home;ui.away.textContent=away;ui.inning.textContent="BOT "+inning;ui.count.textContent=`${balls}-${strikes} · ${outs} OUT`;ui.bases.textContent=bases.map(v=>v?"◆":"◇").join(" "); }
  function announce(s,t=1){message=s;messageLife=t;}
  function newBatter(){balls=0;strikes=0;pitch=null;pitchDelay=.72;aim.x*=.35;aim.y*=.35;updateUI();}
  const pitchTypes=[
    {name:"FOUR-SEAM",speed:[93,101],breakX:.02,breakY:.01,color:"#f7f7f7",weight:28},
    {name:"SLIDER",speed:[84,91],breakX:.32,breakY:.13,color:"#ffd166",weight:22},
    {name:"CURVEBALL",speed:[76,84],breakX:.12,breakY:.38,color:"#63d2ff",weight:18},
    {name:"CHANGEUP",speed:[78,86],breakX:-.12,breakY:.18,color:"#ff7b7b",weight:20},
    {name:"KNUCKLE",speed:[66,77],breakX:.42,breakY:.18,color:"#b89cff",weight:12}
  ];
  function choosePitch(){let n=rand(0,100),type=pitchTypes[0];for(const p of pitchTypes){n-=p.weight;if(n<=0){type=p;break;}}
    const staminaFactor=.84+.16*pitcherStamina/100, speed=rand(...type.speed)*staminaFactor;
    const wild=lerp(.12,.38,1-pitcherStamina/100), targetX=rand(-.72,.72)+(Math.random()<wild?rand(-.75,.75):0), targetY=rand(-.72,.72)+(Math.random()<wild?rand(-.65,.65):0);
    pitch={type,speed,targetX,targetY,t:0,duration:clamp(1.48-(speed-65)*.012,.72,1.5),x:0,y:0,z:0,swung:false,resolved:false};pitcherStamina=Math.max(28,pitcherStamina-rand(.8,1.7));
  }
  function swing(kind="normal"){
    if(state!=="play"||!pitch||pitch.resolved||pitch.swung)return; pitch.swung=true;
    const timing=1-Math.abs(pitch.t/pitch.duration-.91)/.23;
    const px=pitch.x,py=pitch.y, zoneDist=Math.hypot(aim.x-px,aim.y-py);
    const size=kind==="bunt"?.68:kind==="power"?.34:.48, contact=timing*1.2-zoneDist/(size*1.45)+rand(-.12,.12);
    if(contact<.04){strike("SWING AND A MISS");return;}
    if(contact<.28){ if(Math.random()<.62){foul();return;} outBall("WEAK CONTACT",kind,.2);return; }
    const sweet=clamp(contact,0,1.2), launch=kind==="bunt"?rand(-5,8):kind==="power"?rand(18,42):rand(7,31);
    ballResult(kind,sweet,launch,timing);
  }
  function strike(text){pitch.resolved=true;strikes++;announce(text,.85); if(strikes>=3){outs++;announce("STRIKE THREE!",1.1);afterOut();}else setTimeoutSafe(newBatterPitch,620);updateUI();}
  function foul(){pitch.resolved=true;if(strikes<2)strikes++;announce("FOUL BALL",.7);setTimeoutSafe(newBatterPitch,500);updateUI();spawnBurst(W*.55,H*.73,"#fff",10);}
  function newBatterPitch(){pitch=null;pitchDelay=.5;}
  function ballResult(kind,sweet,launch,timing){pitch.resolved=true;const power=(kind==="power"?1.28:kind==="bunt"?.44:1)*sweet*(.82+Math.max(0,timing)*.2);const distance=95+power*310+wind*25+rand(-20,20);const angle=rand(-.9,.9)+(aim.x-pitch.x)*.75;
    ballsInPlay.push({t:0,distance,launch,angle,x:W*.54,y:H*.77});spawnBurst(W*.54,H*.76,"#f7d34c",18);shake=8;flash=.35;
    if(kind==="bunt"){Math.random()<clamp(.28+sweet*.5,0, .86)?hit("BUNT SINGLE",1):outBall("BUNT FIELDed",kind,sweet);return;}
    if(distance>390&&launch>17&&launch<43){hit("HOME RUN!",4);return;}
    if(distance>315&&launch>10){hit("TRIPLE!",3);return;}
    if(distance>235&&launch>5){hit("DOUBLE!",2);return;}
    if(distance>145&&launch>-3){hit("BASE HIT!",1);return;}
    outBall(launch>34?"SKY-HIGH OUT":"GROUND OUT",kind,sweet);
  }
  function outBall(text){announce(text,1);outs++;afterOut();updateUI();}
  function afterOut(){ if(outs>=3){pitch=null;pitchDelay=99;setTimeoutSafe(endHalf,900);}else setTimeoutSafe(newBatter,700); }
  function hit(text,n){hits++;let runs=0;if(n===4){runs=1+bases.filter(Boolean).length;bases=[false,false,false];}
    else {for(let i=2;i>=0;i--)if(bases[i]){bases[i]=false;if(i+n>=3)runs++;else bases[i+n]=true;}if(n>=4)runs++;else bases[n-1]=true;}
    home+=runs;announce(runs?`${text}  +${runs} RUN${runs>1?"S":""}`:text,1.25);updateUI();setTimeoutSafe(newBatter,820);
  }
  function walk(){let runs=0;if(bases[0]&&bases[1]&&bases[2])runs++;if(bases[1]&&bases[0])bases[2]=true;if(bases[0])bases[1]=true;bases[0]=true;home+=runs;announce(runs?"WALK FORCES IN A RUN":"TAKE YOUR BASE",1);newBatter();}
  function endHalf(){const threat=Math.max(0,inning*.55+rand(-.5,1.5));const scored=Math.random()<.7?Math.floor(threat*Math.random()):Math.ceil(threat);away+=scored;announce(scored?`VISITORS SCORE ${scored}`:"VISITORS GO QUIET",1.8);inning++;outs=0;bases=[false,false,false];pitcherStamina=Math.min(100,pitcherStamina+18);
    if(inning>3){setTimeoutSafe(gameOver,1300);}else setTimeoutSafe(newBatter,1250);updateUI();}
  function gameOver(){state="over";const won=home>away,score=home*1000+hits*125-away*100;high=Math.max(high,score);localStorage.grandSlamBest=high;panel.style.display="grid";panel.querySelector(".kicker").textContent=`FINAL · VIS ${away} / HAL ${home} · BEST ${high}`;panel.querySelector("h1").innerHTML=won?"WALK<span>OFF</span>":home===away?"EXTRA<span>CHAOS</span>":"GAME<span>OVER</span>";panel.querySelector("p").textContent=`${hits} hits, ${home} runs. ${won?"The lights stay on and the crowd goes feral.":"Baseball remains a cruel and deeply stupid masterpiece."}`;startBtn.textContent="PLAY AGAIN";}
  function setTimeoutSafe(fn,ms){setTimeout(()=>{if(state==="play")fn();},ms);}
  function spawnBurst(x,y,c,n){for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-180,180),vy:rand(-250,-40),life:rand(.4,1),c});}
  function inputAim(dx,dy){aim.x=clamp(aim.x+dx,-1,1);aim.y=clamp(aim.y+dy,-1,1);}
  addEventListener("keydown",e=>{keys[e.key]=true;const map={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]};if(map[e.key]){e.preventDefault();inputAim(...map[e.key]);}if(e.key===" "){e.preventDefault();swing("normal");}if(e.key.toLowerCase()==="x")swing("power");if(e.key.toLowerCase()==="b")swing("bunt");if(e.key.toLowerCase()==="p"&&state!=="title"){state=state==="pause"?"play":"pause";panel.style.display=state==="pause"?"grid":"none";if(state==="pause"){panel.querySelector("h1").innerHTML="RAIN<span>DELAY</span>";panel.querySelector("p").textContent="The grounds crew has this. Probably.";startBtn.textContent="RESUME";}}});
  addEventListener("keyup",e=>keys[e.key]=false);
  canvas.addEventListener("pointermove",e=>{if(state!=="play")return;const z=zone();aim.x=clamp((e.clientX-z.x)/z.w*2-1,-1,1);aim.y=clamp((e.clientY-z.y)/z.h*2-1,-1,1);});
  canvas.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse")swing("normal");});
  document.querySelectorAll("[data-aim]").forEach(b=>{let timer;const d={left:[-.13,0],right:[.13,0],up:[0,-.13],down:[0,.13]}[b.dataset.aim];b.onpointerdown=e=>{e.preventDefault();inputAim(...d);timer=setInterval(()=>inputAim(...d),80)};b.onpointerup=b.onpointercancel=()=>clearInterval(timer);});
  document.querySelectorAll("[data-swing]").forEach(b=>b.onpointerdown=e=>{e.preventDefault();swing(b.dataset.swing);});
  startBtn.onclick=()=>state==="pause"?((state="play"),panel.style.display="none"):reset();
  function zone(){const w=Math.min(W*.22,190),h=w*1.28;return{x:W*.5-w/2,y:H*.49,w,h};}
  function update(dt){if(state!=="play")return;clock+=dt;messageLife=Math.max(0,messageLife-dt);shake=Math.max(0,shake-dt*26);flash=Math.max(0,flash-dt*2.5);
    if(keys.ArrowLeft)inputAim(-dt*.7,0);if(keys.ArrowRight)inputAim(dt*.7,0);if(keys.ArrowUp)inputAim(0,-dt*.7);if(keys.ArrowDown)inputAim(0,dt*.7);
    if(!pitch){pitchDelay-=dt;if(pitchDelay<=0)choosePitch();}
    else if(!pitch.resolved){pitch.t+=dt;const q=clamp(pitch.t/pitch.duration,0,1),ease=q*q;const wiggle=pitch.type.name==="KNUCKLE"?Math.sin(q*28)*.16*(q*q):0;pitch.x=lerp(-.08,pitch.targetX,q)+pitch.type.breakX*Math.sin(q*Math.PI)*q+wiggle;pitch.y=lerp(-1.28,pitch.targetY,ease)+pitch.type.breakY*Math.sin(q*Math.PI)*q;pitch.z=q;
      if(q>=1&&!pitch.resolved){pitch.resolved=true;const strikeZone=Math.abs(pitch.targetX)<.82&&Math.abs(pitch.targetY)<.86;if(strikeZone)strike("CALLED STRIKE");else{balls++;announce("BALL",.7);if(balls>=4)walk();else setTimeoutSafe(newBatterPitch,480);updateUI();}}
    }
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);
    for(const b of ballsInPlay)b.t+=dt;ballsInPlay=ballsInPlay.filter(b=>b.t<2.2);
  }
  function draw(){ctx.save();if(shake)ctx.translate(rand(-shake,shake),rand(-shake,shake));drawStadium();drawField();drawPitcher();drawZone();drawBatter();drawBall();drawEffects();ctx.restore();if(flash){ctx.fillStyle=`rgba(255,236,145,${flash*.35})`;ctx.fillRect(0,0,W,H);} }
  function drawStadium(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#071a2b");g.addColorStop(.55,"#174a4e");g.addColorStop(1,"#082216");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#0b1820";ctx.beginPath();ctx.moveTo(0,H*.39);ctx.lineTo(W,H*.39);ctx.lineTo(W,H*.12);ctx.quadraticCurveTo(W/2,H*.02,0,H*.12);ctx.fill();
    for(const f of crowd){ctx.fillStyle=f.c;ctx.globalAlpha=.45+Math.sin(clock*3+f.x)*.2;ctx.fillRect(f.x,f.y,2.5,2.5);}ctx.globalAlpha=1;
    [[W*.08,H*.08],[W*.92,H*.08]].forEach(([x,y])=>{const glow=ctx.createRadialGradient(x,y,0,x,y,W*.18);glow.addColorStop(0,"#fff9dccc");glow.addColorStop(1,"#fff0");ctx.fillStyle=glow;ctx.fillRect(x-W*.18,y-W*.18,W*.36,W*.36);});
    ctx.fillStyle="#102d31";ctx.fillRect(0,H*.36,W,H*.08);ctx.fillStyle="#d9a650";ctx.font=`900 ${Math.max(15,W*.018)}px ui-monospace`;ctx.textAlign="center";ctx.fillText("HAL MEMORIAL BALLPARK · 404 FT",W/2,H*.412);
  }
  function drawField(){ctx.fillStyle="#1f774d";ctx.beginPath();ctx.moveTo(W/2,H*.46);ctx.lineTo(W*.02,H);ctx.lineTo(W*.98,H);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#f5eed5aa";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(W/2,H*.68);ctx.lineTo(W*.13,H);ctx.moveTo(W/2,H*.68);ctx.lineTo(W*.87,H);ctx.stroke();
    ctx.fillStyle="#b67b43";ctx.beginPath();ctx.ellipse(W/2,H*.58,W*.095,H*.045,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(W/2,H*.68);ctx.lineTo(W*.45,H*.75);ctx.lineTo(W/2,H*.82);ctx.lineTo(W*.55,H*.75);ctx.closePath();ctx.fill();
    const diamond=[[W/2,H*.69],[W*.56,H*.76],[W/2,H*.83],[W*.44,H*.76]];ctx.fillStyle="#fff4d6";for(const [x,y] of diamond){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(-5,-5,10,10);ctx.restore();}
  }
  function drawPitcher(){const x=W/2,y=H*.565,s=Math.max(.55,W/1200);ctx.save();ctx.translate(x,y);ctx.fillStyle="#eee";ctx.fillRect(-10*s,-32*s,20*s,32*s);ctx.fillStyle="#152b45";ctx.fillRect(-13*s,-43*s,26*s,13*s);ctx.fillStyle="#d8a071";ctx.beginPath();ctx.arc(0,-49*s,8*s,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#eee";ctx.lineWidth=6*s;ctx.beginPath();ctx.moveTo(-6*s,-26*s);ctx.lineTo(-18*s+Math.sin(clock*5)*4,-5*s);ctx.moveTo(6*s,-26*s);ctx.lineTo(18*s,-7*s);ctx.stroke();ctx.restore();}
  function drawZone(){const z=zone();ctx.strokeStyle="#ffffff55";ctx.lineWidth=2;ctx.strokeRect(z.x,z.y,z.w,z.h);ctx.setLineDash([4,5]);ctx.strokeStyle="#ffffff25";ctx.beginPath();ctx.moveTo(z.x+z.w/3,z.y);ctx.lineTo(z.x+z.w/3,z.y+z.h);ctx.moveTo(z.x+z.w*2/3,z.y);ctx.lineTo(z.x+z.w*2/3,z.y+z.h);ctx.moveTo(z.x,z.y+z.h/3);ctx.lineTo(z.x+z.w,z.y+z.h/3);ctx.moveTo(z.x,z.y+z.h*2/3);ctx.lineTo(z.x+z.w,z.y+z.h*2/3);ctx.stroke();ctx.setLineDash([]);
    const ax=z.x+(aim.x+1)*z.w/2,ay=z.y+(aim.y+1)*z.h/2;ctx.strokeStyle="#f7d34c";ctx.lineWidth=2;ctx.beginPath();ctx.arc(ax,ay,18,0,Math.PI*2);ctx.moveTo(ax-25,ay);ctx.lineTo(ax+25,ay);ctx.moveTo(ax,ay-25);ctx.lineTo(ax,ay+25);ctx.stroke();
  }
  function drawBatter(){const x=W*.68,y=H*.78,s=clamp(W/900,.7,1.45);ctx.save();ctx.translate(x,y);ctx.fillStyle="#182e4a";ctx.fillRect(-22*s,-95*s,43*s,65*s);ctx.fillStyle="#eee";ctx.fillRect(-21*s,-32*s,16*s,38*s);ctx.fillRect(6*s,-32*s,16*s,38*s);ctx.fillStyle="#d79b72";ctx.beginPath();ctx.arc(0,-108*s,18*s,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d7463b";ctx.beginPath();ctx.arc(0,-112*s,20*s,Math.PI,Math.PI*2);ctx.fill();ctx.strokeStyle="#d7a24b";ctx.lineWidth=7*s;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-8*s,-75*s);ctx.lineTo(44*s,-135*s);ctx.stroke();ctx.restore();}
  function drawBall(){if(pitch&&!pitch.resolved){const z=zone(),q=pitch.z,x=z.x+(pitch.x+1)*z.w/2,y=z.y+(pitch.y+1)*z.h/2,r=lerp(2.5,11,q);ctx.fillStyle=pitch.type.color;ctx.shadowColor=pitch.type.color;ctx.shadowBlur=10*q;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;if(q>.5){ctx.fillStyle="#fff";ctx.font="800 10px ui-monospace";ctx.textAlign="center";ctx.fillText(Math.round(pitch.speed)+" MPH",x,y-r-10);}}
    for(const b of ballsInPlay){const q=b.t/2.2,x=W*.54+Math.sin(b.angle)*b.distance*q,y=H*.76-Math.sin(b.launch*Math.PI/180)*H*1.8*Math.sin(Math.min(1,q)*Math.PI);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,Math.max(2,8-q*5),0,Math.PI*2);ctx.fill();}
  }
  function drawEffects(){for(const p of particles){ctx.globalAlpha=clamp(p.life*2,0,1);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,4,4);}ctx.globalAlpha=1;
    if(messageLife>0){ctx.textAlign="center";ctx.font=`900 ${clamp(W*.055,30,72)}px Inter`;ctx.lineWidth=8;ctx.strokeStyle="#06131ddd";ctx.strokeText(message,W/2,H*.31);ctx.fillStyle="#f7d34c";ctx.fillText(message,W/2,H*.31);}
    ctx.fillStyle="#d7e8e9aa";ctx.font="700 10px ui-monospace";ctx.textAlign="left";ctx.fillText(`WIND ${wind<0?"←":"→"} ${Math.abs(wind*14).toFixed(0)} MPH`,14,H-16);ctx.textAlign="right";ctx.fillText(`PITCHER ${Math.round(pitcherStamina)}%`,W-14,H-16);
  }
  function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
})();
