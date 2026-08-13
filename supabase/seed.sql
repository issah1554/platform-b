-- Platform B Initial Seed Data
-- Populate initial crop quotes into platform_b_prices

-- Extra fabricated 3-year weekly CSV data is stored at:
--   data/platform_b_fabricated_prices.csv
-- It can be regenerated with:
--   node scripts/generate-platform-b-fabricated-prices.js
-- You can load it with:
--   curl -X POST http://localhost:3002/api/seed-fabricated
-- or by clicking "Seed Fabricated CSV" in the dashboard.

INSERT INTO public.platform_b_prices (crop_name, amount_usd, amount_tzs, trading_hub, recorded_date)
VALUES 
    ('MAIZE', 43.50, 113100.00, 'Dar Es Salaam', '2026-07-29'),
    ('RICE',  54.40, 141440.00, 'Arusha (urban)', '2026-07-30'),
    ('WHEAT', 39.30, 102180.00, 'Dodoma',        '2026-07-31'),
    ('COCOA', 76.10, 197860.00, 'Mbeya',         '2026-08-01'),
    ('COFFEE',67.20, 174720.00, 'Moshi',         '2026-08-02')
ON CONFLICT DO NOTHING;
