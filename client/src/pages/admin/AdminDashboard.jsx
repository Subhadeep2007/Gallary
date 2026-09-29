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
    FileAudio,
    FileText,
    Trash2,
    RefreshCw,
    ArrowRight,
    HardDrive,
    CheckCircle2,
    Activity,
    Database,
    UserRound
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
        audios: 0,
        pdfs: 0,
        deleted: 0,
        storageUsed: 0
    }

};


const unwrapDashboardData = (
    response
) => {

    if (
        response &&
        response.users
    ) {

        return response;

    }


    if (
        response &&
        response.data &&
        response.data.users
    ) {

        return response.data;

    }


    if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.users
    ) {

        return response.data.data;

    }


    return null;

};


const getErrorMessage = (
    error
) => {

    if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.message
    ) {

        return error.response.data.message;

    }


    if (
        error &&
        error.message
    ) {

        return error.message;

    }


    return "Failed to load admin dashboard.";

};


const formatNumber = (
    value
) => {

    if (
        typeof value !== "number"
    ) {

        return "0";

    }


    return value.toLocaleString(
        "en-IN"
    );

};


const formatStorage = (
    bytes
) => {

    if (
        typeof bytes !== "number" ||
        bytes <= 0
    ) {

        return "0 B";

    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB"
    ];

    let size = bytes;
    let index = 0;

    while (
        size >= 1024 &&
        index < units.length - 1
    ) {

        size = size / 1024;
        index = index + 1;

    }


    return (
        size.toFixed(1) +
        " " +
        units[index]
    );

};


const StatCard = ({
    title,
    value,
    description,
    icon,
    href
}) => {

    const content = (

        <div
            className="
                group
                h-full
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                transition
                duration-200
                hover:-translate-y-0.5
                hover:border-indigo-200
                hover:shadow-md
                sm:p-5
            "
        >

            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-3
                "
            >

                <div className="min-w-0">

                    <p
                        className="
                            text-xs
                            font-medium
                            text-slate-500
                        "
                    >
                        {title}
                    </p>


                    <p
                        className="
                            mt-2
                            truncate
                            text-2xl
                            font-bold
                            tracking-tight
                            text-slate-900
                            sm:text-3xl
                        "
                    >
                        {value}
                    </p>


                    <p
                        className="
                            mt-2
                            text-xs
                            leading-5
                            text-slate-500
                        "
                    >
                        {description}
                    </p>

                </div>


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
                        border-indigo-100
                        bg-indigo-50
                        text-indigo-600
                    "
                >
                    {icon}
                </div>

            </div>

        </div>

    );


    if (href) {

        return (
            <Link
                to={href}
                className="block h-full"
            >
                {content}
            </Link>
        );

    }


    return content;

};


