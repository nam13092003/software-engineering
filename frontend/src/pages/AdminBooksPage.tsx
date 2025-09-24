import type { CSSProperties } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Book, BookPayload } from "../types";

export default function AdminBooksPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Book | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BookPayload>({
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      isbn: "",
      totalCopies: 1,
      description: ""
    }
  });

  const booksQuery = useQuery({
    queryKey: ["admin-books"],
    queryFn: () => api.get<Book[]>("/books").then((res) => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (payload: BookPayload) => api.post("/books", payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<BookPayload> }) =>
      api.put(`/books/${payload.id}`, payload.data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setEditing(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/books/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    }
  });

  const onSubmit = handleSubmit((values) => {
    const payload: BookPayload = {
      ...values,
      totalCopies: Number(values.totalCopies)
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  });

  const onEdit = (book: Book) => {
    setEditing(book);
    reset({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      totalCopies: book.totalCopies,
      description: book.description ?? ""
    });
  };

  const onCancelEdit = () => {
    setEditing(null);
    reset();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Manage books</h1>

      <form onSubmit={onSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <label style={styles.label}>
            Title
            <input type="text" {...register("title", { required: "Title is required" })} style={styles.input} />
            {errors.title && <span style={styles.error}>{errors.title.message}</span>}
          </label>
          <label style={styles.label}>
            Author
            <input type="text" {...register("author", { required: "Author is required" })} style={styles.input} />
            {errors.author && <span style={styles.error}>{errors.author.message}</span>}
          </label>
        </div>
        <div style={styles.formRow}>
          <label style={styles.label}>
            Genre
            <input type="text" {...register("genre", { required: "Genre is required" })} style={styles.input} />
            {errors.genre && <span style={styles.error}>{errors.genre.message}</span>}
          </label>
          <label style={styles.label}>
            ISBN
            <input type="text" {...register("isbn", { required: "ISBN is required" })} style={styles.input} />
            {errors.isbn && <span style={styles.error}>{errors.isbn.message}</span>}
          </label>
          <label style={styles.label}>
            Total copies
            <input
              type="number"
              {...register("totalCopies", { valueAsNumber: true, min: { value: 0, message: ">= 0" } })}
              style={styles.input}
            />
            {errors.totalCopies && <span style={styles.error}>{errors.totalCopies.message}</span>}
          </label>
        </div>
        <label style={styles.label}>
          Description
          <textarea {...register("description")} style={styles.textarea} rows={3} />
        </label>
        <div style={styles.formActions}>
          <button type="submit" style={styles.submit} disabled={createMutation.isPending || updateMutation.isPending}>
            {editing ? "Update book" : "Add book"}
          </button>
          {editing && (
            <button type="button" style={styles.cancel} onClick={onCancelEdit}>
              Cancel edit
            </button>
          )}
        </div>
        {(createMutation.isError || updateMutation.isError) && (
          <p style={styles.error}>Unable to save the book. Please check the fields.</p>
        )}
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Author</th>
            <th style={styles.th}>Genre</th>
            <th style={styles.th}>Available</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {booksQuery.data?.map((book) => (
            <tr key={book.id}>
              <td style={styles.td}>{book.title}</td>
              <td style={styles.td}>{book.author}</td>
              <td style={styles.td}>{book.genre}</td>
              <td style={styles.td}>
                {book.availableCopies} / {book.totalCopies}
              </td>
              <td style={styles.td}>
                <div style={styles.rowActions}>
                  <button style={styles.smallButton} onClick={() => onEdit(book)}>
                    Edit
                  </button>
                  <button
                    style={styles.dangerButton}
                    onClick={() => deleteMutation.mutate(book.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {booksQuery.data?.length === 0 && (
            <tr>
              <td style={styles.empty} colSpan={5}>
                No books found.
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
  form: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem"
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  input: {
    padding: "0.6rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1"
  },
  textarea: {
    padding: "0.6rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1"
  },
  formActions: {
    display: "flex",
    gap: "0.75rem"
  },
  submit: {
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer"
  },
  cancel: {
    padding: "0.6rem 1rem",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer"
  },
  error: {
    color: "#d14343",
    fontSize: "0.85rem"
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
  rowActions: {
    display: "flex",
    gap: "0.5rem"
  },
  smallButton: {
    padding: "0.4rem 0.7rem",
    borderRadius: "6px",
    border: "1px solid #2563eb",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer"
  },
  dangerButton: {
    padding: "0.4rem 0.7rem",
    borderRadius: "6px",
    border: "1px solid #d14343",
    background: "transparent",
    color: "#d14343",
    cursor: "pointer"
  },
  empty: {
    padding: "1.5rem",
    textAlign: "center",
    color: "#64748b"
  }
};
