import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {surface,surfaceUV} from './surface.js';
import {plotStage} from './town.js';
export function createTownWorld(root,region){
 const colliders=[],interactables=[],lamps=[],animated=[],materials=new Map();
 const mat=(c,extra={})=>{const key=c+JSON.stringify(extra);if(!materials.has(key))materials.set(key,surface(c,extra));return materials.get(key);};
 function box(x,y,z,w,h,d,c,solid=false,round=false,parent=root){const mesh=new THREE.Mesh(round?new RoundedBoxGeometry(w,h,d,2,Math.min(w,h,d)*.14):new THREE.BoxGeometry(w,h,d),typeof c==='string'?mat(c):c);surfaceUV(mesh.geometry,mesh.material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);if(solid)colliders.push({x,z,w,d});return mesh;}
 function cyl(x,y,z,r,h,c,top=r,parent=root){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,r,h,16),mat(c));mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
 function ball(x,y,z,r,c,scale=[1,1,1],parent=root){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat(c));mesh.position.set(x,y,z);mesh.scale.set(...scale);mesh.castShadow=true;parent.add(mesh);return mesh;}
 function sign(t,x,y,z,w=3,rot=0,bg='#455e4c',fg='#f6f0df'){const c=document.createElement('canvas');c.width=1024;c.height=200;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,200);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 48px sans-serif';ctx.fillText(t,512,100,980);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,w*200/1024),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=rot;root.add(mesh);return mesh;}
 const target=(id,label,x,y,z,range=2.6)=>interactables.push({id,label,position:new THREE.Vector3(x,y,z),range});
 function lamp(x,z){box(x,2.95,z,.7,.42,.7,'#d5c5a4',false,true);const l=new THREE.PointLight('#ffe3b5',8,11,2);l.position.set(x,2.6,z);root.add(l);lamps.push(l);}
 function tree(x,z,size=1){cyl(x,1.7*size,z,.16*size,3.4*size,'#75634b',.09);ball(x,3.7*size,z,1.55*size,'#688257',[1,1.1,1]);ball(x+.6,3.4*size,z,1.15*size,'#889b6a');colliders.push({x,z,w:.45,d:.45});}
 function chair(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;root.add(g);box(0,.5,0,.65,.13,.65,'#b89a70',false,true,g);box(0,.9,-.29,.65,.7,.08,'#b89a70',false,true,g);for(const a of [-.23,.23])for(const b of [-.23,.23])box(a,.23,b,.06,.46,.06,'#6d5c45',false,false,g);colliders.push({x,z,w:.65,d:.65});}
 function bench(x,z){box(x,.5,z,2.6,.14,.75,'#b29970',true,true);box(x,.85,z-.33,2.6,.65,.1,'#b29970');for(const a of [-.9,.9])box(x+a,.23,z,.09,.46,.5,'#586251');}
 function person(id,label,x,z,shirt){const g=new THREE.Group();g.position.set(x,0,z);root.add(g);box(0,.95,0,.48,.65,.29,shirt,false,true,g);ball(0,1.5,0,.23,'#d6b397',[.82,1,.85],g);ball(0,1.64,-.03,.23,'#4c4135',[.85,.52,.9],g);for(const a of [-.13,.13])box(a,.35,0,.17,.65,.2,'#526052',false,true,g);for(const a of [-.34,.34])box(a,.97,0,.15,.58,.19,shirt,false,true,g);for(const a of [-.075,.075])ball(a,1.51,.185,.023,'#423d32',[1,1,.6],g);sign(label,x,2.15,z,2.3);target('town-talk-'+id,label+' · 話す',x,1.45,z+.2,2.8);colliders.push({x,z,w:.65,d:.5});animated.push({object:g,kind:'person'});}
 function exit(x=0,z=8){sign('木漏れ日の街へ',x,2.2,z+.5,3,Math.PI);target('town-home','入口 · 木漏れ日の街へ戻る',x,1.4,z,2.6);}
 function interior(w=18,d=20){box(0,-.12,0,w,.24,d,'#b79d78');box(0,3.3,0,w,.12,d,'#e2ddcc');box(0,1.65,-d/2,w,3.3,.15,'#ded9c8',true);for(const x of [-w/2,w/2]){box(x,.4,0,.14,.8,d,'#ccbea3',true);for(let z=-d/2;z<=d/2;z+=3)box(x,1.65,z,.13,3.3,.13,'#927b58',true);}for(let x=-w/2+.5;x<w/2;x+=.5)box(x,.015,0,.015,.008,d,'#9b8666');for(const x of [-w/2+2,w/2-2])tree(x*1.7,-1,1.3);}
 let bounds={minX:-8.6,maxX:8.6,minZ:-9.5,maxZ:9};
 if(region==='cafe'){
  interior();sign('MORI  /  COFFEE',0,2.6,-9.88,5);box(0,.6,-4.3,5,1.2,1.3,'#9d805a',true,true);box(0,1.24,-4.3,5.2,.1,1.5,'#d1b78a');
  box(-1.65,1.5,-4.5,.65,.45,.65,'#526059');cyl(-1.65,1.8,-4.5,.18,.15,'#656a5d');for(const x of [-.8,0,.8])cyl(x,1.42,-4.25,.11,.24,'#ece4cf');
  person('master','マスター 葵',0,-5.6,'#6d8a6d');target('town-cafe-service','カウンター · カフェで働く・野菜を届ける',0,1.3,-3.5,2.7);
  sign('TODAY’S SPECIAL  /  ひと息のコーヒー',-4.5,2,-7,4);target('town-order','メニュー · コーヒーを注文',-4.5,1.5,-6.5,2.8);
  for(const x of [-5.6,5.6])for(const z of [-2,4]){cyl(x,.76,z,.85,.12,'#c3a677');cyl(x,.35,z,.08,.7,'#6e6958');chair(x,z+1.2,0);chair(x,z-1.2,Math.PI);cyl(x,.88,z,.09,.18,'#ece5d0');}
  box(0,.02,3,4,.02,5,'#d0c8ac');for(const x of [-4,0,4])lamp(x,0);exit();
 }
 else if(region==='library'){
  interior(22,24);bounds={minX:-10.5,maxX:10.5,minZ:-11.5,maxZ:10.5};sign('こもれび図書館',0,2.6,-11.87,6);
  const colors=['#77866c','#af9872','#78948a','#9b857a','#d2c4a1'];
  for(const x of [-8.5,-5,5,8.5])for(const z of [-6,0]){box(x,1.15,z,2.2,2.3,.65,'#aa8e65',true);for(const y of [.35,1,1.65,2.25]){box(x,y,z,2.3,.08,.75,'#c6ac80');for(let i=0;i<11;i++)box(x-.95+i*.18,y+.25,z+.1,.12,.4,.35,colors[(i+Math.round(x+10))%5]);}}
  box(0,.6,-8.5,4,1.2,1.1,'#b7986f',true);person('librarian','司書 文',0,-9.7,'#9a8f71');target('town-library-job','受付 · 本の整理を手伝う',0,1.4,-7.8,2.6);
  box(0,.75,0,4,.12,2,'#ccb38a',true);for(const x of [-1.1,1.1]){chair(x,1.6);chair(x,-1.6,Math.PI);}box(0,.84,0,.6,.06,.8,'#7d9576');target('town-read','本 · ゆっくり読書する',0,1,1,2.7);for(const x of [-5,0,5])lamp(x,4);exit(0,9.5);
 }
 else if(region==='garden'){
  box(0,-.2,0,60,.4,60,'#9eac7d');bounds={minX:-17,maxX:17,minZ:-15,maxZ:15};box(0,.01,0,3,.04,30,'#d3c8aa');box(0,.015,3,33,.04,2,'#d3c8aa');
  for(const x of [-7,7])for(const z of [-6,0,7]){box(x,.13,z,7,.28,4,'#947955',true);box(x,.29,z,6.6,.05,3.6,'#716244');for(const dx of [-3.5,3.5])box(x+dx,.25,z,.13,.4,4.1,'#b6a17a');}
  const crops=new THREE.Group();root.add(crops);for(let i=0;i<12;i++){const x=-9.5+(i%4)*1.65,z=-1+(Math.floor(i/4))*.9;cyl(x,.65,z,.035,.9,'#708057',.035,crops);ball(x,.9,z,.3,'#739459',[1.3,.6,1],crops);ball(x+.12,.65,z,.13,'#c98158',[1,1,1],crops);}animated.push({object:crops,kind:'crop'});
  for(const x of [-7,7])for(const z of [-6,7])for(let i=0;i<4;i++)ball(x-2+i*1.3,.6,z,.4,'#6d8f58');
  target('town-plot','自分の畑 · 種まき・水やり・収穫',-3.3,1,0,3);
  box(10,1.6,-11,6,3.2,4,'#d3c5a5',true);box(10,3.3,-11,6.5,.2,4.5,'#687964');person('gardener','農園係 実',3.5,5,'#7c9070');target('town-seeds','小屋 · 野菜の種を買う',7,1.4,-8.5,3);
  cyl(-2,.8,7,.15,1.5,'#7d8a7b');target('town-water','水道 · 水を飲む',-2,1.2,7,2.4);sign('陽だまり市民農園',0,2.5,10,5);for(const [x,z]of[[-15,-10],[-15,9],[16,8],[1,-14]])tree(x,z,1.3);exit(0,14);
 }
 else if(region==='waterfront'){
  box(0,-.3,9,75,.6,34,'#a4ad89');box(0,-.7,-24,150,.2,40,'#689d9c');bounds={minX:-27,maxX:27,minZ:-16,maxZ:22};
  box(0,.02,4,60,.12,3,'#d2cab4');box(0,.03,-6,4,.2,23,'#ac936d');
  for(let z=-16;z<5;z+=.5)box(0,.14,z,3.98,.025,.025,'#806d53');for(const x of [-2.15,2.15]){box(x,.8,-6,.07,.07,23,'#8f8068');for(let z=-16;z<6;z+=2)box(x,.4,z,.08,.8,.08,'#8f8068');colliders.push({x,z:-6,w:.1,d:23});}
  for(const x of [-17,17])colliders.push({x,z:-9,w:30,d:18});
  const water=new THREE.Group();root.add(water);for(let i=0;i<35;i++)box(-45+(i*13%90),-.57,-8-(i*7%28),2,.01,.035,'#b8d6cb',false,false,water);animated.push({object:water,kind:'water'});
  target('town-fish','桟橋 · 釣りをする',0,1.1,-13,3);sign('FISHING PIER',0,2,-10.8,3);
  box(-12,1.7,9,6,3.4,5,'#d4ccb5',true);box(-12,3.5,9,6.4,.2,5.5,'#78928b');sign('水辺の売店',-12,2.6,6.42,4,Math.PI);person('fisher','売店の澪',-10,4.7,'#7d9a9c');target('town-tackle','売店 · 釣り竿・魚の買い取り',-13,1.4,5.5,3);
  for(const x of [-20,9,18]){bench(x,3);tree(x,13,1.2);}target('town-water-rest','水辺のベンチ · のんびりする',9,1,3,2.7);for(let i=0;i<4;i++)box(35+i*4,-.4,-30+i*2,2.5,.5,1.4,'#e8e4d1',false,true);exit(0,20);
 }
 else if(region==='hill'){
  box(0,-.2,0,70,.4,60,'#98a67c');bounds={minX:-20,maxX:20,minZ:-18,maxZ:17};box(0,.03,2,4,.08,31,'#c8bfa3');box(0,.06,-7,18,.15,12,'#b5a17b');
  for(const x of [-9,9]){box(x,.9,-7,.1,.12,12,'#7f7559');for(let z=-13;z<=-1;z+=2)box(x,.5,z,.1,1,.1,'#7f7559');}box(0,1,-13,18,.1,.12,'#7f7559');
  bench(-4,-6);bench(4,-6);box(0,1,-11,.1,1.8,.1,'#6a7568');cyl(0,1.65,-11,.18,.6,'#5b7068');target('town-photo','展望台 · 街の風景を写真に残す',0,1.5,-10.5,3);sign('見晴らしの丘',0,2.5,10,5);
  for(let i=0;i<26;i++){const x=-32+i*2.5,z=-32-(i%5)*3,h=2+i%4*1.2;box(x,h/2-1,z,1.7,h,2,['#d2c7ac','#b4c0ad','#c0b49b'][i%3]);box(x,h-1,z,2,.15,2.3,'#6c7e72');}
  for(const [x,z]of[[-15,0],[-16,12],[15,1],[17,13]])tree(x,z,1.4);for(let i=0;i<30;i++){const x=-18+(i*13%36),z=1+(i*7%15);if(Math.abs(x)>3)ball(x,.2,z,.14,['#d6c391','#c7a8a0','#e1dfbd'][i%3]);}exit(0,15);
 }
 // Static batches and animated characters stay separate.
 root.updateMatrixWorld(true);const batches=new Map(),originals=[];
 root.traverse(o=>{if(!o.isMesh)return;let p=o;while(p&&p!==root){if(animated.some(a=>a.object===p))return;p=p.parent;}if(!batches.has(o.material))batches.set(o.material,[]);const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();batches.get(o.material).push(geometry.applyMatrix4(o.matrixWorld));originals.push(o);});
 for(const[material,geometries]of batches){const mesh=new THREE.Mesh(mergeGeometries(geometries),material);mesh.castShadow=!material.transparent;mesh.receiveShadow=true;root.add(mesh);for(const g of geometries)g.dispose();}for(const o of originals){o.removeFromParent();o.geometry.dispose();}
 return {colliders,interactables,lamps,bounds,update(dt,moving,s){for(const a of animated){if(a.kind==='person')a.object.rotation.y=Math.sin(performance.now()*.0003)*.06;if(a.kind==='water')a.object.position.x=Math.sin(performance.now()*.0004)*.8;if(a.kind==='crop'&&s){const stage=plotStage(s);a.object.visible=stage!=='empty';a.object.scale.y=stage==='ripe'?1:stage==='growing'?.65:.25;}}}};
}
