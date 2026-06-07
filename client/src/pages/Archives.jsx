// Archives.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/Sultan";

const ACTION_META = {
  ADD_MEDICINE: {
    label: "إضافة دواء",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.08)",
    border: "rgba(34,211,238,0.2)",
    icon: "+",
  },
  DELETE_MEDICINE: {
    label: "حذف دواء",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    icon: "✕",
  },
  RESTOCK_MEDICINE: {
    label: "شحن مخزون",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    icon: "↑",
  },
};

const ALL = "الكل";

function formatDate(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ar-EG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
}

export default function Archives() {
  const { apiFetch } = useAuth();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState(ALL);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const load = async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: p, limit: 50 });
      if (activeAction !== ALL) params.set("action", activeAction);
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const data = await apiFetch(`/archives/inventory?${params}`);
      setEntries(data.entries || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [activeAction, from, to]);

  const filtered = entries.filter(
    (e) =>
      e.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      e.performedBy.toLowerCase().includes(search.toLowerCase()),
  );

  const tabs = [
    { key: ALL, label: "الكل" },
    ...Object.entries(ACTION_META).map(([k, v]) => ({
      key: k,
      label: v.label,
    })),
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
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        .arc-input::placeholder { color: rgba(148,163,184,0.35); }
        .arc-input:focus { outline: none; border-color: rgba(34,211,238,0.35) !important; }
        .arc-row { transition: background 0.12s; }
        .arc-row:hover { background: rgba(255,255,255,0.025) !important; }
        .arc-tab { transition: all 0.15s; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        @media (max-width: 640px) {
          .arc-filters { flex-direction: column !important; }
          .arc-date-row { flex-direction: column !important; }
          .arc-desktop-col { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
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
            fontSize: "clamp(22px,6vw,30px)",
            fontWeight: 700,
            margin: "3px 0 0",
            color: "#f1f5f9",
          }}
        >
          أرشيف المخزون
        </h1>
        <p style={{ color: "#475569", fontSize: 12, margin: "4px 0 0" }}>
          {pagination.total} عملية مسجلة
        </p>
      </div>

      {/* Search + Date filters */}
      <div
        className="arc-filters"
        style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}
      >
        <input
          className="arc-input"
          placeholder="ابحث باسم الدواء أو الموظف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            height: 42,
            borderRadius: 12,
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "0 14px",
            color: "#e2e8f0",
            fontSize: 13,
            fontFamily: "'Sora', sans-serif",
          }}
        />
        <div className="arc-date-row" style={{ display: "flex", gap: 8 }}>
          <input
            className="arc-input"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{
              height: 42,
              borderRadius: 12,
              padding: "0 12px",
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: from ? "#cbd5e1" : "#475569",
              fontSize: 12,
              fontFamily: "'Sora', sans-serif",
            }}
          />
          <span style={{ color: "#334155", alignSelf: "center", fontSize: 12 }}>
            →
          </span>
          <input
            className="arc-input"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{
              height: 42,
              borderRadius: 12,
              padding: "0 12px",
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: to ? "#cbd5e1" : "#475569",
              fontSize: 12,
              fontFamily: "'Sora', sans-serif",
            }}
          />
          {(from || to) && (
            <button
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              style={{
                height: 42,
                padding: "0 12px",
                borderRadius: 12,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.15)",
                color: "#ef4444",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Action Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {tabs.map((t) => {
          const meta = ACTION_META[t.key];
          const isActive = activeAction === t.key;
          return (
            <button
              key={t.key}
              className="arc-tab"
              onClick={() => setActiveAction(t.key)}
              style={{
                padding: "7px 14px",
                borderRadius: 12,
                whiteSpace: "nowrap",
                border: `1px solid ${isActive ? meta?.border || "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.07)"}`,
                background: isActive
                  ? meta?.bg || "rgba(34,211,238,0.08)"
                  : "rgba(15,23,42,0.6)",
                color: isActive ? meta?.color || "#22d3ee" : "#64748b",
                fontSize: 12,
                fontFamily: "'Sora', sans-serif",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                minHeight: 36,
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Entries */}
      {loading ? (
        <div
          style={{ textAlign: "center", color: "#475569", padding: "60px 0" }}
        >
          جارٍ التحميل...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ color: "#334155", fontSize: 14 }}>لا توجد سجلات</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((entry) => {
            const meta = ACTION_META[entry.action] || ACTION_META.ADD_MEDICINE;
            const { date, time } = formatDate(entry.createdAt);
            return (
              <div
                key={entry._id}
                className="arc-row"
                style={{
                  background: "rgba(15,23,42,0.65)",
                  border: `1px solid ${meta.border}22`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  display: "grid",
                  gridTemplateColumns: "36px 1fr auto",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                {/* Action Icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: meta.bg,
                    border: `1px solid ${meta.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: meta.color,
                    fontSize: 16,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {meta.icon}
                </div>

                {/* Main Info */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        color: meta.color,
                        fontSize: 10,
                        fontWeight: 700,
                        background: meta.bg,
                        border: `1px solid ${meta.border}`,
                        borderRadius: 20,
                        padding: "2px 8px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {meta.label}
                    </span>
                    <span
                      style={{
                        color: "#f1f5f9",
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 200,
                      }}
                    >
                      {entry.medicineName}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Who did it */}
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        color: "#64748b",
                        fontSize: 11,
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {entry.performedBy}
                    </span>

                    {/* Details */}
                    {entry.details && (
                      <span
                        style={{
                          color: "#475569",
                          fontSize: 11,
                          fontFamily: "monospace",
                          direction: "ltr",
                        }}
                      >
                        {entry.details}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date + Time */}
                <div style={{ textAlign: "left", flexShrink: 0 }}>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: 12,
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    {date}
                  </p>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: 11,
                      margin: "2px 0 0",
                      direction: "ltr",
                    }}
                  >
                    {time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 20,
          }}
        >
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: 10,
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: page <= 1 ? "#334155" : "#94a3b8",
              fontSize: 12,
              fontFamily: "'Sora', sans-serif",
              cursor: page <= 1 ? "not-allowed" : "pointer",
            }}
          >
            ← السابق
          </button>
          <span style={{ color: "#475569", fontSize: 12, alignSelf: "center" }}>
            {page} / {pagination.pages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= pagination.pages}
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: 10,
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: page >= pagination.pages ? "#334155" : "#94a3b8",
              fontSize: 12,
              fontFamily: "'Sora', sans-serif",
              cursor: page >= pagination.pages ? "not-allowed" : "pointer",
            }}
          >
            التالي →
          </button>
        </div>
      )}
    </div>
  );
}
