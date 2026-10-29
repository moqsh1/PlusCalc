'use strict';
/* Plus Calculator — full advanced tape calculator */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const A = window.Android || null;
const uid = () => Math.random().toString(36).slice(2, 10);
let S = load();
function defaults() {
  const t = newTape('Home');
  return { v: 1, tapes: [t], cur: t.id, memory: [], set: { theme: 'night', fmt: 'std', group: 'intl', sound: true, haptic: true, plusPct: 200, plusShape: 'tall', keyStyle: 'flat', borders: 'none', borderW: 1, gstRate: 18, gstMode: false, gstKeys: 'row', toolbar: true, autoScroll: true, deg: true, tipsSeen: false } };
}
function newTape(name) { return { id: uid(), name, start: 0, rows: [], created: Date.now(), updated: Date.now() }; }
function load() {
  try { const s = JSON.parse(localStorage.getItem('tapecalc')); if (s && s.tapes && s.tapes.length) { s.set = Object.assign(defaults().set, s.set); return s; } } catch (e) {}
  return defaults();
}
function save() { try { localStorage.setItem('tapecalc', JSON.stringify(S)); } catch (e) {} }
const T = () => S.tapes.find(t => t.id === S.cur) || S.tapes[0];
let E = { s: '', pct: false, label: '' };
let pendingOp = '+';
let mode = null;
function compute(t = T()) {
  let run = Number(t.start) || 0;
  for (const r of t.rows) {
    if (r.kind === 'total') { r.v = run; r.res = r.v; continue; }
    if (r.kind === 'clear') { run = 0; r.v = 0; r.res = 0; continue; }
    if (r.pct != null) r.v = run * r.pct / 100;
    if (r.gst) r.v = r.gst.mode === 'add' ? run * r.gst.rate / 100 : run - run / (1 + r.gst.rate / 100);
    run = apply(run, r.op, r.v);
    r.res = run;
  }
  return run;
}
function apply(a, op, b) {
  if (op === '+') return a + b;
  if (op === '−') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return b === 0 ? NaN : a / b;
  return a;
}
function fmt(n) {
  if (!isFinite(n)) return 'Error';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function render() {
  const t = T(); compute(t);
  const rows = [];
  rows.push(`<div class="row"><span class="ix">0</span><span class="lbl"></span><span class="opc"></span><span class="val">${fmt(t.start || 0)}</span></div>`);
  t.rows.forEach((r, i) => {
    const op = r.kind === 'total' ? '=' : r.kind === 'clear' ? 'C' : (r.op || '');
    rows.push(`<div class="row${r.v < 0 ? ' neg' : ''}${r.kind === 'total' ? ' total' : ''}"><span class="ix">${i+1}</span><span class="lbl">${r.c || ''}</span><span class="opc">${op}</span><span class="val">${fmt(r.v)}</span></div>`);
  });
  $('#tape').innerHTML = rows.join('');
  $('#dispTotal').textContent = fmt(compute());
  $('#dispEntry').textContent = E.s || '0';
  save();
}
function press(k) {
  if (/[0-9]/.test(k)) { E.s = E.s === '0' ? k : E.s + k; }
  else if (k === '.') { if (!E.s.includes('.')) E.s += E.s ? '.' : '0.'; }
  else if (k === 'back') { E.s = E.s.slice(0, -1); }
  else if (k === 'clear') { E = { s: '', pct: false, label: '' }; pendingOp = '+'; }
  else if (k === '+') { if (E.s) { T().rows.push({ kind: 'num', op: pendingOp, v: parseFloat(E.s), c: E.label }); E = { s: '', pct: false, label: '' }; pendingOp = '+'; } }
  else if (k === '=') { if (E.s) { T().rows.push({ kind: 'num', op: pendingOp, v: parseFloat(E.s), c: '' }); E = { s: '', pct: false, label: '' }; T().rows.push({ kind: 'total', op: '=', v: 0, c: '' }); pendingOp = '+'; } }
  else if (k === 'gstadd' || k === 'gstrem') {
    const r = S.set.gstRate;
    const add = k === 'gstadd';
    T().rows.push({ kind: 'num', op: add ? '+' : '−', v: 0, c: add ? `+GST ${r}%` : `Less GST ${r}%`, gst: { rate: r, mode: add ? 'add' : 'rem' } });
  }
  render();
}
function applySettings() { document.body.dataset.theme = S.set.theme || 'night'; }
// Wire basic buttons
document.addEventListener('click', e => {
  const b = e.target.closest('button[data-k]');
  if (b) press(b.dataset.k);
});
applySettings();
render();
