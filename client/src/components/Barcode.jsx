import { useEffect, useRef, useState } from "react";

const BASE = import.meta.env.VITE_API_URL;

export default function Barcode() {
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("idle"); // idle | scanning | success | error
  const [lastResult, setLastResult] = useState(null);
  const [manualInput, setManualInput] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);

  // جيب sessionId من URL أو اطلب واحد جديد
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session");
    if (sid) {
      setSessionId(sid);
    } else {
      fetch(`${BASE}/barcode/session`)
        .then((r) => r.json())
        .then((d) => setSessionId(d.sessionId));
    }
  }, []);

  const startCamera = async () => {
    try {
      setStatus("scanning");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      startScanning();
    } catch (err) {
      setStatus("error");
      setLastResult({ error: "مش قادر يوصل للكاميرا — تأكد إنك سمحت بالوصول" });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scannerRef.current) {
      clearInterval(scannerRef.current);
      scannerRef.current = null;
    }
    setStatus("idle");
  };

  const startScanning = () => {
    // استخدم BarcodeDetector API (متاح على Chrome Android)
    if (!("BarcodeDetector" in window)) {
      setStatus("error");
      setLastResult({
        error: "المتصفح مش بيدعم المسح — جرب Chrome على Android",
      });
      stopCamera();
      return;
    }

    const detector = new window.BarcodeDetector({
      formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"],
    });

    scannerRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const barcode = barcodes[0].rawValue;
          stopCamera();
          sendBarcode(barcode);
        }
      } catch (_) {}
    }, 300);
  };

  const sendBarcode = async (barcode) => {
    setStatus("scanning");
    try {
      const res = await fetch(`${BASE}/barcode/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode, sessionId }),
      });
      const data = await res.json();
      setLastResult(data);
      setStatus(data.found ? "success" : "notfound");
    } catch {
      setStatus("error");
      setLastResult({ error: "فشل الاتصال بالسيرفر" });
    }
  };

  const handleManual = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    sendBarcode(manualInput.trim());
    setManualInput("");
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #080c14; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M3 5h2M7 5h1M3 10h2M7 10h6M3 15h2M7 15h1" />
            <rect x="11" y="3" width="10" height="18" rx="2" fill="none" />
          </svg>
          <span style={S.logoText}>ماسح الباركود</span>
        </div>
        {sessionId && <span style={S.sessionBadge}>#{sessionId}</span>}
      </div>

      <div style={S.body}>
        {/* Camera Viewfinder */}
        <div style={S.viewfinder}>
          <video
            ref={videoRef}
            style={{
              ...S.video,
              display:
                status === "scanning" && streamRef.current ? "block" : "none",
            }}
            playsInline
            muted
          />
          {status !== "scanning" && (
            <div style={S.placeholder}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(34,211,238,0.2)"
                strokeWidth="1"
                strokeLinecap="round"
              >
                <path d="M3 5h2M7 5h1M3 10h2M7 10h6M3 15h2M7 15h1" />
                <rect x="11" y="3" width="10" height="18" rx="2" />
              </svg>
              <p
                style={{
                  color: "rgba(255,255,255,0.2)",
                  fontSize: 13,
                  margin: "10px 0 0",
                }}
              >
                اضغط مسح للبدء
              </p>
            </div>
          )}
          {/* Corner markers */}
          {status === "scanning" && streamRef.current && (
            <>
              <div
                style={{
                  ...S.corner,
                  top: 16,
                  left: 16,
                  borderTop: "2px solid #22d3ee",
                  borderLeft: "2px solid #22d3ee",
                }}
              />
              <div
                style={{
                  ...S.corner,
                  top: 16,
                  right: 16,
                  borderTop: "2px solid #22d3ee",
                  borderRight: "2px solid #22d3ee",
                }}
              />
              <div
                style={{
                  ...S.corner,
                  bottom: 16,
                  left: 16,
                  borderBottom: "2px solid #22d3ee",
                  borderLeft: "2px solid #22d3ee",
                }}
              />
              <div
                style={{
                  ...S.corner,
                  bottom: 16,
                  right: 16,
                  borderBottom: "2px solid #22d3ee",
                  borderRight: "2px solid #22d3ee",
                }}
              />
              <div style={S.scanLine} />
            </>
          )}
        </div>

        {/* Action Button */}
        {status === "scanning" && streamRef.current ? (
          <button onClick={stopCamera} style={{ ...S.btn, ...S.btnDanger }}>
            ✕ إيقاف
          </button>
        ) : (
          <button onClick={startCamera} style={{ ...S.btn, ...S.btnPrimary }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            مسح الباركود
          </button>
        )}

        {/* Result */}
        {lastResult && (
          <div
            style={{
              ...S.result,
              borderColor:
                status === "success"
                  ? "rgba(16,185,129,0.3)"
                  : status === "notfound"
                    ? "rgba(245,158,11,0.3)"
                    : "rgba(239,68,68,0.3)",
            }}
          >
            {status === "success" && lastResult.medicine && (
              <>
                <div style={S.resultIcon}>✅</div>
                <p
                  style={{
                    color: "#10b981",
                    fontSize: 13,
                    fontWeight: 700,
                    margin: "0 0 12px",
                  }}
                >
                  تم الإضافة للسلة على الكمبيوتر
                </p>
                <div style={S.medDetails}>
                  <p style={S.medDetailName}>{lastResult.medicine.name}</p>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={S.detailBadge}>
                      💰 {lastResult.medicine.price} ج
                    </span>
                    <span style={S.detailBadge}>
                      📦 {lastResult.medicine.stock} وحدة
                    </span>
                    <span style={S.detailBadge}>
                      🏷 {lastResult.medicine.category}
                    </span>
                  </div>
                  {lastResult.medicine.isLowStock && (
                    <span
                      style={{
                        ...S.detailBadge,
                        color: "#f59e0b",
                        marginTop: 8,
                        display: "inline-block",
                      }}
                    >
                      ⚠ مخزون منخفض
                    </span>
                  )}
                </div>
              </>
            )}
            {status === "notfound" && (
              <>
                <div style={S.resultIcon}>⚠️</div>
                <p
                  style={{
                    color: "#f59e0b",
                    fontSize: 13,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  الدواء مش موجود في النظام
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 11,
                    margin: "6px 0 0",
                  }}
                >
                  {lastResult.barcode}
                </p>
              </>
            )}
            {(status === "error" || lastResult.error) && (
              <>
                <div style={S.resultIcon}>❌</div>
                <p
                  style={{
                    color: "#f87171",
                    fontSize: 13,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {lastResult.error || "حدث خطأ"}
                </p>
              </>
            )}
            <button
              onClick={() => {
                setLastResult(null);
                setStatus("idle");
              }}
              style={S.scanAgain}
            >
              مسح مجدداً
            </button>
          </div>
        )}

        {/* Manual Input */}
        <div style={S.manualWrap}>
          <p style={S.manualLabel}>أو أدخل الباركود يدوياً</p>
          <form onSubmit={handleManual} style={{ display: "flex", gap: 8 }}>
            <input
              style={S.manualInput}
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="6912345678901"
              inputMode="numeric"
            />
            <button type="submit" style={S.manualBtn}>
              بحث
            </button>
          </form>
        </div>

        {/* QR للـ session */}
        {sessionId && (
          <div style={S.sessionInfo}>
            <p
              style={{
                color: "rgba(255,255,255,0.2)",
                fontSize: 11,
                margin: "0 0 6px",
              }}
            >
              Session ID للـ POS
            </p>
            <code
              style={{ color: "#22d3ee", fontSize: 14, letterSpacing: "0.1em" }}
            >
              {sessionId}
            </code>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanAnim {
          0%{top:20%} 50%{top:75%} 100%{top:20%}
        }
      `}</style>
    </div>
  );
}

