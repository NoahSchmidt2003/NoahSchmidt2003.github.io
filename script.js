// Good-Luck love app with extra cats and animations 😻
// Name editing removed, speech removed.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  name: localStorage.getItem('name') || 'Liebling', // read if previously set; cannot change in UI
  dark: localStorage.getItem('dark') === '1',
  partyTimer: null,
  catTimer: null,
  wishesIdx: 0,
  notes: [],
  ambientHeartsTimer: null,
  ambientCatsTimer: null,
  ambientSparklesTimer: null,
  entranceDone: false,
};

const wishes = [
    'You got this my love',
    'You have learned so much it is going to be easy',
    'I believe in you Hasi',
    'Ich glaube an dich mein Schatz',
    'Du schaffst das',
    'you are so intelligent',
    'Du rockst das',
    'My english is the yellow from the egg',
    'My sweetie',
    'You are my poet and write obviously you will do it fine',
    'You can do this',
    'Do not stress you too much',
    'I have a good feeling that everything will be fine',
    'You are the smartest person',
    'you did so well my love',
    'I have a good feeling',
];

const catEmojis = ['🐱','😺','😹','😻','😼','😽','🐈','🐈‍⬛','🐾'];
const sparkleEmojis = ['✨','✺','✦','✧','✶','★','☆'];

function init() {
  if (state.dark) document.body.classList.add('dark');

  // Set name displays (fixed, no editing)
  updateNameDisplays();

  // Footer byWho (optional Signatur)
  const byWho = $('#byWho');
  byWho.textContent = 'your Hasi';
  byWho.href = 'https://www.youtube.com/watch?v=hsrCmahpZMs';
  byWho.target = "_blank";

  // Wishes + Notes
  const savedNotes = localStorage.getItem('gl_notes');
  if (savedNotes) {
    try { state.notes = JSON.parse(savedNotes) || []; } catch { /* ignore */ }
  }
  renderWish();
  renderNotes();

  // Countdown
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Buttons
  $('#darkModeBtn').addEventListener('click', toggleDark);
  $('#partyBtn').addEventListener('click', togglePartyMode);
  $('#catRainBtn').addEventListener('click', toggleCatRain);

  $('#nextWishBtn').addEventListener('click', nextWish);
  $('#floatWishBtn').addEventListener('click', () => floatTextAsHeart($('#wishText').textContent));

  $('#addNoteBtn').addEventListener('click', addNote);
  $('#heartBurstBtn').addEventListener('click', () => {
    heartBurst(26);
    confettiBurst(24);
    pawDrift(8);
  });
  $('#catParadeBtn').addEventListener('click', catParade);

  // Tap/click creates hearts + cats + sparkles
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn') || e.target.closest('input') || e.target.closest('summary') || e.target.closest('details')) return;
    const x = e.clientX, y = e.clientY;
    spawnHeart(x, y);
    spawnSparkle(x, y);
    // small cat burst
    for (let i = 0; i < 2; i++) setTimeout(() => spawnCatNear(x, y), i*90);
  });

  // Ambient animations
  state.ambientHeartsTimer = setInterval(() => {
    heartBurst(rand(2,4));
  }, 2800);
  state.ambientCatsTimer = setInterval(() => {
    spawnCat();
  }, 2500);
  state.ambientSparklesTimer = setInterval(() => {
    for (let i = 0; i < 3; i++) spawnSparkle(rand(20, window.innerWidth-20), window.innerHeight - rand(10, 40));
  }, 1800);

  // Initial entrance animations
  requestAnimationFrame(() => {
    if (state.entranceDone) return;
    state.entranceDone = true;
    entranceReveal();
    // first wow
    setTimeout(() => { heartBurst(18); pawDrift(6); }, 600);
    setTimeout(catParade, 900);
  });
}

/* Name (fixed) */
function updateNameDisplays() {
  $('#nameDisplay').textContent = state.name;
  $('#nameInline').textContent = state.name;
  $('#nameLove').textContent = state.name;
}

/* Dark mode */
function toggleDark() {
  document.body.classList.toggle('dark');
  state.dark = document.body.classList.contains('dark');
  localStorage.setItem('dark', state.dark ? '1' : '0');
}

/* Party mode */
function togglePartyMode(e) {
  const btn = e.currentTarget;
  if (state.partyTimer) {
    clearInterval(state.partyTimer);
    state.partyTimer = null;
    document.body.classList.remove('party');
    btn.innerHTML = '<i class="fa-solid fa-fire"></i> Party Mode';
    announce('Party Mode aus');
  } else {
    document.body.classList.add('party');
    state.partyTimer = setInterval(() => {
      heartBurst(10);
      confettiBurst(10);
      pawDrift(6);
      spawnCat();
    }, 500);
    btn.innerHTML = '<i class="fa-solid fa-burst"></i> Party läuft';
    announce('Party Mode an');
  }
}

