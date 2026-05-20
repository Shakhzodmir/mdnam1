  /* ════════════════════════════════════════════════════════════════════
     СОДЕРЖАНИЕ (по разделам, искать по подписи "// ── НАЗВАНИЕ ──")

     ─ ОСНОВА И UI ───────────────────────────────────────────────────
       Data                              базовые данные (consonants/vowels)
       Screen switching                  переключение экранов
       Hero progress segments            сегменты прогресса на главной
       Waveform                          анимация волны
       Streak calendar                   календарь стрика

     ─ HANGUL LAB ────────────────────────────────────────────────────
       Hangul Lab                        конструктор слога
       Hangul Lab: сборка слова          сборка слова из слогов + сохранение
       Audio                             озвучка (TTS)

     ─ ИНТЕРФЕЙС ─────────────────────────────────────────────────────
       Toast                             всплывающие уведомления
       Password show/hide toggle         показ пароля
       Modals                            (общие модалки)

     ─ КАЛЕНДАРЬ / КУЛЬТУРА ──────────────────────────────────────────
       Korean holidays 2026              праздники
       Russian plural                    «день/дня/дней»
       Compute upcoming holidays         ближайшие даты
       Заполняем баннер «Сегодня в Корее»

     ─ УРОКИ ─────────────────────────────────────────────────────────
       Lesson flow                       слайдовый поток урока
       Homework                          домашка (урок + профиль)
       Flashcards                        карточки
       СЛОВА УРОКА 1 · 한글               вокабуляр (l.3260+)
       КАТАЛОГ УРОКОВ                    LESSON_CATALOG (l.3700+)
       Lesson path positions             S-кривая с уроками
       Hero lesson                       блок текущего урока на главной

     ─ ХРАНИЛИЩЕ / СИНК ──────────────────────────────────────────────
       Avatar / Share                    аватарка + ресайз
       Storage                           Store (localStorage обёртка)
       Firebase Sync                     общий контент админа
       Media upload helpers
       Cloud user profile sync           пуш профиля в облако
       Per-user data sync                зеркало в Firebase

     ─ ЛЕНТА И ВИДЕО ─────────────────────────────────────────────────
       Пагинация ленты и видео           feed/video пагинация (5 + 10/стр., 2 + 6/стр.)
       Double-tap to like                Instagram-style
       Feed: likes + comments            социалка ленты
       Comment counting / sorting
       Comment item / Like / Inline reply

     ─ ДОСТИЖЕНИЯ И СТАТИСТИКА ───────────────────────────────────────
       ДОСТИЖЕНИЯ                        ачивки
       Tracking helpers                  счётчики
       Session timer                     visible-only
       Profile achievements rendering
       Level system                      уровни
       Best score tracker                рекорды

     ─ АДМИН ─────────────────────────────────────────────────────────
       Hardcoded admins                  логин/пароль
       Custom content                    customXxx — флешкарты, видео, уроки, посты
       Admin: edit mode state
       Admin: Export / Import all
       Flashcards / K-Pop / Video / Lesson / Feed posts (админ-формы)
       Admin: Students list

     ─ АВТОРИЗАЦИЯ / ПРОФИЛЬ ─────────────────────────────────────────
       Auth                              вход/регистрация
       Forgot password                   через email
       Edit profile                      ред. профиля

     ─ ИГРЫ ──────────────────────────────────────────────────────────
       Game shell                        общая модалка игр
       Game 1: Match Picture
       Game 2: Build Word
       Game 3: Listen
       Game 4: K-Pop Fill
       Game 5: Memory Match
       Game 6: Quick Translate
       Game 7: Numbers
       Game 8: Sentence Build

     ─ ФИНАЛ ─────────────────────────────────────────────────────────
       Intro splash                      приветственный сплеш
       Ambient sakura                    фоновая сакура
       Init                              точка входа: запуск всего
       Firebase Auth                     синхронизация авторизации
     ════════════════════════════════════════════════════════════════════ */

  // ── Data ──
  const consonants = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅎ'];
  const vowels     = ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ'];
  const translitMap = {
    'ㄱ':'g','ㄴ':'n','ㄷ':'d','ㄹ':'r','ㅁ':'m','ㅂ':'b','ㅅ':'s','ㅇ':'','ㅈ':'j','ㅎ':'h',
    'ㅏ':'a','ㅑ':'ya','ㅓ':'eo','ㅕ':'yeo','ㅗ':'o','ㅛ':'yo','ㅜ':'u','ㅠ':'yu','ㅡ':'eu','ㅣ':'i'
  };
  let flashcardSession = [];

  function buildSyllable(c, v) {
    const ci = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'].indexOf(c);
    const vi = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'].indexOf(v);
    if (ci < 0 || vi < 0) return c + v;
    return String.fromCharCode(0xAC00 + ci * 588 + vi * 28);
  }

  // ── Screen switching ──
  function switchScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    // Activate matching nav items in BOTH bottom nav and sidebar nav
    document.querySelectorAll(`.nav-item[data-screen="${name}"]`).forEach(n => n.classList.add('active'));
    if (name === 'hangul' && !document.getElementById('consonants-grid').children.length) initHangulLab();
    if (name === 'games') syncBestScoreCards();
    if (name === 'home') { renderCustomVideos(); renderCustomFeedPosts(); renderHeroLesson(); }
    if (name === 'lessons') { renderCustomLessons(); renderLessonPath(); }
    if (name === 'profile') { syncAchievementsStrip(); renderHomeworkList(); renderSavedWords(); }
    // Scroll: window for mobile, main panel for desktop
    const main = document.querySelector('.app-main');
    if (main && getComputedStyle(main).overflowY === 'auto') main.scrollTo(0, 0);
    else window.scrollTo(0, 0);
  }

  // ── Hero progress segments ──
  function buildHeroSegments() {
    const c = document.getElementById('hero-segments');
    if (!c) return;
    const total = 30, done = 5;
    let html = '';
    for (let i = 0; i < total; i++) {
      const cls = i < done ? 'done' : (i === done ? 'current' : '');
      html += '<span class="' + cls + '"></span>';
    }
    c.innerHTML = html;
  }

  // ── Waveform ──
  function buildWaveform() {
    const c = document.getElementById('waveform');
    if (!c) return;
    let html = '';
    for (let i = 0; i < 48; i++) {
      const h = 4 + Math.floor(Math.abs(Math.sin(i * 0.7) + Math.sin(i * 0.31)) * 9);
      const o = (0.45 + Math.random() * 0.45).toFixed(2);
      html += '<div style="flex:1; background:white; border-radius:999px; height:' + h + 'px; opacity:' + o + ';"></div>';
    }
    c.innerHTML = html;
  }

  // ── Streak calendar ──
  function buildStreakCal() {
    const c = document.getElementById('streak-cal');
    if (!c) return;
    const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    const now = new Date();
    const y = now.getFullYear(), mo = now.getMonth();
    const todayD = now.getDate();
    const visited = new Set(stats.dates || []);
    const firstDow = (new Date(y, mo, 1).getDay() + 6) % 7; // shift Sun=0..Sat=6 → Mon=0..Sun=6
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    let html = '';
    days.forEach(d => html += '<div style="color: rgba(92,42,51,.4); padding: 4px 0;">' + d + '</div>');
    for (let i = 0; i < firstDow; i++) html += '<div></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${y}-${String(mo + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const completed = visited.has(iso);
      const isToday = d === todayD;
      const bg = isToday ? 'background: var(--coral); color:white; font-weight:700;'
                : completed ? 'background: var(--blush); color: var(--berry);'
                : 'color: rgba(92,42,51,.3);';
      html += `<div style="border-radius:999px; padding: 6px 0;${bg}">${d}</div>`;
    }
    c.innerHTML = html;

    const monthChip = document.getElementById('profile-month-chip');
    if (monthChip) monthChip.textContent = `${monthsRu[mo]} ${y}`;
    const streakText = document.getElementById('profile-streak-text');
    if (streakText) streakText.textContent = `${stats.streak} ${pluralDays(stats.streak)}`;
  }

  // ── Hangul Lab ──
  let curCons = 'ㄱ', curVowel = 'ㅏ';
  function initHangulLab() {
    const cg = document.getElementById('consonants-grid');
    const vg = document.getElementById('vowels-grid');
    cg.innerHTML = '';
    vg.innerHTML = '';
    consonants.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'hangul-key ko' + (i === 0 ? ' cons-active' : '');
      b.innerHTML = '<div>' + c + '</div><div class="rom">' + (translitMap[c] || '') + '</div>';
      b.onclick = () => selectCons(c, b);
      cg.appendChild(b);
    });
    vowels.forEach((v, i) => {
      const b = document.createElement('button');
      b.className = 'hangul-key ko' + (i === 0 ? ' vow-active' : '');
      b.innerHTML = '<div>' + v + '</div><div class="rom">' + (translitMap[v] || '') + '</div>';
      b.onclick = () => selectVowel(v, b);
      vg.appendChild(b);
    });
    updateHangul();
  }
  function selectCons(c, btn) {
    document.querySelectorAll('.hangul-key.cons-active').forEach(e => e.classList.remove('cons-active'));
    btn.classList.add('cons-active');
    curCons = c;
    updateHangul();
    recordHangulInteraction();
  }
  function selectVowel(v, btn) {
    document.querySelectorAll('.hangul-key.vow-active').forEach(e => e.classList.remove('vow-active'));
    btn.classList.add('vow-active');
    curVowel = v;
    updateHangul();
    recordHangulInteraction();
  }
  function updateHangul() {
    const r = buildSyllable(curCons, curVowel);
    document.getElementById('hangul-result').textContent = r;
    document.getElementById('hangul-translit').textContent = '[ ' + (translitMap[curCons]||'') + (translitMap[curVowel]||'') + ' ]';
    document.getElementById('cons-display').textContent = curCons;
    document.getElementById('vowel-display').textContent = curVowel;
    document.getElementById('result-display').textContent = r;
    document.getElementById('hangul-formula').textContent = curCons + ' + ' + curVowel + ' = ' + r;
  }
  function speakSyllable(btn) {
    const r = document.getElementById('hangul-result').textContent;
    playSyllable(r, btn);
    const el = document.getElementById('hangul-result');
    el.style.transform = 'scale(1.18)';
    el.style.transition = 'transform .25s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(() => el.style.transform = 'scale(1)', 250);
  }
  function resetHangul() {
    initHangulLab();
    curCons = 'ㄱ'; curVowel = 'ㅏ';
    updateHangul();
    const inp = document.getElementById('hangul-word');
    if (inp) inp.value = '';
  }

  // ── Audio (with proper play/pause toggle) ──
  let currentUtter = null;
  let currentBtn   = null;

  function setBtnPlaying(btn, isPlaying) {
    if (!btn) return;
    if (!btn.dataset.original) btn.dataset.original = btn.innerHTML;
    if (isPlaying) {
      // Replace the play icon with pause; keep label intact.
      btn.innerHTML = btn.dataset.original
        .replace(/fa-play/g, 'fa-pause')
        .replace(/(>\s*)Слушать/, '$1Пауза')
        .replace(/(>\s*)Послушать/, '$1Пауза');
      btn.dataset.playing = '1';
    } else {
      btn.innerHTML = btn.dataset.original;
      delete btn.dataset.playing;
    }
  }

  function stopSpeech() {
    try { speechSynthesis.cancel(); } catch (_) {}
    setBtnPlaying(currentBtn, false);
    currentUtter = null;
    currentBtn   = null;
  }

  function playSyllable(text, btn) {
    if (!('speechSynthesis' in window)) { toast('Голос недоступен в этом браузере'); return; }
    // Toggle: tapping the same button while playing -> stop
    if (btn && btn === currentBtn && btn.dataset.playing) { stopSpeech(); return; }
    stopSpeech();
    const u = new SpeechSynthesisUtterance(text);
    u.lang  = 'ko-KR';
    u.rate  = 0.85;
    u.pitch = 1.05;
    u.onend = u.onerror = () => {
      if (currentBtn === btn) { setBtnPlaying(btn, false); currentUtter = null; currentBtn = null; }
    };
    currentUtter = u;
    currentBtn   = btn || null;
    setBtnPlaying(btn, true);
    speechSynthesis.speak(u);
  }

  function playMadieVoice(btn) {
    playSyllable('안녕하세요. 오늘은 화이팅이라는 단어에 대해 이야기해 볼게요.', btn);
  }

  // ── Pronunciation check (Web Speech API · ko-KR) ──
  function pronounceSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
  function normalizeKo(s) {
    return (s || '').toString().trim().toLowerCase()
      .replace(/[?.!,。、？！'"`]/g, '')
      .replace(/\s+/g, ' ');
  }
  function scoreKoMatch(target, said) {
    if (!target || !said) return 0;
    if (target === said) return 2;                                   // exact
    if (target.includes(said) || said.includes(target)) return 1;    // partial / substring
    // Jaccard on character sets (rough fuzzy fallback)
    const A = new Set([...target]), B = new Set([...said]);
    let inter = 0; A.forEach(c => { if (B.has(c)) inter++; });
    const union = new Set([...A, ...B]).size;
    return (inter / union) >= 0.6 ? 1 : 0;
  }
  function setMicState(btn, state) {
    if (!btn) return;
    btn.classList.remove('mic-listening','mic-ok','mic-near','mic-bad');
    if (state === 'listening') {
      btn.dataset.listening = '1';
      btn.classList.add('mic-listening');
    } else {
      delete btn.dataset.listening;
      if (state === 'ok')   btn.classList.add('mic-ok');
      if (state === 'near') btn.classList.add('mic-near');
      if (state === 'bad')  btn.classList.add('mic-bad');
    }
  }
  function pronounceCheck(targetKo, btn, opts) {
    opts = opts || {};
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Распознавание речи доступно в Chrome/Edge 🎤'); return; }
    if (btn && btn.dataset.listening === '1') {
      try { btn._rec && btn._rec.abort(); } catch (_) {}
      setMicState(btn, 'idle'); return;
    }
    // Pause TTS so it doesn't bleed into the mic
    try { speechSynthesis.cancel(); } catch (_) {}
    const rec = new SR();
    rec.lang = 'ko-KR';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    setMicState(btn, 'listening');
    if (btn) btn._rec = rec;
    let gotResult = false;
    rec.onresult = (e) => {
      gotResult = true;
      const alts = Array.from(e.results[0]).map(a => (a.transcript || '').trim());
      const target = normalizeKo(targetKo);
      let best = { transcript: alts[0] || '', score: 0 };
      for (const a of alts) {
        const s = scoreKoMatch(target, normalizeKo(a));
        if (s > best.score) best = { transcript: a, score: s };
      }
      finishPronounce(btn, best, targetKo, opts);
    };
    rec.onerror = (e) => {
      setMicState(btn, 'idle');
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('Разреши доступ к микрофону 🎤');
      else if (e.error === 'no-speech') toast('Не услышала — попробуй ещё 🌸');
      else if (e.error === 'audio-capture') toast('Микрофон не найден');
    };
    rec.onend = () => { if (!gotResult) setMicState(btn, 'idle'); };
    try { rec.start(); } catch (_) { setMicState(btn, 'idle'); }
  }
  function finishPronounce(btn, result, targetKo, opts) {
    const state = result.score === 2 ? 'ok' : result.score === 1 ? 'near' : 'bad';
    setMicState(btn, state);
    stats.pronunciationAttempts = (stats.pronunciationAttempts || 0) + 1;
    if (result.score === 2) {
      stats.pronunciationCorrect = (stats.pronunciationCorrect || 0) + 1;
      stats.pronunciationStreak = (stats.pronunciationStreak || 0) + 1;
      stats.pronunciationBestStreak = Math.max(stats.pronunciationBestStreak || 0, stats.pronunciationStreak);
      addXp(5);
      if (typeof opts.onCorrect === 'function') opts.onCorrect();
    } else {
      stats.pronunciationStreak = 0;
    }
    UStore.set('stats', stats);
    checkAchievements(true);
    const text = result.score === 2
      ? `잘했어! Произношение чёткое 🌸 +5 XP`
      : result.score === 1
        ? `Близко: «${result.transcript}» — попробуй ещё раз`
        : `Услышала: «${result.transcript || '—'}» · попробуй ещё 🌸`;
    const color = result.score === 2 ? 'var(--sage)' : result.score === 1 ? 'var(--gold)' : '#E89BA1';
    toast(text, color);
    setTimeout(() => setMicState(btn, 'idle'), 2400);
  }

  // ── Toast ──
  function toast(text, color) {
    const t = document.createElement('div');
    t.className = 'toast';
    if (color) t.style.background = color;
    t.innerHTML = text;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0';
      t.style.transform = 'translate(-50%, 6px)';
      setTimeout(() => t.remove(), 320);
    }, 1800);
  }

  // ── Password show/hide toggle (uniform across all password fields) ──
  function togglePass(btn) {
    const wrap = btn.closest('.pass-wrap');
    const inp = wrap && wrap.querySelector('input');
    if (!inp) return;
    const showing = inp.type === 'text';
    inp.type = showing ? 'password' : 'text';
    const icon = btn.querySelector('i');
    if (icon) icon.className = showing ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    btn.setAttribute('aria-label', showing ? 'Показать пароль' : 'Скрыть пароль');
  }

  // ── Hangul Lab: сборка слова из слогов ──
  function addSyllableToWord() {
    const inp = document.getElementById('hangul-word');
    if (!inp) return;
    inp.value += document.getElementById('hangul-result').textContent;
    recordHangulInteraction();
  }
  function backspaceWord() {
    const inp = document.getElementById('hangul-word');
    if (inp) inp.value = inp.value.slice(0, -1);
  }
  function saveHangulWord() {
    const inp = document.getElementById('hangul-word');
    const word = (inp ? inp.value : '').trim();
    if (!word) { toast('Сначала собери или впиши слово 🌸'); return; }
    const list = UStore.get('hangulWords', []);
    if (list.some(w => w.ko === word)) { toast('Это слово уже сохранено 🌸'); return; }
    list.unshift({ ko: word, ts: Date.now() });
    UStore.set('hangulWords', list);
    if (inp) inp.value = '';
    toast('🌸 «' + word + '» сохранено в профиль');
    recordHangulSave();
    recordWordSeen(word);
    renderSavedWords();
  }
  function renderSavedWords() {
    const slot = document.getElementById('saved-words-list');
    if (!slot) return;
    const list = UStore.get('hangulWords', []);
    if (!list.length) {
      slot.innerHTML = `<div style="font-size:11.5px; color:var(--soft); text-align:center; padding:14px; font-style:italic;">Пока нет слов. Собери слово в 한글 Lab 🌸</div>`;
      return;
    }
    slot.innerHTML = `<div style="display:flex; flex-wrap:wrap; gap:8px;">` + list.map((w, i) => `
      <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,.7); border:1px solid var(--line); border-radius:12px; padding:6px 8px 6px 12px;">
        <span class="ko" onclick="playSyllable('${String(w.ko).replace(/'/g, "\\'")}', this)" style="font-size:17px; font-weight:700; color:var(--berry); cursor:pointer;">${w.ko}</span>
        <button onclick="deleteSavedWord(${i})" aria-label="Удалить" style="background:none; border:none; color:var(--soft); cursor:pointer; font-size:15px; line-height:1; padding:2px 4px;">×</button>
      </div>`).join('') + `</div>`;
  }
  function deleteSavedWord(i) {
    const list = UStore.get('hangulWords', []);
    list.splice(i, 1);
    UStore.set('hangulWords', list);
    renderSavedWords();
  }


  // ── Modals ──
  // ── Korean holidays 2026 (fixed + lunar approximations) ──
  const koreanHolidays = {
    '01-01': { ko: '신정',           ru: 'Новый год',           emoji: '🎊' },
    '02-16': { ko: '설날 연휴',       ru: 'Канун Соллаль',        emoji: '🥮' },
    '02-17': { ko: '설날',           ru: 'Соллаль · Лунный НГ',   emoji: '🥟' },
    '02-18': { ko: '설날 연휴',       ru: 'После Соллаль',        emoji: '🍵' },
    '03-01': { ko: '삼일절',          ru: 'День независимости',   emoji: '🇰🇷' },
    '04-05': { ko: '식목일',          ru: 'День посадки деревьев', emoji: '🌳' },
    '05-05': { ko: '어린이날',        ru: 'День детей',            emoji: '🎏' },
    '05-08': { ko: '어버이날',        ru: 'День родителей',        emoji: '🌷' },
    '05-15': { ko: '스승의 날',        ru: 'День учителя',          emoji: '🌸' },
    '05-24': { ko: '부처님 오신 날',   ru: 'Рождение Будды',         emoji: '🪷' },
    '06-06': { ko: '현충일',          ru: 'День памяти',           emoji: '🕊️' },
    '07-17': { ko: '제헌절',          ru: 'День Конституции',      emoji: '📜' },
    '08-15': { ko: '광복절',          ru: 'День освобождения',     emoji: '🎆' },
    '09-24': { ko: '추석 연휴',       ru: 'Канун Чхусок',          emoji: '🌾' },
    '09-25': { ko: '추석',            ru: 'Чхусок · Урожай',        emoji: '🌕' },
    '09-26': { ko: '추석 연휴',       ru: 'После Чхусок',          emoji: '🍶' },
    '10-03': { ko: '개천절',          ru: 'День основания',        emoji: '🏔️' },
    '10-09': { ko: '한글날',          ru: 'День хангыля',          emoji: '한' },
    '11-11': { ko: '빼빼로 데이',      ru: 'День Пеппеpo',          emoji: '🥢' },
    '12-25': { ko: '성탄절',          ru: 'Рождество',             emoji: '🎄' },
    '12-31': { ko: '제야',            ru: 'Канун Нового года',    emoji: '🔔' }
  };
  const monthsRu = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const monthsKo = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const weekdaysRu = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  const weekdaysRuLong = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
  const _now = new Date();
  const TODAY = { y: _now.getFullYear(), m: _now.getMonth(), d: _now.getDate() };

  let calMonth = TODAY.m, calYear = TODAY.y;

  // ── Russian plural for "день/дня/дней" ──
  function pluralDays(n) {
    const m100 = n % 100, m10 = n % 10;
    if (m100 >= 11 && m100 <= 14) return 'дней';
    if (m10 === 1) return 'день';
    if (m10 >= 2 && m10 <= 4) return 'дня';
    return 'дней';
  }
  function untilLabel(diff) {
    if (diff === 0) return 'СЕГОДНЯ';
    if (diff === 1) return 'ЗАВТРА';
    return `ЧЕРЕЗ ${diff} ${pluralDays(diff).toUpperCase()}`;
  }

  // ── Compute upcoming holidays from TODAY ──
  function computeUpcoming(limit) {
    const todayDate = new Date(TODAY.y, TODAY.m, TODAY.d);
    return Object.entries(koreanHolidays).map(([key, h]) => {
      const [mm, dd] = key.split('-').map(n => parseInt(n, 10));
      const date = new Date(TODAY.y, mm - 1, dd);
      const diff = Math.round((date - todayDate) / 86400000);
      return { key, h, mm, dd, diff };
    })
    .filter(x => x.diff >= 0)
    .sort((a, b) => a.diff - b.diff)
    .slice(0, limit);
  }

  // ── Заполняем баннер «Сегодня в Корее» ближайшим праздником ──
  function renderCultureBanner() {
    let next = computeUpcoming(1)[0];
    if (!next) {
      // Все праздники года позади — берём первый праздник следующего года
      const first = Object.entries(koreanHolidays)
        .map(([key, h]) => { const [mm, dd] = key.split('-').map(n => parseInt(n, 10)); return { h, mm, dd }; })
        .sort((a, b) => (a.mm - b.mm) || (a.dd - b.dd))[0];
      if (first) next = { ...first, diff: -1 };
    }
    if (!next) return;
    const { h, mm, dd, diff } = next;
    const emojiEl = document.getElementById('culture-emoji');
    const dateEl  = document.getElementById('culture-date');
    const titleEl = document.getElementById('culture-title');
    if (emojiEl) emojiEl.textContent = h.emoji;
    if (dateEl)  dateEl.textContent  = diff === 0 ? 'СЕГОДНЯ'
                                     : diff >= 1  ? untilLabel(diff)
                                     : `${dd}.${String(mm).padStart(2, '0')}`;
    if (titleEl) titleEl.textContent = `${h.ko} — ${h.ru}`;
  }

  function showCalendar() {
    recordCalendarOpen();
    calMonth = TODAY.m; calYear = TODAY.y;
    const upcoming = computeUpcoming(4);
    const nearest = upcoming.find(u => u.diff > 0);
    const nearestLine = nearest
      ? `Скоро <span class="ko">${nearest.h.ko}</span> ${nearest.h.emoji} — ${untilLabel(nearest.diff).toLowerCase()}`
      : 'Праздников впереди пока нет 🌸';

    const upcomingCards = upcoming.map(u => {
      const todayMark = u.diff === 0;
      return `
        <div onclick="showHolidayInfo('${u.key}')" class="card card-press" style="padding:12px 12px 10px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <span style="font-size:22px; line-height:1;">${u.h.emoji}</span>
            ${todayMark ? '<span class="chip chip-coral" style="font-size:8px; padding:2px 7px;">СЕГОДНЯ</span>' : ''}
          </div>
          <div class="ko" style="font-weight:700; color:var(--berry); margin-top:8px; font-size:14px; line-height:1.15;">${u.h.ko}</div>
          <div style="font-size:11px; color:var(--soft); margin-top:1px; line-height:1.3;">${u.h.ru}</div>
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:10px; gap:6px;">
            <span style="font-size:8.5px; color:var(--coral); font-weight:600; letter-spacing:.08em;">${untilLabel(u.diff)}</span>
            <span style="font-size:12.5px; font-weight:700; color:var(--berry); white-space:nowrap;">${u.dd} ${monthsRu[u.mm-1].toLowerCase().slice(0,3)}</span>
          </div>
        </div>
      `;
    }).join('');

    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-sheet" style="max-width: 400px; border-radius: 28px; max-height: 78vh; margin: 0 16px;">
        <div style="padding: 22px 18px 20px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 14px;">
            <div>
              <div class="page-eyebrow">한국 달력 · КАЛЕНДАРЬ</div>
              <div class="display" style="font-size:20px; color:var(--berry); margin-top:2px;">2026</div>
              <div style="font-size:11px; color: var(--soft); margin-top:2px;">12 месяцев · ${Object.keys(koreanHolidays).length} праздников</div>
            </div>
            <div onclick="this.closest('.modal-bg').remove()" style="font-size:26px; line-height:1; color:var(--soft); cursor:pointer; padding:4px;">×</div>
          </div>

          <!-- Today card -->
          <div class="card card-padded" style="background: linear-gradient(135deg, var(--coral), var(--rose)); color:white; border:none; margin-bottom:16px;">
            <span class="chip" style="background:rgba(255,255,255,.28); color:white;">СЕГОДНЯ</span>
            <div class="ko" style="font-weight:700; font-size:18px; margin-top:8px;">${TODAY.m+1}월 ${TODAY.d}일</div>
            <div style="font-size:13px;">${TODAY.d} ${monthsRu[TODAY.m].toLowerCase()} · ${weekdaysRuLong[new Date(TODAY.y, TODAY.m, TODAY.d).getDay()]}</div>
            <div style="font-size:11.5px; opacity:.9; margin-top:6px;">${nearestLine}</div>
          </div>

          <!-- Upcoming holidays (top block) -->
          <div class="section-head">
            <div class="left"><div class="rule"></div><span class="title">Скоро</span></div>
            <span class="meta">ближайшие праздники</span>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:18px;">
            ${upcomingCards}
          </div>

          <!-- Month switcher -->
          <div class="section-head">
            <div class="left"><div class="rule"></div><span class="title">Календарь</span></div>
            <span class="meta">все 12 месяцев</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; gap:10px;">
            <button onclick="changeMonth(-1)" class="btn btn-ghost" style="padding:10px 14px; min-width:auto;"><i class="fa-solid fa-chevron-left" style="font-size:11px;"></i></button>
            <div style="text-align:center; flex:1;">
              <div class="display" id="cal-month-ru" style="font-size:18px; color:var(--berry); line-height:1.1;">Май</div>
              <div class="ko" id="cal-month-ko" style="font-size:11px; color:var(--coral); margin-top:2px; letter-spacing:.08em;">5월</div>
            </div>
            <button onclick="changeMonth(1)" class="btn btn-ghost" style="padding:10px 14px; min-width:auto;"><i class="fa-solid fa-chevron-right" style="font-size:11px;"></i></button>
          </div>

          <!-- Weekday header -->
          <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:2px; margin-bottom:4px;">
            ${weekdaysRu.map((d,i) => `<div style="font-size:10px; color:${i>=5?'var(--coral)':'var(--soft)'}; padding:6px 0; text-align:center; font-weight:600; letter-spacing:.06em;">${d}</div>`).join('')}
          </div>

          <!-- Date grid -->
          <div id="cal-grid" style="display:grid; grid-template-columns:repeat(7,1fr); gap:3px;"></div>

          <!-- Legend -->
          <div style="display:flex; gap:14px; justify-content:center; margin-top:14px; font-size:10px; color:var(--soft);">
            <span style="display:inline-flex; align-items:center; gap:5px;"><span style="width:8px; height:8px; border-radius:50%; background:var(--grad-coral);"></span> сегодня</span>
            <span style="display:inline-flex; align-items:center; gap:5px;"><span style="width:6px; height:6px; border-radius:50%; background:var(--gold);"></span> праздник</span>
            <span style="display:inline-flex; align-items:center; gap:5px;"><span style="width:6px; height:6px; border-radius:50%; background:var(--rose);"></span> выходной</span>
          </div>

          <!-- Holiday list of month -->
          <div id="cal-holidays-wrap" style="margin-top:18px;">
            <div class="section-head">
              <div class="left"><div class="rule"></div><span class="title">Праздники месяца</span></div>
            </div>
            <div id="cal-holidays" style="display:grid; gap:8px;"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    renderCalendarMonth();
  }

  function changeMonth(delta) {
    calMonth += delta;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    else if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendarMonth();
  }

  function renderCalendarMonth() {
    const headRu = document.getElementById('cal-month-ru');
    const headKo = document.getElementById('cal-month-ko');
    const grid   = document.getElementById('cal-grid');
    const list   = document.getElementById('cal-holidays');
    if (!grid) return;
    headRu.textContent = `${monthsRu[calMonth]} ${calYear}`;
    headKo.textContent = monthsKo[calMonth];

    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Mon=0..Sun=6

    let html = '';
    for (let i = 0; i < firstDow; i++) html += '<div></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const h = koreanHolidays[key];
      const wd = (firstDow + d - 1) % 7;
      const isWeekend = wd >= 5;
      const isToday = (calYear === TODAY.y && calMonth === TODAY.m && d === TODAY.d);

      let style = 'position:relative; aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:500; border-radius:10px; transition:transform .15s var(--ease-out), background .15s ease;';
      let dot = '';
      let onclick = '';

      if (isToday) {
        style += ' background:var(--grad-coral); color:white; font-weight:700; box-shadow:0 4px 12px -4px rgba(224,118,134,.55), inset 0 1px 0 rgba(255,255,255,.3);';
      } else if (h) {
        style += ' background:linear-gradient(140deg, rgba(201,165,92,.18), rgba(201,165,92,.08)); color:#7B5A1F; font-weight:600; cursor:pointer;';
        dot = `<div style="position:absolute; bottom:3px; left:50%; transform:translateX(-50%); width:4px; height:4px; border-radius:50%; background:var(--gold);"></div>`;
        onclick = `onclick="showHolidayInfo('${key}')"`;
      } else if (isWeekend) {
        style += ' color:var(--rose);';
      } else {
        style += ' color:var(--berry);';
      }

      html += `<div ${onclick} style="${style}">${d}${dot}</div>`;
    }
    grid.innerHTML = html;

    // Holiday list for this month
    const monthHolidays = Object.entries(koreanHolidays)
      .filter(([k]) => k.startsWith(String(calMonth+1).padStart(2,'0') + '-'))
      .sort(([a],[b]) => a.localeCompare(b));
    if (monthHolidays.length === 0) {
      list.innerHTML = `<div style="text-align:center; font-size:11.5px; color:var(--soft); padding:14px 0; font-style:italic;">В этом месяце праздников нет 🌸</div>`;
    } else {
      list.innerHTML = monthHolidays.map(([key, h]) => {
        const day = parseInt(key.split('-')[1], 10);
        const isToday = (calYear === TODAY.y && calMonth === TODAY.m && day === TODAY.d);
        return `
          <div onclick="showHolidayInfo('${key}')" class="card card-press" style="display:flex; gap:12px; align-items:center; padding:12px 14px;">
            <div style="width:38px; height:38px; flex-shrink:0; border-radius:12px; background:linear-gradient(140deg, var(--blush), var(--paper)); display:flex; align-items:center; justify-content:center; font-size:20px;">${h.emoji}</div>
            <div style="flex:1; min-width:0;">
              <div class="ko" style="font-weight:700; color:var(--berry); font-size:13.5px;">${h.ko}</div>
              <div style="font-size:11px; color:var(--soft); margin-top:1px;">${h.ru}</div>
            </div>
            <div style="text-align:right; flex-shrink:0;">
              <div style="font-size:13px; font-weight:700; color:${isToday?'var(--coral)':'var(--berry)'};">${day} ${monthsRu[calMonth].toLowerCase().slice(0,3)}</div>
              ${isToday ? '<div style="font-size:9px; color:var(--coral); font-weight:600; letter-spacing:.1em;">СЕГОДНЯ</div>' : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function showHolidayInfo(key) {
    const h = koreanHolidays[key];
    if (!h) return;
    const [mm, dd] = key.split('-').map(n => parseInt(n,10));
    toast(`${h.emoji} <span class="ko">${h.ko}</span> · ${h.ru} — ${dd} ${monthsRu[mm-1].toLowerCase()}`);
  }

  function showCultureDetail() {
    recordCultureOpen();
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:28px;">🎎</div>
            <div class="display" style="font-size:22px; color:var(--berry); margin-top:6px;">정 (jeong)</div>
            <div style="color: var(--coral); font-size: 12px; margin-top:2px;">Непереводимое корейское слово</div>
          </div>
          <div onclick="this.closest('.modal-bg').remove()" style="font-size:28px; line-height:1; color:var(--soft); cursor:pointer; padding:4px;">×</div>
        </div>
        <div style="font-size:13.5px; color: rgba(92,42,51,.85); line-height:1.55; margin-top:18px; display:grid; gap: 10px;">
          <p><span class="ko" style="font-weight:600;">정</span> — это глубокая привязанность и тёплая связь между людьми, которая <em>растёт со временем</em>.</p>
          <p>Нельзя перевести одним русским словом: это и любовь, и дружба, и привычка, и тоска по близкому человеку.</p>
          <p class="ko" style="color:var(--coral); font-style:italic;">«정이 들었어» — «Я привязалась к тебе всей душой»</p>
        </div>
        <div class="ko-quote" style="margin-top: 16px; font-size: 12px;">
          💡 Корейцы говорят, что 정 может возникнуть даже с местом или едой — не только с людьми.
        </div>
      </div>
    `;
    document.body.appendChild(m);
  }

  // ── Lesson flow (слайдовый, по презентации) ──
  let lessonStage = 0;
  let lessonViewId = null; // админ: открыть конкретный урок мимо прогресса
  function startLessonFlow(id) { lessonViewId = id || null; lessonStage = 0; renderLesson(); }
  function lessonSlides() {
    const l = getCurrentLesson();
    return (l && Array.isArray(l.slides)) ? l.slides : [];
  }
  function renderLesson() {
    const lesson = getCurrentLesson();
    const m = document.createElement('div');
    m.className = 'modal-bg';
    m.id = 'lesson-modal';
    m.onclick = e => { if (e.target === m) closeLessonFlow(); };
    if (!lesson) {
      m.innerHTML = `
        <div class="modal-sheet">
          <div style="padding:36px 24px; text-align:center;">
            <div style="font-size:48px;">🎉</div>
            <div class="display" style="font-size:24px; color:var(--berry); margin-top:10px;">Все уроки пройдены</div>
            <div style="font-size:12.5px; color:var(--soft); margin-top:6px;">Ждём новых уроков от Мади 🌸</div>
            <button onclick="closeLessonFlow()" class="btn btn-primary btn-block" style="margin-top:20px;">Закрыть</button>
          </div>
        </div>`;
      const o = document.getElementById('lesson-modal');
      if (o) o.replaceWith(m); else document.body.appendChild(m);
      return;
    }
    const slides = lesson.slides || [];
    const total = slides.length + 1;
    lessonStage = Math.max(0, Math.min(lessonStage, total - 1));
    const isDone = lessonStage >= slides.length;
    const slide = isDone ? { kind:'done' } : slides[lessonStage];
    const body = renderLessonSlide(lesson, slide);
    const segs = Array.from({length: total}, (_,j) =>
      `<span style="flex:1; height:3px; border-radius:999px; background:${j<=lessonStage?'var(--coral)':'rgba(242,166,174,.3)'};"></span>`).join('');
    m.innerHTML = `
      <div class="modal-sheet" style="height: 92vh;">
        <div style="padding: 18px 20px; border-bottom: 1px solid var(--line); display:flex; align-items:center; justify-content:space-between; gap:14px; position:sticky; top:0; background: var(--cream); z-index:1;">
          <button onclick="closeLessonFlow()" style="background:none; border:none; font-size:22px; color:var(--soft); cursor:pointer; line-height:1;">×</button>
          <div style="display:flex; gap:4px; flex:1;">${segs}</div>
          <div style="font-size:11px; color: var(--soft); white-space:nowrap;">${lessonStage+1} / ${total}</div>
        </div>
        <div style="padding: 24px 20px 32px;">${body}</div>
      </div>
    `;
    const old = document.getElementById('lesson-modal');
    if (old) old.replaceWith(m);
    else document.body.appendChild(m);
  }
  // ── Homework (общий блок: урок + профиль) ──
  function homeworkBodyHtml(lesson) {
    const hw = (lesson && lesson.homework) || {};
    const tasks = Array.isArray(hw.tasks) ? hw.tasks : [];
    const words = Array.isArray(lesson && lesson.vocab) ? lesson.vocab : [];
    const file = hw.file;
    const taskHtml = tasks.map((t,i) => `
      <div class="card card-padded" style="display:flex; gap:12px; align-items:flex-start;">
        <div style="width:26px; height:26px; flex-shrink:0; border-radius:50%; background:var(--blush); color:var(--berry); font-weight:700; display:flex; align-items:center; justify-content:center; font-size:13px;">${i+1}</div>
        <p style="font-size:12.5px; color:var(--berry); line-height:1.5;">${t}</p>
      </div>`).join('');
    const wordsHtml = words.map(w => `
      <div style="display:flex; align-items:center; gap:8px; padding:8px 10px; background:rgba(255,255,255,.6); border:1px solid var(--line); border-radius:12px;">
        <span class="ko" style="font-size:17px; font-weight:700; color:var(--berry); flex-shrink:0;">${w.ko}</span>
        <span style="font-size:11px; color:var(--soft); line-height:1.25;">${w.ru}</span>
      </div>`).join('');
    const fileHtml = file ? `
      <div style="font-size:10px; letter-spacing:.18em; color:var(--soft); margin:18px 0 8px;">МАТЕРИАЛЫ</div>
      <div class="card card-padded" style="display:flex; align-items:center; gap:12px;">
        <div style="width:42px; height:42px; flex-shrink:0; border-radius:12px; background:rgba(201,165,92,.15); display:flex; align-items:center; justify-content:center; font-size:20px;">📄</div>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:600; color:var(--berry); font-size:12.5px;">${file.label}</div>
          <div style="font-size:10.5px; color:var(--soft); margin-top:1px;">${file.note || ''}</div>
        </div>
        ${file.url
          ? `<a href="${file.url}" download class="btn btn-primary" style="flex-shrink:0; padding:9px 14px; font-size:12px;"><i class="fa-solid fa-download"></i> Скачать</a>`
          : `<button onclick="toast('Файл скоро добавим 🌸')" class="btn btn-ghost" style="flex-shrink:0; padding:9px 14px; font-size:12px;"><i class="fa-solid fa-download"></i> Скоро</button>`}
      </div>` : '';
    return `
      <div style="display:grid; gap:10px;">${taskHtml}</div>
      ${words.length ? `
        <div style="font-size:10px; letter-spacing:.18em; color:var(--soft); margin:18px 0 8px;">СЛОВА ДЛЯ ЗАУЧИВАНИЯ · ${words.length}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">${wordsHtml}</div>` : ''}
      ${fileHtml}
    `;
  }
  function openHomework(lessonId) {
    const lesson = getAllLessons().find(l => l.id === lessonId);
    if (!lesson) { toast('Урок не найден 🌸'); return; }
    const m = document.createElement('div');
    m.className = 'modal-bg';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-sheet" style="height: 90vh;">
        <div style="padding: 18px 20px; border-bottom: 1px solid var(--line); display:flex; align-items:center; justify-content:space-between; gap:14px; position:sticky; top:0; background: var(--cream); z-index:1;">
          <div style="min-width:0;">
            <div class="page-eyebrow">УРОК ${lesson.num} · ${lesson.title}</div>
            <div class="display" style="font-size:19px; color:var(--berry); margin-top:2px;">Домашнее задание</div>
          </div>
          <button onclick="this.closest('.modal-bg').remove()" style="background:none; border:none; font-size:22px; color:var(--soft); cursor:pointer; line-height:1;">×</button>
        </div>
        <div style="padding: 22px 20px 32px;">
          ${homeworkBodyHtml(lesson)}
          <button onclick="this.closest('.modal-bg').remove()" class="btn btn-primary btn-block" style="margin-top:20px;">Понятно ✓</button>
        </div>
      </div>`;
    document.body.appendChild(m);
  }
  function renderHomeworkList() {
    const slot = document.getElementById('homework-list');
    if (!slot) return;
    if (!LESSON_CATALOG.length) {
      slot.innerHTML = `<div style="font-size:12px; color:var(--soft); text-align:center; padding:14px;">Уроков пока нет 🌸</div>`;
      return;
    }
    slot.innerHTML = LESSON_CATALOG.map(l => `
      <div class="card card-padded card-press" onclick="openHomework('${l.id}')" style="display:flex; align-items:center; gap:12px; cursor:pointer; margin-bottom:10px;">
        <div style="width:38px; height:38px; flex-shrink:0; border-radius:12px; background:var(--blush); display:flex; align-items:center; justify-content:center; font-size:18px;">📒</div>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:600; color:var(--berry); font-size:13px;">Урок ${l.num} · ${l.title}</div>
          <div style="font-size:10.5px; color:var(--soft); margin-top:1px;">${(l.homework && l.homework.tasks ? l.homework.tasks.length : 0)} задания · ${Array.isArray(l.vocab) ? l.vocab.length : 0} слов</div>
        </div>
        <span class="chip chip-coral" style="flex-shrink:0; font-size:10px;">Открыть →</span>
      </div>`).join('');
  }
  function lessonNav(nextLabel, lockNext) {
    return `
      <div style="display:flex; gap:10px; margin-top:22px;">
        <button onclick="prevLesson()" class="btn btn-ghost" style="flex:1;">← Назад</button>
        <button ${lockNext ? 'id="quiz-next-btn" disabled' : ''} onclick="nextLesson()" class="btn btn-primary" style="flex:1.6;${lockNext ? ' opacity:.45; pointer-events:none;' : ''}">${nextLabel}</button>
      </div>`;
  }
  function renderLessonSlide(lesson, slide) {
    const hint = note => note ? `
      <div class="card card-padded" style="background: rgba(201,165,92,.10); border-color: rgba(201,165,92,.4); margin-top:18px;">
        <div style="display:flex; gap:10px;">
          <span style="font-size:18px;">✨</span>
          <p style="font-size:12.5px; color:var(--berry); line-height:1.5;">${note}</p>
        </div>
      </div>` : '';
    if (slide.kind === 'intro') {
      return `
        <div style="text-align:center;">
          <div class="page-eyebrow">УРОК ${lesson.num}</div>
          <div class="ko" style="font-size:56px; font-weight:800; color:var(--berry); margin-top:10px; line-height:1;">${lesson.ko}</div>
          <div class="display" style="font-size:23px; color:var(--berry); margin-top:8px;">${slide.title}</div>
          <div style="font-size:13px; color:rgba(92,42,51,.72); margin-top:6px;">${slide.sub}</div>
        </div>
        <div class="ko-quote" style="margin-top:22px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <div style="width:28px; height:28px; background:white; border-radius:50%; border:1px solid var(--gold); display:flex; align-items:center; justify-content:center;">🌸</div>
            <div style="font-size:13px;"><span style="font-weight:600;">Мади</span> <span style="color:var(--soft); font-size:11px; margin-left:6px;">учитель</span></div>
          </div>
          <p>«Сегодня знакомимся с <span class="ko" style="font-weight:600;">한글</span> — корейской азбукой. Пройдём буквы, послушаем звуки и выучим первые слова. Это магия 🌸 화이팅!»</p>
        </div>
        <div style="margin-top:20px;">
          <div style="font-size:10px; letter-spacing:0.18em; color:var(--soft); padding:0 4px; margin-bottom:8px;">ЧТО ВЫУЧИМ</div>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px;">
            ${(slide.learn||[]).map(([e,t]) => `<div class="card card-padded" style="text-align:center; padding:12px 8px;"><div style="font-size:22px;">${e}</div><div style="font-size:10.5px; margin-top:4px;">${t}</div></div>`).join('')}
          </div>
        </div>
        <button onclick="nextLesson()" class="btn btn-rose btn-block" style="margin-top:22px;">Поехали <span class="ko">시작!</span> <i class="fa-solid fa-arrow-right" style="font-size:11px;"></i></button>
      `;
    }
    if (slide.kind === 'info') {
      const cols = slide.cols || 5;
      const cells = slide.grid.map(g => {
        const tap = slide.noPlay ? '' : `onclick="lessonPlay('${g.ko}', this)"`;
        return `<div class="card card-padded" ${tap} style="text-align:center; padding:12px 6px; ${slide.noPlay?'':'cursor:pointer;'} ${cols===1?'display:flex; align-items:center; gap:14px; text-align:left;':''}">
          <div class="ko" style="font-size:${cols===1?'22px':'30px'}; font-weight:700; color:var(--berry); ${cols===1?'flex-shrink:0; min-width:96px;':''}">${g.ko}</div>
          <div style="font-size:${cols===1?'12.5px':'11px'}; color:var(--soft); margin-top:${cols===1?'0':'3px'};">${g.ru}</div>
        </div>`;
      }).join('');
      return `
        <div class="page-eyebrow">${slide.eyebrow}</div>
        <div class="display" style="font-size:22px; color:var(--berry); margin-top:4px;">${slide.title}</div>
        <div class="ko" style="font-size:13px; color:var(--coral); margin-top:2px;">${slide.sub||''}</div>
        <div style="display:grid; grid-template-columns:repeat(${cols},1fr); gap:8px; margin-top:16px;">${cells}</div>
        ${hint(slide.note)}
        ${lessonNav('Понятно ✓')}
      `;
    }
    if (slide.kind === 'quiz') {
      const rows = slide.items.map(it => lessonQuizItem(it, slide.pool)).join('');
      return `
        <div class="page-eyebrow">${slide.eyebrow}</div>
        <div class="display" style="font-size:21px; color:var(--berry); margin-top:4px;">${slide.title}</div>
        <div style="font-size:12px; color:var(--coral); margin-top:2px;">Выбери правильный звук для каждой буквы</div>
        <div id="quiz-grid" style="display:grid; gap:10px; margin-top:16px;">${rows}</div>
        ${lessonNav('Дальше →', true)}
      `;
    }
    if (slide.kind === 'words') {
      const cards = slide.items.map(w => `
        <div onclick="lessonWordTap(this, '${w.ko}')" class="card card-press" style="padding:14px 10px; text-align:center; cursor:pointer;">
          <div style="font-size:32px;">${w.emoji}</div>
          <div class="ko" style="font-size:22px; font-weight:700; color:var(--berry); margin-top:4px;">${w.ko}</div>
          <div style="font-size:11px; color:var(--soft); margin-top:2px;">${w.ru}</div>
        </div>`).join('');
      return `
        <div class="page-eyebrow">${slide.eyebrow}</div>
        <div class="display" style="font-size:22px; color:var(--berry); margin-top:4px;">${slide.title}</div>
        <div style="font-size:12px; color:var(--coral); margin-top:2px;">Тапни карточку — услышишь слово 🔊</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px;">${cards}</div>
        ${lessonNav('Дальше →')}
      `;
    }
    if (slide.kind === 'homework') {
      return `
        <div style="text-align:center;">
          <div style="font-size:42px;">📒</div>
          <div class="display" style="font-size:23px; color:var(--berry); margin-top:6px;">Домашнее задание</div>
        </div>
        <div style="margin-top:18px;">${homeworkBodyHtml(lesson)}</div>
        ${lessonNav('Завершить урок →')}
      `;
    }
    // done
    const wordCount = Array.isArray(lesson.vocab) ? lesson.vocab.length : 0;
    return `
      <div style="text-align:center; padding-top:8px;">
        <div style="font-size:56px;">🌸</div>
        <div class="display" style="font-size:25px; color:var(--berry); margin-top:8px;">Урок ${lesson.num} пройден</div>
        <div class="ko" style="font-size:18px; color:var(--coral); margin-top:2px;">잘했어 🌸</div>
        <div style="margin:24px auto 0; width:120px; height:120px; background:white; border:8px solid rgba(201,165,92,.18); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:64px; color:var(--sage);">✓</div>
        <div class="card card-padded" style="background: linear-gradient(135deg, var(--gold), var(--coral)); color:white; border:none; margin:22px 0 0; text-align:left;">
          <div style="font-size:9.5px; letter-spacing:0.2em; opacity:.85;">🎮 ЧТО ДАЛЬШЕ</div>
          <div style="font-weight:600; margin-top:4px;">Слова урока добавлены в игры</div>
          <div style="font-size:11.5px; opacity:.9; margin-top:2px;">${wordCount} слов теперь в карточках, мемори, переводе и других играх</div>
        </div>
        <button onclick="completeLesson()" class="btn btn-primary btn-block" style="margin-top:18px;">Готово ✓</button>
      </div>
    `;
  }
  function lessonQuizItem(it, pool) {
    const wrong = shuffleArr((pool||[]).filter(s => s !== it.ru)).slice(0, 2);
    const opts = shuffleArr([it.ru, ...wrong]);
    return `
      <div class="card card-padded quiz-row" style="display:flex; align-items:center; gap:12px;">
        <div class="ko" style="font-size:38px; font-weight:800; color:var(--berry); width:54px; text-align:center; flex-shrink:0;">${it.ko}</div>
        <div style="display:flex; gap:6px; flex:1; flex-wrap:wrap;">
          ${opts.map(o => `<button onclick="lessonQuizPick(this, '${o}', '${it.ru}')" class="btn btn-ghost" style="flex:1; min-width:62px; padding:10px 6px; font-size:13px;">${o}</button>`).join('')}
        </div>
      </div>`;
  }
  function lessonQuizPick(btn, chosen, correct) {
    const row = btn.closest('.quiz-row');
    if (chosen === correct) {
      [...btn.parentElement.children].forEach(b => { b.style.pointerEvents = 'none'; });
      btn.style.background = 'rgba(132,196,116,.15)';
      btn.style.borderColor = 'var(--sage)';
      btn.style.color = '#4F7B43';
      if (row) row.dataset.done = '1';
      lessonQuizCheck();
    } else {
      btn.style.background = '#FFEBEE';
      btn.style.borderColor = '#E89BA1';
      setTimeout(() => { btn.style.background = ''; btn.style.borderColor = ''; }, 700);
    }
  }
  function lessonQuizCheck() {
    const grid = document.getElementById('quiz-grid');
    if (!grid) return;
    const rows = [...grid.querySelectorAll('.quiz-row')];
    if (rows.length && rows.every(r => r.dataset.done === '1')) {
      const nb = document.getElementById('quiz-next-btn');
      if (nb && nb.hasAttribute('disabled')) {
        nb.removeAttribute('disabled');
        nb.style.opacity = '1';
        nb.style.pointerEvents = '';
        addXp(10);
        toast('잘했어! Всё верно 🌸 +10 XP', 'var(--sage)');
      }
    }
  }
  function lessonWordTap(el, ko) { playSyllable(ko, el); recordWordSeen(ko); }
  function lessonPlay(text, el) { playSyllable(text, el); }
  function nextLesson() {
    const total = lessonSlides().length + 1;
    lessonStage = Math.min(total - 1, lessonStage + 1);
    renderLesson();
  }
  function prevLesson() { lessonStage = Math.max(0, lessonStage - 1); renderLesson(); }
  function closeLessonFlow() { lessonViewId = null; document.getElementById('lesson-modal')?.remove(); }
  function completeLesson() {
    const lesson = getCurrentLesson();
    if (lesson && Array.isArray(lesson.vocab)) lesson.vocab.forEach(w => recordWordSeen(w.ko));
    closeLessonFlow();
    if (isAdmin()) {
      // Админ только просматривает — прогресс/XP не трогаем, но карточку всё равно показываем
      renderLessonPath();
      showLessonCompletePopup(lesson, 0);
      return;
    }
    const xp = 20;
    completeCurrentLesson();
    addXp(xp);
    renderLessonPath();
    renderHeroLesson();
    showLessonCompletePopup(lesson, xp);
    checkAchievements();
  }
  function showLessonCompletePopup(lesson, xp) {
    if (!lesson) return;
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.id = 'lesson-complete-modal';
    m.onclick = e => { if (e.target === m) m.remove(); };
    const xpChip = xp > 0
      ? `<div style="margin-top:16px;"><span class="chip" style="background:linear-gradient(140deg,var(--coral),var(--gold)); color:white; font-weight:600;">+${xp} XP · 🔥</span></div>`
      : '';
    m.innerHTML = `
      <div class="modal-card lesson-complete-card">
        <img src="assets/bear5.png" alt="" class="lesson-complete-bear" onerror="this.style.display='none'">
        <div class="page-eyebrow" style="color:var(--coral);">УРОК ${lesson.num} ПРОЙДЕН</div>
        <div class="display" style="font-size:26px; color:var(--berry); margin-top:6px; line-height:1.15;">${lesson.title}</div>
        ${lesson.ko ? `<div class="ko" style="font-size:16px; color:var(--soft); margin-top:4px;">${lesson.ko}</div>` : ''}
        ${xpChip}
        <div style="margin-top:14px; font-size:13px; color:var(--soft); line-height:1.55; padding:0 8px;">
          Отлично! Мади гордится тобой 🌸<br>Продолжай в том же духе.
        </div>
        <button onclick="this.closest('.modal-bg').remove()" class="btn btn-primary" style="margin-top:22px; width:100%; justify-content:center;">
          Дальше <i class="fa-solid fa-arrow-right" style="font-size:11px;"></i>
        </button>
      </div>
    `;
    document.body.appendChild(m);
  }

  // ── Flashcards ──
  let cardIdx = 0, flipped = false;
  function buildFlashcards() {
    return [
      ...gameWordPool().map(w => ({ front:w.ko, translit:w.translit||'', emoji:w.emoji||'🌸', meaning:w.ru, example:w.example||'' })),
      ...Store.get('customFlashcards', [])
    ];
  }
  function startFlashcards() {
    flashcardSession = shuffleArr(buildFlashcards());
    cardIdx = 0; flipped = false;
    renderFlashcardModal();
  }
  function renderFlashcardModal() {
    const card = getFlashcardsAll()[cardIdx];
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.id = 'flash-modal';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div>
            <div class="page-eyebrow">КАРТОЧКИ СЛОВ</div>
            <div style="font-size:11px; color:var(--soft); margin-top:2px;">${cardIdx+1} из ${getFlashcardsAll().length} · SM-2</div>
          </div>
          <div onclick="this.closest('.modal-bg').remove()" style="font-size:24px; line-height:1; color:var(--soft); cursor:pointer;">×</div>
        </div>
        <div class="flashcard ${flipped ? 'flipped' : ''}" id="fc" style="width:100%; height:240px;" onclick="flipFlashcard()">
          <div class="flashcard-inner">
            <div class="flashcard-face flashcard-front">
              <div style="font-size:42px;">${card.emoji}</div>
              <div class="ko" style="font-size:50px; font-weight:700; color:var(--berry); line-height:1; margin-top:6px;">${card.front}</div>
              ${card.translit ? `<div style="color:var(--coral); letter-spacing: 0.32em; margin-top: 6px;">[ ${card.translit} ]</div>` : ''}
              <div style="display:flex; gap:8px; margin-top:14px;" onclick="event.stopPropagation();">
                <button onclick="event.stopPropagation(); playSyllable('${card.front.replace(/'/g, "\\'")}', this)" class="btn-mic" style="background:white; border-color:rgba(242,166,174,.4);"><i class="fa-solid fa-volume-up"></i> Послушать</button>
                <button onclick="event.stopPropagation(); pronounceCheck('${card.front.replace(/'/g, "\\'")}', this)" class="btn-mic"><i class="fa-solid fa-microphone"></i> Произнести</button>
              </div>
              <div style="position:absolute; bottom:10px; font-size:10px; color: var(--soft);">Тапни карточку, чтобы перевернуть</div>
            </div>
            <div class="flashcard-face flashcard-back">
              <div style="font-size:10px; opacity:.7; letter-spacing: 0.16em;">ЗНАЧИТ</div>
              <div class="display" style="font-size:32px; margin-top:4px;">${card.meaning}</div>
              ${card.example ? `<div style="border-top:1px solid rgba(255,255,255,.18); border-bottom:1px solid rgba(255,255,255,.18); padding: 14px 0; margin-top:18px; font-size:12.5px; text-align:center; line-height:1.5;">
                <span class="ko">«${card.example.split(' — ')[0]}»</span><br>
                <span style="opacity:.8;">— ${card.example.split(' — ')[1] || ''}</span>
              </div>` : ''}
            </div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 18px;">
          <button onclick="rateCard(0)" class="btn btn-ghost" style="padding: 10px 6px; font-size: 11px; flex-direction:column; gap: 2px; border-color: #E89BA1; color: #E89BA1;">😵<span style="font-size:9px;">Не помню</span></button>
          <button onclick="rateCard(1)" class="btn btn-ghost" style="padding: 10px 6px; font-size: 11px; flex-direction:column; gap: 2px;">🤔<span style="font-size:9px;">С трудом</span></button>
          <button onclick="rateCard(2)" class="btn btn-ghost" style="padding: 10px 6px; font-size: 11px; flex-direction:column; gap: 2px; border-color: var(--sage); color: #4F7B43;">🙂<span style="font-size:9px;">Знаю</span></button>
          <button onclick="rateCard(3)" class="btn btn-primary" style="padding: 10px 6px; font-size: 11px; flex-direction:column; gap: 2px;">🌟<span style="font-size:9px;">Идеально!</span></button>
        </div>
      </div>
    `;
    const old = document.getElementById('flash-modal');
    if (old) old.replaceWith(m);
    else document.body.appendChild(m);
  }
  function flipFlashcard() { flipped = !flipped; document.getElementById('fc').classList.toggle('flipped', flipped); }
  function rateCard(rating) {
    const msgs = ['Ах, ничего страшного 🌸 Попробуем позже', 'Хорошо, что стараешься! 💪', '잘했어! Отлично ✨', '와! Идеально 🔥'];
    toast(msgs[rating]);
    const cur = getFlashcardsAll()[cardIdx];
    if (rating >= 2) {
      addXp(rating === 3 ? 15 : 8);
      if (cur && cur.front) recordWordSeen(cur.front);
    }
    // Count flashcards as a "play" for the games-1 / games-10 / games-50 / games-all achievements
    if (!stats.gamePlays.flashcards) stats.gamePlays.flashcards = 0;
    stats.gamePlays.flashcards++;
    UStore.set('stats', stats);
    if (stats.gamePlays.flashcards % 5 === 0) checkAchievements();
    setTimeout(() => {
      cardIdx = (cardIdx + 1) % getFlashcardsAll().length;
      flipped = false;
      renderFlashcardModal();
    }, 1100);
  }

  // ── Avatar / Share ──
  function applyAvatar(url) {
    const apply = el => {
      if (!el) return;
      if (url) { el.style.background = `url(${url}) center/cover no-repeat`; el.textContent = ''; }
      else { el.style.background = ''; el.textContent = '👧🏻'; }
    };
    apply(document.querySelector('#screen-profile .placeholder-img'));
    apply(document.getElementById('ep-avatar-preview'));
    apply(document.getElementById('home-greet-avatar'));
    // Make sure the current user's avatar in the cache reflects what we just applied
    // so their own comments/replies show the latest avatar immediately.
    try {
      const uid = socialUserId();
      if (uid && _userAvatars[uid] !== (url || null)) {
        _userAvatars[uid] = url || null;
        if (typeof _structureHashCache !== 'undefined') {
          Object.keys(_structureHashCache).forEach(k => delete _structureHashCache[k]);
        }
        if (typeof refreshFeedSocial === 'function') refreshFeedSocial();
      }
    } catch (_) {}
  }
  function changeAvatar(ev) {
    const f = ev.target.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast('Можно загружать только картинки'); return; }
    if (f.size > 12 * 1024 * 1024) { toast('Фото слишком большое (макс 12 МБ)'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        // Уменьшаем фото до 320px и пережимаем в JPEG: исходный data URL
        // не влезает в localStorage (квота ~5 МБ) и фото не сохраняется
        const max = 320;
        let w = img.width, h = img.height;
        if (w > h && w > max) { h = Math.round(h * max / w); w = max; }
        else if (h > max)     { w = Math.round(w * max / h); h = max; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const url = canvas.toDataURL('image/jpeg', 0.82);
        UStore.set('avatar', url);
        applyAvatar(url);
        toast('Фото обновлено 📷', 'var(--sage)');
        recordAvatarSet();
        pushUserToCloud();
      };
      img.onerror = () => toast('Не удалось обработать фото');
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }
  function shareProgress() {
    toast('Готово! Друзья увидят твой прогресс 💗', 'var(--sage)');
  }

  // ── Storage ──
  const Store = {
    get(k, d=null) { try { const v = localStorage.getItem('madie_'+k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('madie_'+k, JSON.stringify(v)); } catch (_) {} },
    del(k) { try { localStorage.removeItem('madie_'+k); } catch (_) {} }
  };

  // ── Firebase Sync — shared admin content visible to all users ──
  const SHARED_KEYS = ['customFeedPosts','customFlashcards','customKpop','customVideos','customLessons'];
  const _origStoreSet = Store.set.bind(Store);
  Store.set = function(k, v) {
    _origStoreSet(k, v);
    if (SHARED_KEYS.includes(k) && typeof _db !== 'undefined') {
      _db.ref('shared/' + k).set(v).catch(e => console.warn('Firebase write error:', e));
    }
  };

  // ── Media upload helpers ──
  function compressImageFile(file, maxDim = 1280, quality = 0.78) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      reader.onerror = () => reject(new Error('read failed'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const k = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * k);
          height = Math.round(height * k);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('image load failed'));
      reader.readAsDataURL(file);
    });
  }
  async function uploadFileToStorage(file, folder) {
    const safeName = file.name.replace(/[^\w.\-]+/g, '_');
    const path = `${folder}/${Date.now()}_${safeName}`;
    const ref = _storage.ref(path);
    const snap = await ref.put(file);
    return await snap.ref.getDownloadURL();
  }

  // ── Cloud user profile sync ──
  function firebaseUserId() {
    return currentUserId().replace(/[.#$\[\]\/]/g, '_');
  }
  let _pushUserTimer = null;
  function pushUserToCloud() {
    if (_pushUserTimer) clearTimeout(_pushUserTimer);
    _pushUserTimer = setTimeout(_doPushUserToCloud, 600);
  }
  async function _doPushUserToCloud() {
    if (typeof _db === 'undefined') return;
    const u = Store.get('user');
    if (!u || u.isAdmin || u.guest) return;
    const uid = firebaseUserId();
    if (!uid || uid === 'guest') return;
    // Only push profile metadata here.
    // Avatar / stats / unlocks / lessonProgress / bestScores sync via UStore override.
    const profile = {
      name: u.name || 'Без имени',
      email: u.email || '',
      lastSeen: Date.now(),
      joinedAt: stats.firstOpenTs || Date.now()
    };
    try {
      await _db.ref('users/' + uid).update(profile);
    } catch (e) {
      console.warn('pushUserToCloud failed:', e);
    }
  }
  function relativeTime(ts) {
    if (!ts) return '—';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'только что';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} мин назад`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ч назад`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'вчера';
    if (days < 7) return `${days} ${pluralDays(days)} назад`;
    const d = new Date(ts);
    return `${d.getDate()} ${monthsRu[d.getMonth()].toLowerCase()}`;
  }

  // ── Per-user data sync (full mirror to Firebase) ──
  const USTORE_SYNC_KEYS = ['stats', 'avatar', 'unlocks', 'lessonProgress', 'bestScores'];
  let _skipCloudPush = false;
  const _userFieldDebounce = {};
  function pushUserField(k, v) {
    if (typeof _db === 'undefined') return;
    const u = Store.get('user');
    if (!u || u.isAdmin || u.guest) return;
    const uid = firebaseUserId();
    if (!uid || uid === 'guest') return;
    if (_userFieldDebounce[k]) clearTimeout(_userFieldDebounce[k]);
    _userFieldDebounce[k] = setTimeout(async () => {
      try {
        const safe = (v === undefined) ? null : v;
        await _db.ref(`users/${uid}/${k}`).set(safe);
      } catch (e) {
        console.warn(`pushUserField(${k}) failed:`, e);
      }
    }, 400);
  }
  let _ustoreOverridden = false;
  function applyUStoreCloudSync() {
    if (_ustoreOverridden || typeof UStore === 'undefined') return;
    _ustoreOverridden = true;
    const orig = UStore.set.bind(UStore);
    UStore.set = function(k, v) {
      orig(k, v);
      if (!_skipCloudPush && USTORE_SYNC_KEYS.includes(k)) {
        pushUserField(k, v);
      }
    };
  }
  let _userListeners = [];
  function detachUserListeners() {
    _userListeners.forEach(off => { try { off(); } catch (_) {} });
    _userListeners = [];
  }
  function attachUserListeners() {
    detachUserListeners();
    if (typeof _db === 'undefined') return;
    const u = Store.get('user');
    if (!u || u.isAdmin || u.guest) return;
    const uid = firebaseUserId();
    if (!uid || uid === 'guest') return;
    USTORE_SYNC_KEYS.forEach(k => {
      const ref = _db.ref(`users/${uid}/${k}`);
      let firstFire = true;
      const handler = snap => {
        const val = snap.val();
        // First fire: if cloud empty, seed from local
        if (firstFire) {
          firstFire = false;
          if (val === null || val === undefined) {
            const local = UStore.get(k, null);
            if (local !== null && local !== undefined) pushUserField(k, local);
            return;
          }
        }
        if (val === null || val === undefined) return;
        let value = val;
        if (k === 'unlocks') value = Array.isArray(val) ? val : Object.values(val);
        _skipCloudPush = true;
        try {
          UStore.set(k, value);
          if (k === 'stats') {
            Object.keys(stats).forEach(s => delete stats[s]);
            Object.assign(stats, defaultStats(), value);
            if (!Array.isArray(stats.dates))         stats.dates         = stats.dates         ? Object.values(stats.dates)         : [];
            if (!Array.isArray(stats.wordsLearned))  stats.wordsLearned  = stats.wordsLearned  ? Object.values(stats.wordsLearned)  : [];
            if (!stats.gamePlays    || typeof stats.gamePlays    !== 'object') stats.gamePlays    = {};
            if (!stats.perfectGames || typeof stats.perfectGames !== 'object') stats.perfectGames = {};
            syncStats();
            syncBestScoreCards();
            syncAchievementsStrip();
          } else if (k === 'avatar') {
            applyAvatar(value);
          } else if (k === 'unlocks') {
            syncAchievementsStrip();
          } else if (k === 'lessonProgress') {
            renderLessonPath();
            renderHeroLesson();
          } else if (k === 'bestScores') {
            syncBestScoreCards();
          }
        } finally {
          _skipCloudPush = false;
        }
      };
      ref.on('value', handler);
      _userListeners.push(() => ref.off('value', handler));
    });
  }

  function initFirebaseSync() {
    if (typeof _db === 'undefined') return;
    applyUStoreCloudSync();
    SHARED_KEYS.forEach(key => {
      let firstFire = true;
      _db.ref('shared/' + key).on('value', snap => {
        const val = snap.val();
        // Seed cloud from local on first fire if cloud is empty
        if (firstFire) {
          firstFire = false;
          if (val === null || val === undefined) {
            const local = Store.get(key, []);
            if (Array.isArray(local) && local.length > 0) {
              _db.ref('shared/' + key).set(local).catch(e => console.warn('seed shared/'+key+' failed:', e));
            }
            return;
          }
        }
        let data = [];
        if (val !== null && val !== undefined) {
          data = Array.isArray(val) ? val : Object.values(val);
        }
        _origStoreSet(key, data);
        if (key === 'customFeedPosts') renderCustomFeedPosts();
        if (key === 'customVideos') renderCustomVideos();
        if (key === 'customLessons') { renderCustomLessons(); renderHeroLesson(); renderLessonPath(); }
      });
    });
  }
  // Per-user storage (namespace by current logged-in user)
  function currentUserId() {
    const u = Store.get('user');
    if (!u) return 'guest';
    if (u.isAdmin) return `admin_${(u.email || u.name).toLowerCase()}`;
    if (u.email) return `user_${u.email.toLowerCase()}`;
    if (u.guest) return 'guest';
    return `user_${u.name.toLowerCase()}`;
  }
  function uKey(name) { return `u_${currentUserId()}_${name}`; }
  const UStore = {
    get(k, d=null) { return Store.get(uKey(k), d); },
    set(k, v) { Store.set(uKey(k), v); },
    del(k) { Store.del(uKey(k)); }
  };

  // Default stats schema (used as baseline for every new user/guest)
  function defaultStats() {
    return {
      xp: 0, streak: 0, lessons: 0, words: 0,
      firstOpenTs: null,
      dates: [], daysEntered: 0, minutesSpent: 0,
      gamePlays: {}, perfectGames: {}, wordsLearned: [],
      hangulSyllables: 0, hangulSaved: 0,
      pronunciationAttempts: 0, pronunciationCorrect: 0, pronunciationStreak: 0, pronunciationBestStreak: 0,
      hasAvatar: false, openedCalendar: false, openedCulture: false
    };
  }
  // In-memory stats (mutated, kept identical reference across user switches)
  const stats = defaultStats();

  // Load all per-user state from storage (call on init + after login/logout)
  function loadUserData() {
    const saved = UStore.get('stats') || {};
    Object.keys(stats).forEach(k => delete stats[k]);
    Object.assign(stats, defaultStats(), saved);
    if (!stats.firstOpenTs) { stats.firstOpenTs = Date.now(); UStore.set('stats', stats); }
    if (!Array.isArray(stats.wordsLearned)) stats.wordsLearned = [];
    if (!stats.gamePlays || typeof stats.gamePlays !== 'object') stats.gamePlays = {};
    if (!stats.perfectGames || typeof stats.perfectGames !== 'object') stats.perfectGames = {};
    if (!Array.isArray(stats.dates)) stats.dates = [];
    syncStats();
    syncBestScoreCards();
    syncAchievementsStrip();
    renderLessonPath();
    renderHeroLesson();
    renderSavedWords();
    applyAvatar(UStore.get('avatar'));
  }

  // ── СЛОВА УРОКА 1 · 한글 ──
  const L1_WORDS_1 = [
    { ko:'오이', ru:'огурец',   emoji:'🥒' },
    { ko:'이',   ru:'два (2)',  emoji:'2️⃣' },
    { ko:'우유', ru:'молоко',   emoji:'🥛' },
    { ko:'오',   ru:'пять (5)', emoji:'5️⃣' },
    { ko:'여우', ru:'лиса',     emoji:'🦊' },
    { ko:'아이', ru:'ребёнок',  emoji:'🧒' }
  ];
  const L1_WORDS_2 = [
    { ko:'고기',   ru:'мясо',    emoji:'🍖' },
    { ko:'어머니', ru:'мама',    emoji:'👩' },
    { ko:'나무',   ru:'дерево',  emoji:'🌳' },
    { ko:'아버지', ru:'папа',    emoji:'👨' },
    { ko:'모자',   ru:'шапка',   emoji:'🧢' },
    { ko:'라디오', ru:'радио',   emoji:'📻' },
    { ko:'주스',   ru:'сок',     emoji:'🧃' },
    { ko:'소시지', ru:'сосиски', emoji:'🌭' }
  ];
  const L1_WORDS_3 = [
    { ko:'시계',   ru:'часы',    emoji:'⌚' },
    { ko:'돼지',   ru:'свинья',  emoji:'🐷' },
    { ko:'의자',   ru:'стул',    emoji:'🪑' },
    { ko:'주사위', ru:'игральные кубики', emoji:'🎲' },
    { ko:'샤워',   ru:'душ',     emoji:'🚿' },
    { ko:'케이크', ru:'торт',    emoji:'🎂' },
    { ko:'과자',   ru:'сладости', emoji:'🍪' },
    { ko:'스웨터', ru:'свитер',  emoji:'🧶' }
  ];
  const L1_WORDS_4 = [
    { ko:'기차',   ru:'поезд',     emoji:'🚂' },
    { ko:'토끼',   ru:'кролик',    emoji:'🐰' },
    { ko:'포도',   ru:'виноград',  emoji:'🍇' },
    { ko:'뽀뽀',   ru:'поцелуй',   emoji:'😘' },
    { ko:'커피',   ru:'кофе',      emoji:'☕' },
    { ko:'찌개',   ru:'густой суп', emoji:'🍲' },
    { ko:'토마토', ru:'помидор',   emoji:'🍅' },
    { ko:'머리띠', ru:'ободок',    emoji:'🎀' }
  ];
  const L1_VOWELS = [
    {ko:'ㅏ',ru:'а'},{ko:'ㅑ',ru:'я'},{ko:'ㅓ',ru:'о'},{ko:'ㅕ',ru:'ё'},{ko:'ㅗ',ru:'о'},
    {ko:'ㅛ',ru:'ё'},{ko:'ㅜ',ru:'у'},{ko:'ㅠ',ru:'ю'},{ko:'ㅡ',ru:'ы'},{ko:'ㅣ',ru:'и'}
  ];
  const L1_CONS = [
    {ko:'ㄱ',ru:'к/г'},{ko:'ㄴ',ru:'н'},{ko:'ㄷ',ru:'т/д'},{ko:'ㄹ',ru:'р/л'},{ko:'ㅁ',ru:'м'},
    {ko:'ㅂ',ru:'п/б'},{ko:'ㅅ',ru:'с'},{ko:'ㅇ',ru:'нг'},{ko:'ㅈ',ru:'ч/дж'},{ko:'ㅊ',ru:'чх'},
    {ko:'ㅋ',ru:'кх'},{ko:'ㅌ',ru:'тх'},{ko:'ㅍ',ru:'пх'},{ko:'ㅎ',ru:'х'}
  ];
  const L1_DIPH = [
    {ko:'ㅐ',ru:'э'},{ko:'ㅒ',ru:'йэ'},{ko:'ㅔ',ru:'э'},{ko:'ㅖ',ru:'йэ'},{ko:'ㅘ',ru:'ва'},
    {ko:'ㅙ',ru:'вэ'},{ko:'ㅚ',ru:'вэ'},{ko:'ㅝ',ru:'во'},{ko:'ㅞ',ru:'вэ'},{ko:'ㅟ',ru:'ви'},{ko:'ㅢ',ru:'ый'}
  ];
  const L1_DOUBLE = [
    {ko:'ㄲ',ru:'кк'},{ko:'ㄸ',ru:'тт'},{ko:'ㅃ',ru:'пп'},{ko:'ㅉ',ru:'чч'},{ko:'ㅆ',ru:'сс'}
  ];

  // Урок 2 — 받침 (финальная согласная)
  const L2_BACHIM = [
    {ko:'ㄱ',ru:'к'},{ko:'ㄴ',ru:'н'},{ko:'ㄷ',ru:'т'},
    {ko:'ㅁ',ru:'м'},{ko:'ㅂ',ru:'п'},{ko:'ㅇ',ru:'нг'}
  ];
  const L2_WORDS_1 = [
    { ko:'친구', ru:'друг',     emoji:'👫' },
    { ko:'가방', ru:'сумка',    emoji:'👜' },
    { ko:'엄마', ru:'мама',     emoji:'👩' },
    { ko:'하늘', ru:'небо',     emoji:'☁️' },
    { ko:'구름', ru:'облако',   emoji:'⛅' },
    { ko:'안경', ru:'очки',     emoji:'👓' },
    { ko:'그림', ru:'рисунок',  emoji:'🖼️' },
    { ko:'물병', ru:'бутылка',  emoji:'🍶' }
  ];
  const L2_WORDS_2 = [
    { ko:'집',   ru:'дом',       emoji:'🏠' },
    { ko:'앞',   ru:'впереди',   emoji:'⬆️' },
    { ko:'책',   ru:'книга',     emoji:'📚' },
    { ko:'약',   ru:'лекарство', emoji:'💊' },
    { ko:'옷',   ru:'одежда',    emoji:'👕' },
    { ko:'낮',   ru:'день',      emoji:'☀️' }
  ];
  const L2_WORDS_3 = [
    { ko:'부엌',  ru:'кухня',    emoji:'🍳' },
    { ko:'낚시',  ru:'рыбалка',  emoji:'🎣' },
    { ko:'돋보기',ru:'лупа',     emoji:'🔍' },
    { ko:'꽃',    ru:'цветок',   emoji:'🌸' },
    { ko:'밭',    ru:'поле',     emoji:'🌾' }
  ];

  // Урок 3 — 안녕하세요? (приветствия, страны, 이에요/예요, 은/는)
  const L3_GREETINGS = [
    { ko:'안녕하세요',     ru:'здравствуйте',              emoji:'👋' },
    { ko:'안녕',           ru:'привет (своим)',            emoji:'🙋' },
    { ko:'안녕히 가세요',  ru:'до свидания (уходящему)',   emoji:'👋' },
    { ko:'안녕히 계세요',  ru:'до свидания (остающемуся)', emoji:'🙆' },
    { ko:'만나서 반가워요',ru:'приятно познакомиться',     emoji:'😊' },
    { ko:'이름이 뭐예요',  ru:'как тебя зовут?',           emoji:'❓' }
  ];
  const L3_COUNTRIES = [
    { ko:'한국',   ru:'Корея',     emoji:'🇰🇷' },
    { ko:'미국',   ru:'Америка',   emoji:'🇺🇸' },
    { ko:'영국',   ru:'Англия',    emoji:'🇬🇧' },
    { ko:'일본',   ru:'Япония',    emoji:'🇯🇵' },
    { ko:'중국',   ru:'Китай',     emoji:'🇨🇳' },
    { ko:'독일',   ru:'Германия',  emoji:'🇩🇪' },
    { ko:'프랑스', ru:'Франция',   emoji:'🇫🇷' },
    { ko:'브라질', ru:'Бразилия',  emoji:'🇧🇷' },
    { ko:'호주',   ru:'Австралия', emoji:'🇦🇺' },
    { ko:'사람',   ru:'человек',   emoji:'🧑' }
  ];

  // Урок 4 — 가족 (семья, вопросительная форма, отрицание 이/가 아니에요)
  const L4_FAMILY = [
    { ko:'아버지',   ru:'папа',                  emoji:'👨' },
    { ko:'어머니',   ru:'мама',                  emoji:'👩' },
    { ko:'할아버지', ru:'дедушка',               emoji:'👴' },
    { ko:'할머니',   ru:'бабушка',               emoji:'👵' },
    { ko:'형',       ru:'старший брат (для М)',  emoji:'🧑' },
    { ko:'누나',     ru:'старшая сестра (для М)', emoji:'👩' },
    { ko:'오빠',     ru:'старший брат (для Ж)',  emoji:'🧑' },
    { ko:'언니',     ru:'старшая сестра (для Ж)', emoji:'👩' },
    { ko:'남동생',   ru:'младший брат',          emoji:'👦' },
    { ko:'여동생',   ru:'младшая сестра',        emoji:'👧' },
    { ko:'동생',     ru:'мл. брат/сестра',       emoji:'🧒' },
    { ko:'나',       ru:'я (неформ.)',           emoji:'🙋' },
    { ko:'우리',     ru:'мы / наш',              emoji:'👥' },
    { ko:'누구',     ru:'кто',                   emoji:'❓' },
    { ko:'네',       ru:'да',                    emoji:'✅' },
    { ko:'아니요',   ru:'нет',                   emoji:'❌' }
  ];

  // Урок 5 — 교실 (класс, есть/нет, локатив 에)
  const L5_CLASSROOM = [
    { ko:'교실',   ru:'класс',     emoji:'🏫' },
    { ko:'칠판',   ru:'доска',     emoji:'📋' },
    { ko:'시계',   ru:'часы',      emoji:'🕐' },
    { ko:'책',     ru:'книга',     emoji:'📕' },
    { ko:'공책',   ru:'тетрадь',   emoji:'📓' },
    { ko:'책상',   ru:'стол',      emoji:'🪑' },
    { ko:'의자',   ru:'стул',      emoji:'💺' },
    { ko:'가방',   ru:'рюкзак',    emoji:'🎒' },
    { ko:'연필',   ru:'карандаш',  emoji:'✏️' },
    { ko:'지우개', ru:'ластик',    emoji:'🧽' },
    { ko:'컴퓨터', ru:'компьютер', emoji:'💻' }
  ];
  const L5_PLACE = [
    { ko:'앞',   ru:'спереди', emoji:'⬆️' },
    { ko:'뒤',   ru:'сзади',   emoji:'⬇️' },
    { ko:'위',   ru:'на/над',  emoji:'🔼' },
    { ko:'아래', ru:'под',     emoji:'🔽' },
    { ko:'옆',   ru:'рядом',   emoji:'↔️' },
    { ko:'안',   ru:'внутри',  emoji:'📦' },
    { ko:'어디', ru:'где',     emoji:'❓' }
  ];

  // Урок 6 — 집 (дом, спряжение -아/어요, винительный 을/를)
  const L6_HOUSE = [
    { ko:'집',    ru:'дом',          emoji:'🏠' },
    { ko:'거실',  ru:'гостиная',     emoji:'🛋️' },
    { ko:'방',    ru:'комната',      emoji:'🚪' },
    { ko:'부엌',  ru:'кухня',        emoji:'🍳' },
    { ko:'우유',  ru:'молоко',       emoji:'🥛' },
    { ko:'빵',    ru:'хлеб',         emoji:'🍞' },
    { ko:'옷',    ru:'одежда',       emoji:'👕' },
    { ko:'케이크',ru:'торт',         emoji:'🎂' },
    { ko:'요리',  ru:'кулинария',    emoji:'🍲' },
    { ko:'공부',  ru:'учёба',        emoji:'📖' },
    { ko:'운동',  ru:'спорт',        emoji:'🏃' },
    { ko:'전화',  ru:'телефон',      emoji:'📞' },
    { ko:'텔레비전',ru:'телевизор',  emoji:'📺' },
    { ko:'지금',  ru:'сейчас',       emoji:'⏰' },
    { ko:'뭐',    ru:'что',          emoji:'❓' }
  ];
  const L6_VERBS = [
    { ko:'봐요',     ru:'смотрит',   emoji:'👀' },
    { ko:'읽어요',   ru:'читает',    emoji:'📖' },
    { ko:'먹어요',   ru:'ест',       emoji:'🍽️' },
    { ko:'마셔요',   ru:'пьёт',      emoji:'🥤' },
    { ko:'입어요',   ru:'надевает',  emoji:'👔' },
    { ko:'만들어요', ru:'делает',    emoji:'🛠️' },
    { ko:'해요',     ru:'делает',    emoji:'✨' },
    { ko:'공부해요', ru:'учится',    emoji:'📚' },
    { ko:'운동해요', ru:'спортом занимается', emoji:'🏋️' }
  ];

  // Урок 7 — 학교 (школа, направление 에 (куда), частица 도 (тоже))
  const L7_SCHOOL = [
    { ko:'학교',   ru:'школа',       emoji:'🏫' },
    { ko:'교무실', ru:'учительская', emoji:'👨‍🏫' },
    { ko:'화장실', ru:'туалет',      emoji:'🚻' },
    { ko:'도서관', ru:'библиотека',  emoji:'📚' }
  ];
  const L7_NEIGHBORHOOD = [
    { ko:'동네',   ru:'район',     emoji:'🏘️' },
    { ko:'유치원', ru:'детсад',    emoji:'🧒' },
    { ko:'아파트', ru:'квартира',  emoji:'🏢' },
    { ko:'가게',   ru:'магазин',   emoji:'🏪' },
    { ko:'공원',   ru:'парк',      emoji:'🌳' },
    { ko:'병원',   ru:'больница',  emoji:'🏥' },
    { ko:'교회',   ru:'церковь',   emoji:'⛪' },
    { ko:'가다',   ru:'идти/ехать',emoji:'🚶' },
    { ko:'오다',   ru:'приходить', emoji:'🏃' },
    { ko:'같이',   ru:'вместе',    emoji:'👫' }
  ];

  // Урок 8 — 발생 (досуг, отрицание 안, локатив действия 에서)
  const L8_PLACES = [
    { ko:'체육관',  ru:'спортзал', emoji:'🏀' },
    { ko:'운동장',  ru:'площадка', emoji:'🏟️' }
  ];
  const L8_ACTIVITIES = [
    { ko:'농구',       ru:'баскетбол',    emoji:'🏀' },
    { ko:'축구',       ru:'футбол',       emoji:'⚽' },
    { ko:'달리기',     ru:'бег',          emoji:'🏃' },
    { ko:'줄넘기',     ru:'скакалка',     emoji:'🤸' },
    { ko:'한국어',     ru:'корейский',    emoji:'🇰🇷' },
    { ko:'아이스크림', ru:'мороженое',    emoji:'🍦' },
    { ko:'좋아해요',   ru:'нравится',     emoji:'❤️' },
    { ko:'만나요',     ru:'встречает',    emoji:'🤝' },
    { ko:'사요',       ru:'покупает',     emoji:'🛒' },
    { ko:'배워요',     ru:'учит/изучает', emoji:'📚' },
    { ko:'가르쳐요',   ru:'преподаёт',    emoji:'👩‍🏫' }
  ];

  // Урок 9 — 숫자 (числа, соединение 하고 / -고)
  const L9_NUMBERS_1 = [
    { ko:'일',  ru:'один (1)',    emoji:'1️⃣' },
    { ko:'이',  ru:'два (2)',     emoji:'2️⃣' },
    { ko:'삼',  ru:'три (3)',     emoji:'3️⃣' },
    { ko:'사',  ru:'четыре (4)',  emoji:'4️⃣' },
    { ko:'오',  ru:'пять (5)',    emoji:'5️⃣' },
    { ko:'육',  ru:'шесть (6)',   emoji:'6️⃣' },
    { ko:'칠',  ru:'семь (7)',    emoji:'7️⃣' },
    { ko:'팔',  ru:'восемь (8)',  emoji:'8️⃣' },
    { ko:'구',  ru:'девять (9)',  emoji:'9️⃣' },
    { ko:'십',  ru:'десять (10)', emoji:'🔟' }
  ];
  const L9_NUMBERS_2 = [
    { ko:'이십', ru:'20',     emoji:'🔢' },
    { ko:'삼십', ru:'30',     emoji:'🔢' },
    { ko:'사십', ru:'40',     emoji:'🔢' },
    { ko:'오십', ru:'50',     emoji:'🔢' },
    { ko:'육십', ru:'60',     emoji:'🔢' },
    { ko:'칠십', ru:'70',     emoji:'🔢' },
    { ko:'팔십', ru:'80',     emoji:'🔢' },
    { ko:'구십', ru:'90',     emoji:'🔢' },
    { ko:'백',   ru:'100',    emoji:'💯' },
    { ko:'천',   ru:'1 000',  emoji:'🔢' },
    { ko:'만',   ru:'10 000', emoji:'🔢' }
  ];
  const L9_EXTRA = [
    { ko:'숫자',    ru:'число',         emoji:'🔢' },
    { ko:'몇',      ru:'сколько',       emoji:'❓' },
    { ko:'학년',    ru:'класс/курс',    emoji:'🎓' },
    { ko:'층',      ru:'этаж',          emoji:'🏢' },
    { ko:'반',      ru:'класс (группа)',emoji:'👥' },
    { ko:'초등학교',ru:'нач. школа',    emoji:'🏫' },
    { ko:'과자',    ru:'снек',          emoji:'🍪' },
    { ko:'필통',    ru:'пенал',         emoji:'🗂️' },
    { ko:'만화책',  ru:'комикс',        emoji:'📔' }
  ];

  // Урок 10 — 날짜 (даты, время-эпизод 에, повелит. -(으)세요)
  const L10_MONTHS = [
    { ko:'일월',   ru:'январь (1월)',    emoji:'❄️' },
    { ko:'이월',   ru:'февраль (2월)',   emoji:'💝' },
    { ko:'삼월',   ru:'март (3월)',      emoji:'🌷' },
    { ko:'사월',   ru:'апрель (4월)',    emoji:'🌸' },
    { ko:'오월',   ru:'май (5월)',       emoji:'🌹' },
    { ko:'유월',   ru:'июнь (6월) ⚠️',   emoji:'🌞' },
    { ko:'칠월',   ru:'июль (7월)',      emoji:'🍉' },
    { ko:'팔월',   ru:'август (8월)',    emoji:'🌻' },
    { ko:'구월',   ru:'сентябрь (9월)',  emoji:'🍁' },
    { ko:'시월',   ru:'октябрь (10월) ⚠️',emoji:'🎃' },
    { ko:'십일월', ru:'ноябрь (11월)',   emoji:'🍂' },
    { ko:'십이월', ru:'декабрь (12월)',  emoji:'🎄' }
  ];
  const L10_DAYS = [
    { ko:'월요일', ru:'понедельник', emoji:'🌙' },
    { ko:'화요일', ru:'вторник',     emoji:'🔥' },
    { ko:'수요일', ru:'среда',       emoji:'💧' },
    { ko:'목요일', ru:'четверг',     emoji:'🌳' },
    { ko:'금요일', ru:'пятница',     emoji:'💰' },
    { ko:'토요일', ru:'суббота',     emoji:'⛰️' },
    { ko:'일요일', ru:'воскресенье', emoji:'☀️' }
  ];
  const L10_TIMES = [
    { ko:'오늘',    ru:'сегодня',    emoji:'📅' },
    { ko:'언제',    ru:'когда',      emoji:'❓' },
    { ko:'생일',    ru:'день рожд.', emoji:'🎂' },
    { ko:'이번 주', ru:'эта неделя', emoji:'🗓️' },
    { ko:'주말',    ru:'выходные',   emoji:'🎉' },
    { ko:'파티',    ru:'вечеринка',  emoji:'🎊' },
    { ko:'시간',    ru:'время',      emoji:'🕐' },
    { ko:'날짜',    ru:'дата',       emoji:'📆' },
    { ko:'학원',    ru:'кружок',     emoji:'🎒' }
  ];

  // Урок 11 — 놀이공원 (выходные, 하고 같이, будущее -(으)ㄹ 거예요)
  const L11_PLACES = [
    { ko:'놀이공원',ru:'парк атракц.', emoji:'🎢' },
    { ko:'동물원',  ru:'зоопарк',      emoji:'🦁' },
    { ko:'쇼핑몰',  ru:'торг. центр',  emoji:'🛍️' },
    { ko:'수영장',  ru:'бассейн',      emoji:'🏊' },
    { ko:'바다',    ru:'море',         emoji:'🌊' }
  ];
  const L11_THINGS = [
    { ko:'놀이 기구', ru:'аттракцион',  emoji:'🎡' },
    { ko:'사진',      ru:'фото',        emoji:'📷' },
    { ko:'동물',      ru:'животное',    emoji:'🐘' },
    { ko:'먹이',      ru:'корм',        emoji:'🥕' },
    { ko:'장난감',    ru:'игрушка',     emoji:'🧸' },
    { ko:'영화',      ru:'фильм',       emoji:'🎬' },
    { ko:'솜사탕',    ru:'сах. вата',   emoji:'🍬' },
    { ko:'바비큐',    ru:'барбекю',     emoji:'🍖' },
    { ko:'그리고',    ru:'и (затем)',   emoji:'➕' }
  ];
  const L11_VERBS = [
    { ko:'타다',     ru:'кататься',     emoji:'🎠' },
    { ko:'찍다',     ru:'снимать (фото)',emoji:'📸' },
    { ko:'구경하다', ru:'рассматр.',    emoji:'👀' },
    { ko:'주다',     ru:'давать',       emoji:'🤲' },
    { ko:'수영하다', ru:'плавать',      emoji:'🏊' },
    { ko:'내일',     ru:'завтра',       emoji:'➡️' },
    { ko:'다음 주',  ru:'след. неделя', emoji:'📆' }
  ];

  // Урок 12 (две части) — 계절 + 동물원 (сезоны и зоопарк; ㅂ-неправ., -아/어서, -고 싶다, -았/었어요)
  const L12_SEASONS = [
    { ko:'계절',   ru:'сезон',    emoji:'🍀' },
    { ko:'봄',     ru:'весна',    emoji:'🌸' },
    { ko:'여름',   ru:'лето',     emoji:'☀️' },
    { ko:'가을',   ru:'осень',    emoji:'🍁' },
    { ko:'겨울',   ru:'зима',     emoji:'❄️' },
    { ko:'따뜻하다',ru:'тёплый',   emoji:'🌤️' },
    { ko:'덥다',   ru:'жарко',    emoji:'🥵' },
    { ko:'시원하다',ru:'прохладно',emoji:'🍃' },
    { ko:'춥다',   ru:'холодно',  emoji:'🥶' }
  ];
  const L12_WEATHER = [
    { ko:'날씨',     ru:'погода',      emoji:'☁️' },
    { ko:'비',       ru:'дождь',       emoji:'🌧️' },
    { ko:'눈',       ru:'снег',        emoji:'❄️' },
    { ko:'바람',     ru:'ветер',       emoji:'💨' },
    { ko:'비가 와요',ru:'идёт дождь',  emoji:'☔' },
    { ko:'눈이 와요',ru:'идёт снег',   emoji:'☃️' },
    { ko:'바람이 불어요',ru:'дует ветер',emoji:'🍃' },
    { ko:'방학',     ru:'каникулы',    emoji:'🎒' },
    { ko:'우산',     ru:'зонт',        emoji:'🌂' },
    { ko:'반바지',   ru:'шорты',       emoji:'🩳' },
    { ko:'코코아',   ru:'какао',       emoji:'☕' }
  ];
  const L12_ANIMALS = [
    { ko:'동물원',   ru:'зоопарк',   emoji:'🦁' },
    { ko:'동물',     ru:'животное',  emoji:'🐾' },
    { ko:'사자',     ru:'лев',       emoji:'🦁' },
    { ko:'코끼리',   ru:'слон',      emoji:'🐘' },
    { ko:'곰',       ru:'медведь',   emoji:'🐻' },
    { ko:'기린',     ru:'жираф',     emoji:'🦒' },
    { ko:'원숭이',   ru:'обезьяна',  emoji:'🐒' },
    { ko:'토끼',     ru:'кролик',    emoji:'🐰' },
    { ko:'강아지',   ru:'щенок',     emoji:'🐶' },
    { ko:'고양이',   ru:'кошка',     emoji:'🐱' },
    { ko:'재미있다', ru:'весело',    emoji:'😄' },
    { ko:'아주',     ru:'очень',     emoji:'💯' },
    { ko:'또',       ru:'снова',     emoji:'🔁' },
    { ko:'다음에',   ru:'в след. раз',emoji:'⏭️' }
  ];

  // Урок 13 — 부엌 (кухня/гостиная, -고 있다 (длит.), 못 (не могу))
  const L13_KITCHEN = [
    { ko:'설거지',   ru:'мыть посуду',  emoji:'🧽' },
    { ko:'냉장고',   ru:'холодильник',  emoji:'🧊' },
    { ko:'밥',       ru:'рис/еда',      emoji:'🍚' },
    { ko:'요리',     ru:'готовка',      emoji:'🍳' },
    { ko:'식탁',     ru:'стол (обед.)', emoji:'🍽️' },
    { ko:'숟가락',   ru:'ложка',        emoji:'🥄' },
    { ko:'젓가락',   ru:'палочки',      emoji:'🥢' },
    { ko:'그릇',     ru:'миска',        emoji:'🍜' },
    { ko:'저녁',     ru:'ужин/вечер',   emoji:'🌆' },
    { ko:'준비하다', ru:'готовить (к)', emoji:'📋' },
    { ko:'놓다',     ru:'ставить',      emoji:'⬇️' },
    { ko:'맛있다',   ru:'вкусно',       emoji:'😋' }
  ];
  const L13_LIVING = [
    { ko:'거실',     ru:'гостиная',  emoji:'🛋️' },
    { ko:'소파',     ru:'диван',     emoji:'🛋️' },
    { ko:'게임기',   ru:'консоль',   emoji:'🎮' },
    { ko:'보드게임', ru:'наст. игра',emoji:'🎲' },
    { ko:'신문',     ru:'газета',    emoji:'📰' },
    { ko:'뉴스',     ru:'новости',   emoji:'📺' },
    { ko:'아직',     ru:'ещё / пока',emoji:'⏳' },
    { ko:'곧',       ru:'скоро',     emoji:'⏰' },
    { ko:'못',       ru:'не могу',   emoji:'🚫' }
  ];

  // Урок 14 — 특기 (таланты/спорт, -아/어 (неформ.), -지만 (но))
  const L14_TALENT = [
    { ko:'특기',     ru:'талант',       emoji:'⭐' },
    { ko:'그림',     ru:'рисунок',      emoji:'🎨' },
    { ko:'그리다',   ru:'рисовать',     emoji:'✏️' },
    { ko:'춤',       ru:'танец',        emoji:'💃' },
    { ko:'추다',     ru:'танцевать',    emoji:'🕺' },
    { ko:'노래',     ru:'песня',        emoji:'🎵' },
    { ko:'피아노',   ru:'пианино',      emoji:'🎹' },
    { ko:'치다',     ru:'играть (бить)',emoji:'🎼' },
    { ko:'잘하다',   ru:'уметь хорошо', emoji:'👍' },
    { ko:'못하다',   ru:'не уметь',     emoji:'👎' }
  ];
  const L14_SPORT = [
    { ko:'태권도',   ru:'тхэквондо',    emoji:'🥋' },
    { ko:'배드민턴', ru:'бадминтон',    emoji:'🏸' },
    { ko:'자전거',   ru:'велосипед',    emoji:'🚲' },
    { ko:'테니스',   ru:'теннис',       emoji:'🎾' },
    { ko:'야구',     ru:'бейсбол',      emoji:'⚾' },
    { ko:'매일',     ru:'каждый день',  emoji:'📅' },
    { ko:'동화책',   ru:'сказка',       emoji:'📖' },
    { ko:'같이',     ru:'вместе',       emoji:'👫' },
    { ko:'그래서',   ru:'поэтому',      emoji:'➡️' }
  ];

  // Урок 15 — 음식 (корейские блюда/вкус, -지 않다 (отриц.), -자 (давай))
  const L15_FOOD = [
    { ko:'잡채',     ru:'чапче',        emoji:'🍝' },
    { ko:'불고기',   ru:'пулькоги',     emoji:'🥩' },
    { ko:'김치',     ru:'кимчи',        emoji:'🥬' },
    { ko:'비빔밥',   ru:'пибимпап',     emoji:'🍱' },
    { ko:'떡볶이',   ru:'токпокки',     emoji:'🌶️' },
    { ko:'김밥',     ru:'кимпап',       emoji:'🍙' },
    { ko:'만두',     ru:'манду',        emoji:'🥟' },
    { ko:'갈비',     ru:'кальби',       emoji:'🍖' }
  ];
  const L15_TASTE = [
    { ko:'맵다',     ru:'острый',       emoji:'🌶️' },
    { ko:'맛있다',   ru:'вкусный',      emoji:'😋' },
    { ko:'맛없다',   ru:'невкусный',    emoji:'😖' },
    { ko:'음식',     ru:'еда',          emoji:'🍽️' },
    { ko:'한국 음식',ru:'кор. еда',     emoji:'🇰🇷' },
    { ko:'한국 식당',ru:'кор. ресторан',emoji:'🏪' },
    { ko:'유명하다', ru:'известный',    emoji:'⭐' },
    { ko:'제일',     ru:'самый',        emoji:'🥇' },
    { ko:'빨리',     ru:'быстро',       emoji:'⚡' },
    { ko:'이제',     ru:'теперь',       emoji:'⏰' }
  ];

  // ── КАТАЛОГ УРОКОВ ──
  const LESSON_CATALOG = [
    {
      id:'l1-hangul', num:1,
      title:'Хангыль',
      ko:'한글',
      ru:'Корейский алфавит: гласные, согласные, дифтонги',
      vocab: [...L1_WORDS_1, ...L1_WORDS_2, ...L1_WORDS_3, ...L1_WORDS_4],
      letters: [...L1_VOWELS, ...L1_CONS, ...L1_DIPH, ...L1_DOUBLE],
      homework: {
        tasks: [
          'Выучить все буквы и слова для прохождения на следующий урок.',
          'Написать в тетради все буквы, которые мы прошли — правописание.'
        ],
        file: { label:'Правописание букв', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'한글 — Хангыль', sub:'Корейский алфавит — 24 буквы',
          learn:[['🔤','24 буквы'],['🌸','30 новых слов'],['🎯','3 задания']] },
        { kind:'info', eyebrow:'ТЕОРИЯ · ОБЗОР', title:'Что такое 한글', sub:'24 буквы алфавита', cols:2, noPlay:true,
          grid:[{ko:'10',ru:'гласных'},{ko:'14',ru:'согласных'}],
          note:'한글 — корейская азбука. Каждый слог собирается из согласной и гласной.' },
        { kind:'info', eyebrow:'ТЕОРИЯ · ГЛАСНЫЕ', title:'10 гласных', sub:'모음', cols:5, grid:L1_VOWELS,
          note:'Тапни любую букву, чтобы услышать её звук.' },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · ГЛАСНЫЕ', title:'Звук гласной',
          items:[{ko:'ㅏ',ru:'а'},{ko:'ㅑ',ru:'я'},{ko:'ㅜ',ru:'у'},{ko:'ㅠ',ru:'ю'},{ko:'ㅣ',ru:'и'},{ko:'ㅕ',ru:'ё'}],
          pool:['а','я','о','ё','у','ю','ы','и'] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 1', title:'Слова из гласных', items:L1_WORDS_1 },
        { kind:'info', eyebrow:'ТЕОРИЯ · СОГЛАСНЫЕ', title:'14 согласных', sub:'자음', cols:5, grid:L1_CONS,
          note:'Согласная без гласной не звучит — ей всегда нужна пара.' },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · СОГЛАСНЫЕ', title:'Звук согласной',
          items:[{ko:'ㄱ',ru:'к/г'},{ko:'ㄴ',ru:'н'},{ko:'ㅂ',ru:'п/б'},{ko:'ㅁ',ru:'м'},{ko:'ㅎ',ru:'х'},{ko:'ㅌ',ru:'тх'}],
          pool:['к/г','н','т/д','р/л','м','п/б','с','нг','ч/дж','чх','кх','тх','пх','х'] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 2', title:'Слова из согласных', items:L1_WORDS_2 },
        { kind:'info', eyebrow:'ТЕОРИЯ · ДИФТОНГИ', title:'11 дифтонгов', sub:'Сложные гласные', cols:3, grid:L1_DIPH,
          note:'Дифтонг — две гласные, слитые в один звук.' },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 3', title:'Слова с дифтонгами', items:L1_WORDS_3 },
        { kind:'info', eyebrow:'ТЕОРИЯ · ДВОЙНЫЕ', title:'5 двойных букв', sub:'Напряжённые согласные', cols:5, grid:L1_DOUBLE,
          note:'Двойные буквы произносятся жёстко и напряжённо.' },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 4', title:'Слова с двойными', items:L1_WORDS_4 },
        { kind:'info', eyebrow:'ТЕОРИЯ · РАЗЛИЧИЕ', title:'Тройки согласных', sub:'обычная · придыхание · жёсткая', cols:1, noPlay:true,
          grid:[
            {ko:'ㄱ · ㅋ · ㄲ', ru:'к · к с придыханием · жёсткий к'},
            {ko:'ㄷ · ㅌ · ㄸ', ru:'т/д · т с придыханием · жёсткий т'},
            {ko:'ㅂ · ㅍ · ㅃ', ru:'п/б · п с придыханием · жёсткий п'},
            {ko:'ㅅ · ㅆ',      ru:'с · жёсткий с'},
            {ko:'ㅈ · ㅊ · ㅉ', ru:'ч/дж · ч с придыханием · жёсткий ч'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · ЗАКРЕПЛЕНИЕ', title:'Вспомни звук',
          items:[{ko:'ㅎ',ru:'х'},{ko:'ㅈ',ru:'ч/дж'},{ko:'ㄷ',ru:'т/д'},{ko:'ㅛ',ru:'ё'},{ko:'ㅟ',ru:'ви'},{ko:'ㅆ',ru:'сс'}],
          pool:['х','ч/дж','т/д','ё','ви','сс','к/г','н','м','я','ю','э'] },
        { kind:'homework' }
      ]
    },
    {
      id:'l2-bachim', num:2,
      title:'Падчим',
      ko:'받침',
      ru:'Финальная согласная — звук в конце слога',
      vocab: [...L2_WORDS_1, ...L2_WORDS_2, ...L2_WORDS_3],
      letters: L2_BACHIM,
      homework: {
        tasks: [
          'Выучить новые слова урока.',
          'Написать в тетради все новые слова — отдельно с падчимом и без.',
          'Самостоятельно написать 5 слов с падчимом и 5 без падчима.'
        ],
        file: { label:'Падчим — таблица', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'받침 — Падчим', sub:'Финальная согласная внизу слога',
          learn:[['🔻','6 падчимов'],['🌸','19 новых слов'],['🎯','2 задания']] },
        { kind:'info', eyebrow:'ПОВТОРЕНИЕ · ДИКТАНТ', title:'Вспомни буквы', sub:'Тапни — услышь звук', cols:7, grid:[
            {ko:'ㅏ',ru:'а'},{ko:'ㅜ',ru:'у'},{ko:'ㅓ',ru:'о'},{ko:'ㅡ',ru:'ы'},{ko:'ㅣ',ru:'и'},{ko:'ㄷ',ru:'т/д'},{ko:'ㄱ',ru:'к/г'},
            {ko:'ㅎ',ru:'х'},{ko:'ㅇ',ru:'нг'},{ko:'ㅁ',ru:'м'},{ko:'ㅔ',ru:'э'},{ko:'ㅐ',ru:'э'},{ko:'ㅖ',ru:'йэ'},{ko:'ㅚ',ru:'вэ'},
            {ko:'ㅞ',ru:'вэ'},{ko:'ㅃ',ru:'пп'},{ko:'ㅋ',ru:'кх'},{ko:'ㅌ',ru:'тх'},{ko:'ㅉ',ru:'чч'},{ko:'ㅆ',ru:'сс'},{ko:'ㅊ',ru:'чх'}
          ], note:'Проверь, что помнишь все буквы из первого урока. Если что-то забыл — вернись назад и повтори.' },
        { kind:'info', eyebrow:'ТЕОРИЯ · 받침', title:'Что такое 받침', sub:'Падчим — финальная согласная', cols:1, noPlay:true,
          grid:[
            {ko:'밥',  ru:'ㅂ внизу = 받침 · рис'},
            {ko:'책',  ru:'ㄱ внизу = 받침 · книга'},
            {ko:'산',  ru:'ㄴ внизу = 받침 · гора'}
          ],
          note:'받침 (падчим) — это согласная, которая стоит внизу слога и закрывает его. Слог = согласная + гласная + (падчим).' },
        { kind:'info', eyebrow:'ТЕОРИЯ · ОСНОВНЫЕ', title:'6 основных 받침', sub:'Тапни — услышь звук', cols:3, grid:L2_BACHIM,
          note:'Падчим читается коротко и резко — без призвука гласной.' },
        { kind:'info', eyebrow:'ТЕОРИЯ · ПРИМЕРЫ', title:'Слова с 받침', sub:'', cols:1, noPlay:true,
          grid:[
            {ko:'ㄱ → к',  ru:'국 (суп) · 책 (книга)'},
            {ko:'ㄴ → н',  ru:'산 (гора) · 문 (дверь)'},
            {ko:'ㄷ → т',  ru:'옷 (одежда) · 낫 (серп)'},
            {ko:'ㅁ → м',  ru:'밤 (ночь) · 봄 (весна)'},
            {ko:'ㅂ → п',  ru:'밥 (рис) · 앞 (впереди)'},
            {ko:'ㅇ → нг', ru:'방 (комната) · 공 (мяч)'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · ПАДЧИМ', title:'Звук падчима',
          items:[{ko:'ㄱ',ru:'к'},{ko:'ㄴ',ru:'н'},{ko:'ㄷ',ru:'т'},{ko:'ㅁ',ru:'м'},{ko:'ㅂ',ru:'п'},{ko:'ㅇ',ru:'нг'}],
          pool:['к','н','т','м','п','нг','р','с'] },
        { kind:'info', eyebrow:'ТЕОРИЯ · ПРАВИЛО [т]', title:'Семёрка → [т]', sub:'ㄷ · ㅌ · ㅅ · ㅆ · ㅈ · ㅊ · ㅎ', cols:1, noPlay:true,
          grid:[
            {ko:'옷',  ru:'одежда — читается «от»'},
            {ko:'꽃',  ru:'цветок — читается «кот»'},
            {ko:'낮',  ru:'день — читается «нат»'}
          ],
          note:'Если эти 7 букв стоят в конце слога без следующей гласной, они звучат одинаково — как короткое [т].' },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 1', title:'Слова с падчимом', items:L2_WORDS_1 },
        { kind:'words', eyebrow:'СЛОВА ДЛЯ ЧТЕНИЯ · 1', title:'Прочитай вслух', items:L2_WORDS_2 },
        { kind:'words', eyebrow:'СЛОВА ДЛЯ ЧТЕНИЯ · 2', title:'Сложные падчимы', items:L2_WORDS_3 },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · ЗАКРЕПЛЕНИЕ', title:'Найди падчим',
          items:[{ko:'밥',ru:'ㅂ'},{ko:'책',ru:'ㄱ'},{ko:'산',ru:'ㄴ'},{ko:'밤',ru:'ㅁ'},{ko:'공',ru:'ㅇ'},{ko:'문',ru:'ㄴ'}],
          pool:['ㄱ','ㄴ','ㄷ','ㅁ','ㅂ','ㅇ'] },
        { kind:'homework' }
      ]
    },
    {
      id:'l3-greetings', num:3,
      title:'Приветствия',
      ko:'안녕하세요?',
      ru:'Приветствия, страны, грамматика 이에요/예요 и 은/는',
      vocab: [...L3_GREETINGS, ...L3_COUNTRIES],
      homework: {
        tasks: [
          'Выучить новые слова урока.',
          'Составить 5 предложений с грамматикой 이에요/예요 и 은/는.',
          'Каждая новая тема, каждое выученное слово, каждая ошибка — это шаг вперёд. Не бойся быть учеником.'
        ],
        file: { label:'Урок 3 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'안녕하세요? — Здравствуйте', sub:'Знакомимся и говорим, откуда мы',
          learn:[['👋','Приветствия'],['🌍','9 стран'],['✏️','2 грамматики']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 인사', title:'Приветствия', items:L3_GREETINGS },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 나라', title:'Страны (Country)', items:L3_COUNTRIES },
        { kind:'info', eyebrow:'ГРАММАТИКА · 이에요/예요', title:'Сущ + 이에요/예요', sub:'«это / я есть...»', cols:1, noPlay:true,
          grid:[
            {ko:'이에요', ru:'если слово оканчивается на согласную (받침). Пример: 학생이에요 · 책이에요 · 선생님이에요'},
            {ko:'예요',   ru:'если слово оканчивается на гласную. Пример: 의사예요 · 가수예요 · 친구예요'}
          ],
          note:'Правило простое: смотри на последнюю букву слова. Падчим есть → 이에요. Падчима нет → 예요.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · ОТКУДА Я', title:'Я из…', sub:'Тапни — услышь фразу', cols:1, noPlay:false,
          grid:[
            {ko:'한국 사람이에요',   ru:'🇰🇷 Я кореец (사람 + 이에요)'},
            {ko:'영국 사람이에요',   ru:'🇬🇧 Я англичанин'},
            {ko:'미국 사람이에요',   ru:'🇺🇸 Я американец'},
            {ko:'중국 사람이에요',   ru:'🇨🇳 Я китаец'},
            {ko:'일본 사람이에요',   ru:'🇯🇵 Я японец'},
            {ko:'프랑스 사람이에요', ru:'🇫🇷 Я француз'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · 이에요/예요', title:'Выбери окончание',
          items:[
            {ko:'학생', ru:'이에요'},
            {ko:'친구', ru:'예요'},
            {ko:'책',   ru:'이에요'},
            {ko:'가수', ru:'예요'},
            {ko:'한국', ru:'이에요'},
            {ko:'의사', ru:'예요'}
          ],
          pool:['이에요','예요'] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 은/는', title:'Тематическая частица', sub:'«а что касается…»', cols:1, noPlay:true,
          grid:[
            {ko:'은', ru:'если слово оканчивается на согласную (받침). Пример: 학생은 · 책은 · 선생님은'},
            {ko:'는', ru:'если слово оканчивается на гласную. Пример: 저는 · 친구는 · 가수는'}
          ],
          note:'은/는 ставится после темы предложения — того, о ком/чём говорим. Правило падчима — то же.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 은/는', title:'Кто это?', sub:'Тема + 이에요/예요', cols:1, noPlay:false,
          grid:[
            {ko:'저는 한국 사람이에요',      ru:'Я — кореец (저 + 는)'},
            {ko:'에바는 브라질 사람이에요',  ru:'Эва — бразильянка (에바 + 는)'},
            {ko:'이자벨은 프랑스 사람이에요',ru:'Изабель — француженка (이자벨 + 은)'},
            {ko:'수잔은 호주 사람이에요',    ru:'Сьюзан — австралийка (수잔 + 은)'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · 은/는', title:'Выбери частицу',
          items:[
            {ko:'저',   ru:'는'},
            {ko:'학생', ru:'은'},
            {ko:'친구', ru:'는'},
            {ko:'책',   ru:'은'},
            {ko:'에바', ru:'는'},
            {ko:'한국', ru:'은'}
          ],
          pool:['은','는'] },
        { kind:'info', eyebrow:'АУДИРОВАНИЕ · ДИАЛОГ', title:'Послушай и повтори', sub:'Тапни — услышь реплику', cols:1, noPlay:false,
          grid:[
            {ko:'안녕하세요? 저는 지연이에요',   ru:'Здравствуйте! Я Чжиён'},
            {ko:'안녕하세요? 저는 다니엘이에요', ru:'Здравствуйте! Я Даниэль'},
            {ko:'저는 영국 사람이에요',          ru:'Я англичанин'},
            {ko:'저는 한국 사람이에요. 반가워요',ru:'Я кореянка. Приятно познакомиться'},
            {ko:'만나서 반가워요',               ru:'Очень приятно'}
          ],
          note:'Это шаблон диалога-знакомства. Запомни — и сможешь представиться по-корейски в любой ситуации.' },
        { kind:'homework' }
      ]
    },
    {
      id:'l4-family', num:4,
      title:'Семья',
      ko:'가족',
      ru:'Семья, вопросительная форма и отрицание 이/가 아니에요',
      vocab: L4_FAMILY,
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать рассказ про свою семью на корейском.',
          'Учёба — это вклад в твоё будущее. Каждый маленький шаг сегодня делает тебя сильнее завтра.'
        ],
        file: { label:'Урок 4 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'가족 — Семья', sub:'Учимся рассказывать о родных',
          learn:[['👨‍👩‍👧‍👦','16 слов'],['❓','Вопрос'],['❌','Отрицание']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 가족', title:'Семья (Family)', items:L4_FAMILY },
        { kind:'info', eyebrow:'ГРАММАТИКА · ВОПРОС', title:'Сущ + 이에요?/예요?', sub:'Вопросительная форма', cols:1, noPlay:true,
          grid:[
            {ko:'이에요?', ru:'после согласной (받침). Пример: 형이에요? · 학생이에요?'},
            {ko:'예요?',   ru:'после гласной. Пример: 누구예요? · 어머니예요?'}
          ],
          note:'Вопрос строится так же, как утверждение, — только с интонацией вверх и знаком вопроса.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · ВОПРОС', title:'Кто это?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'누구예요?',           ru:'Кто это?'},
            {ko:'우리 어머니예요',     ru:'Это моя мама'},
            {ko:'형이에요?',           ru:'Это (твой) старший брат?'},
            {ko:'네, 우리 형이에요',   ru:'Да, это мой старший брат'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · ВОПРОС', title:'Выбери окончание',
          items:[
            {ko:'누구',   ru:'예요?'},
            {ko:'형',     ru:'이에요?'},
            {ko:'누나',   ru:'예요?'},
            {ko:'동생',   ru:'이에요?'},
            {ko:'할머니', ru:'예요?'},
            {ko:'선생님', ru:'이에요?'}
          ],
          pool:['이에요?','예요?'] },
        { kind:'info', eyebrow:'ГРАММАТИКА · ОТРИЦАНИЕ', title:'Сущ + 이/가 아니에요', sub:'«это не …»', cols:1, noPlay:true,
          grid:[
            {ko:'이 아니에요', ru:'есть 받침 ✔ : 여동생이 아니에요 · 학생이 아니에요'},
            {ko:'가 아니에요', ru:'нет 받침 ❌ : 오빠가 아니에요 · 누나가 아니에요'}
          ],
          note:'После согласной — 이 아니에요, после гласной — 가 아니에요. Логика та же, что у 이에요/예요.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · ОТРИЦАНИЕ', title:'Нет, это не …', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'여동생이에요?',          ru:'Это младшая сестра?'},
            {ko:'아니요, 여동생이 아니에요',ru:'Нет, это не младшая сестра'},
            {ko:'오빠예요?',              ru:'Это старший брат?'},
            {ko:'아니요, 오빠가 아니에요', ru:'Нет, это не старший брат'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · ОТРИЦАНИЕ', title:'Выбери концовку',
          items:[
            {ko:'여동생', ru:'이 아니에요'},
            {ko:'오빠',   ru:'가 아니에요'},
            {ko:'형',     ru:'이 아니에요'},
            {ko:'누나',   ru:'가 아니에요'},
            {ko:'동생',   ru:'이 아니에요'},
            {ko:'어머니', ru:'가 아니에요'}
          ],
          pool:['이 아니에요','가 아니에요'] },
        { kind:'info', eyebrow:'ЧТЕНИЕ · СЕМЬЯ', title:'Расскажи о семье', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'안녕하세요? 저는 토마스예요',  ru:'Здравствуйте! Я Томас'},
            {ko:'우리 아버지는 선생님이에요', ru:'Мой папа — учитель'},
            {ko:'우리 누나는 학생이에요',     ru:'Моя старшая сестра — студентка'},
            {ko:'누나 이름은 줄리아예요',     ru:'Имя сестры — Джулия'},
            {ko:'동생 이름은 매튜예요',       ru:'Имя младшего брата — Мэтью'},
            {ko:'매튜는 학생이 아니에요',     ru:'Мэтью — не студент'}
          ],
          note:'Это шаблон рассказа о семье. Подставь свои имена — и расскажи о своей!' },
        { kind:'homework' }
      ]
    },
    {
      id:'l5-classroom', num:5,
      title:'Класс',
      ko:'교실',
      ru:'Класс, локатив 에, есть/нет 있어요/없어요',
      vocab: [...L5_CLASSROOM, ...L5_PLACE],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую грамматику (있어요/없어요 и 에).',
          'Опиши свой класс или комнату по образцу из чтения.'
        ],
        file: { label:'Урок 5 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'교실 — Класс', sub:'Предметы вокруг и где они лежат',
          learn:[['📚','11 предметов'],['📍','7 локаций'],['✏️','2 грамматики']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 교실', title:'Предметы класса', items:L5_CLASSROOM },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 위치', title:'Где? (Place)', items:L5_PLACE },
        { kind:'info', eyebrow:'ДИАЛОГ · НАЧАЛО', title:'Где книга?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'책이 어디에 있어요?',  ru:'Где книга?'},
            {ko:'가방 안에 있어요',    ru:'В рюкзаке'},
            {ko:'가방은 어디에 있어요?',ru:'А рюкзак где?'},
            {ko:'책상 옆에 있어요',    ru:'Рядом со столом'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 있어요/없어요', title:'Есть / нет', sub:'Сущ + 이/가 + 있어요/없어요', cols:1, noPlay:true,
          grid:[
            {ko:'이 있어요/없어요', ru:'после согласной (받침): 연필이 있어요 · 책이 없어요'},
            {ko:'가 있어요/없어요', ru:'после гласной: 시계가 있어요 · 의자가 없어요'}
          ],
          note:'있어요 = есть/находится. 없어요 = нет/отсутствует. Перед ними — частица 이 (после 받침) или 가 (после гласной).' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · ЕСТЬ/НЕТ', title:'Что есть в классе?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'연필이 있어요?',         ru:'Есть карандаш?'},
            {ko:'아니요, 연필이 없어요',  ru:'Нет, карандаша нет'},
            {ko:'시계가 있어요?',         ru:'Часы есть?'},
            {ko:'네, 시계가 있어요',      ru:'Да, часы есть'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · 이/가', title:'Какая частица?',
          items:[
            {ko:'연필',   ru:'이'},
            {ko:'시계',   ru:'가'},
            {ko:'공책',   ru:'이'},
            {ko:'의자',   ru:'가'},
            {ko:'책상',   ru:'이'},
            {ko:'컴퓨터', ru:'가'}
          ],
          pool:['이','가'] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 에', title:'Локатив 에', sub:'«в, на» — место', cols:1, noPlay:true,
          grid:[
            {ko:'место + 에', ru:'присоединяет место к глаголу 있다 (быть/находиться)'},
            {ko:'책상 위에',  ru:'на столе'},
            {ko:'의자 아래에',ru:'под стулом'},
            {ko:'가방 안에',  ru:'в рюкзаке'},
            {ko:'책 옆에',    ru:'рядом с книгой'}
          ],
          note:'Сначала называется ориентир (책상), потом сторона (위/아래/옆/안/앞/뒤) и в конце — частица 에.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 에', title:'Где что лежит?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'책이 어디에 있어요?',  ru:'Где книга?'},
            {ko:'책상 위에 있어요',    ru:'На столе'},
            {ko:'시계가 어디에 있어요?',ru:'Где часы?'},
            {ko:'책상 옆에 있어요',    ru:'Рядом со столом'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · ЛОКАЦИЯ', title:'Куда подставить?',
          items:[
            {ko:'책상 위', ru:'에'},
            {ko:'가방 안', ru:'에'},
            {ko:'의자 옆', ru:'에'},
            {ko:'책상 뒤', ru:'에'},
            {ko:'어디',    ru:'에'}
          ],
          pool:['에','이','가'] },
        { kind:'info', eyebrow:'ЧТЕНИЕ · КЛАСС', title:'Наш класс', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'우리 교실이에요',      ru:'Это наш класс'},
            {ko:'교실에 칠판이 있어요',ru:'В классе есть доска'},
            {ko:'칠판 옆에 시계가 있어요',ru:'Рядом с доской — часы'},
            {ko:'책상 위에 책이 있어요',ru:'На столе — книга'},
            {ko:'의자 아래에 가방이 있어요',ru:'Под стулом — рюкзак'}
          ],
          note:'Это шаблон описания комнаты. Опиши свой стол / комнату так же.' },
        { kind:'homework' }
      ]
    },
    {
      id:'l6-house', num:6,
      title:'Дом',
      ko:'집',
      ru:'Дом, спряжение -아/어요 и винительный 을/를',
      vocab: [...L6_HOUSE, ...L6_VERBS],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую грамматику (-아/어요 и 을/를).',
          'Опиши, что делают члены твоей семьи прямо сейчас.'
        ],
        file: { label:'Урок 6 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'집 — Дом', sub:'Чем занимаемся дома',
          learn:[['🏠','15 слов'],['🎬','9 глаголов'],['✏️','2 грамматики']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 집', title:'Дом и предметы', items:L6_HOUSE },
        { kind:'words', eyebrow:'ГЛАГОЛЫ · -아/어요', title:'Действия', items:L6_VERBS },
        { kind:'info', eyebrow:'ДИАЛОГ', title:'Что делает Юна?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'유나는 뭘 해요?',     ru:'Что делает Юна?'},
            {ko:'책을 읽어요',          ru:'Читает книгу'},
            {ko:'동생은 뭘 해요?',      ru:'А младший?'},
            {ko:'텔레비전을 봐요',     ru:'Смотрит телевизор'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -아/어요', title:'Спряжение глаголов', sub:'Вежливая разговорная форма', cols:1, noPlay:true,
          grid:[
            {ko:'-아요',  ru:'если в основе ㅏ или ㅗ: 가다 → 가요 · 보다 → 봐요'},
            {ko:'-어요',  ru:'если другие гласные (ㅓ ㅜ ㅡ ㅣ): 먹다 → 먹어요 · 읽다 → 읽어요'},
            {ko:'하다 → 해요', ru:'исключение: 공부하다 → 공부해요 · 운동하다 → 운동해요'}
          ],
          note:'Отрезаем -다 от инфинитива → смотрим на гласную в основе → выбираем окончание. Это база всего корейского!' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · -아/어요', title:'Что они делают?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'봐요',    ru:'смотрит (보다)'},
            {ko:'마셔요',  ru:'пьёт (마시다)'},
            {ko:'먹어요',  ru:'ест (먹다)'},
            {ko:'공부해요',ru:'учится (공부하다)'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · СПРЯЖЕНИЕ', title:'Какое окончание?',
          items:[
            {ko:'가다',     ru:'-아요'},
            {ko:'먹다',     ru:'-어요'},
            {ko:'보다',     ru:'-아요'},
            {ko:'읽다',     ru:'-어요'},
            {ko:'공부하다', ru:'해요'},
            {ko:'운동하다', ru:'해요'}
          ],
          pool:['-아요','-어요','해요'] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 을/를', title:'Винительный падеж', sub:'Что я делаю — объект действия', cols:1, noPlay:true,
          grid:[
            {ko:'을 (받침 ✔)', ru:'если объект оканчивается на согласную: 밥을 먹어요 · 책을 읽어요'},
            {ko:'를 (받침 ❌)', ru:'если оканчивается на гласную: 우유를 마셔요 · 케이크를 만들어요'}
          ],
          note:'을/를 ставится после слова-объекта (то, что делают). Логика та же — смотри на падчим.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 을/를', title:'Я + объект + глагол', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'밥을 먹어요',     ru:'Я ем рис'},
            {ko:'우유를 마셔요',   ru:'Я пью молоко'},
            {ko:'책을 읽어요',     ru:'Я читаю книгу'},
            {ko:'텔레비전을 봐요', ru:'Я смотрю телевизор'},
            {ko:'옷을 입어요',     ru:'Я надеваю одежду'},
            {ko:'케이크를 만들어요',ru:'Я делаю торт'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · 을/를', title:'Какой падеж?',
          items:[
            {ko:'밥',   ru:'을'},
            {ko:'우유', ru:'를'},
            {ko:'책',   ru:'을'},
            {ko:'케이크',ru:'를'},
            {ko:'옷',   ru:'을'},
            {ko:'요리', ru:'를'}
          ],
          pool:['을','를'] },
        { kind:'info', eyebrow:'ЧТЕНИЕ · ДОМА', title:'Что делает Джейсон?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'제이슨은 학생이에요',       ru:'Джейсон — студент'},
            {ko:'지금 제이슨은 교실에 있어요',ru:'Сейчас он в классе'},
            {ko:'책을 읽어요',                ru:'Читает книгу'},
            {ko:'제이슨 아빠는 집에 있어요',  ru:'Папа Джейсона — дома'},
            {ko:'지금 아빠는 부엌에 있어요',  ru:'Сейчас папа на кухне'},
            {ko:'요리를 해요',                ru:'Готовит'}
          ],
          note:'Это шаблон рассказа «кто где и что делает». Подставь свои имена.' },
        { kind:'homework' }
      ]
    },
    {
      id:'l7-school', num:7,
      title:'Школа',
      ko:'학교',
      ru:'Школа, район, направление 에 (куда) и частица 도 (тоже)',
      vocab: [...L7_SCHOOL, ...L7_NEIGHBORHOOD],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую грамматику (에-куда и 도).',
          'Рассказать, куда идут разные люди в твоей семье.'
        ],
        file: { label:'Урок 7 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'학교 — Школа', sub:'Куда я иду? Кто ещё идёт со мной?',
          learn:[['🏫','14 мест'],['➡️','에 — куда'],['🤝','도 — тоже']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 학교', title:'В школе', items:L7_SCHOOL },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 동네', title:'Наш район', items:L7_NEIGHBORHOOD },
        { kind:'info', eyebrow:'ДИАЛОГ', title:'Куда идёшь?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'어디에 가요?',           ru:'Куда идёшь?'},
            {ko:'도서관에 가요',          ru:'Иду в библиотеку'},
            {ko:'세라는 어디에 가요?',    ru:'А Сэра куда?'},
            {ko:'나도 도서관에 가요',     ru:'Я тоже в библиотеку'},
            {ko:'그래요? 그럼 같이 가요', ru:'Правда? Пошли вместе!'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 에 (куда)', title:'Направление 에', sub:'место + 에 + 가요/와요', cols:1, noPlay:true,
          grid:[
            {ko:'место + 에 + 가요', ru:'идти куда-то: 학교에 가요 · 도서관에 가요'},
            {ko:'место + 에 + 와요', ru:'приходить куда-то: 교실에 와요 · 집에 와요'},
            {ko:'어디에 가요?',       ru:'вопрос: Куда идёшь?'}
          ],
          note:'Это та же частица 에, что в уроке 5 (где?). Только с глаголами движения 가다/오다 — она показывает направление.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 에 (куда)', title:'Куда идут?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'도서관에 가요',   ru:'Иду в библиотеку'},
            {ko:'교실에 와요',     ru:'Приходит в класс'},
            {ko:'병원에 가요',     ru:'Иду в больницу'},
            {ko:'화장실에 가요',   ru:'Иду в туалет'},
            {ko:'집에 와요',       ru:'Прихожу домой'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 도', title:'Частица 도 — «тоже»', sub:'добавляет смысл «также»', cols:1, noPlay:true,
          grid:[
            {ko:'사ущ + 도', ru:'присоединяется к слову (вместо 은/는/이/가): 동생도 학교에 가요'},
            {ko:'사람 + 도', ru:'учитывая других: 학교도 있어요 (есть ещё и школа)'}
          ],
          note:'도 заменяет частицу темы 은/는 или подлежащего 이/가, когда хочешь сказать «тоже / также / ещё и».' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 도', title:'Я тоже…', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'나는 학교에 가요',        ru:'Я иду в школу'},
            {ko:'동생도 학교에 가요',      ru:'Младший тоже идёт в школу'},
            {ko:'우리 동네에 유치원이 있어요',ru:'У нас в районе есть детсад'},
            {ko:'학교도 있어요',           ru:'И школа тоже есть'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · СПРЯЖЕНИЕ', title:'Какое окончание?',
          items:[
            {ko:'가다',     ru:'-아요'},
            {ko:'오다',     ru:'-아요'},
            {ko:'먹다',     ru:'-어요'},
            {ko:'마시다',   ru:'-어요'},
            {ko:'공부하다', ru:'해요'},
            {ko:'운동하다', ru:'해요'}
          ],
          pool:['-아요','-어요','해요'] },
        { kind:'info', eyebrow:'АУДИРОВАНИЕ', title:'Куда идут?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'토마스는 도서관에 가요', ru:'Томас идёт в библиотеку'},
            {ko:'제이슨은 학교에 가요',   ru:'Джейсон идёт в школу'},
            {ko:'세라는 병원에 가요',     ru:'Сэра идёт в больницу'},
            {ko:'유나는 공원에 가요',     ru:'Юна идёт в парк'}
          ],
          note:'Это шаблон «кто куда идёт». Опиши, куда идут люди в твоей семье.' },
        { kind:'homework' }
      ]
    },
    {
      id:'l8-leisure', num:8,
      title:'Развлечения',
      ko:'운동',
      ru:'Досуг и спорт, отрицание 안 и место действия 에서',
      vocab: [...L8_PLACES, ...L8_ACTIVITIES],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую грамматику (안 и 에서).',
          'Расскажи, что ты делаешь в школе, дома и в парке (используй 에서).'
        ],
        file: { label:'Урок 8 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'운동 — Развлечения', sub:'Что делаем в спортзале, парке и классе',
          learn:[['🏀','13 слов'],['❌','안 — не'],['📍','에서 — где']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 장소', title:'Места', items:L8_PLACES },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 활동', title:'Активности', items:L8_ACTIVITIES },
        { kind:'info', eyebrow:'ДИАЛОГ', title:'Юна идёт домой?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'유나는 집에 가요?',       ru:'Юна, идёшь домой?'},
            {ko:'아니요, 집에 안 가요',   ru:'Нет, домой не иду'},
            {ko:'체육관에 가요',           ru:'Иду в спортзал'},
            {ko:'체육관에서 뭘 해요?',    ru:'Что делаешь в спортзале?'},
            {ko:'농구를 해요',             ru:'Играю в баскетбол'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 안', title:'Отрицание 안', sub:'«не делает»', cols:1, noPlay:true,
          grid:[
            {ko:'안 + глагол', ru:'ставится перед глаголом: 안 가요 · 안 먹어요 · 안 읽어요'},
            {ko:'안 해요',     ru:'для глаголов на 하다 — тоже перед 해요: 공부 안 해요'}
          ],
          note:'Простое отрицание: добавь 안 прямо перед глаголом — и получится «не делаю». Просто, как «не» в русском.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 안', title:'Я не …', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'학교에 가요?',          ru:'Идёшь в школу?'},
            {ko:'아니요, 학교에 안 가요',ru:'Нет, не иду в школу'},
            {ko:'책을 읽어요?',          ru:'Читаешь книгу?'},
            {ko:'아니요, 책을 안 읽어요',ru:'Нет, не читаю'},
            {ko:'농구를 안 해요',        ru:'Не играю в баскетбол'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 에서', title:'Место действия 에서', sub:'где что-то происходит', cols:1, noPlay:true,
          grid:[
            {ko:'место + 에서', ru:'место, где совершается действие: 학교에서 공부해요 · 방에서 옷을 입어요'},
            {ko:'에 → куда',    ru:'학교에 가요 — иду В школу (направление)'},
            {ko:'에서 → где',   ru:'학교에서 공부해요 — учусь В школе (где происходит)'}
          ],
          note:'Главное правило: 가다/오다 (движение) → 에. Все остальные действия (учиться, есть, читать…) → 에서.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 에서', title:'Где что делаем?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'방에서 옷을 입어요',    ru:'В комнате надеваю одежду'},
            {ko:'교실에서 공부를 해요', ru:'В классе учусь'},
            {ko:'체육관에서 농구를 해요',ru:'В спортзале играю в баскетбол'},
            {ko:'공원에서 축구를 해요', ru:'В парке играю в футбол'},
            {ko:'집에서 밥을 먹어요',   ru:'Дома ем рис'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · 에/에서', title:'Какая частица?',
          items:[
            {ko:'가요',     ru:'에'},
            {ko:'와요',     ru:'에'},
            {ko:'공부해요', ru:'에서'},
            {ko:'먹어요',   ru:'에서'},
            {ko:'읽어요',   ru:'에서'},
            {ko:'운동해요', ru:'에서'}
          ],
          pool:['에','에서'] },
        { kind:'info', eyebrow:'ЧТЕНИЕ', title:'Джейсон и Юна', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'체육관이 집 옆에 있어요',     ru:'Спортзал — рядом с домом'},
            {ko:'제이슨은 체육관에 가요',       ru:'Джейсон идёт в спортзал'},
            {ko:'체육관에서 농구를 해요',       ru:'В спортзале играет в баскетбол'},
            {ko:'제이슨은 농구를 좋아해요',     ru:'Джейсон любит баскетбол'},
            {ko:'유나는 가게에 가요',           ru:'Юна идёт в магазин'},
            {ko:'가게에서 아이스크림을 사요',   ru:'В магазине покупает мороженое'},
            {ko:'유나는 아이스크림을 좋아해요', ru:'Юна любит мороженое'}
          ] },
        { kind:'homework' }
      ]
    },
    {
      id:'l9-numbers', num:9,
      title:'Числа',
      ko:'숫자',
      ru:'Сино-корейские числа и соединительные частицы 하고 / -고',
      vocab: [...L9_NUMBERS_1, ...L9_NUMBERS_2, ...L9_EXTRA],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую грамматику (하고 и -고).',
          'Запиши свой класс, этаж и возраст по-корейски.'
        ],
        file: { label:'Урок 9 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'숫자 — Числа', sub:'Сино-корейские числа: 일 이 삼 사 오…',
          learn:[['🔟','1—10'],['💯','до 10 000'],['➕','하고 / -고']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 숫자 1—10', title:'Числа от 1 до 10', items:L9_NUMBERS_1 },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 숫자 10+', title:'Десятки и сотни', items:L9_NUMBERS_2 },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 학교', title:'Школа и предметы', items:L9_EXTRA },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · ЧИСЛА', title:'Какое чтение?',
          items:[
            {ko:'1',   ru:'일'},
            {ko:'5',   ru:'오'},
            {ko:'10',  ru:'십'},
            {ko:'7',   ru:'칠'},
            {ko:'100', ru:'백'},
            {ko:'4',   ru:'사'}
          ],
          pool:['일','이','삼','사','오','육','칠','팔','구','십','백'] },
        { kind:'info', eyebrow:'ДИАЛОГ', title:'몇 학년이에요?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'민수는 몇 학년이에요?',                 ru:'В каком классе Минсу?'},
            {ko:'저는 2학년이에요',                       ru:'Я во 2 классе'},
            {ko:'유나하고 빌리는 몇 학년이에요?',         ru:'А Юна и Билли?'},
            {ko:'유나는 2학년이고 빌리는 3학년이에요',    ru:'Юна во 2, а Билли в 3'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 하고', title:'Сущ + 하고 + Сущ', sub:'«и» между предметами', cols:1, noPlay:true,
          grid:[
            {ko:'하고', ru:'соединяет два существительных: 우유하고 빵 (молоко и хлеб)'},
            {ko:'하고', ru:'добавляется к первому слову: 레베카하고 토마스'}
          ],
          note:'하고 — это «и» для существительных. Просто ставь его между двумя словами, и они объединятся.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 하고', title:'… и …', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'엄마는 우유하고 빵을 사요',     ru:'Мама покупает молоко и хлеб'},
            {ko:'레베카하고 토마스가 있어요',   ru:'Здесь Ребекка и Томас'},
            {ko:'연필하고 지우개가 있어요',     ru:'Есть карандаш и ластик'},
            {ko:'민수하고 민지가 학교에 가요',  ru:'Минсу и Минджи идут в школу'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -고', title:'Глагол + -고 + Глагол', sub:'«и» между действиями', cols:1, noPlay:true,
          grid:[
            {ko:'-고',  ru:'соединяет два действия / описания: 보고 + 읽어요 (смотрит и читает)'},
            {ko:'이고', ru:'для 이에요 → 이고: 영국 사람이고 한국 사람이에요'}
          ],
          note:'-고 — это «и» для глаголов и предложений. Прицепи к основе (보 + 고) — и получишь связку.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · -고', title:'Делаю это и то', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'토마스는 달리기를 하고 누나는 줄넘기를 해요', ru:'Томас бегает, а сестра — со скакалкой'},
            {ko:'제이슨은 영국 사람이고 유나는 한국 사람이에요', ru:'Джейсон — англичанин, а Юна — кореянка'},
            {ko:'아빠는 텔레비전을 보고 동생은 책을 읽어요',     ru:'Папа смотрит ТВ, а младший читает'}
          ] },
        { kind:'info', eyebrow:'ЧТЕНИЕ', title:'Я Минсу', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'저는 민수예요',                ru:'Я Минсу'},
            {ko:'초등학교 2학년이에요',        ru:'Я во 2 классе начальной школы'},
            {ko:'한글학교에서 한국어를 공부해요',ru:'В корейской школе учу корейский'},
            {ko:'우리 반에 빌리하고 유나가 있어요',ru:'В моём классе — Билли и Юна'},
            {ko:'빌리는 3학년이고 유나는 2학년이에요',ru:'Билли в 3, Юна во 2 классе'},
            {ko:'우리는 한글학교 친구예요',     ru:'Мы — друзья по корейской школе'}
          ] },
        { kind:'homework' }
      ]
    },
    {
      id:'l10-days', num:10,
      title:'Дни',
      ko:'날짜',
      ru:'Месяцы, дни недели, время-эпизод 에, повелительное -(으)세요',
      vocab: [...L10_MONTHS, ...L10_DAYS, ...L10_TIMES],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую грамматику (에-когда и -(으)세요).',
          'Напиши приглашение на свой день рождения по образцу из чтения.'
        ],
        file: { label:'Урок 10 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'날짜 — Даты и дни', sub:'Месяцы, недели, расписание',
          learn:[['📅','12 месяцев'],['🗓️','7 дней'],['🙏','-(으)세요']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 월', title:'Месяцы', items:L10_MONTHS },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 요일', title:'Дни недели', items:L10_DAYS },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 시간', title:'Когда?', items:L10_TIMES },
        { kind:'info', eyebrow:'⚠️ ВНИМАНИЕ', title:'Особые месяцы', sub:'Запомни исключения!', cols:1, noPlay:true,
          grid:[
            {ko:'6월 → 유월',  ru:'Июнь: НЕ 육월, а 유월'},
            {ko:'10월 → 시월', ru:'Октябрь: НЕ 십월, а 시월'},
            {ko:'остальные', ru:'обычное правило: число + 월 (일월, 이월, 삼월…)'}
          ],
          note:'6 и 10 — единственные неправильные. Все остальные месяцы строятся как «число + 월».' },
        { kind:'info', eyebrow:'ДИАЛОГ', title:'Когда у тебя ДР?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'토마스는 생일이 언제예요?',         ru:'Когда у Томаса день рождения?'},
            {ko:'2월 10일이에요',                     ru:'10 февраля'},
            {ko:'이번 주 금요일이에요?',              ru:'Это в эту пятницу?'},
            {ko:'네, 금요일에 우리 집에 오세요',     ru:'Да, приходите к нам в пятницу'},
            {ko:'집에서 생일 파티를 해요',            ru:'Дома устраиваем праздник'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 에 (когда)', title:'Время + 에', sub:'«в, на» — момент времени', cols:1, noPlay:true,
          grid:[
            {ko:'время + 에', ru:'к дате, дню, неделе: 3월 20일에 · 토요일에 · 이번 주에 · 주말에'},
            {ko:'언제 + 에',   ru:'вопрос без 에: 언제 파티를 해요? (когда будет вечеринка?)'},
            {ko:'오늘 · 어제 · 내일', ru:'без 에! (오늘 가요 — иду сегодня)'}
          ],
          note:'에 ставится к датам, дням недели, неделям, выходным. К словам «сегодня/завтра/вчера» 에 НЕ добавляется.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 에 (когда)', title:'Когда что-то делаем', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'3월 20일에 파티를 해요',     ru:'20 марта будет вечеринка'},
            {ko:'토요일에 한국어를 배워요',   ru:'В субботу учу корейский'},
            {ko:'주말에 공부해요',            ru:'В выходные занимаюсь'},
            {ko:'이번 주에 생일 파티가 있어요',ru:'На этой неделе вечеринка'},
            {ko:'월요일에 학원에 가요',       ru:'В понедельник иду в кружок'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -(으)세요', title:'Повелительное наклонение', sub:'«пожалуйста, …»', cols:1, noPlay:true,
          grid:[
            {ko:'-세요',  ru:'после гласной: 오세요 · 가세요 · 보세요 · 하세요'},
            {ko:'-으세요',ru:'после согласной: 읽으세요 · 앉으세요 · 쓰세요'},
            {ko:'잠깐 쉬세요',ru:'«отдохните немного» — вежливая просьба'}
          ],
          note:'-(으)세요 — вежливая форма просьбы. Учитель, тренер, родитель часто говорят так.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · -(으)세요', title:'Пожалуйста, …', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'우리 집에 오세요',     ru:'Приходите к нам домой'},
            {ko:'이 책을 읽으세요',     ru:'Прочитайте эту книгу'},
            {ko:'잠깐 쉬세요',           ru:'Немного отдохните'},
            {ko:'공책에 쓰세요',         ru:'Напишите в тетради'},
            {ko:'여기에 앉으세요',       ru:'Сядьте здесь'},
            {ko:'질문을 하세요',         ru:'Задавайте вопросы'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · МЕСЯЦЫ', title:'Как читать?',
          items:[
            {ko:'1월',  ru:'일월'},
            {ko:'5월',  ru:'오월'},
            {ko:'6월',  ru:'유월'},
            {ko:'10월', ru:'시월'},
            {ko:'12월', ru:'십이월'},
            {ko:'7월',  ru:'칠월'}
          ],
          pool:['일월','오월','유월','시월','십이월','칠월','육월','십월'] },
        { kind:'info', eyebrow:'ЧТЕНИЕ · ПРИГЛАШЕНИЕ', title:'День рождения Томаса', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'2월 10일이 제 생일이에요',     ru:'10 февраля — мой день рождения'},
            {ko:'생일 파티를 우리 집에서 해요',ru:'Вечеринка — у нас дома'},
            {ko:'토요일에 우리 집에 오세요',   ru:'Приходите к нам в субботу'},
            {ko:'시간: 3:00pm',                  ru:'Время: 15:00'},
            {ko:'날짜: 2월 9일 (토)',            ru:'Дата: 9 февраля (сб)'}
          ],
          note:'Это шаблон приглашения. Используй его, чтобы написать своё на корейском.' },
        { kind:'homework' }
      ]
    },
    {
      id:'l11-park', num:11,
      title:'Парк атракционов',
      ko:'놀이공원',
      ru:'Выходные, 하고 같이 (вместе) и будущее -(으)ㄹ 거예요',
      vocab: [...L11_PLACES, ...L11_THINGS, ...L11_VERBS],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую грамматику (하고 같이 и -(으)ㄹ 거예요).',
          'Расскажи, что ты будешь делать в выходные и с кем.'
        ],
        file: { label:'Урок 11 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'놀이공원 — Парк', sub:'Куда пойдём? Что будем делать в выходные?',
          learn:[['🎢','21 слово'],['🤝','하고 같이'],['🔮','будущее']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 장소', title:'Места отдыха', items:L11_PLACES },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 것', title:'Что мы видим', items:L11_THINGS },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 동사', title:'Действия', items:L11_VERBS },
        { kind:'info', eyebrow:'ДИАЛОГ', title:'Что будешь делать?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'빌리, 내일 뭘 할 거예요?',            ru:'Билли, что будешь делать завтра?'},
            {ko:'내일 놀이공원에 갈 거예요',          ru:'Завтра пойду в парк аттракционов'},
            {ko:'누구하고 같이 갈 거예요?',           ru:'С кем пойдёшь?'},
            {ko:'엄마, 아빠하고 갈 거예요. 유나는요?',ru:'С мамой и папой. А Юна?'},
            {ko:'나는 가족들하고 바비큐 파티를 할 거예요', ru:'Я с семьёй устрою барбекю'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 하고 같이', title:'С кем вместе', sub:'사람 + 하고 같이', cols:1, noPlay:true,
          grid:[
            {ko:'사람 + 하고 같이', ru:'присоединяется к человеку: 친구하고 같이 · 엄마하고 같이'},
            {ko:'누구하고 같이?',    ru:'вопрос: «С кем?»'},
            {ko:'혼자',              ru:'один: 혼자 가요 — иду один (без 하고 같이)'}
          ],
          note:'하고 (мы знаем из урока 9!) теперь с 같이 = «вместе с кем-то». Идеально для разговоров о компании.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 하고 같이', title:'Вместе с …', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'친구하고 같이 축구해요',          ru:'С другом играю в футбол'},
            {ko:'누구하고 같이 도서관에 가요?',    ru:'С кем идёшь в библиотеку?'},
            {ko:'엄마하고 같이 가요',              ru:'Иду с мамой'},
            {ko:'동생하고 같이 케이크를 만들어요', ru:'С младшим делаю торт'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -(으)ㄹ 거예요', title:'Будущее время', sub:'«буду делать»', cols:1, noPlay:true,
          grid:[
            {ko:'-ㄹ 거예요',  ru:'после гласной: 가다 → 갈 거예요 · 보다 → 볼 거예요 · 하다 → 할 거예요'},
            {ko:'-을 거예요',  ru:'после согласной: 읽다 → 읽을 거예요 · 먹다 → 먹을 거예요 · 찍다 → 찍을 거예요'}
          ],
          note:'Отрезаем -다 → смотрим на основу. Гласная в конце → -ㄹ 거예요. Согласная (받침) → -을 거예요.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · БУДУЩЕЕ', title:'Что я буду делать?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'내일 동물원에 갈 거예요?',          ru:'Завтра пойдёшь в зоопарк?'},
            {ko:'네, 동물원에서 사진을 찍을 거예요',  ru:'Да, в зоопарке буду фотографировать'},
            {ko:'주말에 뭘 할 거예요?',              ru:'Что будешь делать в выходные?'},
            {ko:'공원에 갈 거예요',                  ru:'Пойду в парк'},
            {ko:'책을 읽을 거예요',                  ru:'Буду читать книгу'},
            {ko:'영화를 볼 거예요',                  ru:'Посмотрю фильм'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · БУДУЩЕЕ', title:'Какое окончание?',
          items:[
            {ko:'가다', ru:'-ㄹ 거예요'},
            {ko:'보다', ru:'-ㄹ 거예요'},
            {ko:'먹다', ru:'-을 거예요'},
            {ko:'읽다', ru:'-을 거예요'},
            {ko:'타다', ru:'-ㄹ 거예요'},
            {ko:'찍다', ru:'-을 거예요'}
          ],
          pool:['-ㄹ 거예요','-을 거예요'] },
        { kind:'info', eyebrow:'ЧТЕНИЕ · ВЫХОДНЫЕ', title:'Завтра суббота', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'내일은 토요일이에요',                  ru:'Завтра суббота'},
            {ko:'토마스는 가족들하고 같이 놀이공원에 갈 거예요',ru:'Томас с семьёй пойдёт в парк'},
            {ko:'놀이 기구도 타고 사진도 많이 찍을 거예요',ru:'Будут кататься и много фоткаться'},
            {ko:'그리고 솜사탕하고 아이스크림도 먹을 거예요',ru:'А ещё съедят сах. вату и мороженое'}
          ],
          note:'Это шаблон рассказа о планах. Опиши свои выходные так же.' },
        { kind:'homework' }
      ]
    },
    {
      id:'l12-seasons-zoo', num:12,
      title:'Сезоны и зоопарк',
      ko:'계절·동물원',
      ru:'Сезоны, погода, зоопарк · ㅂ-неправ., -아/어서, -고 싶다, -았/었어요',
      vocab: [...L12_SEASONS, ...L12_WEATHER, ...L12_ANIMALS],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую из 4 грамматик (ㅂ-неправ., -아/어서, -고 싶다, -았/었어요).',
          'Расскажи про любимый сезон (почему именно он) и про последние выходные (что делал).'
        ],
        file: { label:'Урок 12 · конспект', note:'PDF · 2 части — добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'계절 + 동물원', sub:'Большой урок: сезоны, погода и зоопарк',
          learn:[['🍀','4 сезона'],['🐾','10 животных'],['📚','4 грамматики']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 계절', title:'Сезоны и температура', items:L12_SEASONS },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 날씨', title:'Погода', items:L12_WEATHER },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 동물', title:'Зоопарк', items:L12_ANIMALS },
        { kind:'info', eyebrow:'ДИАЛОГ · ЛЮБИМЫЙ СЕЗОН', title:'무슨 계절을 좋아해요?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'제이슨은 무슨 계절을 좋아해요?',   ru:'Какой сезон любит Джейсон?'},
            {ko:'저는 여름을 좋아해요',             ru:'Я люблю лето'},
            {ko:'왜 여름을 좋아해요?',              ru:'Почему любишь лето?'},
            {ko:'방학이 있어서 여름을 좋아해요',    ru:'Потому что есть каникулы'},
            {ko:'아, 그래요? 선생님도 여름을 좋아해요', ru:'Вот как? Учитель тоже любит лето'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · ㅂ-НЕПРАВ.', title:'ㅂ на конце основы', sub:'ㅂ → 우/오 перед -아/어요', cols:1, noPlay:true,
          grid:[
            {ko:'춥다 → 추워요', ru:'холодно'},
            {ko:'덥다 → 더워요', ru:'жарко'},
            {ko:'쉽다 → 쉬워요', ru:'легко'},
            {ko:'어렵다 → 어려워요', ru:'трудно'},
            {ko:'돕다 → 도와요',   ru:'помогает (исключение → 오)'},
            {ko:'⚠️ обычные',     ru:'입다→입어요, 잡다→잡아요, 좁다→좁아요'}
          ],
          note:'Если основа кончается на ㅂ, то перед окончанием ㅂ превращается в 우 (или 오 для 돕다, 곱다). Несколько слов остаются обычными.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · ПОГОДА', title:'Какая погода?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'날씨가 어때요?',          ru:'Какая погода?'},
            {ko:'더워요',                    ru:'Жарко'},
            {ko:'오늘 날씨가 추워요?',      ru:'Сегодня холодно?'},
            {ko:'아니요, 따뜻해요',         ru:'Нет, тепло'},
            {ko:'한국어가 어려워요?',       ru:'Корейский сложный?'},
            {ko:'아니요, 쉬워요',            ru:'Нет, лёгкий'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -아/어서', title:'Причина: «потому что»', sub:'Сначала причина → потом следствие', cols:1, noPlay:true,
          grid:[
            {ko:'-아/어서',  ru:'присоединяется к основе глагола (как -아/어요, только -서)'},
            {ko:'비가 와서', ru:'потому что идёт дождь'},
            {ko:'추워서',    ru:'потому что холодно'},
            {ko:'더워서',    ru:'потому что жарко'}
          ],
          note:'Берёшь форму -아/어요, заменяешь 요 на 서 — и получаешь «потому что». Само следствие идёт после.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · ПРИЧИНА', title:'Почему?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'비가 와서 우산을 써요',      ru:'Идёт дождь, поэтому беру зонт'},
            {ko:'날씨가 추워서 집에 있어요',  ru:'Холодно, поэтому дома'},
            {ko:'더워서 반바지를 입어요',     ru:'Жарко, поэтому надел шорты'},
            {ko:'추워서 코코아를 마셔요',     ru:'Холодно, поэтому пью какао'},
            {ko:'꽃이 많아서 봄을 좋아해요',  ru:'Много цветов, поэтому люблю весну'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · ㅂ-НЕПРАВ.', title:'Как спрягать?',
          items:[
            {ko:'춥다',   ru:'추워요'},
            {ko:'덥다',   ru:'더워요'},
            {ko:'쉽다',   ru:'쉬워요'},
            {ko:'어렵다', ru:'어려워요'},
            {ko:'돕다',   ru:'도와요'},
            {ko:'입다',   ru:'입어요'}
          ],
          pool:['추워요','더워요','쉬워요','어려워요','도와요','입어요'] },
        { kind:'info', eyebrow:'ДИАЛОГ · ЗООПАРК', title:'지난 주말에 뭘 했어요?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'지난 주말에 뭘 했어요?',       ru:'Что делал в прошлые выходные?'},
            {ko:'아빠하고 같이 동물원에 갔어요',ru:'С папой ходил в зоопарк'},
            {ko:'무슨 동물을 봤어요?',          ru:'Каких животных видел?'},
            {ko:'곰하고 사자를 봤어요',         ru:'Видел медведя и льва'},
            {ko:'재미있었어요?',                 ru:'Было весело?'},
            {ko:'아주 재미있었어요',            ru:'Очень весело'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -고 싶다', title:'«Хочу что-то делать»', sub:'основа + 고 싶어요', cols:1, noPlay:true,
          grid:[
            {ko:'가고 싶어요', ru:'хочу пойти'},
            {ko:'먹고 싶어요', ru:'хочу есть'},
            {ko:'보고 싶어요', ru:'хочу видеть'},
            {ko:'만나고 싶어요',ru:'хочу встретиться'}
          ],
          note:'Берёшь основу глагола (без -다), прибавляешь -고 싶어요. Подходит к любому глаголу действия.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · ХОЧУ', title:'Что хочешь?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'주말에 어디에 가고 싶어요?',  ru:'Куда хочешь в выходные?'},
            {ko:'놀이공원에 가고 싶어요',     ru:'Хочу в парк аттракционов'},
            {ko:'지금 뭘 먹고 싶어요?',         ru:'Что хочешь сейчас есть?'},
            {ko:'과자를 먹고 싶어요',           ru:'Хочу снеки'},
            {ko:'할머니를 만나고 싶어요',       ru:'Хочу встретиться с бабушкой'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -았/었어요', title:'Прошедшее время', sub:'«сделал»', cols:1, noPlay:true,
          grid:[
            {ko:'-았어요',   ru:'если в основе ㅏ/ㅗ: 가다 → 갔어요 · 보다 → 봤어요'},
            {ko:'-었어요',   ru:'если другие гласные: 먹다 → 먹었어요 · 읽다 → 읽었어요'},
            {ko:'하다 → 했어요', ru:'исключение: 공부했어요 · 운동했어요'}
          ],
          note:'Логика та же, что у -아/어요 (урок 6), только вместо 요 ставим 었어요/았어요.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · ПРОШЕДШЕЕ', title:'Что я делал?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'지난 주말에 뭘 했어요?',           ru:'Что делал в выходные?'},
            {ko:'동물원에 갔어요',                  ru:'Ходил в зоопарк'},
            {ko:'생일에 케이크를 먹었어요',         ru:'На ДР ел торт'},
            {ko:'주말에 수영장에서 수영을 했어요',ru:'В выходные плавал в бассейне'},
            {ko:'어제 동생하고 텔레비전을 봤어요',ru:'Вчера с младшим смотрел ТВ'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · ПРОШЕДШЕЕ', title:'Какое окончание?',
          items:[
            {ko:'가다',     ru:'갔어요'},
            {ko:'보다',     ru:'봤어요'},
            {ko:'먹다',     ru:'먹었어요'},
            {ko:'읽다',     ru:'읽었어요'},
            {ko:'하다',     ru:'했어요'},
            {ko:'공부하다', ru:'공부했어요'}
          ],
          pool:['갔어요','봤어요','먹었어요','읽었어요','했어요','공부했어요'] },
        { kind:'info', eyebrow:'ЧТЕНИЕ · НЬЮ-ЙОРК', title:'У Билли в Нью-Йорке', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'빌리는 미국 뉴욕에 살아요',     ru:'Билли живёт в Нью-Йорке'},
            {ko:'뉴욕은 사계절이 있어요',         ru:'В Нью-Йорке 4 сезона'},
            {ko:'봄은 따뜻하고 여름은 더워요',  ru:'Весна тёплая, лето жаркое'},
            {ko:'가을은 시원하고 겨울은 추워요',ru:'Осень прохладная, зима холодная'},
            {ko:'빌리는 겨울을 좋아해요',         ru:'Билли любит зиму'},
            {ko:'겨울에는 스케이트도 타고 눈사람도 만들어요',ru:'Зимой катается на коньках и лепит снеговиков'}
          ],
          note:'Это шаблон рассказа о климате. Опиши свой город так же.' },
        { kind:'homework' }
      ]
    },
    {
      id:'l13-kitchen', num:13,
      title:'Кухня',
      ko:'부엌',
      ru:'Кухня и гостиная · длительное -고 있다 и невозможность 못',
      vocab: [...L13_KITCHEN, ...L13_LIVING],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую грамматику (-고 있다 и 못).',
          'Опиши, что делает твоя семья на кухне или в гостиной прямо сейчас.'
        ],
        file: { label:'Урок 13 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'부엌 — Кухня', sub:'Что делает семья прямо сейчас',
          learn:[['🍳','21 слово'],['⏳','-고 있다'],['🚫','못']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 부엌', title:'Кухня', items:L13_KITCHEN },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 거실', title:'Гостиная', items:L13_LIVING },
        { kind:'info', eyebrow:'ДИАЛОГ · ТЕЛЕФОН', title:'지금 뭘 하고 있어요?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'여보세요. 토마스, 지금 뭘 하고 있어요?',ru:'Алло, Томас, что сейчас делаешь?'},
            {ko:'텔레비전을 보고 있어요',                ru:'Смотрю телевизор'},
            {ko:'누나는 뭘 하고 있어요?',                ru:'Что делает старшая?'},
            {ko:'아빠하고 같이 요리를 하고 있어요',     ru:'С папой готовит'},
            {ko:'저녁을 아직 못 먹었어요?',              ru:'Ещё не поужинал?'},
            {ko:'네, 못 먹었어요. 곧 먹을 거예요',      ru:'Нет, скоро буду'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -고 있다', title:'Длительное действие', sub:'«сейчас делаю»', cols:1, noPlay:true,
          grid:[
            {ko:'основа + -고 있어요', ru:'действие происходит прямо сейчас'},
            {ko:'먹고 있어요',        ru:'ест (в этот момент)'},
            {ko:'보고 있어요',        ru:'смотрит'},
            {ko:'하고 있어요',        ru:'делает'},
            {ko:'요리하고 있어요',    ru:'готовит'}
          ],
          note:'Берёшь основу глагола и прибавляешь -고 있어요. Это как английское «-ing»: «I am eating», «she is cooking».' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · -고 있다', title:'Что они делают?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'지금 뭘 하고 있어요?',     ru:'Что сейчас делаешь?'},
            {ko:'밥을 먹고 있어요',          ru:'Я ем'},
            {ko:'엄마는 지금 뭘 하고 있어요?',ru:'Что делает мама?'},
            {ko:'엄마는 요리를 하고 있어요',ru:'Мама готовит'},
            {ko:'방에서 게임을 하고 있어요',ru:'В комнате играет в игру'},
            {ko:'설거지를 하고 있어요',     ru:'Моет посуду'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · -고 있다', title:'Сейчас делает',
          items:[
            {ko:'먹다', ru:'먹고 있어요'},
            {ko:'보다', ru:'보고 있어요'},
            {ko:'하다', ru:'하고 있어요'},
            {ko:'읽다', ru:'읽고 있어요'},
            {ko:'마시다',ru:'마시고 있어요'},
            {ko:'놀다', ru:'놀고 있어요'}
          ],
          pool:['먹고 있어요','보고 있어요','하고 있어요','읽고 있어요','마시고 있어요','놀고 있어요'] },
        { kind:'info', eyebrow:'ГРАММАТИКА · 못', title:'Не могу что-то сделать', sub:'못 + глагол', cols:1, noPlay:true,
          grid:[
            {ko:'못 + глагол', ru:'физически не могу: 못 가요 · 못 먹어요 · 못 봐요'},
            {ko:'못 해요',     ru:'для глаголов 하다: 운동 못 해요 · 수영 못 해요'},
            {ko:'안 vs 못',    ru:'안 = «не делаю» (выбор), 못 = «не могу» (нет возможности)'}
          ],
          note:'못 ставится перед глаголом. Используй, когда что-то мешает: «холодно — не могу плавать», «дождь — не могу пойти».' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · 못', title:'Почему не получится', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'수영을 해요?',                ru:'Будешь плавать?'},
            {ko:'아니요, 추워서 수영을 못 해요',ru:'Нет, холодно — не могу плавать'},
            {ko:'오늘 동물원에 가요?',         ru:'Сегодня идёшь в зоопарк?'},
            {ko:'아니요, 비가 와서 못 가요',   ru:'Нет, идёт дождь — не пойду'},
            {ko:'저녁을 못 먹었어요',           ru:'Я не смог поужинать'}
          ] },
        { kind:'info', eyebrow:'ЧТЕНИЕ · УЖИН', title:'Сегодня 7 часов', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'지금은 저녁 7시예요',                 ru:'Сейчас 7 вечера'},
            {ko:'오늘은 아빠가 저녁을 준비하고 있어요',ru:'Сегодня папа готовит ужин'},
            {ko:'민수와 민지는 아빠를 돕고 있어요',   ru:'Минсу и Минджи помогают'},
            {ko:'민수는 식탁을 닦고, 민지는 숟가락과 젓가락을 놓고 있어요', ru:'Минсу вытирает стол, Минджи раскладывает ложки и палочки'},
            {ko:'우리는 저녁을 맛있게 먹을 거예요',  ru:'Будем вкусно ужинать'}
          ],
          note:'Шаблон рассказа «кто что делает прямо сейчас». Опиши свою семью по этому образцу.' },
        { kind:'homework' }
      ]
    },
    {
      id:'l14-talent', num:14,
      title:'Талант',
      ko:'특기',
      ru:'Таланты и спорт · неформальная речь -아/어 и контраст -지만',
      vocab: [...L14_TALENT, ...L14_SPORT],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую грамматику (-아/어 неформ. и -지만).',
          'Расскажи про свой талант: что умеешь хорошо, а что — не очень.'
        ],
        file: { label:'Урок 14 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'특기 — Талант', sub:'Что я умею и что не очень',
          learn:[['🎨','таланты'],['🏸','спорт'],['📚','2 грамматики']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 특기', title:'Таланты', items:L14_TALENT },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 운동', title:'Спорт', items:L14_SPORT },
        { kind:'info', eyebrow:'ДИАЛОГ · ВЕЛОСИПЕД', title:'너 자전거 잘 타?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'영준아, 너 자전거 잘 타?',           ru:'Ёнджун, ты хорошо ездишь на велике?'},
            {ko:'응, 잘 타. 너도 자전거 잘 타?',      ru:'Да, хорошо. А ты тоже?'},
            {ko:'아니, 나도 잘 타고 싶지만 잘 못 타',ru:'Нет, хочу хорошо, но не умею'},
            {ko:'나는 매일 공원에서 자전거를 탔어', ru:'Я каждый день катался в парке'},
            {ko:'그래서 지금은 잘 타',                  ru:'Поэтому теперь езжу хорошо'},
            {ko:'나도 자전거를 잘 타고 싶어',         ru:'Я тоже хочу научиться'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -아/어', title:'Неформальная речь', sub:'как -아/어요, но без 요', cols:1, noPlay:true,
          grid:[
            {ko:'먹어요 → 먹어',     ru:'ем (сняли 요)'},
            {ko:'가요 → 가',         ru:'иду'},
            {ko:'그려요 → 그려',     ru:'рисую'},
            {ko:'좋아해요 → 좋아해',ru:'нравится'},
            {ko:'⚠️ с кем?',         ru:'только с друзьями, младшими, своими. Со старшими — всегда с 요!'}
          ],
          note:'Берёшь вежливую форму -아/어요 и снимаешь 요. Получается «반말» — речь между близкими. В школе и со старшими — обязательно с 요!' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · НЕФОРМ.', title:'Разговор с другом', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'민수야, 지금 뭘 먹어?',  ru:'Минсу, что сейчас ешь?'},
            {ko:'빵 먹어',                    ru:'Ем хлеб'},
            {ko:'어디에서 그림을 그려?',    ru:'Где рисуешь?'},
            {ko:'교실에서 그림을 그려',    ru:'Рисую в классе'},
            {ko:'너 노래 잘해?',             ru:'Ты хорошо поёшь?'},
            {ko:'응, 나는 노래를 좋아해',  ru:'Да, я люблю петь'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · -아/어', title:'Вежливая → неформ.',
          items:[
            {ko:'먹어요', ru:'먹어'},
            {ko:'가요',   ru:'가'},
            {ko:'그려요', ru:'그려'},
            {ko:'해요',   ru:'해'},
            {ko:'좋아요', ru:'좋아'},
            {ko:'타요',   ru:'타'}
          ],
          pool:['먹어','가','그려','해','좋아','타'] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -지만', title:'Но / однако', sub:'основа + 지만', cols:1, noPlay:true,
          grid:[
            {ko:'-지만',               ru:'присоединяется к основе глагола или прилагательного'},
            {ko:'잘하다 → 잘하지만',  ru:'умею хорошо, но …'},
            {ko:'있다 → 있지만',       ru:'есть, но …'},
            {ko:'좋다 → 좋지만',       ru:'хорошо, но …'},
            {ko:'더웠다 → 더웠지만',  ru:'было жарко, но …'}
          ],
          note:'-지만 значит «но». Ставится после основы глагола/прилагательного и соединяет две противоположные мысли. Работает и в настоящем, и в прошедшем времени.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · -지만', title:'Контраст', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'나는 당근을 좋아하지만 동생은 안 좋아해', ru:'Я люблю морковь, а младший — нет'},
            {ko:'어제는 더웠지만 오늘은 안 더워요',         ru:'Вчера было жарко, сегодня нет'},
            {ko:'언니는 노래를 잘하지만 나는 잘 못해',   ru:'Сестра поёт хорошо, а я — нет'},
            {ko:'컴퓨터는 있지만 텔레비전은 없어',          ru:'Компьютер есть, а телевизора нет'},
            {ko:'수요일에는 태권도를 하지만 금요일에는 안 해', ru:'В среду — тхэквондо, в пятницу — нет'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · -지만', title:'Добавь «но»',
          items:[
            {ko:'잘하다', ru:'잘하지만'},
            {ko:'있다',   ru:'있지만'},
            {ko:'좋다',   ru:'좋지만'},
            {ko:'하다',   ru:'하지만'},
            {ko:'먹다',   ru:'먹지만'},
            {ko:'춥다',   ru:'춥지만'}
          ],
          pool:['잘하지만','있지만','좋지만','하지만','먹지만','춥지만'] },
        { kind:'info', eyebrow:'ЧТЕНИЕ · ЮНА', title:'유나의 하루', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'유나는 자전거를 잘 타요',                 ru:'Юна хорошо ездит на велике'},
            {ko:'매일 동생하고 자전거를 타요',             ru:'Каждый день катается с младшим'},
            {ko:'오늘은 비가 와요',                          ru:'Сегодня идёт дождь'},
            {ko:'자전거를 타고 싶지만 비가 와서 못 타요',ru:'Хочет кататься, но из-за дождя не может'},
            {ko:'그래서 오늘은 집에서 그림을 그려요',     ru:'Поэтому сегодня дома рисует'},
            {ko:'그리고 동화책도 읽어요',                   ru:'И сказки тоже читает'}
          ],
          note:'Шаблон: «обычно делаю X, но сегодня что-то мешает → делаю Y». Опиши свой день так же.' },
        { kind:'homework' }
      ]
    },
    {
      id:'l15-korean-food', num:15,
      title:'Корейская еда',
      ko:'한국 음식',
      ru:'8 корейских блюд и вкус · отрицание -지 않다 и приглашение -자',
      vocab: [...L15_FOOD, ...L15_TASTE],
      homework: {
        tasks: [
          'Воркбук (скину).',
          'Написать по 2 предложения на каждую грамматику (-지 않다 и -자).',
          'Расскажи: какое блюдо любишь, где ел, с кем и как было на вкус.'
        ],
        file: { label:'Урок 15 · конспект', note:'PDF · добавим скоро', url:'' }
      },
      slides: [
        { kind:'intro', title:'한국 음식 — Корейская еда', sub:'8 блюд, вкусы и рекомендации',
          learn:[['🍱','8 блюд'],['😋','вкусы'],['📚','2 грамматики']] },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 음식', title:'Корейские блюда', items:L15_FOOD },
        { kind:'words', eyebrow:'НОВЫЕ СЛОВА · 맛', title:'Вкус и место', items:L15_TASTE },
        { kind:'info', eyebrow:'ДИАЛОГ · УЖИН', title:'오늘 저녁에 뭐 먹어요?', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'엄마, 오늘 저녁에 뭐 먹을 거예요?', ru:'Мама, что сегодня на ужин?'},
            {ko:'지연이는 뭐 먹고 싶어?',               ru:'Чиён, что хочешь поесть?'},
            {ko:'불고기를 먹고 싶어요',                 ru:'Хочу пулькоги'},
            {ko:'불고기는 맵지 않아요',                 ru:'Пулькоги не острое'},
            {ko:'그래. 오늘은 불고기를 먹자',          ru:'Хорошо. Давай сегодня пулькоги'},
            {ko:'네, 좋아요. 빨리 먹고 싶어요',        ru:'Да, отлично. Скорей бы поесть'}
          ] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -지 않다', title:'Отрицание', sub:'основа + 지 않아요', cols:1, noPlay:true,
          grid:[
            {ko:'-지 않다',             ru:'вежливое «не»: к основе глагола/прилагательного'},
            {ko:'가다 → 가지 않아요', ru:'не иду'},
            {ko:'먹다 → 먹지 않아요', ru:'не ем'},
            {ko:'맵다 → 맵지 않아요', ru:'не острое'},
            {ko:'안 vs -지 않다',       ru:'안 стоит перед глаголом, -지 않다 — после основы. Смысл тот же'}
          ],
          note:'Берёшь основу глагола + 지 않아요. Это вежливый универсальный способ сказать «не». «안 가요» и «가지 않아요» значат одно и то же.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · ОТРИЦАНИЕ', title:'Чего не делаю', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'오늘 학교에 가요?',          ru:'Сегодня идёшь в школу?'},
            {ko:'아니요, 학교에 가지 않아요',ru:'Нет, в школу не иду'},
            {ko:'비빔밥이 매워요?',           ru:'Пибимпап острый?'},
            {ko:'아니요, 맵지 않아요',         ru:'Нет, не острый'},
            {ko:'지금 책을 읽어요?',           ru:'Сейчас читаешь книгу?'},
            {ko:'아니요, 읽지 않아요',         ru:'Нет, не читаю'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · -지 않다', title:'Сделай отрицание',
          items:[
            {ko:'가다', ru:'가지 않아요'},
            {ko:'먹다', ru:'먹지 않아요'},
            {ko:'맵다', ru:'맵지 않아요'},
            {ko:'읽다', ru:'읽지 않아요'},
            {ko:'타다', ru:'타지 않아요'},
            {ko:'좋다', ru:'좋지 않아요'}
          ],
          pool:['가지 않아요','먹지 않아요','맵지 않아요','읽지 않아요','타지 않아요','좋지 않아요'] },
        { kind:'info', eyebrow:'ГРАММАТИКА · -자', title:'Давай сделаем!', sub:'основа + 자', cols:1, noPlay:true,
          grid:[
            {ko:'-자',               ru:'приглашение «давай»: к основе глагола'},
            {ko:'가다 → 가자',      ru:'пойдём!'},
            {ko:'먹다 → 먹자',      ru:'давай поедим!'},
            {ko:'읽다 → 읽자',      ru:'давай почитаем!'},
            {ko:'⚠️ с кем?',         ru:'только с друзьями. Со старшими — вежливое -아/어요'}
          ],
          note:'-자 — неформальное приглашение «давай вместе». Со старшими так не говорят, там нужна вежливая форма. Между близкими — самое то.' },
        { kind:'info', eyebrow:'ПРИМЕРЫ · -자', title:'Давай вместе!', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'토마스, 우리 같이 축구하자',       ru:'Томас, давай вместе в футбол!'},
            {ko:'그래, 좋아',                          ru:'Хорошо, давай'},
            {ko:'레베카, 엄마하고 같이 책을 읽자', ru:'Ребекка, давай с мамой почитаем'},
            {ko:'네, 알겠어요',                        ru:'Да, поняла'},
            {ko:'오늘 학교에 같이 가자',              ru:'Давай сегодня вместе в школу!'},
            {ko:'우리 같이 사진을 찍자',             ru:'Давай вместе сфотографируемся!'}
          ] },
        { kind:'quiz', eyebrow:'ЗАДАНИЕ · -자', title:'Давай … !',
          items:[
            {ko:'가다', ru:'가자'},
            {ko:'먹다', ru:'먹자'},
            {ko:'읽다', ru:'읽자'},
            {ko:'타다', ru:'타자'},
            {ko:'찍다', ru:'찍자'},
            {ko:'하다', ru:'하자'}
          ],
          pool:['가자','먹자','읽자','타자','찍자','하자'] },
        { kind:'info', eyebrow:'ЧТЕНИЕ · РЕСТОРАН', title:'한국 식당에서', sub:'Тапни — услышь', cols:1, noPlay:false,
          grid:[
            {ko:'오늘 우리 가족은 한국 식당에 갈 거예요', ru:'Сегодня наша семья пойдёт в кор. ресторан'},
            {ko:'한국 식당에는 한국 음식이 많이 있어요',  ru:'В нём много корейских блюд'},
            {ko:'불고기, 갈비, 비빔밥이 유명해요',          ru:'Пулькоги, кальби, пибимпап — известные'},
            {ko:'나와 동생은 불고기하고 갈비를 좋아해요', ru:'Я и младший любим пулькоги и кальби'},
            {ko:'엄마와 아빠는 비빔밥을 먹을 거예요',     ru:'Мама и папа возьмут пибимпап'},
            {ko:'비빔밥은 좀 매워서 나는 좋아하지 않아요',ru:'Пибимпап острый, поэтому мне не нравится'}
          ],
          note:'Шаблон рассказа о походе в ресторан. Используй -지 않다 для отрицания и называй любимые блюда.' },
        { kind:'homework' }
      ]
    }
  ];

  // ── Слова-«фоллбэк» из старых игр (используются, пока уроки не пройдены) ──
  const LEGACY_WORDS = [
    { ko:'꽃',   ru:'цветок', emoji:'🌸' },
    { ko:'사랑', ru:'любовь', emoji:'❤️' },
    { ko:'안녕', ru:'привет', emoji:'👋' },
    { ko:'김치', ru:'кимчи',  emoji:'🥬' },
    { ko:'비',   ru:'дождь',  emoji:'🌧️' },
    { ko:'봄',   ru:'весна',  emoji:'🌷' },
    { ko:'달',   ru:'луна',   emoji:'🌙' },
    { ko:'별',   ru:'звезда', emoji:'⭐' },
    { ko:'바다', ru:'море',   emoji:'🌊' },
    { ko:'책',   ru:'книга',  emoji:'📚' },
    { ko:'산',   ru:'гора',   emoji:'⛰️' },
    { ko:'고양이', ru:'кот',  emoji:'🐱' },
    { ko:'학교', ru:'школа',  emoji:'🏫' },
    { ko:'친구', ru:'друг',   emoji:'👫' },
    { ko:'화이팅', ru:'удачи!', emoji:'💪' }
  ];
  // Уроки, доступные игроку: пройденные + текущий
  function unlockedLessons() {
    const all = getAllLessons();
    if (isAdmin()) return all; // админу открыт весь словарь
    const p = getLessonProgress();
    return all.filter(l => p.completed.includes(l.id) || l.id === p.current);
  }
  // Общий пул слов для игр: слова открытых уроков + запасной набор
  function gameWordPool() {
    const lessonWords = unlockedLessons().flatMap(l => Array.isArray(l.vocab) ? l.vocab : []);
    const seen = new Set(); const out = [];
    [...lessonWords, ...LEGACY_WORDS].forEach(w => {
      if (w && w.ko && w.ru && !seen.has(w.ko)) { seen.add(w.ko); out.push(w); }
    });
    return out;
  }
  // Кол-во раундов растёт с числом пройденных уроков (+1 за урок, максимум +6)
  function scaledRounds(base) {
    return base + Math.min(getLessonProgress().completed.length, 6);
  }
  // Словарь урока в виде текста (поддерживает массив {ko,ru} и строку)
  function vocabPreviewText(v) {
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v.map(w => `${w.ko} — ${w.ru}`).join(' · ');
    return '';
  }
  function getAllLessons() {
    // Уроки от Мади (customLessons) показываются отдельным блоком
    // через renderCustomLessons() и в основную дорожку уроков не входят.
    return LESSON_CATALOG.slice();
  }
  function getLessonProgress() {
    const all = getAllLessons();
    const ids = new Set(all.map(l => l.id));
    const def = { current: all[0]?.id || null, completed: [] };
    const p = Object.assign(def, UStore.get('lessonProgress') || {});
    // Чистим прогресс от ID удалённых старых уроков
    p.completed = (Array.isArray(p.completed) ? p.completed : []).filter(id => ids.has(id));
    if (!ids.has(p.current)) {
      const next = all.find(l => !p.completed.includes(l.id));
      p.current = next ? next.id : null;
    }
    return p;
  }
  function setLessonProgress(p) { UStore.set('lessonProgress', p); }
  function getCurrentLesson() {
    const all = getAllLessons();
    // Админ может открыть любой урок — приоритет у выбранного вручную
    if (lessonViewId) {
      const v = all.find(l => l.id === lessonViewId);
      if (v) return v;
    }
    const p = getLessonProgress();
    return all.find(l => l.id === p.current) || all[0];
  }
  function completeCurrentLesson() {
    const p = getLessonProgress();
    if (p.current && !p.completed.includes(p.current)) p.completed.push(p.current);
    const all = getAllLessons();
    const next = all.find(l => !p.completed.includes(l.id));
    p.current = next ? next.id : null;
    setLessonProgress(p);
    stats.lessons = p.completed.length;
    UStore.set('stats', stats);
  }

  // ── Lesson path positions (winding S-curve, supports any number of lessons) ──
  function lessonPositions(n) {
    const out = [];
    const baseY = 20;
    const stepY = 140;
    for (let i = 0; i < n; i++) {
      const isRight = i % 2 === 1;
      const x = isRight ? 222 : 78;
      out.push({ x, y: baseY + i * stepY });
    }
    return out;
  }
  function renderLessonPath() {
    const slot = document.getElementById('lesson-path');
    if (!slot) return;
    const all = getAllLessons();
    const p = getLessonProgress();
    const pos = lessonPositions(all.length);
    const W = 300;
    const H = (pos[pos.length - 1]?.y || 0) + 130;

    // L-shaped dashed rose paths with rounded corners
    let paths = '';
    for (let i = 0; i < pos.length - 1; i++) {
      const a = pos[i], b = pos[i + 1];
      const dir = b.x > a.x ? 1 : -1;
      const startX = a.x + 46 * dir;
      const startY = a.y + 46;
      const cornerX = b.x;
      const cornerY = a.y + 46;
      const endY = b.y;
      const r = 16;
      const preX = cornerX - r * dir;
      const postY = cornerY + r;
      paths += `<path d="M ${startX} ${startY} L ${preX} ${cornerY} Q ${cornerX} ${cornerY} ${cornerX} ${postY} L ${cornerX} ${endY}" fill="none" stroke="#F2A6AE" stroke-width="4.5" stroke-dasharray="11 9" stroke-linecap="round"/>`;
    }

    // Tiles
    const admin = isAdmin();
    const tiles = all.map((l, i) => {
      const completed = p.completed.includes(l.id);
      const current   = p.current === l.id;
      const status    = completed ? 'done' : current ? 'current' : admin ? 'open' : 'locked';

      let body;
      if (completed) {
        body = `<div class="tile-main"><i class="fa-solid fa-check"></i></div>`;
      } else if (current || admin) {
        const ko = (l.ko || '').trim().replace(/[?!.,]+$/, '');
        const koLen = [...ko].length;
        let koHtml, koSize;
        if (koLen === 0) {
          koHtml = String(l.num);
          koSize = 28;
        } else if (koLen <= 3) {
          koHtml = ko;
          koSize = koLen <= 2 ? 30 : 24;
        } else {
          // 4+ chars: split into 2 lines, prefer at space/middot
          const m = ko.match(/^(.+?)[\s·]+(.+)$/);
          let line1, line2;
          if (m) { line1 = m[1]; line2 = m[2]; }
          else {
            const chars = [...ko];
            const mid = Math.floor(chars.length / 2);
            line1 = chars.slice(0, mid).join('');
            line2 = chars.slice(mid).join('');
          }
          koHtml = `${line1}<br>${line2}`;
          const longest = Math.max([...line1].length, [...line2].length);
          koSize = longest <= 2 ? 24 : longest <= 3 ? 20 : 17;
        }
        body = `
          <div class="tile-eyebrow">Урок ${l.num}</div>
          <div class="tile-main ko" style="font-size:${koSize}px; line-height:1.05;">${koHtml}</div>
        `;
      } else {
        body = `<div class="tile-main"><i class="fa-solid fa-lock" style="font-size:20px;"></i></div>`;
      }

      const interactive = completed || current || admin;
      const onclick   = interactive ? `onclick="openLessonPreview('${l.id}')"` : '';
      const cursor    = interactive ? 'pointer' : 'default';
      const titleColor = current || completed ? 'var(--berry)' : 'var(--soft)';
      const BEAR_BY_NUM = { 5: 'bear1', 10: 'bear2', 15: 'bear3' };
      const bearName = BEAR_BY_NUM[l.num];
      const bearHtml = bearName
        ? `<img src="assets/${bearName}.png" alt="" class="lesson-bear" />`
        : '';

      return `<div ${onclick} style="position:absolute; left:${pos[i].x - 46}px; top:${pos[i].y}px; cursor:${cursor}; text-align:center; width:92px; ${!interactive ? 'opacity:.75;' : ''}">
        ${bearHtml}
        <div class="lesson-tile ${status}">${body}</div>
        <div style="font-size:11px; font-weight:${current ? 700 : 500}; color:${titleColor}; margin-top:8px; line-height:1.2;">${l.title}</div>
        ${current ? '<span class="chip chip-berry" style="margin-top:6px;">Продолжить →</span>' : ''}
      </div>`;
    }).join('');

    // Decorations: sakuras + sparkles scattered on the OUTER (empty) side of each row
    const sakuraEmojis = ['🌸','🌺','💮'];
    const seed = (i, salt) => ((i * 9301 + salt * 49297 + 7) % 233280) / 233280;
    let deco = '';
    for (let i = 0; i < pos.length; i++) {
      const isRight = i % 2 === 1;
      const sideCx = isRight ? 36 : 264;
      const tileY = pos[i].y;
      const sak = sakuraEmojis[i % sakuraEmojis.length];
      deco += `<div class="path-deco sakura" style="left:${sideCx + seed(i,1)*24 - 12}px; top:${tileY + 6}px; animation-delay:${(i*0.3).toFixed(2)}s;">${sak}</div>`;
      deco += `<div class="path-deco sakura sm" style="left:${sideCx + seed(i,6)*36 - 8}px; top:${tileY + 84}px; animation-delay:${(i*0.4+0.6).toFixed(2)}s;">${sakuraEmojis[(i+1) % sakuraEmojis.length]}</div>`;
      deco += `<div class="path-deco sparkle" style="left:${sideCx + seed(i,2)*30 + 14}px; top:${tileY + 44 + seed(i,3)*20}px; animation-delay:${(i*0.4).toFixed(2)}s;">✦</div>`;
      deco += `<div class="path-deco sparkle sm" style="left:${sideCx + seed(i,4)*32 - 6}px; top:${tileY + 52 + seed(i,5)*16}px; animation-delay:${(i*0.4+1.1).toFixed(2)}s;">✧</div>`;
    }

    slot.style.position = 'relative';
    slot.style.width = W + 'px';
    slot.style.height = H + 'px';
    slot.style.margin = '14px auto 8px';
    slot.innerHTML = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute; inset:0; pointer-events:none;">${paths}</svg>
      ${deco}
      ${tiles}
    `;
    // Update module header counter
    const modHdr = document.getElementById('module-header-count');
    if (modHdr) modHdr.textContent = `✓ ${p.completed.length}/${all.length}`;
    const subhdr = document.getElementById('module-subheader');
    if (subhdr) subhdr.textContent = `${p.completed.length} из ${all.length} уроков`;
    const pct = Math.round((p.completed.length / all.length) * 100);
    const progressBar = document.getElementById('module-progress-bar');
    if (progressBar) progressBar.style.width = pct + '%';
    const pctChip = document.getElementById('module-pct-chip');
    if (pctChip) pctChip.textContent = '🌸 ' + pct + '%';
  }
  function openLessonPreview(lessonId) {
    const all = getAllLessons();
    const l = all.find(x => x.id === lessonId);
    if (!l) return;
    const p = getLessonProgress();
    const completed = p.completed.includes(lessonId);
    const current   = p.current === lessonId;
    // Админу открыты все уроки — сразу запускаем урок целиком
    if (isAdmin()) { startLessonFlow(lessonId); return; }
    if (!completed && !current) { toast('Этот урок пока закрыт 🌸'); return; }
    if (current) { startLessonFlow(); return; }
    // Show review modal for completed
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-card" style="max-width:380px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div>
            <div class="page-eyebrow">УРОК ${l.num} · ПОВТОРЕНИЕ</div>
            <div class="display" style="font-size: 22px; color: var(--berry); margin-top: 4px; line-height:1.2;">${l.title}</div>
          </div>
          <div onclick="this.closest('.modal-bg').remove()" style="font-size:24px; color:var(--soft); cursor:pointer;">×</div>
        </div>
        <div class="hangul-display" style="padding:24px 16px;">
          <div class="ko" style="font-size:36px; font-weight:700; color:var(--berry); line-height:1.1;">${l.ko}</div>
          ${l.ru ? `<div style="color:var(--coral); margin-top:8px; font-size:14px;">«${l.ru}»</div>` : ''}
          ${l.ko ? `
            <div style="display:flex; gap:8px; justify-content:center; margin-top:14px; flex-wrap:wrap;">
              <button onclick="playSyllable('${l.ko.replace(/'/g, "\\'")}', this)" class="btn-mic" style="background:white; border-color:rgba(242,166,174,.4);"><i class="fa-solid fa-volume-up"></i> Послушать</button>
              <button onclick="pronounceCheck('${l.ko.replace(/'/g, "\\'")}', this)" class="btn-mic"><i class="fa-solid fa-microphone"></i> Произнести</button>
            </div>` : ''}
        </div>
        ${l.vocab ? `<div class="ko-quote" style="margin-top:16px;"><div style="font-size:11px; letter-spacing:.16em; color:var(--coral); font-weight:600; margin-bottom:6px;">СЛОВАРЬ</div><div style="font-size:13px; color:var(--berry); line-height:1.6;">${vocabPreviewText(l.vocab)}</div></div>` : ''}
        <div style="display:flex; gap:8px; margin-top:16px;">
          <button onclick="this.closest('.modal-bg').remove()" class="btn btn-ghost" style="flex:1;">Закрыть</button>
          <button onclick="this.closest('.modal-bg').remove(); startLessonFlow();" class="btn btn-primary" style="flex:1.5;">↻ Пройти ещё раз</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);
  }

  // ── Hero lesson on home ──
  function renderHeroLesson() {
    const slot = document.getElementById('hero-lesson');
    if (!slot) return;
    const cur = getCurrentLesson();
    const p = getLessonProgress();
    const all = getAllLessons();
    if (!cur) {
      slot.innerHTML = `
        <div class="hero" style="text-align:center;">
          <div style="font-size:42px;">🎉</div>
          <div class="display" style="font-size:22px; color:var(--berry); margin-top:8px;">Все уроки пройдены</div>
          <div style="font-size:12.5px; color: rgba(92,42,51,.78); margin-top:6px;">Поздравляем! Ждём новых уроков от Мади 🌸</div>
        </div>
      `;
      return;
    }
    const segs = Array.from({length: all.length}, (_,i) => {
      const id = all[i].id;
      const cls = p.completed.includes(id) ? 'done' : (id === p.current ? 'current' : '');
      return `<span class="${cls}"></span>`;
    }).join('');
    const pct = Math.round((p.completed.length / all.length) * 100);
    slot.innerHTML = `
      <div onclick="startLessonFlow()" class="hero">
        <div style="display:flex; justify-content:space-between; gap: 14px; position: relative;">
          <div style="flex:1; min-width:0;">
            <div class="page-eyebrow" style="color: rgba(92,42,51,.7);">УРОК ${cur.num} · СЕГОДНЯ</div>
            <div class="display" style="font-size:26px; line-height:1.05; color:var(--berry); margin-top: 6px;">${cur.title}</div>
            <div style="font-size:13px; color: rgba(92,42,51,.78); margin-top: 6px;">
              ${cur.ko ? `<span class="ko" style="font-weight:600;">${cur.ko}</span>` : ''}
              ${cur.ru ? ` · <em>${cur.ru}</em>` : ''}
            </div>
          </div>
          <div style="width:54px; height:54px; flex-shrink:0; background: rgba(255,255,255,.7); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:30px;">🧩</div>
        </div>
        <div style="margin-top:20px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:6px;">
            <span style="font-weight:600; color:var(--berry);">Урок ${cur.num} из ${all.length}</span>
            <span style="color: rgba(92,42,51,.55);">${pct}%</span>
          </div>
          <div class="progress-segments">${segs}</div>
        </div>
        <div style="margin-top:18px; display:flex; justify-content:flex-end;">
          <button class="btn btn-primary">${p.completed.length === 0 ? 'Начать урок' : 'Продолжить'} <i class="fa-solid fa-arrow-right" style="font-size:11px;"></i></button>
        </div>
      </div>
    `;
  }

  // ── Пагинация ленты и видео на главной ──
  let feedPage = 0,  feedShowAll = false;
  let videoPage = 0, videoShowAll = false;
  const FEED_PER_PAGE = 10, VIDEOS_PER_PAGE = 6;
  // Ряд кнопок-номеров страниц
  function pageNavHtml(current, totalPages, fnName) {
    if (totalPages <= 1) return '';
    let nums = '';
    for (let i = 0; i < totalPages; i++) {
      nums += `<button onclick="${fnName}(${i})" class="btn ${i === current ? 'btn-primary' : 'btn-ghost'}" style="min-width:36px; padding:7px 9px; font-size:12.5px;">${i + 1}</button>`;
    }
    return `<div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:center;">${nums}</div>`;
  }
  function showAllFeed()    { feedShowAll = true;  feedPage = 0; renderCustomFeedPosts(); }
  function collapseFeed()   { feedShowAll = false; feedPage = 0; renderCustomFeedPosts(); document.getElementById('custom-feed-posts')?.scrollIntoView({ behavior:'smooth', block:'start' }); }
  function gotoFeedPage(p)  { feedPage = p; renderCustomFeedPosts(); document.getElementById('custom-feed-posts')?.scrollIntoView({ behavior:'smooth', block:'start' }); }
  function showAllVideos()  { videoShowAll = true;  videoPage = 0; renderCustomVideos(); }
  function collapseVideos() { videoShowAll = false; videoPage = 0; renderCustomVideos(); document.getElementById('custom-videos')?.scrollIntoView({ behavior:'smooth', block:'start' }); }
  function gotoVideoPage(p) { videoPage = p; renderCustomVideos(); document.getElementById('custom-videos')?.scrollIntoView({ behavior:'smooth', block:'start' }); }

  function feedPostCardHtml(p) {
    const typeStyle = {
      announcement: { chip:'chip-coral', label:'📢 ОТ МАДИ', bg:'feed-card-rose' },
      culture:      { chip:'chip-gold',  label:'🎎 КУЛЬТУРА', bg:'feed-card-rose' },
      news:         { chip:'chip-blush', label:'📰 НОВОСТИ',  bg:'' }
    };
    const t = typeStyle[p.type] || typeStyle.announcement;
    const dateStr = p.date ? new Date(p.date).toLocaleDateString('ru-RU', { day:'numeric', month:'long' }) : '';
    const pid = p.id;
    const image = normalizeMediaUrl(p.image);
    return `
      <div class="feed-card ${t.bg}" data-post-id="${pid}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span class="chip ${t.chip}">${t.label}</span>
          <span style="font-size:11px; color: var(--soft);">${dateStr}</span>
        </div>
        ${image ? `
          <div class="feed-media-wrap" ondblclick="doubleTapLike('${pid}', this, event)" ontouchend="handleMediaTouchTap('${pid}', this, event)">
            <div style="border-radius:14px; overflow:hidden; aspect-ratio:16/9; background:var(--paper); cursor:pointer;">
              <img src="${image}" alt="" style="width:100%; height:100%; object-fit:cover; user-select:none;" draggable="false" onerror="this.closest('.feed-media-wrap').style.display='none'">
            </div>
            <button class="feed-media-expand-btn" onclick="event.stopPropagation(); openMediaLightbox('image', '${String(image).replace(/['"]/g, '')}')" aria-label="Открыть полностью" title="Открыть полностью">
              <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
            </button>
          </div>` : ''}
        ${p.video ? renderFeedPostVideo(p.video) : ''}
        ${p.title ? `<div style="font-weight:600; color:var(--berry); font-size:15px; line-height:1.3;">${p.title}</div>` : ''}
        ${p.body ? `<div style="font-size:12.5px; color: rgba(92,42,51,.85); margin-top:6px; line-height:1.5; white-space:pre-wrap;">${p.body}</div>` : ''}
        ${renderFeedSocialBar(pid)}
        ${renderFeedCommentsBlock(pid)}
      </div>
    `;
  }
  function renderCustomFeedPosts() {
    const slot = document.getElementById('custom-feed-posts');
    if (!slot) return;
    let posts = Store.get('customFeedPosts', []);
    // Migration: every post must have a stable id so likes/comments can reference it
    let migrated = false;
    posts.forEach((p, i) => {
      if (!p.id) {
        p.id = `p_${p.date || Date.now()}_${i}_${Math.random().toString(36).slice(2,7)}`;
        migrated = true;
      }
    });
    if (migrated) {
      // Don't trigger cloud sync overwrite from non-admin clients
      const u = Store.get('user');
      if (u && u.isAdmin) Store.set('customFeedPosts', posts);
      else _origStoreSet && _origStoreSet('customFeedPosts', posts);
    }
    posts = posts.slice().sort((a, b) => (b.date || 0) - (a.date || 0));
    if (posts.length === 0) { slot.innerHTML = ''; return; }
    const total = posts.length;
    let shown, footer = '';
    if (!feedShowAll) {
      shown = posts.slice(0, 5);
      if (total > 5) footer = `<div><button onclick="showAllFeed()" class="btn btn-ghost btn-block">Вся лента (${total}) →</button></div>`;
    } else {
      const pages = Math.ceil(total / FEED_PER_PAGE);
      if (feedPage > pages - 1) feedPage = pages - 1;
      if (feedPage < 0) feedPage = 0;
      const start = feedPage * FEED_PER_PAGE;
      shown = posts.slice(start, start + FEED_PER_PAGE);
      footer = `<div style="display:grid; gap:8px;">${pageNavHtml(feedPage, pages, 'gotoFeedPage')}<button onclick="collapseFeed()" class="btn btn-ghost btn-block">↑ Свернуть</button></div>`;
    }
    slot.innerHTML = shown.map(feedPostCardHtml).join('') + footer;
  }

  // Build the inline video player markup for a feed post — handles YouTube / GDrive / direct file
  function renderFeedPostVideo(url) {
    if (!url) return '';
    url = normalizeMediaUrl(url);
    const yid = ytIdFromUrl(url);
    const gid = !yid ? gdriveIdFromUrl(url) : null;
    const isFile = !yid && !gid && isDirectVideoUrl(url);
    let inner = '';
    let lightboxAttr = '';
    if (yid) {
      const thumb = `https://img.youtube.com/vi/${yid}/hqdefault.jpg`;
      inner = `
        <div class="video-player-slot" style="position:relative; aspect-ratio:16/9; background:#000; border-radius:14px; overflow:hidden; cursor:pointer;" onclick="playCustomVideo('youtube','${yid}', this)">
          <img src="${thumb}" style="width:100%; height:100%; object-fit:cover;" alt="">
          <div style="position:absolute; inset:0; background:linear-gradient(180deg, transparent 50%, rgba(0,0,0,.55)); display:flex; align-items:center; justify-content:center;">
            <div style="width:54px; height:54px; border-radius:50%; background:var(--grad-coral); color:white; display:flex; align-items:center; justify-content:center; box-shadow: var(--shadow-lg); font-size:18px;"><i class="fa-solid fa-play"></i></div>
          </div>
        </div>`;
      lightboxAttr = `onclick="event.stopPropagation(); openMediaLightbox('youtube', '${yid}')"`;
    } else if (gid) {
      inner = `
        <div class="video-player-slot" style="position:relative; aspect-ratio:16/9; background:#000; border-radius:14px; overflow:hidden; cursor:pointer;" onclick="playCustomVideo('gdrive','${gid}', this)">
          <div style="position:absolute; inset:0; background:linear-gradient(140deg, var(--berry), var(--coral)); display:flex; align-items:center; justify-content:center;">
            <div style="width:54px; height:54px; border-radius:50%; background:white; color:var(--coral); display:flex; align-items:center; justify-content:center; box-shadow: var(--shadow-lg); font-size:18px;"><i class="fa-solid fa-play"></i></div>
          </div>
          <div style="position:absolute; bottom:8px; left:10px; font-size:10px; color:rgba(255,255,255,.7);">Google Drive</div>
        </div>`;
      lightboxAttr = `onclick="event.stopPropagation(); openMediaLightbox('gdrive', '${gid}')"`;
    } else if (isFile) {
      const safeUrl = String(url).replace(/['"]/g, '');
      inner = `<div style="aspect-ratio:16/9; background:#000; border-radius:14px; overflow:hidden;">
        <video src="${url}" controls preload="metadata" playsinline style="width:100%; height:100%; object-fit:contain; background:#000; display:block;"></video>
      </div>`;
      lightboxAttr = `onclick="event.stopPropagation(); openMediaLightbox('video', '${safeUrl}')"`;
    } else {
      return '';
    }
    return `
      <div class="feed-media-wrap">
        ${inner}
        <button class="feed-media-expand-btn" ${lightboxAttr} aria-label="Открыть полностью" title="Открыть полностью">
          <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
        </button>
      </div>`;
  }

  // ── Double-tap to like (Instagram-style) ──
  // Touch devices fire 'click' on each tap, but native 'dblclick' is unreliable on mobile —
  // so we listen to both: ondblclick for desktop, and a manual touch-timing handler for mobile.
  const _mediaTapTimes = {};
  function _tapClientPoint(ev) {
    if (!ev) return null;
    if (ev.changedTouches && ev.changedTouches.length) {
      const t = ev.changedTouches[0];
      return { x: t.clientX, y: t.clientY };
    }
    if (typeof ev.clientX === 'number' && typeof ev.clientY === 'number') {
      return { x: ev.clientX, y: ev.clientY };
    }
    return null;
  }

  function handleMediaTouchTap(pid, wrap, ev) {
    // Skip if the touch was on the expand button (it stops propagation already, but double-check)
    if (ev && ev.target && ev.target.closest && ev.target.closest('.feed-media-expand-btn')) return;
    const now = Date.now();
    const last = _mediaTapTimes[pid] || 0;
    if (now - last < 320 && last > 0) {
      _mediaTapTimes[pid] = 0;
      if (ev && ev.preventDefault) ev.preventDefault();
      doubleTapLike(pid, wrap, ev);
    } else {
      _mediaTapTimes[pid] = now;
    }
  }

  function doubleTapLike(pid, wrap, ev) {
    // Like the post if it isn't already liked (Instagram never unlikes on double-tap)
    const uid = socialUserId();
    const isLiked = !!(_feedLikes[pid] && _feedLikes[pid][uid]);
    if (!isLiked) {
      const btn = document.querySelector(`.feed-like-btn[data-post-id="${pid}"]`);
      toggleFeedLike(pid, btn || undefined);
    }

    // Compute local coordinates inside wrap (if event available)
    let x = null, y = null;
    const pt = _tapClientPoint(ev);
    if (pt && wrap && wrap.getBoundingClientRect) {
      const r = wrap.getBoundingClientRect();
      x = pt.x - r.left;
      y = pt.y - r.top;
    }
    showDoubleTapHeart(wrap, x, y);
  }

  // Color palette: choose random color each time, avoid repeating the same color twice
  const _heartColors = ['#FF4D6D', '#FFD166', '#84C474', '#62B6CB', '#A06CD5', '#F2A6AE', '#E07686', '#FF8FAB'];
  let _lastHeartColorIdx = -1;
  function showDoubleTapHeart(wrap, x, y) {
    if (!wrap) return;
    let idx = Math.floor(Math.random() * _heartColors.length);
    if (_heartColors.length > 1 && idx === _lastHeartColorIdx) {
      idx = (idx + 1) % _heartColors.length;
    }
    _lastHeartColorIdx = idx;
    const color = _heartColors[idx];
    const heart = document.createElement('div');
    heart.className = 'media-double-tap-heart';
    heart.style.color = color;
    // Tint the soft glow to match the heart so the whole pop feels cohesive
    heart.style.textShadow = `0 4px 16px rgba(0,0,0,.4), 0 0 14px ${color}88`;
    heart.innerHTML = '<i class="fa-solid fa-heart"></i>';
    // If coordinates provided, position the heart there (CSS keeps translate(-50%,-50%) for centering)
    if (typeof x === 'number' && typeof y === 'number') {
      heart.style.left = x + 'px';
      heart.style.top = y + 'px';
    }
    wrap.appendChild(heart);
    // Spawn sakura burst from the same point (fallback: center)
    spawnSakuraBurst(wrap, x, y);
    setTimeout(() => heart.remove(), 1000);
  }

  // Spawn a small burst of sakura emoji particles. Positions are absolute inside `wrap`.
  function spawnSakuraBurst(wrap, x, y) {
    if (!wrap) return;
    const hasPt = (typeof x === 'number' && typeof y === 'number');
    const symbols = ['🌸', '🌸', '🌸', '🌺', '✿'];
    const count = 7 + Math.floor(Math.random() * 4); // 7-10
    const r = wrap.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'media-sakura-particle';
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.position = 'absolute';
      p.style.pointerEvents = 'none';
      p.style.opacity = '1';
      p.style.fontSize = (12 + Math.random() * 10) + 'px';
      // origin point
      const ox = hasPt ? x : r.width / 2;
      const oy = hasPt ? y : r.height / 2;
      p.style.left = ox + 'px';
      p.style.top = oy + 'px';
      p.style.transform = 'translate(-50%, -50%) scale(1)';
      // append first so transitions apply
      wrap.appendChild(p);

      // compute target offset
      const angle = (Math.PI * 2) * (i / count) + (Math.random() - 0.5) * 0.6;
      const dist = 36 + Math.random() * 48;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - (10 + Math.random() * 10);
      const rot = (Math.random() - 0.5) * 90;
      const dur = 700 + Math.floor(Math.random() * 500);
      // animate via transition
      p.style.transition = `transform ${dur}ms cubic-bezier(.22,1,.36,1), opacity ${dur}ms ease-out`;
      // delay slightly per particle
      p.style.transitionDelay = (Math.random() * 80) + 'ms';
      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) rotate(${rot}deg) scale(.85)`;
        p.style.opacity = '0';
      });
      setTimeout(() => { try { p.remove(); } catch (_) {} }, dur + 220);
    }
  }

  // Lightbox: shows image/video at full size in a fullscreen-ish overlay
  function openMediaLightbox(kind, src) {
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.style.background = 'rgba(0,0,0,.92)';
    m.style.zIndex = '900';
    m.style.padding = '20px';
    m.onclick = e => { if (e.target === m) m.remove(); };
    let content = '';
    if (kind === 'image') {
      content = `<img src="${src}" alt="" style="max-width:96vw; max-height:88vh; object-fit:contain; border-radius:12px; display:block; box-shadow: 0 20px 60px rgba(0,0,0,.4);">`;
    } else if (kind === 'youtube') {
      content = `<iframe src="https://www.youtube.com/embed/${src}?autoplay=1" style="width:min(960px,96vw); aspect-ratio:16/9; border:0; border-radius:12px;" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    } else if (kind === 'gdrive') {
      content = `<iframe src="https://drive.google.com/file/d/${src}/preview" style="width:min(960px,96vw); aspect-ratio:16/9; border:0; border-radius:12px;" allow="autoplay" allowfullscreen></iframe>`;
    } else if (kind === 'video') {
      content = `<video src="${src}" controls autoplay playsinline style="max-width:96vw; max-height:88vh; border-radius:12px; background:#000;"></video>`;
    }
    m.innerHTML = `
      <div style="position:relative; display:flex; align-items:center; justify-content:center;">
        ${content}
        <button onclick="this.closest('.modal-bg').remove()" aria-label="Закрыть" style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,.55); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,.22); color:white; width:34px; height:34px; border-radius:10px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; line-height:1; z-index:10;">×</button>
      </div>
    `;
    document.body.appendChild(m);
  }

  // ── Feed: likes + comments (synced via Firebase) ──
  let _feedLikes = {};      // { postId: { uid: true } }
  let _feedComments = {};   // { postId: [{id, uid, name, text, ts, avatar?}] sorted asc by ts }
  let _feedListenersAttached = false;

  function fbKey(s) { return String(s).replace(/[.#$\[\]\/]/g, '_'); }

  // Stable identity for likes/comments. Logged-in users share an id across devices;
  // guests get a per-browser id so their own likes/comments stay attributed to them.
  function socialUserId() {
    const u = Store.get('user');
    if (u && !u.guest) {
      if (u.isAdmin) return fbKey(`admin_${(u.email || u.name).toLowerCase()}`);
      if (u.email)   return fbKey(`user_${u.email.toLowerCase()}`);
      return fbKey(`user_${(u.name || 'anon').toLowerCase()}`);
    }
    let gid = null;
    try { gid = localStorage.getItem('madie_socialGuestId'); } catch (_) {}
    if (!gid) {
      gid = 'g_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
      try { localStorage.setItem('madie_socialGuestId', gid); } catch (_) {}
    }
    return gid;
  }
  function socialUserName() {
    const u = Store.get('user');
    if (u && u.name) return u.name;
    return 'Гостья';
  }

  // Live cache of user avatars by social uid. Comments only store the avatar
  // at the moment of posting; this cache lets us show the *current* avatar of
  // each author across all their past comments/replies.
  const _userAvatars = {};
  const _watchedAvatars = new Set();
  function watchUserAvatar(uid) {
    if (!uid || _watchedAvatars.has(uid)) return;
    // Skip guest/local-only ids — they don't live under users/{uid}
    if (uid.startsWith('g_')) return;
    if (typeof _db === 'undefined') return;
    _watchedAvatars.add(uid);
    _db.ref(`users/${uid}/avatar`).on('value', snap => {
      const v = snap.val() || null;
      if (v !== _userAvatars[uid]) {
        _userAvatars[uid] = v;
        // Avatar changes don't affect structure hash, so the surgical patch path
        // would skip the re-render. Invalidate the cache so the avatar refreshes.
        Object.keys(_structureHashCache).forEach(k => delete _structureHashCache[k]);
        refreshFeedSocial();
      }
    });
  }
  function watchAvatarsForComments() {
    Object.values(_feedComments).forEach(list => {
      list.forEach(c => {
        if (c.uid) watchUserAvatar(c.uid);
        if (c.replies) Object.values(c.replies).forEach(r => { if (r && r.uid) watchUserAvatar(r.uid); });
      });
    });
  }
  // Returns the freshest avatar for a comment/reply author (live cache > stored > null)
  function authorAvatar(item) {
    if (!item) return null;
    if (item.uid && _userAvatars[item.uid]) return _userAvatars[item.uid];
    return item.avatar || null;
  }

  function attachFeedListeners() {
    if (typeof _db === 'undefined' || _feedListenersAttached) return;
    _feedListenersAttached = true;
    _db.ref('shared/feedLikes').on('value', snap => {
      _feedLikes = snap.val() || {};
      refreshFeedSocial();
    });
    _db.ref('shared/feedComments').on('value', snap => {
      const data = snap.val() || {};
      _feedComments = {};
      Object.keys(data).forEach(pid => {
        const obj = data[pid] || {};
        _feedComments[pid] = Object.entries(obj)
          .map(([id, c]) => ({ id, ...c }))
          .sort((a, b) => (a.ts || 0) - (b.ts || 0));
      });
      // Subscribe to live avatar updates for every author seen in the feed
      watchAvatarsForComments();
      refreshFeedSocial();
    });
  }

  function renderFeedSocialBar(pid) {
    const me = socialUserId();
    const likes = _feedLikes[pid] || {};
    const likeCount = Object.keys(likes).length;
    const liked = !!likes[me];
    const cmCount = totalCommentsCount(pid);
    return `
      <div class="feed-social">
        <button class="feed-social-btn feed-like-btn ${liked ? 'liked' : ''}" data-post-id="${pid}" onclick="toggleFeedLike('${pid}', this)" aria-label="Лайк">
          <span class="heart-fx"><i class="${liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i></span>
          <span class="like-count">${likeCount}</span>
        </button>
        <button class="feed-social-btn" onclick="focusFeedInput('${pid}')" aria-label="Написать комментарий">
          <i class="fa-regular fa-comment"></i>
          <span class="feed-comment-count" data-post-id="${pid}">${cmCount}</span>
        </button>
      </div>
    `;
  }

  // Click on the comment-count chip jumps focus to the input below
  function focusFeedInput(pid) {
    const card = document.querySelector(`.feed-card[data-post-id="${pid}"]`);
    if (!card) return;
    const inp = card.querySelector('.feed-comment-input');
    if (!inp) return;
    try { inp.focus({ preventScroll: false }); } catch (_) { inp.focus(); }
    inp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Always-visible comments block: scrollable list (empty hint when no comments) + input
  function renderFeedCommentsBlock(pid) {
    return `
      <div class="feed-comments-block" data-post-id="${pid}">
        <div class="feed-comments-list" data-post-id="${pid}">${renderCommentsList(pid)}</div>
        <div class="feed-comment-form">
          <input class="feed-comment-input" placeholder="Написать комментарий…" maxlength="500" data-post-id="${pid}" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submitFeedComment('${pid}', this);}">
          <button class="feed-comment-send" onclick="submitFeedComment('${pid}', this)" aria-label="Отправить"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    `;
  }

  // ── Comment counting / sorting helpers ──
  function commentLikeCount(c) { return c && c.likes ? Object.keys(c.likes).length : 0; }
  function repliesArray(c) {
    if (!c || !c.replies) return [];
    return Object.entries(c.replies)
      .map(([rid, r]) => ({ rid, ...r }))
      .sort((a, b) => (a.ts || 0) - (b.ts || 0));
  }
  function totalCommentsCount(pid) {
    const list = _feedComments[pid] || [];
    let total = list.length;
    list.forEach(c => { total += repliesArray(c).length; });
    return total;
  }
  // Which comment IDs have their replies block currently expanded (preserved across re-renders)
  const _expandedReplies = new Set();
  function pluralReplies(n) {
    const m100 = n % 100, m10 = n % 10;
    if (m100 >= 11 && m100 <= 14) return 'ответов';
    if (m10 === 1) return 'ответ';
    if (m10 >= 2 && m10 <= 4) return 'ответа';
    return 'ответов';
  }

  // ── Comment item ──
  function renderCommentItem(pid, c) {
    const me = socialUserId();
    const initial = (c.name || '?').charAt(0).toUpperCase();
    const avUrl = authorAvatar(c);
    // Strip any quote chars from the URL so it can sit safely inside a single-quoted url('...')
    const avSafe = avUrl ? String(avUrl).replace(/['"]/g, '') : '';
    const avStyle = avUrl ? `background-image:url('${avSafe}');` : '';
    const avContent = avUrl ? '' : initial;
    const own = c.uid === me;
    const delBtn = own ? `<button class="feed-comment-delete" onclick="deleteFeedComment('${pid}', '${c.id}')" title="Удалить">×</button>` : '';
    const likes = c.likes || {};
    const likeN = Object.keys(likes).length;
    const iLiked = !!likes[me];
    const replies = repliesArray(c);
    const repliesOpen = _expandedReplies.has(c.id);
    const repToggleLabel = repliesOpen ? `Скрыть ${pluralReplies(replies.length)}` : `Посмотреть ${replies.length} ${pluralReplies(replies.length)}`;
    return `
      <div class="feed-comment-item" data-cid="${c.id}">
        <div class="feed-comment-avatar" style="${avStyle}">${avContent}</div>
        <div class="feed-comment-bubble">
          <div class="feed-comment-head">
            <span class="feed-comment-name">${escAttrSafe(c.name || 'Без имени')}</span>
            <span class="feed-comment-time">${relativeTime(c.ts)}</span>
            ${delBtn}
          </div>
          <div class="feed-comment-text">${escAttrSafe(c.text)}</div>
          <div class="comment-actions">
            <button class="comment-action comment-like-btn ${iLiked ? 'liked' : ''}" data-pid="${pid}" data-cid="${c.id}" onclick="toggleCommentLike('${pid}', '${c.id}', this)">
              <i class="${iLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              <span class="comment-like-count">${likeN || ''}</span>
            </button>
            <button class="comment-action" onclick="toggleReplyForm('${pid}', '${c.id}', this)">
              <i class="fa-regular fa-comment"></i>
              <span>Ответить</span>
            </button>
          </div>
          ${replies.length ? `
            <button class="comment-replies-toggle ${repliesOpen ? 'open' : ''}" onclick="toggleCommentReplies('${c.id}', this)">
              <span class="rep-label">${repToggleLabel}</span>
              <i class="fa-solid fa-chevron-down chev"></i>
            </button>
            <div class="comment-replies ${repliesOpen ? 'open' : ''}" data-cid="${c.id}">${replies.map(r => renderReplyItem(pid, c.id, r)).join('')}</div>
          ` : ''}
          <div class="reply-form-wrap" data-cid="${c.id}">
            <input class="reply-input" maxlength="500" placeholder="Ответ ${escAttrSafe(c.name || '')}…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submitReply('${pid}', '${c.id}', this);}">
            <button class="reply-send" onclick="submitReply('${pid}', '${c.id}', this)" aria-label="Отправить"><i class="fa-solid fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    `;
  }

  function toggleCommentReplies(cid, btn) {
    const item = btn.closest('.feed-comment-item');
    if (!item) return;
    const block = item.querySelector(`.comment-replies[data-cid="${cid}"]`);
    if (!block) return;
    const willOpen = !block.classList.contains('open');
    block.classList.toggle('open', willOpen);
    btn.classList.toggle('open', willOpen);
    if (willOpen) _expandedReplies.add(cid);
    else _expandedReplies.delete(cid);
    const n = block.querySelectorAll('.reply-item').length;
    const label = btn.querySelector('.rep-label');
    if (label) label.textContent = willOpen ? `Скрыть ${pluralReplies(n)}` : `Посмотреть ${n} ${pluralReplies(n)}`;
  }

  function renderReplyItem(pid, cid, r) {
    const me = socialUserId();
    const initial = (r.name || '?').charAt(0).toUpperCase();
    const avUrl = authorAvatar(r);
    const avSafe = avUrl ? String(avUrl).replace(/['"]/g, '') : '';
    const avStyle = avUrl ? `background-image:url('${avSafe}');` : '';
    const avContent = avUrl ? '' : initial;
    const own = r.uid === me;
    const delBtn = own ? `<button class="feed-comment-delete" onclick="deleteReply('${pid}', '${cid}', '${r.rid}')" title="Удалить">×</button>` : '';
    const likes = r.likes || {};
    const likeN = Object.keys(likes).length;
    const iLiked = !!likes[me];
    return `
      <div class="reply-item" data-rid="${r.rid}">
        <div class="feed-comment-avatar" style="${avStyle}">${avContent}</div>
        <div class="feed-comment-bubble">
          <div class="feed-comment-head">
            <span class="feed-comment-name">${escAttrSafe(r.name || 'Без имени')}</span>
            <span class="feed-comment-time">${relativeTime(r.ts)}</span>
            ${delBtn}
          </div>
          <div class="feed-comment-text">${escAttrSafe(r.text)}</div>
          <div class="comment-actions">
            <button class="comment-action reply-like-btn ${iLiked ? 'liked' : ''}" data-pid="${pid}" data-cid="${cid}" data-rid="${r.rid}" onclick="toggleReplyLike('${pid}', '${cid}', '${r.rid}', this)">
              <i class="${iLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              <span class="reply-like-count">${likeN || ''}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderCommentsList(pid) {
    const list = _feedComments[pid] || [];
    if (list.length === 0) return '<div class="feed-comment-empty">Пока тихо. Будь первой 🌸</div>';
    // Most-liked first; ties broken by oldest (so without any likes, the first-poster appears on top)
    const sorted = list.slice().sort((a, b) => {
      const la = commentLikeCount(a), lb = commentLikeCount(b);
      if (lb !== la) return lb - la;
      return (a.ts || 0) - (b.ts || 0);
    });
    return sorted.map(c => renderCommentItem(pid, c)).join('');
  }

  // Tracks last-rendered structural hash per post so we can do cheap in-place patches
  // instead of full innerHTML re-renders when only likes change (preserves animations + typing).
  const _structureHashCache = {};
  function commentsStructureHash(pid) {
    const list = _feedComments[pid] || [];
    return list.map(c => {
      const replyIds = c.replies ? Object.keys(c.replies).sort().join(',') : '';
      return `${c.id}:${replyIds}`;
    }).join('|');
  }
  function patchCommentLikesInPlace(listEl, pid) {
    const me = socialUserId();
    const list = _feedComments[pid] || [];
    list.forEach(c => {
      const item = listEl.querySelector(`.feed-comment-item[data-cid="${c.id}"]`);
      if (!item) return;
      // Comment-level like
      const likes = c.likes || {};
      const iLiked = !!likes[me];
      const n = Object.keys(likes).length;
      const likeBtn = item.querySelector('.comment-like-btn');
      if (likeBtn) {
        likeBtn.classList.toggle('liked', iLiked);
        const icon = likeBtn.querySelector('i');
        if (icon) icon.className = (iLiked ? 'fa-solid' : 'fa-regular') + ' fa-heart';
        const cnt = likeBtn.querySelector('.comment-like-count');
        if (cnt) cnt.textContent = n || '';
      }
      // Reply-level likes
      repliesArray(c).forEach(r => {
        const rItem = item.querySelector(`.reply-item[data-rid="${r.rid}"]`);
        if (!rItem) return;
        const rLikes = r.likes || {};
        const riLiked = !!rLikes[me];
        const rn = Object.keys(rLikes).length;
        const rBtn = rItem.querySelector('.reply-like-btn');
        if (rBtn) {
          rBtn.classList.toggle('liked', riLiked);
          const rIcon = rBtn.querySelector('i');
          if (rIcon) rIcon.className = (riLiked ? 'fa-solid' : 'fa-regular') + ' fa-heart';
          const rCnt = rBtn.querySelector('.reply-like-count');
          if (rCnt) rCnt.textContent = rn || '';
        }
      });
    });
  }

  function refreshFeedSocial() {
    // Post-level like buttons
    document.querySelectorAll('.feed-like-btn').forEach(btn => {
      const pid = btn.dataset.postId;
      if (!pid) return;
      const likes = _feedLikes[pid] || {};
      const count = Object.keys(likes).length;
      const liked = !!likes[socialUserId()];
      btn.classList.toggle('liked', liked);
      const icon = btn.querySelector('i');
      if (icon) icon.className = (liked ? 'fa-solid' : 'fa-regular') + ' fa-heart';
      const counter = btn.querySelector('.like-count');
      if (counter) counter.textContent = count;
    });
    // Comment count chip (includes replies)
    document.querySelectorAll('.feed-comment-count').forEach(el => {
      const pid = el.dataset.postId;
      if (!pid) return;
      el.textContent = totalCommentsCount(pid);
    });
    // Preserve any in-progress reply forms before potential re-render
    const savedReplies = {};
    document.querySelectorAll('.reply-form-wrap.open').forEach(form => {
      const cid = form.dataset.cid;
      const input = form.querySelector('input');
      if (cid && input) savedReplies[cid] = { text: input.value, focused: document.activeElement === input };
    });
    // Comment lists: surgical patch when structure unchanged, full re-render otherwise
    document.querySelectorAll('.feed-comments-list').forEach(el => {
      const pid = el.dataset.postId;
      if (!pid) return;
      const curHash = commentsStructureHash(pid);
      if (curHash === _structureHashCache[pid]) {
        patchCommentLikesInPlace(el, pid);
      } else {
        _structureHashCache[pid] = curHash;
        el.innerHTML = renderCommentsList(pid);
      }
    });
    // Restore any reply forms that were open with in-progress text
    Object.entries(savedReplies).forEach(([cid, state]) => {
      const form = document.querySelector(`.reply-form-wrap[data-cid="${cid}"]`);
      if (!form) return;
      form.classList.add('open');
      const input = form.querySelector('input');
      if (input) {
        input.value = state.text;
        if (state.focused) try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }
      }
    });
  }

  async function toggleFeedLike(pid, btn) {
    if (typeof _db === 'undefined') { toast('Нет соединения'); return; }
    if (!btn) btn = document.querySelector(`.feed-like-btn[data-post-id="${pid}"]`);
    const uid = socialUserId();
    if (!_feedLikes[pid]) _feedLikes[pid] = {};
    const wasLiked = !!_feedLikes[pid][uid];
    if (wasLiked) delete _feedLikes[pid][uid];
    else _feedLikes[pid][uid] = true;
    // Play the celebratory animation on like, subtle deflate on unlike
    if (btn) {
      if (!wasLiked) playLikeAnimation(btn);
      else playUnlikeAnimation(btn);
    }
    refreshFeedSocial();
    try {
      const ref = _db.ref(`shared/feedLikes/${pid}/${uid}`);
      if (wasLiked) await ref.remove();
      else await ref.set(true);
    } catch (e) {
      console.warn('toggleFeedLike failed', e);
      // Revert optimistic state on error
      if (wasLiked) _feedLikes[pid][uid] = true;
      else delete _feedLikes[pid][uid];
      refreshFeedSocial();
      toast('Не удалось сохранить лайк');
    }
  }

  function playLikeAnimation(btn) {
    // Restart animation cleanly, even on rapid double-clicks
    btn.classList.remove('just-liked', 'just-unliked');
    void btn.offsetWidth;
    btn.classList.add('just-liked');
    spawnHeartParticles(btn);
    setTimeout(() => btn.classList.remove('just-liked'), 700);
  }
  function playUnlikeAnimation(btn) {
    btn.classList.remove('just-liked', 'just-unliked');
    void btn.offsetWidth;
    btn.classList.add('just-unliked');
    setTimeout(() => btn.classList.remove('just-unliked'), 400);
  }

  function spawnHeartParticles(btn) {
    const wrap = btn.querySelector('.heart-fx');
    if (!wrap) return;
    const symbols = ['❤', '♥', '❤'];
    for (let k = 0; k < 3; k++) {
      const p = document.createElement('span');
      p.className = 'heart-particle';
      p.textContent = symbols[k];
      const dx = (k - 1) * 12 + (Math.random() - .5) * 8;
      p.style.setProperty('--dx', `${dx.toFixed(1)}px`);
      p.style.animationDelay = `${k * 60}ms`;
      wrap.appendChild(p);
      setTimeout(() => p.remove(), 1000 + k * 60);
    }
  }

  async function submitFeedComment(pid, src) {
    if (typeof _db === 'undefined') { toast('Нет соединения'); return; }
    const card = src.closest('.feed-card');
    const input = card && card.querySelector(`.feed-comment-input[data-post-id="${pid}"]`);
    const text = input ? (input.value || '').trim() : '';
    if (!text) return;
    if (text.length > 500) { toast('≤ 500 символов'); return; }
    const uid = socialUserId();
    const name = socialUserName();
    const avatar = (typeof UStore !== 'undefined') ? UStore.get('avatar') : null;
    const comment = { uid, name, text, ts: Date.now() };
    if (avatar) comment.avatar = avatar;
    if (input) input.value = '';
    try {
      await _db.ref(`shared/feedComments/${pid}`).push(comment);
    } catch (e) {
      console.warn('submitFeedComment failed', e);
      if (input) input.value = text; // restore so user doesn't lose their comment
      toast('Не удалось отправить');
    }
  }

  async function deleteFeedComment(pid, cid) {
    if (typeof _db === 'undefined') return;
    const me = socialUserId();
    const list = _feedComments[pid] || [];
    const target = list.find(c => c.id === cid);
    if (!target) return;
    if (target.uid !== me) { toast('Можно удалить только свой комментарий'); return; }
    if (!confirm('Удалить комментарий?')) return;
    try {
      await _db.ref(`shared/feedComments/${pid}/${cid}`).remove();
    } catch (e) {
      console.warn('deleteFeedComment failed', e);
      toast('Не удалось удалить');
    }
  }

  // ── Like a comment ──
  async function toggleCommentLike(pid, cid, btn) {
    if (typeof _db === 'undefined') { toast('Нет соединения'); return; }
    const uid = socialUserId();
    const list = _feedComments[pid] || [];
    const c = list.find(x => x.id === cid);
    if (!c) return;
    if (!c.likes) c.likes = {};
    const wasLiked = !!c.likes[uid];
    if (wasLiked) delete c.likes[uid];
    else c.likes[uid] = true;
    // Subtle button animation on like
    if (btn) {
      btn.classList.toggle('liked', !wasLiked);
      const icon = btn.querySelector('i');
      if (icon) icon.className = (!wasLiked ? 'fa-solid' : 'fa-regular') + ' fa-heart';
      const cnt = btn.querySelector('.comment-like-count');
      const newN = Object.keys(c.likes).length;
      if (cnt) cnt.textContent = newN || '';
      // Restart heartBeat keyframe via class kick
      if (!wasLiked) {
        btn.classList.remove('just-pop');
        void btn.offsetWidth;
        btn.classList.add('just-pop');
        setTimeout(() => btn.classList.remove('just-pop'), 600);
      }
    }
    try {
      const ref = _db.ref(`shared/feedComments/${pid}/${cid}/likes/${uid}`);
      if (wasLiked) await ref.remove();
      else await ref.set(true);
    } catch (e) {
      console.warn('toggleCommentLike failed', e);
      if (wasLiked) c.likes[uid] = true;
      else delete c.likes[uid];
      refreshFeedSocial();
      toast('Не удалось');
    }
  }

  // ── Inline reply form ──
  function toggleReplyForm(pid, cid, btn) {
    const item = btn.closest('.feed-comment-item');
    if (!item) return;
    const form = item.querySelector(`.reply-form-wrap[data-cid="${cid}"]`);
    if (!form) return;
    const willOpen = !form.classList.contains('open');
    // Close other open reply forms in this thread to keep things tidy
    item.closest('.feed-comments-list')?.querySelectorAll('.reply-form-wrap.open').forEach(f => {
      if (f !== form) f.classList.remove('open');
    });
    form.classList.toggle('open', willOpen);
    if (willOpen) {
      setTimeout(() => {
        const inp = form.querySelector('input');
        if (inp) try { inp.focus({ preventScroll: true }); } catch (_) { inp.focus(); }
      }, 60);
    }
  }

  async function submitReply(pid, cid, src) {
    if (typeof _db === 'undefined') { toast('Нет соединения'); return; }
    const form = src.closest('.reply-form-wrap');
    const input = form && form.querySelector('input');
    const text = input ? (input.value || '').trim() : '';
    if (!text) return;
    if (text.length > 500) { toast('≤ 500 символов'); return; }
    const uid = socialUserId();
    const name = socialUserName();
    const avatar = (typeof UStore !== 'undefined') ? UStore.get('avatar') : null;
    const reply = { uid, name, text, ts: Date.now() };
    if (avatar) reply.avatar = avatar;
    if (input) input.value = '';
    if (form) form.classList.remove('open');
    // Auto-expand replies block on this comment so the new reply is visible after re-render
    _expandedReplies.add(cid);
    try {
      await _db.ref(`shared/feedComments/${pid}/${cid}/replies`).push(reply);
    } catch (e) {
      console.warn('submitReply failed', e);
      if (input) input.value = text;
      if (form) form.classList.add('open');
      toast('Не удалось отправить');
    }
  }

  // Like a reply (same flow as comment-like, just one level deeper in the tree)
  async function toggleReplyLike(pid, cid, rid, btn) {
    if (typeof _db === 'undefined') { toast('Нет соединения'); return; }
    const uid = socialUserId();
    const list = _feedComments[pid] || [];
    const c = list.find(x => x.id === cid);
    if (!c || !c.replies || !c.replies[rid]) return;
    const r = c.replies[rid];
    if (!r.likes) r.likes = {};
    const wasLiked = !!r.likes[uid];
    if (wasLiked) delete r.likes[uid];
    else r.likes[uid] = true;
    if (btn) {
      btn.classList.toggle('liked', !wasLiked);
      const icon = btn.querySelector('i');
      if (icon) icon.className = (!wasLiked ? 'fa-solid' : 'fa-regular') + ' fa-heart';
      const cnt = btn.querySelector('.reply-like-count');
      const newN = Object.keys(r.likes).length;
      if (cnt) cnt.textContent = newN || '';
      if (!wasLiked) {
        btn.classList.remove('just-pop');
        void btn.offsetWidth;
        btn.classList.add('just-pop');
        setTimeout(() => btn.classList.remove('just-pop'), 600);
      }
    }
    try {
      const ref = _db.ref(`shared/feedComments/${pid}/${cid}/replies/${rid}/likes/${uid}`);
      if (wasLiked) await ref.remove();
      else await ref.set(true);
    } catch (e) {
      console.warn('toggleReplyLike failed', e);
      if (wasLiked) r.likes[uid] = true;
      else delete r.likes[uid];
      refreshFeedSocial();
      toast('Не удалось');
    }
  }

  async function deleteReply(pid, cid, rid) {
    if (typeof _db === 'undefined') return;
    const me = socialUserId();
    const list = _feedComments[pid] || [];
    const c = list.find(x => x.id === cid);
    if (!c || !c.replies) return;
    const r = c.replies[rid];
    if (!r) return;
    if (r.uid !== me) { toast('Можно удалить только свой ответ'); return; }
    if (!confirm('Удалить ответ?')) return;
    try {
      await _db.ref(`shared/feedComments/${pid}/${cid}/replies/${rid}`).remove();
    } catch (e) {
      console.warn('deleteReply failed', e);
      toast('Не удалось удалить');
    }
  }

  // ── ДОСТИЖЕНИЯ ──
  const ACHIEVEMENTS = [
    // Streak / days entered
    { id:'streak-1',   icon:'🌱', title:'Первый шаг',          desc:'Зайди в программу',                      xp:10,  cat:'streak', check: s => s.daysEntered >= 1 },
    { id:'streak-3',   icon:'🌿', title:'Три дня подряд',       desc:'3 разных дня в программе',               xp:25,  cat:'streak', check: s => s.daysEntered >= 3 },
    { id:'streak-7',   icon:'🌸', title:'Неделя силы',           desc:'7 дней с приложением',                  xp:60,  cat:'streak', check: s => s.daysEntered >= 7 },
    { id:'streak-14',  icon:'🌺', title:'Две недели',            desc:'14 дней — крепкая привычка',             xp:100, cat:'streak', check: s => s.daysEntered >= 14 },
    { id:'streak-30',  icon:'🏵️', title:'Месяц упорства',       desc:'30 дней в дневнике',                    xp:220, cat:'streak', check: s => s.daysEntered >= 30 },
    { id:'streak-100', icon:'🌹', title:'Сотня — это ты',       desc:'100 дней в программе',                  xp:500, cat:'streak', check: s => s.daysEntered >= 100 },
    // Time spent (minutes)
    { id:'time-30',   icon:'⏱️', title:'Полчаса вместе',       desc:'30 минут с Мади',                       xp:15,  cat:'time', check: s => s.minutesSpent >= 30 },
    { id:'time-120',  icon:'⏰', title:'Два часа',              desc:'120 минут практики',                    xp:40,  cat:'time', check: s => s.minutesSpent >= 120 },
    { id:'time-300',  icon:'🕰️', title:'5 часов мастерства',   desc:'300 минут в приложении',                xp:80,  cat:'time', check: s => s.minutesSpent >= 300 },
    { id:'time-600',  icon:'⌛', title:'10 часов погружения',   desc:'600 минут с корейским',                 xp:150, cat:'time', check: s => s.minutesSpent >= 600 },
    { id:'time-1500', icon:'🪐', title:'25 часов',              desc:'1500 минут вместе',                     xp:300, cat:'time', check: s => s.minutesSpent >= 1500 },
    // Lessons
    { id:'lesson-1',  icon:'📖', title:'Первый урок',           desc:'Пройди свой первый урок',               xp:20,  cat:'lessons', check: s => s.lessons >= 1 },
    { id:'lesson-5',  icon:'📚', title:'5 уроков',              desc:'Пройди 5 уроков',                       xp:60,  cat:'lessons', check: s => s.lessons >= 5 },
    { id:'lesson-10', icon:'📕', title:'10 уроков',             desc:'10 уроков за плечами',                  xp:120, cat:'lessons', check: s => s.lessons >= 10 },
    { id:'lesson-30', icon:'🎓', title:'Эксперт уроков',         desc:'30 уроков пройдено',                    xp:300, cat:'lessons', check: s => s.lessons >= 30 },
    // Games — total plays
    { id:'games-1',  icon:'🎮', title:'Первая игра',            desc:'Запусти любую мини-игру',              xp:10,  cat:'games', check: s => totalGamePlays(s) >= 1 },
    { id:'games-10', icon:'🎯', title:'10 игр',                 desc:'Сыграй 10 раз в любые игры',           xp:35,  cat:'games', check: s => totalGamePlays(s) >= 10 },
    { id:'games-50', icon:'🏆', title:'50 игр',                 desc:'Сыграй 50 раз',                        xp:140, cat:'games', check: s => totalGamePlays(s) >= 50 },
    { id:'games-all', icon:'🌟', title:'Попробовала всё',       desc:'Запусти каждую из 9 игр',              xp:90,  cat:'games', check: s => ['flashcards','match','memory','listen','translate','build','numbers','sentence','kpop'].every(g => (s.gamePlays||{})[g] >= 1) },
    // Perfect rounds
    { id:'perfect-match',     icon:'🖼️', title:'Картинка-чемпион',    desc:'5/5 в «Подбери картинку»',         xp:25, cat:'perfect', check: s => (s.perfectGames||{}).match },
    { id:'perfect-memory',    icon:'🃏', title:'Идеальная память',    desc:'Память без штрафа за лишние ходы', xp:50, cat:'perfect', check: s => (s.perfectGames||{}).memory },
    { id:'perfect-listen',    icon:'🎧', title:'Идеальный слух',      desc:'5/5 в «На слух»',                  xp:35, cat:'perfect', check: s => (s.perfectGames||{}).listen },
    { id:'perfect-translate', icon:'⚡', title:'Переводчик',           desc:'6/6 в «Быстром переводе»',         xp:35, cat:'perfect', check: s => (s.perfectGames||{}).translate },
    { id:'perfect-build',     icon:'🧩', title:'Слогомастер',          desc:'5/5 в «Собери слово»',             xp:40, cat:'perfect', check: s => (s.perfectGames||{}).build },
    { id:'perfect-numbers',   icon:'🔢', title:'Числа в кармане',      desc:'6/6 в «Числа»',                    xp:30, cat:'perfect', check: s => (s.perfectGames||{}).numbers },
    { id:'perfect-sentence',  icon:'📝', title:'Грамматик',             desc:'4/4 в «Собери фразу»',             xp:60, cat:'perfect', check: s => (s.perfectGames||{}).sentence },
    { id:'perfect-kpop',      icon:'🎵', title:'K-Pop фанатка',         desc:'4/4 в K-Pop Fill',                 xp:50, cat:'perfect', check: s => (s.perfectGames||{}).kpop },
    // Vocabulary
    { id:'vocab-10',  icon:'🌷', title:'10 слов',                desc:'Узнай 10 разных слов',                  xp:25,  cat:'vocab', check: s => s.words >= 10 },
    { id:'vocab-50',  icon:'💐', title:'50 слов',                desc:'50 слов в копилке',                     xp:80,  cat:'vocab', check: s => s.words >= 50 },
    { id:'vocab-100', icon:'🌳', title:'Сотня слов',             desc:'100 слов выучено',                      xp:160, cat:'vocab', check: s => s.words >= 100 },
    { id:'vocab-300', icon:'🌲', title:'Словарь',                desc:'300 слов — настоящий словарь',          xp:320, cat:'vocab', check: s => s.words >= 300 },
    // Hangul
    { id:'hangul-tap-10',  icon:'🅰️', title:'Первые слоги',     desc:'Собери 10 слогов в Hangul Lab',         xp:15, cat:'hangul', check: s => s.hangulSyllables >= 10 },
    { id:'hangul-tap-50',  icon:'🇰🇷', title:'Слогомеханик',     desc:'50 слогов в конструкторе',              xp:50, cat:'hangul', check: s => s.hangulSyllables >= 50 },
    { id:'hangul-saved-5', icon:'📌', title:'Коллекционер',      desc:'Сохрани 5 слогов в карточки',          xp:25, cat:'hangul', check: s => s.hangulSaved >= 5 },
    // Pronunciation
    { id:'speak-1',        icon:'🎤', title:'Первое слово вслух',  desc:'Произнеси слово в микрофон',           xp:10, cat:'speak', check: s => (s.pronunciationCorrect||0) >= 1 },
    { id:'speak-10',       icon:'🗣️', title:'Голос крепнет',        desc:'10 правильно произнесённых слов',     xp:40, cat:'speak', check: s => (s.pronunciationCorrect||0) >= 10 },
    { id:'speak-50',       icon:'📣', title:'Свободно говорю',      desc:'50 правильных произношений',          xp:120, cat:'speak', check: s => (s.pronunciationCorrect||0) >= 50 },
    { id:'speak-streak-5', icon:'🔊', title:'Пять подряд',          desc:'5 правильных произношений подряд',    xp:30, cat:'speak', check: s => (s.pronunciationBestStreak||0) >= 5 },
    // Levels
    { id:'level-5',   icon:'⭐',  title:'Уровень 5',              desc:'Достигни 5 уровня',                    xp:0, cat:'level', check: s => getLevel(s.xp) >= 5 },
    { id:'level-10',  icon:'✨',  title:'Уровень 10',             desc:'Достигни 10 уровня',                   xp:0, cat:'level', check: s => getLevel(s.xp) >= 10 },
    { id:'level-20',  icon:'🌠',  title:'Уровень 20',             desc:'Достигни 20 уровня',                   xp:0, cat:'level', check: s => getLevel(s.xp) >= 20 },
    // Special
    { id:'profile',  icon:'📷', title:'Это я',                  desc:'Загрузи фото профиля',                  xp:10, cat:'special', check: s => s.hasAvatar },
    { id:'calendar', icon:'📅', title:'Знаток календаря',        desc:'Открой календарь корейских праздников', xp:5,  cat:'special', check: s => s.openedCalendar },
    { id:'culture',  icon:'🎎', title:'Любопытство',             desc:'Открой блок «Культура»',                xp:10, cat:'special', check: s => s.openedCulture }
  ];
  const ACH_CAT_LABEL = {
    streak:'Дни', time:'Время', lessons:'Уроки', games:'Игры',
    perfect:'Идеал', vocab:'Слова', hangul:'Хангыль', speak:'Произношение', level:'Уровни', special:'Особые'
  };

  function totalGamePlays(s) {
    const gp = s.gamePlays || {};
    return Object.values(gp).reduce((a, b) => a + (b || 0), 0);
  }
  function unlockedAchievements() { return UStore.get('unlocks', []); }
  function isUnlocked(id) { return unlockedAchievements().includes(id); }
  function checkAchievements(silent) {
    const unlocked = UStore.get('unlocks', []);
    const newOnes = [];
    ACHIEVEMENTS.forEach(a => {
      if (!unlocked.includes(a.id)) {
        try { if (a.check(stats)) { unlocked.push(a.id); newOnes.push(a); } } catch (_) {}
      }
    });
    if (newOnes.length > 0) {
      UStore.set('unlocks', unlocked);
      let bonusXp = 0;
      newOnes.forEach(a => { if (a.xp > 0) bonusXp += a.xp; });
      if (bonusXp > 0) addXp(bonusXp, false); // updates stats + may fire level-up toast
      syncAchievementsStrip();
      if (!silent) {
        newOnes.forEach((a, i) => setTimeout(() => achievementUnlockToast(a), i * 1700));
      }
    }
    return newOnes;
  }
  function achievementUnlockToast(a) {
    const el = document.createElement('div');
    el.className = 'ach-pop';
    el.innerHTML = `
      <div style="font-size:34px; flex-shrink:0;">${a.icon}</div>
      <div style="min-width:0;">
        <div style="font-size:9px; letter-spacing:.2em; color:var(--gold); font-weight:700;">⭐ ДОСТИЖЕНИЕ</div>
        <div style="font-weight:700; color:var(--berry); font-size:14px; margin-top:1px;">${a.title}</div>
        <div style="font-size:11px; color:var(--soft); margin-top:1px;">${a.desc}</div>
        ${a.xp > 0 ? `<div style="font-size:11px; color:var(--coral); font-weight:700; margin-top:3px;">+${a.xp} XP</div>` : ''}
      </div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  // ── Tracking helpers ──
  function recordDayEntered() {
    const today = new Date().toISOString().slice(0, 10);
    if (!stats.dates.includes(today)) {
      stats.dates.push(today);
      stats.daysEntered = stats.dates.length;
      // Keep streak in sync — count consecutive trailing days
      stats.streak = computeConsecutiveStreak(stats.dates);
      UStore.set('stats', stats);
      syncStats();
      checkAchievements();
    }
  }
  function computeConsecutiveStreak(dates) {
    if (!dates || dates.length === 0) return 0;
    const sorted = [...dates].sort();
    let streak = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
      const d1 = new Date(sorted[i]);
      const d0 = new Date(sorted[i - 1]);
      const diff = Math.round((d1 - d0) / 86400000);
      if (diff === 1) streak++; else break;
    }
    return streak;
  }
  function recordGamePlay(key, score, total) {
    if (!key) return;
    stats.gamePlays[key] = (stats.gamePlays[key] || 0) + 1;
    if (total > 0 && score === total) stats.perfectGames[key] = true;
    UStore.set('stats', stats);
    checkAchievements();
  }
  function recordWordSeen(word) {
    if (!word) return;
    if (!stats.wordsLearned.includes(word)) {
      stats.wordsLearned.push(word);
      // words count = max(baseline, set size)
      stats.words = Math.max(stats.words || 0, stats.wordsLearned.length);
      UStore.set('stats', stats);
      syncStats();
      checkAchievements();
    }
  }
  function recordHangulInteraction() {
    stats.hangulSyllables = (stats.hangulSyllables || 0) + 1;
    UStore.set('stats', stats);
    if (stats.hangulSyllables % 5 === 0) checkAchievements();
  }
  function recordHangulSave() {
    stats.hangulSaved = (stats.hangulSaved || 0) + 1;
    UStore.set('stats', stats);
    checkAchievements();
  }
  function recordCalendarOpen() {
    if (!stats.openedCalendar) { stats.openedCalendar = true; UStore.set('stats', stats); checkAchievements(); }
  }
  function recordCultureOpen() {
    if (!stats.openedCulture) { stats.openedCulture = true; UStore.set('stats', stats); checkAchievements(); }
  }
  function recordAvatarSet() {
    if (!stats.hasAvatar) { stats.hasAvatar = true; UStore.set('stats', stats); checkAchievements(); }
  }

  // ── Session timer (visible-only) ──
  let _sessionStarted = false;
  function startSessionTimer() {
    if (_sessionStarted) return;
    _sessionStarted = true;
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        stats.minutesSpent = (stats.minutesSpent || 0) + 1;
        UStore.set('stats', stats);
        if (stats.minutesSpent % 5 === 0) checkAchievements();
      }
    }, 60000);
  }

  // ── Profile achievements rendering ──
  function syncAchievementsStrip() {
    const strip = document.getElementById('ach-strip');
    const counter = document.getElementById('ach-count');
    const unlocked = unlockedAchievements();
    if (counter) counter.textContent = `${unlocked.length}/${ACHIEVEMENTS.length}`;
    if (!strip) return;
    if (unlocked.length === 0) {
      strip.innerHTML = `<div style="color:var(--soft); font-size:12px; font-style:italic; padding:12px 4px;">Сыграй или пройди урок, чтобы получить первое достижение 🌸</div>`;
      return;
    }
    const unlockedAch = ACHIEVEMENTS.filter(a => unlocked.includes(a.id));
    // Show up to 8 most recently unlocked (last in unlocked array)
    const recent = unlockedAch.slice(-8).reverse();
    strip.innerHTML = recent.map(a => `
      <div onclick="showAllAchievements()" style="flex-shrink:0; width:60px; cursor:pointer;">
        <div style="width:60px; height:60px; border-radius:16px; background: linear-gradient(140deg, var(--gold), var(--coral)); display:flex; align-items:center; justify-content:center; font-size:26px; box-shadow: 0 4px 12px -4px rgba(224,118,134,.5);">${a.icon}</div>
        <div style="font-size:9.5px; color:var(--berry); text-align:center; margin-top:4px; line-height:1.15; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.title}</div>
      </div>
    `).join('');
  }

  function showAllAchievements(filter) {
    filter = filter || 'all';
    const unlocked = unlockedAchievements();
    const all = ACHIEVEMENTS;
    let list = all;
    if (filter === 'unlocked') list = all.filter(a => unlocked.includes(a.id));
    else if (filter === 'locked') list = all.filter(a => !unlocked.includes(a.id));
    // Group by category preserving order
    const cats = ['streak','time','lessons','games','perfect','vocab','hangul','level','special'];
    const grouped = {};
    cats.forEach(c => grouped[c] = []);
    list.forEach(a => { (grouped[a.cat] = grouped[a.cat] || []).push(a); });

    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.id = 'ach-modal';
    m.onclick = e => { if (e.target === m) m.remove(); };
    const totalUnlocked = unlocked.length;
    const totalAll = all.length;
    const pctAll = Math.round(totalUnlocked / totalAll * 100);
    m.innerHTML = `
      <div class="modal-sheet" style="max-width: 420px; border-radius: 28px; max-height: 78vh; margin: 0 12px;">
        <div style="padding: 22px 18px 22px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <div class="page-eyebrow">ДОСТИЖЕНИЯ</div>
              <div class="display" style="font-size:22px; color:var(--berry); margin-top:2px;">${totalUnlocked} / ${totalAll}</div>
              <div style="font-size:11px; color:var(--soft); margin-top:2px;">${pctAll}% коллекции собрано</div>
            </div>
            <div onclick="this.closest('.modal-bg').remove()" style="font-size:26px; color:var(--soft); cursor:pointer; padding:4px;">×</div>
          </div>
          <div class="progress" style="margin-bottom:16px;"><i style="width:${pctAll}%"></i></div>
          <div class="auth-tabs" style="margin-bottom:16px;">
            <button onclick="showAllAchievements('all')" class="auth-tab ${filter==='all'?'auth-tab-active':''}">Все · ${totalAll}</button>
            <button onclick="showAllAchievements('unlocked')" class="auth-tab ${filter==='unlocked'?'auth-tab-active':''}">Открыто · ${totalUnlocked}</button>
            <button onclick="showAllAchievements('locked')" class="auth-tab ${filter==='locked'?'auth-tab-active':''}">Закрыто · ${totalAll - totalUnlocked}</button>
          </div>
          ${cats.map(c => {
            const items = grouped[c] || [];
            if (items.length === 0) return '';
            return `
              <div class="section-head" style="margin-top:10px;">
                <div class="left"><div class="rule"></div><span class="title">${ACH_CAT_LABEL[c] || c}</span></div>
                <span class="meta">${items.filter(a => unlocked.includes(a.id)).length}/${items.length}</span>
              </div>
              <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:14px;">
                ${items.map(a => {
                  const got = unlocked.includes(a.id);
                  const style = got
                    ? 'background: linear-gradient(140deg, var(--gold), var(--coral)); color:white; box-shadow: 0 4px 12px -4px rgba(224,118,134,.45);'
                    : 'background: var(--cream); color:var(--hush); border:1px dashed var(--line); filter: grayscale(.5);';
                  return `<div onclick="showAchievementDetail('${a.id}')" style="aspect-ratio:1; ${style} border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; padding:6px; text-align:center;">
                    <div style="font-size:24px; line-height:1;">${a.icon}</div>
                    <div style="font-size:8.5px; font-weight:600; margin-top:3px; line-height:1.1; opacity:${got?1:.7};">${a.title}</div>
                  </div>`;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    const old = document.getElementById('ach-modal');
    if (old) old.replaceWith(m); else document.body.appendChild(m);
  }
  function showAchievementDetail(id) {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (!a) return;
    const got = isUnlocked(id);
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.onclick = e => { if (e.target === m) m.remove(); };
    let progress = '';
    // Show progress hint for measurable achievements
    const s = stats;
    const pieces = {
      'streak-': () => `${s.daysEntered} / ${a.id.split('-')[1]} дней`,
      'time-':   () => `${s.minutesSpent} / ${a.id.split('-')[1]} минут`,
      'lesson-': () => `${s.lessons} / ${a.id.split('-')[1]} уроков`,
      'games-':  () => a.id === 'games-all' ? `${['flashcards','match','memory','listen','translate','build','numbers','sentence','kpop'].filter(g => (s.gamePlays||{})[g] >= 1).length} / 9 игр запущено` : `${totalGamePlays(s)} / ${a.id.split('-')[1]}`,
      'vocab-':  () => `${s.words} / ${a.id.split('-')[1]} слов`,
      'hangul-tap-':   () => `${s.hangulSyllables} / ${a.id.replace('hangul-tap-','')} слогов`,
      'hangul-saved-': () => `${s.hangulSaved} / ${a.id.replace('hangul-saved-','')} сохранено`,
      'level-':  () => `Уровень ${getLevel(s.xp)} / ${a.id.split('-')[1]}`
    };
    const prefixHit = Object.keys(pieces).find(p => a.id.startsWith(p));
    if (!got && prefixHit) progress = pieces[prefixHit]();
    m.innerHTML = `
      <div class="modal-card" style="max-width: 340px; text-align:center;">
        <div style="font-size:64px; line-height:1;">${a.icon}</div>
        <div class="display" style="font-size:22px; color:var(--berry); margin-top:8px;">${a.title}</div>
        <div style="font-size:13px; color:var(--soft); margin-top:6px; line-height:1.45;">${a.desc}</div>
        ${a.xp > 0 ? `<div class="chip chip-gold" style="margin-top:12px;">+${a.xp} XP</div>` : ''}
        <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--line);">
          ${got
            ? `<div style="color:var(--sage); font-weight:600; font-size:13px;">✓ Открыто</div>`
            : progress
              ? `<div style="font-size:11px; letter-spacing:.16em; color:var(--coral); font-weight:600;">ПРОГРЕСС</div><div style="font-size:14px; color:var(--berry); margin-top:4px; font-weight:600;">${progress}</div>`
              : `<div style="color:var(--hush); font-size:13px; font-style:italic;">🔒 Закрыто</div>`
          }
        </div>
        <button onclick="this.closest('.modal-bg').remove()" class="btn btn-primary btn-block" style="margin-top:16px;">Понятно ✓</button>
      </div>
    `;
    document.body.appendChild(m);
  }
  function updateHomeDateLine() {
    const el = document.getElementById('home-date-line');
    if (!el) return;
    const now = new Date();
    const wd = weekdaysRuLong[now.getDay()];
    const cap = wd.charAt(0).toUpperCase() + wd.slice(1);
    el.textContent = `${cap}, ${now.getDate()} ${monthsRu[now.getMonth()].toLowerCase()}`;
  }
  function syncStats() {
    updateHomeDateLine();
    buildStreakCal();
    const xp = document.getElementById('xp-value');
    const st = document.getElementById('streak-value');
    const sxp = document.getElementById('stat-xp');
    const sw = document.getElementById('stat-words');
    const sl = document.getElementById('stat-lessons');
    const lvl = document.getElementById('games-level');
    const sideXp = document.getElementById('side-xp');
    const sideStreak = document.getElementById('side-streak');
    const sideLevel = document.getElementById('side-level');
    if (xp) xp.textContent = stats.xp;
    if (st) st.textContent = stats.streak;
    if (sxp) sxp.textContent = stats.xp;
    if (sw)  sw.textContent  = stats.words;
    if (sl)  sl.textContent  = stats.lessons;
    if (lvl) lvl.textContent = `Lvl ${getLevel(stats.xp)}`;
    if (sideXp)     sideXp.textContent     = stats.xp;
    if (sideStreak) sideStreak.textContent = stats.streak;
    if (sideLevel)  sideLevel.textContent  = getLevel(stats.xp);

    const curLvl = getLevel(stats.xp);
    const rank = getRank(curLvl);
    const prog = levelProgress(stats.xp);
    const remaining = Math.max(0, xpForLevel(curLvl + 1) - stats.xp);
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setText('profile-rank-emoji', rank.emoji);
    setText('profile-rank-label', rank.label);
    setText('profile-level-num', curLvl);
    setText('profile-xp-total', stats.xp);
    setText('profile-xp-next', `${remaining} XP до уровня ${curLvl + 1}`);
    const bar = document.getElementById('profile-xp-bar');
    if (bar) bar.style.width = Math.min(100, prog.pct) + '%';
    const chip = document.getElementById('profile-rank-chip');
    if (chip) chip.textContent = `${rank.emoji} ${rank.label}`;

    UStore.set('stats', stats);
    pushUserToCloud();
  }
  function addXp(n, label) {
    const prevLevel = getLevel(stats.xp);
    stats.xp += n;
    syncStats();
    if (label !== false) {
      const pop = document.createElement('div');
      pop.textContent = '+' + n + ' XP';
      pop.style.cssText = 'position:fixed; left:50%; top:80px; transform:translate(-50%, 0); background:linear-gradient(140deg, var(--gold), var(--coral)); color:white; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:700; z-index:700; box-shadow:0 6px 18px -6px rgba(224,118,134,.55); animation: xpPop 1.2s var(--ease-out) forwards; letter-spacing:.04em;';
      document.body.appendChild(pop);
      setTimeout(() => pop.remove(), 1200);
    }
    const newLevel = getLevel(stats.xp);
    if (newLevel > prevLevel) levelUpToast(newLevel);
  }

  // ── Level system ──
  function getLevel(xp) { return Math.floor(Math.sqrt(xp / 100)) + 1; }
  function xpForLevel(l) { return (l - 1) ** 2 * 100; }
  const RANKS = [
    { min: 1,  emoji: '🌱', label: 'Начинающая',  ko: '입문',   desc: 'Первые шаги в корейском' },
    { min: 3,  emoji: '🌸', label: 'Подмастерье', ko: '학생',   desc: 'Знакомишься с хангылем' },
    { min: 5,  emoji: '🌺', label: 'Ученица',     ko: '연수생', desc: 'Уверенно читаешь слоги' },
    { min: 8,  emoji: '🦋', label: 'Знаток',      ko: '고수',   desc: 'Понимаешь базовые фразы' },
    { min: 13, emoji: '🌟', label: 'Мастер',      ko: '사범',   desc: 'Свободно говоришь о повседневном' },
    { min: 19, emoji: '👑', label: 'Сэнсэй',      ko: '사부',   desc: 'Тебе можно учить других' }
  ];
  function getRank(level) {
    let r = RANKS[0];
    for (const x of RANKS) if (level >= x.min) r = x;
    return r;
  }
  function showRanksList() {
    const lvl = getLevel(stats.xp);
    const cur = getRank(lvl);
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div>
            <div class="page-eyebrow">РАНГИ</div>
            <div class="display" style="font-size:20px; color:var(--berry);">Путь ученицы 🌸</div>
          </div>
          <div onclick="this.closest('.modal-bg').remove()" style="font-size:24px; line-height:1; color:var(--soft); cursor:pointer; padding:4px;">×</div>
        </div>
        <div style="display:grid; gap:10px;">
          ${RANKS.map((r, i) => {
            const next = RANKS[i + 1];
            const range = next ? `${r.min}–${next.min - 1}` : `${r.min}+`;
            const reached = lvl >= r.min;
            const isCur = r === cur;
            return `
              <div style="display:flex; gap:12px; align-items:center; padding:12px; border-radius:14px;
                background:${isCur ? 'linear-gradient(135deg, var(--blush), var(--rose))' : reached ? 'var(--paper)' : 'rgba(92,42,51,.04)'};
                border:1px solid ${isCur ? 'var(--coral)' : 'var(--line)'};
                opacity:${reached ? 1 : 0.55};">
                <div style="font-size:28px;">${r.emoji}</div>
                <div style="flex:1; min-width:0;">
                  <div style="display:flex; gap:6px; align-items:baseline;">
                    <span style="font-weight:600; color:var(--berry); font-size:14px;">${r.label}</span>
                    <span class="ko" style="font-size:11px; color:var(--coral);">${r.ko}</span>
                    ${isCur ? '<span class="chip chip-coral" style="font-size:9px; padding:2px 8px;">ТЫ ЗДЕСЬ</span>' : ''}
                  </div>
                  <div style="font-size:11px; color:var(--soft); margin-top:2px;">${r.desc}</div>
                  <div style="font-size:10px; color:var(--hush); margin-top:3px; letter-spacing:.04em;">УРОВНИ ${range}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(m);
  }
  function levelProgress(xp) {
    const l = getLevel(xp);
    const start = xpForLevel(l);
    const next = xpForLevel(l + 1);
    return { level: l, inLevel: xp - start, span: next - start, pct: ((xp - start) / (next - start)) * 100 };
  }
  function levelUpToast(level) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed; left:50%; top:50%; transform:translate(-50%, -50%); background:linear-gradient(140deg, var(--gold), var(--coral)); color:white; padding:18px 28px; border-radius:24px; z-index:800; box-shadow:var(--shadow-lg); text-align:center; animation: xpPop 2.6s var(--ease-out) forwards;';
    el.innerHTML = `<div style="font-size:11px; letter-spacing:.2em; opacity:.85;">УРОВЕНЬ</div><div style="font-size:48px; font-weight:800; line-height:1;">${level}</div><div style="font-size:13px; margin-top:4px;">🌸 Поздравляем!</div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  // ── Best score tracker ──
  const Best = {
    get(k) { return UStore.get('bestScores', {})[k] || null; },
    save(k, score, total) {
      const all = UStore.get('bestScores', {});
      const prev = all[k];
      const ratio = score / total;
      const isNew = !prev || ratio > (prev.score / prev.total);
      if (isNew) {
        all[k] = { score, total, date: Date.now() };
        UStore.set('bestScores', all);
      }
      return isNew;
    }
  };

  function syncBestScoreCards() {
    document.querySelectorAll('[data-game-key]').forEach(el => {
      const key = el.dataset.gameKey;
      const best = Best.get(key);
      const slot = el.querySelector('.best-score');
      if (slot) slot.textContent = best ? `🏆 ${best.score}/${best.total}` : 'Ещё не играли';
    });
  }

  // ── Hardcoded admins (только эти 2 могут попасть в админ-панель) ──
  // Local seed — kept as a fallback if Firebase is unreachable. Once the cloud
  // copy at shared/admins is populated, getAdminsList() returns that instead.
  const ADMINS = [
    { name: 'madina',  password: 'mdna2233', email: 'madina@madie.local' },
    { name: 'madina2', password: 'mdna2233', email: 'madina2@madie.local' }
  ];
  let _cloudAdmins = null; // populated when shared/admins listener fires
  function getAdminsList() {
    if (_cloudAdmins && typeof _cloudAdmins === 'object') {
      return Object.values(_cloudAdmins).filter(a => a && a.name && a.password);
    }
    return ADMINS;
  }
  function getReservedNames() {
    return getAdminsList().map(a => (a.name || '').toLowerCase());
  }
  function attachAdminsListener() {
    if (typeof _db === 'undefined') return;
    _db.ref('shared/admins').on('value', snap => {
      const v = snap.val();
      if (v === null || v === undefined) {
        // First run on this DB — seed with the local list so it stays editable in Firebase console
        const seed = {};
        ADMINS.forEach(a => { seed[a.name.toLowerCase()] = a; });
        _db.ref('shared/admins').set(seed).catch(e => console.warn('seed admins failed', e));
        _cloudAdmins = seed;
      } else {
        _cloudAdmins = v;
      }
    });
  }
  // Backwards compat — RESERVED_NAMES used elsewhere; keep it as a live getter
  const RESERVED_NAMES = new Proxy([], {
    get(_t, p) {
      const arr = getReservedNames();
      const v = arr[p];
      return typeof v === 'function' ? v.bind(arr) : v;
    }
  });

  // ── Custom content (admin-added) ──
  function getKpopAll() { return [...kpopData, ...Store.get('customKpop', [])]; }
  function getFlashcardsAll() { return flashcardSession.length ? flashcardSession : buildFlashcards(); }
  function ytIdFromUrl(url) {
    if (!url) return null;
    url = String(url).trim();
    // ?v= или &v= в любом месте ссылки (watch?v=, watch?app=desktop&v= и т.п.)
    let m = url.match(/[?&]v=([\w-]{11})/);
    if (m) return m[1];
    // короткие и path-ссылки: youtu.be/, /embed/, /shorts/, /live/, /v/
    m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed|shorts|live|v)\/)([\w-]{11})/);
    if (m) return m[1];
    // голый 11-символьный ID, вставленный целиком
    if (/^[\w-]{11}$/.test(url)) return url;
    return null;
  }
  function videoCardHtml(v) {
    const url = normalizeMediaUrl(v.url);
    const yid = ytIdFromUrl(url);
    const gid = !yid ? gdriveIdFromUrl(url) : null;
    const isFile = !yid && !gid && isDirectVideoUrl(url);
    const thumb = yid ? `https://img.youtube.com/vi/${yid}/hqdefault.jpg` : '';
    let media;
    if (yid) {
      media = `<div class="video-player-slot" style="position:relative; aspect-ratio:16/9; background:#000;" onclick="playCustomVideo('youtube','${yid}', this)">
        <img src="${thumb}" style="width:100%; height:100%; object-fit:cover;" alt="">
        <div style="position:absolute; inset:0; background:linear-gradient(180deg, transparent 50%, rgba(0,0,0,.6)); display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <div style="width:54px; height:54px; border-radius:50%; background:var(--grad-coral); color:white; display:flex; align-items:center; justify-content:center; box-shadow: var(--shadow-lg); font-size:18px;"><i class="fa-solid fa-play"></i></div>
        </div>
      </div>`;
    } else if (gid) {
      media = `<div class="video-player-slot" style="position:relative; aspect-ratio:16/9; background:#000;" onclick="playCustomVideo('gdrive','${gid}', this)">
        <div style="position:absolute; inset:0; background:linear-gradient(140deg, var(--berry), var(--coral)); display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <div style="width:54px; height:54px; border-radius:50%; background:white; color:var(--coral); display:flex; align-items:center; justify-content:center; box-shadow: var(--shadow-lg); font-size:18px;"><i class="fa-solid fa-play"></i></div>
        </div>
        <div style="position:absolute; bottom:8px; right:10px; font-size:10px; color:rgba(255,255,255,.7);">Google Drive</div>
      </div>`;
    } else if (isFile) {
      media = `<div style="aspect-ratio:16/9; background:#000;">
        <video src="${url}" controls preload="metadata" style="width:100%; height:100%; object-fit:contain; background:#000; display:block;"></video>
      </div>`;
    } else {
      media = `<div class="placeholder-img" style="height:120px; border-radius:0;">[ некорректная ссылка ]</div>`;
    }
    return `
      <div class="feed-card" style="padding:0; overflow:hidden;">
        ${media}
        <div style="padding:14px 16px;">
          <span class="chip chip-coral">🎬 ВИДЕО</span>
          <div style="font-weight:600; color:var(--berry); margin-top:8px; font-size:15px; line-height:1.3;">${v.title}</div>
          ${v.description ? `<div style="font-size:12.5px; color:var(--soft); margin-top:4px; line-height:1.45;">${v.description}</div>` : ''}
          ${yid ? `<a href="https://www.youtube.com/watch?v=${yid}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:5px; margin-top:10px; font-size:11.5px; color:var(--coral); font-weight:600; text-decoration:none;">▶ Смотреть на YouTube ↗</a>` : ''}
        </div>
      </div>`;
  }
  function renderCustomVideos() {
    const slot = document.getElementById('custom-videos');
    if (!slot) return;
    const videos = Store.get('customVideos', []).slice().sort((a, b) => (b.date || 0) - (a.date || 0));
    if (videos.length === 0) { slot.innerHTML = ''; return; }
    const total = videos.length;
    let shown, footer = '';
    if (!videoShowAll) {
      shown = videos.slice(0, 2);
      if (total > 2) footer = `<button onclick="showAllVideos()" class="btn btn-ghost btn-block" style="margin-top:12px;">Посмотреть все видео (${total}) →</button>`;
    } else {
      const pages = Math.ceil(total / VIDEOS_PER_PAGE);
      if (videoPage > pages - 1) videoPage = pages - 1;
      if (videoPage < 0) videoPage = 0;
      const start = videoPage * VIDEOS_PER_PAGE;
      shown = videos.slice(start, start + VIDEOS_PER_PAGE);
      footer = `<div style="display:grid; gap:8px; margin-top:12px;">${pageNavHtml(videoPage, pages, 'gotoVideoPage')}<button onclick="collapseVideos()" class="btn btn-ghost btn-block">↑ Свернуть</button></div>`;
    }
    slot.innerHTML = `
      <div class="section-head" style="margin-top:8px;">
        <div class="left"><div class="rule"></div><span class="title">Видео от Мади</span></div>
        <span class="meta">${total} видео</span>
      </div>
      <div style="display:grid; gap:14px;">${shown.map(videoCardHtml).join('')}</div>
      ${footer}
    `;
  }
  function playCustomVideo(kind, src, slotEl) {
    if (!slotEl) return;
    if (kind === 'youtube') {
      slotEl.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${src}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="border:0;"></iframe>`;
    } else if (kind === 'gdrive') {
      slotEl.innerHTML = `<iframe width="100%" height="100%" src="https://drive.google.com/file/d/${src}/preview" frameborder="0" allow="autoplay" allowfullscreen style="border:0;"></iframe>`;
    } else {
      slotEl.innerHTML = `<video src="${src}" controls autoplay style="width:100%; height:100%; object-fit:contain; background:#000;"></video>`;
    }
    slotEl.onclick = null;
  }
  function renderCustomLessons() {
    const slot = document.getElementById('custom-lessons');
    if (!slot) return;
    const lessons = Store.get('customLessons', []);
    if (lessons.length === 0) { slot.innerHTML = ''; return; }
    slot.innerHTML = `
      <div class="section-head" style="margin-top:8px;">
        <div class="left"><div class="rule"></div><span class="title">Уроки от Мади</span></div>
        <span class="meta">${lessons.length} новых</span>
      </div>
      <div style="display:grid; gap:10px;">
        ${lessons.map((l, i) => `
          <div onclick="showCustomLesson(${i})" class="card card-press card-padded" style="cursor:pointer;">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
              <div style="flex:1; min-width:0;">
                <span class="chip chip-gold">📖 НОВЫЙ УРОК</span>
                <div style="font-weight:600; color:var(--berry); font-size:14px; margin-top:8px;">${l.title}</div>
                ${l.koPhrase ? `<div class="ko" style="font-size:13px; color:var(--coral); margin-top:4px; font-weight:600;">${l.koPhrase}</div>` : ''}
                ${l.ru ? `<div style="font-size:11.5px; color:var(--soft); margin-top:2px; font-style:italic;">${l.ru}</div>` : ''}
              </div>
              <i class="fa-solid fa-arrow-right" style="color:var(--coral); margin-top:4px;"></i>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  function showCustomLesson(i) {
    const lessons = Store.get('customLessons', []);
    const l = lessons[i];
    if (!l) return;
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-card" style="max-width:400px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div>
            <div class="page-eyebrow">УРОК ОТ МАДИ</div>
            <div class="display" style="font-size: 22px; color: var(--berry); margin-top: 4px; line-height:1.2;">${l.title}</div>
          </div>
          <div onclick="this.closest('.modal-bg').remove()" style="font-size:24px; color:var(--soft); cursor:pointer;">×</div>
        </div>
        ${l.koPhrase ? `<div class="hangul-display" style="padding:24px 16px;"><div class="ko" style="font-size:38px; font-weight:700; color:var(--berry); line-height:1.1;">${l.koPhrase}</div>${l.ru ? `<div style="color:var(--coral); margin-top:8px; font-size:14px;">«${l.ru}»</div>` : ''}<button onclick="playSyllable('${l.koPhrase.replace(/'/g, "\\'")}', this)" class="btn btn-ghost" style="margin-top:14px;"><i class="fa-solid fa-volume-up"></i> Произнести</button></div>` : ''}
        ${l.vocab ? `<div class="ko-quote" style="margin-top:16px;"><div style="font-size:11px; letter-spacing:.16em; color:var(--coral); font-weight:600; margin-bottom:6px;">СЛОВАРЬ</div><div style="font-size:13px; color:var(--berry); line-height:1.6;">${l.vocab}</div></div>` : ''}
        <button onclick="this.closest('.modal-bg').remove()" class="btn btn-primary btn-block" style="margin-top:16px;">Понятно ✓</button>
      </div>
    `;
    document.body.appendChild(m);
  }

  // ── Admin: edit mode state ──
  let adminEditCtx = null; // { tab, index } when editing existing item

  function ensureAdminAccess() {
    const u = Store.get('user');
    if (!u || !u.isAdmin) { toast('Только для администратора 🔐'); return false; }
    return true;
  }
  function isAdmin() { const u = Store.get('user'); return !!(u && u.isAdmin); }
  function escAttrSafe(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

  // Inline admin panel rendered into the profile screen (replaces the old modal)
  let adminCurrentTab = 'flashcards';
  function renderProfileAdminPanel(tab) {
    if (!isAdmin()) return;
    const slot = document.getElementById('profile-admin-settings');
    if (!slot) return;
    tab = tab || adminCurrentTab || 'flashcards';
    if (adminEditCtx && adminEditCtx.tab !== tab) adminEditCtx = null;
    adminCurrentTab = tab;
    const tabs = ['flashcards','kpop','video','lesson','feed','users'];
    const labels = { flashcards:'📚 Слова', kpop:'🎵 K-Pop', video:'🎬 Видео', lesson:'📖 Уроки', feed:'📰 Лента', users:'👥 Ученики' };
    let body = '';
    if (tab === 'flashcards') body = renderAdminFlashcards();
    else if (tab === 'kpop')  body = renderAdminKpop();
    else if (tab === 'video') body = renderAdminVideo();
    else if (tab === 'lesson') body = renderAdminLesson();
    else if (tab === 'feed')  body = renderAdminFeed();
    else if (tab === 'users') body = renderAdminUsers();
    slot.innerHTML = `
      <div style="margin-bottom: 14px;">
        <div class="page-eyebrow">АДМИН-ПАНЕЛЬ</div>
        <div class="display" style="font-size:20px; color:var(--berry); margin-top: 2px;">Контент Мади</div>
      </div>
      <div style="background: linear-gradient(135deg, rgba(247,205,210,.45), rgba(201,165,92,.18)); border-radius: 14px; padding: 10px 12px; font-size: 11px; line-height: 1.5; color: var(--berry); margin-bottom: 14px;">
        <strong>☁️ Облачная синхронизация.</strong> Контент автоматически появляется у всех учеников через Firebase. <strong>Экспорт/Импорт</strong> — для резервной копии.
      </div>
      <div style="display:flex; gap:8px; margin-bottom:14px;">
        <button onclick="adminExportAll()" class="btn btn-ghost" style="flex:1; padding:8px 10px; font-size:11.5px;"><i class="fa-solid fa-download"></i> Экспорт</button>
        <label class="btn btn-ghost" style="flex:1; padding:8px 10px; font-size:11.5px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
          <i class="fa-solid fa-upload"></i> Импорт
          <input type="file" accept="application/json,.json" onchange="adminImportAll(event)" style="display:none;">
        </label>
      </div>
      <div class="auth-tabs" style="margin-bottom:18px; flex-wrap:wrap;">
        ${tabs.map(t => `<button onclick="adminEditCtx=null; renderProfileAdminPanel('${t}')" class="auth-tab ${t===tab?'auth-tab-active':''}" style="font-size:11px; padding:9px 4px; min-width:0; flex:1 0 calc(33% - 4px);">${labels[t]}</button>`).join('')}
      </div>
      ${body}
    `;
  }
  // Back-compat: keep showAdminPanel for legacy callers — redirect to inline view.
  // Only switches screen / scrolls if not already viewing the profile (so post-CRUD
  // re-renders don't yank the admin back to the top of the panel).
  function showAdminPanel(tab) {
    if (!ensureAdminAccess()) return;
    const onProfile = document.getElementById('screen-profile')?.classList.contains('active');
    if (!onProfile) switchScreen('profile');
    renderProfileAdminPanel(tab || 'flashcards');
    if (!onProfile) {
      setTimeout(() => {
        const el = document.getElementById('profile-admin-settings');
        if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
      }, 80);
    }
  }

  // ── Admin: Export / Import all custom content ──
  function adminExportAll() {
    if (!ensureAdminAccess()) return;
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      exportedBy: (Store.get('user') || {}).name || 'admin',
      customFlashcards: Store.get('customFlashcards', []),
      customKpop:        Store.get('customKpop', []),
      customVideos:      Store.get('customVideos', []),
      customLessons:     Store.get('customLessons', []),
      customFeedPosts:   Store.get('customFeedPosts', [])
    };
    const total = data.customFlashcards.length + data.customKpop.length + data.customVideos.length + data.customLessons.length + data.customFeedPosts.length;
    if (total === 0) { toast('Пока нечего экспортировать 🌸'); return; }
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `madie-content-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast(`Экспортировано ${total} записей 📥`, 'var(--sage)');
    } catch (e) {
      toast('Не удалось экспортировать');
    }
  }
  function adminImportAll(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = ''; // reset for re-uploads
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || data.version == null) { toast('Неверный формат файла'); return; }
        const keys = ['customFlashcards','customKpop','customVideos','customLessons','customFeedPosts'];
        let added = 0, skipped = 0;
        keys.forEach(k => {
          if (!Array.isArray(data[k])) return;
          const existing = Store.get(k, []);
          const seen = new Set(existing.map(it => JSON.stringify(it)));
          const merged = existing.slice();
          data[k].forEach(item => {
            const key = JSON.stringify(item);
            if (seen.has(key)) { skipped++; return; }
            merged.push(item);
            seen.add(key);
            added++;
          });
          Store.set(k, merged);
        });
        // Refresh all consumers
        renderCustomFeedPosts();
        renderCustomVideos();
        renderCustomLessons();
        renderLessonPath();
        renderHeroLesson();
        toast(`Импорт: +${added} новых · ${skipped} уже было 🌸`, 'var(--sage)');
        // Refresh admin panel current tab
        showAdminPanel(adminCurrentTab || 'flashcards');
      } catch (err) {
        toast('Ошибка чтения файла. Проверь формат');
      }
    };
    reader.readAsText(file, 'utf-8');
  }
  function adminEditStart(tab, index) {
    adminEditCtx = { tab, index };
    showAdminPanel(tab);
    setTimeout(() => {
      const form = document.querySelector('.admin-form');
      if (form) form.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 50);
  }
  function adminEditCancel() {
    adminEditCtx = null;
    renderProfileAdminPanel(adminCurrentTab || 'flashcards');
  }
  function adminEntryList(items, fmt, editFn, removeFn) {
    if (!items.length) return '<div style="text-align:center; font-size:12px; color:var(--soft); font-style:italic; padding:14px 0;">Пока ничего не добавлено</div>';
    return `<div style="display:grid; gap:6px; max-height:200px; overflow-y:auto; padding:2px;">
      ${items.map((it, i) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--paper); border-radius:10px; gap:8px;">
          <div style="flex:1; min-width:0; font-size:12.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${fmt(it)}</div>
          <button onclick="${editFn}(${i})" style="background:none; border:none; color:var(--coral); cursor:pointer; font-size:13px; padding:4px;" title="Изменить"><i class="fa-solid fa-pen-to-square"></i></button>
          <button onclick="${removeFn}(${i})" style="background:none; border:none; color:#B33A4A; cursor:pointer; font-size:14px; padding:4px;" title="Удалить">✕</button>
        </div>
      `).join('')}
    </div>`;
  }
  function adminFormHeader(isEditing, addLabel, editLabel) {
    if (!isEditing) return '';
    return `<div style="display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--gold), var(--coral)); color:white; padding:8px 14px; border-radius:12px; margin-bottom:10px;">
      <span style="font-size:11.5px; font-weight:600;">✏️ ${editLabel}</span>
      <button onclick="adminEditCtx=null; showAdminPanel('${adminEditCtx.tab}')" style="background:rgba(255,255,255,.25); border:none; color:white; cursor:pointer; padding:4px 10px; border-radius:999px; font-size:11px;">Отмена</button>
    </div>`;
  }

  // ── Flashcards ──
  function renderAdminFlashcards() {
    const customs = Store.get('customFlashcards', []);
    const editing = adminEditCtx && adminEditCtx.tab === 'flashcards' ? customs[adminEditCtx.index] : null;
    return `
      <div class="admin-form" style="display:grid; gap:10px;">
        ${adminFormHeader(!!editing, '+ Добавить карточку', 'Изменить карточку')}
        <input id="af-ko" class="input" placeholder="Корейское слово (안녕)" value="${escAttrSafe(editing?.front)}">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <input id="af-translit" class="input" placeholder="Транслит (annyeong)" value="${escAttrSafe(editing?.translit)}">
          <input id="af-emoji" class="input" placeholder="Эмодзи (🌸)" value="${escAttrSafe(editing?.emoji)}">
        </div>
        <input id="af-meaning" class="input" placeholder="Перевод (привет)" value="${escAttrSafe(editing?.meaning)}">
        <input id="af-example" class="input" placeholder="Пример: 안녕하세요 — Здравствуйте" value="${escAttrSafe(editing?.example)}">
        <button onclick="adminAddFlashcard()" class="btn btn-primary btn-block">${editing ? 'Сохранить изменения ✓' : '+ Добавить карточку'}</button>
      </div>
      <div class="section-head" style="margin-top:18px;"><div class="left"><div class="rule"></div><span class="title">Карточки (${customs.length})</span></div></div>
      ${adminEntryList(customs, c => `<span class="ko" style="font-weight:700; color:var(--berry);">${c.front}</span> · ${c.meaning}`, 'adminEditFlashcard', 'adminDelFlashcard')}
    `;
  }
  function adminAddFlashcard() {
    const ko = (document.getElementById('af-ko').value || '').trim();
    const translit = (document.getElementById('af-translit').value || '').trim();
    const emoji = (document.getElementById('af-emoji').value || '').trim() || '🌸';
    const meaning = (document.getElementById('af-meaning').value || '').trim();
    const example = (document.getElementById('af-example').value || '').trim();
    if (!ko || !meaning) { toast('Заполни корейское слово и перевод'); return; }
    const all = Store.get('customFlashcards', []);
    const item = { front: ko, translit, emoji, meaning, example };
    if (adminEditCtx && adminEditCtx.tab === 'flashcards') {
      all[adminEditCtx.index] = item;
      adminEditCtx = null;
      toast(`Карточка обновлена 🌸`, 'var(--sage)');
    } else {
      all.push(item);
      toast(`Карточка ${ko} добавлена 🌸`, 'var(--sage)');
    }
    Store.set('customFlashcards', all);
    showAdminPanel('flashcards');
  }
  function adminEditFlashcard(i) { adminEditStart('flashcards', i); }
  function adminDelFlashcard(i) {
    if (!confirm('Удалить эту карточку?')) return;
    const all = Store.get('customFlashcards', []);
    all.splice(i, 1);
    Store.set('customFlashcards', all);
    showAdminPanel('flashcards');
  }

  // ── K-Pop ──
  function renderAdminKpop() {
    const customs = Store.get('customKpop', []);
    const editing = adminEditCtx && adminEditCtx.tab === 'kpop' ? customs[adminEditCtx.index] : null;
    const optsValue = editing ? (editing.options || []).filter(o => o !== editing.blank).join(', ') : '';
    return `
      <div class="admin-form" style="display:grid; gap:10px;">
        ${adminFormHeader(!!editing, '', 'Изменить строку K-Pop')}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <input id="ak-artist" class="input" placeholder="Исполнитель (IU)" value="${escAttrSafe(editing?.artist)}">
          <input id="ak-song" class="input" placeholder="Песня" value="${escAttrSafe(editing?.song)}">
        </div>
        <input id="ak-line" class="input" placeholder="Строка с ___ (이 밤 그날의 ___)" value="${escAttrSafe(editing?.line)}">
        <input id="ak-blank" class="input" placeholder="Правильный ответ (반딧불을)" value="${escAttrSafe(editing?.blank)}">
        <input id="ak-options" class="input" placeholder="Неправильные через запятую: 별빛을, 꽃잎을, 햇살을" value="${escAttrSafe(optsValue)}">
        <input id="ak-translation" class="input" placeholder="Перевод строки" value="${escAttrSafe(editing?.translation)}">
        <button onclick="adminAddKpop()" class="btn btn-primary btn-block">${editing ? 'Сохранить ✓' : '+ Добавить строку'}</button>
      </div>
      <div class="section-head" style="margin-top:18px;"><div class="left"><div class="rule"></div><span class="title">K-Pop строки (${customs.length})</span></div></div>
      ${adminEntryList(customs, k => `${k.artist} · ${k.song}`, 'adminEditKpop', 'adminDelKpop')}
    `;
  }
  function adminAddKpop() {
    const artist = (document.getElementById('ak-artist').value || '').trim();
    const song   = (document.getElementById('ak-song').value || '').trim();
    const line   = (document.getElementById('ak-line').value || '').trim();
    const blank  = (document.getElementById('ak-blank').value || '').trim();
    const optsRaw= (document.getElementById('ak-options').value || '').trim();
    const translation = (document.getElementById('ak-translation').value || '').trim();
    if (!artist || !line || !blank || !optsRaw) { toast('Заполни обязательные поля'); return; }
    if (!line.includes('___')) { toast('В строке нужен пропуск ___'); return; }
    const wrong = optsRaw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
    const options = shuffleArr([blank, ...wrong]);
    const all = Store.get('customKpop', []);
    const item = { artist, song, line, blank, options, translation };
    if (adminEditCtx && adminEditCtx.tab === 'kpop') {
      all[adminEditCtx.index] = item;
      adminEditCtx = null;
      toast(`K-Pop строка обновлена 🎵`, 'var(--sage)');
    } else {
      all.push(item);
      toast(`Строка ${artist} добавлена 🎵`, 'var(--sage)');
    }
    Store.set('customKpop', all);
    showAdminPanel('kpop');
  }
  function adminEditKpop(i) { adminEditStart('kpop', i); }
  function adminDelKpop(i) {
    if (!confirm('Удалить эту K-Pop строку?')) return;
    const all = Store.get('customKpop', []);
    all.splice(i, 1);
    Store.set('customKpop', all);
    showAdminPanel('kpop');
  }

  // ── Video ──
  function renderAdminVideo() {
    const customs = Store.get('customVideos', []);
    const editing = adminEditCtx && adminEditCtx.tab === 'video' ? customs[adminEditCtx.index] : null;
    return `
      <div class="admin-form" style="display:grid; gap:10px;">
        ${adminFormHeader(!!editing, '', 'Изменить видео')}
        <input id="av-title" class="input" placeholder="Название (Урок: 안녕 vs 안녕하세요)" value="${escAttrSafe(editing?.title)}">
        <input id="av-url" class="input" placeholder="YouTube / Google Drive URL (или загрузи файл ↓)" value="${escAttrSafe(editing?.url)}">
        <label class="btn btn-ghost btn-block" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
          <i class="fa-solid fa-film"></i> <span id="av-file-label">Загрузить видео с устройства</span>
          <input type="file" accept="video/*" onchange="adminPickVideoFile(event)" style="display:none;">
        </label>
        <div id="av-upload-progress" style="display:none; font-size:12px; color:var(--soft); text-align:center;"></div>
        <textarea id="av-desc" class="input" rows="2" placeholder="Описание (кратко о чём)" style="resize:vertical;">${escAttrSafe(editing?.description)}</textarea>
        <button onclick="adminAddVideo()" class="btn btn-primary btn-block">${editing ? 'Сохранить ✓' : '+ Добавить видео'}</button>
      </div>
      <div class="section-head" style="margin-top:18px;"><div class="left"><div class="rule"></div><span class="title">Видео (${customs.length})</span></div></div>
      ${adminEntryList(customs, v => `🎬 ${v.title}`, 'adminEditVideo', 'adminDelVideo')}
    `;
  }
  async function adminPickVideoFile(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const label = document.getElementById('av-file-label');
    const progress = document.getElementById('av-upload-progress');
    if (file.size > 100 * 1024 * 1024) {
      toast('Файл больше 100 МБ — лучше залить на YouTube');
      return;
    }
    try {
      if (label) label.textContent = 'Загружаю...';
      if (progress) {
        progress.style.display = 'block';
        progress.textContent = 'Загрузка началась…';
      }
      const safeName = file.name.replace(/[^\w.\-]+/g, '_');
      const path = `videos/${Date.now()}_${safeName}`;
      const ref = _storage.ref(path);
      const task = ref.put(file);
      task.on('state_changed', snap => {
        if (progress) {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          progress.textContent = `Загрузка ${pct}%`;
        }
      });
      await task;
      const url = await ref.getDownloadURL();
      const input = document.getElementById('av-url');
      if (input) input.value = url;
      if (progress) progress.textContent = 'Готово ✓';
      if (label) label.textContent = 'Заменить видео';
      toast('Видео загружено 🎬', 'var(--sage)');
    } catch (e) {
      console.warn('video upload failed:', e);
      const why = e.code || e.message || 'неизвестно';
      if (progress) {
        progress.style.color = '#B33A4A';
        progress.textContent = 'Ошибка: ' + why;
      }
      if (label) label.textContent = 'Загрузить видео с устройства';
      toast('Не удалось загрузить: ' + why);
    }
  }
  function isDirectVideoUrl(url) {
    if (!url) return false;
    return /firebasestorage\.googleapis\.com|\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
  }
  // Старые ссылки, написанные как `v1.mp4` / `P1.jpg`, переписываем на новые пути,
  // потому что файлы переехали в assets/videos/ и assets/photos/. Сохранённые в Store
  // посты не трогаем — нормализуем «на лету» при отрисовке.
  const _MEDIA_REWRITE = {
    'v1.mp4': 'assets/videos/v1.mp4',
    'v2.mp4': 'assets/videos/v2.mp4',
    'v3.mp4': 'assets/videos/v3.mp4',
    'assets/v1.mp4': 'assets/videos/v1.mp4',
    'assets/v2.mp4': 'assets/videos/v2.mp4',
    'assets/v3.mp4': 'assets/videos/v3.mp4',
    'P1.jpg': 'assets/photos/P1.jpg',
    'P2.jpg': 'assets/photos/P2.jpg',
    'P3.jpg': 'assets/photos/P3.jpg',
    'P4.jpg': 'assets/photos/P4.jpg',
    'assets/P1.jpg': 'assets/photos/P1.jpg',
    'assets/P2.jpg': 'assets/photos/P2.jpg',
    'assets/P3.jpg': 'assets/photos/P3.jpg',
    'assets/P4.jpg': 'assets/photos/P4.jpg'
  };
  function normalizeMediaUrl(url) {
    if (!url) return url;
    const trimmed = String(url).trim().replace(/^\.\//, '');
    return _MEDIA_REWRITE[trimmed] || url;
  }
  function gdriveIdFromUrl(url) {
    if (!url) return null;
    const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{15,})/);
    return m ? m[1] : null;
  }
  function adminAddVideo() {
    const title = (document.getElementById('av-title').value || '').trim();
    const url   = (document.getElementById('av-url').value || '').trim();
    const description = (document.getElementById('av-desc').value || '').trim();
    if (!title || !url) { toast('Заполни название и URL (или загрузи файл)'); return; }
    if (!ytIdFromUrl(url) && !isDirectVideoUrl(url) && !gdriveIdFromUrl(url)) { toast('Нужна YouTube/Drive-ссылка или загруженный файл'); return; }
    const all = Store.get('customVideos', []);
    if (adminEditCtx && adminEditCtx.tab === 'video') {
      all[adminEditCtx.index] = { ...all[adminEditCtx.index], title, url, description };
      adminEditCtx = null;
      toast(`Видео обновлено 🎬`, 'var(--sage)');
    } else {
      all.unshift({ title, url, description, date: Date.now() });
      toast(`Видео «${title}» добавлено 🎬`, 'var(--sage)');
    }
    Store.set('customVideos', all);
    renderCustomVideos();
    showAdminPanel('video');
  }
  function adminEditVideo(i) { adminEditStart('video', i); }
  function adminDelVideo(i) {
    if (!confirm('Удалить это видео?')) return;
    const all = Store.get('customVideos', []);
    all.splice(i, 1);
    Store.set('customVideos', all);
    renderCustomVideos();
    showAdminPanel('video');
  }

  // ── Lesson ──
  function renderAdminLesson() {
    const customs = Store.get('customLessons', []);
    const editing = adminEditCtx && adminEditCtx.tab === 'lesson' ? customs[adminEditCtx.index] : null;
    return `
      <div class="admin-form" style="display:grid; gap:10px;">
        ${adminFormHeader(!!editing, '', 'Изменить урок')}
        <input id="al-title" class="input" placeholder="Заголовок (Приветствие в формальной речи)" value="${escAttrSafe(editing?.title)}">
        <input id="al-ko" class="input" placeholder="Ключевая фраза (안녕하세요)" value="${escAttrSafe(editing?.koPhrase)}">
        <input id="al-ru" class="input" placeholder="Перевод (Здравствуйте)" value="${escAttrSafe(editing?.ru)}">
        <textarea id="al-vocab" class="input" rows="3" placeholder="Словарь / комментарий" style="resize:vertical;">${escAttrSafe(editing?.vocab)}</textarea>
        <button onclick="adminAddLesson()" class="btn btn-primary btn-block">${editing ? 'Сохранить ✓' : '+ Добавить урок'}</button>
        <div style="font-size:10.5px; color:var(--soft); text-align:center; line-height:1.5;">Новые уроки добавляются в конец карты после стандартных 10. Ученики увидят их по мере прохождения предыдущих.</div>
      </div>
      <div class="section-head" style="margin-top:18px;"><div class="left"><div class="rule"></div><span class="title">Дополнительные уроки (${customs.length})</span></div></div>
      ${adminEntryList(customs, l => `📖 ${l.title}`, 'adminEditLesson', 'adminDelLesson')}
    `;
  }
  function adminAddLesson() {
    const title = (document.getElementById('al-title').value || '').trim();
    const koPhrase = (document.getElementById('al-ko').value || '').trim();
    const ru = (document.getElementById('al-ru').value || '').trim();
    const vocab = (document.getElementById('al-vocab').value || '').trim();
    if (!title) { toast('Заголовок обязателен'); return; }
    const all = Store.get('customLessons', []);
    if (adminEditCtx && adminEditCtx.tab === 'lesson') {
      all[adminEditCtx.index] = { ...all[adminEditCtx.index], title, koPhrase, ru, vocab };
      adminEditCtx = null;
      toast(`Урок обновлён 📖`, 'var(--sage)');
    } else {
      all.push({ title, koPhrase, ru, vocab, date: Date.now() });
      toast(`Урок «${title}» добавлен 📖`, 'var(--sage)');
    }
    Store.set('customLessons', all);
    renderCustomLessons();
    renderLessonPath();
    renderHeroLesson();
    showAdminPanel('lesson');
  }
  function adminEditLesson(i) { adminEditStart('lesson', i); }
  function adminDelLesson(i) {
    if (!confirm('Удалить этот урок?')) return;
    const all = Store.get('customLessons', []);
    all.splice(i, 1);
    Store.set('customLessons', all);
    renderCustomLessons();
    renderLessonPath();
    renderHeroLesson();
    showAdminPanel('lesson');
  }

  // ── Feed posts ──
  function renderAdminFeed() {
    const customs = Store.get('customFeedPosts', []);
    const editing = adminEditCtx && adminEditCtx.tab === 'feed' ? customs[adminEditCtx.index] : null;
    const types = [
      { v:'announcement', l:'📢 От Мади' },
      { v:'culture',      l:'🎎 Культура' },
      { v:'news',         l:'📰 Новости' }
    ];
    return `
      <div class="admin-form" style="display:grid; gap:10px;">
        ${adminFormHeader(!!editing, '', 'Изменить пост')}
        <select id="afp-type" class="input" style="font-family:inherit;">
          ${types.map(t => `<option value="${t.v}" ${editing && editing.type === t.v ? 'selected' : ''}>${t.l}</option>`).join('')}
        </select>
        <input id="afp-title" class="input" placeholder="Заголовок поста" value="${escAttrSafe(editing?.title)}">
        <textarea id="afp-body" class="input" rows="4" placeholder="Текст (можно с эмодзи и переносами строк)" style="resize:vertical;">${escAttrSafe(editing?.body)}</textarea>
        <input id="afp-image" class="input" placeholder="Ссылка на картинку (или загрузи файл ↓)" value="${escAttrSafe(editing?.image)}">
        <label class="btn btn-ghost btn-block" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
          <i class="fa-solid fa-image"></i> <span id="afp-image-label">Загрузить фото с устройства</span>
          <input type="file" accept="image/*" onchange="adminPickFeedImage(event)" style="display:none;">
        </label>
        <div id="afp-image-preview" style="display:${editing?.image ? 'block' : 'none'}; text-align:center;">
          ${editing?.image ? `<img src="${editing.image}" style="max-width:100%; max-height:180px; border-radius:12px; border:1px solid var(--line);">` : ''}
        </div>
        <input id="afp-video" class="input" placeholder="🎬 YouTube/Drive ссылка на видео (или загрузи файл ↓)" value="${escAttrSafe(editing?.video)}">
        <label class="btn btn-ghost btn-block" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
          <i class="fa-solid fa-film"></i> <span id="afp-video-label">${editing?.video ? 'Заменить видео' : 'Загрузить видео с устройства'}</span>
          <input type="file" accept="video/*" onchange="adminPickFeedVideo(event)" style="display:none;">
        </label>
        <div id="afp-video-progress" style="display:none; font-size:12px; color:var(--soft); text-align:center;"></div>
        <button onclick="adminAddFeedPost()" class="btn btn-primary btn-block">${editing ? 'Сохранить ✓' : '+ Опубликовать в ленту'}</button>
        <div style="font-size:10.5px; color:var(--soft); text-align:center; line-height:1.5;">Новые посты появятся вверху ленты на главной у всех учеников</div>
      </div>
      <div class="section-head" style="margin-top:18px;"><div class="left"><div class="rule"></div><span class="title">Посты в ленте (${customs.length})</span></div></div>
      ${adminEntryList(customs, p => `${p.type==='culture'?'🎎':p.type==='news'?'📰':'📢'} ${p.title || p.body?.slice(0, 40) || '(без заголовка)'}`, 'adminEditFeed', 'adminDelFeed')}
    `;
  }
  async function adminPickFeedImage(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const label = document.getElementById('afp-image-label');
    if (label) label.textContent = 'Сжимаю...';
    try {
      const dataUrl = await compressImageFile(file);
      const input = document.getElementById('afp-image');
      const preview = document.getElementById('afp-image-preview');
      if (input) input.value = dataUrl;
      if (preview) {
        preview.style.display = 'block';
        preview.innerHTML = `<img src="${dataUrl}" style="max-width:100%; max-height:180px; border-radius:12px; border:1px solid var(--line);">`;
      }
      if (label) label.textContent = 'Заменить фото';
      toast('Фото готово 🌸', 'var(--sage)');
    } catch (e) {
      if (label) label.textContent = 'Загрузить фото с устройства';
      toast('Не удалось обработать фото');
    }
  }
  // Pick a video file for a feed post — uploads to Firebase Storage and fills the URL input
  async function adminPickFeedVideo(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const label = document.getElementById('afp-video-label');
    const progress = document.getElementById('afp-video-progress');
    if (file.size > 100 * 1024 * 1024) {
      toast('Файл больше 100 МБ — лучше залить на YouTube');
      return;
    }
    try {
      if (label) label.textContent = 'Загружаю...';
      if (progress) { progress.style.display = 'block'; progress.textContent = 'Загрузка началась…'; }
      const safeName = file.name.replace(/[^\w.\-]+/g, '_');
      const path = `feed-videos/${Date.now()}_${safeName}`;
      const ref = _storage.ref(path);
      const task = ref.put(file);
      task.on('state_changed', snap => {
        if (progress) {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          progress.textContent = `Загрузка ${pct}%`;
        }
      });
      await task;
      const url = await ref.getDownloadURL();
      const input = document.getElementById('afp-video');
      if (input) input.value = url;
      if (progress) progress.textContent = 'Готово ✓';
      if (label) label.textContent = 'Заменить видео';
      toast('Видео загружено 🎬', 'var(--sage)');
    } catch (e) {
      console.warn('feed video upload failed:', e);
      const why = e.code || e.message || 'неизвестно';
      if (progress) {
        progress.style.color = '#B33A4A';
        progress.textContent = 'Ошибка: ' + why;
      }
      if (label) label.textContent = 'Загрузить видео с устройства';
      toast('Не удалось загрузить: ' + why);
    }
  }
  function adminAddFeedPost() {
    const type = document.getElementById('afp-type').value;
    const title = (document.getElementById('afp-title').value || '').trim();
    const body = (document.getElementById('afp-body').value || '').trim();
    const image = (document.getElementById('afp-image').value || '').trim();
    const video = (document.getElementById('afp-video')?.value || '').trim();
    if (!title && !body && !image && !video) { toast('Добавь хотя бы заголовок, текст, фото или видео'); return; }
    if (video && !ytIdFromUrl(video) && !isDirectVideoUrl(video) && !gdriveIdFromUrl(video)) {
      toast('Видео: нужна YouTube/Drive-ссылка или загруженный файл');
      return;
    }
    const all = Store.get('customFeedPosts', []);
    if (adminEditCtx && adminEditCtx.tab === 'feed') {
      all[adminEditCtx.index] = { ...all[adminEditCtx.index], type, title, body, image, video };
      // Preserve existing id; assign one if it was missing (legacy post)
      if (!all[adminEditCtx.index].id) {
        all[adminEditCtx.index].id = `p_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
      }
      adminEditCtx = null;
      toast(`Пост обновлён 📰`, 'var(--sage)');
    } else {
      const id = `p_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
      all.unshift({ id, type, title, body, image, video, date: Date.now() });
      toast(`Пост опубликован 🌸`, 'var(--sage)');
    }
    Store.set('customFeedPosts', all);
    renderCustomFeedPosts();
    showAdminPanel('feed');
  }
  function adminEditFeed(i) { adminEditStart('feed', i); }
  function adminDelFeed(i) {
    if (!confirm('Удалить этот пост?')) return;
    const all = Store.get('customFeedPosts', []);
    const removed = all[i];
    all.splice(i, 1);
    Store.set('customFeedPosts', all);
    // Best-effort cleanup of likes/comments for this post in the cloud
    if (removed && removed.id && typeof _db !== 'undefined') {
      _db.ref(`shared/feedLikes/${removed.id}`).remove().catch(() => {});
      _db.ref(`shared/feedComments/${removed.id}`).remove().catch(() => {});
    }
    renderCustomFeedPosts();
    showAdminPanel('feed');
  }

  // ── Admin: Students list ──
  let _adminUsersCache = {};
  function renderAdminUsers() {
    setTimeout(loadAdminUsers, 0);
    return `
      <div class="admin-form" style="display:grid; gap:10px;">
        <div style="background: linear-gradient(135deg, rgba(247,205,210,.45), rgba(201,165,92,.18)); border-radius: 14px; padding: 10px 12px; font-size: 11px; line-height: 1.5; color: var(--berry);">
          <strong>👥 Ученики</strong> синхронизируются автоматически. Видны те, кто хотя бы раз вошёл с этой версии (после подключения облака).
        </div>
        <input id="admin-users-search" class="input" placeholder="Поиск по имени или email" oninput="filterAdminUsers()" style="font-size:13px;">
        <div id="admin-users-summary" style="font-size:12px; color:var(--soft); padding: 0 4px;">Загружаю учеников…</div>
        <div id="admin-users-list" style="display:grid; gap:8px;"></div>
      </div>
    `;
  }
  async function loadAdminUsers() {
    const summary = document.getElementById('admin-users-summary');
    const list = document.getElementById('admin-users-list');
    if (!list) return;
    if (typeof _db === 'undefined') {
      if (summary) summary.textContent = 'Firebase не подключён';
      return;
    }
    try {
      const snap = await _db.ref('users').once('value');
      const data = snap.val() || {};
      _adminUsersCache = data;
      const arr = Object.entries(data).map(([uid, u]) => ({ uid, ...u }));
      arr.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
      if (summary) summary.textContent = `Всего учеников: ${arr.length}`;
      renderAdminUsersList(arr);
    } catch (e) {
      console.warn(e);
      if (summary) summary.textContent = 'Не удалось загрузить';
    }
  }
  function renderAdminUsersList(arr) {
    const list = document.getElementById('admin-users-list');
    if (!list) return;
    if (arr.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding: 24px 12px; color:var(--soft); font-size:12px;">Пока никого 🌸</div>`;
      return;
    }
    list.innerHTML = arr.map(u => {
      const xp = u.stats?.xp || 0;
      const lvl = getLevel(xp);
      const rank = getRank(lvl);
      const initial = (u.name || '?').charAt(0).toUpperCase();
      const avatar = u.avatar
        ? `<div style="width:46px; height:46px; border-radius:50%; background:url(${u.avatar}) center/cover no-repeat; flex-shrink:0; border:2px solid var(--rose);"></div>`
        : `<div style="width:46px; height:46px; border-radius:50%; background:var(--paper); flex-shrink:0; border:2px solid var(--rose); display:flex; align-items:center; justify-content:center; font-size:18px; color:var(--coral); font-weight:700;">${escAttrSafe(initial)}</div>`;
      return `
        <div onclick="showStudentDetail('${escAttrSafe(u.uid)}')" class="card card-press" style="display:flex; align-items:center; gap:12px; padding:10px 12px; cursor:pointer;">
          ${avatar}
          <div style="flex:1; min-width:0;">
            <div style="display:flex; gap:6px; align-items:baseline;">
              <span style="font-weight:600; color:var(--berry); font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escAttrSafe(u.name || 'Без имени')}</span>
              <span style="font-size:11px; color:var(--coral);">${rank.emoji} Lv ${lvl}</span>
            </div>
            <div style="font-size:11px; color:var(--soft); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escAttrSafe(u.email || 'без email')} · 🔥 ${u.stats?.streak || 0} · ${xp} XP</div>
            <div style="font-size:10px; color:var(--hush); margin-top:2px;">был ${relativeTime(u.lastSeen)}</div>
          </div>
          <i class="fa-solid fa-chevron-right" style="color:var(--coral); font-size:11px;"></i>
        </div>
      `;
    }).join('');
  }
  function filterAdminUsers() {
    const q = (document.getElementById('admin-users-search')?.value || '').toLowerCase().trim();
    const arr = Object.entries(_adminUsersCache).map(([uid, u]) => ({ uid, ...u }));
    arr.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
    const filtered = q
      ? arr.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
      : arr;
    const summary = document.getElementById('admin-users-summary');
    if (summary) summary.textContent = q ? `Найдено: ${filtered.length} из ${arr.length}` : `Всего учеников: ${arr.length}`;
    renderAdminUsersList(filtered);
  }
  function showStudentDetail(uid) {
    const u = _adminUsersCache[uid];
    if (!u) { toast('Не нашёл ученика'); return; }
    const xp = u.stats?.xp || 0;
    const lvl = getLevel(xp);
    const rank = getRank(lvl);
    const prog = levelProgress(xp);
    const initial = (u.name || '?').charAt(0).toUpperCase();
    const avatar = u.avatar
      ? `<div style="width:96px; height:96px; border-radius:50%; background:url(${u.avatar}) center/cover no-repeat; border:3px solid var(--rose); box-shadow: var(--shadow-md);"></div>`
      : `<div style="width:96px; height:96px; border-radius:50%; background:var(--paper); border:3px solid var(--rose); display:flex; align-items:center; justify-content:center; font-size:34px; color:var(--coral); font-weight:700; box-shadow: var(--shadow-md);">${escAttrSafe(initial)}</div>`;
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div class="page-eyebrow">УЧЕНИК</div>
          <div onclick="this.closest('.modal-bg').remove()" style="font-size:24px; line-height:1; color:var(--soft); cursor:pointer; padding:4px;">×</div>
        </div>
        <div style="text-align:center;">
          <div style="display:inline-block;">${avatar}</div>
          <div class="display" style="font-size:22px; color:var(--berry); margin-top:10px;">${escAttrSafe(u.name || 'Без имени')}</div>
          <div style="font-size:12px; color:var(--soft); margin-top:2px;">${escAttrSafe(u.email || 'без email')}</div>
          <span class="chip chip-blush" style="margin-top:8px;">${rank.emoji} ${rank.label} · Lv ${lvl}</span>
        </div>
        <div style="height:8px; background:var(--paper); border-radius:999px; overflow:hidden; margin-top:14px;">
          <div style="height:100%; width:${Math.min(100, prog.pct)}%; background:var(--grad-coral); border-radius:999px;"></div>
        </div>
        <div style="font-size:10.5px; color:var(--soft); margin-top:6px; text-align:center;">${xp} XP всего · до Lv ${lvl + 1} осталось ${Math.max(0, xpForLevel(lvl + 1) - xp)} XP</div>

        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px; margin-top:16px;">
          <div class="card card-padded" style="text-align:center; padding:10px;">
            <div class="display" style="font-size:18px; color:var(--coral);">🔥 ${u.stats?.streak || 0}</div>
            <div style="font-size:10px; color:var(--soft);">текущий стрик</div>
          </div>
          <div class="card card-padded" style="text-align:center; padding:10px;">
            <div class="display" style="font-size:18px; color:var(--berry);">${u.stats?.daysEntered || 0}</div>
            <div style="font-size:10px; color:var(--soft);">дней входа</div>
          </div>
          <div class="card card-padded" style="text-align:center; padding:10px;">
            <div class="display" style="font-size:18px; color:var(--berry);">${u.stats?.lessons || 0}</div>
            <div style="font-size:10px; color:var(--soft);">уроков</div>
          </div>
          <div class="card card-padded" style="text-align:center; padding:10px;">
            <div class="display" style="font-size:18px; color:var(--berry);">${u.stats?.words || 0}</div>
            <div style="font-size:10px; color:var(--soft);">слов</div>
          </div>
        </div>

        <div style="font-size:11px; color:var(--soft); margin-top:14px; line-height:1.6;">
          <div>📅 Зарегистрирован: ${u.joinedAt ? new Date(u.joinedAt).toLocaleDateString('ru-RU') : '—'}</div>
          <div>👁 Был онлайн: ${relativeTime(u.lastSeen)}</div>
        </div>

        <button onclick="adminDeleteStudent('${escAttrSafe(uid)}')" class="btn btn-ghost btn-block" style="margin-top:14px; color:#B33A4A; border-color:rgba(179,58,74,.25); font-size:12px;">
          <i class="fa-solid fa-trash"></i> Удалить ученика
        </button>
      </div>
    `;
    document.body.appendChild(m);
  }
  async function adminDeleteStudent(uid) {
    if (!ensureAdminAccess()) return;
    const u = _adminUsersCache[uid];
    if (!confirm(`Удалить ученика «${u?.name || uid}»? Профиль исчезнет из списка, но локальные данные на его устройстве останутся.`)) return;
    try {
      await _db.ref('users/' + uid).remove();
      delete _adminUsersCache[uid];
      document.querySelector('.modal-bg:last-of-type')?.remove();
      toast('Ученик удалён', 'var(--sage)');
      loadAdminUsers();
    } catch (e) {
      console.warn(e);
      toast('Не удалось удалить');
    }
  }

  // ── Auth ──
  function showAuthTab(which) {
    const lf = document.getElementById('form-login');
    const rf = document.getElementById('form-register');
    const lt = document.getElementById('tab-login');
    const rt = document.getElementById('tab-register');
    if (which === 'login') {
      lf.style.display = 'flex'; rf.style.display = 'none';
      lt.classList.add('auth-tab-active'); rt.classList.remove('auth-tab-active');
    } else {
      lf.style.display = 'none'; rf.style.display = 'flex';
      rt.classList.add('auth-tab-active'); lt.classList.remove('auth-tab-active');
    }
  }
  function setActiveUser(user) {
    detachUserListeners();
    Store.set('user', user);
    // Reload all per-user state from this user's namespace
    loadUserData();
    const un = document.getElementById('user-name');
    const pn = document.getElementById('profile-name');
    if (un) un.textContent = user.name;
    if (pn) pn.textContent = user.name;
    const auth = document.getElementById('auth-section');
    const content = document.getElementById('profile-content');
    if (auth) auth.style.display = 'none';
    if (content) content.style.display = 'block';
    const email = document.getElementById('profile-email');
    if (email) email.textContent = user.email || (user.guest ? 'гостевой режим' : 'без email');
    const adminBadge = document.getElementById('profile-admin-badge');
    if (adminBadge) adminBadge.style.display = user.isAdmin ? 'inline-flex' : 'none';
    setProfileAdminMode(!!user.isAdmin);
    recordDayEntered();
    attachUserListeners();
    // Re-render feed social bars so "liked by me" reflects the new identity
    refreshFeedSocial();
  }
  // Toggle the profile screen between student layout and inline admin panel
  function setProfileAdminMode(on) {
    const screen = document.getElementById('screen-profile');
    if (!screen) return;
    screen.classList.toggle('admin-mode', on);
    if (on) renderProfileAdminPanel();
    else {
      const slot = document.getElementById('profile-admin-settings');
      if (slot) slot.innerHTML = '';
    }
  }
  async function loginUser(forceName) {
    if (forceName) {
      setActiveUser({ name: forceName, guest: true });
      toast(`Привет, ${forceName} 🌸`, 'var(--sage)');
      return;
    }
    const name = (document.getElementById('li-name').value || '').trim();
    const pass = (document.getElementById('li-pass').value || '');
    if (!name) { toast('Введи email'); return; }
    if (!pass) { toast('Введи пароль'); return; }
    // 1. Admin path — look up against cloud (or local fallback) admins list
    const admin = getAdminsList().find(a =>
      (a.name || '').toLowerCase() === name.toLowerCase() ||
      (a.email || '').toLowerCase() === name.toLowerCase()
    );
    if (admin) {
      if (pass !== admin.password) { toast('Неверный пароль 🔐'); return; }
      const display = admin.name.charAt(0).toUpperCase() + admin.name.slice(1);
      setActiveUser({ name: display, email: admin.email, isAdmin: true });
      toast(`Добро пожаловать, ${display} 🌸`, 'var(--sage)');
      return;
    }
    // 2. Firebase Auth login (email + password)
    if (!name.includes('@')) { toast('Войди через email'); return; }
    try {
      const cred = await _auth.signInWithEmailAndPassword(name, pass);
      const display = cred.user.displayName || (cred.user.email || '').split('@')[0];
      setActiveUser({ name: display, email: cred.user.email, uid: cred.user.uid });
      toast(`С возвращением, ${display}! 🌸`, 'var(--sage)');
    } catch (e) {
      console.warn('login error:', e);
      const code = e.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        toast('Неверный email или пароль 🔐');
      } else if (code === 'auth/invalid-email') {
        toast('Некорректный email');
      } else if (code === 'auth/too-many-requests') {
        toast('Слишком много попыток, попробуй позже');
      } else if (code === 'auth/network-request-failed') {
        toast('Нет соединения с интернетом');
      } else {
        toast('Ошибка входа: ' + (e.message || code));
      }
    }
  }
  async function registerUser() {
    const name = (document.getElementById('rg-name').value || '').trim();
    const email = (document.getElementById('rg-email').value || '').trim();
    const pass = (document.getElementById('rg-pass').value || '');
    if (!name) { toast('Имя обязательно'); return; }
    if (RESERVED_NAMES.includes(name.toLowerCase())) { toast('Это имя зарезервировано 🔐'); return; }
    if (!email || !email.includes('@') || !email.includes('.')) { toast('Корректный email, пожалуйста'); return; }
    if (pass.length < 6) { toast('Пароль ≥ 6 символов'); return; }
    try {
      const cred = await _auth.createUserWithEmailAndPassword(email, pass);
      try { await cred.user.updateProfile({ displayName: name }); } catch (_) {}
      setActiveUser({ name, email: cred.user.email, uid: cred.user.uid });
      toast(`Аккаунт создан 🌸 Привет, ${name}!`, 'var(--sage)');
    } catch (e) {
      console.warn('register error:', e);
      const code = e.code || '';
      if (code === 'auth/email-already-in-use') {
        toast('Этот email уже зарегистрирован');
      } else if (code === 'auth/weak-password') {
        toast('Слабый пароль (≥ 6 символов)');
      } else if (code === 'auth/invalid-email') {
        toast('Некорректный email');
      } else if (code === 'auth/network-request-failed') {
        toast('Нет соединения с интернетом');
      } else if (code === 'auth/operation-not-allowed') {
        toast('Email-вход не включён в Firebase Console');
      } else {
        toast('Ошибка регистрации: ' + (e.message || code));
      }
    }
  }

  // ── Forgot password (через email) ──
  function showForgotPassword() {
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.id = 'forgot-prompt';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-card" style="max-width: 360px;">
        <div style="text-align:center;">
          <div style="font-size:38px;">📧</div>
          <div class="display" style="font-size: 22px; color: var(--berry); margin-top: 6px;">Восстановление пароля</div>
          <div style="font-size: 12px; color: var(--soft); margin-top: 4px;">Введи email от аккаунта — пришлём код для сброса</div>
        </div>
        <input id="fp-email" class="input" type="email" placeholder="email@example.com" style="margin-top:18px;">
        <div style="display:flex; gap:8px; margin-top:14px;">
          <button onclick="document.getElementById('forgot-prompt').remove()" class="btn btn-ghost" style="flex:1;">Отмена</button>
          <button onclick="forgotPasswordSendCode()" class="btn btn-primary" style="flex:1.5;">Отправить код</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    setTimeout(() => document.getElementById('fp-email')?.focus(), 100);
  }
  async function forgotPasswordSendCode() {
    const email = (document.getElementById('fp-email').value || '').trim();
    if (!email || !email.includes('@')) { toast('Введи корректный email'); return; }
    try {
      await _auth.sendPasswordResetEmail(email);
      document.getElementById('forgot-prompt')?.remove();
      toast(`📧 Письмо для сброса пароля отправлено на <strong>${email}</strong>. Проверь почту (и папку Спам).`, 'var(--sage)');
    } catch (e) {
      console.warn('reset error:', e);
      const code = e.code || '';
      if (code === 'auth/user-not-found') toast('Аккаунт с таким email не найден');
      else if (code === 'auth/invalid-email') toast('Некорректный email');
      else if (code === 'auth/network-request-failed') toast('Нет соединения с интернетом');
      else toast('Не удалось отправить письмо');
    }
  }
  function showResetForm() {
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.id = 'reset-prompt';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-card" style="max-width: 360px;">
        <div style="text-align:center;">
          <div style="font-size:38px;">🔐</div>
          <div class="display" style="font-size: 22px; color: var(--berry); margin-top: 6px;">Новый пароль</div>
          <div style="font-size: 12px; color: var(--soft); margin-top: 4px;">Введи код из письма и придумай новый пароль</div>
        </div>
        <input id="rs-code" class="input" placeholder="Код (4 цифры)" maxlength="4" inputmode="numeric" style="margin-top:18px; text-align:center; letter-spacing:.3em; font-family: ui-monospace, monospace;">
        <div class="pass-wrap" style="margin-top:10px;">
          <input id="rs-pass" class="input" type="password" placeholder="Новый пароль (≥4 символов)">
          <button type="button" class="pass-toggle" onclick="togglePass(this)" aria-label="Показать пароль" tabindex="-1"><i class="fa-solid fa-eye"></i></button>
        </div>
        <div style="display:flex; gap:8px; margin-top:14px;">
          <button onclick="document.getElementById('reset-prompt').remove()" class="btn btn-ghost" style="flex:1;">Отмена</button>
          <button onclick="resetPasswordSubmit()" class="btn btn-primary" style="flex:1.5;">Изменить пароль</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    setTimeout(() => document.getElementById('rs-code')?.focus(), 100);
  }
  function resetPasswordSubmit() {
    const session = Store.get('resetSession');
    if (!session) { toast('Сессия истекла. Повтори запрос'); document.getElementById('reset-prompt')?.remove(); return; }
    if (Date.now() - session.ts > 15 * 60 * 1000) { toast('Код устарел (>15 мин). Повтори запрос'); Store.del('resetSession'); document.getElementById('reset-prompt')?.remove(); return; }
    const code = (document.getElementById('rs-code').value || '').trim();
    const newPass = (document.getElementById('rs-pass').value || '');
    if (code !== session.code) { toast('Неверный код 🔐'); return; }
    if (newPass.length < 4) { toast('Пароль ≥ 4 символов'); return; }
    const users = Store.get('users', []);
    const idx = users.findIndex(u => u.email && u.email.toLowerCase() === session.email.toLowerCase());
    if (idx < 0) { toast('Пользователь не найден'); return; }
    users[idx].pass = newPass;
    Store.set('users', users);
    Store.del('resetSession');
    document.getElementById('reset-prompt')?.remove();
    toast('Пароль изменён 🌸 Войди с новым паролем', 'var(--sage)');
  }

  // ── Edit profile ──
  function escAttr(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function showEditProfile() {
    const user = Store.get('user');
    if (!user) return;
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.id = 'edit-profile';
    m.onclick = e => { if (e.target === m) m.remove(); };
    const isAdmin = !!user.isAdmin;
    m.innerHTML = `
      <div class="modal-card" style="max-width: 380px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div>
            <div class="page-eyebrow">РЕДАКТИРОВАНИЕ</div>
            <div class="display" style="font-size: 20px; color: var(--berry); margin-top: 4px;">Мои данные</div>
          </div>
          <div onclick="this.closest('.modal-bg').remove()" style="font-size:24px; color:var(--soft); cursor:pointer; padding:4px;">×</div>
        </div>
        <div style="text-align:center; margin-bottom:18px;">
          <div style="position:relative; width:84px; height:84px; margin: 0 auto;">
            <div id="ep-avatar-preview" class="placeholder-img" style="width:84px; height:84px; border-radius:50%; border:2px solid var(--rose); font-size:26px;">${escAttr(user.name).charAt(0).toUpperCase()}</div>
            <button onclick="document.getElementById('ep-avatar-file').click()" style="position:absolute; bottom:-2px; right:-2px; width:30px; height:30px; background:var(--grad-coral); border:2px solid white; border-radius:50%; color:white; font-size:11px; cursor:pointer;"><i class="fa-solid fa-camera"></i></button>
            <input type="file" accept="image/*" id="ep-avatar-file" style="display:none;" onchange="changeAvatar(event)">
          </div>
          <div style="font-size:10.5px; color:var(--soft); margin-top:8px;">Тапни 📷, чтобы поменять фото</div>
        </div>
        <div style="display:grid; gap:12px;">
          <div>
            <label style="font-size:10px; letter-spacing:.16em; color:var(--coral); font-weight:600;">ИМЯ</label>
            <input id="ep-name" class="input" value="${escAttr(user.name)}" style="margin-top:4px;">
          </div>
          ${isAdmin ? '' : `
          <div>
            <label style="font-size:10px; letter-spacing:.16em; color:var(--coral); font-weight:600;">EMAIL</label>
            <input id="ep-email" class="input" type="email" value="${escAttr(user.email||'')}" readonly style="margin-top:4px; opacity:.7;">
            <div style="font-size:10.5px; color:var(--soft); margin-top:2px;">email менять нельзя</div>
          </div>`}
          <div>
            <label style="font-size:10px; letter-spacing:.16em; color:var(--coral); font-weight:600;">НОВЫЙ ПАРОЛЬ</label>
            <div style="font-size:10.5px; color:var(--soft); margin-top:2px;">оставь пустым, чтобы не менять</div>
            <div class="pass-wrap" style="margin-top:4px;">
              <input id="ep-pass" class="input" type="password" placeholder="Минимум 6 символов">
              <button type="button" class="pass-toggle" onclick="togglePass(this)" aria-label="Показать пароль" tabindex="-1"><i class="fa-solid fa-eye"></i></button>
            </div>
          </div>
          <div style="font-size:10.5px; color:var(--coral); font-weight:600;">${isAdmin ? '🔑 Админ-аккаунт: email и пароль управляются центрально' : ''}</div>
        </div>
        <div style="display:flex; gap:8px; margin-top:18px;">
          <button onclick="document.getElementById('edit-profile').remove()" class="btn btn-ghost" style="flex:1;">Отмена</button>
          <button onclick="saveProfileEdits()" class="btn btn-primary" style="flex:1.5;">Сохранить ✓</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    // Pre-fill avatar preview from saved
    try {
      const saved = localStorage.getItem('madie_avatar');
      if (saved) {
        const av = document.getElementById('ep-avatar-preview');
        if (av) { av.style.background = `url(${saved}) center/cover no-repeat`; av.textContent = ''; }
      }
    } catch (_) {}
  }
  function saveProfileEdits() {
    const user = Store.get('user');
    if (!user) return;
    const newName = (document.getElementById('ep-name').value || '').trim();
    const newEmailEl = document.getElementById('ep-email');
    const newEmail = newEmailEl ? (newEmailEl.value || '').trim() : (user.email || '');
    const newPass = (document.getElementById('ep-pass').value || '');
    if (!newName) { toast('Имя не может быть пустым'); return; }
    // Admin restrictions: can change display name freely, but email/password are fixed centrally
    if (user.isAdmin) {
      user.name = newName;
      Store.set('user', user);
      setActiveUser(user);
      document.getElementById('edit-profile').remove();
      toast('Имя обновлено 🌸 (email и пароль у админов меняются только централизованно)', 'var(--sage)');
      return;
    }
    // Regular user — update via Firebase Auth
    if (RESERVED_NAMES.includes(newName.toLowerCase())) { toast('Это имя зарезервировано 🔐'); return; }
    if (newPass && newPass.length < 6) { toast('Пароль ≥ 6 символов'); return; }
    const fbUser = _auth.currentUser;
    if (!fbUser) {
      toast('Сессия истекла, войди заново');
      return;
    }
    (async () => {
      try {
        if (newName !== user.name) {
          await fbUser.updateProfile({ displayName: newName });
        }
        if (newPass) {
          await fbUser.updatePassword(newPass);
        }
        user.name = newName;
        Store.set('user', user);
        setActiveUser(user);
        document.getElementById('edit-profile')?.remove();
        toast('Профиль обновлён 🌸', 'var(--sage)');
      } catch (e) {
        console.warn('save profile error:', e);
        if (e.code === 'auth/requires-recent-login') {
          toast('Для смены пароля нужен свежий вход. Перелогинься.');
        } else {
          toast('Не удалось сохранить: ' + (e.message || e.code || ''));
        }
      }
    })();
  }
  function logoutUser() {
    try { _auth.signOut(); } catch (_) {}
    detachUserListeners();
    Store.del('user');
    // Reload data for guest namespace
    loadUserData();
    const un = document.getElementById('user-name');
    const pn = document.getElementById('profile-name');
    if (un) un.textContent = 'друг';
    if (pn) pn.textContent = 'Гость';
    const auth = document.getElementById('auth-section');
    const content = document.getElementById('profile-content');
    if (auth) auth.style.display = 'block';
    if (content) content.style.display = 'none';
    setProfileAdminMode(false);
    refreshFeedSocial();
    toast('Вышли из аккаунта 👋');
  }

  // ── Game shell (reusable modal) ──
  function gameModal(html, opts) {
    const m = document.createElement('div');
    m.className = 'modal-bg modal-center';
    m.id = (opts && opts.id) || 'game-modal';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `
      <div class="modal-card" style="max-width: 400px; padding: 20px;">${html}</div>
    `;
    const old = document.getElementById(m.id);
    if (old) old.replaceWith(m); else document.body.appendChild(m);
    return m;
  }
  function closeGameModal(id='game-modal') { document.getElementById(id)?.remove(); }
  function gameHeader(title, subtitle, progress, total) {
    return `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
        <div>
          <div class="page-eyebrow">${title}</div>
          <div style="font-size:11px; color:var(--soft); margin-top:2px;">${subtitle}</div>
        </div>
        <div onclick="closeGameModal()" style="font-size:24px; line-height:1; color:var(--soft); cursor:pointer; padding:4px;">×</div>
      </div>
      <div style="display:flex; gap:4px; margin-bottom:18px;">
        ${Array.from({length: total}, (_,i) => `<span style="flex:1; height:4px; border-radius:999px; background:${i < progress ? 'var(--coral)' : 'rgba(242,166,174,.25)'};"></span>`).join('')}
      </div>
    `;
  }
  function gameFinish(score, total, label, gameKey, replayFn) {
    const pct = Math.round((score / total) * 100);
    const xp = score * 8;
    addXp(xp, false);
    if (gameKey) recordGamePlay(gameKey, score, total);
    const isNew = gameKey ? Best.save(gameKey, score, total) : false;
    const prevBest = gameKey ? Best.get(gameKey) : null;
    const msg = pct >= 80 ? '와 정말 잘했어! 🌟' : pct >= 50 ? '잘했어 🌸 ещё немного и идеально' : '괜찮아 🌸 пробуй ещё, всё получится';
    const replayBtn = replayFn ? `<button onclick="${replayFn}()" class="btn btn-rose btn-block" style="margin-top:16px;">↻ Сыграть снова</button>` : '';
    return `
      <div style="text-align:center; padding: 8px 0;">
        <div style="font-size: 56px;">${pct >= 80 ? '🌟' : pct >= 50 ? '🌸' : '🌷'}</div>
        <div class="display" style="font-size: 24px; color: var(--berry); margin-top: 6px;">${label || 'Игра пройдена'}</div>
        <div style="font-size:13px; color: var(--coral); margin-top:2px;">${score} из ${total} верно · ${pct}%</div>
        ${isNew ? `<div class="chip chip-gold" style="margin-top:8px;">✨ НОВЫЙ РЕКОРД</div>` : prevBest ? `<div style="font-size:11px; color:var(--soft); margin-top:6px;">Лучший: ${prevBest.score}/${prevBest.total}</div>` : ''}
        <div class="ko-quote" style="margin-top: 18px; text-align:left;">${msg}</div>
        <div style="display:grid; grid-template-columns: repeat(3,1fr); gap:8px; margin-top:18px;">
          <div class="card card-padded" style="text-align:center; padding:12px 6px;"><div class="display" style="font-size:18px; color:var(--berry);">${score}</div><div style="font-size:10px; color:var(--soft);">верно</div></div>
          <div class="card card-padded" style="text-align:center; padding:12px 6px;"><div class="display" style="font-size:18px; color:var(--berry);">${total}</div><div style="font-size:10px; color:var(--soft);">всего</div></div>
          <div class="card card-padded" style="text-align:center; padding:12px 6px;"><div class="display" style="font-size:18px; color:var(--gold);">+${xp}</div><div style="font-size:10px; color:var(--soft);">XP</div></div>
        </div>
        ${replayBtn}
        <button onclick="closeGameModal(); switchScreen('games'); syncBestScoreCards();" class="btn btn-ghost btn-block" style="margin-top:8px;">Готово ✓</button>
      </div>
    `;
  }
  function shuffleArr(a) { const arr = a.slice(); for (let i = arr.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

  // ── Game 1: Match Picture (Подбери картинку) ──
  let matchData = [];
  let matchScore = 0, matchRound = 0, matchTotal = 5, matchPool = [];
  function startMatch() {
    matchData = gameWordPool().map(w => ({ word:w.ko, emoji:w.emoji||'🌸', meaning:w.ru }));
    matchTotal = Math.min(scaledRounds(5), matchData.length);
    matchScore = 0; matchRound = 0;
    matchPool = shuffleArr(matchData).slice(0, matchTotal);
    renderMatch();
  }
  function renderMatch() {
    if (matchRound >= matchTotal) { gameModal(gameFinish(matchScore, matchTotal, 'Подбери картинку', 'match', 'startMatch')); return; }
    const correct = matchPool[matchRound];
    const wrong = shuffleArr(matchData.filter(p => p.word !== correct.word)).slice(0, 3);
    const choices = shuffleArr([correct, ...wrong]);
    gameModal(`
      ${gameHeader('🖼️ ПОДБЕРИ КАРТИНКУ', 'выбери правильное изображение', matchRound, matchTotal)}
      <div style="text-align:center; margin-bottom:18px;">
        <div style="font-size:11px; color:var(--soft); letter-spacing:.16em;">КАКОЕ ЗНАЧЕНИЕ У</div>
        <div class="ko" style="font-size:46px; font-weight:700; color:var(--berry); margin-top:6px; line-height:1;">${correct.word}</div>
        <div style="font-size:13px; color:var(--coral); margin-top:4px; font-style:italic;">«${correct.meaning}»</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        ${choices.map(c => `
          <div onclick="pickMatch(this, '${c.emoji}', '${correct.emoji}')" class="card card-press" style="aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:54px; cursor:pointer; position:relative;">${c.emoji}</div>
        `).join('')}
      </div>
      <div style="text-align:center; font-size:11px; color:var(--soft); margin-top:14px;">+8 XP за правильный</div>
    `);
  }
  function pickMatch(el, picked, correct) {
    const sibs = el.parentElement.children;
    for (const s of sibs) s.style.pointerEvents = 'none';
    if (picked === correct) {
      el.style.background = 'rgba(132,196,116,.15)';
      el.style.borderColor = 'var(--sage)';
      matchScore++;
      addXp(8);
      const word = matchPool[matchRound] && matchPool[matchRound].word;
      if (word) recordWordSeen(word);
      setTimeout(() => { matchRound++; renderMatch(); }, 700);
    } else {
      el.style.background = '#FFEBEE';
      el.style.borderColor = '#E89BA1';
      // highlight correct
      for (const s of sibs) {
        if (s.textContent.trim() === correct) {
          s.style.background = 'rgba(132,196,116,.15)';
          s.style.borderColor = 'var(--sage)';
        }
      }
      setTimeout(() => { matchRound++; renderMatch(); }, 1100);
    }
  }

  // ── Game 2: Build Word (Собери слово) ──
  let buildData = [];
  let buildScore = 0, buildRound = 0, buildTotal = 5, buildPool = [], buildPicked = [], buildTiles = [];
  function startBuild() {
    buildData = gameWordPool().filter(w => w.ko.length >= 2).map(w => ({ word:w.ko, meaning:w.ru }));
    buildTotal = Math.min(scaledRounds(5), buildData.length);
    buildScore = 0; buildRound = 0;
    buildPool = shuffleArr(buildData).slice(0, buildTotal);
    renderBuild();
  }
  function renderBuild() {
    if (buildRound >= buildTotal) { gameModal(gameFinish(buildScore, buildTotal, 'Собери слово', 'build', 'startBuild')); return; }
    const item = buildPool[buildRound];
    const tiles = item.word.split('');
    // Add 1-2 distractor syllables
    const distractors = shuffleArr(buildData.flatMap(b => b.word.split('')).filter(s => !tiles.includes(s))).slice(0, 2);
    buildTiles = shuffleArr([...tiles, ...distractors]);
    buildPicked = [];
    drawBuild(item);
  }
  function drawBuild(item) {
    const slots = item.word.split('').map((_, i) => {
      const ch = buildPicked[i];
      return `<div style="flex:1; min-width:0; height:62px; border-radius:14px; background:${ch ? 'var(--blush)' : 'rgba(255,255,255,.6)'}; border:1.5px ${ch ? 'solid' : 'dashed'} ${ch ? 'var(--coral)' : 'var(--line)'}; display:flex; align-items:center; justify-content:center;">${ch ? `<span class="ko" style="font-size:32px; font-weight:700; color:var(--berry);">${ch}</span>` : ''}</div>`;
    }).join('');
    const tilesHtml = buildTiles.map((t, i) => {
      const used = buildPicked.includes(t) && buildPicked.filter(x => x === t).length >= buildTiles.filter(x => x === t).length;
      // simpler: count usage
      const usedCount = buildPicked.filter(x => x === t).length;
      const haveCount = buildTiles.filter(x => x === t).length;
      const sliceUsedBefore = buildTiles.slice(0, i).filter(x => x === t).length;
      const isThisUsed = sliceUsedBefore < usedCount;
      return `<button ${isThisUsed ? 'disabled' : `onclick="pickBuildTile(${i})"`} class="hangul-key ko" style="height:62px; aspect-ratio:auto; padding:0 18px; opacity:${isThisUsed?'.3':'1'}; ${isThisUsed?'pointer-events:none;':''}">${t}</button>`;
    }).join('');
    gameModal(`
      ${gameHeader('🧩 СОБЕРИ СЛОВО', `составь корейское слово по значению`, buildRound, buildTotal)}
      <div style="text-align:center; margin-bottom:14px;">
        <div style="font-size:11px; color:var(--soft); letter-spacing:.16em;">ЗНАЧЕНИЕ</div>
        <div class="display" style="font-size:24px; color:var(--berry); margin-top:4px;">«${item.meaning}»</div>
      </div>
      <div style="display:flex; gap:6px; margin-bottom:18px;">${slots}</div>
      <div style="font-size:10px; color:var(--soft); letter-spacing:.16em; margin-bottom:8px; text-align:center;">ВЫБЕРИ СЛОГИ</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:14px;">${tilesHtml}</div>
      <div style="display:flex; gap:8px;">
        <button onclick="resetBuild()" class="btn btn-ghost" style="flex:1;">↻ Сброс</button>
        <button onclick="checkBuild()" class="btn btn-primary" style="flex:1.5;">Проверить</button>
      </div>
      <div style="text-align:center; font-size:11px; color:var(--soft); margin-top:10px;">+12 XP за правильный</div>
    `);
  }
  function pickBuildTile(i) {
    const item = buildPool[buildRound];
    if (buildPicked.length >= item.word.length) return;
    buildPicked.push(buildTiles[i]);
    drawBuild(item);
  }
  function resetBuild() {
    buildPicked = [];
    drawBuild(buildPool[buildRound]);
  }
  function checkBuild() {
    const item = buildPool[buildRound];
    if (buildPicked.length !== item.word.length) { toast('Заполни все слоты 🌸'); return; }
    const guess = buildPicked.join('');
    if (guess === item.word) {
      buildScore++;
      addXp(12);
      toast(`정답! ${item.word} = ${item.meaning} ✨`, 'var(--sage)');
    } else {
      toast(`Почти 🌸 правильно: ${item.word}`);
    }
    setTimeout(() => { buildRound++; renderBuild(); }, 1100);
  }

  // ── Game 3: Listen (На слух) ──
  let listenData = [];
  let listenScore = 0, listenRound = 0, listenTotal = 5, listenPool = [];
  function startListen() {
    listenData = gameWordPool().map(w => ({ word:w.ko, meaning:w.ru }));
    listenTotal = Math.min(scaledRounds(5), listenData.length);
    listenScore = 0; listenRound = 0;
    listenPool = shuffleArr(listenData).slice(0, listenTotal);
    renderListen();
  }
  function renderListen() {
    if (listenRound >= listenTotal) { gameModal(gameFinish(listenScore, listenTotal, 'На слух', 'listen', 'startListen')); return; }
    const correct = listenPool[listenRound];
    const wrong = shuffleArr(listenData.filter(p => p.word !== correct.word)).slice(0, 3);
    const choices = shuffleArr([correct, ...wrong]);
    gameModal(`
      ${gameHeader('🎧 НА СЛУХ', 'послушай и выбери правильное слово', listenRound, listenTotal)}
      <div style="text-align:center; margin-bottom:18px;">
        <button onclick="playSyllable('${correct.word}', this)" style="width:100px; height:100px; border-radius:50%; background: linear-gradient(140deg, var(--coral), var(--gold)); color:white; border:none; cursor:pointer; font-size:38px; box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,.3); margin:0 auto; display:flex; align-items:center; justify-content:center;">
          <i class="fa-solid fa-volume-up"></i>
        </button>
        <div style="font-size:11px; color:var(--soft); margin-top:10px; letter-spacing:.16em;">ТАПНИ ЧТОБЫ ПЕРЕСЛУШАТЬ</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        ${choices.map(c => `
          <div onclick="pickListen(this, '${c.word}', '${correct.word}')" class="card card-press" style="padding:18px 10px; text-align:center; cursor:pointer;">
            <div class="ko" style="font-size:28px; font-weight:700; color:var(--berry); line-height:1;">${c.word}</div>
            <div style="font-size:11px; color:var(--soft); margin-top:6px;">${c.meaning}</div>
          </div>
        `).join('')}
      </div>
      <div style="text-align:center; font-size:11px; color:var(--soft); margin-top:14px;">+10 XP за правильный</div>
    `);
    // auto-play once
    setTimeout(() => playSyllable(correct.word, null), 350);
  }
  function pickListen(el, picked, correct) {
    const sibs = el.parentElement.children;
    for (const s of sibs) s.style.pointerEvents = 'none';
    if (picked === correct) {
      el.style.background = 'rgba(132,196,116,.15)';
      el.style.borderColor = 'var(--sage)';
      listenScore++;
      addXp(10);
      recordWordSeen(correct);
      setTimeout(() => { listenRound++; renderListen(); }, 700);
    } else {
      el.style.background = '#FFEBEE';
      el.style.borderColor = '#E89BA1';
      for (const s of sibs) {
        if (s.querySelector('.ko')?.textContent === correct) {
          s.style.background = 'rgba(132,196,116,.15)';
          s.style.borderColor = 'var(--sage)';
        }
      }
      setTimeout(() => { listenRound++; renderListen(); }, 1200);
    }
  }

  // ── Game 4: K-Pop Fill ──
  const kpopData = [
    { artist:'IU', song:'Through the Night', line:'이 밤 그날의 ___', blank:'반딧불을', options:['반딧불을','별빛을','꽃잎을','햇살을'], translation:'В эту ночь — ___ того дня', blankRu:'светлячков' },
    { artist:'BTS', song:'Spring Day', line:'보고 싶다 이렇게 ___ 하니까', blank:'말하니까', options:['말하니까','울리니까','웃으니까','오니까'], translation:'Скучаю по тебе, раз так ___', blankRu:'говорю' },
    { artist:'BLACKPINK', song:'How You Like That', line:'뱉은 말은 ___ 못 가져', blank:'담아', options:['담아','내어','주어','말해'], translation:'Сказанные слова не ___ обратно', blankRu:'забрать' },
    { artist:'NewJeans', song:'Ditto', line:'I got nothin\'  ___ 너', blank:'없이', options:['없이','함께','그냥','속에'], translation:'У меня ничего нет ___ тебя', blankRu:'без' },
    { artist:'TWICE', song:'What is Love?', line:'사랑이 뭘까 ___ 궁금해', blank:'정말', options:['정말','조금','매일','계속'], translation:'Что такое любовь? ___ интересно', blankRu:'правда' },
    { artist:'BTS', song:'Dynamite', line:'Cause I, I, I\'m in the ___', blank:'스타라이트', options:['스타라이트','문라이트','선샤인','드림'], translation:'Я в свете ___', blankRu:'звёзд' }
  ];
  let kpopScore = 0, kpopRound = 0, kpopTotal = 4, kpopPool = [];
  function startKpop() { kpopScore = 0; kpopRound = 0; kpopPool = shuffleArr(getKpopAll()).slice(0, kpopTotal); renderKpop(); }
  function renderKpop() {
    if (kpopRound >= kpopTotal) { gameModal(gameFinish(kpopScore, kpopTotal, 'K-Pop Fill', 'kpop', 'startKpop')); return; }
    const q = kpopPool[kpopRound];
    const lineHtml = q.line.replace('___', `<span style="display:inline-block; min-width:80px; border-bottom:2px dashed var(--gold); padding:0 8px; color:var(--gold); font-weight:700;">?</span>`);
    const audioText = q.line.replace('___', q.blank).replace(/'/g, "\\'");
    gameModal(`
      ${gameHeader('🎵 K-POP FILL', `${q.artist} — ${q.song}`, kpopRound, kpopTotal)}
      <div style="background: linear-gradient(150deg, var(--ink), var(--berry) 65%, var(--gold) 160%); color:white; border-radius:18px; padding:18px 16px; text-align:center; margin-bottom:18px;">
        <div style="font-size:9px; letter-spacing:.2em; color: var(--gold);">ВСТАВЬ СЛОВО</div>
        <div class="ko" style="font-size:18px; font-weight:600; margin-top:10px; line-height:1.45;">${lineHtml}</div>
        <div style="font-size:11.5px; color: var(--blush); margin-top:8px; font-style:italic;">${q.translation}</div>
        <button onclick="playSyllable('${audioText}', this)" class="btn" style="background:rgba(255,255,255,.15); color:white; margin-top:12px; padding:8px 14px; font-size:11px;"><i class="fa-solid fa-volume-up"></i> Послушать строку</button>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        ${q.options.map(opt => `
          <button onclick="pickKpop(this, '${opt}', '${q.blank}')" class="btn btn-ghost ko" style="padding:14px 10px; font-size:16px; font-weight:700; height:auto; flex-direction:column; gap:2px;">${opt}</button>
        `).join('')}
      </div>
      <div style="text-align:center; font-size:11px; color:var(--soft); margin-top:14px;">+15 XP за правильный</div>
    `);
  }
  function pickKpop(el, picked, correct) {
    const sibs = el.parentElement.children;
    for (const s of sibs) s.style.pointerEvents = 'none';
    if (picked === correct) {
      el.style.background = 'rgba(132,196,116,.15)';
      el.style.borderColor = 'var(--sage)';
      el.style.color = '#4F7B43';
      kpopScore++;
      addXp(15);
      toast(`정답! ${correct} ✨`, 'var(--sage)');
      setTimeout(() => { kpopRound++; renderKpop(); }, 1000);
    } else {
      el.style.background = '#FFEBEE';
      el.style.borderColor = '#E89BA1';
      el.style.color = '#B33A4A';
      for (const s of sibs) {
        if (s.textContent.trim() === correct) {
          s.style.background = 'rgba(132,196,116,.15)';
          s.style.borderColor = 'var(--sage)';
          s.style.color = '#4F7B43';
        }
      }
      setTimeout(() => { kpopRound++; renderKpop(); }, 1500);
    }
  }

  // ── Game 5: Memory Match (Парные карточки) ──
  let memoryData = [];
  let memCards = [], memFlipped = [], memMatched = 0, memMoves = 0, memPairs = 6;
  function startMemory() {
    memoryData = gameWordPool().map(w => ({ ko:w.ko, ru:w.ru }));
    memPairs = Math.min(scaledRounds(6), 8, memoryData.length);
    const picked = shuffleArr(memoryData).slice(0, memPairs);
    memCards = shuffleArr(picked.flatMap((p, i) => [
      { id: i, side: 'ko', text: p.ko },
      { id: i, side: 'ru', text: p.ru }
    ])).map((c, idx) => ({ ...c, idx, flipped: false, matched: false }));
    memFlipped = []; memMatched = 0; memMoves = 0;
    renderMemory();
  }
  function renderMemory() {
    if (memMatched >= memPairs) {
      const efficient = memMoves <= memPairs + 2;
      const score = efficient ? memPairs : Math.max(0, memPairs - Math.floor((memMoves - memPairs) / 2));
      gameModal(gameFinish(score, memPairs, `Память · ${memMoves} ходов`, 'memory', 'startMemory'));
      return;
    }
    const cardsHtml = memCards.map(c => {
      const visible = c.flipped || c.matched;
      const baseStyle = 'aspect-ratio:1; display:flex; align-items:center; justify-content:center; cursor:pointer; padding:6px; text-align:center; transition: transform .25s var(--ease-out), background .25s ease; min-height:62px;';
      const matchedStyle = c.matched ? ' opacity:.6; background:rgba(132,196,116,.18); border-color:var(--sage);' : '';
      const hiddenStyle = !visible ? ' background:linear-gradient(140deg, var(--coral), var(--rose)); color:white; border-color:transparent;' : '';
      const content = visible
        ? (c.side === 'ko'
            ? `<span class="ko" style="font-size:22px; font-weight:700; color:var(--berry);">${c.text}</span>`
            : `<span style="font-size:11.5px; font-weight:600; color:var(--berry); line-height:1.15;">${c.text}</span>`)
        : '<span style="font-size:24px;">🌸</span>';
      return `<div onclick="flipMemoryCard(${c.idx})" class="card card-press" style="${baseStyle}${matchedStyle}${hiddenStyle}">${content}</div>`;
    }).join('');
    gameModal(`
      ${gameHeader('🃏 ПАМЯТЬ', `найдено: ${memMatched}/${memPairs} · ходов: ${memMoves}`, memMatched, memPairs)}
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px;">
        ${cardsHtml}
      </div>
      <div style="text-align:center; font-size:11px; color:var(--soft); margin-top:14px;">Найди пару: 한국어 ↔ перевод</div>
    `);
  }
  function flipMemoryCard(idx) {
    const card = memCards[idx];
    if (card.matched || card.flipped || memFlipped.length >= 2) return;
    card.flipped = true;
    memFlipped.push(card);
    renderMemory();
    if (memFlipped.length === 2) {
      memMoves++;
      setTimeout(() => {
        const [a, b] = memFlipped;
        if (a.id === b.id && a.side !== b.side) {
          a.matched = true; b.matched = true;
          memMatched++; addXp(5);
        } else {
          a.flipped = false; b.flipped = false;
        }
        memFlipped = [];
        renderMemory();
      }, 750);
    }
  }

  // ── Game 6: Quick Translate (Быстрый перевод) ──
  let translateData = [];
  let trScore = 0, trRound = 0, trTotal = 6, trPool = [];
  function startTranslate() {
    translateData = gameWordPool().map(w => ({ ru:w.ru, ko:w.ko }));
    trTotal = Math.min(scaledRounds(6), translateData.length);
    trScore = 0; trRound = 0;
    trPool = shuffleArr(translateData).slice(0, trTotal);
    renderTranslate();
  }
  function renderTranslate() {
    if (trRound >= trTotal) { gameModal(gameFinish(trScore, trTotal, 'Быстрый перевод', 'translate', 'startTranslate')); return; }
    const correct = trPool[trRound];
    const wrong = shuffleArr(translateData.filter(p => p.ko !== correct.ko)).slice(0, 3);
    const choices = shuffleArr([correct, ...wrong]);
    gameModal(`
      ${gameHeader('⚡ ПЕРЕВОД', 'найди корейский эквивалент', trRound, trTotal)}
      <div style="text-align:center; margin-bottom:18px;">
        <div style="font-size:11px; color:var(--soft); letter-spacing:.16em;">КАК БУДЕТ ПО-КОРЕЙСКИ</div>
        <div class="display" style="font-size:30px; color:var(--berry); margin-top:6px;">«${correct.ru}»</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        ${choices.map(c => `
          <div onclick="pickTranslate(this, '${c.ko}', '${correct.ko}')" class="card card-press" style="padding:18px 10px; text-align:center; cursor:pointer;">
            <div class="ko" style="font-size:24px; font-weight:700; color:var(--berry); line-height:1.1;">${c.ko}</div>
          </div>
        `).join('')}
      </div>
      <div style="text-align:center; font-size:11px; color:var(--soft); margin-top:14px;">+10 XP за правильный</div>
    `);
  }
  function pickTranslate(el, picked, correct) {
    const sibs = el.parentElement.children;
    for (const s of sibs) s.style.pointerEvents = 'none';
    if (picked === correct) {
      el.style.background = 'rgba(132,196,116,.15)';
      el.style.borderColor = 'var(--sage)';
      trScore++; addXp(10);
      recordWordSeen(correct);
      setTimeout(() => { trRound++; renderTranslate(); }, 700);
    } else {
      el.style.background = '#FFEBEE';
      el.style.borderColor = '#E89BA1';
      for (const s of sibs) {
        if (s.querySelector('.ko')?.textContent === correct) {
          s.style.background = 'rgba(132,196,116,.15)';
          s.style.borderColor = 'var(--sage)';
        }
      }
      setTimeout(() => { trRound++; renderTranslate(); }, 1200);
    }
  }

  // ── Game 7: Numbers (Числа) ──
  const numbersData = [
    { n:1,  sino:'일',  native:'하나' },
    { n:2,  sino:'이',  native:'둘' },
    { n:3,  sino:'삼',  native:'셋' },
    { n:4,  sino:'사',  native:'넷' },
    { n:5,  sino:'오',  native:'다섯' },
    { n:6,  sino:'육',  native:'여섯' },
    { n:7,  sino:'칠',  native:'일곱' },
    { n:8,  sino:'팔',  native:'여덟' },
    { n:9,  sino:'구',  native:'아홉' },
    { n:10, sino:'십',  native:'열' }
  ];
  let numScore = 0, numRound = 0, numTotal = 6, numPool = [];
  function startNumbers() { numScore = 0; numRound = 0; numPool = shuffleArr(numbersData).slice(0, numTotal); renderNumbers(); }
  function renderNumbers() {
    if (numRound >= numTotal) { gameModal(gameFinish(numScore, numTotal, 'Числа · 숫자', 'numbers', 'startNumbers')); return; }
    const correct = numPool[numRound];
    const useSino = Math.random() > 0.5;
    const correctText = useSino ? correct.sino : correct.native;
    const wrong = shuffleArr(numbersData.filter(p => p.n !== correct.n)).slice(0, 3);
    const choices = shuffleArr([correctText, ...wrong.map(w => useSino ? w.sino : w.native)]);
    gameModal(`
      ${gameHeader('🔢 ЧИСЛА', `${useSino ? '시노 — китайско-кор. (일이삼)' : '네이티브 — родные (하나둘셋)'}`, numRound, numTotal)}
      <div style="text-align:center; margin-bottom:20px;">
        <div style="font-size:11px; color:var(--soft); letter-spacing:.16em;">КАК БУДЕТ ${useSino ? 'СИНО' : 'НЕЙТИВ'}</div>
        <div class="display" style="font-size:74px; color:var(--berry); line-height:1; margin-top:6px;">${correct.n}</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        ${choices.map(c => `
          <div onclick="pickNumber(this, '${c}', '${correctText}')" class="card card-press" style="padding:20px 10px; text-align:center; cursor:pointer;">
            <div class="ko" style="font-size:28px; font-weight:700; color:var(--berry); line-height:1;">${c}</div>
          </div>
        `).join('')}
      </div>
      <div style="text-align:center; font-size:10.5px; color:var(--soft); margin-top:12px; line-height:1.5;">시노 — для дат, денег, минут · 네이티브 — для возраста, штук</div>
    `);
  }
  function pickNumber(el, picked, correct) {
    const sibs = el.parentElement.children;
    for (const s of sibs) s.style.pointerEvents = 'none';
    if (picked === correct) {
      el.style.background = 'rgba(132,196,116,.15)';
      el.style.borderColor = 'var(--sage)';
      numScore++; addXp(8);
      setTimeout(() => { numRound++; renderNumbers(); }, 700);
    } else {
      el.style.background = '#FFEBEE';
      el.style.borderColor = '#E89BA1';
      for (const s of sibs) {
        if (s.querySelector('.ko')?.textContent === correct) {
          s.style.background = 'rgba(132,196,116,.15)';
          s.style.borderColor = 'var(--sage)';
        }
      }
      setTimeout(() => { numRound++; renderNumbers(); }, 1200);
    }
  }

  // ── Game 8: Sentence Build (Собери фразу) ──
  const sentenceData = [
    { ko:['저는','학생','입니다'],          ru:'Я студент' },
    { ko:['오늘','날씨가','좋아요'],          ru:'Сегодня хорошая погода' },
    { ko:['저는','한국어를','배워요'],        ru:'Я учу корейский' },
    { ko:['이것은','꽃','입니다'],            ru:'Это — цветок' },
    { ko:['저는','당신을','사랑해요'],        ru:'Я тебя люблю' },
    { ko:['친구를','만나요'],                ru:'Встречаюсь с другом' },
    { ko:['저는','한국','음식을','좋아해요'], ru:'Я люблю корейскую еду' },
    { ko:['우리','집에','가요'],              ru:'Идём к нам домой' }
  ];
  let sntScore = 0, sntRound = 0, sntTotal = 4, sntPool = [], sntPicked = [], sntTiles = [];
  function startSentence() { sntScore = 0; sntRound = 0; sntPool = shuffleArr(sentenceData).slice(0, sntTotal); renderSentence(); }
  function renderSentence() {
    if (sntRound >= sntTotal) { gameModal(gameFinish(sntScore, sntTotal, 'Собери фразу', 'sentence', 'startSentence')); return; }
    const item = sntPool[sntRound];
    const allOther = sentenceData.filter(s => s.ru !== item.ru).flatMap(s => s.ko);
    const distractors = shuffleArr(allOther.filter(w => !item.ko.includes(w))).slice(0, 1);
    sntTiles = shuffleArr([...item.ko, ...distractors]);
    sntPicked = [];
    drawSentence(item);
  }
  function drawSentence(item) {
    const slots = item.ko.map((_, i) => {
      const w = sntPicked[i];
      return `<div style="height:46px; min-width:54px; padding:0 12px; border-radius:12px; background:${w ? 'var(--blush)' : 'rgba(255,255,255,.6)'}; border:1.5px ${w ? 'solid' : 'dashed'} ${w ? 'var(--coral)' : 'var(--line)'}; display:inline-flex; align-items:center; justify-content:center;"><span class="ko" style="font-size:16px; font-weight:700; color:var(--berry);">${w || ''}</span></div>`;
    }).join('');
    const tilesHtml = sntTiles.map((t, i) => {
      const usedCount = sntPicked.filter(x => x === t).length;
      const sliceUsedBefore = sntTiles.slice(0, i).filter(x => x === t).length;
      const isThisUsed = sliceUsedBefore < usedCount;
      return `<button ${isThisUsed ? 'disabled' : `onclick="pickSentenceTile(${i})"`} class="hangul-key ko" style="height:46px; aspect-ratio:auto; padding:0 14px; font-size:15px; opacity:${isThisUsed ? '.3' : '1'}; ${isThisUsed ? 'pointer-events:none;' : ''}">${t}</button>`;
    }).join('');
    gameModal(`
      ${gameHeader('📝 СОБЕРИ ФРАЗУ', 'построй корейское предложение', sntRound, sntTotal)}
      <div style="text-align:center; margin-bottom:14px;">
        <div style="font-size:11px; color:var(--soft); letter-spacing:.16em;">ПЕРЕВЕДИ НА КОРЕЙСКИЙ</div>
        <div class="display" style="font-size:20px; color:var(--berry); margin-top:4px; line-height:1.2;">«${item.ru}»</div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-bottom:18px; min-height:46px;">${slots}</div>
      <div style="font-size:10px; color:var(--soft); letter-spacing:.16em; margin-bottom:8px; text-align:center;">ВЫБЕРИ СЛОВА (одно лишнее)</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:14px;">${tilesHtml}</div>
      <div style="display:flex; gap:8px;">
        <button onclick="resetSentence()" class="btn btn-ghost" style="flex:1;">↻ Сброс</button>
        <button onclick="checkSentence()" class="btn btn-primary" style="flex:1.5;">Проверить</button>
      </div>
      <div style="text-align:center; font-size:11px; color:var(--soft); margin-top:10px;">+20 XP за правильный</div>
    `);
  }
  function pickSentenceTile(i) {
    const item = sntPool[sntRound];
    if (sntPicked.length >= item.ko.length) return;
    sntPicked.push(sntTiles[i]);
    drawSentence(item);
  }
  function resetSentence() { sntPicked = []; drawSentence(sntPool[sntRound]); }
  function checkSentence() {
    const item = sntPool[sntRound];
    if (sntPicked.length !== item.ko.length) { toast('Заполни все слоты 🌸'); return; }
    if (sntPicked.join(' ') === item.ko.join(' ')) {
      sntScore++; addXp(20);
      toast(`정답! ${item.ko.join(' ')} ✨`, 'var(--sage)');
    } else {
      toast(`Почти 🌸 правильно: ${item.ko.join(' ')}`);
    }
    setTimeout(() => { sntRound++; renderSentence(); }, 1300);
  }

  // ── Intro splash ──
  function dismissIntro() {
    const i = document.getElementById('intro');
    if (!i || i.classList.contains('dismissing')) return;
    i.classList.add('dismissing');
    setTimeout(() => i.remove(), 700);
  }
  (function petals() {
    const layer = document.getElementById('intro-petals');
    if (!layer) return;
    const symbols = ['🌸','🌸','🌸','🌺','✿'];
    function spawn(initial) {
      if (!document.getElementById('intro')) return;
      const p = document.createElement('div');
      p.className = 'petal';
      const dur = 5 + Math.random() * 4;
      const size = 12 + Math.random() * 12;
      p.style.cssText = `left:${Math.random()*100}%; font-size:${size}px; animation-duration:${dur}s; animation-delay:${initial?-Math.random()*dur:0}s; opacity:${(0.55+Math.random()*0.4).toFixed(2)};`;
      p.textContent = symbols[Math.floor(Math.random()*symbols.length)];
      layer.appendChild(p);
      setTimeout(() => p.remove(), (dur+2)*1000);
    }
    for (let i = 0; i < 14; i++) spawn(true);
    const tid = setInterval(() => {
      if (!document.getElementById('intro')) { clearInterval(tid); return; }
      spawn();
    }, 380);
  })();
  setTimeout(() => { if (document.getElementById('intro')) dismissIntro(); }, 6000);

  // ── Ambient sakura (always-on, gentle) ──
  (function ambientPetals() {
    const layer = document.getElementById('ambient-petals');
    if (!layer) return;
    const symbols = ['🌸','🌸','🌸','🌺','✿'];
    function spawn() {
      const p = document.createElement('div');
      p.className = 'petal';
      const dur = 8 + Math.random() * 6;
      const size = 11 + Math.random() * 11;
      p.style.cssText = `left:${Math.random()*100}%; font-size:${size}px; animation-duration:${dur}s; opacity:${(0.45 + Math.random()*0.4).toFixed(2)};`;
      p.textContent = symbols[Math.floor(Math.random()*symbols.length)];
      layer.appendChild(p);
      setTimeout(() => p.remove(), (dur+2)*1000);
    }
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      const dur = 8 + Math.random() * 6;
      p.style.cssText = `left:${Math.random()*100}%; font-size:${11+Math.random()*11}px; animation-duration:${dur}s; animation-delay:${(-Math.random()*dur).toFixed(2)}s; opacity:${(0.45+Math.random()*0.4).toFixed(2)};`;
      p.textContent = symbols[Math.floor(Math.random()*symbols.length)];
      layer.appendChild(p);
    }
    setInterval(spawn, 1400);
  })();

  // ── Init ──
  buildHeroSegments();
  buildWaveform();
  buildStreakCal();
  initHangulLab();
  renderCultureBanner();
  renderCustomVideos();
  renderCustomLessons();
  renderCustomFeedPosts();
  // Restore logged-in user (must come BEFORE loadUserData so namespace is correct)
  const savedUser = Store.get('user');
  if (savedUser && savedUser.name) {
    // Restore in-place without recursion
    Store.set('user', savedUser);
    const un = document.getElementById('user-name');
    const pn = document.getElementById('profile-name');
    if (un) un.textContent = savedUser.name;
    if (pn) pn.textContent = savedUser.name;
    const auth = document.getElementById('auth-section');
    const content = document.getElementById('profile-content');
    if (auth) auth.style.display = 'none';
    if (content) content.style.display = 'block';
    const email = document.getElementById('profile-email');
    if (email) email.textContent = savedUser.email || (savedUser.guest ? 'гостевой режим' : 'без email');
    const adminBadge = document.getElementById('profile-admin-badge');
    if (adminBadge) adminBadge.style.display = savedUser.isAdmin ? 'inline-flex' : 'none';
    setProfileAdminMode(!!savedUser.isAdmin);
  }
  // Init Firebase sync first so UStore writes propagate to cloud
  initFirebaseSync();
  // Subscribe to feed-wide likes & comments (shared across users)
  attachFeedListeners();
  // Subscribe to the admins list (so login can match against the cloud copy)
  attachAdminsListener();
  // Now load per-user state (from current user's namespace, or guest if no login)
  loadUserData();
  // Subscribe to cloud updates for this user
  attachUserListeners();
  // Achievement system
  recordDayEntered();
  startSessionTimer();
  checkAchievements(true); // silent — apply unlocks at startup without toast spam
  // If avatar exists in storage, mark hasAvatar achievement
  try { if (UStore.get('avatar') && !stats.hasAvatar) recordAvatarSet(); } catch (_) {}

  // ── Firebase Auth: keep local session in sync with auth state ──
  _auth.onAuthStateChanged(fbUser => {
    const local = Store.get('user');
    // Skip auth sync for admins and guests — they don't use Firebase Auth
    if (local && (local.isAdmin || local.guest)) return;
    if (fbUser) {
      // Firebase confirms a session
      const fbName = fbUser.displayName || (fbUser.email || '').split('@')[0];
      if (!local || local.email !== fbUser.email) {
        setActiveUser({ name: fbName, email: fbUser.email, uid: fbUser.uid });
      } else if (!local.uid) {
        local.uid = fbUser.uid;
        Store.set('user', local);
      }
    } else {
      // No Firebase session — clear stale local user (without toast)
      if (local && !local.isAdmin && !local.guest) {
        detachUserListeners();
        Store.del('user');
        loadUserData();
        const un = document.getElementById('user-name');
        const pn = document.getElementById('profile-name');
        if (un) un.textContent = 'друг';
        if (pn) pn.textContent = 'Гость';
        const authSec = document.getElementById('auth-section');
        const content = document.getElementById('profile-content');
        if (authSec) authSec.style.display = 'block';
        if (content) content.style.display = 'none';
        setProfileAdminMode(false);
      }
    }
  });
