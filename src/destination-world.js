import * as THREE from 'three';
import {sceneKit} from './scene-kit.js';
import {TRIP_DESTINATIONS} from './destinations.js';
export function createDestinationWorld(root,id){
 const d=TRIP_DESTINATIONS[id],kit=sceneKit(root),{box,cyl,ball,sign,target}=kit,lamps=[];
 const urban=['city','port'].includes(d.kind),forest=d.kind==='forest',lake=d.kind==='lake';
 box(0,-.22,0,76,.4,54,urban?'#b7bca8':forest?'#8fa080':'#b2bb94');
 box(0,.015,3,4,.07,39,'#d5cbb1');box(0,.02,10,61,.07,3,'#c7c9b6');box(0,.015,-13,58,.07,3,'#d5cbb1');
 if(['coast','lake','port','city'].includes(d.kind)){box(0,.035,-35,110,.05,25,lake?'#6c9b92':'#729fa5');for(let x=-30;x<=30;x+=5)box(x,.025,-20,.08,.6,.08,'#879384');box(0,.45,-20,62,.06,.06,'#879384');}
 // A station at the north entrance; all streets and hotel doors remain walkable.
 box(0,1.8,25,11,3.6,6,'#d9d7c7',true);box(0,3.7,24,12,.15,8,'#607c72');sign(d.name+'駅 / 東京方面',0,2.7,21.9,7);target('destination-station',d.name+'駅 · 東京へ帰る',0,1.4,20,3);
 for(const [index,h]of d.hotels.entries()){
  const x=index?18:-18,height=h.tier==='deluxe'?6.8:3.5;
  box(x,height/2,0,14,height,12,index?'#dfd9c7':'#c6cdb8',true);box(x,height+.12,0,14.8,.22,12.8,h.tier==='deluxe'?'#708b87':'#637b64');
  for(const xx of [x-4,x+4])for(let y=1.6;y<height;y+=2.5){box(xx,y,6.07,2.5,1.3,.04,'#87aaa4');for(const dx of [-1.3,1.3])box(xx+dx,y,6.11,.07,1.4,.06,'#eff0da');}
  box(x,1.2,6.09,2.2,2.4,.1,'#58756a');box(x,.05,7,3,.1,2,'#c6b795');sign(h.name,x,2.9,6.16,8);target('destination-hotel-'+h.id,h.name+' · 入口',x,1.4,8,3);
 }
 function shop(x,title,shopId){box(x,-.01,5,6,.1,6,'#b69c78');box(x,1.5,2,6,3,.13,'#e0dbc7',true);for(const xx of [x-3,x+3])box(xx,1.5,5,.13,3,6,'#d5d9c5',true);box(x,3.1,5,6.5,.15,6.8,'#7d9785');sign(title,x,2.4,8.08,5);box(x,.7,3.7,3,1.4,.7,'#ad9676',true);target(shopId,title,x,1.4,5.7,2.8);}
 shop(8,'旅先のカフェ','destination-cafe');shop(-8,'旅の売店','destination-shop');
 for(const x of [-28,28])for(const z of [-12,0,13]){cyl(x,1.3,z,.14,2.6,'#88735b');if(forest){const tree=new THREE.Mesh(new THREE.ConeGeometry(1.5,4.6,9),new THREE.MeshStandardMaterial({color:'#4f765a'}));tree.position.set(x,4,z);root.add(tree);}else{ball(x,3.1,z,1.5,'#7a9466');ball(x+.6,3.4,z,.9,'#92a679');}kit.colliders.push({x,z,w:.4,d:.4});}
 for(const x of [-5,5])for(const z of [-11,12]){cyl(x,1.6,z,.05,3.2,'#647d71');ball(x,3.2,z,.16,'#e5d9aa');const l=new THREE.PointLight('#ffe1ad',0,10,2);l.position.set(x,3,z);root.add(l);lamps.push(l);}
 function gate(x,z,color='#a26049'){for(const xx of [x-2,x+2])cyl(xx,1.9,z,.15,3.8,color);box(x,3.7,z,5.4,.2,.4,color);box(x,3.1,z,4.4,.12,.25,color);}
 function temple(x,z){box(x,.2,z,10,.4,5,'#b6ad91',true);for(const xx of [x-4,x+4])box(xx,1.9,z,.16,3.4,5,'#9a7558');box(x,1.9,z-2.4,8,3.4,.15,'#b59b74',true);for(const side of [-1,1]){const roof=box(x+side*2.8,4,z,6.3,.2,6.5,'#596c5b');roof.rotation.z=side*-.22;}gate(x,z+5);}
 if(d.kind==='coast'){box(0,-.005,-18,62,.06,8,'#d6c59d');temple(-18,-17);sign('海と参道の散歩道',0,2,-15,5);}
 if(lake){for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(10,7+i%3*3,8),new THREE.MeshStandardMaterial({color:i%2?'#718e7b':'#8ba28d'}));m.position.set(-48+i*14,2,-53);root.add(m);}gate(-18,-18);box(19,.9,-16,8,1.8,7,'#c9d9d0',true);box(19,2.5,-16,9,.2,8,'#6c8b82');sign('湖畔ギャラリー',19,3,-12.4,5);}
 if(forest){temple(-18,-17);gate(0,-5);for(let i=0;i<10;i++){const x=-7+(i%2)*14,z=-18+Math.floor(i/2)*4;const tree=new THREE.Mesh(new THREE.ConeGeometry(1.2,6,8),new THREE.MeshStandardMaterial({color:'#52715a'}));tree.position.set(x,3,z);root.add(tree);}box(22,1.5,-18,5,3,.2,'#a9d7d0');for(const x of [19,25])ball(x,1.2,-18,2,'#889384');}
 if(d.kind==='heritage'){temple(-18,-17);gate(0,-5,'#8e7357');box(16,.01,-8,17,.08,12,'#9bab7e');}
 if(d.kind==='city'){
  for(let i=0;i<8;i++){const x=-29+i*8,h=5+i%4*2;box(x,h/2,-28,5,h,6,['#c0beb3','#becbd0','#d6c4ac'][i%3]);for(let y=2;y<h;y+=2)box(x,y,-24.95,3,.7,.04,'#9ec1bb');}
  cyl(-19,5,-16,.5,10,'#a26d56');box(-19,8,-16,5,1.2,5,'#a26d56');box(-19,10.5,-16,.25,4,.25,'#a26d56');sign('川辺の展望塔',-19,2,-12,5);box(15,.8,-16,8,1.6,6,'#b99870',true);sign('にぎわい横丁',15,2,-12.8,5);
 }
 if(d.kind==='port'){
  cyl(-20,4.7,-16,1.1,9.4,'#a96756');for(const y of [2,4,6,8])cyl(-20,y,-16,2,.12,'#d1b2a0');cyl(-20,8.6,-16,2.6,1,'#af7563');
  for(let i=0;i<7;i++){const x=-28+i*9,h=4+i%3*2;box(x,h/2,34,6,h,6,['#b8c7c1','#d0c5ae','#b8cad0'][i%3]);}
  box(14,.35,-30,15,1.1,5,'#e4dfcf');box(14,1.6,-30,9,2.3,4,'#d5dbd2');box(14,3,-30,3,.5,2,'#9eada5');sign('海辺のプロムナード',0,2,-15,5);
 }
 target('destination-photo',d.name+' · 風景を写真に残す',0,1.4,-17,3.2);target('destination-stamp',d.name+' · 旅のスタンプ',-16,1.3,-10.5,3.2);target('destination-rest','旅先のベンチ · 体をほぐす',15,1.1,-10,3);box(15,.45,-11,3,.12,.7,'#b59b74',true);box(15,.85,-11.3,3,.65,.1,'#a68d6a');
 kit.merge();
 const waves=new THREE.Group();root.add(waves);if(['coast','lake','port','city'].includes(d.kind))for(let i=0;i<20;i++){const line=new THREE.Mesh(new THREE.BoxGeometry(2+(i%3),.012,.035),new THREE.MeshBasicMaterial({color:'#d5e8dd',transparent:true,opacity:.55}));line.position.set(-40+i*4,.08,-25-(i%4)*4);waves.add(line);}
 const deer=[];if(d.kind==='heritage')for(let i=0;i<5;i++){const g=new THREE.Group();root.add(g);const m=new THREE.MeshStandardMaterial({color:'#a98c64'});const body=new THREE.Mesh(new THREE.SphereGeometry(.35,10,7),m);body.scale.set(1.3,.8,.65);body.position.y=.65;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.18,10,7),m);head.position.set(.48,.99,0);g.add(head);for(const x of [-.25,.25])for(const z of [-.12,.12]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.06,.5,.06),m);leg.position.set(x,.25,z);g.add(leg);}g.position.set(10+i*2,0,-6-i%2*4);deer.push(g);}
 return {bounds:{minX:-31,maxX:31,minZ:-19.5,maxZ:22},colliders:kit.colliders,interactables:kit.interactables,lamps,update(dt){waves.position.x=Math.sin(performance.now()*.0006)*.45;for(let i=0;i<deer.length;i++){deer[i].position.x=10+i*2+Math.sin(performance.now()*.0002+i)*.5;deer[i].rotation.y=Math.sin(performance.now()*.0003+i)*.2;}}};
}
