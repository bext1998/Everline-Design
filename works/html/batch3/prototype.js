// Determinate progress — demo control state only, no real long-running task behind it.
// Loops 0% -> 100% -> pause -> reset, so the CSS width transition is actually visible.
// The loop itself (not just the CSS transition) must respect prefers-reduced-motion: it's
// driven by setTimeout + JS attribute/width changes, which the styles.css reduced-motion
// override can't touch — a perpetual auto-demo would keep changing aria-valuenow forever
// regardless of that CSS rule, so the JS has to check the preference itself.
(() => {
  const bar = document.querySelector('[data-progress-demo]');
  const fill = document.querySelector('[data-progress-fill]');
  const percentLabel = document.querySelector('[data-progress-percent]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const setProgress = (value) => {
    fill.style.width = `${value}%`;
    bar.setAttribute('aria-valuenow', String(value));
    percentLabel.textContent = `${value}%`;
  };
  if (reduceMotion.matches) {
    setProgress(60); // static demo frame — no perpetual auto-loop under reduced motion
    return;
  }
  let value = 0;
  const step = () => {
    if (reduceMotion.matches) return; // preference changed mid-session — stop, don't schedule again
    value = value >= 100 ? 0 : value + 20;
    setProgress(value);
    setTimeout(step, value === 100 ? 1400 : value === 0 ? 700 : 750);
  };
  setProgress(0);
  setTimeout(step, 700);
})();

// Full-page loading demo — 取消 hides the overlay and reveals demo content;
// 重新示範 brings the overlay back so the loading state can be re-triggered.
(() => {
  const demo = document.querySelector('[data-loading-demo]');
  const overlay = demo.querySelector('[data-loading-overlay]');
  const content = demo.querySelector('[data-loading-content]');
  demo.querySelector('[data-loading-cancel]').addEventListener('click', () => {
    overlay.hidden = true;
    content.hidden = false;
  });
  demo.querySelector('[data-loading-replay]').addEventListener('click', () => {
    content.hidden = true;
    overlay.hidden = false;
  });
})();

// Error progress demo — 重試 replays a short upload attempt that climbs back up
// then fails again at the same point, so the error <-> in-progress transition is visible.
(() => {
  const progress = document.querySelector('[data-error-progress]');
  const fill = document.querySelector('[data-error-fill]');
  const label = document.querySelector('[data-error-label]');
  const retry = document.querySelector('[data-error-retry]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const FAIL_AT = 40;
  let intervalId = null;
  const setValue = (value) => {
    fill.style.width = `${value}%`;
    progress.setAttribute('aria-valuenow', String(value));
  };
  const fail = () => {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    setValue(FAIL_AT);
    progress.classList.add('progress--danger');
    label.classList.add('progress-label--danger');
    label.innerHTML = '<span class="error-icon" aria-hidden="true">!</span>上傳失敗';
    retry.disabled = false;
  };
  retry.addEventListener('click', () => {
    if (intervalId) return; // a retry is already in flight — ignore repeat clicks instead of stacking timers
    progress.classList.remove('progress--danger');
    label.classList.remove('progress-label--danger');
    label.textContent = '重新上傳中…';
    retry.disabled = true;
    if (reduceMotion.matches) { fail(); return; } // skip the climbing animation, jump straight to the outcome
    let value = 0;
    setValue(0);
    intervalId = setInterval(() => {
      value += 15;
      if (value >= 75) { fail(); return; }
      setValue(value);
    }, 350);
  });
})();

// Search field — clear button only exists as content, so its visibility (and the wrapper's
// wider trailing padding) is driven by the input's actual value, not a separate hand-toggled
// state. A disabled field never gets a clear button at all (see the disabled example markup),
// per the spec decision that a disabled field must not imply it's still interactive.
(() => {
  document.querySelectorAll('[data-search-input]').forEach((input) => {
    const wrapper = input.closest('.search-field');
    const clearButton = wrapper.querySelector('[data-search-clear]');
    const sync = () => {
      const hasValue = input.value.length > 0;
      clearButton.hidden = !hasValue;
      wrapper.classList.toggle('has-value', hasValue);
    };
    input.addEventListener('input', sync);
    clearButton.addEventListener('click', () => {
      input.value = '';
      // Dispatch a real bubbling 'input' event instead of calling sync() directly — setting
      // .value programmatically fires no native event, so any product-side live-filter logic
      // bound to 'input' would never rerun and the results would stay stale after clearing.
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
    sync();
  });
})();
