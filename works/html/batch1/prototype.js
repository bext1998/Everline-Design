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
