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

// Data table pagination — demo control state only, no real paginated dataset behind it.
(() => {
  const label = document.querySelector('[data-pagination-label]');
  const prevBtn = document.querySelector('[data-pagination="prev"]');
  const nextBtn = document.querySelector('[data-pagination="next"]');
  const totalPages = 3;
  let page = 1;
  const render = () => {
    label.textContent = `第 ${page} 頁，共 ${totalPages} 頁`;
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === totalPages;
  };
  prevBtn.addEventListener('click', () => { page = Math.max(1, page - 1); render(); });
  nextBtn.addEventListener('click', () => { page = Math.min(totalPages, page + 1); render(); });
})();

// Sidebar resizing — pointer drag on the handle, plus ArrowLeft/ArrowRight for keyboard.
all('[data-sidebar-resize-handle]').forEach((handle) => {
  const sidebar = handle.closest('[data-sidebar-resizable]');
  const root = getComputedStyle(document.documentElement);
  const min = parseFloat(root.getPropertyValue('--everline-component-sidebar-width-collapsed'));
  const max = parseFloat(root.getPropertyValue('--everline-component-sidebar-width-max'));
  let startX = 0;
  let startWidth = 0;
  const clamp = (value) => Math.min(max, Math.max(min, value));
  const onMove = (event) => { sidebar.style.width = `${clamp(startWidth + (event.clientX - startX))}px`; };
  const onUp = () => {
    handle.classList.remove('is-resizing');
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
  };
  handle.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    startWidth = sidebar.getBoundingClientRect().width;
    handle.classList.add('is-resizing');
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
  handle.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const current = sidebar.getBoundingClientRect().width;
    sidebar.style.width = `${clamp(current + (event.key === 'ArrowRight' ? 8 : -8))}px`;
  });
});

// Kanban: drag a Task card between columns; drag-over shows a drop-position indicator;
// a column at its data-kanban-max capacity rejects the drop instead of accepting it.
(() => {
  let dragged = null;

  const updateCount = (column) => {
    const content = column.querySelector('[data-kanban-content]');
    const badge = column.querySelector('[data-kanban-count]');
    const max = column.dataset.kanbanMax;
    const count = all('.task-card', content).length;
    badge.textContent = max ? `${count}/${max}` : String(count);
    badge.classList.toggle('count-badge--limit', Boolean(max) && count >= Number(max));
    if (count === 0 && !content.querySelector('.empty-state')) {
      content.innerHTML = '<div class="empty-state"><span aria-hidden="true">＋</span><p>目前沒有任務</p></div>';
    }
  };

  all('[data-kanban-content] .task-card[draggable="true"]').forEach((card) => {
    card.addEventListener('dragstart', (event) => {
      dragged = card;
      card.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', '');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
      dragged = null;
      all('.kanban-column').forEach((column) => column.classList.remove('is-drag-over'));
      all('.drop-indicator').forEach((indicator) => indicator.remove());
    });
  });

  all('[data-kanban-content]').forEach((content) => {
    const column = content.closest('.kanban-column');
    content.addEventListener('dragover', (event) => {
      if (!dragged) return;
      event.preventDefault();
      const max = column.dataset.kanbanMax;
      const otherCards = all('.task-card', content).filter((card) => card !== dragged);
      if (max && otherCards.length >= Number(max)) { event.dataTransfer.dropEffect = 'none'; return; }
      event.dataTransfer.dropEffect = 'move';
      column.classList.add('is-drag-over');
      let indicator = content.querySelector('.drop-indicator');
      if (!indicator) { indicator = document.createElement('div'); indicator.className = 'drop-indicator'; }
      const after = otherCards.find((card) => event.clientY < card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2);
      content.insertBefore(indicator, after || null);
    });
    content.addEventListener('dragleave', (event) => {
      if (content.contains(event.relatedTarget)) return;
      column.classList.remove('is-drag-over');
      const indicator = content.querySelector('.drop-indicator');
      if (indicator) indicator.remove();
    });
    content.addEventListener('drop', (event) => {
      event.preventDefault();
      if (!dragged) return;
      const max = column.dataset.kanbanMax;
      const otherCards = all('.task-card', content).filter((card) => card !== dragged);
      const indicator = content.querySelector('.drop-indicator');
      column.classList.remove('is-drag-over');
      if (max && otherCards.length >= Number(max)) { if (indicator) indicator.remove(); return; }
      const sourceColumn = dragged.closest('.kanban-column');
      const emptyState = content.querySelector('.empty-state');
      if (emptyState) emptyState.remove();
      if (indicator) { content.insertBefore(dragged, indicator); indicator.remove(); }
      else { content.appendChild(dragged); }
      updateCount(column);
      if (sourceColumn && sourceColumn !== column) updateCount(sourceColumn);
    });
  });
})();
