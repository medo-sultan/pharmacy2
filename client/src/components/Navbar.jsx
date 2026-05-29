import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const PAGE_LABELS = {
  dashboard: "الرئيسية",
  pos: "نقطة البيع",
  inventory: "المخزون",
  sales: "المبيعات",
  prescriptions: "الوصفات",
  staff: "الموظفون",
  reports: "التقارير",
  attendance: "الحضور",
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
    const s = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", s);
    return () => window.removeEventListener("scroll", s);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = time.toLocaleDateString("ar-EG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap');
        @keyframes nav-in { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes breadcrumb-in { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }

        .nexus-nav {
          font-family: 'Tajawal', sans-serif;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          animation: nav-in 0.4s ease both;
          direction: rtl;
        }
        .nexus-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          padding: 0 20px;
          gap: 16px;
          transition: all 0.4s ease;
        }
        .nexus-nav.scrolled .nexus-nav-inner {
          background: rgba(6,8,16,0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.055);
          box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        }
        .nexus-nav:not(.scrolled) .nexus-nav-inner {
          background: linear-gradient(180deg, rgba(6,8,16,0.85), rgba(6,8,16,0.4));
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .hamburger-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 4.5px;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .hamburger-btn:hover {
          background: rgba(34,211,238,0.06);
          border-color: rgba(34,211,238,0.15);
        }
        .hline {
          display: block;
          height: 1.5px;
          border-radius: 2px;
          background: rgba(148,163,184,0.7);
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .hline-1 { width: 18px; }
        .hline-2 { width: 13px; }
        .hline-3 { width: 16px; }
        .hamburger-btn.open .hline-1 { width: 18px; transform: rotate(45deg) translate(4px,4px); background: #22d3ee; }
        .hamburger-btn.open .hline-2 { opacity:0; transform: translateX(-6px); }
        .hamburger-btn.open .hline-3 { width: 18px; transform: rotate(-45deg) translate(4px,-4px); background: #22d3ee; }

        .logo-btn {
          display: flex; align-items: center; gap: 8px;
          background: transparent; border: none; cursor: pointer;
          padding: 0; flex-shrink: 0;
        }
        .logo-hex {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(34,211,238,0.12), rgba(167,139,250,0.08));
          border: 1px solid rgba(34,211,238,0.18);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s;
        }
        .logo-btn:hover .logo-hex {
          box-shadow: 0 0 16px rgba(34,211,238,0.2);
          border-color: rgba(34,211,238,0.3);
        }
        .logo-text {
          font-family: 'Space Mono', monospace;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.75);
          transition: color 0.2s;
        }
        .logo-btn:hover .logo-text { color: rgba(255,255,255,0.95); }

        .breadcrumb {
          display: flex; align-items: center; gap: 6px;
          animation: breadcrumb-in 0.35s ease both;
        }
        .bc-sep { color: rgba(255,255,255,0.15); font-size: 10px; }
        .bc-root { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:0.15em; color:rgba(255,255,255,0.2); text-transform:uppercase; }
        .bc-page {
          font-size: 12px; font-weight: 600;
          color: rgba(226,232,240,0.8);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px;
          padding: 2px 8px;
        }

        .clock-badge {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.08em;
          display: flex; flex-direction: column; align-items: flex-end;
          line-height: 1.4;
        }
        .clock-time { color: rgba(34,211,238,0.5); font-size: 10px; font-weight: 700; }

        .user-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 10px 4px 6px;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          cursor: default;
          transition: all 0.2s;
        }
        .user-chip:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
        .user-av {
          width: 22px; height: 22px; border-radius: 7px;
          background: linear-gradient(135deg, rgba(34,211,238,0.2), rgba(167,139,250,0.2));
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #22d3ee;
          font-family: 'Space Mono', monospace;
        }
        .user-name { font-size: 11px; font-weight: 600; color: rgba(226,232,240,0.7); max-width: 80px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }

        .logout-icon-btn {
          width: 32px; height: 32px;
          border-radius: 9px;
          border: 1px solid rgba(239,68,68,0.12);
          background: transparent;
          color: rgba(239,68,68,0.35);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .logout-icon-btn:hover {
          background: rgba(239,68,68,0.07);
          border-color: rgba(239,68,68,0.25);
          color: #f87171;
        }

        .nav-divider { width:1px; height:18px; background:rgba(255,255,255,0.07); flex-shrink:0; }
      `}</style>

      <nav className={`nexus-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nexus-nav-inner">
          {/* Right: hamburger + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className={`hamburger-btn ${sidebarOpen ? "open" : ""}`}
              onClick={onToggleSidebar}
              aria-label="Toggle menu"
            >
              <span className="hline hline-1" />
              <span className="hline hline-2" />
              <span className="hline hline-3" />
            </button>

            <button
              className="logo-btn"
              onClick={() => onNavigate("dashboard")}
            >
              <div className="logo-hex">
                <svg width="14" height="14" viewBox="0 0 28 28">
                  <polygon
                    points="14,2 26,8 26,20 14,26 2,20 2,8"
                    fill="none"
                    stroke="rgba(34,211,238,0.7)"
                    strokeWidth="1.5"
                  />
                  <text
                    x="14"
                    y="18"
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
              <span
                className="logo-text"
                style={{ display: window.innerWidth < 480 ? "none" : "block" }}
              >
                SULTAN
              </span>
            </button>
          </div>

          {/* Center: breadcrumb */}
          <div className="breadcrumb" key={currentPage}>
            <span className="bc-root">pharma</span>
            <span className="bc-sep">›</span>
            <span className="bc-page">
              {PAGE_LABELS[currentPage] || currentPage}
            </span>
          </div>

          {/* Left: clock + user + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              className="clock-badge"
              style={{ display: window.innerWidth < 600 ? "none" : "flex" }}
            >
              <span className="clock-time">{timeStr}</span>
              <span>{dateStr}</span>
            </div>

            <div className="nav-divider" />

            <div className="user-chip">
              <div className="user-av">{staff?.name?.charAt(0) || "S"}</div>
              <span className="user-name">{staff?.name || "Staff"}</span>
            </div>

            <button
              className="logout-icon-btn"
              onClick={logout}
              title="تسجيل الخروج"
            >
              <svg
                width="13"
                height="13"
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
        </div>
      </nav>
    </>
  );
}
