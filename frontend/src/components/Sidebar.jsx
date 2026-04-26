import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/assistant", icon: "🎙️", label: "Live Assistant" },
  { path: "/history", icon: "📋", label: "History" },
  { path: "/analytics", icon: "📈", label: "Analytics" },
  { path: "/settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={styles.footer}>
        <div style={styles.versionTag}>v2.0 • GenAI Powered</div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220,
    minHeight: "calc(100vh - 64px)",
    background: "#0d1f3c",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "16px 0",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },
  nav: { display: "flex", flexDirection: "column", gap: 2 },
  link: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 20px", color: "#90caf9", textDecoration: "none",
    fontSize: 14, fontWeight: 500, transition: "all 0.2s",
    borderLeft: "3px solid transparent",
  },
  activeLink: {
    color: "#fff", background: "rgba(79,195,247,0.12)",
    borderLeft: "3px solid #4fc3f7",
  },
  icon: { fontSize: 18 },
  label: {},
  footer: { padding: "16px 20px" },
  versionTag: { fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5 },
};
