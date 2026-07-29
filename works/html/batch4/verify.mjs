#!/usr/bin/env node
/**
 * Everline batch 4 — reproducible verification.
 *
 *   node works/html/batch4/verify.mjs
 *   CHROME="/path/to/chrome" node works/html/batch4/verify.mjs     # if auto-detection fails
 *
 * Requires only Node 22+ (for the global WebSocket and fetch) and a Chrome/Chromium binary.
 * No package.json, no install step, no framework — the repo has no build pipeline and this
 * must not introduce one.
 *
 * It drives a real headless Chrome over the DevTools Protocol and dispatches TRUSTED input
 * events. That matters: synthetic DOM events cannot trigger the browser's own popover Esc or
 * light-dismiss handling, so a suite built on dispatchEvent() would pass while proving nothing
 * about the behaviour this component actually relies on.
 *
 * Coverage: token integrity, the CSS-has-no-raw-dimensions contract, slider geometry and native
 * keyboard semantics, accordion modes and ARIA, popover placement/flip/containment and all four
 * close paths, the calendar's keyboard model including month-end clamping, both focus-return
 * invokers, RGB samples decoded from a real screenshot, responsive overflow, and a no-motion scan.
 *
 * Exit code 0 means every check passed; 1 means at least one failed.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inflateSync } from 'node:zlib';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../..');
const PAGE = pathToFileURL(join(HERE, 'index.html')).href;
const TOKENS = join(REPO, 'tokens', 'everline-draft.tokens.json');
const CSS = join(HERE, 'styles.css');

/* ------------------------------------------------------------------ reporting */
let passed = 0;
const failures = [];
function check(name, ok, detail = '') {
  if (ok) { passed += 1; console.log(`  ok   ${name}`); }
  else { failures.push(name); console.log(`  FAIL ${name}${detail !== '' ? ` :: ${JSON.stringify(detail)}` : ''}`); }
}
const section = (t) => console.log(`\n${t}`);

/* ------------------------------------------------------------------ tokens */
const REF = /^\{([^}]+)\}$/;
function flattenTokens(node, path = [], out = new Map()) {
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    if ('$value' in node) { out.set(path.join('.'), node); return out; }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) flattenTokens(v, [...path, k], out);
  }
  return out;
}
function resolveToken(tokens, key, seen = []) {
  if (seen.includes(key)) throw new Error(`cycle: ${[...seen, key].join(' -> ')}`);
  if (!tokens.has(key)) throw new Error(`missing: ${key}`);
  const v = tokens.get(key).$value;
  if (typeof v === 'string') {
    const m = REF.exec(v.trim());
    if (m) return resolveToken(tokens, m[1], [...seen, key]);
  }
  return v;
}
const px = (v) => (v && typeof v === 'object' && 'value' in v ? `${v.value}${v.unit}` : String(v));

function verifyTokens() {
  section('tokens/everline-draft.tokens.json');
  const raw = readFileSync(TOKENS, 'utf8');
  let json;
  try { json = JSON.parse(raw); check('token file parses as JSON', true); }
  catch (e) { check('token file parses as JSON', false, e.message); return null; }

  // JSON.parse silently keeps the last of any duplicated key, so the raw text has to be scanned.
  // Keys are tracked per open object using a real brace stack, not per nesting depth — depth
  // alone reports every {value, unit} pair as a duplicate of its siblings.
  const dupes = [];
  const stack = [];
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === '"') {
      let j = i + 1;
      while (j < raw.length && !(raw[j] === '"' && raw[j - 1] !== '\\')) j += 1;
      const text = raw.slice(i + 1, j);
      let k = j + 1;
      while (k < raw.length && /\s/.test(raw[k])) k += 1;
      if (raw[k] === ':' && stack.length) {
        const top = stack[stack.length - 1];
        if (top.has(text)) dupes.push(text);
        top.add(text);
      }
      i = j;
    } else if (ch === '{') stack.push(new Set());
    else if (ch === '}') stack.pop();
  }
  check('no duplicate token names', dupes.length === 0, dupes.slice(0, 5));

  const tokens = flattenTokens(json);
  const bad = [];
  const resolved = new Map();
  for (const key of tokens.keys()) {
    try { resolved.set(key, resolveToken(tokens, key)); } catch (e) { bad.push(e.message); }
  }
  check('every {reference} exists and no cycles', bad.length === 0, bad.slice(0, 5));

  const groups = ['slider', 'accordion', 'popover', 'date-time-picker'];
  const colours = new Set();
  let rawLeaves = 0;
  for (const [key, node] of tokens) {
    const g = key.split('.')[1];
    if (!key.startsWith('component.') || !groups.includes(g)) continue;
    const isAlias = typeof node.$value === 'string' && REF.test(node.$value.trim());
    if (!isAlias) rawLeaves += 1;
    if (node.$type === 'color') colours.add(String(resolved.get(key)).toUpperCase());
  }
  check('batch 4 introduces exactly 8 raw (non-alias) leaves', rawLeaves === 8, rawLeaves);
  check('batch 4 resolves to exactly 6 distinct component colours',
    colours.size === 6, [...colours].sort());
  check('batch 4 introduces no colour outside the existing palette',
    [...colours].every((c) => ['#333333', '#4D4D4D', '#598AE8', '#666666', '#F2F2F2', '#FFFFFF'].includes(c)),
    [...colours].sort());
  check('slider.step-marker-size is NOT aliased to breadcrumb.ellipsis-dot-size',
    !REF.test(String(tokens.get('component.slider.step-marker-size').$value)), tokens.get('component.slider.step-marker-size').$value);
  check('focus.ring-offset exists as a shared token', resolved.has('focus.ring-offset') && px(resolved.get('focus.ring-offset')) === '2px',
    px(resolved.get('focus.ring-offset')));
  return resolved;
}

