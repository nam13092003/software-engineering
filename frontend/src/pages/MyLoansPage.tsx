import type { CSSProperties } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { LoanWithDetails } from "../types";

export default function MyLoansPage() {
  const queryClient = useQueryClient();
  const loansQuery = useQuery({
    queryKey: ["my-loans"],
    queryFn: () => api.get<LoanWithDetails[]>("/loans/me").then((res) => res.data)
  });

  const returnMutation = useMutation({
    mutationFn: (loanId: string) => api.post(`/loans/${loanId}/return`, {}).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-loans"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    }
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My loans</h1>
      {loansQuery.isLoading && <p>Loading loans...</p>}
      {loansQuery.isError && <p style={styles.error}>Unable to load your loans.</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Book</th>
            <th style={styles.th}>Borrowed</th>
            <th style={styles.th}>Due</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {loansQuery.data?.map((loan) => {
            const isActive = loan.status === "BORROWED";
            return (
              <tr key={loan.id}>
                <td style={styles.td}>
                  <div style={styles.bookTitle}>{loan.bookTitle}</div>
                  <div style={styles.bookMeta}>by {loan.bookAuthor}</div>
                </td>
                <td style={styles.td}>{new Date(loan.borrowedAt).toLocaleDateString()}</td>
                <td style={styles.td}>{new Date(loan.dueAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <span style={isActive ? styles.statusActive : styles.statusReturned}>{loan.status}</span>
                </td>
                <td style={styles.td}>
                  {isActive ? (
                    <button
                      style={styles.returnButton}
                      disabled={returnMutation.isPending}
                      onClick={() => {
                        returnMutation.reset();
                        returnMutation.mutate(loan.id);
                      }}
                    >
                      {returnMutation.isPending ? "Processing..." : "Return"}
                    </button>
                  ) : (
                    <span style={styles.muted}>Returned</span>
                  )}
                </td>
              </tr>
            );
          })}
          {loansQuery.data?.length === 0 && (
            <tr>
              <td style={styles.empty} colSpan={5}>
                You have not borrowed any books yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {returnMutation.isError && <p style={styles.error}>Unable to complete the return.</p>}
      {returnMutation.isSuccess && <p style={styles.success}>Book returned successfully.</p>}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
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
  bookTitle: {
    fontWeight: 600
  },
  bookMeta: {
    fontSize: "0.85rem",
    color: "#475569"
  },
  statusActive: {
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    backgroundColor: "#fbbf24",
    color: "#7c2d12",
    fontWeight: 600
  },
  statusReturned: {
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    backgroundColor: "#c4f4d7",
    color: "#2f855a",
    fontWeight: 600
  },
  returnButton: {
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600
  },
  muted: {
    color: "#94a3b8"
  },
  empty: {
    padding: "1.5rem",
    textAlign: "center",
    color: "#64748b"
  },
  error: {
    color: "#d14343"
  },
  success: {
    color: "#2f855a"
  }
};
