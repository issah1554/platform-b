import { NextResponse } from "next/server";

export const TZS_PER_USD = 2600;

export const commodities = [
  { commodity: "MAIZE", baseUsdAmount: 43.5, market: "Dar Es Salaam", priceDate: "2026-07-29" },
  { commodity: "RICE", baseUsdAmount: 54.4, market: "Arusha (urban)", priceDate: "2026-07-30" },
  { commodity: "WHEAT", baseUsdAmount: 39.3, market: "Dodoma", priceDate: "2026-07-31" },
  { commodity: "COCOA", baseUsdAmount: 76.1, market: "Mbeya", priceDate: "2026-08-01" },
  { commodity: "COFFEE", baseUsdAmount: 67.2, market: "Moshi", priceDate: "2026-08-02" }
] as const;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export function withCors<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...init?.headers
    }
  });
}

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export function toTzs(usdAmount: number) {
  return Number((usdAmount * TZS_PER_USD).toFixed(2));
}
