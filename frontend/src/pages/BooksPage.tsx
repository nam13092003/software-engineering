import type { CSSProperties } from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Book } from "../types";

export default function BooksPage() {
  const [term, setTerm] = useState("");
  const [genre, setGenre] = useState("");
  const queryClient = useQueryClient();

  const booksQuery = useQuery({
    queryKey: ["books", term, genre],
    queryFn: () =>
      api
        .get<Book[]>("/books/search", {
          params: {
            term: term || undefined,
            genre: genre || undefined
          }
        })
        .then((res) => res.data)
  });

  const borrowMutation = useMutation({
    mutationFn: (bookId: string) => api.post("/loans", { bookId }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["my-loans"] });
    }
  });

  return (
    <div style={styles.container}>
      <section style={styles.searchSection}>
        <h1 style={styles.heading}>Library catalog</h1>
        <div style={styles.filters}>
          <input
            style={styles.input}
            placeholder="Search by title, author, isbn"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Filter by genre"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          />
        </div>
      </section>

      {booksQuery.isLoading && <p>Loading books...</p>}
      {booksQuery.isError && <p style={styles.error}>Unable to load books.</p>}

      <div style={styles.grid}>
        {booksQuery.data?.map((book) => (
          <article key={book.id} style={styles.card}>
            <h2 style={styles.cardTitle}>{book.title}</h2>
            <p style={styles.cardMeta}>by {book.author}</p>
            <p style={styles.cardMeta}>Genre: {book.genre}</p>
            <p style={styles.cardMeta}>ISBN: {book.isbn}</p>
            {book.description && <p style={styles.cardDescription}>{book.description}</p>}
            <p style={styles.cardAvailability}>
              Available: {book.availableCopies} / {book.totalCopies}
            </p>
            <button
              style={styles.borrowButton}
              disabled={book.availableCopies === 0 || borrowMutation.isPending}
              onClick={() => {
                borrowMutation.reset();
                borrowMutation.mutate(book.id);
              }}
            >
              {book.availableCopies === 0 ? "Not available" : borrowMutation.isPending ? "Processing..." : "Borrow"}
            </button>
          </article>
        ))}
      </div>

      {borrowMutation.isError && <p style={styles.error}>Could not borrow the selected book.</p>}
      {borrowMutation.isSuccess && <p style={styles.success}>Borrow request recorded.</p>}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  searchSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  heading: {
    margin: 0
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem"
  },
  input: {
    flex: "1 1 220px",
    padding: "0.65rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem"
  },
  card: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  cardTitle: {
    margin: 0
  },
  cardMeta: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#475569"
  },
  cardDescription: {
    margin: 0,
    fontSize: "0.9rem"
  },
  cardAvailability: {
    marginTop: "auto",
    fontWeight: 600
  },
  borrowButton: {
    marginTop: "0.75rem",
    padding: "0.5rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600
  },
  error: {
    color: "#d14343"
  },
  success: {
    color: "#2f855a"
  }
};
