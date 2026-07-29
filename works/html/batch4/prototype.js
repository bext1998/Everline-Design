/* Everline batch 4 candidate prototype — framework-neutral, no dependencies.
   Behaviour only. Every visual value lives in styles.css as an --everline-* custom property. */

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const readPx = (name) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));

/* =========================================================================
   Slider
   Single value uses one native <input type="range">; the range variant uses TWO of them, each
   with its own accessible name, so both endpoints are independently keyboard-operable. The
   browser therefore owns arrow keys, PageUp/PageDown, Home/End, step, min/max and disabled —
   this file only keeps the visual fill in sync and enforces lower <= upper.
   ========================================================================= */
document.querySelectorAll('[data-slider]').forEach((slider) => {
  const fill = slider.querySelector('[data-slider-fill]');
  const output = slider.parentElement.querySelector('[data-slider-output]');
  const valueLabel = slider.querySelector('[data-slider-value-label]');
  const markers = slider.querySelector('[data-slider-markers]');
  const isRange = slider.hasAttribute('data-slider-range');
  const lower = slider.querySelector('[data-slider-lower]');
  const upper = slider.querySelector('[data-slider-upper]');
  const single = slider.querySelector('[data-slider-single]');
  const inputs = isRange ? [lower, upper] : [single];
  const ref = inputs[0];
  const min = Number(ref.min);
  const max = Number(ref.max);
  const pct = (value) => ((Number(value) - min) / (max - min)) * 100;

  // Step markers are generated from min/max/step, so the number of dots can never disagree with
  // the control's actual number of stops — the SVG had to be checked by hand for this.
  if (markers) {
    const step = Number(ref.step) || 1;
    const count = Math.floor((max - min) / step) + 1;
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'slider__marker';
      dot.style.left = `${pct(min + i * step)}%`;
      markers.append(dot);
    }
  }

  const sync = () => {
    if (isRange) {
      // Enforce the invariant on the values themselves, not just visually.
      if (Number(lower.value) > Number(upper.value)) {
        if (document.activeElement === lower) lower.value = upper.value;
        else upper.value = lower.value;
      }
      slider.style.setProperty('--slider-lower', pct(lower.value));
      slider.style.setProperty('--slider-upper', pct(upper.value));
      if (output) output.textContent = `${lower.value} – ${upper.value}`;
    } else {
      slider.style.setProperty('--slider-lower', 0);
      slider.style.setProperty('--slider-upper', pct(single.value));
      if (output) output.textContent = single.value;
      if (valueLabel) valueLabel.textContent = single.value;
    }
  };

  inputs.forEach((input) => input.addEventListener('input', sync));
  sync();
});

/* =========================================================================
   Accordion
   Semantic heading > <button> trigger, associated with its panel through aria-expanded /
   aria-controls. Enter and Space come free with a real <button>; focus stays on the trigger,
   including when single-open mode collapses a sibling.
   ========================================================================= */
document.querySelectorAll('[data-accordion]').forEach((accordion) => {
  const mode = accordion.dataset.accordion; // "single" | "multi" — behaviour only, no visual difference
  const triggers = [...accordion.querySelectorAll('.accordion__trigger')];
  const setExpanded = (trigger, expanded) => {
    trigger.setAttribute('aria-expanded', String(expanded));
    document.getElementById(trigger.getAttribute('aria-controls')).hidden = !expanded;
  };
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const next = trigger.getAttribute('aria-expanded') !== 'true';
      if (mode === 'single' && next) {
        triggers.forEach((other) => { if (other !== trigger) setExpanded(other, false); });
      }
      setExpanded(trigger, next);
    });
  });
});

/* =========================================================================
   Popover
   The close contract (Esc, click outside / light-dismiss, re-clicking the trigger, and focus
   returning to the invoker) is the browser's own popover="auto" implementation, not hand-rolled
   listeners. popover="auto" is non-modal by definition: no backdrop, no focus trap.
   Only placement — including flip and shift against the viewport — is done here.
   ========================================================================= */
const popoverAnchors = new WeakMap();

