import * as THREE from 'three';
import {sceneKit} from './scene-kit.js';
import {roomLayout} from './hotel-layouts.js';
export function createHotelRoom(root,hotel){
 const l=roomLayout(hotel.id),k=sceneKit(root),{box,cyl,ball,sign,target}=k,lamps=[];
 const luxury=hotel.tier==='deluxe',japanese=['japanese','machiya','spa','forest'].includes(l.theme),sea=['coastal','ocean','nautical'].includes(l.theme),city=['urban','city'].includes(l.theme);
 const wood=japanese?'#967956':city?'#75685b':'#ad9875',fabric=l.theme==='city'?'#354c59':sea?'#678e98':l.theme==='forest'?'#58765e':luxury?'#8b6b55':'#9ca78b';
 const back=9-l.d;
 box(0,-.15,(9+back)/2,l.w,.3,l.d,wood);box(0,3.65,(9+back)/2,l.w,.16,l.d,'#e4ddcd');
 for(const x of [-l.w/2,l.w/2])box(x,1.8,(9+back)/2,.15,3.6,l.d,luxury?'#d9d0bd':'#dedccb',true);
 box(0,1.8,9.5,l.w,3.6,.15,'#e3ddcd',true);
 for(let x=-l.w/2;x<l.w/2;x+=2.5){box(x,1.8,back,.1,3.6,.12,wood);box(x,3.25,(back+9)/2,.10,.12,l.d,wood);}
 box(0,.35,back,l.w,.7,.12,wood);box(0,3.35,back,l.w,.5,.12,wood);
 if(japanese)for(let x=-l.w/2+1;x<l.w/2;x+=2)for(let z=back+2;z<7;z+=3){box(x,.035,z,1.96,.045,2.96,'#c8bd94');box(x-.96,.065,z,.03,.015,2.96,'#738166');}
 else for(let x=-l.w/2+1;x<l.w/2;x+=1)box(x,.015,(back+9)/2,.025,.015,l.d,'#8e7b62');
 const [bx,bz]=l.bed;
 for(const dx of [-1.6,1.6]){const x=bx+dx;box(x,.25,bz,2.5,.5,4.2,wood,true);box(x,.58,bz,2.4,.35,4.05,'#f4eddc');box(x,.81,bz+.5,2.35,.15,2.8,fabric);box(x,.88,bz-1.25,1.5,.24,.65,'#f9f0df');box(x,1.12,bz-2.1,2.5,1.7,.15,luxury?'#7d6754':wood);if(luxury){box(x,1.22,bz-1.8,.75,.55,.15,'#d9b878');box(x-.5,.95,bz-1.75,.5,.4,.15,fabric);}}
 target('hotel-sleep','ベッド · 翌朝まで眠る',bx,1,bz+2.5,3.3);
 const [tx,tz]=l.tea;
 box(tx,.53,tz,2.6,.15,1.5,wood,true);for(const x of [tx-1.7,tx+1.7]){box(x,.42,tz,.9,.65,1.1,fabric,true);box(x,.85,tz-.45,.9,.8,.13,fabric);}
 cyl(tx,.67,tz,.2,.13,'#ede5cf');for(const x of [tx-.55,tx+.55]){cyl(x,.69,tz,.10,.18,'#f1ecdd');cyl(x,.79,tz,.075,.01,'#7e9875');}
 target('hotel-tea','窓辺のお茶 · くつろぐ',luxury?tx-2:tx,1.2,luxury?tz+1.3:tz+1.6,2.5);
 // Open bathroom entrance; both the wash place and bath remain physically reachable.
 const [ax,az]=l.bath,[wx,wz]=l.wash;
 box(ax,.02,az,6,.04,7,luxury?'#aca99d':'#c9c7b8');
 for(const z of [az-2.5,az+2.5])box(ax,.45,z,4,.8,.18,luxury?'#6e7774':'#a28b67');
 box(ax+2,.45,az,.18,.8,5,luxury?'#6e7774':'#a28b67');
 box(ax,.14,az,3.8,.28,4.8,'#a0bdb5');box(ax,.48,az,3.65,.04,4.65,'#8ebbb4');
 box(wx,.10,wz,1.4,.2,1.4,'#c4c5bc');cyl(wx,.4,wz,.26,.6,wood);cyl(wx,.9,wz-.7,.025,1.8,'#a7b6b4');box(wx,1.8,wz-.7,.5,.05,.45,'#c4d4cf');
 target('hotel-bath',luxury?'専用風呂 · スイートの入浴':'客室のお風呂 · 入浴する',wx,1.3,wz,2.5);
 sign('洗い場',wx,2,wz-1,1.4);sign('お風呂',ax,1.9,az-2.5,1.6);
 const bathEdge=Math.sign(ax)*(Math.abs(ax)-4.1);
 box(bathEdge,1.25,az-1,.12,2.5,3.8,wood,true); // short privacy screen, open on the room side
 if(luxury){
  // A separated sleeping wing, lounge, dining area and dressing area.
  const divider=bx<0?bx+4.5:bx-4.5;
  box(divider,1.55,bz-1,.18,3.1,7.2,wood,true);for(let z=bz-4;z<bz+2;z+=.45)box(divider+.13,1.5,z,.08,3,.06,'#c6ad7d');
  box(tx,.06,tz+3.8,8,.08,5.2,'#b4aa91');box(tx,.55,tz+3.8,5.4,.8,1.45,fabric,true);box(tx,1.1,tz+4.35,5.4,1.15,.2,fabric);for(const x of [tx-2.6,tx+2.6])box(x,.85,tz+3.8,.22,.6,1.6,wood);
  box(tx,.38,tz+1.9,3,.15,1.2,'#bda577',true);cyl(tx,.55,tz+1.9,.19,.25,'#e5dbbf');
  box(tx,1.6,tz-3.7,4,2.2,.12,'#374a48');box(tx,.4,tz-3.7,4.5,.8,.7,wood,true);
  const dx=-Math.sign(tx)*5;cyl(dx,.8,0,1.35,.12,wood);for(const [x,z]of [[dx-1.8,0],[dx+1.8,0],[dx,-1.8],[dx,1.8]]){box(x,.5,z,.9,.8,.9,fabric,true);box(x,1,z-.4,.9,.8,.12,wood);}cyl(dx,.95,0,.18,.3,'#d8c494');
  box(0,.03,3,3,.04,10,'#b8a482');for(const x of [-1.55,1.55])box(x,.06,3,.025,.015,10,'#ccb47b');
  const edge=bx<0?-l.w/2:l.w/2,door=bz+4;
  for(const [a,b]of [[Math.min(edge,divider),bx-1.7],[bx+1.7,Math.max(edge,divider)]])if(b>a)box((a+b)/2,1.5,door,b-a,3,.15,wood,true);
  for(let x=-l.w/2+1;x<l.w/2;x+=2.5){box(x,1.7,back+.2,.25,2.8,.16,fabric);cyl(x,3.1,back+.2,.18,.1,'#c6af79');}
  for(const x of [-l.w/2+1.2,l.w/2-1.2]){cyl(x,.5,2,.45,1,'#c9b68d');ball(x,1.7,2,.7,'#7d986a');box(x,1.8,-5,.12,2.5,4,'#c7b58f');box(x-.1,1.8,-5,.13,1.6,2.8,fabric);}
  for(const z of [0,4]){cyl(tx,3.3,z,.04,.5,'#c9ad6c');ball(tx,2.95,z,.23,'#e5d9aa');}
  target('hotel-unwind','スイートのソファ · 体をほぐす',tx,1.3,tz+5,2.5);
  box(bx,.9,5.8,5,1.8,.6,wood,true);box(bx,1.1,5.45,2.3,1.5,.04,'#9cbbb6');cyl(bx+1.6,1.9,5.8,.14,.25,'#e3d6b8');
  for(const x of [-l.w/2+1,l.w/2-1]){box(x,3.37,(back+9)/2,.15,.06,l.d-1,'#f3dca2');}
 }
 if(l.extras==='desk'){box(-Math.sign(bx)*4,.8,-1,3,.12,1.2,wood,true);box(-Math.sign(bx)*4,1.22,-1.4,1.2,.75,.08,'#415351');}
 if(l.extras==='desk'||l.extras==='library')target('hotel-study','客室の読書・ワークスペース',l.extras==='desk'?-Math.sign(bx)*4:0,1.3,l.extras==='desk'?1:2,2.5);
 if(l.extras==='fireplace')target('hotel-unwind','暖炉のそばで体をほぐす',0,1.3,back+3,2.5);
 if(['library','fireplace'].includes(l.extras)){const x=-Math.sign(bx)*(l.w/2-1);box(x,1.3,-4,1,2.6,4.2,wood,true);for(let z=-5.5;z<-2.5;z+=.35)box(x+.55,1.5,z,.2,1.1,.22,fabric);if(l.extras==='fireplace'){box(0,.7,back+1,3,1.4,.6,'#787b70',true);box(0,.6,back+1.35,1.8,.5,.05,'#db9c54');}}
 if(l.extras==='piano'){box(5,1.1,4,3,2.2,.7,'#40595c',true);box(5,.9,4.5,2.7,.12,.45,'#eee8db');for(let x=3.8;x<6.2;x+=.2)box(x,1,4.4,.06,.08,.23,'#465653');}
 if(l.extras==='surf'){box(5,1.3,5,.55,2.6,.15,'#c8aa7a');box(5,1.3,5.1,.08,2,.04,'#6a939d');}
 if(l.extras==='terrace'){target('hotel-unwind','海辺のテラス · 体をほぐす',0,1.3,back-2,2.5);box(0,.55,back-4,l.w,1.1,.12,wood,true);box(0,.02,back-2,l.w,.08,4,'#b3a07d');for(const x of [-4,4]){box(x,.45,back-1.8,2,.3,1.5,'#d3c4a4');box(x,.9,back-2.4,2,.8,.12,'#a99b7d');}}
 // Different views are visible through broad windows, rather than behind opaque walls.
 box(0,-.3,back-13,100,.2,28,sea?'#7faab2':city?'#b5bdb4':'#90aa7b');
 if(l.theme==='spa'||l.theme==='lodge')box(0,-.17,back-11,55,.1,16,'#7ca69b');
 if(city)for(let i=0;i<12;i++){const h=5+i%4*3;box(-28+i*5,h/2,back-18,3.5,h,5,'#a3b7b5');for(let y=2;y<h;y+=2)box(-28+i*5,y,back-15.45,2,.6,.03,'#d8d2aa');}
 else for(let i=0;i<9;i++){const x=-25+i*6;const tree=new THREE.Mesh(new THREE.ConeGeometry(2,4+i%3,8),new THREE.MeshStandardMaterial({color:'#76916b'}));tree.position.set(x,2,back-9-i%2*4);root.add(tree);}
 sign(hotel.roomName+' / '+l.name,0,2.5,9.35,5,Math.PI);target('hotel-lobby','客室の入口 · ロビーへ戻る',0,1.4,8,2.5);
 for(const [x,z]of [[0,3],[bx,bz],[tx,tz]]){const light=new THREE.PointLight(luxury?'#ffe0b0':'#f0e7cd',8,18,2);light.position.set(x,3,z);light.userData.indoor=true;root.add(light);lamps.push(light);}
 k.merge();return {bounds:{minX:-l.w/2+.5,maxX:l.w/2-.5,minZ:l.extras==='terrace'?back-3.5:back+.5,maxZ:9},colliders:k.colliders,interactables:k.interactables,lamps,roomStyle:l.theme};
}
