import { useState, useEffect } from "react";
import { useAuth } from "../context/Sultan";

const ACTION_META = {
  MAKE_SALE: {
    label: "بيع",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    glow: "rgba(245,158,11,0.25)",
    icon: "💰",
  },
  RESTOCK_MEDICINE: {
    label: "تخزين",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    glow: "rgba(16,185,129,0.25)",
    icon: "📦",
  },
  ADD_PRESCRIPTION: {
    label: "وصفة جديدة",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    glow: "rgba(167,139,250,0.25)",
    icon: "📋",
  },
  DISPENSE_PRESCRIPTION: {
    label: "صرف وصفة",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.12)",
    glow: "rgba(34,211,238,0.25)",
    icon: "💊",
  },
  REJECT_PRESCRIPTION: {
    label: "رفض وصفة",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    glow: "rgba(239,68,68,0.25)",
    icon: "❌",
  },
  ADD_PRODUCT: {
    label: "إضافة دواء",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
    glow: "rgba(96,165,250,0.25)",
    icon: "➕",
  },
  EDIT_PRODUCT: {
    label: "تعديل دواء",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.12)",
    glow: "rgba(192,132,252,0.25)",
    icon: "✏️",
  },
  VIEW_INVENTORY: {
    label: "عرض المخزون",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    glow: "rgba(148,163,184,0.15)",
    icon: "👁",
  },
  UPDATE_ORDER_STATUS: {
    label: "تحديث طلب",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.12)",
    glow: "rgba(251,146,60,0.25)",
    icon: "🔄",
  },
  VIEW_ORDERS: {
    label: "عرض الطلبات",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    glow: "rgba(148,163,184,0.15)",
    icon: "👁",
  },
  VIEW_CUSTOMERS: {
    label: "عرض العملاء",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    glow: "rgba(148,163,184,0.15)",
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
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 11,
          whiteSpace: "nowrap",
          flexShrink: 0,
          fontFamily: "'JetBrains Mono',monospace",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: "#e2e8f0",
          fontSize: 12,
          textAlign: "left",
          fontFamily: mono
            ? "'JetBrains Mono',monospace"
            : "'IBM Plex Sans Arabic',sans-serif",
          wordBreak: "break-all",
          fontWeight: mono ? 400 : 500,
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
          <DetailRow label="saleId" value={d.saleId} mono />
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
          <DetailRow label="prescriptionId" value={d.prescriptionId} mono />
          <DetailRow label="اسم المريض" value={d.patientName} />
          <DetailRow label="عدد الأدوية" value={d.itemsCount} />
          <DetailRow label="السبب" value={d.reason} />
        </>
      );
    case "ADD_PRODUCT":
    case "EDIT_PRODUCT":
      return (
        <>
          <DetailRow label="الدواء" value={d.medicineName || d.name} />
          <DetailRow label="medicineId" value={d.medicineId} mono />
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const load = () => {
    setLoading(true);
    const path = selectedStaff
      ? `/user/staff/logs/${selectedStaff}`
      : "/user/staff/logs";
    apiFetch(path)
      .then((d) => {
        const all = d.logs || [];
        setLogs(all);
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
    <div
      style={{
        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
        color: "#e2e8f0",
        padding: isMobile ? "0 0 32px" : "0 0 48px",
        direction: "rtl",
        maxWidth: "100%",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .log-row { transition: background 0.15s, transform 0.1s; cursor: pointer; }
        .log-row:hover { background: rgba(255,255,255,0.035) !important; }
        .log-row:active { transform: scale(0.995); }
        .act-chip { transition: all 0.15s; cursor: pointer; }
        .act-chip:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .stat-card { animation: fadeUp 0.35s ease both; transition: all 0.2s; cursor: pointer; }
        .stat-card:hover { transform: translateY(-2px); }
        .filter-control:focus { border-color: rgba(34,211,238,0.3) !important; box-shadow: 0 0 0 3px rgba(34,211,238,0.06) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        select option { background: #080d1a; }
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
      `}</style>

      {/* Modal */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            animation: "fadeIn 0.15s ease",
            padding: 16,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              background: "linear-gradient(145deg,#0c1120,#080d1a)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 460,
              maxHeight: "88vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow:
                "0 40px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)",
              animation: "fadeUp 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const meta = ACTION_META[selected.action] || {
                label: selected.action,
                color: "#94a3b8",
                bg: "rgba(148,163,184,0.1)",
                glow: "rgba(148,163,184,0.1)",
                icon: "○",
              };
              return (
                <>
                  {/* Modal Header */}
                  <div
                    style={{
                      padding: "18px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexShrink: 0,
                      background: `linear-gradient(135deg, ${meta.bg}, transparent)`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: meta.bg,
                          border: `1px solid ${meta.color}35`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          boxShadow: `0 4px 20px ${meta.glow}`,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            color: "rgba(255,255,255,0.3)",
                            fontSize: 10,
                            letterSpacing: "0.1em",
                            fontFamily: "'JetBrains Mono',monospace",
                            textTransform: "uppercase",
                          }}
                        >
                          إجراء
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            color: meta.color,
                            fontSize: 15,
                            fontWeight: 700,
                          }}
                        >
                          {meta.label}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.4)",
                        fontSize: 18,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                        transition: "all 0.15s",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div
                    style={{
                      padding: "18px 20px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* Meta Info */}
                    <div>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.2)",
                          fontSize: 9,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          margin: "0 0 8px",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        معلومات السجل
                      </p>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 12,
                          padding: "12px 14px",
                        }}
                      >
                        <DetailRow label="الموظف" value={selected.staffName} />
                        <DetailRow
                          label="action"
                          value={selected.action}
                          mono
                        />
                        <DetailRow
                          label="التاريخ"
                          value={new Date(selected.createdAt).toLocaleString(
                            "ar-EG",
                          )}
                        />
                        <DetailRow label="IP" value={selected.ip} mono />
                      </div>
                    </div>

                    {/* Details */}
                    {selected.details &&
                      Object.keys(selected.details).length > 0 && (
                        <div>
                          <p
                            style={{
                              color: "rgba(255,255,255,0.2)",
                              fontSize: 9,
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              margin: "0 0 8px",
                              fontFamily: "'JetBrains Mono',monospace",
                            }}
                          >
                            التفاصيل
                          </p>
                          <div
                            style={{
                              background: "rgba(255,255,255,0.025)",
                              border: "1px solid rgba(255,255,255,0.06)",
                              borderRadius: 12,
                              padding: "12px 14px",
                            }}
                          >
                            {renderDetails(selected.action, selected.details)}
                          </div>
                        </div>
                      )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          marginBottom: isMobile ? 18 : 24,
          animation: "fadeUp 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 3,
              height: 18,
              borderRadius: 2,
              background: "linear-gradient(180deg,#22d3ee,#3b82f6)",
            }}
          />
          <p
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              margin: 0,
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            Admin · التقارير
          </p>
        </div>
        <h1
          style={{
            fontSize: isMobile ? 22 : 28,
            fontWeight: 700,
            color: "#f1f5f9",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          سجل النشاط
        </h1>
      </div>

      {/* Stats Grid */}
      {topActions.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(150px,1fr))",
            gap: isMobile ? 8 : 10,
            marginBottom: isMobile ? 14 : 18,
          }}
        >
          {topActions.map(([action, count], i) => {
            const meta = ACTION_META[action] || {
              label: action,
              color: "#94a3b8",
              bg: "rgba(148,163,184,0.08)",
              glow: "rgba(148,163,184,0.1)",
              icon: "○",
            };
            const active = selectedAction === action;
            return (
              <div
                key={action}
                className="stat-card"
                onClick={() => setSelectedAction(active ? "" : action)}
                style={{
                  borderRadius: 14,
                  padding: isMobile ? "12px 13px" : "15px 15px",
                  display: "flex",
                  flexDirection: "column",
                  animationDelay: `${i * 0.07}s`,
                  border: active
                    ? `1px solid ${meta.color}45`
                    : "1px solid rgba(255,255,255,0.07)",
                  background: active
                    ? `linear-gradient(135deg,${meta.bg},rgba(0,0,0,0.3))`
                    : "rgba(8,12,20,0.8)",
                  boxShadow: active ? `0 6px 30px ${meta.glow}` : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: meta.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      border: `1px solid ${meta.color}20`,
                    }}
                  >
                    {meta.icon}
                  </div>
                  <span
                    style={{
                      color: active ? meta.color : "#f1f5f9",
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 22,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {count}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    color: active ? meta.color : "rgba(255,255,255,0.6)",
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 600,
                  }}
                >
                  {meta.label}
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    color: "rgba(255,255,255,0.15)",
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono',monospace",
                    letterSpacing: "0.08em",
                  }}
                >
                  {action}
                </p>
              </div>
            );
          })}
          {/* Total card */}
          <div
            className="stat-card"
            style={{
              borderRadius: 14,
              padding: isMobile ? "12px 13px" : "15px 15px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              animationDelay: "0.28s",
              border: "1px solid rgba(34,211,238,0.15)",
              background: "rgba(34,211,238,0.04)",
              cursor: "default",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.2)",
                fontSize: 10,
                margin: "0 0 6px",
                textAlign: "center",
              }}
            >
              إجمالي
            </p>
            <p
              style={{
                color: "#22d3ee",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: isMobile ? 28 : 32,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1,
              }}
            >
              {logs.length}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.15)",
                fontSize: 9,
                margin: "4px 0 0",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              سجل
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: isMobile ? "100%" : 200,
          }}
        >
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.2)",
              fontSize: 13,
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            className="filter-control"
            style={{
              width: "100%",
              background: "rgba(8,12,20,0.9)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 11,
              padding: "10px 36px 10px 14px",
              color: "#cbd5e1",
              fontSize: 12,
              fontFamily: "'IBM Plex Sans Arabic',sans-serif",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            placeholder="ابحث باسم الموظف أو الإجراء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            dir="rtl"
          />
        </div>

        <select
          className="filter-control"
          style={{
            flex: isMobile ? 1 : "0 0 auto",
            background: "rgba(8,12,20,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 11,
            padding: "10px 12px",
            color: "#cbd5e1",
            fontSize: 12,
            fontFamily: "'IBM Plex Sans Arabic',sans-serif",
            outline: "none",
            cursor: "pointer",
            minWidth: isMobile ? 0 : 130,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
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
          className="filter-control"
          style={{
            flex: isMobile ? 1 : "0 0 auto",
            background: "rgba(8,12,20,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 11,
            padding: "10px 12px",
            color: "#cbd5e1",
            fontSize: 12,
            fontFamily: "'IBM Plex Sans Arabic',sans-serif",
            outline: "none",
            cursor: "pointer",
            minWidth: isMobile ? 0 : 130,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
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

        <button
          onClick={load}
          style={{
            padding: "10px 14px",
            borderRadius: 11,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.45)",
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "'IBM Plex Sans Arabic',sans-serif",
            transition: "all 0.15s",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          {!isMobile && "تحديث"}
        </button>

        {(selectedAction || search) && (
          <button
            onClick={() => {
              setSelectedAction("");
              setSearch("");
            }}
            style={{
              padding: "10px 12px",
              borderRadius: 11,
              border: "1px solid rgba(239,68,68,0.2)",
              background: "rgba(239,68,68,0.05)",
              color: "rgba(239,68,68,0.6)",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "'IBM Plex Sans Arabic',sans-serif",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            مسح ✕
          </button>
        )}

        {!isMobile && (
          <span
            style={{
              color: "rgba(255,255,255,0.15)",
              fontSize: 11,
              marginRight: "auto",
              fontFamily: "'JetBrains Mono',monospace",
              whiteSpace: "nowrap",
            }}
          >
            {filtered.length} / {logs.length}
          </span>
        )}
      </div>

      {isMobile && (
        <div
          style={{
            color: "rgba(255,255,255,0.15)",
            fontSize: 10,
            fontFamily: "'JetBrains Mono',monospace",
            marginBottom: 10,
            textAlign: "left",
          }}
        >
          {filtered.length} / {logs.length} سجل
        </div>
      )}

      {/* Action chips */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}
      >
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
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'IBM Plex Sans Arabic',sans-serif",
                border: `1px solid ${active ? meta.color + "45" : "rgba(255,255,255,0.08)"}`,
                color: active ? meta.color : "rgba(255,255,255,0.3)",
                background: active ? meta.bg : "rgba(255,255,255,0.02)",
                boxShadow: active ? `0 2px 12px ${meta.glow}` : "none",
              }}
            >
              <span style={{ fontSize: 12 }}>{meta.icon}</span>
              <span>{meta.label}</span>
              <span
                style={{
                  background: active
                    ? meta.color + "25"
                    : "rgba(255,255,255,0.05)",
                  color: active ? meta.color : "rgba(255,255,255,0.18)",
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

      {/* Table / Cards */}
      <div
        style={{
          background: "rgba(6,10,18,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          overflow: "hidden",
          backdropFilter: "blur(10px)",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 48, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "56px 0",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.5 }}>
              🔍
            </div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
              لا توجد سجلات مطابقة
            </div>
          </div>
        ) : isMobile ? (
          // Mobile Card Layout
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((l, i) => {
              const meta = ACTION_META[l.action] || {
                label: l.action,
                color: "#94a3b8",
                bg: "rgba(148,163,184,0.1)",
                glow: "rgba(148,163,184,0.1)",
                icon: "○",
              };
              const d = l.details || {};
              const shortDetail =
                l.action === "MAKE_SALE"
                  ? `${d.totalAmount || d.rawTotal || ""} ج · ${d.itemsCount || 0} صنف`
                  : l.action === "RESTOCK_MEDICINE"
                    ? `${d.medicineName || ""} · +${d.addedQuantity || 0}`
                    : l.action === "ADD_PRESCRIPTION" ||
                        l.action === "DISPENSE_PRESCRIPTION"
                      ? d.patientName || ""
                      : Object.values(d)
                          .filter((v) => typeof v !== "object")
                          .slice(0, 2)
                          .join(" · ");

              return (
                <div
                  key={l._id}
                  className="log-row"
                  onClick={() => setSelected(l)}
                  style={{
                    padding: "13px 15px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    animation: "fadeUp 0.25s ease both",
                    animationDelay: `${i * 0.025}s`,
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: meta.bg,
                      border: `1px solid ${meta.color}25`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          color: meta.color,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {meta.label}
                      </span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.2)",
                          fontSize: 10,
                          fontFamily: "'JetBrains Mono',monospace",
                          flexShrink: 0,
                        }}
                      >
                        {new Date(l.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          background: "rgba(34,211,238,0.08)",
                          border: "1px solid rgba(34,211,238,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#22d3ee",
                          fontSize: 9,
                          fontWeight: 700,
                          flexShrink: 0,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {l.staffName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.45)",
                          fontSize: 11,
                        }}
                      >
                        {l.staffName}
                      </span>
                      {shortDetail && (
                        <span
                          style={{
                            color: "rgba(255,255,255,0.2)",
                            fontSize: 10,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          · {shortDetail}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2"
                    style={{ flexShrink: 0 }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              );
            })}
          </div>
        ) : (
          // Desktop Table
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.015)" }}>
                {["الموظف", "الإجراء", "التفاصيل", "التاريخ"].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "13px 18px",
                      textAlign: "right",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
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
                  glow: "rgba(148,163,184,0.1)",
                  icon: "○",
                };
                const d = l.details || {};
                const shortDetail =
                  l.action === "MAKE_SALE"
                    ? `${d.totalAmount || d.rawTotal || ""} ج · ${d.itemsCount || 0} صنف`
                    : l.action === "RESTOCK_MEDICINE"
                      ? `${d.medicineName || ""} · +${d.addedQuantity || 0}`
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
                      animation: "fadeUp 0.25s ease both",
                      animationDelay: `${Math.min(i, 15) * 0.02}s`,
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 18px",
                        textAlign: "right",
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
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
                    <td
                      style={{
                        padding: "12px 18px",
                        textAlign: "right",
                        verticalAlign: "middle",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: meta.bg,
                          color: meta.color,
                          border: `1px solid ${meta.color}25`,
                          borderRadius: 9,
                          padding: "5px 10px",
                          fontSize: 11,
                          fontWeight: 600,
                          boxShadow: `0 2px 10px ${meta.glow}`,
                        }}
                      >
                        <span style={{ fontSize: 13 }}>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 18px",
                        textAlign: "right",
                        verticalAlign: "middle",
                        maxWidth: 220,
                      }}
                    >
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
                    <td
                      style={{
                        padding: "12px 18px",
                        textAlign: "right",
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: 11,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {new Date(l.createdAt).toLocaleDateString("ar-EG")}
                      </div>
                      <div
                        style={{
                          color: "rgba(255,255,255,0.18)",
                          fontSize: 10,
                          fontFamily: "'JetBrains Mono',monospace",
                          marginTop: 2,
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
