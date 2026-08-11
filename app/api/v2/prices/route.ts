import { supabase, isSupabaseConfigured } from "../../../../lib/supabase";
import { commodities, optionsResponse, toTzs, withCors } from "../../_utils";

export const dynamic = "force-dynamic";

interface LocalQuoteItem {
  id: string;
  crop_name: string;
  amount_tzs: number;
  amount_usd: number;
  trading_hub: string;
  recorded_date: string;
}

let localQuotes: LocalQuoteItem[] = commodities.map((c, index) => ({
  id: `local-b-${index + 1}`,
  crop_name: c.commodity,
  amount_tzs: toTzs(c.baseUsdAmount),
  amount_usd: c.baseUsdAmount,
  trading_hub: c.market,
  recorded_date: c.priceDate
}));

export async function GET() {
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("platform_b_prices")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return withCors({
          source_name: "Platform B (v2 API)",
          db_source: "Supabase DB (platform_b_prices)",
          version: "v2",
          data: data.map((item) => ({
            id: item.id,
            crop_name: item.crop_name ?? item.commodity ?? "MAIZE",
            amount_tzs: Number(item.amount_tzs),
            amount_usd: Number(item.amount_usd),
            currency_codes: {
              local: "TZS",
              reference: "USD"
            },
            trading_hub: item.trading_hub ?? item.market ?? "Dar Es Salaam",
            recorded_date: item.recorded_date ?? item.price_date,
            updated_at: updatedAt
          }))
        });
      }
    } catch (err) {
      console.error("Platform B Supabase fetch error:", err);
    }
  }

  return withCors({
    source_name: "Platform B (v2 API)",
    db_source: "Local Memory (Platform B)",
    version: "v2",
    data: localQuotes.map((item) => ({
      ...item,
      currency_codes: {
        local: "TZS",
        reference: "USD"
      },
      updated_at: updatedAt
    }))
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { crop_name, amount_usd, amount_tzs, trading_hub, recorded_date } = body;

    const usdVal = Number(amount_usd ?? 0);
    const tzsVal = Number(amount_tzs ?? toTzs(usdVal));
    const cropVal = String(crop_name || "CROP").toUpperCase();
    const hubVal = String(trading_hub || "Dar Es Salaam");
    const dateVal = recorded_date || new Date().toISOString().split("T")[0];

    let createdRecord = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("platform_b_prices")
        .insert({
          crop_name: cropVal,
          amount_usd: usdVal,
          amount_tzs: tzsVal,
          trading_hub: hubVal,
          recorded_date: dateVal
        })
        .select("*")
        .single();

      if (!error && data) {
        createdRecord = data;
      } else if (error) {
        console.error("Supabase insert error:", error);
      }
    }

    if (!createdRecord) {
      createdRecord = {
        id: `local-b-${Date.now()}`,
        crop_name: cropVal,
        amount_usd: usdVal,
        amount_tzs: tzsVal,
        trading_hub: hubVal,
        recorded_date: dateVal
      };
      localQuotes.unshift(createdRecord);
    }

    return withCors({ success: true, record: createdRecord }, { status: 201 });
  } catch (err: any) {
    return withCors({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return withCors({ success: false, error: "Missing 'id' parameter" }, { status: 400 });
    }

    let updatedRecord = null;

    if (isSupabaseConfigured && supabase && !id.startsWith("local-b-")) {
      const { data, error } = await supabase
        .from("platform_b_prices")
        .update({
          crop_name: body.crop_name,
          amount_usd: Number(body.amount_usd),
          amount_tzs: Number(body.amount_tzs),
          trading_hub: body.trading_hub,
          recorded_date: body.recorded_date,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .single();

      if (!error && data) {
        updatedRecord = data;
      }
    }

    const idx = localQuotes.findIndex((item) => item.id === id);
    if (idx !== -1) {
      localQuotes[idx] = {
        ...localQuotes[idx],
        ...body,
        amount_usd: Number(body.amount_usd ?? localQuotes[idx].amount_usd),
        amount_tzs: Number(body.amount_tzs ?? localQuotes[idx].amount_tzs)
      };
      updatedRecord = localQuotes[idx];
    }

    return withCors({ success: true, record: updatedRecord || body });
  } catch (err: any) {
    return withCors({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return withCors({ success: false, error: "Missing 'id' parameter" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase && !id.startsWith("local-b-")) {
      await supabase.from("platform_b_prices").delete().eq("id", id);
    }

    localQuotes = localQuotes.filter((item) => item.id !== id);

    return withCors({ success: true, deletedId: id });
  } catch (err: any) {
    return withCors({ success: false, error: err.message }, { status: 400 });
  }
}

export function OPTIONS() {
  return optionsResponse();
}