function placePopover(panel) {
  const anchor = popoverAnchors.get(panel);
  if (!anchor) return;
  const gap = readPx('--everline-component-popover-anchor-gap') + readPx('--everline-component-popover-arrow-height');
  const arrowSize = readPx('--everline-component-popover-arrow-size');
  const radius = readPx('--everline-component-popover-radius');
  const edge = readPx('--everline-space-1'); // keep this far away from the viewport edge

  const a = anchor.getBoundingClientRect();
  const p = panel.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const preferred = panel.dataset.placement || 'bottom';
  const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  const fits = {
    top: a.top - gap - p.height >= edge,
    bottom: a.bottom + gap + p.height <= vh - edge,
    left: a.left - gap - p.width >= edge,
    right: a.right + gap + p.width <= vw - edge,
  };
  // Room available on each side, used both to flip and to break the tie when NEITHER side fits
  // (a tall panel with the trigger near the middle of a short viewport). Falling back to the
  // preferred side in that case would push the panel off-screen with no way to reach its content.
  const room = {
    top: a.top - gap - edge,
    bottom: vh - a.bottom - gap - edge,
    left: a.left - gap - edge,
    right: vw - a.right - gap - edge,
  };
  const other = opposite[preferred];
  let placement = preferred;
  if (!fits[preferred]) placement = fits[other] || room[other] > room[preferred] ? other : preferred;

  let left;
  let top;
  if (placement === 'top' || placement === 'bottom') {
    left = clamp(a.left + a.width / 2 - p.width / 2, edge, Math.max(edge, vw - edge - p.width)); // shift
    top = placement === 'top' ? a.top - gap - p.height : a.bottom + gap;
    // Containment wins over the exact anchor gap when the panel is simply taller than the space
    // either side of the trigger; the arrow below is clamped so it still points as close to the
    // trigger as the panel's own rounded corners allow.
    top = clamp(top, edge, Math.max(edge, vh - edge - p.height));
  } else {
    top = clamp(a.top + a.height / 2 - p.height / 2, edge, Math.max(edge, vh - edge - p.height)); // shift
    left = placement === 'left' ? a.left - gap - p.width : a.right + gap;
    left = clamp(left, edge, Math.max(edge, vw - edge - p.width));
  }
  panel.dataset.resolvedPlacement = placement;
  panel.style.left = `${Math.round(left)}px`;
  panel.style.top = `${Math.round(top)}px`;

  // The arrow keeps pointing at the trigger's centre even after a shift, but never intrudes
  // into the panel's rounded corners.
  const arrow = panel.querySelector('[data-popover-arrow]');
  if (!arrow) return;
  if (placement === 'top' || placement === 'bottom') {
    const centre = a.left + a.width / 2 - left;
    arrow.style.left = `${clamp(centre - arrowSize / 2, radius, p.width - radius - arrowSize)}px`;
    arrow.style.top = '';
  } else {
    const centre = a.top + a.height / 2 - top;
    arrow.style.top = `${clamp(centre - arrowSize / 2, radius, p.height - radius - arrowSize)}px`;
    arrow.style.left = '';
  }
}

const openPopovers = new Set();
document.querySelectorAll('[data-popover]').forEach((panel) => {
  const anchor = document.querySelector(`[data-popover-trigger="${panel.id}"]`)
    || panel.closest('.datepicker')?.querySelector('.datepicker__trigger');
  if (anchor) popoverAnchors.set(panel, anchor);

  // Measure only once the panel is actually displayed; keep it invisible until placed so it
  // never flashes at the pre-positioning location.
  panel.addEventListener('beforetoggle', (event) => {
    if (event.newState === 'open') panel.style.visibility = 'hidden';
  });
  panel.addEventListener('toggle', (event) => {
    if (event.newState === 'open') {
      placePopover(panel);
      panel.style.visibility = '';
      openPopovers.add(panel);
    } else {
      openPopovers.delete(panel);
    }
  });
});
const reposition = () => openPopovers.forEach(placePopover);
addEventListener('resize', reposition);
addEventListener('scroll', reposition, true);

/* =========================================================================
   Date / Time picker
   Composes the Popover above with the existing Text input + Icon button. The calendar is a
   role="grid" with roving tabindex.
   The date field is deliberately readonly: free typing needs an invalid-input visual, and that
   visual was explicitly deferred at the SVG review, so this prototype does not invent one.
   ========================================================================= */
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const sameDay = (a, b) => a && b && a.getTime() === b.getTime();
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// Clamp to the target month's last day. new Date(y, m + n, day) silently rolls over when the
// target month is shorter than the current one, so PageDown on 8/31 would land on 10/1 rather
// than 9/30 — skipping September entirely.
const addMonths = (d, n) => {
  const month = d.getMonth() + n;
  const lastDay = new Date(d.getFullYear(), month + 1, 0).getDate();
  return new Date(d.getFullYear(), month, Math.min(d.getDate(), lastDay));
};
const fmtFull = (d) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
const fmtShort = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

