import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children, currentPage, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080a10",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar
        onLogout={logout}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        sidebarOpen={sidebarOpen}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
      <main style={{ paddingTop: 64, flex: 1 }}>{children}</main>
    </div>
  );
}
