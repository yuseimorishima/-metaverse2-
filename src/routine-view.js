import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {DISHES} from './routines.js';
export function createRoutineView(camera){
 const root=new THREE.Group();camera.add(root);let id=null,chunks=[],hand,tool,steam=[],bubbles=[],cup,cookPan,cookPlate,cookSteam=[];
 const materials=new Map();
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.72}));return materials.get(color);};
 function box(parent,x,y,z,w,h,d,color){const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(w,h,d)*.12),mat(color));m.position.set(x,y,z);parent.add(m);return m;}
 function ball(parent,x,y,z,r,color){const m=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),mat(color));m.position.set(x,y,z);parent.add(m);return m;}
 function cylinder(parent,x,y,z,r,h,color){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat(color));m.position.set(x,y,z);parent.add(m);return m;}
 function clear(){const shared=new Set(materials.values());root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&!shared.has(o.material))o.material.dispose();});root.clear();chunks=[];steam=[];bubbles=[];cup=null;cookPan=null;cookPlate=null;cookSteam=[];}
 function build(a){clear();id=a.id;const dish=DISHES[a.id];
  hand=new THREE.Group();root.add(hand);box(hand,.35,-.38,-.55,.085,.09,.27,'#cfae94');for(let i=0;i<4;i++)box(hand,.3+i*.019,-.39,-.67,.016,.04,.075,'#d9bba2');
  tool=new THREE.Group();hand.add(tool);
  if(a.kind==='bath'){
   box(tool,.32,-.35,-.62,.09,.045,.065,'#f1e5cc');
   for(let i=0;i<12;i++){const b=ball(root,(i%4-1.5)*.14,-.35+(i%3)*.035,-.58-Math.floor(i/4)*.05,.025,'#e7f0e5');bubbles.push(b);}
   const vaporMat=new THREE.MeshBasicMaterial({color:'#eff5e9',transparent:true,opacity:.06,depthWrite:false});
   for(let i=0;i<12;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.13,10,7),vaporMat);b.position.set((i%4-1.5)*.28,-.55+(i%3)*.12,-.9-(i%3)*.15);b.scale.set(1,.5,1);root.add(b);steam.push(b);}
   return;
  }
  if(dish.kind==='drink'){
   cup=new THREE.Group();root.add(cup);cylinder(cup,.04,-.39,-.6,.092,.18,'#dfddcb');cylinder(cup,.04,-.293,-.6,.078,.008,'#52685a');
   for(let i=0;i<3;i++)chunks.push(cylinder(cup,.04,-.32+i*.012,-.6,.074,.012,['coffee','cafeCoffee'].includes(a.id)?'#6e5137':'#a0b4a0'));
   const rim=new THREE.Mesh(new THREE.TorusGeometry(.085,.009,8,24),mat('#eeead9'));rim.rotation.x=Math.PI/2;rim.position.set(.04,-.293,-.6);cup.add(rim);return;
  }
  if(a.kind==='cook'){
   box(root,0,-.46,-.7,.76,.035,.42,'#b79a73');
   for(let i=0;i<3;i++){const g=new THREE.Group();root.add(g);for(let j=0;j<3;j++)ball(g,-.24+i*.2+j*.035,-.41,-.68+j*.045,.045,i%2?'#d19664':'#8d9d60');chunks.push(g);}
   cookPan=new THREE.Group();root.add(cookPan);box(cookPan,0,-.435,-.7,.38,.025,.32,'#4f5e57');cylinder(cookPan,0,-.39,-.7,.155,.055,'#67756a');box(cookPan,.23,-.37,-.7,.22,.025,.045,'#746850');for(let i=0;i<7;i++)ball(cookPan,(i%3-1)*.06,-.35,-.76+Math.floor(i/3)*.06,.03,i%2?'#c48d64':'#8a9e66');
   cookPlate=new THREE.Group();root.add(cookPlate);cylinder(cookPlate,0,-.435,-.7,.22,.02,'#e9e5d4');for(let i=0;i<6;i++){const x=(i%3-1)*.075,z=-.75+Math.floor(i/3)*.1;ball(cookPlate,x,-.4,z,.045,'#e6e0ca');ball(cookPlate,x+.025,-.37,z,.026,i%2?'#8a9e66':'#c48d64');}
   const vapor=new THREE.MeshBasicMaterial({color:'#f0f1e5',transparent:true,opacity:.1,depthWrite:false});for(let i=0;i<5;i++){const puff=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),vapor);puff.position.set((i%3-1)*.05,-.3,-.7);root.add(puff);cookSteam.push(puff);}
   box(tool,.2,-.38,-.7,.24,.008,.06,'#a3aaa2');box(tool,.36,-.38,-.7,.12,.025,.04,'#927551');return;
  }
  box(root,0,-.48,-.72,.8,.035,.44,'#a88c64');cylinder(root,0,-.449,-.7,.255,.016,'#e9e5d4');cylinder(root,0,-.437,-.7,.225,.008,'#d6d8c5');
  const n=dish.portions;
  for(let i=0;i<n;i++){const g=new THREE.Group();root.add(g);const angle=i/n*Math.PI*2,x=Math.cos(angle)*.13,z=-.7+Math.sin(angle)*.11;
   if(a.id==='bread') {const loaf=box(g,x,-.39,z,.12,.085,.08,'#c39961');loaf.rotation.y=angle;box(g,x,-.345,z,.08,.006,.012,'#eee0bd');}
   else if(a.id==='apple'){const fruit=ball(g,x,-.39,z,.065,'#b87354');fruit.scale.set(.65,.7,1);box(g,x,-.377,z-.04,.045,.055,.015,'#edddb0');}
   else {for(let j=0;j<5;j++)ball(g,x+(j%3-1)*.025,-.411+(j%2)*.012,z+Math.floor(j/3)*.025,.024,'#eee8d6');ball(g,x+.035,-.397,z+.025,.03,'#879c60');ball(g,x-.025,-.394,z-.025,.022,'#bf8160');if(i%2)box(g,x,-.382,z,.065,.025,.028,'#c2a479');}
   chunks.push(g);
  }
  for(const offset of [-.009,.009]){const stick=box(tool,.22+offset,-.37,-.76,.012,.012,.29,'#b89b70');stick.rotation.y=-.3;}
 }
 function update(s){const mobile=innerWidth<700;root.scale.setScalar(mobile?.7:1);root.position.set(0,mobile?-.08:.18,mobile?-.5:0);const a=s.routines?.active;root.visible=!!a&&!a.paused;if(!a){if(id!==null){clear();id=null;}return;}if(id!==a.id)build(a);
  const chewing=a.phase==='chewing',phase=chewing?1-a.remaining/a.portionSeconds:0,lift=chewing?Math.sin(phase*Math.PI):0;
  hand.position.set(-lift*.12,lift*.13,lift*.14);tool.rotation.x=chewing?-lift*.4:0;
  chunks.forEach((c,i)=>{c.visible=i>=a.done;});
  if(cup)cup.position.set(0,lift*.18,lift*.2);
  if(a.kind==='bath'){
   const washing=a.phase==='washing',rinsing=a.phase==='rinsing',drying=a.phase==='drying';hand.visible=washing||rinsing||drying;
   hand.position.x=washing?Math.sin(a.elapsed*5)*.12:0;hand.position.y=washing?Math.sin(a.elapsed*8)*.03:0;
   for(const[b,i]of bubbles.map((b,i)=>[b,i])){b.visible=washing;b.position.y=-.35+Math.sin(a.elapsed*3+i)*.025;}
   for(const[b,i]of steam.map((b,i)=>[b,i])){b.visible=a.phase==='soaking';b.position.y=-.55+((a.elapsed*.08+i*.09)%1)*.7;}
  }
  if(a.kind==='cook'){tool.visible=a.done===0;hand.visible=a.done!==1;tool.position.y=chewing?Math.sin(a.elapsed*10)*.025:0;chunks.forEach(c=>{c.visible=a.done===0;});cookPan.visible=a.done===1;cookPlate.visible=a.done===2;cookSteam.forEach((p,i)=>{p.visible=a.done===1&&chewing;p.position.y=-.32+((a.elapsed*.18+i*.04)%.3);});}
 }
 return {update};
}
