-- ==========================================
-- DAILY JOURNAL — DROP UNUSED `salary` COLUMN (OPTIONAL)
-- ==========================================
-- Context: the "Salary" concept was removed from the app. It now tracks
-- only Monthly Budget, Spending, and Daily Spend Limit. The application
-- code no longer reads or writes `month_configs.salary` as of this
-- change — your existing rows and their salary values are untouched and
-- harmless to leave in place.
--
-- This script is OPTIONAL. Skip it if you'd rather keep the historical
-- column/data around (e.g. in case you want it back later). Only run it
-- if you specifically want to physically drop the now-unused column from
-- your live table.
--
-- Idempotent — IF EXISTS makes this safe to re-run. Run manually in the
-- Supabase SQL Editor; nothing here is applied automatically by the app.

ALTER TABLE public.month_configs DROP COLUMN IF EXISTS salary;
