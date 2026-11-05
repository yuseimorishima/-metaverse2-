import {isLocalRegion} from './geography.js';
import {DISTRICTS,NPCS,ACHIEVEMENTS,ensureTown,absoluteMinutes,plotStage,spendTime,plantSeeds,waterPlot,harvest,buySeeds,rentRod,catchFish,sellFish,cookMeal,eatMeal,deliverProduce,townShift,takePhoto,talk} from './town.js';
export function createTownUI({getLife,navigate,actionList,openPanel,closePanel,notify,onChange,capturePhoto}){
 let fishing=null;
 const local=s=>isLocalRegion(s.travel.region);
 const finish=(ok,message)=>{closePanel();notify(ok?message:'今はできません。場所・持ちもの・体力を確認してください。');onChange();};
 function journal(){const s=getLife(),t=ensureTown(s);openPanel(`<span class="eyebrow">A BIGGER LITTLE LIFE</span><h2>歩いてつながる、わたしの街。</h2><p>施設は道路でつながっています。案内を選ぶと方向と距離を表示します。入口も帰り道も、そのまま歩いて通れます。</p><div class="district-list">${Object.entries(DISTRICTS).map(([id,v])=>`<button data-action="town-go-${id}" ${!local(s)?'disabled':''}><span>${v.name}<small>${v.description}</small></span><b>道案内 →</b></button>`).join('')}${s.travel.region!=='home'&&local(s)?'<button data-action="town-home"><span>アパートまで道案内</span><b>→</b></button>':''}</div><div class="pocket-summary">野菜の種 ${t.seeds} · トマト ${t.tomatoes} · 魚 ${t.fish} · 手料理 ${t.meals}</div><h3 class="journal-heading">暮らしの思い出 ${t.achievements.length} / ${ACHIEVEMENTS.length}</h3><div class="badges">${ACHIEVEMENTS.map(([id,name])=>`<span class="${t.achievements.includes(id)?'earned':''}">${t.achievements.includes(id)?'✓':'○'} ${name}</span>`).join('')}</div>${t.postcard?'<button class="postcard-button" data-action="town-album">街や旅先で撮った写真を見る →</button>':''}${!local(s)?'<p>今は旅行中です。東京から自宅へ戻ると、街の施設に行けます。</p>':''}`);}
 function plotPanel(){const s=getLife(),t=ensureTown(s),stage=plotStage(s),remaining=t.plot?.wateredAt!=null?Math.max(0,Math.ceil(60-(absoluteMinutes(s)-t.plot.wateredAt))):0;
  actionList('わたしの、小さな畑。',`種 ${t.seeds}袋 · トマト ${t.tomatoes}個。${stage==='empty'?'種をまいたら、水やりを忘れずに。':stage==='dry'?'芽が出ました。まずは水をあげましょう。':stage==='growing'?`収穫まであと約${remaining}分。ほかの場所で過ごしても育ちます。`:'トマトが色づきました。収穫できます。'}`,[{id:'town-plant',label:'種をまく',disabled:stage!=='empty'||!t.seeds},{id:'town-water-plot',label:'畑に水をやる',disabled:stage!=='dry'},{id:'town-harvest',label:'トマトを収穫する',detail:'3個',disabled:stage!=='ripe'},{id:'town-garden-rest',label:'畑のそばで休憩する',detail:'30分 · 体力回復'}]);}
 function npcPanel(id){const s=getLife(),npc=NPCS[id];talk(s,id);const actions=[];
  if(id==='master')actions.push({id:'town-job-cafe',label:'カフェの手伝いをする',detail:'2時間 · ¥1,800',disabled:ensureTown(s).jobDays.cafe===s.day||s.energy<25},{id:'town-deliver',label:'採れたてトマトを2個届ける',detail:'¥900 · 1日1回',disabled:ensureTown(s).tomatoes<2||ensureTown(s).deliveryDay===s.day});
  if(id==='librarian')actions.push({id:'town-job-library',label:'本の整理を手伝う',detail:'2時間 · ¥1,400',disabled:ensureTown(s).jobDays.library===s.day||s.energy<25});
  if(id==='gardener')actions.push({id:'town-seed-buy',label:'野菜の種を3袋買う',detail:'¥150',disabled:s.money<150});
  if(id==='fisher')actions.push({id:'town-rod',label:'釣り竿を借りる（返却不要）',detail:'¥500',disabled:ensureTown(s).rod||s.money<500},{id:'town-sell-fish',label:'釣った魚をまとめて売る',detail:`¥${ensureTown(s).fish*300}`,disabled:!ensureTown(s).fish});
  actions.push({id:'town-chat-end',label:'また来ます',detail:'→'});actionList(npc.name,`「${npc.lines[(s.day-1)%npc.lines.length]}」`,actions);onChange();}
 function fishPanel(){const s=getLife(),t=ensureTown(s);actionList('水面の向こうの、小さな気配。',t.rod?'浮きが沈んで「今！」と表示されたら、引き上げてください。E・Space またはボタンで操作できます。':'水辺の売店で釣り竿を借りましょう。釣りは1回10分、体力5以上が必要です。',[{id:'town-cast',label:'糸を垂らす',detail:'10分',disabled:!t.rod||s.energy<5}]);}
 function cast(){const s=getLife();if(s.travel.region!=='waterfront'||!ensureTown(s).rod||s.energy<5){finish(false);return;}openPanel('<span class="eyebrow">A MOMENT BY THE WATER</span><h2>浮きを、見つめて。</h2><div class="fishing-pond"><div class="fishing-line"></div><div id="fishing-float">◒</div><span id="fishing-ripple"></span></div><p id="fishing-message" aria-live="polite">波が静かに揺れています。あわてずに待ちましょう…</p><div class="action-list"><button id="reel-button" data-action="town-reel" disabled>引き上げる<small>E / Space</small></button></div>');const now=performance.now();fishing={biteAt:now+2200+Math.random()*1800,endAt:0,biting:false};}
 function reel(){if(!fishing)return;const now=performance.now(),win=now>=fishing.biteAt&&now<=fishing.biteAt+2500;fishing=null;const ok=catchFish(getLife(),win);finish(ok,win?'釣れました！ 魚を1匹持ちものに入れました。売店で売ったり、家で料理したりできます。':'魚はすっと泳いでいきました。また挑戦してみましょう。');}
 function update(now){if(!fishing)return;const biting=now>=fishing.biteAt;if(now>fishing.biteAt+2500){reel();return;}if(biting&&!fishing.biting){fishing.biting=true;const message=document.querySelector('#fishing-message'),button=document.querySelector('#reel-button'),float=document.querySelector('#fishing-float');if(!message||!button){fishing=null;return;}message.textContent='今！ 浮きが沈んだ！ E・Space かボタンで引き上げよう。';button.disabled=false;float.classList.add('bite');}}
 function interaction(id){const s=getLife(),t=ensureTown(s);
  if(id.startsWith('town-enter-')){const district=id.slice(11);if(Object.hasOwn(DISTRICTS,district)&&local(s)){closePanel();navigate(district);}return true;}
  if(id.startsWith('town-talk-')){npcPanel(id.slice(10));return true;}
  if(id==='town-home'){action('town-home');return true;}
  if(id==='town-board'){journal();return true;}
  if(id==='town-plot'){plotPanel();return true;}
  if(id==='town-seeds'){npcPanel('gardener');return true;}
  if(id==='town-tackle'){npcPanel('fisher');return true;}
  if(id==='town-fish'){fishPanel();return true;}
  if(id==='town-library-job'){npcPanel('librarian');return true;}
  if(id==='town-cafe-service'){npcPanel('master');return true;}
  if(id==='town-cook'){actionList('採れたもので、ひと皿。',`トマト ${t.tomatoes}個 · 魚 ${t.fish}匹 · パン ${s.inventory.bread}個。トマト1個と、魚またはパン1個で、手料理を作れます。`,[{id:'town-cook-meal',label:'野菜のプレートを作る',detail:'20分',disabled:t.tomatoes<1||(!t.fish&&!s.inventory.bread)},{id:'town-eat-meal',label:'作った料理を食べる',detail:`${t.meals}皿`,disabled:!t.meals}]);return true;}
  if(id==='town-order'){actionList('森のカフェの、いつもの一杯。',`お財布 ¥${s.money.toLocaleString('ja-JP')}。景色とともに、少しの休憩を。`,[{id:'town-coffee',label:'コーヒーを注文する',detail:'¥450',disabled:s.money<450}]);return true;}
  if(id==='town-read'){actionList('本の中にも、知らない街。','旅の本を一冊読み、静かに30分を過ごします。気分 +15、体力 +10。',[{id:'town-read-book',label:'窓辺で読書する',detail:'30分'}]);return true;}
  if(id==='town-water'){s.thirst=100;notify('農園の冷たい水で、すっきりしました。');onChange();return true;}
  if(id==='town-water-rest'){actionList('水辺の、ひと休み。','風と波の音を聴きながら、30分ゆっくり過ごします。',[{id:'town-river-rest',label:'ベンチでひと休み',detail:'体力 +20 · 気分 +12'}]);return true;}
  if(id==='town-photo'){actionList('見晴らしの丘から、一枚。','街と木々の景色を写真に残します。1日に一枚、旅の日記へ。',[{id:'town-take-photo',label:'目の前の景色を撮る',disabled:t.photos.includes(`day-${s.day}`)}]);return true;}
  return false;
 }
 function action(id){const s=getLife(),t=ensureTown(s);let ok=false,message='';
  if(id==='town-cast'){cast();return;}if(id==='town-reel'){reel();return;}
  if(id==='town-journal'){journal();return;}
  if(id==='town-album'){if(t.postcard){openPanel('<span class="eyebrow">LITTLE MEMORIES</span><h2>旅と街の、あの日の景色。</h2><img id="postcard-image" alt="見晴らしの丘で撮ったゲーム内の風景" style="width:100%;border-radius:3px"><p>また、違う時間にも訪れてみよう。</p>');document.querySelector('#postcard-image').src=t.postcard;}return;}
  if(id.startsWith('town-go-')){const d=id.slice(8);if(Object.hasOwn(DISTRICTS,d)&&local(s)){closePanel();navigate(d);}return;}
  if(id==='town-home'){if(local(s)){closePanel();navigate('home');}return;}
  if(id==='town-plant'){ok=plantSeeds(s);message='種をまきました。次は水をやりましょう。';}
  else if(id==='town-water-plot'){ok=waterPlot(s);message='畑に水をあげました。一時間ほどしたら、収穫に戻りましょう。';}
  else if(id==='town-harvest'){ok=harvest(s);message='トマトを3個収穫しました！ 料理やカフェへの配達に使えます。';}
  else if(id==='town-seed-buy'){ok=buySeeds(s);message='野菜の種を3袋買いました。';}
  else if(id==='town-rod'){ok=rentRod(s);message='釣り竿を借りました。桟橋の先で釣りをしてみましょう。';}
  else if(id==='town-sell-fish'){const count=t.fish;ok=sellFish(s);message=`魚を${count}匹売り、¥${count*300} を受け取りました。`;}
  else if(id==='town-cook-meal'){ok=cookMeal(s);message='採れたて野菜のプレートができました。持ちものから食べられます。';}
  else if(id==='town-eat-meal'){ok=eatMeal(s);message='自分で作ったごはん。お腹も気持ちも、満たされました。';}
  else if(id==='town-deliver'){ok=deliverProduce(s);message='カフェにトマトを届けて、¥900 を受け取りました。';}
  else if(id==='town-job-cafe'||id==='town-job-library'){const job=id.slice(9);ok=townShift(s,job);message=job==='cafe'?'カフェのお手伝い、おつかれさま。¥1,800 を受け取りました。':'本の整理が終わりました。¥1,400 を受け取りました。';}
  else if(id==='town-take-photo'){ok=takePhoto(s);if(ok)t.postcard=capturePhoto();message='風景を写真に残しました。B の街の案内から見返せます。';}
  else if(id==='town-read-book'&&s.travel.region==='library'){spendTime(s,30);s.energy=Math.min(100,s.energy+10);s.mood=Math.min(100,s.mood+15);ok=true;message='物語の中を旅した30分。体力と気分が回復しました。';}
  else if(id==='town-garden-rest'&&s.travel.region==='garden'){spendTime(s,30);s.energy=Math.min(100,s.energy+18);ok=true;message='葉の伸びるのを眺めながら、30分の休憩。';}
  else if(id==='town-river-rest'&&s.travel.region==='waterfront'){spendTime(s,30);s.energy=Math.min(100,s.energy+20);s.mood=Math.min(100,s.mood+12);ok=true;message='波の音に包まれて、ひと休みしました。';}
  else if(id==='town-coffee'&&s.travel.region==='cafe'&&s.money>=450){s.money-=450;s.thirst=Math.min(100,s.thirst+40);s.energy=Math.min(100,s.energy+20);ok=true;message='丁寧に淹れた一杯で、気持ちも軽くなりました。';}
  else if(id==='town-chat-end'){ok=true;message='「また、お待ちしています。」';}
  finish(ok,message);
 }
 return {journal,interaction,action,update,reel,isFishing:()=>fishing!==null,cancelFishing:()=>{fishing=null;}};
}
