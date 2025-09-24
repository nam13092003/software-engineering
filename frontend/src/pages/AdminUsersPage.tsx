import type { CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { User, UserRole } from "../types";

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateUserForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER"
    }
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get<User[]>("/auth/users").then((res) => res.data)
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserForm) => api.post<User>("/auth/users", payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      reset();
    }
  });

  const onSubmit = handleSubmit((values) => {
    createUserMutation.mutate(values);
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Users</h1>

      <form onSubmit={onSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <label style={styles.label}>
            Full name
            <input type="text" {...register("name", { required: "Name is required" })} style={styles.input} />
            {errors.name && <span style={styles.error}>{errors.name.message}</span>}
          </label>
          <label style={styles.label}>
            Email
            <input type="email" {...register("email", { required: "Email is required" })} style={styles.input} />
            {errors.email && <span style={styles.error}>{errors.email.message}</span>}
          </label>
          <label style={styles.label}>
            Temporary password
            <input type="password" {...register("password", { required: "Password is required" })} style={styles.input} />
            {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          </label>
          <label style={styles.label}>
            Role
            <select {...register("role")} style={styles.input}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </div>
        <button type="submit" style={styles.submit} disabled={createUserMutation.isPending}>
          {createUserMutation.isPending ? "Creating..." : "Invite user"}
        </button>
        {createUserMutation.isError && <p style={styles.error}>Unable to create user. Try another email.</p>}
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {usersQuery.data?.map((user) => (
            <tr key={user.id}>
              <td style={styles.td}>{user.name}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>{user.role}</td>
              <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {usersQuery.data?.length === 0 && (
            <tr>
              <td style={styles.empty} colSpan={4}>
                No users found.
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
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
  submit: {
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    alignSelf: "flex-start"
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
  empty: {
    padding: "1.5rem",
    textAlign: "center",
    color: "#64748b"
  }
};
