import type { CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import type { AuthResponse } from "../types";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>();

  const mutation = useMutation({
    mutationFn: (payload: LoginForm) => api.post<AuthResponse>("/auth/login", payload).then((res) => res.data),
    onSuccess: (data) => {
      setAuth(data);
      navigate("/books");
    }
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <div style={styles.wrapper}>
      <form onSubmit={onSubmit} style={styles.form}>
        <h1 style={styles.title}>Welcome back</h1>
        <label style={styles.label}>
          Email
          <input type="email" {...register("email", { required: "Email is required" })} style={styles.input} />
          {errors.email && <span style={styles.error}>{errors.email.message}</span>}
        </label>
        <label style={styles.label}>
          Password
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            style={styles.input}
          />
          {errors.password && <span style={styles.error}>{errors.password.message}</span>}
        </label>
        <button type="submit" style={styles.submit} disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in..." : "Sign in"}
        </button>
        {mutation.isError && <p style={styles.error}>Invalid email or password</p>}
        <p style={styles.helper}>
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh"
  },
  form: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "380px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },
  title: {
    margin: 0
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    fontSize: "0.9rem"
  },
  input: {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #d0d7de"
  },
  submit: {
    padding: "0.75rem",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#1b3a4b",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer"
  },
  helper: {
    fontSize: "0.85rem",
    textAlign: "center"
  },
  error: {
    color: "#d14343",
    fontSize: "0.8rem"
  }
};
