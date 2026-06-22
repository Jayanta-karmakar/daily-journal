-- ==========================================
-- DAILY JOURNAL — SECURITY & PERFORMANCE HARDENING
-- ==========================================
-- This is an ADDITIVE, idempotent script. It does not modify or remove
-- anything from supabase-setup.sql — it only tightens existing RLS
-- policies and adds a few missing indexes. Safe to re-run any number of
-- times. Run this manually in the Supabase SQL Editor; nothing here is
-- applied automatically by the app.
--
-- Context: the app code was audited for cross-account data isolation.
-- Supabase RLS was already correctly scoping every table to
-- `auth.uid() = user_id`, so there is no known active data leak at the
-- database level. The items below close a few gaps that don't matter
-- today but are easy to get wrong later (e.g. if a policy is ever split
-- into separate SELECT/INSERT/UPDATE/DELETE policies), plus two missing
-- indexes that matter for performance as your data grows.

-- ==========================================
-- 1. EXPLICIT WITH CHECK on write policies
-- ==========================================
-- Each policy below was originally written as:
--   FOR ALL USING (auth.uid() = user_id)
-- Postgres already reuses the USING expression as the WITH CHECK
-- expression when none is given, so writes ARE already constrained to
-- your own user_id today. Making WITH CHECK explicit just removes any
-- reliance on that implicit fallback, so the constraint can't silently
-- disappear if someone later edits these into separate per-action
-- policies.

DROP POLICY IF EXISTS "Users can manage their own month config" ON public.month_configs;
CREATE POLICY "Users can manage their own month config" ON public.month_configs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own entries" ON public.entries;
CREATE POLICY "Users can manage their own entries" ON public.entries
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Expenses get a slightly stronger check: it's not enough that the
-- expense row's own user_id matches you — the entry_id it points to
-- must also belong to one of your own entries. Without this, a user
-- could in principle insert an expense row (passing RLS because its
-- own user_id is theirs) whose entry_id points at someone else's entry
-- row. That row would never actually be visible to either party
-- (RLS on both tables still independently hides it), so this isn't an
-- exploitable leak today — but it's free to close and avoids leaving
-- orphaned/cross-referenced rows in the table.
DROP POLICY IF EXISTS "Users can manage their own expenses" ON public.expenses;
CREATE POLICY "Users can manage their own expenses" ON public.expenses
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.entries e
            WHERE e.id = expenses.entry_id
              AND e.user_id = auth.uid()
        )
    );

-- ==========================================
-- 2. MISSING INDEXES
-- ==========================================
-- entries(user_id, date) and month_configs(user_id, month) are already
-- covered by their UNIQUE constraints, which Postgres backs with a
-- unique B-tree index — no extra index needed there.
--
-- expenses.entry_id and expenses.user_id are foreign keys, but Postgres
-- does NOT automatically index foreign key columns. Without an index,
-- every "delete an entry" cascades into a full table scan of expenses
-- to find matching rows, and every per-entry expense fetch does the
-- same. This matters more as a journal accumulates years of entries.

CREATE INDEX IF NOT EXISTS idx_expenses_entry_id ON public.expenses (entry_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses (user_id);

-- ==========================================
-- 3. VERIFICATION QUERIES (read-only, safe to run)
-- ==========================================
-- After running the above, you can sanity-check RLS is actually
-- enabled everywhere it should be:
--
-- SELECT relname, relrowsecurity FROM pg_class
-- WHERE relname IN ('profiles','month_configs','entries','expenses','pricing_plans');
--
-- All five should show relrowsecurity = true.
