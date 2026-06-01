import { useState, useEffect } from "react";
import { useAuth } from "../context/Sultan";

const METHOD_CONFIG = {
  insurance: {
    label: "تأمين",
    icon: "🛡️",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.07)",
    border: "rgba(34,211,238,0.18)",
    badgeBg: "rgba(34,211,238,0.1)",
    badgeBorder: "rgba(34,211,238,0.2)",
  },
  cash: {
    label: "نقدي",
    icon: "💵",
    color: "#10b981",
    bg: "rgba(16,185,129,0.07)",
    border: "rgba(16,185,129,0.18)",
    badgeBg: "rgba(16,185,129,0.1)",
    badgeBorder: "rgba(16,185,129,0.2)",
  },
  card: {
    label: "بنك",
    icon: "💳",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.07)",
    border: "rgba(167,139,250,0.18)",
    badgeBg: "rgba(167,139,250,0.1)",
    badgeBorder: "rgba(167,139,250,0.2)",
  },
};

export function Sales() {
  const { apiFetch } = useAuth();
  const [sales, setSales] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [activeMethod, setActiveMethod] = useState("insurance");

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

  const byMethod = {
    insurance: sales.filter((s) => s.paymentMethod === "insurance"),
    cash: sales.filter((s) => s.paymentMethod === "cash"),
    card: sales.filter((s) => s.paymentMethod === "card"),
  };
  const colTotal = (arr) =>
    arr.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const activeItems = byMethod[activeMethod] || [];
  const cfg = METHOD_CONFIG[activeMethod];

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .sale-row { transition: background 0.12s; cursor: pointer; }
        .sale-row:active { background: rgba(255,255,255,0.05) !important; }
        .mtab { transition: all 0.15s; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>

      {/* ── Detail Bottom Sheet ── */}
      {selectedSale && (
        <div style={S.sheetOverlay} onClick={() => setSelectedSale(null)}>
          <div
            style={{
              ...S.bottomSheet,
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={S.dragHandle} />
            {/* Sheet Header */}
            <div style={S.sheetHead}>
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 11,
                    margin: "0 0 3px",
                  }}
                >
                  تفاصيل العملية
                </p>
                <p
                  style={{
                    color: "#f1f5f9",
                    fontSize: 15,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {selectedSale.patientName || "مريض غير محدد"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {(() => {
                  const c =
                    METHOD_CONFIG[selectedSale.paymentMethod] ||
                    METHOD_CONFIG.cash;
                  return (
                    <span
                      style={{
                        ...S.badge,
                        color: c.color,
                        background: c.badgeBg,
                        borderColor: c.badgeBorder,
                      }}
                    >
                      {c.icon} {c.label}
                    </span>
                  );
                })()}
                <button
                  onClick={() => setSelectedSale(null)}
                  style={S.closeBtn}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Sheet Body */}
            <div style={S.sheetBody}>
              {/* Meta */}
              <div style={S.metaRow}>
                <div style={S.metaItem}>
                  <span style={S.metaLabel}>الموظف</span>
                  <span style={S.metaVal}>
                    {selectedSale.servedBy?.name || "—"}
                  </span>
                </div>
                <div style={S.metaItem}>
                  <span style={S.metaLabel}>التاريخ</span>
                  <span style={S.metaVal}>
                    {new Date(selectedSale.createdAt).toLocaleString("ar-EG")}
                  </span>
                </div>
                {selectedSale.paymentMethod === "insurance" &&
                  selectedSale.insuranceCompany && (
                    <div style={S.metaItem}>
                      <span style={S.metaLabel}>شركة التأمين</span>
                      <span style={{ ...S.metaVal, color: "#22d3ee" }}>
                        {selectedSale.insuranceCompany}
                      </span>
                    </div>
                  )}
                {selectedSale.insuranceCardNumber && (
                  <div style={S.metaItem}>
                    <span style={S.metaLabel}>رقم البطاقة</span>
                    <span
                      style={{
                        ...S.metaVal,
                        direction: "ltr",
                        textAlign: "left",
                      }}
                    >
                      {selectedSale.insuranceCardNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div style={S.itemsHead}>
                {["الصنف", "الكمية", "السعر", "الإجمالي"].map((h) => (
                  <span
                    key={h}
                    style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(selectedSale.items || []).map((item, i) => (
                  <div key={i} style={S.itemRow}>
                    <span style={{ color: "#cbd5e1", fontSize: 12 }}>
                      {item.medicineName ||
                        item.medicine?.name ||
                        item.name ||
                        "—"}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>
                      {item.quantity}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>
                      {item.unitPrice || item.price || "—"} ج
                    </span>
                    <span
                      style={{
                        color: "#10b981",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {item.subtotal?.toFixed(2) ||
                        ((item.unitPrice || 0) * item.quantity).toFixed(2)}{" "}
                      ج
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={S.totalsBox}>
                {selectedSale.paymentMethod === "insurance" &&
                  selectedSale.discountAmount > 0 && (
                    <>
                      <div style={S.totalLine}>
                        <span
                          style={{
                            color: "rgba(255,255,255,0.35)",
                            fontSize: 12,
                          }}
                        >
                          قبل الخصم
                        </span>
                        <span
                          style={{
                            color: "rgba(255,255,255,0.35)",
                            fontSize: 13,
                            textDecoration: "line-through",
                          }}
                        >
                          {(
                            selectedSale.totalAmount +
                            selectedSale.discountAmount
                          ).toFixed(2)}{" "}
                          ج
                        </span>
                      </div>
                      <div style={S.totalLine}>
                        <span
                          style={{
                            color: "rgba(245,158,11,0.8)",
                            fontSize: 12,
                          }}
                        >
                          خصم التأمين {selectedSale.discountPercent}%
                        </span>
                        <span style={{ color: "#f59e0b", fontSize: 13 }}>
                          - {selectedSale.discountAmount.toFixed(2)} ج
                        </span>
                      </div>
                      <div style={S.divider} />
                    </>
                  )}
                <div style={S.totalLine}>
                  <span
                    style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 600 }}
                  >
                    المبلغ المدفوع
                  </span>
                  <span
                    style={{ color: "#22d3ee", fontSize: 20, fontWeight: 700 }}
                  >
                    {selectedSale.totalAmount} ج
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ padding: "18px 16px 12px", flexShrink: 0 }}>
        <p style={S.eyebrow}>Pharmacy</p>
        <h1 style={S.h1}>المبيعات 💰</h1>
      </div>

      {/* ── Filters ── */}
      <div style={S.filterRow}>
        <div style={{ display: "flex", gap: 8, flex: 1 }}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>من</label>
            <input
              type="date"
              style={S.input}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>إلى</label>
            <input
              type="date"
              style={S.input}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
        <button onClick={load} style={S.filterBtn}>
          بحث
        </button>
      </div>

      {/* ── Revenue Box ── */}
      <div style={{ padding: "0 16px 12px", flexShrink: 0 }}>
        <div style={S.revenueBox}>
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 11,
              margin: "0 0 2px",
            }}
          >
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

      {/* ── Method Tabs ── */}
      <div style={S.tabsRow}>
        {["insurance", "cash", "card"].map((m) => {
          const c = METHOD_CONFIG[m];
          const count = byMethod[m].length;
          const tot = colTotal(byMethod[m]);
          const isActive = activeMethod === m;
          return (
            <button
              key={m}
              className="mtab"
              onClick={() => setActiveMethod(m)}
              style={{
                ...S.tab,
                ...(isActive
                  ? {
                      ...S.tabActive,
                      color: c.color,
                      borderBottomColor: c.color,
                    }
                  : {}),
              }}
            >
              <span style={{ fontSize: 16 }}>{c.icon}</span>
              <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400 }}>
                {c.label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: isActive ? c.color : "rgba(255,255,255,0.25)",
                }}
              >
                {count} · {tot.toFixed(0)} ج
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Sales List ── */}
      <div style={S.list}>
        {loading ? (
          <p style={S.empty}>جارٍ التحميل...</p>
        ) : activeItems.length === 0 ? (
          <p style={S.empty}>لا توجد عمليات</p>
        ) : (
          activeItems.map((s, i) => (
            <div
              key={s._id}
              className="sale-row"
              onClick={() => setSelectedSale(s)}
              style={{ ...S.saleCard, animationDelay: `${i * 0.04}s` }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}
                >
                  {s.patientName || "مريض غير محدد"}
                </span>
                <span
                  style={{ color: cfg.color, fontSize: 14, fontWeight: 700 }}
                >
                  {s.totalAmount} ج
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>
                  {s.items?.length || 0} صنف · {s.servedBy?.name || "—"}
                </span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>
                  {new Date(s.createdAt).toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {activeMethod === "insurance" && s.insuranceCompany && (
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ color: "rgba(34,211,238,0.5)", fontSize: 10 }}>
                    🛡️
                  </span>
                  <span style={{ color: "rgba(34,211,238,0.6)", fontSize: 10 }}>
                    {s.insuranceCompany}
                  </span>
                  {s.discountPercent > 0 && (
                    <span
                      style={{
                        color: "#f59e0b",
                        fontSize: 10,
                        marginRight: "auto",
                      }}
                    >
                      خصم {s.discountPercent}%
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const S = {
  page: {
    display: "flex",
    flexDirection: "column",
    color: "#fff",
    direction: "rtl",
    height: "calc(100vh - 100px)",
    overflow: "hidden",
  },
  eyebrow: { color: "#94a3b8", fontSize: 12, marginBottom: 4, margin: 0 },
  h1: { fontSize: 24, fontWeight: "bold", margin: "4px 0 0" },
  filterRow: {
    display: "flex",
    gap: 8,
    padding: "0 16px 12px",
    alignItems: "flex-end",
    flexShrink: 0,
  },
  label: { display: "block", marginBottom: 5, color: "#cbd5e1", fontSize: 12 },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    outline: "none",
    fontSize: 12,
    fontFamily: "'Sora', sans-serif",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid rgba(59,130,246,0.3)",
    background: "rgba(59,130,246,0.15)",
    color: "#60a5fa",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 12,
    fontFamily: "'Sora', sans-serif",
    alignSelf: "flex-end",
    whiteSpace: "nowrap",
  },
  revenueBox: {
    background: "rgba(16,185,129,0.07)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: 12,
    padding: "10px 16px",
  },
  tabsRow: {
    display: "flex",
    flexShrink: 0,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  tab: {
    flex: 1,
    padding: "10px 6px",
    border: "none",

    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",

    background: "transparent",
    color: "rgba(255,255,255,0.3)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    fontFamily: "'Sora', sans-serif",
    transition: "all 0.15s",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    scrollbarWidth: "none",
  },
  saleCard: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "12px 14px",
    animation: "fadeUp 0.3s ease both",
  },
  empty: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 12,
    textAlign: "center",
    padding: "40px 0",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid",
    fontSize: 11,
    fontWeight: 600,
  },

  /* Bottom Sheet */
  sheetOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(5px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    zIndex: 999,
    animation: "fadeIn 0.15s ease",
  },
  bottomSheet: {
    background: "#0d1526",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px 20px 0 0",
    animation: "slideUp 0.25s cubic-bezier(0.32,0.72,0,1)",
    overflow: "hidden",
  },
  dragHandle: {
    width: 36,
    height: 4,
    background: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    margin: "10px auto 0",
  },
  sheetHead: {
    padding: "14px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexShrink: 0,
  },
  sheetBody: {
    padding: "14px 18px 28px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    scrollbarWidth: "none",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.3)",
    fontSize: 24,
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
  },
  metaRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    background: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: "12px 14px",
  },
  metaItem: { display: "flex", flexDirection: "column", gap: 3 },
  metaLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  metaVal: { color: "#cbd5e1", fontSize: 12 },
  itemsHead: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    padding: "6px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    padding: "8px 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  totalsBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  totalLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  divider: { height: 1, background: "rgba(255,255,255,0.07)" },
};
