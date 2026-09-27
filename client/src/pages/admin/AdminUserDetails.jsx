import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    ArrowLeft,
    UserRound,
    Mail,
    CalendarDays,
    ShieldCheck,
    UserCheck,
    UserX,
    Trash2,
    RefreshCw,
    File,
    Image,
    Video,
    FileAudio,
    FileText,
    HardDrive,
    CheckCircle2,
    XCircle
} from "lucide-react";

import {
    toast
} from "react-hot-toast";

import {
    activateAdminUser,
    deactivateAdminUser,
    deleteAdminUser,
    getAdminUserDetails
} from "../../services/admin/admin.service.js";


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


    return "Unable to load user.";

};


const unwrapUserData = (
    response
) => {

    if (
        response &&
        response.user
    ) {

        return response;

    }


    if (
        response &&
        response.data &&
        response.data.user
    ) {

        return response.data;

    }


    if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.user
    ) {

        return response.data.data;

    }


    return null;

};


const formatDate = (
    value
) => {

    if (!value) {

        return "Not available";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Not available";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

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

    let size =
        bytes;

    let index =
        0;


    while (
        size >= 1024 &&
        index < units.length - 1
    ) {

        size =
            size / 1024;

        index =
            index + 1;

    }


    return (
        size.toFixed(1) +
        " " +
        units[index]
    );

};


const StatBox = ({
    title,
    value,
    icon,
    tone
}) => {

    const toneClasses = {

        indigo: `
            border-indigo-100
            bg-indigo-50
            text-indigo-600
        `,

        emerald: `
            border-emerald-100
            bg-emerald-50
            text-emerald-600
        `,

        blue: `
            border-blue-100
            bg-blue-50
            text-blue-600
        `,

        amber: `
            border-amber-100
            bg-amber-50
            text-amber-600
        `,

        rose: `
            border-rose-100
            bg-rose-50
            text-rose-600
        `

    };


    return (

        <div
            className={`
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                sm:p-5
            `}
        >

            <div
                className={`
                    flex
                    items-center
                    justify-between
                    gap-3
                `}
            >

                <p
                    className={`
                        text-xs
                        font-medium
                        text-slate-500
                    `}
                >
                    {title}
                </p>


                <div
                    className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        ${toneClasses[tone]}
                    `}
                >
                    {icon}
                </div>

            </div>


            <p
                className={`
                    mt-4
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                `}
            >
                {value}
            </p>

        </div>

    );

};


const AdminUserDetails = () => {

    const {
        userId
    } = useParams();


    const navigate =
        useNavigate();


    const [
        data,
        setData
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        actionLoading,
        setActionLoading
    ] = useState(false);


    const loadUser = async() => {

        try {

            setLoading(true);


            const response =
                await getAdminUserDetails(
                    userId
                );


            const userData =
                unwrapUserData(
                    response
                );


            setData(
                userData
            );

        } catch (
            error
        ) {

            console.error(
                "Admin User Details Error:",
                error
            );


            setData(null);


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

        if (
            userId
        ) {

            loadUser();

        }

    }, [
        userId
    ]);


    const handleStatus =
        async() => {

            if (
                !data ||
                !data.user ||
                !data.user._id
            ) {

                return;

            }


            try {

                setActionLoading(
                    true
                );


                if (
                    data.user.isActive === true
                ) {

                    await deactivateAdminUser(
                        data.user._id
                    );


                    toast.success(
                        "User deactivated successfully."
                    );

                } else {

                    await activateAdminUser(
                        data.user._id
                    );


                    toast.success(
                        "User activated successfully."
                    );

                }


                await loadUser();

            } catch (
                error
            ) {

                toast.error(
                    getErrorMessage(
                        error
                    )
                );

            } finally {

                setActionLoading(
                    false
                );

            }

        };


    const handleDelete =
        async() => {

            if (
                !data ||
                !data.user ||
                !data.user._id
            ) {

                return;

            }


            const confirmed =
                window.confirm(
                    `Delete ${data.user.name || "this user"} account?`
                );


            if (!confirmed) {

                return;

            }


            try {

                setActionLoading(
                    true
                );


                await deleteAdminUser(
                    data.user._id
                );


                toast.success(
                    "User account deleted successfully."
                );


                navigate(
                    "/admin/dashboard/users",
                    {
                        replace: true
                    }
                );

            } catch (
                error
            ) {

                toast.error(
                    getErrorMessage(
                        error
                    )
                );

            } finally {

                setActionLoading(
                    false
                );

            }

        };


    if (loading) {

        return (

            <div
                className={`
                    flex
                    min-h-[500px]
                    items-center
                    justify-center
                `}
            >

                <div
                    className={`
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        px-5
                        py-4
                        text-sm
                        font-medium
                        text-slate-600
                        shadow-sm
                    `}
                >

                    <RefreshCw
                        size={17}
                        className="animate-spin"
                    />

                    Loading user profile...

                </div>

            </div>

        );

    }


    if (
        !data ||
        !data.user
    ) {

        return (

            <div
                className={`
                    min-h-full
                    rounded-3xl
                    bg-slate-50
                    px-4
                    py-16
                    text-center
                    sm:px-6
                `}
            >

                <div
                    className={`
                        mx-auto
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        bg-white
                        text-slate-400
                        shadow-sm
                    `}
                >
                    <UserRound
                        size={28}
                    />
                </div>


                <h1
                    className={`
                        mt-5
                        text-xl
                        font-bold
                        text-slate-900
                    `}
                >
                    User not found
                </h1>


                <p
                    className={`
                        mx-auto
                        mt-2
                        max-w-md
                        text-sm
                        leading-6
                        text-slate-500
                    `}
                >
                    The requested user account could not
                    be loaded.
                </p>


                <Link
                    to="/admin/dashboard/users"
                    className={`
                        mt-6
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-indigo-600
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-indigo-700
                    `}
                >

                    <ArrowLeft
                        size={16}
                    />

                    Back to Users

                </Link>

            </div>

        );

    }


    const user =
        data.user;


    const files =
        data.files || {};


    const isActive =
        user.isActive === true;


    const isVerified =
        user.isEmailVerified === true;


    return (

        <div
            className={`
                min-h-full
                w-full
                overflow-x-hidden
                rounded-3xl
                bg-slate-50
                p-3
                sm:p-5
                lg:p-6
            `}
        >

            {/* =================================================
                TOP BAR
            ================================================= */}

            <div
                className={`
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                `}
            >

                <Link
                    to="/admin/dashboard/users"
                    className={`
                        inline-flex
                        w-fit
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-slate-700
                        shadow-sm
                        transition
                        hover:border-indigo-200
                        hover:bg-indigo-50
                        hover:text-indigo-600
                    `}
                >

                    <ArrowLeft
                        size={16}
                    />

                    Back to Users

                </Link>


                <div
                    className={`
                        flex
                        flex-wrap
                        items-center
                        gap-2
                    `}
                >

                    <button
                        type="button"
                        onClick={handleStatus}
                        disabled={actionLoading}
                        className={`
                            inline-flex
                            flex-1
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-2.5
                            text-xs
                            font-semibold
                            text-slate-700
                            shadow-sm
                            transition
                            hover:border-indigo-200
                            hover:bg-indigo-50
                            hover:text-indigo-600
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:flex-none
                        `}
                    >

                        {actionLoading
                            ? (
                                <RefreshCw
                                    size={15}
                                    className="animate-spin"
                                />
                            )
                            : isActive
                                ? (
                                    <UserX
                                        size={15}
                                    />
                                )
                                : (
                                    <UserCheck
                                        size={15}
                                    />
                                )}

                        {isActive
                            ? "Deactivate"
                            : "Activate"}

                    </button>


                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={actionLoading}
                        className={`
                            inline-flex
                            flex-1
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-red-200
                            bg-white
                            px-4
                            py-2.5
                            text-xs
                            font-semibold
                            text-red-600
                            shadow-sm
                            transition
                            hover:bg-red-50
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:flex-none
                        `}
                    >

                        <Trash2
                            size={15}
                        />

                        Delete

                    </button>

                </div>

            </div>


            {/* =================================================
                PROFILE HERO
            ================================================= */}

            <section
                className={`
                    mt-4
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                `}
            >

                <div
                    className={`
                        h-24
                        bg-gradient-to-r
                        from-indigo-50
                        via-white
                        to-slate-50
                        sm:h-32
                    `}
                />


                <div
                    className={`
                        px-4
                        pb-5
                        sm:px-6
                        sm:pb-6
                    `}
                >

                    <div
                        className={`
                            -mt-10
                            flex
                            flex-col
                            gap-4
                            sm:-mt-12
                            lg:flex-row
                            lg:items-end
                            lg:justify-between
                        `}
                    >

                        <div
                            className={`
                                flex
                                min-w-0
                                flex-col
                                gap-3
                                sm:flex-row
                                sm:items-end
                            `}
                        >

                            {user.profileImage ? (

                                <img
                                    src={
                                        user.profileImage
                                    }
                                    alt={
                                        user.name ||
                                        "User"
                                    }
                                    className={`
                                        h-20
                                        w-20
                                        rounded-2xl
                                        border-4
                                        border-white
                                        object-cover
                                        shadow-md
                                        sm:h-24
                                        sm:w-24
                                    `}
                                />

                            ) : (

                                <div
                                    className={`
                                        flex
                                        h-20
                                        w-20
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        border-4
                                        border-white
                                        bg-indigo-50
                                        text-indigo-600
                                        shadow-md
                                        sm:h-24
                                        sm:w-24
                                    `}
                                >
                                    <UserRound
                                        size={34}
                                    />
                                </div>

                            )}


                            <div
                                className={`
                                    min-w-0
                                    pb-1
                                `}
                            >

                                <div
                                    className={`
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                    `}
                                >

                                    <h1
                                        className={`
                                            max-w-full
                                            truncate
                                            text-xl
                                            font-bold
                                            tracking-tight
                                            text-slate-900
                                            sm:text-2xl
                                        `}
                                    >
                                        {
                                            user.name ||
                                            "Unnamed User"
                                        }
                                    </h1>


                                    {isActive ? (

                                        <span
                                            className={`
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-full
                                                border
                                                border-emerald-200
                                                bg-emerald-50
                                                px-2.5
                                                py-1
                                                text-[11px]
                                                font-semibold
                                                text-emerald-700
                                            `}
                                        >
                                            <CheckCircle2
                                                size={13}
                                            />
                                            Active
                                        </span>

                                    ) : (

                                        <span
                                            className={`
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-full
                                                border
                                                border-amber-200
                                                bg-amber-50
                                                px-2.5
                                                py-1
                                                text-[11px]
                                                font-semibold
                                                text-amber-700
                                            `}
                                        >
                                            <XCircle
                                                size={13}
                                            />
                                            Inactive
                                        </span>

                                    )}

                                </div>


                                <p
                                    className={`
                                        mt-1
                                        break-all
                                        text-sm
                                        text-slate-500
                                    `}
                                >
                                    {user.email || "-"}
                                </p>

                            </div>

                        </div>


                        <div
                            className={`
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-slate-600
                            `}
                        >

                            <CalendarDays
                                size={15}
                                className="text-slate-400"
                            />

                            Joined
                            {": "}
                            {formatDate(
                                user.createdAt
                            )}

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}

            <section
                className={`
                    mt-5
                    grid
                    gap-4
                    lg:grid-cols-2
                `}
            >

                <div
                    className={`
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                        sm:p-5
                    `}
                >

                    <div
                        className={`
                            flex
                            items-center
                            gap-2
                        `}
                    >

                        <UserRound
                            size={18}
                            className="text-indigo-600"
                        />

                        <h2
                            className={`
                                text-sm
                                font-bold
                                text-slate-900
                            `}
                        >
                            Account Information
                        </h2>

                    </div>


                    <div
                        className={`
                            mt-5
                            space-y-4
                        `}
                    >

                        <div>

                            <p
                                className={`
                                    text-[11px]
                                    font-medium
                                    uppercase
                                    tracking-wide
                                    text-slate-400
                                `}
                            >
                                Full Name
                            </p>

                            <p
                                className={`
                                    mt-1
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                `}
                            >
                                {user.name || "-"}
                            </p>

                        </div>


                        <div>

                            <p
                                className={`
                                    text-[11px]
                                    font-medium
                                    uppercase
                                    tracking-wide
                                    text-slate-400
                                `}
                            >
                                Email Address
                            </p>

                            <div
                                className={`
                                    mt-1
                                    flex
                                    items-start
                                    gap-2
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                `}
                            >

                                <Mail
                                    size={15}
                                    className={`
                                        mt-0.5
                                        shrink-0
                                        text-slate-400
                                    `}
                                />

                                <span className="break-all">
                                    {user.email || "-"}
                                </span>

                            </div>

                        </div>


                        <div
                            className={`
                                grid
                                grid-cols-1
                                gap-3
                                sm:grid-cols-2
                            `}
                        >

                            <div
                                className={`
                                    rounded-xl
                                    bg-slate-50
                                    p-3
                                `}
                            >

                                <p
                                    className={`
                                        text-xs
                                        text-slate-500
                                    `}
                                >
                                    Account Status
                                </p>

                                <p
                                    className={`
                                        mt-1
                                        text-sm
                                        font-bold
                                        text-slate-800
                                    `}
                                >
                                    {isActive
                                        ? "Active"
                                        : "Inactive"}
                                </p>

                            </div>


                            <div
                                className={`
                                    rounded-xl
                                    bg-slate-50
                                    p-3
                                `}
                            >

                                <p
                                    className={`
                                        text-xs
                                        text-slate-500
                                    `}
                                >
                                    Email Status
                                </p>

                                <p
                                    className={`
                                        mt-1
                                        text-sm
                                        font-bold
                                        text-slate-800
                                    `}
                                >
                                    {isVerified
                                        ? "Verified"
                                        : "Unverified"}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* VERIFICATION */}

                <div
                    className={`
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                        sm:p-5
                    `}
                >

                    <div
                        className={`
                            flex
                            items-center
                            gap-2
                        `}
                    >

                        <ShieldCheck
                            size={18}
                            className="text-indigo-600"
                        />

                        <h2
                            className={`
                                text-sm
                                font-bold
                                text-slate-900
                            `}
                        >
                            Verification
                        </h2>

                    </div>


                    <div
                        className={`
                            mt-5
                            rounded-2xl
                            border
                            border-slate-200
                            bg-slate-50
                            p-5
                        `}
                    >

                        <div
                            className={`
                                flex
                                items-center
                                gap-3
                            `}
                        >

                            <div
                                className={`
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-white
                                    text-slate-400
                                `}
                            >

                                {isVerified
                                    ? (
                                        <CheckCircle2
                                            size={22}
                                            className={`
                                                text-emerald-600
                                            `}
                                        />
                                    )
                                    : (
                                        <XCircle
                                            size={22}
                                            className={`
                                                text-amber-600
                                            `}
                                        />
                                    )}

                            </div>


                            <div>

                                <p
                                    className={`
                                        text-sm
                                        font-bold
                                        text-slate-900
                                    `}
                                >
                                    {isVerified
                                        ? "Email Verified"
                                        : "Email Not Verified"}
                                </p>

                                <p
                                    className={`
                                        mt-1
                                        text-xs
                                        leading-5
                                        text-slate-500
                                    `}
                                >
                                    {isVerified
                                        ? "This account has completed email verification."
                                        : "This account has not completed email verification."}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                FILE STATISTICS
            ================================================= */}

            <section
                className={`
                    mt-5
                `}
            >

                <div
                    className={`
                        mb-4
                    `}
                >

                    <p
                        className={`
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.2em]
                            text-indigo-600
                        `}
                    >
                        Gallery
                    </p>


                    <h2
                        className={`
                            mt-1
                            text-lg
                            font-bold
                            text-slate-900
                        `}
                    >
                        File Statistics
                    </h2>

                </div>


                <div
                    className={`
                        grid
                        gap-3
                        sm:grid-cols-2
                        lg:grid-cols-3
                        xl:grid-cols-4
                    `}
                >

                    <StatBox
                        title="Total Files"
                        value={
                            formatNumber(
                                files.total
                            )
                        }
                        icon={
                            <File
                                size={17}
                            />
                        }
                        tone="indigo"
                    />


                    <StatBox
                        title="Images"
                        value={
                            formatNumber(
                                files.images
                            )
                        }
                        icon={
                            <Image
                                size={17}
                            />
                        }
                        tone="blue"
                    />


                    <StatBox
                        title="Videos"
                        value={
                            formatNumber(
                                files.videos
                            )
                        }
                        icon={
                            <Video
                                size={17}
                            />
                        }
                        tone="indigo"
                    />


                    <StatBox
                        title="Audio"
                        value={
                            formatNumber(
                                files.audios
                            )
                        }
                        icon={
                            <FileAudio
                                size={17}
                            />
                        }
                        tone="emerald"
                    />


                    <StatBox
                        title="PDF Files"
                        value={
                            formatNumber(
                                files.pdfs
                            )
                        }
                        icon={
                            <FileText
                                size={17}
                            />
                        }
                        tone="rose"
                    />


                    <StatBox
                        title="Trash"
                        value={
                            formatNumber(
                                files.deleted
                            )
                        }
                        icon={
                            <Trash2
                                size={17}
                            />
                        }
                        tone="amber"
                    />


                    <div
                        className={`
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-4
                            shadow-sm
                            sm:p-5
                            sm:col-span-2
                            lg:col-span-3
                            xl:col-span-1
                        `}
                    >

                        <div
                            className={`
                                flex
                                items-center
                                justify-between
                                gap-3
                            `}
                        >

                            <div>

                                <p
                                    className={`
                                        text-xs
                                        font-medium
                                        text-slate-500
                                    `}
                                >
                                    Storage Used
                                </p>


                                <p
                                    className={`
                                        mt-4
                                        text-2xl
                                        font-bold
                                        tracking-tight
                                        text-slate-900
                                    `}
                                >
                                    {formatStorage(
                                        files.storageUsed
                                    )}
                                </p>

                            </div>


                            <div
                                className={`
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-indigo-100
                                    bg-indigo-50
                                    text-indigo-600
                                `}
                            >

                                <HardDrive
                                    size={17}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                NOTE
            ================================================= */}

            <section
                className={`
                    mt-5
                    rounded-2xl
                    border
                    border-indigo-100
                    bg-indigo-50
                    p-4
                    sm:p-5
                `}
            >

                <div
                    className={`
                        flex
                        items-start
                        gap-3
                    `}
                >

                    <ShieldCheck
                        size={18}
                        className={`
                            mt-0.5
                            shrink-0
                            text-indigo-600
                        `}
                    />

                    <div>

                        <p
                            className={`
                                text-sm
                                font-semibold
                                text-slate-900
                            `}
                        >
                            Storage note
                        </p>


                        <p
                            className={`
                                mt-1
                                text-xs
                                leading-5
                                text-slate-600
                            `}
                        >
                            Storage shown here is the sum of active
                            file sizes recorded in the Gallery metadata.
                            The actual file Blob remains in the user's
                            local PWA / IndexedDB storage.
                        </p>

                    </div>

                </div>

            </section>

        </div>

    );

};


export default AdminUserDetails;
