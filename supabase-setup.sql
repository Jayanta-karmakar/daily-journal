-- ==========================================
-- DAILY JOURNAL & BUDGET TRACKER SETUP
-- ==========================================
-- This script sets up the entire database architecture for the Daily Journal app.
-- Run this in your Supabase SQL Editor.

-- ==========================================
-- 1. TABLES DEFINITIONS
-- ==========================================

-- User Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_banned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Monthly Budget Configurations
CREATE TABLE IF NOT EXISTS public.month_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: YYYY-MM
    salary NUMERIC NOT NULL DEFAULT 0,
    daily_spend_limit NUMERIC NOT NULL DEFAULT 0,
    monthly_budget NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, month)
);

-- Daily Journal Entries
CREATE TABLE IF NOT EXISTS public.entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day TEXT NOT NULL,
    journal_text TEXT NOT NULL,
    gym_attended TEXT NOT NULL,
    notes TEXT,
    total_spend NUMERIC NOT NULL DEFAULT 0,
    total_invested NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Expenses related to specific entries
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    expense_type TEXT NOT NULL, -- e.g., 'need', 'want', 'investment'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pricing Plans (Managed by Admin)
CREATE TABLE IF NOT EXISTS public.pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly NUMERIC NOT NULL,
    price_yearly NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. SECURITY & UTILITY FUNCTIONS
-- ==========================================

-- Function to check if the current user is an admin 
-- (Uses SECURITY DEFINER to bypass RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create a profile for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_banned)
  VALUES (new.id, new.email, 'user', false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. TRIGGERS
-- ==========================================

-- Trigger to handle new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.month_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- 4a. Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can update profiles" ON profiles FOR UPDATE USING (public.is_admin());

-- 4b. Month Configs Policies
CREATE POLICY "Users can manage their own month config" ON month_configs 
    FOR ALL USING (auth.uid() = user_id);

-- 4c. Entries Policies
CREATE POLICY "Users can manage their own entries" ON entries 
    FOR ALL USING (auth.uid() = user_id);

-- 4d. Expenses Policies
CREATE POLICY "Users can manage their own expenses" ON expenses 
    FOR ALL USING (auth.uid() = user_id);

-- 4e. Pricing Plans Policies
CREATE POLICY "Anyone can view active pricing plans" ON pricing_plans 
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage all pricing plans" ON pricing_plans 
    FOR ALL USING (public.is_admin());

-- ==========================================
-- 5. INITIAL DATA & BACKFILLS
-- ==========================================

-- Backfill missing profiles for existing Auth users
INSERT INTO public.profiles (id, email, role, is_banned)
SELECT id, email, 'user', false
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Optionally insert default pricing plans
-- INSERT INTO public.pricing_plans (name, description, price_monthly, price_yearly, currency, features)
-- VALUES ('Free', 'Basic journal for everyone', 0, 0, 'INR', '["Daily Journal", "Basic Analytics"]');
