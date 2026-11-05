// Original game towns inspired by Japanese destinations, not measured reconstructions.
export function lodging(id,name,tier,price,meals,style,roomName,view){return {id,name,tier,price,meals,style,roomName,view,referenceStatus:'original',tag:tier==='deluxe'?'眺めを楽しむ宿':tier==='basic'?'気軽な素泊まり':'くつろぎの宿',description:`${roomName}。${meals?'夕食・朝食付き。':'食事は夕食 ¥1,800・朝食 ¥850で追加できます。'}ゲームオリジナルの宿です。`,floor:style==='townhouse'?'#bbac95':'#bc9d73',linen:view==='sea'||view==='port'?'#a7bdc2':'#a4b6a0',wall:'#e4dfd4'};}
export const TRIP_DESTINATIONS={
 kamakura:{id:'kamakura',name:'鎌倉',subtitle:'海辺と参道の散歩',kind:'coast',fare:1000,minutes:60,accent:'#799d9e',description:'海岸の遊歩道、参道、海辺のカフェを歩いて巡る街。',hotels:[lodging('kamakura_guest','鎌倉 なぎさゲストハウス','basic',4800,false,'townhouse','海辺のベッドツイン','sea'),lodging('kamakura_terrace','鎌倉 シーサイドテラス','standard',9800,true,'lodge','海を眺めるツイン','sea')]},
 // NEXT_DESTINATION
};
export const EXTRA_HOTELS=Object.fromEntries(Object.values(TRIP_DESTINATIONS).flatMap(d=>d.hotels.map(h=>[h.id,{...h,destination:d.id}])));
