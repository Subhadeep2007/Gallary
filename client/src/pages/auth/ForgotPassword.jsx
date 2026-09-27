import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { forgotPassword } from "../../services/auth/auth.service.js";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || "";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: initialEmail,
    },
  });

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      const email = formData.email.trim().toLowerCase();

      const response = await forgotPassword(email);

      toast.success(
        response?.data?.message ||
          "Password reset OTP has been sent to your email."
      );

      navigate("/reset-password", {
        replace: true,
        state: {
          email,
          role: location.state?.role,
        },
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to send reset OTP. Please try again.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left Branding Section */}
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-950 to-slate-950" />

          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Back */}
            <Link
              to={location.state?.role === "admin" ? "/admin/login" : "/login"}
              className="inline-flex w-fit items-center gap-2 text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to login
            </Link>

            {/* Main Content */}
            <div className="max-w-xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
                <KeyRound
                  size={30}
                  className="text-violet-400"
                />
              </div>

              <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                Forgot your
                <span className="block text-violet-400">
                  password?
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                No problem. Enter your registered email address and we will
                send you a secure OTP to reset your password.
              </p>

              <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
                <ShieldCheck
                  size={18}
                  className="text-emerald-400"
                />
                Password reset is protected by email verification.
              </div>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Digital Gallery
            </p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">

            {/* Mobile Header */}
            <div className="mb-8 lg:hidden">
              <Link
                to="/login"
                className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <ArrowLeft size={17} />
                Back to login
              </Link>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                <KeyRound
                  size={24}
                  className="text-violet-400"
                />
              </div>

              <h1 className="text-3xl font-bold">
                Forgot Password
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Enter your email to receive a reset OTP.
              </p>
            </div>

            {/* Desktop Header */}
            <div className="mb-8 hidden lg:block">
              <h2 className="text-3xl font-bold">
                Forgot Password
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Enter your registered email address.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    className={`w-full rounded-xl border bg-slate-900 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                      errors.email
                        ? "border-red-500/70 focus:border-red-400"
                        : "border-slate-800 focus:border-violet-500"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Send Reset OTP
                  </>
                )}
              </button>
            </form>

            {/* Login */}
            <p className="mt-7 text-center text-sm text-slate-400">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-medium text-violet-400 transition hover:text-violet-300"
              >
                Login
              </Link>
            </p>

            {/* Register */}
            <div className="mt-6 border-t border-slate-800 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-violet-400 transition hover:text-violet-300"
                >
                  Create account
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
