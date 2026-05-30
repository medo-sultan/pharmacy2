import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const BASE = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ph_token"));
  const [staff, setStaff] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ph_staff"));
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${BASE}/pharmacy/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Login failed");

    localStorage.setItem("ph_token", data.token);
    localStorage.setItem("ph_staff", JSON.stringify(data.staff));
    setToken(data.token);
    setStaff(data.staff);

    // ✅ تسجيل حضور أوتوماتيك عند دخول الموظف
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

    localStorage.setItem("ph_token", data.token);
    localStorage.setItem(
      "ph_staff",
      JSON.stringify({ name: "Admin", role: "admin", isAdmin: true }),
    );
    setToken(data.token);
    setStaff({ name: "Admin", role: "admin", isAdmin: true });
    return data;
  }, []);

  const logout = useCallback(async () => {
    // ✅ تسجيل انصراف أوتوماتيك عند خروج الموظف
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

    localStorage.removeItem("ph_token");
    localStorage.removeItem("ph_staff");
    setToken(null);
    setStaff(null);
  }, []);

  const apiFetch = useCallback(async (path, options = {}) => {
    const t = localStorage.getItem("ph_token");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t}`,
      token: t,
      ...options.headers,
    };

    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (data.success === false) throw new Error(data.message);
    return data;
  }, []);

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
