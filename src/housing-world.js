import * as THREE from 'three';
import {sceneKit,disposeGroup} from './scene-kit.js';
import {LOTS,WALLS,ROOFS,FLOORS,FURNITURE,ensureHousing,footprint} from './housing.js';
export function createHousingWorld(root){
 let lamps=[];let previous='',kit={colliders:[],interactables:[]};const buildings=new THREE.Group();root.add(buildings);
 function update(s){const h=ensureHousing(s),key=JSON.stringify(h.lots);if(previous===key)return false;previous=key;disposeGroup(buildings);lamps=[];kit=sceneKit(buildings);const{box,cyl,ball,sign,target}=kit;
  for(const[id,l]of Object.entries(LOTS)){const p=h.lots[id],x=l.x,z=l.z;
   box(x,-.03,z,24,.12,26,p?'#b0bc91':'#a2b18c');
   for(const dx of [-12,12]){box(x+dx,.6,z,.12,1.2,26,'#a4906e',true);for(let dz=-12;dz<=12;dz+=2)box(x+dx,.6,z+dz,.18,1.2,.18,'#b5a17b');}
   box(x,.6,z+13,24,1.2,.12,'#a4906e',true);for(const dx of [-7,7])box(x+dx,.6,z-13,10,1.2,.12,'#a4906e',true);
   box(x,.025,z-9.5,3,.06,7,'#d7ceb3');box(x+8,1.1,z-14,3,1.6,.15,'#b19b75',true);sign(`${l.name} · ${p?'所有地':`¥${l.price}`}`,x+8,1.35,z-14.1,3,Math.PI);target('house-lot-'+id,l.name+' · 土地・建築・模様替え',x+8,1.4,z-15,3);
   if(!p?.style){sign(p?'家を建てよう':'販売中の土地',x,1.6,z,4,Math.PI);continue;}
   const wall=WALLS[p.wall],roof=ROOFS[p.roof],floor=FLOORS[p.floor];box(x,.02,z,12,.15,10,floor);
   box(x,1.5,z+5,12,3,.16,wall,true);for(const dx of [-6,6]){box(x+dx,.5,z,.16,1,10,wall,true);box(x+dx,2.8,z,.16,.4,10,wall);for(const dz of [-4.9,0,4.9])box(x+dx,1.7,z+dz,.2,2.4,.13,'#8b795c');}
   for(const dx of [-3.6,3.6])box(x+dx,1.5,z-5,4.8,3,.16,wall,true);box(x,2.8,z-5,2.4,.4,.16,wall);for(const dx of [-1.25,1.25])box(x+dx,1.3,z-5,.1,2.6,.25,'#927a56');
   box(x,3.1,z,12.5,.16,10.6,'#e6decb');cyl(x,2.92,z,.25,.15,'#e9dbb3');const light=new THREE.PointLight('#ffe3b0',8,14,2);light.position.set(x,2.7,z);light.userData.indoor=true;buildings.add(light);lamps.push(light);
   if(p.style==='modern'){box(x,3.25,z,12.8,.2,10.8,roof);}else{for(const side of [-1,1]){const r=box(x+side*3.1,3.8,z,6.9,.16,11,roof);r.rotation.z=side*-.22;}if(p.style==='machiya'){for(const dx of [-5,-3,3,5])box(x+dx,1.5,z-5.12,.11,3,.1,'#65523e');}}
   sign('わたしの家',x,2.45,z-5.13,2.1,Math.PI);target('house-manage-'+id,'自宅 · 模様替え',x+1.6,1.4,z-5.2,2.5);
   box(x,.05,z-6,3,.16,1.8,floor);for(const dx of [-8,8]){cyl(x+dx,.2,z+9,.3,.4,'#be8d68');ball(x+dx,.8,z+9,.5,'#829961');}
   for(const f of p.furniture){const g=new THREE.Group();g.position.set(x+f.x,0,z+f.z);g.rotation.y=f.rotation*Math.PI/180;buildings.add(g);const b=(a,y,c,w,hh,d,col)=>box(a,y,c,w,hh,d,col,false,g);const targetPosition=new THREE.Vector3(x+f.x,1,z+f.z);const fp=footprint(f.type,x+f.x,z+f.z,f.rotation);if(FURNITURE[f.type].solid){if(f.type!=='shower')kit.colliders.push(fp);else{const angle=f.rotation*Math.PI/180,c=Math.cos(angle),sn=Math.sin(angle),turned=f.rotation%180!==0;for(const [lx,lz,w,d]of [[0,.55,1.2,.08],[-.55,0,.08,1.1],[.55,0,.08,1.1]])kit.colliders.push({x:x+f.x+lx*c+lz*sn,z:z+f.z-lx*sn+lz*c,w:turned?d:w,d:turned?w:d});}}
    if(f.type==='bed'){b(0,.2,0,2,.4,2.5,'#a98b64');b(0,.48,0,1.95,.2,2.4,'#e8e1c9');b(0,.62,.35,1.95,.12,1.65,'#9eaf96');b(0,.65,-.8,.9,.16,.45,'#f2ebd9');target('house-bed','自分のベッド · 眠る',targetPosition.x,.9,targetPosition.z,2.8);}
    else if(f.type==='sofa'){b(0,.4,0,2.4,.65,1.2,'#a5b295');b(0,.9,.5,2.4,.8,.2,'#9eac91');target('sofa','自分のソファ · 休む',targetPosition.x,.9,targetPosition.z,2.5);}
    else if(f.type==='kitchen'){b(0,.5,0,2.4,1,1,'#d9d9c6');b(0,1.03,0,2.5,.08,1.06,'#b59a72');b(-.6,1.08,0,.6,.02,.6,'#6f8076');target('town-cook','自分のキッチン · 料理する',targetPosition.x,1.2,targetPosition.z,2.6);}
    else if(f.type==='desk'){b(0,.8,0,1.6,.1,.9,'#b49a72');for(const a of [-.65,.65])b(a,.4,0,.08,.8,.7,'#806f55');b(0,1.05,0,.6,.4,.04,'#546f66');target('work','自分の机 · 在宅仕事',targetPosition.x,1.2,targetPosition.z,2.5);}
    else if(f.type==='table'){b(0,.7,0,1.6,.1,1.4,'#bb9f74');for(const a of [-.65,.65])b(a,.35,0,.07,.7,1.1,'#927c59');}
    else if(f.type==='shower'){b(0,.08,0,1.2,.16,1.2,'#d8e0d8');b(0,1.1,.5,1.2,2.2,.08,'#c1d0ca');for(const a of [-.55,.55])b(a,1.1,0,.04,2.2,1.1,'#7b9997');b(0,2.05,.3,.3,.05,.3,'#7b9997');target('deluxe-furniture-shower','自分のシャワー · 体を洗う',targetPosition.x,1.2,targetPosition.z,2.7);}
    else if(f.type==='television'){b(0,.3,0,1.8,.6,.6,'#9b886a');b(0,1.1,0,1.7,.92,.08,'#344a44');b(0,1.1,-.05,1.55,.8,.015,'#799e9e');target('deluxe-furniture-television','テレビ · 映画を観る',targetPosition.x,1.2,targetPosition.z,2.7);}
    else if(f.type==='bookshelf'){b(0,1,0,1.6,2,.5,'#b49a72');for(const y of [.2,.8,1.4]){b(0,y,0,1.65,.07,.55,'#c3ad87');for(let i=0;i<8;i++)b(-.66+i*.18,y+.27,-.06,.13,.46,.35,['#77958b','#bcaa86','#9b8e90'][i%3]);}target('deluxe-furniture-bookshelf','本棚 · 読書する',targetPosition.x,1.2,targetPosition.z,2.7);}
    else if(f.type==='aquarium'){b(0,.4,0,1.2,.8,.6,'#a78f6c');b(0,1.13,0,1.18,.65,.58,'#8fb8b2');for(let i=0;i<4;i++)b(-.4+i*.25,1.08+(i%2)*.16,-.31,.11,.06,.02,i%2?'#d8ba7b':'#e3cf9f');target('deluxe-furniture-aquarium','水槽 · 魚を眺める',targetPosition.x,1.2,targetPosition.z,2.7);}
    else if(f.type==='rug'){b(0,.12,0,3,.025,2.2,'#c9c1a3');}
    else if(f.type==='plant'){cyl(0,.23,0,.27,.46,'#b98667',g);ball(0,.85,0,.38,'#71905e',g);}
    else if(f.type==='lamp'){cyl(0,.9,0,.025,1.8,'#8d805f',g);cyl(0,1.8,0,.28,.35,'#e6d7ad',g);}
   }
  }
  kit.merge();return true;
 }
 return {update,get lamps(){return lamps;},get colliders(){return kit.colliders;},get interactables(){return kit.interactables;}};
}
