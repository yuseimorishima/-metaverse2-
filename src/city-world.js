import * as THREE from 'three';
import {createLivingCity} from './living-city.js';
import {createWorld} from './world.js';
import {createTownWorld} from './town-world.js';
import {createHousingWorld} from './housing-world.js';
import {sceneKit} from './scene-kit.js';
import {LAYOUT,CITY_BOUNDS} from './geography.js';
export function createCityWorld(root){
 const apartment=new THREE.Group();root.add(apartment);const base=createWorld(apartment,{core:true});
 const terrain=new THREE.Group();root.add(terrain);const kit=sceneKit(terrain),{box,cyl,ball,sign,target}=kit;
 box(-42.5,-.35,-5,165,.3,220,'#9eac84');box(82.5,-.35,28.5,85,.3,153,'#9eac84');
 function road(x,z,w,d){box(x,-.04,z,w,.16,d,'#879087');if(w>d){for(let xx=x-w/2+3;xx<x+w/2;xx+=8)box(xx,.049,z,3,.015,.09,'#e2d9b6');for(const dz of [-d/2-1.3,d/2+1.3])box(x,.01,z+dz,w,.1,2.5,'#c7c9b6');}else{for(let zz=z-d/2+3;zz<z+d/2;zz+=8)box(x,.049,zz,.09,.015,3,'#e2d9b6');}}
 road(0,18,228,8);road(0,32,6,28);road(0,44,112,6);road(-88,-12.5,5,61);road(78,-1,5,38);
 for(const[x,z,d]of [[-28,13,14],[28,13,14],[-64,15,10],[-85,-42,5],[0,9,6],[-55,22,10],[14,23,12],[55,23,12]])box(x,-.015,z,3,.05,d,'#d5cbb1');
 for(const x of [-32,0,32])box(x,-.015,49,3,.05,10,'#d5cbb1');
 function store(x,title,width=14){const z=33;box(x,-.03,z,width,.1,14,'#c1ad88');box(x,1.65,z+7,width,3.3,.15,'#e1dbc9',true);for(const dx of [-width/2,width/2])box(x+dx,1.65,z,.15,3.3,14,'#d3cbb5',true);for(const dx of [-width/4-1,width/4+1])box(x+dx,1.65,z-7,width/2-2,3.3,.15,'#c9d1bb',true);box(x,3.35,z,width+.4,.15,14.4,'#708275');sign(title,x,2.5,z-7.12,width*.75,Math.PI);}
 store(14,'こもれびマーケット');for(const x of [10,18]){box(x,.8,34,1.3,1.6,5,'#b09c76',true);for(let z=32;z<37;z++)ball(x,1.7,z,.22,'#c39d69');}target('shop','マーケット · 買い物',14,1.4,24,2.9);target('shop','レジ · 食べものを買う',14,1.4,34,3);
 store(33,'GREEN & FLOWERS',12);for(const x of [29,33,37]){cyl(x,.25,31,.3,.5,'#b68764');ball(x,.9,31,.45,'#7f995f');}target('flowers','花屋 · 花を買う',33,1.4,26,3);
 store(-55,'家具と暮らし  /  KURASHI',18);box(-60,.5,33,2.5,.8,1.4,'#9eaf95',true);box(-60,.85,33.6,2.5,.7,.2,'#95a78e');box(-50,.8,33,2,.12,1.4,'#b59a73',true);cyl(-50,.4,33,.1,.8,'#88775b');target('house-shop','家具店 · 家具を買う',-55,1.4,28,3.5);
 store(55,'住まい相談所');box(55,.6,34,5,1.2,1.2,'#a18c68',true);sign('土地を買って、自分だけの家を。',55,2.3,39.8,8,Math.PI);target('house-agent','住まい相談所 · 土地と家の相談',55,1.4,29,3.5);
 sign('住宅地  ↓',0,2.2,43,3,Math.PI);sign('農園 ←  カフェ ←  図書館 →  水辺 →',0,2.6,21,7,Math.PI);sign('見晴らしの丘 ↑',-88,2.2,14,4);
 box(-28,-.05,34,22,.12,18,'#a7b58a');cyl(-28,.2,34,1.8,.4,'#d0c8ae');cyl(-28,.43,34,1.6,.04,'#a2c4b8');kit.colliders.push({x:-28,z:34,w:3.6,d:3.6});target('fountain','噴水 · 水音を聴く',-28,1.2,34,3.5);for(const x of [-33,-23]){box(x,.5,32,2,.13,.7,'#b69c73',true);box(x,.85,32.3,2,.65,.1,'#b69c73');}target('park','公園のベンチ · 休む',-33,1,32,2.6);
 box(-7,1.2,10,2.5,1.7,.13,'#b49a73',true);sign('街の案内  /  B',-7,1.45,10.1,2.4);target('town-board','街の案内 · 道を調べる',-7,1.4,10.3,2.8);
 function tree(x,z){cyl(x,1.5,z,.14,3,'#7f7056');ball(x,3.2,z,1.25,'#718b60');kit.colliders.push({x,z,w:.35,d:.35});}
 for(const[x,z]of [[9,-8],[12,4],[-13,-7],[-13,4],[-40,29],[-42,40],[43,40],[64,41],[-106,4],[108,3],[-110,-35],[48,-25],[-45,-50],[46,79],[-47,79]])tree(x,z);
 for(let x=-100;x<=100;x+=20){cyl(x,1.8,22,.055,3.6,'#657264');ball(x,3.6,22,.18,'#e5d9aa');}
 target('trip-station','バス停 · 東京駅への旅',5,1.4,20,3);sign('東京駅へのバス',5,2.2,20,3,Math.PI);
 kit.colliders.push({x:79,z:-84,w:80,d:52});kit.merge();
 const parts=[];for(const[id,a]of Object.entries(LAYOUT)){const group=new THREE.Group();root.add(group);const part=createTownWorld(group,id);group.position.set(a.x,0,a.z);group.updateMatrixWorld(true);for(const c of part.colliders){c.x+=a.x;c.z+=a.z;}part.interactables=part.interactables.filter(o=>o.id!=='town-home');for(const o of part.interactables)o.position.add(new THREE.Vector3(a.x,0,a.z));for(const l of part.lamps)l.userData.indoor=true;parts.push(part);}
 const staticColliders=[...base.colliders,...kit.colliders,...parts.flatMap(p=>p.colliders)],staticTargets=[...base.interactables,...kit.interactables,...parts.flatMap(p=>p.interactables)];
 const housing=createHousingWorld(root),living=createLivingCity(root);
 return {bounds:CITY_BOUNDS,get lamps(){return [...base.lamps,...parts.flatMap(p=>p.lamps),...housing.lamps,...living.lamps];},get colliders(){return [...staticColliders,...housing.colliders,...living.staticColliders,...living.colliders()];},get interactables(){return [...staticTargets,...housing.interactables,...living.targets];},refreshHousing:s=>housing.update(s),update(dt,moving,s,camera){living.update(dt,s,camera);for(const p of parts)p.update(dt,moving,s);return housing.update(s);}};
}
