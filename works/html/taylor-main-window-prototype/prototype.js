// PROTOTYPE — throwaway. Plan: three variants of the Taylor main-window shell (title bar +
// sidebar + Kanban board), switchable via ?variant=A|B|C. Board content is shared/generated,
// not persisted — state (which cards are "pending") resets on reload.
const VARIANTS = {
  A: { label: 'A — 傳統版面', title: '展開側欄 + 工具列 + 看板' },
  B: { label: 'B — 內容優先', title: '收合側欄，操作併入標題列' },
  C: { label: 'C — 提問感知外殼', title: '整個應用層級顯示待回覆任務' },
};

// Column names/scope per user feedback (2026-07-27): matches how the task board is actually
// meant to work — 排程任務 covers scheduling (the board itself handles that, so no separate
// "scheduled tasks" nav destination is needed), not a generic to-do/in-progress/review Kanban.
const BOARD_COLUMNS = [
  { key: 'scheduled', title: '排程任務', showAdd: true, cards: [
    { title: '補齊 Kanban 空狀態文案', tags: ['文案'] },
    { title: '調整側欄捲動行為', tags: ['QA'] },
  ] },
  { key: 'in-progress', title: '進行中任務', cards: [
    { title: '重新設計登入頁', status: 'done', tags: ['前端'], pendingId: 'p1', pendingQuestion: '登入頁的錯誤訊息文案要走既有 Inline alert 樣式嗎？' },
    { title: 'auth.go 重構', tags: ['後端'], pendingId: 'p2', pendingQuestion: '兩個呼叫端的逾時設定該統一成 30 秒嗎？' },
    { title: '補齊無障礙檢查', tags: ['QA'] },
    { title: 'API 回應格式待確認', status: 'blocked', tags: ['已阻擋'] },
  ] },
  { key: 'completed', title: '已完成任務', cards: [] },
];

function renderBoard(container) {
  container.innerHTML = BOARD_COLUMNS.map((col) => `
    <section class="kanban-column" aria-labelledby="col-${col.key}-title">
      <header>
        <h3 id="col-${col.key}-title">${col.title}</h3>
        ${col.showAdd ? '<button type="button" class="kanban-column__add" aria-label="新增排程任務">＋</button>' : `<span class="count-badge">${col.cards.length}</span>`}
      </header>
      <div class="kanban-content">
        ${col.cards.length ? col.cards.map((card) => `
          <article class="task-card${card.status === 'blocked' ? ' task-card--blocked' : ''}" ${card.pendingId ? `data-task-card="${card.pendingId}"` : ''}>
            <span class="task-status${card.status === 'done' ? ' task-status--done' : ''}" aria-hidden="true"></span>
            <strong>${card.title}</strong>
            ${card.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
            ${card.pendingId ? `<span class="task-card__pending" data-pending-badge="${card.pendingId}" hidden>❓</span>` : ''}
          </article>
        `).join('') : `<p class="kanban-column__empty">尚無${col.title}</p>`}
      </div>
    </section>
  `).join('');
}

const PENDING_CARDS = BOARD_COLUMNS.flatMap((c) => c.cards).filter((c) => c.pendingId);

const mount = document.getElementById('variant-mount');
const label = document.querySelector('[data-proto-label]');
const titlebarCenter = document.querySelector('[data-titlebar-center]');
const demoTrigger = document.querySelector('[data-demo-trigger]');

const params = new URLSearchParams(location.search);
let current = params.get('variant');
if (!VARIANTS[current]) current = 'A';

function setUrl(key) {
  const url = new URL(location.href);
  url.searchParams.set('variant', key);
  history.replaceState(null, '', url);
}

function render(key) {
  current = key;
  label.textContent = VARIANTS[key].label;
  label.title = VARIANTS[key].title;
  setUrl(key);
  mount.innerHTML = '';
  const tpl = document.getElementById(`tpl-variant-${key.toLowerCase()}`);
  mount.appendChild(tpl.content.cloneNode(true));
  mount.querySelectorAll('[data-kanban-board]').forEach(renderBoard);

  titlebarCenter.innerHTML = '';
  demoTrigger.hidden = key !== 'C';

  if (key === 'C') {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'attention-pill';
    pill.hidden = true;
    pill.dataset.attentionPill = '';
    titlebarCenter.appendChild(pill);
    wireVariantC();
  }
}

function wireVariantC() {
  const pill = document.querySelector('[data-attention-pill]');
  const navPending = document.querySelector('[data-nav-pending]');
  const railList = document.querySelector('[data-attention-list]');
  const railEmpty = document.querySelector('[data-attention-empty]');
  let pending = new Set();

  function renderRail() {
    const remaining = PENDING_CARDS.filter((c) => pending.has(c.pendingId));
    railList.innerHTML = remaining.map((c) => `
      <li><button type="button" class="attention-rail__item" data-resolve="${c.pendingId}">
        <span class="attention-rail__dot" aria-hidden="true"></span>${c.pendingQuestion}
      </button></li>
    `).join('');
    railEmpty.hidden = remaining.length > 0;
    railList.querySelectorAll('[data-resolve]').forEach((btn) => {
      btn.addEventListener('click', () => resolveOne(btn.dataset.resolve));
    });
    const count = remaining.length;
    pill.hidden = count === 0;
    pill.textContent = `${count} 個任務需要你回覆`;
    navPending.hidden = count === 0;
    navPending.textContent = String(count);
  }

  function resolveOne(id) {
    pending.delete(id);
    const badge = document.querySelector(`[data-pending-badge="${id}"]`);
    if (badge) badge.hidden = true;
    renderRail();
  }

  pill.addEventListener('click', () => {
    // Jump to the first still-pending card as a quick way to act on the app-wide signal.
    const first = PENDING_CARDS.find((c) => pending.has(c.pendingId));
    if (!first) return;
    document.querySelector(`[data-task-card="${first.pendingId}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  demoTrigger.onclick = () => {
    pending = new Set(PENDING_CARDS.map((c) => c.pendingId));
    PENDING_CARDS.forEach((c) => {
      const badge = document.querySelector(`[data-pending-badge="${c.pendingId}"]`);
      if (badge) badge.hidden = false;
    });
    renderRail();
  };

  renderRail();
}

// --- Floating switcher: click + keyboard, skipped while typing in a field ---
const keys = Object.keys(VARIANTS);
function cycle(delta) {
  const idx = keys.indexOf(current);
  render(keys[(idx + delta + keys.length) % keys.length]);
}
document.querySelector('[data-proto-prev]').addEventListener('click', () => cycle(-1));
document.querySelector('[data-proto-next]').addEventListener('click', () => cycle(1));
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
  if (e.key === 'ArrowLeft') cycle(-1);
  if (e.key === 'ArrowRight') cycle(1);
});

render(current);
