import { useEffect } from "react";
import { useAuth } from "../context/Sultan";

const NAV_GROUPS_STAFF = [
  {
    label: "الصيدلية",
    items: [
      { key: "dashboard", label: "الرئيسية", icon: <HomeIcon /> },
      { key: "pos", label: "نقطة البيع", icon: <PosIcon /> },
      { key: "inventory", label: "المخزون", icon: <BoxIcon /> },
      { key: "sales", label: "المبيعات", icon: <SalesIcon /> },
    ],
  },
  {
    label: "الوصفات",
    items: [
      { key: "prescriptions", label: "الوصفات الطبية", icon: <RxIcon /> },
    ],
  },
];

const NAV_GROUPS_ADMIN = [
  {
    label: "الإدارة",
    items: [
      { key: "staff", label: "الموظفون", icon: <StaffIcon /> },
      { key: "reports", label: "التقارير", icon: <ReportIcon /> },
      { key: "attendance", label: "الحضور", icon: <CalIcon /> },
    ],
  },
];

function Ico({ children }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}
function HomeIcon() {
  return (
    <Ico>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M9 22V12h6v10" />
    </Ico>
  );
}
function PosIcon() {
  return (
    <Ico>
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.63.63-.18 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </Ico>
  );
}
function BoxIcon() {
  return (
    <Ico>
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </Ico>
  );
}
function SalesIcon() {
  return (
    <Ico>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </Ico>
  );
}
function RxIcon() {
  return (
    <Ico>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </Ico>
  );
}
function StaffIcon() {
  return (
    <Ico>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </Ico>
  );
}
function ReportIcon() {
  return (
    <Ico>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </Ico>
  );
}
function CalIcon() {
  return (
    <Ico>
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
    </Ico>
  );
}

