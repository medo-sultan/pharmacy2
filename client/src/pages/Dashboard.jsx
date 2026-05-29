import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard({ onNavigate }) {
  const { apiFetch, staff } = useAuth();
  const [alerts, setAlerts] = useState({
    lowStock: [],
    nearExpiry: [],
    expired: [],
  });
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/pharmacy/inventory/alerts").catch(() => null),
      apiFetch("/pharmacy/sales/summary").catch(() => null),
      apiFetch("/pharmacy/sales").catch(() => null),
    ])
      .then(([a, s, sl]) => {
        if (a?.alerts) setAlerts(a.alerts);
        if (s?.summary) setSummary(s.summary);
        if (sl?.sales) setRecentSales(sl.sales.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalAlerts =
    (alerts.lowStock?.count || 0) +
    (alerts.nearExpiry?.count || 0) +
    (alerts.expired?.count || 0);

  const stats = [
    {
      label: "مبيعات اليوم",
      value: `${summary.totalRevenue?.toLocaleString() || 0} ج`,
      icon: "💰",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      label: "معاملات اليوم",
      value: summary.totalTransactions || 0,
      icon: "🧾",
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.1)",
    },
    {
      label: "تنبيهات المخزون",
      value: totalAlerts,
      icon: "⚠️",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      action: () => onNavigate("inventory"),
    },
    {
      label: "منتجات منتهية",
      value: alerts.expired?.count || 0,
      icon: "🚫",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      action: () => onNavigate("inventory"),
    },
  ];

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap'); @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28, animation: "fadeUp .4s ease both" }}>
        <p style={S.eyebrow}>Nexus Pharma</p>
        <h1 style={S.h1}>مرحباً، {staff?.name?.split(" ")[0]} 👋</h1>
        <p style={S.sub}>
          {new Date().toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div style={S.statsGrid}>
        {stats.map((s, i) => (
          <div
            key={i}
            onClick={s.action}
            style={{
              ...S.statCard,
              cursor: s.action ? "pointer" : "default",
              animationDelay: `${i * 0.07}s`,
            }}
            onMouseEnter={(e) => {
              if (s.action)
                e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              if (s.action) e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {s.icon}
              </div>
              {s.action && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </div>
            <p
              style={{
                color: s.color,
                fontSize: 28,
                fontWeight: 700,
                margin: "0 0 4px",
                lineHeight: 1,
              }}
            >
              {loading ? "—" : s.value}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 12,
                margin: 0,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div style={S.twoCol}>
        {/* Alerts */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>⚠️ تنبيهات المخزون</span>
            <button onClick={() => onNavigate("inventory")} style={S.seeAll}>
              عرض الكل
            </button>
          </div>
          {loading ? (
            <p style={S.muted}>جارٍ التحميل...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alerts.expired?.items?.slice(0, 2).map((m, i) => (
                <AlertRow
                  key={i}
                  name={m.name}
                  tag="منتهي الصلاحية"
                  color="#ef4444"
                />
              ))}
              {alerts.nearExpiry?.items?.slice(0, 2).map((m, i) => (
                <AlertRow
                  key={i}
                  name={m.name}
                  tag="قارب على الانتهاء"
                  color="#f59e0b"
                />
              ))}
              {alerts.lowStock?.items?.slice(0, 3).map((m, i) => (
                <AlertRow
                  key={i}
                  name={m.name}
                  tag={`المخزون: ${m.stock}`}
                  color="#60a5fa"
                />
              ))}
              {totalAlerts === 0 && <p style={S.muted}>لا توجد تنبيهات ✅</p>}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>🧾 آخر المبيعات</span>
            <button onClick={() => onNavigate("sales")} style={S.seeAll}>
              عرض الكل
            </button>
          </div>
          {loading ? (
            <p style={S.muted}>جارٍ التحميل...</p>
          ) : recentSales.length === 0 ? (
            <p style={S.muted}>لا توجد مبيعات اليوم</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentSales.map((s, i) => (
                <div key={i} style={S.saleRow}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "rgba(34,211,238,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                      }}
                    >
                      🧾
                    </div>
                    <div>
                      <p
                        style={{
                          color: "#cbd5e1",
                          fontSize: 12,
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        {s.patientName || "عميل"}
                      </p>
                      <p style={{ color: "#334155", fontSize: 10, margin: 0 }}>
                        {new Date(s.createdAt).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{ color: "#10b981", fontSize: 13, fontWeight: 700 }}
                  >
                    {s.totalAmount} ج
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={S.card}>
        <p style={S.cardTitle}>⚡ إجراءات سريعة</p>
        <div
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}
        >
          {[
            ["نقطة البيع", "pos", "#22d3ee"],
            ["المخزون", "inventory", "#a78bfa"],
            ["الوصفات", "prescriptions", "#10b981"],
            ["المبيعات", "sales", "#f59e0b"],
          ].map(([l, k, c]) => (
            <button
              key={k}
              onClick={() => onNavigate(k)}
              style={{
                padding: "9px 18px",
                borderRadius: 10,
                border: `1px solid ${c}30`,
                background: `${c}0d`,
                color: c,
                fontSize: 12,
                fontFamily: "'Sora',sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `${c}20`;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${c}0d`;
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertRow({ name, tag, color }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        background: "rgba(15,23,42,0.6)",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span style={{ color: "#94a3b8", fontSize: 12 }}>{name}</span>
      <span
        style={{
          color,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          borderRadius: 20,
          padding: "2px 8px",
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        {tag}
      </span>
    </div>
  );
}

const S = {
  page: {
    fontFamily: "'Sora',sans-serif",
    color: "#e2e8f0",
    maxWidth: 1100,
    margin: "0 auto",
  },
  eyebrow: {
    color: "#334155",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    margin: 0,
  },
  h1: {
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "#f1f5f9",
    margin: "4px 0 4px",
  },
  sub: { color: "#475569", fontSize: 12, margin: 0 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: "18px 20px",
    animation: "fadeUp .4s ease both",
    transition: "transform .2s",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: "18px 20px",
    marginBottom: 12,
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardTitle: { color: "#cbd5e1", fontSize: 13, fontWeight: 600 },
  seeAll: {
    color: "#334155",
    fontSize: 11,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Sora',sans-serif",
  },
  muted: {
    color: "#334155",
    fontSize: 12,
    textAlign: "center",
    padding: "16px 0",
    margin: 0,
  },
  saleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
};
