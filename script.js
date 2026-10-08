(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const LS = {
    get(k, fallback){ try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  };

  // ---------------- BASIC UI ----------------
  const toast = $('#toast'); let toastTimer;
  function showToast(msg){ toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),2200); }
  const modal = $('#modal');
  function openModal(html){ $('#modalContent').innerHTML = html; modal.classList.add('open'); }
  function closeModal(){ modal.classList.remove('open'); }
  $('#modalClose').onclick = closeModal; modal.onclick = e => { if(e.target===modal) closeModal(); };
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeModal(); $('#controlPanel').classList.remove('open'); } });
  const observer = new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
  $$('.reveal').forEach(el=>observer.observe(el));
  $('#menuBtn').onclick=()=>$('#navMenu').classList.toggle('open');
  $$('#navMenu a').forEach(a=>a.onclick=()=>$('#navMenu').classList.remove('open'));
  addEventListener('scroll',()=>$('#backTop').classList.toggle('show',scrollY>650));
  $('#backTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});

  // ---------------- CLOCK / GREETING ----------------
  function updateClock(){
    const now=new Date();
    $('#miniClock').textContent=now.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
    $('#miniDate').textContent=now.toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit'});
    const h=now.getHours();
    $('#liveGreeting').textContent=h<11?'Chào buổi sáng, bắt đầu thật dịu dàng nhé ♡':h<18?'Chào buổi chiều, nhớ cho mình một khoảng nghỉ nhỏ ✦':'Chào buổi tối, mong hôm nay kết thúc thật êm ୨୧';
  }
  updateClock(); setInterval(updateClock,1000);

  // ---------------- CONTROL CENTER / THEMES ----------------
  $('#controlBtn').onclick=()=>$('#controlPanel').classList.add('open');
  $('#closeControl').onclick=()=>$('#controlPanel').classList.remove('open');
  let autoTheme=LS.get('v4_auto_theme',false);
  let manualTheme=LS.get('v4_theme','cherry');
  function applyTheme(theme){ document.body.dataset.theme=theme; manualTheme=theme; LS.set('v4_theme',theme); }
  function maybeAutoTheme(){ if(!autoTheme) return; const h=new Date().getHours(); applyTheme(h>=19||h<6?'night':h<12?'babyblue':h<17?'matcha':'cherry'); }
  applyTheme(manualTheme); maybeAutoTheme();
  $$('[data-theme]').forEach(b=>b.onclick=()=>{ autoTheme=false; LS.set('v4_auto_theme',false); $('#autoThemeToggle').textContent='OFF'; applyTheme(b.dataset.theme); showToast('Đã đổi theme 🎨'); sfx('pop'); });
  $('#autoThemeToggle').textContent=autoTheme?'ON':'OFF';
  $('#autoThemeToggle').onclick=()=>{autoTheme=!autoTheme;LS.set('v4_auto_theme',autoTheme);$('#autoThemeToggle').textContent=autoTheme?'ON':'OFF'; if(autoTheme)maybeAutoTheme();showToast(autoTheme?'Đã bật đổi theme theo giờ':'Đã tắt auto theme');};

  // ---------------- SOUND / WEB AUDIO MUSIC ----------------
  let audioCtx, masterGain, musicGain, soundEnabled=LS.get('v4_sound',true), isPlaying=false, trackIndex=LS.get('v4_track',0), musicTimer, progTimer, startedAt=0, step=0, shuffle=false, repeat=false;
  const tracks=[
    {name:'Cherry Milk',mood:'sweet · warm · cute',bpm:92,wave:'sine',seq:[261.63,329.63,392,523.25,392,329.63,293.66,349.23]},
    {name:'Lavender Night',mood:'dreamy · soft · night',bpm:78,wave:'triangle',seq:[220,277.18,329.63,415.30,329.63,277.18,246.94,311.13]},
    {name:'Baby Blue',mood:'fresh · calm · airy',bpm:104,wave:'sine',seq:[293.66,369.99,440,587.33,440,369.99,329.63,392]},
    {name:'Matcha Morning',mood:'cozy · clean · slow',bpm:86,wave:'triangle',seq:[246.94,311.13,369.99,493.88,369.99,311.13,277.18,329.63]}
  ];
  function ensureAudio(){ if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();masterGain=audioCtx.createGain();musicGain=audioCtx.createGain();masterGain.gain.value=soundEnabled?1:0;musicGain.gain.value=LS.get('v4_volume',.4);musicGain.connect(masterGain);masterGain.connect(audioCtx.destination);} if(audioCtx.state==='suspended')audioCtx.resume(); }
  function sfx(kind='tap'){ if(!soundEnabled)return; ensureAudio(); const o=audioCtx.createOscillator(),g=audioCtx.createGain(),now=audioCtx.currentTime; o.type='sine'; o.frequency.value=kind==='success'?700:kind==='pop'?520:420; if(kind==='success')o.frequency.setValueAtTime(900,now+.07); if(kind==='pop')o.frequency.exponentialRampToValueAtTime(780,now+.08); g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.055,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+.12);o.connect(g);g.connect(masterGain);o.start(now);o.stop(now+.14); }
  function note(freq,dur,wave){ ensureAudio();const o=audioCtx.createOscillator(),g=audioCtx.createGain(),now=audioCtx.currentTime;o.type=wave;o.frequency.value=freq;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.05,now+.025);g.gain.exponentialRampToValueAtTime(.0001,now+dur);o.connect(g);g.connect(musicGain);o.start(now);o.stop(now+dur+.04); if(step%4===0){const b=audioCtx.createOscillator(),bg=audioCtx.createGain();b.type='sine';b.frequency.value=freq/2;bg.gain.setValueAtTime(.0001,now);bg.gain.exponentialRampToValueAtTime(.022,now+.04);bg.gain.exponentialRampToValueAtTime(.0001,now+dur*1.5);b.connect(bg);bg.connect(musicGain);b.start(now);b.stop(now+dur*1.6);} }
  function startMusic(){ ensureAudio(); stopMusic(false);isPlaying=true;startedAt=Date.now();step=0;const t=tracks[trackIndex],interval=(60/t.bpm)*1000/2;const tick=()=>{if(!isPlaying)return;note(t.seq[step%t.seq.length],Math.max(.2,interval/1000*.86),t.wave);step++;};tick();musicTimer=setInterval(tick,interval);progTimer=setInterval(updateMusicProgress,180);syncMusic(); }
  function stopMusic(sync=true){isPlaying=false;clearInterval(musicTimer);clearInterval(progTimer);musicTimer=progTimer=null;if(sync)syncMusic();}
  function toggleMusic(){isPlaying?stopMusic():startMusic();}
  function syncMusic(){const t=tracks[trackIndex];$('#trackName').textContent=t.name;$('#trackMood').textContent=t.mood;$('#heroTrack').textContent=t.name;$('#mainPlay').textContent=isPlaying?'❚❚':'▶';$('#heroPlay').textContent=isPlaying?'❚❚':'▶';$('#quickMusicBtn').textContent=isPlaying?'❚❚ Tạm dừng nhạc':'▶ Bật nhạc';LS.set('v4_track',trackIndex);}
  function changeTrack(d=1){trackIndex=shuffle?Math.floor(Math.random()*tracks.length):(trackIndex+d+tracks.length)%tracks.length;if(isPlaying)startMusic();else syncMusic();showToast('Đang chọn '+tracks[trackIndex].name+' ♫');}
  function updateMusicProgress(){const sec=Math.floor((Date.now()-startedAt)/1000)%60,p=sec/60*100;$('#musicProgress').style.width=p+'%';$('#heroTrackProgress').style.width=p+'%';$('#musicTime').textContent='00:'+String(sec).padStart(2,'0');if(sec===59&&repeat)setTimeout(()=>startMusic(),900);}
  syncMusic();
  ['#mainPlay','#heroPlay','#quickMusicBtn'].forEach(id=>$(id).onclick=toggleMusic);$('#prevTrack').onclick=()=>changeTrack(-1);$('#nextTrack').onclick=()=>changeTrack(1);
  $('#shuffleBtn').onclick=()=>{shuffle=!shuffle;showToast(shuffle?'Shuffle ON 🔀':'Shuffle OFF');};$('#repeatBtn').onclick=()=>{repeat=!repeat;showToast(repeat?'Repeat ON ↻':'Repeat OFF');};
  const vol=$('#volume');vol.value=Math.round(LS.get('v4_volume',.4)*100);vol.oninput=()=>{const v=+vol.value/100;LS.set('v4_volume',v);if(musicGain)musicGain.gain.value=v;};
  $('#soundToggle').textContent=soundEnabled?'🔊':'🔇';$('#soundToggle').onclick=()=>{soundEnabled=!soundEnabled;LS.set('v4_sound',soundEnabled);$('#soundToggle').textContent=soundEnabled?'🔊':'🔇';if(masterGain)masterGain.gain.value=soundEnabled?1:0;showToast(soundEnabled?'Âm thanh đã bật':'Âm thanh đã tắt');};
  // visualizer cosmetic
  const vis=$('#visualizer'); for(let i=0;i<40;i++){const b=document.createElement('i');b.className='viz-bar';vis.appendChild(b);}setInterval(()=>{$$('.viz-bar').forEach((b,i)=>b.style.height=(isPlaying?4+Math.random()*18:3)+'px')},130);

  // ---------------- CURSOR / WEATHER FX ----------------
  let cursorMode=LS.get('v4_cursor','sparkle'), weather=LS.get('v4_weather','none');$('#cursorSelect').value=cursorMode;$('#weatherSelect').value=weather;document.body.dataset.cursor=cursorMode;document.body.dataset.weather=weather;
  $('#cursorSelect').onchange=e=>{cursorMode=e.target.value;LS.set('v4_cursor',cursorMode);};$('#weatherSelect').onchange=e=>{weather=e.target.value;LS.set('v4_weather',weather);showToast('Đã đổi background FX');};
  let moveN=0;document.addEventListener('pointermove',e=>{if(cursorMode==='off')return;if(++moveN%7)return;const chars={sparkle:'✦',heart:'♡',bow:'୨୧',flower:'✿'};const el=document.createElement('span');el.className='cursor-fx';el.textContent=chars[cursorMode]||'✦';el.style.left=e.clientX+'px';el.style.top=e.clientY+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),800);});
  setInterval(()=>{if(weather==='none'||document.hidden)return;const p=document.createElement('span');p.className='weather-particle '+weather;const symbols={petal:'🌸',snow:'❄',stars:'✦'};if(weather!=='rain')p.textContent=symbols[weather]||'✦';p.style.left=Math.random()*100+'vw';p.style.animationDuration=(weather==='rain'?1.3:5+Math.random()*4)+'s';p.style.setProperty('--drift',(Math.random()*120-60)+'px');$('#fxLayer').appendChild(p);setTimeout(()=>p.remove(),9500);},weather==='rain'?120:420);
  $('#quickWeatherBtn').onclick=()=>{const modes=['petal','stars','snow','rain','none'];weather=modes[(modes.indexOf(weather)+1)%modes.length];$('#weatherSelect').value=weather;LS.set('v4_weather',weather);showToast('Weather FX: '+weather);};
  function burst(x,y,count=16){const chars=['♡','✦','୨୧','✿'];for(let i=0;i<count;i++){const el=document.createElement('span');el.className='burst';el.textContent=chars[Math.floor(Math.random()*chars.length)];el.style.left=x+'px';el.style.top=y+'px';el.style.setProperty('--dx',(Math.random()*240-120)+'px');el.style.setProperty('--dy',(-80-Math.random()*180)+'px');el.style.fontSize=(13+Math.random()*18)+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),1350);}}

  // ---------------- POINTS / STREAK / STATS ----------------
  let points=LS.get('v4_points',0), stats=LS.get('v4_stats',{diary:0,todoDone:0,focus:0,pet:0,memory:0});
  let diary=LS.get('v4_diary',[]), todos=LS.get('v4_todos',[]), focusTotal=LS.get('v4_focus_total',0), moodMap=LS.get('v4_moods',{}), memories=LS.get('v4_memories',[]), flowers=LS.get('v4_flowers',0);
  function addPoints(n,why){points+=n;LS.set('v4_points',points);syncPoints();if(why)showToast(`+${n} ♡ · ${why}`);checkAchievements();}
  function syncPoints(){['#pointsTop','#pointsHero','#pointsBig','#controlPoints'].forEach(id=>$(id).textContent=points);}
  syncPoints();
  let activityDays=LS.get('v4_activity_days',[]);function markActivity(){const d=new Date().toISOString().slice(0,10);if(!activityDays.includes(d)){activityDays.push(d);LS.set('v4_activity_days',activityDays);}syncStreak();}
  function syncStreak(){let streak=0,cur=new Date();for(let i=0;i<365;i++){const ds=cur.toISOString().slice(0,10);if(activityDays.includes(ds)){streak++;cur.setDate(cur.getDate()-1);}else if(i===0){cur.setDate(cur.getDate()-1);}else break;}$('#streakHero').textContent=streak;return streak;}
  syncStreak();
  function syncStats(){stats.diary=diary.length;stats.todoDone=todos.filter(t=>t.done).length;stats.focus=focusTotal;const moods=Object.values(moodMap);const counts={};moods.forEach(m=>counts[m]=(counts[m]||0)+1);const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';$('#statDiary').textContent=stats.diary;$('#statTodo').textContent=stats.todoDone;$('#statFocus').textContent=stats.focus;$('#statMood').textContent=top;LS.set('v4_stats',stats);}

  // ---------------- ACHIEVEMENTS ----------------
  const achievements=[
    {id:'first_diary',icon:'✎',name:'Dear Diary',desc:'Viết nhật ký đầu tiên',ok:()=>diary.length>=1},
    {id:'diary10',icon:'📓',name:'Diary Lover',desc:'Có 10 trang nhật ký',ok:()=>diary.length>=10},
    {id:'todo20',icon:'✓',name:'Productive Cutie',desc:'Hoàn thành 20 việc',ok:()=>stats.todoDone>=20},
    {id:'focus5',icon:'🍅',name:'Focus Star',desc:'Hoàn thành 5 phiên focus',ok:()=>focusTotal>=5},
    {id:'memory10',icon:'🫙',name:'Memory Keeper',desc:'Cất 10 kỷ niệm',ok:()=>memories.length>=10},
    {id:'streak7',icon:'🔥',name:'Little Dreamer',desc:'Streak 7 ngày',ok:()=>syncStreak()>=7},
    {id:'points500',icon:'♡',name:'Love Collector',desc:'Đạt 500 Love Points',ok:()=>points>=500},
    {id:'garden20',icon:'🌸',name:'Garden Fairy',desc:'Trồng 20 bông hoa',ok:()=>flowers>=20}
  ];
  let unlocked=LS.get('v4_badges',[]);
  function checkAchievements(){let changed=false;achievements.forEach(a=>{if(!unlocked.includes(a.id)&&a.ok()){unlocked.push(a.id);changed=true;showToast(`🏅 Mở badge: ${a.name}`);}});if(changed)LS.set('v4_badges',unlocked);renderAchievementPreview();}
  function renderAchievementPreview(){const got=achievements.filter(a=>unlocked.includes(a.id));$('#badgeHero').textContent=got.length;$('#achievementPreview').className='achievement-preview'+(got.length?'':' empty-state');$('#achievementPreview').innerHTML=got.length?got.slice(-4).map(a=>`<span class="badge-chip">${a.icon} ${a.name}</span>`).join(''):'Chưa mở badge nào.';}
  renderAchievementPreview();
  $('#allBadgesBtn').onclick=()=>openModal(`<small>ACHIEVEMENTS</small><h3>Badge Collection 🏅</h3><div class="badge-grid">${achievements.map(a=>`<div class="badge-item ${unlocked.includes(a.id)?'':'locked'}"><strong>${a.icon} ${a.name}</strong><small>${a.desc}</small></div>`).join('')}</div>`);

  // ---------------- UNLOCK SHOP ----------------
  let shop=LS.get('v4_shop',[]);const shopItems=[
    {id:'sparkle_plus',name:'✨ Sparkle Rain',cost:120,desc:'Mở weather FX sao lấp lánh'},
    {id:'gold_cursor',name:'✦ Golden Cursor',cost:150,desc:'Easter cosmetic'},
    {id:'pet_crown',name:'👑 Pet Crown',cost:220,desc:'Mochi đội vương miện'},
    {id:'secret_quote',name:'💌 Secret Quote',cost:300,desc:'Mở một câu ẩn'}
  ];
  $('#shopBtn').onclick=()=>openShop();
  function openShop(){openModal(`<small>UNLOCK SHOP</small><h3>Đổi Love Points 🎁</h3><p>Điểm hiện có: ♡ ${points}</p><div class="shop-grid">${shopItems.map(x=>`<div class="shop-item ${shop.includes(x.id)?'locked':''}"><strong>${x.name}</strong><small>${x.desc}</small><button data-buy="${x.id}" ${shop.includes(x.id)?'disabled':''}>${shop.includes(x.id)?'Đã mở':'♡ '+x.cost}</button></div>`).join('')}</div>`);setTimeout(()=>$$('[data-buy]').forEach(b=>b.onclick=()=>buyItem(b.dataset.buy)),0);}
  function buyItem(id){const it=shopItems.find(x=>x.id===id);if(!it)return;if(points<it.cost)return showToast('Chưa đủ Love Points');points-=it.cost;shop.push(id);LS.set('v4_shop',shop);LS.set('v4_points',points);syncPoints();showToast('Đã mở '+it.name+' ♡');openShop();}

  // ---------------- PET ----------------
  let pet=LS.get('v4_pet',{name:'Mochi',hunger:70,happy:70,last:Date.now()});
  function decayPet(){const hours=(Date.now()-pet.last)/3600000;if(hours>.25){pet.hunger=Math.max(0,pet.hunger-Math.floor(hours*3));pet.happy=Math.max(0,pet.happy-Math.floor(hours*2));pet.last=Date.now();LS.set('v4_pet',pet);}}
  function renderPet(){decayPet();$('#hungerBar').style.width=pet.hunger+'%';$('#happyBar').style.width=pet.happy+'%';const crown=shop.includes('pet_crown')?'👑 ':'';$('#petName').textContent=crown+pet.name;$('#petFace').textContent=pet.hunger<25?'૮ ˃̣̣̥ ᵕ ˂̣̣̥ ა':pet.happy<30?'૮₍˶• . • ⑅₎ა':'૮ ˶ᵔ ᵕ ᵔ˶ ა';$('#petMoodIcon').textContent=pet.happy>70?'💗':'♡';}
  renderPet();
  $$('[data-pet]').forEach(b=>b.onclick=e=>{const a=b.dataset.pet;if(a==='feed'){pet.hunger=Math.min(100,pet.hunger+22);pet.happy=Math.min(100,pet.happy+4);}if(a==='pet')pet.happy=Math.min(100,pet.happy+18);if(a==='sleep'){pet.hunger=Math.min(100,pet.hunger+6);pet.happy=Math.min(100,pet.happy+10);}pet.last=Date.now();LS.set('v4_pet',pet);stats.pet++;LS.set('v4_stats',stats);addPoints(2,'Chăm Mochi');renderPet();burst(e.clientX,e.clientY,8);});
  setInterval(renderPet,60000);

  // ---------------- MOOD CALENDAR ----------------
  let calendarDate=new Date();
  function localDateKey(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
  function renderMoodCalendar(){const y=calendarDate.getFullYear(),m=calendarDate.getMonth();$('#calendarTitle').textContent=new Date(y,m,1).toLocaleDateString('vi-VN',{month:'long',year:'numeric'});const first=new Date(y,m,1);let start=(first.getDay()+6)%7;const days=new Date(y,m+1,0).getDate();let html='';for(let i=0;i<start;i++)html+='<div class="day-cell blank"></div>';for(let d=1;d<=days;d++){const date=new Date(y,m,d),key=localDateKey(date),today=key===localDateKey();html+=`<div class="day-cell ${today?'today':''}"><span>${d}</span><b>${moodMap[key]||''}</b></div>`;}$('#moodCalendar').innerHTML=html;$('#todayMood').textContent=moodMap[localDateKey()]||'chưa chọn';syncStats();}
  renderMoodCalendar();$('#prevMonth').onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()-1);renderMoodCalendar();};$('#nextMonth').onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()+1);renderMoodCalendar();};
  $$('[data-mood]').forEach(b=>b.onclick=e=>{const mood=b.dataset.mood;moodMap[localDateKey()]=mood;LS.set('v4_moods',moodMap);$$('[data-mood]').forEach(x=>x.classList.toggle('active',x.dataset.mood===mood));renderMoodCalendar();markActivity();addPoints(3,'Check-in mood');burst(e.clientX,e.clientY,9);});

  // ---------------- MEMORY JAR ----------------
  
  function renderJar(){const count=Math.min(memories.length,45);$('#memoryCount').textContent=memories.length;$('#jarHearts').innerHTML=Array.from({length:count},(_,i)=>`<span class="jar-heart">${['♡','✦','🌸'][i%3]}</span>`).join('');stats.memory=memories.length;LS.set('v4_stats',stats);}
  renderJar();
  $('#saveMemoryBtn').onclick=e=>{const v=$('#memoryInput').value.trim();if(!v)return showToast('Viết một điều vui trước nha ♡');memories.unshift({text:v,date:new Date().toLocaleDateString('vi-VN')});memories=memories.slice(0,100);LS.set('v4_memories',memories);$('#memoryInput').value='';renderJar();markActivity();addPoints(5,'Cất một kỷ niệm');burst(e.clientX,e.clientY,12);};
  $('#randomMemoryBtn').onclick=()=>{$('#memoryPaper').textContent=memories.length?memories[Math.floor(Math.random()*memories.length)].text:'Chiếc lọ vẫn đang chờ những điều vui.';sfx('pop');};

  // ---------------- DIARY ----------------
  
  $('#diaryText').oninput=()=>$('#diaryChar').textContent=$('#diaryText').value.length+'/1200';
  function esc(s=''){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function renderDiary(){const box=$('#diaryList');if(!diary.length){box.className='stack-list empty-state';box.textContent='Chưa có nhật ký.';}else{box.className='stack-list';box.innerHTML=diary.slice(0,20).map((x,i)=>`<article class="entry-card"><div class="entry-top"><div><h4>${x.mood} ${esc(x.title||'Một ngày nhỏ')}</h4><small>${x.date}</small></div><button class="text-btn" data-del-diary="${i}">Xóa</button></div><p>${esc(x.text)}</p></article>`).join('');$$('[data-del-diary]').forEach(b=>b.onclick=()=>{diary.splice(+b.dataset.delDiary,1);LS.set('v4_diary',diary);renderDiary();syncStats();});}syncStats();}
  renderDiary();
  $('#saveDiaryBtn').onclick=e=>{const text=$('#diaryText').value.trim();if(!text)return showToast('Viết vài dòng trước nha ♡');diary.unshift({title:$('#diaryTitle').value.trim(),text,mood:$('#diaryMood').value,date:new Date().toLocaleString('vi-VN')});diary=diary.slice(0,60);LS.set('v4_diary',diary);$('#diaryTitle').value='';$('#diaryText').value='';$('#diaryChar').textContent='0/1200';renderDiary();markActivity();addPoints(10,'Viết nhật ký');burst(e.clientX,e.clientY,14);};
  $('#clearDiaryBtn').onclick=()=>{diary=[];LS.set('v4_diary',diary);renderDiary();showToast('Đã dọn nhật ký');};

  // ---------------- FUTURE LETTER ----------------
  let futureLetter=LS.get('v4_future_letter',null);
  function renderFutureLetter(){const box=$('#futureLetterStatus');if(!futureLetter){box.textContent='Chưa có thư nào đang chờ.';return;}const unlock=new Date(futureLetter.date+'T00:00:00'),now=new Date();if(now>=unlock){box.innerHTML=`💌 Thư đã đến ngày mở. <button class="text-btn" id="openFutureNow">Mở thư</button>`;setTimeout(()=>$('#openFutureNow').onclick=()=>openModal(`<small>LETTER TO FUTURE ME</small><h3>Gửi mình của tương lai 💌</h3><p>${esc(futureLetter.text).replace(/\n/g,'<br>')}</p><button class="soft-btn" id="deleteFuture">Xóa thư</button>`),0);}else{const days=Math.ceil((unlock-now)/86400000);box.textContent=`🔒 Còn ${days} ngày nữa mới được mở.`;}}
  renderFutureLetter();
  $('#saveFutureLetterBtn').onclick=()=>{const text=$('#futureLetterText').value.trim(),date=$('#futureLetterDate').value;if(!text||!date)return showToast('Viết thư và chọn ngày mở nha');futureLetter={text,date};LS.set('v4_future_letter',futureLetter);$('#futureLetterText').value='';renderFutureLetter();addPoints(8,'Niêm phong thư tương lai');};
  document.addEventListener('click',e=>{if(e.target?.id==='deleteFuture'){futureLetter=null;LS.set('v4_future_letter',null);closeModal();renderFutureLetter();}});

  // ---------------- TODO ----------------
  
  function renderTodos(){const box=$('#todoList'),done=todos.filter(t=>t.done).length;$('#todoMeta').textContent=`${todos.length} việc · ${done} hoàn thành`;if(!todos.length){box.className='todo-list empty-state';box.textContent='Chưa có việc nào.';}else{box.className='todo-list';box.innerHTML=todos.map((t,i)=>`<div class="todo-item ${t.done?'done':''}"><input class="todo-check" type="checkbox" data-check="${i}" ${t.done?'checked':''}><span class="todo-text">${esc(t.text)}</span><button class="todo-delete" data-del-todo="${i}">×</button></div>`).join('');$$('[data-check]').forEach(c=>c.onchange=()=>{const i=+c.dataset.check,was=todos[i].done;todos[i].done=c.checked;LS.set('v4_todos',todos);if(!was&&c.checked){stats.todoDone++;addPoints(5,'Hoàn thành to-do');addFlower(1);}renderTodos();syncStats();});$$('[data-del-todo]').forEach(b=>b.onclick=()=>{todos.splice(+b.dataset.delTodo,1);LS.set('v4_todos',todos);renderTodos();});}syncStats();}
  renderTodos();function addTodo(){const v=$('#todoInput').value.trim();if(!v)return;todos.unshift({text:v,done:false});LS.set('v4_todos',todos);$('#todoInput').value='';renderTodos();}
  $('#addTodoBtn').onclick=addTodo;$('#todoInput').onkeydown=e=>{if(e.key==='Enter')addTodo();};$('#clearDoneBtn').onclick=()=>{todos=todos.filter(t=>!t.done);LS.set('v4_todos',todos);renderTodos();};

  // ---------------- FOCUS ----------------
  let focusDuration=1500,focusRemain=1500,focusRunning=false,focusTimer=null,focusTodayData=LS.get('v4_focus_today',{date:localDateKey(),count:0});if(focusTodayData.date!==localDateKey())focusTodayData={date:localDateKey(),count:0};
  function syncFocus(){const m=Math.floor(focusRemain/60),s=focusRemain%60;$('#focusClock').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;$('#focusStart').textContent=focusRunning?'❚❚ Tạm dừng':'▶ Bắt đầu';$('#focusToday').textContent=focusTodayData.count;}
  syncFocus();$$('[data-focus]').forEach(b=>b.onclick=()=>{focusDuration=+b.dataset.focus;focusRemain=focusDuration;focusRunning=false;clearInterval(focusTimer);syncFocus();});
  $('#focusStart').onclick=()=>{focusRunning=!focusRunning;clearInterval(focusTimer);if(focusRunning){$('#focusLabel').textContent='Đang tập trung... cố lên ♡';focusTimer=setInterval(()=>{focusRemain--;if(focusRemain<=0){clearInterval(focusTimer);focusRunning=false;focusRemain=focusDuration;focusTotal++;focusTodayData.count++;LS.set('v4_focus_total',focusTotal);LS.set('v4_focus_today',focusTodayData);addPoints(15,'Hoàn thành focus');addFlower(2);burst(innerWidth/2,innerHeight/2,28);$('#focusLabel').textContent='Xong một phiên rồi ✦';syncFocus();syncStats();return;}syncFocus();},1000);}else $('#focusLabel').textContent='Đã tạm dừng.';syncFocus();};
  $('#focusReset').onclick=()=>{clearInterval(focusTimer);focusRunning=false;focusRemain=focusDuration;$('#focusLabel').textContent='Một phiên tập trung ngắn.';syncFocus();};

  // ---------------- STICKY NOTES DRAG ----------------
  let stickies=LS.get('v4_stickies',[]);
  function renderStickies(){const area=$('#stickyArea');area.innerHTML='';stickies.forEach((n,i)=>{const el=document.createElement('div');el.className='sticky-note';el.style.left=(n.x||10)+'px';el.style.top=(n.y||10)+'px';el.style.background=n.color||'#ffeaa7';el.innerHTML=`<button data-sticky-del="${i}">×</button><textarea data-sticky-text="${i}" maxlength="180" placeholder="Viết note...">${esc(n.text||'')}</textarea>`;area.appendChild(el);makeDraggable(el,i);});$$('[data-sticky-del]').forEach(b=>b.onclick=e=>{e.stopPropagation();stickies.splice(+b.dataset.stickyDel,1);saveStickies();});$$('[data-sticky-text]').forEach(t=>t.oninput=()=>{stickies[+t.dataset.stickyText].text=t.value;LS.set('v4_stickies',stickies);});}
  function saveStickies(){LS.set('v4_stickies',stickies);renderStickies();}
  function makeDraggable(el,i){let drag=false,ox=0,oy=0;el.onpointerdown=e=>{if(e.target.tagName==='TEXTAREA'||e.target.tagName==='BUTTON')return;drag=true;el.setPointerCapture(e.pointerId);ox=e.clientX-el.offsetLeft;oy=e.clientY-el.offsetTop;};el.onpointermove=e=>{if(!drag)return;const area=$('#stickyArea');let x=e.clientX-ox,y=e.clientY-oy;x=Math.max(0,Math.min(area.clientWidth-el.offsetWidth,x));y=Math.max(0,Math.min(area.clientHeight-el.offsetHeight,y));el.style.left=x+'px';el.style.top=y+'px';stickies[i].x=x;stickies[i].y=y;};el.onpointerup=()=>{drag=false;LS.set('v4_stickies',stickies);};}
  $('#addStickyBtn').onclick=()=>{const colors=['#ffeaa7','#ffd6e0','#d7ecff','#dcf0c7'];stickies.push({x:10+Math.random()*80,y:10+Math.random()*60,text:'',color:colors[stickies.length%colors.length]});saveStickies();};renderStickies();

  // ---------------- RANDOM CORNER ----------------
  const randomPools={activity:['Đi bộ 15 phút 🌿','Pha một ly nước ngon ☕','Dọn góc bàn nhỏ ✦','Nghe 3 bài nhạc yêu thích 🎧','Viết 5 dòng nhật ký ✎','Chụp một tấm ảnh hôm nay 📷'],food:['Cơm gà 🍗','Mì trộn 🍜','Bánh mì 🥖','Cơm cuộn 🍙','Trái cây + sữa chua 🍓','Một món chưa thử bao giờ ✦'],challenge:['Không mạng xã hội 30 phút','Uống một cốc nước ngay bây giờ','Nhắn một lời dễ thương cho ai đó','Dọn 10 món đồ','Stretch 5 phút','Hoàn thành một việc đã trì hoãn'],fortune:['Có một điều dễ thương đang đến gần ♡','Hôm nay chậm một chút cũng được','Bạn đang làm tốt hơn bạn nghĩ','Đừng quên tự thưởng cho mình','Một ngày bình thường vẫn có thể rất đẹp']};
  $$('[data-random]').forEach(b=>b.onclick=()=>{const p=randomPools[b.dataset.random],r=p[Math.floor(Math.random()*p.length)];$('#randomResult').textContent=r;sfx('pop');});
  $('#quickFortuneBtn').onclick=()=>{const p=randomPools.fortune,r=p[Math.floor(Math.random()*p.length)];openModal(`<small>RANDOM NOTE</small><h3>Một lời nhắn dành cho bạn 💌</h3><p style="font-family:'Playwrite VN';font-size:20px">${r}</p>`);};

  // wheel
  let wheelDeg=0;$('#spinWheelBtn').onclick=()=>{const opts=$('#wheelOptions').value.split('\n').map(x=>x.trim()).filter(Boolean);if(opts.length<2)return showToast('Nhập ít nhất 2 lựa chọn nha');const idx=Math.floor(Math.random()*opts.length);wheelDeg+=1440+Math.floor(Math.random()*720);$('#wheel').style.transform=`rotate(${wheelDeg}deg)`;setTimeout(()=>{$('#wheelResult').textContent='🎯 '+opts[idx];addPoints(1);},2850);};
  // tarot
  const cards=[['The Soft Day','Hôm nay hãy chọn điều khiến bạn thấy nhẹ hơn.','🌷'],['The Star','Một ý tưởng nhỏ có thể dẫn bạn đi xa.','✦'],['The Heart','Đừng quên dành một phần dịu dàng cho chính mình.','♡'],['The Cloud','Không rõ ràng ngay cũng không sao.','☁️'],['The Bloom','Bạn đang lớn lên theo cách riêng của mình.','🌸']];
  $('#drawCardBtn').onclick=()=>{const c=cards[Math.floor(Math.random()*cards.length)];$('#fortuneCardVisual').classList.add('flip');setTimeout(()=>{$('#fortuneCardVisual').textContent=c[2];$('#fortuneCardTitle').textContent=c[0];$('#fortuneCardText').textContent=c[1];$('#fortuneCardVisual').classList.remove('flip');},250);};

  // ---------------- GARDEN ----------------
  let giftDay=LS.get('v4_garden_gift','');
  function addFlower(n=1){flowers+=n;LS.set('v4_flowers',flowers);renderGarden();checkAchievements();}
  function renderGarden(){const symbols=['🌱','🌷','🌼','🌸','🌻','🪻'];$('#flowerCount').textContent=flowers;$('#garden').innerHTML=Array.from({length:Math.min(flowers,80)},(_,i)=>`<span class="flower" style="font-size:${25+(i%4)*4}px">${symbols[(i*7)%symbols.length]}</span>`).join('');}
  renderGarden();$('#gardenGiftBtn').onclick=e=>{const today=localDateKey();if(giftDay===today)return showToast('Hôm nay đã nhận hạt giống rồi 🌱');giftDay=today;LS.set('v4_garden_gift',today);addFlower(1);addPoints(2,'Nhận hạt giống');burst(e.clientX,e.clientY,10);};

  // ---------------- GUESTBOOK LOCAL ----------------
  let guests=LS.get('v4_guests',[]);function renderGuests(){const box=$('#guestList');if(!guests.length){box.className='stack-list empty-state';box.textContent='Chưa có lời nhắn.';return;}box.className='stack-list';box.innerHTML=guests.slice(0,30).map(g=>`<article class="guest-entry"><h4>${esc(g.name||'Ẩn danh')} ♡</h4><small>${g.date}</small><p>${esc(g.message)}</p></article>`).join('');}
  renderGuests();$('#guestSubmit').onclick=()=>{const name=$('#guestName').value.trim(),message=$('#guestMessage').value.trim();if(!message)return showToast('Viết một lời nhắn trước nha');guests.unshift({name,message,date:new Date().toLocaleString('vi-VN')});LS.set('v4_guests',guests);$('#guestName').value='';$('#guestMessage').value='';renderGuests();addPoints(2,'Ký guestbook');};$('#clearGuestbook').onclick=()=>{guests=[];LS.set('v4_guests',guests);renderGuests();};

  // ---------------- SECRET ROOM / EASTER EGGS ----------------
  $('#secretRoomBtn').onclick=()=>openSecret();
  function openSecret(){openModal(`<small>SECRET ROOM</small><h3>Nhập mật mã 🔐</h3><p>Gợi ý: một con số rất quen với fan Conan.</p><input id="secretInput" type="password" maxlength="8" placeholder="••••"><button class="primary-btn small" id="secretUnlock">Mở cửa</button><div id="secretReveal"></div>`);setTimeout(()=>$('#secretUnlock').onclick=()=>{const v=$('#secretInput').value;if(v==='4869'||v==='2026'){const secret=shop.includes('secret_quote')?'“Có những phiên bản của mình chỉ xuất hiện khi không ai nhìn thấy.”':'Bạn đã tìm được căn phòng bí mật ୨୧';$('#secretReveal').innerHTML=`<div style="margin-top:22px;padding:18px;background:var(--paper-2);border-radius:18px"><h3>Welcome, secret visitor ♡</h3><p>${secret}</p><button class="soft-btn" id="secretBurst">Thả bí mật ✦</button></div>`;setTimeout(()=>$('#secretBurst').onclick=e=>burst(e.clientX,e.clientY,26),0);addPoints(5,'Tìm Secret Room');}else showToast('Mật mã chưa đúng');},0);}
  let logoClicks=0;$('#brandEgg').onclick=e=>{logoClicks++;if(logoClicks>=5){e.preventDefault();burst(e.clientX,e.clientY,28);showToast('Easter Egg #1: Found! ୨୧');addPoints(3);logoClicks=0;}};
  let typed='';document.addEventListener('keydown',e=>{typed=(typed+e.key).slice(-4);if(typed==='4869'){openSecret();typed='';}});

  // ---------------- FINAL SYNC ----------------
  syncStats();checkAchievements();renderAchievementPreview();
  document.addEventListener('click',e=>{if(e.target.closest('button'))sfx('tap');});
})();
