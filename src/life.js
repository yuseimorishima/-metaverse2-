import {validRoutines} from './routines.js';
import {validDeluxe} from './deluxe.js';
import {validHousing} from './housing.js';
import {validTown} from './town.js';
import {validTravel} from './travel.js';
export const STORAGE_KEY = 'komorebi-life-v1';
export const ITEMS = { bread: { name: '焼きたてのパン', price: 280 }, apple: { name: 'りんご', price: 180 }, coffee: { name: 'コーヒー豆', price: 600 } };
export function newLife() { return {version:1, day:1, minutes:480, money:5000, hunger:85, thirst:80, energy:90, mood:75, inventory:{bread:2, apple:1, coffee:3}, completed:[], workedDay:0, position:[0,1.65,3], yaw:0, pitch:0}; }
export function tick(s, seconds, running=false) {
 s.minutes += seconds * 2;
 while(s.minutes >= 1440) { s.minutes -= 1440; s.day++; }
 s.hunger = Math.max(0,s.hunger-seconds*.35); s.thirst=Math.max(0,s.thirst-seconds*.5);
 s.energy=Math.max(0,s.energy-seconds*(running?.25:.12));
 s.mood=Math.max(0,Math.min(100,s.mood+seconds*(s.hunger<15||s.thirst<15?-.07:.006)));
}
export function complete(s,task) { if(!s.completed.includes(task)) s.completed.push(task); }
export function buy(s,item) { const i=ITEMS[item]; if(!i || s.money<i.price) return false; s.money-=i.price; s.inventory[item]=(s.inventory[item]||0)+1; complete(s,'shop'); return true; }
export function eat(s,item) { if(!['bread','apple'].includes(item)||!s.inventory[item]) return false; s.inventory[item]--; s.hunger=Math.min(100,s.hunger+(item==='bread'?35:20)); s.thirst=Math.min(100,s.thirst+(item==='apple'?12:0)); s.mood=Math.min(100,s.mood+5); complete(s,'eat'); return true; }
export function drink(s) { s.thirst=100; return true; }
export function coffee(s) { if(!s.inventory.coffee) return false; s.inventory.coffee--; s.thirst=Math.min(100,s.thirst+30); s.energy=Math.min(100,s.energy+18); s.mood=Math.min(100,s.mood+12); complete(s,'coffee'); return true; }
export function work(s) { if(s.workedDay===s.day||s.energy<20) return false; s.workedDay=s.day; s.money+=2400; tick(s,120); s.energy=Math.max(0,s.energy-18); complete(s,'work'); return true; }
export function sleep(s) { s.day++; s.minutes=420; s.energy=100; s.hunger=Math.max(10,s.hunger-20); s.thirst=Math.max(10,s.thirst-25); s.mood=Math.min(100,s.mood+12); complete(s,'sleep'); }
export function validSave(v) { return v?.version===1 && ['day','minutes','money','hunger','thirst','energy','mood','workedDay','yaw','pitch'].every(k=>Number.isFinite(v[k])) && v.day>=1 && v.minutes>=0 && v.minutes<1440 && v.money>=0 && ['hunger','thirst','energy','mood'].every(k=>v[k]>=0&&v[k]<=100) && Array.isArray(v.position) && v.position.length===3 && v.position.every(n=>Number.isFinite(n)&&Math.abs(n)<300) && Array.isArray(v.completed)&&v.completed.every(x=>typeof x==='string') && v.inventory && Object.keys(ITEMS).every(k=>Number.isInteger(v.inventory[k])&&v.inventory[k]>=0) && (v.travel===undefined||validTravel(v.travel)) && (v.town===undefined||validTown(v.town)) && (v.housing===undefined||validHousing(v.housing)) && (v.deluxe===undefined||validDeluxe(v.deluxe)) && (v.routines===undefined||validRoutines(v.routines)); }
export function loadLife(storage) { try { const v=JSON.parse(storage.getItem(STORAGE_KEY)); return validSave(v)?v:null; } catch { return null; } }
