import { useState } from "react";
import { Eye, EyeOff, Shield, User } from "lucide-react";
import { useAuth } from "../context/Sultan";

export default function Login({ onLogin }) {
  const { login, adminLogin } = useAuth();

  const [mode, setMode] = useState("staff");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      return setError("أدخل البريد وكلمة المرور");
    }

    try {
      setLoading(true);
      setError("");

      if (mode === "admin") {
        await adminLogin(email, password);
      } else {
        await login(email, password);
      }

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

  return (
    <div
      className="min-h-screen bg-[#020617] relative overflow-hidden flex items-center justify-center px-4 py-8"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
    >
      {/* background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_50%)]" />
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* card — full width on small screens */}
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-2xl"
        style={{ paddingTop: "clamp(20px, 5vw, 32px)" }}
      >
        {/* logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-3">
            <Shield className="text-cyan-400 w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-wide">
            SULTAN PHARMA
          </h1>

          <p className="text-slate-400 mt-1 text-sm">
            نظام إدارة الصيدلية الذكي
          </p>
        </div>

        {/* tabs — full width touch-friendly */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { key: "staff", label: "موظف" },
            { key: "admin", label: "مدير" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`py-3 rounded-xl font-semibold transition-all text-sm ${
                mode === key
                  ? "bg-cyan-400/20 border border-cyan-400/30 text-cyan-400"
                  : "bg-white/5 border border-white/10 text-slate-400"
              }`}
              style={{ minHeight: 44 }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {/* email */}
        <div className="mb-3">
          <label className="text-slate-400 text-xs mb-1.5 block">
            البريد الإلكتروني
          </label>

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />

            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="pharmacy@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-12 pr-4 text-white outline-none focus:border-cyan-400/50 transition-all text-sm"
              style={{ height: 48 }}
            />
          </div>
        </div>

        {/* password */}
        <div className="mb-5">
          <label className="text-slate-400 text-xs mb-1.5 block">
            كلمة المرور
          </label>

          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 text-white outline-none focus:border-cyan-400/50 transition-all text-sm"
              style={{ height: 48 }}
            />

            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 p-1"
              style={{ minWidth: 32, minHeight: 32 }}
            >
              {showPw ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
          style={{ height: 48 }}
        >
          {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>

        <div className="mt-5 text-center text-xs text-slate-600 tracking-widest">
          SULTAN PHARMA v3.0
        </div>
      </div>
    </div>
  );
}
