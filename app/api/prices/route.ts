import { commodities, optionsResponse, randomUsdAmount, toTzs, withCors } from "../_utils";

export const dynamic = "force-dynamic";

export function GET() {
  const updatedAt = new Date().toISOString();

  return withCors({
    source_name: "Platform B",
    data: commodities.map((item) => {
      const amountUsd = randomUsdAmount(item.baseUsdAmount);

      return {
        commodity: item.commodity,
        amount_tzs: toTzs(amountUsd),
        amount_usd: amountUsd,
        currency_codes: {
          local: "TZS",
          reference: "USD"
        },
        market: item.market,
        updated_at: updatedAt
      };
    })
  });
}

export function OPTIONS() {
  return optionsResponse();
}
