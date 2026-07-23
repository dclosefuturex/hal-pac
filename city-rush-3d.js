import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const $ = (id) => document.getElementById(id);
const ui = Object.fromEntries(["score","coins","multi","missionText","missionBar","power","powerTime","curtain","message","summary","finalScore","finalDistance","best","start","pause","mute","countdown","loading","district"].map(id => [id,$(id)]));
const canvas = $("game"), mobile = matchMedia("(pointer:coarse)").matches;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v)), pick = a => a[Math.random()*a.length|0];
const store = { get(k,d=0){try{return JSON.parse(localStorage.getItem("cityRush."+k))??d}catch{return d}}, set(k,v){try{localStorage.setItem("cityRush."+k,JSON.stringify(v))}catch{}} };

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8bd5f4);
scene.fog = new THREE.FogExp2(0xbfe8f5,.009);
const camera = new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,240);
camera.position.set(0,5.8,11.5);
const renderer = new THREE.WebGLRenderer({canvas,antialias:!mobile,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
if(!mobile){const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.22,.38,.89);composer.addPass(bloom)}
composer.addPass(new OutputPass());

scene.add(new THREE.HemisphereLight(0xdff7ff,0x796448,2.25));
const sun=new THREE.DirectionalLight(0xfff0cf,3.3); sun.position.set(-14,25,15); sun.castShadow=true;
sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048); Object.assign(sun.shadow.camera,{left:-18,right:18,top:24,bottom:-8,near:.1,far:70}); scene.add(sun);
const world=new THREE.Group(); scene.add(world);

function canvasTexture(draw,w=512,h=512){
  const c=document.createElement("canvas"); c.width=w;c.height=h; const x=c.getContext("2d"); draw(x,w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}
const facade=canvasTexture((x,w,h)=>{x.fillStyle="#d7c4a6";x.fillRect(0,0,w,h);for(let y=30;y<h;y+=74)for(let q=18;q<w;q+=62){x.fillStyle="#16384c";x.fillRect(q,y,38,45);x.fillStyle="#8bd3e8";x.fillRect(q+4,y+4,14,17);x.fillStyle="#ffdb82";if((q+y)%3)x.fillRect(q+21,y+24,13,15)}x.fillStyle="#9d755f";for(let y=0;y<h;y+=74)x.fillRect(0,y,8,w)},512,512);
const graffiti=canvasTexture((x,w,h)=>{x.fillStyle="#365061";x.fillRect(0,0,w,h);x.font="900 120px sans-serif";x.textAlign="center";x.lineWidth=18;x.strokeStyle="#14202b";x.strokeText("RUSH",w/2,210);x.fillStyle="#ff5c45";x.fillText("RUSH",w/2,210);x.font="900 65px sans-serif";x.fillStyle="#5ff0c6";x.fillText("CITY",w/2,310);for(let i=0;i<50;i++){x.fillStyle=`hsla(${Math.random()*360},80%,60%,.5)`;x.fillRect(Math.random()*w,Math.random()*h,8,8)}});
const asphalt=canvasTexture((x,w,h)=>{x.fillStyle="#45515a";x.fillRect(0,0,w,h);for(let i=0;i<4000;i++){const c=70+Math.random()*35;x.fillStyle=`rgb(${c},${c},${c})`;x.fillRect(Math.random()*w,Math.random()*h,1.5,1.5)}});asphalt.repeat.set(8,36);
const M=(color,opts={})=>new THREE.MeshStandardMaterial({color,roughness:.68,...opts});
const mats={rail:M(0xaebcc1,{roughness:.28,metalness:.82}),wood:M(0x5d3f2c),concrete:M(0xb8b0a3),yellow:M(0xffcf36,{roughness:.35}),red:M(0xe74735),glass:M(0x88d8ee,{roughness:.12,metalness:.15}),graffiti:M(0xffffff,{map:graffiti}),road:M(0xffffff,{map:asphalt})};
function mesh(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;return o}
function box(w,h,d,m,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z)}

