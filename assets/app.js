/* IC4.0 Data Analysis Reviewer — application logic (vanilla JS, no build step). */
(function () {
'use strict';
const D = window.IC40;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
const qById = id => D.Q.find(q => q.id === id);
const cById = id => D.CONCEPTS.find(c => c.id === id);
const dById = id => D.DIAGRAMS.find(d => d.id === id);
const topicById = id => D.TOPICS.find(t => t.id === id);
const FORMS = window.IC40_FORMULAS || [];
const fById = id => FORMS.find(f => f.id === id);
const PRI = { high: 'High priority', medium: 'Medium priority', low: 'Low priority' };
const badge = p => '<span class="badge ' + p + '">' + PRI[p] + '</span>';
const srcLabel = t => ({ redrawn: 'Redrawn from slide text', computed: 'Computed from slide formula', original: 'Original teaching diagram', slide: 'From the lecture slides' })[t] || 'Original teaching diagram';
const head = (eyebrow, title, sub) => '<div class="page-head"><span class="eyebrow">' + esc(eyebrow) + '</span><h1>' + esc(title) + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>';
const qLabel = q => 'Q' + q.ex + (q.part ? ' ' + q.part : '');
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const fmt = (x, d = 3) => (x == null || !isFinite(x)) ? '—' : (+x).toFixed(d).replace(/\.?0+$/, m => m.startsWith('.') ? '' : m);

/* ---------------- state & persistence ---------------- */
const KEY = 'ic40-reviewer-v1';
let storageOK = true;
function uid() { try { return crypto.randomUUID(); } catch (e) { return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); } }
function fresh() {
  return { v: 1, uid: uid(), created: Date.now(), q: {}, concepts: {}, cards: {}, practice: {}, diag: {}, drawings: {},
    recent: [], last: null, calc: { tree: { pred: [null, null, null, null, null] }, logit: { b0: '', rows: [{ v: '', b: '' }, { v: '', b: '' }, { v: '', b: '' }, { v: '', b: '' }], cut: '0.45' }, lin: { cols: { A: Array(8).fill(false), B: Array(8).fill(false), C: Array(8).fill(false) }, obs: [blankObs(), blankObs()] } },
    drafts: {}, bookmarks: {}, fpractice: {}, mock: { active: null, history: [], last: null }, theme: 'auto', fcIdx: 0, fcFilter: 'all', fcMode: 'all', writeSel: 'q1i' };
}
function blankObs() { const o = { lpsa: '' }; D.LIN_VARS.forEach(v => o[v] = ''); return o; }
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) return Object.assign(fresh(), s); }
  } catch (e) { storageOK = false; }
  return fresh();
}
let S = load();
let saveTimer = null;
function save(now) {
  clearTimeout(saveTimer);
  const go = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); storageOK = true; } catch (e) { storageOK = false; } updateStoreNote(); };
  if (now) go(); else saveTimer = setTimeout(go, 250);
}
function qs(id) { return S.q[id] || (S.q[id] = { studied: false, practiced: false, mastered: false, attempts: [], last: null }); }
function touch(type, id, label) {
  S.recent = S.recent.filter(r => !(r.type === type && r.id === id));
  S.recent.unshift({ type, id, label, t: Date.now() });
  S.recent = S.recent.slice(0, 12);
  save();
}
function updateStoreNote() {
  const el = $('#storeNote'); if (!el) return;
  el.textContent = storageOK ? 'Progress is saved in this browser only.' : 'Browser storage is blocked: progress will be lost when you close the page.';
}

/* ---------------- toast ---------------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }

/* ---------------- icons ---------------- */
const IC = {
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  exam: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  topic: '<path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h6"/>',
  cards: '<rect x="3" y="6" width="14" height="12" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v10"/>',
  write: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
  diag: '<path d="M4 19V5M4 19h16"/><path d="m7 15 4-5 3 3 5-7"/>',
  mock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  rev: '<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4"/>',
  src: '<path d="M9 7H5v12h12v-4"/><path d="M13 3h8v8M21 3 11 13"/>',
  fx: '<path d="M10 4h6M7 20c3 0 3-3 4-8s1-8 4-8"/><path d="M7 12h8"/><path d="m14 15 5 5M19 15l-5 5"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h2"/>'
};
const ico = k => '<svg viewBox="0 0 24 24" aria-hidden="true">' + IC[k] + '</svg>';

/* ---------------- grading ---------------- */
const WRONG = {
  trueNotFalse: t => /\btrue\b/.test(t) && !/\bfalse\b|not true/.test(t),
  stepwiseAnswer: t => !/best[ -]?subset/.test(t) && /(forward|backward|stepwise)/.test(t),
  bestSubsetSure: t => /best[ -]?subset[\s\S]{0,60}(always|definitely|guarantee|will have|has the smallest)/.test(t) && !/(cannot|can.t|not necessarily|no guarantee|depends)/.test(t),
  mseForClass: t => /(squared|\^2|²|\bmse\b)/.test(t) && !/indicator|misclass|i\(/.test(t),
  cpHighest: t => /(highest|largest|maximi)[\s\S]{0,15}(c\s?p\b|bic)/.test(t)
};
function grade(item, text) {
  const t = (text || '').toLowerCase().replace(/\s+/g, ' ');
  const res = { hits: [], misses: [], bonus: [], wrongs: [], score: 0 };
  if (!item.rubric) return null;
  const core = item.rubric.filter(r => !r.bonus);
  item.rubric.forEach(r => {
    const ok = r.re.some(p => { try { return new RegExp(p, 'i').test(t); } catch (e) { return false; } });
    if (r.bonus) { if (ok) res.bonus.push(r); }
    else (ok ? res.hits : res.misses).push(r);
  });
  (item.wrong || []).forEach(w => { if (WRONG[w.test] && WRONG[w.test](t)) res.wrongs.push(w.msg); });
  res.score = core.length ? res.hits.length / core.length : 0;
  if (res.wrongs.length) res.score = Math.max(0, res.score - 0.25 * res.wrongs.length);
  if (t.trim().length < 15) res.score = 0;
  return res;
}
function band(score) { return score >= 0.8 ? ['ok', 'Strong'] : score >= 0.5 ? ['warn', 'Partial'] : ['bad', 'Needs work']; }
function feedbackHTML(item, res, text) {
  const [cls, lab] = band(res.score);
  const tips = res.misses.map(m => '<li>Add: ' + esc(m.label.charAt(0).toLowerCase() + m.label.slice(1)) + '.</li>').join('');
  return '<div class="stack">' +
    '<div class="row between"><div class="row"><span class="chip ' + cls + '">' + lab + '</span><span class="muted small">Estimated learning rubric: ' + res.hits.length + ' of ' + (res.hits.length + res.misses.length) + ' key points' + (res.bonus.length ? ' + ' + res.bonus.length + ' bonus' : '') + '</span></div></div>' +
    '<p class="small muted">Keyword-based estimate, not the lecturer\'s marking scheme. A human examiner may judge wording and depth differently.</p>' +
    '<div><div class="eyebrow">Your answer</div><div class="exam-ans prewrap">' + esc(text) + '</div></div>' +
    '<div class="grid g2">' +
      '<div><div class="eyebrow" style="margin-bottom:6px">Included</div><ul class="tick-list">' + (res.hits.concat(res.bonus).map(h => '<li><span class="ico y">✓</span><span>' + esc(h.label) + '</span></li>').join('') || '<li class="muted small">No key points detected yet.</li>') + '</ul></div>' +
      '<div><div class="eyebrow" style="margin-bottom:6px">Missing</div><ul class="tick-list">' + (res.misses.map(h => '<li><span class="ico n">✕</span><span>' + esc(h.label) + '</span></li>').join('') || '<li class="muted small">Nothing missing from the checklist.</li>') + '</ul></div>' +
    '</div>' +
    (res.wrongs.length ? '<div class="notice warn"><div><b>Possible incorrect statement.</b> ' + res.wrongs.map(esc).join(' ') + '</div></div>' : '') +
    (tips ? '<div><div class="eyebrow">How to improve</div><ul class="small" style="margin:6px 0 0;padding-left:18px">' + tips + '</ul></div>' : '') +
    '<div><div class="eyebrow">Model answer</div><div class="exam-ans prewrap">' + esc(item.model) + '</div></div>' +
    '<div class="row small muted">Source: ' + refs(item.refs || [item.ref]) + '</div>' +
  '</div>';
}
const refs = arr => (arr || []).filter(Boolean).map(r => '<span class="ref">' + esc(r) + '</span>').join(' ');

/* ---------------- navigation ---------------- */
const NAV = [
  ['home', 'Dashboard', 'home'],
  ['exam', 'Exam breakdown', 'exam'],
  ['label', 'Practise'],
  ['formulas', 'Formulas', 'fx'],
  ['cards', 'Flashcards', 'cards'],
  ['write', 'Written practice', 'write'],
  ['calc', 'Exam calculators', 'calc'],
  ['diagrams', 'Graphs & diagrams', 'diag'],
  ['mock', 'Mock exam', 'mock'],
  ['label', 'Review'],
  ['revision', 'Revision & progress', 'rev'],
  ['sources', 'Sources & map', 'src'],
  ['label', 'Topics']
];
function baseRoute(r) {
  if (qById(r)) return 'exam';
  if (dById(r)) return 'diagrams';
  if (fById(r)) return 'formulas';
  const c = cById(r); if (c) return c.topic;
  return r;
}
function renderNav(route) {
  const base = baseRoute(route);
  $('#nav').innerHTML = NAV.map(n => n[0] === 'label' ? '<div class="nav-label">' + n[1] + '</div>' :
    '<a href="#' + n[0] + '"' + (base === n[0] ? ' aria-current="page"' : '') + '>' + ico(n[2]) + '<span>' + esc(n[1]) + '</span>' + navPill(n[0]) + '</a>').join('') +
    D.TOPICS.map(t => { const tp = topicProgress(t.id); const p = pct(tp.done, tp.total);
      return '<a href="#' + t.id + '"' + (base === t.id ? ' aria-current="page"' : '') + '><span class="mod-n">0' + t.n + '</span><span>' + esc(t.title.replace('Supervised Learning: ', '')) + '</span><span class="mini" role="img" aria-label="' + p + '% complete"><i style="width:' + p + '%"></i></span></a>'; }).join('');
}
function navPill(id) {
  if (id === 'exam') return '<span class="pill">' + D.Q.filter(q => qs(q.id).mastered).length + '/' + D.Q.length + '</span>';
  if (id === 'cards') return '<span class="pill">' + D.CARDS.filter(c => S.cards[c.id] === 'known').length + '/' + D.CARDS.length + '</span>';
  if (id === 'revision') { const n = revisionItems().length; return n ? '<span class="pill">' + n + '</span>' : ''; }
  return '';
}
function closeMenu() { $('#side').classList.remove('open'); $('#scrim').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }

const VIEWS = {};
function route() {
  const r = (location.hash || '').slice(1) || 'home';
  renderNav(r);
  closeMenu();
  const v = $('#view');
  let html;
  try {
    if (VIEWS[r]) html = VIEWS[r]();
    else if (qById(r)) html = viewQuestion(r);
    else if (dById(r)) html = viewDiagram(r);
    else if (cById(r)) html = viewLesson(r);
    else if (fById(r)) html = viewFormula(r);
    else html = VIEWS.home();
  } catch (e) {
    console.error(e);
    html = '<div class="card"><h2>Something went wrong</h2><p class="muted">This view failed to load: ' + esc(e.message) + '. Go back to the <a href="#home">dashboard</a>.</p></div>';
  }
  v.innerHTML = html;
  if (r !== 'home' && r !== 'sources') { S.last = r; save(); }
  window.scrollTo(0, 0);
  try { $('#main').focus({ preventScroll: true }); } catch (e) {}
  const after = AFTER[r] || (qById(r) ? afterQuestion : dById(r) ? afterDiagram : cById(r) ? afterLesson : fById(r) ? afterFormula : null);
  if (after) after(r);
}
const AFTER = {};

/* ---------------- dashboard ---------------- */
function counts() {
  const writable = D.Q.filter(q => q.rubric).length + D.PRACTICE.length;
  const calcs = D.Q.filter(q => q.calc && q.calc !== 'choose').length;
  return { parts: D.Q.length, marks: D.Q.reduce((a, q) => a + q.marks, 0), writable, calcs, cards: D.CARDS.length, diagrams: D.DIAGRAMS.length, concepts: D.CONCEPTS.length };
}
function topicProgress(tid) {
  const cs = D.CONCEPTS.filter(c => c.topic === tid);
  const qsIn = D.Q.filter(q => q.topics[0] === tid);
  const done = cs.filter(c => S.concepts[c.id]).length + qsIn.filter(q => qs(q.id).mastered).length;
  return { done, total: cs.length + qsIn.length, concepts: cs.length, qs: qsIn.length };
}
VIEWS.home = function () {
  const c = counts();
  const mastered = D.Q.filter(q => qs(q.id).mastered).length;
  const practiced = D.Q.filter(q => qs(q.id).practiced).length;
  const lessonsDone = D.CONCEPTS.filter(x => S.concepts[x.id]).length;
  const known = D.CARDS.filter(x => S.cards[x.id] === 'known').length;
  const fDone = FORMS.filter(f => S.fpractice[f.id] && S.fpractice[f.id].ok).length;
  const p = pct(mastered, c.parts);
  const cont = S.last && S.last !== 'home' ? S.last : (D.CONCEPTS.find(x => !S.concepts[x.id] && x.priority === 'high') || D.CONCEPTS[0]).id;
  const contLabel = labelFor(cont);
  const status = (!mastered && !practiced && !lessonsDone && !known) ? 'Not started yet. Begin with a high-priority lesson, then try the matching exam part.'
    : mastered === c.parts ? 'Every exam part is marked as mastered. Take a timed mock exam to check.'
    : 'In progress: ' + mastered + ' of ' + c.parts + ' exam parts mastered, ' + lessonsDone + ' of ' + D.CONCEPTS.length + ' lessons completed, ' + known + ' of ' + c.cards + ' flashcards known.';
  const recent = S.recent.slice(0, 6);
  const weak = revisionItems().slice(0, 5);
  const next = D.CONCEPTS.filter(x => !S.concepts[x.id]).sort((a, b) => ({ high: 0, medium: 1, low: 2 })[a.priority] - ({ high: 0, medium: 1, low: 2 })[b.priority]).slice(0, 5);
  return '' +
  '<section class="card hero">' +
    '<div class="stack" style="gap:12px;min-width:0"><span class="eyebrow">Course reviewer · UC3M Master in Connected Industry 4.0</span>' +
      '<h1>Data Analysis in IC4.0 · Final exam 2024/2025</h1>' +
      '<p class="muted prose">' + esc(status) + '</p>' +
      '<div class="row"><a class="btn primary" href="#' + esc(cont) + '">Continue: ' + esc(contLabel) + '</a><a class="btn" href="#mock">Start mock exam</a></div></div>' +
    '<div class="ring" style="--p:' + p + '" role="img" aria-label="' + p + '% of exam parts mastered"><div><div><b>' + p + '%</b><br><span class="small muted">mastered</span></div></div></div>' +
  '</section>' +
  '<section class="grid g4">' +
    stat(mastered + '/' + c.parts, 'Exam parts mastered', fmt(c.marks, 1) + ' points on the paper') +
    stat(lessonsDone + '/' + D.CONCEPTS.length, 'Lessons completed', 'Across Topics 1–4') +
    stat(fDone + '/' + FORMS.length, 'Formulas practised', 'Worked examples + checks') +
    stat(known + '/' + c.cards, 'Flashcards known', c.diagrams + ' diagram drills') +
  '</section>' +
  '<section class="grid g3">' +
    quick('formulas', 'fx', 'Formulas', FORMS.length + ' illustrated formula cards') +
    quick('cards', 'cards', 'Flashcards', known + ' of ' + c.cards + ' known') +
    quick('write', 'write', 'Written practice', c.writable + ' questions with feedback') +
    quick('calc', 'calc', 'Exam calculators', 'Q2(i), Q2(ii), Q4(iii)') +
    quick('diagrams', 'diag', 'Graphs & diagrams', c.diagrams + ' drills with sketch pad') +
    quick('mock', 'mock', 'Mock exam', c.parts + ' parts, optional timer') +
  '</section>' +
  '<section class="stack"><div class="row between"><h2>Topics</h2><span class="small muted">Only what the paper needs</span></div><div class="grid g4">' +
    D.TOPICS.map(t => { const tp = topicProgress(t.id); return '<a class="card topic-card" href="#' + t.id + '"><div class="row between"><span class="tnum">0' + t.n + '</span><span class="small muted num">' + tp.done + '/' + tp.total + '</span></div><h3>' + esc(t.title) + '</h3><p class="small muted">' + esc(t.blurb) + '</p><div class="progress" role="img" aria-label="' + pct(tp.done, tp.total) + '% complete"><i style="width:' + pct(tp.done, tp.total) + '%"></i></div></a>'; }).join('') +
  '</div></section>' +
  '<section class="grid g2">' +
    '<div class="card stack"><h3>Next up</h3>' + (next.length ? '<ul class="list-plain">' + next.map(x => '<li><a href="#' + x.id + '">' + esc(x.title) + '</a><span class="row" style="gap:6px"><span class="chip">T' + topicById(x.topic).n + '</span>' + badge(x.priority) + '</span></li>').join('') + '</ul>' : '<div class="empty">All lessons completed.</div>') + '</div>' +
    '<div class="card stack"><div class="row between"><h3>Needs revision</h3><a class="small" href="#revision">Open queue</a></div>' + (weak.length ? '<ul class="list-plain">' + weak.map(w => '<li><a href="#' + esc(w.href) + '">' + esc(w.label) + '</a><span class="chip ' + w.cls + '">' + esc(w.why) + '</span></li>').join('') + '</ul>' : '<div class="empty">No weak areas yet. They appear after you check answers, mark flashcards or rate diagrams.</div>') + '</div>' +
  '</section>' +
  '<section class="card stack"><h3>Recently studied</h3>' + (recent.length ? '<ul class="list-plain">' + recent.map(r => '<li><a href="#' + esc(r.id) + '">' + esc(r.label || labelFor(r.id)) + '</a><span class="small muted">' + ago(r.t) + '</span></li>').join('') + '</ul>' : '<div class="empty">Nothing yet. Your last six visits will show here.</div>') + '</section>' +
  (S.mock.history.length ? '<p class="small muted">Last mock exam: ' + new Date(S.mock.history[0].t).toLocaleDateString() + ', estimated ' + fmt(S.mock.history[0].est, 2) + ' / ' + fmt(S.mock.history[0].estMax, 2) + ' on auto-checked parts.</p>' : '');
};
function stat(n, l, sub) { return '<div class="card stack" style="gap:2px"><span class="statnum">' + n + '</span><b class="small">' + esc(l) + '</b><span class="small muted">' + esc(sub) + '</span></div>'; }
function quick(href, ic, t, sub) { return '<a class="tile" href="#' + href + '"><span class="qi">' + ico(ic) + '</span><span class="stack" style="gap:0;min-width:0"><b>' + esc(t) + '</b><span class="small muted">' + esc(sub) + '</span></span></a>'; }
function ago(t) { const s = (Date.now() - t) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' d ago'; }
function labelFor(r) {
  const q = qById(r); if (q) return qLabel(q);
  const d = dById(r); if (d) return d.title;
  const t = topicById(r); if (t) return 'Topic ' + t.n;
  const c = cById(r); if (c) return c.title;
  const f = fById(r); if (f) return f.title;
  return ({ exam: 'Exam breakdown', cards: 'Flashcards', write: 'Written practice', calc: 'Exam calculators', formulas: 'Formulas', diagrams: 'Graphs & diagrams', mock: 'Mock exam', revision: 'Revision', sources: 'Sources' })[r] || r;
}

/* ---------------- exam breakdown ---------------- */
VIEWS.exam = function () {
  const ex = [1, 2, 3, 4];
  return head('Exam breakdown · ' + D.EXAM_META.title, 'Exam breakdown', 'Every question and subquestion from the paper, in order, with original wording and marks. Open a part for the explanation, model answer, checklist and practice.') +
    '<details class="acc"><summary>Notes on the paper (' + D.EXAM_META.notes.length + ')</summary><div class="acc-body"><ul class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px">' + D.EXAM_META.notes.map(n => '<li>' + esc(n) + '</li>').join('') + '</ul></div></details>' +
    ex.map(e => {
      const parts = D.Q.filter(q => q.ex === e);
      const tot = parts.reduce((a, q) => a + q.marks, 0);
      return '<section class="card" style="padding:0;overflow:hidden"><div style="padding:18px 18px 12px" class="stack"><div class="row between"><h2>Exercise ' + e + '</h2><span class="marks">' + fmt(tot, 1) + ' points</span></div>' + (parts[0].exHead ? '<p class="small muted">' + esc(parts[0].exHead) + '</p>' : '') + '</div>' +
        parts.map(q => { const st = qs(q.id); return '<a class="qrow" href="#' + q.id + '"><span class="qid">' + esc(qLabel(q)) + '</span><span class="stack" style="gap:4px;min-width:0"><span>' + esc(q.text) + '</span><span class="row" style="gap:6px"><span class="chip">' + esc(q.format) + '</span>' + q.topics.map(t => '<span class="chip acc">Topic ' + topicById(t).n + '</span>').join('') + (q.calc && q.calc !== 'choose' ? '<span class="chip warn">Needs figure values</span>' : '') + '</span></span><span class="stack" style="gap:6px;align-items:flex-end"><span class="marks">' + fmt(q.marks, 1) + ' pt</span><span class="status-dots" title="studied · practised · mastered"><i class="' + (st.studied ? 'on' : '') + '"></i><i class="' + (st.practiced ? 'on' : '') + '"></i><i class="' + (st.mastered ? 'm' : '') + '"></i></span></span></a>'; }).join('') +
      '</section>';
    }).join('');
};

function viewQuestion(id) {
  const q = qById(id); const st = qs(id);
  touch('q', id, qLabel(q) + ' · ' + q.text.slice(0, 48) + '…');
  const parts = D.Q; const i = parts.indexOf(q);
  const prev = parts[i - 1], next = parts[i + 1];
  const cards = D.CARDS.filter(c => q.topics.includes(c.topic)).slice(0, 4);
  return '<nav class="crumbs" aria-label="Breadcrumb"><a href="#exam">Exam breakdown</a><span>/</span><span>Exercise ' + q.ex + '</span></nav><div class="row between"><a href="#exam" class="btn sm ghost">← All questions</a><div class="row">' + (prev ? '<a class="btn sm" href="#' + prev.id + '">← ' + esc(qLabel(prev)) + '</a>' : '') + (next ? '<a class="btn sm" href="#' + next.id + '">' + esc(qLabel(next)) + ' →</a>' : '') + '</div></div>' +
  '<section class="card raised stack">' +
    '<div class="row between"><div class="row"><h1 style="font-size:1.6rem">' + esc(qLabel(q)) + '</h1><span class="chip">' + fmt(q.marks, 1) + ' points</span><span class="chip">' + esc(q.format) + '</span></div>' +
    '<div class="row" role="group" aria-label="Progress for this question">' +
      '<button class="btn sm" data-st="studied" aria-pressed="' + st.studied + '">Studied</button>' +
      '<button class="btn sm" data-st="practiced" aria-pressed="' + st.practiced + '">Practised</button>' +
      '<button class="btn sm" data-st="mastered" aria-pressed="' + st.mastered + '">Mastered</button></div></div>' +
    (q.exHead ? '<p class="small muted">' + esc(q.exHead) + '</p>' : '') +
    '<p class="qtext quote">' + esc(q.text) + '</p>' +
    (q.table ? tableHTML(q.table) : '') +
    (q.ex === 2 ? patientsTable() : '') +
    '<div class="row small">' + q.topics.map(t => '<a class="chip acc" href="#' + t + '">Topic ' + topicById(t).n + ' · ' + esc(topicById(t).title) + '</a>').join('') + '</div>' +
  '</section>' +
  '<div class="tabs" role="tablist">' + ['Explanation', 'Model answer', 'Rubric', 'Practice'].map((t, k) => '<button role="tab" data-tab="' + k + '" aria-selected="' + (k === 0) + '">' + t + '</button>').join('') + '</div>' +
  '<section data-panel="0" class="stack">' +
    '<div class="card stack"><h3>What you need to do</h3><p>' + esc(q.explain) + '</p>' +
      '<div class="sec"><span class="k">Concepts</span><div class="row">' + q.concepts.map(cid => { const c = cById(cid); return '<a class="chip acc" href="#' + cid + '">' + esc(c.title) + '</a>'; }).join('') + '</div></div>' +
      (FORMS.some(f => f.q.includes(id)) ? '<div class="sec"><span class="k">Formulas</span><div class="stack" style="gap:8px">' + FORMS.filter(f => f.q.includes(id)).map(formulaRowCompact).join('') + '</div></div>' : '') +
      '<div class="sec"><span class="k">Slides</span><div class="row">' + refs(q.refs) + '</div></div>' +
      '<div class="sec"><span class="k">Answer format</span><div>' + esc(q.format) + '</div></div>' +
    '</div>' +
    (q.extNote ? '<div class="notice ext"><div><b>Supplementary (external).</b> ' + esc(q.extNote) + '</div></div>' : '') +
    (q.calc ? '<div class="card stack" id="calcHost"></div>' : '') +
  '</section>' +
  '<section data-panel="1" class="stack" hidden><div class="card stack"><div class="row between"><h3>Model answer</h3><span class="small muted">Written from the slides; not an official solution</span></div><div class="exam-ans prewrap">' + esc(q.model) + '</div><div class="row small muted">Source: ' + refs(q.refs) + '</div></div></section>' +
  '<section data-panel="2" class="stack" hidden><div class="card stack"><h3>Answer checklist</h3>' +
    (q.rubric ? '<p class="small muted">Estimated learning rubric derived from the slides. The paper gives only the marks (' + fmt(q.marks, 1) + ' pt), not a marking scheme.</p><ul class="tick-list">' + q.rubric.map(r => '<li><span class="ico b">' + (r.bonus ? '+' : '•') + '</span><span>' + esc(r.label) + (r.bonus ? ' <span class="chip">bonus</span>' : '') + '</span></li>').join('') + '</ul>'
      : '<p class="small muted">Calculation part. Check: every patient/observation traced correctly · matrix rows observed, columns predicted · totals add up to n · error = off-diagonal / n · final answer stated with a sentence.</p>') +
  '</div></section>' +
  '<section data-panel="3" class="stack" hidden>' +
    (q.rubric ? '<div class="card stack"><h3>Write your answer</h3><textarea class="answer" id="qa-' + id + '" aria-label="Your answer" placeholder="Answer as you would on paper…">' + esc(S.drafts[id] || '') + '</textarea><div class="row"><button class="btn primary" id="qsubmit">Check answer</button><a class="btn" href="#write" data-write="' + id + '">Open in written practice</a></div><div id="qfb"></div></div>' :
      '<div class="card stack"><p>This part is a calculation. Use the calculator in the Explanation tab, then write the final matrix and error as you would on paper in the <a href="#mock">mock exam</a>.</p></div>') +
    '<div class="card stack"><h3>Related flashcards</h3><ul class="list-plain">' + cards.map(c => '<li><span>' + esc(c.q) + '</span><a class="small" href="#cards" data-card="' + c.id + '">Study</a></li>').join('') + '</ul></div>' +
    '<div class="card stack"><h3>Related diagrams</h3><div class="row">' + D.DIAGRAMS.filter(d => d.q.includes(id) || q.concepts.some(cid => (cById(cid) || {}).visual === d.id)).map(d => '<a class="chip acc" href="#' + d.id + '">' + esc(d.title) + '</a>').join('') + '</div></div>' +
  '</section>';
}
function afterQuestion(id) {
  const q = qById(id);
  $$('[data-tab]').forEach(b => b.addEventListener('click', () => {
    $$('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === b));
    $$('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== b.dataset.tab);
    if (b.dataset.tab === '1' && !qs(id).studied) { qs(id).studied = true; save(); syncStatusBtns(id); }
  }));
  $$('[data-st]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.st; const st = qs(id); st[k] = !st[k];
    if (k === 'mastered' && st.mastered) { st.studied = true; st.practiced = true; }
    save(); syncStatusBtns(id); renderNav(id); toast(st[k] ? 'Marked as ' + k : 'Unmarked ' + k);
  }));
  $$('[data-open]').forEach(a => a.addEventListener('click', () => { sessionStorageSet('openConcept', a.dataset.open); }));
  $$('[data-card]').forEach(a => a.addEventListener('click', () => { const i = D.CARDS.findIndex(c => c.id === a.dataset.card); S.fcFilter = 'all'; S.fcMode = 'all'; S.fcIdx = i; S.fcOrder = null; save(true); }));
  $$('[data-write]').forEach(a => a.addEventListener('click', () => { S.writeSel = a.dataset.write; save(true); }));
  const ta = $('#qa-' + id);
  if (ta) {
    ta.addEventListener('input', () => { S.drafts[id] = ta.value; save(); });
    $('#qsubmit').addEventListener('click', () => {
      const res = grade(q, ta.value);
      if (!ta.value.trim()) { toast('Write an answer first'); return; }
      recordAttempt(id, ta.value, res.score);
      $('#qfb').innerHTML = feedbackHTML(q, res, ta.value);
      syncStatusBtns(id);
    });
  }
  if (q.calc) mountCalc(q.calc, $('#calcHost'));
}
function syncStatusBtns(id) { const st = qs(id); $$('[data-st]').forEach(b => b.setAttribute('aria-pressed', !!st[b.dataset.st])); }
function recordAttempt(id, text, score) {
  const st = qs(id); st.practiced = true; st.attempts.push({ t: Date.now(), score, len: text.length }); st.attempts = st.attempts.slice(-10); st.last = score;
  if (score >= 0.8) { st.mastered = true; st.studied = true; toast('Strong answer: marked as mastered'); } else toast('Answer checked');
  save(); renderNav(location.hash.slice(1));
}
function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { window.__ss = window.__ss || {}; window.__ss[k] = v; } }
function sessionStorageTake(k) { let v = null; try { v = sessionStorage.getItem(k); sessionStorage.removeItem(k); } catch (e) { v = (window.__ss || {})[k] || null; if (window.__ss) delete window.__ss[k]; } return v; }

