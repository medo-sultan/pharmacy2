import { useEffect, useState } from "react";
import { useAuth } from "../context/Sultan";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Ban,
  ArrowLeft,
  Package,
  ClipboardList,
  BarChart3,
  Zap,
  ChevronRight,
  Clock,
  Activity,
  Sparkles,
  RefreshCw,
  CircleDot,
} from "lucide-react";

// ── animation variants ──────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};
const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 26, delay },
  },
});
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

// ── Stat card ────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgClass,
  borderClass,
  onClick,
  delay,
}) {
  return (
    <motion.div
      variants={stagger(delay)}
      whileHover={onClick ? { y: -4, scale: 1.015 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border p-5 ${bgClass} ${borderClass} ${onClick ? "cursor-pointer" : ""} group`}
    >
      {/* glow blob */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${bgClass}`}
      />
      <div className="relative flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgClass} border ${borderClass}`}
        >
          <Icon size={20} style={{ color }} strokeWidth={1.6} />
        </div>
        {onClick && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={14} className="text-white/30" />
          </motion.div>
        )}
      </div>
      <p
        className="text-3xl font-bold tracking-tight mb-1"
        style={{ color, fontFamily: "'JetBrains Mono',monospace" }}
      >
        {value}
      </p>
      <p className="text-xs text-white/35 font-medium">{label}</p>
    </motion.div>
  );
}

// ── Alert row ────────────────────────────────────────────────
function AlertRow({ name, tag, color }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <CircleDot size={12} style={{ color }} />
        <span className="text-sm text-slate-400">{name}</span>
      </div>
      <span
        className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
        style={{ color, background: `${color}18`, borderColor: `${color}35` }}
      >
        {tag}
      </span>
    </motion.div>
  );
}

