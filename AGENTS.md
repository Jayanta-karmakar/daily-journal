# AGENTS.md

Reference documentation for any AI coding agent (Claude Code, Codex, Cursor, Aider, Copilot, etc.) working in this repository. Tool-agnostic — see `CLAUDE.md` for Claude-Code-specific operating rules and session history on top of everything here.

_Last verified against the repo: 2026-06-21. If this drifts from reality, trust the code and update this file._

## 1. What this project is

"MyDiary" (package name: `vite_react_shadcn_ts`; repo/folder name: `daily-journal`) is a personal daily-journal app that bundles three things into one daily entry: a free-text journal note, a budget/expense tracker (needs vs. wants vs. investments vs. savings), and a gym-attendance habit tracker. It's a single-page React app with Supabase as its backend, designed to work fully offline and sync when connectivity returns.

It is a real, deployed, single-owner personal app (not a multi-tenant SaaS with paying customers), even though the codebase contains `Pricing`, `Admin`, and `pricing_plans` scaffolding — that scaffolding exists and is wired up, but treat it as optional/aspirational product surface, not the core purpose of the app.

Public GitHub repo: `https://github.com/Jayanta-karmakar/daily-journal`, single branch `main`. Originally scaffolded via the Lovable AI app builder (visible in leftover `lovable-agent-playwright-config` references — see §8) and hand-developed since.

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18.3 + Vite 5 |
| Language | TypeScript 5.8 (deliberately relaxed — see §6) |
| Styling | Tailwind CSS 3.4 + `tailwindcss-animate` |
| UI components | shadcn/ui on top of Radix UI primitives (`src/components/ui/*`) |
| Routing | react-router-dom v6 |
| Server-state lib | `@tanstack/react-query` is installed and `QueryClientProvider` wraps the app, but it's not actually used for data fetching yet — Supabase calls go through `AppContext` directly. Don't assume `useQuery` hooks exist anywhere. |
| Forms | react-hook-form + zod + `@hookform/resolvers` |
| Backend | Supabase (Postgres + Auth + Row Level Security) via `@supabase/supabase-js` |
| Offline storage | `idb` (IndexedDB wrapper), one database per signed-in user |
| PWA | `vite-plugin-pwa` (Workbox) — installable, offline asset caching, autoUpdate |
| Charts | `recharts` |
| Search | `fuse.js` (fuzzy ranking) + `cmdk` (⌘K command-palette UI) |
| Bulk import | `jszip`, `read-excel-file` (CSV/XLSX → journal entries) |
| Testing | `vitest` + `@testing-library/react` + `jsdom`. Playwright is *configured* but not functional — see §9. |
| Analytics | `@vercel/analytics` (implies the app is hosted on Vercel) |
| Package manager | **npm** — `package-lock.json` is the live, current lockfile. A `bun.lock` also exists in the repo but is stale; don't run `bun install` and don't update it. |

## 3. Setup

```bash
npm install
npm run setup:env          # copies .env.example -> .env
# then edit .env and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev                # serves at http://localhost:8080 (NOT 5173 — see vite.config.ts)
```

Backend (only needed once, on a fresh Supabase project):
1. Run `supabase-setup.sql` in the Supabase SQL Editor — creates `profiles`, `month_configs`, `entries`, `expenses`, `pricing_plans`, RLS policies, and the new-user trigger.
2. Optionally run `supabase-hardening.sql` afterward — additive, idempotent tightening of write policies plus two missing indexes. Safe to re-run any number of times.
3. Enable whichever OAuth providers you want (Google/GitHub/Apple) under Authentication → Providers in the Supabase dashboard. No extra client env vars are needed for OAuth.

## 4. Commands

| Command | Effect |
|---|---|
| `npm run dev` | Dev server, port 8080, host `::` (all interfaces) |
| `npm run build` | Production build → `dist/` |
| `npm run build:dev` | Unminified build in development mode, useful for debugging a build-only issue |
| `npm run preview` | Serves the built `dist/` locally |
| `npm run lint` | ESLint over the whole repo |
| `npm run test` | `vitest run` — single pass, CI-style |
| `npm run test:watch` | `vitest` in watch mode |
| `npx tsc --noEmit` | Typecheck. There's no npm script alias for this — run it directly. |

Run `tsc --noEmit`, `npm run lint`, and `npm run test` after any non-trivial change, in that order (cheapest/fastest signal first).

## 5. Repository layout

