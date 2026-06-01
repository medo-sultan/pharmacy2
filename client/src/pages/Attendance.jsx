// Attendance.jsx — Mobile responsive
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
        body: JSON.stringify({}),
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
    <div
      style={{ fontFamily: "'Sora',sans-serif", color: "#e2e8f0" }}
      dir="rtl"
    >
      <div style={{ marginBottom: 20 }}>
        <p style={S.eyebrow}>{isAdmin ? "Manager View" : "My Attendance"}</p>
        <h1 style={S.h1}>الحضور 🗓</h1>
        {isAdmin && !loading && (
          <p style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>
            {records.length} سجل · {dates.length} يوم
          </p>
        )}
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#f87171",
            fontSize: 12,
            marginBottom: 14,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Clock In/Out — mobile optimized */}
      {!isAdmin && (
        <div
          style={{
            background: "rgba(15,23,42,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
          }}
        >
          {/* Status */}
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 6px" }}>
              حالتك النهارده
            </p>
            <p
              style={{
                fontSize: 18,
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

          {/* Action buttons — full width on mobile */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <button
              onClick={handleClockIn}
              disabled={
                actionLoading || myStatus === "in" || myStatus === "out"
              }
              style={{
                height: 48,
                borderRadius: 12,
                border: "1px solid rgba(16,185,129,0.3)",
                background: "rgba(16,185,129,0.1)",
                color: "#10b981",
                fontSize: 13,
                fontFamily: "'Sora',sans-serif",
                fontWeight: 600,
                cursor:
                  myStatus === "in" || myStatus === "out"
                    ? "not-allowed"
                    : "pointer",
                opacity: myStatus === "in" || myStatus === "out" ? 0.4 : 1,
                transition: "all 0.15s",
              }}
            >
              {actionLoading ? "..." : "تسجيل حضور"}
            </button>
            <button
              onClick={handleClockOut}
              disabled={actionLoading || myStatus !== "in"}
              style={{
                height: 48,
                borderRadius: 12,
                border: "1px solid rgba(96,165,250,0.3)",
                background: "rgba(96,165,250,0.1)",
                color: "#60a5fa",
                fontSize: 13,
                fontFamily: "'Sora',sans-serif",
                fontWeight: 600,
                cursor: myStatus !== "in" ? "not-allowed" : "pointer",
                opacity: myStatus !== "in" ? 0.4 : 1,
                transition: "all 0.15s",
              }}
            >
              {actionLoading ? "..." : "تسجيل انصراف"}
            </button>
          </div>
        </div>
      )}

      {isAdmin && (
        <button
          onClick={fetchAll}
          style={{
            padding: "9px 16px",
            borderRadius: 10,
            border: "1px solid rgba(34,211,238,0.2)",
            background: "rgba(34,211,238,0.08)",
            color: "#22d3ee",
            fontSize: 12,
            fontFamily: "'Sora',sans-serif",
            cursor: "pointer",
            marginBottom: 16,
            minHeight: 40,
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
          <div key={date} style={{ marginBottom: 20 }}>
            <p style={S.dateLabel}>{date}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grouped[date].map((r) => (
                <div key={r.id} style={S.row}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div style={S.av}>{r.name?.charAt(0) || "?"}</div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          ...S.name,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.name}
                      </p>
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

                  {/* Times — compact on mobile */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <p style={S.timeLabel}>دخول</p>
                      <p
                        style={{ ...S.timeVal, color: "#10b981", fontSize: 12 }}
                      >
                        {r.clockIn || "—"}
                      </p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={S.timeLabel}>خروج</p>
                      <p
                        style={{
                          ...S.timeVal,
                          color: r.clockOut ? "#60a5fa" : "#475569",
                          fontSize: 12,
                        }}
                      >
                        {r.clockOut || "Active"}
                      </p>
                    </div>
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: r.clockOut ? "#334155" : "#10b981",
                        boxShadow: r.clockOut ? "none" : "0 0 5px #10b981",
                        flexShrink: 0,
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
    fontSize: 11,
    marginBottom: 4,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  h1: {
    fontSize: "clamp(22px, 6vw, 28px)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#f1f5f9",
  },
  empty: {
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "50px 20px",
    textAlign: "center",
    color: "#475569",
    fontSize: 14,
  },
  dateLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "12px 14px",
    gap: 8,
  },
  av: {
    width: 34,
    height: 34,
    borderRadius: 10,
    flexShrink: 0,
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
  },
  name: { color: "#cbd5e1", fontSize: 13, fontWeight: 600, margin: "0 0 3px" },
  roleBadge: {
    display: "inline-block",
    borderRadius: 20,
    padding: "2px 7px",
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
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 2px",
  },
  timeVal: { fontWeight: 600, fontSize: 12, margin: 0 },
};
