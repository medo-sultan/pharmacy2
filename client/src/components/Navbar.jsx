import { useState, useEffect } from "react";
import { useAuth } from "../context/Sultan";

const PAGE_LABELS = {
  dashboard: { ar: "الرئيسية", icon: "⌂" },
  pos: { ar: "نقطة البيع", icon: "◈" },
  inventory: { ar: "المخزون", icon: "▣" },
  sales: { ar: "المبيعات", icon: "◆" },
  prescriptions: { ar: "الوصفات", icon: "✦" },
  staff: { ar: "الموظفون", icon: "◎" },
  reports: { ar: "التقارير", icon: "◉" },
  attendance: { ar: "الحضور", icon: "▦" },
};

export default function Navbar({
  onToggleSidebar,
  sidebarOpen,
  currentPage,
  onNavigate,
}) {
  const { staff, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", s);
    return () => window.removeEventListener("scroll", s);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = time.toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const page = PAGE_LABELS[currentPage] || { ar: currentPage, icon: "○" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        :root {
          --nav-h: 60px;
          --cyan: #22d3ee;
          --violet: #a78bfa;
          --surface: rgba(7,10,18,0.95);
          --border: rgba(255,255,255,0.07);
          --text-dim: rgba(148,163,184,0.6);
          --text-mid: rgba(203,213,225,0.8);
          --text-bright: #f1f5f9;
        }

        * { box-sizing: border-box; }

        .nav-root {
          font-family: 'IBM Plex Sans Arabic', sans-serif;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: var(--nav-h);
          z-index: 100;
          direction: rtl;
          transition: all 0.3s ease;
        }

        .nav-root.scrolled {
          background: var(--surface);
          backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 1px 40px rgba(0,0,0,0.5);
        }
        .nav-root:not(.scrolled) {
          background: linear-gradient(180deg, rgba(7,10,18,0.9) 0%, rgba(7,10,18,0.4) 100%);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .nav-inner {
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 18px;
          gap: 14px;
        }

        /* ── Hamburger ── */
        .hbg {
          width: 38px; height: 38px;
          border-radius: 11px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 5px;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .hbg:hover {
          background: rgba(34,211,238,0.07);
          border-color: rgba(34,211,238,0.2);
        }
        .hbg span {
          display: block;
          height: 1.5px;
          border-radius: 2px;
          background: rgba(148,163,184,0.6);
          transition: all 0.28s cubic-bezier(0.16,1,0.3,1);
        }
        .hbg span:nth-child(1) { width: 18px; }
        .hbg span:nth-child(2) { width: 12px; }
        .hbg span:nth-child(3) { width: 15px; }
        .hbg.open span { background: var(--cyan); }
        .hbg.open span:nth-child(1) { width: 18px; transform: rotate(45deg) translate(4.5px, 4.5px); }
        .hbg.open span:nth-child(2) { width: 0; opacity: 0; }
        .hbg.open span:nth-child(3) { width: 18px; transform: rotate(-45deg) translate(4.5px, -4.5px); }

        /* ── Logo ── */
        .nav-logo {
          display: flex; align-items: center; gap: 9px;
          background: transparent; border: none;
          cursor: pointer; padding: 0; flex-shrink: 0;
          text-decoration: none;
        }
        .logo-mark {
          width: 32px; height: 32px;
          border-radius: 9px;
          background: linear-gradient(135deg, rgba(34,211,238,0.15), rgba(167,139,250,0.1));
          border: 1px solid rgba(34,211,238,0.22);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .logo-mark::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(34,211,238,0.08), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .nav-logo:hover .logo-mark {
          box-shadow: 0 0 20px rgba(34,211,238,0.18);
          border-color: rgba(34,211,238,0.35);
        }
        .nav-logo:hover .logo-mark::before { opacity: 1; }
        .logo-wordmark {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.2em;
          color: rgba(241,245,249,0.7);
          transition: color 0.2s;
        }
        .logo-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 7px;
          letter-spacing: 0.25em;
          color: rgba(34,211,238,0.45);
          display: block;
          margin-top: -2px;
        }
        .nav-logo:hover .logo-wordmark { color: rgba(241,245,249,0.95); }

        /* ── Divider ── */
        .nav-sep {
          width: 1px; height: 22px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent);
          flex-shrink: 0;
        }

        /* ── Breadcrumb ── */
        .nav-breadcrumb {
          display: flex; align-items: center; gap: 7px;
          flex: 1;
        }
        .bc-root {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.18);
          text-transform: uppercase;
        }
        .bc-arrow {
          color: rgba(255,255,255,0.12);
          font-size: 10px;
          line-height: 1;
        }
        .bc-current {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 4px 10px;
          animation: bc-pop 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes bc-pop {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .bc-icon { font-size: 11px; opacity: 0.6; }
        .bc-label { color: var(--text-mid); font-size: 12px; font-weight: 600; }

        /* ── Clock ── */
        .nav-clock {
          text-align: left;
          flex-shrink: 0;
        }
        .clock-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; font-weight: 600;
          color: rgba(34,211,238,0.65);
          line-height: 1.2;
          letter-spacing: 0.06em;
        }
        .clock-date {
          font-size: 9px;
          color: rgba(255,255,255,0.2);
          line-height: 1.2;
          white-space: nowrap;
        }

        /* ── User chip ── */
        .nav-user {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 10px 5px 8px;
          border-radius: 22px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          cursor: default;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .nav-user:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.11);
        }
        .user-av {
          width: 24px; height: 24px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(34,211,238,0.22), rgba(167,139,250,0.18));
          border: 1px solid rgba(34,211,238,0.2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; font-weight: 600;
          color: #22d3ee;
          flex-shrink: 0;
        }
        .user-name {
          font-size: 12px; font-weight: 600;
          color: var(--text-mid);
          max-width: 90px;
          overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
        }
        .user-role-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Logout ── */
        .nav-logout {
          width: 34px; height: 34px;
          border-radius: 9px;
          border: 1px solid rgba(239,68,68,0.1);
          background: transparent;
          color: rgba(239,68,68,0.35);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .nav-logout:hover {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.3);
          color: #f87171;
          box-shadow: 0 0 14px rgba(239,68,68,0.1);
        }

        @media (max-width: 600px) {
          .nav-clock { display: none; }
          .user-name { display: none; }
        }
        @media (max-width: 400px) {
          .logo-wordmark { display: none; }
        }
      `}</style>

      <nav className={`nav-root ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          {/* Hamburger */}
          <button
            className={`hbg ${sidebarOpen ? "open" : ""}`}
            onClick={onToggleSidebar}
          >
            <span />
            <span />
            <span />
          </button>

          {/* Logo */}
          <button className="nav-logo" onClick={() => onNavigate("dashboard")}>
            <div className="logo-mark">
              <svg width="15" height="15" viewBox="0 0 28 28">
                <polygon
                  points="14,2 26,8 26,20 14,26 2,20 2,8"
                  fill="none"
                  stroke="rgba(34,211,238,0.65)"
                  strokeWidth="1.4"
                />
                <text
                  x="14"
                  y="18.5"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontSize="9"
                  fontWeight="700"
                  fill="#22d3ee"
                >
                  S
                </text>
              </svg>
            </div>
            <div>
              <span className="logo-wordmark">SULTAN</span>
              <span className="logo-sub">PHARMA</span>
            </div>
          </button>

          <div className="nav-sep" />

          {/* Breadcrumb */}
          <div className="nav-breadcrumb">
            <span className="bc-root">pharma</span>
            <span className="bc-arrow">›</span>
            <div className="bc-current" key={currentPage}>
              <span className="bc-icon">{page.icon}</span>
              <span className="bc-label">{page.ar}</span>
            </div>
          </div>

          {/* Clock */}
          <div className="nav-clock">
            <div className="clock-time">{timeStr}</div>
            <div className="clock-date">{dateStr}</div>
          </div>

          <div className="nav-sep" />

          {/* User */}
          <div className="nav-user">
            <div className="user-av">
              {staff?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
            <span className="user-name">{staff?.name || "Staff"}</span>
            <div
              className="user-role-dot"
              style={{
                background: staff?.role === "admin" ? "#a78bfa" : "#22d3ee",
                boxShadow: `0 0 6px ${staff?.role === "admin" ? "#a78bfa55" : "#22d3ee55"}`,
              }}
            />
          </div>

          {/* Logout */}
          <button className="nav-logout" onClick={logout} title="تسجيل الخروج">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>
    </>
  );
}
