"use client";

import { useEffect, useState } from "react";

interface CropQuote {
  id: string;
  crop_name: string;
  amount_tzs: number;
  amount_usd: number;
  trading_hub: string;
  recorded_date: string;
  currency_codes?: {
    local: string;
    reference: string;
  };
  updated_at?: string;
}

export default function PlatformBDashboard() {
  const [quotes, setQuotes] = useState<CropQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceInfo, setSourceInfo] = useState({ source_name: "Platform B", db_source: "Loading..." });
  const [search, setSearch] = useState("");
  const [selectedHub, setSelectedHub] = useState("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<CropQuote | null>(null);
  const [formData, setFormData] = useState({
    crop_name: "MAIZE",
    amount_usd: "43.50",
    amount_tzs: "113100",
    trading_hub: "Dar Es Salaam",
    recorded_date: new Date().toISOString().split("T")[0]
  });

  // API Playground State
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v2/prices");
      const data = await res.json();
      if (data.data) {
        setQuotes(data.data);
      }
      setSourceInfo({
        source_name: data.source_name || "Platform B",
        db_source: data.db_source || "Local Memory"
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleOpenAdd = () => {
    setEditingQuote(null);
    setFormData({
      crop_name: "MAIZE",
      amount_usd: "43.50",
      amount_tzs: (43.5 * 2600).toString(),
      trading_hub: "Dar Es Salaam",
      recorded_date: new Date().toISOString().split("T")[0]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (quote: CropQuote) => {
    setEditingQuote(quote);
    setFormData({
      crop_name: quote.crop_name,
      amount_usd: quote.amount_usd.toString(),
      amount_tzs: quote.amount_tzs.toString(),
      trading_hub: quote.trading_hub,
      recorded_date: quote.recorded_date
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      crop_name: formData.crop_name.toUpperCase(),
      amount_usd: parseFloat(formData.amount_usd),
      amount_tzs: parseFloat(formData.amount_tzs),
      trading_hub: formData.trading_hub,
      recorded_date: formData.recorded_date
    };

    try {
      if (editingQuote) {
        await fetch(`/api/v2/prices?id=${editingQuote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/v2/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      fetchQuotes();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this crop quote?")) return;
    try {
      await fetch(`/api/v2/prices?id=${id}`, { method: "DELETE" });
      fetchQuotes();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const testApi = async () => {
    setApiLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/v2/prices");
      const data = await res.json();
      const end = performance.now();
      setApiLatency(Math.round(end - start));
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.crop_name.toLowerCase().includes(search.toLowerCase()) ||
      q.trading_hub.toLowerCase().includes(search.toLowerCase());
    const matchesHub = selectedHub === "ALL" || q.trading_hub === selectedHub;
    return matchesSearch && matchesHub;
  });

  const uniqueHubs = Array.from(new Set(quotes.map((q) => q.trading_hub)));
  const avgAmountTzs = quotes.length
    ? Math.round(quotes.reduce((acc, q) => acc + q.amount_tzs, 0) / quotes.length)
    : 0;

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Top Header */}
      <header className="card-container" style={{ padding: "22px 28px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
              <span style={{ color: "var(--accent-indigo)" }}>Kilimo</span> Quote Portal
            </h1>
            <span className="pill-tag pill-indigo">API v2 ACTIVE</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
            Platform B Regional Quotes • Route: <code className="code-font" style={{ color: "#a5b4fc" }}>GET /api/v2/prices</code>
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="pill-tag pill-cyan" style={{ marginBottom: 6 }}>
            Supabase: Publishable Key Connected
          </span>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            DB Source: <strong style={{ color: "#fff" }}>{sourceInfo.db_source}</strong>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="card-container" style={{ padding: 22 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Total Crop Quotes</div>
          <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, color: "#a5b4fc" }}>{quotes.length}</div>
        </div>
        <div className="card-container" style={{ padding: 22 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Trading Hubs</div>
          <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, color: "#67e8f9" }}>{uniqueHubs.length}</div>
        </div>
        <div className="card-container" style={{ padding: 22 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Avg Crop Quote (TZS)</div>
          <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, color: "#c084fc" }}>TZS {avgAmountTzs.toLocaleString()}</div>
        </div>
        <div className="card-container" style={{ padding: 22 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Supported Currencies</div>
          <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, color: "#f472b6" }}>TZS & USD</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card-container" style={{ padding: 28, marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search crop or trading hub..."
              className="input-field"
              style={{ width: 270 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="input-field"
              style={{ width: 190 }}
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
            >
              <option value="ALL">All Trading Hubs</option>
              {uniqueHubs.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-ghost" onClick={fetchQuotes}>
              Refresh Quotes
            </button>
            <button className="btn-indigo" onClick={handleOpenAdd}>
              + Add Crop Quote
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>Loading v2 quotes...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="quote-table">
              <thead>
                <tr>
                  <th>Crop Name</th>
                  <th>Amount (TZS)</th>
                  <th>Amount (USD)</th>
                  <th>Trading Hub</th>
                  <th>Recorded Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text-secondary)" }}>
                      No crop quotes found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <strong style={{ color: "#a5b4fc", fontSize: 15 }}>{q.crop_name}</strong>
                      </td>
                      <td className="code-font" style={{ fontWeight: 700 }}>
                        TZS {q.amount_tzs.toLocaleString()}
                      </td>
                      <td className="code-font" style={{ color: "var(--text-secondary)" }}>
                        ${q.amount_usd.toFixed(2)}
                      </td>
                      <td>
                        <span className="pill-tag pill-cyan">{q.trading_hub}</span>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{q.recorded_date}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn-ghost"
                          style={{ padding: "6px 14px", fontSize: 12, marginRight: 8 }}
                          onClick={() => handleOpenEdit(q)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-del"
                          onClick={() => handleDelete(q.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* API v2 Inspector Playground */}
      <div className="card-container" style={{ padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>API v2 Inspector Playground</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              Execute live HTTP test request on Platform B endpoint <code className="code-font">GET /api/v2/prices</code>.
            </p>
          </div>
          <button className="btn-indigo" onClick={testApi} disabled={apiLoading}>
            {apiLoading ? "Sending..." : "Execute GET /api/v2/prices"}
          </button>
        </div>

        {apiResponse && (
          <div>
            <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              <span className="pill-tag pill-indigo">Response 200 OK</span>
              {apiLatency !== null && <span className="pill-tag pill-cyan">Latency: {apiLatency} ms</span>}
            </div>
            <pre
              className="code-font"
              style={{
                background: "#070a12",
                padding: 18,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                maxHeight: 290,
                overflowY: "auto",
                fontSize: 13,
                color: "#a5b4fc"
              }}
            >
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Add / Edit Quote Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 style={{ fontSize: 20, marginBottom: 22, color: "#a5b4fc", fontWeight: 800 }}>
              {editingQuote ? "Edit Crop Quote" : "New Crop Quote"}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>
                  Crop Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.crop_name}
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                  placeholder="e.g. MAIZE, RICE, WHEAT"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={formData.amount_usd}
                    onChange={(e) => {
                      const usd = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        amount_usd: e.target.value,
                        amount_tzs: (usd * 2600).toFixed(2)
                      });
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>
                    Amount (TZS)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={formData.amount_tzs}
                    onChange={(e) => setFormData({ ...formData, amount_tzs: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>
                    Trading Hub
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.trading_hub}
                    onChange={(e) => setFormData({ ...formData, trading_hub: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>
                    Recorded Date
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.recorded_date}
                    onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 26 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-indigo">
                  {editingQuote ? "Update Quote" : "Create Quote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
