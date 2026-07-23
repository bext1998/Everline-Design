const all = (selector, root = document) => [...root.querySelectorAll(selector)];

all('[data-toolbar]').forEach((toolbar) => {
  const buttons = all('button:not(:disabled)', toolbar);
  toolbar.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = buttons.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
  });
  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', 'false'));
    button.setAttribute('aria-pressed', 'true');
  }));
});

all('.content-card[type="button"], .task-card[type="button"]').forEach((card) => {
  card.addEventListener('click', () => card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true')));
});

all('.list-item input[type="checkbox"], tbody input[type="checkbox"]').forEach((input) => {
  const update = () => input.closest('.list-item, tr').classList.toggle('is-selected', input.checked);
  input.addEventListener('change', update); update();
});

document.querySelector('[data-sort]').addEventListener('click', (event) => {
  const header = event.currentTarget.closest('th');
  const ascending = header.getAttribute('aria-sort') !== 'ascending';
  header.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
  event.currentTarget.querySelector('span').textContent = ascending ? '↑' : '↓';
});
