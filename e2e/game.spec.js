import {completeFood} from './helpers/routines.js';
import {test,expect} from '@playwright/test';
test('loads a 3D world, starts, moves, opens inventory and restores a save',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('#loading')).toHaveCount(0);await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('h1')).toContainText('暮らそう');await page.screenshot({path:'test-results/welcome.png'});
 await page.locator('#start').click();await expect(page.locator('#hud')).toBeVisible();await expect.poll(()=>page.evaluate(()=>window.komorebi.getState().started)).toBe(true);
 // Resume if the window lost focus during setup.
 if(await page.locator('#pause').isVisible())await page.locator('#resume').click();
 const before=await page.evaluate(()=>window.komorebi.getState().position);await page.keyboard.down('KeyS');await expect.poll(async()=>page.evaluate(()=>window.komorebi.getState().position[2]),{timeout:15000}).toBeGreaterThan(before[2]+.5);await page.keyboard.up('KeyS');const after=await page.evaluate(()=>window.komorebi.getState().position);expect(after[2]).toBeGreaterThan(before[2]+.5);
 await page.keyboard.press('KeyI');await expect(page.locator('#panel')).toBeVisible();await page.locator('[data-action="eat-bread"]').click();await expect(page.locator('#toast')).toContainText('いただきます');expect(await page.evaluate(()=>window.komorebi.getState().inventory.bread)).toBe(1);
 await page.keyboard.press('KeyM');await expect(page.locator('.city-map')).toBeVisible();await page.locator('#close-panel').click();await page.screenshot({path:'test-results/playing.png'});
 await page.reload();await expect(page.locator('#continue')).toBeVisible();await page.locator('#continue').click();expect(await page.evaluate(()=>window.komorebi.getState().inventory.bread)).toBe(1);expect(errors).toEqual([]);
});
const scenarios=[
 {name:'brews coffee in the kitchen',position:[-3.2,1.65,-3.55],yaw:0,label:'コーヒー',check:async page=>{expect(await page.evaluate(()=>window.komorebi.getState().routines.active.id)).toBe('coffee');expect(await page.evaluate(()=>window.komorebi.getState().inventory.coffee)).toBe(2);await completeFood(page);expect(await page.evaluate(()=>window.komorebi.getState().completed)).toContain('coffee');}},
 {name:'buys groceries at the market',position:[14,1.65,22],yaw:Math.PI,label:'マーケット',action:'buy-apple',check:async page=>{expect(await page.evaluate(()=>window.komorebi.getState().money)).toBe(4820);expect(await page.evaluate(()=>window.komorebi.getState().inventory.apple)).toBe(2);}},
 {name:'earns money at the work desk',position:[-3.6,1.65,-1.6],yaw:Math.PI/2,label:'パソコン',action:'work',check:async page=>{expect(await page.evaluate(()=>window.komorebi.getState().money)).toBe(7400);}},
 {name:'sleeps until the next morning',position:[-1.8,1.65,3.4],yaw:Math.PI/2,label:'ベッド',action:'sleep',check:async page=>{expect(await page.evaluate(()=>window.komorebi.getState().day)).toBe(2);expect(await page.evaluate(()=>window.komorebi.getState().energy)).toBeGreaterThan(99);}}
];
for(const scenario of scenarios)test(scenario.name,async({page})=>{
 const base={version:1,day:1,minutes:480,money:5000,hunger:40,thirst:40,energy:70,mood:50,inventory:{bread:2,apple:1,coffee:3},completed:[],workedDay:0,position:scenario.position,yaw:scenario.yaw,pitch:-.2};
 await page.addInitScript(v=>localStorage.setItem('komorebi-life-v1',JSON.stringify(v)),base);
 await page.goto('/');await expect(page.locator('#loading')).toHaveCount(0);await page.locator('#continue').click();if(await page.locator('#pause').isVisible())await page.locator('#resume').click();
 await expect(page.locator('#interaction')).toContainText(scenario.label);await page.keyboard.press('KeyE');if(scenario.action)await page.locator(`[data-action="${scenario.action}"]`).click();await scenario.check(page);
});
