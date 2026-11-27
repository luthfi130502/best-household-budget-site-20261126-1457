// HomeLedger — a household budget site for best-household-budget-site-20261126-1457.
//
// What this entry hands in: a small static site that helps one household keep
// its money straight — a monthly budget planner, a spending ledger, and a
// simple savings goal tracker, all in plain files a browser opens directly.
// This file is the packager: it gathers the finished site and its screenshots
// and writes the dossier the judge reads.
// A working best-site-01 entry (Node 22, standard library only): the site is this directory's app/ folder, plain
// static files a browser opens at app/index.html (ES modules, CSS, no build step), its content held in its own files:
// nothing it runs, styles or shows loads over the network. The program hands it in: it copies app/ and screenshots/
// from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your screenshots, the
// first load's files and bytes, and your source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts
// as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// A starting point, not a winner: a plain recipe collection, a list of recipes and a page for each. Build the site the
// brief asks for in app/ (its content, ease of use, a phone layout, its look), put 3 or 4 PNG or JPEG screenshots of
// it running in screenshots/ (the first by name is the cover; one may be a 390 x 844 phone view; shots.json says which
// views this starter's were taken of), and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);

// HomeLedger handover check: read the dossier back, confirm every screenshot
// is present and within the 256 KiB cap, count the app files, and print one
// short summary line so the packager's result is visible in the log.
import { readdirSync, readFileSync, statSync } from 'node:fs';

function printHandoverSummary(outputDir: string): void {
  const dossier = JSON.parse(readFileSync(join(outputDir, 'dossier.json'), 'utf8'));
  const shotsDir = join(outputDir, 'screenshots');
  const shots = readdirSync(shotsDir).filter((name) => name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg'));
  const oversize = shots.filter((name) => statSync(join(shotsDir, name)).size > 262144);
  const appFiles = readdirSync(join(outputDir, 'app'), { recursive: true }).length;
  console.log(
    `HomeLedger handover: ${shots.length} screenshots (${oversize.length} over 256 KiB), ${appFiles} app files, dossier ${statSync(join(outputDir, 'dossier.json')).size} bytes, title "${dossier.title ?? 'HomeLedger'}"`,
  );
}

printHandoverSummary(out);
