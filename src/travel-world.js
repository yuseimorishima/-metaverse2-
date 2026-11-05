import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {HOTEL_NAME} from './travel.js';
export function createTravelWorld(root,region) {
 const colliders=[],interactables=[],lamps=[],dynamic=[];
 const cache=new Map();
 function mat(color,extra={}) {const key=color+JSON.stringify(extra);if(!cache.has(key))cache.set(key,new THREE.MeshStandardMaterial({color,roughness:.8,...extra}));return cache.get(key);}
 function box(x,y,z,w,h,d,color,collision=false,rounded=false,parent=root){const o=new THREE.Mesh(rounded?new RoundedBoxGeometry(w,h,d,2,Math.min(.12,h*.2)):new THREE.BoxGeometry(w,h,d),typeof color==='string'?mat(color):color);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(collision)colliders.push({x,z,w,d});return o;}
 function cylinder(x,y,z,r,h,color,top=r,parent=root){const o=new THREE.Mesh(new THREE.CylinderGeometry(top,r,h,14),mat(color));o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
 function orb(x,y,z,r,color,sx=1,sy=1,sz=1,parent=root){const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat(color));o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o;}
 function sign(text,x,y,z,width=4,rotation=0,bg='#294e44',color='#f4eed9'){const c=document.createElement('canvas');c.width=1024;c.height=180;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`500 ${text.length>22?36:48}px sans-serif`;ctx.fillText(text,512,90,970);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(width,width*180/1024),new THREE.MeshStandardMaterial({map:t,emissive:'#ffffff',emissiveIntensity:.18,side:THREE.DoubleSide}));o.position.set(x,y,z);o.rotation.y=rotation;root.add(o);return o;}
 function interact(id,label,x,y,z,range=2.6){interactables.push({id,label,position:new THREE.Vector3(x,y,z),range});}
 function tree(x,z,size=1){cylinder(x,1.7*size,z,.15*size,3.4*size,'#71604a',.09*size);orb(x,3.6*size,z,1.6*size,'#627f53',1,1.1,1);orb(x+.7*size,3.5*size,z+.3,1.1*size,'#849564');colliders.push({x,z,w:.5,d:.5});}
 function mountain(x,z,w,h,color,parent=root){const o=new THREE.Mesh(new THREE.ConeGeometry(w,h,9),mat(color));o.position.set(x,h/2-1,z);o.rotation.y=x;parent.add(o);return o;}
 function light(x,y,z){const l=new THREE.PointLight('#ffdeb1',14,13,2);l.position.set(x,y,z);root.add(l);lamps.push(l);return l;}
 function bench(x,z,w=2.6){box(x,.44,z,w,.15,.65,'#ad8b5d',true,true);for(const dx of [-w*.35,w*.35])box(x+dx,.2,z,.08,.4,.55,'#47534a');box(x,.84,z-.3,w,.68,.12,'#b89b73',false,true);}
 function ground(w=65,d=65,color='#b8bea5'){box(0,-.2,0,w,.4,d,color);}
 let bounds={minX:-24,maxX:24,minZ:-22,maxZ:22};
 if(region==='tokyo'||region==='kyoto') {
  const tokyo=region==='tokyo';ground(100,110,'#b6b6a7');bounds={minX:-6.2,maxX:5.2,minZ:-16.5,maxZ:16.5};
  box(0,-.04,0,13,.12,35,'#cdcfc9');
  for(let x=-6;x<6;x+=1.5)for(let z=-17;z<17;z+=2)box(x,.028,z,1.48,.018,1.98,'#dedfd7');
  box(4.5,.055,0,.5,.035,34,'#d6bd66');for(let z=-16;z<17;z+=.3)box(4.5,.08,z,.4,.015,.035,'#f0d682');
  for(const x of [7,8.35,12,13.35])box(x,-.05,0,.08,.1,65,'#717d7e');for(let z=-31;z<32;z+=.8){box(7.7,-.1,z,2.4,.12,.14,'#74766a');box(12.7,-.1,z,2.4,.12,.14,'#74766a');}
  for(const x of [-5,2.8])for(const z of [-14,-4,7,16]){box(x,2.6,z,.18,5.2,.22,'#7e8982',true);box(x,5.1,z,8,.2,.35,'#879189');}
  box(-.8,5.4,0,13,.22,37,'#bfc6c0');for(let z=-16;z<18;z+=4){box(0,5.24,z,10,.06,.16,'#f5f1da');box(0,5.13,z,2.3,.045,.12,mat('#fff9da',{emissive:'#fff9da',emissiveIntensity:1}));}
  // Readable departure board and platform wayfinding.
  sign(tokyo?'東京 TOKYO  →  京都 KYOTO':'京都 KYOTO  →  東京 TOKYO',0,3.6,-3.5,6.5);
  sign(tokyo?'東海道新幹線  19番線  京都・新大阪方面':'東海道新幹線  12番線  名古屋・東京方面',0,2.65,-14,8);
  sign('こだま  指定席  6号車  ｜  ゲーム内ダイヤ',0,2.1,-13.99,7,0,'#172c29','#e5d58d');
  box(-4.6,.8,6,1.1,1.6,.65,'#e7e6dd',true,true);box(-4.6,1.13,6.34,.78,.55,.03,'#44766a');sign('きっぷ',-4.6,1.82,6.35,1.2);interact('rail-ticket','券売機 · 新幹線のきっぷを買う',-4.6,1.35,6.4,2.6);
  bench(-3,-7);bench(-3,0);
  // Streamlined train parked alongside the platform.
  box(7.2,1.55,0,3.4,3,30,'#eeeee8',false,true);for(const x of [5.48,8.92]){box(x,1.1,0,.035,.14,27,'#355d83');for(let z=-12;z<13;z+=2.3)box(x,1.95,z,.04,.68,1.45,'#638d9c',false,true);}
  const nose=orb(7.2,1.1,-17,2,'#f1f0e9',.85,.55,2.3);box(7.2,1.72,-15.3,2.5,.36,1.6,'#3b5865',false,true);
  box(5.46,1.4,3, .04,2.45,1.1,'#c6cfcc');sign('6  指定席',5.42,2.6,3,1.4,-Math.PI/2);
  interact('board-train','6号車 · 新幹線に乗る',4.85,1.5,3,2.6);
  if(tokyo){
   // The red-brick Marunouchi-inspired facade is an original scenic backdrop.
   box(-19,4,1,14,8,36,'#a06850');for(let z=-15;z<17;z+=2.4){box(-11.95,3.2,z,.08,1.9,1,'#516e6b');box(-11.9,5.7,z,.1,1.7,.9,'#e2cfb1');}
   box(-19,8.2,1,15,.5,38,'#52656a');const dome=orb(-19,8.5,0,4,'#4b6267',1,.7,1);sign('東京駅',-11.9,5,0,4,Math.PI/2,'#9b624b');
   sign('自宅へ  →',0,2.2,15,3,Math.PI);interact('travel-home','改札 · 自宅へ帰る',0,1.5,14,2.7);
  }else{
   for(let i=0;i<8;i++){box(-14+i*2,4.5,-23,1,9,1,'#899da0');box(-7,4.5+i*.25,-25,24,.12,.3,'#b1bfbc');}
   sign('JR 嵯峨野線  →  嵯峨嵐山',-3.5,2.5,12,4,Math.PI);box(-3.5,.9,12,2,1.8,.5,'#607b65',true);interact('local-train','嵯峨野線 · 嵯峨嵐山へ向かう',-3.5,1.5,12.4,2.8);
  }
 }
 else if(region==='train') {
  bounds={minX:-1.7,maxX:1.7,minZ:-10.8,maxZ:10.8};ground(220,230,'#92a77b');
  box(0,-.02,0,4,.12,24,'#a3a59b');box(0,.055,0,.9,.015,22,'#62737b');box(0,2.95,0,4,.15,24,'#ecebe1');
  for(const x of [-1.95,1.95]){box(x,.65,0,.12,1.25,24,'#e5e6df',true);box(x,2.55,0,.12,.6,24,'#dfdfd6');for(let z=-11;z<12;z+=2.3)box(x,1.75,z,.12,1.7,.15,'#dadcd8');box(x,2.3,0,.3,.08,23,'#bdc3bc');box(x,2.56,0,.7,.08,23,'#bdc7c5');}
  for(const x of [-1.45,-.9,.6,1.12,1.64])for(let z=-8;z<=8;z+=1.6){
   box(x,.52,z,.45,.22,.85,'#59758b',true,true);box(x,1.06,z-.39,.45,1.05,.24,'#52748e',false,true);box(x,1.54,z-.39,.38,.28,.29,'#d5dcd8',false,true);
   for(const a of [-.24,.24])box(x+a,.82,z,.045,.08,.9,'#c4c6ba',false,true);box(x,.24,z,.18,.5,.4,'#555f64');box(x,1.03,z-.54,.35,.42,.04,'#c1c8c2');
  }
  for(const z of [-11.6,11.6]){box(0,1.45,z,4,2.9,.12,'#e7e7df',true);box(0,1.3,z-.08,1.25,2.4,.035,'#a5b7b7');}
  sign('東海道新幹線  ｜  到着駅は旅程で確認',0,2.4,-11.48,2.8,0,'#1f3534','#cbdcb7');interact('train-exit','デッキ · 到着後に降りる',0,1.4,-10.3,2.2);
  interact('train-seat','指定席 · 車窓を眺めて到着まで過ごす',1.05,1.25,6.7,2.1);interact('train-bento','車内サービス · 駅弁を食べる',-1.05,1.3,4.7,2.1);
  for(const x of [-.7,.7])box(x,2.83,0,.12,.04,21,mat('#fff9df',{emissive:'#fff5d9',emissiveIntensity:.5}));light(0,2.5,-6);light(0,2.5,6);
  // Passing scenery animates only while the journey is moving.
  const passing=new THREE.Group();root.add(passing);
  for(let i=0;i<18;i++){const x=i%2?15:-15,z=-60+i*7;box(x,.35,z,17,.6,4,i%3?'#9ca66c':'#b5b677',false,false,passing);box(x+(i%3)*3,2,z,2.4,4,2,'#d5d1b9',false,false,passing);box(x+(i%3)*3,4.15,z,2.7,.3,2.3,'#667775',false,false,passing);}
  for(let i=0;i<8;i++){const x=i%2?28:-28,z=-70+i*22;mountain(x,z,15,6+i%3*3,'#7f9681',passing);}
  const fuji=mountain(-52,-27,21,19,'#9aaeb0');const snow=new THREE.Mesh(new THREE.ConeGeometry(5.6,5.1,16),mat('#f1f1e7'));snow.position.set(-52,15.45,-27);root.add(snow);
  dynamic.push({object:passing,kind:'scenery'});
 }
 else if(region==='arashiyama') {
  box(0,-.2,15,100,.4,34,'#a2ad84');box(0,-.2,-27,100,.4,34,'#a2ad84');box(0,-.85,0,100,.1,90,'#879b80');bounds={minX:-23,maxX:23,minZ:-19,maxZ:20};
  box(0,-.3,-6,85,.12,8,mat('#76a6a6',{roughness:.22,metalness:.1}));
  for(let i=0;i<22;i++)box(-42+i*4,-.225,-6+(i%5-2)*.8,2.2,.015,.035,'#c1d9cf');
  for(const x of [-18,18])colliders.push({x,z:-6,w:32,d:8});
  box(0,.01,-5,4,.15,20,'#a88d65');for(let z=-14;z<5;z+=.6)box(0,.1,z,3.95,.035,.035,'#8a7559');
  for(const x of [-2.05,2.05]){box(x,.95,-5,.12,.12,20,'#78664d');box(x,.6,-5,.1,.08,20,'#917b58');for(let z=-14;z<=5;z+=1.5)box(x,.5,z,.14,1.1,.14,'#827052');colliders.push({x,z:-5,w:.16,d:20});}
  box(0,-.015,11,5,.06,15,'#d0c9b1');box(-9,-.01,6,18,.06,3,'#d0c9b1');box(10,-.015,12,20,.06,2,'#c6c4a9');
  for(let i=0;i<12;i++)mountain(-60+i*11,-35,16,10+(i%4)*3,['#7c967c','#6f8b73','#8ea58a'][i%3]);
  for(const [x,z] of [[-19,10],[-18,-16],[-10,-18],[10,-17],[19,-15],[20,3],[-6,18]])tree(x,z,1.3);
  // Bamboo grove with jointed stalks; the path remains clear.
  for(let i=0;i<52;i++){const x=8+(i*7%16),z=-1+(i*11%20);if(z>10&&z<14)continue;const h=4.5+i%4*.7;cylinder(x,h/2,z,.075,h,i%2?'#71885b':'#889a6c',.055);for(let y=.65;y<h;y+=.7)cylinder(x,y,z,.087,.035,'#a3b085');for(const dy of [0,.6])orb(x+.35,h-.5+dy,z,.45,'#738b5c',1.4,.22,.7);}
  sign('渡月橋  TOGETSUKYO',0,2,4.4,3.6);interact('river','渡月橋 · 川の風を感じる',0,1.5,1.5,2.8);
  sign('竹の小径  →',6,1.9,12,2.4);interact('bamboo','竹林 · 風の音に耳を澄ます',11,1.6,12,3);
  // Original ryokan exterior: dark timber, plaster, tile roof and noren.
  box(-12,2.5,0,15,5,8,'#d8cfb4',true);for(let x=-19;x<-5;x+=1.3)box(x,2.3,4.03,.1,4.6,.12,'#5d503e');
  for(const y of [1,2.8,4.7])box(-12,y,4.08,15,.12,.15,'#746044');
  box(-12,5.1,0,16,.25,9,'#505c55');for(let x=-20;x<-4;x+=.4)box(x,5.26,0,.12,.1,9.2,'#667268');
  box(-10,1.4,4.1,3,2.8,.1,'#344a40');for(const x of [-10.9,-10.3,-9.7,-9.1])box(x,2.15,4.24,.56,1.3,.035,'#526950');sign('花 伝 抄',-10,2.2,4.3,1.6,0,'#526950');
  sign(HOTEL_NAME,-14.5,2.2,4.21,4);interact('hotel-enter','温泉宿 · ロビーへ入る',-10,1.5,5.2,3);
  for(const x of [-17,-6]){box(x,.8,5, .5,1.6,.5,'#786e55');box(x,1.55,5,.65,.6,.65,mat('#f0deae',{emissive:'#e7c485',emissiveIntensity:.4}));}
  sign('嵯峨嵐山駅  →  京都',6,2.3,16.5,3.4,Math.PI);interact('local-train','嵯峨嵐山駅 · 京都駅へ戻る',6,1.5,16,3);
 }
 else if(region==='hotel') {
  ground(65,65,'#9aab85');bounds={minX:-8.6,maxX:8.6,minZ:-8.5,maxZ:9};
  box(0,-.04,0,18,.14,20,'#af946f');for(let x=-9;x<9;x+=.5)box(x,.04,0,.015,.01,20,'#907c5c');
  box(0,3.55,0,18,.12,20,'#dcd5bf');for(let x=-9;x<=9;x+=3)box(x,3.35,0,.16,.18,20,'#776046');
  box(0,1.7,-9.5,18,3.4,.15,'#d7cfb4',true);for(const x of [-9,9]){box(x,.45,0,.12,.9,20,'#9c8665',true);for(let z=-9;z<=9;z+=3)box(x,1.8,z,.16,3.5,.16,'#66533e',true);}
  box(0,.62,-3.7,5,1.24,1.3,'#86704f',true,true);box(0,1.28,-3.7,5.3,.09,1.5,'#c4af86');sign('花伝抄  /  RECEPTION',0,2.25,-9.38,5);interact('hotel-reception','フロント · 宿泊の手続き',0,1.5,-2.9,2.8);
  for(const x of [-5.5,5.5]){bench(x,2,3);box(x,.4,4,2,.12,1,'#b59a70',true);cylinder(x,.55,4,.18,.18,'#e2ddc3');}
  sign('客室・露天風呂  →',5.5,2.2,-4,3.5);interact('hotel-room','客室と露天風呂へ',5.5,1.5,-4,2.7);
  sign('お食事処',-5.5,2.2,-4,2.4);interact('hotel-dinner','食事処 · 宿泊のお食事',-5.5,1.4,-4,2.7);
  sign('嵐山の街へ',0,2.3,9.5,3,Math.PI);interact('hotel-exit','玄関 · 嵐山の街へ出る',0,1.5,8.3,2.6);
  for(const x of [-5,0,5]){box(x,2.8,1,.8,.6,.8,'#d5c6a0',false,true);light(x,2.4,1);}
  for(const x of [-15,15]){tree(x,-5,1.3);tree(x,7,1);box(x,.04,1,5,.08,8,'#aeb791');orb(x,.5,1,1,'#8c9483',1,.5,.8);}
 }
 else if(region==='room') {
  ground(80,80,'#92a47e');bounds={minX:-7.5,maxX:10,minZ:-8,maxZ:9};
  box(0,-.08,0,16,.2,19,'#aa9571');box(0,3.05,2,16,.15,15,'#d8cfb6');
  for(let x=-6;x<=4;x+=2)for(let z=-3;z<=7;z+=3){box(x,.045,z,1.97,.045,2.97,'#c3bc8d');box(x-.97,.072,z,.035,.012,2.98,'#6b7959');}
  box(-8,1.5,1,.12,3,18,'#d4ccb0',true);box(0,1.5,9.5,16,3,.1,'#d4ccb0',true);
  for(let x=-7.8;x<8;x+=1.3){box(x,1.5,9.4,.045,2.9,.06,'#9d8964');box(x,1.4,-5,.09,2.8,.1,'#846e50');}
  for(const y of [.7,1.5,2.3])box(0,y,9.38,16,.045,.06,'#a18a61');
  // Futon, zabuton, tea service, tokonoma, shoji and a garden-facing veranda.
  for(const x of [-4.5,-1.3]){box(x,.14,2,2.2,.25,3.6,'#f1ead5',true,true);box(x,.32,2.35,2.15,.15,2.6,'#d5d3ba',false,true);box(x,.32,.7,1.1,.2,.55,'#ede8d8',false,true);}
  interact('hotel-sleep','布団 · 翌朝まで眠る',-3,.6,3.5,2.6);
  box(3,.4,2,2.5,.12,1.5,'#9b7b51',true,true);for(const x of [1.5,4.5])box(x,.13,2,.8,.2,.8,'#788369',false,true);
  cylinder(3,.51,2,.23,.08,'#d5c8a2');for(const x of [2.5,3.5])cylinder(x,.57,2,.1,.2,'#d4dbb9');interact('hotel-tea','お茶 · 庭を眺めてひと休み',3,.8,2,2.4);
  box(-6.5,.3,-3,2,.6,1.5,'#8c7858');sign('花鳥風月',-6.5,1.8,-3.65,1.8,0,'#e4dec8','#657155');
  box(0,.015,-6.4,16,.08,3,'#a58b62');for(let z=-7.8;z<-5;z+=.3)box(0,.06,z,16,.02,.025,'#826e4f');
  // A low outdoor cypress bath with water, stones and rising translucent steam.
  box(8,.25,-3,4,.7,5,'#9e8965',false,true);box(8,.64,-3,3.5,.04,4.5,mat('#a3c9bb',{transparent:true,opacity:.8,roughness:.16}));
  box(10.05,.5,-3,.15,.7,5.2,'#b5a076');for(const z of [-4.85,-1.15])box(5.95,.5,z,.15,.7,1.5,'#b5a076');box(5.75,.12,-3,.8,.24,1.3,'#b5a076');box(6.35,.3,-3,.6,.25,1.3,'#b5a076');for(const z of [-5.55,-.45])box(8,.5,z,4.2,.7,.15,'#b5a076');
  interact('hotel-bath','露天風呂 · 湯けむりに包まれる',5.55,1.3,-3,2.8);
  const steam=new THREE.Group();root.add(steam);for(let i=0;i<7;i++){const o=new THREE.Mesh(new THREE.SphereGeometry(.5,10,8),mat('#edf1e6',{transparent:true,opacity:.08,depthWrite:false}));o.position.set(7+(i%3)*.7,.8+i*.2,-4+(i%4)*.6);o.scale.set(1,.65,1);steam.add(o);}dynamic.push({object:steam,kind:'steam'});
  for(const x of [-13,-8,2,14])tree(x,-14,1.2);for(let i=0;i<8;i++)mountain(-50+i*15,-35,15,9+i%3*3,'#7f9478');
  sign('ロビーへ',0,2.1,9.35,2.3,Math.PI);interact('hotel-lobby','客室の入口 · ロビーへ戻る',0,1.4,8,2.5);light(0,2.6,3);light(4,2.4,-2);
 }
 // Merge the static scenery; preserve the animated train view and steam groups.
 root.updateMatrixWorld(true);const batches=new Map(),originals=[];
 root.traverse(o=>{if(!o.isMesh)return;let p=o;while(p&&p!==root){if(dynamic.some(d=>d.object===p))return;p=p.parent;}const key=o.material.uuid;if(!batches.has(key))batches.set(key,{material:o.material,geometries:[]});batches.get(key).geometries.push(o.geometry.clone().applyMatrix4(o.matrixWorld));originals.push(o);});
 for(const {material,geometries} of batches.values()){const geometry=mergeGeometries(geometries);const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=!material.transparent;mesh.receiveShadow=true;root.add(mesh);for(const g of geometries)g.dispose();}
 for(const o of originals){o.removeFromParent();o.geometry.dispose();}
 return {colliders,interactables,lamps,bounds,update(seconds,moving){for(const d of dynamic){if(d.kind==='scenery'&&moving)d.object.position.z=(d.object.position.z+seconds*22)%100;else if(d.kind==='steam'){d.object.position.y=Math.sin(performance.now()*.0005)*.13;d.object.rotation.y=Math.sin(performance.now()*.0002)*.03;}}}};
}
