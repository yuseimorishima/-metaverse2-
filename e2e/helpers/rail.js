import {expect} from '@playwright/test';
export async function arriveByRail(page){
 await expect.poll(()=>page.evaluate(()=>window.komorebi.getState().travel.region)).toBe('train');
 await page.locator('#rail-rest').click();
 await expect(page.locator('#rail-exit')).toBeEnabled();
 await page.locator('#rail-exit').click();
}
