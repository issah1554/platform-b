-- Platform B Supabase Database Schema for Crop Quote Data

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

-- 3. Create RLS policies for public access (read, insert, update, delete)
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

-- 4. Seed initial market quotes for Platform B
INSERT INTO public.platform_b_prices (crop_name, amount_usd, amount_tzs, trading_hub, recorded_date)
VALUES 
    ('MAIZE', 43.50, 113100.00, 'Dar Es Salaam', '2026-07-29'),
    ('RICE',  54.40, 141440.00, 'Arusha (urban)', '2026-07-30'),
    ('WHEAT', 39.30, 102180.00, 'Dodoma',        '2026-07-31'),
    ('COCOA', 76.10, 197860.00, 'Mbeya',         '2026-08-01'),
    ('COFFEE',67.20, 174720.00, 'Moshi',         '2026-08-02')
ON CONFLICT DO NOTHING;
