import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {surfaceUV} from './surface.js';

// Original first-class interior. All decoration stays outside the central aisle.
export function addPremiumInterior(root,kit){
 const {box,cyl,sign}=kit;
 const grain=document.createElement('canvas');grain.width=grain.height=256;
 const ctx=grain.getContext('2d');ctx.fillStyle='#755238';ctx.fillRect(0,0,256,256);
 for(let i=0;i<160;i++){const y=i*1.6;ctx.strokeStyle=i%3?'#835d3d':'#513a2c';ctx.globalAlpha=.35;ctx.lineWidth=.5+i%3*.2;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(70,y+Math.sin(i)*3,170,y-Math.cos(i)*3,256,y);ctx.stroke();}
 ctx.globalAlpha=1;
 const map=new THREE.CanvasTexture(grain);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
 const walnut=new THREE.MeshPhysicalMaterial({map,color:'#e8d6b3',roughness:.42,clearcoat:.28});walnut.userData.surface='wood';
 const brass=new THREE.MeshStandardMaterial({color:'#c8a76a',metalness:.78,roughness:.29});
 const leather=new THREE.MeshPhysicalMaterial({color:'#e1cfaa',roughness:.65,clearcoat:.12});
 const shell=new THREE.MeshStandardMaterial({color:'#24483f',roughness:.62});
 const stitching=new THREE.MeshStandardMaterial({color:'#c1aa80',roughness:.75});
 const porcelain=new THREE.MeshStandardMaterial({color:'#f6efdf',roughness:.22});
 const glow=new THREE.MeshStandardMaterial({color:'#ffe9b0',emissive:'#ffd891',emissiveIntensity:.7,roughness:.4});
 const screen=new THREE.MeshStandardMaterial({color:'#243e3a',emissive:'#729083',emissiveIntensity:.13,roughness:.25});
 function piece(x,y,z,w,h,d,material,rounded=false,solid=false){
  const geometry=rounded?new RoundedBoxGeometry(w,h,d,3,Math.min(.12,w*.18,h*.25,d*.25)):new THREE.BoxGeometry(w,h,d);
  surfaceUV(geometry,material);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);if(solid)kit.colliders.push({x,z,w,d});return mesh;
 }
 function round(x,y,z,r,h,material){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,18),material);mesh.position.set(x,y,z);root.add(mesh);return mesh;}
 function globe(x,y,z,r,material){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),material);mesh.position.set(x,y,z);root.add(mesh);return mesh;}
 piece(0,.015,0,4.85,.025,23,walnut);
 box(0,.04,0,1.12,.025,23,'#465b53');
 for(const x of [-.58,.58])piece(x,.06,0,.025,.012,23,brass);
 for(let z=-10.5;z<11;z+=1.3){const diamond=piece(0,.06,z,.10,.01,.10,brass);diamond.rotation.y=Math.PI/4;}
 for(const x of [-2.43,2.43]){
  piece(x,.4,0,.08,.8,23,walnut);piece(x,.81,0,.1,.035,23,brass);piece(x,2.65,0,.1,.035,23,brass);
  piece(x,2.85,0,.12,.3,23,walnut);piece(Math.sign(x)*2.30,2.71,0,.09,.035,22,glow);
  for(let z=-10;z<11;z+=2.5){
   for(let fold=0;fold<4;fold++)round(Math.sign(x)*2.34,1.72,z+fold*.07,.047,1.8,shell);
   piece(Math.sign(x)*2.28,1.25,z+.11,.05,.07,.33,brass);
  }
 }
 for(let z=-9.6;z<11;z+=2.4){
  piece(0,2.98,z,4.7,.04,2.18,porcelain);piece(0,2.96,z+1.1,4.75,.045,.10,walnut);
  for(const x of [-1.95,1.95])piece(x,2.94,z,.025,.02,2.1,brass);
 }
 for(const z of [-7.5,-2.5,2.5,7.5]){round(0,2.86,z,.24,.045,brass);round(0,2.75,z,.035,.2,brass);globe(0,2.57,z,.16,glow);round(0,2.43,z,.14,.025,brass);}
 for(const x of [-1.45,1.45])for(const z of [-6.6,-2.8,1,4.8]){
  piece(x,.28,z,1.18,.34,1.45,shell,true);
  piece(x,.55,z,1.06,.28,1.27,leather,true,true);
  piece(x,1.13,z-.48,1.18,1.33,.28,shell,true);
  piece(x,1.12,z-.30,1.02,1.04,.16,leather,true);
  piece(x,1.72,z-.33,.82,.25,.28,porcelain,true);
  for(const dx of [-.59,.59]){piece(x+dx,.81,z,.15,.22,1.34,shell,true);piece(x+dx,.94,z+.03,.09,.035,1.1,walnut);piece(x+dx,.70,z,.018,.035,1.24,brass);}
  for(const dx of [-.30,0,.30])for(const y of [.85,1.16,1.47]){
   globe(x+dx,y,z-.205,.022,stitching);
   for(const tilt of [-1,1]){const seam=piece(x+dx,y,z-.21,.26,.009,.008,stitching);seam.rotation.z=tilt*.62;}
  }
  piece(x,.83,z-.08,.68,.29,.18,leather,true);
  piece(x,.22,z+1.16,.88,.3,.64,shell,true,true);piece(x,.39,z+1.16,.85,.1,.60,leather,true);
  const side=Math.sign(x)*2.25;
  piece(side,.86,z+.05,.30,.10,1.50,walnut,true,true);piece(side,.92,z+.05,.31,.018,1.51,brass);
  round(side,.94,z+.40,.15,.02,porcelain);round(side,1.015,z+.40,.085,.13,porcelain);round(side,1.084,z+.40,.066,.006,new THREE.MeshStandardMaterial({color:'#795a39',roughness:.5}));
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.05,.013,6,12),porcelain);handle.position.set(side+.083,1.02,z+.40);root.add(handle);
  const tablet=piece(side,1.16,z-.37,.32,.39,.035,brass,true);tablet.rotation.x=-.16;
  const display=piece(side,1.17,z-.343,.28,.30,.012,screen);display.rotation.x=-.16;
  piece(side,.948,z-.12,.25,.02,.25,porcelain,true);
 }
 for(const x of [-1.94,1.94]){
  piece(x,.57,9.7,.68,1.14,1.85,walnut,true,true);piece(x,1.17,9.7,.75,.08,1.92,brass,true);
  piece(x,1.83,10.35,.72,1.2,.12,walnut);piece(x,1.64,10.22,.70,.045,.32,brass);
  for(let i=0;i<5;i++)piece(x-.23+i*.11,1.87,10.18,.08,.40,.18,i%2?leather:shell);
  round(x,1.38,9.6,.13,.34,porcelain);round(x,1.68,9.6,.055,.26,brass);globe(x,1.86,9.6,.14,porcelain);
 }
 sign('KOMOREBI  /  PREMIUM SALON',0,2.3,11.48,3.2,Math.PI);
 const lights=[];for(const x of [-1.9,1.9]){const light=new THREE.PointLight('#ffd9a2',8,9,2);light.position.set(x,2.2,8.5);light.userData.indoor=true;root.add(light);lights.push(light);}
 return lights;
}
