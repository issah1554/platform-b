import { supabase, isSupabaseConfigured } from "../../../lib/supabase";
import { commodities, optionsResponse, toTzs, withCors } from "../_utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("market_prices")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return withCors({
          source_name: "Platform B",
          db_source: "Supabase DB (platform-b)",
          data: data.map((item) => ({
            commodity: item.commodity,
            amount_tzs: Number(item.amount_tzs),
            amount_usd: Number(item.amount_usd),
            currency_codes: {
              local: "TZS",
              reference: "USD"
            },
            market: item.market,
            price_date: item.price_date,
            updated_at: updatedAt
          }))
        });
      }
    } catch (err) {
      console.error("Platform B Supabase fetch error:", err);
    }
  }

  // Fallback to local mock data if Supabase is not configured or returns no rows
  return withCors({
    source_name: "Platform B",
    db_source: "Mock Data (fallback)",
    data: commodities.map((item) => {
      const amountUsd = item.baseUsdAmount;

      return {
        commodity: item.commodity,
        amount_tzs: toTzs(amountUsd),
        amount_usd: amountUsd,
        currency_codes: {
          local: "TZS",
          reference: "USD"
        },
        market: item.market,
        price_date: item.priceDate,
        updated_at: updatedAt
      };
    })
  });
}

export function OPTIONS() {
  return optionsResponse();
}
