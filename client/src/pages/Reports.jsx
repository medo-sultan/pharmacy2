import { useState, useEffect } from "react"; // ✅ أضفنا useEffect
import { useAuth } from "../context/Sultan";

export function Reports() {
  const { apiFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  const load = () => {
    setLoading(true);
    const path = selectedStaff
      ? `/user/staff/logs/${selectedStaff}`
      : "/user/staff/logs";
    apiFetch(path)
      .then((d) => setLogs(d.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    apiFetch("/user/staff/all")
      .then((d) => setStaffList(d.staffList || []))
      .catch(() => {});
    load();
  }, []);

  useEffect(() => {
    load();
  }, [selectedStaff]);

  const actionColors = {
    ADD_PRODUCT: "#60a5fa",
    EDIT_PRODUCT: "#a78bfa",
    RESTOCK_MEDICINE: "#10b981",
    VIEW_INVENTORY: "#334155",
    MAKE_SALE: "#f59e0b",
    DISPENSE_PRESCRIPTION: "#22d3ee",
    ADD_PRESCRIPTION: "#a78bfa",
    REJECT_PRESCRIPTION: "#ef4444",
    UPDATE_ORDER_STATUS: "#f59e0b",
    VIEW_ORDERS: "#334155",
    VIEW_CUSTOMERS: "#334155",
  };

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 24 }}>
        <p style={S.eyebrow}>Admin</p>
        <h1 style={S.h1}>التقارير وسجل النشاط 📊</h1>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <select
          style={{ ...S.input, width: "auto", minWidth: 180 }}
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
        >
          <option value="">كل الموظفين</option>
          {staffList.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <button onClick={load} style={S.filterBtn}>
          تحديث
        </button>
        <span style={{ color: "#334155", fontSize: 12, marginRight: "auto" }}>
          {logs.length} سجل
        </span>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {["الموظف", "الإجراء", "التفاصيل", "التاريخ"].map((h, i) => (
                <th key={i} style={S.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={S.empty}>
                  جارٍ التحميل...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={S.empty}>
                  لا توجد سجلات
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr
                  key={l._id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td style={S.td}>{l.staffName}</td>
                  <td style={S.td}>
                    <span
                      style={{
                        ...S.badge,
                        color: actionColors[l.action] || "#94a3b8",
                        background: `${actionColors[l.action] || "#94a3b8"}15`,
                        borderColor: `${actionColors[l.action] || "#94a3b8"}30`,
                        fontSize: 9,
                      }}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td
                    style={{
                      ...S.td,
                      color: "#475569",
                      fontSize: 11,
                      maxWidth: 200,
                    }}
                  >
                    {JSON.stringify(l.details).slice(0, 80)}
                  </td>
                  <td style={{ ...S.td, color: "#334155", fontSize: 11 }}>
                    {new Date(l.createdAt).toLocaleString("ar-EG")}
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
  tableWrap: {
    overflowX: "auto",
    background: "rgba(8,12,20,0.8)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    color: "#334155",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "12px 16px",
    textAlign: "right",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  td: {
    padding: "12px 16px",
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "right",
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 20,
    padding: "2px 8px",
    border: "1px solid",
    display: "inline-block",
  },
  empty: { color: "#334155", textAlign: "center", padding: "40px 0" },
};
