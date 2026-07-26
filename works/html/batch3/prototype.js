// Determinate progress — demo control state only, no real long-running task behind it.
// Loops 0% -> 100% -> pause -> reset, so the CSS width transition is actually visible.
(() => {
  const bar = document.querySelector('[data-progress-demo]');
  const fill = document.querySelector('[data-progress-fill]');
  const percentLabel = document.querySelector('[data-progress-percent]');
  const setProgress = (value) => {
    fill.style.width = `${value}%`;
    bar.setAttribute('aria-valuenow', String(value));
    percentLabel.textContent = `${value}%`;
  };
  let value = 0;
  const step = () => {
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
  const FAIL_AT = 40;
  const setValue = (value) => {
    fill.style.width = `${value}%`;
    progress.setAttribute('aria-valuenow', String(value));
  };
  const fail = () => {
    setValue(FAIL_AT);
    progress.classList.add('progress--danger');
    label.classList.add('progress-label--danger');
    label.innerHTML = '<span class="error-icon" aria-hidden="true">!</span>上傳失敗';
  };
  retry.addEventListener('click', () => {
    progress.classList.remove('progress--danger');
    label.classList.remove('progress-label--danger');
    label.textContent = '重新上傳中…';
    let value = 0;
    setValue(0);
    const id = setInterval(() => {
      value += 15;
      if (value >= 75) {
        clearInterval(id);
        fail();
        return;
      }
      setValue(value);
    }, 350);
  });
})();
