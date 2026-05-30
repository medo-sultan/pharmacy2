import { useState, useEffect } from "react";
import { useAuth } from "../context/Sultan";

const CATS_ALL = "الكل";

export default function POS() {
  const { apiFetch } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(CATS_ALL);
  const [patientName, setPatientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/pharmacy/inventory")
      .then((d) => setMedicines(d.medicines || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cats = [
    CATS_ALL,
    ...new Set(medicines.map((m) => m.category).filter(Boolean)),
  ];

  const filtered = medicines.filter((m) => {
    const matchCat = activeCat === CATS_ALL || m.category === activeCat;
    const matchQ =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.genericName || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ && m.stock > 0 && !m.isExpired;
  });

  const addToCart = (med) => {
    setCart((prev) => {
      const ex = prev[med._id];
      if (ex) {
        if (ex.qty >= med.stock) return prev;
        return { ...prev, [med._id]: { ...ex, qty: ex.qty + 1 } };
      }
      return { ...prev, [med._id]: { ...med, qty: 1 } };
    });
  };

  const setQty = (id, delta) => {
    setCart((prev) => {
      const item = prev[id];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...item, qty: Math.min(newQty, item.stock) } };
    });
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearCart = () => setCart({});

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const handleSale = async () => {
    if (cartItems.length === 0) return setError("السلة فارغة");
    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/pharmacy/sale", {
        method: "POST",
        body: JSON.stringify({
          items: cartItems.map((c) => ({
            medicineId: c._id,
            quantity: c.qty,
          })),
          paymentMethod,
          patientName,
        }),
      });
      setSuccess({ total, count: cartItems.length });
      setCart({});
      setPatientName("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e.message || "فشلت العملية");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .med-card{transition:border-color 0.15s,background 0.15s}
        .med-card:hover{background:rgba(34,211,238,0.04)!important;border-color:rgba(34,211,238,0.25)!important}
        .med-card:hover .add-pill{opacity:1!important}
        .med-card.in-cart{border-color:rgba(34,211,238,0.35)!important}
        .pay-opt{transition:all 0.15s}
        .qty-btn:hover{background:rgba(255,255,255,0.1)!important}
        .sell-btn:hover:not(:disabled){background:rgba(34,211,238,0.18)!important}
        .cat-btn{transition:all 0.15s}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}
      `}</style>

      <div style={S.layout}>
        {/* ── Left Panel ── */}
        <div style={S.leftPanel}>
          {/* Header */}
          <div style={S.panelHead}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={S.headIcon}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <div>
                <h1 style={S.panelTitle}>نقطة البيع</h1>
                <p style={S.panelSub}>{filtered.length} دواء متاح</p>
              </div>
            </div>
            <input
              style={S.search}
              placeholder="ابحث عن دواء..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div style={S.catsBar}>
            {cats.map((c) => (
              <button
                key={c}
                className="cat-btn"
                onClick={() => setActiveCat(c)}
                style={{
                  ...S.catBtn,
                  ...(activeCat === c ? S.catBtnActive : {}),
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={S.grid}>
            {loading ? (
              <p style={S.muted}>جارٍ التحميل...</p>
            ) : filtered.length === 0 ? (
              <p style={S.muted}>لا توجد نتائج</p>
            ) : (
              filtered.map((med, i) => (
                <div
                  key={med._id}
                  className={`med-card${cart[med._id] ? " in-cart" : ""}`}
                  onClick={() => addToCart(med)}
                  style={{ ...S.medCard, animationDelay: `${i * 0.03}s` }}
                >
                  {med.isLowStock && <span style={S.lowBadge}>قليل</span>}
                  <div style={S.medIcon}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M10.5 20H4a2 2 0 01-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 011.66.9l.82 1.2a2 2 0 001.66.9H20a2 2 0 012 2v3" />
                      <circle cx="18" cy="18" r="3" />
                      <path d="M18 15v3l2 1" />
                    </svg>
                  </div>
                  <p style={S.medName}>{med.name}</p>
                  <p style={S.medCat}>{med.genericName || med.category}</p>
                  <div style={S.medFooter}>
                    <span style={S.medPrice}>{med.price} ج</span>
                    <div className="add-pill" style={S.addPill}>
                      +
                    </div>
                  </div>
                  <div style={S.stockBar}>
                    <div
                      style={{
                        ...S.stockFill,
                        width: `${Math.min((med.stock / 50) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p style={S.stockText}>{med.stock} وحدة</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right Panel — Cart ── */}
        <div style={S.rightPanel}>
          {/* Cart Header */}
          <div style={S.cartHead}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={S.cartTitle}>السلة</span>
              {cartItems.length > 0 && (
                <span style={S.cartCount}>{cartItems.length}</span>
              )}
            </div>
            {cartItems.length > 0 && (
              <button onClick={clearCart} style={S.clearBtn}>
                مسح
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div style={S.cartBody}>
            {cartItems.length === 0 ? (
              <div style={S.emptyCart}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>
                  السلة فارغة
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} style={S.cartItem}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <p style={S.ciName}>{item.name}</p>
                    <button
                      onClick={() => removeItem(item._id)}
                      style={S.rmBtn}
                    >
                      ×
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={S.ciPrice}>{item.price * item.qty} ج</span>
                    <div style={S.qtyCtrl}>
                      <button
                        className="qty-btn"
                        onClick={() => setQty(item._id, -1)}
                        style={S.qtyBtn}
                      >
                        −
                      </button>
                      <span style={S.qtyNum}>{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => setQty(item._id, 1)}
                        style={S.qtyBtn}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div style={S.cartFoot}>
            <input
              style={S.patientInput}
              placeholder="اسم المريض (اختياري)"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />

            <div style={{ display: "flex", gap: 6 }}>
              {[
                ["cash", "نقدي"],
                ["card", "بطاقة"],
                ["insurance", "تأمين"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  className="pay-opt"
                  onClick={() => setPaymentMethod(v)}
                  style={{
                    ...S.payOpt,
                    ...(paymentMethod === v ? S.payOptActive : {}),
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            <div style={S.divider} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                الإجمالي
              </span>
              <span style={S.totalVal}>{total.toFixed(2)} ج</span>
            </div>

            {error && <div style={S.errorBox}>⚠ {error}</div>}

            {success && (
              <div style={S.successBox}>
                ✓ تمت البيعة · {success.count} صنف · {success.total.toFixed(2)}{" "}
                ج
              </div>
            )}

            <button
              className="sell-btn"
              onClick={handleSale}
              disabled={submitting || cartItems.length === 0}
              style={{
                ...S.sellBtn,
                opacity: submitting || cartItems.length === 0 ? 0.35 : 1,
              }}
            >
              {submitting ? "جارٍ الحفظ..." : "✔  إتمام البيع"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    fontFamily: "'Sora', sans-serif",
    color: "#e2e8f0",
    height: "calc(100vh - 100px)",
    display: "flex",
    flexDirection: "column",
  },
  layout: {
    display: "flex",
    gap: 16,
    flex: 1,
    overflow: "hidden",
  },
  leftPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "rgba(8,12,20,0.6)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    overflow: "hidden",
    minWidth: 0,
  },
  panelHead: {
    padding: "16px 20px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  headIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "rgba(34,211,238,0.08)",
    border: "1px solid rgba(34,211,238,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  panelTitle: { fontSize: 15, fontWeight: 600, color: "#f1f5f9", margin: 0 },
  panelSub: { fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 },
  search: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "8px 14px",
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: "'Sora', sans-serif",
    outline: "none",
    width: 200,
  },
  catsBar: {
    display: "flex",
    gap: 6,
    padding: "10px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  catBtn: {
    padding: "5px 12px",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.07)",
    background: "transparent",
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  catBtnActive: {
    border: "1px solid rgba(34,211,238,0.3)",
    background: "rgba(34,211,238,0.08)",
    color: "#22d3ee",
    fontWeight: 600,
  },
  grid: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 10,
    alignContent: "start",
  },
  medCard: {
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 14,
    cursor: "pointer",
    position: "relative",
    animation: "fadeUp 0.3s ease both",
  },
  lowBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.2)",
    color: "#f59e0b",
    fontSize: 9,
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: 20,
  },
  medIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "rgba(34,211,238,0.07)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  medName: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: 600,
    margin: "0 0 2px",
    lineHeight: 1.3,
  },
  medCat: { color: "rgba(255,255,255,0.2)", fontSize: 10, margin: "0 0 10px" },
  medFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  medPrice: { color: "#22d3ee", fontSize: 14, fontWeight: 700 },
  addPill: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "rgba(34,211,238,0.12)",
    border: "1px solid rgba(34,211,238,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#22d3ee",
    fontSize: 16,
    opacity: 0,
    transition: "opacity 0.15s",
  },
  stockBar: {
    height: 2,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  stockFill: {
    height: "100%",
    background: "rgba(34,211,238,0.4)",
    borderRadius: 2,
  },
  stockText: { fontSize: 9, color: "rgba(255,255,255,0.2)", margin: 0 },
  muted: {
    color: "rgba(255,255,255,0.15)",
    fontSize: 12,
    textAlign: "center",
    padding: "40px 0",
    gridColumn: "1/-1",
  },
  rightPanel: {
    width: 280,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    background: "rgba(8,12,20,0.8)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    overflow: "hidden",
  },
  cartHead: {
    padding: "16px 18px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartTitle: { color: "#f1f5f9", fontSize: 14, fontWeight: 600 },
  cartCount: {
    background: "rgba(34,211,238,0.1)",
    border: "1px solid rgba(34,211,238,0.2)",
    color: "#22d3ee",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 20,
  },
  clearBtn: {
    color: "rgba(239,68,68,0.5)",
    fontSize: 11,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
  },
  cartBody: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  emptyCart: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "40px 0",
  },
  cartItem: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: "10px 12px",
  },
  ciName: { color: "#cbd5e1", fontSize: 12, fontWeight: 600, margin: 0 },
  ciPrice: { color: "#10b981", fontSize: 12, fontWeight: 600 },
  rmBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(239,68,68,0.4)",
    fontSize: 16,
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
  },
  qtyCtrl: { display: "flex", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#94a3b8",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Sora', sans-serif",
  },
  qtyNum: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: 600,
    minWidth: 20,
    textAlign: "center",
  },
  cartFoot: {
    padding: "14px 18px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  patientInput: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "8px 12px",
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: "'Sora', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  payOpt: {
    flex: 1,
    padding: "7px 4px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.07)",
    background: "transparent",
    color: "rgba(255,255,255,0.25)",
    fontSize: 11,
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },
  payOptActive: {
    border: "1px solid rgba(34,211,238,0.3)",
    background: "rgba(34,211,238,0.08)",
    color: "#22d3ee",
    fontWeight: 600,
  },
  divider: { height: 1, background: "rgba(255,255,255,0.05)" },
  totalVal: { color: "#f1f5f9", fontSize: 22, fontWeight: 700 },
  errorBox: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.15)",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#f87171",
    fontSize: 11,
    textAlign: "center",
  },
  successBox: {
    background: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#34d399",
    fontSize: 11,
    textAlign: "center",
  },
  sellBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: 10,
    border: "1px solid rgba(34,211,238,0.25)",
    background: "rgba(34,211,238,0.1)",
    color: "#22d3ee",
    fontSize: 13,
    fontFamily: "'Sora', sans-serif",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.03em",
  },
};