export default function Sidebar({ open, onClose, currentPage, onNavigate }) {
  const { staff, logout } = useAuth();
  const isAdmin = staff?.isAdmin || staff?.role === "admin";
  const groups = isAdmin
    ? [...NAV_GROUPS_STAFF, ...NAV_GROUPS_ADMIN]
    : NAV_GROUPS_STAFF;

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (key) => {
    onNavigate(key);
    onClose();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        .sb-overlay {
          position: fixed; inset: 0; z-index: 99;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(3px);
          animation: ov-in 0.2s ease;
        }
        @keyframes ov-in { from{opacity:0} to{opacity:1} }

        .sb-root {
          font-family: 'IBM Plex Sans Arabic', sans-serif;
          position: fixed;
          top: 0; right: 0; bottom: 0;
          z-index: 100;
          width: 256px;
          background: #06080f;
          border-left: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
          direction: rtl;
          box-shadow: -20px 0 60px rgba(0,0,0,0.5);
        }
        .sb-root.open  { transform: translateX(0); }
        .sb-root.closed { transform: translateX(100%); }

        /* Header */
        .sb-header {
          height: 60px;
          padding: 0 16px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .sb-brand {
          display: flex; align-items: center; gap: 9px;
        }
        .sb-brand-mark {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(34,211,238,0.14), rgba(167,139,250,0.09));
          border: 1px solid rgba(34,211,238,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .sb-brand-text { line-height: 1.1; }
        .sb-brand-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.18em;
          color: rgba(241,245,249,0.8);
          display: block;
        }
        .sb-brand-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 7px;
          letter-spacing: 0.25em;
          color: rgba(34,211,238,0.45);
          display: block;
        }
        .sb-close {
          width: 28px; height: 28px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .sb-close:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.6);
          border-color: rgba(255,255,255,0.12);
        }

        /* Nav */
        .sb-nav {
          flex: 1; overflow-y: auto;
          padding: 12px 10px;
          scrollbar-width: none;
        }
        .sb-nav::-webkit-scrollbar { display: none; }

        .sb-group { margin-bottom: 20px; }
        .sb-group-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.13);
          padding: 0 10px;
          margin-bottom: 6px;
          display: block;
        }
        .sb-group-items { display: flex; flex-direction: column; gap: 2px; }

        /* Nav item */
        .sb-item {
          position: relative;
          width: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          font-family: 'IBM Plex Sans Arabic', sans-serif;
          font-size: 13px; font-weight: 400;
          color: rgba(148,163,184,0.55);
          direction: rtl; text-align: right;
          transition: all 0.15s ease;
        }
        .sb-item:hover {
          background: rgba(255,255,255,0.035);
          border-color: rgba(255,255,255,0.07);
          color: rgba(203,213,225,0.85);
        }
        .sb-item:hover .sb-icon {
          background: rgba(34,211,238,0.08);
          border-color: rgba(34,211,238,0.15);
          color: #22d3ee;
        }
        .sb-item.active {
          background: linear-gradient(135deg, rgba(34,211,238,0.08), rgba(167,139,250,0.05));
          border-color: rgba(34,211,238,0.14);
          color: #e2e8f0;
          font-weight: 600;
        }
        .sb-item.active .sb-icon {
          background: rgba(34,211,238,0.1);
          border-color: rgba(34,211,238,0.22);
          color: #22d3ee;
          box-shadow: 0 0 10px rgba(34,211,238,0.1);
        }

        /* Active indicator */
        .sb-item::before {
          content: '';
          position: absolute;
          right: -1px;
          top: 8px; bottom: 8px;
          width: 2px;
          border-radius: 2px 0 0 2px;
          background: linear-gradient(180deg, #22d3ee, #a78bfa);
          opacity: 0;
          transition: opacity 0.15s;
        }
        .sb-item.active::before { opacity: 1; }

        .sb-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(148,163,184,0.45);
          transition: all 0.15s;
        }
        .sb-item-label { flex: 1; }
        .sb-active-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #22d3ee;
          opacity: 0.6;
          flex-shrink: 0;
        }

        /* Footer */
        .sb-footer {
          padding: 12px 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        /* User card */
        .sb-user {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 11px;
          border-radius: 11px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 8px;
        }
        .sb-avatar {
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; font-weight: 600;
          flex-shrink: 0;
          position: relative;
        }
        .sb-avatar-inner {
          width: 100%; height: 100%;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(34,211,238,0.18), rgba(167,139,250,0.14));
          border: 1px solid rgba(34,211,238,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #22d3ee;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; font-weight: 600;
        }
        .sb-online {
          position: absolute;
          bottom: -2px; left: -2px;
          width: 8px; height: 8px;
          border-radius: 50%;
          border: 1.5px solid #06080f;
        }
        .sb-user-info { flex: 1; min-width: 0; }
        .sb-user-name {
          color: rgba(226,232,240,0.82);
          font-size: 13px; font-weight: 600;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 0 0 1px;
        }
        .sb-user-role {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; letter-spacing: 0.18em;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
        }
        .sb-role-badge {
          width: 6px; height: 6px;
          border-radius: 50%; flex-shrink: 0;
        }

        /* Logout */
        .sb-logout {
          width: 100%;
          padding: 9px 14px;
          border-radius: 9px;
          border: 1px solid rgba(239,68,68,0.1);
          background: transparent;
          color: rgba(239,68,68,0.4);
          font-family: 'IBM Plex Sans Arabic', sans-serif;
          font-size: 12px; font-weight: 500;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          direction: rtl;
          transition: all 0.18s;
        }
        .sb-logout:hover {
          background: rgba(239,68,68,0.07);
          border-color: rgba(239,68,68,0.22);
          color: #f87171;
          box-shadow: 0 0 16px rgba(239,68,68,0.06);
        }

        @keyframes item-in {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sb-item { animation: item-in 0.3s ease both; }
      `}</style>

      {/* Overlay */}
      {open && <div className="sb-overlay" onClick={onClose} />}

      {/* Sidebar */}
      <aside className={`sb-root ${open ? "open" : "closed"}`}>
        {/* Header */}
        <div className="sb-header">
          <div className="sb-brand">
            <div className="sb-brand-mark">
              <svg width="14" height="14" viewBox="0 0 28 28">
                <polygon
                  points="14,2 26,8 26,20 14,26 2,20 2,8"
                  fill="none"
                  stroke="rgba(34,211,238,0.6)"
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
            <div className="sb-brand-text">
              <span className="sb-brand-name">SULTAN</span>
              <span className="sb-brand-sub">PHARMA</span>
            </div>
          </div>
          <button className="sb-close" onClick={onClose}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          {groups.map(({ label, items }, gi) => (
            <div key={label} className="sb-group">
              <span className="sb-group-label">{label}</span>
              <div className="sb-group-items">
                {items.map(({ key, label: itemLabel, icon }, ii) => {
                  const active = currentPage === key;
                  return (
                    <button
                      key={key}
                      className={`sb-item ${active ? "active" : ""}`}
                      onClick={() => go(key)}
                      style={{ animationDelay: `${(gi * 5 + ii) * 0.035}s` }}
                    >
                      <div className="sb-icon">{icon}</div>
                      <span className="sb-item-label">{itemLabel}</span>
                      {active && <div className="sb-active-dot" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">
              <div className="sb-avatar-inner">
                {staff?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div
                className="sb-online"
                style={{
                  background: isAdmin ? "#a78bfa" : "#22d3ee",
                  boxShadow: `0 0 6px ${isAdmin ? "#a78bfa" : "#22d3ee"}`,
                }}
              />
            </div>
            <div className="sb-user-info">
              <p className="sb-user-name">{staff?.name || "Staff"}</p>
              <span className="sb-user-role">
                {isAdmin ? "ADMIN" : "STAFF"}
              </span>
            </div>
            <div
              className="sb-role-badge"
              style={{
                background: isAdmin ? "#a78bfa" : "#22d3ee",
                boxShadow: `0 0 7px ${isAdmin ? "#a78bfa66" : "#22d3ee66"}`,
              }}
            />
          </div>

          <button className="sb-logout" onClick={logout}>
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
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
