import { readFile } from "node:fs/promises";
import path from "node:path";
import { supabase, isSupabaseConfigured } from "../../../lib/supabase";
import { optionsResponse, withCors } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BATCH_SIZE = 500;

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function toNum(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST() {
  if (!isSupabaseConfigured || !supabase) {
    return withCors(
      { success: false, error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY." },
      { status: 503 }
    );
  }

  try {
    const filePath = path.join(process.cwd(), "data", "platform_b_fabricated_prices.csv");
    const csv = await readFile(filePath, "utf8");
    const lines = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
    const [headerLine, ...dataLines] = lines;
    const headers = parseCSVLine(headerLine);

    const colIdx = (name: string) => headers.indexOf(name);
    const iCrop = colIdx("crop_name");
    const iUsd = colIdx("amount_usd");
    const iTzs = colIdx("amount_tzs");
    const iHub = colIdx("trading_hub");
    const iDate = colIdx("recorded_date");

    let inserted = 0;
    let errors = 0;

    for (let start = 0; start < dataLines.length; start += BATCH_SIZE) {
      const rows = dataLines
        .slice(start, start + BATCH_SIZE)
        .filter((line) => line.trim().length > 0)
        .map((line) => {
          const cols = parseCSVLine(line);

          return {
            crop_name: String(cols[iCrop] || "CROP").trim().toUpperCase(),
            amount_usd: toNum(cols[iUsd]),
            amount_tzs: toNum(cols[iTzs]),
            trading_hub: cols[iHub],
            recorded_date: cols[iDate]
          };
        });

      if (rows.length === 0) continue;

      const { error } = await supabase
        .from("platform_b_prices")
        .insert(rows);

      if (error) {
        console.error(`Batch ${start}-${start + BATCH_SIZE} error:`, error.message);
        errors += rows.length;
      } else {
        inserted += rows.length;
      }
    }

    return withCors({
      success: true,
      total_rows: dataLines.filter((line) => line.trim()).length,
      inserted,
      errors,
      table: "platform_b_prices",
      csv: "data/platform_b_fabricated_prices.csv",
      message: `Seeding complete. ${inserted} fabricated rows inserted into platform_b_prices.`
    });
  } catch (err: any) {
    console.error("Seed error:", err);
    return withCors({ success: false, error: err.message }, { status: 500 });
  }
}

export function OPTIONS() {
  return optionsResponse();
}
