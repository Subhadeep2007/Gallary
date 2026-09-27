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
// USER PANEL
// ========================================

import UserLayout from "../layouts/UserLayout.jsx";
import Gallery from "../pages/gallery/Gallery.jsx";
import MyFiles from "../pages/gallery/MyFiles.jsx";
import Favorites from "../pages/user/Favorites.jsx";
import Trash from "../pages/user/Trash.jsx";
import Profile from "../pages/user/Profile.jsx";
import Settings from "../pages/user/Settings.jsx";
import Camera from "../pages/gallery/Camera.jsx";
import AudioRecorder from "../pages/gallery/AudioRecorder.jsx";
import PhotoEditor from "../pages/gallery/PhotoEditor.jsx";
import VideoEditor from "../pages/gallery/VideoEditor.jsx";
import AudioEditor from "../pages/gallery/AudioEditor.jsx";
import Category from "../pages/gallery/Category.jsx";


// ========================================
// ADMIN PANEL
// ========================================

import AdminLayout from "../layouts/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import AdminUserDetails from "../pages/admin/AdminUserDetails.jsx";


// ========================================
// LOADING SCREEN
// ========================================

const LoadingScreen = () => {

  return (

    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">

      <div className="text-center">

        <div
          className="
            mx-auto
            h-10
            w-10
            animate-spin
            rounded-full
            border-4
            border-slate-700
            border-t-violet-500
          "
        />

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

const GuestRoute = ({
  children
}) => {

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
// USER + ADMIN
// ========================================

const AuthenticatedRoute = ({
  children
}) => {

  const {
    loading,
    isAuthenticated,
    user,
  } = useAuth();


  if (loading) {

    return <LoadingScreen />;

  }


  if (!isAuthenticated || !user) {

    return (

      <Navigate

        to="/login"

        replace

      />

    );

  }


  return children;

};


// ========================================
// ROLE ROUTE
// ========================================

const RoleRoute = ({
  role,
  children
}) => {

  const {
    user,
    loading,
    isAuthenticated
  } = useAuth();


  if (loading) {

    return <LoadingScreen />;

  }


  if (!isAuthenticated || !user) {

    return (

      <Navigate

        to={
          role === "admin"
            ? "/admin/login"
            : "/login"
        }

        replace

      />

    );

  }


  if (user.role !== role) {

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
// ADMIN ROUTE
// ONLY ADMIN
// ========================================

const AdminRoute = ({
  children
}) => {

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();


  if (loading) {

    return <LoadingScreen />;

  }


  // Not logged in
  if (!isAuthenticated || !user) {

    return (

      <Navigate

        to="/admin/login"

        replace

      />

    );

  }


  // Logged in but not admin
  if (user.role !== "admin") {

    return (

      <Navigate

        to="/gallery"

        replace

      />

    );

  }


  return children;

};


// ========================================
// SESSION HOME
// ========================================

const SessionHome = ({
  admin = false
}) => {

  const {
    user,
    logout
  } = useAuth();


  const handleLogout = async () => {

    await logout().catch(() => {});

  };


  return (

    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-950
        px-4
        text-white
      "
    >

      <section
        className="
          w-full
          max-w-lg
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-8
          text-center
        "
      >

        <h1 className="text-2xl font-semibold">

          {
            admin
              ? "Administrator account"
              : "Your gallery account"
          }

        </h1>


        <p className="mt-3 text-slate-400">

          Signed in as{" "}

          {
            user && (
              user.name ||
              user.email
            )
          }

          .

        </p>


        <div className="mt-7 flex flex-wrap justify-center gap-3">

          <Link
            className="
              rounded-lg
              bg-violet-600
              px-4
              py-2
              text-sm
              font-medium
              hover:bg-violet-500
            "
            to="/change-password"
          >
            Change password
          </Link>


          <button

            className="
              rounded-lg
              border
              border-slate-700
              px-4
              py-2
              text-sm
              text-slate-300
              hover:border-slate-500
            "

            onClick={handleLogout}

          >
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

          isAuthenticated && user

            ? (

              <Navigate

                to={
                  user.role === "admin"
                    ? "/admin/dashboard"
                    : "/gallery"
                }

                replace

              />

            )

            : (

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
          COMMON ACCOUNT ROUTES
          USER + ADMIN
      ======================================== */}

      <Route

        path="/profile"

        element={

          <AuthenticatedRoute>

            <Profile />

          </AuthenticatedRoute>

        }

      />


      <Route

        path="/settings"

        element={

          <AuthenticatedRoute>

            <Settings />

          </AuthenticatedRoute>

        }

      />


      <Route

        path="/change-password"

        element={

          <AuthenticatedRoute>

            <ChangePassword />

          </AuthenticatedRoute>

        }

      />


      {/* ========================================
          USER PANEL
      ======================================== */}

      <Route

        path="/gallery"

        element={

          <AuthenticatedRoute>

            <RoleRoute role="user">

              <UserLayout />

            </RoleRoute>

          </AuthenticatedRoute>

        }

      >

        {/* ========================================
            GALLERY DASHBOARD
        ======================================== */}

        <Route

          index

          element={<Gallery />}

        />


        {/* ========================================
            MY FILES
        ======================================== */}

        <Route

          path="files"

          element={<MyFiles />}

        />


        {/* ========================================
            FAVORITES
        ======================================== */}

        <Route

          path="favorites"

          element={<Favorites />}

        />


        {/* ========================================
            TRASH
        ======================================== */}

        <Route

          path="trash"

          element={<Trash />}

        />


        {/* ========================================
            CATEGORIES
        ======================================== */}

        <Route

          path="categories"

          element={<Category />}

        />


        {/* ========================================
            CAMERA
        ======================================== */}

        <Route

          path="camera"

          element={<Camera />}

        />


        {/* ========================================
            AUDIO RECORDER
        ======================================== */}

        <Route

          path="audio-recorder"

          element={<AudioRecorder />}

        />


        {/* ========================================
            PHOTO EDITOR
        ======================================== */}

        <Route

          path="photo-editor"

          element={<PhotoEditor />}

        />


        {/* ========================================
            VIDEO EDITOR
        ======================================== */}

        <Route

          path="video-editor"

          element={<VideoEditor />}

        />


        {/* ========================================
            AUDIO EDITOR
        ======================================== */}

        <Route

          path="audio-editor"

          element={<AudioEditor />}

        />

      </Route>


      {/* ========================================
          ADMIN PANEL
          ONLY ADMIN
      ======================================== */}

      <Route

        path="/admin"

        element={

          <AdminRoute>

            <AdminLayout />

          </AdminRoute>

        }

      >

        <Route

          index

          element={

            <Navigate

              to="/admin/dashboard"

              replace

            />

          }

        />


        <Route

          path="dashboard"

          element={

            <AdminDashboard />

          }

        />


        <Route

          path="dashboard/users"

          element={

            <AdminUsers />

          }

        />


        <Route

          path="dashboard/users/:userId"

          element={

            <AdminUserDetails />

          }

        />

      </Route>


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