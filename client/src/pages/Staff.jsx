import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

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
    <div style={S.page}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
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
          }}
        >
          + موظف جديد
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 12,
        }}
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
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg,rgba(34,211,238,0.15),rgba(167,139,250,0.15))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#22d3ee",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p
                    style={{
                      color: "#f1f5f9",
                      fontSize: 13,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {s.name}
                  </p>
                  <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>
                    {s.email}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
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
                          fontSize: 9,
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
                  padding: "7px",
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.15)",
                  background: "transparent",
                  color: "rgba(239,68,68,0.5)",
                  fontSize: 11,
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

      {showAdd && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <h3
              style={{
                color: "#f1f5f9",
                fontSize: 15,
                fontWeight: 700,
                margin: "0 0 14px",
              }}
            >
              إضافة موظف
            </h3>
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
                    style={S.input}
                    value={form[k]}
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
                      gap: 8,
                      color: "#94a3b8",
                      fontSize: 12,
                      cursor: "pointer",
                      marginBottom: 6,
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
                  padding: "10px",
                  borderRadius: 10,
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
                  padding: "10px",
                  borderRadius: 10,
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

// ✅ styles object كان ناقص — ده سبب الـ crash
const S = {
  page: { fontFamily: "'Sora',sans-serif", color: "#e2e8f0" },
  eyebrow: {
    color: "#334155",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    margin: 0,
  },
  h1: { fontSize: 24, fontWeight: 700, color: "#f1f5f9", margin: "4px 0 0" },
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
    padding: "9px 12px",
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: "'Sora',sans-serif",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  },
  filterBtn: {
    padding: "9px 16px",
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
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "24px",
    width: "100%",
    maxWidth: 380,
    maxHeight: "90vh",
    overflowY: "auto",
  },
};
