import { useState, useEffect } from "react";
import { useAuth } from "../context/Sultan";

export default function POS() {
  const { apiFetch } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
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

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) &&
      m.stock > 0 &&
      !m.isExpired,
  );

  const addToCart = (med) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.medicineId === med._id);
      if (ex) {
        if (ex.quantity >= med.stock) return prev;
        return prev.map((c) =>
          c.medicineId === med._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        {
          medicineId: med._id,
          name: med.name,
          price: med.price,
          quantity: 1,
          maxStock: med.stock,
        },
      ];
    });
  };

  const setQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart((prev) =>
      prev.map((c) =>
        c.medicineId === id ? { ...c, quantity: Math.min(qty, c.maxStock) } : c,
      ),
    );
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((c) => c.medicineId !== id));

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handleSale = async () => {
    if (cart.length === 0) return setError("السلة فارغة");
    setError("");
    setSubmitting(true);
    try {
      const data = await apiFetch("/pharmacy/sale", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((c) => ({
            medicineId: c.medicineId,
            quantity: c.quantity,
          })),
          paymentMethod,
          patientName,
        }),
      });
      setSuccess({ total, items: cart.length });
      setCart([]);
      setPatientName("");
    } catch (e) {
      setError(e.message || "فشلت العملية");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .med-card:hover{background:rgba(34,211,238,0.06)!important;border-color:rgba(34,211,238,0.2)!important;}
        .med-card:hover .add-btn{opacity:1!important}
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <p style={S.eyebrow}>Pharmacy</p>
        <h1 style={S.h1}>نقطة البيع 🛒</h1>
      </div>

      <div style={S.layout}>
        {/* Left — Products */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            style={S.search}
            placeholder="🔍  ابحث عن دواء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <p style={S.muted}>جارٍ التحميل...</p>
          ) : (
            <div style={S.grid}>
              {filtered.map((med) => (
                <div
                  key={med._id}
                  className="med-card"
                  style={S.medCard}
                  onClick={() => addToCart(med)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(34,211,238,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      💊
                    </div>
                    <span
                      style={{
                        ...S.badge,
                        ...(med.isLowStock
                          ? {
                              color: "#f59e0b",
                              background: "rgba(245,158,11,0.1)",
                              borderColor: "rgba(245,158,11,0.2)",
                            }
                          : {
                              color: "#10b981",
                              background: "rgba(16,185,129,0.1)",
                              borderColor: "rgba(16,185,129,0.2)",
                            }),
                      }}
                    >
                      {med.stock} متاح
                    </span>
                  </div>
                  <p
                    style={{
                      color: "#cbd5e1",
                      fontSize: 13,
                      fontWeight: 600,
                      margin: "0 0 2px",
                      lineHeight: 1.3,
                    }}
                  >
                    {med.name}
                  </p>
                  <p
                    style={{
                      color: "#334155",
                      fontSize: 10,
                      margin: "0 0 10px",
                    }}
                  >
                    {med.genericName || med.category}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        color: "#22d3ee",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {med.price} ج
                    </span>
                    <div
                      className="add-btn"
                      style={{
                        opacity: 0,
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: "rgba(34,211,238,0.15)",
                        border: "1px solid rgba(34,211,238,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#22d3ee",
                        fontSize: 16,
                        transition: "opacity .2s",
                      }}
                    >
                      +
                    </div>
                  </div>
                  {med.requiresPrescription && (
                    <div
                      style={{
                        ...S.badge,
                        color: "#a78bfa",
                        background: "rgba(167,139,250,0.1)",
                        borderColor: "rgba(167,139,250,0.2)",
                        marginTop: 6,
                        display: "inline-block",
                      }}
                    >
                      يحتاج وصفة
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <p
                  style={{ ...S.muted, gridColumn: "1/-1", padding: "40px 0" }}
                >
                  لا توجد نتائج
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right — Cart */}
        <div style={S.cartPanel}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                color: "#f1f5f9",
                fontSize: 15,
                fontWeight: 700,
                margin: 0,
              }}
            >
              🛒 السلة
            </h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                style={{
                  color: "#ef4444",
                  fontSize: 11,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                مسح الكل
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#334155",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
              <p style={{ fontSize: 12, margin: 0 }}>السلة فارغة</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {cart.map((item) => (
                <div key={item.medicineId} style={S.cartItem}>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        color: "#cbd5e1",
                        fontSize: 12,
                        fontWeight: 600,
                        margin: "0 0 4px",
                      }}
                    >
                      {item.name}
                    </p>
                    <p style={{ color: "#10b981", fontSize: 11, margin: 0 }}>
                      {item.price} × {item.quantity} ={" "}
                      {(item.price * item.quantity).toFixed(2)} ج
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <button
                      onClick={() => setQty(item.medicineId, item.quantity - 1)}
                      style={S.qtyBtn}
                    >
                      −
                    </button>
                    <span
                      style={{
                        color: "#e2e8f0",
                        fontSize: 13,
                        fontWeight: 600,
                        minWidth: 20,
                        textAlign: "center",
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQty(item.medicineId, item.quantity + 1)}
                      style={S.qtyBtn}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.medicineId)}
                      style={{
                        ...S.qtyBtn,
                        color: "#ef4444",
                        borderColor: "rgba(239,68,68,0.2)",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr
            style={{
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              margin: "0 0 14px",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <input
              style={S.input}
              placeholder="اسم المريض (اختياري)"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
            <div style={{ display: "flex", gap: 6 }}>
              {[
                ["cash", "نقدي"],

                ["insurance", "تأمين"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setPaymentMethod(v)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    borderRadius: 8,
                    border: `1px solid ${paymentMethod === v ? "rgba(34,211,238,0.4)" : "rgba(255,255,255,0.07)"}`,
                    background:
                      paymentMethod === v
                        ? "rgba(34,211,238,0.08)"
                        : "transparent",
                    color: paymentMethod === v ? "#22d3ee" : "#475569",
                    fontSize: 11,
                    fontFamily: "'Sora',sans-serif",
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span style={{ color: "#64748b", fontSize: 13 }}>الإجمالي</span>
            <span style={{ color: "#22d3ee", fontSize: 20, fontWeight: 700 }}>
              {total.toFixed(2)} ج
            </span>
          </div>

          {error && <div style={S.error}>{error}</div>}

          {success && (
            <div style={S.successBox}>
              ✅ تمت البيعة بنجاح! {success.items} صنف ·{" "}
              {success.total.toFixed(2)} ج
              <button
                onClick={() => setSuccess(null)}
                style={{
                  display: "block",
                  marginTop: 6,
                  color: "#10b981",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                إغلاق
              </button>
            </div>
          )}

          <button
            onClick={handleSale}
            disabled={submitting || cart.length === 0}
            style={{
              ...S.sellBtn,
              opacity: submitting || cart.length === 0 ? 0.4 : 1,
            }}
          >
            {submitting ? "جارٍ الحفظ..." : "✔ إتمام البيع"}
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily: "'Sora',sans-serif", color: "#e2e8f0" },
  eyebrow: {
    color: "#334155",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    margin: 0,
  },
  h1: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "#f1f5f9",
    margin: "4px 0 0",
  },
  search: {
    width: "100%",
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "11px 16px",
    color: "#cbd5e1",
    fontSize: 13,
    fontFamily: "'Sora',sans-serif",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 16,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
    gap: 10,
  },
  medCard: {
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 14,
    cursor: "pointer",
    transition: "all .2s",
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 20,
    padding: "2px 8px",
    border: "1px solid",
    display: "inline-block",
  },
  layout: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  cartPanel: {
    width: 280,
    flexShrink: 0,
    background: "rgba(8,12,20,0.9)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 18,
    position: "sticky",
    top: 80,
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: "10px 12px",
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#94a3b8",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all .15s",
  },
  input: {
    width: "100%",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "9px 12px",
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: "'Sora',sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  error: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#f87171",
    fontSize: 11,
    marginBottom: 10,
    textAlign: "center",
  },
  successBox: {
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#34d399",
    fontSize: 11,
    marginBottom: 10,
    textAlign: "center",
  },
  sellBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: 12,
    border: "1px solid rgba(34,211,238,0.3)",
    background: "rgba(34,211,238,0.12)",
    color: "#22d3ee",
    fontSize: 14,
    fontFamily: "'Sora',sans-serif",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all .2s",
  },
  muted: { color: "#334155", fontSize: 12, textAlign: "center", margin: 0 },
};
