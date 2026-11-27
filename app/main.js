// HomeLedger app shell: hash routing, the month picker, and every control on
// every page — add/edit/delete transactions, edit budget limits, manage savings
// goals, household settings, CSV export and reset. All state lives in data.js
// and is saved to localStorage on every change.
//
//   #/                dashboard
//   #/transactions    transactions (with ?type=&category=&q=&sort= filters)
//   #/budgets         monthly budgets per category
//   #/goals           savings goals
//   #/reports         reports and trends
//   #/settings        household settings and data
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { CATEGORIES, INCOME_CATEGORIES, loadState, saveState, resetState, fmt, monthLabel, availableMonths, newId, categoryById } from './data.js';
import { dashboard, transactionsPage, budgetsPage, goalsPage, reportsPage, settingsPage, missing, drawCategoryChart, drawTrendChart, escape } from './views.js';

const app = document.getElementById('app');
const monthSelect = document.getElementById('month-select');

let state = loadState();
let filters = { type: 'all', category: 'all', q: '', sort: 'date' };
let notice = '';

function fillMonthSelect() {
  const months = availableMonths(state);
  if (!months.includes(state.currentMonth)) months.unshift(state.currentMonth);
  monthSelect.innerHTML = months.map((m) => `<option value="${m}" ${m === state.currentMonth ? 'selected' : ''}>${monthLabel(m)}</option>`).join('');
}

function setNav(route) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === route);
  });
}

function render() {
  window.__shotReady = false;
  fillMonthSelect();
  const hash = location.hash || '#/';
  const [path, query] = hash.slice(2).split('?');
  const params = new URLSearchParams(query || '');
  if (path.startsWith('transactions')) {
    // Filters are fully derived from the URL on every render, so clearing a
    // filter in the toolbar can never leave a stale value behind.
    filters = {
      type: params.get('type') || 'all',
      category: params.get('category') || 'all',
      q: params.get('q') || '',
      sort: params.get('sort') || 'date',
    };
  }
  let html = '';
  let route = 'dashboard';
  if (path === '' || path === '/') { route = 'dashboard'; html = dashboard(state); document.title = 'HomeLedger — Household Budget Planner'; }
  else if (path === 'transactions') { route = 'transactions'; html = transactionsPage(state, filters); document.title = 'Transactions | HomeLedger'; }
  else if (path === 'budgets') { route = 'budgets'; html = budgetsPage(state); document.title = 'Budgets | HomeLedger'; }
  else if (path === 'goals') { route = 'goals'; html = goalsPage(state); document.title = 'Savings Goals | HomeLedger'; }
  else if (path === 'reports') { route = 'reports'; html = reportsPage(state); document.title = 'Reports | HomeLedger'; }
  else if (path === 'settings') { route = 'settings'; html = settingsPage(state); document.title = 'Settings | HomeLedger'; }
  else { html = missing(); document.title = 'Not found | HomeLedger'; }
  setNav(route);
  app.innerHTML = (notice ? `<div class="notice ok">${notice}</div>` : '') + html;
  notice = '';
  const catChart = document.getElementById('chart-categories');
  if (catChart) drawCategoryChart(catChart, state);
  const trendChart = document.getElementById('chart-trend');
  if (trendChart) drawTrendChart(trendChart, state);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

monthSelect.addEventListener('change', () => {
  state.currentMonth = monthSelect.value;
  saveState(state);
  render();
});

// ---------- modal helpers ----------
function openModal(html) {
  closeModal();
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.id = 'modal';
  wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  wrap.addEventListener('click', (e) => { if (e.target === wrap) closeModal(); });
  document.body.appendChild(wrap);
  const first = wrap.querySelector('input, select, textarea');
  if (first) first.focus();
}
function closeModal() {
  const m = document.getElementById('modal');
  if (m) m.remove();
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function field(label, id, inner, hint) {
  return `<div class="field"><label for="${id}">${label}</label>${inner}${hint ? `<div class="small muted">${hint}</div>` : ''}</div>`;
}

function txnForm(txn) {
  const isEdit = !!txn;
  const t = txn || { date: `${state.currentMonth}-26`, type: 'expense', category: 'groceries', description: '', amount: '' };
  const catOptions = (list) => list.map((c) => `<option value="${c.id}" ${t.category === c.id ? 'selected' : ''}>${escape(c.name)}</option>`).join('');
  openModal(`<h2>${isEdit ? 'Edit transaction' : 'Add transaction'}</h2>
  <form id="txn-form"><div class="form-grid">
  ${field('Type', 'txn-type', `<select id="txn-type"><option value="expense" ${t.type === 'expense' ? 'selected' : ''}>Expense</option><option value="income" ${t.type === 'income' ? 'selected' : ''}>Income</option></select>`)}
  ${field('Date', 'txn-date', `<input id="txn-date" type="date" value="${escape(t.date)}" required>`)}
  ${field('Category', 'txn-cat', `<select id="txn-cat" data-expense="${catOptions(CATEGORIES)}" data-income="${catOptions(INCOME_CATEGORIES)}">${t.type === 'income' ? catOptions(INCOME_CATEGORIES) : catOptions(CATEGORIES)}</select>`)}
  ${field('Amount ($)', 'txn-amount', `<input id="txn-amount" type="number" min="0.01" step="0.01" inputmode="decimal" value="${t.amount === '' ? '' : t.amount}" placeholder="0.00" required>`)}
  <div class="full">${field('Description', 'txn-desc', `<input id="txn-desc" type="text" value="${escape(t.description)}" maxlength="80" placeholder="e.g. Weekly shop — FreshMart" required>`)}</div>
  </div>
  <div class="row"><button type="submit">${isEdit ? 'Save changes' : 'Add transaction'}</button><button type="button" class="secondary" id="modal-cancel">Cancel</button></div>
  <input type="hidden" id="txn-id" value="${t.id || ''}"></form>`);
  const typeSel = document.getElementById('txn-type');
  const catSel = document.getElementById('txn-cat');
  typeSel.addEventListener('change', () => {
    catSel.innerHTML = typeSel.value === 'income' ? catSel.dataset.income : catSel.dataset.expense;
  });
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('txn-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Math.round(Number(document.getElementById('txn-amount').value) * 100) / 100;
    const description = document.getElementById('txn-desc').value.trim();
    const date = document.getElementById('txn-date').value;
    if (!amount || amount <= 0 || !description || !date) return;
    const record = {
      id: document.getElementById('txn-id').value || newId('txn'),
      date, type: typeSel.value, category: catSel.value, description, amount,
    };
    if (isEdit) {
      const i = state.transactions.findIndex((x) => x.id === record.id);
      if (i >= 0) state.transactions[i] = record;
      notice = `Updated “${escape(description)}” — ${fmt(amount)}.`;
    } else {
      state.transactions.push(record);
      notice = `Added ${record.type === 'income' ? 'income' : 'spending'} of ${fmt(amount)} — “${escape(description)}”.`;
    }
    saveState(state);
    closeModal();
    render();
  });
}

function budgetForm(catId) {
  const cat = categoryById(catId);
  openModal(`<h2>Edit budget — ${escape(cat.name)}</h2>
  <form id="budget-form"><p class="small muted">Monthly spending limit for ${escape(cat.name)} in ${monthLabel(state.currentMonth)}.</p>
  ${field('Monthly limit ($)', 'budget-limit', `<input id="budget-limit" type="number" min="0" step="1" inputmode="decimal" value="${state.budgets[catId] || 0}" required>`)}
  <div class="row"><button type="submit">Save limit</button><button type="button" class="secondary" id="modal-cancel">Cancel</button></div></form>`);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('budget-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = Math.max(0, Math.round(Number(document.getElementById('budget-limit').value) || 0));
    state.budgets[catId] = v;
    saveState(state);
    notice = `Budget for ${escape(cat.name)} set to ${fmt(v)} per month.`;
    closeModal();
    render();
  });
}