const ground=box(34,.25,230,mats.road,0,-.22,-96);world.add(ground);
for(let lane=-1;lane<=1;lane++)for(const side of [-.68,.68])world.add(box(.11,.12,230,mats.rail,lane*2.45+side,.05,-96));
const tieGeo=new THREE.BoxGeometry(8.5,.1,.24),ties=new THREE.InstancedMesh(tieGeo,mats.wood,125),dummy=new THREE.Object3D();
for(let i=0;i<125;i++){dummy.position.set(0,-.02,12-i*1.72);dummy.updateMatrix();ties.setMatrixAt(i,dummy.matrix)}ties.receiveShadow=true;world.add(ties);

const districts=[
  {name:"DOWNTOWN",sky:0x8bd5f4,fog:0xbfe8f5,walls:[0xd46b54,0x3e7da0,0xc99e62]},
  {name:"MARKET MILE",sky:0xffc884,fog:0xf2cda6,walls:[0xe08c45,0x53a071,0xb55252]},
  {name:"RIVER BRIDGE",sky:0x8ccbe8,fog:0xb9deea,walls:[0x3d7792,0x697f8d,0x91a6ad]},
  {name:"OLD STATION",sky:0x9fb1cd,fog:0xc5cedd,walls:[0x8f6551,0x6b7481,0xa77e50]}
]; let districtIndex=-1;
function setDistrict(i,instant=false){i%=districts.length;if(i===districtIndex)return;districtIndex=i;const d=districts[i];ui.district.textContent=d.name;ui.district.classList.remove("flash");void ui.district.offsetWidth;ui.district.classList.add("flash");scene.background.set(d.sky);scene.fog.color.set(d.fog)}

const scenery=[];
function building(x,z,i){
  const d=districts[(Math.floor(-z/190)+districts.length)%districts.length],h=8+(i*7%17),w=5+(i%3)*1.7,g=new THREE.Group();
  const material=M(d.walls[i%3],{map:facade});material.map=facade;facade.repeat.set(Math.max(1,w/4),Math.max(2,h/5));
  g.add(box(w,h,5,material,0,h/2,0));
  g.add(box(w+.25,.35,5.25,M(0x554b46),0,h+.15,0));
  if(i%3===0){const sign=box(3.8,1.1,.12,mats.graffiti,0,3,2.57);g.add(sign)}
  if(i%4===0){const tank=mesh(new THREE.CylinderGeometry(.9,.9,1.2,18),M(0x70828a,{metalness:.5}),0,h+1,0);tank.rotation.z=Math.PI/2;g.add(tank)}
  g.position.set(x,0,z);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});world.add(g);scenery.push(g);
}
function prop(x,z,i){
  const g=new THREE.Group();
  if(i%4===0){g.add(box(1.2,1.6,.7,M(0x2e7c52),0,.8,0));g.add(box(1.3,.16,.8,M(0xf1cc4d),0,1.48,0))}
  else{const trunk=mesh(new THREE.CylinderGeometry(.13,.18,1.3,8),M(0x62432f),0,.65,0),crown=mesh(new THREE.IcosahedronGeometry(.75,2),M(i%2?0x4a9c58:0x38956a),0,1.65,0);g.add(trunk,crown)}
  g.position.set(x,0,z);world.add(g);scenery.push(g);
}
for(let i=0;i<44;i++){const z=5-i*8;building((i%2?1:-1)*(10+(i%4)*2.7),z,i);prop((i%2?1:-1)*(7.2+(i%3)*.5),z-3,i)}