document.querySelectorAll('[data-datepicker]').forEach((root) => {
  const field = root.querySelector('[data-datepicker-field]');
  const button = root.querySelector('[data-datepicker-button]');
  const panel = root.querySelector('[data-datepicker-panel]');
  const mode = root.dataset.mode;
  const today = root.dataset.today ? parseISO(root.dataset.today) : new Date();
  const unavailable = new Set((root.dataset.unavailable || '').split(',').filter(Boolean));

  const initial = root.dataset.value || '';
  const committed = { start: null, end: null, time: root.dataset.time || '' };
  if (mode === 'range' && initial.includes('/')) {
    const [s, e] = initial.split('/');
    committed.start = parseISO(s);
    committed.end = e ? parseISO(e) : null;
  } else if (initial) {
    committed.start = parseISO(initial);
  }

  // The trigger's text is derived from the same state the calendar renders, so the two can never
  // disagree — the SVG needed this checked by eye.
  const renderField = (state) => {
    if (!state.start) { field.value = ''; return; }
    if (mode !== 'range') { field.value = fmtFull(state.start); return; }
    if (!state.end) { field.value = `${fmtShort(state.start)} – 選擇結束日`; return; }
    const sameYear = state.start.getFullYear() === state.end.getFullYear();
    field.value = sameYear
      ? `${fmtShort(state.start)} – ${fmtShort(state.end)}`
      : `${fmtFull(state.start)} – ${fmtFull(state.end)}`;
  };
  renderField(committed);
  if (!panel) return; // disabled example has no panel

  const timeInput = panel.querySelector('[data-datepicker-time]');
  const applyBtn = panel.querySelector('[data-datepicker-apply]');
  const cancelBtn = panel.querySelector('[data-datepicker-cancel]');
  const calendar = panel.querySelector('[data-calendar]');
  timeInput.value = committed.time;

  let draft = { ...committed };
  let view = new Date((draft.start || today).getFullYear(), (draft.start || today).getMonth(), 1);
  let focusDate = draft.start || today;

  const isUnavailable = (d) => unavailable.has(iso(d));
  const inRange = (d) => draft.start && draft.end && d > draft.start && d < draft.end;
  const isEndpoint = (d) => sameDay(d, draft.start) || sameDay(d, draft.end);

  const render = () => {
    calendar.replaceChildren();

    const header = document.createElement('div');
    header.className = 'calendar__header';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'calendar__nav';
    prev.setAttribute('aria-label', '上一個月');
    prev.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>';
    const next = prev.cloneNode(true);
    next.setAttribute('aria-label', '下一個月');
    next.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>';
    const label = document.createElement('p');
    label.className = 'calendar__month';
    label.id = `${field.id}-month`;
    label.setAttribute('aria-live', 'polite');
    label.textContent = `${view.getFullYear()} 年 ${view.getMonth() + 1} 月`;
    prev.addEventListener('click', () => { view = addMonths(view, -1); render(); });
    next.addEventListener('click', () => { view = addMonths(view, 1); render(); });
    header.append(prev, label, next);

    const grid = document.createElement('div');
    grid.className = 'calendar__grid';
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-labelledby', label.id);

    const headRow = document.createElement('div');
    headRow.className = 'calendar__row';
    headRow.setAttribute('role', 'row');
    WEEKDAYS.forEach((w) => {
      const cell = document.createElement('span');
      cell.className = 'calendar__weekday';
      cell.setAttribute('role', 'columnheader');
      cell.setAttribute('aria-label', `星期${w}`);
      cell.textContent = w;
      headRow.append(cell);
    });
    grid.append(headRow);

    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const gridStart = addDays(first, -first.getDay());
    for (let week = 0; week < 6; week += 1) {
      const row = document.createElement('div');
      row.className = 'calendar__row';
      row.setAttribute('role', 'row');
      for (let dow = 0; dow < 7; dow += 1) {
        const date = addDays(gridStart, week * 7 + dow);
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'calendar__day';
        cell.setAttribute('role', 'gridcell');
        cell.dataset.date = iso(date);
        cell.innerHTML = `<span>${date.getDate()}</span>`;
        const outside = date.getMonth() !== view.getMonth();
        if (outside) cell.classList.add('calendar__day--outside');
        if (sameDay(date, today)) cell.classList.add('calendar__day--today');
        if (isUnavailable(date)) {
          cell.classList.add('calendar__day--unavailable');
          // aria-disabled, not the disabled attribute: a disabled button can't take focus, which
          // would break roving-tabindex navigation across the grid.
          cell.setAttribute('aria-disabled', 'true');
        }
        const selected = mode === 'range' ? isEndpoint(date) : sameDay(date, draft.start);
        cell.classList.toggle('calendar__day--selected', Boolean(selected));
        cell.setAttribute('aria-selected', String(Boolean(selected || (mode === 'range' && inRange(date)))));
        if (mode === 'range' && inRange(date)) cell.classList.add('calendar__day--in-range');
        cell.tabIndex = sameDay(date, focusDate) ? 0 : -1;
        cell.setAttribute('aria-label', `${fmtFull(date)}${isUnavailable(date) ? '（不可選）' : ''}`);
        row.append(cell);
      }
      grid.append(row);
    }
    calendar.append(header, grid);
    updateApply();
  };

  const updateApply = () => {
    applyBtn.disabled = mode === 'range' ? !(draft.start && draft.end) : !draft.start;
  };

  const focusCell = (date) => {
    focusDate = date;
    if (date.getMonth() !== view.getMonth() || date.getFullYear() !== view.getFullYear()) {
      view = new Date(date.getFullYear(), date.getMonth(), 1);
    }
    render();
    calendar.querySelector(`[data-date="${iso(date)}"]`)?.focus();
  };

  const select = (date) => {
    if (isUnavailable(date)) return;
    if (mode === 'range') {
      if (!draft.start || (draft.start && draft.end)) draft = { ...draft, start: date, end: null };
      else if (date < draft.start) draft = { ...draft, start: date, end: draft.start };
      else draft = { ...draft, end: date };
    } else {
      draft = { ...draft, start: date };
    }
    focusDate = date;
    render();
    calendar.querySelector(`[data-date="${iso(date)}"]`)?.focus();
  };

  calendar.addEventListener('click', (event) => {
    const cell = event.target.closest('.calendar__day');
    if (cell) select(parseISO(cell.dataset.date));
  });

  calendar.addEventListener('keydown', (event) => {
    const cell = event.target.closest('.calendar__day');
    if (!cell) return;
    const date = parseISO(cell.dataset.date);
    const moves = {
      ArrowLeft: () => addDays(date, -1),
      ArrowRight: () => addDays(date, 1),
      ArrowUp: () => addDays(date, -7),
      ArrowDown: () => addDays(date, 7),
      Home: () => addDays(date, -date.getDay()),
      End: () => addDays(date, 6 - date.getDay()),
      PageUp: () => addMonths(date, -1),
      PageDown: () => addMonths(date, 1),
    };
    if (moves[event.key]) {
      event.preventDefault();
      focusCell(moves[event.key]());
    }
    // Enter / Space are handled natively by the <button>'s click event.
  });

  // Either the field or the calendar button can open the panel, so focus has to return to
  // whichever one actually did — always sending it to the button would silently move the user
  // somewhere they never were.
  let invoker = button;
  const open = (event) => {
    invoker = event && event.currentTarget ? event.currentTarget : button;
    draft = { ...committed };
    view = new Date((draft.start || today).getFullYear(), (draft.start || today).getMonth(), 1);
    focusDate = draft.start || today;
    render();
    panel.showPopover();
  };
  field.addEventListener('click', open);
  button.addEventListener('click', open);

  panel.addEventListener('toggle', (event) => {
    if (event.newState === 'open') {
      // A calendar is interactive content, so focus moves in — unlike the plain-text popover
      // above, which deliberately leaves focus on its trigger.
      calendar.querySelector('[tabindex="0"]')?.focus();
    } else if (root.contains(document.activeElement) || document.activeElement === document.body) {
      invoker.focus(); // Esc / light-dismiss both land back on whichever control opened the panel
    }
  });

  cancelBtn.addEventListener('click', () => { panel.hidePopover(); });
  applyBtn.addEventListener('click', () => {
    committed.start = draft.start;
    committed.end = draft.end;
    committed.time = timeInput.value;
    renderField(committed);
    panel.hidePopover();
  });
});
