-- Platform B Supabase Database Schema for Market Prices

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    commodity TEXT NOT NULL,
    amount_usd NUMERIC NOT NULL,
    amount_tzs NUMERIC NOT NULL,
    market TEXT NOT NULL,
    price_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for anonymous/public access (read & write)
CREATE POLICY "Allow public read access" 
ON public.market_prices FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.market_prices FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.market_prices FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.market_prices FOR DELETE 
USING (true);

-- 4. Seed initial market prices for Platform B
INSERT INTO public.market_prices (commodity, amount_usd, amount_tzs, market, price_date)
VALUES 
    ('MAIZE', 43.50, 113100.00, 'Dar Es Salaam', '2026-07-29'),
    ('RICE',  54.40, 141440.00, 'Arusha (urban)', '2026-07-30'),
    ('WHEAT', 39.30, 102180.00, 'Dodoma',        '2026-07-31'),
    ('COCOA', 76.10, 197860.00, 'Mbeya',         '2026-08-01'),
    ('COFFEE',67.20, 174720.00, 'Moshi',         '2026-08-02')
ON CONFLICT DO NOTHING;
