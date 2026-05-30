import { useEffect } from "react";
import { useAuth } from "../context/Sultan";

const Icon = ({ d, d2, circle, rect, line, poly }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d && <path d={d} />}
    {d2 && <path d={d2} />}
    {circle && <circle {...circle} />}
    {rect && <rect {...rect} />}
    {line && line.map((l, i) => <line key={i} {...l} />)}
    {poly && <polyline points={poly} />}
  </svg>
);

const STAFF_NAV = [
  {
    group: "الصيدلية",
    items: [
      {
        key: "dashboard",
        label: "الرئيسية",
        emoji: "⌂",
        icon: (
          <Icon
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            d2="M9 22V12h6v10"
          />
        ),
      },
      {
        key: "pos",
        label: "نقطة البيع",
        emoji: "◈",
        icon: (
          <Icon d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        ),
      },
      {
        key: "inventory",
        label: "المخزون",
        emoji: "▣",
        icon: (
          <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        ),
      },
      {
        key: "sales",
        label: "المبيعات",
        emoji: "◆",
        icon: (
          <Icon d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        ),
      },
    ],
  },
  {
    group: "الوصفات",
    items: [
      {
        key: "prescriptions",
        label: "الوصفات الطبية",
        emoji: "✦",
        icon: (
          <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        ),
      },
    ],
  },
];

const ADMIN_EXTRA = [
  {
    group: "الإدارة",
    items: [
      {
        key: "staff",
        label: "الموظفون",
        emoji: "◎",
        icon: (
          <Icon
            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
            d2="M23 21v-2a4 4 0 00-3-3.87"
            circle={{ cx: 9, cy: 7, r: 4 }}
          />
        ),
      },
      {
        key: "reports",
        label: "التقارير",
        emoji: "◉",
        icon: (
          <Icon
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
            d2="M14 2v6h6M16 13H8M16 17H8M10 9H8"
          />
        ),
      },
      {
        key: "attendance",
        label: "الحضور",
        emoji: "▦",
        icon: (
          <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
        ),
      },
    ],
  },
];