```
src/
  App.tsx                  Root shell: QueryClientProvider, ThemeProvider, AppProvider,
                            BrowserRouter, AppContent. AppContent holds two separate <Routes>
                            trees gated on `session` (see §7 — routing quirk).
  main.tsx                 Entry point, mounts <App/>.
  index.css                Tailwind base + CSS variables (shadcn theme tokens).

  components/
    ui/                     shadcn/ui primitives. Treat these as generated/vendored —
                             prefer re-running the shadcn CLI or composing around them
                             over heavily hand-editing internals.
    import/                 Bulk CSV/Excel import pipeline (see §8 for the full flow).
    SearchModal.tsx          ⌘K command palette — fuse.js fuzzy search + filter chips.
    CalendarHeatmap.tsx, DashboardTrendChart.tsx, WeekdayPatternChart.tsx,
    TopExpensesCard.tsx, PeriodComparisonBadge.tsx, BudgetBar.tsx, StatsCard.tsx,
    EntryCard.tsx            Dashboard/Summary visualization widgets.
    Navbar.tsx, TopNav.tsx, BottomNav.tsx, NavLink.tsx   Nav chrome.
    ConfirmModal.tsx, GymToggle.tsx, ExpenseRow.tsx, OfflineBanner.tsx,
    OAuthButtons.tsx, ThemeToggle.tsx, theme-provider.tsx, FireCanvas.tsx,
    Logo.tsx, Footer.tsx, ScrollToTop.tsx   Misc shared UI.

  context/
    AppContext.tsx           ⭐ Single source of truth for `entries` and `config`.
                              Everything else reads from here. See §7.

  data/
    mockData.ts               DayEntry / Expense / MonthConfig type definitions, plus
                               bundled demo seed data (`initialEntries`, `initialMonthConfig`)
                               used before a user has any real data.
    calculations.ts            Pure functions over DayEntry[] — totals, streaks, trends,
                               period comparisons, formatCurrency(). No side effects;
                               this is the right place for any new derived-stat logic.
    currencies.ts               Supported currency list for the Settings page.

  lib/
    supabase.ts                 Supabase client singleton (reads the two VITE_ env vars).
    db.ts                       IndexedDB layer (idb). Per-user-namespaced databases.
                                See §7 — this is security-critical, read before touching it.
    sync.ts                      Drains one user's offline sync queue against Supabase
                                when connectivity returns.
    utils.ts                     `cn()` classname helper (clsx + tailwind-merge) — shadcn
                                convention, used everywhere instead of manual string concat.

  hooks/
    useOnlineStatus.ts, useDebouncedValue.ts, use-mobile.tsx, use-toast.ts

  pages/                        One component per route: Landing, Login, Register,
                                ForgotPassword, ResetPassword, Dashboard, NewEntry,
                                ViewEntry, EditEntry, SettingsPage, MonthlySummary,
                                Pricing, Contact, PrivacyPolicy, TermsOfService, Admin,
                                NotFound, Index.

  config/
    constants.ts                 APP_INFO, DEVELOPER_INFO, APP_ROUTES, AUTH_ROLES,
                                HIDE_NAV_PATHS (paths that hide the top/bottom nav, e.g.
                                legal pages and the password-reset flow).

  test/
    setup.ts, example.test.ts, parseCSV.test.ts

supabase-setup.sql            Full schema + RLS + triggers. Run once, by hand, in the
                              Supabase SQL Editor on a fresh project.
supabase-hardening.sql        Additive, idempotent hardening on top of the above. Never
                              auto-applied by the app or by tooling — always a manual,
                              reviewed step.
vite.config.ts                Port 8080, PWA plugin/manifest/Workbox config, `@` → `src` alias.
vitest.config.ts              jsdom environment, globals on, setup file, `@` alias mirrored.
playwright.config.ts /
playwright-fixture.ts          Present but non-functional — see §9.
tailwind.config.ts, components.json   Tailwind + shadcn config (base color "slate", `@/`
                              aliases for components/utils/ui/lib/hooks).
eslint.config.js               Flat config: js recommended + typescript-eslint recommended
                              + react-hooks recommended + react-refresh.
.env / .env.example             Two vars only: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
```

## 6. TypeScript & lint conventions

`tsconfig.json` / `tsconfig.app.json` deliberately turn off several safety nets:
`strict: false`, `strictNullChecks: false`, `noImplicitAny: false`, `noUnusedLocals: false`, `noUnusedParameters: false`. This means the compiler will **not** catch null/undefined misuse or unused bindings — code review and runtime testing have to do that work instead. Don't assume `tsc --noEmit` passing means the code is null-safe; it mainly catches type mismatches and missing members.

