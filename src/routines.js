import {TRIP_DESTINATIONS} from './destinations.js';
import {habitAvailability,recordDaily} from './daily.js';
import {hotelFor,PLACES} from './travel.js';
import {LAYOUT,isLocalRegion} from './geography.js';
import {LOTS} from './housing.js';
import {ensureTown} from './town.js';
import {ensureDeluxe} from './deluxe.js';

export const PACES={
 compact:{name:'ほどよく体験',meal:36,snack:20,drink:12,wash:12,rinse:6,soak:24,dry:6,cook:18},
 relaxed:{name:'ゆっくり過ごす',meal:150,snack:60,drink:45,wash:36,rinse:18,soak:108,dry:18,cook:60},
 real:{name:'長い時間を楽しむ',meal:900,snack:300,drink:180,wash:120,rinse:60,soak:480,dry:60,cook:180},
};
export const DISHES={
 tripMeal:{name:'旅先のランチプレート',kind:'meal',portions:6,hunger:60,thirst:25,mood:12,price:700},
 clean:{name:'家を、きれいに。',kind:'habit',portions:3,mood:8},
 stretch:{name:'体をほぐす、ひととき。',kind:'habit',portions:3,mood:5,energy:5},
 study:{name:'本から学ぶ、静かな時間。',kind:'habit',portions:3,mood:6},
 bread:{name:'焼きたてパン',kind:'snack',portions:4,hunger:35,thirst:0,mood:5,item:'bread'},
 apple:{name:'りんご',kind:'snack',portions:4,hunger:20,thirst:12,mood:5,item:'apple'},
 homemade:{name:'採れたて野菜のプレート',kind:'meal',portions:6,hunger:65,thirst:15,mood:12},
 cafe:{name:'森のカフェのランチ',kind:'meal',portions:6,hunger:65,thirst:25,mood:14,price:650},
 cafeBreakfast:{name:'カフェの朝ごはん',kind:'meal',portions:6,hunger:50,thirst:25,mood:12,price:450},
 dinner:{name:'湯宿の夕ごはん',kind:'meal',portions:6,hunger:90,thirst:70,mood:15},
 breakfast:{name:'湯宿の朝ごはん',kind:'meal',portions:6,hunger:65,thirst:45,mood:12},
 bento:{name:'車窓と楽しむ駅弁',kind:'meal',portions:6,hunger:55,thirst:65,mood:12,price:1200},
 coffee:{name:'自宅のコーヒー',kind:'drink',portions:3,hunger:0,thirst:30,mood:12,energy:18},
 cafeCoffee:{name:'カフェのコーヒー',kind:'drink',portions:3,hunger:0,thirst:40,mood:12,energy:20,price:450},
 water:{name:'冷たい水',kind:'drink',portions:3,hunger:0,thirst:100,mood:1},
 tea:{name:'湯宿のお茶',kind:'drink',portions:3,hunger:0,thirst:50,mood:10},
 cook:{name:'野菜のプレートを作る',kind:'cook',portions:3},
 publicBath:{name:'こもれび湯',kind:'bath',price:350},
 shower:{name:'自宅のシャワー',kind:'bath'},
 hotelBath:{name:'湯宿の露天風呂',kind:'bath'},
};
export function freshRoutines(){return {version:1,pace:'compact',active:null,meals:0,baths:0,breakfastDay:0,lastMealDay:0,lastMealMinutes:0};}
export function ensureRoutines(s){if(!s.routines)s.routines=freshRoutines();return s.routines;}
const phases=['ready','chewing','wash-walk','wash-ready','washing','rinse-ready','rinsing','soak-walk','soaking','dry-ready','drying'];
const point=v=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<300);
export function validRoutines(r){
 if(!r||r.version!==1||!Object.hasOwn(PACES,r.pace)||!['meals','baths','breakfastDay','lastMealDay'].every(k=>Number.isInteger(r[k])&&r[k]>=0)||!Number.isFinite(r.lastMealMinutes)||r.lastMealMinutes<0||r.lastMealMinutes>=1440)return false;
 const a=r.active;if(a===null)return true;
 return !!a&&Object.hasOwn(DISHES,a.id)&&DISHES[a.id].kind===a.kind&&phases.includes(a.phase)&&!(a.id==='shower'&&['soak-walk','soaking'].includes(a.phase))&&(a.kind==='bath'?a.phase!=='ready'&&a.phase!=='chewing':['ready','chewing'].includes(a.phase))&&a.portionSeconds>0&&a.washSeconds>0&&a.rinseSeconds>0&&a.soakSeconds>0&&a.drySeconds>0&&typeof a.paused==='boolean'&&point(a.anchor)&&typeof a.region==='string'&&Object.hasOwn(PLACES,a.region)&&Number.isFinite(a.yaw)&&(!['chewing','washing','rinsing','soaking','drying'].includes(a.phase)||a.remaining>0)&&['remaining','elapsed','portionSeconds','washSeconds','rinseSeconds','soakSeconds','drySeconds'].every(k=>Number.isFinite(a[k])&&a[k]>=0&&a[k]<=86400)&&Number.isInteger(a.done)&&a.done>=0&&(a.kind==='bath'?a.done<=3:a.done<DISHES[a.id].portions)&&Number.isInteger(a.day)&&a.day>=1;
}
const distance=(s,x,z)=>Math.hypot(s.position[0]-x,s.position[2]-z);
export function homeFixturePoint(s,type){let point=null,best=3.5;for(const[id,p]of Object.entries(s.housing?.lots||{})){if(!p.style)continue;for(const f of p.furniture){if(f.type!==type)continue;const x=LOTS[id].x+f.x,z=LOTS[id].z+f.z,d=distance(s,x,z);if(d<best){best=d;point=[x,z];}}}return point;}
export const nearbyHomeFixture=(s,type)=>homeFixturePoint(s,type)!==null;
export function mealPeriod(minutes){return minutes>=360&&minutes<600?'朝ごはんの時間':minutes>=660&&minutes<900?'お昼ごはんの時間':minutes>=1080&&minutes<1320?'夕ごはんの時間':'おやつ・くつろぎの時間';}
export function serviceHours(id){return {cafe:'11:00〜20:30',cafeBreakfast:'7:00〜11:00',cafeCoffee:'7:00〜21:00',dinner:'18:00〜21:00',breakfast:'7:00〜10:00',tripMeal:'7:00〜21:00',publicBath:'6:00〜23:00',hotelBath:'5:00〜24:00'}[id]||'いつでも';}
function during(s,start,end){return s.minutes>=start&&s.minutes<end;}
export function routinePrice(s,id){if(['dinner','breakfast'].includes(id)&&!hotelFor(s).meals)return id==='dinner'?1800:850;return DISHES[id]?.price||0;}
export function routineAvailability(s,id){
 const item=DISHES[id];if(!item)return {ok:false,reason:'この体験はありません。'};
 if(ensureRoutines(s).active)return {ok:false,reason:'途中の食事・入浴を再開するか、片づけてください。'};
 const t=s.travel,town=ensureTown(s),money=s.money;
 let reason='';if(id==='tripMeal'&&(!TRIP_DESTINATIONS[t?.region]||distance(s,8,5.7)>3.8||!during(s,420,1260)))reason='旅先のカフェで 7:00〜21:00 に注文できます。';if(item.kind==='habit'){const a=habitAvailability(s,id);if(!a.ok)reason=a.reason;}
 if(item.item&&!s.inventory[item.item])reason='持ちものがありません。';
 if(id==='homemade'&&!town.meals)reason='先にキッチンで料理を作りましょう。';
 if(['cafe','cafeBreakfast','cafeCoffee'].includes(id)){
  if(t?.region!=='cafe')reason='森のカフェの店内で注文してください。';
  else if(!during(s,id==='cafe'?660:420,id==='cafe'?1230:id==='cafeBreakfast'?660:1260))reason=`提供時間は ${serviceHours(id)} です。`;
 }
 if(['dinner','breakfast'].includes(id)){
  if(!['hotel','room'].includes(t?.region)||!t.stay)reason='宿泊の手続きが必要です。';
  else if(!during(s,id==='dinner'?1080:420,id==='dinner'?1260:600))reason=`お食事は ${serviceHours(id)} にご用意します。`;
  else if(id==='dinner'&&t.stay.dinnerDay===s.day||id==='breakfast'&&ensureRoutines(s).breakfastDay===s.day)reason='今日のお食事は提供済みです。';
  else if(id==='breakfast'&&!t.stay.rested)reason='朝ごはんは宿泊の翌朝にご用意します。';
 }
 if(id==='bento'&&t?.region!=='train')reason='駅弁は新幹線の車内で購入します。';
 if(id==='coffee'&&(!s.inventory.coffee||!(isLocalRegion(t?.region)&&((distance(s,-3.2,-5.2)<4)||nearbyHomeFixture(s,'kitchen')))))reason='豆を用意して、自宅のキッチンで淹れましょう。';
 if(id==='tea'&&(!['hotel','room'].includes(t?.region)||!t.stay))reason='宿泊の手続きをしたお部屋でどうぞ。';
 if(id==='cook'&&(!['home','residential'].includes(t?.region)||(!nearbyHomeFixture(s,'kitchen')&&distance(s,-2.15,-5.15)>4)||town.tomatoes<1||(!town.fish&&!s.inventory.bread)))reason='自宅のキッチンと、トマト1個・魚またはパン1個が必要です。';
 if(id==='publicBath'){
  if(!isLocalRegion(t?.region)||distance(s,-90,31)>9)reason='こもれび湯の入口または洗い場で受付をしてください。';
  else if(!during(s,360,1380))reason=`営業時間は ${serviceHours(id)} です。`;
 }
 if(id==='shower'&&(!isLocalRegion(t?.region)||!nearbyHomeFixture(s,'shower')))reason='自分で置いたシャワーの近くで使えます。';
 if(id==='hotelBath'){
  if(t?.region!=='room'||!t.stay)reason='宿泊の手続きをして、客室の露天風呂へどうぞ。';
  else if(!during(s,300,1440))reason=`入浴できる時間は ${serviceHours(id)} です。`;
 }
 if(money<routinePrice(s,id))reason='所持金が足りません。';
 return {ok:!reason,reason:reason||`${serviceHours(id)} · ごゆっくりどうぞ。`};
}
export function beginRoutine(s,id){
 if(!routineAvailability(s,id).ok)return false;
 const r=ensureRoutines(s),dish=DISHES[id],p=PACES[r.pace],town=ensureTown(s);
 if(dish.item)s.inventory[dish.item]--;
 if(id==='homemade')town.meals--;
 if(id==='coffee')s.inventory.coffee--;
 if(id==='cook'){town.tomatoes--;if(town.fish)town.fish--;else s.inventory.bread--;}
 const fee=routinePrice(s,id);if(fee)s.money-=fee;
 if(id==='dinner')s.travel.stay.dinnerDay=s.day;
 if(id==='breakfast')r.breakfastDay=s.day;
 const d=ensureDeluxe(s);d.riding=false;const fixture=id==='shower'?homeFixturePoint(s,'shower'):null;
 r.active={id,kind:dish.kind,phase:dish.kind==='bath'?'wash-walk':'ready',paused:false,done:0,remaining:0,elapsed:0,portionSeconds:(dish.kind==='habit'?p.snack:p[dish.kind]||p.meal)/(dish.portions||1),washSeconds:p.wash/3,rinseSeconds:p.rinse,soakSeconds:p.soak,drySeconds:p.dry,anchor:fixture?[fixture[0],1.65,fixture[1]]:[...s.position],region:s.travel?.region||'home',yaw:s.yaw||0,day:s.day};
 return true;
}
export function routineTarget(a){if(a.phase==='wash-walk')return a.id==='publicBath'?[-95,31]:a.id==='hotelBath'?[5.2,-1.5]:[a.anchor[0],a.anchor[2]];if(a.phase==='soak-walk')return a.id==='publicBath'?[-90,34]:[7,-3];return null;}
export function canResumeRoutine(s){
 const a=ensureRoutines(s).active;if(!a)return false;
 if(['bread','apple','homemade','bento','water'].includes(a.id))return true;
 const same=a.region===s.travel?.region||isLocalRegion(a.region)&&isLocalRegion(s.travel?.region);if(!same)return false;
 if(a.kind==='bath'&&!['wash-walk','soak-walk'].includes(a.phase)){
  const washed=['soaking','dry-ready','drying'].includes(a.phase);
  const target=a.id==='publicBath'?(washed?[-90,34]:[-95,31]):a.id==='hotelBath'?(washed?[7,-3]:[5.2,-1.5]):[a.anchor[0],a.anchor[2]];
  return distance(s,...target)<(a.id==='shower'?.65:2.2);
 }
 return distance(s,a.anchor[0],a.anchor[2])<(a.kind==='cook'?3.5:12);
}
export const routineReach=a=>a.id==='shower'?.5:1.7;
export function routineInput(s){
 const a=ensureRoutines(s).active;if(!a||a.paused)return false;
 if(a.phase==='ready'){a.phase='chewing';a.remaining=a.portionSeconds;return true;}
 if(['wash-walk','soak-walk'].includes(a.phase)){
  const target=routineTarget(a);if(distance(s,...target)>routineReach(a))return false;
  if(a.phase==='wash-walk'){a.phase='washing';a.remaining=a.washSeconds;}
  else {a.phase='soaking';a.remaining=a.soakSeconds;}
  return true;
 }
 if(a.phase==='wash-ready'){a.phase='washing';a.remaining=a.washSeconds;return true;}
 if(a.phase==='rinse-ready'){a.phase='rinsing';a.remaining=a.rinseSeconds;return true;}
 if(a.phase==='dry-ready'){a.phase='drying';a.remaining=a.drySeconds;return true;}
 return false;
}
function finishRoutine(s,a){const r=ensureRoutines(s),dish=DISHES[a.id];if(a.kind==='habit'){recordDaily(s,a.id);}else if(a.kind==='bath'){r.baths++;recordDaily(s,'bath');ensureDeluxe(s).hygiene=100;if(a.id==='shower')s.energy=Math.min(100,s.energy+10);s.mood=Math.min(100,s.mood+8);}else if(a.kind==='cook'){const t=ensureTown(s);t.meals++;recordDaily(s,'cook');if(!t.achievements.includes('first-meal'))t.achievements.push('first-meal');}else if(dish.kind!=='drink'){r.meals++;recordDaily(s,'meal');r.lastMealDay=s.day;r.lastMealMinutes=s.minutes;if(!s.completed.includes('eat'))s.completed.push('eat');}if(a.id==='coffee'&&!s.completed.includes('coffee'))s.completed.push('coffee');r.active=null;return a.id;}
export function advanceRoutine(s,seconds){
 const r=ensureRoutines(s),a=r.active;if(!a||a.paused||!Number.isFinite(seconds)||seconds<=0)return null;
 const dt=Math.min(seconds,60);a.elapsed=Math.min(86399,a.elapsed+dt);
 if(a.remaining<=0)return null;
 const used=Math.min(dt,a.remaining);a.remaining=Math.max(0,a.remaining-dt);
 if(a.phase==='soaking'){s.energy=Math.min(100,s.energy+used*(a.id==='hotelBath'?30:25)/a.soakSeconds);s.mood=Math.min(100,s.mood+used*4/a.soakSeconds);}
 if(a.remaining>1e-7)return null;a.remaining=0;
 if(a.phase==='chewing'){
  const dish=DISHES[a.id];if(a.kind!=='cook')for(const [key,total]of Object.entries({hunger:dish.hunger||0,thirst:dish.thirst||0,mood:dish.mood||0,energy:dish.energy||0}))s[key]=Math.min(100,s[key]+total/dish.portions);
  a.done++;if(a.done>=dish.portions)return finishRoutine(s,a);a.phase='ready';
 }else if(a.phase==='washing'){a.done++;ensureDeluxe(s).hygiene=Math.min(95,ensureDeluxe(s).hygiene+30);a.phase=a.done>=3?'rinse-ready':'wash-ready';}
 else if(a.phase==='rinsing'){ensureDeluxe(s).hygiene=Math.min(98,ensureDeluxe(s).hygiene+8);a.phase=a.id==='shower'?'dry-ready':'soak-walk';}
 else if(a.phase==='soaking')a.phase='dry-ready';
 else if(a.phase==='drying')return finishRoutine(s,a);
 return null;
}
export function pauseRoutine(s){const a=ensureRoutines(s).active;if(a)a.paused=true;}
export function resumeRoutine(s){const a=ensureRoutines(s).active;if(!a||!canResumeRoutine(s))return false;a.paused=false;ensureDeluxe(s).riding=false;return true;}
export function discardRoutine(s){const r=ensureRoutines(s);if(!r.active)return false;r.active=null;return true;}
export const routineLocksMovement=s=>{const a=s.routines?.active;return !!a&&!a.paused&&!['wash-walk','soak-walk'].includes(a.phase);};
export function routineClockScale(s){const a=s.routines?.active;if(!a||a.paused)return 1;const dish=DISHES[a.id],total=a.kind==='bath'?a.washSeconds*3+a.rinseSeconds+(a.id==='shower'?0:a.soakSeconds)+a.drySeconds:a.portionSeconds*dish.portions;const minutes=a.kind==='bath'?(a.id==='shower'?10:30):a.kind==='habit'?(a.id==='study'?30:10):a.kind==='cook'||a.kind==='meal'?20:5;return Math.min(1,minutes/(2*total));}