const S = {
  page: {
    fontFamily: "'Cairo', sans-serif",
    background: "#080c14",
    minHeight: "100vh",
    color: "#e2e8f0",
    direction: "rtl",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(8,12,20,0.95)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoText: { color: "#f1f5f9", fontSize: 15, fontWeight: 700 },
  sessionBadge: {
    background: "rgba(34,211,238,0.08)",
    border: "1px solid rgba(34,211,238,0.2)",
    color: "#22d3ee",
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 20,
  },
  body: {
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 400,
    margin: "0 auto",
  },
  viewfinder: {
    width: "100%",
    aspectRatio: "4/3",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  video: { width: "100%", height: "100%", objectFit: "cover" },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  corner: { position: "absolute", width: 20, height: 20 },
  scanLine: {
    position: "absolute",
    left: "10%",
    right: "10%",
    height: 2,
    background: "linear-gradient(90deg, transparent, #22d3ee, transparent)",
    animation: "scanAnim 2s ease-in-out infinite",
    boxShadow: "0 0 8px #22d3ee",
  },
  btn: {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    border: "none",
    fontSize: 15,
    fontFamily: "'Cairo', sans-serif",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnPrimary: {
    background: "rgba(34,211,238,0.12)",
    border: "1px solid rgba(34,211,238,0.3)",
    color: "#22d3ee",
  },
  btnDanger: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#f87171",
  },
  result: {
    background: "rgba(15,23,42,0.8)",
    border: "1px solid",
    borderRadius: 14,
    padding: "20px 16px",
    textAlign: "center",
  },
  resultIcon: { fontSize: 32, marginBottom: 10 },
  medDetails: {
    background: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    padding: "12px",
    marginTop: 8,
  },
  medDetailName: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: 700,
    margin: "0 0 10px",
  },
  detailBadge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "4px 10px",
    fontSize: 12,
    color: "#94a3b8",
  },
  scanAgain: {
    marginTop: 14,
    padding: "8px 20px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontFamily: "'Cairo', sans-serif",
    cursor: "pointer",
  },
  manualWrap: {
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "14px 16px",
  },
  manualLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    margin: "0 0 10px",
  },
  manualInput: {
    flex: 1,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "9px 12px",
    color: "#cbd5e1",
    fontSize: 14,
    fontFamily: "'Cairo', sans-serif",
    outline: "none",
    direction: "ltr",
  },
  manualBtn: {
    padding: "9px 16px",
    borderRadius: 8,
    border: "1px solid rgba(34,211,238,0.2)",
    background: "rgba(34,211,238,0.08)",
    color: "#22d3ee",
    fontSize: 13,
    fontFamily: "'Cairo', sans-serif",
    fontWeight: 700,
    cursor: "pointer",
  },
  sessionInfo: {
    textAlign: "center",
    padding: "12px",
    background: "rgba(34,211,238,0.03)",
    border: "1px solid rgba(34,211,238,0.08)",
    borderRadius: 10,
  },
};
