import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin } from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("staff@bank.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logo}>🏦</span>
          <h1 style={styles.title}>BankAssist AI</h1>
          <p style={styles.sub}>Frontline Desk Support System</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Staff Email</label>
          <input
            style={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="staff@bank.com"
            required
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
        <div style={styles.demo}>
          <strong>Demo credentials:</strong> staff@bank.com / demo1234
        </div>
      </div>
      <p style={styles.footer}>© 2025 BankAssist AI • Powered by GenAI</p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #0a1628 0%, #1a3a6b 50%, #0d47a1 100%)",
  },
  card: {
    background: "#fff", borderRadius: 16, padding: "40px 48px",
    width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  header: { textAlign: "center", marginBottom: 32 },
  logo: { fontSize: 48 },
  title: { margin: "8px 0 4px", fontSize: 26, color: "#0d1f3c", fontWeight: 700 },
  sub: { margin: 0, fontSize: 13, color: "#64748b" },
  form: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: "#334155" },
  input: {
    padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, outline: "none", marginBottom: 8,
    transition: "border-color 0.2s",
  },
  error: {
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#dc2626", padding: "8px 12px", borderRadius: 8, fontSize: 13,
  },
  btn: {
    marginTop: 8, padding: "13px", background: "linear-gradient(135deg, #1565c0, #1976d2)",
    color: "#fff", border: "none", borderRadius: 8, fontSize: 15,
    fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s",
  },
  demo: {
    marginTop: 20, padding: "10px 14px", background: "#f8fafc",
    borderRadius: 8, fontSize: 12, color: "#64748b", textAlign: "center",
    border: "1px dashed #cbd5e1",
  },
  footer: { marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.4)" },
};
