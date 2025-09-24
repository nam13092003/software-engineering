import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BooksPage from "./pages/BooksPage";
import MyLoansPage from "./pages/MyLoansPage";
import AdminBooksPage from "./pages/AdminBooksPage";
import AdminLoansPage from "./pages/AdminLoansPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminLogsPage from "./pages/AdminLogsPage";
import { useAuthStore } from "./stores/authStore";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="books" replace />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="loans" element={<MyLoansPage />} />
        <Route
          path="admin/books"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminBooksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/loans"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLoansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/logs"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
