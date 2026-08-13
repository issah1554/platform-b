const { mkdirSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const TZS_PER_USD = 2600;
const startDate = new Date("2023-08-14T00:00:00Z");
const endDate = new Date("2026-08-10T00:00:00Z");

const commodities = [
  { name: "MAIZE", baseUsd: 42.8 },
  { name: "RICE", baseUsd: 58.4 },
  { name: "BEANS", baseUsd: 64.2 },
  { name: "WHEAT", baseUsd: 41.6 },
  { name: "SORGHUM", baseUsd: 34.1 },
  { name: "CASSAVA", baseUsd: 24.6 },
  { name: "POTATO", baseUsd: 29.2 },
  { name: "GROUNDNUT", baseUsd: 69.5 },
  { name: "SUNFLOWER", baseUsd: 52.7 },
  { name: "COFFEE", baseUsd: 74.3 },
  { name: "CASHEW", baseUsd: 82.1 },
  { name: "COCONUT", baseUsd: 71.4 }
];

const hubs = [
  { name: "Dar Es Salaam Wholesale", premium: 1.03 },
  { name: "Mwanza Central Hub", premium: 0.98 },
  { name: "Arusha North Hub", premium: 1.06 },
  { name: "Dodoma Wholesale Hub", premium: 1.01 },
  { name: "Mbeya Border Market", premium: 0.96 },
  { name: "Tanga Coastal Exchange", premium: 1.02 },
  { name: "Tabora Grain Yard", premium: 0.94 },
  { name: "Kigoma Lake Hub", premium: 1.05 }
];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function seasonalFactor(date, commodityIndex) {
  const month = date.getUTCMonth();
  const wave = Math.sin(((month + commodityIndex) / 12) * Math.PI * 2);
  return 1 + wave * 0.08;
}

function trendFactor(date) {
  const days = Math.round((date - startDate) / 86400000);
  return 1 + (days / 365) * 0.035;
}

function deterministicNoise(date, commodityIndex, hubIndex) {
  const day = Math.round(date.getTime() / 86400000);
  const raw = Math.sin(day * 12.9898 + commodityIndex * 78.233 + hubIndex * 37.719);
  return 1 + (raw - Math.floor(raw)) * 0.08 - 0.04;
}

const lines = ["crop_name,amount_usd,amount_tzs,trading_hub,recorded_date"];

for (let date = new Date(startDate); date <= endDate; date.setUTCDate(date.getUTCDate() + 7)) {
  commodities.forEach((commodity, commodityIndex) => {
    hubs.forEach((hub, hubIndex) => {
      const amountUsd =
        commodity.baseUsd *
        hub.premium *
        seasonalFactor(date, commodityIndex) *
        trendFactor(date) *
        deterministicNoise(date, commodityIndex, hubIndex);
      const roundedUsd = Number(amountUsd.toFixed(2));
      const roundedTzs = Number((roundedUsd * TZS_PER_USD).toFixed(2));

      lines.push([
        commodity.name,
        roundedUsd.toFixed(2),
        roundedTzs.toFixed(2),
        hub.name,
        formatDate(date)
      ].join(","));
    });
  });
}

const outDir = path.join(process.cwd(), "data");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "platform_b_fabricated_prices.csv"), `${lines.join("\n")}\n`);

console.log(`Generated ${lines.length - 1} rows in data/platform_b_fabricated_prices.csv`);
