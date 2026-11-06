import * as THREE from 'three';
import {sceneKit} from './scene-kit.js';
import {roomLayout} from './hotel-layouts.js';
export function createHotelLobby(root,h){
 const l=roomLayout(h.id),k=sceneKit(root),{box,cyl,ball,sign,target}=k,lux=h.tier==='deluxe',urban=['city','urban','nautical','ocean'].includes(l.theme),w=lux?32:h.tier==='basic'?18:24,lamps=[];
 box(0,-.1,0,w,.2,20,urban?'#b6b5aa':'#ae9674');box(0,lux?5:3.5,0,w,.15,20,lux?'#e6dfcf':'#d7d7c8');box(0,1.8,-9.5,w,3.6,.15,urban?'#455d61':'#b6a27d',true);
 for(const x of [-w/2,w/2]){box(x,1.8,0,.15,3.6,20,'#dbd8c9',true);for(let z=-8;z<9;z+=3)box(x-.15,2,z,.12,4,.12,'#9b8664');}
 box(0,.65,-4,6,1.3,1.2,urban?'#596d6b':'#92764f',true);box(0,1.34,-4,6.3,.08,1.4,'#d1b984');sign(h.name,0,2.5,-9.35,9);
 target('hotel-reception','フロント · 宿泊の手続き',0,1.5,-2.9,2.8);
 for(const x of [-w/2+3,w/2-3]){box(x,.45,2,3.6,.7,1.4,urban?'#557783':'#899876',true);box(x,.95,2.6,3.6,1,.15,urban?'#3e5c64':'#718262');box(x,.4,.1,2.8,.12,1.1,'#aa9167',true);cyl(x,.6,.1,.16,.27,'#d9ccb1');cyl(x,.55,-7,.45,1.1,'#b2a181');ball(x,1.8,-7,.8,'#7e9b72');}
 if(lux){for(const x of [-8,8]){cyl(x,2.5,-2,.26,5,'#bfa876');cyl(x,4.85,-2,.5,.15,'#dbc28f');}for(const z of [-3,4]){cyl(0,4.3,z,.05,1.2,'#b8a170');for(const x of [-1.4,0,1.4]){cyl(x,3.8,z,.2,.1,'#d3b878');ball(x,3.6,z,.22,'#e5d9aa');}}box(0,.025,4,4,.04,8,'#a9a18b');}
 if(['lodge','forest','spa'].includes(l.theme)){box(-w/2+1,.9,-3,1.2,1.8,4,'#787a6a',true);box(-w/2+1.7,.65,-3,.05,.6,2,'#d39b5f');}
 if(['machiya','japanese'].includes(l.theme))for(let x=-w/2+1;x<-4;x+=.5)box(x,1.8,-9.25,.10,3.6,.1,'#7d6a4e');
 if(l.theme==='nautical'||l.theme==='ocean')for(const x of [-8,8]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.7,.09,8,24),new THREE.MeshStandardMaterial({color:'#bda774',metalness:.5,roughness:.4}));ring.position.set(x,2,-9.2);root.add(ring);}
 target('hotel-room','客室とお風呂へ',5.5,1.5,-4,2.7);sign('客室 →',5.5,2.4,-5,3);target('hotel-dinner','食事処 · 宿泊のお食事',-5.5,1.4,-4,2.7);sign('お食事処',-5.5,2.4,-5,3);
 target('hotel-exit','玄関 · 街へ出る',0,1.5,8.3,2.6);sign('街へ',0,2.5,9.4,3,Math.PI);
 for(const x of [-5,5]){const light=new THREE.PointLight('#ffe1ad',8,18,2);light.position.set(x,3,1);light.userData.indoor=true;root.add(light);lamps.push(light);}
 k.merge();return {bounds:{minX:-w/2+.5,maxX:w/2-.5,minZ:-8.5,maxZ:9},colliders:k.colliders,interactables:k.interactables,lamps};
}