/* Cat rain */
function toggleCatRain(e) {
  const btn = e.currentTarget;
  if (state.catTimer) {
    clearInterval(state.catTimer);
    state.catTimer = null;
    btn.innerHTML = '<i class="fa-solid fa-cat"></i> Cat Rain';
    announce('Cat Rain aus');
  } else {
    state.catTimer = setInterval(() => spawnCat(), 250);
    btn.innerHTML = '<i class="fa-solid fa-cloud-rain"></i> Cat Rain an';
    announce('Cat Rain an');
  }
}

/* Countdown to next Tuesday 00:00 local */
function updateCountdown() {
  const now = new Date();
  const target = nextWeekdayAt(2, 0, 0, 0); // Tue
  const diff = target - now;
  const out = $('#countdownDisplay');
  if (diff <= 0) {
    out.textContent = 'Es ist soweit you are rocking this my stardust ✨';
    return;
  }
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  out.textContent = `${d}d ${pad(h)}h ${pad(m)}m ${pad(ss)}s`;
}
function nextWeekdayAt(weekday, hour, minute, second) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, second, 0);
  const currentWeekday = now.getDay();
  let delta = (weekday - currentWeekday + 7) % 7;
  if (delta === 0 && target <= now) delta = 7;
  target.setDate(now.getDate() + delta);
  return target;
}
const pad = (n) => String(n).padStart(2,'0');

/* Wishes */
function renderWish() {
  $('#wishText').textContent = wishes[state.wishesIdx % wishes.length].replace('Tuesday', 'Dienstag');
}
function nextWish() {
  state.wishesIdx++;
  renderWish();
  try { gsap.fromTo('#wishText', { scale: 0.96 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }); } catch {}
  floatTextAsHeart($('#wishText').textContent);
  confettiBurst(18);
}

/* Notes */
function renderNotes() {
  const list = $('#notesList');
  list.innerHTML = '';
  state.notes.forEach((text, i) => {
    const li = document.createElement('li');
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = '💌';
    const span = document.createElement('span');
    span.textContent = text;
    const del = document.createElement('button');
    del.className = 'btn small ghost';
    del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    del.addEventListener('click', () => {
      state.notes.splice(i,1);
      persistNotes();
      renderNotes();
    });
    li.append(tag, span, del);
    list.appendChild(li);
  });
}
function addNote() {
  const input = $('#noteInput');
  const val = (input.value || '').trim();
  if (!val) return;
  state.notes.push(val);
  persistNotes();
  renderNotes();
  input.value = '';
  floatTextAsHeart(val);
  confettiBurst(12);
  announce('Notiz hinzugefügt');
}
function persistNotes() {
  localStorage.setItem('gl_notes', JSON.stringify(state.notes));
}

