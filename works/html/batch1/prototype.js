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

// Menu / Context menu (issue #37): a real role="menu" panel of role="menuitem"/"menuitemcheckbox"
// <button>s with roving tabindex, opened by a real trigger — same pattern as Split button's menu.
// docs/design-system-v0.1-draft.md requires focus to return to the trigger when the menu closes
// ("關閉後焦點必須明確返回觸發元件，不可遺失"), so Escape/Enter/light-dismiss all do that — but
// Tab is the one established exception (same as Split button's own Tab handler): forcing focus
// back onto the trigger there would fight the browser's native Tab navigation and trap the user
// inside this control instead of letting them move on, and native Tab already lands on a real,
// deliberate next element rather than losing focus to <body>, which is what that requirement is
// actually guarding against.
document.querySelectorAll('[data-menu]').forEach((root) => {
  const trigger = root.querySelector('[data-menu-trigger]');
  const panel = root.querySelector('[data-menu-panel]');
  const items = [...panel.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"]')];
  const status = document.querySelector('[data-menu-status]');

  const enabled = (it) => !it.disabled;
  const isOpen = () => !panel.hidden;

  function focusItem(it) {
    items.forEach((o) => { o.tabIndex = o === it ? 0 : -1; });
    it.focus();
  }

  function openMenu() {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    const first = items.find(enabled);
    if (first) focusItem(first);
  }

  function closeMenu({ returnFocus = true } = {}) {
    if (!isOpen()) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  }

  function activate(it) {
    if (!enabled(it)) return;
    if (it.getAttribute('role') === 'menuitemcheckbox') {
      it.setAttribute('aria-checked', it.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    }
    if (status) status.dataset.lastAction = it.dataset.menuAction || it.textContent.trim();
    closeMenu();
  }

  trigger.addEventListener('click', () => { if (isOpen()) closeMenu(); else openMenu(); });
  trigger.addEventListener('keydown', (e) => {
    if (isOpen()) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMenu(); }
  });

  items.forEach((item, i) => {
    item.addEventListener('click', () => activate(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        for (let n = 1; n <= items.length; n += 1) {
          const next = items[(i + n) % items.length];
          if (enabled(next)) { focusItem(next); break; }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        for (let n = 1; n <= items.length; n += 1) {
          const prev = items[(i - n + items.length) % items.length];
          if (enabled(prev)) { focusItem(prev); break; }
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate(item);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      } else if (e.key === 'Tab') {
        closeMenu({ returnFocus: false });
      }
    });
  });

  // Light dismiss does NOT return focus to the trigger, same as Split button's own light-dismiss
  // handler: the user clicked somewhere else on purpose (often a real, focusable element), and
  // stealing focus back to the trigger would fight that click's own natural focus target instead
  // of just closing the now-irrelevant menu.
  document.addEventListener('click', (e) => {
    if (isOpen() && !root.contains(e.target)) closeMenu({ returnFocus: false });
  });
});
