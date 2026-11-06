import {test,expect} from '@playwright/test';
import {newLife} from '../src/life.js';
import {freshTravel,HOTELS} from '../src/travel.js';
import {HOTEL_LAYOUTS} from '../src/hotel-layouts.js';
for(const [id,l]of Object.entries(HOTEL_LAYOUTS))test(`${id}: distinct room has reachable sleep, tea, bath and exit`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const s={...newLife(),worldLayout:2,money:60000,position:[0,1.65,8],travel:{...freshTravel(),region:'room',hotelId:id,stay:{checkInDay:1,rested:false,dinnerDay:0}}};
 await page.addInitScript(s=>localStorage.setItem('komorebi-life-v1',JSON.stringify(s)),s);await page.goto('/');await page.locator('#continue').click();await expect(page.locator('.vignette')).toHaveCSS('opacity','0');await expect(page.locator('#location')).toContainText(HOTELS[id].name);
 const w=await page.evaluate(()=>window.komorebi.getWorld()),b=w.bounds,key=(x,z)=>x+','+z,blocked=(x,z)=>w.colliders.some(c=>Math.abs(x-c.x)<c.w/2+.24&&Math.abs(z-c.z)<c.d/2+.24),queue=[[0,8]],seen=new Set(['0,8']);
 for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz]of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const a=x+dx,c=z+dz,k=key(a,c);if(a<b.minX||a>b.maxX||c<b.minZ||c>b.maxZ||seen.has(k)||blocked(a,c))continue;seen.add(k);queue.push([a,c]);}}
 for(const p of [...w.interactables.map(p=>({id:p.id,x:p.position[0],z:p.position[2]})),{id:'wash',x:l.wash[0],z:l.wash[1]},{id:'soak',x:l.bath[0],z:l.bath[1]}])expect(queue.some(([x,z])=>Math.hypot(x-p.x,z-p.z)<1.6),'reachable '+p.id).toBe(true);
 if(HOTELS[id].tier==='deluxe')expect((b.maxX-b.minX)*(b.maxZ-b.minZ)).toBeGreaterThan(750);
 await page.screenshot({path:`test-results/room-${id}.png`});expect(errors).toEqual([]);
});
