'use strict';
/* Plus Calculator — tape calculator */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
let S = { tapes: [{ id: '1', name: 'Home', start: 0, rows: [] }], cur: '1', set: { theme: 'night', gstRate: 18 } };
function render() {
  $('#dispTotal').textContent = '0';
  $('#tape').innerHTML = '<div class="row"><span class="ix">0</span><span class="lbl"></span><span class="opc"></span><span class="val">0.00</span></div>';
}
function press(k) { console.log(k); }
applySettings = () => document.body.dataset.theme = 'night';
render();
