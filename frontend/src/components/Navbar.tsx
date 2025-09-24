import type { CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface NavItem {
  label: string;
  to: string;
  roles?: ("USER" | "ADMIN")[];
}

const navItems: NavItem[] = [
  { label: "Books", to: "/books" },
  { label: "My Loans", to: "/loans" },
  { label: "Manage Books", to: "/admin/books", roles: ["ADMIN"] },
  { label: "All Loans", to: "/admin/loans", roles: ["ADMIN"] },
  { label: "Users", to: "/admin/users", roles: ["ADMIN"] },
  { label: "Activity Logs", to: "/admin/logs", roles: ["ADMIN"] }
];

export function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const availableItems = navItems.filter((item) => {
    if (!item.roles) {
      return true;
    }

    return user ? item.roles.includes(user.role) : false;
  });

  return (
    <header style={styles.header}>
      <div style={styles.brand} onClick={() => navigate("/books")}>Mini Library</div>
      <nav style={styles.nav}>
        {availableItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              ...styles.link,
              ...(location.pathname.startsWith(item.to) ? styles.linkActive : null)
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {user && (
        <div style={styles.userBox}>
          <div style={styles.userName}>{user.name}</div>
          <div style={styles.userRole}>{user.role.toLowerCase()}</div>
          <button style={styles.logoutButton} onClick={logout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}

const styles: Record<string, CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#1b3a4b",
    color: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 10
  },
  brand: {
    fontWeight: 700,
    fontSize: "1.15rem",
    cursor: "pointer"
  },
  nav: {
    display: "flex",
    gap: "1rem",
    alignItems: "center"
  },
  link: {
    color: "#d7e9f7",
    fontWeight: 500,
    padding: "0.25rem 0.5rem"
  },
  linkActive: {
    borderBottom: "2px solid #f7b267",
    color: "#fff"
  },
  userBox: {
    display: "flex",
    alignItems: "flex-end",
    gap: "0.5rem"
  },
  userName: {
    fontWeight: 600
  },
  userRole: {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    opacity: 0.8
  },
  logoutButton: {
    border: "1px solid #fff",
    background: "transparent",
    color: "#fff",
    padding: "0.25rem 0.75rem",
    borderRadius: "4px",
    cursor: "pointer"
  }
};
