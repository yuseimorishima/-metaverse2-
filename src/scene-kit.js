import * as THREE from 'three';
import {surface,surfaceUV} from './surface.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export function sceneKit(root){
 const colliders=[],interactables=[],materials=new Map();
 const material=c=>{if(!materials.has(c))materials.set(c,surface(c));return materials.get(c);};
 function box(x,y,z,w,h,d,c,solid=false,parent=root){const o=new THREE.Mesh((Math.min(w,h,d)>.12&&h<1.3&&w<4&&d<4?new RoundedBoxGeometry(w,h,d,2,.045):new THREE.BoxGeometry(w,h,d)),material(c));surfaceUV(o.geometry,o.material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(solid)colliders.push({x,z,w,d});return o;}
 function cyl(x,y,z,r,h,c,parent=root){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,14),material(c));o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
 function ball(x,y,z,r,c,parent=root){const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),material(c));o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
 function sign(text,x,y,z,w=3,rotation=0){const c=document.createElement('canvas');c.width=1024;c.height=180;const ctx=c.getContext('2d');ctx.fillStyle='#405e4b';ctx.fillRect(0,0,1024,180);ctx.font='500 48px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f4efdb';ctx.fillText(text,512,90,980);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(w,w*180/1024),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));o.position.set(x,y,z);o.rotation.y=rotation;root.add(o);return o;}
 const target=(id,label,x,y,z,range=2.6)=>interactables.push({id,label,position:new THREE.Vector3(x,y,z),range});
 function merge(){root.updateMatrixWorld(true);const groups=new Map(),original=[];root.traverse(o=>{if(!o.isMesh)return;if(!groups.has(o.material))groups.set(o.material,[]);const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();groups.get(o.material).push(g.applyMatrix4(o.matrixWorld));original.push(o);});for(const[m,gs]of groups){const o=new THREE.Mesh(mergeGeometries(gs),m);o.castShadow=true;o.receiveShadow=true;root.add(o);gs.forEach(g=>g.dispose());}for(const o of original){o.removeFromParent();o.geometry.dispose();}}
 return {box,cyl,ball,sign,target,merge,colliders,interactables};
}
export function disposeGroup(root){const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){materials.add(o.material);if(o.material.map)textures.add(o.material.map);}});for(const g of geometries)g.dispose();for(const t of textures)t.dispose();for(const m of materials)m.dispose();root.clear();}
