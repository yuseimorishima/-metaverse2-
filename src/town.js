import {recordDaily} from './daily.js';
import {LAYOUT} from './geography.js';
export const DISTRICTS = {
 cafe: {name:'森のカフェ · 店内',spawn:[LAYOUT.cafe.x,1.65,LAYOUT.cafe.z+6],yaw:0,minutes:5,description:'マスターとの会話、カフェの手伝い、おいしい一杯。'},
 library: {name:'こもれび図書館',spawn:[LAYOUT.library.x,1.65,LAYOUT.library.z+7],yaw:0,minutes:8,description:'読書と本の整理。街のことを、少しずつ知る場所。'},
 garden: {name:'陽だまりの市民農園',spawn:[LAYOUT.garden.x,1.65,LAYOUT.garden.z+12],yaw:0,minutes:10,description:'種をまき、水をやり、トマトを収穫しよう。'},
 waterfront: {name:'水辺の遊歩道',spawn:[LAYOUT.waterfront.x,1.65,LAYOUT.waterfront.z+10],yaw:0,minutes:12,description:'釣り、魚の買い取り、水辺のベンチ。'},
 hill: {name:'見晴らしの丘',spawn:[LAYOUT.hill.x,1.65,LAYOUT.hill.z+12],yaw:0,minutes:15,description:'街を一望する展望台。新しい風景を写真に残そう。'},
};
export const NPCS = {
 master:{name:'カフェのマスター · 葵',lines:['おはよう。新しい場所に行くと、いつもの街も違って見えますね。','農園のトマトで、野菜のプレートを作れたら嬉しいな。','水辺で釣った魚は、売店の澪さんが買い取ってくれますよ。']},
 librarian:{name:'司書 · 文',lines:['旅の本も、料理の本もあります。好きな一冊を探してみてください。','静かな時間がほしくなったら、いつでもいらしてください。','本を一緒に整理してくださる方を探しているんです。']},
 gardener:{name:'農園のお世話係 · 実',lines:['種をまいて、水をやったら、あとはのんびり待ちましょう。','水やりからゲーム内で一時間ほどで、トマトを収穫できます。','収穫した野菜は、家で料理したり、カフェに届けたりできますよ。']},
 fisher:{name:'水辺の売店 · 澪',lines:['初めての釣り？ 釣り竿はここで借りられますよ。','浮きが沈んだら、タイミングよく引き上げるのがこつ。','釣った魚は一匹三百円で買い取ります。お料理にもどうぞ。']},
};
export const ACHIEVEMENTS=[['first-harvest','はじめての収穫'],['first-fish','はじめての一匹'],['first-meal','自分でつくるごはん'],['delivery','街のお手伝い'],['panorama','丘からの一枚'],['cafe-shift','カフェの一日'],['library-shift','本のある時間']];
export function freshTown(){return {seeds:3,tomatoes:0,fish:0,meals:0,rod:false,plot:null,jobDays:{cafe:0,library:0},deliveryDay:0,photos:[],talked:[],achievements:[]};}
export function ensureTown(s){if(!s.town)s.town=freshTown();return s.town;}
export function validTown(t){return !!t&&(t.postcard===undefined||(typeof t.postcard==='string'&&t.postcard.length<220000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(t.postcard)))&&['seeds','tomatoes','fish','meals','deliveryDay'].every(k=>Number.isInteger(t[k])&&t[k]>=0)&&typeof t.rod==='boolean'&&t.jobDays&&['cafe','library'].every(k=>Number.isInteger(t.jobDays[k])&&t.jobDays[k]>=0)&&['photos','talked','achievements'].every(k=>Array.isArray(t[k])&&t[k].every(x=>typeof x==='string'))&&(t.plot===null||(Number.isFinite(t.plot?.plantedAt)&&t.plot.plantedAt>=0&&(t.plot.wateredAt===null||(Number.isFinite(t.plot.wateredAt)&&t.plot.wateredAt>=t.plot.plantedAt))));}
export const absoluteMinutes=s=>s.day*1440+s.minutes;
function award(t,id){if(!t.achievements.includes(id))t.achievements.push(id);}
export function spendTime(s,minutes){s.minutes+=minutes;while(s.minutes>=1440){s.minutes-=1440;s.day++;}s.hunger=Math.max(0,s.hunger-minutes*.175);s.thirst=Math.max(0,s.thirst-minutes*.25);s.energy=Math.max(0,s.energy-minutes*.06);}
export function plotStage(s){const p=ensureTown(s).plot;return !p?'empty':p.wateredAt===null?'dry':absoluteMinutes(s)-p.wateredAt>=60-1e-6?'ripe':'growing';}
export function plantSeeds(s){const t=ensureTown(s);if(s.travel?.region!=='garden'||t.plot||t.seeds<1)return false;t.seeds--;t.plot={plantedAt:absoluteMinutes(s),wateredAt:null};return true;}
export function waterPlot(s){const t=ensureTown(s);if(s.travel?.region!=='garden'||!t.plot||t.plot.wateredAt!==null)return false;t.plot.wateredAt=absoluteMinutes(s);return true;}
export function harvest(s){const t=ensureTown(s);if(s.travel?.region!=='garden'||plotStage(s)!=='ripe')return false;t.tomatoes+=3;t.plot=null;award(t,'first-harvest');recordDaily(s,'garden');return true;}
export function buySeeds(s){const t=ensureTown(s);if(s.travel?.region!=='garden'||s.money<150)return false;s.money-=150;t.seeds+=3;return true;}
export function rentRod(s){const t=ensureTown(s);if(s.travel?.region!=='waterfront'||t.rod||s.money<500)return false;s.money-=500;t.rod=true;return true;}
export function catchFish(s,successful){const t=ensureTown(s);if(s.travel?.region!=='waterfront'||!t.rod||s.energy<5)return false;spendTime(s,10);if(successful){t.fish++;award(t,'first-fish');recordDaily(s,'fish');}return true;}
export function sellFish(s){const t=ensureTown(s);if(s.travel?.region!=='waterfront'||!t.fish)return false;s.money+=t.fish*300;t.fish=0;return true;}
export function cookMeal(s){const t=ensureTown(s);if(!['home','residential'].includes(s.travel?.region)||t.tomatoes<1||(!s.inventory.bread&&!t.fish))return false;t.tomatoes--;if(t.fish)t.fish--;else s.inventory.bread--;t.meals++;spendTime(s,20);award(t,'first-meal');return true;}
export function eatMeal(s){const t=ensureTown(s);if(!t.meals)return false;t.meals--;s.hunger=Math.min(100,s.hunger+65);s.thirst=Math.min(100,s.thirst+15);s.mood=Math.min(100,s.mood+12);return true;}
export function deliverProduce(s){const t=ensureTown(s);if(s.travel?.region!=='cafe'||t.deliveryDay===s.day||t.tomatoes<2)return false;t.tomatoes-=2;t.deliveryDay=s.day;s.money+=900;award(t,'delivery');return true;}
export function townShift(s,job){const t=ensureTown(s);if(!['cafe','library'].includes(job)||s.travel?.region!==job||t.jobDays[job]===s.day||s.energy<25)return false;t.jobDays[job]=s.day;spendTime(s,120);s.energy=Math.max(0,s.energy-10);s.money+=job==='cafe'?1800:1400;award(t,`${job}-shift`);recordDaily(s,'work');return true;}
export function takePhoto(s){const t=ensureTown(s);if(s.travel?.region!=='hill')return false;const id=`day-${s.day}`;if(t.photos.includes(id))return false;t.photos.push(id);s.mood=Math.min(100,s.mood+18);award(t,'panorama');return true;}
export function talk(s,id){const t=ensureTown(s);if(!Object.hasOwn(NPCS,id))return false;if(!t.talked.includes(id))t.talked.push(id);s.mood=Math.min(100,s.mood+4);return true;}