function tableHTML(t) {
  return '<div class="stack" style="gap:6px"><div class="tbl-wrap"><table><thead><tr>' + t.head.map(h => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + t.rows.map(r => '<tr>' + r.map((c, i) => i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' + (t.caption ? '<span class="small muted">' + esc(t.caption) + '</span>' : '') + '</div>';
}
function patientsTable() {
  return '<div class="stack" style="gap:6px"><div class="tbl-wrap"><table><thead><tr><th></th>' + D.PATIENTS.map(p => '<th>Patient ' + p.id + '</th>').join('') + '</tr></thead><tbody>' +
    D.PATIENT_VARS.concat(['HeartDisease']).map(v => '<tr><th scope="row">' + v + '</th>' + D.PATIENTS.map(p => '<td' + (v === 'HeartDisease' ? ' class="' + (p[v] ? 'bad-t' : 'ok-t') + '"' : '') + '>' + esc(p[v]) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table></div><span class="small muted">Table 1 (from the exam): new patient data, used as the test set.</span></div>';
}

/* ---------------- calculators ---------------- */
VIEWS.calc = function () {
  return head('Practise · calculation parts', 'Exam calculators', 'The exam\'s Figures 1–3 are images that could not be read from the project text, so their numbers are not built in. Type the values from your copy of the paper; the calculators do the arithmetic the question asks for and show each step.') +
    '<section class="card stack"><div class="row between"><h2>Q2(i) · Classification tree</h2><a class="small" href="#q2i">Question</a></div><div id="calc-tree"></div></section>' +
    '<section class="card stack"><div class="row between"><h2>Q2(ii) · Logistic regression, cutoff 0.45</h2><a class="small" href="#q2ii">Question</a></div><div id="calc-logit"></div></section>' +
    '<section class="card stack"><div class="row between"><h2>Q2(iii) · Which method?</h2><a class="small" href="#q2iii">Question</a></div><div id="calc-choose"></div></section>' +
    '<section class="card stack"><div class="row between"><h2>Q4(iii) · Test MSE of models A, B, C</h2><a class="small" href="#q4iii">Question</a></div><div id="calc-lin"></div></section>';
};
AFTER.calc = () => { mountCalc('tree', $('#calc-tree')); mountCalc('logit', $('#calc-logit')); mountCalc('choose', $('#calc-choose')); mountCalc('lin', $('#calc-lin')); };
function mountCalc(kind, host) { if (!host) return; ({ tree: calcTree, logit: calcLogit, choose: calcChoose, lin: calcLin })[kind](host); }

function confusion(obs, pred) {
  const m = { n00: 0, n01: 0, n10: 0, n11: 0 };
  obs.forEach((o, i) => { m['n' + o + pred[i]]++; });
  const n = obs.length, n0 = m.n00 + m.n01, n1 = m.n10 + m.n11;
  return Object.assign(m, { n, n0, n1, p0: m.n00 + m.n10, p1: m.n01 + m.n11, err: (m.n01 + m.n10) / n, sens: n1 ? m.n11 / n1 : null, spec: n0 ? m.n00 / n0 : null });
}
function cmHTML(m, title) {
  return '<div class="stack" style="gap:6px"><b>' + esc(title || 'Confusion matrix') + '</b><div class="tbl-wrap" style="max-width:460px"><table><thead><tr><th></th><th>Predicted 0</th><th>Predicted 1</th><th>Total</th></tr></thead><tbody>' +
    '<tr><th scope="row">Observed 0</th><td>' + m.n00 + ' <span class="muted small">TN</span></td><td>' + m.n01 + ' <span class="muted small">FP</span></td><td>' + m.n0 + '</td></tr>' +
    '<tr><th scope="row">Observed 1</th><td>' + m.n10 + ' <span class="muted small">FN</span></td><td>' + m.n11 + ' <span class="muted small">TP</span></td><td>' + m.n1 + '</td></tr>' +
    '<tr><th scope="row">Total</th><td>' + m.p0 + '</td><td>' + m.p1 + '</td><td>' + m.n + '</td></tr></tbody></table></div>' +
    '<div class="exam-ans"><span class="mono">Test error = (n01 + n10) / n = (' + m.n01 + ' + ' + m.n10 + ') / ' + m.n + ' = ' + fmt(m.err, 2) + ' (' + Math.round(m.err * 100) + '%)</span><br><span class="small muted">Sensitivity = ' + m.n11 + '/' + m.n1 + ' = ' + fmt(m.sens, 2) + ' · Specificity = ' + m.n00 + '/' + m.n0 + ' = ' + fmt(m.spec, 2) + '</span></div></div>';
}
const OBS = D.PATIENTS.map(p => p.HeartDisease);

function calcTree(host) {
  const st = S.calc.tree;
  const draw = () => {
    const done = st.pred.every(v => v === 0 || v === 1);
    host.innerHTML = '<p class="small muted">Trace each patient through Figure 1 (root → leaf) and choose the leaf class. Practise the tracing skill on the <a href="#d-tree">tree diagram drill</a> first.</p>' +
      '<div class="tbl-wrap"><table><thead><tr><th></th>' + D.PATIENTS.map(p => '<th>Patient ' + p.id + '</th>').join('') + '</tr></thead><tbody>' +
      ['ST_Slope', 'ChestPainType', 'Oldpeak', 'MaxHR', 'ExerciseAngina', 'Sex', 'Age'].map(v => '<tr><th scope="row">' + v + '</th>' + D.PATIENTS.map(p => '<td>' + esc(p[v]) + '</td>').join('') + '</tr>').join('') +
      '<tr><th scope="row">Predicted (leaf)</th>' + D.PATIENTS.map((p, i) => '<td><select data-tp="' + i + '" aria-label="Predicted class for patient ' + p.id + '"><option value="">—</option><option value="0"' + (st.pred[i] === 0 ? ' selected' : '') + '>0</option><option value="1"' + (st.pred[i] === 1 ? ' selected' : '') + '>1</option></select></td>').join('') + '</tr>' +
      '<tr><th scope="row">Observed</th>' + OBS.map(o => '<td><b>' + o + '</b></td>').join('') + '</tr>' +
      (done ? '<tr><th scope="row">Correct?</th>' + OBS.map((o, i) => '<td class="' + (o === st.pred[i] ? 'ok-t">✓' : 'bad-t">✕') + '</td>').join('') + '</tr>' : '') +
      '</tbody></table></div>' +
      '<p class="small muted">Showing the variables most often used in heart-disease trees; the full Table 1 is in the question. Use whichever variables Figure 1 splits on.</p>' +
      (done ? cmHTML(confusion(OBS, st.pred), 'Classification tree — confusion matrix (test set, n = 5)') : '<div class="empty">Choose a predicted class for all 5 patients to see the confusion matrix and test error.</div>') +
      '<div class="row"><button class="btn sm" data-reset>Clear predictions</button></div>';
    refreshChoose();
    $$('[data-tp]', host).forEach(s => s.addEventListener('change', () => { st.pred[+s.dataset.tp] = s.value === '' ? null : +s.value; save(); if (st.pred.every(v => v === 0 || v === 1)) { qs('q2i').practiced = true; } draw(); }));
    $('[data-reset]', host).addEventListener('click', () => { st.pred = [null, null, null, null, null]; save(); draw(); });
  };
  draw();
}
function logitResult() {
  const st = S.calc.logit;
  const b0 = parseFloat(st.b0); const cut = parseFloat(st.cut);
  const rows = st.rows.filter(r => r.v && r.b !== '' && isFinite(parseFloat(r.b)));
  if (!isFinite(b0) || !rows.length || !isFinite(cut)) return null;
  const per = D.PATIENTS.map(p => {
    const terms = rows.map(r => { const V = D.LOGIT_VARS.find(x => x.key === r.v); const x = V.f(p); return { key: r.v, x, b: parseFloat(r.b), prod: x * parseFloat(r.b) }; });
    const eta = b0 + terms.reduce((a, t) => a + t.prod, 0);
    const prob = 1 / (1 + Math.exp(-eta));
    return { p, terms, eta, prob, pred: prob > cut ? 1 : 0, tie: Math.abs(prob - cut) < 1e-9 };
  });
  return { per, cut, m: confusion(OBS, per.map(r => r.pred)), nvars: rows.length };
}
function calcLogit(host) {
  const st = S.calc.logit;
  const opts = sel => '<option value="">Choose variable…</option>' + D.LOGIT_VARS.map(v => '<option value="' + v.key + '"' + (sel === v.key ? ' selected' : '') + '>' + esc(v.label) + '</option>').join('');
  const draw = () => {
    const r = logitResult();
    host.innerHTML = '<p class="small muted">Enter the intercept and the four coefficients from Figure 2. Categorical variables appear in R output as dummies (e.g. <span class="mono">SexM</span>, <span class="mono">ST_SlopeUp</span>, <span class="mono">ExerciseAnginaY</span>): pick the matching dummy and the calculator sets it to 1 or 0 for each patient.</p>' +
      '<div class="grid g3"><label class="field">Intercept β̂0<input id="lg-b0" inputmode="decimal" value="' + esc(st.b0) + '" placeholder="e.g. from Figure 2"></label><label class="field">Cutoff z<input id="lg-cut" inputmode="decimal" value="' + esc(st.cut) + '"></label></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>#</th><th>Variable (as in Figure 2)</th><th>Coefficient β̂</th></tr></thead><tbody>' +
      st.rows.map((row, i) => '<tr><td>' + (i + 1) + '</td><td><select data-lv="' + i + '" aria-label="Variable ' + (i + 1) + '">' + opts(row.v) + '</select></td><td><input data-lb="' + i + '" inputmode="decimal" value="' + esc(row.b) + '" aria-label="Coefficient ' + (i + 1) + '"></td></tr>').join('') +
      '</tbody></table></div>' +
      (r ? (r.nvars < 4 ? '<div class="notice warn">Only ' + r.nvars + ' of 4 variables entered. The question says the model has four.</div>' : '') +
        '<div class="tbl-wrap"><table><thead><tr><th>Patient</th><th>η = β̂0 + Σ β̂x</th><th>P(Y=1|x) = 1/(1+e^−η)</th><th>ŷ (P > ' + fmt(r.cut, 3) + ')</th><th>Observed</th><th></th></tr></thead><tbody>' +
        r.per.map(x => '<tr><td>' + x.p.id + '</td><td class="mono">' + fmt(st.b0, 4) + x.terms.map(t => ' ' + (t.b < 0 ? '−' : '+') + ' ' + fmt(Math.abs(t.b), 4) + '·' + fmt(t.x, 2)).join('') + ' = <b>' + fmt(x.eta, 4) + '</b></td><td class="mono"><b>' + fmt(x.prob, 4) + '</b></td><td><b>' + x.pred + '</b>' + (x.tie ? ' <span class="chip warn">= cutoff</span>' : '') + '</td><td>' + x.p.HeartDisease + '</td><td class="' + (x.pred === x.p.HeartDisease ? 'ok-t">✓' : 'bad-t">✕') + '</td></tr>').join('') +
        '</tbody></table></div>' + cmHTML(r.m, 'Logistic regression — confusion matrix (test set, n = 5)')
        : '<div class="empty">Enter the intercept and at least one variable with its coefficient to compute probabilities.</div>') +
      '<div class="row"><button class="btn sm" data-reset>Clear</button></div>';
    refreshChoose();
    const upd = () => { save(); if (logitResult()) qs('q2ii').practiced = true; };
    $('#lg-b0', host).addEventListener('change', e => { st.b0 = e.target.value.trim(); upd(); draw(); });
    $('#lg-cut', host).addEventListener('change', e => { st.cut = e.target.value.trim(); upd(); draw(); });
    $$('[data-lv]', host).forEach(s => s.addEventListener('change', () => { st.rows[+s.dataset.lv].v = s.value; upd(); draw(); }));
    $$('[data-lb]', host).forEach(s => s.addEventListener('change', () => { st.rows[+s.dataset.lb].b = s.value.trim(); upd(); draw(); }));
    $('[data-reset]', host).addEventListener('click', () => { S.calc.logit = { b0: '', rows: [{ v: '', b: '' }, { v: '', b: '' }, { v: '', b: '' }, { v: '', b: '' }], cut: '0.45' }; save(); calcLogit(host); });
  };
  draw();
}
function refreshChoose() { const h = $('#calc-choose'); if (h) calcChoose(h); }
function calcChoose(host) {
  const t = S.calc.tree.pred.every(v => v === 0 || v === 1) ? confusion(OBS, S.calc.tree.pred) : null;
  const lr = logitResult(); const l = lr ? lr.m : null;
  if (!t || !l) { host.innerHTML = '<div class="empty">Complete the tree calculator (Q2(i)) and the logistic calculator (Q2(ii)) first. ' + (!t ? 'Tree: missing. ' : 'Tree: done. ') + (!l ? 'Logistic: missing.' : 'Logistic: done.') + '</div>'; return; }
  let pick, why;
  if (t.err < l.err) { pick = 'the classification tree'; why = 'it has the lower test error (' + fmt(t.err, 2) + ' vs ' + fmt(l.err, 2) + ')'; }
  else if (l.err < t.err) { pick = 'logistic regression'; why = 'it has the lower test error (' + fmt(l.err, 2) + ' vs ' + fmt(t.err, 2) + ')'; }
  else if ((t.sens || 0) !== (l.sens || 0)) { pick = (t.sens > l.sens ? 'the classification tree' : 'logistic regression'); why = 'both have test error ' + fmt(t.err, 2) + ', but it has higher sensitivity (' + fmt(Math.max(t.sens, l.sens), 2) + ' vs ' + fmt(Math.min(t.sens, l.sens), 2) + '), so it misses fewer patients with heart disease'; }
  else { pick = 'either method; I would choose the classification tree'; why = 'both have the same test error (' + fmt(t.err, 2) + ') and the same sensitivity, and the tree is easier to interpret (T3 s52)'; }
  host.innerHTML = '<div class="grid g2"><div class="exam-ans small"><b>Tree:</b> error ' + fmt(t.err, 2) + ', sensitivity ' + fmt(t.sens, 2) + ', specificity ' + fmt(t.spec, 2) + '</div><div class="exam-ans small"><b>Logistic:</b> error ' + fmt(l.err, 2) + ', sensitivity ' + fmt(l.sens, 2) + ', specificity ' + fmt(l.spec, 2) + '</div></div>' +
    '<div><div class="eyebrow">Suggested written answer (from your numbers)</div><div class="exam-ans">I select ' + pick + ', because ' + why + '. The test error estimates how well each rule classifies new patients. However, the test set has only 5 patients, so this comparison is not very reliable; a larger test set or cross-validation would be needed to confirm it.</div></div>';
}
function linResult() {
  const st = S.calc.lin; const out = {};
  ['A', 'B', 'C'].forEach(k => {
    const coefs = D.LIN_MODELS[k]; const ticked = st.cols[k].map((v, i) => v ? i : -1).filter(i => i >= 0);
    const need = coefs.length - 1;
    if (ticked.length !== need) { out[k] = { ok: false, need, have: ticked.length }; return; }
    const beta = {}; ticked.forEach((col, j) => beta[D.LIN_VARS[col]] = coefs[j + 1]);
    const rows = st.obs.filter(o => o.lpsa !== '' && isFinite(parseFloat(o.lpsa)));
    const preds = []; let missing = false;
    rows.forEach(o => {
      let y = coefs[0];
      Object.keys(beta).forEach(v => { const x = parseFloat(o[v]); if (!isFinite(x)) missing = true; y += beta[v] * x; });
      preds.push({ y: parseFloat(o.lpsa), yhat: y, se: Math.pow(parseFloat(o.lpsa) - y, 2) });
    });
    out[k] = { ok: true, beta, b0: coefs[0], preds, missing, mse: preds.length && !missing ? preds.reduce((a, p) => a + p.se, 0) / preds.length : null };
  });
  return out;
}
function calcLin(host) {
  const st = S.calc.lin;
  const draw = () => {
    const r = linResult();
    const best = ['A', 'B', 'C'].filter(k => r[k].ok && r[k].mse != null).sort((a, b) => r[a].mse - r[b].mse);
    host.innerHTML = '<p class="small muted"><b>Step 1.</b> Table 2 numbers were extracted in column order, but the shading showing which columns each model uses was lost. Tick the filled columns for each model in your copy; the numbers are assigned left to right.</p>' +
      '<div class="tbl-wrap"><table><thead><tr><th>Model</th><th>Intercept</th>' + D.LIN_VARS.map(v => '<th>' + v + '</th>').join('') + '<th>Equation</th></tr></thead><tbody>' +
      ['A', 'B', 'C'].map(k => '<tr><th scope="row">' + k + ' <span class="small muted">(' + D.LIN_MODELS[k].join(', ') + ')</span></th><td class="mono">' + D.LIN_MODELS[k][0] + '</td>' + D.LIN_VARS.map((v, i) => '<td><input type="checkbox" data-lc="' + k + i + '" ' + (st.cols[k][i] ? 'checked' : '') + ' aria-label="Model ' + k + ' uses ' + v + '" style="min-width:0;width:auto"></td>').join('') +
        '<td class="mono small">' + (r[k].ok ? 'ŷ = ' + r[k].b0 + Object.keys(r[k].beta).map(v => ' ' + (r[k].beta[v] < 0 ? '−' : '+') + ' ' + Math.abs(r[k].beta[v]) + '·' + v).join('') : '<span class="bad-t">tick ' + r[k].need + ' columns (' + r[k].have + ' ticked)</span>') + '</td></tr>').join('') +
      '</tbody></table></div>' +
      '<p class="small muted"><b>Step 2.</b> Enter the test observations from Figure 3 (only the variables the models use are needed).</p>' +
      '<div class="tbl-wrap"><table><thead><tr><th>#</th><th>lpsa (y)</th>' + D.LIN_VARS.map(v => '<th>' + v + '</th>').join('') + '<th></th></tr></thead><tbody>' +
      st.obs.map((o, i) => '<tr><td>' + (i + 1) + '</td><td><input data-lo="' + i + '|lpsa" inputmode="decimal" value="' + esc(o.lpsa) + '" aria-label="Observation ' + (i + 1) + ' lpsa"></td>' + D.LIN_VARS.map(v => '<td><input data-lo="' + i + '|' + v + '" inputmode="decimal" value="' + esc(o[v]) + '" aria-label="Observation ' + (i + 1) + ' ' + v + '"></td>').join('') + '<td><button class="btn sm ghost" data-ldel="' + i + '" aria-label="Remove observation ' + (i + 1) + '">✕</button></td></tr>').join('') +
      '</tbody></table></div><div class="row"><button class="btn sm" data-ladd>+ Add observation</button><button class="btn sm" data-reset>Clear all</button></div>' +
      '<p class="small muted"><b>Step 3.</b> Test MSE = (1/t) Σ (yᵢ − ŷᵢ)²</p>' +
      '<div class="grid g3">' + ['A', 'B', 'C'].map(k => '<div class="exam-ans small"><b>Model ' + k + '</b><br>' + (!r[k].ok ? '<span class="muted">Columns not set.</span>' : !r[k].preds.length ? '<span class="muted">No observations yet.</span>' : r[k].missing ? '<span class="bad-t">Missing a value for one of: ' + Object.keys(r[k].beta).join(', ') + '</span>' :
        r[k].preds.map((p, i) => '<span class="mono">#' + (i + 1) + ': ŷ = ' + fmt(p.yhat, 3) + ', (y−ŷ)² = ' + fmt(p.se, 4) + '</span>').join('<br>') + '<br><b class="mono">MSE = ' + fmt(r[k].mse, 4) + '</b>') + '</div>').join('') + '</div>' +
      (best.length === 3 ? '<div><div class="eyebrow">Suggested written answer (from your numbers)</div><div class="exam-ans">Model ' + best[0] + ' is the best, because it has the smallest test MSE (' + fmt(r[best[0]].mse, 4) + ', vs ' + best.slice(1).map(k => fmt(r[k].mse, 4) + ' for ' + k).join(' and ') + '). The test MSE measures prediction error on observations not used to fit the models, which is what we want to minimise. ' + (best[0] === 'A' ? 'This agrees with Cp, BIC and Adjusted R² in (ii).' : 'This differs from (ii), where Model A was best on Cp, BIC and Adjusted R²; those are only indirect estimates of test error, but with so few test observations the test MSE is itself a noisy estimate.') + '</div></div>' : '');
    $$('[data-lc]', host).forEach(c => c.addEventListener('change', () => { const k = c.dataset.lc[0], i = +c.dataset.lc.slice(1); st.cols[k][i] = c.checked; save(); draw(); }));
    $$('[data-lo]', host).forEach(inp => inp.addEventListener('change', () => { const [i, v] = inp.dataset.lo.split('|'); st.obs[+i][v] = inp.value.trim(); save(); if (Object.values(linResult()).every(m => m.ok && m.mse != null)) qs('q4iii').practiced = true; draw(); }));
    $$('[data-ldel]', host).forEach(b => b.addEventListener('click', () => { st.obs.splice(+b.dataset.ldel, 1); if (!st.obs.length) st.obs.push(blankObs()); save(); draw(); }));
    $('[data-ladd]', host).addEventListener('click', () => { st.obs.push(blankObs()); save(); draw(); });
    $('[data-reset]', host).addEventListener('click', () => { S.calc.lin = { cols: { A: Array(8).fill(false), B: Array(8).fill(false), C: Array(8).fill(false) }, obs: [blankObs(), blankObs()] }; save(); calcLin(host); });
  };
  draw();
}

/* ---------------- topics ---------------- */
D.TOPICS.forEach(t => { VIEWS[t.id] = () => viewTopic(t.id); });
function viewTopic(tid) {
  const t = topicById(tid);
  touch('t', tid, 'Topic ' + t.n + ' · ' + t.title);
  const cs = D.CONCEPTS.filter(c => c.topic === tid);
  const tp = topicProgress(tid);
  const fs = FORMS.filter(f => f.topic === tid);
  return head('Course reviewer · Topic ' + t.n + ' · ' + t.file + ' · ' + t.slides + ' slides', t.title, esc(t.blurb)) +
    '<div class="row"><div class="progress" style="flex:1;max-width:340px" role="img" aria-label="' + pct(tp.done, tp.total) + '% complete"><i style="width:' + pct(tp.done, tp.total) + '%"></i></div><span class="small muted num">' + tp.done + ' of ' + tp.total + ' (lessons completed + linked exam parts mastered)</span></div>' +
    '<section class="stack"><h2>Lessons</h2><div class="card" style="padding:0">' + cs.map((c, i) => '<a class="topicrow" href="#' + c.id + '"><span class="check-ico' + (S.concepts[c.id] ? ' on' : '') + '" aria-label="' + (S.concepts[c.id] ? 'Completed' : 'Not completed') + '">✓</span><span class="stack" style="gap:3px;min-width:0"><b>' + esc(c.title) + '</b><span class="small muted">' + esc(c.quick) + '</span></span><span class="row" style="gap:6px;justify-content:flex-end">' + badge(c.priority) + (c.ext ? '<span class="chip ext">Supplementary</span>' : '') + '</span></a>').join('') + '</div></section>' +
    (fs.length ? '<section class="stack"><div class="row between"><h2>Formulas in this topic</h2><a class="btn ghost" href="#formulas">All formulas →</a></div><div class="card" style="padding:0">' + fs.map(formulaRow).join('') + '</div></section>' : '') +
    '<details class="acc"><summary><span class="badge plain">Not on this paper</span> Other Topic ' + t.n + ' material</summary><div class="acc-body"><p class="small muted">These slides are part of the course, but no exam question needs them, so they are not taught here.</p><ul class="dots small">' + D.NOT_EXAMINED[tid].map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div></details>' +
    '<p class="small muted">Priorities are a study guide based on how many exam marks rely on each idea. They are not a prediction of the next paper.</p>';
}
function formulaRow(f) {
  const done = S.fpractice[f.id] && S.fpractice[f.id].ok;
  return '<a class="formula-row" href="#' + f.id + '"><span class="stack" style="gap:2px;min-width:0"><b>' + esc(f.title) + '</b><span class="math">' + f.html + '</span></span><span class="row" style="gap:6px;justify-content:flex-end">' + badge(f.priority) + (done ? '<span class="badge done">Practised</span>' : '') + '</span></a>';
}
function formulaRowCompact(f) { return '<a class="card flat stack" style="gap:4px;text-decoration:none;color:var(--fg);padding:12px 14px" href="#' + f.id + '"><b class="small">' + esc(f.title) + ' →</b><div class="math" style="overflow-x:auto">' + f.html + '</div></a>'; }
function lsec(n, title, body, open) { return '<details class="lsec"' + (open === false ? '' : ' open') + '><summary><span class="sec-n">' + n + '</span>' + esc(title) + '</summary><div class="lbody">' + body + '</div></details>'; }
function formulaMini(f) {
  if (!f) return '';
  return '<div class="card flat stack" style="gap:10px"><div class="row between"><b>' + esc(f.title) + '</b><a class="btn ghost sm" href="#' + f.id + '">Open formula card →</a></div><div class="fblock sm" style="background:var(--surface)">' + f.html + '</div><p class="small prose">' + esc(f.plain) + '</p></div>';
}
function figHTML(kind, title, type, caption) {
  return '<figure class="fig"><div class="fig-t"><span>' + esc(title) + '</span><span>' + esc(srcLabel(type)) + '</span></div><div class="dg">' + FIG[kind]() + '</div>' + (caption ? '<figcaption>' + caption + '</figcaption>' : '') + '</figure>';
}
function viewLesson(id) {
  const c = cById(id); const t = topicById(c.topic);
  touch('c', id, c.title);
  const list = D.CONCEPTS.filter(x => x.topic === c.topic); const i = list.indexOf(c);
  const gi = D.CONCEPTS.indexOf(c); const prev = D.CONCEPTS[gi - 1], next = D.CONCEPTS[gi + 1];
  const done = !!S.concepts[id]; const bm = !!S.bookmarks[id];
  const vis = c.visual ? dById(c.visual) : null;
  const cards = (c.cards || []).map(cid => D.CARDS.find(x => x.id === cid)).filter(Boolean).slice(0, 3);
  const visual = (c.formulas || []).map(fid => formulaMini(fById(fid))).join('') +
    (vis ? '<figure class="fig"><div class="fig-t"><span>' + esc(vis.title) + '</span><span>' + esc(srcLabel(vis.sourceType)) + '</span></div><div class="dg">' + SVG[vis.kind]() + '</div><figcaption>' + esc(vis.what) + ' <a href="#' + vis.id + '">Open the drawing drill →</a></figcaption></figure>' : '') +
    ((!(c.formulas || []).length && !vis) ? '<p class="small muted">This idea is verbal, not visual. Memorise the exam-ready sentence below.</p>' : '');
  return '<nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Course</a><span>/</span><a href="#' + t.id + '">T' + t.n + ' · ' + esc(t.title) + '</a><span>/</span><span>Lesson ' + (i + 1) + ' of ' + list.length + '</span></nav>' +
  '<div class="page-head"><div class="row">' + badge(c.priority) + (c.ext ? '<span class="chip ext">Supplementary</span>' : '') + '<span class="mono small" style="color:var(--fg-3)">' + esc(c.refs.join(' · ')) + '</span></div><h1>' + esc(c.title) + '</h1>' +
    '<div class="row"><button class="btn sm' + (done ? ' on' : '') + '" id="lsDone" aria-pressed="' + done + '">' + (done ? '✓ Completed' : 'Mark as complete') + '</button><button class="btn sm' + (bm ? ' on' : '') + '" id="lsBm" aria-pressed="' + bm + '">' + (bm ? 'Bookmarked' : 'Bookmark') + '</button><span class="small muted">Used in ' + c.q.map(q => '<a href="#' + q + '">' + esc(qLabel(qById(q))) + '</a>').join(', ') + '</span></div></div>' +
  lsec(1, 'Simple explanation', '<p class="prose">' + esc(c.simple) + '</p><div class="stack" style="gap:8px"><span class="eyebrow">How it works</span><ol class="steps">' + c.how.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol></div>') +
  lsec(2, 'Real-world example', '<p class="prose">' + esc(c.example) + '</p>') +
  lsec(3, 'Visual explanation', visual) +
  '<section class="essentials"><span class="callout-t">4 · Exam essentials</span><ul>' + c.details.map(x => '<li>' + esc(x) + '</li>').join('') + '<li><b>' + esc(c.quick) + '</b></li></ul><span class="eyebrow" style="margin-top:4px">Exam-ready sentence</span><div class="exam-ans" style="background:var(--surface)">' + esc(c.exam) + '</div></section>' +
  '<details class="acc"><summary>Key definitions</summary><div class="acc-body"><dl class="defs"><dt>' + esc(c.title) + '</dt><dd>' + esc(c.formal) + '</dd><dt>Terms to use</dt><dd><span class="row" style="gap:6px">' + c.terms.map(x => '<span class="badge plain">' + esc(x) + '</span>').join('') + '</span></dd></dl></div></details>' +
  '<section class="confusion"><span class="callout-t">Common points of confusion</span><ul>' + c.mistakes.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></section>' +
  lsec(5, 'Quick check', cards.length ? cards.map((cd, k) => '<div class="qc"><b>' + (k + 1) + '. ' + esc(cd.q) + '</b><div><button class="btn sm" data-qc="' + k + '" aria-expanded="false">Show answer</button></div><div class="ans" id="qc' + k + '" hidden role="status">' + esc(cd.a) + ' <span class="ref">' + esc(cd.ref) + '</span></div></div>').join('') + '<a class="btn ghost sm" href="#cards">More flashcards →</a>' : '<a class="btn sm" href="#write">Practise in written practice →</a>') +
  '<p class="small muted">Sources: ' + refs(c.refs) + (c.extLink ? ' · <a href="' + esc(c.extLink) + '" target="_blank" rel="noopener">External source ↗</a>' : '') + '</p>' +
  '<nav class="pager" aria-label="Lesson pager">' + (prev ? '<a class="btn" href="#' + prev.id + '">← ' + esc(prev.title) + '</a>' : '<span></span>') + (next ? '<a class="btn primary next" href="#' + next.id + '">' + esc(next.title) + ' →</a>' : '<span></span>') + '</nav>';
}
function afterLesson(id) {
  $('#lsDone').addEventListener('click', e => { const on = !S.concepts[id]; if (on) S.concepts[id] = Date.now(); else delete S.concepts[id]; save(); e.currentTarget.setAttribute('aria-pressed', on); e.currentTarget.classList.toggle('on', on); e.currentTarget.textContent = on ? '✓ Completed' : 'Mark as complete'; renderNav(id); toast(on ? 'Marked as complete' : 'Marked as not complete'); });
  $('#lsBm').addEventListener('click', e => { const on = !S.bookmarks[id]; if (on) S.bookmarks[id] = Date.now(); else delete S.bookmarks[id]; save(); e.currentTarget.setAttribute('aria-pressed', on); e.currentTarget.classList.toggle('on', on); e.currentTarget.textContent = on ? 'Bookmarked' : 'Bookmark'; toast(on ? 'Bookmarked' : 'Bookmark removed'); });
  $$('[data-qc]').forEach(b => b.addEventListener('click', () => { const a = $('#qc' + b.dataset.qc); a.hidden = !a.hidden; b.textContent = a.hidden ? 'Show answer' : 'Hide answer'; b.setAttribute('aria-expanded', !a.hidden); }));
}

/* ---------------- formulas ---------------- */
VIEWS.formulas = function () {
  const done = FORMS.filter(f => S.fpractice[f.id] && S.fpractice[f.id].ok).length;
  return head('Practise · formula cards', 'Formulas', 'Every formula the paper relies on, typeset properly, with a plain-English reading, a variable table, a worked example from the slides, an illustration and a practice check.') +
    '<div class="row"><div class="progress" style="flex:1;max-width:340px" role="img" aria-label="' + pct(done, FORMS.length) + '% practised"><i style="width:' + pct(done, FORMS.length) + '%"></i></div><span class="small muted num">' + done + ' of ' + FORMS.length + ' practised correctly</span></div>' +
    D.TOPICS.filter(t => FORMS.some(f => f.topic === t.id)).map(t => '<section class="stack"><h2>Topic ' + t.n + ' · ' + esc(t.title) + '</h2><div class="card" style="padding:0">' + FORMS.filter(f => f.topic === t.id).map(formulaRow).join('') + '</div></section>').join('') +
    '<p class="small muted">Worked examples use numbers printed on the slides. Practice questions marked "Illustrative numbers" use made-up values for the arithmetic only.</p>';
};
function viewFormula(id) {
  const f = fById(id); const c = cById(f.concept); const t = topicById(f.topic);
  touch('f', id, 'Formula · ' + f.title);
  const i = FORMS.indexOf(f); const prev = FORMS[i - 1], next = FORMS[i + 1];
  const st = S.fpractice[id];
  return '<nav class="crumbs" aria-label="Breadcrumb"><a href="#formulas">Formulas</a><span>/</span><a href="#' + t.id + '">T' + t.n + ' · ' + esc(t.title) + '</a><span>/</span><span>' + (i + 1) + ' of ' + FORMS.length + '</span></nav>' +
  '<div class="page-head"><div class="row">' + badge(f.priority) + (st && st.ok ? '<span class="badge done">Practised</span>' : '') + '<span class="mono small" style="color:var(--fg-3)">' + esc(f.source) + '</span></div><h1>' + esc(f.title) + '</h1>' +
    '<p class="small muted">Used in ' + f.q.map(q => '<a href="#' + q + '">' + esc(qLabel(qById(q))) + '</a>').join(', ') + (c ? ' · Lesson: <a href="#' + c.id + '">' + esc(c.title) + '</a>' : '') + '</p></div>' +
  '<section class="card fcard">' +
    '<div class="fblock" role="math" aria-label="' + esc(f.title) + '">' + f.html + '</div>' +
    (f.altHtml ? '<div class="fblock sm">' + f.altHtml + '</div>' : '') +
    '<div class="fsplit"><div class="stack"><span class="eyebrow">In plain English</span><p>' + esc(f.plain) + '</p>' +
      '<div class="tbl-wrap"><table class="vtable"><thead><tr><th style="text-align:center">Symbol</th><th>Meaning</th><th>Unit</th></tr></thead><tbody>' + f.vars.map(v => '<tr><td>' + v.sym + '</td><td>' + esc(v.meaning) + '</td><td class="small muted">' + esc(v.unit) + '</td></tr>').join('') + '</tbody></table></div></div>' +
      figHTML(f.fig, 'Illustration', FIGSRC[f.fig] || 'original', FIGCAP[f.fig] ? esc(FIGCAP[f.fig]) : '') + '</div>' +
  '</section>' +
  '<section class="card stack"><span class="eyebrow">Worked example</span><h3>' + esc(f.example.title) + '</h3>' + f.example.steps.map((m, k) => '<div class="mstep"><span>' + (k + 1) + '</span><div>' + m + '</div></div>').join('') + '</section>' +
  '<section class="card stack"><div class="row between"><span class="eyebrow">Practice check</span>' + (f.practice.illustrative ? '<span class="badge plain">Illustrative numbers</span>' : '<span class="badge plain">Slide numbers</span>') + '</div>' +
    '<p class="qtext">' + esc(f.practice.q) + '</p>' +
    '<div class="row" style="align-items:flex-end"><label class="field" style="flex:0 1 220px">Your answer<input id="fpIn" inputmode="decimal" autocomplete="off" value="' + esc(st && st.last != null ? st.last : '') + '"></label><button class="btn primary" id="fpCheck">Check answer</button><button class="btn" id="fpShow" aria-expanded="false">Show solution</button></div>' +
    '<div id="fpFb" role="status"></div><div id="fpSol" class="stack" hidden>' + f.practice.steps.map((m, k) => '<div class="mstep"><span>' + (k + 1) + '</span><div>' + m + '</div></div>').join('') + '</div></section>' +
  '<p class="small muted">Source: <span class="ref">' + esc(f.source) + '</span></p>' +
  '<nav class="pager" aria-label="Formula pager">' + (prev ? '<a class="btn" href="#' + prev.id + '">← ' + esc(prev.title) + '</a>' : '<span></span>') + (next ? '<a class="btn primary next" href="#' + next.id + '">' + esc(next.title) + ' →</a>' : '<span></span>') + '</nav>';
}
function afterFormula(id) {
  const f = fById(id);
  const check = () => {
    const raw = $('#fpIn').value.trim().replace(',', '.').replace('%', '');
    const v = parseFloat(raw);
    if (!raw || !isFinite(v)) { $('#fpFb').innerHTML = '<div class="fb bad"><b>That is not a number.</b> Type a number such as 0.25.</div>'; return; }
    const ok = Math.abs(v - f.practice.a) <= (f.practice.tol || 0) + 1e-9;
    S.fpractice[id] = { ok: ok || (S.fpractice[id] && S.fpractice[id].ok) || false, last: raw, t: Date.now() };
    save();
    $('#fpFb').innerHTML = ok ? '<div class="fb good"><b>Correct.</b> The answer is ' + esc(String(f.practice.a)) + '.</div>' : '<div class="fb bad"><b>Not quite.</b> You entered ' + esc(raw) + '. Check each step against the worked example, or open the solution.</div>';
    if (ok) toast('Formula practised');
  };
  $('#fpCheck').addEventListener('click', check);
  $('#fpIn').addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  $('#fpShow').addEventListener('click', e => { const s = $('#fpSol'); s.hidden = !s.hidden; e.currentTarget.textContent = s.hidden ? 'Show solution' : 'Hide solution'; e.currentTarget.setAttribute('aria-expanded', !s.hidden); });
}

/* ---------------- flashcards ---------------- */
function cardDeck() {
  let deck = D.CARDS.filter(c => S.fcFilter === 'all' || c.topic === S.fcFilter);
  if (S.fcMode === 'review') deck = deck.filter(c => S.cards[c.id] === 'review');
  if (S.fcMode === 'unseen') deck = deck.filter(c => !S.cards[c.id]);
  if (S.fcOrder) { const ord = S.fcOrder; deck.sort((a, b) => ord.indexOf(a.id) - ord.indexOf(b.id)); }
  return deck;
}
VIEWS.cards = function () {
  return head('Practise · flashcards', 'Flashcards', D.CARDS.length + ' cards from the slides, each tied to an exam question. Keys: <span class="kbd">Space</span> flip · <span class="kbd">←</span> <span class="kbd">→</span> move · <span class="kbd">K</span> known · <span class="kbd">R</span> review.') + '<div id="fcHost" class="stack"></div>';
};
AFTER.cards = function () {
  const host = $('#fcHost'); let flipped = false;
  const draw = () => {
    const deck = cardDeck();
    if (S.fcIdx >= deck.length) S.fcIdx = Math.max(0, deck.length - 1);
    const c = deck[S.fcIdx];
    const known = D.CARDS.filter(x => S.cards[x.id] === 'known').length, rev = D.CARDS.filter(x => S.cards[x.id] === 'review').length;
    host.innerHTML = '<div class="row between"><div class="row" role="group" aria-label="Topic filter">' + [['all', 'All']].concat(D.TOPICS.map(t => [t.id, 'Topic ' + t.n])).map(f => '<button class="chip" data-ff="' + f[0] + '" aria-pressed="' + (S.fcFilter === f[0]) + '">' + f[1] + '</button>').join('') + '</div>' +
      '<div class="row" role="group" aria-label="Mode">' + [['all', 'All cards'], ['unseen', 'Not rated'], ['review', 'Still learning (' + rev + ')']].map(m => '<button class="chip" data-fm="' + m[0] + '" aria-pressed="' + (S.fcMode === m[0]) + '">' + m[1] + '</button>').join('') + '</div></div>' +
      '<div class="row"><div class="bar ok" style="flex:1"><i style="width:' + pct(known, D.CARDS.length) + '%"></i></div><span class="small muted num">' + known + ' known · ' + rev + ' learning · ' + (D.CARDS.length - known - rev) + ' unrated</span></div>' +
      (c ? '<div class="fc-stage"><button class="fc" id="fc" type="button" aria-label="Flashcard showing the question. Press to reveal the answer."><div class="fc-face front"><div class="fc-corner"><span class="eyebrow">Question · Topic ' + topicById(c.topic).n + '</span><span class="small muted num">' + (S.fcIdx + 1) + ' / ' + deck.length + '</span></div><div class="fc-text">' + esc(c.q) + '</div><span class="fc-hint">Tap to reveal</span></div>' +
        '<div class="fc-face back"><div class="fc-corner"><span class="chip' + (c.ext ? ' ext' : '') + '">' + esc(c.ref) + '</span>' + (S.cards[c.id] ? '<span class="chip ' + (S.cards[c.id] === 'known' ? 'ok' : 'warn') + '">' + (S.cards[c.id] === 'known' ? 'Known' : 'Still learning') + '</span>' : '') + '</div><div class="fc-text">' + esc(c.a) + '</div></div></button></div>' +
        '<div class="row" style="justify-content:center"><button class="btn" data-fc="prev" aria-label="Previous card">←</button><button class="btn" data-fc="review">⟲ Review</button><button class="btn primary" data-fc="known">✓ Known</button><button class="btn" data-fc="next" aria-label="Next card">→</button></div>' +
        '<div class="row" style="justify-content:center"><button class="btn sm ghost" data-fc="shuffle">Shuffle</button><button class="btn sm ghost" data-fc="order">Original order</button><button class="btn sm ghost" data-fc="resetcards">Reset ratings</button></div>'
        : '<div class="empty">' + (S.fcMode === 'review' ? 'No cards marked "Still learning" in this filter. Nice.' : 'No cards left in this filter.') + ' <button class="btn sm" data-fm="all">Show all cards</button></div>') +
      '<div id="fcConfirm"></div>';
    flipped = false;
    const fc = $('#fc');
    if (fc) { fc.addEventListener('click', flip); }
    $$('[data-ff]', host).forEach(b => b.addEventListener('click', () => { S.fcFilter = b.dataset.ff; S.fcIdx = 0; save(); draw(); }));
    $$('[data-fm]', host).forEach(b => b.addEventListener('click', () => { S.fcMode = b.dataset.fm; S.fcIdx = 0; save(); draw(); }));
    $$('[data-fc]', host).forEach(b => b.addEventListener('click', () => act(b.dataset.fc)));
  };
  const flip = () => { const fc = $('#fc'); if (!fc) return; flipped = !flipped; fc.classList.toggle('flipped', flipped); fc.setAttribute('aria-label', flipped ? 'Flashcard showing the answer. Press to see the question.' : 'Flashcard showing the question. Press to reveal the answer.'); const c = cardDeck()[S.fcIdx]; if (c) touch('card', 'cards', 'Flashcards'); };
  const act = a => {
    const deck = cardDeck(); const c = deck[S.fcIdx];
    if (a === 'prev') S.fcIdx = (S.fcIdx - 1 + deck.length) % Math.max(1, deck.length);
    if (a === 'next') S.fcIdx = (S.fcIdx + 1) % Math.max(1, deck.length);
    if ((a === 'known' || a === 'review') && c) {
      S.cards[c.id] = a; toast(a === 'known' ? 'Marked as known' : 'Added to revision');
      const after = cardDeck();
      if (S.fcMode === 'all') S.fcIdx = (S.fcIdx + 1) % Math.max(1, after.length);
      else if (S.fcIdx >= after.length) S.fcIdx = 0;
    }
    if (a === 'shuffle') { const ids = D.CARDS.map(x => x.id); for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; } S.fcOrder = ids; S.fcIdx = 0; toast('Deck shuffled'); }
    if (a === 'order') { S.fcOrder = null; S.fcIdx = 0; }
    if (a === 'resetcards') {
      $('#fcConfirm').innerHTML = '<div class="confirm"><span>Clear all flashcard ratings?</span><button class="btn sm bad" id="fcYes">Clear ratings</button><button class="btn sm" id="fcNo">Cancel</button></div>';
      $('#fcYes').onclick = () => { S.cards = {}; save(); draw(); toast('Ratings cleared'); };
      $('#fcNo').onclick = () => { $('#fcConfirm').innerHTML = ''; };
      return;
    }
    save(); draw(); renderNav('cards');
  };
  draw();
  const keyH = e => {
    if (location.hash !== '#cards' || /input|textarea|select/i.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') act('next'); else if (e.key === 'ArrowLeft') act('prev');
    else if (e.key === ' ' && document.activeElement.id !== 'fc') { e.preventDefault(); flip(); }
    else if (e.key === 'k' || e.key === 'K') act('known');
    else if (e.key === 'r' || e.key === 'R') act('review');
  };
  document.removeEventListener('keydown', window.__fcKey || (() => {}));
  window.__fcKey = keyH; document.addEventListener('keydown', keyH);
};

/* ---------------- written practice ---------------- */
function writeItems() {
  return D.Q.filter(q => q.rubric).map(q => ({ id: q.id, label: qLabel(q), title: q.text, text: q.text, exHead: q.exHead, model: q.model, rubric: q.rubric, wrong: q.wrong, refs: q.refs, exam: true, marks: q.marks, table: q.table }))
    .concat(D.PRACTICE.map(p => ({ id: p.id, label: 'Practice', title: p.title, text: p.text, model: p.model, rubric: p.rubric, refs: [p.ref], exam: false, topic: p.topic })));
}
VIEWS.write = function () {
  return head('Practise · written answers', 'Written practice', 'Write the answer first, then check it. Exam parts keep the original wording; items marked "Practice" are extra questions derived from Topics 1–4 and are not on the paper. Calculation parts live in the <a href="#calc">calculators</a>.') + '<div class="split"><nav class="qlist" id="wlist" aria-label="Questions"></nav><div id="wmain" class="stack"></div></div>';
};
AFTER.write = function () {
  const items = writeItems();
  if (!items.find(i => i.id === S.writeSel)) S.writeSel = items[0].id;
  const list = () => {
    $('#wlist').innerHTML = items.map(it => { const st = it.exam ? qs(it.id) : (S.practice[it.id] || {}); const sc = st.last; const b = sc == null ? null : band(sc);
      return '<button data-w="' + it.id + '" aria-current="' + (S.writeSel === it.id) + '"><span>' + esc(it.exam ? it.label : it.title) + (it.exam ? '' : ' <span class="chip" style="font-size:.66rem">Practice</span>') + '</span>' + (b ? '<span class="score-badge chip ' + b[0] + '">' + Math.round(sc * 100) + '%</span>' : '') + '</button>'; }).join('');
    $$('[data-w]').forEach(b => b.addEventListener('click', () => { S.writeSel = b.dataset.w; save(); list(); main(); }));
  };
  const main = () => {
    const it = items.find(i => i.id === S.writeSel);
    const draftKey = 'w-' + it.id;
    $('#wmain').innerHTML = '<div class="card raised stack"><div class="row between"><div class="row"><span class="chip ' + (it.exam ? 'acc' : '') + '">' + (it.exam ? 'Exam ' + esc(it.label) + ' · ' + fmt(it.marks, 1) + ' pt' : 'Practice · Topic ' + topicById(it.topic).n) + '</span></div>' + (it.exam ? '<a class="small" href="#' + it.id + '">Full breakdown</a>' : '') + '</div>' +
      (it.exHead ? '<p class="small muted">' + esc(it.exHead) + '</p>' : '') + '<p class="qtext quote">' + esc(it.text) + '</p>' + (it.table ? tableHTML(it.table) : '') + '</div>' +
      '<div class="card stack"><textarea class="answer" id="wta" aria-label="Your answer" placeholder="Write your answer as you would on the exam paper…">' + esc(S.drafts[draftKey] || '') + '</textarea>' +
      '<div class="row between"><div class="row"><button class="btn primary" id="wcheck">Check answer</button><button class="btn" id="wmodel" aria-expanded="false">Show model answer</button><button class="btn ghost" id="wclear">Clear</button></div><span class="small muted" id="wcount"></span></div>' +
      '<div id="wmodelBox" hidden><div class="exam-ans prewrap">' + esc(it.model) + '</div></div><div id="wclearConfirm"></div></div>' +
      '<div id="wfb"></div>';
    const ta = $('#wta'); const cnt = () => $('#wcount').textContent = (ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0) + ' words';
    cnt();
    ta.addEventListener('input', () => { S.drafts[draftKey] = ta.value; save(); cnt(); });
    $('#wmodel').addEventListener('click', e => { const box = $('#wmodelBox'); box.hidden = !box.hidden; e.target.textContent = box.hidden ? 'Show model answer' : 'Hide model answer'; e.target.setAttribute('aria-expanded', !box.hidden); if (it.exam && !box.hidden) { qs(it.id).studied = true; save(); } });
    $('#wclear').addEventListener('click', () => {
      if (!ta.value.trim()) return;
      $('#wclearConfirm').innerHTML = '<div class="confirm"><span>Clear your answer?</span><button class="btn sm bad" id="wcYes">Clear</button><button class="btn sm" id="wcNo">Keep it</button></div>';
      $('#wcYes').onclick = () => { ta.value = ''; S.drafts[draftKey] = ''; save(); cnt(); $('#wclearConfirm').innerHTML = ''; $('#wfb').innerHTML = ''; };
      $('#wcNo').onclick = () => { $('#wclearConfirm').innerHTML = ''; };
    });
    $('#wcheck').addEventListener('click', () => {
      if (!ta.value.trim()) { toast('Write an answer first'); ta.focus(); return; }
      const res = grade(it, ta.value);
      if (it.exam) recordAttempt(it.id, ta.value, res.score);
      else { const p = S.practice[it.id] || (S.practice[it.id] = { attempts: [] }); p.attempts.push({ t: Date.now(), score: res.score }); p.last = res.score; save(); toast('Answer checked'); }
      touch('w', 'write', 'Written: ' + (it.exam ? it.label : it.title));
      $('#wfb').innerHTML = '<div class="card">' + feedbackHTML(it, res, ta.value) + '</div>';
      list();
      $('#wfb').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
  list(); main();
};

/* ---------------- diagrams ---------------- */
VIEWS.diagrams = function () {
  return '<div class="page-head"><span class="eyebrow">Practise · visual skills</span><h1>Graphs & diagrams</h1><p>Visual skills the paper needs: tracing a tree, laying out a confusion matrix, the logistic cutoff, LOO, stepwise paths, histogram shapes. Each drill has a zoomable reference, step-by-step guide, sketch pad and checklist.</p></div>' +
    '<div class="notice warn"><div><b>About the images.</b> The slide and exam images could not be extracted from the project (text only), so no slide picture is embedded. Each diagram says whether it is redrawn from slide text, computed from a slide formula, or an original teaching schematic.</div></div>' +
    '<div class="grid g3">' + D.DIAGRAMS.map(d => { const st = S.diag[d.id] || {}; return '<a class="card topic-card" href="#' + d.id + '"><div style="border:1px solid var(--line);border-radius:10px;background:var(--surface-2);padding:6px;pointer-events:none">' + SVG[d.kind]() + '</div><div class="row between"><h3>' + esc(d.title) + '</h3>' + (st.rating ? '<span class="chip ' + (st.rating === 'ok' ? 'ok">Got it' : 'warn">Practise more') + '</span>' : '') + '</div><div class="row" style="gap:4px"><span class="chip ' + (d.sourceType === 'original' ? '' : 'acc') + '">' + ({ redrawn: 'Redrawn from slide', computed: 'Computed from slide formula', original: 'Original schematic' })[d.sourceType] + '</span>' + d.q.map(id => '<span class="chip">' + esc(qLabel(qById(id))) + '</span>').join('') + '</div></a>'; }).join('') + '</div>';
};
function viewDiagram(id) {
  const d = dById(id); const st = S.diag[id] || (S.diag[id] = { step: d.steps.length, checks: [], rating: null });
  touch('d', id, d.title);
  return '<div class="row between"><a href="#diagrams" class="btn sm ghost">← All diagrams</a><div class="row">' + d.q.map(q => '<a class="chip acc" href="#' + q + '">' + esc(qLabel(qById(q))) + '</a>').join('') + '</div></div>' +
  '<div class="page-head"><span class="eyebrow">Diagram drill</span><h1>' + esc(d.title) + '</h1><p>' + esc(d.what) + '</p></div>' +
  '<div class="src-tag"><b>' + ({ redrawn: 'Redrawn from slide text', computed: 'Computed from a slide formula', original: 'Original teaching diagram' })[d.sourceType] + '.</b> ' + esc(d.source) + '</div>' +
  '<div class="diagram-shell">' +
    '<div class="stack"><div class="row between"><b>Reference</b><div class="toolbar">' +
      '<button class="btn sm" data-z="-" aria-label="Zoom out">−</button><span class="small muted num" id="zl">100%</span><button class="btn sm" data-z="+" aria-label="Zoom in">+</button><button class="btn sm ghost" data-z="0">Reset</button>' +
      '<button class="btn sm" id="lblBtn" aria-pressed="true">Labels</button></div></div>' +
      '<div class="viewer" id="viewer"><div class="viewer-inner" id="vin">' + SVG[d.kind]() + '</div></div>' +
      (d.kind === 'tree' ? '<div class="card flat stack" style="padding:12px"><b class="small">Trace an observation</b><div class="row"><label class="field" style="flex:1">X1<input id="tx1" type="number" step="0.01" min="0" max="1" value="0.1"></label><label class="field" style="flex:1">X2<input id="tx2" type="number" step="0.01" min="0" max="1" value="0.7"></label><button class="btn primary" id="traceBtn" style="align-self:flex-end">Trace</button></div><div id="traceOut" class="small"></div></div>' : '') +
    '</div>' +
    '<div class="stack"><div class="row between"><b>Your sketch</b><span class="small muted">Mouse, pen or finger</span></div><div id="padHost"></div></div>' +
  '</div>' +
  '<div class="grid g2">' +
    '<div class="card stack"><div class="row between"><h3>How to draw it in the exam</h3><div class="row"><button class="btn sm ghost" data-s="0">Hide all</button><button class="btn sm" data-s="-">← Step</button><button class="btn sm" data-s="+">Step →</button><button class="btn sm ghost" data-s="all">Show all</button></div></div><p class="small muted">Hide all, then reveal one step at a time; the reference drawing builds up in sync.</p><ol class="steps-list" id="steps">' + d.steps.map((s, i) => '<li data-si="' + i + '">' + esc(s) + '</li>').join('') + '</ol></div>' +
    '<div class="card stack"><h3>Checklist for a correct answer</h3><ul class="tick-list">' + d.checklist.map((c, i) => '<li><input type="checkbox" id="ck' + i + '" data-ck="' + i + '" ' + (st.checks.includes(i) ? 'checked' : '') + ' style="margin-top:4px"><label for="ck' + i + '">' + esc(c) + '</label></li>').join('') + '</ul>' +
      '<div class="row"><span class="small muted">How did it go?</span><button class="btn sm" data-rate="ok" aria-pressed="' + (st.rating === 'ok') + '">Got it</button><button class="btn sm" data-rate="practice" aria-pressed="' + (st.rating === 'practice') + '">Practise more</button></div></div>' +
  '</div>';
}
function afterDiagram(id) {
  const d = dById(id); const st = S.diag[id];
  const viewer = $('#viewer'), vin = $('#vin');
  let z = 1;
  const setZ = v => { z = Math.min(3, Math.max(0.5, v)); vin.style.transform = 'scale(' + z + ')'; vin.style.width = (100 * Math.max(1, z)) + '%'; $('#zl').textContent = Math.round(z * 100) + '%'; };
  $$('[data-z]').forEach(b => b.addEventListener('click', () => setZ(b.dataset.z === '+' ? z + 0.25 : b.dataset.z === '-' ? z - 0.25 : 1)));
  $('#lblBtn').addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); viewer.classList.toggle('hide-labels', !on); });
  // drag to pan
  let drag = null;
  viewer.addEventListener('pointerdown', e => { if (e.target.closest('button,input')) return; drag = { x: e.clientX, y: e.clientY, sl: viewer.scrollLeft, st: viewer.scrollTop }; viewer.setPointerCapture(e.pointerId); viewer.classList.add('grabbing'); });
  viewer.addEventListener('pointermove', e => { if (!drag) return; viewer.scrollLeft = drag.sl - (e.clientX - drag.x); viewer.scrollTop = drag.st - (e.clientY - drag.y); });
  const end = () => { drag = null; viewer.classList.remove('grabbing'); };
  viewer.addEventListener('pointerup', end); viewer.addEventListener('pointercancel', end);
  viewer.addEventListener('wheel', e => { if (e.ctrlKey) { e.preventDefault(); setZ(z + (e.deltaY < 0 ? 0.1 : -0.1)); } }, { passive: false });
  // steps
  const nSteps = d.steps.length;
  const applyStep = () => {
    $$('#steps li').forEach((li, i) => li.classList.toggle('hidden-step', i >= st.step));
    $$('[data-step]', vin).forEach(g => g.classList.toggle('off', +g.dataset.step > st.step));
  };
  $$('[data-s]').forEach(b => b.addEventListener('click', () => { const a = b.dataset.s; st.step = a === 'all' ? nSteps : a === '0' ? 0 : a === '+' ? Math.min(nSteps, st.step + 1) : Math.max(0, st.step - 1); save(); applyStep(); }));
  applyStep();
  $$('[data-ck]').forEach(c => c.addEventListener('change', () => { const i = +c.dataset.ck; st.checks = st.checks.filter(x => x !== i); if (c.checked) st.checks.push(i); save(); }));
  $$('[data-rate]').forEach(b => b.addEventListener('click', () => { st.rating = st.rating === b.dataset.rate ? null : b.dataset.rate; save(); $$('[data-rate]').forEach(x => x.setAttribute('aria-pressed', st.rating === x.dataset.rate)); renderNav(id); toast(st.rating === 'ok' ? 'Marked as got it' : st.rating ? 'Added to revision' : 'Rating cleared'); }));
  mountPad($('#padHost'), 'diag-' + id, { grid: d.grid, overlay: SVG[d.kind]() });
  if (d.kind === 'tree') {
    const run = () => {
      const x1 = parseFloat($('#tx1').value), x2 = parseFloat($('#tx2').value);
      if (!isFinite(x1) || !isFinite(x2)) { $('#traceOut').textContent = 'Enter numbers for X1 and X2.'; return; }
      const r = traceTree(x1, x2);
      $$('.hl,.hlf', vin).forEach(e => e.classList.remove('hl', 'hlf'));
      r.nodes.forEach(n => { const el = $('#' + n, vin); if (el) el.classList.add('hlf'); });
      r.edges.forEach(n => { const el = $('#' + n, vin); if (el) el.classList.add('hl'); });
      st.step = nSteps; applyStep();
      $('#traceOut').innerHTML = 'Path: ' + r.path.map(esc).join(' → ') + ' → <b>class ' + r.cls + '</b>';
    };
    $('#traceBtn').addEventListener('click', run);
  }
}
function traceTree(x1, x2) {
  const path = [], nodes = ['n-root'], edges = [];
  if (x2 <= 0.15) { path.push('X2 ≤ 0.15'); edges.push('e-root-a'); nodes.push('n-a'); return { path, nodes, edges, cls: 0 }; }
  path.push('X2 > 0.15'); edges.push('e-root-n1'); nodes.push('n-n1');
  if (x1 > 0.4) {
    path.push('X1 > 0.4'); edges.push('e-n1-n2'); nodes.push('n-n2');
    if (x2 <= 0.5) { path.push('X2 ≤ 0.5'); edges.push('e-n2-b'); nodes.push('n-b'); return { path, nodes, edges, cls: 0 }; }
    path.push('X2 > 0.5'); edges.push('e-n2-n3'); nodes.push('n-n3');
    if (x1 <= 0.6) { path.push('X1 ≤ 0.6'); edges.push('e-n3-c'); nodes.push('n-c'); return { path, nodes, edges, cls: 0 }; }
    path.push('X1 > 0.6'); edges.push('e-n3-d'); nodes.push('n-d'); return { path, nodes, edges, cls: 1 };
  }
  path.push('X1 ≤ 0.4'); edges.push('e-n1-n4'); nodes.push('n-n4');
  if (x2 <= 0.6) { path.push('X2 ≤ 0.6'); edges.push('e-n4-e'); nodes.push('n-e'); return { path, nodes, edges, cls: 0 }; }
  path.push('X2 > 0.6'); edges.push('e-n4-f'); nodes.push('n-f'); return { path, nodes, edges, cls: 1 };
}

/* ---------- SVG builders (use theme classes; labels carry .lbl) ---------- */
const SVG = {};
SVG.tree = function () {
  const N = { root: [330, 36, 'X2 ≤ 0.15 ?', 0], n1: [440, 110, 'X1 > 0.4 ?', 0], a: [140, 110, '0', 1], n2: [300, 186, 'X2 ≤ 0.5 ?', 0], n4: [560, 186, 'X2 ≤ 0.6 ?', 0], b: [190, 262, '0', 1], n3: [370, 262, 'X1 ≤ 0.6 ?', 0], e: [500, 262, '0', 1], f: [610, 262, '1', 2], c: [300, 340, '0', 1], d: [440, 340, '1', 2] };
  const E = [['root', 'a', 'X2 ≤ 0.15', 1], ['root', 'n1', 'X2 > 0.15', 1], ['n1', 'n2', 'X1 > 0.4', 3], ['n1', 'n4', 'X1 ≤ 0.4', 3], ['n2', 'b', 'X2 ≤ 0.5', 4], ['n2', 'n3', 'X2 > 0.5', 4], ['n3', 'c', 'X1 ≤ 0.6', 4], ['n3', 'd', 'X1 > 0.6', 4], ['n4', 'e', 'X2 ≤ 0.6', 5], ['n4', 'f', 'X2 > 0.6', 5]];
  const stepOf = { root: 1, a: 2, n1: 3, n2: 4, b: 4, n3: 4, c: 4, d: 4, n4: 5, e: 5, f: 5 };
  let s = '<svg viewBox="0 0 680 370" role="img" aria-label="Classification tree from Topic 3 slide 43 with six leaves">';
  E.forEach(([p, c, l, st]) => { const [x1, y1] = N[p], [x2, y2] = N[c]; const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; s += '<g data-step="' + st + '"><line id="e-' + p + '-' + c + '" class="s-line" x1="' + x1 + '" y1="' + (y1 + 14) + '" x2="' + x2 + '" y2="' + (y2 - 14) + '" stroke-width="1.5"/><text class="lbl t-acc" x="' + (mx + (x2 < x1 ? -6 : 6)) + '" y="' + (my + 2) + '" font-size="12" font-weight="600" text-anchor="' + (x2 < x1 ? 'end' : 'start') + '">' + l + '</text></g>'; });
  Object.keys(N).forEach(k => { const [x, y, t, leaf] = N[k]; const w = leaf ? 46 : 112; s += '<g data-step="' + stepOf[k] + '"><rect id="n-' + k + '" x="' + (x - w / 2) + '" y="' + (y - 15) + '" width="' + w + '" height="30" rx="' + (leaf ? 15 : 8) + '" class="' + (leaf === 1 ? 'f-leaf0' : leaf === 2 ? 'f-leaf1' : 'f-node') + '" stroke-width="1.5"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="13" font-weight="' + (leaf ? 700 : 600) + '"' + (leaf ? '' : ' class="lbl"') + '>' + t + '</text></g>'; });
  s += '<text x="12" y="362" font-size="11" class="t-muted">Rounded = leaf (class) · square = split</text></svg>';
  return s;
};
SVG.cm = function () {
  const x0 = 150, y0 = 70, w = 130, h = 70;
  const cells = [['n00', 'TN'], ['n01', 'FP'], ['n0', 'row total'], ['n10', 'FN'], ['n11', 'TP'], ['n1', 'row total'], ['n̂0', ''], ['n̂1', ''], ['n', '']];
  let s = '<svg viewBox="0 0 600 330" role="img" aria-label="Confusion matrix layout with observed rows and predicted columns">';
  s += '<g data-step="1">'; for (let r = 0; r <= 3; r++) s += '<line class="s-line" x1="' + x0 + '" y1="' + (y0 + r * h) + '" x2="' + (x0 + 3 * w) + '" y2="' + (y0 + r * h) + '" stroke-width="' + (r === 0 || r === 3 ? 1.6 : 1) + '"/>'; for (let c = 0; c <= 3; c++) s += '<line class="s-line" x1="' + (x0 + c * w) + '" y1="' + y0 + '" x2="' + (x0 + c * w) + '" y2="' + (y0 + 3 * h) + '" stroke-width="1"/>'; s += '</g>';
  s += '<g data-step="2" class="lbl">' + ['Predicted 0', 'Predicted 1', 'Total'].map((t, i) => '<text x="' + (x0 + i * w + w / 2) + '" y="' + (y0 - 12) + '" text-anchor="middle" font-size="14" font-weight="600">' + t + '</text>').join('') + '</g>';
  s += '<g data-step="3" class="lbl">' + ['Observed 0', 'Observed 1', 'Total'].map((t, i) => '<text x="' + (x0 - 12) + '" y="' + (y0 + i * h + h / 2 + 5) + '" text-anchor="end" font-size="14" font-weight="600">' + t + '</text>').join('') + '</g>';
  cells.forEach(([v, sub], i) => { const r = Math.floor(i / 3), c = i % 3; const st = (r < 2 && c < 2) ? 4 : 5; const diag = (r === c && r < 2), off = (r < 2 && c < 2 && r !== c); s += '<g data-step="' + st + '">' + ((diag || off) ? '<rect x="' + (x0 + c * w + 4) + '" y="' + (y0 + r * h + 4) + '" width="' + (w - 8) + '" height="' + (h - 8) + '" rx="6" class="' + (diag ? 'f-leaf1' : 'f-leaf0') + '" stroke-width="1"/>' : '') + '<text x="' + (x0 + c * w + w / 2) + '" y="' + (y0 + r * h + h / 2 + (sub ? 0 : 5)) + '" text-anchor="middle" font-size="18" font-weight="700" class="mono">' + v + '</text>' + (sub ? '<text class="lbl t-muted" x="' + (x0 + c * w + w / 2) + '" y="' + (y0 + r * h + h / 2 + 20) + '" text-anchor="middle" font-size="11">' + sub + '</text>' : '') + '</g>'; });
  s += '<g data-step="6"><text x="' + x0 + '" y="' + (y0 + 3 * h + 34) + '" font-size="15" font-weight="600" class="mono">Test error = (n01 + n10) / n</text></g></svg>';
  return s;
};
SVG.logit = function () {
  const W = 600, H = 340, L = 60, R = 20, T = 20, B = 50, pw = W - L - R, ph = H - T - B;
  const X = t => L + pw * t / 3000, Y = p => T + ph * (1 - p);
  const f = t => 1 / (1 + Math.exp(-(-10.65 + 0.0055 * t)));
  let d = ''; for (let t = 0; t <= 3000; t += 25) d += (t ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(f(t)).toFixed(1);
  const tc = (10.65 + Math.log(0.45 / 0.55)) / 0.0055, t5 = 10.65 / 0.0055;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Logistic curve P(activate=1|time) from Topic 3 slide 10 with cutoff 0.45">';
  s += '<g data-step="1">'; [0, 0.25, 0.5, 0.75, 1].forEach(p => s += '<line class="s-muted" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(p) + '" y2="' + Y(p) + '"/><text class="t-muted" x="' + (L - 8) + '" y="' + (Y(p) + 4) + '" font-size="11" text-anchor="end">' + p.toFixed(2) + '</text>');
  [0, 1000, 2000, 3000].forEach(t => s += '<text class="t-muted" x="' + X(t) + '" y="' + (H - B + 18) + '" font-size="11" text-anchor="middle">' + t + '</text>');
  s += '<line class="s-line" x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - R) + '" y2="' + (H - B) + '"/><line class="s-line" x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (H - B) + '"/><text class="lbl" x="' + (L + pw / 2) + '" y="' + (H - 8) + '" font-size="12" text-anchor="middle">time</text><text class="lbl" transform="translate(16 ' + (T + ph / 2) + ') rotate(-90)" font-size="12" text-anchor="middle">P(activate = 1 | time)</text></g>';
  s += '<g data-step="5"><rect x="' + X(tc) + '" y="' + T + '" width="' + (W - R - X(tc)) + '" height="' + ph + '" class="f-soft" opacity=".6"/><text class="lbl t-acc" x="' + (X(tc) + 8) + '" y="' + (T + 16) + '" font-size="12" font-weight="600">predict 1</text><text class="lbl t-muted" x="' + (X(tc) - 8) + '" y="' + (T + 16) + '" font-size="12" font-weight="600" text-anchor="end">predict 0</text></g>';
  s += '<g data-step="2"><path d="' + d + '" class="s-acc" stroke-width="3"/></g>';
  s += '<g data-step="3"><circle cx="' + X(t5) + '" cy="' + Y(0.5) + '" r="4" class="f-acc"/><text class="lbl" x="' + (X(t5) - 10) + '" y="' + (Y(0.5) - 10) + '" font-size="11" text-anchor="end">P = 0.5 at time ≈ ' + Math.round(t5) + '</text></g>';
  s += '<g data-step="4"><line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(0.45) + '" y2="' + Y(0.45) + '" class="s-line" stroke-dasharray="6 4" stroke-width="1.5"/><text class="lbl" x="' + (L + 6) + '" y="' + (Y(0.45) - 6) + '" font-size="11" font-weight="600">cutoff z = 0.45</text><line x1="' + X(tc) + '" x2="' + X(tc) + '" y1="' + Y(0.45) + '" y2="' + (H - B) + '" class="s-line" stroke-dasharray="2 3"/><text class="lbl" x="' + X(tc) + '" y="' + (H - B - 6) + '" font-size="11" text-anchor="end">≈ ' + Math.round(tc) + ' </text></g></svg>';
  return s;
};
SVG.loo = function () {
  const n = 6, cw = 62, ch = 34, x0 = 120, y0 = 40;
  let s = '<svg viewBox="0 0 600 340" role="img" aria-label="Leave-one-out: each round holds out one observation">';
  s += '<g data-step="1">' + Array.from({ length: n }, (_, i) => '<text x="' + (x0 + i * cw + cw / 2) + '" y="' + (y0 - 12) + '" text-anchor="middle" font-size="12" font-weight="600">obs ' + (i + 1) + '</text>').join('') + '</g>';
  for (let r = 0; r < n; r++) {
    s += '<g data-step="2"><text class="lbl t-muted" x="' + (x0 - 12) + '" y="' + (y0 + r * ch + 22) + '" font-size="12" text-anchor="end">round ' + (r + 1) + '</text>';
    for (let c = 0; c < n; c++) s += '<rect x="' + (x0 + c * cw + 3) + '" y="' + (y0 + r * ch + 3) + '" width="' + (cw - 6) + '" height="' + (ch - 6) + '" rx="5" class="' + (r === c ? 'f-acc' : 'f-node') + '" stroke-width="1"/>' + (r === c ? '<text x="' + (x0 + c * cw + cw / 2) + '" y="' + (y0 + r * ch + 21) + '" text-anchor="middle" font-size="11" font-weight="700" class="f-surface" style="fill:var(--accent-ink)">test</text>' : '');
    s += '</g><g data-step="4"><text class="mono lbl" x="' + (x0 + n * cw + 12) + '" y="' + (y0 + r * ch + 22) + '" font-size="12">Err' + (r + 1) + ' = I(y' + (r + 1) + ' ≠ ŷ' + (r + 1) + ')</text></g>';
  }
  s += '<g data-step="3"><text class="lbl t-muted" x="' + x0 + '" y="' + (y0 + n * ch + 22) + '" font-size="12">white = training set (n − 1 observations)</text></g>';
  s += '<g data-step="5"><text class="mono" x="' + x0 + '" y="' + (y0 + n * ch + 50) + '" font-size="14" font-weight="700">Err_LOO = (1/n) Σ Err_i</text></g></svg>';
  return s;
};
SVG.step = function () {
  const cols = [['Forward', ['∅', '{X1}', '{X1, X3}', '{X1, X2, X3}', '{X1, X2, X3, X4}'], 2], ['Backward', ['∅', '{X2}', '{X2, X3}', '{X2, X3, X4}', '{X1, X2, X3, X4}'], 3], ['Best subset', ['∅', '{X1}', '{X2, X3}', '{X1, X2, X4}', '{X1, X2, X3, X4}'], 4]];
  let s = '<svg viewBox="0 0 600 340" role="img" aria-label="Illustrative forward, backward and best subset model sequences">';
  s += '<g data-step="1">' + cols.map((c, i) => '<text x="' + (100 + i * 200) + '" y="24" text-anchor="middle" font-size="14" font-weight="700">' + c[0] + '</text>').join('') + [0, 1, 2, 3, 4].map(k => '<text class="lbl t-muted" x="8" y="' + (300 - k * 64 + 4) + '" font-size="11">k=' + k + '</text>').join('') + '</g>';
  cols.forEach((c, i) => { const x = 100 + i * 200; s += '<g data-step="' + c[2] + '">'; c[1].forEach((m, k) => { const y = 300 - k * 64; if (k < 4) s += '<line class="' + (i < 2 ? 's-line' : 's-muted') + '" x1="' + x + '" y1="' + (y - 14) + '" x2="' + x + '" y2="' + (y - 50) + '"' + (i === 2 ? ' stroke-dasharray="4 4"' : '') + ' stroke-width="1.5"/>'; s += '<rect x="' + (x - 62) + '" y="' + (y - 13) + '" width="124" height="26" rx="7" class="f-node" stroke-width="1.2"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="12" class="mono">' + m + '</text>'; }); s += '</g>'; });
  s += '<g data-step="5"><rect x="38" y="223" width="124" height="26" rx="7" fill="none" class="s-acc" stroke-width="2.5"/><rect x="238" y="159" width="124" height="26" rx="7" fill="none" class="s-acc" stroke-width="2.5"/><text class="lbl t-acc" x="200" y="214" text-anchor="middle" font-size="11" font-weight="600">{X1} ⊄ {X2, X3}</text></g>';
  s += '<g data-step="6"><text class="lbl t-muted" x="500" y="330" text-anchor="middle" font-size="11">sizes chosen independently: not nested</text></g>';
  s += '<text x="300" y="336" text-anchor="middle" font-size="10" class="t-muted">illustrative variables, not course data</text></svg>';
  return s;
};
SVG.hist = function () {
  const right = [9, 15, 11, 7, 5, 3.5, 2.5, 1.6, 1, 0.6], left = [0.6, 1, 1.5, 2.4, 3.6, 5.5, 8, 11, 14, 7];
  const draw = (arr, x0, title, tail, step) => { const bw = 22, base = 260; let g = '<g data-step="' + step + '"><text x="' + (x0 + 110) + '" y="40" text-anchor="middle" font-size="13" font-weight="700">' + title + '</text>'; arr.forEach((v, i) => g += '<rect x="' + (x0 + i * bw) + '" y="' + (base - v * 13) + '" width="' + (bw - 2) + '" height="' + (v * 13) + '" class="f-soft" stroke="var(--accent)" stroke-width="1"/>'); g += '<line class="s-line" x1="' + (x0 - 4) + '" y1="' + base + '" x2="' + (x0 + 224) + '" y2="' + base + '"/><text class="lbl t-acc" x="' + (tail === 'r' ? x0 + 200 : x0 + 20) + '" y="' + (base - 40) + '" font-size="11" font-weight="600" text-anchor="middle">' + (tail === 'r' ? 'tail →' : '← tail') + '</text></g>'; return g; };
  let s = '<svg viewBox="0 0 600 320" role="img" aria-label="Schematic right-skewed and left-skewed histograms">';
  s += '<g data-step="1"><text class="lbl t-muted" x="300" y="300" text-anchor="middle" font-size="11">x = variable (units) · y = frequency · schematic shapes, no data</text></g>';
  s += draw(right, 40, 'Right (positive) skew', 'r', 2);
  s += draw(left, 336, 'Left (negative) skew', 'l', 3);
  s += '<g data-step="4"><text class="lbl" x="150" y="282" text-anchor="middle" font-size="11">mean > median</text><text class="lbl" x="446" y="282" text-anchor="middle" font-size="11">mean < median</text></g>';
  s += '<g data-step="5"><path d="M62 140 l0 -22" class="s-acc" stroke-width="1.5"/><text class="lbl t-acc" x="62" y="112" font-size="10" text-anchor="middle">spike / peak</text></g></svg>';
  return s;
};
SVG.knn = function () {
  const A = [[120, 90], [170, 130], [210, 80], [140, 170], [250, 150], [300, 110], [275, 205]], Bp = [[380, 220], [420, 160], [460, 240], [350, 280], [500, 180], [330, 190], [440, 290]];
  const q = [300, 170];
  let s = '<svg viewBox="0 0 600 340" role="img" aria-label="Schematic three nearest neighbours of a new point">';
  s += '<g data-step="1">' + A.map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" class="f-acc"/>').join('') + Bp.map(p => '<rect x="' + (p[0] - 7) + '" y="' + (p[1] - 7) + '" width="14" height="14" class="f-ok"/>').join('') + '<g class="lbl"><circle cx="40" cy="316" r="6" class="f-acc"/><text x="52" y="320" font-size="11">class A</text><rect x="110" y="310" width="12" height="12" class="f-ok"/><text x="128" y="320" font-size="11">class B</text></g></g>';
  s += '<g data-step="2"><circle cx="' + q[0] + '" cy="' + q[1] + '" r="8" class="f-surface" stroke="var(--ink)" stroke-width="2.5"/><text class="lbl" x="' + (q[0] + 12) + '" y="' + (q[1] - 10) + '" font-size="11" font-weight="600">new x</text></g>';
  s += '<g data-step="3"><circle cx="' + q[0] + '" cy="' + q[1] + '" r="46" fill="none" class="s-line" stroke-dasharray="5 4" stroke-width="1.5"/></g>';
  s += '<g data-step="4"><text class="lbl" x="400" y="60" font-size="12">K = 3: 2 × A, 1 × B</text><text class="lbl mono" x="400" y="80" font-size="12">P(A|x) = 2/3</text></g>';
  s += '<g data-step="5"><text class="lbl t-acc" x="400" y="104" font-size="13" font-weight="700">predict A</text></g></svg>';
  return s;
};
SVG.crit = function () {
  const L = 50, R = 20, T = 30, B = 40, W = 600, H = 320, pw = W - L - R, ph = H - T - B;
  const X = k => L + pw * (k - 1) / 18;
  const path = fn => { let d = ''; for (let k = 1; k <= 19; k += 0.25) d += (k === 1 ? 'M' : 'L') + X(k).toFixed(1) + ' ' + (T + ph * fn(k)).toFixed(1); return d; };
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Schematic: RSS falls, R squared rises, Cp and BIC have a minimum, adjusted R squared has a maximum">';
  s += '<g data-step="1"><line class="s-line" x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - R) + '" y2="' + (H - B) + '"/><line class="s-line" x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (H - B) + '"/><text class="lbl" x="' + (L + pw / 2) + '" y="' + (H - 10) + '" font-size="12" text-anchor="middle">number of predictors →</text><text class="t-muted" x="' + (W - R) + '" y="' + (T - 10) + '" font-size="10" text-anchor="end">schematic shapes, no values</text></g>';
  s += '<g data-step="2"><path d="' + path(k => 0.08 + 0.75 * Math.exp(-(k - 1) / 4)) + '" class="s-muted" stroke="var(--muted)" stroke-width="2"/><text class="lbl t-muted" x="' + X(2.2) + '" y="' + (T + 18) + '" font-size="11">RSS ↓</text>' +
    '<path d="' + path(k => 0.92 - 0.75 * (1 - Math.exp(-(k - 1) / 4))) + '" stroke="var(--muted)" fill="none" stroke-width="2" stroke-dasharray="5 3"/><text class="lbl t-muted" x="' + X(16) + '" y="' + (T + 14) + '" font-size="11">R² ↑</text></g>';
  s += '<g data-step="3"><path d="' + path(k => 0.35 + 0.004 * Math.pow(k - 8, 2) + 0.35 * Math.exp(-(k - 1) / 1.6)) + '" class="s-acc" stroke-width="2.5"/><circle cx="' + X(8.6) + '" cy="' + (T + ph * (0.35 + 0.004 * 0.36 + 0.35 * Math.exp(-7.6 / 1.6))) + '" r="5" class="f-acc"/><text class="lbl t-acc" x="' + X(8.6) + '" y="' + (T + ph * 0.35 + 24) + '" font-size="11" text-anchor="middle" font-weight="600">min Cp / BIC</text></g>';
  s += '<g data-step="4"><path d="' + path(k => 0.62 - 0.45 * (1 - Math.exp(-(k - 1) / 2)) + 0.0025 * Math.pow(k - 1, 2) * 0.6) + '" stroke="var(--ok)" fill="none" stroke-width="2.5"/><text class="lbl" x="' + X(13) + '" y="' + (T + ph * 0.32) + '" font-size="11" font-weight="600" style="fill:var(--ok)">Adj-R² (max)</text></g>';
  s += '<g data-step="5"><text class="lbl" x="' + (L + 10) + '" y="' + (H - B - 10) + '" font-size="12" font-weight="700">choose: min Cp · min BIC · max Adj-R²</text></g></svg>';
  return s;
};

/* ---------- Formula illustrations (computed from slide formulas/numbers or original schematics) ---------- */
function axes(o) {
  // o: {W,H,L,R,T,B,x0,x1,y0,y1,xt:[],yt:[],xl,yl,xf,yf}
  const X = v => o.L + (o.W - o.L - o.R) * (v - o.x0) / (o.x1 - o.x0);
  const Y = v => o.T + (o.H - o.T - o.B) * (1 - (v - o.y0) / (o.y1 - o.y0));
  let g = '';
  (o.yt || []).forEach(v => g += '<line class="s-muted" x1="' + o.L + '" x2="' + (o.W - o.R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="t-muted" x="' + (o.L - 7) + '" y="' + (Y(v) + 4) + '" font-size="11" text-anchor="end">' + (o.yf ? o.yf(v) : v) + '</text>');
  (o.xt || []).forEach(v => g += '<text class="t-muted" x="' + X(v) + '" y="' + (o.H - o.B + 16) + '" font-size="11" text-anchor="middle">' + (o.xf ? o.xf(v) : v) + '</text>');
  g += '<line class="s-line" x1="' + o.L + '" y1="' + (o.H - o.B) + '" x2="' + (o.W - o.R) + '" y2="' + (o.H - o.B) + '"/><line class="s-line" x1="' + o.L + '" y1="' + o.T + '" x2="' + o.L + '" y2="' + (o.H - o.B) + '"/>';
  if (o.xl) g += '<text x="' + (o.L + (o.W - o.L - o.R) / 2) + '" y="' + (o.H - 6) + '" font-size="12" text-anchor="middle">' + o.xl + '</text>';
  if (o.yl) g += '<text transform="translate(14 ' + (o.T + (o.H - o.T - o.B) / 2) + ') rotate(-90)" font-size="12" text-anchor="middle">' + o.yl + '</text>';
  return { X, Y, g };
}
const path = (X, Y, f, a, b, n) => { let d = ''; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; d += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(f(x)).toFixed(1); } return d; };
const svgOpen = (label, w, h) => '<svg viewBox="0 0 ' + (w || 480) + ' ' + (h || 300) + '" role="img" aria-label="' + esc(label) + '">';
function cmFig(mode) {
  // Topic 3 slide 19: logistic regression with time only
  const v = [[9625, 42, 9667], [233, 100, 333], [9858, 142, 10000]];
  const x0 = 140, y0 = 56, w = 100, h = 56;
  const hl = (r, c) => mode === 'error' ? (r < 2 && c < 2 && r !== c) : mode === 'rows' ? (r < 2 && c < 2 && r === c) : false;
  let s = svgOpen('Confusion matrix from Topic 3 slide 19 with ' + (mode === 'error' ? 'off-diagonal errors' : 'row-wise correct counts') + ' highlighted', 480, 300);
  ['Pred. 0', 'Pred. 1', 'Total'].forEach((t, i) => s += '<text x="' + (x0 + i * w + w / 2) + '" y="' + (y0 - 12) + '" text-anchor="middle" font-size="12" font-weight="700">' + t + '</text>');
  ['Obs. 0', 'Obs. 1', 'Total'].forEach((t, i) => s += '<text x="' + (x0 - 12) + '" y="' + (y0 + i * h + h / 2 + 4) + '" text-anchor="end" font-size="12" font-weight="700">' + t + '</text>');
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const on = hl(r, c);
    s += '<rect x="' + (x0 + c * w + 2) + '" y="' + (y0 + r * h + 2) + '" width="' + (w - 4) + '" height="' + (h - 4) + '" rx="7" class="' + (on ? (mode === 'error' ? 'f-hi' : 'f-leaf1') : (r < 2 && c < 2 ? 'f-node' : 'f-s2')) + '" stroke-width="' + (on ? 2 : 1) + '"/>' +
      '<text x="' + (x0 + c * w + w / 2) + '" y="' + (y0 + r * h + h / 2 + 6) + '" text-anchor="middle" font-size="17" font-weight="700" class="mono' + (on && mode === 'error' ? ' t-hi' : '') + '">' + v[r][c] + '</text>';
  }
  if (mode === 'error') s += '<text x="' + x0 + '" y="' + (y0 + 3 * h + 28) + '" font-size="13" class="mono">Error = (42 + 233) / 10000 = 0.0275</text>';
  else s += '<text x="' + x0 + '" y="' + (y0 + 3 * h + 26) + '" font-size="12.5" class="mono">Spec = 9625/9667 · Sens = 100/333</text>';
  return s + '</svg>';
}
const FIG = {
  sigmoid() {
    const a = axes({ W: 480, H: 290, L: 52, R: 16, T: 16, B: 44, x0: -6, x1: 6, y0: 0, y1: 1, xt: [-6, -4, -2, 0, 2, 4, 6], yt: [0, 0.25, 0.5, 0.75, 1], yf: v => v.toFixed(2), xl: 'η = β̂₀ + Σ β̂ⱼxⱼ', yl: 'P(Y = 1 | X)' });
    const f = e => 1 / (1 + Math.exp(-e));
    return svgOpen('Logistic function of the linear predictor', 480, 290) + a.g + '<path d="' + path(a.X, a.Y, f, -6, 6, 120) + '" class="s-acc" stroke-width="3"/>' +
      '<circle cx="' + a.X(0) + '" cy="' + a.Y(0.5) + '" r="5" class="f-acc"/><text x="' + (a.X(0) + 9) + '" y="' + (a.Y(0.5) + 16) + '" font-size="11.5">η = 0 → P = 0.5</text>' +
      '<circle cx="' + a.X(-5.15) + '" cy="' + a.Y(f(-5.15)) + '" r="5" class="f-hi"/><line x1="' + a.X(-5.15) + '" x2="' + a.X(-5.15) + '" y1="' + (a.Y(f(-5.15)) - 6) + '" y2="' + a.Y(0.22) + '" class="s-hi" stroke-width="1.2"/><text x="' + (a.X(-5.15) - 4) + '" y="' + (a.Y(0.22) - 6) + '" font-size="11.5" class="t-hi">time = 1000: η = −5.15, P = 0.006</text></svg>';
  },
  cutoff() { return SVG.logit(); },
  odds() {
    const a = axes({ W: 480, H: 290, L: 48, R: 16, T: 16, B: 44, x0: 0, x1: 0.9, y0: 0, y1: 9, xt: [0, 0.2, 0.4, 0.6, 0.8], yt: [0, 1, 3, 5, 7, 9], xl: 'p = P(Y = 1 | X)', yl: 'odds = p / (1 − p)' });
    const f = p => p / (1 - p);
    return svgOpen('Odds as a function of probability', 480, 290) + a.g + '<path d="' + path(a.X, a.Y, f, 0, 0.9, 90) + '" class="s-acc" stroke-width="3"/>' +
      '<line class="s-muted" stroke-dasharray="4 4" x1="' + a.X(0.5) + '" x2="' + a.X(0.5) + '" y1="' + a.Y(0) + '" y2="' + a.Y(1) + '"/><circle cx="' + a.X(0.5) + '" cy="' + a.Y(1) + '" r="5" class="f-acc"/><text x="' + (a.X(0.5) + 8) + '" y="' + (a.Y(1) - 8) + '" font-size="11.5">p = 0.5 → odds 1 (equally likely)</text>' +
      '<circle cx="' + a.X(0.2) + '" cy="' + a.Y(0.25) + '" r="5" class="f-hi"/><text x="' + (a.X(0.2) - 4) + '" y="' + (a.Y(0.25) - 12) + '" font-size="11.5" class="t-hi">p = 0.2 → odds 1/4 (T3 s12)</text></svg>';
  },
  'cm-error'() { return cmFig('error'); },
  'cm-rows'() { return cmFig('rows'); },
  line() {
    // Ten rows printed on Topic 2 slide 6 (temperature, processed product); fitted line from slide 10.
    const pts = [[230.1, 22.1], [44.5, 10.4], [17.2, 9.3], [151.5, 18.5], [180.8, 12.9], [8.7, 7.2], [57.5, 11.8], [120.2, 13.2], [8.6, 4.8], [199.8, 10.6]];
    const a = axes({ W: 480, H: 300, L: 46, R: 16, T: 16, B: 44, x0: 0, x1: 250, y0: 0, y1: 25, xt: [0, 50, 100, 150, 200, 250], yt: [0, 5, 10, 15, 20, 25], xl: 'temperature (ºC)', yl: 'out.quantity (kg)' });
    const f = x => 7.03 + 0.05 * x;
    let s = svgOpen('Ten production rows from Topic 2 slide 6 with the fitted line 7.03 + 0.05 temperature and their residuals', 480, 300) + a.g;
    pts.forEach(p => s += '<line x1="' + a.X(p[0]) + '" x2="' + a.X(p[0]) + '" y1="' + a.Y(p[1]) + '" y2="' + a.Y(f(p[0])) + '" class="s-hi" stroke-width="1.5" stroke-dasharray="3 2"/>');
    s += '<path d="' + path(a.X, a.Y, f, 0, 250, 2) + '" class="s-acc" stroke-width="3"/>';
    pts.forEach(p => s += '<circle cx="' + a.X(p[0]) + '" cy="' + a.Y(p[1]) + '" r="4.5" class="f-node" stroke-width="1.5" style="stroke:var(--fg-2)"/>');
    s += '<text x="' + a.X(140) + '" y="' + (a.Y(f(250)) + 4) + '" font-size="11.5" class="t-acc" font-weight="700">ŷ = 7.03 + 0.05·temperature</text>';
    s += '<text x="' + (a.X(230.1) - 6) + '" y="' + (a.Y(22.1) - 8) + '" font-size="11" text-anchor="end" class="t-hi">e = 22.1 − 18.54</text>';
    return s + '</svg>';
  },
  crit() { return SVG.crit(); },
  penalty() {
    const a = axes({ W: 480, H: 290, L: 46, R: 16, T: 16, B: 44, x0: 1, x1: 120, y0: 0, y1: 5, xt: [1, 20, 40, 60, 80, 100, 120], yt: [0, 1, 2, 3, 4, 5], xl: 'n (number of observations)', yl: 'penalty per predictor (× σ̂²)' });
    return svgOpen('Penalty per predictor: 2 for Cp versus log n for BIC', 480, 290) + a.g +
      '<path d="' + path(a.X, a.Y, () => 2, 1, 120, 2) + '" class="s-line" stroke-width="2.5" stroke-dasharray="6 4"/><text x="' + a.X(104) + '" y="' + (a.Y(2) + 16) + '" font-size="11.5" font-weight="700">Cp: 2</text>' +
      '<path d="' + path(a.X, a.Y, n => Math.log(n), 1, 120, 120) + '" class="s-acc" stroke-width="3"/><text x="' + a.X(96) + '" y="' + (a.Y(Math.log(120)) - 8) + '" font-size="11.5" class="t-acc" font-weight="700">BIC: log(n)</text>' +
      '<circle cx="' + a.X(Math.exp(2)) + '" cy="' + a.Y(2) + '" r="5" class="f-acc"/><text x="' + (a.X(Math.exp(2)) + 6) + '" y="' + (a.Y(2) - 10) + '" font-size="11">n ≈ 7.4: equal</text>' +
      '<circle cx="' + a.X(94) + '" cy="' + a.Y(Math.log(94)) + '" r="5" class="f-hi"/><text x="' + (a.X(94) - 8) + '" y="' + (a.Y(Math.log(94)) + 20) + '" font-size="11" text-anchor="end" class="t-hi">exam Q4: n = 94 → 4.54</text></svg>';
  },
  split() {
    let s = svgOpen('Validation set: the observations split into a training half and a test half', 480, 220);
    for (let i = 0; i < 12; i++) s += '<rect x="' + (24 + i * 37) + '" y="40" width="33" height="40" rx="6" class="' + (i < 6 ? 'f-leaf0' : 'f-c4') + '" stroke-width="1.2"/>';
    s += '<text x="134" y="104" text-anchor="middle" font-size="12.5" font-weight="700">Ω_TR · fit the model here</text><text x="356" y="104" text-anchor="middle" font-size="12.5" font-weight="700">Ω_TEST · t observations</text>';
    s += '<text x="356" y="130" text-anchor="middle" font-size="12" class="mono">ŷᵢ → (yᵢ − ŷᵢ)²</text><text x="240" y="178" text-anchor="middle" font-size="13" class="mono">MSE = (1/t) Σ (yᵢ − ŷᵢ)²</text>';
    return s + '</svg>';
  },
  loo() { return SVG.loo(); },
  kfold() {
    let s = svgOpen('Five-fold cross-validation: each fold is the test set once', 480, 260);
    for (let r = 0; r < 5; r++) {
      s += '<text x="20" y="' + (40 + r * 40 + 22) + '" font-size="11.5" class="t-muted">round ' + (r + 1) + '</text>';
      for (let c = 0; c < 5; c++) s += '<rect x="' + (86 + c * 62) + '" y="' + (40 + r * 40) + '" width="58" height="32" rx="6" class="' + (r === c ? 'f-c4' : 'f-leaf0') + '" stroke-width="1.2"/>' + (r === c ? '<text x="' + (86 + c * 62 + 29) + '" y="' + (40 + r * 40 + 21) + '" text-anchor="middle" font-size="11" font-weight="700">test</text>' : '');
      s += '<text x="404" y="' + (40 + r * 40 + 21) + '" font-size="11.5" class="mono">MSE' + (r + 1) + '</text>';
    }
    return s + '<text x="86" y="26" font-size="11.5" class="t-muted">fold 1 … fold 5</text><text x="404" y="250" font-size="12" class="mono" font-weight="700">avg → MSE_kCV</text></svg>';
  },
  knn() { return SVG.knn(); },
  euclid() {
    const a = axes({ W: 480, H: 300, L: 46, R: 16, T: 16, B: 44, x0: 0, x1: 6, y0: 0, y1: 7, xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 1, 2, 3, 4, 5, 6, 7], xl: 'variable 1', yl: 'variable 2' });
    return svgOpen('Euclidean distance between (1, 2) and (4, 6) as the hypotenuse of a 3-4-5 triangle', 480, 300) + a.g +
      '<path d="M' + a.X(1) + ' ' + a.Y(2) + ' L' + a.X(4) + ' ' + a.Y(2) + ' L' + a.X(4) + ' ' + a.Y(6) + '" class="s-line" stroke-width="2" stroke-dasharray="5 4"/>' +
      '<line x1="' + a.X(1) + '" y1="' + a.Y(2) + '" x2="' + a.X(4) + '" y2="' + a.Y(6) + '" class="s-acc" stroke-width="3.5"/>' +
      '<circle cx="' + a.X(1) + '" cy="' + a.Y(2) + '" r="6" class="f-acc"/><circle cx="' + a.X(4) + '" cy="' + a.Y(6) + '" r="6" class="f-acc"/>' +
      '<text x="' + (a.X(1) - 8) + '" y="' + (a.Y(2) + 18) + '" font-size="12" class="mono">x₁ = (1, 2)</text><text x="' + (a.X(4) + 8) + '" y="' + (a.Y(6) - 6) + '" font-size="12" class="mono">x₂ = (4, 6)</text>' +
      '<text x="' + a.X(2.5) + '" y="' + (a.Y(2) + 18) + '" font-size="12" text-anchor="middle">3</text><text x="' + (a.X(4) + 10) + '" y="' + a.Y(4) + '" font-size="12">4</text>' +
      '<text x="' + (a.X(2.5) - 10) + '" y="' + (a.Y(4.2)) + '" font-size="13" class="t-acc" font-weight="700" text-anchor="end">d = √(3² + 4²) = 5</text></svg>';
  },
  gini() {
    const a = axes({ W: 480, H: 290, L: 48, R: 16, T: 16, B: 44, x0: 0, x1: 1, y0: 0, y1: 0.55, xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.1, 0.2, 0.3, 0.4, 0.5], yf: v => v.toFixed(1), xl: 'share of class 1 in the node', yl: 'Gini index G' });
    const f = p => 2 * p * (1 - p);
    return svgOpen('Gini index of a two-class node against the share of class 1', 480, 290) + a.g + '<path d="' + path(a.X, a.Y, f, 0, 1, 100) + '" class="s-acc" stroke-width="3"/>' +
      '<circle cx="' + a.X(0.5) + '" cy="' + a.Y(0.5) + '" r="5" class="f-hi"/><text x="' + a.X(0.5) + '" y="' + (a.Y(0.5) - 10) + '" font-size="11.5" text-anchor="middle" class="t-hi">50/50 → 0.5 (most mixed)</text>' +
      '<circle cx="' + a.X(0) + '" cy="' + a.Y(0) + '" r="5" class="f-acc"/><circle cx="' + a.X(1) + '" cy="' + a.Y(0) + '" r="5" class="f-acc"/><text x="' + (a.X(1) - 6) + '" y="' + (a.Y(0) - 10) + '" font-size="11.5" text-anchor="end">pure node → 0</text></svg>';
  },
  dummy() {
    const vals = [['African American', 531.00, 'baseline: β̂₀'], ['Asian', 512.31, 'β̂₀ + β̂₁'], ['Caucasian', null, 'β̂₀ + β̂₂ = ?']];
    const a = axes({ W: 480, H: 290, L: 52, R: 16, T: 20, B: 44, x0: 0, x1: 3, y0: 480, y1: 540, yt: [480, 500, 520, 540], yl: 'predicted debt ($)' });
    let s = svgOpen('Predicted credit debt per ethnicity group from Topic 2 slide 22', 480, 290) + a.g;
    vals.forEach((v, i) => {
      const x = a.X(i + 0.5);
      if (v[1] != null) s += '<rect x="' + (x - 40) + '" y="' + a.Y(v[1]) + '" width="80" height="' + (a.Y(480) - a.Y(v[1])) + '" rx="6" class="' + (i ? 'f-leaf1' : 'f-leaf0') + '" stroke-width="1.2"/><text x="' + x + '" y="' + (a.Y(v[1]) - 8) + '" text-anchor="middle" font-size="12.5" font-weight="700" class="mono">' + v[1].toFixed(2) + '</text>';
      else s += '<rect x="' + (x - 40) + '" y="' + a.Y(530) + '" width="80" height="' + (a.Y(480) - a.Y(530)) + '" rx="6" class="f-s2" stroke="var(--line-2)" stroke-dasharray="5 4"/><text x="' + x + '" y="' + (a.Y(505)) + '" text-anchor="middle" font-size="18" font-weight="700" class="t-muted">?</text>';
      s += '<text x="' + x + '" y="' + (a.Y(480) + 16) + '" text-anchor="middle" font-size="11">' + v[0] + '</text><text x="' + x + '" y="' + (a.Y(480) + 30) + '" text-anchor="middle" font-size="10.5" class="t-muted">' + v[2] + '</text>';
    });
    return s + '</svg>';
  }
};
const FIGSRC = { sigmoid: 'computed', cutoff: 'computed', odds: 'computed', 'cm-error': 'redrawn', 'cm-rows': 'redrawn', line: 'redrawn', crit: 'original', penalty: 'computed', split: 'original', loo: 'original', kfold: 'original', knn: 'original', euclid: 'original', gini: 'computed', dummy: 'redrawn' };
const FIGCAP = {
  sigmoid: 'Computed from the logistic function. The orange point is the Topic 3 slide 16 example (time = 1000).',
  cutoff: 'Curve computed from the Topic 3 slide 10 model. Moving the cutoff from 0.5 to 0.45 moves the decision point left.',
  odds: 'Computed from odds = p/(1 − p). Odds grow without limit as p approaches 1.',
  'cm-error': 'Numbers from Topic 3 slide 19 (logistic, time only). Errors are the two off-diagonal cells.',
  'cm-rows': 'Numbers from Topic 3 slide 19. Sensitivity reads the "Obs. 1" row; specificity reads the "Obs. 0" row.',
  line: 'The ten data rows printed on Topic 2 slide 6 and the fitted line from slide 10. Dashed orange segments are residuals.',
  crit: 'Schematic shapes only (pattern from Topic 2 slides 36–37 and 51–53). RSS always falls; Cp/BIC have a minimum.',
  penalty: 'Computed: each extra predictor costs 2σ̂² in Cp and log(n)σ̂² in BIC.',
  split: 'Original schematic of the validation-set approach on Topic 2 slide 43.',
  loo: 'Original schematic of the Leave-One-Out procedure on Topic 2 slide 45.',
  kfold: 'Original schematic of k-fold cross-validation (k = 5) from Topic 2 slide 47.',
  knn: 'Original schematic in the style of the 3-NN example on Topic 3 slide 32.',
  euclid: 'Original example with simple numbers.',
  gini: 'Computed for two classes: G = 2p(1 − p).',
  dummy: 'Bars from the Topic 2 slide 22 equation. The Caucasian bar is the practice question.'
};

/* ---------------- drawing pad ---------------- */
function mountPad(host, key, opts) {
  opts = opts || {};
  const colors = ['ink', 'accent', 'bad'];
  host.innerHTML = '<div class="toolbar" style="margin-bottom:8px"><button class="btn sm" data-tool="pen" aria-pressed="true">Pen</button><button class="btn sm" data-tool="eraser" aria-pressed="false">Eraser</button>' +
    colors.map((c, i) => '<button class="swatch" data-color="' + c + '" aria-label="Colour ' + c + '" aria-pressed="' + (i === 0) + '" style="background:var(--' + c + ')"></button>').join('') +
    '<select data-size aria-label="Pen size" style="padding:5px;border-radius:8px;border:1px solid var(--line-2);background:var(--surface)"><option value="2">Thin</option><option value="4" selected>Medium</option><option value="8">Thick</option></select>' +
    '<button class="btn sm" data-grid aria-pressed="' + (!!opts.grid) + '">Grid</button>' + (opts.overlay ? '<button class="btn sm" data-ov aria-pressed="false">Compare overlay</button>' : '') +
    '<button class="btn sm" data-undo>Undo</button><button class="btn sm bad" data-clear>Clear</button></div>' +
    '<div class="canvas-wrap' + (opts.grid ? ' grid' : '') + '"><canvas aria-label="Drawing area"></canvas>' + (opts.overlay ? '<div data-ovl hidden style="position:absolute;inset:0;opacity:.28;pointer-events:none;display:flex;align-items:center;justify-content:center;padding:12px">' + opts.overlay + '</div>' : '') + '</div><div data-pconf></div>';
  const wrap = $('.canvas-wrap', host), cv = $('canvas', host), ctx = cv.getContext('2d');
  let tool = 'pen', color = 'ink', size = 4, strokes = [], cur = null;
  try { strokes = JSON.parse(JSON.stringify(S.drawings[key] || [])); if (!Array.isArray(strokes)) strokes = []; } catch (e) { strokes = []; }
  const css = n => getComputedStyle(document.documentElement).getPropertyValue('--' + n).trim() || '#000';
  const fit = () => { const r = wrap.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1; cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); redraw(); };
  const drawStroke = st => { if (!st.pts.length) return; const r = wrap.getBoundingClientRect(); ctx.save(); ctx.globalCompositeOperation = st.tool === 'eraser' ? 'destination-out' : 'source-over'; ctx.strokeStyle = st.tool === 'eraser' ? '#000' : css(st.color); ctx.lineWidth = st.tool === 'eraser' ? st.size * 4 : st.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); st.pts.forEach((p, i) => { const x = p[0] * r.width, y = p[1] * r.height; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); if (st.pts.length === 1) { const x = st.pts[0][0] * r.width, y = st.pts[0][1] * r.height; ctx.lineTo(x + 0.1, y + 0.1); } ctx.stroke(); ctx.restore(); };
  const redraw = () => { const r = wrap.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height); strokes.forEach(drawStroke); if (cur) drawStroke(cur); };
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  const persist = () => { S.drawings[key] = strokes; save(); };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); cur = { tool, color, size, pts: [pos(e)] }; redraw(); });
  cv.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; evs.forEach(ev => cur.pts.push(pos(ev))); redraw(); });
  const up = () => { if (!cur) return; cur.pts = cur.pts.map(p => [+p[0].toFixed(4), +p[1].toFixed(4)]); strokes.push(cur); cur = null; persist(); redraw(); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', e => { if (cur && e.buttons === 0) up(); });
  $$('[data-tool]', host).forEach(b => b.addEventListener('click', () => { tool = b.dataset.tool; $$('[data-tool]', host).forEach(x => x.setAttribute('aria-pressed', x === b)); }));
  $$('[data-color]', host).forEach(b => b.addEventListener('click', () => { color = b.dataset.color; tool = 'pen'; $$('[data-color]', host).forEach(x => x.setAttribute('aria-pressed', x === b)); $$('[data-tool]', host).forEach(x => x.setAttribute('aria-pressed', x.dataset.tool === 'pen')); }));
  $('[data-size]', host).addEventListener('change', e => size = +e.target.value);
  $('[data-grid]', host).addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); wrap.classList.toggle('grid', on); });
  const ov = $('[data-ov]', host); if (ov) ov.addEventListener('click', () => { const on = ov.getAttribute('aria-pressed') !== 'true'; ov.setAttribute('aria-pressed', on); $('[data-ovl]', host).hidden = !on; });
  $('[data-undo]', host).addEventListener('click', () => { strokes.pop(); persist(); redraw(); });
  $('[data-clear]', host).addEventListener('click', () => {
    if (!strokes.length) return;
    const pc = $('[data-pconf]', host);
    pc.innerHTML = '<div class="confirm" style="margin-top:8px"><span>Clear the whole sketch?</span><button class="btn sm bad" data-y>Clear sketch</button><button class="btn sm" data-n>Cancel</button></div>';
    $('[data-y]', pc).onclick = () => { strokes = []; persist(); redraw(); pc.innerHTML = ''; toast('Sketch cleared'); };
    $('[data-n]', pc).onclick = () => { pc.innerHTML = ''; };
  });
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(wrap); else window.addEventListener('resize', fit);
  fit();
  return { get strokes() { return strokes; } };
}

