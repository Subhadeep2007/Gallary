import {
  Navigate,
  Link,
  Route,
  Routes,
} from "react-router-dom";

import useAuth from "../hooks/useAuth.js";

// ========================================
// AUTH PAGES
// ========================================

import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import VerifyEmail from "../pages/auth/VerifyEmail.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import ChangePassword from "../pages/auth/ChangePassword.jsx";
import AdminLogin from "../pages/auth/AdminLogin.jsx";
import AdminRegister from "../pages/auth/AdminRegister.jsx";

// ========================================
// LOADING SCREEN
// ========================================

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500" />

        <p className="mt-4 text-sm text-slate-400">
          Restoring your session...
        </p>
      </div>
    </div>
  );
};

// ========================================
// GUEST ROUTE
// ========================================

const GuestRoute = ({ children }) => {
  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={
          user.role === "admin"
            ? "/admin/dashboard"
            : "/gallery"
        }
        replace
      />
    );
  }

  return children;
};

// ========================================
// ANY AUTHENTICATED ROUTE
// ========================================

const AuthenticatedRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated || !user) {
    return <Navigate to={user?.role === "admin" ? "/admin/login" : "/login"} replace />;
  }

  return children;
};

const RoleRoute = ({ role, children }) => {
  const { user } = useAuth();

  if (user?.role !== role) {
    return <Navigate to={user?.role === "admin" ? "/admin/dashboard" : "/gallery"} replace />;
  }

  return children;
};

const SessionHome = ({ admin = false }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout().catch(() => {});
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-semibold">
          {admin ? "Administrator account" : "Your gallery account"}
        </h1>
        <p className="mt-3 text-slate-400">Signed in as {user?.name || user?.email}.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500" to="/change-password">
            Change password
          </Link>
          <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
};

// ========================================
// APP ROUTES
// ========================================

const AppRoutes = () => {
  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>

      {/* ========================================
          ROOT
      ======================================== */}

      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate
              to={
                user.role === "admin"
                  ? "/admin/dashboard"
                  : "/gallery"
              }
              replace
            />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* ========================================
          USER AUTH
      ======================================== */}

      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      <Route
        path="/verify-email"
        element={
          <GuestRoute>
            <VerifyEmail />
          </GuestRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        }
      />

      {/* ========================================
          ADMIN AUTH
      ======================================== */}

      <Route
        path="/admin/login"
        element={
          <GuestRoute>
            <AdminLogin />
          </GuestRoute>
        }
      />

      <Route
        path="/admin/register"
        element={
          <GuestRoute>
            <AdminRegister />
          </GuestRoute>
        }
      />

      {/* ========================================
          USER PROTECTED ROUTES
      ======================================== */}

      <Route
        path="/change-password"
        element={
          <AuthenticatedRoute>
            <ChangePassword />
          </AuthenticatedRoute>
        }
      />

      <Route
        path="/gallery"
        element={
          <AuthenticatedRoute>
            <RoleRoute role="user">
              <SessionHome />
            </RoleRoute>
          </AuthenticatedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <AuthenticatedRoute>
            <RoleRoute role="admin">
              <SessionHome admin />
            </RoleRoute>
          </AuthenticatedRoute>
        }
      />

      {/* ========================================
          FUTURE USER PANEL
          
          Dashboard
          Gallery
          Favorites
          Categories
          Trash
          Profile
          Settings
      ======================================== */}

      {/* ========================================
          FUTURE ADMIN PANEL
          
          AdminDashboard
          Users
          UserDetails
          Statistics
      ======================================== */}

      {/* ========================================
          FALLBACK
      ======================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
};

export default AppRoutes;
