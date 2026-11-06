import {addPremiumInterior} from './premium-interior.js';
import * as THREE from 'three';
import {sceneKit} from './scene-kit.js';
import {TRAIN_SERVICES,journeyInfo} from './rail.js';
import {TRIP_DESTINATIONS} from './destinations.js';

export function createRailWorld(root,journey){
 const info=journeyInfo(journey),service=TRAIN_SERVICES[journey.service],kind=TRIP_DESTINATIONS[info.route]?.kind||'forest';
 const kit=sceneKit(root),{box,cyl,ball,sign,target}=kit,lamps=[];
 const panorama=journey.service==='panorama',premium=journey.service==='premium',local=journey.service==='local';
 const wood=premium||panorama,halfWidth=premium?2.46:1.96;
 box(0,-.08,0,premium?5:4,.18,24,premium?'#67503d':wood?'#ac9271':'#a6b4af');
 box(0,.025,0,.88,.025,23,premium?'#78686c':local?'#a1b0a2':'#718597');
 box(0,3.05,0,premium?5:4,.12,24,wood?'#d4c4a7':'#e5e6dd');
 for(const x of [-halfWidth,halfWidth]){
  box(x,.38,0,.1,.75,24,wood?'#b49a76':'#d6ded3',true);
  box(x,2.8,0,.1,.45,24,wood?'#c8b391':'#d7ded7');
  for(let z=-10.5;z<=11;z+=panorama?5:2.5){box(x,1.8,z,.1,2.1,.07,wood?'#9a8566':'#a6b9b4');}
  box(x*.9,2.55,0,.4,.08,21,wood?'#bdab8c':'#b5c2be');
 }
 if(premium){lamps.push(...addPremiumInterior(root,kit));}
 else if(local){
  for(const x of [-1.45,1.45])for(const z of [-7,-1,5]){
   box(x,.49,z,.65,.22,4.4,service.color,true);box(Math.sign(x)*1.79,1.03,z,.12,.95,4.4,'#668a7b');
   for(const dz of [-2.2,2.2]){cyl(Math.sign(x)*1.0,1.7,z+dz,.022,2.5,'#b7c6c0');}
  }
  for(let z=-8;z<9;z+=2){box(0,2.65,z,2.5,.045,.045,'#a5b9ad');for(const x of [-.65,.65]){cyl(x,2.45,z,.012,.4,'#c8d3c9');const ring=new THREE.Mesh(new THREE.TorusGeometry(.07,.012,6,12),new THREE.MeshStandardMaterial({color:'#e3e4d5'}));ring.position.set(x,2.2,z);root.add(ring);}}
 }else{
  const columns=journey.service==='express'?[-1.47,-.82,.82,1.47]:[-1.22,1.22];
  for(const x of columns)for(let z=-8;z<8;z+=2.4){
   const width=journey.service==='express'?.5:.8;
   box(x,.5,z,width,.25,1,service.color,true);box(x,1.08,z-.44,width,1.02,.19,service.color);box(x,1.58,z-.44,width*.78,.22,.22,'#e0dfce');
   for(const dx of [-width/2,width/2])box(x+dx,.78,z,.045,.09,.85,wood?'#b19a76':'#bac8c5');
  }
 }
 if(panorama){
  for(const x of [-1.2,1.2]){box(x,.48,-9.5,.7,.2,1.2,'#b38c5b',true);box(Math.sign(x)*1.75,.75,-9.5,.35,.09,1.5,'#b59b70',true);}
  sign('PANORAMA LOUNGE',0,2.65,-11.4,2.6);
 }else sign(service.name,0,2.6,-11.4,2.6);
 for(const z of [-11.6,11.6]){
  if(panorama&&z<0){box(0,.28,z,4,.56,.08,'#c6c8b5',true);box(0,2.85,z,4,.3,.08,'#c6c8b5');for(const x of [-1.9,1.9])box(x,1.6,z,.2,2.3,.08,'#9eab95');sign('前方の景色を楽しむ展望席',0,2.55,z+.08,2.4);}
  else{box(0,1.5,z,premium?5:4,3,.08,premium?'#614a36':wood?'#c8b68f':'#d7ded5',true);box(0,1.4,z-Math.sign(z)*.06,1.15,2.4,.035,'#9ab4ad');}
 }
 target('train-exit','到着駅のデッキ · 降りる',0,1.4,-10.3,2.2);
 target('train-seat',premium?'プレミアムのソファ席 · ゆったり過ごす':'指定席 · 車窓と列車の時間を楽しむ',premium?1.45:1.05,1.3,premium?4.8:6.7,2.3);
 target('train-bento','車内サービス · 駅弁を食べる',-1.05,1.3,4.7,2.2);
 if(!premium){box(-1.3,.52,9.6,.8,1,1.1,'#8e9e94',true);box(-1.3,1.16,9.6,.6,.28,.7,'#c4baa0');}
 sign(journey.seat==='aisle'?'通路側のお席をご用意':'窓側のお席をご用意',0,2.65,9.4,2.3,Math.PI);
 for(const x of [-.65,.65])box(x,2.96,0,.09,.035,21,'#f2e6bf');
 for(const z of [-5,5]){const l=new THREE.PointLight(wood?'#ffdfaa':'#e5f0df',8,14,2);l.position.set(0,2.65,z);l.userData.indoor=true;root.add(l);lamps.push(l);}
 kit.merge();
 // Wrap scenery beyond both ends of the carriage, without snapping the view.
 const landscape=sceneKit(root);
 landscape.box(0,-.4,0,180,.25,300,kind==='city'?'#b2baa6':'#8eab7e');
 if(['coast','lake','port'].includes(kind))landscape.box(-48,-.19,0,78,.1,300,kind==='lake'?'#7ca69b':'#7ca5b0');
 for(let i=0;i<8;i++){const x=i%2?42:-44,z=-100+i*27;const m=landscape.ball(x,2,z,14,'#839b7d');m.scale.set(1,.5+i%3*.2,1.4);}
 // landscape.merge would also include the carriage, so keep the few large ground meshes separate.
 const tiles=[];
 for(const offset of [-70,0,70]){
  const tile=new THREE.Group();root.add(tile);const outside=sceneKit(tile);
  for(let i=0;i<10;i++){
   const x=i%2?11+i%3*4:-13-i%3*6,z=-35+i*7;
   if(['coast','lake','port'].includes(kind)&&x<0){outside.box(x,.02,z,3,.02,.06,'#c6dfd7');if(i%4===0){outside.box(x,.12,z,2.8,.4,1,'#d7d7c3');outside.box(x,.65,z,.8,.65,.7,'#adbfba');}}else if(kind==='forest'||kind==='heritage'||kind==='lake'){
    outside.cyl(x,1.3,z,.17,2.6,'#89765c');const crown=outside.ball(x,3.3,z,1.7,'#6c8d60');crown.scale.y=kind==='forest'?1.7:1;
   }else{const h=kind==='city'||kind==='port'?3+i%4*2:2.5;outside.box(x,h/2,z,3,h,3,['#cec7b1','#becdc5','#c3b6a4'][i%3]);outside.box(x-Math.sign(x)*1.55,1.7,z,.04,.8,1.5,'#8eb3af');}
   if(i%3===0){outside.cyl(5,2.5,z,.055,5,'#7b8e86');outside.box(0,4.9,z,11,.035,.035,'#7b8e86');}
  }
  outside.merge();tile.position.z=offset;tiles.push(tile);
 }
 return {bounds:{minX:premium?-2.2:-1.7,maxX:premium?2.2:1.7,minZ:-10.8,maxZ:10.8},colliders:kit.colliders,interactables:kit.interactables,lamps,update(dt,moving){if(moving)for(const tile of tiles){tile.position.z+=dt*(local?10:premium?27:18);if(tile.position.z>105)tile.position.z-=210;}return false;}};
}