/* ------------------------------------------------------------------ CSS contract */
function verifyCssContract(resolvedTokens) {
  section('works/html/batch4/styles.css — no raw dimensions in component rules');
  const css = readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const COMPONENT = /^[^@]*?(\.slider|\.accordion|\.popover|\.calendar|\.datepicker|\.button|\.icon-button|:where)/;
  const offenders = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    const body = m[2];
    if (selector.startsWith(':root') || /example|-demo|--catalog-/.test(selector)) continue;
    if (!COMPONENT.test(selector)) continue;
    for (const hit of body.matchAll(/(^|[^-\w.])(\d+(?:\.\d+)?)px/g)) offenders.push(`${selector.slice(0, 48)} -> ${hit[2]}px`);
  }
  check('no component rule contains a raw px value', offenders.length === 0, offenders.slice(0, 6));
  check('the 999px box-shadow sentinel is gone from component rules', !/inset 0 0 0 999px/.test(css));
  check('no literal white is left in component rules', !/255\s+255\s+255|#ffffff/i.test(css.split('catalog chrome')[1] ?? css));

  // Every --everline-* declaration must be traceable to a token path, so the map can't drift.
  const declared = [...css.matchAll(/--everline-([a-z0-9-]+)\s*:/g)].map((m) => m[1]);
  const unknown = declared.filter((name) => {
    if (name === 'hover-overlay') return false; // derived helper, documented in the file
    const candidates = [name.replace(/-/g, '.'), name.replace(/^component-/, 'component.')];
    return !candidates.some((c) => [...resolvedTokens.keys()].some((k) => k.replace(/[-.]/g, '') === c.replace(/[-.]/g, '')));
  });
  check('every --everline-* custom property maps onto a token path', unknown.length === 0, unknown.slice(0, 6));
}

