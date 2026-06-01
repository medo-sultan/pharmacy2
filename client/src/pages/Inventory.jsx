// Inventory.jsx — Mobile-first responsive

import { useState, useEffect } from "react";
import { useAuth } from "../context/Sultan";
import { Plus, Search, Package2, AlertTriangle, X } from "lucide-react";

export default function Inventory() {
  const { apiFetch, isAdmin } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  const [form, setForm] = useState({
    name: "",
    genericName: "",
    category: "general",
    manufacturer: "",
    price: "",
    stock: "",
    lowStockThreshold: "",
    expiryDate: "",
    description: "",
    requiresPrescription: false,
  });

  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockExpiry, setRestockExpiry] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/pharmacy/inventory");
      setMedicines(data.medicines || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addMedicine = async () => {
    try {
      setAdding(true);
      await apiFetch("/pharmacy/medicine/add-json", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock || 0),
          lowStockThreshold: Number(form.lowStockThreshold || 10),
        }),
      });
      setShowAddModal(false);
      setForm({
        name: "",
        genericName: "",
        category: "general",
        manufacturer: "",
        price: "",
        stock: "",
        lowStockThreshold: "",
        expiryDate: "",
        description: "",
        requiresPrescription: false,
      });
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setAdding(false);
    }
  };

  const doRestock = async () => {
    try {
      await apiFetch(`/pharmacy/inventory/restock/${restockId}`, {
        method: "PUT",
        body: JSON.stringify({
          addQuantity: Number(restockQty),
          newExpiryDate: restockExpiry || undefined,
        }),
      });
      setRestockId(null);
      setRestockQty("");
      setRestockExpiry("");
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = medicines.filter((m) => {
    if (tab === "low" && !m.isLowStock) return false;
    if (tab === "expired" && !m.isExpired) return false;
    return m.name.toLowerCase().includes(search.toLowerCase());
  });

  const tabs = [
    { key: "all", label: "الكل" },
    { key: "low", label: "منخفض" },
    { key: "expired", label: "منتهي" },
  ];

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Sora', sans-serif",
        minHeight: "100vh",
        color: "#e2e8f0",
        padding: "16px",
      }}
    >
      <style>{`
        .inv-search-input::placeholder { color: rgba(148,163,184,0.4); }
        .inv-search-input:focus { border-color: rgba(34,211,238,0.4) !important; }
        .inv-card { transition: border-color 0.15s; }
        .inv-card:active { border-color: rgba(34,211,238,0.2) !important; }
        .inv-modal-input { outline: none; }
        .inv-modal-input:focus { border-color: rgba(34,211,238,0.4) !important; }
        @media (min-width: 640px) {
          .inv-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 900px) {
          .inv-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p
            style={{
              color: "#475569",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Pharmacy
          </p>
          <h1
            style={{
              fontSize: "clamp(22px, 6vw, 32px)",
              fontWeight: 700,
              margin: "3px 0 0",
              color: "#f1f5f9",
            }}
          >
            المخزون
          </h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              height: 44,
              padding: "0 16px",
              borderRadius: 14,
              background: "#22d3ee",
              color: "#000",
              fontWeight: 700,
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "'Sora', sans-serif",
              flexShrink: 0,
            }}
          >
            <Plus size={16} />
            إضافة دواء
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#475569",
          }}
          size={16}
        />
        <input
          className="inv-search-input"
          placeholder="ابحث عن دواء..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 14,
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
            paddingLeft: 42,
            paddingRight: 14,
            color: "#e2e8f0",
            fontSize: 13,
            fontFamily: "'Sora', sans-serif",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              border: `1px solid ${tab === t.key ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.08)"}`,
              background:
                tab === t.key ? "rgba(34,211,238,0.1)" : "rgba(15,23,42,0.6)",
              color: tab === t.key ? "#22d3ee" : "#64748b",
              fontSize: 12,
              fontFamily: "'Sora', sans-serif",
              fontWeight: tab === t.key ? 600 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
              minHeight: 36,
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards Grid (replaces table on mobile) */}
      {loading ? (
        <div
          style={{ textAlign: "center", color: "#475569", padding: "40px 0" }}
        >
          جارٍ التحميل...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{ textAlign: "center", color: "#334155", padding: "40px 0" }}
        >
          لا توجد أدوية
        </div>
      ) : (
        <div
          className="inv-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
          }}
        >
          {filtered.map((med) => (
            <div
              key={med._id}
              className="inv-card"
              style={{
                background: "rgba(15,23,42,0.7)",
                border: `1px solid ${med.isExpired ? "rgba(239,68,68,0.2)" : med.isLowStock ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 14,
                padding: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "rgba(34,211,238,0.08)",
                    border: "1px solid rgba(34,211,238,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Package2 size={18} style={{ color: "#22d3ee" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      color: "#f1f5f9",
                      fontSize: 13,
                      fontWeight: 700,
                      margin: "0 0 2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {med.name}
                  </p>
                  <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>
                    {med.genericName || med.category}
                  </p>
                </div>
                <div style={{ textAlign: "left", flexShrink: 0 }}>
                  <p
                    style={{
                      color: "#22d3ee",
                      fontSize: 15,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {med.price} ج
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Stock */}
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      color: med.isLowStock ? "#f59e0b" : "#94a3b8",
                      fontWeight: med.isLowStock ? 600 : 400,
                    }}
                  >
                    {med.isLowStock && <AlertTriangle size={12} />}
                    {med.stock} وحدة
                  </span>

                  {/* Expiry */}
                  {med.expiryDate && (
                    <span
                      style={{
                        fontSize: 11,
                        color: med.isExpired ? "#ef4444" : "#64748b",
                      }}
                    >
                      · {new Date(med.expiryDate).toLocaleDateString("ar-EG")}
                    </span>
                  )}

                  {/* Badges */}
                  {med.isExpired && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#ef4444",
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 20,
                        padding: "2px 7px",
                      }}
                    >
                      منتهي
                    </span>
                  )}
                  {med.isLowStock && !med.isExpired && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#f59e0b",
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: 20,
                        padding: "2px 7px",
                      }}
                    >
                      قليل
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setRestockId(med._id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(34,211,238,0.2)",
                    background: "rgba(34,211,238,0.08)",
                    color: "#22d3ee",
                    fontSize: 12,
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 600,
                    cursor: "pointer",
                    minHeight: 36,
                  }}
                >
                  شحن
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "#0d1117",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px 20px 0 0",
              padding:
                "20px 20px calc(20px + env(safe-area-inset-bottom, 0px))",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
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
                  fontSize: 16,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                إضافة دواء جديد
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#475569",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                ["name", "اسم الدواء *", "text"],
                ["genericName", "الاسم العلمي", "text"],
                ["manufacturer", "الشركة المصنعة", "text"],
                ["price", "السعر", "number"],
                ["stock", "المخزون", "number"],
                ["lowStockThreshold", "حد التنبيه", "number"],
                ["expiryDate", "تاريخ الصلاحية", "date"],
              ].map(([k, l, t]) => (
                <div
                  key={k}
                  style={{ gridColumn: k === "name" ? "1 / -1" : "auto" }}
                >
                  <label
                    style={{
                      color: "#475569",
                      fontSize: 11,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {l}
                  </label>
                  <input
                    type={t}
                    className="inv-modal-input"
                    value={form[k]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [k]: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(15,23,42,0.8)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: "0 12px",
                      color: "#cbd5e1",
                      fontSize: 13,
                      fontFamily: "'Sora', sans-serif",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    color: "#475569",
                    fontSize: 11,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  التصنيف
                </label>
                <select
                  className="inv-modal-input"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "0 12px",
                    color: "#cbd5e1",
                    fontSize: 13,
                    fontFamily: "'Sora', sans-serif",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="general">عام</option>
                  <option value="antibiotic">مضاد حيوي</option>
                  <option value="vitamin">فيتامين</option>
                  <option value="painkiller">مسكن</option>
                  <option value="chronic">أمراض مزمنة</option>
                  <option value="topical">موضعي</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <textarea
                  className="inv-modal-input"
                  rows={3}
                  placeholder="الوصف"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "10px 12px",
                    color: "#cbd5e1",
                    fontSize: 13,
                    fontFamily: "'Sora', sans-serif",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <input
                  type="checkbox"
                  id="rx-check"
                  checked={form.requiresPrescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      requiresPrescription: e.target.checked,
                    }))
                  }
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                <label
                  htmlFor="rx-check"
                  style={{ color: "#94a3b8", fontSize: 13, cursor: "pointer" }}
                >
                  يحتاج وصفة طبية
                </label>
              </div>
            </div>

            <button
              onClick={addMedicine}
              disabled={adding || !form.name}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 14,
                background:
                  adding || !form.name ? "rgba(34,211,238,0.3)" : "#22d3ee",
                color: "#000",
                fontWeight: 700,
                border: "none",
                fontSize: 14,
                fontFamily: "'Sora', sans-serif",
                cursor: adding || !form.name ? "not-allowed" : "pointer",
                marginTop: 16,
              }}
            >
              {adding ? "جارٍ الإضافة..." : "إضافة الدواء"}
            </button>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#0d1117",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px 20px 0 0",
              padding:
                "20px 20px calc(20px + env(safe-area-inset-bottom, 0px))",
            }}
          >
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
                  fontSize: 16,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                شحن المخزون
              </h2>
              <button
                onClick={() => setRestockId(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <input
                className="inv-modal-input"
                type="number"
                inputMode="numeric"
                placeholder="الكمية"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                style={{
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "0 14px",
                  color: "#e2e8f0",
                  fontSize: 14,
                  fontFamily: "'Sora', sans-serif",
                }}
              />
              <input
                className="inv-modal-input"
                type="date"
                value={restockExpiry}
                onChange={(e) => setRestockExpiry(e.target.value)}
                style={{
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "0 14px",
                  color: "#e2e8f0",
                  fontSize: 14,
                  fontFamily: "'Sora', sans-serif",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={doRestock}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  background: "#22d3ee",
                  color: "#000",
                  fontWeight: 700,
                  border: "none",
                  fontSize: 14,
                  fontFamily: "'Sora', sans-serif",
                  cursor: "pointer",
                }}
              >
                تأكيد
              </button>
              <button
                onClick={() => setRestockId(null)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#64748b",
                  fontSize: 14,
                  fontFamily: "'Sora', sans-serif",
                  cursor: "pointer",
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
