import {
    useState
} from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    Eye,
    EyeOff,
    Images,
    LockKeyhole,
    Mail,
    ArrowRight,
    ShieldCheck
} from "lucide-react";

import {
    useForm
} from "react-hook-form";

import {
    toast
} from "react-hot-toast";

import useAuth
from "../../hooks/useAuth.js";


// ========================================
// LOGIN PAGE
// ========================================

const Login = () => {

    const navigate =
        useNavigate();

    const location =
        useLocation();


    const {
        loginUser
    } = useAuth();


    // ========================================
    // PASSWORD VISIBILITY
    // ========================================

    const [
        showPassword,
        setShowPassword
    ] = useState(false);


    // ========================================
    // FORM
    // ========================================

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm({

        mode: "onTouched",

        defaultValues: {

            email: "",

            password: ""

        }

    });


    // ========================================
    // LOGIN SUBMIT
    // ========================================

    const onSubmit = async (
        formData
    ) => {

        try {

            const response =
                await loginUser({

                    email:
                        formData.email.trim(),

                    password:
                        formData.password

                });


            // ========================================
            // EMAIL VERIFICATION REQUIRED
            // ========================================

            if (
                response?.data
                    ?.requiresEmailVerification
            ) {

                toast.success(
                    "Please verify your email"
                );


                navigate(
                    "/verify-email",
                    {
                        state: {

                            email:
                                response.data.email

                        }

                    }
                );


                return;

            }


            toast.success(
                "Welcome back!"
            );


            // ========================================
            // REDIRECT
            // ========================================

            const from =
                location.state?.from;


            if (from) {

                navigate(
                    from,
                    {
                        replace: true
                    }
                );

            } else {

                navigate(
                    "/gallery",
                    {
                        replace: true
                    }
                );

            }

        } catch (error) {

            const message =
                error?.response?.data?.errors?.[0]?.message ||
                error?.response
                    ?.data
                    ?.message ||
                error?.message ||
                "Login failed. Please try again.";

            toast.error(
                message
            );

        }

    };


    return (

        <div className="
            min-h-screen
            bg-slate-950
            text-white
        ">

            <div className="
                grid
                min-h-screen
                lg:grid-cols-2
            ">

                {/* ========================================
                    LEFT SIDE - BRANDING
                ======================================== */}

                <div className="
                    relative
                    hidden
                    overflow-hidden
                    lg:flex
                    lg:min-h-screen
                    lg:flex-col
                    lg:justify-between
                    lg:p-10
                    xl:p-14
                ">

                    {/* Background decoration */}

                    <div className="
                        absolute
                        -left-32
                        -top-32
                        h-96
                        w-96
                        rounded-full
                        bg-cyan-500/10
                        blur-3xl
                    " />

                    <div className="
                        absolute
                        -bottom-32
                        -right-32
                        h-96
                        w-96
                        rounded-full
                        bg-violet-500/10
                        blur-3xl
                    " />


                    {/* Brand */}

                    <div className="
                        relative
                        z-10
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-2xl
                            bg-white
                            text-slate-950
                            shadow-lg
                            shadow-black/20
                        ">

                            <Images
                                className="h-6 w-6"
                            />

                        </div>


                        <div>

                            <p className="
                                text-lg
                                font-semibold
                                tracking-tight
                            ">
                                Digital Gallery
                            </p>

                            <p className="
                                text-xs
                                text-slate-500
                            ">
                                Private. Local.cloudinay. Yours.
                            </p>

                        </div>

                    </div>


                    {/* Main branding */}

                    <div className="
                        relative
                        z-10
                        max-w-xl
                    ">

                        <div className="
                            mb-6
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-white/10
                            bg-white/[0.03]
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-slate-300
                            backdrop-blur-sm
                        ">

                            <ShieldCheck
                                className="
                                    h-4
                                    w-4
                                    text-emerald-400
                                "
                            />

                            Your private online gallery

                        </div>


                        <h1 className="
                            text-5xl
                            font-bold
                            leading-[1.05]
                            tracking-tight
                            xl:text-6xl
                        ">

                            Keep your memories
                            <span className="
                                block
                                text-slate-400
                            ">
                                close to you.
                            </span>

                        </h1>


                        <p className="
                            mt-6
                            max-w-lg
                            text-base
                            leading-7
                            text-slate-400
                        ">

                            Store, organize and manage
                            your photos, videos and PDFs
                            with an online-first gallery
                            built around your device.

                        </p>


                        <div className="
                            mt-8
                            grid
                            max-w-md
                            grid-cols-3
                            gap-3
                        ">

                            <div className="
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/[0.03]
                                p-4
                            ">

                                <p className="
                                    text-sm
                                    font-semibold
                                ">
                                    Online
                                </p>

                                <p className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                ">
                                    Works without internet
                                </p>

                            </div>


                            <div className="
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/[0.03]
                                p-4
                            ">

                                <p className="
                                    text-sm
                                    font-semibold
                                ">
                                    Private
                                </p>

                                <p className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                ">
                                    Files stay on cloud
                                </p>

                            </div>


                            <div className="
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/[0.03]
                                p-4
                            ">

                                <p className="
                                    text-sm
                                    font-semibold
                                ">
                                    Simple
                                </p>

                                <p className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                ">
                                    Fast album experience
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* Footer */}

                    <p className="
                        relative
                        z-10
                        text-xs
                        text-slate-600
                    ">

                        © {new Date().getFullYear()}
                        Digital Gallery

                    </p>

                </div>


                {/* ========================================
                    RIGHT SIDE - LOGIN
                ======================================== */}

                <div className="
                    flex
                    min-h-screen
                    items-center
                    justify-center
                    px-4
                    py-8
                    sm:px-6
                    lg:px-10
                    xl:px-16
                ">

                    <div className="
                        w-full
                        max-w-md
                    ">

                        {/* Mobile brand */}

                        <div className="
                            mb-8
                            flex
                            items-center
                            gap-3
                            lg:hidden
                        ">

                            <div className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-2xl
                                bg-white
                                text-slate-950
                            ">

                                <Images
                                    className="h-6 w-6"
                                />

                            </div>


                            <div>

                                <p className="
                                    text-lg
                                    font-semibold
                                ">
                                    Digital Gallery
                                </p>

                                <p className="
                                    text-xs
                                    text-slate-500
                                ">
                                    Private. Local.cloudinay. Yours.
                                </p>

                            </div>

                        </div>


                        {/* Heading */}

                        <div>

                            <p className="
                                text-sm
                                font-medium
                                text-slate-400
                            ">
                                Welcome back
                            </p>

                            <h2 className="
                                mt-2
                                text-3xl
                                font-bold
                                tracking-tight
                                sm:text-4xl
                            ">
                                Sign in to your gallery
                            </h2>

                            <p className="
                                mt-3
                                text-sm
                                leading-6
                                text-slate-500
                            ">
                                Enter your account details
                                to continue.
                            </p>

                        </div>


                        {/* Form */}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="
                                mt-8
                                space-y-5
                            "
                        >

                            {/* Email */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-slate-200
                                    "
                                >
                                    Email address
                                </label>


                                <div className="
                                    relative
                                ">

                                    <Mail className="
                                        pointer-events-none
                                        absolute
                                        left-4
                                        top-1/2
                                        h-5
                                        w-5
                                        -translate-y-1/2
                                        text-slate-500
                                    " />


                                    <input

                                        id="email"

                                        type="email"

                                        autoComplete="email"

                                        placeholder="you@example.com"

                                        {...register(
                                            "email",
                                            {

                                                required:
                                                    "Email is required",

                                                pattern: {

                                                    value:
                                                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                                                    message:
                                                        "Please enter a valid email address"

                                                }

                                            }
                                        )}

                                        className={`
                                            w-full
                                            rounded-2xl
                                            border
                                            bg-white/[0.03]
                                            py-3.5
                                            pl-12
                                            pr-4
                                            text-sm
                                            text-white
                                            outline-none
                                            transition
                                            placeholder:text-slate-600
                                            focus:bg-white/[0.05]
                                            focus:ring-4
                                            ${
                                                errors.email
                                                    ? `
                                                        border-red-400/50
                                                        focus:border-red-400
                                                        focus:ring-red-400/10
                                                    `
                                                    : `
                                                        border-white/10
                                                        focus:border-cyan-400/60
                                                        focus:ring-cyan-400/10
                                                    `
                                            }
                                        `}

                                    />

                                </div>


                                {errors.email && (

                                    <p className="
                                        mt-2
                                        text-xs
                                        text-red-400
                                    ">
                                        {errors.email.message}
                                    </p>

                                )}

                            </div>


                            {/* Password */}

                            <div>

                                <div className="
                                    mb-2
                                    flex
                                    items-center
                                    justify-between
                                ">

                                    <label
                                        htmlFor="password"
                                        className="
                                            text-sm
                                            font-medium
                                            text-slate-200
                                        "
                                    >
                                        Password
                                    </label>


                                    <Link
                                        to="/forgot-password"
                                        className="
                                            text-xs
                                            font-medium
                                            text-cyan-400
                                            transition
                                            hover:text-cyan-300
                                        "
                                    >
                                        Forgot password?
                                    </Link>

                                </div>


                                <div className="
                                    relative
                                ">

                                    <LockKeyhole className="
                                        pointer-events-none
                                        absolute
                                        left-4
                                        top-1/2
                                        h-5
                                        w-5
                                        -translate-y-1/2
                                        text-slate-500
                                    " />


                                    <input

                                        id="password"

                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }

                                        autoComplete="current-password"

                                        placeholder="Enter your password"

                                        {...register(
                                            "password",
                                            {

                                                required:
                                                    "Password is required",

                                                minLength: {

                                                    value:
                                                        8,

                                                    message:
                                                        "Password must be at least 8 characters"

                                                }

                                            }
                                        )}

                                        className={`
                                            w-full
                                            rounded-2xl
                                            border
                                            bg-white/[0.03]
                                            py-3.5
                                            pl-12
                                            pr-12
                                            text-sm
                                            text-white
                                            outline-none
                                            transition
                                            placeholder:text-slate-600
                                            focus:bg-white/[0.05]
                                            focus:ring-4
                                            ${
                                                errors.password
                                                    ? `
                                                        border-red-400/50
                                                        focus:border-red-400
                                                        focus:ring-red-400/10
                                                    `
                                                    : `
                                                        border-white/10
                                                        focus:border-cyan-400/60
                                                        focus:ring-cyan-400/10
                                                    `
                                            }
                                        `}

                                    />


                                    <button

                                        type="button"

                                        onClick={() =>
                                            setShowPassword(
                                                (value) =>
                                                    !value
                                            )
                                        }

                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            flex
                                            h-9
                                            w-9
                                            -translate-y-1/2
                                            items-center
                                            justify-center
                                            rounded-xl
                                            text-slate-500
                                            transition
                                            hover:bg-white/5
                                            hover:text-slate-300
                                        "

                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }

                                    >

                                        {showPassword ? (

                                            <EyeOff
                                                className="h-5 w-5"
                                            />

                                        ) : (

                                            <Eye
                                                className="h-5 w-5"
                                            />

                                        )}

                                    </button>

                                </div>


                                {errors.password && (

                                    <p className="
                                        mt-2
                                        text-xs
                                        text-red-400
                                    ">
                                        {errors.password.message}
                                    </p>

                                )}

                            </div>


                            {/* Submit */}

                            <button

                                type="submit"

                                disabled={isSubmitting}

                                className="
                                    group
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-white
                                    px-5
                                    py-3.5
                                    text-sm
                                    font-semibold
                                    text-slate-950
                                    shadow-lg
                                    shadow-black/20
                                    transition
                                    hover:bg-slate-100
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "

                            >

                                {isSubmitting
                                    ? "Signing in..."
                                    : "Sign in"
                                }


                                {!isSubmitting && (

                                    <ArrowRight className="
                                        h-4
                                        w-4
                                        transition
                                        group-hover:translate-x-1
                                    " />

                                )}

                            </button>

                        </form>


                        {/* Register */}

                        <div className="
                            mt-7
                            text-center
                        ">

                            <p className="
                                text-sm
                                text-slate-500
                            ">

                                Don't have an account?{" "}

                                <Link
                                    to="/register"
                                    className="
                                        font-semibold
                                        text-cyan-400
                                        transition
                                        hover:text-cyan-300
                                    "
                                >
                                    Create one
                                </Link>

                            </p>

                        </div>


                        {/* Admin */}

                        <div className="
                            mt-6
                            border-t
                            border-white/10
                            pt-6
                            text-center
                        ">

                            <Link
                                to="/admin/login"
                                className="
                                    text-xs
                                    font-medium
                                    text-slate-500
                                    transition
                                    hover:text-slate-300
                                "
                            >
                                Admin login
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};


export default Login;
