import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function createWorld(scene,{core=false}={}) {
 const colliders=[], interactables=[], lamps=[], windows=[];
 const materials=new Map();
 const mat=(color,roughness=.8,extra={})=>{const key=String(color?.isColor?color.getHex():color)+roughness+JSON.stringify(extra);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness,...extra}));return materials.get(key);};
 function texture(kind){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');let seed=123;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};ctx.fillStyle=kind==='wood'?'#d2b98e':'#ddd9ca';ctx.fillRect(0,0,256,256);if(kind==='wood'){for(let i=0;i<850;i++){ctx.strokeStyle=`rgba(82,52,24,${rand()*.13})`;ctx.lineWidth=rand()*1.5;const y=rand()*256;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(70,y+rand()*4,180,y-rand()*5,256,y+rand()*3);ctx.stroke();}}else{for(let y=0;y<256;y+=2)for(let x=0;x<256;x+=2){ctx.fillStyle=`rgba(75,70,45,${rand()*.13})`;ctx.fillRect(x,y,1,1);}}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='wood'?2:5,kind==='wood'?1:5);return t;}
 const woodTexture=texture('wood'),fabricTexture=texture('fabric');
 const m={wall:mat('#e8e3d5'),wood:mat('#b58a58'),woodDark:mat('#73553a'),oak:mat('#d2b081'),floor:mat('#bda17a'),white:mat('#f4f0e7'),cream:mat('#e7deca'),sofa:mat('#c4c6a5'),leaf:mat('#526e3a'),leafLight:mat('#81965c'),soil:mat('#4a3d2b'),pot:mat('#c18463'),black:mat('#333831'),metal:mat('#66685a',.4),glass:mat('#c9dfd5',.15,{transparent:true,opacity:.12}),road:mat('#777971'),pavement:mat('#c7c4b6'),grass:mat('#9ba679'),water:mat('#8eb1aa',.25),linen:mat('#e4dfc9'),gold:mat('#c6a16a',.35)};
 m.oak.map=woodTexture;m.wood.map=woodTexture;m.sofa.map=fabricTexture;m.linen.map=fabricTexture;
 function box(x,y,z,w,h,d,material,collision=false,parent=scene) { const rounded=material===m.sofa||material===m.linen;const o=new THREE.Mesh(rounded?new RoundedBoxGeometry(w,h,d,3,Math.min(w,h,d)*.2):new THREE.BoxGeometry(w,h,d),material); o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(collision)colliders.push({x,z,w,d});return o; }
 function cyl(x,y,z,r,h,material,rt=r,parent=scene) { const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,r,h,20),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o; }
 function sphere(x,y,z,r,material,sx=1,sy=1,sz=1,parent=scene){const o=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o;}
 function textLabel(text,x,y,z,width=2,color='#4d6147',bg='#eae5d4',rotation=0){const c=document.createElement('canvas');c.width=768;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,192);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(12,12,744,168);ctx.fillStyle=color;ctx.font='500 57px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,98);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),new THREE.MeshStandardMaterial({map:t,roughness:1}));o.position.set(x,y,z);o.rotation.y=rotation;scene.add(o);return o;}
 function interact(id,label,x,y,z,range=2.1){interactables.push({id,label,position:new THREE.Vector3(x,y,z),range});}
 function plant(x,y,z,size=1){cyl(x,y+.23*size,z,.25*size,.46*size,m.pot,.32*size);cyl(x,y+.47*size,z,.27*size,.015,m.soil);for(let i=0;i<8;i++){const a=i*2.4;const leaf=sphere(x+Math.cos(a)*.22*size,y+(.72+(i%3)*.18)*size,z+Math.sin(a)*.22*size,.25*size,i%2?m.leaf:m.leafLight,.65,1.7,.5);leaf.rotation.z=Math.cos(a)*.6;}}
 function chair(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);box(0,.5,0,.62,.12,.6,m.oak,false,g);box(0,.91,.25,.62,.72,.09,m.oak,false,g);for(const dx of [-.23,.23])for(const dz of [-.23,.23])box(dx,.25,dz,.055,.5,.055,m.woodDark,false,g);colliders.push({x,z,w:.65,d:.65});}
 function tree(x,z,size=1){cyl(x,1.6*size,z,.18*size,3.2*size,m.woodDark,.12*size);sphere(x,3.4*size,z,1.5*size,m.leaf,1,1.1,1);sphere(x+.7*size,3.2*size,z+.5*size,1.05*size,m.leafLight);sphere(x-.7*size,3.3*size,z-.3*size,1.1*size,m.leaf);colliders.push({x,z,w:.5*size,d:.5*size});}
 function bench(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);for(let i=0;i<4;i++)box(0,.55,(i-1.5)*.14,1.8,.09,.12,m.wood,false,g);for(let i=0;i<3;i++)box(0,.8+i*.16,.3,1.8,.12,.07,m.wood,false,g);for(const a of [-.65,.65])box(a,.27,0,.08,.54,.5,m.black,false,g);colliders.push({x,z,w:1.8,d:.7});}
 // Warm, individually laid oak floorboards.
 box(0,-.15,0,12,.3,12,m.floor);
 for(let ix=0;ix<24;ix++)for(let iz=0;iz<5;iz++){const shade=new THREE.Color('#b99a70').multiplyScalar(.91+((ix*13+iz*7)%11)*.018);box(-5.75+ix*.5,.006,-4.8+iz*2.4,.485,.018,2.38,mat(shade));}
 box(0,3.39,0,12.15,.16,12.15,m.white);
 // Open-plan apartment; south doorway and large east-facing windows.
 box(0,1.65,-6,12,3.3,.18,m.wall,true);box(-6,1.65,0,.18,3.3,12,m.wall,true);
 box(-3.6,1.65,6,4.8,3.3,.18,m.wall,true);box(3.6,1.65,6,4.8,3.3,.18,m.wall,true);box(0,2.98,6,2.4,.65,.18,m.wall);
 box(6,.35,0,.16,.7,12,m.wall,true);box(6,3.02,0,.16,.56,12,m.wall);for(const z of [-6,-2,2,6])box(6,1.85,z,.16,2.3,.12,m.oak,true);
 for(const z of [-4,0,4]){const glass=box(6,1.75,z,.04,2.1,3.82,m.glass);windows.push(glass);box(5.8,.75,z,.45,.09,3.9,m.oak);}
 // Baseboards and door surround.
 for(const x of [-5.87])box(x,.12,0,.06,.22,11.9,m.white);box(0,.12,-5.87,11.9,.22,.06,m.white);
 for(const x of [-1.23,1.23])box(x,1.35,5.95,.12,2.7,.22,m.oak);box(0,2.69,5.95,2.58,.12,.22,m.oak);
 box(0,.04,5.25,1.65,.035,.8,mat('#a59d7c'));textLabel('おかえりなさい',0,.065,5.2,1.1).rotation.x=-Math.PI/2;
 // Kitchen.
 box(-4, .46,-5.25,3.5,.9,1.2,m.cream,true);box(-4,.94,-5.25,3.6,.08,1.25,m.oak);
 for(const x of [-5.05,-3.95,-2.85]){box(x,.5,-4.635,1.02,.75,.035,m.white);box(x,.74,-4.59,.3,.025,.03,m.metal);}
 box(-5.05,.995,-5.2,.85,.025,.7,m.metal);box(-5.05,1.01,-5.2,.69,.02,.54,m.black);cyl(-5.05,1.2,-5.55,.025,.4,m.metal);box(-5.05,1.39,-5.41,.05,.05,.3,m.metal);
 interact('water','蛇口 · 水を飲む',-5,1.1,-5,2.1);
 box(-1.2,1,-5.25,1.1,2,1.2,m.white,true);box(-1.2,1.26,-4.63,1.05,.025,.03,m.metal);box(-.82,1.65,-4.6,.035,.4,.04,m.metal);box(-.82,.7,-4.6,.035,.5,.04,m.metal);interact('fridge','冷蔵庫 · 食べものを選ぶ',-1.2,1.2,-4.6,2);
 box(-3.2,1.15,-5.2,.42,.38,.38,m.black);cyl(-3.2,1.4,-5.2,.16,.13,m.black);box(-3.2,1.03,-4.92,.4,.05,.25,m.metal);cyl(-3.2,1.13,-4.94,.09,.17,m.white);interact('coffee','コーヒーを淹れる',-3.2,1.2,-4.85,1.8);
 for(let i=0;i<2;i++){box(-4.25,2.1+i*.48,-5.7,2.4,.07,.5,m.oak);for(let j=0;j<3;j++)cyl(-4.9+j*.55,2.23+i*.48,-5.7,.12,.2,i?m.pot:m.white);}
 // Linen sofa and a soft rug.
 const rug=mat('#e3ddc7');box(2.5,.045,.25,4.9,.035,4.2,rug);for(let i=0;i<15;i++)box(.15+i*.34,.068,.25,.015,.005,4.05,mat('#c9c3aa'));
 box(.3,.32,.3,1.05,.5,2.9,m.sofa,true);box(-.15,.8,.3,.25,.95,3.1,m.sofa);box(.3,.65,-1.23,1.1,.65,.25,m.sofa);box(.3,.65,1.83,1.1,.65,.25,m.sofa);
 for(let i=0;i<3;i++)box(.42,.62,-.65+i*.95,.8,.22,.88,mat('#d1d0b4'));
 const cushion=box(.2,.99,-.66,.27,.55,.58,mat('#b2b794'));cushion.rotation.z=-.16;
 const cushion2=box(.25,.96,1.05,.27,.52,.55,mat('#ebe4d0'));cushion2.rotation.x=.22;
 interact('sofa','ソファ · ひと息つく',.8,.8,.3,2.2);
 // Coffee table, ceramic cup, book, vase.
 cyl(2.6,.56,.3,.87,.11,m.oak);for(const a of [0,2.1,4.2])box(2.6+Math.cos(a)*.5,.28,.3+Math.sin(a)*.5,.08,.55,.08,m.woodDark);
 box(2.66,.64,.35,.48,.045,.33,mat('#78866b'));box(2.66,.67,.35,.44,.02,.3,m.cream);cyl(2.2,.72,.05,.11,.2,m.white);cyl(2.2,.826,.05,.083,.007,m.woodDark);
 cyl(2.95,.78,.02,.1,.32,m.pot,.065);for(let i=0;i<3;i++){cyl(2.95+(i-1)*.05,1.07,.02,.009,.5,m.leaf);sphere(2.95+(i-1)*.05,1.3,.02,.09,mat('#e7ce85'));}
 interact('book','本 · 読書をする',2.6,.7,.35,1.8);
 // Low cabinet and record player facing the sofa.
 box(5.35,.4,.3,.8,.8,2.5,m.oak,true);for(let i=0;i<4;i++)box(4.93,.39,-.48+i*.5,.025,.65,.02,m.woodDark);
 box(5.3,.85,.4,.58,.08,.65,m.woodDark);cyl(5.3,.902,.4,.24,.015,m.black);cyl(5.3,.916,.4,.07,.015,m.cream);box(5.13,.95,.7,.025,.04,.3,m.gold);
 interact('music','レコード · 音楽を聴く',4.95,1,.3,1.8);
 plant(5.2,0,-2,1.3);plant(5.3,.84,-.65,.6);
 // Dining table and two chairs.
 box(3.7,.79,-3.65,2.2,.12,1.25,m.oak,true);for(const x of [2.8,4.6])for(const z of [-4.1,-3.2])box(x,.38,z,.07,.76,.07,m.woodDark);
 chair(3.2,-2.65,0);chair(4.4,-4.65,Math.PI);
 cyl(3.8,.91,-3.65,.24,.025,m.white);cyl(3.8,.93,-3.65,.16,.02,m.cream);plant(4.5,.86,-3.75,.48);
 // Bedroom alcove, bed and bedside lamp.
 box(-3.9,.26,2.9,2.65,.45,3.3,m.oak,true);box(-3.9,.58,2.85,2.55,.35,3.1,m.linen);box(-3.9,.8,1.42,2.65,1.3,.15,m.oak);
 box(-3.9,.81,3.2,2.59,.16,2.15,mat('#9eae94'));for(const x of [-4.5,-3.3])box(x,.83,1.8,.96,.18,.59,m.white);
 box(-2.12,.39,1.5,.7,.78,.7,m.oak,true);cyl(-2.12,1.02,1.5,.045,.5,m.gold);cyl(-2.12,1.27,1.5,.28,.32,m.cream,.17);const bedside=new THREE.PointLight('#ffcc80',0,6,2);bedside.position.set(-2.12,1.3,1.5);scene.add(bedside);lamps.push(bedside);
 interact('sleep','ベッド · 明日の朝まで眠る',-3.9,1,3.4,2.3);
 // Work desk and laptop.
 box(-5.2,.79,-1.65,1.05,.1,2,m.oak,true);for(const z of [-2.45,-.85])box(-5.2,.38,z,.8,.76,.07,m.woodDark);
 box(-5.15,.87,-1.6,.66,.045,.82,m.metal);const screen=box(-5.47,1.15,-1.6,.045,.55,.81,m.black);box(-5.441,1.15,-1.6,.005,.46,.72,mat('#b0c1ae',.6,{emissive:'#688b7a',emissiveIntensity:.2}));chair(-4.2,-1.6,-Math.PI/2);
 interact('work','パソコン · 在宅の仕事をする',-4.8,1.1,-1.6,1.9);
 // Wall art.
 box(-3.9,2.05,5.86,1.3,1,.05,m.oak);box(-3.9,2.05,5.82,1.15,.85,.02,mat('#dfd6b6'));sphere(-3.9,2.13,5.79,.23,mat('#859878'),1,1,.05);
 // Pendant lights.
 for(const [x,z] of [[2.7,.3],[3.7,-3.65]]){cyl(x,2.9,z,.015,.8,m.black);cyl(x,2.55,z,.32,.24,m.cream,.11);const light=new THREE.PointLight('#ffdcaa',0,10,2);light.position.set(x,2.42,z);scene.add(light);lamps.push(light);}
 if(!core){
 // Outside: garden, street, and a walkable neighborhood.
 box(0,-.36,0,160,.4,160,m.grass);box(0,-.1,10.4,12,.2,8.5,m.pavement);box(0,-.15,17,130,.2,7,m.road);
 for(let x=-60;x<62;x+=7)box(x,-.038,17,3,.015,.11,mat('#ded7b9'));
 for(const z of [13.4,20.6]){box(0,-.05,z,130,.2,1.2,m.pavement);box(0,.08,z+(z<17?.65:-.65),130,.2,.12,m.cream);}
 for(let x=-45;x<=45;x+=5)for(const z of [11.5,22.6]){box(x,-.005,z,4.94,.02,2,m.pavement);}
 // Exterior apartment walls and welcoming door.
 textLabel('KOMOREBI APARTMENT',0,2.98,6.12,2.2);
 for(const x of [-5.4,5.4])plant(x,0,7.1,1.3);
 box(0,-.01,8,2.4,.12,3.8,m.pavement);interact('outside','街へ出る',0,1.4,8.5,1.9);
 function building(x,z,w,h,color,label){box(x,h/2,z,w,h,7,mat(color),true);box(x,h+.12,z,w+.3,.24,7.3,m.cream);for(let row=0;row<Math.floor(h/2.7);row++)for(let col=0;col<Math.floor(w/2);col++){const xx=x-w/2+1.1+col*2;box(xx,1.8+row*2.6,z-3.53,1.1,1.4,.05,mat('#729087',.3));box(xx,1.09+row*2.6,z-3.63,1.3,.1,.3,m.cream);}if(label)textLabel(label,x,3.1,z-3.59,w*.7,'#f1ebdc','#526348',Math.PI);}
 // Shops face north; rotated labels added on the visible north-facing facade.
 building(-13,27,10,7.4,'#d1b9a0');building(0,27,10,7.9,'#dcd5bc');building(13,27,10,6.6,'#b8c0a8');building(-28,28,12,10,'#c5c7b4');building(30,29,12,10,'#dfc9ad');
 function storefront(x,title,color){box(x,1.3,23.45,7,2.5,.06,mat('#718e83',.3));for(const dx of [-3.5,0,3.5])box(x+dx,1.35,23.35,.12,2.7,.14,m.oak);box(x,2.85,22.8,8,.17,1.7,mat(color));for(let i=0;i<16;i++)box(x-3.75+i*.5,2.7,21.99,.48,.3,.05,i%2?m.cream:mat(color));textLabel(title,x,3.55,23.37,5.8,'#485842','#f3ead6',Math.PI);}
 // For +z shops the sign plane faces toward the apartment (-z).
 storefront(-13,'MORI  /  COFFEE','#7c8d68');storefront(0,'こもれび マーケット','#b49d72');storefront(13,'GREEN & FLOWERS','#829582');
 interact('cafe','森のカフェ · コーヒーを買う',-13,1.4,21.8,2.8);interact('shop','こもれびマーケット · 買い物',0,1.4,21.8,2.8);interact('flowers','花屋 · 花を買う',13,1.4,21.8,2.8);
 // Shop signs face -z by rotating pi; text stays readable.
 for(const x of [-16,-10]){cyl(x,.7,21.8,.57,.08,m.oak);cyl(x,.34,21.8,.07,.7,m.black);chair(x-.85,21.8,Math.PI/2);chair(x+.85,21.8,-Math.PI/2);}
 plant(-4,0,22.5,1.2);plant(4,0,22.5,1.2);plant(17,0,22.5,1.4);
 // Small neighborhood park east of the apartment.
 box(21,-.03,3,20,.09,18,mat('#98a875'));box(19,.01,8,16,.04,1.8,m.pavement);box(23,.015,2,1.8,.04,13,m.pavement);box(23,.02,5,6,.05,5,m.pavement);
 const fountainMat=mat('#d4d2bf');cyl(23,.23,4.8,1.9,.45,fountainMat);cyl(23,.47,4.8,1.67,.05,m.water);cyl(23,.8,4.8,.22,.7,fountainMat);cyl(23,1.17,4.8,.8,.16,fountainMat);cyl(23,1.27,4.8,.65,.03,m.water);
 colliders.push({x:23,z:4.8,w:3.8,d:3.8});interact('fountain','噴水 · 水音に耳を澄ます',23,1.3,4.8,3.6);
 bench(18,6.5);bench(26,8.5);interact('park','公園のベンチ · 深呼吸する',18,1,6.5,2.5);
 for(const [x,z,s] of [[13,-3,1.3],[18,-4,1.1],[27,-3,1.4],[30,3,1.2],[29,10,1.1],[15,11,.9],[-11,9,1.1],[-20,10,1.2],[-28,10,1],[-36,23,1.4],[23,22,1],[-10,-8,1.5],[1,-11,1.3],[10,-10,1.5]])tree(x,z,s);
 textLabel('こもれび公園  →',9,1.6,10,2.1);box(9,.75,10,.08,1.5,.08,m.woodDark);textLabel('MARKET  /  CAFE  ↑',-4,1.2,11,1.6);box(-4,.55,11,.06,1.1,.06,m.woodDark);
 // Street lamps and planted borders.
 for(const x of [-24,-7,8,25]){cyl(x,1.9,12,.065,3.8,m.black);sphere(x,3.8,12,.2,m.cream);const light=new THREE.PointLight('#ffd799',0,14,2);light.position.set(x,3.65,12);scene.add(light);lamps.push(light);}
 for(let i=0;i<30;i++){const x=12+(i*7%18),z=-5+(i*11%16);if(Math.abs(x-23)<2||Math.abs(z-8)<1.5)continue;const color=mat(['#d8c78b','#ddd5b5','#c5a5a1'][i%3]);sphere(x,.25,z,.12,color);cyl(x,.12,z,.012,.24,m.leaf);}
 // Distant residential silhouettes.
 for(let i=0;i<12;i++){const x=-55+i*10;if(Math.abs(x)<8)continue;building(x,-21,7,5+(i%3)*2,['#ccc8b3','#d9cfba','#bdc6b0'][i%3]);}
 // Walkable entrances to the expanded neighborhood.
 textLabel('図書館  LIBRARY',-28,2.5,24.4,6);interact('town-enter-library','図書館 · 中へ入る',-28,1.4,22.9,2.8);
 for(const [id,title,x,z] of [['garden','市民農園  ←',-38,10],['waterfront','水辺の遊歩道  →',42,10],['hill','見晴らしの丘  ↑',-20,-9]]){textLabel(title,x,2,z,3.7);box(x,.8,z,.09,1.6,.09,m.woodDark);interact('town-enter-'+id,title+' · 散歩に出かける',x,1.4,z+.3,2.8);}
 box(-7,1.2,10,2.5,1.7,.16,m.oak);textLabel('街の案内  /  B',-7,1.5,10.1,2.3);interact('town-board','街の案内 · 新しい場所を探す',-7,1.4,10.3,2.7);
 interact('town-cook','キッチン · 採れた野菜で料理する',-2.15,1.15,-5.15,1.9);
 }else{box(0,-.01,8,2.4,.1,4,m.pavement);for(const x of [-5.4,5.4])plant(x,0,7.1,1.1);interact('outside','街へ出る',0,1.4,8.5,1.9);interact('town-cook','キッチン · 採れた野菜で料理する',-2.15,1.15,-5.15,1.9);}
 // Bake static meshes by material to keep the detailed neighborhood inexpensive to render.
 scene.updateMatrixWorld(true);const batches=new Map();const originals=[];
 scene.traverse(o=>{if(!o.isMesh)return;const key=o.material.uuid;if(!batches.has(key))batches.set(key,{material:o.material,geometries:[]});batches.get(key).geometries.push(o.geometry.clone().applyMatrix4(o.matrixWorld));originals.push(o);});
 for(const {material,geometries} of batches.values()){const geometry=mergeGeometries(geometries,false);if(geometry){const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=!material.transparent;mesh.receiveShadow=true;scene.add(mesh);}for(const g of geometries)g.dispose();}
 for(const o of originals){o.removeFromParent();o.geometry.dispose();}
 return {colliders,interactables,lamps,windows};
}
