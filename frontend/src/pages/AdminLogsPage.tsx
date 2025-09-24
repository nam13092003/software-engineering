import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { ActivityLog } from "../types";

export default function AdminLogsPage() {
  const logsQuery = useQuery({
    queryKey: ["admin-logs"],
    queryFn: () => api.get<ActivityLog[]>("/logs").then((res) => res.data)
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Activity logs</h1>
      {logsQuery.isLoading && <p>Loading logs...</p>}
      {logsQuery.isError && <p style={styles.error}>Could not load activity logs.</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>When</th>
            <th style={styles.th}>Action</th>
            <th style={styles.th}>User</th>
            <th style={styles.th}>Book</th>
            <th style={styles.th}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {logsQuery.data?.map((log) => (
            <tr key={log.id}>
              <td style={styles.td}>{new Date(log.createdAt).toLocaleString()}</td>
              <td style={styles.td}>{log.action}</td>
              <td style={styles.td}>
                <div style={styles.userName}>{log.userName ?? "N/A"}</div>
                <div style={styles.userEmail}>{log.userEmail ?? ""}</div>
              </td>
              <td style={styles.td}>{log.bookTitle ?? "-"}</td>
              <td style={styles.td}>{log.message}</td>
            </tr>
          ))}
          {logsQuery.data?.length === 0 && (
            <tr>
              <td style={styles.empty} colSpan={5}>
                No activity recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  heading: {
    margin: 0
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  },
  th: {
    textAlign: "left",
    padding: "0.75rem",
    background: "#e2e8f0",
    fontWeight: 600
  },
  td: {
    padding: "0.75rem",
    borderTop: "1px solid #e2e8f0"
  },
  userName: {
    fontWeight: 600
  },
  userEmail: {
    fontSize: "0.85rem",
    color: "#475569"
  },
  empty: {
    padding: "1.5rem",
    textAlign: "center",
    color: "#64748b"
  },
  error: {
    color: "#d14343"
  }
};