let hero=new THREE.Group(),mixer=null,clips={},action=null,assetReady=false;
scene.add(hero);hero.position.set(0,0,2);
function findClip(words){const all=Object.values(clips);return all.find(c=>words.some(w=>c.name.toLowerCase().includes(w)))||all[0]}
function playAnim(name,fade=.18){if(!mixer)return;const clip=findClip({run:["run","jog"],jump:["jump"],roll:["roll","slide","crouch"],idle:["idle"],stumble:["hit","fall"]}[name]||[name]);if(!clip)return;const next=mixer.clipAction(clip);if(next===action)return;next.reset().fadeIn(fade).play();if(action)action.fadeOut(fade);action=next}
async function loadAssets(){
  const gltfLoader=new GLTFLoader();
  const [character,animationFile]=await Promise.all([
    gltfLoader.loadAsync("assets/city-rush/models/runner.gltf"),
    gltfLoader.loadAsync("assets/city-rush/models/animations.glb")
  ]);
  scene.remove(hero);hero=character.scene;hero.scale.setScalar(1.08);hero.rotation.y=Math.PI;hero.position.set(0,0,2);
  hero.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});
  scene.add(hero);mixer=new THREE.AnimationMixer(hero);animationFile.animations.forEach(c=>clips[c.name]=c);playAnim("idle",0);
  try{
    const materials=await new MTLLoader().setPath("assets/city-rush/models/").loadAsync("train-electric-subway-a.mtl");materials.preload();
    const obj=await new OBJLoader().setMaterials(materials).setPath("assets/city-rush/models/").loadAsync("train-electric-subway-a.obj");
    obj.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});trainTemplate=obj;
  }catch(e){console.warn("Train model fallback",e)}
  assetReady=true;ui.loading.classList.add("hidden");ui.start.disabled=false;ui.start.textContent="START RUN";
}

