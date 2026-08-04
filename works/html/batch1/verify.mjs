#!/usr/bin/env node
/**
 * Everline batch 1 (issue #17) — reproducible verification.
 * Button / Checkbox / Text input / Textarea graduated (G1 passed 2026-07-30).
 * Icon button (#30) / Switch (#31) / Radio (#32) / Split button/Dropdown (#33) added
 * 2026-07-31 — candidate ready for G1, awaiting human visual review.
 * Badge / Tag (#34) added 2026-08-03 — candidate ready for G1, awaiting human visual review.
 * Inline alert (#35) added 2026-08-04 — G1 passed 2026-08-04.
 * Toast / Snackbar (#41) added 2026-08-05 — candidate ready for G1, awaiting human visual review.
 *
 *   node works/html/batch1/verify.mjs
 *   CHROME="/path/to/chrome" node works/html/batch1/verify.mjs     # if auto-detection fails
 *
 * Requires only Node 22+ (for the global WebSocket and fetch) and a Chrome/Chromium binary.
 * No package.json, no install step, no framework — the repo has no build pipeline and this
 * must not introduce one. Modeled directly on works/html/batch4/verify.mjs.
 *
 * Coverage: token integrity (including every gap each round's P0 audit added), the
 * CSS-has-no-raw-dimensions contract, a custom-property-VALUE-equals-token-VALUE contract (added
 * 2026-07-30 after PR #29 review found the name-only version let component.checkbox.indicator-size
 * drift from its 20px token to a CSS declaration of 32px undetected), computed dimensions against
 * the approved master SVG measurements, real DOM state (native disabled/readonly/indeterminate/
 * checked — not class simulation), real click/keyboard tests for the 48x48 hit areas (Checkbox,
 * Radio) and for Switch (click/Space/Enter) and Split button's full menu-button keyboard model
 * (ArrowDown/Enter/Space to open, arrow keys + roving tabindex inside the menu, Enter to activate,
 * Escape and light-dismiss to close, focus always returns to the disclosure), real click tests for
 * Badge/Tag's removable control and Inline alert's dismiss control (each deletes its own element
 * from the DOM and moves focus to a documented fallback container, never <body>, restoring the
 * example afterward for the G1 screenshot), role="status"/role="alert" assertions for Inline
 * alert's three variants, RGB samples decoded from real screenshots (including the disabled
 * Button's background, added 2026-07-30 after a plain `opacity` was found dimming it), responsive
 * overflow, and a no-motion scan.
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
  // The gaps this round (issues #30/#32/#33) added, each verified against the SVG audit.
  check('component.icon-button.foreground-neutral resolves to off-white #F2F2F2',
    px(resolved.get('component.icon-button.foreground-neutral')) === '#F2F2F2', resolved.get('component.icon-button.foreground-neutral'));
  check('component.icon-button.foreground resolves to white #FFFFFF',
    px(resolved.get('component.icon-button.foreground')) === '#FFFFFF', resolved.get('component.icon-button.foreground'));
  check('component.icon-button.border-focus resolves to border-focus #598AE8',
    px(resolved.get('component.icon-button.border-focus')) === '#598AE8', resolved.get('component.icon-button.border-focus'));
  check('component.radio.border resolves to border-default #444444',
    px(resolved.get('component.radio.border')) === '#444444', resolved.get('component.radio.border'));
  check('component.radio.border-width resolves to 1px',
    px(resolved.get('component.radio.border-width')) === '1px', resolved.get('component.radio.border-width'));
  check('component.split-button.foreground resolves to white #FFFFFF',
    px(resolved.get('component.split-button.foreground')) === '#FFFFFF', resolved.get('component.split-button.foreground'));
  check('component.split-button.menu-foreground resolves to off-white #F2F2F2',
    px(resolved.get('component.split-button.menu-foreground')) === '#F2F2F2', resolved.get('component.split-button.menu-foreground'));
  check('component.split-button.divider-color resolves to the SVG-backfilled #4A76C9 (not action-primary)',
    px(resolved.get('component.split-button.divider-color')) === '#4A76C9', resolved.get('component.split-button.divider-color'));
  check('component.split-button.layer resolves to layer.overlay = 100',
    resolved.get('component.split-button.layer') === 100, resolved.get('component.split-button.layer'));
  // Switch: P0 audit found no gaps at all — confirm every drawn value is exactly what was already there.
  // Badge / Tag (issue #34): every component.tag.* value is a first-time addition (this
  // component had zero prior token coverage), each verified against the c-badge-tag SVG audit.
  check('component.tag.height resolves to size.tag-md 40px', px(resolved.get('component.tag.height')) === '40px', resolved.get('component.tag.height'));
  check('component.tag.radius resolves to 20px (half of 40px, matches every tag-* rx="20")', px(resolved.get('component.tag.radius')) === '20px', resolved.get('component.tag.radius'));
  check('component.tag.dot-size resolves to 8px', px(resolved.get('component.tag.dot-size')) === '8px', resolved.get('component.tag.dot-size'));
  check('component.tag.foreground resolves to white #FFFFFF', px(resolved.get('component.tag.foreground')) === '#FFFFFF', resolved.get('component.tag.foreground'));
  check('component.tag.foreground-neutral resolves to off-white #F2F2F2', px(resolved.get('component.tag.foreground-neutral')) === '#F2F2F2', resolved.get('component.tag.foreground-neutral'));
  check('component.tag.background-neutral resolves to background-surface #333333', px(resolved.get('component.tag.background-neutral')) === '#333333', resolved.get('component.tag.background-neutral'));
  check('component.tag.background-accent resolves to action-primary #598AE8', px(resolved.get('component.tag.background-accent')) === '#598AE8', resolved.get('component.tag.background-accent'));
  check('component.tag.background-danger resolves to action-danger #C1272D', px(resolved.get('component.tag.background-danger')) === '#C1272D', resolved.get('component.tag.background-danger'));
  check('component.tag.background-disabled resolves to background-subdued #666666', px(resolved.get('component.tag.background-disabled')) === '#666666', resolved.get('component.tag.background-disabled'));
  check('component.tag.border-focus resolves to border-focus #598AE8', px(resolved.get('component.tag.border-focus')) === '#598AE8', resolved.get('component.tag.border-focus'));
  check('component.tag.hit-area-size resolves to control-md 48px (extension pending G1, not SVG-drawn)', px(resolved.get('component.tag.hit-area-size')) === '48px', resolved.get('component.tag.hit-area-size'));
  check('component.tag.remove-control-size resolves to 32px (extension pending G1, not SVG-drawn)', px(resolved.get('component.tag.remove-control-size')) === '32px', resolved.get('component.tag.remove-control-size'));
  check('component.tag.remove-icon-offset resolves to 23px (SVG-measured: 144 - 121)', px(resolved.get('component.tag.remove-icon-offset')) === '23px', resolved.get('component.tag.remove-icon-offset'));
  // Inline alert (issue #35): every component.inline-alert.* value is a first-time addition (this
  // component had zero prior token coverage), each verified against the c-inline-alert SVG audit.
  check('component.inline-alert.min-height resolves to 96px (card rect height)', px(resolved.get('component.inline-alert.min-height')) === '96px', resolved.get('component.inline-alert.min-height'));
  check('component.inline-alert.radius resolves to radius.lg 16px (matches every alert-* rx="16")', px(resolved.get('component.inline-alert.radius')) === '16px', resolved.get('component.inline-alert.radius'));
  check('component.inline-alert.rail-width resolves to 4px', px(resolved.get('component.inline-alert.rail-width')) === '4px', resolved.get('component.inline-alert.rail-width'));
  check('component.inline-alert.rail-inset resolves to 12px (rail rect x="12")', px(resolved.get('component.inline-alert.rail-inset')) === '12px', resolved.get('component.inline-alert.rail-inset'));
  check('component.inline-alert.rail-radius resolves to 2px (rail rect rx="2")', px(resolved.get('component.inline-alert.rail-radius')) === '2px', resolved.get('component.inline-alert.rail-radius'));
  check('component.inline-alert.content-start resolves to 80px (title/body text x="80")', px(resolved.get('component.inline-alert.content-start')) === '80px', resolved.get('component.inline-alert.content-start'));
  check('component.inline-alert.icon-size resolves to 28px (circle r="14", diameter = 2 x r; corrects the design draft\'s unmeasured 24px)', px(resolved.get('component.inline-alert.icon-size')) === '28px', resolved.get('component.inline-alert.icon-size'));
  check('component.inline-alert.title-body-gap resolves to space.1 8px', px(resolved.get('component.inline-alert.title-body-gap')) === '8px', resolved.get('component.inline-alert.title-body-gap'));
  check('component.inline-alert.title-size resolves to 17px (.alert-title font-size, matches no existing font.size-* step)', px(resolved.get('component.inline-alert.title-size')) === '17px', resolved.get('component.inline-alert.title-size'));
  check('component.inline-alert.body-size resolves to font.size-label 14px (.alert-body font-size)', px(resolved.get('component.inline-alert.body-size')) === '14px', resolved.get('component.inline-alert.body-size'));
  check('component.inline-alert.background resolves to background-surface #333333', px(resolved.get('component.inline-alert.background')) === '#333333', resolved.get('component.inline-alert.background'));
  check('component.inline-alert.foreground-title resolves to off-white #F2F2F2 (.alert-title fill)', px(resolved.get('component.inline-alert.foreground-title')) === '#F2F2F2', resolved.get('component.inline-alert.foreground-title'));
  check('component.inline-alert.foreground-body resolves to gray-500 #B8B8B8 (.alert-body fill, NOT the same as foreground-title)', px(resolved.get('component.inline-alert.foreground-body')) === '#B8B8B8', resolved.get('component.inline-alert.foreground-body'));
  check('component.inline-alert.rail-color-info resolves to action-primary #598AE8', px(resolved.get('component.inline-alert.rail-color-info')) === '#598AE8', resolved.get('component.inline-alert.rail-color-info'));
  check('component.inline-alert.rail-color-danger resolves to action-danger #C1272D', px(resolved.get('component.inline-alert.rail-color-danger')) === '#C1272D', resolved.get('component.inline-alert.rail-color-danger'));
  check('component.inline-alert.rail-color-neutral resolves to background-subdued #666666', px(resolved.get('component.inline-alert.rail-color-neutral')) === '#666666', resolved.get('component.inline-alert.rail-color-neutral'));
  check('component.inline-alert.icon-color-info resolves to action-primary #598AE8', px(resolved.get('component.inline-alert.icon-color-info')) === '#598AE8', resolved.get('component.inline-alert.icon-color-info'));
  check('component.inline-alert.icon-color-danger resolves to action-danger #C1272D', px(resolved.get('component.inline-alert.icon-color-danger')) === '#C1272D', resolved.get('component.inline-alert.icon-color-danger'));
  check('component.inline-alert.icon-color-neutral resolves to off-white #F2F2F2 (NOT the same as rail-color-neutral)', px(resolved.get('component.inline-alert.icon-color-neutral')) === '#F2F2F2', resolved.get('component.inline-alert.icon-color-neutral'));
  check('component.inline-alert.dismiss-control-size resolves to 48px (extension pending G1, not SVG-drawn)', px(resolved.get('component.inline-alert.dismiss-control-size')) === '48px', resolved.get('component.inline-alert.dismiss-control-size'));
  check('component.inline-alert.icon-render-margin resolves to 2px (PR #47 fix: keeps the 32-unit viewBox at 1:1 scale so the drawn circle renders at the full 28px, not 24.5px)', px(resolved.get('component.inline-alert.icon-render-margin')) === '2px', resolved.get('component.inline-alert.icon-render-margin'));
  check('component.switch.width is 96px (unchanged)', px(resolved.get('component.switch.width')) === '96px');
  check('component.switch.thumb-size is 40px (unchanged)', px(resolved.get('component.switch.thumb-size')) === '40px');
  check('component.switch.track-on resolves to action-primary #598AE8 (unchanged)',
    px(resolved.get('component.switch.track-on')) === '#598AE8');
  check('component.switch.track-danger resolves to action-danger #C1272D (unchanged)',
    px(resolved.get('component.switch.track-danger')) === '#C1272D');
  // Existing values this pilot must NOT have touched.
  check('component.button.height is still 48px (unchanged)', px(resolved.get('component.button.height')) === '48px');
  check('component.checkbox.size is still 32px (unchanged)', px(resolved.get('component.checkbox.size')) === '32px');
  check('component.text-input.background is still gray-600 #666666 (unchanged)',
    px(resolved.get('component.text-input.background')) === '#666666');
  // Toast / Snackbar (issue #41): 3 gaps found during P0 audit against the pre-existing (2026-07-19,
  // never-verified) component.toast.* fields; icon-text-gap was re-verified (not a gap) using the
  // more precisely measurable danger icon (a full circle) instead of the default checkmark's own
  // irregular path bbox.
  check('component.toast.padding-inline resolves to 20px (text-only variants\' label inset)', px(resolved.get('component.toast.padding-inline')) === '20px', resolved.get('component.toast.padding-inline'));
  check('component.toast.icon-inset resolves to 10px (leading icon sits closer to the edge than text)', px(resolved.get('component.toast.icon-inset')) === '10px', resolved.get('component.toast.icon-inset'));
  check('component.toast.danger-icon-stroke-width resolves to 2.2 (distinct from the shared icon.stroke-width 2)', resolved.get('component.toast.danger-icon-stroke-width') === 2.2, resolved.get('component.toast.danger-icon-stroke-width'));
  check('component.toast.icon-text-gap re-verified at 14px (re-measured against the danger icon\'s circle, unchanged)', px(resolved.get('component.toast.icon-text-gap')) === '14px', resolved.get('component.toast.icon-text-gap'));
  // Pre-existing toast fields this round must NOT have touched.
  check('component.toast.height is still 56px (unchanged)', px(resolved.get('component.toast.height')) === '56px');
  check('component.toast.danger-icon-size is still 24px (unchanged)', px(resolved.get('component.toast.danger-icon-size')) === '24px');
  return resolved;
}

/* ------------------------------------------------------------------ CSS contract */
// PR #29 review (2026-07-30) found this contract only checked that a custom property's NAME
// mapped onto some token path, never that its declared VALUE actually equalled that token's
// resolved value — which is exactly how component.checkbox.indicator-size (20px) drifted to a
// CSS declaration of 32px undetected. resolveCssVarValue below chains through :root's own
// var(--everline-x) references down to a literal, so the comparison below is against what the
// browser will actually paint, not just a name match.
function resolveCssVarValue(declMap, name, seen = []) {
  if (seen.includes(name)) return null;
  const raw = declMap.get(name);
  if (raw === undefined) return null;
  const m = /^var\(\s*--everline-([a-z0-9-]+)\s*\)$/.exec(raw.trim());
  if (m) return resolveCssVarValue(declMap, m[1], [...seen, name]);
  return raw.trim();
}
function normalizeHex(h) {
  let s = h.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(s)) s = '#' + [...s.slice(1)].map((c) => c + c).join('');
  return s.toUpperCase();
}
function valuesMatch(tokenResolved, cssLiteral) {
  if (cssLiteral == null) return null; // not a resolvable literal (e.g. calc()/rgb(from ...)) — not applicable
  if (typeof tokenResolved === 'string' && tokenResolved.startsWith('#')) {
    if (!cssLiteral.startsWith('#')) return null;
    return normalizeHex(tokenResolved) === normalizeHex(cssLiteral);
  }
  if (typeof tokenResolved === 'number') {
    const n = Number.parseFloat(cssLiteral);
    return Number.isFinite(n) && Math.abs(n - tokenResolved) < 1e-6;
  }
  if (tokenResolved && typeof tokenResolved === 'object' && 'value' in tokenResolved) {
    return cssLiteral.replace(/\s+/g, '') === px(tokenResolved).replace(/\s+/g, '');
  }
  return null; // fontFamily arrays, cubicBezier arrays, etc. — not meaningfully string-comparable here
}

