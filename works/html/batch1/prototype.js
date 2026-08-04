// Everline batch 1 pilot — indeterminate is a JS-only DOM property, not an HTML attribute,
// so it cannot be set by a checked/indeterminate attribute in index.html.
document.querySelectorAll('[data-indeterminate]').forEach((el) => {
  el.indeterminate = true;
});

// Switch (issue #31): a native <input type="checkbox"> already toggles on click and Space.
// Enter does not toggle a native checkbox by browser default; issue #31 asks for it too, so this
// adds only that one missing path — it does not touch click/Space, which are already native.
document.querySelectorAll('.switch').forEach((el) => {
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || el.disabled) return;
    e.preventDefault();
    el.checked = !el.checked;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
});

// Split button / Dropdown (issue #33): real role="menu" + role="menuitem" buttons with roving
// tabindex (ARIA APG menu-button pattern) — only one item is ever in the tab sequence, arrow
// keys move focus among the rest. Only the interactions the approved SVG's closed/open states
// actually support are implemented: open/close and moving between the two plain items. No
// hover/selected/disabled/loading item states are added (see index.html's scope note — the SVG
// never drew them for this component's menu).
document.querySelectorAll('[data-split-button]').forEach((root) => {
  const main = root.querySelector('[data-split-main]');
  const disclosure = root.querySelector('[data-split-disclosure]');
  const menu = root.querySelector('[data-split-menu]');
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  const status = root.parentElement.parentElement.querySelector('[data-split-status]');

  function isOpen() { return !menu.hidden; }

  function openMenu(focusIndex) {
    menu.hidden = false;
    disclosure.setAttribute('aria-expanded', 'true');
    items.forEach((it, i) => { it.tabIndex = i === focusIndex ? 0 : -1; });
    items[focusIndex]?.focus();
  }

  function closeMenu({ returnFocus = true } = {}) {
    if (!isOpen()) return;
    menu.hidden = true;
    disclosure.setAttribute('aria-expanded', 'false');
    if (returnFocus) disclosure.focus();
  }

  main.addEventListener('click', () => {
    if (status) status.dataset.lastAction = 'main';
  });

  disclosure.addEventListener('click', () => {
    if (isOpen()) closeMenu();
    else openMenu(0);
  });
  disclosure.addEventListener('keydown', (e) => {
    if (isOpen()) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu(0);
    }
  });

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (status) status.dataset.lastAction = item.textContent.trim();
      closeMenu();
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); const next = (i + 1) % items.length; items[i].tabIndex = -1; items[next].tabIndex = 0; items[next].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); const prev = (i - 1 + items.length) % items.length; items[i].tabIndex = -1; items[prev].tabIndex = 0; items[prev].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
      else if (e.key === 'Tab') { closeMenu({ returnFocus: false }); }
    });
  });

  document.addEventListener('click', (e) => {
    if (isOpen() && !root.contains(e.target)) closeMenu({ returnFocus: false });
  });
});

// Badge / Tag (issue #34): the outline variant's aria-pressed is a real toggle, satisfying the
// spec's "可點擊篩選器應使用...選取狀態" interaction requirement — its appearance does not change
// on toggle because the SVG never drew a distinct selected/pressed outline look (see styles.css's
// own note; same "undrawn state, not invented" treatment already applied to Button's pressed/
// loading). The removable variant's remove control deletes its own tag from the DOM — a real,
// observably-different result, not a visual-only fade (no removal animation exists in the SVG to
// justify one).
document.querySelectorAll('[data-tag-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });
});
// PR #46 review (opus): removing a tag while its own remove button has keyboard focus must not
// let focus fall back to <body> — the same "focus must land somewhere deliberate, not wherever
// the browser defaults to" requirement batch 4's Popover already established for its own
// close/light-dismiss paths (works/html/batch4/prototype.js: "focus always returns to whichever
// control opened it"). There is no single invoker to return to here (the control that had focus
// is the one being removed), so focus instead moves to the next remaining remove control in the
// same group, then the previous one, then the group container itself as a last resort — the
// group container carries tabindex="-1" in index.html precisely so it can receive focus
// programmatically without ever entering the Tab order on its own.
document.querySelectorAll('[data-tag-remove]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tag = btn.closest('.tag');
    const group = tag?.parentElement;
    const removesInGroup = group ? [...group.querySelectorAll('[data-tag-remove]')] : [];
    const myIndex = removesInGroup.indexOf(btn);
    tag?.remove();
    const next = removesInGroup[myIndex + 1] || removesInGroup[myIndex - 1];
    if (next && next.isConnected) next.focus();
    else group?.focus();
  });
});

