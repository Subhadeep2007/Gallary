import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    Search,
    RefreshCw,
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    Mail,
    CalendarDays,
    Eye,
    CheckCircle2,
    XCircle,
    Trash2,
    UserRound
} from "lucide-react";

import {
    toast
} from "react-hot-toast";

import {
    activateAdminUser,
    deactivateAdminUser,
    deleteAdminUser,
    getAdminUsers
} from "../../services/admin/admin.service.js";


// =========================================================
// ERROR MESSAGE
// =========================================================

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


    return "Something went wrong.";

};


// =========================================================
// USERS RESPONSE
// =========================================================

const getUsersFromResponse = (
    response
) => {

    if (
        response &&
        Array.isArray(
            response
        )
    ) {

        return response;

    }


    if (
        response &&
        Array.isArray(
            response.data
        )
    ) {

        return response.data;

    }


    if (
        response &&
        response.data &&
        Array.isArray(
            response.data.data
        )
    ) {

        return response.data.data;

    }


    return [];

};


// =========================================================
// DATE FORMAT
// =========================================================

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
            month: "short",
            year: "numeric"
        }
    );

};


// =========================================================
// AVATAR
// =========================================================

const UserAvatar = ({
    user
}) => {

    const hasImage =
        user &&
        user.profileImage;


    if (hasImage) {

        return (
            <img
                src={user.profileImage}
                alt={
                    user.name ||
                    "User"
                }
                className="
                    h-11
                    w-11
                    rounded-full
                    border
                    border-slate-200
                    object-cover
                "
            />
        );

    }


    return (

        <div
            className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-indigo-100
                bg-indigo-50
                text-indigo-600
            "
        >
            <UserRound
                size={20}
            />
        </div>

    );

};


// =========================================================
// STATUS BADGE
// =========================================================

const StatusBadge = ({
    active
}) => {

    if (active) {

        return (

            <span
                className="
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
                "
            >

                <CheckCircle2
                    size={13}
                />

                Active

            </span>

        );

    }


    return (

        <span
            className="
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
            "
        >

            <XCircle
                size={13}
            />

            Inactive

        </span>

    );

};


// =========================================================
// VERIFICATION BADGE
// =========================================================

const VerificationBadge = ({
    verified
}) => {

    if (verified) {

        return (

            <span
                className="
                    inline-flex
                    items-center
                    gap-1.5
                    text-xs
                    font-medium
                    text-emerald-600
                "
            >

                <ShieldCheck
                    size={14}
                />

                Verified

            </span>

        );

    }


    return (

        <span
            className="
                inline-flex
                items-center
                gap-1.5
                text-xs
                font-medium
                text-slate-400
            "
        >

            <XCircle
                size={14}
            />

            Unverified

        </span>

    );

};


// =========================================================
// USER CARD
// =========================================================