function verifyCssContract(resolvedTokens) {
  section('works/html/batch1/styles.css — no raw dimensions in component rules');
  const css = readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const COMPONENT = /^[^@]*?(\.button|\.checkbox|\.text-input|\.textarea|\.icon-button|\.switch|\.radio|\.split-button|\.tag|\.inline-alert|\.toast|fieldset\.radio-group|:where)/;
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

  // Build a name -> raw declared value map from the :root block only (declaration order matters
  // for var() chaining, but a Map from a single top-to-bottom pass is enough since every var()
  // reference here points at something declared earlier in the same block).
  const rootBlock = /:root\s*\{([^{}]*)\}/.exec(css)?.[1] ?? '';
  const declMap = new Map();
  for (const m of rootBlock.matchAll(/--everline-([a-z0-9-]+)\s*:\s*([^;]+);/g)) declMap.set(m[1], m[2]);
  const mismatches = [];
  let checkedCount = 0;
  for (const name of declared) {
    if (name === 'hover-overlay') continue;
    const candidates = [name.replace(/-/g, '.'), name.replace(/^component-/, 'component.')];
    const tokenKey = [...resolvedTokens.keys()].find((k) =>
      candidates.some((c) => k.replace(/[-.]/g, '') === c.replace(/[-.]/g, '')));
    if (!tokenKey) continue;
    const literal = resolveCssVarValue(declMap, name);
    const result = valuesMatch(resolvedTokens.get(tokenKey), literal);
    if (result === null) continue; // not comparable (computed expression, array-typed token, etc.)
    checkedCount += 1;
    if (!result) mismatches.push(`--everline-${name}: ${literal} != ${tokenKey} = ${JSON.stringify(resolvedTokens.get(tokenKey))}`);
  }
  check(`every custom property with a directly-comparable literal resolves to its token's value (${checkedCount} compared)`,
    mismatches.length === 0, mismatches.slice(0, 6));
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
  async key(key, code) {
    const base = { key, code: code ?? key, windowsVirtualKeyCode: KEYCODES[key] ?? 0, nativeVirtualKeyCode: KEYCODES[key] ?? 0 };
    // Without the text payload Chrome delivers the keydown but never activates a button.
    const down = key === 'Enter' ? { ...base, text: '\r' } : base;
    await this.send('Input.dispatchKeyEvent', { type: 'keyDown', ...down });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
    await sleep(70);
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
const KEYCODES = { Escape: 27, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Home: 36, End: 35, Enter: 13 };
const sel = (s) => `document.querySelector(${JSON.stringify(s)})`;
// Chrome resolves color-mix() to the color(srgb ...) function syntax rather than rgb() for some
// inputs (documented in docs/STATUS.md for Number input's identical disabled technique). Shared
// by every component below that uses the same color-mix disabled-foreground technique.
function parseAnyColor(s) {
  let m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(s);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\)$/.exec(s);
  if (m) return [Math.round(Number(m[1]) * 255), Math.round(Number(m[2]) * 255), Math.round(Number(m[3]) * 255)];
  return null;
}

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
        disabledAttr: disabled.disabled, disabledOpacity: cs(disabled).opacity,
        disabledBg: cs(disabled).backgroundColor, disabledFg: cs(disabled).color
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
    // PR #29 review (2026-07-30): plain `opacity: .55` on the whole disabled button dimmed the
    // approved SVG's solid #666666 background to ~#434343 — the SVG only dims the label text.
    // The element itself must no longer carry a computed opacity below 1; the background stays
    // the exact token colour (confirmed again below via a real screenshot sample), and only the
    // text uses the disabled colour-mix technique already established elsewhere in this file.
    check('disabled button no longer has element-level opacity (background must not be dimmed)',
      btn.disabledOpacity === '1', btn.disabledOpacity);
    check('disabled button computed background is the solid token colour rgb(102, 102, 102), not dimmed',
      btn.disabledBg === 'rgb(102, 102, 102)', btn.disabledBg);
    // Chrome resolves this color-mix() to the color(srgb ...) function syntax rather than rgb(),
    // same quirk already documented in docs/STATUS.md for Number input's identical technique
    // (there measured "color(srgb .702 .702 .702) ≈ rgb(179,179,179)"). Parse either syntax.
    const disabledFgRgb = parseAnyColor(btn.disabledFg);
    check('disabled button text is the color-mix composite of foreground-disabled over the solid background (≈rgb(179, 179, 179), same technique as batch 3 Number input)',
      !!disabledFgRgb && disabledFgRgb.every((v) => Math.abs(v - 179) <= 1), { raw: btn.disabledFg, parsed: disabledFgRgb });

    /* ---------------- Icon button ---------------- */
    section('Icon button');
    const iconButtons = await c.js(`(()=>{
      const all = document.querySelectorAll('.icon-button');
      const primary=all[0], neutral=all[1], disabled=all[2], danger=all[3], outline=all[4];
      const cs=(e)=>getComputedStyle(e);
      return {
        w: cs(primary).width, h: cs(primary).height, r: cs(primary).borderRadius,
        primaryBg: cs(primary).backgroundColor, primaryFg: cs(primary).color,
        neutralBg: cs(neutral).backgroundColor, neutralFg: cs(neutral).color,
        dangerBg: cs(danger).backgroundColor,
        outlineShadow: cs(outline).boxShadow !== 'none',
        disabledAttr: disabled.disabled, disabledOpacity: cs(disabled).opacity, disabledBg: cs(disabled).backgroundColor, disabledFg: cs(disabled).color,
        everyHasLabel: [...all].every((b) => !!b.getAttribute('aria-label')),
        everySvgHidden: [...all].every((b) => b.querySelector('svg').getAttribute('aria-hidden') === 'true'),
        iconW: cs(primary.querySelector('svg')).width
      };
    })()`);
    check('icon button is 48x48px', iconButtons.w === '48px' && iconButtons.h === '48px', [iconButtons.w, iconButtons.h]);
    check('icon button radius is 24px', iconButtons.r === '24px', iconButtons.r);
    check('icon size is 24px', iconButtons.iconW === '24px', iconButtons.iconW);
    check('primary background is action-primary rgb(89, 138, 232)', iconButtons.primaryBg === 'rgb(89, 138, 232)', iconButtons.primaryBg);
    check('primary foreground is white rgb(255, 255, 255)', iconButtons.primaryFg === 'rgb(255, 255, 255)', iconButtons.primaryFg);
    check('neutral foreground is off-white rgb(242, 242, 242), NOT white (the P0 gap this round fixed)',
      iconButtons.neutralFg === 'rgb(242, 242, 242)', iconButtons.neutralFg);
    check('danger background is action-danger rgb(193, 39, 45)', iconButtons.dangerBg === 'rgb(193, 39, 45)', iconButtons.dangerBg);
    check('outline variant draws a border via box-shadow', iconButtons.outlineShadow);
    check('disabled icon button uses the native disabled attribute', iconButtons.disabledAttr === true, iconButtons.disabledAttr);
    check('disabled icon button has no element-level opacity (background must not be dimmed)', iconButtons.disabledOpacity === '1', iconButtons.disabledOpacity);
    check('disabled icon button background is the solid token colour rgb(102, 102, 102), not dimmed', iconButtons.disabledBg === 'rgb(102, 102, 102)', iconButtons.disabledBg);
    const iconDisabledFgRgb = parseAnyColor(iconButtons.disabledFg);
    check('disabled icon button foreground is the color-mix composite (≈rgb(179, 179, 179))',
      !!iconDisabledFgRgb && iconDisabledFgRgb.every((v) => Math.abs(v - 179) <= 1), { raw: iconButtons.disabledFg, parsed: iconDisabledFgRgb });
    check('every icon button has an accessible name (aria-label)', iconButtons.everyHasLabel, iconButtons.everyHasLabel);
    check('every icon button svg is aria-hidden (decorative, name comes from aria-label)', iconButtons.everySvgHidden, iconButtons.everySvgHidden);

    /* ---------------- Switch ---------------- */
    section('Switch');
    const sw = await c.js(`(()=>{
      const cs=(e)=>getComputedStyle(e);
      const on=${sel('#sw-on')}, off=${sel('#sw-off')}, disabled=${sel('#sw-disabled')}, danger=${sel('#sw-danger')};
      return {
        w: cs(on).width, h: cs(on).height,
        role: on.getAttribute('role'),
        onChecked: on.checked, offChecked: off.checked,
        onBg: cs(on).backgroundColor, offBg: cs(off).backgroundColor, dangerBg: cs(danger).backgroundColor,
        disabledAttr: disabled.disabled
      };
    })()`);
    check('switch track is 96x48px', sw.w === '96px' && sw.h === '48px', [sw.w, sw.h]);
    check('switch has role="switch"', sw.role === 'switch', sw.role);
    check('the "on" example is natively checked, "off" is not', sw.onChecked === true && sw.offChecked === false, sw);
    check('on track renders as action-primary rgb(89, 138, 232)', sw.onBg === 'rgb(89, 138, 232)', sw.onBg);
    check('off track renders as background-surface rgb(51, 51, 51)', sw.offBg === 'rgb(51, 51, 51)', sw.offBg);
    check('danger-on track renders as action-danger rgb(193, 39, 45)', sw.dangerBg === 'rgb(193, 39, 45)', sw.dangerBg);
    check('disabled switch uses the native disabled attribute', sw.disabledAttr === true, sw.disabledAttr);

    // Real click test: clicking the off switch toggles its real `checked` property.
    const beforeSwitchClick = await c.js(`${sel('#sw-off')}.checked`);
    await c.clickEl(sel('#sw-off'));
    const afterSwitchClick = await c.js(`${sel('#sw-off')}.checked`);
    check('clicking the switch toggles its native checked property', beforeSwitchClick !== afterSwitchClick, { beforeSwitchClick, afterSwitchClick });
    await c.clickEl(sel('#sw-off')); // restore

    // Real keyboard test: Enter toggles (the one path native checkboxes don't support natively,
    // added specifically because issue #31 asks for it).
    await c.js(`${sel('#sw-off')}.focus()`);
    const beforeEnter = await c.js(`${sel('#sw-off')}.checked`);
    await c.key('Enter');
    const afterEnter = await c.js(`${sel('#sw-off')}.checked`);
    check('Enter toggles the switch (native checkbox does not support this; added by prototype.js)', beforeEnter !== afterEnter, { beforeEnter, afterEnter });
    await c.key('Enter'); // restore

    // Real keyboard test: Space toggles too (native checkbox behaviour, not a custom handler).
    const beforeSpace = await c.js(`${sel('#sw-off')}.checked`);
    await c.send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space' });
    await c.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space' });
    await sleep(70);
    const afterSpace = await c.js(`${sel('#sw-off')}.checked`);
    check('Space toggles the switch (native checkbox behaviour)', beforeSpace !== afterSpace, { beforeSpace, afterSpace });
    await c.send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space' });
    await c.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space' });
    await sleep(70); // restore

    /* ---------------- Radio ---------------- */
    section('Radio');
    const rd = await c.js(`(()=>{
      const cs=(e)=>getComputedStyle(e, null);
      const csBefore=(e)=>getComputedStyle(e, '::before');
      const high=${sel('#radio-high')}, medium=${sel('#radio-medium')}, low=${sel('#radio-low')};
      return {
        hitW: cs(high).width, hitH: cs(high).height,
        visualW: csBefore(high).width, visualH: csBefore(high).height,
        name: high.name,
        mediumChecked: medium.checked, highChecked: high.checked,
        disabledAttr: low.disabled,
        fieldsetTag: high.closest('fieldset')?.tagName, legendText: high.closest('fieldset')?.querySelector('legend')?.textContent
      };
    })()`);
    check('radio native hit area is 48x48px', rd.hitW === '48px' && rd.hitH === '48px', [rd.hitW, rd.hitH]);
    check('radio visual box (::before) is 32x32px', rd.visualW === '32px' && rd.visualH === '32px', [rd.visualW, rd.visualH]);
    check('radios share the same name attribute (a real group)', rd.name === 'radio-priority', rd.name);
    check('exactly one radio ("medium") is checked initially', rd.mediumChecked === true && rd.highChecked === false, rd);
    check('disabled radio uses the native disabled attribute', rd.disabledAttr === true, rd.disabledAttr);
    check('the group is wrapped in a real <fieldset> with a <legend>', rd.fieldsetTag === 'FIELDSET' && !!rd.legendText, rd);

    // Real keyboard test: ArrowDown moves selection to the next radio in the same-name group —
    // this is native <input type="radio"> behaviour, no JS was written for it. DOM order is
    // high, medium (checked), low (disabled), so from medium the only enabled radio left to move
    // to is high — Chrome's native radio-group navigation skips disabled options and wraps
    // around, so ArrowDown from medium lands on high, not low.
    await c.js(`${sel('#radio-medium')}.focus()`);
    await c.key('ArrowDown');
    const afterArrowDown = await c.js(`[${sel('#radio-high')}.checked,${sel('#radio-medium')}.checked,${sel('#radio-low')}.checked,document.activeElement.id]`);
    check('ArrowDown from medium wraps past the disabled "low" radio and lands on "high" (native Chrome behaviour: disabled options are skipped in group navigation)',
      afterArrowDown[0] === true && afterArrowDown[1] === false && afterArrowDown[2] === false && afterArrowDown[3] === 'radio-high',
      afterArrowDown);
    // Restore: click "medium" back to the documented initial state.
    await c.clickEl(sel('#radio-medium'));

    /* ---------------- Split button / Dropdown ---------------- */
    section('Split button / Dropdown');
    const spBefore = await c.js(`(()=>{
      const cs=(e)=>getComputedStyle(e);
      const root=${sel('[data-split-button]')}, main=${sel('[data-split-main]')}, disclosure=${sel('[data-split-disclosure]')}, menu=${sel('[data-split-menu]')}, divider=document.querySelector('.split-button__divider');
      return {
        w: cs(root).height, mainBg: cs(main).backgroundColor, mainFg: cs(main).color,
        dividerBg: cs(divider).backgroundColor,
        menuHidden: menu.hidden, expanded: disclosure.getAttribute('aria-expanded'),
        hasPopup: disclosure.getAttribute('aria-haspopup'), controls: disclosure.getAttribute('aria-controls') === menu.id
      };
    })()`);
    check('split button height is 48px', spBefore.w === '48px', spBefore.w);
    check('main action background is action-primary rgb(89, 138, 232)', spBefore.mainBg === 'rgb(89, 138, 232)', spBefore.mainBg);
    check('main action foreground is white rgb(255, 255, 255)', spBefore.mainFg === 'rgb(255, 255, 255)', spBefore.mainFg);
    check('divider renders as the SVG-backfilled rgb(74, 118, 201) (#4A76C9), not action-primary',
      spBefore.dividerBg === 'rgb(74, 118, 201)', spBefore.dividerBg);
    check('menu starts hidden with aria-expanded="false"', spBefore.menuHidden === true && spBefore.expanded === 'false', spBefore);
    check('disclosure has aria-haspopup="menu" and aria-controls pointing at the real menu id', spBefore.hasPopup === 'menu' && spBefore.controls, spBefore);

    // Real click test: the main action and disclosure are independent — clicking main must not open the menu.
    await c.clickEl(sel('[data-split-main]'));
    const afterMainClick = await c.js(`${sel('[data-split-menu]')}.hidden`);
    check('clicking the main action does not open the menu (independent controls)', afterMainClick === true, afterMainClick);

    // Real click test: open via disclosure, first item receives focus, aria-expanded flips.
    await c.clickEl(sel('[data-split-disclosure]'));
    const afterDisclosureClick = await c.js(`(()=>{
      const menu=${sel('[data-split-menu]')}, disclosure=${sel('[data-split-disclosure]')};
      return { hidden: menu.hidden, expanded: disclosure.getAttribute('aria-expanded'), focusedText: document.activeElement.textContent.trim() };
    })()`);
    check('clicking the disclosure opens the menu, sets aria-expanded=true, and focuses the first item',
      afterDisclosureClick.hidden === false && afterDisclosureClick.expanded === 'true' && afterDisclosureClick.focusedText === '選項一', afterDisclosureClick);

    // Real keyboard test: ArrowDown moves roving tabindex/focus to the next item.
    await c.key('ArrowDown');
    const afterArrowDownMenu = await c.js(`(()=>{
      const items=[...${sel('[data-split-menu]')}.querySelectorAll('[role=menuitem]')];
      return { focusedText: document.activeElement.textContent.trim(), tabindexes: items.map((i) => i.tabIndex) };
    })()`);
    check('ArrowDown in the open menu moves focus to the next item with roving tabindex',
      afterArrowDownMenu.focusedText === '選項二' && JSON.stringify(afterArrowDownMenu.tabindexes) === '[-1,0]', afterArrowDownMenu);

    // Menu items never had a bespoke focus visual drawn or implemented, but they are real
    // <button>s, so the page's global :where(button, ...):focus-visible rule already applies to
    // them — confirm that's actually true rather than just asserting it in prose (codex review
    // flagged the prior wording as claiming "no visual feedback at all", which this disproves).
    const focusedMenuItemOutline = await c.js('getComputedStyle(document.activeElement).outlineStyle');
    check('the currently-focused menu item picks up the shared global focus-visible outline (not a bespoke menu-item style, but not literally invisible either)',
      focusedMenuItemOutline === 'solid', focusedMenuItemOutline);

    // Real keyboard test: Enter on a menu item activates it, closes the menu, and returns focus
    // to the disclosure button (not the trigger that opened it via click — the APG spec, and this
    // implementation, always return focus to the disclosure since that is what owns the menu).
    await c.key('Enter');
    const afterItemEnter = await c.js(`(()=>{
      const menu=${sel('[data-split-menu]')}, disclosure=${sel('[data-split-disclosure]')};
      return { hidden: menu.hidden, expanded: disclosure.getAttribute('aria-expanded'), focusIsDisclosure: document.activeElement===disclosure, lastAction: ${sel('[data-split-status]')}.dataset.lastAction };
    })()`);
    check('Enter on a menu item closes the menu, clears aria-expanded, returns focus to disclosure, and records which item fired',
      afterItemEnter.hidden === true && afterItemEnter.expanded === 'false' && afterItemEnter.focusIsDisclosure && afterItemEnter.lastAction === '選項二', afterItemEnter);

    // Real keyboard test: ArrowDown/Enter/Space on the (closed) disclosure opens the menu.
    await c.js(`${sel('[data-split-disclosure]')}.focus()`);
    await c.key('ArrowDown');
    const openedByArrowDown = await c.js(`!${sel('[data-split-menu]')}.hidden`);
    check('ArrowDown on the closed disclosure opens the menu', openedByArrowDown === true, openedByArrowDown);

    // Real keyboard test: Escape closes the menu and returns focus to the disclosure.
    await c.key('Escape');
    const afterEscape = await c.js(`(()=>{
      const menu=${sel('[data-split-menu]')}, disclosure=${sel('[data-split-disclosure]')};
      return { hidden: menu.hidden, focusIsDisclosure: document.activeElement===disclosure };
    })()`);
    check('Escape closes the menu and returns focus to the disclosure', afterEscape.hidden === true && afterEscape.focusIsDisclosure, afterEscape);

    // Real click test: light dismiss — clicking outside the split button closes the open menu.
    await c.clickEl(sel('[data-split-disclosure]'));
    await c.click(20, 20);
    const afterOutsideClick = await c.js(`${sel('[data-split-menu]')}.hidden`);
    check('clicking outside the open menu closes it (light dismiss)', afterOutsideClick === true, afterOutsideClick);

    /* ---------------- Badge / Tag ---------------- */
    section('Badge / Tag');
    const tag = await c.js(`(()=>{
      const cs=(e)=>getComputedStyle(e);
      const direct=[...document.querySelectorAll('.tag-examples > .tag')];
      const neutral=direct[0], accent=direct[1], danger=direct[2], disabled=direct[3], removable=direct[4];
      const outlineWrapper=${sel('[data-tag-toggle]')}, outline=${sel('.tag--outline')};
      const dot=accent.querySelector('.tag__dot'), icon=danger.querySelector('.tag__icon');
      const removeBtn=removable.querySelector('.tag__remove');
      return {
        h: cs(neutral).height, r: cs(neutral).borderRadius, padInline: cs(neutral).paddingLeft, gap: cs(neutral).columnGap,
        neutralBg: cs(neutral).backgroundColor, neutralFg: cs(neutral).color,
        accentBg: cs(accent).backgroundColor, accentFg: cs(accent).color,
        dangerBg: cs(danger).backgroundColor, dangerFg: cs(danger).color,
        outlineShadow: cs(outline).boxShadow !== 'none',
        outlineWrapperH: cs(outlineWrapper).height,
        outlinePressedBefore: outlineWrapper.getAttribute('aria-pressed'),
        disabledAttr: disabled.getAttribute('aria-disabled'), disabledTag: disabled.tagName, disabledBg: cs(disabled).backgroundColor, disabledFg: cs(disabled).color,
        disabledHiddenText: disabled.querySelector('.visually-hidden')?.textContent ?? null,
        disabledHiddenWidth: (()=>{const h=disabled.querySelector('.visually-hidden'); return h ? cs(h).width : null;})(),
        dotSize: cs(dot).width, dotBg: cs(dot).backgroundColor,
        iconSize: cs(icon).width,
        removeLabel: removeBtn.getAttribute('aria-label'), removeSize: cs(removeBtn).width
      };
    })()`);
    check('tag height is 40px', tag.h === '40px', tag.h);
    check('tag radius is 20px (pill for this height)', tag.r === '20px', tag.r);
    check('tag padding-inline is 16px', tag.padInline === '16px', tag.padInline);
    check('tag gap (icon/dot to text) is 8px', tag.gap === '8px', tag.gap);
    check('neutral background is background-surface rgb(51, 51, 51)', tag.neutralBg === 'rgb(51, 51, 51)', tag.neutralBg);
    check('neutral foreground is off-white rgb(242, 242, 242)', tag.neutralFg === 'rgb(242, 242, 242)', tag.neutralFg);
    check('accent background is action-primary rgb(89, 138, 232)', tag.accentBg === 'rgb(89, 138, 232)', tag.accentBg);
    check('accent foreground is white rgb(255, 255, 255)', tag.accentFg === 'rgb(255, 255, 255)', tag.accentFg);
    check('danger background is action-danger rgb(193, 39, 45)', tag.dangerBg === 'rgb(193, 39, 45)', tag.dangerBg);
    check('danger foreground is white rgb(255, 255, 255)', tag.dangerFg === 'rgb(255, 255, 255)', tag.dangerFg);
    check('outline variant draws a border via box-shadow', tag.outlineShadow);
    check('outline hit-area wrapper is 48px tall (spec a11y requirement, grown from the 40px visual)', tag.outlineWrapperH === '48px', tag.outlineWrapperH);
    check('outline toggle starts at aria-pressed="false"', tag.outlinePressedBefore === 'false', tag.outlinePressedBefore);
    // PR #46 review (opus): disabled was originally a <button disabled>, the only variant among
    // six that isn't a <span> — the SVG's tag-disabled example doesn't indicate which kind of tag
    // (status/filter/removable) it represents, and none of the other 5 variants imply any
    // interactive affordance a "disabled" state could belong to (the spec is explicit: "純狀態
    // tag 不可點擊"). Decided (2026-08-03, human call): disabled is a <span aria-disabled="true">,
    // matching its 5 sibling status tags rather than masquerading as a disabled interactive
    // control that was never drawn as one.
    check('disabled tag is a non-interactive <span> with aria-disabled="true" (matching its 5 sibling status tags)',
      tag.disabledTag === 'SPAN' && tag.disabledAttr === 'true', { tag: tag.disabledTag, ariaDisabled: tag.disabledAttr });
    // PR #46 review round 3 (opus): switching to a non-focusable <span> means the disabled state
    // is no longer announced the way a real <button disabled> would be, and the only remaining
    // difference from the neutral variant is colour (background + text opacity) — violating this
    // component's own spec text ("不得只依顏色傳達停用" / "不以顏色單獨表達語意，需要文字、圖示或
    // 上下文共同說明"). Not a visual regression (colour-only was already true before this PR),
    // but a real accessibility gap this PR's own <span> change introduced. Fixed with a
    // screen-reader-only "（已停用）" span reusing the existing .visually-hidden utility already
    // used elsewhere in this file for labels — text, not a new pixel, so this doesn't fall under
    // "don't invent an undrawn visual".
    check('disabled tag conveys its state with more than colour: a visually-hidden "（已停用）" text is present for assistive tech',
      tag.disabledHiddenText === '（已停用）', tag.disabledHiddenText);
    check('the disabled-state text is actually visually hidden (1px, not a visible pixel change)',
      tag.disabledHiddenWidth === '1px', tag.disabledHiddenWidth);
    check('disabled tag background is the solid token colour rgb(102, 102, 102), not dimmed', tag.disabledBg === 'rgb(102, 102, 102)', tag.disabledBg);
    const tagDisabledFgRgb = parseAnyColor(tag.disabledFg);
    check('disabled tag foreground is the color-mix composite of foreground-disabled over the solid background (≈rgb(179, 179, 179), same technique as Button/Text input)',
      !!tagDisabledFgRgb && tagDisabledFgRgb.every((v) => Math.abs(v - 179) <= 1), { raw: tag.disabledFg, parsed: tagDisabledFgRgb });
    check('accent dot is 8px diameter', tag.dotSize === '8px', tag.dotSize);
    check('accent dot uses currentColor, rendering white to match its own label text', tag.dotBg === 'rgb(255, 255, 255)', tag.dotBg);
    check('danger icon is 16px', tag.iconSize === '16px', tag.iconSize);
    check('remove control has an accessible name identifying which tag it removes', tag.removeLabel === '移除：高優先', tag.removeLabel);
    check('remove control hit area is 32px', tag.removeSize === '32px', tag.removeSize);

    // PR #46 review (opus) found the remove icon rendered 9px further from the pill's right edge
    // than the approved SVG (32px measured vs. 23px drawn) — real geometry, not computed-style.
    // Confirm the fix restores the exact SVG-measured 23px via the same getBoundingClientRect
    // measurement technique the review used, not just that the CSS declares the intended value.
    const removeGeometry = await c.js(`(()=>{
      const pill=${sel('.tag--removable')}, remove=${sel('.tag--removable .tag__remove')}, svg=remove.querySelector('svg');
      const pillRect=pill.getBoundingClientRect(), svgRect=svg.getBoundingClientRect();
      return { offset: Math.round(pillRect.right - (svgRect.left + svgRect.width / 2)) };
    })()`);
    check('remove icon centre sits 23px from the pill\'s right edge, matching the SVG measurement (was 32px before this fix)',
      removeGeometry.offset === 23, removeGeometry);

    // Real click test: outline toggles its real aria-pressed without changing its own rendered
    // appearance — no selected/pressed visual was ever drawn for this variant (see index.html
    // scope note), so a real click must leave background/box-shadow untouched.
    const outlineStyleBefore = await c.js(`(()=>{const e=${sel('.tag--outline')};const cs=getComputedStyle(e);return {bg:cs.backgroundColor,shadow:cs.boxShadow};})()`);
    await c.clickEl(sel('[data-tag-toggle]'));
    const afterToggleClick = await c.js(`${sel('[data-tag-toggle]')}.getAttribute('aria-pressed')`);
    const outlineStyleAfter = await c.js(`(()=>{const e=${sel('.tag--outline')};const cs=getComputedStyle(e);return {bg:cs.backgroundColor,shadow:cs.boxShadow};})()`);
    check('clicking the outline tag toggles its real aria-pressed', afterToggleClick === 'true', afterToggleClick);
    check("toggling does not change the outline tag's rendered appearance (no selected visual was ever drawn)",
      outlineStyleBefore.bg === outlineStyleAfter.bg && outlineStyleBefore.shadow === outlineStyleAfter.shadow, { outlineStyleBefore, outlineStyleAfter });
    await c.clickEl(sel('[data-tag-toggle]')); // restore to aria-pressed="false"

    // Real keyboard test: a native <button> activates on both Enter and Space with no custom JS.
    await c.js(`${sel('[data-tag-toggle]')}.focus()`);
    await c.key('Enter');
    const afterEnterToggle = await c.js(`${sel('[data-tag-toggle]')}.getAttribute('aria-pressed')`);
    check('Enter activates the outline toggle (native <button> behaviour)', afterEnterToggle === 'true', afterEnterToggle);
    await c.send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space' });
    await c.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space' });
    await sleep(70);
    const afterSpaceToggle = await c.js(`${sel('[data-tag-toggle]')}.getAttribute('aria-pressed')`);
    check('Space activates the outline toggle (native <button> behaviour), restoring aria-pressed="false"', afterSpaceToggle === 'false', afterSpaceToggle);

    // Real click test: the remove control deletes its own tag from the DOM — a real mutation, not
    // merely a visual fade (no removal animation exists in the SVG to justify one). Restored
    // afterward (re-inserted with a fresh listener mirroring prototype.js's own registration) so
    // the example survives for the G1 review screenshot captured later in this script — the same
    // restore-to-documented-state convention already used for Switch/Checkbox/Radio above.
    const countBeforeRemove = await c.js(`document.querySelectorAll('.tag-examples > .tag').length`);
    const removableHtml = await c.js(`${sel('.tag--removable')}.outerHTML`);
    await c.clickEl(sel('[data-tag-remove]'));
    const afterRemove = await c.js(`(()=>{
      const group=${sel('.tag-examples')};
      return {
        count: document.querySelectorAll('.tag-examples > .tag').length, gone: !document.querySelector('.tag--removable'),
        activeIsGroup: document.activeElement === group, activeIsBody: document.activeElement === document.body
      };
    })()`);
    check('clicking the remove control deletes exactly its own tag from the DOM',
      afterRemove.count === countBeforeRemove - 1 && afterRemove.gone, { before: countBeforeRemove, after: afterRemove });
    // PR #46 review (opus): a natively-focused control disappearing must not silently drop
    // keyboard focus to <body> — this demo has exactly one removable tag, so with no sibling
    // remove control left to move to, focus must land on the group container (tabindex="-1" in
    // index.html), the documented last-resort fallback, not wherever the browser defaults to.
    check('removing the only removable tag moves focus to the group container, not <body>',
      afterRemove.activeIsGroup === true && afterRemove.activeIsBody === false, afterRemove);
    await c.js(`(()=>{
      ${sel('.tag--disabled')}.insertAdjacentHTML('afterend', ${JSON.stringify(removableHtml)});
      const restoredBtn = document.querySelector('.tag--removable .tag__remove');
      restoredBtn.addEventListener('click', () => {
        const tag = restoredBtn.closest('.tag');
        const group = tag?.parentElement;
        const removesInGroup = group ? [...group.querySelectorAll('[data-tag-remove]')] : [];
        const myIndex = removesInGroup.indexOf(restoredBtn);
        tag?.remove();
        const next = removesInGroup[myIndex + 1] || removesInGroup[myIndex - 1];
        if (next && next.isConnected) next.focus();
        else group?.focus();
      });
    })()`);
    const restoredCount = await c.js(`document.querySelectorAll('.tag-examples > .tag').length`);
    check('the removable example is restored for the G1 review screenshot below', restoredCount === countBeforeRemove, { restoredCount, countBeforeRemove });

    /* ---------------- Inline alert ---------------- */
    section('Inline alert');
    const alert = await c.js(`(()=>{
      const cs=(e)=>getComputedStyle(e);
      const direct=[...document.querySelectorAll('.inline-alert-examples > .inline-alert')];
      const info=direct[0], danger=direct[1], neutral=direct[2];
      const infoRail=info.querySelector('.inline-alert__rail'), infoIcon=info.querySelector('.inline-alert__icon');
      const infoTitle=info.querySelector('.inline-alert__title'), infoBody=info.querySelector('.inline-alert__body');
      const dismiss=info.querySelector('.inline-alert__dismiss');
      const railRect=infoRail.getBoundingClientRect(), iconRect=infoIcon.getBoundingClientRect();
      return {
        minH: cs(neutral).minHeight, r: cs(neutral).borderRadius,
        railW: Math.round(railRect.width), railH: Math.round(railRect.height),
        iconW: Math.round(iconRect.width), iconH: Math.round(iconRect.height),
        titleSize: cs(infoTitle).fontSize, titleColor: cs(infoTitle).color,
        bodySize: cs(infoBody).fontSize, bodyColor: cs(infoBody).color,
        gap: cs(info.querySelector('.inline-alert__content')).rowGap,
        infoRole: info.getAttribute('role'), dangerRole: danger.getAttribute('role'), neutralRole: neutral.getAttribute('role'),
        dismissSize: cs(dismiss).width, dismissLabel: dismiss.getAttribute('aria-label'),
        dangerHasDismiss: !!danger.querySelector('.inline-alert__dismiss'),
        neutralHasDismiss: !!neutral.querySelector('.inline-alert__dismiss')
      };
    })()`);
    check('inline alert min-height is 96px', alert.minH === '96px', alert.minH);
    check('inline alert radius is 16px', alert.r === '16px', alert.r);
    check('rail is 4px wide, 64px tall (96px card minus 16px top/bottom inset)', alert.railW === 4 && alert.railH === 64, { w: alert.railW, h: alert.railH });
    check('icon SVG render box is 32px (icon-size 28px + icon-render-margin 2px on each side, so the 32-unit viewBox maps 1:1 to pixels)', alert.iconW === 32 && alert.iconH === 32, { w: alert.iconW, h: alert.iconH });
    // PR #47 review (codex) found the SVG box's own bounding-rect size (checked above) does not
    // prove the CIRCLE inside actually renders at 28px — a mismatched viewBox-to-box ratio can
    // pass a box-size check while still shrinking everything drawn inside it, which is exactly
    // what happened (24.5px instead of 28px) before this fix. Measure the <circle> element's own
    // real geometry directly, not the SVG element that contains it.
    const iconCircle = await c.js(`(()=>{
      const r=${sel('.inline-alert--info .inline-alert__icon circle')}.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    })()`);
    check('status icon circle actually renders at 28px diameter (circle r="14", diameter = 2 x r; corrects the design draft\'s unmeasured 24px, and the 24.5px shrink PR #47 review caught)',
      iconCircle.w === 28 && iconCircle.h === 28, iconCircle);
    check('title font-size is 17px (matches no existing font.size-* step)', alert.titleSize === '17px', alert.titleSize);
    check('title colour is off-white rgb(242, 242, 242)', alert.titleColor === 'rgb(242, 242, 242)', alert.titleColor);
    check('body font-size is 14px (font.size-label)', alert.bodySize === '14px', alert.bodySize);
    check('body colour is the SVG-measured gray-500 rgb(184, 184, 184), NOT the same as the title colour', alert.bodyColor === 'rgb(184, 184, 184)', alert.bodyColor);
    check('title/body gap is 8px', alert.gap === '8px', alert.gap);
    check('info uses role="status" (general information, not an urgent error)', alert.infoRole === 'status', alert.infoRole);
    check('danger uses role="alert" (needs immediate attention, per docs/design-system-v0.1-draft.md)', alert.dangerRole === 'alert', alert.dangerRole);
    check('neutral uses role="status"', alert.neutralRole === 'status', alert.neutralRole);
    check('dismiss control hit area is 48px (extension pending G1, not SVG-drawn)', alert.dismissSize === '48px', alert.dismissSize);
    check('dismiss control has an accessible name identifying which alert it closes', alert.dismissLabel === '關閉：同步已暫停', alert.dismissLabel);
    check('only the info variant has a dismiss button — the SVG never drew one on danger/neutral',
      alert.dangerHasDismiss === false && alert.neutralHasDismiss === false, { danger: alert.dangerHasDismiss, neutral: alert.neutralHasDismiss });

    // PR #47 review (codex) found two real geometry bugs here: the X glyph was drawn only 8px
    // wide (vs. the SVG-measured 12px, translate(712 24) local box 18,18 to 30,30) and rendered
    // 48px from the card's right edge instead of the SVG's 24px, because the container's general
    // padding-inline-end (24px) was stacking on top of the button's own 48px-wide centring instead
    // of being replaced by it — the same shape of bug PR #46 found in Badge/Tag's remove icon
    // offset. Measure the real rendered path geometry directly (not just the CSS declared hit-area
    // size checked above), the same getBoundingClientRect technique that check used.
    const dismissGeom = await c.js(`(()=>{
      const card=${sel('.inline-alert--info')}, svg=card.querySelector('.inline-alert__dismiss svg');
      const rects=[...svg.querySelectorAll('path')].map(p=>p.getBoundingClientRect());
      const left=Math.min(...rects.map(r=>r.left)), right=Math.max(...rects.map(r=>r.right));
      const cardRect=card.getBoundingClientRect();
      return { glyphWidth: Math.round(right-left), offsetFromRightEdge: Math.round(cardRect.right - (left+right)/2) };
    })()`);
    check('dismiss X glyph is 12px wide (matches the SVG-measured local box 18,18 to 30,30)',
      dismissGeom.glyphWidth === 12, dismissGeom);
    check("dismiss X glyph centre sits 24px from the card's right edge, matching the SVG measurement (translate(712 24), X centre at local 24,24; was 48px before this fix)",
      dismissGeom.offsetFromRightEdge === 24, dismissGeom);

    // Real click test: the dismiss control removes its own alert from the DOM — a real mutation,
    // not merely a visual fade (no removal animation exists in the SVG to justify one), same
    // reasoning already applied to Badge/Tag's remove control above. This catalog only ever shows
    // one dismissible alert, so with no sibling dismiss control left to move to, focus must land
    // on the group container (tabindex="-1" in index.html), not wherever the browser defaults to.
    // Restored afterward (re-inserted with a fresh listener mirroring prototype.js's own
    // registration) so the example survives for the G1 review screenshot captured later.
    const countBeforeDismiss = await c.js(`document.querySelectorAll('.inline-alert-examples > .inline-alert').length`);
    const infoHtml = await c.js(`document.querySelector('.inline-alert--info').outerHTML`);
    await c.clickEl(sel('[data-alert-dismiss]'));
    const afterDismiss = await c.js(`(()=>{
      const group=${sel('.inline-alert-examples')};
      return {
        count: document.querySelectorAll('.inline-alert-examples > .inline-alert').length,
        gone: !document.querySelector('.inline-alert--info'),
        activeIsGroup: document.activeElement === group, activeIsBody: document.activeElement === document.body
      };
    })()`);
    check('clicking the dismiss control removes exactly the info alert from the DOM',
      afterDismiss.count === countBeforeDismiss - 1 && afterDismiss.gone, { before: countBeforeDismiss, after: afterDismiss });
    check('dismissing the only dismissible alert moves focus to the group container, not <body>',
      afterDismiss.activeIsGroup === true && afterDismiss.activeIsBody === false, afterDismiss);
    await c.js(`(()=>{
      ${sel('.inline-alert-examples')}.insertAdjacentHTML('afterbegin', ${JSON.stringify(infoHtml)});
      const restoredBtn = document.querySelector('.inline-alert--info .inline-alert__dismiss');
      restoredBtn.addEventListener('click', () => {
        const alertEl = restoredBtn.closest('.inline-alert');
        const group = alertEl?.parentElement;
        alertEl?.remove();
        group?.focus();
      });
    })()`);
    const restoredAlertCount = await c.js(`document.querySelectorAll('.inline-alert-examples > .inline-alert').length`);
    check('the info example is restored for the G1 review screenshot below', restoredAlertCount === countBeforeDismiss, { restoredAlertCount, countBeforeDismiss });

    /* ---------------- Toast / Snackbar ---------------- */
    section('Toast / Snackbar');
    const toastBefore = await c.js(`(()=>{
      const cs=(e)=>getComputedStyle(e);
      const toasts=[...document.querySelectorAll('.toast-examples > .toast')];
      const [shown, withAction, queued, danger] = toasts;
      return {
        count: toasts.length,
        h: cs(shown).height, r: cs(shown).borderRadius,
        roles: toasts.map(t => t.getAttribute('role')),
        actionRole: withAction.querySelector('[data-toast-action]').tagName,
        dangerIconBg: cs(danger.querySelector('.toast__icon')).backgroundColor,
        queuedHasDistinctVisual: queued.children.length === (1) // just the <p>, no extra stacking element
      };
    })()`);
    check('4 toast examples are present', toastBefore.count === 4, toastBefore.count);
    check('toast height is 56px, radius 16px', toastBefore.h === '56px' && toastBefore.r === '16px', toastBefore);
    check('all 4 variants use role="status", including danger (per spec text, unlike Inline alert)', toastBefore.roles.every(r => r === 'status'), toastBefore.roles);
    check('the action is a real <button> (keyboard-operable)', toastBefore.actionRole === 'BUTTON', toastBefore.actionRole);
    check('danger icon background renders as action-danger red rgb(193, 39, 45)', toastBefore.dangerIconBg === 'rgb(193, 39, 45)', toastBefore.dangerIconBg);
    check('queued example ships with no distinct stacking visual (documented SVG/spec conflict, not guessed)', toastBefore.queuedHasDistinctVisual, toastBefore.queuedHasDistinctVisual);

    // Real click test: clicking an action button removes exactly its own toast, and — since two
    // toasts have an action button in this batch — moves focus to the next remaining action
    // button, not <body>.
    const countBeforeUndo = await c.js(`document.querySelectorAll('.toast-examples > .toast').length`);
    await c.clickEl(`document.querySelectorAll('[data-toast-action]')[0]`);
    const afterUndoClick = await c.js(`(()=>{
      const group=document.querySelector('.toast-examples');
      return {
        count: document.querySelectorAll('.toast-examples > .toast').length,
        focusIsRetry: document.activeElement === document.querySelector('[data-toast-action]'),
        focusIsGroup: document.activeElement === group
      };
    })()`);
    check('clicking 復原 removes exactly that toast from the DOM', afterUndoClick.count === countBeforeUndo - 1, { before: countBeforeUndo, after: afterUndoClick.count });
    check('focus moves to the next remaining action button (重試), not <body>', afterUndoClick.focusIsRetry, afterUndoClick);

    // Real click test: removing the last remaining action button falls back to the group container.
    await c.clickEl(`document.querySelectorAll('[data-toast-action]')[0]`);
    const afterRetryClick = await c.js(`(()=>{
      const group=document.querySelector('.toast-examples');
      return { count: document.querySelectorAll('.toast-examples > .toast').length, focusIsGroup: document.activeElement === group };
    })()`);
    check('removing the last remaining action toast moves focus to the group container, not <body>', afterRetryClick.focusIsGroup, afterRetryClick);

    // Both the with-action and danger toasts were removed by the two clicks above. Rebuild the
    // whole group from index.html's own known-good markup (simpler and more reliable than trying
    // to re-insert two differently-shaped removed nodes in the right relative order) and rebind
    // real listeners the same way prototype.js does, so the G1 review screenshot below matches
    // index.html's documented initial state.
    await c.js(`(()=>{
      const group=document.querySelector('.toast-examples');
      group.innerHTML = \`
        <div class="toast" role="status">
          <svg class="toast__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l4 4 8-9"/></svg>
          <p class="toast__message">已複製連結</p>
        </div>
        <div class="toast" role="status">
          <p class="toast__message">已刪除任務</p>
          <button class="toast__action" type="button" data-toast-action>復原</button>
        </div>
        <div class="toast" role="status">
          <p class="toast__message">已同步 3 個項目</p>
        </div>
        <div class="toast toast--danger" role="status">
          <span class="toast__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 8v6 M12 17h.01"/></svg>
          </span>
          <p class="toast__message">同步失敗</p>
          <button class="toast__action" type="button" data-toast-action>重試</button>
        </div>\`;
      group.querySelectorAll('[data-toast-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const toast = btn.closest('.toast');
          const actionsInGroup = [...group.querySelectorAll('[data-toast-action]')];
          const myIndex = actionsInGroup.indexOf(btn);
          toast?.remove();
          const next = actionsInGroup[myIndex + 1] || actionsInGroup[myIndex - 1];
          if (next && next.isConnected) next.focus(); else group?.focus();
        });
      });
    })()`);
    const restoredToastCount = await c.js(`document.querySelectorAll('.toast-examples > .toast').length`);
    check('all 4 toast examples are restored for the G1 review screenshot below', restoredToastCount === 4, restoredToastCount);

    /* ---------------- Checkbox ---------------- */
    section('Checkbox');
    const cb = await c.js(`(()=>{
      const cs=(e)=>getComputedStyle(e, null);
      const csBefore=(e)=>getComputedStyle(e, '::before');
      const un=${sel('#cb-unchecked')};
      return {
        hitW: cs(un).width, hitH: cs(un).height,
        visualW: csBefore(un).width, visualH: csBefore(un).height, r: csBefore(un).borderRadius,
        indeterminate: ${sel('#cb-indeterminate')}.indeterminate,
        indeterminateChecked: ${sel('#cb-indeterminate')}.checked,
        checkedIsChecked: ${sel('#cb-checked')}.checked,
        disabledAttr: ${sel('#cb-disabled')}.disabled
      };
    })()`);
    // PR #29 review (2026-07-30): the spec's own accessibility requirement ("32px 視覺控制置於
    // 至少 48×48px 命中區") was missed in the first pass — the native <input> itself was only
    // 32x32px. The input is now 48x48px (the real, clickable hit area) with the 32x32px visual
    // drawn by ::before, centred inside it.
    check('checkbox native hit area is 48x48px', cb.hitW === '48px' && cb.hitH === '48px', [cb.hitW, cb.hitH]);
    check('checkbox visual box (::before) is still 32x32px', cb.visualW === '32px' && cb.visualH === '32px', [cb.visualW, cb.visualH]);
    check('checkbox visual radius is 8px', cb.r === '8px', cb.r);
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

    // Real click test for the 48x48 hit area itself: click a point that is inside the 48x48
    // native input box but OUTSIDE the centred 32x32 visual (the inset is (48-32)/2=8px on each
    // side, so a point 3px from the input's own edge is squarely in that "hit area but not
    // visual box" ring) and confirm it still toggles the control — proving the hit area is real,
    // not just a CSS-computed number nobody can actually click.
    const hitAreaCheck = await c.js(`(()=>{
      const cbEl=${sel('#cb-checked')}; const b=cbEl.getBoundingClientRect();
      return { before: cbEl.checked, x: Math.round(b.left+3), y: Math.round(b.top+3) };
    })()`);
    await c.click(hitAreaCheck.x, hitAreaCheck.y);
    const hitAreaAfter = await c.js(`${sel('#cb-checked')}.checked`);
    check('clicking inside the 48x48 hit area but outside the 32x32 visual box still toggles the checkbox',
      hitAreaCheck.before !== hitAreaAfter, { before: hitAreaCheck.before, after: hitAreaAfter, point: [hitAreaCheck.x, hitAreaCheck.y] });
    // Restore #cb-checked to its documented initial (checked) state for the same reason as above.
    await c.click(hitAreaCheck.x, hitAreaCheck.y);

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
    check('every switch has an associated <label for>',
      (await c.js("[...document.querySelectorAll('.switch')].every(sw => !!document.querySelector(`label[for=\"${sw.id}\"]`))")) === true);
    check('every radio has an associated <label for>',
      (await c.js("[...document.querySelectorAll('.radio')].every(r => !!document.querySelector(`label[for=\"${r.id}\"]`))")) === true);

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
      return {unchecked: read('cb-unchecked'), checked: read('cb-checked'), indeterminate: read('cb-indeterminate'),
        radioChecked: read('radio-medium'), radioUnchecked: read('radio-high')};
    })()`);
    check('unchecked checkbox glyph is invisible (opacity 0)', glyphs.unchecked.opacity === '0', glyphs.unchecked);
    check('checked checkbox glyph is visible, uses the checkmark mask, in action-primary blue',
      glyphs.checked.opacity === '1' && glyphs.checked.mask === 'set' && glyphs.checked.bg === 'rgb(89, 138, 232)', glyphs.checked);
    check('indeterminate checkbox glyph is visible and uses a mask (the horizontal-line path)',
      glyphs.indeterminate.opacity === '1' && glyphs.indeterminate.mask === 'set', glyphs.indeterminate);
    check('unchecked radio dot is invisible (opacity 0)', glyphs.radioUnchecked.opacity === '0', glyphs.radioUnchecked);
    check('checked radio dot is visible, in action-primary blue', glyphs.radioChecked.opacity === '1' && glyphs.radioChecked.bg === 'rgb(89, 138, 232)', glyphs.radioChecked);

    // The interaction checks above scroll all over the page (radio group, split button), and the
    // real headless viewport height turned out not to reliably match the --window-size launch
    // flag. Rather than guess the effective viewport, scroll the actual element into view and
    // read its rect only after that — robust regardless of viewport size or current scroll.
    await c.js(`${sel('.button--primary')}.scrollIntoView({block:'center'})`);
    await sleep(150);
    const pts = await c.js(`(()=>{
      const primary=${sel('.button--primary')}.getBoundingClientRect();
      const disabled=document.querySelectorAll('.button')[2].getBoundingClientRect();
      return {
        buttonFill: [Math.round(primary.left+8), Math.round(primary.top+primary.height/2)],
        // Sample at the vertical MIDLINE (not near a top/bottom corner): this button's radius
        // equals half its height (a pill/stadium shape), so only at the exact vertical centre
        // does the fill reach all the way to the left edge — the same technique already used for
        // the primary button sample above. A first attempt at (left+6, top+6) landed just outside
        // the rounded corner's arc and sampled the page background instead of the button.
        disabledButtonFill: [Math.round(disabled.left+8), Math.round(disabled.top+disabled.height/2)]
      };
    })()`);
    const img = await c.shot();
    const BLUE = [89, 138, 232];
    check('primary button fill renders as action-primary blue (sampled from a real screenshot)',
      JSON.stringify(img.at(...pts.buttonFill)) === JSON.stringify(BLUE), img.at(...pts.buttonFill));
    check('disabled button background renders as the solid #666666 token colour, not dimmed (real screenshot sample, PR #29 fix)',
      JSON.stringify(img.at(...pts.disabledButtonFill)) === JSON.stringify([102, 102, 102]), img.at(...pts.disabledButtonFill));

    // Same real-screenshot-sample technique for the two other new solid fills: Icon button's
    // primary background and Switch's "on" track.
    await c.js(`document.querySelectorAll('.icon-button')[0].scrollIntoView({block:'center'})`);
    await sleep(150);
    const iconPt = await c.js(`(()=>{const r=document.querySelectorAll('.icon-button')[0].getBoundingClientRect();return [Math.round(r.left+r.width/2), Math.round(r.top+r.height/2)];})()`);
    const iconImg = await c.shot();
    check('icon button primary fill renders as action-primary blue (sampled from a real screenshot)',
      JSON.stringify(iconImg.at(...iconPt)) === JSON.stringify(BLUE), iconImg.at(...iconPt));

    await c.js(`${sel('#sw-on')}.scrollIntoView({block:'center'})`);
    await sleep(150);
    // Sample near the LEFT edge, not the right: when "on", the thumb sits at the track's right
    // end (left = width - thumb - inset = 52px of 96px), so only the left ~52px strip is bare
    // blue track — the same "avoid the part covered by something else" reasoning already used
    // for the disabled button sample above.
    const swPt = await c.js(`(()=>{const r=${sel('#sw-on')}.getBoundingClientRect();return [Math.round(r.left+8), Math.round(r.top+r.height/2)];})()`);
    const swImg = await c.shot();
    check('switch "on" track renders as action-primary blue on its bare (non-thumb) side (sampled from a real screenshot)',
      JSON.stringify(swImg.at(...swPt)) === JSON.stringify(BLUE), swImg.at(...swPt));

    // PR #46 review (opus): the 4 new solid Badge/Tag fills (neutral/accent/danger/disabled) had
    // only getComputedStyle checks above, no real screenshot sample — every other new solid fill
    // in this file (Button/Icon button/Switch) got one, and it is exactly this technique that
    // caught disabled Button's real opacity bug during PR #29 review. Sample at (left+8,
    // verticalMid): tag's radius equals half its height (a pill), so at the exact vertical
    // centre the fill reaches all the way to the box's left edge regardless of any leading
    // icon/dot further inside — the same reasoning already used for Button/Switch above.
    await c.js(`document.querySelectorAll('.tag-examples > .tag')[0].scrollIntoView({block:'center'})`);
    await sleep(150);
    const tagPts = await c.js(`(()=>{
      const direct=[...document.querySelectorAll('.tag-examples > .tag')];
      const pt=(e)=>{const r=e.getBoundingClientRect();return [Math.round(r.left+8), Math.round(r.top+r.height/2)];};
      return { neutral: pt(direct[0]), accent: pt(direct[1]), danger: pt(direct[2]), disabled: pt(direct[3]) };
    })()`);
    const tagImg = await c.shot();
    const GRAY_333 = [51, 51, 51], RED = [193, 39, 45], GRAY_666 = [102, 102, 102];
    check('neutral tag background renders as background-surface rgb(51, 51, 51) (sampled from a real screenshot)',
      JSON.stringify(tagImg.at(...tagPts.neutral)) === JSON.stringify(GRAY_333), tagImg.at(...tagPts.neutral));
    check('accent tag background renders as action-primary blue (sampled from a real screenshot)',
      JSON.stringify(tagImg.at(...tagPts.accent)) === JSON.stringify(BLUE), tagImg.at(...tagPts.accent));
    check('danger tag background renders as action-danger rgb(193, 39, 45) (sampled from a real screenshot)',
      JSON.stringify(tagImg.at(...tagPts.danger)) === JSON.stringify(RED), tagImg.at(...tagPts.danger));
    check('disabled tag background renders as the solid #666666 token colour, not dimmed (sampled from a real screenshot)',
      JSON.stringify(tagImg.at(...tagPts.disabled)) === JSON.stringify(GRAY_666), tagImg.at(...tagPts.disabled));

    // Same real-screenshot-sample technique for Inline alert's three new rail colours and its
    // shared container background — even though the hex values coincide with fills already
    // sampled elsewhere in this file (action-primary/action-danger/background-subdued/
    // background-surface), each is sampled again here specifically to confirm THIS component's own
    // CSS wiring paints them correctly, the same reasoning Badge/Tag's own samples above already
    // followed rather than assuming another component's passing sample covers this one too.
    await c.js(`document.querySelectorAll('.inline-alert-examples > .inline-alert')[0].scrollIntoView({block:'center'})`);
    await sleep(150);
    const alertPts = await c.js(`(()=>{
      const direct=[...document.querySelectorAll('.inline-alert-examples > .inline-alert')];
      const railPt=(e)=>{const r=e.querySelector('.inline-alert__rail').getBoundingClientRect();return [Math.round(r.left+r.width/2), Math.round(r.top+r.height/2)];};
      const bgPt=(e)=>{const r=e.getBoundingClientRect();return [Math.round(r.right-8), Math.round(r.top+8)];};
      return { railInfo: railPt(direct[0]), railDanger: railPt(direct[1]), railNeutral: railPt(direct[2]), bg: bgPt(direct[2]) };
    })()`);
    const alertImg = await c.shot();
    check('info rail renders as action-primary blue (sampled from a real screenshot)',
      JSON.stringify(alertImg.at(...alertPts.railInfo)) === JSON.stringify(BLUE), alertImg.at(...alertPts.railInfo));
    check('danger rail renders as action-danger rgb(193, 39, 45) (sampled from a real screenshot)',
      JSON.stringify(alertImg.at(...alertPts.railDanger)) === JSON.stringify(RED), alertImg.at(...alertPts.railDanger));
    check("neutral rail renders as background-subdued rgb(102, 102, 102), NOT the same off-white as its own icon (sampled from a real screenshot)",
      JSON.stringify(alertImg.at(...alertPts.railNeutral)) === JSON.stringify(GRAY_666), alertImg.at(...alertPts.railNeutral));
    check('inline alert container background renders as background-surface rgb(51, 51, 51) (sampled from a real screenshot)',
      JSON.stringify(alertImg.at(...alertPts.bg)) === JSON.stringify(GRAY_333), alertImg.at(...alertPts.bg));

    // Same real-screenshot-sample technique for Toast's own container background and its danger
    // icon's solid red circle.
    await c.js(`document.querySelectorAll('.toast-examples > .toast')[0].scrollIntoView({block:'center'})`);
    await sleep(150);
    const toastPts = await c.js(`(()=>{
      const shown=document.querySelectorAll('.toast-examples > .toast')[0].getBoundingClientRect();
      const dangerIcon=document.querySelector('.toast--danger .toast__icon').getBoundingClientRect();
      return {
        bg: [Math.round(shown.left+shown.width-8), Math.round(shown.top+8)],
        // Off-centre, not the circle's exact centre: the white exclamation-mark glyph sits there,
        // same "avoid the text/glyph, sample the flat fill" lesson already applied elsewhere.
        dangerIcon: [Math.round(dangerIcon.left+4), Math.round(dangerIcon.top+dangerIcon.height/2)]
      };
    })()`);
    const toastImg = await c.shot();
    check('toast container background renders as background-surface rgb(51, 51, 51) (sampled from a real screenshot)',
      JSON.stringify(toastImg.at(...toastPts.bg)) === JSON.stringify(GRAY_333), toastImg.at(...toastPts.bg));
    check('danger toast icon background renders as action-danger red rgb(193, 39, 45) (sampled from a real screenshot)',
      JSON.stringify(toastImg.at(...toastPts.dangerIcon)) === JSON.stringify(RED), toastImg.at(...toastPts.dangerIcon));

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
