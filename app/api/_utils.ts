import { NextResponse } from "next/server";

export const commodities = [
  { commodity: "MAIZE", baseAmount: 510.0, market: "Accra" },
  { commodity: "RICE", baseAmount: 662.4, market: "Kumasi" },
  { commodity: "WHEAT", baseAmount: 464.4, market: "Tamale" },
  { commodity: "COCOA", baseAmount: 898.8, market: "Sunyani" },
  { commodity: "COFFEE", baseAmount: 820.8, market: "Takoradi" }
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

export function randomAmount(baseAmount: number) {
  const change = 1 + (Math.random() - 0.5) * 0.08;
  return Number((baseAmount * change).toFixed(2));
}
