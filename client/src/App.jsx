import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
// import { Sales, Prescriptions, Staff, Reports } from "./pages/PharmacyPages";
import Attendance from "./pages/Attendance";
import { Staff } from "./pages/Staff";
import { Prescriptions } from "./pages/Prescriptions";
import { Reports } from "./pages/Reports";
import { Sales } from "./pages/Sales";

// ── Inner app (has auth context) ──────────────
function PharmacyApp() {
  const { token, staff } = useAuth();
  const [page, setPage] = useState("dashboard");
  const isAdmin = staff?.isAdmin || staff?.role === "admin";

  if (!token) return <Login onLogin={() => setPage("dashboard")} />;

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard onNavigate={setPage} />;
      case "pos":
        return <POS />;
      case "inventory":
        return <Inventory />;
      case "sales":
        return <Sales />;
      case "prescriptions":
        return <Prescriptions />;
      case "staff":
        return isAdmin ? <Staff /> : <Dashboard onNavigate={setPage} />;
      case "reports":
        return isAdmin ? <Reports /> : <Dashboard onNavigate={setPage} />;
      case "attendance":
        return isAdmin ? <Attendance /> : <Dashboard onNavigate={setPage} />;
      default:
        return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <MainLayout currentPage={page} onNavigate={setPage}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
        {renderPage()}
      </div>
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PharmacyApp />
    </AuthProvider>
  );
}
