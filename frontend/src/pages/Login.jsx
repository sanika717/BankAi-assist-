import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin, register as apiRegister, forgotPassword as apiForgotPassword, resetPassword as apiConfirmResetPassword } from "../services/api";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("staff@bank.com");
  const [password, setPassword] = useState("demo1234");
  const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetRequested, setResetRequested] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function resetMessages() {
    setError("");
    setSuccess("");
  }

  function switchMode(newMode) {
    resetMessages();
    setMode(newMode);
    setPassword("");
    setNewPassword("");
    setFullName("");
    setResetRequested(false);
    setResetToken("");
    if (newMode === "login") {
      setUsername("staff@bank.com");
      setPassword("demo1234");
    } else {
      setUsername("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await apiLogin(username, password);
        login(data);
        navigate("/dashboard");
      } else if (mode === "register") {
        await apiRegister(username, password, fullName);
        setSuccess("Account created successfully. Please sign in.");
        setMode("login");
        setPassword("");
        setUsername("");
      } else if (mode === "forgot") {
        if (!resetRequested) {
          const response = await apiForgotPassword(username);
          setSuccess(
            response.reset_token
              ? `Reset token generated: ${response.reset_token}`
              : "Reset instructions have been sent to your email."
          );
          setResetRequested(true);
          if (response.reset_token) setResetToken(response.reset_token);
        } else {
          await apiConfirmResetPassword(username, resetToken, newPassword);
          setSuccess("Password reset successfully. Please sign in.");
          setMode("login");
          setPassword("");
          setNewPassword("");
          setResetRequested(false);
          setResetToken("");
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logo}>🏦</span>
          <h1 style={styles.title}>Vani.AI</h1>
          <p style={styles.sub}>Frontline Desk Support System</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Staff Email</label>
          <input
            style={styles.input}
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="staff@bank.com"
            required
          />
          {mode === "register" && (
            <>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </>
          )}
          {mode !== "forgot" ? (
            <>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </>
          ) : !resetRequested ? (
            <></>
          ) : (
            <>
              <label style={styles.label}>Reset Token</label>
              <input
                style={styles.input}
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste the token from email"
                required
              />
              <label style={styles.label}>New Password</label>
              <input
                style={styles.input}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
                required
              />
            </>
          )}
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading
              ? mode === "login"
                ? "Signing in..."
                : mode === "register"
                ? "Creating account..."
                : "Processing..."
              : mode === "login"
              ? "Sign In"
              : mode === "register"
              ? "Create Account"
              : resetRequested
              ? "Reset Password"
              : "Send Reset Email"}
          </button>
        </form>
        <div style={styles.links}>
          {mode === "login" ? (
            <>
              <button style={styles.linkBtn} type="button" onClick={() => switchMode("register")}>Create account</button>
              <button style={styles.linkBtn} type="button" onClick={() => switchMode("forgot")}>Forgot password?</button>
            </>
          ) : mode === "forgot" && resetRequested ? (
            <button style={styles.linkBtn} type="button" onClick={() => switchMode("login")}>Back to login</button>
          ) : (
            <button style={styles.linkBtn} type="button" onClick={() => switchMode("login")}>Back to login</button>
          )}
        </div>
        {mode === "login" && (
          <div style={styles.demo}>
            <strong>Demo credentials:</strong> staff@bank.com / demo1234
          </div>
        )}
      </div>
      <p style={styles.footer}>© 2025 Vani.AI• Powered by GenAI</p>
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
  tabBar: {
    display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10, marginBottom: 20,
  },
  tab: {
    padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
    background: "#f8fafc", color: "#475569", cursor: "pointer", fontWeight: 600,
  },
  activeTab: {
    background: "#2563eb", color: "#fff", borderColor: "#2563eb",
  },
  links: { display: "flex", justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 10 },
  linkBtn: {
    border: "none", background: "transparent", color: "#2563eb", cursor: "pointer",
    fontSize: 13, textDecoration: "underline", padding: 0,
  },
  success: {
    background: "#ecfccb", border: "1px solid #bbf7d0",
    color: "#166534", padding: "10px 12px", borderRadius: 8, fontSize: 13,
  },
  demo: {
    marginTop: 20, padding: "10px 14px", background: "#f8fafc",
    borderRadius: 8, fontSize: 12, color: "#64748b", textAlign: "center",
    border: "1px dashed #cbd5e1",
  },
  footer: { marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.4)" },
};