const AdminDashboard = () => {

    const [
        stats,
        setStats
    ] = useState(
        initialStats
    );


    const [
        loading,
        setLoading
    ] = useState(
        true
    );


    const loadDashboard = async() => {

        try {

            setLoading(true);


            const response =
                await getAdminDashboard();


            const dashboardData =
                unwrapDashboardData(
                    response
                );


            if (
                dashboardData
            ) {

                setStats({

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

        } catch (
            error
        ) {

            console.error(
                "Admin Dashboard Error:",
                error
            );


            toast.error(
                getErrorMessage(
                    error
                )
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadDashboard();

    }, []);


    const userCards = [

        {
            title: "Total Users",
            value: loading
                ? "—"
                : formatNumber(
                    stats.users.total
                ),
            description: "Registered user accounts",
            icon: <Users size={18} />,
            href: "/admin/dashboard/users"
        },

        {
            title: "Active Users",
            value: loading
                ? "—"
                : formatNumber(
                    stats.users.active
                ),
            description: "Currently active accounts",
            icon: <UserCheck size={18} />,
            href: "/admin/dashboard/users"
        },

        {
            title: "Inactive Users",
            value: loading
                ? "—"
                : formatNumber(
                    stats.users.inactive
                ),
            description: "Deactivated accounts",
            icon: <UserX size={18} />,
            href: "/admin/dashboard/users"
        },

        {
            title: "Verified Users",
            value: loading
                ? "—"
                : formatNumber(
                    stats.users.verified
                ),
            description: "Email verified accounts",
            icon: <CheckCircle2 size={18} />,
            href: "/admin/dashboard/users"
        }

    ];


    const fileCards = [

        {
            title: "Total Files",
            value: loading
                ? "—"
                : formatNumber(
                    stats.files.total
                ),
            description: "Active gallery files",
            icon: <File size={18} />
        },

        {
            title: "Images",
            value: loading
                ? "—"
                : formatNumber(
                    stats.files.images
                ),
            description: "Image files",
            icon: <Image size={18} />
        },

        {
            title: "Videos",
            value: loading
                ? "—"
                : formatNumber(
                    stats.files.videos
                ),
            description: "Video files",
            icon: <Video size={18} />
        },

        {
            title: "Audio",
            value: loading
                ? "—"
                : formatNumber(
                    stats.files.audios
                ),
            description: "Audio files",
            icon: <FileAudio size={18} />
        },

        {
            title: "PDF Files",
            value: loading
                ? "—"
                : formatNumber(
                    stats.files.pdfs
                ),
            description: "PDF documents",
            icon: <FileText size={18} />
        },

        {
            title: "Trash",
            value: loading
                ? "—"
                : formatNumber(
                    stats.files.deleted
                ),
            description: "Files in user trash",
            icon: <Trash2 size={18} />
        }

    ];


    return (

        <div
            className="
                min-h-full
                w-full
                overflow-x-hidden
                rounded-3xl
                bg-slate-50
                p-3
                text-slate-900
                sm:p-5
                lg:p-6
            "
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <section
                className="
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-sm
                    sm:p-6
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-5
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    "
                >

                    <div className="min-w-0">

                        <div
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-indigo-100
                                bg-indigo-50
                                px-3
                                py-1.5
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-indigo-600
                            "
                        >

                            <ShieldCheck size={13} />

                            Admin Overview

                        </div>


                        <h1
                            className="
                                mt-4
                                text-2xl
                                font-bold
                                tracking-tight
                                text-slate-900
                                sm:text-3xl
                                lg:text-4xl
                            "
                        >
                            Digital Gallery
                        </h1>


                        <p
                            className="
                                mt-2
                                max-w-2xl
                                text-sm
                                leading-6
                                text-slate-500
                            "
                        >
                            Manage platform accounts and monitor
                            gallery activity from one place.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={loadDashboard}
                        disabled={loading}
                        className="
                            inline-flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-slate-700
                            shadow-sm
                            transition
                            hover:border-indigo-200
                            hover:bg-indigo-50
                            hover:text-indigo-600
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:w-auto
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

                        {loading
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>

                </div>

            </section>


            {/* =================================================
                USER STATISTICS
            ================================================= */}

            <section className="mt-5 sm:mt-6">

                <div
                    className="
                        mb-4
                        flex
                        flex-col
                        gap-3
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    "
                >

                    <div>

                        <p
                            className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-indigo-600
                            "
                        >
                            Accounts
                        </p>


                        <h2
                            className="
                                mt-1
                                text-lg
                                font-bold
                                text-slate-900
                            "
                        >
                            User Statistics
                        </h2>

                    </div>


                    <Link
                        to="/admin/dashboard/users"
                        className="
                            inline-flex
                            w-fit
                            items-center
                            gap-1.5
                            text-xs
                            font-semibold
                            text-slate-500
                            transition
                            hover:text-indigo-600
                        "
                    >
                        Manage Users
                        <ArrowRight size={14} />
                    </Link>

                </div>


                <div
                    className="
                        grid
                        gap-3
                        sm:grid-cols-2
                        xl:grid-cols-4
                    "
                >

                    {userCards.map(
                        (card) => (

                            <StatCard
                                key={card.title}
                                title={card.title}
                                value={card.value}
                                description={
                                    card.description
                                }
                                icon={card.icon}
                                href={card.href}
                            />

                        )
                    )}

                </div>

            </section>


            {/* =================================================
                GALLERY STATISTICS
            ================================================= */}

            <section className="mt-6">

                <div className="mb-4">

                    <p
                        className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.2em]
                            text-indigo-600
                        "
                    >
                        Gallery
                    </p>


                    <h2
                        className="
                            mt-1
                            text-lg
                            font-bold
                            text-slate-900
                        "
                    >
                        File Statistics
                    </h2>

                </div>


                <div
                    className="
                        grid
                        gap-3
                        sm:grid-cols-2
                        xl:grid-cols-3
                    "
                >

                    {fileCards.map(
                        (card) => (

                            <StatCard
                                key={card.title}
                                title={card.title}
                                value={card.value}
                                description={
                                    card.description
                                }
                                icon={card.icon}
                            />

                        )
                    )}

                </div>

            </section>


            {/* =================================================
                ACCOUNT HEALTH + STORAGE
            ================================================= */}

            <section
                className="
                    mt-6
                    grid
                    gap-4
                    lg:grid-cols-2
                "
            >

                {/* ACCOUNT HEALTH */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                        sm:p-5
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        "
                    >

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <Activity
                                    size={17}
                                    className="text-emerald-600"
                                />

                                <h3
                                    className="
                                        text-sm
                                        font-bold
                                        text-slate-900
                                    "
                                >
                                    Account Health
                                </h3>

                            </div>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Active vs inactive accounts
                            </p>

                        </div>


                        <UserRound
                            size={18}
                            className="text-slate-300"
                        />

                    </div>


                    <div
                        className="
                            mt-5
                            grid
                            grid-cols-2
                            gap-3
                        "
                    >

                        <div
                            className="
                                rounded-xl
                                border
                                border-emerald-100
                                bg-emerald-50
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-medium
                                    text-slate-500
                                "
                            >
                                Active
                            </p>


                            <p
                                className="
                                    mt-2
                                    text-2xl
                                    font-bold
                                    text-emerald-700
                                "
                            >
                                {loading
                                    ? "—"
                                    : formatNumber(
                                        stats.users.active
                                    )}
                            </p>

                        </div>


                        <div
                            className="
                                rounded-xl
                                border
                                border-amber-100
                                bg-amber-50
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-medium
                                    text-slate-500
                                "
                            >
                                Inactive
                            </p>


                            <p
                                className="
                                    mt-2
                                    text-2xl
                                    font-bold
                                    text-amber-700
                                "
                            >
                                {loading
                                    ? "—"
                                    : formatNumber(
                                        stats.users.inactive
                                    )}
                            </p>

                        </div>

                    </div>

                </div>


                {/* STORAGE */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                        sm:p-5
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        "
                    >

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <Database
                                    size={17}
                                    className="text-indigo-600"
                                />

                                <h3
                                    className="
                                        text-sm
                                        font-bold
                                        text-slate-900
                                    "
                                >
                                    Storage
                                </h3>

                            </div>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Active cloud file storage
                            </p>

                        </div>


                        <HardDrive
                            size={18}
                            className="text-slate-300"
                        />

                    </div>


                    <div
                        className="
                            mt-5
                            rounded-xl
                            border
                            border-indigo-100
                            bg-indigo-50
                            p-4
                        "
                    >

                        <p
                            className="
                                text-xs
                                font-medium
                                text-slate-500
                            "
                        >
                            Metadata size
                        </p>


                        <p
                            className="
                                mt-2
                                text-2xl
                                font-bold
                                text-slate-900
                                sm:text-3xl
                            "
                        >
                            {loading
                                ? "—"
                                : formatStorage(
                                    stats.files.storageUsed
                                )}
                        </p>


                        <p
                            className="
                                mt-2
                                text-xs
                                leading-5
                                text-slate-500
                            "
                        >
                            Based on the active file sizes
                            recorded with the cloud-backed
                            gallery metadata.
                        </p>

                    </div>

                </div>

            </section>


            {/* =================================================
                QUICK ACCESS
            ================================================= */}

            <section
                className="
                    mt-6
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-sm
                    sm:p-5
                "
            >

                <div>

                    <p
                        className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.2em]
                            text-indigo-600
                        "
                    >
                        Quick Access
                    </p>


                    <h3
                        className="
                            mt-1
                            text-base
                            font-bold
                            text-slate-900
                        "
                    >
                        Administration
                    </h3>

                </div>


                <div
                    className="
                        mt-4
                        grid
                        gap-3
                        md:grid-cols-2
                    "
                >

                    <Link
                        to="/admin/dashboard/users"
                        className="
                            group
                            flex
                            min-w-0
                            items-center
                            justify-between
                            gap-3
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            p-4
                            transition
                            hover:border-indigo-200
                            hover:bg-indigo-50
                        "
                    >

                        <div
                            className="
                                flex
                                min-w-0
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
                                    border-indigo-100
                                    bg-white
                                    text-indigo-600
                                "
                            >
                                <Users size={18} />
                            </div>


                            <div className="min-w-0">

                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-semibold
                                        text-slate-900
                                    "
                                >
                                    User Accounts
                                </p>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    View and manage users
                                </p>

                            </div>

                        </div>


                        <ArrowRight
                            size={16}
                            className="
                                shrink-0
                                text-slate-300
                                transition
                                group-hover:translate-x-0.5
                                group-hover:text-indigo-600
                            "
                        />

                    </Link>


                    <Link
                        to="/profile"
                        className="
                            group
                            flex
                            min-w-0
                            items-center
                            justify-between
                            gap-3
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            p-4
                            transition
                            hover:border-indigo-200
                            hover:bg-indigo-50
                        "
                    >

                        <div
                            className="
                                flex
                                min-w-0
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
                                    border-slate-200
                                    bg-white
                                    text-slate-600
                                "
                            >
                                <ShieldCheck size={18} />
                            </div>


                            <div className="min-w-0">

                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-semibold
                                        text-slate-900
                                    "
                                >
                                    Admin Profile
                                </p>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    Manage administrator profile
                                </p>

                            </div>

                        </div>


                        <ArrowRight
                            size={16}
                            className="
                                shrink-0
                                text-slate-300
                                transition
                                group-hover:translate-x-0.5
                                group-hover:text-indigo-600
                            "
                        />

                    </Link>

                </div>

            </section>

        </div>

    );

};


export default AdminDashboard;
