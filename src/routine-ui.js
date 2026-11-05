import {PACES,DISHES,ensureRoutines,routineAvailability,beginRoutine,routineInput,advanceRoutine,pauseRoutine,resumeRoutine,discardRoutine,routineTarget,routineReach,canResumeRoutine,serviceHours,routinePrice,mealPeriod} from './routines.js';
export function createRoutineUI({getLife,openPanel,closePanel,notify,changed,clearMovement}){
 const card=document.querySelector('#routine-card'),title=document.querySelector('#routine-title'),message=document.querySelector('#routine-message'),button=document.querySelector('#routine-act'),bar=document.querySelector('#routine-progress');
 let lastStep='';const habitSteps={clean:['床を掃く','棚を拭く','部屋を整える'],stretch:['肩を回す','背中を伸ばす','深呼吸する'],study:['本を開く','じっくり読む','学んだことをメモする']};
 const menuButton=id=>{const d=DISHES[id],a=routineAvailability(getLife(),id);return `<button data-action="routine-start-${id}" ${a.ok?'':'disabled'}>${d.name}<small>${serviceHours(id)}${routinePrice(getLife(),id)?` · ¥${routinePrice(getLife(),id)}`:''}</small></button>`;};
 function start(id){const s=getLife(),a=routineAvailability(s,id);if(!a.ok){notify(a.reason);return false;}if(!beginRoutine(s,id))return false;closePanel();clearMovement();changed();update(0);notify(DISHES[id].kind==='bath'?'まず洗い場へ。案内を見て歩き、E または画面のボタンで体を洗います。':DISHES[id].kind==='habit'?'E または画面のボタンで、ひとつずつ手を動かして過ごします。':DISHES[id].kind==='cook'?'E または画面のボタンで、切る・火にかける・盛りつける工程を進めます。':'いただきます。E または画面のボタンで、ひと口ずつ。食事中も周囲を見回せます。');return true;}
 function mealMenu(cafe=false){openPanel(`<span class="eyebrow">SIT DOWN, TAKE YOUR TIME</span><h2>${cafe?'森のカフェで、ごはん。':'湯宿のお食事。'}</h2><p>${mealPeriod(getLife().minutes)}。${cafe?'朝のパンと卵、お昼の野菜プレート、淹れたてのコーヒーをどうぞ。':'夕食は18:00〜21:00、朝食は宿泊した翌朝の7:00〜10:00。提供時間内に始めれば、閉店後も最後まで食べられます。'}</p><div class="action-list">${(cafe?['cafeBreakfast','cafe','cafeCoffee']:['dinner','breakfast']).map(menuButton).join('')}</div><p class="travel-note">料理は目の前に出ます。ひと口ずつ食べ進め、食べた分だけ回復します。自宅の食べものは時間を問わず食べられます。</p>`);}
 function bathMenu(id){const s=getLife(),a=routineAvailability(s,id);openPanel(`<span class="eyebrow">WASH, SOAK, UNWIND</span><h2>${DISHES[id].name}で、ひと息。</h2><p>${id==='shower'?'体を洗い、シャワーで流し、タオルで拭きます。':'洗い場で体を洗ってから、湯船のそばまで歩いて、お湯につかりましょう。最後にタオルで体を拭きます。'}時計は少しずつ進み、操作した分だけ体が整います。</p><p>${a.reason}</p><div class="action-list">${menuButton(id)}</div>`);}
 function settings(){const r=ensureRoutines(getLife());openPanel(`<span class="eyebrow">YOUR EVERYDAY RHYTHM</span><h2>食事と入浴の、過ごし方。</h2><p>途中を飛ばさず、食べたり洗ったりする時間を選べます。変更は次の体験から。どの長さでも食材・料金・回復量は同じです。</p><div class="action-list">${Object.entries(PACES).map(([id,p])=>`<button data-action="routine-pace-${id}">${r.pace===id?'✓ ':''}${p.name}<small>食事 ${p.meal<60?`${p.meal}秒`:`約${Math.round(p.meal/60)}分`} · 入浴 ${p.wash+p.rinse+p.soak+p.dry<60?`${p.wash+p.rinse+p.soak+p.dry}秒`:`約${Math.round((p.wash+p.rinse+p.soak+p.dry)/60)}分`}</small></button>`).join('')}</div><p class="travel-note">待っている間も見回せます。「いったん休む」で席を立てます。未完了の体験も自動保存され、再開時にもう一度料金や食材を使うことはありません。</p>`);}
 function action(id){
  const map={'eat-bread':'bread','eat-apple':'apple','town-eat-meal':'homemade','town-cook-meal':'cook','town-coffee':'cafeCoffee','trip-dinner':'dinner','trip-breakfast':'breakfast','trip-bento':'bento','trip-bath':'hotelBath','deluxe-public-bath':'publicBath','deluxe-shower':'shower'};
  if(map[id]){start(map[id]);return true;}
  if(id.startsWith('routine-start-')){start(id.slice(14));return true;}
  if(id==='routine-settings'){settings();return true;}
  if(id.startsWith('routine-pace-')){const pace=id.slice(13);if(Object.hasOwn(PACES,pace)){ensureRoutines(getLife()).pace=pace;changed();settings();}return true;}
  if(id==='routine-resume'){if(resumeRoutine(getLife())){closePanel();clearMovement();changed();}else notify('料理やお風呂の近くへ戻ってから再開してください。');update(0);return true;}
  return false;
 }
 function interaction(id){
  if(['town-order','cafe'].includes(id)){mealMenu(true);return true;}
  if(id==='hotel-dinner'){mealMenu();return true;}
  const baths={'deluxe-bathhouse':'publicBath','routine-bath-wash':'publicBath','deluxe-furniture-shower':'shower','hotel-bath':'hotelBath'};
  if(baths[id]){bathMenu(baths[id]);return true;}
  const drinks={coffee:'coffee',water:'water','town-water':'water','hotel-tea':'tea'};
  if(drinks[id]){start(drinks[id]);return true;}
  return false;
 }
 function act(){const s=getLife(),a=ensureRoutines(s).active;if(!a||a.paused)return false;if(routineInput(s)){clearMovement();changed();}else if(routineTarget(a))notify('案内の場所まで歩いて近づいてください。');update(0);return true;}
 function update(seconds){
  const s=getLife(),r=ensureRoutines(s),done=advanceRoutine(s,seconds),a=r.active;
  if(done){notify(DISHES[done].kind==='bath'?'湯上がりの気持ちよさ。おつかれさまでした。':DISHES[done].kind==='habit'?'今日の暮らしに記録しました。続けると、少しずつ日々が豊かになります。':done==='cook'?'料理ができました。持ちものから、ひと皿ずつ食べられます。':'ごちそうさまでした。食べた時間も、今日の暮らしの一部。');changed();}
  card.hidden=!a;document.body.classList.toggle('in-routine',!!a&&!a.paused);if(!a){lastStep='';return;}
  title.textContent=DISHES[a.id].name;
  const target=routineTarget(a),distance=target?Math.hypot(s.position[0]-target[0],s.position[2]-target[1]):0,reach=routineReach(a);
  const waiting=['ready','wash-walk','wash-ready','rinse-ready','soak-walk','dry-ready'].includes(a.phase);
  let label='',text='';
  if(a.paused){label='続きを過ごす';text=canResumeRoutine(s)?'途中までの様子を保存しました。再開しても二重に支払いません。':'料理・お風呂のあった場所へ戻ると、続けられます。';}
  else if(a.phase==='ready'){label=a.kind==='habit'?habitSteps[a.id][a.done]:a.kind==='cook'?['野菜を切る','火にかける','お皿に盛る'][a.done]:DISHES[a.id].kind==='drink'?'ひと口飲む':'ひと口食べる';text=a.kind==='cook'||a.kind==='habit'?`${a.done+1} / 3 の工程。E またはボタンで手を動かします。`:`${a.done} / ${DISHES[a.id].portions} 口。自分のペースでどうぞ。`;}
  else if(a.phase==='chewing'){label=a.kind==='habit'?'ゆっくり、取り組んでいます…':a.kind==='cook'?'調理しています…':DISHES[a.id].kind==='drink'?'ひと口、味わっています…':'ゆっくり、もぐもぐ…';text=`あと ${Math.ceil(a.remaining)} 秒。見回しながら、少し待ちましょう。`;}
  else if(target){label=a.phase==='wash-walk'?'体を洗う':'お湯につかる';text=distance>reach?`${a.phase==='wash-walk'?'洗い場':'湯船の入口'}まで ${distance.toFixed(1)} m。方向ボタンで歩いて近づこう。`:'ここで E またはボタンを押します。';}
  else if(a.phase==='wash-ready'){label='もう一度、体を洗う';text=`${a.done} / 3。泡立てながら、順に洗いましょう。`;}
  else if(a.phase==='rinse-ready'){label='シャワーで流す';text='泡をお湯で流して、さっぱり。';}
  else if(a.phase==='dry-ready'){label='タオルで体を拭く';text='湯上がりに、ゆっくり体を拭きます。';}
  else {label={washing:'体を洗っています…',rinsing:'泡を流しています…',soaking:'お湯につかっています…',drying:'タオルで拭いています…'}[a.phase]||'';text=`あと ${Math.ceil(a.remaining)} 秒。${a.phase==='soaking'?'周りを見ながら、湯けむりとともにひと休み。':'そのまま、ゆっくり。'}`;}
  button.textContent=label+(waiting&&!a.paused?'  E':'');button.disabled=a.paused?!canResumeRoutine(s):!waiting||(target&&distance>reach);
  message.textContent=text;
  const total=a.kind==='bath'?a.washSeconds*3+a.rinseSeconds+(a.id==='shower'?0:a.soakSeconds)+a.drySeconds:a.portionSeconds*DISHES[a.id].portions;
  let progress=0;
  if(a.kind==='bath'){
   const washed=a.done*a.washSeconds;
   progress=washed+(a.phase==='washing'?a.washSeconds-a.remaining:0);
   if(['rinsing','soak-walk','soaking','dry-ready','drying'].includes(a.phase))progress+=a.phase==='rinsing'?a.rinseSeconds-a.remaining:a.rinseSeconds;
   if(['soaking','dry-ready','drying'].includes(a.phase)&&a.id!=='shower')progress+=a.phase==='soaking'?a.soakSeconds-a.remaining:a.soakSeconds;
   if(a.phase==='drying')progress+=a.drySeconds-a.remaining;
   progress/=total;
  }else progress=(a.done+(a.phase==='chewing'?1-a.remaining/a.portionSeconds:0))/DISHES[a.id].portions;
  bar.value=Math.max(0,Math.min(1,progress));
  document.querySelector('#routine-rest').hidden=a.paused;document.querySelector('#routine-discard').hidden=!a.paused;
  const arrow=document.querySelector('#routine-direction');arrow.hidden=!target||a.paused;if(target){const dx=target[0]-s.position[0],dz=target[1]-s.position[2];arrow.style.transform=`rotate(${Math.atan2(dx,-dz)+(s.yaw||0)}rad)`;}
  const step=`${a.phase}-${a.done}`;if(lastStep&&lastStep!==step){clearMovement();changed();}lastStep=step;
 }
 button.onclick=()=>{if(ensureRoutines(getLife()).active?.paused)action('routine-resume');else act();};
 document.querySelector('#routine-rest').onclick=()=>{pauseRoutine(getLife());clearMovement();changed();update(0);};
 document.querySelector('#routine-discard').onclick=()=>{discardRoutine(getLife());clearMovement();changed();update(0);notify('片づけました。使った食材や料金は戻りません。');};
 return {start,action,interaction,act,update,settings,restore(){const a=ensureRoutines(getLife()).active;if(a)a.paused=true;lastStep='';update(0);},pause(){pauseRoutine(getLife());}};
}
