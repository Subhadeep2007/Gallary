import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  Menu,
  X,
  Image,
  Heart,
  Trash2,
  User,
  Settings,
  LogOut,
  Home,
  FolderOpen,
  Tag,
  Camera,
  Mic,
  ImagePlus,
  Video,
  Music2,
} from "lucide-react";

import useAuth from "../hooks/useAuth.js";


const UserLayout = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const {
    user,
    logout
  } = useAuth();


  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = async () => {

    await logout();

    navigate("/login");

  };


  // ========================================
  // WORKSPACE NAVIGATION
  // ========================================

  const navItems = [

    {
      name: "Dashboard",
      path: "/gallery",
      icon: Home,
    },

    {
      name: "My Files",
      path: "/gallery/files",
      icon: FolderOpen,
    },

    {
      name: "Categories",
      path: "/gallery/categories",
      icon: Tag,
    },

    {
      name: "Favorites",
      path: "/gallery/favorites",
      icon: Heart,
    },

    {
      name: "Trash",
      path: "/gallery/trash",
      icon: Trash2,
    },

  ];


  // ========================================
  // TOOLS
  // ========================================

  const toolItems = [

    {
      name: "Camera",
      path: "/gallery/camera",
      icon: Camera,
    },

    {
      name: "Audio Recorder",
      path: "/gallery/audio-recorder",
      icon: Mic,
    },

    {
      name: "Photo Editor",
      path: "/gallery/photo-editor",
      icon: ImagePlus,
    },

    {
      name: "Video Editor",
      path: "/gallery/video-editor",
      icon: Video,
    },

    {
      name: "Audio Editor",
      path: "/gallery/audio-editor",
      icon: Music2,
    },

  ];


  // ========================================
  // ACCOUNT
  // ========================================

  const accountItems = [

    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },

    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },

  ];


  // ========================================
  // CLOSE SIDEBAR
  // ========================================

  const closeSidebar = () => {

    setSidebarOpen(false);

  };


  // ========================================
  // USER INITIAL
  // ========================================

  let userInitial = "U";

  if (user && user.name) {

    userInitial =
      user.name
        .charAt(0)
        .toUpperCase();

  }


  // ========================================
  // USER NAME
  // ========================================

  let userName = "User";

  if (user && user.name) {

    userName = user.name;

  }


  // ========================================
  // USER EMAIL
  // ========================================

  let userEmail = "user@example.com";

  if (user && user.email) {

    userEmail = user.email;

  }


  return (

    <div className="min-h-screen bg-slate-950 text-white">


      {/* ========================================
          MOBILE OVERLAY
      ======================================== */}

      {sidebarOpen && (

        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeSidebar}
        />

      )}


      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >


        {/* ========================================
            LOGO
        ======================================== */}

        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">

          <button
            onClick={() => navigate("/gallery")}
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">

              <Image size={22} />

            </div>


            <div className="text-left">

              <h1 className="text-lg font-bold">
                Digital Gallery
              </h1>

              <p className="text-xs text-slate-500">
                Private Workspace
              </p>

            </div>

          </button>


          {/* ========================================
              MOBILE CLOSE
          ======================================== */}

          <button
            onClick={closeSidebar}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >

            <X size={20} />

          </button>

        </div>


        {/* ========================================
            NAVIGATION
        ======================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-6">


          {/* ========================================
              WORKSPACE
          ======================================== */}

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>


          <nav className="space-y-1">

            {navItems.map((item) => {

              const Icon = item.icon;


              return (

                <NavLink
                  key={item.path}
                  to={item.path}
                  end={
                    item.path === "/gallery"
                  }
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >

                  <Icon size={19} />

                  <span>
                    {item.name}
                  </span>

                </NavLink>

              );

            })}

          </nav>


          {/* ========================================
              TOOLS
          ======================================== */}

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tools
          </p>


          <nav className="space-y-1">

            {toolItems.map((item) => {

              const Icon = item.icon;


              return (

                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >

                  <Icon size={19} />

                  <span>
                    {item.name}
                  </span>

                </NavLink>

              );

            })}

          </nav>


          {/* ========================================
              ACCOUNT
          ======================================== */}

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>


          <nav className="space-y-1">

            {accountItems.map((item) => {

              const Icon = item.icon;


              return (

                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >

                  <Icon size={19} />

                  <span>
                    {item.name}
                  </span>

                </NavLink>

              );

            })}

          </nav>

        </div>


        {/* ========================================
            USER SECTION
        ======================================== */}

        <div className="border-t border-slate-800 p-4">


          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-900 p-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-sm font-bold">

              {user && user.profileImage ? (

                <img
                  src={user.profileImage}
                  alt={
                    userName
                  }
                  className="h-full w-full object-cover"
                />

              ) : (

                userInitial

              )}

            </div>


            <div className="min-w-0">

              <p className="truncate text-sm font-semibold">
                {userName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {userEmail}
              </p>

            </div>

          </div>


          {/* ========================================
              LOGOUT
          ======================================== */}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          >

            <LogOut size={19} />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* ========================================
          MAIN AREA
      ======================================== */}

      <div className="lg:ml-72">


        {/* ========================================
            TOPBAR
        ======================================== */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">


          <div className="flex items-center gap-3">


            {/* ========================================
                MOBILE MENU
            ======================================== */}

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-300 hover:text-white lg:hidden"
            >

              <Menu size={20} />

            </button>


            <div className="lg:hidden">

              <h2 className="text-sm font-semibold">
                Digital Gallery
              </h2>

            </div>

          </div>


          {/* ========================================
              TOPBAR PROFILE
          ======================================== */}

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-900"
          >


            <div className="hidden text-right sm:block">

              <p className="text-sm font-medium">
                {userName}
              </p>

              <p className="text-xs text-slate-500">
                Personal Account
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-indigo-600 font-semibold">

              {user && user.profileImage ? (

                <img
                  src={user.profileImage}
                  alt={
                    userName
                  }
                  className="h-full w-full object-cover"
                />

              ) : (

                userInitial

              )}

            </div>

          </button>

        </header>


        {/* ========================================
            PAGE CONTENT
        ======================================== */}

        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">

          <Outlet />

        </main>

      </div>

    </div>

  );

};


export default UserLayout;