const MobileUserCard = ({
    user,
    actionId,
    onStatus,
    onDelete
}) => {

    const isActionLoading =
        actionId === user._id;


    return (

        <div
            className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
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

                <div
                    className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                    "
                >

                    <UserAvatar
                        user={user}
                    />

                    <div
                        className="
                            min-w-0
                        "
                    >

                        <p
                            className="
                                truncate
                                text-sm
                                font-bold
                                text-slate-900
                            "
                        >
                            {user.name || "Unnamed User"}
                        </p>

                        <p
                            className="
                                mt-0.5
                                truncate
                                text-xs
                                text-slate-500
                            "
                        >
                            {user.email}
                        </p>

                    </div>

                </div>


                <StatusBadge
                    active={
                        user.isActive === true
                    }
                />

            </div>


            <div
                className="
                    mt-4
                    grid
                    grid-cols-2
                    gap-2
                "
            >

                <div
                    className="
                        rounded-xl
                        bg-slate-50
                        p-3
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-slate-400
                        "
                    >
                        <Mail size={14} />

                        <span
                            className="
                                text-[11px]
                                font-medium
                            "
                        >
                            Email
                        </span>
                    </div>

                    <p
                        className="
                            mt-1
                            truncate
                            text-xs
                            font-medium
                            text-slate-700
                        "
                    >
                        {user.email || "-"}
                    </p>

                </div>


                <div
                    className="
                        rounded-xl
                        bg-slate-50
                        p-3
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-slate-400
                        "
                    >
                        <CalendarDays size={14} />

                        <span
                            className="
                                text-[11px]
                                font-medium
                            "
                        >
                            Joined
                        </span>
                    </div>

                    <p
                        className="
                            mt-1
                            text-xs
                            font-medium
                            text-slate-700
                        "
                    >
                        {formatDate(
                            user.createdAt
                        )}
                    </p>

                </div>

            </div>


            <div
                className="
                    mt-3
                    flex
                    items-center
                    justify-between
                    gap-3
                "
            >

                <VerificationBadge
                    verified={
                        user.isEmailVerified === true
                    }
                />


                <Link
                    to={
                        `/admin/dashboard/users/${user._id}`
                    }
                    className="
                        inline-flex
                        items-center
                        gap-1.5
                        text-xs
                        font-semibold
                        text-indigo-600
                        hover:text-indigo-700
                    "
                >

                    <Eye size={14} />

                    View

                </Link>

            </div>


            <div
                className="
                    mt-4
                    grid
                    grid-cols-2
                    gap-2
                "
            >

                <button
                    type="button"
                    onClick={() =>
                        onStatus(user)
                    }
                    disabled={
                        isActionLoading
                    }
                    className="
                        inline-flex
                        min-h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-slate-700
                        transition
                        hover:border-indigo-200
                        hover:bg-indigo-50
                        hover:text-indigo-600
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >

                    {isActionLoading
                        ? (
                            <RefreshCw
                                size={14}
                                className="animate-spin"
                            />
                        )
                        : user.isActive
                            ? (
                                <UserX size={14} />
                            )
                            : (
                                <UserCheck size={14} />
                            )}

                    {isActionLoading
                        ? "Updating..."
                        : user.isActive
                            ? "Deactivate"
                            : "Activate"}

                </button>


                <button
                    type="button"
                    onClick={() =>
                        onDelete(user)
                    }
                    disabled={
                        isActionLoading
                    }
                    className="
                        inline-flex
                        min-h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-red-200
                        bg-white
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-red-600
                        transition
                        hover:bg-red-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >

                    <Trash2
                        size={14}
                    />

                    Delete

                </button>

            </div>

        </div>

    );

};


// =========================================================
// ADMIN USERS
// =========================================================

