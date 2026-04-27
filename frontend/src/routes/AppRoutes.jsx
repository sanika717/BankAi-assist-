import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Assistant from "../pages/Assistant";
import History from "../pages/History";
import Analytics from "../pages/Analytics";
import Settings from "../pages/Settings";

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingInner}>
          <div style={styles.loadingLogo}>🏦</div>
          <div style={styles.loadingText}>Vani.AI</div>
          <div style={styles.loadingSubtext}>Loading secure session…</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={styles.shell}>
      <Navbar />
      <div style={styles.body}>
        <Sidebar />
        <main style={styles.main}>{children}</main>
      </div>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/assistant" element={<ProtectedLayout><Assistant /></ProtectedLayout>} />
      <Route path="/history" element={<ProtectedLayout><History /></ProtectedLayout>} />
      <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

const styles = {
  shell: { display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f0f4f8" },
  body: { display: "flex", flex: 1 },
  main: { flex: 1, overflowY: "auto", background: "#f0f4f8" },
  loadingScreen: {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%)",
  },
  loadingInner: { textAlign: "center", color: "#fff" },
  loadingLogo: { fontSize: 48, marginBottom: 12 },
  loadingText: { fontSize: 24, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 },
  loadingSubtext: { fontSize: 14, color: "#90caf9", opacity: 0.8 },
};
