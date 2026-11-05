import {TRIP_DESTINATIONS} from './destinations.js';
import {ensureTravel,rideExcursion,enterRegionHotel,rememberDestination} from './travel.js';
import {ensureTown} from './town.js';
import {routineAvailability} from './routines.js';
export function createDestinationUI({getLife,openPanel,actionList,closePanel,notify,changed,syncRegion,openTravel,startRoutine,capturePhoto}){
 function station(){const s=getLife(),t=ensureTravel(s),p=t.excursion,d=TRIP_DESTINATIONS[t.region]||TRIP_DESTINATIONS[p?.destination];if(!d){actionList('東京駅・観光路線','J の旅行サイトで、新しい行き先の往復券を予約できます。',[{id:'dest-open-site',label:'旅行サイトを開く'}]);return;}
 const outward=t.region==='tokyo',paid=outward?p?.outbound:p?.destination===t.region&&p.return,ready=outward?paid&&p.day<=s.day:!t.stay&&(paid||s.money>=d.fare);
 actionList(outward?d.name+'への観光路線':d.name+'駅・東京方面',`移動 ${d.minutes}分。${paid?'予約済みの乗車券を使います。追加の支払いはありません。':`片道 ¥${d.fare.toLocaleString('ja-JP')}。お財布から支払います。`}${outward&&p.day>s.day?` DAY ${p.day} から乗車できます。`:''}${t.stay?' 宿をチェックアウトしてからお戻りください。':''}`,[{id:'dest-ride',label:outward?d.name+'へ向かう':'東京駅へ帰る',detail:'駅から移動 →',disabled:!ready},{id:'dest-open-site',label:'予約を確認する'}]);
 }
 function interaction(id){
 if(['excursion-station','destination-station'].includes(id)){station();return true;}
 if(id.startsWith('destination-hotel-')){const ok=enterRegionHotel(getLife(),id.slice(18));if(ok){syncRegion();notify('宿へようこそ。正面のフロントでチェックインしてください。');}else notify('現在の予約と宿泊先を確認してください。別の宿を選ぶ前に取消・チェックアウトが必要です。');return true;}
 if(id==='destination-cafe'){const a=routineAvailability(getLife(),'tripMeal');actionList('旅先のカフェで、ひと皿。','7:00〜21:00。ごはんは目の前に出て、ひと口ずつ食べられます。',[{id:'routine-start-tripMeal',label:'旅先のランチプレート',detail:'¥700',disabled:!a.ok}]);return true;}
 if(id==='destination-shop'){actionList('旅の売店','街歩きのおともに、食べものをどうぞ。',[{id:'buy-bread',label:'焼きたてパン',detail:'¥280'},{id:'buy-apple',label:'りんご',detail:'¥180'},{id:'buy-coffee',label:'持ち帰りのコーヒー豆',detail:'¥600'}]);return true;}
 if(id==='destination-photo'){actionList('旅先の風景を、一枚。','今見ている景色を記録します。B の写真から見返せます。各地で1日1回撮影できます。',[{id:'dest-photo',label:'風景の写真を撮る'}]);return true;}
 if(id==='destination-stamp'){const ok=rememberDestination(getLife(),'stamp');notify(ok?'旅のスタンプを残しました。J の予約画面で旅の記録を確認できます。':'今日のスタンプは記録済みです。');changed();return true;}
 if(id==='destination-rest'){startRoutine('stretch');return true;}
 return false;
 }
 function action(id){if(!id.startsWith('dest-'))return false;if(id==='dest-open-site'){openTravel();return true;}if(id==='dest-ride'){const ok=rideExcursion(getLife());closePanel();if(ok){syncRegion();notify('到着しました。街も宿も、自分の足で歩いて巡れます。');}else notify('乗車日・乗車口・お財布・チェックアウトを確認してください。');return true;}if(id==='dest-photo'){closePanel();if(rememberDestination(getLife(),'photo')){ensureTown(getLife()).postcard=capturePhoto();notify('旅の風景を保存しました。B から写真を見返せます。');}else notify('今日の写真は記録済みです。');changed();return true;}return true;}
 function map(){const s=getLife(),d=TRIP_DESTINATIONS[s.travel?.region];if(!d)return false;const point=(x,z)=>`${160+x*4},${100+z*4}`;openPanel(`<span class="eyebrow">WALK YOUR OWN JOURNEY</span><h2>${d.name}を、自分の足で。</h2><p>駅は地図の下側。宿・カフェ・海辺や森の景色へ、道を歩いて巡れます。</p><svg class="city-map destination-map" viewBox="0 0 320 205" role="img" aria-label="${d.name}の徒歩マップ"><rect width="320" height="205" fill="#dae2c8"/><path d="M160 180V24 M40 140H280 M44 48H276" stroke="#b6b8a1" stroke-width="12" fill="none"/>${[['駅・東京方面',0,20],['宿 1',-18,8],['宿 2',18,8],['カフェ',8,5.7],['売店',-8,5.7],['写真',0,-17],['スタンプ',-16,-10.5],['休憩',15,-10]].map(([name,x,z])=>`<g transform="translate(${point(x,z)})"><circle r="3" fill="#70865d"/><text y="-6" text-anchor="middle">${name}</text></g>`).join('')}<circle cx="${160+s.position[0]*4}" cy="${100+s.position[2]*4}" r="4" fill="#b46e47"/></svg><p>● あなたの現在地。地図を閉じて歩き、入口や案内の前で E を押してください。</p><p>${d.hotels.map((h,i)=>`宿 ${i+1}：${h.name}（${h.roomName}）`).join('<br>')}</p><p>カフェ 7:00〜21:00。帰りはチェックアウトして駅へ。観光路線は往復券を利用できます。</p>`);return true;}
 return {interaction,action,map};
}