/* ---------------- mock exam ---------------- */
VIEWS.mock = function () {
  const m = S.mock;
  if (m.active) return '<div id="mockHost" class="stack"></div>';
  const last = m.last ? m.history.find(h => h.t === m.last) : null;
  return '<div class="page-head"><span class="eyebrow">Mock examination · ' + esc(D.EXAM_META.title) + '</span><h1>Mock exam</h1><p>The real paper, in order: ' + D.Q.length + ' parts, ' + fmt(D.Q.reduce((a, q) => a + q.marks, 0), 1) + ' points. Answers save as you type, so you can leave and resume.</p></div>' +
    '<div class="card stack"><h3>Settings</h3><div class="notice info"><div>The paper does not state a duration. Choose your own time, or practise untimed.</div></div>' +
    '<div class="row"><label class="field">Time limit (minutes, optional)<input id="mkMin" type="number" min="5" max="300" step="5" placeholder="untimed"></label></div>' +
    '<div class="row"><button class="btn primary" id="mkStart">Start mock exam</button><a class="btn" href="#calc">Open calculators</a></div>' +
    '<p class="small muted">After you submit: written parts get an estimated learning-rubric score; calculation parts (Q2(i), Q2(ii), Q4(iii)) are self-checked against the calculators because their figures are needed. Estimated marks are not official.</p></div>' +
    (m.history.length ? '<div class="card stack"><h3>Previous attempts</h3><ul class="list-plain">' + m.history.map(h => '<li><span>' + new Date(h.t).toLocaleString() + '</span><span class="row"><span class="small muted">' + h.answered + '/' + D.Q.length + ' answered</span><span class="chip acc">est. ' + fmt(h.est, 2) + ' / ' + fmt(h.estMax, 2) + '</span><button class="btn sm" data-mres="' + h.t + '">Review</button></span></li>').join('') + '</ul></div>' : '') +
    '<div id="mockRes"></div>';
};
AFTER.mock = function () {
  const m = S.mock;
  if (m.active) { runMock(); return; }
  $('#mkStart').addEventListener('click', () => {
    const min = parseFloat($('#mkMin').value);
    m.active = { answers: {}, idx: 0, start: Date.now(), endAt: isFinite(min) && min > 0 ? Date.now() + min * 60000 : null, min: isFinite(min) ? min : null, review: false };
    save(true); route();
  });
  $$('[data-mres]').forEach(b => b.addEventListener('click', () => { showMockResult(+b.dataset.mres); }));
  if (m.last && sessionStorageTake('showMock')) showMockResult(m.last);
};
let mockTimer = null;
function runMock() {
  const host = $('#mockHost'); const a = S.mock.active;
  clearInterval(mockTimer);
  const draw = () => {
    if (a.review) { drawReview(); return; }
    const q = D.Q[a.idx];
    const ans = a.answers[q.id] || '';
    a.flags = a.flags || {};
    const answered = D.Q.filter(x => (a.answers[x.id] || '').trim()).length;
    host.innerHTML = '<div class="exam-bar"><div class="row"><span class="eyebrow">Mock examination</span><b class="num small" id="mkCount">' + answered + '/' + D.Q.length + ' answered</b></div><div class="row">' + (a.endAt ? '<span class="timer" id="timer" role="timer" aria-label="Time left"></span>' : '<span class="badge plain">Untimed</span>') + '<button class="btn sm' + (a.flags[q.id] ? ' on' : '') + '" id="mkFlag" aria-pressed="' + !!a.flags[q.id] + '">⚑ Flag</button><button class="btn sm primary" id="mkRev">Review & submit</button></div></div>' +
      '<div class="mock-grid"><div class="mock-nav" aria-label="Question navigator">' + D.Q.map((x, i) => '<button data-mi="' + i + '" class="' + ((a.answers[x.id] || '').trim() ? 'done' : '') + (a.flags[x.id] ? ' flag' : '') + '" aria-current="' + (i === a.idx) + '" aria-label="' + esc(qLabel(x)) + '">' + esc(x.ex + (x.part ? x.part.replace(/[()]/g, '') : '')) + '</button>').join('') + '</div>' +
      '<div class="stack"><div class="card raised stack"><div class="row between"><h3>' + esc(qLabel(q)) + '</h3><span class="chip">' + fmt(q.marks, 1) + ' points</span></div>' + (q.exHead ? '<p class="small muted">' + esc(q.exHead) + '</p>' : '') + '<p class="qtext">' + esc(q.text) + '</p>' + (q.table ? tableHTML(q.table) : '') + (q.ex === 2 && q.part !== '(iii)' ? '<details class="acc"><summary>Table 1 · new patient data</summary><div class="acc-body">' + patientsTable() + '</div></details>' : '') +
        (q.calc && q.calc !== 'choose' ? '<div class="notice warn"><div>This part needs Figure ' + (q.id === 'q2i' ? '1' : q.id === 'q2ii' ? '2' : '3') + ' from your copy of the paper. Work it out on paper (or with the <a href="#calc" target="_self">calculator</a> afterwards) and write the matrix / result here.</div></div>' : '') + '</div>' +
        '<textarea class="answer" id="mkTa" aria-label="Answer for ' + esc(qLabel(q)) + '" placeholder="Your answer…">' + esc(ans) + '</textarea>' +
        (q.id === 'q2i' || q.id === 'q4i' ? '<details class="acc"><summary>Sketch pad (optional)</summary><div class="acc-body" id="mkPad"></div></details>' : '') +
        '<div class="row between"><button class="btn" id="mkPrev"' + (a.idx === 0 ? ' disabled' : '') + '>← Previous</button><span class="small muted">Saved automatically</span><button class="btn primary" id="mkNext">' + (a.idx === D.Q.length - 1 ? 'Review answers' : 'Next →') + '</button></div></div></div>' +
      '<div id="mkQuit" class="row"><button class="btn sm ghost" id="mkAbandon">Abandon attempt</button></div>';
    const ta = $('#mkTa');
    ta.addEventListener('input', () => { a.answers[q.id] = ta.value; save(); const b = $('[data-mi="' + a.idx + '"]'); if (b) b.classList.toggle('done', !!ta.value.trim()); $('#mkCount').textContent = D.Q.filter(x => (a.answers[x.id] || '').trim()).length + '/' + D.Q.length + ' answered'; });
    $('#mkFlag').addEventListener('click', e => { a.flags[q.id] = !a.flags[q.id]; save(); e.currentTarget.setAttribute('aria-pressed', a.flags[q.id]); e.currentTarget.classList.toggle('on', a.flags[q.id]); const b = $('[data-mi="' + a.idx + '"]'); if (b) b.classList.toggle('flag', a.flags[q.id]); toast(a.flags[q.id] ? 'Flagged for review' : 'Flag removed'); });
    $$('[data-mi]').forEach(b => b.addEventListener('click', () => { a.idx = +b.dataset.mi; save(); draw(); }));
    $('#mkPrev').addEventListener('click', () => { a.idx = Math.max(0, a.idx - 1); save(); draw(); });
    $('#mkNext').addEventListener('click', () => { if (a.idx === D.Q.length - 1) { a.review = true; } else a.idx++; save(true); draw(); });
    $('#mkRev').addEventListener('click', () => { a.review = true; save(); draw(); });
    $('#mkAbandon').addEventListener('click', () => {
      $('#mkQuit').innerHTML = '<div class="confirm"><span>Abandon this attempt? Your answers will be discarded.</span><button class="btn sm bad" id="mkAy">Abandon</button><button class="btn sm" id="mkAn">Keep going</button></div>';
      $('#mkAy').onclick = () => { S.mock.active = null; clearInterval(mockTimer); save(true); route(); };
      $('#mkAn').onclick = () => draw();
    });
    const pad = $('#mkPad'); if (pad) pad.closest('details').addEventListener('toggle', function once() { if (this.open && !pad.dataset.m) { pad.dataset.m = 1; mountPad(pad, 'mock-' + q.id, { grid: q.id === 'q4i' }); } });
    tick();
  };
  const drawReview = () => {
    const un = D.Q.filter(q => !(a.answers[q.id] || '').trim());
    host.innerHTML = '<div class="exam-bar"><div class="row"><span class="eyebrow">Mock examination</span><h2 style="font-size:1.2rem">Review before submitting</h2></div>' + (a.endAt ? '<span class="timer" id="timer" role="timer" aria-label="Time left"></span>' : '') + '</div>' +
      (un.length ? '<div class="notice warn"><div><b>' + un.length + ' unanswered:</b> ' + un.map(q => '<button class="chip" data-go="' + D.Q.indexOf(q) + '">' + esc(qLabel(q)) + '</button>').join(' ') + '</div></div>' : '<div class="notice ok"><div>All ' + D.Q.length + ' parts have an answer.</div></div>') +
      '<div class="card" style="padding:0">' + D.Q.map((q, i) => '<div class="qrow" style="cursor:default"><span class="qid">' + esc(qLabel(q)) + ((a.flags || {})[q.id] ? ' <span style="color:var(--flag)" aria-label="flagged">⚑</span>' : '') + '</span><span class="small ' + ((a.answers[q.id] || '').trim() ? '' : 'muted') + '" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc((a.answers[q.id] || '').trim().slice(0, 120) || 'No answer') + '</span><button class="btn sm" data-go="' + i + '">Edit</button></div>').join('') + '</div>' +
      '<div class="row" id="mkSubRow"><button class="btn" id="mkBack">← Back to questions</button><button class="btn primary" id="mkSubmit">Submit exam</button></div>';
    $$('[data-go]').forEach(b => b.addEventListener('click', () => { a.review = false; a.idx = +b.dataset.go; save(); draw(); }));
    $('#mkBack').addEventListener('click', () => { a.review = false; save(); draw(); });
    $('#mkSubmit').addEventListener('click', () => {
      $('#mkSubRow').innerHTML = '<div class="confirm" style="width:100%"><span>' + (un.length ? '<b>' + un.length + ' part' + (un.length > 1 ? 's are' : ' is') + ' unanswered</b> and will score zero. ' : '') + 'You can\'t change answers after submitting.</span><button class="btn sm primary" id="mkYes">Yes, submit</button><button class="btn sm" id="mkNo">Keep working</button></div>';
      $('#mkYes').onclick = submitMock; $('#mkNo').onclick = () => drawReview();
    });
    tick();
  };
  const tick = () => {
    clearInterval(mockTimer);
    if (!a.endAt) return;
    const upd = () => { const el = $('#timer'); if (!el) { clearInterval(mockTimer); return; } const left = Math.max(0, a.endAt - Date.now()); const mm = Math.floor(left / 60000), ss = Math.floor(left % 60000 / 1000); el.textContent = mm + ':' + String(ss).padStart(2, '0'); el.classList.toggle('low', left < 5 * 60000); if (left <= 0) { clearInterval(mockTimer); if (!a.review) { a.review = true; save(); toast('Time is up: review and submit'); draw(); } } };
    upd(); mockTimer = setInterval(upd, 1000);
  };
  draw();
}
function submitMock() {
  const a = S.mock.active; clearInterval(mockTimer);
  const results = {}; let est = 0, estMax = 0;
  D.Q.forEach(q => {
    const text = a.answers[q.id] || '';
    if (q.rubric) { const r = grade(q, text); const e = text.trim() ? Math.round(r.score * q.marks * 4) / 4 : 0; results[q.id] = { score: text.trim() ? r.score : 0, est: e }; est += e; estMax += q.marks; if (text.trim()) { const st = qs(q.id); st.practiced = true; st.attempts.push({ t: Date.now(), score: r.score, mock: true }); st.last = r.score; if (r.score >= 0.8) st.mastered = true; } }
    else results[q.id] = { score: null, est: null };
  });
  const h = { t: Date.now(), answers: a.answers, results, est, estMax, answered: D.Q.filter(q => (a.answers[q.id] || '').trim()).length, min: a.min, used: Math.round((Date.now() - a.start) / 60000) };
  S.mock.history.unshift(h); S.mock.history = S.mock.history.slice(0, 10); S.mock.last = h.t; S.mock.active = null;
  touch('m', 'mock', 'Mock exam submitted');
  save(true); sessionStorageSet('showMock', '1'); route();
}
function showMockResult(t) {
  const h = S.mock.history.find(x => x.t === t); if (!h) return;
  const host = $('#mockRes');
  host.innerHTML = '<div class="card pad-lg stack"><span class="eyebrow">Results · ' + new Date(h.t).toLocaleString() + '</span><div class="row" style="align-items:baseline;gap:14px"><span class="bigscore">' + fmt(h.est, 2) + '</span><span class="muted">of ' + fmt(h.estMax, 2) + ' points on auto-checked parts (estimate)</span></div>' +
    '<p class="small muted">' + h.answered + ' of ' + D.Q.length + ' parts answered' + (h.used != null ? ' · ' + h.used + ' min used' : '') + '. Auto-checked parts use the estimated learning rubric; calculation parts (' + D.Q.filter(q => !q.rubric).map(qLabel).join(', ') + ', ' + fmt(D.Q.filter(q => !q.rubric).reduce((s, q) => s + q.marks, 0), 1) + ' pt) need self-checking with the calculators.</p></div>' +
    D.Q.map(q => { const r = h.results[q.id]; const text = h.answers[q.id] || ''; const res = q.rubric && text.trim() ? grade(q, text) : null;
      return '<details class="acc"><summary><span class="qid" style="min-width:60px">' + esc(qLabel(q)) + '</span><span class="small muted" style="min-width:0">' + fmt(q.marks, 1) + ' pt</span><span style="margin-left:auto" class="row">' + (r.score == null ? '<span class="chip warn">Self-check</span>' : text.trim() ? '<span class="chip ' + band(r.score)[0] + '">' + Math.round(r.score * 100) + '% · est. ' + fmt(r.est, 2) + ' pt</span>' : '<span class="chip bad">Unanswered</span>') + '</span></summary><div class="acc-body">' +
        '<p class="qtext quote">' + esc(q.text) + '</p>' +
        (res ? feedbackHTML(q, res, text) : '<div><div class="eyebrow">Your answer</div><div class="exam-ans prewrap">' + (esc(text) || '<span class="muted">No answer</span>') + '</div></div><div><div class="eyebrow">Model answer / method</div><div class="exam-ans prewrap">' + esc(q.model) + '</div></div>' + (q.calc ? '<a class="btn sm" href="#calc">Check with the calculator</a>' : '')) +
      '</div></details>'; }).join('');
  host.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------------- revision ---------------- */
function revisionItems() {
  const out = [];
  D.Q.forEach(q => { const st = S.q[q.id]; if (st && st.last != null && st.last < 0.8 && !st.mastered) out.push({ href: q.id, label: qLabel(q) + ' · ' + q.text.slice(0, 60) + '…', why: Math.round(st.last * 100) + '% last try', cls: st.last < 0.5 ? 'bad' : 'warn', kind: 'q', topic: q.topics[0] }); });
  D.PRACTICE.forEach(p => { const st = S.practice[p.id]; if (st && st.last != null && st.last < 0.8) out.push({ href: 'write', label: 'Practice · ' + p.title, why: Math.round(st.last * 100) + '% last try', cls: st.last < 0.5 ? 'bad' : 'warn', kind: 'p', id: p.id, topic: p.topic }); });
  D.DIAGRAMS.forEach(d => { const st = S.diag[d.id]; if (st && st.rating === 'practice') out.push({ href: d.id, label: d.title, why: 'diagram', cls: 'warn', kind: 'd', topic: d.topic }); });
  const rc = D.CARDS.filter(c => S.cards[c.id] === 'review'); if (rc.length) out.push({ href: 'cards', label: rc.length + ' flashcard' + (rc.length > 1 ? 's' : '') + ' still learning', why: 'flashcards', cls: 'warn', kind: 'c' });
  return out;
}
VIEWS.revision = function () {
  const items = revisionItems();
  const byTopic = D.TOPICS.map(t => { const qsIn = D.Q.filter(q => q.topics.includes(t.id)); const att = qsIn.filter(q => S.q[q.id] && S.q[q.id].attempts && S.q[q.id].attempts.length); const avg = att.length ? att.reduce((a, q) => a + (S.q[q.id].last || 0), 0) / att.length : null; const cs = D.CARDS.filter(c => c.topic === t.id); return { t, qn: qsIn.length, att: att.length, avg, mastered: qsIn.filter(q => qs(q.id).mastered).length, known: cs.filter(c => S.cards[c.id] === 'known').length, cards: cs.length }; });
  const repeated = D.Q.filter(q => S.q[q.id] && S.q[q.id].attempts.filter(x => x.score < 0.6).length >= 2);
  const bms = D.CONCEPTS.filter(c => S.bookmarks[c.id]);
  return head('Review · my progress', 'Revision & progress', 'Built only from what you have done: answers below 80%, flashcards marked for review, diagrams marked "Practise more".') +
    (bms.length ? '<div class="card stack"><h3>Bookmarked lessons</h3><div class="row">' + bms.map(c => '<a class="chip acc" href="#' + c.id + '">' + esc(c.title) + '</a>').join('') + '</div></div>' : '') +
    '<div class="card stack"><div class="row between"><h3>Queue</h3>' + (items.length ? '<a class="btn sm primary" href="#' + items[0].href + '"' + (items[0].kind === 'p' ? ' data-wsel="' + items[0].id + '"' : '') + '>Start with the first item</a>' : '') + '</div>' + (items.length ? '<ul class="list-plain">' + items.map(w => '<li><a href="#' + esc(w.href) + '"' + (w.kind === 'p' ? ' data-wsel="' + w.id + '"' : '') + '>' + esc(w.label) + '</a><span class="chip ' + w.cls + '">' + esc(w.why) + '</span></li>').join('') + '</ul>' : '<div class="empty">Your queue is empty. Submit written answers, rate flashcards and diagrams, and anything that needs work will appear here.</div>') + '</div>' +
    (repeated.length ? '<div class="card stack"><h3>Repeated struggles</h3><p class="small muted">Two or more attempts below 60%.</p><div class="row">' + repeated.map(q => '<a class="chip bad" href="#' + q.id + '">' + esc(qLabel(q)) + '</a>').join('') + '</div></div>' : '') +
    '<div class="card stack"><h3>Progress by topic</h3><div class="tbl-wrap"><table><thead><tr><th>Topic</th><th>Exam parts mastered</th><th>Avg last score</th><th>Flashcards known</th></tr></thead><tbody>' + byTopic.map(b => '<tr><th scope="row"><a href="#' + b.t.id + '">Topic ' + b.t.n + ' · ' + esc(b.t.title) + '</a></th><td>' + b.mastered + ' / ' + b.qn + '</td><td>' + (b.avg == null ? '<span class="muted">no attempts</span>' : Math.round(b.avg * 100) + '% (' + b.att + ' parts)') + '</td><td>' + b.known + ' / ' + b.cards + '</td></tr>').join('') + '</tbody></table></div><p class="small muted">A part can count under more than one topic.</p></div>' +
    '<div class="card stack"><h3>Move progress to another device</h3><p class="small muted">Progress is saved in this browser only and does not sync. Copy this code on one device and import it on another. Sketches are not included, to keep the code short.</p>' +
      '<div class="row"><button class="btn" id="exBtn">Copy my progress code</button></div><textarea class="answer" id="exCode" style="min-height:90px;font-family:var(--f-mono);font-size:.78rem" aria-label="Progress code" placeholder="Paste a progress code here to import it"></textarea>' +
      '<div class="row"><button class="btn primary" id="imBtn">Import code</button><span id="imMsg" class="small" role="status"></span></div></div>' +
    '<div class="card stack"><h3>Reset</h3><p class="small muted">Deletes all progress, answers, sketches and mock attempts stored in this browser.</p><div id="resetBox"><button class="btn bad" id="resetBtn">Reset all progress</button></div></div>';
};
AFTER.revision = function () {
  $('#exBtn').addEventListener('click', () => {
    const copy = JSON.parse(JSON.stringify(S)); copy.drawings = {};
    let code = ''; try { code = btoa(unescape(encodeURIComponent(JSON.stringify(copy)))); } catch (e) { toast('Could not build the code'); return; }
    const ta = $('#exCode'); ta.value = code;
    const fallback = () => { ta.focus(); ta.select(); $('#imMsg').textContent = 'Press Ctrl/Cmd+C to copy the selected code.'; };
    try { navigator.clipboard.writeText(code).then(() => toast('Copied'), fallback); } catch (e) { fallback(); }
  });
  $('#imBtn').addEventListener('click', () => {
    const raw = $('#exCode').value.trim();
    try {
      const obj = JSON.parse(decodeURIComponent(escape(atob(raw))));
      if (!obj || obj.v !== 1) throw new Error('bad');
      const drawings = S.drawings; S = Object.assign(fresh(), obj); S.drawings = drawings; save(true); toast('Progress imported'); route();
    } catch (e) { $('#imMsg').innerHTML = '<span class="bad-t">That code isn\'t valid.</span> Copy the whole code from the other device and try again.'; }
  });
  $$('[data-wsel]').forEach(a => a.addEventListener('click', () => { S.writeSel = a.dataset.wsel; save(true); }));
  $('#resetBtn').addEventListener('click', () => {
    $('#resetBox').innerHTML = '<div class="confirm"><span><b>Delete all progress?</b> This cannot be undone.</span><button class="btn sm bad" id="rsY">Delete everything</button><button class="btn sm" id="rsN">Cancel</button></div>';
    $('#rsY').onclick = () => { const th = S.theme; S = fresh(); S.theme = th; save(true); toast('Progress reset'); location.hash = '#home'; route(); };
    $('#rsN').onclick = () => route();
  });
};

/* ---------------- sources & map ---------------- */
VIEWS.sources = function () {
  return head('Review · sources', 'Sources & question map', 'How every exam part traces back to the slides. The exam decides what is taught; the slides supply the content.') +
    '<div class="card" style="padding:0"><div class="tbl-wrap" style="border:0"><table><thead><tr><th>Part</th><th>Marks</th><th>Topic(s)</th><th>Skill</th><th>Slides</th><th>Activities</th></tr></thead><tbody>' +
    D.Q.map(q => '<tr><th scope="row"><a href="#' + q.id + '">' + esc(qLabel(q)) + '</a></th><td>' + fmt(q.marks, 1) + '</td><td>' + q.topics.map(t => 'T' + topicById(t).n).join(', ') + '</td><td style="white-space:normal;min-width:180px">' + esc(q.format) + '</td><td style="white-space:normal;min-width:200px">' + refs(q.refs) + '</td><td style="white-space:normal;min-width:160px">' + [q.rubric ? 'written practice' : null, q.calc && q.calc !== 'choose' ? 'calculator' : null, q.calc === 'choose' ? 'decision helper' : null, D.DIAGRAMS.some(d => d.q.includes(q.id)) ? 'diagram drill' : null, 'mock exam'].filter(Boolean).join(' · ') + '</td></tr>').join('') +
    '</tbody></table></div></div>' +
    '<div class="card stack"><h3>Files used</h3><ul class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px"><li><b>Exam_IC40.pdf</b>: primary authority (all questions, marks, Table 1–3 values).</li>' + D.TOPICS.map(t => '<li><b>' + esc(t.file) + '</b>: ' + esc(t.title) + ' (' + t.slides + ' slides), by S. Benítez, original slides by V. Guerrero, UC3M.</li>').join('') + '</ul></div>' +
    '<div class="card stack"><h3>External material (labelled where used)</h3><ul class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px"><li>Histogram description checklist: <a href="https://www.census.gov/schools/activities/math/census-in-counties.html" target="_blank" rel="noopener">U.S. Census Bureau, Describing and Comparing Histograms</a>.</li><li>Shapes of the lcp and age variables in the prostate data: Hastie, Tibshirani & Friedman, <i>The Elements of Statistical Learning</i> (cited on T1 s25). Verify against your exam figures.</li><li>R\'s naming of dummy variables (e.g. SexM) and alphabetical baseline level: standard R factor behaviour.</li></ul></div>' +
    '<div class="card stack"><h3>Known limitations</h3><ul class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px">' + D.EXAM_META.notes.map(n => '<li>' + esc(n) + '</li>').join('') + '<li>Slide images (plots, the visual vocabulary chart) could not be extracted, so diagrams are redrawn from slide text, computed from slide formulas, or original schematics, each labelled.</li><li>Answer checking is keyword-based and is an estimate, not a human examiner.</li><li>Progress lives in this browser only: it does not sync between devices and is lost if you clear site data.</li></ul></div>' +
    '<div class="card stack"><h3>Formula sheet</h3><p class="small muted">The exam\'s own Figure 6 formula sheet could not be read. The course formulas the paper relies on are on the <a href="#formulas">Formulas</a> page, typeset with KaTeX (rendered to MathML at build time).</p></div>';
};

/* ---------------- search ---------------- */
function buildIndex() {
  const idx = [];
  D.Q.forEach(q => idx.push({ href: q.id, t: qLabel(q), s: q.text, k: 'Exam' }));
  D.CONCEPTS.forEach(c => idx.push({ href: c.id, t: c.title, s: c.simple, k: 'Lesson · Topic ' + topicById(c.topic).n }));
  FORMS.forEach(f => idx.push({ href: f.id, t: f.title, s: f.plain, k: 'Formula' }));
  D.CARDS.forEach(c => idx.push({ href: 'cards', t: c.q, s: c.a, k: 'Flashcard', card: c.id }));
  D.DIAGRAMS.forEach(d => idx.push({ href: d.id, t: d.title, s: d.what, k: 'Diagram' }));
  D.PRACTICE.forEach(p => idx.push({ href: 'write', t: p.title, s: p.text, k: 'Practice', w: p.id }));
  return idx;
}
const INDEX = buildIndex();
function setupSearch() {
  const inp = $('#search'), box = $('#searchResults');
  const run = () => {
    const q = inp.value.trim().toLowerCase();
    if (q.length < 2) { box.hidden = true; return; }
    const words = q.split(/\s+/);
    const hits = INDEX.map(it => { const hay = (it.t + ' ' + it.s).toLowerCase(); const sc = words.reduce((a, w) => a + (hay.includes(w) ? (it.t.toLowerCase().includes(w) ? 2 : 1) : -10), 0); return { it, sc }; }).filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, 10);
    box.innerHTML = hits.length ? hits.map((h, i) => '<a href="#' + h.it.href + '" data-si="' + i + '">' + esc(h.it.t) + '<small>' + esc(h.it.k) + ' · ' + esc(h.it.s.slice(0, 90)) + '</small></a>').join('') : '<div class="small muted" style="padding:10px">No matches for "' + esc(inp.value) + '".</div>';
    box.hidden = false;
    $$('[data-si]', box).forEach(a => a.addEventListener('click', () => { const h = hits[+a.dataset.si].it; if (h.open) sessionStorageSet('openConcept', h.open); if (h.card) { S.fcFilter = 'all'; S.fcMode = 'all'; S.fcOrder = null; S.fcIdx = D.CARDS.findIndex(c => c.id === h.card); } if (h.w) S.writeSel = h.w; save(true); box.hidden = true; inp.value = ''; if (location.hash === '#' + h.href) route(); }));
  };
  inp.addEventListener('input', run);
  inp.addEventListener('keydown', e => { if (e.key === 'Escape') { box.hidden = true; inp.blur(); } if (e.key === 'ArrowDown') { const f = $('a', box); if (f) { e.preventDefault(); f.focus(); } } });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) box.hidden = true; });
}

/* ---------------- theme & boot ---------------- */
function applyTheme() {
  const t = S.theme || 'auto';
  if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  $('#themeBtn').textContent = 'Theme: ' + t;
}
function boot() {
  applyTheme(); updateStoreNote(); setupSearch();
  $('#themeBtn').addEventListener('click', () => { S.theme = S.theme === 'auto' ? 'light' : S.theme === 'light' ? 'dark' : 'auto'; save(); applyTheme(); });
  $('#menuBtn').addEventListener('click', () => { const o = !$('#side').classList.contains('open'); $('#side').classList.toggle('open', o); $('#scrim').classList.toggle('open', o); $('#menuBtn').setAttribute('aria-expanded', o); });
  $('#scrim').addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#side').classList.contains('open')) { closeMenu(); $('#menuBtn').focus(); } });
  window.addEventListener('hashchange', route);
  window.addEventListener('pagehide', () => save(true));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(true); });
  save(true);
  route();
}
window.__ic40 = { grade, traceTree, confusion, get state() { return S; } };
boot();
})();
