import {DISTRICTS} from './town.js';
// These fares and durations are scenario values, not live railway/hotel information.
export const HOTEL_NAME = '京都 嵐山温泉 花伝抄';
export const TRAVEL = {
 railFare: 14000, railMinutes: 140, localFare: 240, localMinutes: 25, roomFare: 22000,
};
export const PLACES = {
 ...DISTRICTS,
 residential:{name:'こもれび住宅地',spawn:[0,1.65,49],yaw:0},
 home: {name:'木漏れ日の街',spawn:[0,1.65,9],yaw:0},
 tokyo: {name:'東京駅 · 東海道新幹線',spawn:[0,1.65,12],yaw:0},
 train: {name:'東海道新幹線 · 車内',spawn:[0,1.65,7.5],yaw:0},
 kyoto: {name:'京都駅 · 嵯峨野線のりかえ',spawn:[0,1.65,9],yaw:0},
 arashiyama: {name:'嵐山 · 渡月橋と竹の小径',spawn:[0,1.65,13],yaw:0},
 hotel: {name:HOTEL_NAME+' · ロビー',spawn:[0,1.65,7],yaw:0},
 room: {name:HOTEL_NAME+' · 客室と露天風呂',spawn:[0,1.65,6],yaw:0},
};
export function freshTravel() { return {region:'home',funds:60000,ticket:null,journey:null,stay:null,visited:[]}; }
export function ensureTravel(s) { if(!s.travel)s.travel=freshTravel();return s.travel; }
export function validTravel(t) {
 if(!t||!Object.hasOwn(PLACES,t.region)||!Number.isInteger(t.funds)||t.funds<0||!Array.isArray(t.visited)||!t.visited.every(p=>Object.hasOwn(PLACES,p)))return false;
 if(t.ticket!==null&&!['tokyo','kyoto'].includes(t.ticket))return false;
 if(t.journey!==null&&(!['tokyo','kyoto'].includes(t.journey?.destination)||!Number.isFinite(t.journey.remaining)||t.journey.remaining<0||t.journey.remaining>TRAVEL.railMinutes))return false;
 if((t.region==='train')!==(t.journey!==null))return false;
 if(t.stay!==null&&(!Number.isInteger(t.stay?.checkInDay)||t.stay.checkInDay<1||typeof t.stay.rested!=='boolean'||!Number.isInteger(t.stay.dinnerDay)||t.stay.dinnerDay<0))return false;
 if(t.region==='room'&&!t.stay)return false;
 return true;
}
function advance(s,minutes) {s.minutes+=minutes;while(s.minutes>=1440){s.minutes-=1440;s.day++;}s.hunger=Math.max(0,s.hunger-minutes*.175);s.thirst=Math.max(0,s.thirst-minutes*.25);}
export function visit(s,region) {const t=ensureTravel(s);t.region=region;if(!t.visited.includes(region))t.visited.push(region);s.position=[...PLACES[region].spawn];s.yaw=PLACES[region].yaw;s.pitch=0;}
export function buyRailTicket(s) {const t=ensureTravel(s);if(!['tokyo','kyoto'].includes(t.region)||t.ticket||t.funds<TRAVEL.railFare)return false;t.ticket=t.region==='tokyo'?'kyoto':'tokyo';t.funds-=TRAVEL.railFare;return true;}
export function boardTrain(s) {const t=ensureTravel(s);const target=t.region==='tokyo'?'kyoto':t.region==='kyoto'?'tokyo':null;if(!target||t.ticket!==target)return false;t.ticket=null;t.journey={destination:target,remaining:TRAVEL.railMinutes};visit(s,'train');return true;}
export function progressJourney(s,minutes) {const t=ensureTravel(s);if(t.region!=='train'||!Number.isFinite(minutes)||minutes<0)return false;t.journey.remaining=Math.max(0,t.journey.remaining-minutes);return t.journey.remaining===0;}
export function rideToArrival(s) {const t=ensureTravel(s);if(t.region!=='train')return false;advance(s,t.journey.remaining);s.energy=Math.min(100,s.energy+15);t.journey.remaining=0;return true;}
export function leaveTrain(s) {const t=ensureTravel(s);if(t.region!=='train'||t.journey.remaining>0)return false;const destination=t.journey.destination;t.journey=null;visit(s,destination);return true;}
export function localTrain(s) {const t=ensureTravel(s);if(!['kyoto','arashiyama'].includes(t.region)||t.funds<TRAVEL.localFare)return false;t.funds-=TRAVEL.localFare;advance(s,TRAVEL.localMinutes);visit(s,t.region==='kyoto'?'arashiyama':'kyoto');return true;}
export function checkIn(s) {const t=ensureTravel(s);if(t.region!=='hotel'||t.stay||t.funds<TRAVEL.roomFare)return false;t.funds-=TRAVEL.roomFare;t.stay={checkInDay:s.day,rested:false,dinnerDay:0};advance(s,Math.max(0,900-s.minutes));return true;}
export function enterRoom(s) {const t=ensureTravel(s);if(t.region!=='hotel'||!t.stay)return false;visit(s,'room');return true;}
export function hotelDinner(s) {const t=ensureTravel(s);if(!['hotel','room'].includes(t.region)||!t.stay||t.stay.dinnerDay===s.day)return false;t.stay.dinnerDay=s.day;advance(s,45);s.hunger=100;s.thirst=100;s.mood=Math.min(100,s.mood+15);return true;}
export function bathe(s) {const t=ensureTravel(s);if(t.region!=='room'||!t.stay)return false;advance(s,30);s.energy=Math.min(100,s.energy+30);s.mood=Math.min(100,s.mood+25);return true;}
export function sleepAtHotel(s) {const t=ensureTravel(s);if(t.region!=='room'||!t.stay||t.stay.rested)return false;t.stay.rested=true;if(!s.completed.includes('hotel-stay'))s.completed.push('hotel-stay');s.day++;s.minutes=420;s.energy=100;s.hunger=Math.max(10,s.hunger-20);s.thirst=Math.max(10,s.thirst-20);return true;}
export function checkOut(s) {const t=ensureTravel(s);if(t.region!=='hotel'||!t.stay)return false;t.stay=null;return true;}

export function addTravelFunds(s) {const t=ensureTravel(s);if(s.money<1000)return false;s.money-=1000;t.funds+=1000;return true;}
