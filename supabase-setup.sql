-- Supabase Database Setup Instructions
-- Run these queries in your Supabase SQL Editor.

-- 1. Create a table for Monthly Configurations
CREATE TABLE IF NOT EXISTS month_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    salary NUMERIC NOT NULL DEFAULT 0,
    daily_spend_limit NUMERIC NOT NULL DEFAULT 0,
    monthly_budget NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, month)
);

-- Enable Row Level Security (RLS)
ALTER TABLE month_configs ENABLE ROW LEVEL SECURITY;

-- 2. Create a table for Daily Entries
CREATE TABLE IF NOT EXISTS entries (
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

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- 3. Create a table for Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    expense_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for multi-tenancy (isolated data per user)

-- Policies for month_configs
CREATE POLICY "Users can insert their own month config" ON month_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own month config" ON month_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own month config" ON month_configs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own month config" ON month_configs FOR DELETE USING (auth.uid() = user_id);

-- Policies for entries
CREATE POLICY "Users can insert their own entries" ON entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own entries" ON entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries" ON entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON entries FOR DELETE USING (auth.uid() = user_id);

-- Policies for expenses
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Setup complete!

-- If tables already exist, run this to update:
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'month_configs' AND column_name = 'currency') THEN
        ALTER TABLE month_configs ADD COLUMN currency TEXT NOT NULL DEFAULT 'INR';
    END IF;
END $$;
