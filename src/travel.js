import {validRailOptions,railQuote,ticketFare,ticketQuote} from './rail.js';
import {TRIP_DESTINATIONS,EXTRA_HOTELS} from './destinations.js';
import {recordDaily} from './daily.js';
import {DISTRICTS} from './town.js';
// Fares, hotel services and durations are game settings.
export const HOTEL_NAME='京都 嵐山温泉 花伝抄';
export const TRAVEL={railFare:14000,railMinutes:140,localFare:240,localMinutes:25,roomFare:22000};
export const HOTEL_TIERS={basic:{rank:1,name:'ベーシック'},standard:{rank:2,name:'スタンダード'},deluxe:{rank:3,name:'デラックス'}};
export const HOTELS={
 ...EXTRA_HOTELS,
 kadensho:{id:'kadensho',tier:'deluxe',roomName:'デラックスツイン',referenceStatus:'pending',name:HOTEL_NAME,price:22000,meals:true,style:'ryokan',tag:'温泉旅館',description:'デラックスツインの内装再現を予定。客室写真・間取りは未照合で、現在は仮配置です。食事はゲーム設定で2食付き。',floor:'#c3bc8d',linen:'#d5d3ba',wall:'#d4ccb0'},
 komorebi:{id:'komorebi',tier:'standard',roomName:'和のツインルーム',referenceStatus:'original',name:'嵐山 こもれび庵',price:12000,meals:true,style:'lodge',tag:'森の小宿',description:'木のぬくもりと緑の寝具。夕食・朝食付きの、ゲームオリジナルの宿。',floor:'#bc9d73',linen:'#a4b6a0',wall:'#dce0ce'},
 machiya:{id:'machiya',tier:'basic',roomName:'ベッドツインルーム',referenceStatus:'original',name:'嵐山 まちやステイ',price:6800,meals:false,style:'townhouse',tag:'素泊まり',description:'気軽な一泊に。食事は夕食 ¥1,800・朝食 ¥850で追加できる、ゲームオリジナルの宿。',floor:'#bbac95',linen:'#a7bdc2',wall:'#e4dfd4'},
};
export const PLACES={...Object.fromEntries(Object.values(TRIP_DESTINATIONS).map(d=>[d.id,{name:d.name+' · '+d.subtitle,spawn:[0,1.65,16],yaw:0}])),...DISTRICTS,residential:{name:'こもれび住宅地',spawn:[0,1.65,49],yaw:0},home:{name:'木漏れ日の街',spawn:[0,1.65,9],yaw:0},tokyo:{name:'東京駅 · 東海道新幹線',spawn:[0,1.65,12],yaw:0},train:{name:'東海道新幹線 · 車内',spawn:[0,1.65,7.5],yaw:0},kyoto:{name:'京都駅 · 嵯峨野線のりかえ',spawn:[0,1.65,9],yaw:0},arashiyama:{name:'嵐山 · 渡月橋と竹の小径',spawn:[0,1.65,13],yaw:0},hotel:{name:HOTEL_NAME+' · ロビー',spawn:[0,1.65,7],yaw:0},room:{name:HOTEL_NAME+' · 客室と露天風呂',spawn:[0,1.65,6],yaw:0}};
export function freshTravel(){return {version:2,region:'home',ticket:null,journey:null,stay:null,visited:[],hotelId:'kadensho',reservation:null,plan:null,returnTicket:false,localPass:0,ticketDay:0,excursion:null,memories:[],hotelReturn:null};}
export function ensureTravel(s){
 if(!s.travel)s.travel=freshTravel();
 const t=s.travel;if(t.excursion===undefined)t.excursion=null;if(t.memories===undefined)t.memories=[];if(t.hotelReturn===undefined)t.hotelReturn=null;
 if(t.version!==2){if(Number.isInteger(t.funds)&&t.funds>=0)s.money+=t.funds;delete t.funds;t.version=2;}
 if(t.returnTicket===undefined)t.returnTicket=false;if(t.localPass===undefined)t.localPass=0;if(t.ticketDay===undefined)t.ticketDay=0;
 if(t.hotelId===undefined)t.hotelId='kadensho';if(t.reservation===undefined)t.reservation=null;if(t.plan===undefined)t.plan=null;
 return t;
}
export function hotelFor(s){return HOTELS[s.travel?.hotelId]||HOTELS.kadensho;}
export function validTravel(t){
 if(!t||!Object.hasOwn(PLACES,t.region)||!Array.isArray(t.visited)||!t.visited.every(p=>Object.hasOwn(PLACES,p)))return false;
 if(t.version===undefined){if(!Number.isInteger(t.funds)||t.funds<0)return false;}else if(t.version!==2||t.funds!==undefined||!Object.hasOwn(HOTELS,t.hotelId))return false;
 if(t.version===2&&(typeof t.returnTicket!=='boolean'||!Number.isInteger(t.localPass)||t.localPass<0||t.localPass>2||!Number.isInteger(t.ticketDay)||t.ticketDay<0))return false;
 if(t.excursion!=null&&((t.excursion.service!==undefined&&!validRailOptions(t.excursion.service,t.excursion.seat||'window'))||(t.excursion.seat!==undefined&&!validRailOptions(t.excursion.service||'express',t.excursion.seat))||(t.excursion.fare!==undefined&&(!Number.isInteger(t.excursion.fare)||t.excursion.fare<=0||t.excursion.fare>100000))||!Object.hasOwn(TRIP_DESTINATIONS,t.excursion.destination)||!Number.isInteger(t.excursion.day)||t.excursion.day<1||typeof t.excursion.outbound!=='boolean'||typeof t.excursion.return!=='boolean'||(!t.excursion.outbound&&!t.excursion.return)))return false;
 if(t.memories!==undefined&&(!Array.isArray(t.memories)||t.memories.length>100||!t.memories.every(m=>typeof m==='string'&&m.length<100)))return false;
 if(t.hotelReturn!=null&&(!Object.hasOwn(PLACES,t.hotelReturn.region)||!Array.isArray(t.hotelReturn.position)||t.hotelReturn.position.length!==3||!t.hotelReturn.position.every(n=>Number.isFinite(n)&&Math.abs(n)<300)||!Number.isFinite(t.hotelReturn.yaw)))return false;
 if(t.ticket!==null&&!['tokyo','kyoto'].includes(t.ticket))return false;
 if(t.journey!==null){const j=t.journey;if(!j||(!['tokyo','kyoto'].includes(j.destination)&&!Object.hasOwn(TRIP_DESTINATIONS,j.destination))||!Number.isFinite(j.remaining)||j.remaining<0)return false;if(j.service!==undefined){if(!validRailOptions(j.service,j.seat||'window')||(!['tokyo','kyoto'].includes(j.origin)&&!Object.hasOwn(TRIP_DESTINATIONS,j.origin))||!Number.isInteger(j.total)||j.total<=0||j.total>1440||j.remaining>j.total)return false;}else if(j.remaining>TRAVEL.railMinutes||!['tokyo','kyoto'].includes(j.destination))return false;}
 if((t.region==='train')!==(t.journey!==null))return false;
 if(t.stay!==null&&(!Number.isInteger(t.stay?.checkInDay)||t.stay.checkInDay<1||typeof t.stay.rested!=='boolean'||!Number.isInteger(t.stay.dinnerDay)||t.stay.dinnerDay<0))return false;
 if(t.region==='room'&&!t.stay)return false;
 if(t.reservation!=null&&(!Object.hasOwn(HOTELS,t.reservation.hotelId)||!Number.isInteger(t.reservation.day)||t.reservation.day<1||t.reservation.price!==HOTELS[t.reservation.hotelId].price||t.stay||t.reservation.hotelId!==t.hotelId))return false;
 if(t.plan!=null&&(!['daytrip','overnight','tokyo'].includes(t.plan.kind)||!Number.isInteger(t.plan.day)||t.plan.day<1||!Object.hasOwn(HOTELS,t.plan.hotelId)))return false;
 return true;
}
function advance(s,minutes){s.minutes+=minutes;while(s.minutes>=1440){s.minutes-=1440;s.day++;}s.hunger=Math.max(0,s.hunger-minutes*.175);s.thirst=Math.max(0,s.thirst-minutes*.25);}
function carryReservation(s,destination){const t=ensureTravel(s),r=t.reservation;if(r&&(HOTELS[r.hotelId].destination||'arashiyama')===destination&&r.day<s.day){r.day=s.day;if(t.plan?.hotelId===r.hotelId)t.plan.day=s.day;}}
export function visit(s,region){if(!Object.hasOwn(PLACES,region))return false;const t=ensureTravel(s);t.region=region;if(region==='arashiyama'||Object.hasOwn(TRIP_DESTINATIONS,region))recordDaily(s,'trip',true);if(!t.visited.includes(region))t.visited.push(region);s.position=[...PLACES[region].spawn];s.yaw=PLACES[region].yaw;s.pitch=0;return true;}
export function railDestination(s){return ['kyoto','arashiyama','hotel','room'].includes(ensureTravel(s).region)?'tokyo':'kyoto';}
export function reserveRailTicket(s,day=s.day){const t=ensureTravel(s);if(t.region==='train'||t.ticket||!Number.isInteger(day)||day<s.day||day>s.day+30||s.money<TRAVEL.railFare)return false;s.money-=TRAVEL.railFare;t.ticket=railDestination(s);t.ticketDay=day;return true;}
export function buyRailTicket(s){const t=ensureTravel(s);if(!['tokyo','kyoto'].includes(t.region))return false;return reserveRailTicket(s);}
export function cancelRailTicket(s){const t=ensureTravel(s),refund=(t.ticket?TRAVEL.railFare:0)+(t.returnTicket?TRAVEL.railFare:0)+t.localPass*TRAVEL.localFare;if(!refund)return false;t.ticket=null;t.returnTicket=false;t.localPass=0;t.ticketDay=0;s.money+=refund;return true;}
export function tripEstimate(kind,hotelId='kadensho',options={}){const h=HOTELS[hotelId],d=TRIP_DESTINATIONS[h?.destination];return kind==='tokyo'?0:(d?(railQuote(d.id,options.service,options.seat)?.fare??Infinity)*2:TRAVEL.railFare*2+TRAVEL.localFare*2)+(kind==='overnight'?h.price:0);}
export function bookPackage(s,kind,hotelId,day,options={}){const t=ensureTravel(s),h=HOTELS[hotelId];if(!['daytrip','overnight'].includes(kind)||!h||!['home','residential','cafe','library','garden','hill','waterfront','tokyo'].includes(t.region)||t.ticket||t.returnTicket||t.localPass||t.stay||t.reservation||t.excursion||!Number.isInteger(day)||day<s.day||day>s.day+30||s.money<tripEstimate(kind,hotelId,options))return false;s.money-=tripEstimate(kind,hotelId,options);if(TRIP_DESTINATIONS[h.destination]){const q=railQuote(h.destination,options.service,options.seat);t.excursion={destination:h.destination,day,outbound:true,return:true,service:q.service,seat:q.seat,fare:q.fare};}else{t.ticket='kyoto';t.ticketDay=day;t.returnTicket=true;t.localPass=2;}t.hotelId=hotelId;if(kind==='overnight')t.reservation={hotelId,day,price:h.price};t.plan={kind,day,hotelId};return true;}
export function saveTripPlan(s,kind,day,hotelId='kadensho'){if(!['daytrip','overnight','tokyo'].includes(kind)||!Number.isInteger(day)||day<s.day||day>s.day+30||!Object.hasOwn(HOTELS,hotelId))return false;ensureTravel(s).plan={kind,day,hotelId};return true;}
export function reserveHotel(s,hotelId,day){const t=ensureTravel(s),h=HOTELS[hotelId];if(!h||t.stay||t.reservation||(t.region==='hotel'&&t.hotelId!==hotelId)||!Number.isInteger(day)||day<s.day||day>s.day+30||s.money<h.price)return false;s.money-=h.price;t.hotelId=hotelId;t.reservation={hotelId,day,price:h.price};return true;}
export function cancelHotel(s){const t=ensureTravel(s);if(!t.reservation)return false;s.money+=t.reservation.price;t.reservation=null;return true;}
export function canCheckIn(s){const t=ensureTravel(s);return t.region==='hotel'&&!t.stay&&(t.reservation?t.reservation.day===s.day:s.money>=hotelFor(s).price);}
export function boardTrain(s){const t=ensureTravel(s),target=t.region==='tokyo'?'kyoto':t.region==='kyoto'?'tokyo':null;if(!target||t.ticket!==target||t.ticketDay>s.day)return false;t.ticket=null;t.ticketDay=0;t.journey={destination:target,remaining:TRAVEL.railMinutes};visit(s,'train');return true;}
export function progressJourney(s,minutes){const t=ensureTravel(s);if(t.region!=='train'||!Number.isFinite(minutes)||minutes<0)return false;t.journey.remaining=Math.max(0,t.journey.remaining-minutes);return t.journey.remaining===0;}
export function rideToArrival(s){const t=ensureTravel(s);if(t.region!=='train')return false;advance(s,t.journey.remaining);s.energy=Math.min(100,s.energy+15);t.journey.remaining=0;return true;}
export function leaveTrain(s){const t=ensureTravel(s);if(t.region!=='train'||t.journey.remaining>0)return false;const destination=t.journey.destination;t.journey=null;visit(s,destination);carryReservation(s,destination);if(destination==='kyoto'&&t.returnTicket){t.ticket='tokyo';t.ticketDay=0;t.returnTicket=false;}return true;}
export function localTrain(s){const t=ensureTravel(s);if(!['kyoto','arashiyama'].includes(t.region)||(!t.localPass&&s.money<TRAVEL.localFare))return false;if(t.localPass)t.localPass--;else s.money-=TRAVEL.localFare;advance(s,TRAVEL.localMinutes);visit(s,t.region==='kyoto'?'arashiyama':'kyoto');carryReservation(s,t.region);return true;}
export function checkIn(s){if(!canCheckIn(s))return false;const t=ensureTravel(s);if(t.reservation)t.reservation=null;else s.money-=hotelFor(s).price;t.stay={checkInDay:s.day,rested:false,dinnerDay:0};advance(s,Math.max(0,900-s.minutes));return true;}
export function enterRoom(s){const t=ensureTravel(s);if(t.region!=='hotel'||!t.stay)return false;visit(s,'room');return true;}
export function hotelDinner(s){const t=ensureTravel(s);if(!['hotel','room'].includes(t.region)||!t.stay||t.stay.dinnerDay===s.day)return false;const fee=hotelFor(s).meals?0:1800;if(s.money<fee)return false;s.money-=fee;t.stay.dinnerDay=s.day;advance(s,45);s.hunger=100;s.thirst=100;s.mood=Math.min(100,s.mood+15);return true;}
export function bathe(s){const t=ensureTravel(s);if(t.region!=='room'||!t.stay)return false;advance(s,30);s.energy=Math.min(100,s.energy+30);s.mood=Math.min(100,s.mood+25);return true;}
export function sleepAtHotel(s){const t=ensureTravel(s);if(t.region!=='room'||!t.stay||t.stay.rested)return false;t.stay.rested=true;const destination=hotelFor(s).destination;if(destination){t.memories.push(destination+':stay:'+s.day);t.memories=t.memories.slice(-100);}if(!s.completed.includes('hotel-stay'))s.completed.push('hotel-stay');s.day++;s.minutes=420;s.energy=100;s.hunger=Math.max(10,s.hunger-20);s.thirst=Math.max(10,s.thirst-20);return true;}
export function checkOut(s){const t=ensureTravel(s);if(t.region!=='hotel'||!t.stay)return false;t.stay=null;return true;}