/* Animation helpers */
function spawnHeart(x, y) {
  const layer = $('#hearts-layer');
  const h = document.createElement('div');
  h.className = 'fly-heart';
  h.textContent = Math.random() < 0.15 ? '💘' : '💖';
  const size = rand(16, 30);
  const left = x != null ? x : rand(10, window.innerWidth - 10);
  const top = y != null ? y : window.innerHeight - 10;
  h.style.left = `${left}px`;
  h.style.top = `${top}px`;
  h.style.fontSize = `${size}px`;
  h.style.opacity = '0.95';
  layer.appendChild(h);
  setTimeout(() => h.remove(), 4200);
}
function heartBurst(n = 12) {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.7;
  for (let i=0;i<n;i++) {
    setTimeout(() => spawnHeart(cx + rand(-100,100), cy + rand(-30,30)), i*24);
  }
}
function floatTextAsHeart(text) {
  const el = document.createElement('div');
  el.className = 'fly-heart';
  el.textContent = `💖 ${text}`;
  el.style.left = `${rand(40, window.innerWidth - 40)}px`;
  el.style.top = `${window.innerHeight - 10}px`;
  el.style.fontSize = `16px`;
  $('#hearts-layer').appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

/* Sparkles */
function spawnSparkle(x, y) {
  const s = document.createElement('div');
  s.className = 'sparkle';
  s.textContent = sparkleEmojis[rand(0, sparkleEmojis.length-1)];
  s.style.left = `${x ?? rand(10, window.innerWidth-10)}px`;
  s.style.top = `${y ?? window.innerHeight - 20}px`;
  s.style.fontSize = `${rand(12,18)}px`;
  $('#sparkles-layer').appendChild(s);
  setTimeout(() => s.remove(), 2400);
}
function confettiBurst(n = 16) {
  for (let i=0;i<n;i++) setTimeout(() => spawnSparkle(rand(20, window.innerWidth-20), window.innerHeight - rand(10, 40)), i*30);
}

/* Paws */
function spawnPaw(x, y) {
  const p = document.createElement('div');
  p.className = 'paw';
  p.textContent = '🐾';
  p.style.left = `${x ?? rand(10, window.innerWidth-10)}px`;
  p.style.top = `${y ?? window.innerHeight - 10}px`;
  p.style.fontSize = `${rand(16,22)}px`;
  $('#paws-layer').appendChild(p);
  setTimeout(() => p.remove(), 3600);
}
function pawDrift(n = 6) {
  const cx = window.innerWidth * 0.25 + Math.random()*window.innerWidth*0.5;
  const cy = window.innerHeight * 0.8;
  for (let i=0;i<n;i++) setTimeout(() => spawnPaw(cx + rand(-80,80), cy + rand(-10,10)), i*40);
}

/* Cats */
function spawnCat() {
  const layer = $('#cats-layer');
  const c = document.createElement('div');
  c.className = 'fly-cat';
  c.textContent = catEmojis[Math.floor(Math.random()*catEmojis.length)];
  const size = rand(22, 36);
  c.style.left = `${rand(0, window.innerWidth - 30)}px`;
  c.style.top = `${rand(0, window.innerHeight - 30)}px`;
  c.style.fontSize = `${size}px`;
  layer.appendChild(c);
  try {
    gsap.to(c, { y: -rand(20, 100), x: rand(-50, 50), opacity: 0.0, duration: rand(2.2, 3.6), ease: 'sine.inOut', onComplete: () => c.remove() });
  } catch {
    setTimeout(()=>c.remove(), 3500);
  }
}
function spawnCatNear(x, y) {
  const layer = $('#cats-layer');
  const c = document.createElement('div');
  c.className = 'fly-cat';
  c.textContent = catEmojis[Math.floor(Math.random()*catEmojis.length)];
  c.style.left = `${(x ?? window.innerWidth/2) + rand(-20,20)}px`;
  c.style.top = `${(y ?? window.innerHeight/2) + rand(-20,20)}px`;
  c.style.fontSize = `${rand(22,34)}px`;
  layer.appendChild(c);
  try {
    gsap.to(c, { y: -rand(30, 120), x: rand(-40, 40), opacity: 0.0, duration: rand(1.8, 3.0), ease: 'sine.inOut', onComplete: () => c.remove() });
  } catch { setTimeout(()=>c.remove(), 2800); }
}
const MAX_CATS_ON_SCREEN = 40;
let paradeRunning = false;

function trimCats(max = MAX_CATS_ON_SCREEN) {
  const layer = $('#cats-layer');
  while (layer.childElementCount > max) {
    layer.firstElementChild?.remove();
  }
}

function catParade({ count } = {}) {
  // Keine Parade starten, wenn bereits eine läuft oder Tab/Seite nicht sichtbar
  if (paradeRunning || document.visibilityState === 'hidden') return;
  paradeRunning = true;

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Dynamische Anzahl: abhängig von Bildschirmbreite, reduziert bei "reduced motion"
  const densityCount =
    count ??
    (prefersReduced
      ? 6
      : Math.max(6, Math.min(12, Math.round(window.innerWidth / 120))));

  const baseDelay = prefersReduced ? 0.12 : 0.08;

  let finished = 0;
  for (let i = 0; i < densityCount; i++) {
    const c = document.createElement('div');
    c.className = 'fly-cat';
    c.textContent = catEmojis[i % catEmojis.length];
    c.style.top = `${rand(30, Math.max(40, window.innerHeight - 60))}px`;
    c.style.left = `-40px`;
    c.style.fontSize = `${rand(22, 32)}px`;
    $('#cats-layer').appendChild(c);

    // Zu viele Elemente? Älteste entfernen
    trimCats();

    const duration = prefersReduced ? rand(3.2, 4.6) : rand(2.6, 4.2);
    try {
      gsap.to(c, {
        x: window.innerWidth + 80,
        duration,
        ease: 'linear',
        delay: i * baseDelay,
        onComplete: () => {
          c.remove();
          if (++finished >= densityCount) paradeRunning = false;
        },
      });
    } catch {
      // Fallback wenn GSAP nicht verfügbar
      setTimeout(() => {
        c.remove();
        if (++finished >= densityCount) paradeRunning = false;
      }, (duration + i * baseDelay) * 1000);
    }
  }
}

/* Entrance reveal */
function entranceReveal() {
  const panels = $$('.panel');
  panels.forEach((p, i) => {
    setTimeout(() => p.classList.add('show'), 120 + i*120);
  });
  // Brand bounce
  try { gsap.fromTo('.brand', { y: -6 }, { y: 0, duration: .6, ease: 'bounce.out' }); } catch {}
}

/* Utils */
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function announce(msg) {
  const live = $('#live');
  live.textContent = '';
  setTimeout(()=> live.textContent = msg, 20);
}

// Start
document.addEventListener('DOMContentLoaded', init);