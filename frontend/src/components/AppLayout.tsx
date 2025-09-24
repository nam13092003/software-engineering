import type { CSSProperties } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function AppLayout() {
  return (
    <div style={styles.wrapper}>
      <Navbar />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  main: {
    flex: 1,
    padding: "1.5rem",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%"
  }
};
