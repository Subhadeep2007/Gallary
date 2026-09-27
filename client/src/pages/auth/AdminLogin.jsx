import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    KeyRound,
    LockKeyhole,
    ShieldCheck
} from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth.js";

const AdminLogin = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const {
        loginAdmin
    } = useAuth();

    const [
        showPassword,
        setShowPassword
    ] = useState(false);

    const [
        showSecretKey,
        setShowSecretKey
    ] = useState(false);

    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm({
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
            adminSecretKey: ""
        }
    });


    // ========================================
    // SUBMIT
    // ========================================

    const onSubmit = async(formData) => {

        try {

            setIsSubmitting(true);

            const email =
                formData.email
                    .trim()
                    .toLowerCase();

            const result =
                await loginAdmin({

                    email,

                    password:
                        formData.password,

                    adminSecretKey:
                        formData.adminSecretKey.trim()

                });


            // ========================================
            // EMAIL VERIFICATION REQUIRED
            // ========================================

            if (
                result?.data?.requiresEmailVerification
            ) {

                toast.error(
                    "Please verify your email first."
                );

                navigate(
                    "/verify-email",
                    {
                        replace: true,

                        state: {
                            email: result.data.email || email,
                            role: "admin"
                        }
                    }
                );

                return;
            }


            // ========================================
            // SUCCESS
            // ========================================

            toast.success(
                "Admin login successful."
            );

            navigate(
                location.state?.from ||
                "/admin/dashboard",
                {
                    replace: true
                }
            );

        } catch(error) {

            const message =
                error?.response?.data?.errors?.[0]?.message ||
                error?.response?.data?.message ||
                error?.message ||
                "Admin login failed. Please try again.";

            toast.error(message);

        } finally {

            setIsSubmitting(false);

        }

    };


    return (

        <div className="min-h-screen bg-slate-950 text-white">

            <div className="grid min-h-screen lg:grid-cols-2">

                {/* ========================================
                    LEFT SECTION
                ======================================== */}

                <div className="relative hidden overflow-hidden lg:flex">

                    <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-950 to-slate-950" />

                    <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

                    <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />


                    <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

                        {/* Back */}

                        <Link
                            to="/login"
                            className="inline-flex w-fit items-center gap-2 text-slate-400 transition hover:text-white"
                        >

                            <ArrowLeft size={18} />

                            Back to user login

                        </Link>


                        {/* Main */}

                        <div className="max-w-xl">

                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">

                                <ShieldCheck
                                    size={30}
                                    className="text-violet-400"
                                />

                            </div>


                            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">

                                Digital Gallery

                                <span className="block text-violet-400">
                                    Administration
                                </span>

                            </h1>


                            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">

                                Securely access the administration panel
                                to manage users, statistics and platform
                                settings.

                            </p>


                            <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">

                                <LockKeyhole
                                    size={18}
                                    className="text-emerald-400"
                                />

                                Authorized administrators only.

                            </div>

                        </div>


                        <p className="text-sm text-slate-500">

                            © {new Date().getFullYear()} Digital Gallery

                        </p>

                    </div>

                </div>


                {/* ========================================
                    RIGHT SECTION
                ======================================== */}

                <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">

                    <div className="w-full max-w-md">


                        {/* MOBILE HEADER */}

                        <div className="mb-8 lg:hidden">

                            <Link
                                to="/login"
                                className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                            >

                                <ArrowLeft size={17} />

                                Back to user login

                            </Link>


                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">

                                <ShieldCheck
                                    size={24}
                                    className="text-violet-400"
                                />

                            </div>


                            <h1 className="text-3xl font-bold">

                                Admin Login

                            </h1>


                            <p className="mt-2 text-sm text-slate-400">

                                Sign in to your administrator account.

                            </p>

                        </div>


                        {/* DESKTOP HEADER */}

                        <div className="mb-8 hidden lg:block">

                            <h2 className="text-3xl font-bold">

                                Admin Login

                            </h2>


                            <p className="mt-2 text-sm text-slate-400">

                                Sign in to access the admin dashboard.

                            </p>

                        </div>


                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-5"
                        >


                            {/* ========================================
                                EMAIL
                            ======================================== */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-200"
                                >
                                    Admin Email
                                </label>


                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="admin@example.com"
                                    disabled={isSubmitting}

                                    {...register("email", {

                                        required:
                                            "Email is required",

                                        pattern: {

                                            value:
                                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                                            message:
                                                "Enter a valid email address"

                                        }

                                    })}

                                    className={`w-full rounded-xl border bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                                        errors.email
                                            ? "border-red-500/70"
                                            : "border-slate-800 focus:border-violet-500"
                                    }`}
                                />


                                {errors.email && (

                                    <p className="mt-1.5 text-xs text-red-400">

                                        {errors.email.message}

                                    </p>

                                )}

                            </div>


                            {/* ========================================
                                PASSWORD
                            ======================================== */}

                            <div>

                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-slate-200"
                                >
                                    Password
                                </label>


                                <div className="relative">

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        disabled={isSubmitting}

                                        {...register("password", {

                                            required:
                                                "Password is required"

                                        })}

                                        className={`w-full rounded-xl border bg-slate-900 px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                                            errors.password
                                                ? "border-red-500/70"
                                                : "border-slate-800 focus:border-violet-500"
                                        }`}
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        disabled={isSubmitting}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-200"
                                    >

                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}

                                    </button>

                                </div>


                                {errors.password && (

                                    <p className="mt-1.5 text-xs text-red-400">

                                        {errors.password.message}

                                    </p>

                                )}

                            </div>


                            {/* ========================================
                                ADMIN SECRET KEY
                            ======================================== */}

                            <div>

                                <label
                                    htmlFor="adminSecretKey"
                                    className="mb-2 block text-sm font-medium text-slate-200"
                                >
                                    Admin Secret Key
                                </label>


                                <div className="relative">

                                    <input
                                        id="adminSecretKey"
                                        type={
                                            showSecretKey
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="off"
                                        placeholder="Enter admin secret key"
                                        disabled={isSubmitting}

                                        {...register(
                                            "adminSecretKey",
                                            {
                                                required:
                                                    "Admin secret key is required"
                                            }
                                        )}

                                        className={`w-full rounded-xl border bg-slate-900 px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                                            errors.adminSecretKey
                                                ? "border-red-500/70"
                                                : "border-slate-800 focus:border-violet-500"
                                        }`}
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowSecretKey(
                                                (prev) => !prev
                                            )
                                        }
                                        disabled={isSubmitting}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-200"
                                    >

                                        {showSecretKey ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}

                                    </button>

                                </div>


                                {errors.adminSecretKey && (

                                    <p className="mt-1.5 text-xs text-red-400">

                                        {errors.adminSecretKey.message}

                                    </p>

                                )}


                                <p className="mt-2 text-xs leading-5 text-slate-600">

                                    Enter the administrator secret configured
                                    on the backend server.

                                </p>

                            </div>


                            {/* ========================================
                                SUBMIT
                            ======================================== */}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {isSubmitting ? (

                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                        Signing in...
                                    </>

                                ) : (

                                    <>
                                        <ShieldCheck size={18} />

                                        Admin Login
                                    </>

                                )}

                            </button>

                            <div className="mt-4 text-right">
                                <Link
                                    to="/forgot-password"
                                    state={{ role: "admin" }}
                                    className="text-sm text-violet-400 transition hover:text-violet-300"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                        </form>


                        {/* ========================================
                            REGISTER
                        ======================================== */}

                        <div className="mt-7 text-center">

                            <p className="text-sm text-slate-400">

                                Need an admin account?{" "}

                                <Link
                                    to="/admin/register"
                                    className="font-medium text-violet-400 transition hover:text-violet-300"
                                >
                                    Register as administrator
                                </Link>

                            </p>

                        </div>


                        {/* ========================================
                            USER LOGIN
                        ======================================== */}

                        <div className="mt-6 border-t border-slate-800 pt-6 text-center">

                            <Link
                                to="/login"
                                className="text-sm text-slate-500 transition hover:text-slate-300"
                            >

                                ← Continue as regular user

                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default AdminLogin;