ESLint (`eslint.config.js`) layers `react-hooks` recommended rules and `react-refresh` on top of the TS defaults, and explicitly turns `@typescript-eslint/no-unused-vars` back **off** (the TS compiler setting above already doesn't enforce it, and the lint config matches that choice rather than fighting it).

Known pre-existing lint errors (not introduced by recent work, still present as of the last verification date above):
- `src/components/ui/textarea.tsx` — empty interface
- `tailwind.config.ts` — require-style import flagged by the TS-aware linter

Path alias: `@/` always resolves to `src/` (configured in `tsconfig*.json`, `vite.config.ts`, and `vitest.config.ts` — keep all three in sync if it ever changes).

Styling/UI conventions:
- All currency display goes through `formatCurrency()` in `data/calculations.ts` (`Intl.NumberFormat`, `en-IN` locale, 0 fraction digits, currency code from `config.currency`). Don't hand-roll a `₹`/`$` prefix.
- Dates are stored and compared as ISO `YYYY-MM-DD` strings; months are `YYYY-MM` (`date.slice(0, 7)`). This is consistent across the whole app — prefer string slicing/comparison over constructing `Date` objects when a sibling function in the same file already does it the string way.
- Accessibility pattern used throughout custom (non-shadcn) interactive elements: `aria-label` on icon-only buttons (dynamic label text for toggle states, e.g. "Show password" / "Hide password"), `aria-pressed` on toggle-style buttons, `aria-expanded` on menu/disclosure toggles, and `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary` Tailwind utilities for a visible keyboard-focus ring. shadcn's own components already bake in their own focus styles — only add this manually to bespoke `<button>`/`<div role="button">` elements.

## 7. Architecture

### 7.1 AppContext is the single source of truth

`src/context/AppContext.tsx` owns two pieces of state — `entries: DayEntry[]` and `config: MonthConfig` — and every page/component reads them via `useAppContext()`. There is no other path to this data; don't introduce a second fetch path to Supabase for entries/config from inside a page component.

Load sequence on mount / auth change:
1. `supabase.auth.onAuthStateChange` fires → resolves `session`, fetches the matching `profiles` row (role/ban status), sets `isInitialized`.
2. Once initialized, `loadOfflineData(userId)` reads cached entries/config out of IndexedDB first (offline-first — this is what the UI shows immediately, even with zero network latency).
3. If online, `fetchConfig()` and `fetchEntries()` then hit Supabase and overwrite both the in-memory state and the IndexedDB cache with the authoritative server data.
4. A separate effect watches `isOnline` and, whenever connectivity flips back on, runs `processSyncQueue()` (drains queued offline writes) followed by a fresh `fetchConfig()`/`fetchEntries()`.

Mutations (`addEntry`, `updateEntry`, `deleteEntry`, `setConfig`, …) are all optimistic: update in-memory state immediately, persist to IndexedDB, then either write straight to Supabase (if online) or push an operation onto the IndexedDB `syncQueue` (if offline) for `lib/sync.ts` to replay later.

### 7.2 "Carry-forward" config defaults

`config.month` must always equal the real current month (`new Date().toISOString().slice(0, 7)`), never a stale cached or bundled-demo value — the Dashboard filters entries by `config.month` and the Monthly Summary defaults its picker from it, so a stale `month` silently shows the wrong month's data under the wrong label. When no `month_configs` row exists yet for the current month, `fetchConfig()` carries forward `dailySpendLimit`/`monthlyBudget`/`currency` from the user's most recently saved month (most people's budget doesn't change every month) while always setting `month` to the real current month. The equivalent offline-cache-miss path in `loadOfflineData` does the same correction. If you add a new piece of per-month config, follow this same pattern rather than letting it silently freeze at the bundled `initialMonthConfig` value from `data/mockData.ts`.

### 7.3 Per-user IndexedDB namespacing (security-critical)

`lib/db.ts` opens a **separate IndexedDB database per user id** (`MyDiaryDB_<uid>`), not one shared database keyed by user id internally. This is the load-bearing fix for cross-account data leakage on a shared/public device: if two different Supabase users sign in on the same browser, there is no shared storage for one account's cached entries, configs, or pending sync-queue operations to leak into the other's session. `logout()` in `AppContext.tsx` also calls `clearAllOfflineData(userId)` to wipe that user's IndexedDB database entirely on sign-out, as defense in depth on top of the namespacing. **Any new offline-cached data must go through `getDB(userId)` in `lib/db.ts`, never a global/shared IndexedDB database** — that would reopen the leak this fix closed.

### 7.4 Routing quirk

`APP_ROUTES.HOME` and `APP_ROUTES.DASHBOARD` are both literally `"/"`. This isn't a bug: `AppContent` in `App.tsx` renders one of two mutually-exclusive `<Routes>` trees depending on whether `session` exists — the signed-out tree maps `"/"` to `Landing`, the signed-in tree maps `"/"` to `Dashboard`. Only one tree is ever mounted at a time, so the path collision never actually causes ambiguity, but a literal grep for `APP_ROUTES.HOME` vs `APP_ROUTES.DASHBOARD` will find the same string — check which `<Routes>` block you're in, not just the constant name.

`HIDE_NAV_PATHS` (in `config/constants.ts`) lists routes that suppress `TopNav`/`BottomNav` (legal pages, password-reset flow, admin). `App.tsx` computes `isLegalPage` via `useLocation()`, which **must** be called unconditionally before any early `return` in `AppContent` — it was previously called after the `loading` early-return, which violates React's rules of hooks (hook call order must be identical across renders). If you refactor `AppContent`, keep every hook call above any conditional return.

### 7.5 Import pipeline

`src/components/import/` turns a user-uploaded CSV or XLSX file into journal entries, with a review/fix step before anything is committed:

```
FileUpload.tsx          → file selected
parseCSV.ts / parseExcel.ts   → file bytes → raw row objects
rowMapping.ts             → raw row → DayEntry-shaped draft (tolerant column-name matching)
dateParsing.ts             → tolerant date-string parsing into the canonical YYYY-MM-DD
expenseParsing.ts          → splits a free-text expense cell into individual Expense line items
validateEntries.ts          → produces ParsedEntry.warnings / .errors / .parseNotes
ImportSection.tsx          → orchestrates the above, renders the preview table
EntryPreviewRow.tsx / ExpensePreviewRow.tsx / ParseSummaryBar.tsx   → review UI
BulkTypeFixer.tsx           → bulk-reclassify ambiguous expense labels as
                             need/want/investment/savings, with a SUGGESTIONS
                             list of generic example labels (rent, groceries,
                             gymMembership, etc.) — keep this list generic; it
                             previously contained a real third party's name and
                             was genericized for privacy (see §8 in CLAUDE.md).
ImportConfirmBar.tsx        → final confirm, hands off to AppContext.addEntry
```
`types.ts` defines `ParsedEntry extends DayEntry` with `status: 'ready' | 'warning' | 'error'`, `warnings`, `parseNotes`, `errors`, `selected`.

## 8. Data model

```ts
interface Expense {
  id: string;
  label: string;
  amount: number;
  type: 'need' | 'want' | 'investment' | 'savings';
}

interface DayEntry {
  id: string;
  date: string;            // 'YYYY-MM-DD'
  day: string;              // e.g. 'Monday' — duplicated for display, not derived at read time
  journalText: string;
  gymAttended: 'yes' | 'no' | 'closed';
  expenses: Expense[];
  notes: string;
  totalSpend: number;       // sum of need+want expenses
  totalInvested: number;    // sum of investment+savings expenses
}

interface MonthConfig {
  month: string;             // 'YYYY-MM'
  dailySpendLimit: number;
  monthlyBudget: number;
  currency: string;          // ISO 4217 code, e.g. 'INR'
}
```

Supabase schema (`supabase-setup.sql`) — five tables, all RLS-enabled, all scoped to `auth.uid() = user_id` except `pricing_plans`:

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id` (= `auth.users.id`), `email`, `full_name`, `phone`, `role`, `is_banned` | Auto-created by the `handle_new_user()` trigger on signup. |
| `month_configs` | `user_id`, `month`, `daily_spend_limit`, `monthly_budget`, `currency` | `UNIQUE(user_id, month)`; written via `upsert(..., onConflict: 'user_id, month')`. The `salary` column still exists on live tables but is no longer read or written by the app — see `supabase-remove-salary-column.sql` for an optional cleanup migration. |
| `entries` | `user_id`, `date`, `day`, `journal_text`, `gym_attended`, `notes`, `total_spend`, `total_invested` | `UNIQUE(user_id, date)`. |
| `expenses` | `user_id`, `entry_id` (FK → `entries.id`), `label`, `amount`, `expense_type` | One row per line item; deleted/re-inserted wholesale on entry update rather than diffed. |
| `pricing_plans` | `name`, `price_monthly`, `price_yearly`, `currency`, `features` (jsonb), `is_active`, `is_popular` | Publicly readable when active; admin-managed otherwise. Supports the `Pricing`/`Admin` UI but isn't core to the journal itself. |

`is_admin()` is a `SECURITY DEFINER` Postgres function checking `profiles.role = 'admin'`, used to break RLS self-recursion on the profiles table. Two of the `profiles` RLS policies also hardcode the original developer's email as a secondary admin bypass alongside `is_admin()` — be aware that promoting/rotating an admin account means editing and re-running that policy in the SQL editor, not just flipping a `role` column.

`supabase-hardening.sql` adds explicit `WITH CHECK` clauses (matching the existing `USING` clauses — functionally a no-op today, but removes reliance on Postgres's implicit fallback), a same-ownership check on `expenses.entry_id`, and two missing foreign-key indexes (`expenses.entry_id`, `expenses.user_id` — Postgres does not auto-index FK columns, and without these, every entry delete/expense fetch does a full table scan as data grows). It's additive and idempotent; re-running it is safe.

## 9. Testing

- `vitest.config.ts`: `jsdom` environment, `globals: true`, setup file `src/test/setup.ts` (imports `@testing-library/jest-dom` matchers, mocks `window.matchMedia`).
- Existing tests: `src/test/example.test.ts` (trivial smoke test) and `src/test/parseCSV.test.ts` (import pipeline).
- **Playwright is not currently functional.** `playwright.config.ts` and `playwright-fixture.ts` both import from `lovable-agent-playwright-config` — a package that is *not* listed in `package.json` and is *not* present in `node_modules`. This is leftover scaffold from the project's original Lovable-generated setup. `npx playwright test` will fail until this is either replaced with a real, self-contained Playwright config or removed. No `*.spec.ts` e2e test files exist yet either way.
- Recommended verification sequence after a change: `npx tsc --noEmit` → `npm run lint` → `npm run test`.

## 10. Known issues / tech debt

- `SettingsPage.tsx`'s local form state (`salary`, `limit`, `budget`, `currency`) is initialized once from `config` at mount via `useState(config.salary.toString())`-style calls — the same class of "stale value captured before an async fetch resolves" bug that was fixed in `MonthlySummary.tsx`'s `selectedMonth`. Lower risk in practice because Settings isn't the app's landing route (so `config` has usually already loaded by the time a user navigates there), but it's a candidate for the same fix if a symptom is ever reported.
- `data/mockData.ts`'s bundled `initialEntries`/`initialMonthConfig` contain the original author's own journal-style demo narrative (place names, routines) used as placeholder content before a real user has data. It's legitimate seed/demo content, but be deliberate about not adding further real personal specifics to this file — it ships in a public repository.
- Two lockfiles exist (`package-lock.json`, `bun.lock`); npm is the actual package manager in use, `bun.lock` is stale and should be left alone (or removed) rather than kept in sync.
- See §9 for the orphaned Playwright scaffold.

## 11. Security & privacy summary

- All user-data tables are RLS-scoped to `auth.uid() = user_id`; this is enforced server-side by Postgres, not just by client-side query filters — a compromised or modified client still can't read another user's rows.
- `.env` holds only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — the anon/public key, by design. Never put a Supabase service-role key (or any other secret meant to stay server-side) into a `VITE_`-prefixed client env var; anything with that prefix is bundled into the client JS and is publicly readable.
- Offline cache is namespaced per user (§7.3) and wiped on logout.

## 12. Do not

- Don't run destructive or ad-hoc SQL directly against a live Supabase project as part of an automated change. Ship schema/policy changes as additive, idempotent `.sql` files for a human to review and run manually — `supabase-hardening.sql` is the template/precedent for this.
- Don't reintroduce real third-party personal names/identifying details as default or sample UI text (this happened once in `BulkTypeFixer.tsx`'s suggestion list and was reverted to generic categories).
- Don't add a dependency with a known unpatched high/critical vulnerability; check `npm audit` before adding anything non-trivial.
- Don't assume `git log`/`HEAD` reflects the current working tree — this repo frequently carries a substantial uncommitted diff between sessions (see `CLAUDE.md` for current state and the project's commit policy).