export default function Sidebar({ open, onClose, currentPage, onNavigate }) {
  const { staff, logout } = useAuth();
  const isAdmin = staff?.isAdmin || staff?.role === "admin";
  const navGroups = isAdmin ? [...STAFF_NAV, ...ADMIN_EXTRA] : STAFF_NAV;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Space+Mono:wght@400;700&display=swap');

        @keyframes sb-slide { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes overlay-fade { from{opacity:0} to{opacity:1} }
        @keyframes item-in { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }

        .sb-wrap { font-family:'Tajawal',sans-serif; }

        .sb-item {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: right;
          font-family: 'Tajawal', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: rgba(148,163,184,0.6);
          direction: rtl;
        }
        .sb-item:hover {
          background: rgba(34,211,238,0.04);
          border-color: rgba(34,211,238,0.08);
          color: rgba(226,232,240,0.9);
        }
        .sb-item.active {
          background: linear-gradient(135deg, rgba(34,211,238,0.08), rgba(167,139,250,0.06));
          border-color: rgba(34,211,238,0.15);
          color: #e2e8f0;
          font-weight: 600;
        }
        .sb-item .icon-box {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.2s;
          color: rgba(148,163,184,0.5);
        }
        .sb-item:hover .icon-box {
          background: rgba(34,211,238,0.08);
          border-color: rgba(34,211,238,0.15);
          color: #22d3ee;
        }
        .sb-item.active .icon-box {
          background: rgba(34,211,238,0.1);
          border-color: rgba(34,211,238,0.2);
          color: #22d3ee;
          box-shadow: 0 0 12px rgba(34,211,238,0.12);
        }
        .sb-item .active-bar {
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 2px;
          border-radius: 0 2px 2px 0;
          background: linear-gradient(180deg, #22d3ee, #a78bfa);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .sb-item.active .active-bar { opacity: 1; }

        .logout-btn {
          width: 100%;
          padding: 9px 14px;
          border-radius: 10px;
          border: 1px solid rgba(239,68,68,0.12);
          background: transparent;
          color: rgba(239,68,68,0.45);
          font-size: 12px;
          font-family: 'Tajawal', sans-serif;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: all 0.2s;
          direction: rtl;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,0.06);
          border-color: rgba(239,68,68,0.2);
          color: #f87171;
        }

        .group-label {
          font-family: 'Space Mono', monospace;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.12);
          padding: 0 12px;
          margin-bottom: 5px;
        }

        .avatar-ring {
          position: relative;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
        }
        .avatar-ring::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 11px;
          background: linear-gradient(135deg, rgba(34,211,238,0.3), rgba(167,139,250,0.3));
          z-index: 0;
        }
        .avatar-inner {
          position: relative;
          z-index: 1;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(34,211,238,0.12), rgba(167,139,250,0.12));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #22d3ee;
          font-family: 'Space Mono', monospace;
        }

        .online-dot {
          position: absolute;
          bottom: 1px;
          left: 1px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          border: 1.5px solid #080c14;
          animation: pulse-dot 2.5s ease infinite;
          z-index: 2;
        }

        .divider-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          margin: 8px 0;
        }
      `}</style>

      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(2,4,10,0.75)",
            backdropFilter: "blur(6px)",
            animation: "overlay-fade .25s ease both",
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        dir="rtl"
        className="sb-wrap"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: 264,
          background: "linear-gradient(180deg, #07090f 0%, #080c14 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: open
            ? "-24px 0 80px rgba(0,0,0,0.6), -1px 0 0 rgba(34,211,238,0.04)"
            : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 18px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background:
                    "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(167,139,250,0.1))",
                  border: "1px solid rgba(34,211,238,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 28 28">
                  <polygon
                    points="14,2 26,8 26,20 14,26 2,20 2,8"
                    fill="none"
                    stroke="rgba(34,211,238,0.6)"
                    strokeWidth="1.2"
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
              <div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  SULTAN
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 7,
                    letterSpacing: "0.2em",
                    color: "rgba(34,211,238,0.5)",
                    marginTop: -1,
                  }}
                >
                  PHARMA
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 10px",
            scrollbarWidth: "none",
          }}
        >
          {navGroups.map(({ group, items }, gi) => (
            <div key={group} style={{ marginBottom: 18 }}>
              <p className="group-label">{group}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {items.map(({ key, label, icon }, ii) => {
                  const active = currentPage === key;
                  return (
                    <button
                      key={key}
                      onClick={() => go(key)}
                      className={`sb-item ${active ? "active" : ""}`}
                      style={{ animationDelay: `${(gi * 4 + ii) * 0.04}s` }}
                    >
                      <div className="active-bar" />
                      <div className="icon-box">{icon}</div>
                      <span style={{ flex: 1 }}>{label}</span>
                      {active && (
                        <span
                          style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: 7,
                            letterSpacing: "0.15em",
                            color: "rgba(34,211,238,0.5)",
                          }}
                        >
                          ●
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: "12px 14px 16px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* User card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 10,
            }}
          >
            <div className="avatar-ring">
              <div className="avatar-inner">
                {staff?.name?.charAt(0) || "S"}
              </div>
              <div className="online-dot" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  color: "rgba(226,232,240,0.85)",
                  fontSize: 13,
                  fontWeight: 600,
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {staff?.name || "Staff"}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.22)",
                  fontSize: 10,
                  margin: 0,
                  fontFamily: "'Space Mono',monospace",
                  letterSpacing: "0.05em",
                }}
              >
                {isAdmin ? "ADMIN" : "STAFF"}
              </p>
            </div>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isAdmin ? "#a78bfa" : "#22d3ee",
                boxShadow: `0 0 8px ${isAdmin ? "#a78bfa" : "#22d3ee"}`,
              }}
            />
          </div>

          <button className="logout-btn" onClick={logout}>
            <svg
              width="12"
              height="12"
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
