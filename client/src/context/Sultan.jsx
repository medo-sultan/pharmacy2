import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const AuthContext = createContext(null);
const BASE = import.meta.env.VITE_API_URL;

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 ساعات
// ── helpers ──
const saveSession = (token, staff) => {
  localStorage.setItem("ph_token", token);
  localStorage.setItem("ph_staff", JSON.stringify(staff));
  localStorage.setItem("ph_expires", String(Date.now() + SESSION_DURATION));
};

const clearSession = () => {
  localStorage.removeItem("ph_token");
  localStorage.removeItem("ph_staff");
  localStorage.removeItem("ph_expires");
  localStorage.removeItem("currentPage");
};

const isSessionValid = () => {
  const expires = localStorage.getItem("ph_expires");
  if (!expires) return false;
  return Date.now() < Number(expires);
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    if (!isSessionValid()) {
      clearSession();
      return null;
    }
    return localStorage.getItem("ph_token");
  });

  const [staff, setStaff] = useState(() => {
    if (!isSessionValid()) return null;
    try {
      return JSON.parse(localStorage.getItem("ph_staff"));
    } catch {
      return null;
    }
  });

  // ── تحقق من انتهاء الجلسة عند كل فتح للتطبيق ──
  useEffect(() => {
    if (token && !isSessionValid()) {
      performLogout(false); // silent logout بدون clockout
    }
  }, []);

  // ── timer يسجّل خروج تلقائي عند انتهاء الجلسة ──
  useEffect(() => {
    if (!token) return;
    const expires = Number(localStorage.getItem("ph_expires"));
    const remaining = expires - Date.now();
    if (remaining <= 0) {
      performLogout(false);
      return;
    }

    const timer = setTimeout(() => performLogout(false), remaining);
    return () => clearTimeout(timer);
  }, [token]);

  // ── logout الأساسي ──
  const performLogout = useCallback(async (clockout = true) => {
    if (clockout) {
      const t = localStorage.getItem("ph_token");
      try {
        await fetch(`${BASE}/attendance/clockout`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
            token: t,
          },
          body: JSON.stringify({}),
        });
      } catch (_) {}
    }
    clearSession();
    setToken(null);
    setStaff(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${BASE}/pharmacy/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Login failed");

    saveSession(data.token, data.staff);
    setToken(data.token);
    setStaff(data.staff);

    try {
      await fetch(`${BASE}/attendance/clockin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
          token: data.token,
        },
        body: JSON.stringify({}),
      });
    } catch (_) {}

    return data.staff;
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    const res = await fetch(`${BASE}/user/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Login failed");

    const adminStaff = { name: "Admin", role: "admin", isAdmin: true };
    saveSession(data.token, adminStaff);
    setToken(data.token);
    setStaff(adminStaff);
    return data;
  }, []);

  const logout = useCallback(() => performLogout(true), [performLogout]);

  const apiFetch = useCallback(
    async (path, options = {}) => {
      // تحقق من صلاحية الجلسة قبل كل request
      if (!isSessionValid()) {
        performLogout(false);
        throw new Error("انتهت الجلسة، يرجى تسجيل الدخول مجدداً");
      }

      const t = localStorage.getItem("ph_token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
        token: t,
        ...options.headers,
      };

      const res = await fetch(`${BASE}${path}`, { ...options, headers });

      // لو السيرفر رجّع 401، الجلسة انتهت من جانب السيرفر
      if (res.status === 401) {
        performLogout(false);
        throw new Error("انتهت الجلسة، يرجى تسجيل الدخول مجدداً");
      }

      const data = await res.json();
      if (data.success === false) throw new Error(data.message);
      return data;
    },
    [performLogout],
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        staff,
        login,
        adminLogin,
        logout,
        apiFetch,
        isAdmin: staff?.isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
