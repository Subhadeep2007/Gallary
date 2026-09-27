import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    File,
    Image,
    Video,
    FileText,
    Trash2,
    RefreshCw,
    LayoutDashboard,
    ArrowRight
} from "lucide-react";

import {
    toast
} from "react-hot-toast";

import {
    getAdminDashboard
} from "../../services/admin/admin.service.js";


const initialStats = {

    users: {
        total: 0,
        active: 0,
        inactive: 0,
        deleted: 0,
        verified: 0
    },

    files: {
        total: 0,
        images: 0,
        videos: 0,
        pdfs: 0,
        deleted: 0
    }

};


const AdminDashboard = () => {

    const [
        stats,
        setStats
    ] = useState(initialStats);


    const [
        loading,
        setLoading
    ] = useState(true);


    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    const loadDashboard = async () => {

        try {

            setLoading(true);

            const response =
                await getAdminDashboard();


            let dashboardData = null;


            if (
                response &&
                response.users
            ) {

                dashboardData =
                    response;

            } else if (
                response &&
                response.data &&
                response.data.users
            ) {

                dashboardData =
                    response.data;

            } else if (
                response &&
                response.data &&
                response.data.data &&
                response.data.data.users
            ) {

                dashboardData =
                    response.data.data;
            }


            if (dashboardData) {

                setStats({
                    ...initialStats,
                    ...dashboardData,
                    users: {
                        ...initialStats.users,
                        ...dashboardData.users
                    },
                    files: {
                        ...initialStats.files,
                        ...dashboardData.files
                    }
                });

            }

        } catch (error) {

            console.error(
                "Admin Dashboard Error:",
                error
            );


            let message =
                "Failed to load dashboard";


            if (
                error &&
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {

                message =
                    error.response.data.message;
            }


            toast.error(message);

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadDashboard();

    }, []);


    // ==========================================
    // FORMAT NUMBER
    // ==========================================

    const formatNumber = (value) => {

        if (
            typeof value !== "number"
        ) {

            return "0";
        }

        return value.toLocaleString(
            "en-IN"
        );
    };


    // ==========================================
    // STAT CARD
    // ==========================================

    const StatCard = ({
        title,
        value,
        icon,
        description,
        href
    }) => {

        return (

            <Link
                to={href}
                className="
                    group
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.025]
                    p-5
                    transition
                    duration-200
                    hover:-translate-y-1
                    hover:border-cyan-400/20
                    hover:bg-white/[0.04]
                "
            >

                <div className="
                    flex
                    items-start
                    justify-between
                    gap-4
                ">

                    <div className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-cyan-400/10
                        bg-cyan-400/5
                        text-cyan-300
                    ">

                        {icon}

                    </div>


                    <ArrowRight
                        size={17}
                        className="
                            text-slate-700
                            transition
                            group-hover:translate-x-1
                            group-hover:text-cyan-400
                        "
                    />

                </div>


                <p className="
                    mt-5
                    text-xs
                    font-medium
                    text-slate-500
                ">
                    {title}
                </p>


                <p className="
                    mt-2
                    text-3xl
                    font-black
                    tracking-tight
                    text-white
                ">
                    {
                        loading
                            ? "—"
                            : formatNumber(value)
                    }
                </p>


                <p className="
                    mt-2
                    text-xs
                    text-slate-600
                ">
                    {description}
                </p>

            </Link>

        );
    };


    // ==========================================
    // PROGRESS ITEM
    // ==========================================

    const ProgressItem = ({
        label,
        value,
        total,
        icon
    }) => {

        let percentage = 0;


        if (
            total > 0
        ) {

            percentage =
                Math.round(
                    (value / total) * 100
                );
        }


        return (

            <div>

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-4
                ">

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-white/[0.04]
                            text-slate-400
                        ">

                            {icon}

                        </div>


                        <span className="
                            text-sm
                            font-medium
                            text-slate-300
                        ">
                            {label}
                        </span>

                    </div>


                    <span className="
                        text-sm
                        font-bold
                        text-white
                    ">
                        {
                            loading
                                ? "—"
                                : formatNumber(value)
                        }
                    </span>

                </div>


                <div className="
                    mt-3
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-white/[0.05]
                ">

                    <div
                        className="
                            h-full
                            rounded-full
                            bg-cyan-400
                            transition-all
                            duration-500
                        "
                        style={{
                            width:
                                loading
                                    ? "0%"
                                    : `${percentage}%`
                        }}
                    />

                </div>


                <p className="
                    mt-1.5
                    text-[11px]
                    text-slate-600
                ">
                    {percentage}% of active files
                </p>

            </div>

        );
    };


    return (

        <div className="
            mx-auto
            w-full
            max-w-7xl
        ">


            {/* ========================================
                HEADER
            ======================================== */}

            <div className="
                mb-8
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-end
                sm:justify-between
            ">

                <div>

                    <div className="
                        mb-2
                        flex
                        items-center
                        gap-2
                    ">

                        <LayoutDashboard
                            size={16}
                            className="text-cyan-400"
                        />

                        <span className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                            text-cyan-400
                        ">
                            Administration
                        </span>

                    </div>


                    <h1 className="
                        text-3xl
                        font-black
                        tracking-tight
                        text-white
                    ">
                        Admin Dashboard
                    </h1>


                    <p className="
                        mt-2
                        max-w-2xl
                        text-sm
                        leading-6
                        text-slate-500
                    ">
                        Overview of users and files across
                        the Digital Gallery platform.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={loadDashboard}
                    disabled={loading}
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-300
                        transition
                        hover:border-cyan-400/20
                        hover:text-cyan-300
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >

                    <RefreshCw
                        size={16}
                        className={
                            loading
                                ? "animate-spin"
                                : ""
                        }
                    />

                    {
                        loading
                            ? "Refreshing..."
                            : "Refresh"
                    }

                </button>

            </div>


            {/* ========================================
                USER STATISTICS
            ======================================== */}

            <div className="
                mb-7
            ">

                <div className="
                    mb-4
                    flex
                    items-center
                    justify-between
                ">

                    <div>

                        <h2 className="
                            text-lg
                            font-bold
                            text-white
                        ">
                            Users
                        </h2>


                        <p className="
                            mt-1
                            text-xs
                            text-slate-600
                        ">
                            User account overview
                        </p>

                    </div>


                    <Link
                        to="/admin/users"
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            text-xs
                            font-semibold
                            text-cyan-400
                            transition
                            hover:text-cyan-300
                        "
                    >
                        Manage Users

                        <ArrowRight size={14} />

                    </Link>

                </div>


                <div className="
                    grid
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                ">

                    <StatCard
                        title="Total Users"
                        value={
                            stats.users.total
                        }
                        icon={
                            <Users size={19} />
                        }
                        description="
                            Registered user accounts
                        "
                        href="/admin/users"
                    />


                    <StatCard
                        title="Active Users"
                        value={
                            stats.users.active
                        }
                        icon={
                            <UserCheck size={19} />
                        }
                        description="
                            Currently active accounts
                        "
                        href="/admin/users"
                    />


                    <StatCard
                        title="Inactive Users"
                        value={
                            stats.users.inactive
                        }
                        icon={
                            <UserX size={19} />
                        }
                        description="
                            Currently inactive accounts
                        "
                        href="/admin/users"
                    />


                    <StatCard
                        title="Verified Users"
                        value={
                            stats.users.verified
                        }
                        icon={
                            <ShieldCheck size={19} />
                        }
                        description="
                            Email verified accounts
                        "
                        href="/admin/users"
                    />

                </div>

            </div>


            {/* ========================================
                FILE STATISTICS
            ======================================== */}

            <div className="
                mb-7
            ">

                <div className="
                    mb-4
                ">

                    <h2 className="
                        text-lg
                        font-bold
                        text-white
                    ">
                        Gallery Files
                    </h2>


                    <p className="
                        mt-1
                        text-xs
                        text-slate-600
                    ">
                        Platform file overview
                    </p>

                </div>


                <div className="
                    grid
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                ">

                    <StatCard
                        title="Total Files"
                        value={
                            stats.files.total
                        }
                        icon={
                            <File size={19} />
                        }
                        description="
                            Active gallery files
                        "
                        href="/admin/statistics"
                    />


                    <StatCard
                        title="Images"
                        value={
                            stats.files.images
                        }
                        icon={
                            <Image size={19} />
                        }
                        description="
                            Image files in gallery
                        "
                        href="/admin/statistics"
                    />


                    <StatCard
                        title="Videos"
                        value={
                            stats.files.videos
                        }
                        icon={
                            <Video size={19} />
                        }
                        description="
                            Video files in gallery
                        "
                        href="/admin/statistics"
                    />


                    <StatCard
                        title="PDF Files"
                        value={
                            stats.files.pdfs
                        }
                        icon={
                            <FileText size={19} />
                        }
                        description="
                            PDF documents in gallery
                        "
                        href="/admin/statistics"
                    />

                </div>

            </div>


            {/* ========================================
                DETAIL AREA
            ======================================== */}

            <div className="
                grid
                gap-6
                lg:grid-cols-2
            ">


                {/* ====================================
                    USER ACCOUNT STATUS
                ==================================== */}

                <div className="
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/[0.025]
                    p-6
                ">

                    <div className="
                        mb-6
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <h2 className="
                                text-base
                                font-bold
                                text-white
                            ">
                                User Account Status
                            </h2>


                            <p className="
                                mt-1
                                text-xs
                                text-slate-600
                            ">
                                Current account distribution
                            </p>

                        </div>


                        <Users
                            size={18}
                            className="text-cyan-400"
                        />

                    </div>


                    <div className="
                        space-y-5
                    ">


                        <ProgressItem
                            label="Active"
                            value={
                                stats.users.active
                            }
                            total={
                                stats.users.total
                            }
                            icon={
                                <UserCheck size={17} />
                            }
                        />


                        <ProgressItem
                            label="Inactive"
                            value={
                                stats.users.inactive
                            }
                            total={
                                stats.users.total
                            }
                            icon={
                                <UserX size={17} />
                            }
                        />


                        <ProgressItem
                            label="Verified"
                            value={
                                stats.users.verified
                            }
                            total={
                                stats.users.total
                            }
                            icon={
                                <ShieldCheck size={17} />
                            }
                        />

                    </div>


                    <div className="
                        mt-6
                        rounded-2xl
                        border
                        border-red-400/10
                        bg-red-400/[0.025]
                        p-4
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                            ">

                                <Trash2
                                    size={17}
                                    className="text-red-300"
                                />

                                <div>

                                    <p className="
                                        text-xs
                                        text-slate-500
                                    ">
                                        Deleted Accounts
                                    </p>

                                    <p className="
                                        mt-1
                                        text-lg
                                        font-bold
                                        text-white
                                    ">
                                        {
                                            loading
                                                ? "—"
                                                : formatNumber(
                                                    stats.users.deleted
                                                )
                                        }
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ====================================
                    FILE BREAKDOWN
                ==================================== */}

                <div className="
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/[0.025]
                    p-6
                ">

                    <div className="
                        mb-6
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <h2 className="
                                text-base
                                font-bold
                                text-white
                            ">
                                File Breakdown
                            </h2>


                            <p className="
                                mt-1
                                text-xs
                                text-slate-600
                            ">
                                Active gallery content
                            </p>

                        </div>


                        <File
                            size={18}
                            className="text-cyan-400"
                        />

                    </div>


                    <div className="
                        space-y-5
                    ">


                        <ProgressItem
                            label="Images"
                            value={
                                stats.files.images
                            }
                            total={
                                stats.files.total
                            }
                            icon={
                                <Image size={17} />
                            }
                        />


                        <ProgressItem
                            label="Videos"
                            value={
                                stats.files.videos
                            }
                            total={
                                stats.files.total
                            }
                            icon={
                                <Video size={17} />
                            }
                        />


                        <ProgressItem
                            label="PDF Documents"
                            value={
                                stats.files.pdfs
                            }
                            total={
                                stats.files.total
                            }
                            icon={
                                <FileText size={17} />
                            }
                        />

                    </div>


                    <div className="
                        mt-6
                        rounded-2xl
                        border
                        border-red-400/10
                        bg-red-400/[0.025]
                        p-4
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <Trash2
                                size={17}
                                className="text-red-300"
                            />

                            <div>

                                <p className="
                                    text-xs
                                    text-slate-500
                                ">
                                    Deleted Files
                                </p>

                                <p className="
                                    mt-1
                                    text-lg
                                    font-bold
                                    text-white
                                ">
                                    {
                                        loading
                                            ? "—"
                                            : formatNumber(
                                                stats.files.deleted
                                            )
                                    }
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================================
                BOTTOM QUICK LINKS
            ======================================== */}

            <div className="
                mt-6
                grid
                gap-4
                sm:grid-cols-2
            ">


                <Link
                    to="/admin/users"
                    className="
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.02]
                        p-5
                        transition
                        hover:border-cyan-400/20
                        hover:bg-white/[0.04]
                    "
                >

                    <div className="
                        flex
                        items-center
                        gap-4
                    ">

                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-cyan-400/5
                            text-cyan-300
                        ">

                            <Users size={18} />

                        </div>


                        <div>

                            <p className="
                                text-sm
                                font-bold
                                text-white
                            ">
                                Manage Users
                            </p>

                            <p className="
                                mt-1
                                text-xs
                                text-slate-600
                            ">
                                View and manage user accounts
                            </p>

                        </div>

                    </div>


                    <ArrowRight
                        size={17}
                        className="text-slate-600"
                    />

                </Link>


                <Link
                    to="/admin/statistics"
                    className="
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.02]
                        p-5
                        transition
                        hover:border-cyan-400/20
                        hover:bg-white/[0.04]
                    "
                >

                    <div className="
                        flex
                        items-center
                        gap-4
                    ">

                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-cyan-400/5
                            text-cyan-300
                        ">

                            <File size={18} />

                        </div>


                        <div>

                            <p className="
                                text-sm
                                font-bold
                                text-white
                            ">
                                Platform Statistics
                            </p>

                            <p className="
                                mt-1
                                text-xs
                                text-slate-600
                            ">
                                View detailed gallery statistics
                            </p>

                        </div>

                    </div>


                    <ArrowRight
                        size={17}
                        className="text-slate-600"
                    />

                </Link>

            </div>

        </div>
    );
};


export default AdminDashboard;