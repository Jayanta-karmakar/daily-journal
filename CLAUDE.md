# CLAUDE.md

Operating notes for Claude (Claude Code / Cowork / any Claude-based agent session) working in this repository. This file covers agent-specific rules, institutional history, and a quick orientation; the full technical reference — stack, architecture, data model, conventions, known issues — lives in **`AGENTS.md`**. Read that one too; this file deliberately doesn't repeat it.

_Last verified against the repo: 2026-06-21._

## 1. What this is, in one paragraph

A single-owner personal daily-journal + budget-tracker + gym-habit-tracker PWA ("MyDiary"), React/TypeScript/Vite on the frontend, Supabase (Postgres + Auth + RLS) on the backend, offline-first via a per-user IndexedDB cache with a manual sync queue. Public GitHub repo, single `main` branch, deployed (Vercel Analytics is wired in). It is a real app with a real user's real journal/financial/health data flowing through it — treat data handling, privacy, and anything touching the live backend with real caution, not as a toy project.

## 2. Standing operating rules

These apply to every session in this repo, regardless of what's asked, and don't expire when a task completes:

- **Never run `git commit` or `git push`, and never publish/deploy anything, without the user explicitly saying so in that conversation.** Completing a task does not imply permission to commit it. As of the last verification date above, this repo's working tree carries a substantial uncommitted diff (see §5) — that's normal here, not a sign something went wrong.
- **Never connect to, query, or run anything against the live Supabase backend.** No live reads, no live writes, no "let me just check the data" via the Supabase client or dashboard. All backend reasoning happens by reading `supabase-setup.sql` / `supabase-hardening.sql` and the application code that calls Supabase, not by hitting the actual project.
- **Never read, print, log, or otherwise surface the real values inside `.env`.** It's fine to confirm which keys exist (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) or to redact-and-check, but never echo the actual values into chat, a file, or a shell command's visible output.
- **Any backend/SQL change ships as a new additive, idempotent `.sql` file** for the user to review and run by hand in the Supabase SQL editor — never auto-applied, never destructive-by-default. `supabase-hardening.sql` is the precedent/template.
- **Never add a dependency with a known unpatched high/critical vulnerability.** Check before adding anything non-trivial (e.g. compare `npm audit` before/after, or check the advisory database for a new package).
- **Never leave a real person's personal data — names, specific financial relationships, contact details, etc. — embedded in a permanent repository file**, including in "example"/"suggestion" UI text. This already happened once (a real third party's name in a suggested-expense-label list in `BulkTypeFixer.tsx`) and was reverted to generic categories. Bundled demo/seed data in `data/mockData.ts` is treated as legitimate pre-existing content, but don't add to it.
- Don't put the repo owner's name or email into files that live in this public repo (this file and `AGENTS.md` deliberately avoid doing so) unless the user asks you to.

## 3. Verification checklist

Before describing any non-trivial change as done, run:

```bash
npx tsc --noEmit
npm run lint            # or scope it: npx eslint <changed files>
npm run test            # npx vitest run
```

Compare warning/error counts against the known-pre-existing baseline in `AGENTS.md` §6 and §10 (2 pre-existing lint errors in untouched files; a handful of `react-hooks/exhaustive-deps` and `react-refresh/only-export-components` warnings) — the bar is "no *new* errors and no *new* warnings in files you touched," not "zero warnings repo-wide," since the baseline already isn't zero. Vitest currently has very few tests (an example smoke test + one import-pipeline test), so a clean test run is a weak signal on its own — pair it with manual reasoning about the change, or a quick `npm run dev` check, for anything UI-visible.

## 4. Orientation — where things live

If you're picking this up cold, the highest-value files to read first are:

