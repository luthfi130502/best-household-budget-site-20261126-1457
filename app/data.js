// HomeLedger data: categories, seed household figures for November 2026 (plus
// October and September, so the trend chart has something real to show), monthly
// budgets, savings goals and recurring bills. Everything is saved in localStorage
// under one key, so the household's numbers survive a reload and stay on-device.

export const STORAGE_KEY = 'homeledger-v1';

export const CATEGORIES = [
  { id: 'housing', name: 'Housing', color: '#2e7d5b', icon: '⌂' },
  { id: 'groceries', name: 'Groceries', color: '#4c9a2a', icon: '▣' },
  { id: 'utilities', name: 'Utilities', color: '#b7791f', icon: '⚡' },
  { id: 'transport', name: 'Transport', color: '#2563eb', icon: '➜' },
  { id: 'dining', name: 'Dining Out', color: '#c2410c', icon: '🍽' },
  { id: 'health', name: 'Health', color: '#db2777', icon: '+' },
  { id: 'kids', name: 'Kids & School', color: '#7c3aed', icon: '✎' },
  { id: 'entertainment', name: 'Entertainment', color: '#0891b2', icon: '♪' },
  { id: 'clothing', name: 'Clothing', color: '#6d28d9', icon: '✂' },
  { id: 'subscriptions', name: 'Subscriptions', color: '#475569', icon: '↻' },
  { id: 'personal', name: 'Personal', color: '#be185d', icon: '✦' },
  { id: 'other', name: 'Other', color: '#64748b', icon: '•' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary' },
  { id: 'freelance', name: 'Freelance' },
  { id: 'refund', name: 'Refund' },
  { id: 'other-income', name: 'Other Income' },
];

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function incomeCategoryById(id) {
  return INCOME_CATEGORIES.find((c) => c.id === id) || INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1];
}

// Seed transactions: a realistic month for a family of four. Amounts are USD.
function seedTransactions() {
  const t = [];
  let n = 1;
  const add = (date, type, category, description, amount) => {
    t.push({ id: `seed-${n++}`, date, type, category, description, amount });
  };
  // ---- November 2026 income ----
  add('2026-11-01', 'income', 'salary', 'Salary — Maya (teacher)', 2850.00);
  add('2026-11-01', 'income', 'salary', 'Salary — Daniel (warehouse lead)', 3120.00);
  add('2026-11-14', 'income', 'freelance', 'Weekend tutoring — Maya', 240.00);
  add('2026-11-20', 'income', 'refund', 'Insurance refund — dental', 86.50);
  // ---- November 2026 spending ----
  add('2026-11-01', 'expense', 'housing', 'Rent — 2-bed apartment', 1450.00);
  add('2026-11-02', 'expense', 'groceries', 'Weekly shop — FreshMart', 132.40);
  add('2026-11-03', 'expense', 'transport', 'Fuel — Shell', 48.20);
  add('2026-11-04', 'expense', 'utilities', 'Electricity bill', 96.75);
  add('2026-11-05', 'expense', 'dining', 'Pizza night — family', 34.50);
  add('2026-11-06', 'expense', 'subscriptions', 'Streaming — video', 15.99);
  add('2026-11-07', 'expense', 'groceries', 'Weekly shop — FreshMart', 118.65);
  add('2026-11-08', 'expense', 'kids', 'School lunch money — Leo', 25.00);
  add('2026-11-09', 'expense', 'transport', 'Bus passes — monthly', 72.00);
  add('2026-11-10', 'expense', 'health', 'Pharmacy — vitamins', 28.90);
  add('2026-11-11', 'expense', 'utilities', 'Water bill', 41.30);
  add('2026-11-12', 'expense', 'dining', 'Lunch out — Daniel', 18.75);
  add('2026-11-13', 'expense', 'groceries', 'Weekly shop — FreshMart', 141.20);
  add('2026-11-14', 'expense', 'entertainment', 'Cinema — family of four', 46.00);
  add('2026-11-15', 'expense', 'kids', 'School trip — science museum', 38.00);
  add('2026-11-16', 'expense', 'transport', 'Fuel — Shell', 52.10);
  add('2026-11-17', 'expense', 'personal', 'Haircut — Maya', 32.00);
  add('2026-11-18', 'expense', 'utilities', 'Internet — monthly', 59.99);
  add('2026-11-19', 'expense', 'groceries', 'Weekly shop — FreshMart', 126.80);
  add('2026-11-20', 'expense', 'dining', 'Takeaway — Thai', 41.60);
  add('2026-11-21', 'expense', 'clothing', 'Winter jackets — kids', 89.95);
  add('2026-11-22', 'expense', 'health', 'Dentist check-up — Leo', 65.00);
  add('2026-11-23', 'expense', 'subscriptions', 'Music streaming', 10.99);
  add('2026-11-24', 'expense', 'groceries', 'Thanksgiving shop', 168.35);
  add('2026-11-25', 'expense', 'transport', 'Fuel — Shell', 44.75);
  add('2026-11-26', 'expense', 'dining', 'Thanksgiving dinner out', 72.40);
  // ---- October 2026 (for the trend chart) ----
  add('2026-10-01', 'income', 'salary', 'Salary — Maya (teacher)', 2850.00);
  add('2026-10-01', 'income', 'salary', 'Salary — Daniel (warehouse lead)', 3120.00);
  add('2026-10-01', 'expense', 'housing', 'Rent — 2-bed apartment', 1450.00);
  add('2026-10-05', 'expense', 'groceries', 'Weekly shop — FreshMart', 129.80);
  add('2026-10-08', 'expense', 'utilities', 'Electricity bill', 88.40);
  add('2026-10-12', 'expense', 'groceries', 'Weekly shop — FreshMart', 144.10);
  add('2026-10-15', 'expense', 'transport', 'Fuel — Shell', 51.30);
  add('2026-10-18', 'expense', 'dining', 'Pizza night — family', 36.20);
  add('2026-10-20', 'expense', 'kids', 'School supplies', 54.60);
  add('2026-10-22', 'expense', 'entertainment', 'Cinema — family of four', 44.00);
  add('2026-10-25', 'expense', 'groceries', 'Weekly shop — FreshMart', 137.55);
  add('2026-10-27', 'expense', 'health', 'Pharmacy — cold medicine', 22.40);
  add('2026-10-28', 'expense', 'utilities', 'Internet — monthly', 59.99);
  add('2026-10-30', 'expense', 'subscriptions', 'Streaming — video', 15.99);
  // ---- September 2026 (for the trend chart) ----
  add('2026-09-01', 'income', 'salary', 'Salary — Maya (teacher)', 2850.00);
  add('2026-09-01', 'income', 'salary', 'Salary — Daniel (warehouse lead)', 3120.00);
  add('2026-09-01', 'expense', 'housing', 'Rent — 2-bed apartment', 1450.00);
  add('2026-09-06', 'expense', 'groceries', 'Weekly shop — FreshMart', 121.45);
  add('2026-09-10', 'expense', 'utilities', 'Electricity bill', 92.10);
  add('2026-09-13', 'expense', 'groceries', 'Weekly shop — FreshMart', 133.90);
  add('2026-09-16', 'expense', 'transport', 'Fuel — Shell', 47.60);
  add('2026-09-19', 'expense', 'kids', 'New school shoes — Leo', 68.00);
  add('2026-09-21', 'expense', 'dining', 'Takeaway — Thai', 39.80);
  add('2026-09-24', 'expense', 'groceries', 'Weekly shop — FreshMart', 128.30);
  add('2026-09-27', 'expense', 'health', 'Eye test — Daniel', 45.00);
  add('2026-09-29', 'expense', 'subscriptions', 'Streaming — video', 15.99);
  return t;
}