function goalForm(goal, addFunds) {
  const isEdit = !!goal;
  const g = goal || { name: '', target: 500, saved: 0, note: '' };
  openModal(`<h2>${addFunds ? `Add funds — ${escape(g.name)}` : isEdit ? 'Edit savings goal' : 'New savings goal'}</h2>
  <form id="goal-form">${addFunds
    ? field('Amount to add ($)', 'goal-amount', `<input id="goal-amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0.00" required>`, `Currently saved: ${fmt(g.saved)} of ${fmt(g.target)}.`)
    : `<div class="form-grid">
      ${field('Goal name', 'goal-name', `<input id="goal-name" type="text" value="${escape(g.name)}" maxlength="60" placeholder="e.g. Emergency fund" required>`)}
      ${field('Target ($)', 'goal-target', `<input id="goal-target" type="number" min="1" step="1" inputmode="decimal" value="${g.target}" required>`)}
      <div class="full">${field('Note', 'goal-note', `<input id="goal-note" type="text" value="${escape(g.note)}" maxlength="120" placeholder="What is this for?">`)}</div>
      </div>`}
  <div class="row"><button type="submit">${addFunds ? 'Add funds' : isEdit ? 'Save goal' : 'Create goal'}</button><button type="button" class="secondary" id="modal-cancel">Cancel</button></div>
  <input type="hidden" id="goal-id" value="${g.id || ''}"></form>`);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (addFunds) {
      const amt = Math.round(Number(document.getElementById('goal-amount').value) * 100) / 100;
      if (!amt || amt <= 0) return;
      g.saved = Math.round((g.saved + amt) * 100) / 100;
      const i = state.goals.findIndex((x) => x.id === g.id);
      if (i >= 0) state.goals[i] = g;
      notice = `Added ${fmt(amt)} to “${escape(g.name)}” — now ${fmt(g.saved)} of ${fmt(g.target)}.`;
    } else {
      const name = document.getElementById('goal-name').value.trim();
      const target = Math.max(1, Math.round(Number(document.getElementById('goal-target').value) || 1));
      const note = document.getElementById('goal-note').value.trim();
      if (!name) return;
      if (isEdit) {
        const i = state.goals.findIndex((x) => x.id === g.id);
        if (i >= 0) state.goals[i] = { ...g, name, target, note };
        notice = `Goal “${escape(name)}” updated.`;
      } else {
        state.goals.push({ id: newId('goal'), name, target, saved: 0, note });
        notice = `Goal “${escape(name)}” created — target ${fmt(target)}.`;
      }
    }
    saveState(state);
    closeModal();
    render();
  });
}

