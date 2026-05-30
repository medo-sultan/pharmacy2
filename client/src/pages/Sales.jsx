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

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        *{font-family:'Sora',sans-serif;box-sizing:border-box}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .sale-row{transition:background 0.12s,border-color 0.12s;cursor:pointer}
        .sale-row:hover{background:rgba(255,255,255,0.04)!important}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
        ::-webkit-scrollbar-track{background:transparent}
      `}</style>

      {/* Detail Modal */}
      {selectedSale && (
        <div style={S.overlay} onClick={() => setSelectedSale(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHead}>
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
                  const cfg =
                    METHOD_CONFIG[selectedSale.paymentMethod] ||
                    METHOD_CONFIG.cash;
                  return (
                    <span
                      style={{
                        ...S.badge,
                        color: cfg.color,
                        background: cfg.badgeBg,
                        borderColor: cfg.badgeBorder,
                      }}
                    >
                      {cfg.icon} {cfg.label}
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

            <div style={S.modalBody}>
              {/* Meta row */}
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

              {/* Items table */}
              <div style={S.itemsHead}>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                  الصنف
                </span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                  الكمية
                </span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                  السعر
                </span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                  الإجمالي
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(selectedSale.items || []).map((item, i) => (
                  <div key={i} style={S.itemRow}>
                    <span style={{ color: "#cbd5e1", fontSize: 13 }}>
                      {item.medicineName ||
                        item.medicine?.name ||
                        item.name ||
                        "—"}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>
                      {item.quantity}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>
                      {item.unitPrice || item.price || "—"} ج
                    </span>
                    <span
                      style={{
                        color: "#10b981",
                        fontSize: 13,
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

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <p style={S.eyebrow}>Pharmacy</p>
        <h1 style={S.h1}>المبيعات 💰</h1>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
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

      {/* Three columns */}
      <div style={S.colGrid}>
        {["insurance", "cash", "card"].map((method) => {
          const cfg = METHOD_CONFIG[method];
          const items = byMethod[method];
          const tot = colTotal(items);
          return (
            <div key={method} style={{ ...S.col, borderColor: cfg.border }}>
              {/* Column header */}
              <div
                style={{
                  ...S.colHead,
                  background: cfg.bg,
                  borderBottomColor: cfg.border,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                  <span
                    style={{ color: cfg.color, fontSize: 14, fontWeight: 700 }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: 10,
                      margin: "0 0 1px",
                    }}
                  >
                    {items.length} عملية
                  </p>
                  <p
                    style={{
                      color: cfg.color,
                      fontSize: 15,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {tot.toFixed(2)} ج
                  </p>
                </div>
              </div>

              {/* Sales list */}
              <div style={S.colBody}>
                {loading ? (
                  <p style={S.colEmpty}>جارٍ التحميل...</p>
                ) : items.length === 0 ? (
                  <p style={S.colEmpty}>لا توجد عمليات</p>
                ) : (
                  items.map((s, i) => (
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
                          style={{
                            color: "#e2e8f0",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {s.patientName || "مريض غير محدد"}
                        </span>
                        <span
                          style={{
                            color: cfg.color,
                            fontSize: 14,
                            fontWeight: 700,
                          }}
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
                        <span
                          style={{
                            color: "rgba(255,255,255,0.25)",
                            fontSize: 11,
                          }}
                        >
                          {s.items?.length || 0} صنف · {s.servedBy?.name || "—"}
                        </span>
                        <span
                          style={{
                            color: "rgba(255,255,255,0.2)",
                            fontSize: 10,
                          }}
                        >
                          {new Date(s.createdAt).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {method === "insurance" && s.insuranceCompany && (
                        <div
                          style={{
                            marginTop: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              color: "rgba(34,211,238,0.5)",
                              fontSize: 10,
                            }}
                          >
                            🛡️
                          </span>
                          <span
                            style={{
                              color: "rgba(34,211,238,0.6)",
                              fontSize: 10,
                            }}
                          >
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
        })}
      </div>
    </div>
  );
}

const S = {
  page: {
    padding: "24px",
    color: "#fff",
    minHeight: "100vh",
    direction: "rtl",
  },
  eyebrow: { color: "#94a3b8", fontSize: 12, marginBottom: 4, margin: 0 },
  h1: { fontSize: 28, fontWeight: "bold", margin: "4px 0 0" },
  label: { display: "block", marginBottom: 6, color: "#cbd5e1", fontSize: 13 },
  input: {
    padding: "9px 13px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
    outline: "none",
    fontSize: 13,
  },
  filterBtn: {
    padding: "9px 18px",
    borderRadius: 10,
    border: "1px solid rgba(59,130,246,0.3)",
    background: "rgba(59,130,246,0.15)",
    color: "#60a5fa",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },
  revenueBox: {
    marginRight: "auto",
    background: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: 12,
    padding: "10px 20px",
  },
  colGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 },
  col: {
    background: "rgba(8,12,20,0.8)",
    border: "1px solid",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: 400,
    maxHeight: "calc(100vh - 280px)",
  },
  colHead: {
    padding: "14px 16px",
    borderBottom: "1px solid",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  colBody: {
    flex: 1,
    overflowY: "auto",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  colEmpty: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 12,
    textAlign: "center",
    padding: "30px 0",
    margin: 0,
  },
  saleCard: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "10px 12px",
    animation: "fadeUp 0.3s ease both",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid",
    fontSize: 11,
    fontWeight: 600,
  },
  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    animation: "fadeIn 0.15s ease",
  },
  modal: {
    background: "#0d1526",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 18,
    width: 460,
    maxWidth: "92vw",
    maxHeight: "85vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
    animation: "fadeUp 0.2s ease",
  },
  modalHead: {
    padding: "18px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexShrink: 0,
  },
  modalBody: {
    padding: "18px 20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 14,
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
  metaVal: { color: "#cbd5e1", fontSize: 13 },
  itemsHead: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    padding: "6px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    padding: "8px 12px",
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