let trainTemplate=null,actors=[],particles=[];
function fallbackTrain(){const g=new THREE.Group();g.add(box(1.9,3.3,5.8,M(0xe4e2db),0,1.65,0));g.add(box(1.92,.38,5.82,M(0xe04d3b),0,1.2,0));for(const z of [-2,-.65,.7,2])g.add(box(1.55,.72,.04,mats.glass,0,2.35,z));return g}
function train(lane,z){const g=trainTemplate?trainTemplate.clone():fallbackTrain();if(trainTemplate)g.scale.set(1.45,1.95,2.2);g.rotation.y=trainTemplate?Math.PI:0;g.position.set(lane*2.45,0,z);g.userData={type:"train",lane};world.add(g);actors.push(g)}
function barrier(lane,z){const g=new THREE.Group();g.add(box(1.7,1,.32,mats.red,0,.55,0));for(const x of [-.55,0,.55]){const s=box(.16,1.1,.35,mats.yellow,x,.55,.02);s.rotation.z=-.52;g.add(s)}g.position.set(lane*2.45,0,z);g.userData={type:"barrier",lane};world.add(g);actors.push(g)}
function overhead(lane,z){const g=new THREE.Group();g.add(box(1.9,.34,.3,mats.yellow,0,2.05,0));for(const x of [-.82,.82])g.add(box(.14,2,.2,mats.red,x,1,0));g.position.set(lane*2.45,0,z);g.userData={type:"overhead",lane};world.add(g);actors.push(g)}
function coin(lane,z,y=.95){const m=mesh(new THREE.TorusGeometry(.25,.075,10,24),mats.yellow,lane*2.45,y,z);m.userData={type:"coin",lane};world.add(m);actors.push(m)}
function powerup(lane,z,type){const colors={magnet:0xf04f5e,board:0x24b8df,jetpack:0xf28c34,boost:0x8658d6},g=new THREE.Group();g.add(mesh(new THREE.DodecahedronGeometry(.42),M(colors[type],{emissive:colors[type],emissiveIntensity:.35}),0,1.1,0));g.position.set(lane*2.45,0,z);g.userData={type:"power",power:type,lane};world.add(g);actors.push(g)}
function sparks(color=0xffd246){for(let i=0;i<18;i++){const p=mesh(new THREE.SphereGeometry(.035,5,5),M(color,{emissive:color}),hero.position.x,.4+Math.random(),1.6);p.userData={life:.3+Math.random()*.35,v:new THREE.Vector3((Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*4)};scene.add(p);particles.push(p)}}

let state="menu",speed=20,distance=0,score=0,coins=0,multi=1,lane=0,laneX=0,jumpY=0,vy=0,roll=0,spawn=-28,last=performance.now(),muted=store.get("muted",false),power={type:"",time:0},mission={type:"coins",target:25,progress:0},audio,shake=0;
function tone(f=440,d=.13){if(muted)return;audio||=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=f<200?"sawtooth":"triangle";o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.3,audio.currentTime+d);g.gain.setValueAtTime(.065,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+d)}
function spawnSet(){const open=(Math.random()*3|0)-1,z=spawn,pattern=Math.random();for(const l of [-1,0,1])if(l!==open&&Math.random()<.78)(pattern<.34?train:pattern<.68?barrier:overhead)(l,z-Math.random()*2.5);for(let i=0;i<7;i++)coin(open,z-i*2.15,.95+Math.sin(i/6*Math.PI)*1.7);if(Math.random()<.28)powerup(open,z-15,pick(["magnet","board","jetpack","boost"]));spawn-=27+Math.random()*11}
function reset(){
  actors.forEach(a=>world.remove(a));actors=[];particles.forEach(p=>scene.remove(p));particles=[];
  state="playing";speed=20;distance=score=coins=0;multi=1;lane=laneX=jumpY=vy=roll=0;spawn=-28;power={type:"",time:0};mission={type:"coins",target:25,progress:0};
  for(let i=0;i<7;i++)spawnSet();ui.curtain.classList.add("hidden");ui.summary.classList.remove("show");playAnim("run");setDistrict(0,true)
}
function move(d){if(state==="playing"){lane=clamp(lane+d,-1,1);tone(180,.06)}}
function jump(){if(state==="playing"&&jumpY<.04&&roll<=0){vy=11.7;playAnim("jump",.08);tone(280)}}
function duck(){if(state==="playing"){roll=.72;playAnim("roll",.08);tone(155)}}
function activate(type){power={type,time:type==="jetpack"?7:10};if(type==="boost")multi=Math.max(5,multi);sparks({magnet:0xff4560,board:0x33d9ff,jetpack:0xff923a,boost:0x9966ff}[type]);tone(540,.25)}
function die(){
  if(power.type==="board"){power={type:"",time:0};shake=1;sparks(0x38dcff);tone(90,.3);return}
  state="over";playAnim("stumble",.08);shake=1;const best=Math.max(store.get("best"),score|0);store.set("best",best);
  setTimeout(()=>{ui.finalScore.textContent=(score|0).toLocaleString();ui.finalDistance.textContent=`${distance|0}m`;ui.best.textContent=best.toLocaleString();ui.message.textContent="The inspector caught up. The city is still yours to take.";ui.summary.classList.add("show");ui.start.textContent="RUN AGAIN";ui.curtain.classList.remove("hidden")},650)
}
function update(dt){
  if(mixer)mixer.update(dt);
  for(const p of particles){p.userData.life-=dt;p.position.addScaledVector(p.userData.v,dt);p.userData.v.y-=8*dt;p.scale.setScalar(Math.max(0,p.userData.life*2))}
  particles=particles.filter(p=>{if(p.userData.life<=0){scene.remove(p);return false}return true});
  if(state!=="playing")return;
  speed=Math.min(39,20+distance/460);distance+=speed*dt;score+=speed*dt*multi;setDistrict(Math.floor(distance/500));
  for(const s of scenery){s.position.z+=speed*dt*.82;if(s.position.z>24)s.position.z-=352}
  laneX+=(lane*2.45-laneX)*Math.min(1,dt*11);vy-=29*dt;jumpY+=vy*dt;
  if(jumpY<=0){if(vy< -2&&jumpY<0)sparks(0xe7d0a3);jumpY=vy=0;if(!roll)playAnim("run")}
  roll=Math.max(0,roll-dt);if(roll===0&&jumpY===0)playAnim("run");
  if(power.time>0){power.time-=dt;if(power.time<=0){power={type:"",time:0};multi=1}}
  hero.position.set(laneX,jumpY,2);hero.scale.y=roll?.58:1.08;hero.rotation.z=(lane*2.45-laneX)*-.065;
  camera.position.x+=(laneX*.2-camera.position.x)*dt*3;camera.position.y=5.8+jumpY*.12+Math.sin(distance*.035)*.035+(shake?(Math.random()-.5)*shake:0);camera.lookAt(laneX*.11,2,-9);shake=Math.max(0,shake-dt*2.5);
  for(const a of actors){
    a.position.z+=speed*dt;if(["coin","power"].includes(a.userData.type))a.rotation.y+=dt*4;
    if(power.type==="magnet"&&a.userData.type==="coin"&&a.position.z>-8&&a.position.z<16)a.position.x+=(laneX-a.position.x)*dt*8;
    const dz=Math.abs(a.position.z-2),dx=Math.abs(a.position.x-laneX);
    if(dz<1.05&&dx<.82&&!a.userData.dead){
      if(a.userData.type==="coin"){a.userData.dead=true;world.remove(a);coins++;score+=100*multi;mission.progress++;tone(850,.08)}
      else if(a.userData.type==="power"){a.userData.dead=true;world.remove(a);activate(a.userData.power)}
      else{const clear=a.userData.type==="barrier"?jumpY>1.05:a.userData.type==="overhead"?roll>.12:false;a.userData.dead=true;if(!clear)die();else{score+=250*multi;sparks()}}
    }
  }
  actors=actors.filter(a=>!a.userData.dead&&a.position.z<15);while(spawn>-90-distance)spawnSet();
  ui.score.textContent=(score|0).toLocaleString();ui.coins.textContent=coins;ui.multi.textContent=`×${multi}`;ui.missionBar.style.width=`${Math.min(100,mission.progress/mission.target*100)}%`;
  ui.power.classList.toggle("show",power.time>0);if(power.time>0){ui.power.querySelector("span").textContent=power.type.toUpperCase();ui.powerTime.textContent=power.time.toFixed(1)}
}
function loop(now){const dt=Math.min(.04,(now-last)/1000);last=now;update(dt);composer.render();requestAnimationFrame(loop)}
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.75));renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)});
addEventListener("keydown",e=>{if(["ArrowLeft","a"].includes(e.key))move(-1);if(["ArrowRight","d"].includes(e.key))move(1);if(["ArrowUp","w"," "].includes(e.key)){e.preventDefault();jump()}if(["ArrowDown","s"].includes(e.key))duck()});
let touch;canvas.addEventListener("pointerdown",e=>touch={x:e.clientX,y:e.clientY});canvas.addEventListener("pointerup",e=>{if(!touch)return;const x=e.clientX-touch.x,y=e.clientY-touch.y;if(Math.hypot(x,y)>24)(Math.abs(x)>Math.abs(y)?()=>move(x>0?1:-1):()=>y<0?jump():duck())();touch=null});
ui.start.onclick=()=>assetReady&&reset();ui.pause.onclick=()=>{state=state==="playing"?"paused":"playing";ui.pause.textContent=state==="paused"?"▶":"Ⅱ";if(state==="playing")last=performance.now()};ui.mute.onclick=()=>{muted=!muted;store.set("muted",muted);ui.mute.textContent=muted?"×":"♪"};
ui.start.disabled=true;ui.start.textContent="LOADING ASSETS…";setDistrict(0,true);loadAssets().catch(e=>{console.error(e);ui.loading.textContent="Asset load failed — refresh to retry"});requestAnimationFrame(loop);