function exportCSV() {
  const header = 'date,type,category,description,amount\n';
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const body = [...state.transactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => [t.date, t.type, t.category, esc(t.description), t.amount.toFixed(2)].join(','))
    .join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `homeledger-transactions-${state.currentMonth}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  notice = `Exported ${state.transactions.length} transactions as CSV.`;
  render();
}

// ---------- delegated clicks ----------
document.addEventListener('click', (e) => {
  const editTxn = e.target.closest('[data-edit-txn]');
  if (editTxn) { txnForm(state.transactions.find((t) => t.id === editTxn.dataset.editTxn)); return; }
  const delTxn = e.target.closest('[data-delete-txn]');
  if (delTxn) {
    const t = state.transactions.find((x) => x.id === delTxn.dataset.deleteTxn);
    if (t && window.confirm(`Delete “${t.description}” (${fmt(t.amount)})?`)) {
      state.transactions = state.transactions.filter((x) => x.id !== t.id);
      saveState(state);
      notice = `Deleted “${escape(t.description)}”.`;
      render();
    }
    return;
  }
  const editBudget = e.target.closest('[data-edit-budget]');
  if (editBudget) { budgetForm(editBudget.dataset.editBudget); return; }
  const addFunds = e.target.closest('[data-add-funds]');
  if (addFunds) { goalForm(state.goals.find((g) => g.id === addFunds.dataset.addFunds), true); return; }
  const editGoal = e.target.closest('[data-edit-goal]');
  if (editGoal) { goalForm(state.goals.find((g) => g.id === editGoal.dataset.editGoal), false); return; }
  const delGoal = e.target.closest('[data-delete-goal]');
  if (delGoal) {
    const g = state.goals.find((x) => x.id === delGoal.dataset.deleteGoal);
    if (g && window.confirm(`Delete the goal “${g.name}”? Its ${fmt(g.saved)} saved stays in the household balance.`)) {
      state.goals = state.goals.filter((x) => x.id !== g.id);
      saveState(state);
      notice = `Goal “${escape(g.name)}” deleted.`;
      render();
    }
    return;
  }
  if (e.target.id === 'btn-add-txn') { txnForm(null); return; }
  if (e.target.id === 'btn-add-goal') { goalForm(null, false); return; }
  if (e.target.id === 'btn-export' || e.target.id === 'btn-export-2') { exportCSV(); return; }
  if (e.target.id === 'btn-reset') {
    if (window.confirm('Reset everything to the sample Alvarez family household? Your changes will be lost.')) {
      state = resetState();
      notice = 'Sample data restored.';
      render();
    }
    return;
  }
});

// ---------- delegated changes / submits ----------
document.addEventListener('change', (e) => {
  if (['f-type', 'f-cat', 'f-sort'].includes(e.target.id)) {
    const params = new URLSearchParams();
    const type = document.getElementById('f-type').value;
    const cat = document.getElementById('f-cat').value;
    const sort = document.getElementById('f-sort').value;
    const q = document.getElementById('f-q').value.trim();
    if (type !== 'all') params.set('type', type);
    if (cat !== 'all') params.set('category', cat);
    if (sort !== 'date') params.set('sort', sort);
    if (q) params.set('q', q);
    location.hash = `#/transactions${params.toString() ? '?' + params.toString() : ''}`;
  }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'f-q') {
    clearTimeout(window.__qTimer);
    window.__qTimer = setTimeout(() => {
      const params = new URLSearchParams();
      const type = document.getElementById('f-type').value;
      const cat = document.getElementById('f-cat').value;
      const sort = document.getElementById('f-sort').value;
      const q = e.target.value.trim();
      if (type !== 'all') params.set('type', type);
      if (cat !== 'all') params.set('category', cat);
      if (sort !== 'date') params.set('sort', sort);
      if (q) params.set('q', q);
      const next = `#/transactions${params.toString() ? '?' + params.toString() : ''}`;
      if (location.hash !== next) location.hash = next;
    }, 450);
  }
});
document.addEventListener('submit', (e) => {
  if (e.target.id === 'form-household') {
    e.preventDefault();
    state.householdName = document.getElementById('set-name').value.trim() || 'My Household';
    state.currency = document.getElementById('set-currency').value;
    saveState(state);
    notice = 'Household settings saved.';
    render();
  }
});

window.addEventListener('hashchange', render);
// Charts are sized to their displayed width: redraw them when the viewport
// changes (desktop ↔ phone) so labels never clip.
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const catChart = document.getElementById('chart-categories');
    if (catChart) drawCategoryChart(catChart, state);
    const trendChart = document.getElementById('chart-trend');
    if (trendChart) drawTrendChart(trendChart, state);
  }, 150);
});
render();
