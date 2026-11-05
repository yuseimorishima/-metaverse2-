import {expect} from '@playwright/test';
export const state=page=>page.evaluate(()=>window.komorebi.getState());
export async function completeFood(page){
 for(let i=0;i<12;i++){
  const a=(await state(page)).routines.active;if(!a)return;
  if(a.phase==='chewing'){
   await expect.poll(async()=>{const next=(await state(page)).routines.active;return next===null||next.phase!=='chewing';},{timeout:35000}).toBe(true);
   continue;
  }
  await expect(page.locator('#routine-act')).toBeEnabled({timeout:30000});await page.locator('#routine-act').click();
  await expect.poll(async()=>{const next=(await state(page)).routines.active;return next===null||next.done>a.done;},{timeout:35000}).toBe(true);
 }
 throw new Error('Food did not complete after the expected portions.');
}
export async function bathStep(page,phase){
 await expect.poll(async()=>(await state(page)).routines.active?.phase,{timeout:50000}).toBe(phase);
 await expect(page.locator('#routine-act')).toBeEnabled();await page.locator('#routine-act').click();
}
export async function completeStationaryBath(page){
 await bathStep(page,'wash-walk');await bathStep(page,'wash-ready');await bathStep(page,'wash-ready');await bathStep(page,'rinse-ready');
 const id=(await state(page)).routines.active.id;if(id!=='shower')await bathStep(page,'soak-walk');
 await bathStep(page,'dry-ready');await expect.poll(async()=>(await state(page)).routines.active,{timeout:25000}).toBeNull();
}
