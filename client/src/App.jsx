import { useState } from "react";
import { AuthProvider, useAuth } from "./context/Sultan";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Attendance from "./pages/Attendance";
import { Staff } from "./pages/Staff";
import { Prescriptions } from "./pages/Prescriptions";
import { Reports } from "./pages/Reports";
import { Sales } from "./pages/Sales";
import BackArrow from "./components/BackArrow";
import Barcode from "./components/Barcode";

// ── Inner app (has auth context) ──────────────
function PharmacyApp() {
  const { token, staff } = useAuth();
  const [page, setPage] = useState(
    () => localStorage.getItem("currentPage") || "dashboard",
  );
  const isAdmin = staff?.isAdmin || staff?.role === "admin";

  const navigate = (p) => {
    localStorage.setItem("currentPage", p);
    setPage(p);
  };

  if (!token) return <Login onLogin={() => navigate("dashboard")} />;

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard onNavigate={navigate} />;
      case "pos":
        return <POS />;
      case "barcode":
        return <Barcode />;
      case "inventory":
        return <Inventory />;
      case "sales":
        return <Sales />;
      case "prescriptions":
        return <Prescriptions />;
      case "staff":
        return isAdmin ? <Staff /> : <Dashboard onNavigate={navigate} />;
      case "reports":
        return isAdmin ? <Reports /> : <Dashboard onNavigate={navigate} />;
      case "attendance":
        return isAdmin ? <Attendance /> : <Dashboard onNavigate={navigate} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <MainLayout currentPage={page} onNavigate={navigate}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
        {page !== "dashboard" && <BackArrow onNavigate={navigate} />}
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
