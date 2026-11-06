import {TRIP_DESTINATIONS} from './destinations.js';

// Original game services. These are not real railway timetables or fares.
export const TRAIN_SERVICES={
 local:{id:'local',name:'街めぐり普通列車',short:'普通列車',fareFactor:.7,timeFactor:1.5,color:'#6e998c',description:'お手頃な運賃。ベンチ席と広い出入口で、途中の街もゆっくり眺めます。',stops:4},
 express:{id:'express',name:'こもれび特急',short:'特急',fareFactor:1,timeFactor:1,color:'#577b98',description:'乗り換えなしで目的地へ。向かい合わせの座席と荷物棚のある、いつもの特急。',stops:2},
 panorama:{id:'panorama',name:'展望観光列車',short:'展望列車',fareFactor:1.3,timeFactor:1.2,color:'#b58b58',description:'大きな窓とラウンジのある車内。海や山を眺める時間も、旅の楽しみに。',stops:3},
 premium:{id:'premium',name:'プレミアム特急',short:'プレミアム',fareFactor:1.7,timeFactor:.8,color:'#24483f',description:'幅広いソファ席、深い木目と真鍮の装飾、間接照明。テーブル付きの贅沢な車内でゆったり。',stops:2},
};
export const SEAT_CHOICES={window:'窓側を希望',aisle:'通路側を希望'};
export function validRailOptions(service='express',seat='window'){return Object.hasOwn(TRAIN_SERVICES,service)&&Object.hasOwn(SEAT_CHOICES,seat);}
export function railQuote(destination,service='express',seat='window'){
 if(!Object.hasOwn(TRIP_DESTINATIONS,destination)||!validRailOptions(service,seat))return null;
 const d=TRIP_DESTINATIONS[destination],r=TRAIN_SERVICES[service];
 return {destination,service,seat,fare:Math.round(d.fare*r.fareFactor/100)*100,minutes:Math.round(d.minutes*r.timeFactor)};
}
export function ticketQuote(ticket){return ticket?railQuote(ticket.destination,ticket.service||'express',ticket.seat||'window'):null;}
export function ticketFare(ticket){return ticket?.fare??ticketQuote(ticket)?.fare??0;}
export function journeyInfo(journey){
 if(!journey)return null;
 const route=TRIP_DESTINATIONS[journey.destination]||TRIP_DESTINATIONS[journey.origin];
 const service=TRAIN_SERVICES[journey.service];
 const destination=TRIP_DESTINATIONS[journey.destination]?.name||(journey.destination==='kyoto'?'京都':'東京');
 const origin=TRIP_DESTINATIONS[journey.origin]?.name||(journey.destination==='kyoto'?'東京':'京都');
 const total=journey.total||140,progress=Math.max(0,Math.min(1,1-journey.remaining/total));
 const via=route?{coast:['川沿いの駅','海辺の駅'],lake:['里の駅','山あいの駅'],forest:['森の入口駅','杉並木の駅'],heritage:['古都の入口駅','緑の公園駅'],city:['川辺の駅','街の入口駅'],port:['海辺の駅','港の入口駅']}[route.kind]:[];
 const stops=[origin,...(via||[]).slice(0,Math.max(0,(service?.stops||2)-2)),destination];
 const next=stops[Math.min(stops.length-1,Math.floor(progress*(stops.length-1))+1)];
 return {name:service?.name||'東海道新幹線',destination,origin,total,progress,next,stops,seat:SEAT_CHOICES[journey.seat]||'指定席',route:route?.id||'kyoto',service:journey.service||'shinkansen'};
}
export function railChoicesMarkup(destination,service='express',seat='window',prefix='rail',legs=2){
 return `<div class="rail-pickers"><label>列車の種類<select id="${prefix}-service">${Object.values(TRAIN_SERVICES).map(r=>{const q=railQuote(destination,r.id,seat);return `<option value="${r.id}" ${r.id===service?'selected':''}>${r.short} · ${legs===2?'往復':'片道'} ¥${(q.fare*legs).toLocaleString('ja-JP')} · 片道${q.minutes}分</option>`;}).join('')}</select></label><label>座席の希望<select id="${prefix}-seat">${Object.entries(SEAT_CHOICES).map(([id,name])=>`<option value="${id}" ${id===seat?'selected':''}>${name}</option>`).join('')}</select></label></div>`;
}