- `src/context/AppContext.tsx` — everything funnels through here; read this before touching data flow, auth, or sync.
- `src/lib/db.ts` and `src/lib/sync.ts` — the offline cache and sync queue. Security-sensitive (per-user namespacing — see `AGENTS.md` §7.3).
- `src/data/mockData.ts` — type definitions (`DayEntry`, `Expense`, `MonthConfig`) live here alongside the bundled demo data; don't confuse the two.
- `src/data/calculations.ts` — all derived-stat logic (totals, streaks, trends, comparisons). Add new dashboard metrics here, not inline in a page component.
- `src/App.tsx` + `src/config/constants.ts` — routing, including the `HOME`/`DASHBOARD` path-collision quirk explained in `AGENTS.md` §7.4.
- `supabase-setup.sql` / `supabase-hardening.sql` — the entire backend schema and security model, in plain SQL, no migration tool in between.

## 5. Current repo state (uncommitted work)

As of the last verification date, the working tree has an extensive uncommitted diff spanning: a hardened bulk-import pipeline (`components/import/*`), new dashboard visualizations (`CalendarHeatmap`, `DashboardTrendChart`, `WeekdayPatternChart`, `TopExpensesCard`, `PeriodComparisonBadge`), an improved fuzzy `SearchModal`, an accessibility pass across many pages/components (aria-labels, focus-visible rings), a cross-account IndexedDB data-isolation fix (`lib/db.ts` per-user namespacing), a `supabase-hardening.sql` addition, and a fix for `config.month` defaulting to a stale bundled month instead of the real current month (`AppContext.tsx` carry-forward logic + `MonthlySummary.tsx`'s `selectedMonth` initializer). None of this has been committed or pushed. **Don't assume `git log`/`HEAD` reflects what's actually in the working tree** — always check `git status`/`git diff` rather than the commit history when you need to know the current state of a file.

If/when the user does ask for a commit, note the existing commit style in this repo is informal and inconsistent (mix of Conventional-Commits-flavored messages like `feat: ...` and plain ones like `log`, `admin panal`) — there's no enforced convention to match, but defaulting to a clear, conventional-style message (`feat:`, `fix:`, `chore:`) is a reasonable default unless told otherwise. There is no CI workflow (no `.github/workflows`) and no `vercel.json` in the repo, so there's nothing automated to satisfy beyond the manual checklist in §3.

## 6. Pitfalls specific to this codebase

- **Stale value captured from an async source via `useState(someAsyncThing)`.** This bit `MonthlySummary.tsx`'s `selectedMonth` (initialized from `config.month` before `AppContext`'s async fetch had resolved, freezing on a stale value) and the same pattern still exists, lower-risk, in `SettingsPage.tsx`'s form fields. When you see `useState(x)` where `x` comes from context/props that load asynchronously, ask whether the initial value can ever be observed stale, and prefer a lazy initializer that computes a synchronously-correct value (e.g. `useState(() => new Date()...)`) over trusting the prop/context to already be populated at first render.
- **Rules-of-hooks ordering around early returns.** `AppContent` in `App.tsx` had a `useLocation()` call positioned after a conditional `if (loading) return ...`. Any hook call must execute unconditionally, in the same order, on every render — when editing a component with early returns, double check every hook call sits above all of them.
- **IndexedDB must stay namespaced per user.** Any new offline-cached data type goes through `getDB(userId)` in `lib/db.ts`. A shared/global IndexedDB database here would reopen the cross-account leak that namespacing was built to close.
- **`config.month` must always resolve to the real current month**, never a frozen bundled-default or stale cache value, even before any per-month data has been saved. See `AGENTS.md` §7.2 for the carry-forward pattern this app uses to do that without losing budget continuity month to month.

## 7. When in doubt

Prefer reading the actual source over inferring behavior from naming — this codebase has a few quirks (the `HOME`/`DASHBOARD` route collision, the orphaned Playwright config, two coexisting lockfiles) that look like bugs from the name alone but are either intentional or merely inert. `AGENTS.md` documents the ones already found; if you find a new one, it's worth a one-line addition there rather than silently working around it.
