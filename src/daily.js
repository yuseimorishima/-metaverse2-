import {TRIP_DESTINATIONS} from './destinations.js';
import {isLocalRegion} from './geography.js';
import {LOTS} from './housing.js';
export const DAILY_TASKS={meal:'ゆっくり食事をする',bath:'お風呂で体を整える',cook:'ひと皿、料理を作る',work:'仕事をひとつ終える',garden:'野菜を収穫する',fish:'魚を釣る',photo:'風景の写真を撮る',clean:'家を掃除する',stretch:'ストレッチする',study:'本で学習する',laundry:'洗濯物を受け取る',trip:'旅先を訪れる',walk:'300m歩いて街を巡る'};
export const DAILY_PLANS={
 slow:{name:'ゆっくり暮らす日',description:'ごはんと家のこと、自分の時間を大切に。',goals:['meal','clean','study','bath']},
 work:{name:'仕事と家事の日',description:'働いて、洗濯して、夜はお風呂でひと息。',goals:['work','laundry','meal','bath']},
 active:{name:'外で過ごす日',description:'歩いて、体を動かし、農園に寄って帰ろう。',goals:['walk','stretch','garden','bath']},
 creative:{name:'趣味と学びの日',description:'料理、本、写真。好きなことを少しずつ。',goals:['cook','study','photo','meal']},
 travel:{name:'旅を楽しむ日',description:'嵐山を歩いて、おいしいものと湯宿を楽しむ。',goals:['trip','meal','stretch','bath']},
};
const blankCounts=()=>Object.fromEntries(Object.keys(DAILY_TASKS).map(k=>[k,0]));
export function freshDaily(s){return {version:1,day:s.day,plan:'slow',counts:blankCounts(),history:[],washing:null,claimedDay:0,knowledge:0};}
export function ensureDaily(s){if(!s.daily)s.daily=freshDaily(s);const d=s.daily;if(d.day!==s.day){d.history.unshift({day:d.day,plan:d.plan,counts:{...d.counts}});d.history=d.history.slice(0,7);d.day=s.day;d.counts=blankCounts();}return d;}
const validCounts=c=>c&&Object.keys(DAILY_TASKS).every(k=>Number.isInteger(c[k])&&c[k]>=0);
export function validDaily(d){return !!d&&d.version===1&&Number.isInteger(d.day)&&d.day>=1&&Object.hasOwn(DAILY_PLANS,d.plan)&&validCounts(d.counts)&&Number.isInteger(d.claimedDay)&&d.claimedDay>=0&&Number.isInteger(d.knowledge)&&d.knowledge>=0&&d.knowledge<=100&&Array.isArray(d.history)&&d.history.length<=7&&d.history.every(h=>Number.isInteger(h.day)&&h.day>=1&&Object.hasOwn(DAILY_PLANS,h.plan)&&validCounts(h.counts))&&(d.washing===null||(Number.isFinite(d.washing?.readyAt)&&d.washing.readyAt>=0&&Number.isInteger(d.washing.startedDay)&&d.washing.startedDay>=1));}
export function recordDaily(s,id,once=false){if(!Object.hasOwn(DAILY_TASKS,id))return false;const d=ensureDaily(s);if(once&&d.counts[id])return false;d.counts[id]++;if(id==='study')d.knowledge=Math.min(100,d.knowledge+3);return true;}
export function selectDailyPlan(s,id){if(!Object.hasOwn(DAILY_PLANS,id))return false;ensureDaily(s).plan=id;return true;}
export function dailyProgress(s){const d=ensureDaily(s),goals=DAILY_PLANS[d.plan].goals;return {goals,done:goals.filter(id=>d.counts[id]>0).length,total:goals.length};}
export function claimDaily(s){const d=ensureDaily(s);if(d.claimedDay===s.day||dailyProgress(s).done<3)return false;d.claimedDay=s.day;s.mood=Math.min(100,s.mood+12);return true;}
export function insideHome(s){if(!isLocalRegion(s.travel?.region))return false;const[x,,z]=s.position;if(Math.abs(x)<5.9&&Math.abs(z)<5.9)return true;return Object.entries(s.housing?.lots||{}).some(([id,p])=>p.style&&Math.abs(x-LOTS[id].x)<5.9&&Math.abs(z-LOTS[id].z)<4.9);}
export function habitAvailability(s,id){const d=ensureDaily(s),home=insideHome(s),region=s.travel?.region;if(d.counts[id])return {ok:false,reason:'今日はもう終えています。また明日、続けましょう。'};
 if(id==='clean'&&!home)return {ok:false,reason:'自宅の部屋に入ってから掃除しましょう。'};
 if(id==='study'&&!home&&!['library','cafe','room'].includes(region))return {ok:false,reason:'自宅・図書館・カフェ・宿の客室で学習できます。'};
 if(id==='stretch'&&!TRIP_DESTINATIONS[region]&&!home&&!['garden','hill','waterfront','room'].includes(region)&&!(isLocalRegion(region)&&Math.hypot(s.position[0]+28,s.position[2]-34)<12))return {ok:false,reason:'自宅・公園・水辺・農園・丘・宿の客室で体を動かせます。'};
 return {ok:true,reason:'E または体験カードで、3つの工程を進めましょう。'};
}
const stamp=s=>s.day*1440+s.minutes;
export function nearLaundry(s){return isLocalRegion(s.travel?.region)&&Math.hypot(s.position[0]+84.8,s.position[2]-29.8)<3;}
export function laundryStatus(s){const w=ensureDaily(s).washing;return !w?'empty':stamp(s)>=w.readyAt?'ready':'washing';}
export function startLaundry(s){const d=ensureDaily(s);if(!nearLaundry(s)||d.washing||s.money<100||s.minutes<360||s.minutes>=1380)return false;s.money-=100;d.washing={startedDay:s.day,readyAt:stamp(s)+90};return true;}
export function collectLaundry(s){const d=ensureDaily(s);if(!nearLaundry(s)||laundryStatus(s)!=='ready')return false;d.washing=null;recordDaily(s,'laundry');s.mood=Math.min(100,s.mood+5);return true;}
export const workReward=s=>2400+5*(s.daily?.knowledge||0);
