import {TRIP_DESTINATIONS} from './destinations.js';
import {HOTELS,TRAVEL,ensureTravel,rideExcursion,canRideExcursion,bookExcursion,canBookExcursion,excursionDestination,enterRegionHotel,rememberDestination} from './travel.js';
import {ensureTown} from './town.js';
import {routineAvailability} from './routines.js';
export function createDestinationUI({getLife,openPanel,actionList,closePanel,notify,changed,syncRegion,openTravel,startRoutine,capturePhoto,navigate}){
 let stationMode='platform';
 function ticketDay(s,id){const t=ensureTravel(s),r=t.reservation,p=t.plan;return Math.max(s.day,HOTELS[r?.hotelId]?.destination===id?r.day:HOTELS[p?.hotelId]?.destination===id?p.day:s.day);}
 function guide(){const s=getLife();if(s.travel?.region!=='tokyo')return false;const d=TRIP_DESTINATIONS[excursionDestination(s)];closePanel();navigate({name:(d?d.name+'ゆき':'観光列車')+'の乗車口',point:[-3.7,12.5],region:'tokyo',arrival:'乗車口に着きました。案内板を見て E を押してください。'});return true;}
 function station(mode='platform'){
  stationMode=mode;const s=getLife(),t=ensureTravel(s),p=t.excursion;
  if(t.region!=='tokyo'){
   const d=TRIP_DESTINATIONS[t.region];if(!d)return;
   const paid=p?.destination===t.region&&p.return;
   actionList(d.name+'駅・東京方面',`移動 ${d.minutes}分。${paid?'帰りの乗車券は支払い済みです。':`片道 ¥${d.fare.toLocaleString('ja-JP')}。`}${t.stay?' 宿をチェックアウトしてからお戻りください。':''}`,[{id:'dest-ride',label:'東京駅へ帰る',detail:'駅から移動 →',disabled:!canRideExcursion(s)},{id:'dest-open-site',label:'予約を確認する'}]);return;
  }
  const selected=excursionDestination(s),d=TRIP_DESTINATIONS[selected],actions=[];
  let description=d?`${d.name}への移動。`:'行きたい街の往復乗車券を選べます。';
  if(p?.outbound){description+=` ${TRIP_DESTINATIONS[p.destination].name}ゆきは購入済み。DAY ${p.day} から利用できます。乗車時の追加料金はありません。`;if(mode!=='ticket')actions.push({id:'dest-ride',label:TRIP_DESTINATIONS[p.destination].name+'へ向かう',detail:p.day>s.day?`DAY ${p.day} から乗車できます`:'予約済みの乗車券で乗る →',disabled:!canRideExcursion(s)});}
  else if(t.reservation&&d)description+=' 宿だけの予約には交通が含まれません。宿の予約を残して、往復の乗車券を追加できます。';
  if(!p){const routes=Object.values(TRIP_DESTINATIONS).sort((a,b)=>Number(b.id===selected)-Number(a.id===selected));for(const route of routes){const day=ticketDay(s,route.id);actions.push({id:'dest-buy-'+route.id,label:route.name+'ゆきの往復乗車券を買う',detail:`DAY ${day} · ¥${(route.fare*2).toLocaleString('ja-JP')} · 片道${route.minutes}分`,disabled:!canBookExcursion(s,route.id,day)});}}
  actions.push(mode==='ticket'?{id:'trip-ticket',label:t.ticket?'京都ゆきの新幹線きっぷは購入済み':'京都ゆきの新幹線きっぷを買う',detail:'¥'+TRAVEL.railFare.toLocaleString('ja-JP'),disabled:!!t.ticket||s.money<TRAVEL.railFare}:{id:'trip-board',label:'京都ゆきの新幹線に乗る',detail:t.ticketDay>s.day?`DAY ${t.ticketDay} から`:'新幹線のきっぷが必要です',disabled:t.ticket!=='kyoto'||t.ticketDay>s.day});
  actions.push({id:'dest-platform',label:'乗車口まで道案内する',detail:'歩いて移動 · M で駅の地図'},{id:'dest-open-site',label:'予約を確認する'});
  actionList(mode==='ticket'?'東京駅・列車の券売機':'東京駅・行き先を選んで乗車',description+(mode==='ticket'?' 購入後は乗車口まで歩いて E を押してください。':''),actions);
 }
 function interaction(id){
 if(['excursion-station','destination-station'].includes(id)||(getLife().travel.region==='tokyo'&&['rail-ticket','board-train'].includes(id))){station(id==='rail-ticket'?'ticket':'platform');return true;}
 if(id.startsWith('destination-hotel-')){const ok=enterRegionHotel(getLife(),id.slice(18));if(ok){syncRegion();notify('宿へようこそ。正面のフロントでチェックインしてください。');}else notify('現在の予約と宿泊先を確認してください。別の宿を選ぶ前に取消・チェックアウトが必要です。');return true;}
 if(id==='destination-cafe'){const a=routineAvailability(getLife(),'tripMeal');actionList('旅先のカフェで、ひと皿。','7:00〜21:00。ごはんは目の前に出て、ひと口ずつ食べられます。',[{id:'routine-start-tripMeal',label:'旅先のランチプレート',detail:'¥700',disabled:!a.ok}]);return true;}
 if(id==='destination-shop'){actionList('旅の売店','街歩きのおともに、食べものをどうぞ。',[{id:'buy-bread',label:'焼きたてパン',detail:'¥280'},{id:'buy-apple',label:'りんご',detail:'¥180'},{id:'buy-coffee',label:'持ち帰りのコーヒー豆',detail:'¥600'}]);return true;}
 if(id==='destination-photo'){actionList('旅先の風景を、一枚。','今見ている景色を記録します。B の写真から見返せます。各地で1日1回撮影できます。',[{id:'dest-photo',label:'風景の写真を撮る'}]);return true;}
 if(id==='destination-stamp'){const ok=rememberDestination(getLife(),'stamp');notify(ok?'旅のスタンプを残しました。J の予約画面で旅の記録を確認できます。':'今日のスタンプは記録済みです。');changed();return true;}
 if(id==='destination-rest'){startRoutine('stretch');return true;}
 return false;
 }
 function action(id){if(!id.startsWith('dest-'))return false;if(id==='dest-open-site'){openTravel();return true;}if(id==='dest-platform'){guide();return true;}if(id.startsWith('dest-buy-')){const s=getLife(),route=id.slice(9),ok=bookExcursion(s,route,ticketDay(s,route));if(ok){changed();notify('往復乗車券を購入しました。宿の予約はそのままです。');}else notify('乗車日・所持金・購入済みの乗車券を確認してください。');station(stationMode);return true;}if(id==='dest-ride'){const ok=rideExcursion(getLife());closePanel();if(ok){syncRegion();notify('到着しました。街も宿も、自分の足で歩いて巡れます。');}else notify('乗車日・乗車口・お財布・チェックアウトを確認してください。');return true;}if(id==='dest-photo'){closePanel();if(rememberDestination(getLife(),'photo')){ensureTown(getLife()).postcard=capturePhoto();notify('旅の風景を保存しました。B から写真を見返せます。');}else notify('今日の写真は記録済みです。');changed();return true;}return true;}
 function map(){const s=getLife();if(s.travel?.region==='tokyo'){openPanel(`<span class="eyebrow">TOKYO STATION</span><h2>東京駅・列車の乗り場</h2><p>箱根などの街へは「観光路線」の案内板、または6号車の乗車口で E を押し、行き先を選びます。乗車券は券売機でも旅行サイトでも購入できます。</p><svg class="city-map station-map" viewBox="0 0 320 230" role="img" aria-label="東京駅の乗車口と現在地"><rect width="320" height="230" fill="#dae2c8"/><rect x="64" y="16" width="200" height="200" fill="#c7c9b6"/><path d="M160 205V30" stroke="#eeecdc" stroke-width="32"/><g fill="#526f5d" text-anchor="middle"><circle cx="101" cy="183" r="5"/><text x="101" y="172">観光路線</text><circle cx="237" cy="126" r="5"/><text x="235" y="114">6号車・乗車口</text><circle cx="86" cy="146" r="5"/><text x="90" y="136">券売機</text><text x="160" y="217">改札・自宅方面</text></g><circle cx="${160+s.position[0]*16}" cy="${110+s.position[2]*5.8}" r="5" fill="#b46e47"/></svg><p>● あなたの現在地。予約済みでも、乗車口まで歩いてから乗ります。DAY が未来のきっぷは、その日から利用できます。</p><div class="action-list"><button data-action="dest-platform">乗車口まで道案内する</button></div>`);return true;}const d=TRIP_DESTINATIONS[s.travel?.region];if(!d)return false;const point=(x,z)=>`${160+x*4},${100+z*4}`;openPanel(`<span class="eyebrow">WALK YOUR OWN JOURNEY</span><h2>${d.name}を、自分の足で。</h2><p>駅は地図の下側。宿・カフェ・海辺や森の景色へ、道を歩いて巡れます。</p><svg class="city-map destination-map" viewBox="0 0 320 205" role="img" aria-label="${d.name}の徒歩マップ"><rect width="320" height="205" fill="#dae2c8"/><path d="M160 180V24 M40 140H280 M44 48H276" stroke="#b6b8a1" stroke-width="12" fill="none"/>${[['駅・東京方面',0,20],['宿 1',-18,8],['宿 2',18,8],['カフェ',8,5.7],['売店',-8,5.7],['写真',0,-17],['スタンプ',-16,-10.5],['休憩',15,-10]].map(([name,x,z])=>`<g transform="translate(${point(x,z)})"><circle r="3" fill="#70865d"/><text y="-6" text-anchor="middle">${name}</text></g>`).join('')}<circle cx="${160+s.position[0]*4}" cy="${100+s.position[2]*4}" r="4" fill="#b46e47"/></svg><p>● あなたの現在地。地図を閉じて歩き、入口や案内の前で E を押してください。</p><p>${d.hotels.map((h,i)=>`宿 ${i+1}：${h.name}（${h.roomName}）`).join('<br>')}</p><p>カフェ 7:00〜21:00。帰りはチェックアウトして駅へ。観光路線は往復券を利用できます。</p>`);return true;}
 return {interaction,action,map,guide};
}
