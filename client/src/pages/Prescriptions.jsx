import { useState, useEffect } from "react"; // ✅ أضفنا useEffect
import { useAuth } from "../context/Sultan";

export function Prescriptions() {
  const { apiFetch } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [dispensing, setDispensing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    patientName: "",
    doctorName: "",
    patientPhone: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch(`/pharmacy/prescriptions?status=${statusFilter}`)
      .then((d) => setPrescriptions(d.prescriptions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const dispense = async (id) => {
    setDispensing(id);
    try {
      await apiFetch(`/pharmacy/prescription/dispense/${id}`, {
        method: "PUT",
        body: JSON.stringify({}),
      });
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setDispensing(null);
    }
  };

  const reject = async (id) => {
    if (!confirm("رفض الوصفة؟")) return;
    try {
      await apiFetch(`/pharmacy/prescription/reject/${id}`, {
        method: "PUT",
        body: JSON.stringify({ reason: "رُفضت من الموظف" }),
      });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const statusColors = {
    pending: ["#f59e0b", "rgba(245,158,11,0.1)", "rgba(245,158,11,0.2)"],
    dispensed: ["#10b981", "rgba(16,185,129,0.1)", "rgba(16,185,129,0.2)"],
    rejected: ["#ef4444", "rgba(239,68,68,0.1)", "rgba(239,68,68,0.2)"],
  };
  const statusLabels = {
    pending: "انتظار",
    dispensed: "تم الصرف",
    rejected: "مرفوض",
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
          <p style={S.eyebrow}>Pharmacy</p>
          <h1 style={S.h1}>الوصفات الطبية 📋</h1>
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
          + وصفة جديدة
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["pending", "dispensed", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              border: `1px solid ${statusFilter === s ? statusColors[s][2] : "rgba(255,255,255,0.07)"}`,
              background:
                statusFilter === s ? statusColors[s][1] : "transparent",
              color: statusFilter === s ? statusColors[s][0] : "#475569",
              fontSize: 12,
              fontFamily: "'Sora',sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <p
            style={{ color: "#334155", textAlign: "center", padding: "40px 0" }}
          >
            جارٍ التحميل...
          </p>
        ) : prescriptions.length === 0 ? (
          <p
            style={{ color: "#334155", textAlign: "center", padding: "40px 0" }}
          >
            لا توجد وصفات
          </p>
        ) : (
          prescriptions.map((p) => (
            <div
              key={p._id}
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
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#f1f5f9",
                      fontSize: 14,
                      fontWeight: 700,
                      margin: "0 0 4px",
                    }}
                  >
                    {p.patientName}
                  </p>
                  <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>
                    د. {p.doctorName || "غير محدد"} · {p.patientPhone || ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      ...S.badge,
                      color: statusColors[p.status][0],
                      background: statusColors[p.status][1],
                      borderColor: statusColors[p.status][2],
                    }}
                  >
                    {statusLabels[p.status]}
                  </span>
                  {p.status === "pending" && (
                    <>
                      <button
                        onClick={() => dispense(p._id)}
                        disabled={dispensing === p._id}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 8,
                          border: "1px solid rgba(16,185,129,0.3)",
                          background: "rgba(16,185,129,0.1)",
                          color: "#10b981",
                          fontSize: 11,
                          fontFamily: "'Sora',sans-serif",
                          cursor: "pointer",
                          opacity: dispensing === p._id ? 0.5 : 1,
                        }}
                      >
                        صرف
                      </button>
                      <button
                        onClick={() => reject(p._id)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 8,
                          border: "1px solid rgba(239,68,68,0.2)",
                          background: "transparent",
                          color: "rgba(239,68,68,0.6)",
                          fontSize: 11,
                          fontFamily: "'Sora',sans-serif",
                          cursor: "pointer",
                        }}
                      >
                        رفض
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginTop: 10,
                }}
              >
                {p.medicines?.map((m, i) => (
                  <span
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 8,
                      padding: "3px 10px",
                      fontSize: 11,
                      color: "#94a3b8",
                    }}
                  >
                    {m.medicineName} × {m.quantity}
                  </span>
                ))}
              </div>
              <p
                style={{
                  color: "#334155",
                  fontSize: 10,
                  margin: "10px 0 0",
                  textAlign: "left",
                }}
              >
                {new Date(p.createdAt).toLocaleString("ar-EG")}
              </p>
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
              إضافة وصفة جديدة
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["patientName", "اسم المريض *"],
                ["doctorName", "اسم الطبيب"],
                ["patientPhone", "رقم الهاتف"],
                ["notes", "ملاحظات"],
              ].map(([k, l]) => (
                <div key={k}>
                  <label style={S.label}>{l}</label>
                  <input
                    style={S.input}
                    value={form[k]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [k]: e.target.value }))
                    }
                  />
                </div>
              ))}
              <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>
                * بعد الحفظ يمكن إضافة الأدوية من صفحة تفاصيل الوصفة
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                onClick={async () => {
                  if (!form.patientName) return;
                  setSaving(true);
                  try {
                    await apiFetch("/pharmacy/prescription/add", {
                      method: "POST",
                      body: JSON.stringify({ ...form, medicines: [] }),
                    });
                    setShowAdd(false);
                    setForm({
                      patientName: "",
                      doctorName: "",
                      patientPhone: "",
                      notes: "",
                    });
                    load();
                  } catch (e) {
                    alert(e.message);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving || !form.patientName}
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
                  opacity: saving || !form.patientName ? 0.5 : 1,
                }}
              >
                {saving ? "جارٍ الحفظ..." : "حفظ"}
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
