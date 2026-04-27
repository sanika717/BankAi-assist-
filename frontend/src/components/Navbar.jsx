import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header style={styles.navbar}>
      <div style={styles.brand}>
        <span style={styles.logo}>🏦</span>
        <span style={styles.brandName}>Vani.<span style={styles.ai}>AI</span></span>
        <span style={styles.tagline}>Frontline Voice Assistant</span>
      </div>
      <div style={styles.right}>
        {user && (
          <>
            <div style={styles.userInfo}>
              <span style={styles.staffBadge}>STAFF</span>
              <span style={styles.userName}>{user.full_name}</span>
              <span style={styles.branch}>Branch: {user.branch_id}</span>
            </div>
            <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%)",
    color: "#fff",
    padding: "0 28px",
    height: 64,
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  logo: { fontSize: 26 },
  brandName: { fontSize: 20, fontWeight: 700, letterSpacing: 0.5 },
  ai: { color: "#4fc3f7" },
  tagline: { fontSize: 12, color: "#90caf9", marginLeft: 8, opacity: 0.8 },
  right: { display: "flex", alignItems: "center", gap: 16 },
  userInfo: { display: "flex", alignItems: "center", gap: 10 },
  staffBadge: {
    background: "#1565c0", color: "#fff", fontSize: 10, fontWeight: 700,
    padding: "2px 8px", borderRadius: 4, letterSpacing: 1,
  },
  userName: { fontSize: 14, fontWeight: 600 },
  branch: { fontSize: 12, color: "#90caf9" },
  logoutBtn: {
    background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500,
    transition: "all 0.2s",
  },
};
