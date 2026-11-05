import * as THREE from 'three';
const maps=new Map();
function texture(type){if(maps.has(type))return maps.get(type);const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');let seed=927;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};ctx.fillStyle=type==='wood'?'#e2d2b9':'#dfdfd8';ctx.fillRect(0,0,256,256);for(let i=0;i<9000;i++){const g=Math.floor(90+rand()*100);ctx.fillStyle=`rgba(${g},${g},${g},${type==='asphalt'?.2:.07})`;ctx.fillRect(rand()*256,rand()*256,rand()*2+1,rand()*2+1);}if(type==='wood'){for(let i=0;i<240;i++){ctx.strokeStyle=`rgba(77,55,29,${rand()*.13})`;ctx.lineWidth=rand()*1.2;const y=rand()*256;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(80,y+rand()*3,180,y-rand()*3,256,y);ctx.stroke();}}if(type==='paving'){ctx.strokeStyle='#a9ada5';ctx.lineWidth=2;for(let y=0;y<256;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();for(let x=(y/64%2)*32;x<256;x+=64)ctx.strokeRect(x,y,64,64);}}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.repeat.set(type==='asphalt'?8:3,type==='wood'?1:3);t.anisotropy=4;maps.set(type,t);return t;}
const wood=new Set(['#b79d78','#b59a73','#b49a73','#a18c68','#b09c76','#b69c73','#ac936d','#b69a72','#d7c5a0','#8d7358','#b49a72','#bb9f74','#b29970','#b89a70','#c3a677','#c1ad88','#b19b75','#a4906e']);
const plaster=new Set(['#e1dbc9','#d3cbb5','#e6dfcc','#adbda0','#d6b3a0','#ecece5','#ded9c8','#e2ddcc','#e6decb']);
export function surface(color,extra={}){const type=color==='#879087'?'asphalt':['#c7c9b6','#d5cbb1','#d2cab4'].includes(color)?'paving':wood.has(color)?'wood':plaster.has(color)?'plaster':null;const m=new THREE.MeshStandardMaterial({color:type==='asphalt'?'#666c68':color,roughness:type==='wood'?.7:.87,...extra});m.userData.surface=type;if(type&&!extra.map){m.map=texture(type);m.bumpMap=m.map;m.bumpScale=type==='asphalt'?.018:.008;}if(color==='#e5d9aa'){m.emissive.set('#f4d795');m.emissiveIntensity=.5;}return m;}

// Tile at a fixed physical scale so long roads and wide walls keep their grain.
export function surfaceUV(geometry,material){
 if(!material.userData.surface)return geometry;
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
  const a=ny>=nx&&ny>=nz?x:nx>=nz?z:x,b=ny>=nx&&ny>=nz?z:y;
  uv.setXY(i,a*.2,b*.2);
 }
 return geometry;
}
