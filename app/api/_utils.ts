import { NextResponse } from "next/server";

export const TZS_PER_USD = 2600;
export const PRICE_DATE = "2026-08-02";

export const commodities = [
  { commodity: "MAIZE", baseUsdAmount: 42.5, market: "Dar Es Salaam" },
  { commodity: "RICE", baseUsdAmount: 55.2, market: "Arusha (urban)" },
  { commodity: "WHEAT", baseUsdAmount: 38.7, market: "Dodoma" },
  { commodity: "COCOA", baseUsdAmount: 74.9, market: "Mbeya" },
  { commodity: "COFFEE", baseUsdAmount: 68.4, market: "Moshi" }
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
