import { useEffect, useState } from "react";
import { useAuth } from "../context/Sultan";

export default function Attendance() {
  const { apiFetch, staff } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStatus, setMyStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = staff?.isAdmin || staff?.role === "admin";

  const fetchAll = () => {
    setLoading(true);
    setError("");
    // ✅ Admin → /attendance/all | Staff → /attendance/my
    const endpoint = isAdmin ? "/attendance/all" : "/attendance/my";
    apiFetch(endpoint)
      .then((data) =>
        setRecords(Array.isArray(data.records) ? data.records : []),
      )
      .catch((e) => {
        setError(e.message);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!isAdmin && records.length > 0) {
      const today = new Date().toLocaleDateString("en-CA");
      const todayRecord = records.find((r) => r.date === today);
      if (!todayRecord) setMyStatus(null);
      else if (todayRecord.clockOut) setMyStatus("out");
      else setMyStatus("in");
    }
  }, [records, isAdmin]);

  const handleClockIn = async () => {
    setActionLoading(true);
    setError("");
    try {
      await apiFetch("/attendance/clockin", {
        method: "POST",
        body: JSON.stringify({}), // ✅ body فاضي بس لازم يبعت JSON
      });
      fetchAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setError("");
    try {
      await apiFetch("/attendance/clockout", {
        method: "PUT",
        body: JSON.stringify({}),
      });
      fetchAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const grouped = records.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div style={{ fontFamily: "'Sora',sans-serif", color: "#e2e8f0" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={S.eyebrow}>{isAdmin ? "Manager View" : "My Attendance"}</p>
        <h1 style={S.h1}>الحضور 🗓</h1>
        {/* ✅ عداد للـ Admin */}
        {isAdmin && !loading && (
          <p style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>
            {records.length} سجل · {dates.length} يوم
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#f87171",
            fontSize: 12,
            marginBottom: 16,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Clock In/Out للموظف */}
      {!isAdmin && (
        <div style={S.clockCard}>
          <div>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 4px" }}>
              حالتك النهارده
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                margin: 0,
                color:
                  myStatus === "in"
                    ? "#10b981"
                    : myStatus === "out"
                      ? "#60a5fa"
                      : "#475569",
              }}
            >
              {myStatus === "in"
                ? "🟢 داخل"
                : myStatus === "out"
                  ? "✅ خرجت"
                  : "⬜ لم تسجل بعد"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleClockIn}
              disabled={
                actionLoading || myStatus === "in" || myStatus === "out"
              }
              style={{
                ...S.btn,
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.3)",
                opacity: myStatus === "in" || myStatus === "out" ? 0.4 : 1,
              }}
            >
              {actionLoading ? "..." : "تسجيل حضور"}
            </button>
            <button
              onClick={handleClockOut}
              disabled={actionLoading || myStatus !== "in"}
              style={{
                ...S.btn,
                background: "rgba(96,165,250,0.15)",
                color: "#60a5fa",
                border: "1px solid rgba(96,165,250,0.3)",
                opacity: myStatus !== "in" ? 0.4 : 1,
              }}
            >
              {actionLoading ? "..." : "تسجيل انصراف"}
            </button>
          </div>
        </div>
      )}

      {/* Refresh button للـ Admin */}
      {isAdmin && (
        <button
          onClick={fetchAll}
          style={{
            ...S.btn,
            background: "rgba(34,211,238,0.08)",
            color: "#22d3ee",
            border: "1px solid rgba(34,211,238,0.2)",
            marginBottom: 16,
          }}
        >
          🔄 تحديث
        </button>
      )}

      {/* Records */}
      {loading ? (
        <p style={{ color: "#475569" }}>جارٍ التحميل...</p>
      ) : records.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🗓</div>
          <p>
            {isAdmin ? "لا توجد سجلات حضور للموظفين بعد" : "لم تسجل حضورك بعد"}
          </p>
        </div>
      ) : (
        dates.map((date) => (
          <div key={date} style={S.group}>
            <p style={S.dateLabel}>{date}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grouped[date].map((r) => (
                <div key={r.id} style={S.row}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={S.av}>{r.name?.charAt(0) || "?"}</div>
                    <div>
                      <p style={S.name}>{r.name}</p>
                      <span
                        style={{
                          ...S.roleBadge,
                          ...(r.role === "manager" ? S.roleM : S.roleS),
                        }}
                      >
                        {r.role}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 20, alignItems: "center" }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <p style={S.timeLabel}>Clock In</p>
                      <p style={{ ...S.timeVal, color: "#10b981" }}>
                        {r.clockIn || "—"}
                      </p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={S.timeLabel}>Clock Out</p>
                      <p
                        style={{
                          ...S.timeVal,
                          color: r.clockOut ? "#60a5fa" : "#475569",
                        }}
                      >
                        {r.clockOut || "Active"}
                      </p>
                    </div>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: r.clockOut ? "#334155" : "#10b981",
                        boxShadow: r.clockOut ? "none" : "0 0 6px #10b981",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const S = {
  eyebrow: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 4,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  h1: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "#f1f5f9",
  },
  clockCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "16px 20px",
    marginBottom: 24,
  },
  btn: {
    padding: "8px 16px",
    borderRadius: 10,
    fontSize: 12,
    fontFamily: "'Sora',sans-serif",
    fontWeight: 600,
    cursor: "pointer",
  },
  empty: {
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "60px 20px",
    textAlign: "center",
    color: "#475569",
    fontSize: 14,
  },
  group: { marginBottom: 24 },
  dateLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "14px 18px",
  },
  av: {
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
  },
  name: { color: "#cbd5e1", fontSize: 14, fontWeight: 600, margin: "0 0 4px" },
  roleBadge: {
    display: "inline-block",
    borderRadius: 20,
    padding: "2px 8px",
    fontSize: 10,
    fontWeight: 600,
    border: "1px solid",
  },
  roleM: {
    color: "#a78bfa",
    background: "rgba(167,139,250,0.1)",
    borderColor: "rgba(167,139,250,0.25)",
  },
  roleS: {
    color: "#34d399",
    background: "rgba(52,211,153,0.1)",
    borderColor: "rgba(52,211,153,0.25)",
  },
  timeLabel: {
    color: "#475569",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 3px",
  },
  timeVal: { fontWeight: 600, fontSize: 14, margin: 0 },
};