export function excursionDestination(s){const t=ensureTravel(s);return t.excursion?.destination||HOTELS[t.reservation?.hotelId]?.destination||HOTELS[t.plan?.hotelId]?.destination||null;}
export function canBookExcursion(s,destination,day=s.day,options={}){const t=ensureTravel(s);return Object.hasOwn(TRIP_DESTINATIONS,destination)&&['home','residential','cafe','library','garden','hill','waterfront','tokyo'].includes(t.region)&&!t.excursion&&Number.isInteger(day)&&day>=s.day&&day<=s.day+30&&s.money>=(railQuote(destination,options.service,options.seat)?.fare??Infinity)*2;}
export function bookExcursion(s,destination,day=s.day,options={}){if(!canBookExcursion(s,destination,day,options))return false;const t=ensureTravel(s),q=railQuote(destination,options.service,options.seat);s.money-=q.fare*2;t.excursion={destination,day,outbound:true,return:true,service:q.service,seat:q.seat,fare:q.fare};return true;}
export function changeExcursion(s,service,seat){const t=ensureTravel(s),p=t.excursion,q=p&&railQuote(p.destination,service,seat);if(!q||!p.outbound||!p.return||t.region==='train')return false;const difference=2*(q.fare-ticketFare(p));if(s.money<difference)return false;s.money-=difference;Object.assign(p,{service,seat,fare:q.fare});return true;}
export function canRideExcursion(s,options={}){const t=ensureTravel(s),p=t.excursion;if(t.region==='tokyo')return !!p?.outbound&&p.day<=s.day&&[[-3.7,12.5,4],[4.85,3,3.2]].some(([x,z,r])=>Math.hypot(s.position[0]-x,s.position[2]-z)<=r);const d=TRIP_DESTINATIONS[t.region];return !!d&&!t.stay&&Math.hypot(s.position[0],s.position[2]-20)<=4&&((p?.destination===t.region&&p.return)||s.money>=(railQuote(d.id,options.service,options.seat)?.fare??Infinity));}
export function cancelExcursion(s){const t=ensureTravel(s),p=t.excursion;if(!p)return false;s.money+=ticketFare(p)*((p.outbound?1:0)+(p.return?1:0));t.excursion=null;return true;}
export function boardExcursion(s,options={}){
 if(!canRideExcursion(s,options))return false;
 const t=ensureTravel(s),p=t.excursion,origin=t.region;
 const prepaid=origin==='tokyo'||(p?.destination===origin&&p.return);
 const destination=origin==='tokyo'?p.destination:'tokyo';
 const q=prepaid?ticketQuote(p):railQuote(origin,options.service,options.seat);
 if(!q)return false;
 if(origin==='tokyo')p.outbound=false;else if(prepaid)p.return=false;else s.money-=q.fare;
 if(p&&!p.outbound&&!p.return)t.excursion=null;
 t.journey={destination,origin,service:q.service,seat:q.seat,total:q.minutes,remaining:q.minutes};
 visit(s,'train');s.position=[0,1.65,8.3];return true;
}
// Legacy convenience for simulations; the player boards and spends time in the carriage.
export function rideExcursion(s,options={}){if(!boardExcursion(s,options))return false;rideToArrival(s);return leaveTrain(s);}
export function restOnTrain(s,minutes=10){const j=ensureTravel(s).journey;if(s.travel.region!=='train'||!j||!Number.isFinite(minutes)||minutes<=0||j.remaining<=0)return false;const elapsed=Math.min(minutes,j.remaining);advance(s,elapsed);progressJourney(s,elapsed);s.energy=Math.min(100,s.energy+elapsed*.08);s.mood=Math.min(100,s.mood+elapsed*.02);return true;}
export function enterRegionHotel(s,id){const t=ensureTravel(s),h=HOTELS[id];if(!h||(h.destination||'arashiyama')!==t.region||(t.reservation&&t.reservation.hotelId!==id)||(t.stay&&t.hotelId!==id))return false;t.hotelReturn={region:t.region,position:[...s.position],yaw:s.yaw||0};t.hotelId=id;visit(s,'hotel');return true;}
export function leaveRegionHotel(s){const t=ensureTravel(s);if(t.region!=='hotel')return false;const back=t.hotelReturn,destination=hotelFor(s).destination||'arashiyama';visit(s,destination);if(back?.region===destination){s.position=[...back.position];s.yaw=back.yaw;}return true;}
export function rememberDestination(s,type){const t=ensureTravel(s);if(!TRIP_DESTINATIONS[t.region]||!['photo','stamp'].includes(type))return false;const id=t.region+':'+type+':'+s.day;if(t.memories.includes(id))return false;t.memories.push(id);t.memories=t.memories.slice(-100);s.mood=Math.min(100,s.mood+8);recordDaily(s,type==='photo'?'photo':'trip',true);return true;}
