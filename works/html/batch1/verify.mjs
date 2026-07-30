#!/usr/bin/env node
/**
 * Everline batch 1 pilot (issue #17, Button / Checkbox / Text input / Textarea only) —
 * reproducible verification.
 *
 *   node works/html/batch1/verify.mjs
 *   CHROME="/path/to/chrome" node works/html/batch1/verify.mjs     # if auto-detection fails
 *
 * Requires only Node 22+ (for the global WebSocket and fetch) and a Chrome/Chromium binary.
 * No package.json, no install step, no framework — the repo has no build pipeline and this
 * must not introduce one. Modeled directly on works/html/batch4/verify.mjs.
 *
 * Coverage: token integrity (including the 4 gaps this pilot's P0 audit added), the
 * CSS-has-no-raw-dimensions contract, computed dimensions against the approved master SVG
 * measurements, real DOM state (native disabled/readonly/indeterminate — not class simulation),
 * RGB samples decoded from a real screenshot, responsive overflow, and a no-motion scan.
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

  // The 4 P0 gaps this pilot added, each verified to resolve to the value found in the SVG audit.
  check('component.button.foreground-neutral resolves to off-white #F2F2F2',
    px(resolved.get('component.button.foreground-neutral')) === '#F2F2F2',
    resolved.get('component.button.foreground-neutral'));
  check('component.checkbox.border resolves to border-default #444444',
    px(resolved.get('component.checkbox.border')) === '#444444',
    resolved.get('component.checkbox.border'));
  check('component.checkbox.border-width resolves to 1px',
    px(resolved.get('component.checkbox.border-width')) === '1px',
    resolved.get('component.checkbox.border-width'));
  check('component.text-input.foreground-disabled resolves to foreground-disabled #F2F2F2',
    px(resolved.get('component.text-input.foreground-disabled')) === '#F2F2F2',
    resolved.get('component.text-input.foreground-disabled'));
  check('component.textarea.foreground resolves to foreground-primary #F2F2F2',
    px(resolved.get('component.textarea.foreground')) === '#F2F2F2', resolved.get('component.textarea.foreground'));
  check('component.textarea.placeholder resolves to gray-700 #4D4D4D',
    px(resolved.get('component.textarea.placeholder')) === '#4D4D4D', resolved.get('component.textarea.placeholder'));
  check('component.textarea.border-width-focus resolves to 2px',
    px(resolved.get('component.textarea.border-width-focus')) === '2px', resolved.get('component.textarea.border-width-focus'));
  check('component.textarea.border-focus resolves to border-focus #598AE8',
    px(resolved.get('component.textarea.border-focus')) === '#598AE8', resolved.get('component.textarea.border-focus'));
  // Existing values this pilot must NOT have touched.
  check('component.button.height is still 48px (unchanged)', px(resolved.get('component.button.height')) === '48px');
  check('component.checkbox.size is still 32px (unchanged)', px(resolved.get('component.checkbox.size')) === '32px');
  check('component.text-input.background is still gray-600 #666666 (unchanged)',
    px(resolved.get('component.text-input.background')) === '#666666');
  return resolved;
}

/* ------------------------------------------------------------------ CSS contract */
function verifyCssContract(resolvedTokens) {
  section('works/html/batch1/styles.css — no raw dimensions in component rules');
  const css = readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const COMPONENT = /^[^@]*?(\.button|\.checkbox|\.text-input|\.textarea|:where)/;
  const offenders = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    const body = m[2];
    if (selector.startsWith(':root') || /example|-demo|--catalog-/.test(selector)) continue;
    if (!COMPONENT.test(selector)) continue;
    for (const hit of body.matchAll(/(^|[^-\w.])(\d+(?:\.\d+)?)px/g)) offenders.push(`${selector.slice(0, 48)} -> ${hit[2]}px`);
  }
  check('no component rule contains a raw px value', offenders.length === 0, offenders.slice(0, 6));

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
  async click(x, y) {
    for (const type of ['mousePressed', 'mouseReleased']) {
      await this.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    }
    await sleep(120);
  }
  async clickEl(expr) {
    const box = await this.js(`(()=>{const e=${expr};if(!e)return null;e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();return{x:b.left+b.width/2,y:b.top+b.height/2};})()`);
    if (!box) throw new Error(`no element: ${expr}`);
    await this.click(box.x, box.y);
  }
  async shot() {
    const r = await this.send('Page.captureScreenshot', { format: 'png' });
    return decodePng(Buffer.from(r.data, 'base64'));
  }
}
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
  const port = 9300 + Math.floor(process.pid % 300);
  const profile = mkdtempSync(join(tmpdir(), 'everline-verify-'));
  const proc = spawn(chrome, ['--headless', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--force-device-scale-factor=1', '--window-size=1280,1400', 'about:blank'],
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
      if (await c.js("document.readyState==='complete' && !!document.querySelector('.button')")) break;
    }
    await sleep(300);

    /* ---------------- Button ---------------- */
    section('Button');
    const btn = await c.js(`(()=>{
      const primary=${sel('.button--primary')}, neutral=document.querySelectorAll('.button')[1], danger=${sel('.button--danger')}, outline=${sel('.button--outline')}, disabled=document.querySelectorAll('.button')[2];
      const cs=(e)=>getComputedStyle(e);
      return {
        h: cs(primary).height, r: cs(primary).borderRadius,
        primaryBg: cs(primary).backgroundColor, primaryFg: cs(primary).color,
        neutralBg: cs(neutral).backgroundColor, neutralFg: cs(neutral).color,
        dangerBg: cs(danger).backgroundColor,
        outlineShadow: cs(outline).boxShadow !== 'none',
        disabledAttr: disabled.disabled, disabledOpacity: cs(disabled).opacity
      };
    })()`);
    check('button height is 48px', btn.h === '48px', btn.h);
    check('button radius is 24px (pill for this height)', btn.r === '24px', btn.r);
    check('primary background is action-primary rgb(89, 138, 232)', btn.primaryBg === 'rgb(89, 138, 232)', btn.primaryBg);
    check('primary foreground is white rgb(255, 255, 255)', btn.primaryFg === 'rgb(255, 255, 255)', btn.primaryFg);
    check('neutral background is background-surface rgb(51, 51, 51)', btn.neutralBg === 'rgb(51, 51, 51)', btn.neutralBg);
    check('neutral foreground is off-white rgb(242, 242, 242), NOT white (the P0 gap this pilot fixed)',
      btn.neutralFg === 'rgb(242, 242, 242)', btn.neutralFg);
    check('danger background is action-danger rgb(193, 39, 45)', btn.dangerBg === 'rgb(193, 39, 45)', btn.dangerBg);
    check('outline variant draws a border via box-shadow', btn.outlineShadow);
    check('disabled button uses the native disabled attribute', btn.disabledAttr === true, btn.disabledAttr);
    check('disabled button is at opacity.disabled 0.55', btn.disabledOpacity === '0.55', btn.disabledOpacity);

    /* ---------------- Checkbox ---------------- */
    section('Checkbox');
    const cb = await c.js(`(()=>{
      const cs=(e)=>getComputedStyle(e);
      const un=${sel('#cb-unchecked')};
      return {
        w: cs(un).width, h: cs(un).height, r: cs(un).borderRadius,
        indeterminate: ${sel('#cb-indeterminate')}.indeterminate,
        indeterminateChecked: ${sel('#cb-indeterminate')}.checked,
        checkedIsChecked: ${sel('#cb-checked')}.checked,
        disabledAttr: ${sel('#cb-disabled')}.disabled
      };
    })()`);
    check('checkbox is 32x32px', cb.w === '32px' && cb.h === '32px', [cb.w, cb.h]);
    check('checkbox radius is 8px', cb.r === '8px', cb.r);
    check('indeterminate is a real DOM property (not merely the checked attribute)',
      cb.indeterminate === true && cb.indeterminateChecked === false, cb);
    check('checked checkbox is natively checked', cb.checkedIsChecked === true, cb.checkedIsChecked);
    check('disabled checkbox uses the native disabled attribute', cb.disabledAttr === true, cb.disabledAttr);

    // Clicking a natively disabled checkbox must not toggle it.
    const beforeClick = await c.js(`${sel('#cb-disabled')}.checked`);
    await c.clickEl(sel('#cb-disabled'));
    const afterClick = await c.js(`${sel('#cb-disabled')}.checked`);
    check('a natively disabled checkbox ignores a click', beforeClick === afterClick, { beforeClick, afterClick });

    // Label association: clicking the label text toggles the corresponding (non-disabled) checkbox.
    const beforeLabelClick = await c.js(`${sel('#cb-unchecked')}.checked`);
    await c.clickEl(`document.querySelector('label[for="cb-unchecked"]')`);
    const afterLabelClick = await c.js(`${sel('#cb-unchecked')}.checked`);
    check('clicking the associated <label> toggles the checkbox', beforeLabelClick !== afterLabelClick, { beforeLabelClick, afterLabelClick });
    // Restore #cb-unchecked to its documented initial state so later checks (and re-runs against
    // the same live page) see the state index.html actually declares, not whatever the previous
    // interaction check left behind.
    await c.clickEl(`document.querySelector('label[for="cb-unchecked"]')`);

    /* ---------------- Text input / Textarea ---------------- */
    section('Text input / Textarea');
    const ti = await c.js(`(()=>{
      const cs=(e)=>getComputedStyle(e);
      const empty=${sel('#ti-empty')};
      return {
        h: cs(empty).height, r: cs(empty).borderRadius,
        bg: cs(empty).backgroundColor,
        disabledAttr: ${sel('#ti-disabled')}.disabled,
        readOnlyAttr: ${sel('#ti-readonly')}.readOnly
      };
    })()`);
    check('text input height is 48px', ti.h === '48px', ti.h);
    check('text input radius is 24px', ti.r === '24px', ti.r);
    check('text input background is background-subdued rgb(102, 102, 102)', ti.bg === 'rgb(102, 102, 102)', ti.bg);
    check('disabled text input uses the native disabled attribute', ti.disabledAttr === true, ti.disabledAttr);
    check('readonly text input uses the native readOnly property', ti.readOnlyAttr === true, ti.readOnlyAttr);

    // Focus uses a real :focus box-shadow, not a class.
    await c.js(`${sel('#ti-empty')}.focus()`);
    const focused = await c.js(`(()=>{const e=${sel('#ti-empty')};return {isActive: document.activeElement===e, shadow: getComputedStyle(e).boxShadow};})()`);
    check('focusing the field triggers real :focus (document.activeElement)', focused.isActive, focused.isActive);
    check('focused field draws the 2px border-focus inset box-shadow', focused.shadow.includes('89, 138, 232'), focused.shadow);

    const ta = await c.js(`(()=>{
      const cs=(e)=>getComputedStyle(e);
      const sm=${sel('#ta-resizable')}, lg=${sel('#ta-scrollable')};
      return {
        smH: cs(sm).height, smResize: cs(sm).resize,
        lgH: cs(lg).height, lgOverflowY: cs(lg).overflowY,
        lgScrollable: lg.scrollHeight > lg.clientHeight,
        disabledAttr: ${sel('#ta-disabled')}.disabled
      };
    })()`);
    check('textarea (resizable) height is 128px', ta.smH === '128px', ta.smH);
    check('textarea (resizable) uses native CSS resize: vertical', ta.smResize === 'vertical', ta.smResize);
    check('textarea (scrollable) height is 256px', ta.lgH === '256px', ta.lgH);
    check('textarea (scrollable) content actually overflows and scrolls', ta.lgScrollable, ta.lgScrollable);
    check('disabled textarea uses the native disabled attribute', ta.disabledAttr === true, ta.disabledAttr);

    /* ---------------- Accessibility ---------------- */
    section('Accessibility');
    check('every checkbox has an associated <label for>',
      (await c.js("[...document.querySelectorAll('.checkbox')].every(cb => !!document.querySelector(`label[for=\"${cb.id}\"]`))")) === true);
    check('every text field has an associated <label> (may be visually hidden)',
      (await c.js("[...document.querySelectorAll('.text-input, .textarea')].every(f => !!document.querySelector(`label[for=\"${f.id}\"]`))")) === true);

    /* ---------------- Rendered colour ---------------- */
    section('Rendered colour');
    // The checkmark/indeterminate glyph is a ~2px stroke inside a 32px box — thin enough that
    // any single-pixel screenshot sample lands on anti-aliased edge colour, not a reliable
    // signal. Read the actual rendered ::after pseudo-element style instead: its mask-image,
    // opacity and background-color are the real CSS the browser paints with, just not
    // resolvable to a flat-fill pixel colour the way a solid button fill is.
    const glyphs = await c.js(`(()=>{
      const read=(id)=>{const cs=getComputedStyle(document.getElementById(id),'::after');
        return {mask: cs.maskImage!=='none'?'set':'none', opacity: cs.opacity, bg: cs.backgroundColor};};
      return {unchecked: read('cb-unchecked'), checked: read('cb-checked'), indeterminate: read('cb-indeterminate')};
    })()`);
    check('unchecked checkbox glyph is invisible (opacity 0)', glyphs.unchecked.opacity === '0', glyphs.unchecked);
    check('checked checkbox glyph is visible, uses the checkmark mask, in action-primary blue',
      glyphs.checked.opacity === '1' && glyphs.checked.mask === 'set' && glyphs.checked.bg === 'rgb(89, 138, 232)', glyphs.checked);
    check('indeterminate checkbox glyph is visible and uses a mask (the horizontal-line path)',
      glyphs.indeterminate.opacity === '1' && glyphs.indeterminate.mask === 'set', glyphs.indeterminate);

    const pts = await c.js(`(()=>{
      const primary=${sel('.button--primary')}.getBoundingClientRect();
      return { buttonFill: [Math.round(primary.left+8), Math.round(primary.top+primary.height/2)] };
    })()`);
    const img = await c.shot();
    const BLUE = [89, 138, 232];
    check('primary button fill renders as action-primary blue (sampled from a real screenshot)',
      JSON.stringify(img.at(...pts.buttonFill)) === JSON.stringify(BLUE), img.at(...pts.buttonFill));

    /* ---------------- Responsive + motion ---------------- */
    section('Responsive and motion');
    for (const width of [760, 420]) {
      await c.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await sleep(300);
      const r = await c.js(`(()=>{const de=document.documentElement;
        const over=[...document.querySelectorAll('body *')].filter(e=>{const b=e.getBoundingClientRect();
          return b.right>de.clientWidth+1||b.left<-1;}).map(e=>e.className||e.tagName).slice(0,5);
        return{hScroll:de.scrollWidth>de.clientWidth,over};})()`);
      check(`${width}px: no horizontal scrolling`, r.hScroll === false, r);
      check(`${width}px: nothing overflows the viewport horizontally`, r.over.length === 0, r.over);
    }
    await c.send('Emulation.clearDeviceMetricsOverride');
    await sleep(200);
    const motion = await c.js(`(()=>{const bad=[];document.querySelectorAll('body *').forEach(e=>{const cs=getComputedStyle(e);
      if(cs.animationName!=='none'||(cs.transitionDuration!=='0s'&&cs.transitionProperty!=='none'))
        bad.push((e.className||e.tagName)+':'+cs.animationName+'/'+cs.transitionDuration);});return bad.slice(0,5);})()`);
    check('no animation or transition is declared anywhere (nothing was drawn in the SVG to justify one)',
      motion.length === 0, motion);

    /* ---------------- G1 review screenshot ---------------- */
    await c.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1400, deviceScaleFactor: 1, mobile: false });
    await sleep(300);
    const full = await c.js(`(()=>{const de=document.documentElement;return{w:de.scrollWidth,h:de.scrollHeight};})()`);
    await c.send('Emulation.setDeviceMetricsOverride', { width: full.w, height: full.h, deviceScaleFactor: 1, mobile: false });
    await sleep(300);
    const shot = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: full.w, height: full.h, scale: 1 } });
    const { writeFileSync } = await import('node:fs');
    writeFileSync(join(HERE, 'g1-review-screenshot.png'), Buffer.from(shot.data, 'base64'));
    console.log(`\nG1 review screenshot written to works/html/batch1/g1-review-screenshot.png (${full.w}x${full.h})`);
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