// Inline alert (issue #35): the SVG only ever drew a dismiss button on the info variant, so only
// that example gets one — clicking it removes the whole alert from the DOM (a real, observably
// different result, same "no removal animation exists in the SVG to justify one" reasoning
// already applied to Badge/Tag's remove button). Same focus-must-land-somewhere-deliberate
// requirement as Badge/Tag's remove control and batch 4 Popover's close/light-dismiss paths: this
// batch only ever demonstrates one dismissible alert at a time, so there is no "next dismiss
// button" to fall back to — focus always moves straight to the group container, which carries
// tabindex="-1" in index.html precisely so it can receive focus programmatically without ever
// entering the Tab order on its own.
document.querySelectorAll('[data-alert-dismiss]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const alert = btn.closest('.inline-alert');
    const group = alert?.parentElement;
    alert?.remove();
    group?.focus();
  });
});

// Select / Combobox (issue #36): a real <button aria-haspopup="listbox"> trigger with a real
// role="listbox"/role="option" panel and roving tabindex — the same real-ARIA-widget approach
// already established for Split button's menu, not a styled native <select>. Only closed/open/
// disabled/combobox-with-filtering are implemented; hover item and a dedicated keyboard-focus-item
// visual were both explicitly left undrawn by docs/design-system-v0.1-draft.md ("hover item、
// keyboard focus...尚未畫出"), so no extra class is toggled for them — options rely only on the
// same global :focus-visible ring every other component in this file already uses.
document.querySelectorAll('[data-select]').forEach((root) => {
  const trigger = root.querySelector('[data-select-trigger]');
  const valueEl = root.querySelector('[data-select-value]');
  const menu = root.querySelector('[data-select-menu]');
  const options = [...menu.querySelectorAll('[role="option"]')];

  const enabled = (opt) => opt.getAttribute('aria-disabled') !== 'true';
  const isOpen = () => !menu.hidden;

  function focusOption(opt) {
    options.forEach((o) => { o.tabIndex = o === opt ? 0 : -1; });
    opt.focus();
  }

  function openMenu() {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    const current = options.find((o) => o.getAttribute('aria-selected') === 'true') || options.find(enabled);
    if (current) focusOption(current);
  }

  function closeMenu({ returnFocus = true } = {}) {
    if (!isOpen()) return;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  }

  function selectOption(opt) {
    if (!enabled(opt)) return;
    options.forEach((o) => o.removeAttribute('aria-selected'));
    opt.setAttribute('aria-selected', 'true');
    valueEl.textContent = opt.textContent.trim();
    closeMenu();
  }

  trigger.addEventListener('click', () => { if (isOpen()) closeMenu(); else openMenu(); });
  trigger.addEventListener('keydown', (e) => {
    if (isOpen()) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMenu(); }
  });

  options.forEach((opt, i) => {
    opt.addEventListener('click', () => selectOption(opt));
    opt.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        for (let n = 1; n <= options.length; n += 1) {
          const next = options[(i + n) % options.length];
          if (enabled(next)) { focusOption(next); break; }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        for (let n = 1; n <= options.length; n += 1) {
          const prev = options[(i - n + options.length) % options.length];
          if (enabled(prev)) { focusOption(prev); break; }
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectOption(opt);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      } else if (e.key === 'Tab') {
        closeMenu({ returnFocus: false });
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (isOpen() && !root.contains(e.target)) closeMenu({ returnFocus: false });
  });
});

// Combobox variant of Select (issue #36): a real role="combobox" <input> plus a role="listbox"
// panel. Filtering narrows options by substring match against each option's plain-text label
// (data-label) and re-highlights the matched substring with .select__match — the SVG only shows
// the after-filtering result, so the exact matching algorithm (substring position, re-highlight on
// every keystroke) is a necessary behavioural extension to make the drawn screenshot actually
// interactive, not a new visual (see index.html's scope note). Per docs/design-system-v0.1-draft.md
// the listbox stays in normal document flow here (not position:absolute like plain Select's), so
// the :focus-within contained focus ring in styles.css can grow to wrap both the field and the
// listbox as one shape (Material Design 3 SearchView "contained style").
document.querySelectorAll('[data-combobox]').forEach((root) => {
  const input = root.querySelector('[data-combobox-input]');
  const menu = root.querySelector('[data-combobox-menu]');
  const options = [...menu.querySelectorAll('[role="option"]')];
  // Selecting an option calls input.focus() to return focus there — which synchronously fires the
  // 'focus' listener below and would otherwise immediately reopen the menu, since the just-written
  // value still matches the option that produced it. This flag suppresses exactly that one
  // synchronous reopen, without touching the normal "refocusing a filled field reopens its
  // suggestions" behaviour the listener exists for.
  let suppressAutoOpen = false;

  const visible = (opt) => !opt.hidden;
  const isOpen = () => !menu.hidden;

  function renderMatch(opt, query) {
    const label = opt.dataset.label;
    if (!query) { opt.textContent = label; opt.hidden = false; return; }
    const idx = label.indexOf(query);
    if (idx === -1) { opt.hidden = true; return; }
    opt.hidden = false;
    opt.textContent = '';
    if (idx > 0) opt.append(label.slice(0, idx));
    const mark = document.createElement('span');
    mark.className = 'select__match';
    mark.textContent = label.slice(idx, idx + query.length);
    opt.append(mark);
    if (idx + query.length < label.length) opt.append(label.slice(idx + query.length));
  }

  function openMenu() {
    menu.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function closeMenu({ returnFocus = false } = {}) {
    if (!isOpen()) return;
    menu.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    options.forEach((o) => { o.tabIndex = -1; });
    if (returnFocus) input.focus();
  }

  function filter() {
    const query = input.value.trim();
    options.forEach((opt) => renderMatch(opt, query));
    if (options.some(visible)) openMenu(); else closeMenu();
  }

  function selectOption(opt) {
    input.value = opt.dataset.label;
    suppressAutoOpen = true;
    closeMenu({ returnFocus: true });
    suppressAutoOpen = false;
  }

  input.addEventListener('input', filter);
  input.addEventListener('focus', () => { if (!suppressAutoOpen && input.value.trim()) filter(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen()) filter();
      const first = options.find(visible);
      if (first) { options.forEach((o) => { o.tabIndex = o === first ? 0 : -1; }); first.focus(); }
    } else if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      closeMenu({ returnFocus: true });
    }
  });

  options.forEach((opt) => {
    opt.addEventListener('click', () => selectOption(opt));
    opt.addEventListener('keydown', (e) => {
      const vis = options.filter(visible);
      const i = vis.indexOf(opt);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = vis[(i + 1) % vis.length];
        options.forEach((o) => { o.tabIndex = -1; });
        next.tabIndex = 0; next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (i === 0) { input.focus(); return; }
        const prev = vis[i - 1];
        options.forEach((o) => { o.tabIndex = -1; });
        prev.tabIndex = 0; prev.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectOption(opt);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu({ returnFocus: true });
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (isOpen() && !root.contains(e.target)) closeMenu();
  });
});