/* ------------------------------------------------------------------ PNG (screenshots) */
function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8; let ihdr = null; const idat = [];
  while (pos < buffer.length) {
    const len = buffer.readUInt32BE(pos);
    const type = buffer.toString('ascii', pos + 4, pos + 8);
    const data = buffer.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      ihdr = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), depth: data[8], colour: data[9], interlace: data[12] };
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (ihdr.depth !== 8 || ihdr.interlace !== 0) throw new Error(`unsupported PNG: depth ${ihdr.depth} interlace ${ihdr.interlace}`);
  const channels = { 2: 3, 6: 4 }[ihdr.colour];
  if (!channels) throw new Error(`unsupported PNG colour type ${ihdr.colour}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = ihdr.width * channels;
  const out = Buffer.alloc(stride * ihdr.height);
  let p = 0;
  for (let y = 0; y < ihdr.height; y += 1) {
    const filter = raw[p]; p += 1;
    const line = raw.subarray(p, p + stride); p += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      const v = line[x];
      let value;
      switch (filter) {
        case 0: value = v; break;
        case 1: value = v + a; break;
        case 2: value = v + b; break;
        case 3: value = v + ((a + b) >> 1); break;
        case 4: {
          const pp = a + b - c; const pa = Math.abs(pp - a); const pb = Math.abs(pp - b); const pc = Math.abs(pp - c);
          value = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); break;
        }
        default: throw new Error(`bad PNG filter ${filter}`);
      }
      cur[x] = value & 0xff;
    }
  }
  return { width: ihdr.width, height: ihdr.height, at: (x, y) => {
    const i = y * stride + x * channels;
    return [out[i], out[i + 1], out[i + 2]];
  } };
}

/* ------------------------------------------------------------------ CDP */
function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const candidates = process.platform === 'win32'
    ? [`${process.env['ProgramFiles']}\\Google\\Chrome\\Application\\chrome.exe`,
       `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`,
       `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`]
    : process.platform === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
         '/Applications/Chromium.app/Contents/MacOS/Chromium']
      : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium'];
  return candidates.find((c) => c && existsSync(c));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && this.pending.has(msg.id)) { this.pending.get(msg.id)(msg); this.pending.delete(msg.id); }
  }); }
  send(method, params = {}) {
    this.id += 1; const id = this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, (m) => (m.error ? rej(new Error(`${method}: ${JSON.stringify(m.error)}`)) : res(m.result || {})));
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async js(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(`JS: ${JSON.stringify(r.exceptionDetails).slice(0, 300)}`);
    return r.result?.value;
  }
  async key(key, code) {
    const base = { key, code: code ?? key, windowsVirtualKeyCode: KEYCODES[key] ?? 0, nativeVirtualKeyCode: KEYCODES[key] ?? 0 };
    // Without the text payload Chrome delivers the keydown but never activates a button.
    const down = key === 'Enter' ? { ...base, text: '\r' } : base;
    await this.send('Input.dispatchKeyEvent', { type: 'keyDown', ...down });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
    await sleep(70);
  }
  async click(x, y) {
    for (const type of ['mousePressed', 'mouseReleased']) {
      await this.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    }
    await sleep(130);
  }
  async clickEl(expr, { scroll = true } = {}) {
    const box = await this.js(`(()=>{const e=${expr};if(!e)return null;${scroll ? "e.scrollIntoView({block:'center'});" : ''}const b=e.getBoundingClientRect();return{x:b.left+b.width/2,y:b.top+b.height/2};})()`);
    if (!box) throw new Error(`no element: ${expr}`);
    await this.click(box.x, box.y);
  }
  async shot() {
    const r = await this.send('Page.captureScreenshot', { format: 'png' });
    return decodePng(Buffer.from(r.data, 'base64'));
  }
}
const KEYCODES = { Escape: 27, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Home: 36, End: 35, PageUp: 33, PageDown: 34, Enter: 13 };
const sel = (s) => `document.querySelector(${JSON.stringify(s)})`;

/* ------------------------------------------------------------------ main */
async function main() {
  const resolvedTokens = verifyTokens();
  if (resolvedTokens) verifyCssContract(resolvedTokens);

  const chrome = findChrome();
  if (!chrome) {
    console.log('\nERROR: no Chrome/Chromium found. Set CHROME=/path/to/chrome and re-run.');
    process.exit(2);
  }
  const port = 9200 + Math.floor(process.pid % 300);
  const profile = mkdtempSync(join(tmpdir(), 'everline-verify-'));
  const proc = spawn(chrome, ['--headless', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--force-device-scale-factor=1', '--window-size=1440,1200', 'about:blank'],
  { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 80 && !wsUrl; i += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      wsUrl = targets.find((t) => t.type === 'page')?.webSocketDebuggerUrl ?? null;
    } catch { /* chrome not up yet */ }
    if (!wsUrl) await sleep(250);
  }
  if (!wsUrl) { proc.kill(); console.log('ERROR: could not reach Chrome DevTools'); process.exit(2); }

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const c = new Cdp(ws);
  try {
    await c.send('Runtime.enable');
    await c.send('Page.enable');
    await c.send('Page.navigate', { url: PAGE });
    for (let i = 0; i < 60; i += 1) {
      await sleep(250);
      if (await c.js("document.readyState==='complete' && !!document.querySelector('[data-slider]')")) break;
    }
    await sleep(400);

    /* ---------------- slider ---------------- */
    section('Slider');
    const geo = await c.js(`(()=>{
      const s=${sel('#slider-volume')}.closest('.slider');
      const t=s.querySelector('.slider__track').getBoundingClientRect();
      const f=s.querySelector('.slider__fill').getBoundingClientRect();
      const cs=getComputedStyle(s.querySelector('.slider__track'));
      const step=${sel('.slider--step')};
      const st=step.querySelector('.slider__track').getBoundingClientRect();
      const marks=[...step.querySelectorAll('.slider__marker')].map(m=>{const b=m.getBoundingClientRect();return Math.round((b.left+b.width/2-st.left)*10)/10;});
      const lbl=${sel('[data-slider-value-label]')}; const lb=lbl.getBoundingClientRect();
      const vt=lbl.closest('.slider').querySelector('.slider__track').getBoundingClientRect();
      return {h:cs.height,r:cs.borderTopLeftRadius,tw:t.width,fw:f.width,marks,
              gap:Math.round((vt.top+vt.height/2-12)-lb.bottom),
              centre:Math.round(lb.left+lb.width/2-vt.left),text:lbl.textContent};})()`);
    check('track height is 8px', geo.h === '8px', geo.h);
    check('track radius is pill', geo.r === '999px', geo.r);
    check('fill at value 40 is 128px of a 320px track (matches the approved SVG geometry)',
      Math.abs(geo.fw - 128) < 0.5 && Math.abs(geo.tw - 320) < 0.5, { track: geo.tw, fill: geo.fw });
    check('step markers number (100-0)/20+1 = 6', geo.marks.length === 6, geo.marks.length);
    check('step markers sit on 0/64/128/192/256/320', JSON.stringify(geo.marks) === JSON.stringify([0, 64, 128, 192, 256, 320]), geo.marks);
    check('value label clears the thumb by 8px', geo.gap === 8, geo.gap);
    check('value label is centred on the thumb (65% of 320 = 208px)', Math.abs(geo.centre - 208) <= 1, geo.centre);
    check('value label text equals the control value', geo.text === '65', geo.text);

    await c.js(`${sel('#slider-volume')}.focus()`);
    await c.key('ArrowRight'); const v1 = await c.js(`${sel('#slider-volume')}.value`);
    await c.key('Home'); const v2 = await c.js(`${sel('#slider-volume')}.value`);
    await c.key('End'); const v3 = await c.js(`${sel('#slider-volume')}.value`);
    await c.key('PageDown'); const v4 = await c.js(`${sel('#slider-volume')}.value`);
    const outText = await c.js(`${sel('[data-slider-output]')}.textContent`);
    check('ArrowRight steps 40 -> 41 (native range semantics)', v1 === '41', v1);
    check('Home jumps to min', v2 === '0', v2);
    check('End jumps to max', v3 === '100', v3);
    check('PageDown steps down by a page', Number(v4) < 100, v4);
    check('the visible output follows the control value', outText === v4, { outText, v4 });

    await c.js(`${sel('#slider-score')}.focus()`);
    await c.key('ArrowRight');
    check('step=20 slider moves 60 -> 80', (await c.js(`${sel('#slider-score')}.value`)) === '80');
    await c.js(`${sel('#slider-volume-disabled')}.focus()`);
    await c.key('ArrowRight');
    check('a natively disabled slider ignores the keyboard', (await c.js(`${sel('#slider-volume-disabled')}.value`)) === '40');

    await c.js(`${sel('[data-slider-lower]')}.focus()`);
    for (let i = 0; i < 3; i += 1) await c.key('End');
    const range = await c.js(`(()=>{const s=${sel('.slider--range')};return{lo:s.querySelector('[data-slider-lower]').value,up:s.querySelector('[data-slider-upper]').value,
      out:s.parentElement.querySelector('[data-slider-output]').textContent,
      names:[...s.querySelectorAll('input[type=range]')].map(i=>i.getAttribute('aria-label'))};})()`);
    check('range keeps lower <= upper when the lower thumb is driven to max', Number(range.lo) <= Number(range.up), range);
    check('range output matches both control values', range.out === `${range.lo} – ${range.up}`, range.out);
    check('range is two keyboard-operable controls with distinct accessible names',
      range.names.length === 2 && range.names[0] !== range.names[1] && range.names.every(Boolean), range.names);

    /* ---------------- accordion ---------------- */
    section('Accordion');
    await c.clickEl(sel('#acc-s1-t'));
    const acc = await c.js(`(()=>{const g=id=>document.getElementById(id);return{
      s1:g('acc-s1-t').getAttribute('aria-expanded'),s1p:!g('acc-s1-p').hidden,
      s2:g('acc-s2-t').getAttribute('aria-expanded'),s2p:!g('acc-s2-p').hidden};})()`);
    check('single-open mode collapses the sibling', acc.s1 === 'true' && acc.s1p && acc.s2 === 'false' && !acc.s2p, acc);
    check('aria-expanded always agrees with panel visibility',
      (acc.s1 === 'true') === acc.s1p && (acc.s2 === 'true') === acc.s2p, acc);
    await c.js(`${sel('#acc-m2-t')}.focus()`);
    await c.key('Enter');
    const m2 = await c.js(`[${sel('#acc-m2-t')}.getAttribute('aria-expanded'),document.activeElement.id]`);
    check('Enter toggles and focus stays on the trigger', m2[0] === 'true' && m2[1] === 'acc-m2-t', m2);
    check('multi-open mode allows more than one open panel',
      (await c.js("[...document.querySelectorAll('[data-accordion=multi] .accordion__trigger')].filter(t=>t.getAttribute('aria-expanded')==='true').length")) >= 2);
    const dis = await c.js(`(()=>{const b=${sel('#acc-d2-t')};b.focus();return{d:b.disabled,f:document.activeElement===b};})()`);
    check('the disabled trigger uses the native attribute and cannot take focus', dis.d && !dis.f, dis);

    /* ---------------- popover ---------------- */
    section('Popover');
    for (const placement of ['top', 'right', 'bottom', 'left']) {
      await c.clickEl(sel(`[data-popover-trigger="pop-${placement}"]`));
      const r = await c.js(`(()=>{const p=document.getElementById('pop-${placement}');
        if(!p.matches(':popover-open'))return{open:false};
        const a=${sel(`[data-popover-trigger="pop-${placement}"]`)}.getBoundingClientRect();
        const b=p.getBoundingClientRect();const ar=p.querySelector('[data-popover-arrow]').getBoundingClientRect();
        const rp=p.dataset.resolvedPlacement;
        const gap=rp==='top'?a.top-b.bottom:rp==='bottom'?b.top-a.bottom:rp==='left'?a.left-b.right:b.left-a.right;
        const ac=(rp==='top'||rp==='bottom')?ar.left+ar.width/2:ar.top+ar.height/2;
        const tc=(rp==='top'||rp==='bottom')?a.left+a.width/2:a.top+a.height/2;
        return{open:true,rp,gap:Math.round(gap),delta:Math.round(ac-tc),w:Math.round(ar.width),h:Math.round(ar.height)};})()`);
      check(`${placement}: opens on click and resolves to ${placement}`, r.open && r.rp === placement, r);
      check(`${placement}: 8px anchor gap + 8px arrow = 16px from trigger to panel`, r.gap === 16, r.gap);
      check(`${placement}: arrow points at the trigger centre`, Math.abs(r.delta) <= 1, r.delta);
      const want = placement === 'top' || placement === 'bottom' ? [16, 8] : [8, 16];
      check(`${placement}: arrow is 16x8px on the anchored axis`, r.w === want[0] && r.h === want[1], [r.w, r.h]);
      await c.key('Escape');
      const after = await c.js(`[document.getElementById('pop-${placement}').matches(':popover-open'),document.activeElement===${sel(`[data-popover-trigger="pop-${placement}"]`)}]`);
      check(`${placement}: Esc closes it and focus returns to the trigger`, after[0] === false && after[1] === true, after);
    }
    await c.clickEl(sel('[data-popover-trigger="pop-bottom"]'));
    await c.clickEl(sel('[data-popover-trigger="pop-bottom"]'));
    check('clicking the trigger again closes it', (await c.js("document.getElementById('pop-bottom').matches(':popover-open')")) === false);
    await c.clickEl(sel('[data-popover-trigger="pop-bottom"]'));
    await c.click(1400, 40);
    check('clicking outside closes it (light dismiss)', (await c.js("document.getElementById('pop-bottom').matches(':popover-open')")) === false);
    await c.clickEl(sel('[data-popover-trigger="pop-rich"]'));
    await c.clickEl(sel('#pop-rich .popover__close'));
    const closed = await c.js(`[document.getElementById('pop-rich').matches(':popover-open'),document.activeElement===${sel('[data-popover-trigger="pop-rich"]')}]`);
    check('the in-panel close button closes it and returns focus', closed[0] === false && closed[1] === true, closed);
    const scrim = await c.js("(()=>{const p=document.getElementById('pop-bottom');p.showPopover();const bg=getComputedStyle(p,'::backdrop').backgroundColor;p.hidePopover();return bg;})()");
    check('non-modal: ::backdrop paints no scrim', ['rgba(0, 0, 0, 0)', 'transparent'].includes(scrim), scrim);

    await c.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 420, deviceScaleFactor: 1, mobile: false });
    await sleep(250);
    await c.js(`(()=>{const b=${sel('[data-popover-trigger="pop-flip"]')};const y=b.getBoundingClientRect().top+scrollY;scrollTo(0,y-innerHeight+b.offsetHeight+4);})()`);
    await sleep(300);
    await c.clickEl(sel('[data-popover-trigger="pop-flip"]'), { scroll: false });
    const flip = await c.js(`(()=>{const p=document.getElementById('pop-flip');
      const a=${sel('[data-popover-trigger="pop-flip"]')}.getBoundingClientRect();const b=p.getBoundingClientRect();
      const ar=p.querySelector('[data-popover-arrow]').getBoundingClientRect();
      return{rp:p.dataset.resolvedPlacement,req:p.dataset.placement,
        gap:Math.round(p.dataset.resolvedPlacement==='top'?a.top-b.bottom:b.top-a.bottom),
        delta:Math.round(ar.left+ar.width/2-(a.left+a.width/2)),inside:b.top>=0&&b.bottom<=innerHeight};})()`);
    check('flip: requested bottom with no room resolves to top', flip.req === 'bottom' && flip.rp === 'top', flip);
    check('flip: keeps the 8px anchor gap and the arrow on the trigger centre', flip.gap === 16 && Math.abs(flip.delta) <= 1, flip);
    check('flip: the panel stays inside the viewport', flip.inside, flip);
    await c.key('Escape');
    await c.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await sleep(250);
    await c.js(`${sel('[aria-label="開啟日期選擇器"]')}.scrollIntoView({block:'center'})`);
    await c.js(`${sel('[aria-label="開啟日期選擇器"]')}.click()`);
    await sleep(400);
    const tall = await c.js(`(()=>{const p=document.querySelectorAll('[data-datepicker-panel]')[0];const b=p.getBoundingClientRect();
      const de=document.documentElement;return{inside:b.top>=-1&&b.bottom<=de.clientHeight+1&&b.left>=-1&&b.right<=de.clientWidth+1,
      h:Math.round(b.height),vh:de.clientHeight};})()`);
    check('a tall panel with no room either side is still clamped fully into view', tall.inside, tall);
    await c.key('Escape');
    await c.send('Emulation.clearDeviceMetricsOverride');
    await sleep(250);

    /* ---------------- date / time picker ---------------- */
    section('Date / Time picker');
    await c.clickEl(sel('[aria-label="開啟日期選擇器"]'));
    const dp = await c.js(`(()=>{const p=document.querySelectorAll('[data-datepicker-panel]')[0];
      const cells=[...p.querySelectorAll('.calendar__day')];const cs=getComputedStyle(cells[0]);
      return{cells:cells.length,weekdays:p.querySelectorAll('[role=columnheader]').length,rows:p.querySelectorAll('[role=row]').length,
        w:cs.width,h:cs.height,panelW:Math.round(p.getBoundingClientRect().width),
        selected:cells.filter(c=>c.classList.contains('calendar__day--selected')).map(c=>c.dataset.date),
        today:cells.filter(c=>c.classList.contains('calendar__day--today')).map(c=>c.dataset.date),
        unavailable:cells.filter(c=>c.getAttribute('aria-disabled')==='true').map(c=>c.dataset.date),
        outside:cells.filter(c=>c.classList.contains('calendar__day--outside')).length,
        focus:document.activeElement.dataset?document.activeElement.dataset.date:null,
        role:p.querySelector('.calendar__grid').getAttribute('role')};})()`);
    check('the calendar renders 6 weeks x 7 days = 42 cells', dp.cells === 42, dp.cells);
    check('it is a role=grid with 7 columnheaders and 7 rows', dp.role === 'grid' && dp.weekdays === 7 && dp.rows === 7, dp);
    check('each day cell is 40x40px', dp.w === '40px' && dp.h === '40px', [dp.w, dp.h]);
    check('panel width is 7x40 + 2x16 = 312px', dp.panelW === 312, dp.panelW);
    check('exactly one selected day, 2026-07-15', JSON.stringify(dp.selected) === '["2026-07-15"]', dp.selected);
    check('exactly one today ring, 2026-07-30', JSON.stringify(dp.today) === '["2026-07-30"]', dp.today);
    check('unavailable days are aria-disabled, so arrow keys can still traverse them',
      JSON.stringify(dp.unavailable) === '["2026-07-25","2026-07-26"]', dp.unavailable);
    check('outside-month days are present (11)', dp.outside === 11, dp.outside);
    check('focus moves into the calendar onto the selected day', dp.focus === '2026-07-15', dp.focus);

    await c.key('ArrowRight'); const f1 = await c.js('document.activeElement.dataset.date');
    await c.key('ArrowDown'); const f2 = await c.js('document.activeElement.dataset.date');
    await c.key('Home'); const f3 = await c.js('document.activeElement.dataset.date');
    await c.key('End'); const f4 = await c.js('document.activeElement.dataset.date');
    check('ArrowRight moves one day (7/15 -> 7/16)', f1 === '2026-07-16', f1);
    check('ArrowDown moves one week (7/16 -> 7/23)', f2 === '2026-07-23', f2);
    check('Home goes to the first day of that week (7/19)', f3 === '2026-07-19', f3);
    check('End goes to the last day of that week (7/25)', f4 === '2026-07-25', f4);

    // Month-end clamping, through the page's own addMonths and through the real PageDown key.
    const clampCheck = await c.js(`(()=>{const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      return{fn:typeof addMonths,aug:iso(addMonths(new Date(2026,7,31),1)),jan:iso(addMonths(new Date(2026,0,31),1)),
      leap:iso(addMonths(new Date(2024,0,31),1)),mar:iso(addMonths(new Date(2026,2,31),-1)),jul:iso(addMonths(new Date(2026,6,31),-1))};})()`);
    check("the page's own addMonths is what is under test", clampCheck.fn === 'function', clampCheck.fn);
    check('8/31 + 1 month clamps to 9/30 (not 10/1, which skipped September)', clampCheck.aug === '2026-09-30', clampCheck.aug);
    check('1/31 + 1 month clamps to 2/28', clampCheck.jan === '2026-02-28', clampCheck.jan);
    check('1/31 + 1 month clamps to 2/29 in a leap year', clampCheck.leap === '2024-02-29', clampCheck.leap);
    check('3/31 - 1 month clamps to 2/28', clampCheck.mar === '2026-02-28', clampCheck.mar);
    check('7/31 - 1 month clamps to 6/30', clampCheck.jul === '2026-06-30', clampCheck.jul);
    await c.js(`document.querySelectorAll('[data-datepicker-panel]')[0].querySelector('[data-date="2026-07-31"]').focus()`);
    await c.key('PageDown'); const aug31 = await c.js('document.activeElement.dataset.date');
    await c.key('PageDown');
    const sep = await c.js("[document.activeElement.dataset.date,document.querySelectorAll('[data-datepicker-panel]')[0].querySelector('.calendar__month').textContent]");
    check('real PageDown 7/31 -> 8/31', aug31 === '2026-08-31', aug31);
    check('real PageDown 8/31 -> 9/30 with the view on September', sep[0] === '2026-09-30' && sep[1].includes('9'), sep);
    await c.key('Escape');

    await c.clickEl(sel('[aria-label="開啟日期選擇器"]'));
    await c.clickEl('document.querySelector(\'[data-date="2026-07-20"]\')');
    const picked = await c.js(`(()=>{const p=document.querySelectorAll('[data-datepicker-panel]')[0];return{
      sel:[...p.querySelectorAll('.calendar__day--selected')].map(c=>c.dataset.date),
      aria:[...p.querySelectorAll('[aria-selected=true]')].map(c=>c.dataset.date),
      field:${sel('#dp-single-field')}.value};})()`);
    check('clicking 7/20 selects exactly that one day', JSON.stringify(picked.sel) === '["2026-07-20"]', picked.sel);
    check('aria-selected agrees with the visual selection', JSON.stringify(picked.aria) === '["2026-07-20"]', picked.aria);
    check('the trigger text does not change before Apply', picked.field === '2026/07/15', picked.field);
    await c.clickEl(sel('[data-datepicker-apply]'));
    const applied = await c.js(`[${sel('#dp-single-field')}.value,document.querySelectorAll('[data-datepicker-panel]')[0].matches(':popover-open')]`);
    check('Apply commits the value and closes the panel', applied[0] === '2026/07/20' && applied[1] === false, applied);

    // Focus must return to whichever control opened the panel.
    await c.clickEl(sel('#dp-single-field'));
    const openedByField = await c.js("document.querySelectorAll('[data-datepicker-panel]')[0].matches(':popover-open')");
    await c.key('Escape');
    const backToField = await c.js('document.activeElement.id');
    check('clicking the readonly field opens the panel', openedByField === true, openedByField);
    check('Esc returns focus to the field when the field opened it', backToField === 'dp-single-field', backToField);
    await c.clickEl(sel('[aria-label="開啟日期選擇器"]'));
    await c.key('Escape');
    check('Esc returns focus to the button when the button opened it',
      (await c.js("document.activeElement.getAttribute('aria-label')")) === '開啟日期選擇器');

    await c.clickEl(sel('[aria-label="開啟日期範圍選擇器"]'));
    const rng = await c.js(`(()=>{const p=document.querySelectorAll('[data-datepicker-panel]')[1];return{
      inRange:[...p.querySelectorAll('.calendar__day--in-range')].map(c=>c.dataset.date),
      sel:[...p.querySelectorAll('.calendar__day--selected')].map(c=>c.dataset.date)};})()`);
    check('range restores both endpoints', JSON.stringify(rng.sel) === '["2026-07-08","2026-07-17"]', rng.sel);
    check('range tints exactly the 8 days between them', rng.inRange.length === 8, rng.inRange);
    await c.clickEl(`document.querySelectorAll('[data-datepicker-panel]')[1].querySelector('[data-date="2026-07-05"]')`);
    const partial = await c.js(`(()=>{const p=document.querySelectorAll('[data-datepicker-panel]')[1];return{
      sel:[...p.querySelectorAll('.calendar__day--selected')].map(c=>c.dataset.date),
      inRange:p.querySelectorAll('.calendar__day--in-range').length,
      apply:p.querySelector('[data-datepicker-apply]').disabled};})()`);
    check('a fresh first click starts a new range', JSON.stringify(partial.sel) === '["2026-07-05"]' && partial.inRange === 0, partial);
    check('Apply is natively disabled while the range is incomplete', partial.apply === true, partial.apply);
    await c.clickEl(`document.querySelectorAll('[data-datepicker-panel]')[1].querySelector('[data-date="2026-07-09"]')`);
    const done = await c.js(`(()=>{const p=document.querySelectorAll('[data-datepicker-panel]')[1];return{
      sel:[...p.querySelectorAll('.calendar__day--selected')].map(c=>c.dataset.date),
      inRange:[...p.querySelectorAll('.calendar__day--in-range')].map(c=>c.dataset.date),
      apply:p.querySelector('[data-datepicker-apply]').disabled};})()`);
    check('the second click completes the range and re-enables Apply',
      JSON.stringify(done.sel) === '["2026-07-05","2026-07-09"]' && done.apply === false, done);
    check('the tint covers exactly the days in between', JSON.stringify(done.inRange) === '["2026-07-06","2026-07-07","2026-07-08"]', done.inRange);
    await c.clickEl(`document.querySelectorAll('[data-datepicker-panel]')[1].querySelector('[data-datepicker-apply]')`);
    check('the range trigger text matches the two endpoints', (await c.js(`${sel('#dp-range-field')}.value`)) === '07/05 – 07/09');

    /* ---------------- accessibility sweep ---------------- */
    section('Accessibility');
    check('every icon-only button has an accessible name',
      (await c.js("[...document.querySelectorAll('button')].filter(b=>!b.textContent.trim()).filter(b=>!b.getAttribute('aria-label')).length")) === 0);
    check('every decorative svg is aria-hidden',
      (await c.js("[...document.querySelectorAll('svg')].filter(s=>s.getAttribute('aria-hidden')!=='true').length")) === 0);

    /* ---------------- rendered colour ---------------- */
    section('Rendered colour (sampled from a real screenshot)');
    // Reload first: the interaction checks above deliberately commit new dates, so sampling the
    // documented initial state needs a clean page rather than whatever they left behind.
    await c.send('Page.navigate', { url: PAGE });
    for (let i = 0; i < 60; i += 1) {
      await sleep(250);
      if (await c.js("document.readyState==='complete' && !!document.querySelector('[data-slider]')")) break;
    }
    await sleep(400);
    const mix = (fg, bg, a) => fg.map((f, i) => Math.round(a * f + (1 - a) * bg[i]));
    const BLUE = [89, 138, 232]; const GREY700 = [77, 77, 77];
    await c.js(`${sel('#slider-volume')}.value=40;${sel('#slider-volume')}.dispatchEvent(new Event('input'));`);
    await c.js(`${sel('#slider-volume')}.closest('.slider-example').scrollIntoView({block:'center'})`);
    await sleep(250);
    const sPts = await c.js(`(()=>{const t=${sel('#slider-volume')}.closest('.slider').querySelector('.slider__track').getBoundingClientRect();
      const y=Math.round(t.top+t.height/2);return{fill:[Math.round(t.left+60),y],track:[Math.round(t.left+260),y]};})()`);
    let img = await c.shot();
    check('slider fill renders as action-primary #598AE8', JSON.stringify(img.at(...sPts.fill)) === JSON.stringify(BLUE), img.at(...sPts.fill));
    check('slider track renders as gray-700 #4D4D4D', JSON.stringify(img.at(...sPts.track)) === JSON.stringify(GREY700), img.at(...sPts.track));

    await c.js(`${sel('[data-popover-trigger="pop-rich"]')}.scrollIntoView({block:'center'})`);
    await c.js("document.getElementById('pop-rich').showPopover()");
    await sleep(350);
    const pPts = await c.js(`(()=>{const p=document.getElementById('pop-rich');const b=p.getBoundingClientRect();
      const a=p.querySelector('[data-popover-arrow]').getBoundingClientRect();
      return{panel:[Math.round(b.left+8),Math.round(b.top+b.height/2)],arrow:[Math.round(a.left+a.width/2),Math.round(a.top+1)]};})()`);
    img = await c.shot();
    check('popover panel renders as background-overlay #4D4D4D', JSON.stringify(img.at(...pPts.panel)) === JSON.stringify(GREY700), img.at(...pPts.panel));
    check('the arrow renders in the same fill as its panel', JSON.stringify(img.at(...pPts.arrow)) === JSON.stringify(GREY700), img.at(...pPts.arrow));
    await c.js("document.getElementById('pop-rich').hidePopover()");

    await c.js(`(()=>{const b=${sel('[aria-label="開啟日期選擇器"]')};b.scrollIntoView({block:'start'});window.scrollBy(0,-40);})()`);
    await sleep(200);
    await c.js(`${sel('[aria-label="開啟日期選擇器"]')}.click()`);
    await sleep(400);
    const dPts = await c.js(`(()=>{const p=document.querySelectorAll('[data-datepicker-panel]')[0];const b=p.getBoundingClientRect();
      const off=(d,dx,dy)=>{const r=p.querySelector('[data-date="'+d+'"]').getBoundingClientRect();
        return[Math.round(r.left+r.width/2+dx),Math.round(r.top+r.height/2+dy)];};
      return{bg:[Math.round(b.left+8),Math.round(b.top+8)],sel:off('2026-07-15',0,13),
        ring:off('2026-07-30',0,-19),inside:off('2026-07-30',0,13)};})()`);
    img = await c.shot();
    check('calendar panel renders as background-overlay #4D4D4D', JSON.stringify(img.at(...dPts.bg)) === JSON.stringify(GREY700), img.at(...dPts.bg));
    check('the selected day renders as solid action-primary', JSON.stringify(img.at(...dPts.sel)) === JSON.stringify(BLUE), img.at(...dPts.sel));
    check("today's ring renders in border-focus", JSON.stringify(img.at(...dPts.ring)) === JSON.stringify(BLUE), img.at(...dPts.ring));
    check("today's interior stays unfilled — a ring only", JSON.stringify(img.at(...dPts.inside)) === JSON.stringify(GREY700), img.at(...dPts.inside));
    await c.js("document.querySelectorAll('[data-datepicker-panel]')[0].hidePopover()");

    await c.js(`(()=>{const b=${sel('[aria-label="開啟日期範圍選擇器"]')};b.scrollIntoView({block:'start'});window.scrollBy(0,-40);})()`);
    await sleep(200);
    await c.js(`${sel('[aria-label="開啟日期範圍選擇器"]')}.click()`);
    await sleep(400);
    const rPts = await c.js(`(()=>{const p=document.querySelectorAll('[data-datepicker-panel]')[1];
      const off=(d,dx,dy)=>{const e=p.querySelector('[data-date="'+d+'"]');if(!e)return null;const r=e.getBoundingClientRect();
        return[Math.round(r.left+r.width/2+dx),Math.round(r.top+r.height/2+dy)];};
      const inr=[...p.querySelectorAll('.calendar__day--in-range')].map(e=>e.dataset.date);
      return{tint:off(inr[0],0,13),gap:off(inr[0],20,0),start:off('2026-07-08',0,13)};})()`);
    img = await c.shot();
    const tint = mix(BLUE, GREY700, 0.18);
    check('the in-range tint is action-primary at opacity.selected-overlay over the panel',
      JSON.stringify(img.at(...rPts.tint)) === JSON.stringify(tint), { got: img.at(...rPts.tint), want: tint });
    check('the gap between two range circles is bare panel — they do not merge into a band',
      JSON.stringify(img.at(...rPts.gap)) === JSON.stringify(GREY700), img.at(...rPts.gap));
    check('a range endpoint renders as solid action-primary', JSON.stringify(img.at(...rPts.start)) === JSON.stringify(BLUE), img.at(...rPts.start));
    await c.js("document.querySelectorAll('[data-datepicker-panel]')[1].hidePopover()");

    /* ---------------- responsive + motion ---------------- */
    section('Responsive and motion');
    for (const width of [760, 420]) {
      await c.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await sleep(400);
      const r = await c.js(`(()=>{const de=document.documentElement;
        const over=[...document.querySelectorAll('body *')].filter(e=>{const b=e.getBoundingClientRect();
          return b.right>de.clientWidth+1||b.left<-1;}).map(e=>e.className||e.tagName).slice(0,5);
        return{hScroll:de.scrollWidth>de.clientWidth,over};})()`);
      check(`${width}px: no horizontal scrolling`, r.hScroll === false, r);
      check(`${width}px: nothing overflows the viewport horizontally`, r.over.length === 0, r.over);
      await c.js(`${sel('[aria-label="開啟日期選擇器"]')}.scrollIntoView({block:'center'})`);
      await c.js(`${sel('[aria-label="開啟日期選擇器"]')}.click()`);
      await sleep(400);
      const panel = await c.js(`(()=>{const p=document.querySelectorAll('[data-datepicker-panel]')[0];const b=p.getBoundingClientRect();
        const de=document.documentElement;return b.left>=-1&&b.right<=de.clientWidth+1&&b.top>=-1&&b.bottom<=de.clientHeight+1;})()`);
      check(`${width}px: the date panel stays fully inside the viewport`, panel === true);
      await c.js("document.querySelectorAll('[data-datepicker-panel]')[0].hidePopover()");
    }
    await c.send('Emulation.clearDeviceMetricsOverride');
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await sleep(300);
    const motion = await c.js(`(()=>{const bad=[];document.querySelectorAll('body *').forEach(e=>{const cs=getComputedStyle(e);
      if(cs.animationName!=='none'||(cs.transitionDuration!=='0s'&&cs.transitionProperty!=='none'))
        bad.push((e.className||e.tagName)+':'+cs.animationName+'/'+cs.transitionDuration);});return bad.slice(0,5);})()`);
    check('no animation or transition is declared anywhere (so nothing needs a reduced-motion override)',
      motion.length === 0, motion);
  } finally {
    ws.close();
    proc.kill();
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* best effort */ }
  }

  const total = passed + failures.length;
  console.log(`\n${passed}/${total} checks passed`);
  if (failures.length) {
    console.log('failed:');
    for (const f of failures) console.log(`  - ${f}`);
  }
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
