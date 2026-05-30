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

  const logout = useCallback(() => {
    localStorage.removeItem("ph_token");
    localStorage.removeItem("ph_staff");
    setToken(null);
    setStaff(null);
  }, []);

  const apiFetch = useCallback(async (path, options = {}) => {
    // ✅ اقرأ الـ token من localStorage مباشرة عشان دايماً يكون محدّث
    const t = localStorage.getItem("ph_token");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t}`, // ✅ للـ staffAuth
      token: t, // ✅ للـ adminAuth
      ...options.headers,
    };

    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (data.success === false) throw new Error(data.message);
    return data;
  }, []); // ✅ مفيش dependencies — بيقرأ من localStorage مباشرة

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
