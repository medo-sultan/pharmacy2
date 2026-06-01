// Staff.jsx — Mobile responsive
import { useEffect, useState } from "react";
import { useAuth } from "../context/Sultan";
import { X } from "lucide-react";

export function Staff() {
  const { apiFetch } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    permissions: {
      manageProducts: false,
      manageOrders: true,
      viewCustomers: false,
    },
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch("/user/staff/all")
      .then((d) => setStaffList(d.staffList || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const removeStaff = async (id) => {
    if (!window.confirm("حذف الموظف؟")) return;
    try {
      await apiFetch(`/user/staff/remove/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const addStaff = async () => {
    setSaving(true);
    try {
      await apiFetch("/user/staff/add", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowAdd(false);
      setForm({
        name: "",
        email: "",
        password: "",
        permissions: {
          manageProducts: false,
          manageOrders: true,
          viewCustomers: false,
        },
      });
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.page} dir="rtl">
      <style>{`
        .staff-input:focus { border-color: rgba(34,211,238,0.4) !important; outline: none; }
        @media (min-width: 560px) {
          .staff-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

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
          <p style={S.eyebrow}>Admin</p>
          <h1 style={S.h1}>الموظفون 👥</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            ...S.filterBtn,
            background: "rgba(34,211,238,0.1)",
            borderColor: "rgba(34,211,238,0.3)",
            color: "#22d3ee",
            minHeight: 44,
          }}
        >
          + موظف جديد
        </button>
      </div>

      <div
        className="staff-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}
      >
        {loading ? (
          <p style={{ color: "#334155" }}>جارٍ التحميل...</p>
        ) : staffList.length === 0 ? (
          <p style={{ color: "#334155" }}>لا يوجد موظفون</p>
        ) : (
          staffList.map((s) => (
            <div
              key={s._id}
              style={{
                background: "rgba(15,23,42,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background:
                      "linear-gradient(135deg,rgba(34,211,238,0.15),rgba(167,139,250,0.15))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#22d3ee",
                    fontWeight: 700,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {s.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      color: "#f1f5f9",
                      fontSize: 14,
                      fontWeight: 700,
                      margin: "0 0 2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.name}
                  </p>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: 11,
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.email}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                  marginBottom: 12,
                }}
              >
                {Object.entries(s.permissions || {}).map(
                  ([k, v]) =>
                    v && (
                      <span
                        key={k}
                        style={{
                          ...S.badge,
                          color: "#10b981",
                          background: "rgba(16,185,129,0.08)",
                          borderColor: "rgba(16,185,129,0.15)",
                          fontSize: 10,
                        }}
                      >
                        {k === "manageOrders"
                          ? "وصفات+مخزون+مبيعات"
                          : k === "manageProducts"
                            ? "منتجات"
                            : "عملاء"}
                      </span>
                    ),
                )}
              </div>

              <button
                onClick={() => removeStaff(s._id)}
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 10,
                  border: "1px solid rgba(239,68,68,0.15)",
                  background: "transparent",
                  color: "rgba(239,68,68,0.5)",
                  fontSize: 12,
                  fontFamily: "'Sora',sans-serif",
                  cursor: "pointer",
                }}
              >
                حذف الموظف
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Staff — Bottom Sheet */}
      {showAdd && (
        <div style={S.overlay}>
          <div style={S.sheet}>
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.1)",
                margin: "0 auto 16px",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <h3
                style={{
                  color: "#f1f5f9",
                  fontSize: 15,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                إضافة موظف
              </h3>
              <button
                onClick={() => setShowAdd(false)}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["name", "الاسم *", "text"],
                ["email", "الإيميل *", "email"],
                ["password", "الباسورد *", "password"],
              ].map(([k, l, t]) => (
                <div key={k}>
                  <label style={S.label}>{l}</label>
                  <input
                    type={t}
                    className="staff-input"
                    style={{ ...S.input, height: 44 }}
                    value={form[k]}
                    autoComplete={
                      t === "email"
                        ? "email"
                        : t === "password"
                          ? "new-password"
                          : "name"
                    }
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [k]: e.target.value }))
                    }
                  />
                </div>
              ))}

              <div>
                <label style={S.label}>الصلاحيات</label>
                {[
                  ["manageOrders", "صيدلية كاملة (وصفات + مخزون + مبيعات)"],
                  ["manageProducts", "إدارة المنتجات"],
                  ["viewCustomers", "عرض العملاء"],
                ].map(([k, l]) => (
                  <label
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      color: "#94a3b8",
                      fontSize: 13,
                      cursor: "pointer",
                      marginBottom: 10,
                      minHeight: 36,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions[k]}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          permissions: {
                            ...f.permissions,
                            [k]: e.target.checked,
                          },
                        }))
                      }
                      style={{ width: 18, height: 18 }}
                    />
                    {l}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                onClick={addStaff}
                disabled={saving || !form.name || !form.email || !form.password}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: "1px solid rgba(34,211,238,0.3)",
                  background: "rgba(34,211,238,0.1)",
                  color: "#22d3ee",
                  fontSize: 13,
                  fontFamily: "'Sora',sans-serif",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity:
                    saving || !form.name || !form.email || !form.password
                      ? 0.5
                      : 1,
                }}
              >
                {saving ? "جارٍ الحفظ..." : "إضافة"}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "transparent",
                  color: "#475569",
                  fontSize: 13,
                  fontFamily: "'Sora',sans-serif",
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
    fontSize: "clamp(20px, 6vw, 28px)",
    fontWeight: 700,
    color: "#f1f5f9",
    margin: "4px 0 0",
  },
  label: {
    color: "#475569",
    fontSize: 11,
    fontWeight: 600,
    display: "block",
    marginBottom: 5,
  },
  input: {
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "0 12px",
    color: "#cbd5e1",
    fontSize: 13,
    fontFamily: "'Sora',sans-serif",
    boxSizing: "border-box",
    width: "100%",
  },
  filterBtn: {
    padding: "9px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: "'Sora',sans-serif",
    cursor: "pointer",
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 20,
    padding: "2px 8px",
    border: "1px solid",
    display: "inline-block",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(8px)",
    zIndex: 100,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  sheet: {
    background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px 20px 0 0",
    padding: "16px 20px",
    paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
    width: "100%",
    maxWidth: 480,
    maxHeight: "85vh",
    overflowY: "auto",
  },
};
