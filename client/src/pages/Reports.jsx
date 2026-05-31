import { useState, useEffect } from "react";
import { useAuth } from "../context/Sultan";

const ACTION_META = {
  MAKE_SALE: {
    label: "بيع",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    icon: "💰",
  },
  RESTOCK_MEDICINE: {
    label: "تخزين",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    icon: "📦",
  },
  ADD_PRESCRIPTION: {
    label: "وصفة جديدة",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    icon: "📋",
  },
  DISPENSE_PRESCRIPTION: {
    label: "صرف وصفة",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.1)",
    icon: "💊",
  },
  REJECT_PRESCRIPTION: {
    label: "رفض وصفة",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    icon: "❌",
  },
  ADD_PRODUCT: {
    label: "إضافة دواء",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    icon: "➕",
  },
  EDIT_PRODUCT: {
    label: "تعديل دواء",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.1)",
    icon: "✏️",
  },
  VIEW_INVENTORY: {
    label: "عرض المخزون",
    color: "#475569",
    bg: "rgba(71,85,105,0.1)",
    icon: "👁",
  },
  UPDATE_ORDER_STATUS: {
    label: "تحديث طلب",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.1)",
    icon: "🔄",
  },
  VIEW_ORDERS: {
    label: "عرض الطلبات",
    color: "#475569",
    bg: "rgba(71,85,105,0.1)",
    icon: "👁",
  },
  VIEW_CUSTOMERS: {
    label: "عرض العملاء",
    color: "#475569",
    bg: "rgba(71,85,105,0.1)",
    icon: "👁",
  },
};

const ALL_ACTIONS = Object.keys(ACTION_META);

function DetailRow({ label, value, mono }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        padding: "6px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: 11,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: "#cbd5e1",
          fontSize: 12,
          textAlign: "left",
          fontFamily: mono ? "'JetBrains Mono',monospace" : "inherit",
          wordBreak: "break-all",
        }}
      >
        {String(value)}
      </span>
    </div>
  );
}

function renderDetails(action, details) {
  if (!details || typeof details !== "object") return null;
  const d = details;

  switch (action) {
    case "MAKE_SALE":
      return (
        <>
          <DetailRow label="رقم البيعة" value={d.saleId} mono />
          <DetailRow
            label="المبلغ الكلي"
            value={d.rawTotal ? `${d.rawTotal} ج` : undefined}
          />
          <DetailRow
            label="الخصم"
            value={
              d.discountAmount > 0
                ? `${d.discountAmount} ج (${d.discountPercent}%)`
                : undefined
            }
          />
          <DetailRow
            label="المبلغ المدفوع"
            value={d.totalAmount ? `${d.totalAmount} ج` : undefined}
          />
          <DetailRow label="عدد الأصناف" value={d.itemsCount} />
          <DetailRow label="شركة التأمين" value={d.insuranceCompany} />
        </>
      );
    case "RESTOCK_MEDICINE":
      return (
        <>
          <DetailRow label="الدواء" value={d.medicineName} />
          <DetailRow label="المخزون القديم" value={d.oldStock} />
          <DetailRow label="الكمية المضافة" value={d.addedQuantity} />
          <DetailRow label="المخزون الجديد" value={d.newStock} />
        </>
      );
    case "ADD_PRESCRIPTION":
    case "DISPENSE_PRESCRIPTION":
    case "REJECT_PRESCRIPTION":
      return (
        <>
          <DetailRow label="رقم الوصفة" value={d.prescriptionId} mono />
          <DetailRow label="اسم المريض" value={d.patientName} />
          <DetailRow label="عدد الأدوية" value={d.itemsCount} />
          <DetailRow label="السبب" value={d.reason} />
        </>
      );
    case "RESTOCK_MEDICINE":
    case "ADD_PRODUCT":
    case "EDIT_PRODUCT":
      return (
        <>
          <DetailRow label="الدواء" value={d.medicineName || d.name} />
          <DetailRow label="المعرّف" value={d.medicineId} mono />
        </>
      );
    default:
      return Object.entries(d).map(([k, v]) =>
        typeof v !== "object" ? (
          <DetailRow key={k} label={k} value={v} />
        ) : null,
      );
  }
}

