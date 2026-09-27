import {
    Link,
    NavLink,
    Outlet
} from "react-router-dom";

import useAuth from "../hooks/useAuth.js";

import {
    LayoutDashboard,
    Users,
    UserRound,
    Settings,
    KeyRound,
    LogOut,
    ShieldCheck
} from "lucide-react";


const AdminLayout = () => {

    const {
        user,
        logout
    } = useAuth();


    const handleLogout = async() => {

        try {

            await logout();

        } catch (error) {

            console.error(
                "Admin logout error:",
                error
            );

        }

    };


    const navigation = [

        {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard
        },

        {
            label: "User Accounts",
            path: "/admin/dashboard/users",
            icon: Users
        }

    ];


    const userName =
        user && user.name
            ? user.name
            : "Administrator";


    const userEmail =
        user && user.email
            ? user.email
            : "Admin account";


    const userInitial =
        userName.charAt(0).toUpperCase();


    return (

        <div
            className="
                min-h-screen
                bg-[#070b12]
                text-white
            "
        >

            {/* ========================================
                BACKGROUND
            ======================================== */}

            <div
                className="
                    pointer-events-none
                    fixed
                    inset-0
                    overflow-hidden
                "
            >

                <div
                    className="
                        absolute
                        -left-48
                        top-20
                        h-[28rem]
                        w-[28rem]
                        rounded-full
                        bg-cyan-500/10
                        blur-[140px]
                    "
                />

                <div
                    className="
                        absolute
                        -right-48
                        top-[45%]
                        h-[28rem]
                        w-[28rem]
                        rounded-full
                        bg-blue-500/10
                        blur-[140px]
                    "
                />

            </div>


            <div
                className="
                    relative
                    flex
                    min-h-screen
                "
            >

                {/* ========================================
                    SIDEBAR
                ======================================== */}

                <aside
                    className="
                        hidden
                        w-72
                        shrink-0
                        border-r
                        border-white/10
                        bg-[#0a0f18]/90
                        backdrop-blur-xl
                        lg:flex
                        lg:flex-col
                    "
                >

                    <div
                        className="
                            border-b
                            border-white/10
                            px-6
                            py-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-cyan-400/20
                                    bg-cyan-400/10
                                    text-cyan-300
                                "
                            >
                                <ShieldCheck
                                    size={21}
                                />
                            </div>

                            <div>

                                <p
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.24em]
                                        text-cyan-400
                                    "
                                >
                                    Admin Console
                                </p>

                                <h1
                                    className="
                                        mt-1
                                        text-lg
                                        font-black
                                        tracking-tight
                                    "
                                >
                                    Digital Gallery
                                </h1>

                            </div>

                        </div>

                    </div>


                    {/* ========================================
                        NAVIGATION
                    ======================================== */}

                    <nav
                        className="
                            flex-1
                            px-4
                            py-5
                        "
                    >

                        <p
                            className="
                                mb-3
                                px-3
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.22em]
                                text-slate-600
                            "
                        >
                            Management
                        </p>


                        <div
                            className="
                                space-y-2
                            "
                        >

                            {navigation.map((item) => {

                                const Icon =
                                    item.icon;

                                return (

                                    <NavLink
                                        key={
                                            item.path
                                        }
                                        to={
                                            item.path
                                        }
                                        end={
                                            item.path ===
                                            "/admin/dashboard"
                                        }
                                        className={({
                                            isActive
                                        }) => `

                                            flex
                                            items-center
                                            gap-3
                                            rounded-xl
                                            px-4
                                            py-3
                                            text-sm
                                            font-semibold
                                            transition

                                            ${
                                                isActive

                                                    ? `
                                                        border
                                                        border-cyan-400/20
                                                        bg-cyan-400/10
                                                        text-cyan-300
                                                        shadow-lg
                                                        shadow-cyan-500/5
                                                    `

                                                    : `
                                                        text-slate-400
                                                        hover:bg-white/[0.04]
                                                        hover:text-white
                                                    `
                                            }

                                        `}
                                    >

                                        <Icon
                                            size={18}
                                        />

                                        <span>
                                            {
                                                item.label
                                            }
                                        </span>

                                    </NavLink>

                                );

                            })}

                        </div>

                    </nav>


                    {/* ========================================
                        ADMIN ACCOUNT
                    ======================================== */}

                    <div
                        className="
                            border-t
                            border-white/10
                            p-4
                        "
                    >

                        <div
                            className="
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/[0.03]
                                p-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-cyan-400/20
                                        bg-cyan-400/10
                                        text-sm
                                        font-black
                                        text-cyan-300
                                    "
                                >
                                    {
                                        userInitial
                                    }
                                </div>

                                <div
                                    className="
                                        min-w-0
                                    "
                                >

                                    <p
                                        className="
                                            truncate
                                            text-sm
                                            font-semibold
                                            text-white
                                        "
                                    >
                                        {
                                            userName
                                        }
                                    </p>

                                    <p
                                        className="
                                            mt-0.5
                                            truncate
                                            text-xs
                                            text-slate-500
                                        "
                                    >
                                        {
                                            userEmail
                                        }
                                    </p>

                                </div>

                            </div>


                            <div
                                className="
                                    mt-4
                                    grid
                                    grid-cols-3
                                    gap-2
                                "
                            >

                                <Link
                                    to="/profile"
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-white/10
                                        bg-white/[0.03]
                                        py-2
                                        text-slate-400
                                        transition
                                        hover:border-cyan-400/20
                                        hover:text-cyan-300
                                    "
                                    title="Profile"
                                >
                                    <UserRound
                                        size={16}
                                    />
                                </Link>


                                <Link
                                    to="/settings"
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-white/10
                                        bg-white/[0.03]
                                        py-2
                                        text-slate-400
                                        transition
                                        hover:border-cyan-400/20
                                        hover:text-cyan-300
                                    "
                                    title="Settings"
                                >
                                    <Settings
                                        size={16}
                                    />
                                </Link>


                                <Link
                                    to="/change-password"
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-white/10
                                        bg-white/[0.03]
                                        py-2
                                        text-slate-400
                                        transition
                                        hover:border-cyan-400/20
                                        hover:text-cyan-300
                                    "
                                    title="Change Password"
                                >
                                    <KeyRound
                                        size={16}
                                    />
                                </Link>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleLogout
                                }
                                className="
                                    mt-3
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-red-400/10
                                    bg-red-400/[0.03]
                                    px-3
                                    py-2.5
                                    text-xs
                                    font-semibold
                                    text-red-300
                                    transition
                                    hover:border-red-400/20
                                    hover:bg-red-400/10
                                "
                            >

                                <LogOut
                                    size={15}
                                />

                                Logout

                            </button>

                        </div>

                    </div>

                </aside>


                {/* ========================================
                    MAIN
                ======================================== */}

                <main
                    className="
                        min-w-0
                        flex-1
                    "
                >

                    <header
                        className="
                            sticky
                            top-0
                            z-40
                            border-b
                            border-white/10
                            bg-[#070b12]/90
                            px-4
                            py-4
                            backdrop-blur-xl
                            sm:px-6
                            lg:px-8
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-4
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.22em]
                                        text-cyan-400
                                    "
                                >
                                    Administration
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-white
                                    "
                                >
                                    Digital Gallery Control Center
                                </p>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <Link
                                    to="/profile"
                                    className="
                                        hidden
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-white/[0.03]
                                        px-3
                                        py-2
                                        text-xs
                                        font-semibold
                                        text-slate-300
                                        transition
                                        hover:border-cyan-400/20
                                        hover:text-cyan-300
                                        sm:inline-flex
                                    "
                                >
                                    Profile
                                </Link>


                                <Link
                                    to="/settings"
                                    className="
                                        hidden
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-white/[0.03]
                                        px-3
                                        py-2
                                        text-xs
                                        font-semibold
                                        text-slate-300
                                        transition
                                        hover:border-cyan-400/20
                                        hover:text-cyan-300
                                        sm:inline-flex
                                    "
                                >
                                    Settings
                                </Link>

                            </div>

                        </div>


                        {/* ========================================
                            MOBILE NAV
                        ======================================== */}

                        <div
                            className="
                                mt-4
                                flex
                                gap-2
                                overflow-x-auto
                                lg:hidden
                            "
                        >

                            {navigation.map((item) => {

                                const Icon =
                                    item.icon;

                                return (

                                    <NavLink
                                        key={
                                            item.path
                                        }
                                        to={
                                            item.path
                                        }
                                        end={
                                            item.path ===
                                            "/admin/dashboard"
                                        }
                                        className={({
                                            isActive
                                        }) => `

                                            flex
                                            shrink-0
                                            items-center
                                            gap-2
                                            rounded-xl
                                            px-3
                                            py-2
                                            text-xs
                                            font-semibold
                                            transition

                                            ${
                                                isActive
                                                    ? "bg-cyan-400/10 text-cyan-300"
                                                    : "bg-white/[0.03] text-slate-400"
                                            }

                                        `}
                                    >

                                        <Icon
                                            size={15}
                                        />

                                        {
                                            item.label
                                        }

                                    </NavLink>

                                );

                            })}

                        </div>

                    </header>


                    <div
                        className="
                            relative
                            mx-auto
                            w-full
                            max-w-[1500px]
                            p-4
                            sm:p-6
                            lg:p-8
                        "
                    >

                        <Outlet />

                    </div>

                </main>

            </div>

        </div>

    );

};


export default AdminLayout;