// ── Sale row ─────────────────────────────────────────────────
function SaleRow({ sale, index }) {
  const METHOD = {
    cash: { label: "نقدي", color: "#10b981" },
    card: { label: "بطاقة", color: "#a78bfa" },
    insurance: { label: "تأمين", color: "#22d3ee" },
  };
  const m = METHOD[sale.paymentMethod] || METHOD.cash;
  return (
    <motion.div
      variants={stagger(index * 0.05)}
      className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center flex-shrink-0">
          <ShoppingCart size={14} className="text-cyan-400" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm text-slate-300 font-medium leading-none mb-1">
            {sale.patientName || "عميل"}
          </p>
          <div className="flex items-center gap-1.5">
            <Clock size={9} className="text-white/20" />
            <p className="text-[10px] text-white/20">
              {new Date(sale.createdAt).toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
            <span
              className="text-[10px] font-medium"
              style={{ color: m.color }}
            >
              {m.label}
            </span>
          </div>
        </div>
      </div>
      <span
        className="text-sm font-bold text-emerald-400"
        style={{ fontFamily: "'JetBrains Mono',monospace" }}
      >
        {sale.totalAmount} ج
      </span>
    </motion.div>
  );
}

// ── Quick action btn ─────────────────────────────────────────
function QuickBtn({ label, page, color, icon: Icon, onNavigate }) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onNavigate(page)}
      className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all flex-1 min-w-[100px]"
      style={{
        background: `${color}0d`,
        borderColor: `${color}25`,
        color,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15` }}
      >
        <Icon size={18} strokeWidth={1.6} />
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </motion.button>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function Dashboard({ onNavigate }) {
  const { apiFetch, staff } = useAuth();
  const [alerts, setAlerts] = useState({
    lowStock: {},
    nearExpiry: {},
    expired: {},
  });
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
  });
  const [recentSales, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefresh] = useState(false);

  const load = async (showSpin = false) => {
    if (showSpin) setRefresh(true);
    try {
      const [a, s, sl] = await Promise.all([
        apiFetch("/pharmacy/inventory/alerts").catch(() => null),
        apiFetch("/pharmacy/sales/summary").catch(() => null),
        apiFetch("/pharmacy/sales").catch(() => null),
      ]);
      if (a?.alerts) setAlerts(a.alerts);
      if (s?.summary) setSummary(s.summary);
      if (sl?.sales) setRecent(sl.sales.slice(0, 6));
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalAlerts =
    (alerts.lowStock?.count || 0) +
    (alerts.nearExpiry?.count || 0) +
    (alerts.expired?.count || 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "صباح الخير" : hour < 17 ? "مساء النور" : "مساء الخير";
  const firstName = staff?.name?.split(" ")[0] || "Admin";

  return (
    <div
      className="min-h-screen text-white"
      dir="rtl"
      style={{
        fontFamily: "'IBM Plex Sans Arabic',sans-serif",
        background: "transparent",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');`}</style>

      {/* ── Header ─────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="mb-8"
      >
        <motion.div
          variants={fadeUp}
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-cyan-400" />
              <span
                className="text-[11px] text-cyan-400/60 tracking-widest uppercase"
                style={{ fontFamily: "'JetBrains Mono',monospace" }}
              >
                Sultan Pharma
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-1">
              {greeting}، {firstName}
            </h1>
            <p className="text-sm text-white/25 flex items-center gap-1.5">
              <Activity size={11} />
              {new Date().toLocaleDateString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => load(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/8 bg-white/[0.03] text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all text-xs"
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={
                refreshing
                  ? { repeat: Infinity, duration: 0.8, ease: "linear" }
                  : {}
              }
            >
              <RefreshCw size={13} />
            </motion.div>
            تحديث
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ── Stats grid ─────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"
      >
        <StatCard
          delay={0}
          icon={TrendingUp}
          label="إيرادات اليوم"
          value={
            loading ? "—" : `${summary.totalRevenue?.toLocaleString() || 0}`
          }
          color="#10b981"
          bgClass="bg-emerald-500/10"
          borderClass="border-emerald-500/15"
        />
        <StatCard
          delay={0.07}
          icon={ShoppingCart}
          label="معاملات اليوم"
          value={loading ? "—" : summary.totalTransactions || 0}
          color="#60a5fa"
          bgClass="bg-blue-500/10"
          borderClass="border-blue-500/15"
          onClick={() => onNavigate("sales")}
        />
        <StatCard
          delay={0.14}
          icon={AlertTriangle}
          label="تنبيهات المخزون"
          value={loading ? "—" : totalAlerts}
          color="#f59e0b"
          bgClass="bg-amber-500/10"
          borderClass="border-amber-500/15"
          onClick={() => onNavigate("inventory")}
        />
        <StatCard
          delay={0.21}
          icon={Ban}
          label="منتهية الصلاحية"
          value={loading ? "—" : alerts.expired?.count || 0}
          color="#ef4444"
          bgClass="bg-red-500/10"
          borderClass="border-red-500/15"
          onClick={() => onNavigate("inventory")}
        />
      </motion.div>

      {/* ── Two columns ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Alerts card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.25,
            type: "spring",
            stiffness: 260,
            damping: 28,
          }}
          className="rounded-2xl border border-white/[0.07] bg-[rgba(8,12,20,0.75)] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle
                  size={14}
                  className="text-amber-400"
                  strokeWidth={1.6}
                />
              </div>
              <span className="text-sm font-semibold text-slate-300">
                تنبيهات المخزون
              </span>
              {totalAlerts > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  {totalAlerts}
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigate("inventory")}
              className="flex items-center gap-1 text-[11px] text-white/25 hover:text-cyan-400 transition-colors"
            >
              عرض الكل <ArrowLeft size={11} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl bg-white/[0.03] animate-pulse"
                />
              ))}
            </div>
          ) : totalAlerts === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm">
              ✅ لا توجد تنبيهات
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={container}
              className="space-y-2"
            >
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
                  tag="يقترب انتهاؤه"
                  color="#f59e0b"
                />
              ))}
              {alerts.lowStock?.items?.slice(0, 3).map((m, i) => (
                <AlertRow
                  key={i}
                  name={m.name}
                  tag={`مخزون: ${m.stock}`}
                  color="#60a5fa"
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Recent sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.32,
            type: "spring",
            stiffness: 260,
            damping: 28,
          }}
          className="rounded-2xl border border-white/[0.07] bg-[rgba(8,12,20,0.75)] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <BarChart3
                  size={14}
                  className="text-cyan-400"
                  strokeWidth={1.6}
                />
              </div>
              <span className="text-sm font-semibold text-slate-300">
                آخر المبيعات
              </span>
            </div>
            <button
              onClick={() => onNavigate("sales")}
              className="flex items-center gap-1 text-[11px] text-white/25 hover:text-cyan-400 transition-colors"
            >
              عرض الكل <ArrowLeft size={11} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-white/[0.03] animate-pulse"
                />
              ))}
            </div>
          ) : recentSales.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm">
              لا توجد مبيعات اليوم
            </div>
          ) : (
            <motion.div initial="hidden" animate="show" variants={container}>
              {recentSales.map((s, i) => (
                <SaleRow key={s._id} sale={s} index={i} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Quick actions ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 28 }}
        className="rounded-2xl border border-white/[0.07] bg-[rgba(8,12,20,0.75)] p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-cyan-400" />
          <span className="text-sm font-semibold text-slate-300">
            إجراءات سريعة
          </span>
        </div>
        <div className="flex gap-3 flex-wrap">
          <QuickBtn
            label="نقطة البيع"
            page="pos"
            color="#22d3ee"
            icon={ShoppingCart}
            onNavigate={onNavigate}
          />
          <QuickBtn
            label="المخزون"
            page="inventory"
            color="#a78bfa"
            icon={Package}
            onNavigate={onNavigate}
          />
          <QuickBtn
            label="الوصفات"
            page="prescriptions"
            color="#10b981"
            icon={ClipboardList}
            onNavigate={onNavigate}
          />
          <QuickBtn
            label="المبيعات"
            page="sales"
            color="#f59e0b"
            icon={BarChart3}
            onNavigate={onNavigate}
          />
        </div>
      </motion.div>
    </div>
  );
}
