import { commodities, optionsResponse, randomAmount, withCors } from "../_utils";

export const dynamic = "force-dynamic";

export function GET() {
  const updatedAt = new Date().toISOString();

  return withCors({
    source_name: "Platform B",
    data: commodities.map((item) => ({
      commodity: item.commodity,
      amount: randomAmount(item.baseAmount),
      currency_code: "GHS",
      market: item.market,
      updated_at: updatedAt
    }))
  });
}

export function OPTIONS() {
  return optionsResponse();
}
