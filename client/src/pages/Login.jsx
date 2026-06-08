import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/Sultan";

export default function Login({ onLogin }) {
  const { login, adminLogin } = useAuth();

  const [mode, setMode] = useState(null); // null = splash, "staff" | "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return setError("أدخل البريد وكلمة المرور");
    try {
      setLoading(true);
      setError("");
      if (mode === "admin") await adminLogin(email, password);
      else await login(email, password);
      onLogin?.();
    } catch (e) {
      setError(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const back = () => {
    setMode(null);
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Fira+Code:wght@300;400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100svh;
          background: #03060d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fira Code', monospace;
          overflow: hidden;
          position: relative;
        }

        /* شبكة خلفية */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* توهج علوي */
        .glow-top {
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 300px;
          border-radius: 50%;
          pointer-events: none;
          transition: background 0.6s ease;
        }
        .glow-top.staff { background: radial-gradient(ellipse, rgba(34,211,238,0.18) 0%, transparent 70%); }
        .glow-top.admin { background: radial-gradient(ellipse, rgba(168,85,247,0.18) 0%, transparent 70%); }
        .glow-top.none  { background: radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, transparent 70%); }

        /* corner scans */
        .corner { position: absolute; width: 22px; height: 22px; }
        .corner.tl { top: 16px; left: 16px; border-top: 1px solid; border-left: 1px solid; }
        .corner.tr { top: 16px; right: 16px; border-top: 1px solid; border-right: 1px solid; }
        .corner.bl { bottom: 16px; left: 16px; border-bottom: 1px solid; border-left: 1px solid; }
        .corner.br { bottom: 16px; right: 16px; border-bottom: 1px solid; border-right: 1px solid; }
        .corner.staff { border-color: rgba(34,211,238,0.4); }
        .corner.admin { border-color: rgba(168,85,247,0.4); }
        .corner.none  { border-color: rgba(34,211,238,0.2); }

        /* البطاقة الرئيسية */
        .card {
          position: relative;
          z-index: 10;
          width: min(360px, 92vw);
          padding: 36px 28px 28px;
          background: rgba(6, 12, 26, 0.85);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px;
          backdrop-filter: blur(24px);
          box-shadow: 0 0 60px rgba(0,0,0,0.6);
        }

        /* شعار */
        .brand {
          text-align: center;
          margin-bottom: 32px;
        }
        .brand-icon {
          width: 52px; height: 52px;
          margin: 0 auto 12px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-icon svg { width: 28px; height: 28px; transition: color 0.4s; }
        .brand-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid;
          border-radius: 2px;
          transform: rotate(45deg);
          transition: border-color 0.4s;
        }
        .mode-staff .brand-icon { color: #22d3ee; }
        .mode-staff .brand-icon::before { border-color: rgba(34,211,238,0.4); }
        .mode-admin .brand-icon { color: #a855f7; }
        .mode-admin .brand-icon::before { border-color: rgba(168,85,247,0.4); }
        .mode-none .brand-icon { color: #22d3ee; }
        .mode-none .brand-icon::before { border-color: rgba(34,211,238,0.25); }

        .brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 300;
          letter-spacing: 0.25em;
          color: #e2e8f0;
        }
        .brand-sub {
          font-size: 9px;
          letter-spacing: 0.3em;
          color: #334155;
          margin-top: 4px;
          text-transform: uppercase;
        }

        /* ─── صفحة الاختيار ─── */
        .pick-title {
          text-align: center;
          font-size: 10px;
          letter-spacing: 0.25em;
          color: #334155;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .pick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .pick-btn {
          position: relative;
          padding: 22px 12px 18px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          border-radius: 3px;
          cursor: pointer;
          text-align: center;
          transition: all 0.25s;
          overflow: hidden;
        }
        .pick-btn:hover { transform: translateY(-2px); }

        .pick-btn.pick-staff:hover,
        .pick-btn.pick-staff:focus {
          border-color: rgba(34,211,238,0.4);
          background: rgba(34,211,238,0.06);
          box-shadow: 0 0 20px rgba(34,211,238,0.1);
        }
        .pick-btn.pick-admin:hover,
        .pick-btn.pick-admin:focus {
          border-color: rgba(168,85,247,0.4);
          background: rgba(168,85,247,0.06);
          box-shadow: 0 0 20px rgba(168,85,247,0.1);
        }

        .pick-icon {
          font-size: 28px;
          margin-bottom: 10px;
          display: block;
        }
        .pick-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #e2e8f0;
          display: block;
          margin-bottom: 5px;
        }
        .pick-desc {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          display: block;
        }
        .pick-staff .pick-desc { color: rgba(34,211,238,0.5); }
        .pick-admin .pick-desc { color: rgba(168,85,247,0.5); }

        /* شريط سفلي ملون */
        .pick-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .pick-staff::after { background: linear-gradient(90deg, transparent, #22d3ee, transparent); }
        .pick-admin::after { background: linear-gradient(90deg, transparent, #a855f7, transparent); }
        .pick-btn:hover::after { opacity: 1; }

        /* ─── صفحة تسجيل الدخول ─── */
        .form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .form-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 2px;
          border: 1px solid;
        }
        .form-badge.staff {
          color: #22d3ee;
          border-color: rgba(34,211,238,0.3);
          background: rgba(34,211,238,0.07);
        }
        .form-badge.admin {
          color: #a855f7;
          border-color: rgba(168,85,247,0.3);
          background: rgba(168,85,247,0.07);
        }
        .badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          animation: pulse-dot 1.5s infinite;
        }
        .staff .badge-dot { background: #22d3ee; }
        .admin .badge-dot { background: #a855f7; }
        @keyframes pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        .back-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #334155;
          font-size: 10px;
          letter-spacing: 0.15em;
          font-family: 'Fira Code', monospace;
          transition: color 0.2s;
          padding: 4px 0;
        }
        .back-btn:hover { color: #64748b; }

        /* حقول */
        .field { margin-bottom: 14px; }
        .field label {
          display: block;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 7px;
          color: #475569;
        }
        .field-wrap { position: relative; }
        .field input {
          width: 100%;
          height: 46px;
          background: rgba(15,23,42,0.9);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 3px;
          padding: 0 14px;
          color: #e2e8f0;
          font-size: 13px;
          font-family: 'Fira Code', monospace;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mode-staff .field input:focus {
          border-color: rgba(34,211,238,0.4);
          box-shadow: 0 0 0 3px rgba(34,211,238,0.07);
        }
        .mode-admin .field input:focus {
          border-color: rgba(168,85,247,0.4);
          box-shadow: 0 0 0 3px rgba(168,85,247,0.07);
        }
        .pw-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #334155;
          padding: 4px;
          transition: color 0.2s;
          display: flex;
        }
        .pw-toggle:hover { color: #64748b; }

        /* خطأ */
        .err-box {
          margin-bottom: 14px;
          padding: 10px 12px;
          border-radius: 3px;
          border: 1px solid rgba(239,68,68,0.2);
          background: rgba(239,68,68,0.07);
          font-size: 11px;
          color: #f87171;
          text-align: center;
          letter-spacing: 0.05em;
        }

        /* زر الدخول */
        .submit-btn {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 3px;
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .submit-btn:not(:disabled):hover { transform: translateY(-1px); }
        .submit-btn:not(:disabled):active { transform: translateY(0); }

        .submit-btn.staff {
          background: linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.1));
          border: 1px solid rgba(34,211,238,0.4);
          color: #22d3ee;
          box-shadow: 0 0 20px rgba(34,211,238,0.15), inset 0 1px 0 rgba(34,211,238,0.1);
        }
        .submit-btn.staff:not(:disabled):hover {
          background: linear-gradient(135deg, rgba(34,211,238,0.28), rgba(34,211,238,0.15));
          box-shadow: 0 0 30px rgba(34,211,238,0.25);
        }
        .submit-btn.admin {
          background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.1));
          border: 1px solid rgba(168,85,247,0.4);
          color: #a855f7;
          box-shadow: 0 0 20px rgba(168,85,247,0.15), inset 0 1px 0 rgba(168,85,247,0.1);
        }
        .submit-btn.admin:not(:disabled):hover {
          background: linear-gradient(135deg, rgba(168,85,247,0.28), rgba(168,85,247,0.15));
          box-shadow: 0 0 30px rgba(168,85,247,0.25);
        }

        /* خط scan متحرك */
        .submit-btn::after {
          content: '';
          position: absolute;
          top: -100%;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: scan-line 2.5s linear infinite;
        }
        @keyframes scan-line {
          0% { top: -100%; }
          100% { top: 200%; }
        }

        /* فوتر */
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 9px;
          letter-spacing: 0.3em;
          color: #1e293b;
        }

        /* انيميشن transition */
        .fade-in { animation: fadeUp 0.35s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className={`login-root mode-${mode ?? "none"}`}>
        <div className={`glow-top ${mode ?? "none"}`} />
        <div className={`corner tl ${mode ?? "none"}`} />
        <div className={`corner tr ${mode ?? "none"}`} />
        <div className={`corner bl ${mode ?? "none"}`} />
        <div className={`corner br ${mode ?? "none"}`} />
        <div className="grid-bg" />

        <div className="card">
          {/* شعار دائماً */}
          <div className="brand">
            <div className="brand-icon">
              {mode === "admin" ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              )}
            </div>
            <div className="brand-name">SULTAN PHARMA</div>
            <div className="brand-sub">Pharmacy Management System</div>
          </div>

          {/* ── اختيار النوع ── */}
          {!mode && (
            <div className="fade-in">
              <p className="pick-title">اختر نوع الحساب</p>
              <div className="pick-grid">
                <button
                  className="pick-btn pick-staff"
                  onClick={() => setMode("staff")}
                >
                  <span className="pick-icon">💊</span>
                  <span className="pick-label">موظف</span>
                  <span className="pick-desc">Staff Access</span>
                </button>
                <button
                  className="pick-btn pick-admin"
                  onClick={() => setMode("admin")}
                >
                  <span className="pick-icon">🔐</span>
                  <span className="pick-label">مدير</span>
                  <span className="pick-desc">Admin Access</span>
                </button>
              </div>
            </div>
          )}

          {/* ── فورم تسجيل الدخول ── */}
          {mode && (
            <div className="fade-in">
              <div className="form-header">
                <div className={`form-badge ${mode}`}>
                  <span className="badge-dot" />
                  {mode === "staff" ? "STAFF PORTAL" : "ADMIN PORTAL"}
                </div>
                <button className="back-btn" onClick={back}>
                  ← رجوع
                </button>
              </div>

              {error && <div className="err-box">{error}</div>}

              <div className="field">
                <label>البريد الإلكتروني</label>
                <div className="field-wrap">
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="user@sultanpharma.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 20 }}>
                <label>كلمة المرور</label>
                <div className="field-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ paddingRight: 42 }}
                  />
                  <button
                    className="pw-toggle"
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                className={`submit-btn ${mode}`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "AUTHENTICATING..." : "SIGN IN →"}
              </button>
            </div>
          )}

          <div className="footer">
            SULTAN PHARMA v3.0 · {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </>
  );
}
