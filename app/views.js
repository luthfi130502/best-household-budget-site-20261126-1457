// HomeLedger views: HTML for every page, built from the household's own data.
// Every value is escaped before it goes into the page.

import { CATEGORIES, INCOME_CATEGORIES, categoryById, incomeCategoryById, fmt, monthLabel, monthTotals, spendingByCategory } from './data.js';

export const escape = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function moneyCell(amount, type) {
  const cls = type === 'income' ? 'pos' : 'neg';
  const sign = type === 'income' ? '+' : '−';
  return `<span class="money ${cls}">${sign}${fmt(amount)}</span>`;
}

function budgetBar(spent, limit) {
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const cls = spent > limit ? 'over' : pct >= 80 ? 'warn' : '';
  const left = limit - spent;
  const pill = spent > limit
    ? `<span class="pill over">Over by ${fmt(-left)}</span>`
    : pct >= 80 ? `<span class="pill warn">${Math.round(pct)}% used</span>`
    : `<span class="pill">${fmt(left)} left</span>`;
  return { pct, cls, pill };
}

function txnRows(txns, currency, withActions) {
  if (!txns.length) return `<tr><td colspan="5" class="empty">No transactions match. Try clearing the filters, or add the first one.</td></tr>`;
  return txns.map((t) => {
    const cat = t.type === 'income' ? incomeCategoryById(t.category) : categoryById(t.category);
    const dot = t.type === 'expense' ? `<span class="dot" style="background:${categoryById(t.category).color}"></span>` : '';
    const date = new Date(`${t.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `<tr>
      <td>${date}</td>
      <td><span class="cat-chip">${dot}${escape(t.description)}</span><br><span class="small muted">${escape(cat.name)}</span></td>
      <td class="hide-phone">${t.type === 'income' ? 'Income' : 'Expense'}</td>
      <td class="num">${moneyCell(t.amount, t.type)}</td>
      ${withActions ? `<td class="num"><button class="small secondary" data-edit-txn="${t.id}">Edit</button> <button class="small danger" data-delete-txn="${t.id}">Delete</button></td>` : ''}
    </tr>`;
  }).join('');
}

// ---------- Dashboard ----------
export function dashboard(state) {
  const month = state.currentMonth;
  const totals = monthTotals(state, month);
  const byCat = spendingByCategory(state, month);
  const budgetTotal = Object.values(state.budgets).reduce((a, b) => a + b, 0);
  const budgetUsedPct = budgetTotal > 0 ? Math.round((totals.expense / budgetTotal) * 100) : 0;
  const recent = [...state.transactions]
    .filter((t) => t.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, 8);
  const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const upcoming = state.bills.filter((b) => !b.paid);
  const over = Object.entries(state.budgets)
    .filter(([id, limit]) => (byCat[id] || 0) > limit)
    .map(([id]) => categoryById(id).name);

  return `<h1>${escape(state.householdName)} — ${monthLabel(month)}</h1>
<p class="lede">Your household at a glance: what came in, what went out, and what is left for the rest of the month.</p>
${over.length ? `<div class="notice bad"><strong>Over budget:</strong> ${over.map(escape).join(', ')} — spending has passed the monthly limit. See <a href="#/budgets">Budgets</a> to adjust.</div>` : `<div class="notice ok"><strong>On track:</strong> every category is inside its monthly budget so far.</div>`}
<section class="grid grid-4" aria-label="Month summary">
  <div class="card stat accent"><div class="label">Income</div><div class="value">${fmt(totals.income)}</div><div class="sub">2 salaries + freelance &amp; refunds</div></div>
  <div class="card stat"><div class="label">Spent</div><div class="value neg">${fmt(totals.expense)}</div><div class="sub">${budgetUsedPct}% of the ${fmt(budgetTotal)} monthly plan</div></div>
  <div class="card stat"><div class="label">Left to spend</div><div class="value ${totals.balance >= 0 ? 'pos' : 'neg'}">${fmt(totals.balance)}</div><div class="sub">Income minus spending</div></div>
  <div class="card stat"><div class="label">Savings rate</div><div class="value">${totals.savingsRate.toFixed(1)}%</div><div class="sub">of income kept this month</div></div>
</section>
<div class="grid grid-2 stack" style="margin-top:1rem">
  <section class="card">
    <div class="row-between"><h2>Spending by category</h2><a href="#/reports" class="small">Full report &rarr;</a></div>
    <canvas class="chart" id="chart-categories" width="640" height="300" role="img" aria-label="Bar chart of spending by category"></canvas>
    <div class="legend">${topCats.map(([id, amt]) => `<span><span class="dot" style="background:${categoryById(id).color}"></span>${escape(categoryById(id).name)} — ${fmt(amt)}</span>`).join('')}</div>
  </section>
  <section class="card">
    <div class="row-between"><h2>Budget progress</h2><a href="#/budgets" class="small">All budgets &rarr;</a></div>
    ${topCats.map(([id, spent]) => {
      const limit = state.budgets[id] || 0;
      const { pct, cls, pill } = budgetBar(spent, limit);
      return `<div class="budget-row"><div class="row-between"><span class="cat"><span class="dot" style="background:${categoryById(id).color}"></span>${escape(categoryById(id).name)}</span><span class="small muted">${fmt(spent)} of ${fmt(limit)}</span></div>
      <div class="bar ${cls}" style="margin:.35rem 0"><span style="width:${pct}%"></span></div>${pill}</div>`;
    }).join('')}
  </section>
</div>
<div class="grid grid-2 stack" style="margin-top:1rem">
  <section class="card">
    <div class="row-between"><h2>Recent transactions</h2><a href="#/transactions" class="small">See all &rarr;</a></div>
    <div class="table-wrap"><table><thead><tr><th>Date</th><th>What</th><th class="hide-phone">Type</th><th class="num">Amount</th></tr></thead>
    <tbody>${txnRows(recent, state.currency, false)}</tbody></table></div>
  </section>
  <section class="card">
    <h2>Recurring bills</h2>
    <p class="small muted">${state.bills.filter((b) => b.paid).length} of ${state.bills.length} bills paid this month.</p>
    <table><thead><tr><th>Bill</th><th class="num">Amount</th><th>Due</th><th>Status</th></tr></thead><tbody>
    ${state.bills.map((b) => `<tr><td>${escape(b.name)}</td><td class="num money">${fmt(b.amount)}</td><td>Nov ${b.day}</td><td>${b.paid ? '<span class="pill">Paid</span>' : '<span class="pill warn">Due</span>'}</td></tr>`).join('')}
    </tbody></table>
    <p style="margin-top:.9rem"><a class="btn secondary small" href="#/transactions">Add a transaction</a> <a class="btn small" href="#/goals">View savings goals</a></p>
  </section>
</div>`;
}

// ---------- Transactions ----------
export function transactionsPage(state, filters) {
  const month = state.currentMonth;
  let txns = state.transactions.filter((t) => t.date.startsWith(month));
  if (filters.type !== 'all') txns = txns.filter((t) => t.type === filters.type);
  if (filters.category !== 'all') txns = txns.filter((t) => t.category === filters.category);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    txns = txns.filter((t) => t.description.toLowerCase().includes(q) || categoryById(t.category).name.toLowerCase().includes(q));
  }
  txns = [...txns].sort((a, b) => filters.sort === 'amount' ? b.amount - a.amount : b.date.localeCompare(a.date));
  const totals = monthTotals(state, month);
  const catOptions = [...CATEGORIES, ...INCOME_CATEGORIES].map((c) => `<option value="${c.id}" ${filters.category === c.id ? 'selected' : ''}>${escape(c.name)}</option>`).join('');
  return `<h1>Transactions — ${monthLabel(month)}</h1>
<p class="lede">Every dollar in and out. Add, edit or delete entries; filter by type, category or search text.</p>
<div class="toolbar">
  <div class="field"><label for="f-type">Type</label><select id="f-type"><option value="all">All</option><option value="income" ${filters.type === 'income' ? 'selected' : ''}>Income</option><option value="expense" ${filters.type === 'expense' ? 'selected' : ''}>Expense</option></select></div>
  <div class="field"><label for="f-cat">Category</label><select id="f-cat"><option value="all">All categories</option>${catOptions}</select></div>
  <div class="field grow"><label for="f-q">Search</label><input id="f-q" type="search" placeholder="e.g. FreshMart, rent, fuel…" value="${escape(filters.q)}"></div>
  <div class="field"><label for="f-sort">Sort by</label><select id="f-sort"><option value="date" ${filters.sort === 'date' ? 'selected' : ''}>Newest first</option><option value="amount" ${filters.sort === 'amount' ? 'selected' : ''}>Largest amount</option></select></div>
  <button id="btn-add-txn">+ Add transaction</button>
</div>
<div class="card">
  <div class="row-between"><p class="small muted" style="margin:0">${txns.length} transaction${txns.length === 1 ? '' : 's'} shown &middot; Income ${fmt(totals.income)} &middot; Spent ${fmt(totals.expense)}</p><button class="small secondary" id="btn-export">Export CSV</button></div>
  <div class="table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th class="hide-phone">Type</th><th class="num">Amount</th><th class="num">Actions</th></tr></thead>
  <tbody>${txnRows(txns, state.currency, true)}</tbody></table></div>
</div>`;
}

// ---------- Budgets ----------
export function budgetsPage(state) {
  const month = state.currentMonth;
  const byCat = spendingByCategory(state, month);
  const budgetTotal = Object.values(state.budgets).reduce((a, b) => a + b, 0);
  const totals = monthTotals(state, month);
  const overCount = Object.entries(state.budgets).filter(([id, l]) => (byCat[id] || 0) > l).length;
  const rows = CATEGORIES.map((c) => {
    const spent = byCat[c.id] || 0;
    const limit = state.budgets[c.id] || 0;
    const { pct, cls, pill } = budgetBar(spent, limit);
    return `<div class="budget-row"><div class="row-between"><span class="cat"><span class="dot" style="background:${c.color}"></span>${escape(c.name)}</span>
      <span><span class="money">${fmt(spent)}</span> <span class="muted small">of ${fmt(limit)}</span> <button class="small secondary" data-edit-budget="${c.id}">Edit limit</button></span></div>
      <div class="bar ${cls}" style="margin:.35rem 0"><span style="width:${pct}%"></span></div>${pill}</div>`;
  }).join('');
  return `<h1>Monthly budgets — ${monthLabel(month)}</h1>
<p class="lede">Set a spending limit for each category and watch it fill up as the month goes on. Limits are per month and carry over to next month until you change them.</p>
<div class="grid grid-4" style="margin-bottom:1rem">
  <div class="card stat"><div class="label">Total budget</div><div class="value">${fmt(budgetTotal)}</div><div class="sub">all categories</div></div>
  <div class="card stat"><div class="label">Spent so far</div><div class="value neg">${fmt(totals.expense)}</div><div class="sub">${budgetTotal > 0 ? Math.round((totals.expense / budgetTotal) * 100) : 0}% of plan</div></div>
  <div class="card stat"><div class="label">Remaining</div><div class="value ${budgetTotal - totals.expense >= 0 ? 'pos' : 'neg'}">${fmt(budgetTotal - totals.expense)}</div><div class="sub">across all categories</div></div>
  <div class="card stat"><div class="label">Over budget</div><div class="value">${overCount} categor${overCount === 1 ? 'y' : 'ies'}</div><div class="sub">out of ${CATEGORIES.length}</div></div>
</div>
<section class="card">${rows}</section>`;
}

// ---------- Goals ----------
export function goalsPage(state) {
  const totalSaved = state.goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = state.goals.reduce((a, g) => a + g.target, 0);
  const cards = state.goals.map((g) => {
    const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
    return `<article class="card"><div class="row-between"><h2 style="margin:0">${escape(g.name)}</h2><span class="pill">${pct}% funded</span></div>
    <p class="muted small">${escape(g.note)}</p>
    <div class="goal-progress"><div class="bar"><span style="width:${pct}%"></span></div><span class="money">${fmt(g.saved)} / ${fmt(g.target)}</span></div>
    <p class="small muted" style="margin-top:.6rem">${fmt(g.target - g.saved)} to go.</p>
    <div class="row"><button class="small" data-add-funds="${g.id}">Add funds</button><button class="small secondary" data-edit-goal="${g.id}">Edit goal</button><button class="small danger" data-delete-goal="${g.id}">Delete</button></div></article>`;
  }).join('');
  return `<h1>Savings goals</h1>
<p class="lede">Money set aside on purpose — an emergency cushion, the summer holiday, and the next big household purchase. Adding funds here moves money into the goal, not out of the household.</p>
<div class="grid grid-4" style="margin-bottom:1rem">
  <div class="card stat accent"><div class="label">Total saved</div><div class="value">${fmt(totalSaved)}</div><div class="sub">across ${state.goals.length} goals</div></div>
  <div class="card stat"><div class="label">Total target</div><div class="value">${fmt(totalTarget)}</div><div class="sub">${totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}% funded overall</div></div>
  <div class="card stat"><div class="label">Still to save</div><div class="value">${fmt(totalTarget - totalSaved)}</div><div class="sub">to reach every goal</div></div>
  <div class="card stat"><div class="label">This month's balance</div><div class="value">${fmt(monthTotals(state, state.currentMonth).balance)}</div><div class="sub">available to allocate</div></div>
</div>
<div class="grid grid-2eq">${cards}</div>
<p style="margin-top:1rem"><button id="btn-add-goal">+ New savings goal</button></p>`;
}

// ---------- Reports ----------
export function reportsPage(state) {
  const month = state.currentMonth;
  const totals = monthTotals(state, month);
  const byCat = spendingByCategory(state, month);
  const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const months = [...new Set(state.transactions.map((t) => t.date.slice(0, 7)))].sort();
  const trend = months.map((m) => ({ month: m, ...monthTotals(state, m) }));
  const avgSpend = trend.length ? trend.reduce((a, t) => a + t.expense, 0) / trend.length : 0;
  const insight = top
    ? `${categoryById(top[0]).name} is the biggest cost this month at ${fmt(top[1])} (${totals.expense > 0 ? Math.round((top[1] / totals.expense) * 100) : 0}% of all spending).`
    : 'No spending recorded this month yet.';
  const vsAvg = totals.expense - avgSpend;
  return `<h1>Reports — ${monthLabel(month)}</h1>
<p class="lede">Where the money actually went, and how this month compares with the months before it.</p>
<div class="grid grid-4" style="margin-bottom:1rem">
  <div class="card stat"><div class="label">Income</div><div class="value pos">${fmt(totals.income)}</div><div class="sub">${monthLabel(month)}</div></div>
  <div class="card stat"><div class="label">Spending</div><div class="value neg">${fmt(totals.expense)}</div><div class="sub">${vsAvg <= 0 ? fmt(-vsAvg) + ' below' : fmt(vsAvg) + ' above'} the ${fmt(avgSpend)} average</div></div>
  <div class="card stat"><div class="label">Balance</div><div class="value">${fmt(totals.balance)}</div><div class="sub">savings rate ${totals.savingsRate.toFixed(1)}%</div></div>
  <div class="card stat"><div class="label">Biggest category</div><div class="value" style="font-size:1.25rem">${top ? escape(categoryById(top[0]).name) : '—'}</div><div class="sub">${top ? fmt(top[1]) : ''}</div></div>
</div>
<div class="grid grid-2 stack">
  <section class="card"><h2>Spending by category</h2>
    <canvas class="chart" id="chart-categories" width="640" height="300" role="img" aria-label="Bar chart of spending by category"></canvas>
    <div class="legend">${sorted.map(([id, amt]) => `<span><span class="dot" style="background:${categoryById(id).color}"></span>${escape(categoryById(id).name)} — ${fmt(amt)}</span>`).join('')}</div>
  </section>
  <section class="card"><h2>Income vs spending — last ${trend.length} months</h2>
    <canvas class="chart" id="chart-trend" width="640" height="300" role="img" aria-label="Bar chart of income versus spending by month"></canvas>
    <div class="legend"><span><span class="dot" style="background:#2e9e68"></span>Income</span><span><span class="dot" style="background:#c0392b"></span>Spending</span></div>
  </section>
</div>
<section class="card" style="margin-top:1rem"><h2>Category breakdown</h2>
  <div class="table-wrap"><table><thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Share</th><th class="num">Budget</th><th class="num">Remaining</th></tr></thead><tbody>
  ${sorted.map(([id, amt]) => `<tr><td><span class="cat-chip"><span class="dot" style="background:${categoryById(id).color}"></span>${escape(categoryById(id).name)}</span></td><td class="num money">${fmt(amt)}</td><td class="num">${totals.expense > 0 ? ((amt / totals.expense) * 100).toFixed(1) : '0.0'}%</td><td class="num">${fmt(state.budgets[id] || 0)}</td><td class="num ${((state.budgets[id] || 0) - amt) >= 0 ? 'pos' : 'neg'}">${fmt((state.budgets[id] || 0) - amt)}</td></tr>`).join('')}
  </tbody></table></div></section>
<section class="card" style="margin-top:1rem"><h2>What this month says</h2>
  <p>${escape(insight)}</p>
  <p>${totals.savingsRate >= 20 ? 'A savings rate above 20% is strong for a household of four — the plan is working.' : totals.savingsRate >= 0 ? 'The household ends the month ahead, but the savings rate is under 20% — dining out and groceries are the easiest places to find a little more.' : 'Spending passed income this month. The budget page shows which categories ran over.'}</p>
  <p class="small muted">Tip: the biggest wins usually come from the top two categories, not from cutting the small ones.</p></section>`;
}

// ---------- Settings ----------
export function settingsPage(state) {
  return `<h1>Settings &amp; data</h1>
<p class="lede">Your household, your data. HomeLedger stores everything in this browser's local storage — nothing is uploaded anywhere.</p>
<div class="grid grid-2eq">
<section class="card"><h2>Household</h2>
  <form id="form-household"><div class="field"><label for="set-name">Household name</label><input id="set-name" value="${escape(state.householdName)}" maxlength="60"></div>
  <div class="field"><label for="set-currency">Currency</label><select id="set-currency">
    <option value="USD" ${state.currency === 'USD' ? 'selected' : ''}>USD — US dollar ($)</option>
    <option value="EUR" ${state.currency === 'EUR' ? 'selected' : ''}>EUR — Euro (€)</option>
    <option value="GBP" ${state.currency === 'GBP' ? 'selected' : ''}>GBP — British pound (£)</option>
  </select></div>
  <button type="submit">Save household settings</button></form></section>
<section class="card"><h2>Your data</h2>
  <dl class="kv">
    <dt>Transactions</dt><dd>${state.transactions.length}</dd>
    <dt>Budgets set</dt><dd>${Object.keys(state.budgets).length} categories</dd>
    <dt>Savings goals</dt><dd>${state.goals.length}</dd>
    <dt>Recurring bills</dt><dd>${state.bills.length}</dd>
    <dt>Storage</dt><dd>Local only — this browser</dd>
  </dl>
  <div class="row" style="margin-top:.8rem"><button class="secondary" id="btn-export-2">Export transactions (CSV)</button></div>
  <div class="row" style="margin-top:.6rem"><button class="danger" id="btn-reset">Reset to sample data</button></div>
  <p class="small muted">Resetting replaces everything with the sample Alvarez family household, so you can see the site as it first looks.</p></section>
</div>
<section class="card" style="margin-top:1rem"><h2>How HomeLedger works</h2>
  <p><strong>Dashboard</strong> — the month at a glance. <strong>Transactions</strong> — add, edit, delete and search every entry. <strong>Budgets</strong> — a monthly limit per category with a live progress bar. <strong>Goals</strong> — savings targets with money set aside. <strong>Reports</strong> — where the money went and how months compare.</p>
  <p class="small muted">A month's budget is planned from income first: housing, groceries and utilities are fixed, the rest is a choice. If a category runs over, the dashboard says so plainly — no judgment, just the number.</p></section>`;
}

export function missing() {
  return `<h1>Page not found</h1><p>There is no page at this address. <a href="#/">Back to the dashboard</a>.</p>`;
}

// ---------- Canvas charts (drawn with plain canvas, no libraries) ----------
// Canvases are sized to their displayed width, so the same chart stays legible
// on a phone (390 px) and on a desktop (640 px).
function fitCanvas(canvas) {
  const w = canvas.clientWidth || 640;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(w * 0.47 * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W: w, H: w * 0.47 };
}

export function drawCategoryChart(canvas, state) {
  const byCat = spendingByCategory(state, state.currentMonth);
  const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 8);
  drawBars(canvas, entries.map(([id]) => categoryById(id).name), entries.map(([, v]) => v), entries.map(([id]) => categoryById(id).color), (v) => fmt(v));
}

export function drawTrendChart(canvas, state) {
  const months = [...new Set(state.transactions.map((t) => t.date.slice(0, 7)))].sort();
  const trend = months.map((m) => ({ month: m, ...monthTotals(state, m) }));
  const { ctx, W, H } = fitCanvas(canvas);
  const padL = 64, padB = 32, padT = 38; // tall top pad: staggered value labels need room above the tallest bar
  const max = Math.max(...trend.flatMap((t) => [t.income, t.expense]), 1);
  ctx.clearRect(0, 0, W, H);
  ctx.font = '12px sans-serif';
  const bw = (W - padL - 16) / trend.length;
  trend.forEach((t, i) => {
    const x = padL + i * bw;
    const hI = (t.income / max) * (H - padT - padB);
    const hE = (t.expense / max) * (H - padT - padB);
    const barW = Math.max(4, (bw - 22) / 2);
    ctx.fillStyle = '#2e9e68';
    ctx.fillRect(x + 6, H - padB - hI, barW, hI);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x + 6 + barW + 3, H - padB - hE, barW, hE);
    ctx.fillStyle = '#5f6f66';
    ctx.textAlign = 'center';
    ctx.fillText(`${MONTHS_SHORT[Number(t.month.slice(5, 7)) - 1]} ${t.month.slice(2, 4)}`, x + bw / 2, H - 10);
    // Income values are near-identical across months, so their labels would
    // collide if all sat at the same height: stagger alternate months higher.
    const cx = x + 6 + barW / 2;
    ctx.fillStyle = '#1f2a24';
    ctx.fillText(fmt(t.income), cx, H - padB - hI - (i % 2 === 0 ? 5 : 20));
  });
  ctx.fillStyle = '#5f6f66'; ctx.textAlign = 'left';
  // No max label: each income bar already carries its own value, and the max
  // label collided with September's bar label.
  ctx.fillText(fmt(max / 2), 6, padT + (H - padT - padB) / 2);
}

function drawBars(canvas, labels, values, colors, fmtValue) {
  const { ctx, W, H } = fitCanvas(canvas);
  const padL = Math.min(108, W * 0.30), padB = 8, padT = 8;
  const max = Math.max(...values, 1);
  ctx.clearRect(0, 0, W, H);
  ctx.font = `${W < 480 ? 11 : 12}px sans-serif`;
  const rowH = (H - padT - padB) / values.length;
  const maxLabel = W < 480 ? 13 : 16;
  values.forEach((v, i) => {
    const y = padT + i * rowH;
    const w = (v / max) * (W - padL - 64);
    ctx.fillStyle = colors[i];
    ctx.fillRect(padL, y + 5, Math.max(2, w), rowH - 12);
    ctx.fillStyle = '#1f2a24';
    ctx.textAlign = 'right';
    const label = labels[i].length > maxLabel ? labels[i].slice(0, maxLabel - 1) + '…' : labels[i];
    ctx.fillText(label, padL - 8, y + rowH / 2 + 4);
    ctx.textAlign = 'left';
    ctx.fillText(fmtValue(v), padL + Math.max(2, w) + 6, y + rowH / 2 + 4);
  });
}