export function Reports() {
  const { apiFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({});

  const load = () => {
    setLoading(true);
    const path = selectedStaff
      ? `/user/staff/logs/${selectedStaff}`
      : "/user/staff/logs";
    apiFetch(path)
      .then((d) => {
        const all = d.logs || [];
        setLogs(all);
        // حساب الإحصائيات
        const s = {};
        all.forEach((l) => {
          s[l.action] = (s[l.action] || 0) + 1;
        });
        setStats(s);
      })
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

  const filtered = logs.filter((l) => {
    const matchAction = !selectedAction || l.action === selectedAction;
    const matchSearch =
      !search ||
      l.staffName?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  const topActions = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .log-row { transition: background 0.12s; cursor: pointer; }
        .log-row:hover { background: rgba(255,255,255,0.03) !important; }
        .act-chip { transition: all 0.12s; cursor: pointer; }
        .act-chip:hover { transform: translateY(-1px); }
        .stat-card { animation: fadeUp 0.3s ease both; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        select option { background: #0d1526; }
      `}</style>

      {/* Detail Modal */}
      {selected && (
        <div style={S.overlay} onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            {(() => {
              const meta = ACTION_META[selected.action] || {
                label: selected.action,
                color: "#94a3b8",
                bg: "rgba(148,163,184,0.1)",
                icon: "○",
              };
              return (
                <>
                  <div style={S.modalHead}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          ...S.modalIconBox,
                          background: meta.bg,
                          border: `1px solid ${meta.color}30`,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{meta.icon}</span>
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            color: "rgba(255,255,255,0.3)",
                            fontSize: 10,
                            letterSpacing: "0.08em",
                          }}
                        >
                          إجراء
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: meta.color,
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {meta.label}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      style={S.closeBtn}
                    >
                      ×
                    </button>
                  </div>
                  <div style={S.modalBody}>
                    <div style={S.metaBlock}>
                      <DetailRow label="الموظف" value={selected.staffName} />
                      <DetailRow
                        label="الـ Action"
                        value={selected.action}
                        mono
                      />
                      <DetailRow
                        label="التاريخ"
                        value={new Date(selected.createdAt).toLocaleString(
                          "ar-EG",
                        )}
                      />
                      <DetailRow label="الـ IP" value={selected.ip} mono />
                    </div>
                    {selected.details &&
                      Object.keys(selected.details).length > 0 && (
                        <>
                          <p
                            style={{
                              color: "rgba(255,255,255,0.2)",
                              fontSize: 10,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              margin: "12px 0 8px",
                              fontFamily: "'JetBrains Mono',monospace",
                            }}
                          >
                            التفاصيل
                          </p>
                          <div style={S.metaBlock}>
                            {renderDetails(selected.action, selected.details)}
                          </div>
                        </>
                      )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: 22, animation: "fadeUp 0.3s ease" }}>
        <p style={S.eyebrow}>Admin · التقارير</p>
        <h1 style={S.h1}>سجل النشاط</h1>
      </div>

      {/* Stats bar */}
      {topActions.length > 0 && (
        <div style={S.statsRow}>
          {topActions.map(([action, count], i) => {
            const meta = ACTION_META[action] || {
              label: action,
              color: "#94a3b8",
              bg: "rgba(148,163,184,0.08)",
              icon: "○",
            };
            return (
              <div
                key={action}
                className="stat-card"
                onClick={() =>
                  setSelectedAction(selectedAction === action ? "" : action)
                }
                style={{
                  ...S.statCard,
                  animationDelay: `${i * 0.06}s`,
                  border:
                    selectedAction === action
                      ? `1px solid ${meta.color}40`
                      : "1px solid rgba(255,255,255,0.06)",
                  background:
                    selectedAction === action ? meta.bg : "rgba(8,12,20,0.7)",
                  cursor: "pointer",
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
                  <span style={{ fontSize: 18 }}>{meta.icon}</span>
                  <span
                    style={{
                      color: meta.color,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    color: meta.color,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {meta.label}
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    color: "rgba(255,255,255,0.2)",
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono',monospace",
                    letterSpacing: "0.1em",
                  }}
                >
                  {action}
                </p>
              </div>
            );
          })}
          <div
            className="stat-card"
            style={{
              ...S.statCard,
              animationDelay: "0.24s",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.15)",
                fontSize: 11,
                margin: "0 0 4px",
                textAlign: "center",
              }}
            >
              إجمالي السجلات
            </p>
            <p
              style={{
                color: "#f1f5f9",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 26,
                fontWeight: 700,
                margin: 0,
                textAlign: "center",
              }}
            >
              {logs.length}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={S.filtersRow}>
        <input
          style={S.searchInput}
          placeholder="🔍  ابحث باسم الموظف أو الإجراء..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          dir="rtl"
        />
        <select
          style={S.select}
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
        <select
          style={S.select}
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
        >
          <option value="">كل الإجراءات</option>
          {ALL_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {ACTION_META[a]?.label || a}
            </option>
          ))}
        </select>
        <button onClick={load} style={S.refreshBtn}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          تحديث
        </button>
        {(selectedAction || search) && (
          <button
            onClick={() => {
              setSelectedAction("");
              setSearch("");
            }}
            style={S.clearBtn}
          >
            مسح الفلتر
          </button>
        )}
        <span
          style={{
            color: "rgba(255,255,255,0.15)",
            fontSize: 11,
            marginRight: "auto",
            fontFamily: "'JetBrains Mono',monospace",
          }}
        >
          {filtered.length} / {logs.length}
        </span>
      </div>

      {/* Action chips */}
      <div style={S.chipsRow}>
        {Object.entries(ACTION_META).map(([action, meta]) => {
          const count = stats[action] || 0;
          if (!count) return null;
          const active = selectedAction === action;
          return (
            <button
              key={action}
              className="act-chip"
              onClick={() => setSelectedAction(active ? "" : action)}
              style={{
                ...S.chip,
                color: active ? meta.color : "rgba(255,255,255,0.25)",
                background: active ? meta.bg : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? meta.color + "40" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span
                style={{
                  background: active
                    ? meta.color + "25"
                    : "rgba(255,255,255,0.06)",
                  color: active ? meta.color : "rgba(255,255,255,0.2)",
                  fontSize: 9,
                  padding: "1px 5px",
                  borderRadius: 10,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.emptyState}>
            <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 13 }}>
              جارٍ التحميل...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={S.emptyState}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
              لا توجد سجلات مطابقة
            </div>
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {["الموظف", "الإجراء", "التفاصيل", "التاريخ"].map((h) => (
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => {
                const meta = ACTION_META[l.action] || {
                  label: l.action,
                  color: "#94a3b8",
                  bg: "rgba(148,163,184,0.1)",
                  icon: "○",
                };
                const d = l.details || {};
                const shortDetail =
                  l.action === "MAKE_SALE"
                    ? `${d.totalAmount || d.rawTotal || ""} ج · ${d.itemsCount || 0} صنف`
                    : l.action === "RESTOCK_MEDICINE"
                      ? `${d.medicineName || ""} · ${d.addedQuantity || 0}+`
                      : l.action === "ADD_PRESCRIPTION" ||
                          l.action === "DISPENSE_PRESCRIPTION"
                        ? d.patientName || ""
                        : Object.values(d)
                            .filter((v) => typeof v !== "object")
                            .slice(0, 2)
                            .join(" · ");

                return (
                  <tr
                    key={l._id}
                    className="log-row"
                    onClick={() => setSelected(l)}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      animationDelay: `${i * 0.02}s`,
                    }}
                  >
                    {/* Staff */}
                    <td style={S.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            background: "rgba(34,211,238,0.07)",
                            border: "1px solid rgba(34,211,238,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#22d3ee",
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                            fontFamily: "'JetBrains Mono',monospace",
                          }}
                        >
                          {l.staffName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span
                          style={{
                            color: "#cbd5e1",
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {l.staffName}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td style={S.td}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          background: meta.bg,
                          color: meta.color,
                          border: `1px solid ${meta.color}25`,
                          borderRadius: 8,
                          padding: "4px 9px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </span>
                    </td>

                    {/* Details preview */}
                    <td style={{ ...S.td, maxWidth: 220 }}>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.28)",
                          fontSize: 11,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {shortDetail || "—"}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={S.td}>
                      <div
                        style={{
                          color: "rgba(255,255,255,0.22)",
                          fontSize: 11,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {new Date(l.createdAt).toLocaleDateString("ar-EG")}
                      </div>
                      <div
                        style={{
                          color: "rgba(255,255,255,0.12)",
                          fontSize: 10,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {new Date(l.createdAt).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const S = {
  page: {
    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
    color: "#e2e8f0",
    padding: "0 0 40px",
    direction: "rtl",
  },
  eyebrow: {
    color: "rgba(255,255,255,0.18)",
    fontSize: 10,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    margin: 0,
    fontFamily: "'JetBrains Mono',monospace",
  },
  h1: { fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: "4px 0 0" },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 12,
    padding: "14px 14px",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.15s",
  },

  filtersRow: {
    display: "flex",
    gap: 8,
    marginBottom: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: 180,
    background: "rgba(8,12,20,0.8)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "9px 13px",
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: "'IBM Plex Sans Arabic',sans-serif",
    outline: "none",
  },
  select: {
    background: "rgba(8,12,20,0.8)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "9px 12px",
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: "'IBM Plex Sans Arabic',sans-serif",
    outline: "none",
    cursor: "pointer",
  },
  refreshBtn: {
    padding: "9px 13px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "'IBM Plex Sans Arabic',sans-serif",
    transition: "all 0.15s",
  },
  clearBtn: {
    padding: "9px 13px",
    borderRadius: 10,
    border: "1px solid rgba(239,68,68,0.15)",
    background: "transparent",
    color: "rgba(239,68,68,0.5)",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "'IBM Plex Sans Arabic',sans-serif",
  },

  chipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'IBM Plex Sans Arabic',sans-serif",
    transition: "all 0.15s",
  },

  tableWrap: {
    background: "rgba(8,12,20,0.7)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    color: "rgba(255,255,255,0.18)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "12px 16px",
    textAlign: "right",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.015)",
    fontFamily: "'JetBrains Mono',monospace",
  },
  td: { padding: "11px 16px", textAlign: "right", verticalAlign: "middle" },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "50px 0",
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
    background: "#0a0f1e",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 18,
    width: 420,
    maxWidth: "92vw",
    maxHeight: "80vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
    animation: "fadeUp 0.2s ease",
  },
  modalHead: {
    padding: "16px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  modalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: "16px 18px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  metaBlock: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: "10px 13px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.25)",
    fontSize: 22,
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
  },
};