const AdminUsers = () => {

    const [
        users,
        setUsers
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        filter,
        setFilter
    ] = useState("all");


    const [
        actionId,
        setActionId
    ] = useState("");


    const loadUsers = async() => {

        try {

            setLoading(true);

            const response =
                await getAdminUsers();

            const list =
                getUsersFromResponse(
                    response
                );

            setUsers(list);

        } catch (
            error
        ) {

            console.error(
                "Admin Users Error:",
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

        loadUsers();

    }, []);


    const filteredUsers =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return users.filter(
                (user) => {

                    const name =
                        user &&
                        user.name
                            ? user.name
                                .toLowerCase()
                            : "";


                    const email =
                        user &&
                        user.email
                            ? user.email
                                .toLowerCase()
                            : "";


                    const matchesSearch =
                        !query ||
                        name.includes(query) ||
                        email.includes(query);


                    const matchesFilter =
                        filter === "all" ||
                        (
                            filter === "active" &&
                            user.isActive === true
                        ) ||
                        (
                            filter === "inactive" &&
                            user.isActive === false
                        );


                    return (
                        matchesSearch &&
                        matchesFilter
                    );

                }
            );

        }, [
            users,
            search,
            filter
        ]);


    const activeCount =
        users.filter(
            (user) =>
                user.isActive === true
        ).length;


    const inactiveCount =
        users.filter(
            (user) =>
                user.isActive !== true
        ).length;


    const verifiedCount =
        users.filter(
            (user) =>
                user.isEmailVerified === true
        ).length;


    const handleStatus = async(
        user
    ) => {

        if (
            !user ||
            !user._id
        ) {

            return;

        }


        try {

            setActionId(
                user._id
            );


            if (
                user.isActive === true
            ) {

                await deactivateAdminUser(
                    user._id
                );

                toast.success(
                    "User deactivated successfully."
                );

            } else {

                await activateAdminUser(
                    user._id
                );

                toast.success(
                    "User activated successfully."
                );

            }


            await loadUsers();

        } catch (
            error
        ) {

            toast.error(
                getErrorMessage(
                    error
                )
            );

        } finally {

            setActionId("");

        }

    };


    const handleDelete = async(
        user
    ) => {

        if (
            !user ||
            !user._id
        ) {

            return;

        }


        const confirmed =
            window.confirm(
                `Delete ${user.name || "this user"} account?`
            );


        if (!confirmed) {

            return;

        }


        try {

            setActionId(
                user._id
            );


            await deleteAdminUser(
                user._id
            );


            toast.success(
                "User account deleted successfully."
            );


            await loadUsers();

        } catch (
            error
        ) {

            toast.error(
                getErrorMessage(
                    error
                )
            );

        } finally {

            setActionId("");

        }

    };


    return (

        <div
            className="
                min-h-full
                w-full
                overflow-x-hidden
                rounded-3xl
                bg-slate-50
                p-3
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

                    <div
                        className="
                            min-w-0
                        "
                    >

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

                            <Users
                                size={13}
                            />

                            Management

                        </div>


                        <h1
                            className="
                                mt-4
                                text-2xl
                                font-bold
                                tracking-tight
                                text-slate-900
                                sm:text-3xl
                            "
                        >
                            User Accounts
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
                            View and manage all registered
                            user accounts from the admin panel.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={loadUsers}
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
                SUMMARY
            ================================================= */}

            <section
                className="
                    mt-5
                    grid
                    gap-3
                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <span
                            className="
                                text-xs
                                font-medium
                                text-slate-500
                            "
                        >
                            Total Users
                        </span>

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                bg-indigo-50
                                text-indigo-600
                            "
                        >
                            <Users
                                size={17}
                            />
                        </div>

                    </div>


                    <p
                        className="
                            mt-3
                            text-2xl
                            font-bold
                            text-slate-900
                        "
                    >
                        {loading
                            ? "—"
                            : users.length}
                    </p>

                </div>


                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <span
                            className="
                                text-xs
                                font-medium
                                text-slate-500
                            "
                        >
                            Active Users
                        </span>

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                bg-emerald-50
                                text-emerald-600
                            "
                        >
                            <UserCheck
                                size={17}
                            />
                        </div>

                    </div>


                    <p
                        className="
                            mt-3
                            text-2xl
                            font-bold
                            text-slate-900
                        "
                    >
                        {loading
                            ? "—"
                            : activeCount}
                    </p>

                </div>


                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <span
                            className="
                                text-xs
                                font-medium
                                text-slate-500
                            "
                        >
                            Inactive Users
                        </span>

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                bg-amber-50
                                text-amber-600
                            "
                        >
                            <UserX
                                size={17}
                            />
                        </div>

                    </div>


                    <p
                        className="
                            mt-3
                            text-2xl
                            font-bold
                            text-slate-900
                        "
                    >
                        {loading
                            ? "—"
                            : inactiveCount}
                    </p>

                </div>


                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <span
                            className="
                                text-xs
                                font-medium
                                text-slate-500
                            "
                        >
                            Verified Users
                        </span>

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                bg-emerald-50
                                text-emerald-600
                            "
                        >
                            <ShieldCheck
                                size={17}
                            />
                        </div>

                    </div>


                    <p
                        className="
                            mt-3
                            text-2xl
                            font-bold
                            text-slate-900
                        "
                    >
                        {loading
                            ? "—"
                            : verifiedCount}
                    </p>

                </div>

            </section>


            {/* =================================================
                SEARCH + FILTER
            ================================================= */}

            <section
                className="
                    mt-5
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
                        flex-col
                        gap-3
                        md:flex-row
                    "
                >

                    <div
                        className="
                            relative
                            min-w-0
                            flex-1
                        "
                    >

                        <Search
                            size={17}
                            className="
                                pointer-events-none
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />


                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search by name or email..."
                            className="
                                h-11
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                pl-10
                                pr-4
                                text-sm
                                text-slate-900
                                outline-none
                                transition
                                placeholder:text-slate-400
                                focus:border-indigo-300
                                focus:ring-4
                                focus:ring-indigo-50
                            "
                        />

                    </div>


                    <select
                        value={filter}
                        onChange={(event) =>
                            setFilter(
                                event.target.value
                            )
                        }
                        className="
                            h-11
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            font-medium
                            text-slate-700
                            outline-none
                            transition
                            focus:border-indigo-300
                            focus:ring-4
                            focus:ring-indigo-50
                            md:w-44
                        "
                    >

                        <option value="all">
                            All Users
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="inactive">
                            Inactive
                        </option>

                    </select>

                </div>


                <div
                    className="
                        mt-3
                        flex
                        flex-wrap
                        items-center
                        gap-2
                        text-xs
                        text-slate-500
                    "
                >

                    <span>
                        Showing
                    </span>

                    <span
                        className="
                            font-bold
                            text-slate-900
                        "
                    >
                        {filteredUsers.length}
                    </span>

                    <span>
                        users
                    </span>

                    {search ? (
                        <span>
                            for
                            <span
                                className="
                                    ml-1
                                    font-semibold
                                    text-indigo-600
                                "
                            >
                                "{search}"
                            </span>
                        </span>
                    ) : null}

                </div>

            </section>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

                <section
                    className="
                        mt-5
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
                            hidden
                            overflow-hidden
                            rounded-xl
                            border
                            border-slate-200
                            lg:block
                        "
                    >

                        <div
                            className="
                                h-12
                                animate-pulse
                                bg-slate-100
                            "
                        />

                        <div
                            className="
                                divide-y
                                divide-slate-100
                            "
                        >

                            {[
                                1,
                                2,
                                3,
                                4,
                                5
                            ].map(
                                (item) => (

                                    <div
                                        key={item}
                                        className="
                                            h-20
                                            animate-pulse
                                            bg-white
                                        "
                                    />

                                )
                            )}

                        </div>

                    </div>


                    <div
                        className="
                            grid
                            gap-3
                            sm:grid-cols-2
                            lg:hidden
                        "
                    >

                        {[
                            1,
                            2,
                            3,
                            4
                        ].map(
                            (item) => (

                                <div
                                    key={item}
                                    className="
                                        h-56
                                        animate-pulse
                                        rounded-2xl
                                        bg-slate-100
                                    "
                                />

                            )
                        )}

                    </div>

                </section>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
            filteredUsers.length === 0 && (

                <section
                    className="
                        mt-5
                        rounded-2xl
                        border
                        border-dashed
                        border-slate-300
                        bg-white
                        px-5
                        py-16
                        text-center
                        shadow-sm
                    "
                >

                    <div
                        className="
                            mx-auto
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-slate-100
                            text-slate-400
                        "
                    >
                        <Users
                            size={25}
                        />
                    </div>


                    <h2
                        className="
                            mt-4
                            text-lg
                            font-bold
                            text-slate-900
                        "
                    >
                        No users found
                    </h2>


                    <p
                        className="
                            mx-auto
                            mt-2
                            max-w-md
                            text-sm
                            leading-6
                            text-slate-500
                        "
                    >
                        Try a different search term or change
                        the account status filter.
                    </p>

                </section>

            )}


            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            {!loading &&
            filteredUsers.length > 0 && (

                <section
                    className="
                        mt-5
                        hidden
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                        lg:block
                    "
                >

                    <div
                        className="
                            overflow-x-auto
                        "
                    >

                        <table
                            className="
                                min-w-[950px]
                                w-full
                            "
                        >

                            <thead
                                className="
                                    bg-slate-50
                                "
                            >

                                <tr
                                    className="
                                        border-b
                                        border-slate-200
                                    "
                                >

                                    <th
                                        className="
                                            px-5
                                            py-4
                                            text-left
                                            text-[11px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]
                                            text-slate-500
                                        "
                                    >
                                        User
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-4
                                            text-left
                                            text-[11px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]
                                            text-slate-500
                                        "
                                    >
                                        Verification
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-4
                                            text-left
                                            text-[11px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]
                                            text-slate-500
                                        "
                                    >
                                        Status
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-4
                                            text-left
                                            text-[11px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]
                                            text-slate-500
                                        "
                                    >
                                        Joined
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-4
                                            text-right
                                            text-[11px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]
                                            text-slate-500
                                        "
                                    >
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody
                                className="
                                    divide-y
                                    divide-slate-100
                                "
                            >

                                {filteredUsers.map(
                                    (user) => {

                                        const isActionLoading =
                                            actionId === user._id;


                                        return (

                                            <tr
                                                key={user._id}
                                                className="
                                                    transition
                                                    hover:bg-slate-50/70
                                                "
                                            >

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        "
                                                    >

                                                        <UserAvatar
                                                            user={user}
                                                        />


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
                                                                    text-slate-900
                                                                "
                                                            >
                                                                {user.name ||
                                                                    "Unnamed User"}
                                                            </p>


                                                            <p
                                                                className="
                                                                    mt-0.5
                                                                    truncate
                                                                    text-xs
                                                                    text-slate-500
                                                                "
                                                            >
                                                                {user.email ||
                                                                    "-"}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <VerificationBadge
                                                        verified={
                                                            user.isEmailVerified === true
                                                        }
                                                    />

                                                </td>


                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <StatusBadge
                                                        active={
                                                            user.isActive === true
                                                        }
                                                    />

                                                </td>


                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                        text-sm
                                                        text-slate-600
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-2
                                                        "
                                                    >

                                                        <CalendarDays
                                                            size={14}
                                                            className="
                                                                text-slate-400
                                                            "
                                                        />

                                                        {formatDate(
                                                            user.createdAt
                                                        )}

                                                    </div>

                                                </td>


                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            justify-end
                                                            gap-2
                                                        "
                                                    >

                                                        <Link
                                                            to={
                                                                `/admin/dashboard/users/${user._id}`
                                                            }
                                                            className="
                                                                inline-flex
                                                                h-9
                                                                items-center
                                                                gap-1.5
                                                                rounded-lg
                                                                border
                                                                border-slate-200
                                                                bg-white
                                                                px-3
                                                                text-xs
                                                                font-semibold
                                                                text-slate-700
                                                                transition
                                                                hover:border-indigo-200
                                                                hover:bg-indigo-50
                                                                hover:text-indigo-600
                                                            "
                                                        >

                                                            <Eye
                                                                size={14}
                                                            />

                                                            View

                                                        </Link>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleStatus(
                                                                    user
                                                                )
                                                            }
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                            className="
                                                                inline-flex
                                                                h-9
                                                                items-center
                                                                gap-1.5
                                                                rounded-lg
                                                                border
                                                                border-slate-200
                                                                bg-white
                                                                px-3
                                                                text-xs
                                                                font-semibold
                                                                text-slate-700
                                                                transition
                                                                hover:border-indigo-200
                                                                hover:bg-indigo-50
                                                                hover:text-indigo-600
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-50
                                                            "
                                                        >

                                                            {isActionLoading
                                                                ? (
                                                                    <RefreshCw
                                                                        size={14}
                                                                        className="animate-spin"
                                                                    />
                                                                )
                                                                : user.isActive
                                                                    ? (
                                                                        <UserX
                                                                            size={14}
                                                                        />
                                                                    )
                                                                    : (
                                                                        <UserCheck
                                                                            size={14}
                                                                        />
                                                                    )}

                                                            {isActionLoading
                                                                ? "..."
                                                                : user.isActive
                                                                    ? "Deactivate"
                                                                    : "Activate"}

                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    user
                                                                )
                                                            }
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                            className="
                                                                inline-flex
                                                                h-9
                                                                items-center
                                                                gap-1.5
                                                                rounded-lg
                                                                border
                                                                border-red-200
                                                                bg-white
                                                                px-3
                                                                text-xs
                                                                font-semibold
                                                                text-red-600
                                                                transition
                                                                hover:bg-red-50
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-50
                                                            "
                                                        >

                                                            <Trash2
                                                                size={14}
                                                            />

                                                            Delete

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            )}


            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            {!loading &&
            filteredUsers.length > 0 && (

                <section
                    className="
                        mt-5
                        grid
                        gap-3
                        sm:grid-cols-2
                        lg:hidden
                    "
                >

                    {filteredUsers.map(
                        (user) => (

                            <MobileUserCard
                                key={
                                    user._id
                                }
                                user={user}
                                actionId={
                                    actionId
                                }
                                onStatus={
                                    handleStatus
                                }
                                onDelete={
                                    handleDelete
                                }
                            />

                        )
                    )}

                </section>

            )}

        </div>

    );

};


export default AdminUsers;
