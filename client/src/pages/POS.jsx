import { useState, useEffect, useRef, useCallback } from "react";
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
  const [mobileTab, setMobileTab] = useState("products");

  const barcodeInputRef = useRef(null);
  const barcodeBufferRef = useRef("");
  const barcodeTimerRef = useRef(null);
  const [barcodeFlash, setBarcodeFlash] = useState(null);
  const [scannerFocused, setScannerFocused] = useState(true);

  const INSURANCE_COMPANIES = [
    { id: "qawmi", name: "الشركة القومية للتأمين", discount: 0.75 },
    { id: "muttahida", name: "المتحدة", discount: 0.85 },
    { id: "sudapost", name: "سودا بوست", discount: 0.95 },
  ];
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [insuranceCompany, setInsuranceCompany] = useState(null);
  const [insuranceCardNumber, setInsuranceCardNumber] = useState("");

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

  const addToCart = useCallback((med) => {
    setCart((prev) => {
      const ex = prev[med._id];
      if (ex) {
        if (ex.qty >= med.stock) return prev;
        return { ...prev, [med._id]: { ...ex, qty: ex.qty + 1 } };
      }
      return { ...prev, [med._id]: { ...med, qty: 1 } };
    });
  }, []);

  const setQty = (id, delta) => {
    setCart((prev) => {
      const item = prev[id];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const n = { ...prev };
        delete n[id];
        return n;
      }
      return { ...prev, [id]: { ...item, qty: Math.min(newQty, item.stock) } };
    });
  };

  const removeItem = (id) =>
    setCart((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  const clearCart = () => setCart({});

  const handleBarcodeChar = useCallback(
    (char) => {
      barcodeBufferRef.current += char;
      if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
      barcodeTimerRef.current = setTimeout(() => {
        const scanned = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = "";
        if (!scanned) return;
        const found = medicines.find(
          (m) => m.barcode && m.barcode.trim() === scanned,
        );
        if (found) {
          if (found.stock <= 0 || found.isExpired) {
            setBarcodeFlash({
              type: "error",
              msg: `❌ ${found.name} — غير متاح`,
            });
          } else {
            addToCart(found);
            setBarcodeFlash({
              type: "success",
              msg: `✅ تمت إضافة: ${found.name}`,
            });
          }
        } else {
          setBarcodeFlash({
            type: "error",
            msg: `⚠️ باركود غير موجود: ${scanned}`,
          });
        }
        setTimeout(() => setBarcodeFlash(null), 2500);
      }, 100);
    },
    [medicines, addToCart],
  );

  useEffect(() => {
    const keepFocus = () => {
      if (
        barcodeInputRef.current &&
        document.activeElement !== barcodeInputRef.current &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
      ) {
        barcodeInputRef.current.focus();
        setScannerFocused(true);
      }
    };
    const interval = setInterval(keepFocus, 500);
    return () => clearInterval(interval);
  }, []);

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const activeInsurance =
    paymentMethod === "insurance" ? insuranceCompany : null;
  const discountAmount = activeInsurance ? total * activeInsurance.discount : 0;
  const finalTotal = total - discountAmount;

  const handleSale = async () => {
    if (cartItems.length === 0) return setError("السلة فارغة");
    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/pharmacy/sale", {
        method: "POST",
        body: JSON.stringify({
          items: cartItems.map((c) => ({ medicineId: c._id, quantity: c.qty })),
          paymentMethod,
          patientName,
          totalAmount: finalTotal,
          ...(paymentMethod === "insurance" && insuranceCompany
            ? {
                insuranceCompany: insuranceCompany.name,
                insuranceCardNumber,
                discountPercent: insuranceCompany.discount * 100,
                discountAmount,
              }
            : {}),
        }),
      });
      setSuccess({ total: finalTotal, count: cartItems.length });
      setCart({});
      setPatientName("");
      setInsuranceCompany(null);
      setInsuranceCardNumber("");
      setMobileTab("products");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e.message || "فشلت العملية");
    } finally {
      setSubmitting(false);
    }
  };

  const payIcons = { cash: "💵", card: "💳", insurance: "🛡️" };
  const payLabels = { cash: "نقدي", card: "بطاقة", insurance: "تأمين" };

  return (
    <div
      style={{
        fontFamily: "'Sora', sans-serif",
        color: "#e2e8f0",
        height: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        /* ── animations ── */
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop { 0%{transform:scale(0.94)} 60%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(-16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

        /* ── cards ── */
        .med-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          cursor: pointer;
          animation: fadeUp 0.28s ease both;
        }
        .med-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.3) !important;
          border-color: rgba(56,189,248,0.4) !important;
        }
        .med-card:active { transform: scale(0.97); }
        .med-card.in-cart { border-color: rgba(52,211,153,0.5) !important; box-shadow: 0 0 0 1px rgba(52,211,153,0.2), inset 0 0 20px rgba(52,211,153,0.04) !important; }
        .med-card.in-cart .add-pill { background: rgba(52,211,153,0.2) !important; border-color: rgba(52,211,153,0.4) !important; color: #34d399 !important; opacity: 1 !important; }

        /* ── buttons ── */
        .cat-pill { transition: all 0.15s; }
        .cat-pill:hover { border-color: rgba(56,189,248,0.4) !important; color: rgba(56,189,248,0.8) !important; }
        .qty-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .pay-btn { transition: all 0.2s; }
        .pay-btn:hover { transform: translateY(-1px); }
        .sell-btn { transition: all 0.2s; position: relative; overflow: hidden; }
        .sell-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(52,211,153,0.25) !important; }
        .sell-btn:active:not(:disabled) { transform: translateY(0); }
        .sell-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.07) 50%,transparent 60%); background-size:200% 100%; opacity:0; transition:opacity 0.3s; }
        .sell-btn:hover::after { opacity:1; animation: shimmer 1.2s linear infinite; }

        /* ── cart item ── */
        .cart-item { transition: background 0.15s; }
        .cart-item:hover { background: rgba(255,255,255,0.04) !important; }
        .rm-btn:hover { color: rgba(239,68,68,0.9) !important; }

        /* ── scrollbar ── */
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        /* ── mobile ── */
        @media (max-width: 640px) {
          .pos-layout { flex-direction: column !important; height: 100% !important; gap: 0 !important; }
          .left-panel { border-radius: 0 !important; border: none !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
          .right-panel { width: 100% !important; border-radius: 0 !important; border: none !important; border-top: 1px solid rgba(255,255,255,0.07) !important; }
          .pos-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important; padding: 10px 12px !important; gap: 8px !important; }
          .panel-head { padding: 10px 12px !important; }
          .cats-bar { padding: 8px 12px !important; }
          .cart-body { max-height: 200px !important; }
          .cart-foot { padding: 12px 14px !important; }
          .panel-hidden { display: none !important; }
          .mobile-tabs { display: flex !important; }
          .mobile-fab { display: flex !important; }
        }
        @media (min-width: 641px) {
          .mobile-tabs { display: none !important; }
          .mobile-fab { display: none !important; }
          .panel-hidden { display: flex !important; }
        }
      `}</style>

      {/* ── Barcode input (hidden) ── */}
      <input
        ref={barcodeInputRef}
        style={{
          position: "fixed",
          top: -999,
          left: -999,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
        value=""
        onChange={(e) => {
          const v = e.target.value;
          if (v) {
            for (const ch of v) handleBarcodeChar(ch);
            e.target.value = "";
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleBarcodeChar("\n");
            e.preventDefault();
          }
        }}
        onFocus={() => setScannerFocused(true)}
        onBlur={() => setScannerFocused(false)}
        tabIndex={-1}
        readOnly={false}
      />

      {/* ── Barcode Toast ── */}
      {barcodeFlash && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            zIndex: 9999,
            animation: "toastIn 0.25s ease both",
            background:
              barcodeFlash.type === "success"
                ? "linear-gradient(135deg,#059669,#10b981)"
                : "linear-gradient(135deg,#dc2626,#ef4444)",
            color: "#fff",
            padding: "11px 24px",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {barcodeFlash.msg}
        </div>
      )}

      {/* ── Scanner badge ── */}
      <div
        onClick={() => barcodeInputRef.current?.focus()}
        style={{
          position: "fixed",
          bottom: 16,
          left: 16,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(6,10,20,0.85)",
          border: `1px solid ${scannerFocused ? "rgba(56,189,248,0.35)" : "rgba(239,68,68,0.35)"}`,
          padding: "5px 11px",
          borderRadius: 20,
          backdropFilter: "blur(8px)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: scannerFocused ? "#38bdf8" : "#ef4444",
            boxShadow: scannerFocused ? "0 0 6px #38bdf8" : "none",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: scannerFocused ? "#38bdf8" : "#ef4444",
          }}
        >
          {scannerFocused ? "الباركود جاهز" : "اضغط لتفعيل"}
        </span>
      </div>

      {/* ── Insurance Modal ── */}
      {showInsuranceModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#070d1a",
              border: "1px solid rgba(56,189,248,0.15)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 380,
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 700 }}>
                🛡️ بيانات التأمين
              </span>
              <button
                onClick={() => setShowInsuranceModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 22,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                padding: "18px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  margin: "0 0 4px",
                }}
              >
                شركة التأمين
              </p>
              {INSURANCE_COMPANIES.map((co) => (
                <button
                  key={co.id}
                  onClick={() => setInsuranceCompany(co)}
                  style={{
                    background:
                      insuranceCompany?.id === co.id
                        ? "rgba(56,189,248,0.08)"
                        : "rgba(255,255,255,0.02)",
                    border: `1px solid ${insuranceCompany?.id === co.id ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 12,
                    padding: "11px 14px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      color:
                        insuranceCompany?.id === co.id ? "#f1f5f9" : "#94a3b8",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {co.name}
                  </span>
                  <span
                    style={{
                      background:
                        insuranceCompany?.id === co.id
                          ? "rgba(56,189,248,0.15)"
                          : "rgba(255,255,255,0.05)",
                      color:
                        insuranceCompany?.id === co.id
                          ? "#38bdf8"
                          : "rgba(255,255,255,0.3)",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 20,
                    }}
                  >
                    خصم {co.discount * 100}%
                  </span>
                </button>
              ))}
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  margin: "8px 0 4px",
                }}
              >
                رقم البطاقة
              </p>
              <input
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "#cbd5e1",
                  fontSize: 13,
                  fontFamily: "'Sora',sans-serif",
                  outline: "none",
                  width: "100%",
                }}
                placeholder="أدخل رقم البطاقة..."
                value={insuranceCardNumber}
                onChange={(e) => setInsuranceCardNumber(e.target.value)}
                dir="ltr"
              />
              {insuranceCompany && (
                <div
                  style={{
                    background: "rgba(56,189,248,0.04)",
                    border: "1px solid rgba(56,189,248,0.1)",
                    borderRadius: 12,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}
                    >
                      قبل الخصم
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>
                      {total.toFixed(2)} ج
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}
                    >
                      الخصم
                    </span>
                    <span
                      style={{
                        color: "#f59e0b",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      - {insuranceCompany.discount * 100}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 1,
                      background: "rgba(255,255,255,0.06)",
                      margin: "0 0 8px",
                    }}
                  />
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      المبلغ المتبقي
                    </span>
                    <span
                      style={{
                        color: "#38bdf8",
                        fontSize: 17,
                        fontWeight: 700,
                      }}
                    >
                      {(total - total * insuranceCompany.discount).toFixed(2)} ج
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  if (insuranceCompany) setShowInsuranceModal(false);
                }}
                disabled={!insuranceCompany}
                style={{
                  height: 46,
                  borderRadius: 12,
                  border: "1px solid rgba(52,211,153,0.3)",
                  background: "rgba(52,211,153,0.1)",
                  color: "#34d399",
                  fontSize: 13,
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: insuranceCompany ? 1 : 0.35,
                  marginTop: 4,
                }}
              >
                ✔ تأكيد التأمين
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Tabs ── */}
      <div
        className="mobile-tabs"
        style={{
          display: "none",
          background: "rgba(5,9,18,0.98)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "8px 12px",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {[
          ["products", "🏪 الأدوية"],
          ["cart", "🛒 السلة"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: 10,
              fontFamily: "'Sora',sans-serif",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              position: "relative",
              border:
                mobileTab === tab
                  ? "1px solid rgba(56,189,248,0.35)"
                  : "1px solid rgba(255,255,255,0.07)",
              background:
                mobileTab === tab ? "rgba(56,189,248,0.1)" : "transparent",
              color: mobileTab === tab ? "#38bdf8" : "rgba(255,255,255,0.3)",
            }}
          >
            {label}
            {tab === "cart" && cartItems.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#34d399",
                  color: "#020b12",
                  fontSize: 9,
                  fontWeight: 800,
                  width: 17,
                  height: 17,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartItems.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div
        className="pos-layout"
        style={{
          display: "flex",
          gap: 14,
          flex: 1,
          overflow: "hidden",
          padding: "0",
        }}
      >
        {/* ══════════════ LEFT PANEL ══════════════ */}
        <div
          className={`left-panel${mobileTab === "cart" ? " panel-hidden" : ""}`}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "rgba(5,9,18,0.7)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            overflow: "hidden",
            minWidth: 0,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Header */}
          <div
            className="panel-head"
            style={{
              padding: "14px 18px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg,rgba(56,189,248,0.15),rgba(56,189,248,0.05))",
                  border: "1px solid rgba(56,189,248,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <div>
                <h1
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#f1f5f9",
                    margin: 0,
                  }}
                >
                  نقطة البيع
                </h1>
                <p
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.25)",
                    margin: 0,
                  }}
                >
                  {filtered.length} دواء متاح
                </p>
              </div>
            </div>
            {/* Search */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <svg
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.3,
                }}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "8px 14px 8px 34px",
                  color: "#cbd5e1",
                  fontSize: 12,
                  fontFamily: "'Sora',sans-serif",
                  outline: "none",
                  width: 180,
                }}
                placeholder="ابحث عن دواء..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div
            className="cats-bar"
            style={{
              display: "flex",
              gap: 6,
              padding: "10px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              overflowX: "auto",
              scrollbarWidth: "none",
              flexShrink: 0,
            }}
          >
            {cats.map((c) => (
              <button
                key={c}
                className="cat-pill"
                onClick={() => setActiveCat(c)}
                style={{
                  padding: "5px 13px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                  fontFamily: "'Sora',sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  border:
                    activeCat === c
                      ? "1px solid rgba(56,189,248,0.4)"
                      : "1px solid rgba(255,255,255,0.07)",
                  background:
                    activeCat === c ? "rgba(56,189,248,0.1)" : "transparent",
                  color: activeCat === c ? "#38bdf8" : "rgba(255,255,255,0.3)",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div
            className="pos-grid"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 18px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))",
              gap: 10,
              alignContent: "start",
            }}
          >
            {loading ? (
              <p
                style={{
                  color: "rgba(255,255,255,0.15)",
                  fontSize: 12,
                  textAlign: "center",
                  padding: "40px 0",
                  gridColumn: "1/-1",
                }}
              >
                جارٍ التحميل...
              </p>
            ) : filtered.length === 0 ? (
              <p
                style={{
                  color: "rgba(255,255,255,0.15)",
                  fontSize: 12,
                  textAlign: "center",
                  padding: "40px 0",
                  gridColumn: "1/-1",
                }}
              >
                لا توجد نتائج
              </p>
            ) : (
              filtered.map((med, i) => (
                <div
                  key={med._id}
                  className={`med-card${cart[med._id] ? " in-cart" : ""}`}
                  onClick={() => addToCart(med)}
                  style={{
                    background: "rgba(10,16,30,0.8)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14,
                    padding: 14,
                    position: "relative",
                    animationDelay: `${i * 0.025}s`,
                  }}
                >
                  {med.isLowStock && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(251,191,36,0.12)",
                        border: "1px solid rgba(251,191,36,0.25)",
                        color: "#fbbf24",
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 20,
                      }}
                    >
                      قليل
                    </span>
                  )}
                  {cart[med._id] && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: "rgba(52,211,153,0.15)",
                        border: "1px solid rgba(52,211,153,0.3)",
                        color: "#34d399",
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 20,
                      }}
                    >
                      ✓ {cart[med._id].qty}
                    </span>
                  )}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: "rgba(56,189,248,0.08)",
                      border: "1px solid rgba(56,189,248,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                  <p
                    style={{
                      color: "#e2e8f0",
                      fontSize: 12,
                      fontWeight: 600,
                      margin: "0 0 2px",
                      lineHeight: 1.35,
                    }}
                  >
                    {med.name}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.22)",
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
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        color: "#34d399",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {med.price}
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 400,
                          marginRight: 2,
                        }}
                      >
                        {" "}
                        ج
                      </span>
                    </span>
                    <div
                      className="add-pill"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        background: "rgba(56,189,248,0.1)",
                        border: "1px solid rgba(56,189,248,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#38bdf8",
                        fontSize: 15,
                        opacity: 0,
                        transition: "opacity 0.15s",
                      }}
                    >
                      +
                    </div>
                  </div>
                  {/* Stock bar */}
                  <div
                    style={{
                      height: 2,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 2,
                      overflow: "hidden",
                      marginBottom: 3,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 2,
                        width: `${Math.min((med.stock / 50) * 100, 100)}%`,
                        background:
                          med.stock < 10
                            ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                            : "linear-gradient(90deg,#38bdf8,#34d399)",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.2)",
                      margin: 0,
                    }}
                  >
                    {med.stock} وحدة
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ══════════════ RIGHT PANEL — CART ══════════════ */}
        <div
          className={`right-panel${mobileTab === "products" ? " panel-hidden" : ""}`}
          style={{
            width: 272,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            background: "rgba(5,9,18,0.85)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            overflow: "hidden",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Cart Header */}
          <div
            style={{
              padding: "14px 16px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>
                السلة
              </span>
              {cartItems.length > 0 && (
                <span
                  style={{
                    background: "rgba(52,211,153,0.12)",
                    border: "1px solid rgba(52,211,153,0.25)",
                    color: "#34d399",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20,
                    animation: "pop 0.3s ease",
                  }}
                >
                  {cartItems.length}
                </span>
              )}
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                style={{
                  color: "rgba(239,68,68,0.5)",
                  fontSize: 11,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 600,
                }}
              >
                مسح الكل
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div
            className="cart-body"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {cartItems.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "40px 0",
                  opacity: 0.35,
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <p
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    fontSize: 11,
                    fontFamily: "'Sora',sans-serif",
                  }}
                >
                  السلة فارغة
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item._id}
                  className="cart-item"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 11,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <p
                      style={{
                        color: "#e2e8f0",
                        fontSize: 12,
                        fontWeight: 600,
                        margin: 0,
                        lineHeight: 1.3,
                        flex: 1,
                        marginLeft: 8,
                      }}
                    >
                      {item.name}
                    </p>
                    <button
                      className="rm-btn"
                      onClick={() => removeItem(item._id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "rgba(239,68,68,0.35)",
                        fontSize: 16,
                        cursor: "pointer",
                        lineHeight: 1,
                        padding: 0,
                        flexShrink: 0,
                        transition: "color 0.15s",
                      }}
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
                    <span
                      style={{
                        color: "#34d399",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {(item.price * item.qty).toFixed(2)} ج
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <button
                        className="qty-btn"
                        onClick={() => setQty(item._id, -1)}
                        style={{
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
                          fontFamily: "'Sora',sans-serif",
                          transition: "background 0.15s",
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          color: "#f1f5f9",
                          fontSize: 12,
                          fontWeight: 700,
                          minWidth: 20,
                          textAlign: "center",
                        }}
                      >
                        {item.qty}
                      </span>
                      <button
                        className="qty-btn"
                        onClick={() => setQty(item._id, 1)}
                        style={{
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
                          fontFamily: "'Sora',sans-serif",
                          transition: "background 0.15s",
                        }}
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
          <div
            className="cart-foot"
            style={{
              padding: "14px 16px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Patient */}
            <input
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "9px 12px",
                color: "#cbd5e1",
                fontSize: 12,
                fontFamily: "'Sora',sans-serif",
                outline: "none",
              }}
              placeholder="اسم المريض (اختياري)"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />

            {/* Payment Methods */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 6,
              }}
            >
              {["cash", "card", "insurance"].map((v) => (
                <button
                  key={v}
                  className="pay-btn"
                  onClick={() => {
                    setPaymentMethod(v);
                    if (v === "insurance") setShowInsuranceModal(true);
                  }}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 9,
                    fontFamily: "'Sora',sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s",
                    border:
                      paymentMethod === v
                        ? "1px solid rgba(56,189,248,0.4)"
                        : "1px solid rgba(255,255,255,0.06)",
                    background:
                      paymentMethod === v
                        ? "rgba(56,189,248,0.1)"
                        : "rgba(255,255,255,0.02)",
                    color:
                      paymentMethod === v ? "#38bdf8" : "rgba(255,255,255,0.3)",
                  }}
                >
                  <div style={{ fontSize: 14, marginBottom: 2 }}>
                    {payIcons[v]}
                  </div>
                  {payLabels[v]}
                </button>
              ))}
            </div>

            {/* Insurance strip */}
            {paymentMethod === "insurance" && insuranceCompany && (
              <div
                onClick={() => setShowInsuranceModal(true)}
                style={{
                  background: "rgba(56,189,248,0.05)",
                  border: "1px solid rgba(56,189,248,0.15)",
                  borderRadius: 9,
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{ color: "#38bdf8", fontSize: 11, fontWeight: 600 }}
                  >
                    🛡️ {insuranceCompany.name}
                  </span>
                  <span
                    style={{ color: "#f59e0b", fontSize: 11, fontWeight: 600 }}
                  >
                    - {insuranceCompany.discount * 100}%
                  </span>
                </div>
                {insuranceCardNumber && (
                  <span
                    style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}
                  >
                    بطاقة: {insuranceCardNumber}
                  </span>
                )}
              </div>
            )}
            {paymentMethod === "insurance" && !insuranceCompany && (
              <button
                onClick={() => setShowInsuranceModal(true)}
                style={{
                  background: "rgba(251,191,36,0.05)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  borderRadius: 9,
                  padding: "8px 12px",
                  color: "#fbbf24",
                  fontSize: 11,
                  fontFamily: "'Sora',sans-serif",
                  cursor: "pointer",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                ⚠ أدخل بيانات التأمين
              </button>
            )}

            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

            {/* Totals */}
            {activeInsurance && (
              <>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}
                  >
                    قبل الخصم
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: 13,
                      textDecoration: "line-through",
                    }}
                  >
                    {total.toFixed(2)} ج
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "rgba(245,158,11,0.7)", fontSize: 11 }}>
                    خصم {activeInsurance.discount * 100}%
                  </span>
                  <span
                    style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600 }}
                  >
                    - {discountAmount.toFixed(2)} ج
                  </span>
                </div>
              </>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                {activeInsurance ? "المبلغ المستحق" : "الإجمالي"}
              </span>
              <span
                style={{
                  color: activeInsurance ? "#38bdf8" : "#f1f5f9",
                  fontSize: "clamp(18px,4vw,24px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                {finalTotal.toFixed(2)}
                <span style={{ fontSize: 12, fontWeight: 400, marginRight: 3 }}>
                  ج
                </span>
              </span>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: 9,
                  padding: "8px 12px",
                  color: "#f87171",
                  fontSize: 11,
                  textAlign: "center",
                }}
              >
                ⚠ {error}
              </div>
            )}
            {success && (
              <div
                style={{
                  background: "rgba(52,211,153,0.07)",
                  border: "1px solid rgba(52,211,153,0.15)",
                  borderRadius: 9,
                  padding: "8px 12px",
                  color: "#34d399",
                  fontSize: 11,
                  textAlign: "center",
                  animation: "pop 0.3s ease",
                }}
              >
                ✓ {success.count} صنف · {success.total.toFixed(2)} ج
              </div>
            )}

            <button
              className="sell-btn"
              onClick={handleSale}
              disabled={submitting || cartItems.length === 0}
              style={{
                height: 46,
                borderRadius: 11,
                border: "1px solid rgba(52,211,153,0.35)",
                background:
                  cartItems.length === 0
                    ? "rgba(52,211,153,0.04)"
                    : "rgba(52,211,153,0.12)",
                color:
                  cartItems.length === 0 ? "rgba(52,211,153,0.3)" : "#34d399",
                fontSize: 13,
                fontFamily: "'Sora',sans-serif",
                fontWeight: 700,
                cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                letterSpacing: "0.03em",
              }}
            >
              {submitting
                ? "جارٍ الحفظ..."
                : cartItems.length === 0
                  ? "السلة فارغة"
                  : `✔ إتمام البيع · ${finalTotal.toFixed(2)} ج`}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile FAB ── */}
      {mobileTab === "products" && cartItems.length > 0 && (
        <button
          className="mobile-fab"
          onClick={() => setMobileTab("cart")}
          style={{
            display: "none",
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "rgba(6,10,20,0.95)",
            border: "1px solid rgba(52,211,153,0.35)",
            borderRadius: 40,
            padding: "11px 22px",
            color: "#cbd5e1",
            fontSize: 12,
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            cursor: "pointer",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            whiteSpace: "nowrap",
          }}
        >
          <span>🛒</span>
          <span
            style={{
              background: "rgba(52,211,153,0.15)",
              border: "1px solid rgba(52,211,153,0.3)",
              color: "#34d399",
              fontSize: 10,
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 20,
            }}
          >
            {cartItems.length} صنف
          </span>
          <span style={{ color: "#34d399", fontWeight: 800 }}>
            {finalTotal.toFixed(0)} ج
          </span>
        </button>
      )}
    </div>
  );
}
