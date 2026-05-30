import { useState, useEffect } from "react";
import { useAuth } from "../context/Sultan";

export function Sales() {
  const { apiFetch } = useAuth();
  const [sales, setSales] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    apiFetch(`/pharmacy/sales?${q}`)
      .then((d) => {
        setSales(d.sales || []);
        setRevenue(d.totalRevenue || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 24 }}>
        <p style={S.eyebrow}>Pharmacy</p>
        <h1 style={S.h1}>المبيعات 💰</h1>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label style={S.label}>من</label>
          <input
            type="date"
            style={S.input}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label style={S.label}>إلى</label>
          <input
            type="date"
            style={S.input}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <button onClick={load} style={S.filterBtn}>
          بحث
        </button>
        <div
          style={{
            marginRight: "auto",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 12,
            padding: "10px 20px",
          }}
        >
          <p style={{ color: "#334155", fontSize: 11, margin: "0 0 2px" }}>
            إجمالي الإيرادات
          </p>
          <p
            style={{
              color: "#10b981",
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {revenue.toFixed(2)} ج
          </p>
        </div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {[
                "المريض",
                "الأصناف",
                "الإجمالي",
                "الدفع",
                "الموظف",
                "التاريخ",
              ].map((h, i) => (
                <th key={i} style={S.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={S.empty}>
                  جارٍ التحميل...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={6} style={S.empty}>
                  لا توجد مبيعات
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr
                  key={s._id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td style={S.td}>{s.patientName || "—"}</td>
                  <td style={{ ...S.td, color: "#60a5fa" }}>
                    {s.items?.length || 0} صنف
                  </td>
                  <td style={{ ...S.td, color: "#10b981", fontWeight: 700 }}>
                    {s.totalAmount} ج
                  </td>
                  <td style={S.td}>
                    <span
                      style={{
                        ...S.badge,
                        color: "#a78bfa",
                        background: "rgba(167,139,250,0.08)",
                        borderColor: "rgba(167,139,250,0.15)",
                      }}
                    >
                      {s.paymentMethod === "cash"
                        ? "نقدي"
                        : s.paymentMethod === "card"
                          ? "بطاقة"
                          : "تأمين"}
                    </span>
                  </td>
                  <td style={{ ...S.td, color: "#94a3b8" }}>
                    {s.servedBy?.name || "—"}
                  </td>
                  <td style={{ ...S.td, color: "#475569", fontSize: 11 }}>
                    {new Date(s.createdAt).toLocaleString("ar-EG")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const S = {
  page: {
    padding: "24px",
    color: "#fff",
  },

  eyebrow: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
  },

  h1: {
    fontSize: 32,
    fontWeight: "bold",
    margin: 0,
  },

  label: {
    display: "block",
    marginBottom: 6,
    color: "#cbd5e1",
    fontSize: 14,
  },

  input: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
    outline: "none",
  },

  filterBtn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  tableWrap: {
    overflowX: "auto",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "right",
    padding: 14,
    background: "#111827",
    color: "#cbd5e1",
    fontWeight: 600,
    fontSize: 14,
  },

  td: {
    padding: 14,
    color: "#e2e8f0",
  },

  empty: {
    textAlign: "center",
    padding: 30,
    color: "#94a3b8",
  },

  badge: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid",
    fontSize: 12,
    fontWeight: 600,
  },
};