export function seedState() {
  return {
    householdName: 'The Alvarez Family',
    currency: 'USD',
    currentMonth: '2026-11',
    budgets: {
      housing: 1450, groceries: 620, utilities: 210, transport: 260,
      dining: 180, health: 120, kids: 150, entertainment: 90,
      clothing: 100, subscriptions: 45, personal: 80, other: 60,
    },
    goals: [
      { id: 'goal-1', name: 'Emergency fund', target: 3000, saved: 1850, note: 'Three months of rent, just in case.' },
      { id: 'goal-2', name: 'Summer holiday — coast trip', target: 1200, saved: 640, note: 'A week by the sea in July.' },
      { id: 'goal-3', name: 'New washing machine', target: 450, saved: 210, note: 'The old one leaks every spin cycle.' },
    ],
    bills: [
      { id: 'bill-1', name: 'Rent', amount: 1450, day: 1, category: 'housing', paid: true },
      { id: 'bill-2', name: 'Electricity', amount: 96.75, day: 4, category: 'utilities', paid: true },
      { id: 'bill-3', name: 'Internet', amount: 59.99, day: 18, category: 'utilities', paid: true },
      { id: 'bill-4', name: 'Streaming — video', amount: 15.99, day: 6, category: 'subscriptions', paid: true },
      { id: 'bill-5', name: 'Music streaming', amount: 10.99, day: 23, category: 'subscriptions', paid: true },
      { id: 'bill-6', name: 'Bus passes', amount: 72, day: 9, category: 'transport', paid: true },
    ],
    transactions: seedTransactions(),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch (e) { /* corrupted storage: fall through to seed */ }
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

export function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
}

export function resetState() {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

// ---- money helpers ----
export function fmt(amount, currency = 'USD') {
  const n = Number(amount) || 0;
  return n.toLocaleString('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function monthTxns(state, month) {
  return state.transactions.filter((t) => t.date.startsWith(month));
}

export function monthTotals(state, month) {
  const txns = monthTxns(state, month);
  let income = 0, expense = 0;
  for (const t of txns) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense, savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0 };
}

export function spendingByCategory(state, month) {
  const out = {};
  for (const t of monthTxns(state, month)) {
    if (t.type !== 'expense') continue;
    out[t.category] = (out[t.category] || 0) + t.amount;
  }
  return out;
}

export function availableMonths(state) {
  const set = new Set(state.transactions.map((t) => t.date.slice(0, 7)));
  return [...set].sort().reverse();
}

export function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}
