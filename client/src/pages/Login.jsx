import { useState } from "react";
import { Eye, EyeOff, Shield, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden flex items-center justify-center px-4">
      {/* background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_40%)]" />

      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl">
        {/* logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="text-cyan-400 w-9 h-9" />
          </div>

          <h1 className="text-3xl font-bold text-white tracking-wide">
            SULTAN PHARMA
          </h1>

          <p className="text-slate-400 mt-2">نظام إدارة الصيدلية الذكي</p>
        </div>

        {/* tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setMode("staff")}
            className={`py-3 rounded-xl font-semibold transition-all ${
              mode === "staff"
                ? "bg-cyan-400/20 border border-cyan-400/30 text-cyan-400"
                : "bg-white/5 border border-white/10 text-slate-400"
            }`}
          >
            موظف
          </button>

          <button
            onClick={() => setMode("admin")}
            className={`py-3 rounded-xl font-semibold transition-all ${
              mode === "admin"
                ? "bg-cyan-400/20 border border-cyan-400/30 text-cyan-400"
                : "bg-white/5 border border-white/10 text-slate-400"
            }`}
          >
            مدير
          </button>
        </div>

        {/* error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {/* email */}
        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-2 block">
            البريد الإلكتروني
          </label>

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />

            <input
              type="email"
              placeholder="pharmacy@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl h-12 pl-12 pr-4 text-white outline-none focus:border-cyan-400/50 transition-all"
            />
          </div>
        </div>

        {/* password */}
        <div className="mb-6">
          <label className="text-slate-400 text-sm mb-2 block">
            كلمة المرور
          </label>

          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl h-12 px-4 text-white outline-none focus:border-cyan-400/50 transition-all"
            />

            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
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
          className="w-full h-12 rounded-xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>

        <div className="mt-6 text-center text-xs text-slate-600 tracking-widest">
          SULTAN PHARMA v3.0
        </div>
      </div>
    </div>
  );
}
