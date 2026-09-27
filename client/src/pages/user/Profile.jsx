import { useEffect, useState } from "react";
import {
    Camera,
    Check,
    Edit3,
    Mail,
    Shield,
    User,
    X
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";

import useAuth from "../../hooks/useAuth";
import {
    getProfile,
    updateProfile,
    uploadProfileImage
} from "../../services/profile/profile.service.js";

const Profile = () => {

    const { user: authUser, updateUser } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: ""
        }
    });

    const [user, setUser] = useState(authUser || null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [uploading, setUploading] = useState(false);


    // ==========================================
    // GET PROFILE
    // ==========================================

    const loadProfile = async () => {

        try {

            setLoading(true);

            const response = await getProfile();

            const profileData = response?.user || response || authUser;

            if (profileData) {

                setUser(profileData);
                updateUser(profileData);

                reset({
                    name: profileData.name || ""
                });
            }

        } catch (error) {

            console.error(
                "Profile Error:",
                error
            );

            toast.error(
                "Failed to load profile"
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // LOAD PROFILE ON PAGE OPEN
    // ==========================================

    useEffect(() => {

        loadProfile();

    }, []);


    // ==========================================
    // PROFILE UPDATE
    // ==========================================

    const handleUpdateProfile = async (formData) => {

        try {

            setSaving(true);

            const response = await updateProfile({
                name: formData.name.trim()
            });

            const updatedUser = response?.user || response;

            if (updatedUser) {

                setUser(updatedUser);
                updateUser(updatedUser);

                reset({
                    name: updatedUser.name || ""
                });

            } else {

                setUser((currentUser) => {

                    return {
                        ...currentUser,
                        name: formData.name.trim()
                    };
                });
            }

            setEditing(false);

            toast.success(
                "Profile updated successfully"
            );

        } catch (error) {

            console.error(
                "Update Profile Error:",
                error
            );

            let message =
                "Failed to update profile";

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

            setSaving(false);
        }
    };


    // ==========================================
    // IMAGE SELECT
    // ==========================================

    const handleImageSelect = (event) => {

        const file =
            event.target.files &&
            event.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {

            toast.error(
                "Please select an image"
            );

            return;
        }

        if (file.size > 5 * 1024 * 1024) {

            toast.error(
                "Image must be less than 5MB"
            );

            return;
        }

        setSelectedImage(file);

        setImagePreview(
            URL.createObjectURL(file)
        );
    };


    // ==========================================
    // UPLOAD IMAGE
    // ==========================================

    const handleUploadImage = async () => {

        if (!selectedImage) {
            return;
        }

        try {

            setUploading(true);

            const formData =
                new FormData();

            formData.append(
                "profileImage",
                selectedImage
            );

            const response =
                await uploadProfileImage(
                    formData
                );

            const updatedUser = response?.user || response;
            if (updatedUser?.profileImage) {
                setUser(updatedUser);
                updateUser(updatedUser);
            }

            setSelectedImage(null);
            setImagePreview("");

            toast.success(
                "Profile photo updated"
            );

        } catch (error) {

            console.error(
                "Upload Image Error:",
                error
            );

            let message =
                "Failed to upload image";

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

            setUploading(false);
        }
    };


    // ==========================================
    // CANCEL IMAGE
    // ==========================================

    const cancelImage = () => {

        setSelectedImage(null);
        setImagePreview("");
    };


    // ==========================================
    // CANCEL EDIT
    // ==========================================

    const cancelEdit = () => {

        reset({
            name:
                user && user.name
                    ? user.name
                    : ""
        });

        setEditing(false);
    };


    // ==========================================
    // USER INITIAL
    // ==========================================

    const getInitial = () => {

        if (
            user &&
            user.name
        ) {
            return user.name
                .charAt(0)
                .toUpperCase();
        }

        return "U";
    };


    // ==========================================
    // USER ID
    // ==========================================

    const getUserId = () => {

        if (
            user &&
            user.userId
        ) {
            return String(user.userId);
        }

        if (
            user &&
            user._id
        ) {
            return String(user._id);
        }

        if (
            user &&
            user.id
        ) {
            return String(user.id);
        }

        return "—";
    };


    // ==========================================
    // MEMBER SINCE
    // ==========================================

    const getMemberSince = () => {

        if (
            !user ||
            !user.createdAt
        ) {
            return "—";
        }

        const date =
            new Date(user.createdAt);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
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


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="
                flex
                min-h-[70vh]
                items-center
                justify-center
            ">

                <div className="
                    text-center
                ">

                    <div className="
                        mx-auto
                        h-10
                        w-10
                        animate-spin
                        rounded-full
                        border-4
                        border-slate-700
                        border-t-cyan-400
                    " />

                    <p className="
                        mt-4
                        text-sm
                        text-slate-400
                    ">
                        Loading profile...
                    </p>

                </div>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="
            min-h-screen
            w-full
            bg-black
            text-white
        ">

            <div className="
                mx-auto
                w-full
                max-w-5xl
                px-4
                py-8
                sm:px-6
                lg:px-8
            ">


            {/* ======================================
                HEADER
            ====================================== */}

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

                        <User
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
                            Account
                        </span>

                    </div>


                    <h1 className="
                        text-3xl
                        font-black
                        tracking-tight
                        text-white
                    ">
                        My Profile
                    </h1>


                    <p className="
                        mt-2
                        text-sm
                        text-slate-500
                    ">
                        Manage your personal account
                        information.
                    </p>

                </div>


                {!editing && (

                    <button
                        type="button"
                        onClick={() => {
                            setEditing(true);

                            reset({
                                name:
                                    user &&
                                    user.name
                                        ? user.name
                                        : ""
                            });
                        }}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-white/10
                            bg-[#0b0b0b]
                            shadow-lg
                            shadow-black/30
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-slate-200
                            transition
                            hover:border-cyan-400/30
                            hover:text-cyan-300
                        "
                    >

                        <Edit3 size={16} />

                        Edit Profile

                    </button>

                )}

            </div>


            {/* ======================================
                PROFILE HERO
            ====================================== */}

            <div className="
                mb-6
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-[#090909]
                shadow-[0_20px_70px_rgba(0,0,0,0.45)]
            ">

                <div className="
                    h-32
                    bg-gradient-to-r
                    from-cyan-400/20
                    via-black
                    to-blue-500/20
                " />


                <div className="
                    px-6
                    pb-7
                    sm:px-8
                ">

                    <div className="
                        -mt-16
                        flex
                        flex-col
                        gap-5
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    ">


                        {/* AVATAR */}

                        <div className="
                            flex
                            items-end
                            gap-5
                        ">

                            <div className="
                                relative
                            ">

                                <div className="
                                    flex
                                    h-28
                                    w-28
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-3xl
                                    border-4
                                    border-black
                                    bg-[#0b0b0b]
                                    shadow-[0_18px_45px_rgba(0,0,0,0.65)]
                                ">

                                    {imagePreview ? (

                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Profile preview"
                                            className="
                                                h-full
                                                w-full
                                                object-cover
                                            "
                                        />

                                    ) : user &&
                                      user.profileImage ? (

                                        <img
                                            src={
                                                user.profileImage
                                            }
                                            alt="Profile"
                                            className="
                                                h-full
                                                w-full
                                                object-cover
                                            "
                                        />

                                    ) : (

                                        <span className="
                                            text-4xl
                                            font-black
                                            text-cyan-300
                                        ">
                                            {
                                                getInitial()
                                            }
                                        </span>

                                    )}

                                </div>


                                {/* CAMERA */}

                                <label className="
                                    absolute
                                    -bottom-2
                                    -right-2
                                    flex
                                    h-10
                                    w-10
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-[#0b0b0b]
                                    text-cyan-300
                                    shadow-xl
                                    shadow-black/40
                                    transition
                                    hover:border-cyan-400/40
                                    hover:bg-slate-800
                                ">

                                    <Camera size={17} />

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageSelect
                                        }
                                        className="hidden"
                                    />

                                </label>

                            </div>


                            <div className="
                                min-w-0
                                pb-1
                            ">

                                <h2 className="
                                    truncate
                                    text-xl
                                    font-bold
                                    text-white
                                ">
                                    {
                                        user &&
                                        user.name
                                            ? user.name
                                            : "User"
                                    }
                                </h2>


                                <p className="
                                    mt-1
                                    truncate
                                    text-sm
                                    text-slate-500
                                ">
                                    {
                                        user &&
                                        user.email
                                            ? user.email
                                            : "—"
                                    }
                                </p>

                            </div>

                        </div>


                        {/* ROLE */}

                        <div className="
                            inline-flex
                            w-fit
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-cyan-400/10
                            bg-cyan-400/5
                            px-3
                            py-1.5
                        ">

                            <Shield
                                size={14}
                                className="text-cyan-400"
                            />

                            <span className="
                                text-xs
                                font-semibold
                                capitalize
                                text-cyan-300
                            ">
                                {
                                    user &&
                                    user.role
                                        ? user.role
                                        : "user"
                                }
                            </span>

                        </div>

                    </div>


                    {/* IMAGE SAVE */}

                    {selectedImage && (

                        <div className="
                            mt-6
                            rounded-2xl
                            border
                            border-cyan-400/10
                            bg-cyan-400/5
                            p-4
                        ">

                            <div className="
                                flex
                                flex-col
                                gap-3
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            ">

                                <p className="
                                    text-sm
                                    text-slate-300
                                ">
                                    New profile photo selected.
                                </p>


                                <div className="
                                    flex
                                    gap-2
                                ">

                                    <button
                                        type="button"
                                        onClick={
                                            handleUploadImage
                                        }
                                        disabled={
                                            uploading
                                        }
                                        className="
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-xl
                                            bg-cyan-400
                                            px-4
                                            py-2.5
                                            text-sm
                                            font-bold
                                            text-slate-950
                                            transition
                                            hover:bg-cyan-300
                                            disabled:opacity-50
                                        "
                                    >

                                        <Check
                                            size={16}
                                        />

                                        {
                                            uploading
                                                ? "Uploading..."
                                                : "Save"
                                        }

                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            cancelImage
                                        }
                                        disabled={
                                            uploading
                                        }
                                        className="
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-white/10
                                            bg-white/[0.04]
                                            px-4
                                            py-2.5
                                            text-sm
                                            text-slate-300
                                            transition
                                            hover:text-red-300
                                            disabled:opacity-50
                                        "
                                    >

                                        <X size={16} />

                                        Cancel

                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </div>


            {/* ======================================
                CONTENT
            ====================================== */}

            <div className="
                grid
                gap-6
                lg:grid-cols-2
            ">


                {/* ==================================
                    PERSONAL INFORMATION
                ================================== */}

                <div className="
                    rounded-3xl
                    border
                    border-white/10
                    bg-[#090909]
                    p-6
                    shadow-[0_18px_60px_rgba(0,0,0,0.35)]
                    sm:p-7
                ">

                    <div className="
                        mb-6
                    ">

                        <h3 className="
                            text-lg
                            font-bold
                            text-white
                        ">
                            Personal Information
                        </h3>

                        <p className="
                            mt-1
                            text-sm
                            text-slate-500
                        ">
                            Your basic account details.
                        </p>

                    </div>


                    {editing ? (

                        <form
                            onSubmit={
                                handleSubmit(
                                    handleUpdateProfile
                                )
                            }
                            className="
                                space-y-5
                            "
                        >

                            {/* NAME */}

                            <div>

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-300
                                ">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    {...register(
                                        "name",
                                        {
                                            required:
                                                "Name is required",

                                            minLength: {
                                                value: 2,
                                                message:
                                                    "Name must contain at least 2 characters"
                                            },

                                            maxLength: {
                                                value: 100,
                                                message:
                                                    "Name cannot exceed 100 characters"
                                            }
                                        }
                                    )}
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-black
                                        px-4
                                        shadow-inner
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        transition
                                        focus:border-cyan-400/40
                                    "
                                />

                                {errors.name && (

                                    <p className="
                                        mt-2
                                        text-xs
                                        text-red-400
                                    ">
                                        {
                                            errors.name.message
                                        }
                                    </p>
                                )}

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-300
                                ">
                                    Email
                                </label>

                                <div className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black
                                    px-4
                                    shadow-inner
                                    py-3
                                ">

                                    <Mail
                                        size={17}
                                        className="text-slate-500"
                                    />

                                    <span className="
                                        break-all
                                        text-sm
                                        text-slate-400
                                    ">
                                        {
                                            user &&
                                            user.email
                                                ? user.email
                                                : "—"
                                        }
                                    </span>

                                </div>

                            </div>


                            {/* BUTTONS */}

                            <div className="
                                flex
                                gap-3
                                pt-2
                            ">

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="
                                        flex-1
                                        rounded-xl
                                        bg-cyan-400
                                        px-4
                                        py-3
                                        text-sm
                                        font-bold
                                        text-slate-950
                                        transition
                                        hover:bg-cyan-300
                                        disabled:opacity-50
                                    "
                                >
                                    {
                                        saving
                                            ? "Saving..."
                                            : "Save Changes"
                                    }
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        cancelEdit
                                    }
                                    disabled={saving}
                                    className="
                                        flex-1
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-white/[0.03]
                                        px-4
                                        py-3
                                        text-sm
                                        font-semibold
                                        text-slate-300
                                        transition
                                        hover:text-red-300
                                        disabled:opacity-50
                                    "
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    ) : (

                        <div className="
                            space-y-4
                        ">

                            {/* NAME */}

                            <div className="
                                rounded-2xl
                                border
                                border-white/10
                                bg-slate-950/30
                                p-4
                            ">

                                <p className="
                                    text-xs
                                    text-slate-500
                                ">
                                    Full Name
                                </p>

                                <p className="
                                    mt-2
                                    text-sm
                                    font-semibold
                                    text-slate-200
                                ">
                                    {
                                        user &&
                                        user.name
                                            ? user.name
                                            : "—"
                                    }
                                </p>

                            </div>


                            {/* EMAIL */}

                            <div className="
                                rounded-2xl
                                border
                                border-white/10
                                bg-slate-950/30
                                p-4
                            ">

                                <p className="
                                    text-xs
                                    text-slate-500
                                ">
                                    Email Address
                                </p>

                                <p className="
                                    mt-2
                                    break-all
                                    text-sm
                                    font-semibold
                                    text-slate-200
                                ">
                                    {
                                        user &&
                                        user.email
                                            ? user.email
                                            : "—"
                                    }
                                </p>

                            </div>


                            {/* ROLE */}

                            <div className="
                                rounded-2xl
                                border
                                border-white/10
                                bg-slate-950/30
                                p-4
                            ">

                                <p className="
                                    text-xs
                                    text-slate-500
                                ">
                                    Account Role
                                </p>

                                <p className="
                                    mt-2
                                    text-sm
                                    font-semibold
                                    capitalize
                                    text-cyan-300
                                ">
                                    {
                                        user &&
                                        user.role
                                            ? user.role
                                            : "user"
                                    }
                                </p>

                            </div>

                        </div>

                    )}

                </div>


                {/* ==================================
                    ACCOUNT INFORMATION
                ================================== */}

                <div className="
                    rounded-3xl
                    border
                    border-white/10
                    bg-[#090909]
                    p-6
                    shadow-[0_18px_60px_rgba(0,0,0,0.35)]
                    sm:p-7
                ">

                    <div className="
                        mb-6
                    ">

                        <h3 className="
                            text-lg
                            font-bold
                            text-white
                        ">
                            Account Information
                        </h3>

                        <p className="
                            mt-1
                            text-sm
                            text-slate-500
                        ">
                            Information about your account.
                        </p>

                    </div>


                    <div className="
                        space-y-4
                    ">


                        {/* USER ID */}

                        <div className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-slate-950/30
                            p-4
                        ">

                            <p className="
                                text-xs
                                text-slate-500
                            ">
                                User ID
                            </p>

                            <p className="
                                mt-2
                                break-all
                                text-sm
                                font-medium
                                text-slate-300
                            ">
                                {
                                    getUserId()
                                }
                            </p>

                        </div>


                        {/* MEMBER SINCE */}

                        <div className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-slate-950/30
                            p-4
                        ">

                            <p className="
                                text-xs
                                text-slate-500
                            ">
                                Member Since
                            </p>

                            <p className="
                                mt-2
                                text-sm
                                font-semibold
                                text-slate-200
                            ">
                                {
                                    getMemberSince()
                                }
                            </p>

                        </div>


                        {/* ACCOUNT STATUS */}

                        <div className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-slate-950/30
                            p-4
                        ">

                            <p className="
                                text-xs
                                text-slate-500
                            ">
                                Account Status
                            </p>

                            <div className="
                                mt-2
                                flex
                                items-center
                                gap-2
                            ">

                                <span className="
                                    h-2.5
                                    w-2.5
                                    rounded-full
                                    bg-emerald-400
                                " />

                                <span className="
                                    text-sm
                                    font-semibold
                                    text-emerald-300
                                ">
                                    {
                                        user &&
                                        user.isActive === false
                                            ? "Inactive"
                                            : "Active"
                                    }
                                </span>

                            </div>

                        </div>


                        {/* EMAIL STATUS */}

                        <div className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-slate-950/30
                            p-4
                        ">

                            <p className="
                                text-xs
                                text-slate-500
                            ">
                                Email Verification
                            </p>

                            <div className="
                                mt-2
                                flex
                                items-center
                                gap-2
                            ">

                                <Check
                                    size={16}
                                    className="text-emerald-400"
                                />

                                <span className="
                                    text-sm
                                    font-semibold
                                    text-slate-200
                                ">
                                    {
                                        user &&
                                        user.isEmailVerified
                                            ? "Verified"
                                            : "Not Verified"
                                    }
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            </div>

        </div>
    );
};

export default Profile;
