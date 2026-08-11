-- Migration 01: Initial Schema Definition (Pure DDL)
-- Created: 2026-08-11

-- 1. Create table platform_b_prices
CREATE TABLE IF NOT EXISTS public.platform_b_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_name TEXT NOT NULL,
    amount_usd NUMERIC NOT NULL,
    amount_tzs NUMERIC NOT NULL,
    trading_hub TEXT NOT NULL,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.platform_b_prices ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for public access
CREATE POLICY "Allow public read access" 
ON public.platform_b_prices FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.platform_b_prices FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.platform_b_prices FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.platform_b_prices FOR DELETE 
USING (true);
