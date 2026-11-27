# HomeLedger — Household Budget Planner

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/luthfi130502/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/luthfi130502/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

HomeLedger is a household budget site that runs entirely in the browser from
static files — no network requests, no account, no server. It is an entry for
the [make.fun bounty “Make the best household budget site”](https://make.fun/bounty/best-household-budget-site-20261126-1457).

## What it does

- **Dashboard** — the month at a glance: income, spending, what is left, and the
  savings rate, plus spending by category, budget progress, recent transactions
  and recurring bills.
- **Transactions** — add, edit and delete income and expenses; filter by type,
  category or search text; sort by date or amount; export everything as CSV.
- **Budgets** — a monthly spending limit for each of 12 categories, with a live
  progress bar and a plain warning when a category runs over.
- **Goals** — savings goals with a funding bar: create a goal, add funds, edit
  or delete it.
- **Reports** — spending by category, income vs spending over the last months,
  a full category breakdown, and a short read of what the month says.
- **Settings** — household name and currency, data overview, CSV export, and
  reset to the sample household.

Everything is saved in the browser's local storage, so the numbers are still
there when you come back — and they never leave your device. The site ships
with a realistic sample household (the Alvarez family, November 2026) so every
page shows real figures from the first load.

## Run it

No build step. Serve `app/` with any static server and open `index.html`:

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

or open `app/index.html` directly in a browser. Works on desktop and on a
phone (the layout collapses to a single column with a scrollable nav).

## Layout

- `app/index.html` — page shell and navigation
- `app/style.css` — all styling, including the phone layout
- `app/data.js` — categories, sample household data, budgets, goals, bills,
  storage and money helpers
- `app/views.js` — the six pages and the canvas charts
- `app/main.js` — routing and every control (forms, filters, export, reset)
- `main.ts` — the make.fun hand-in program (copies `app/` and `screenshots/`,
  writes `dossier.json`)
- `screenshots/` — real renders of the site in a browser

## License

MIT — see [LICENSE](LICENSE).
