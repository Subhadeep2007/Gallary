import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { resetPassword } from "../../services/auth/auth.service.js";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: emailFromState,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      const email = formData.email.trim().toLowerCase();

      const response = await resetPassword({
        email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      toast.success(
        response?.data?.message ||
          "Password reset successfully. Please login."
      );

      navigate(location.state?.role === "admin" ? "/admin/login" : "/login", {
        replace: true,
        state: {
          passwordReset: true,
          email,
          role: location.state?.role,
        },
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Password reset failed. Please try again.";

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
              to="/login"
              className="inline-flex w-fit items-center gap-2 text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to login
            </Link>

            {/* Main Content */}
            <div className="max-w-xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
                <LockKeyhole
                  size={30}
                  className="text-violet-400"
                />
              </div>

              <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                Create a new
                <span className="block text-violet-400">
                  password
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Enter the OTP sent to your email and create a new secure
                password for your Digital Gallery account.
              </p>

              <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
                <ShieldCheck
                  size={18}
                  className="text-emerald-400"
                />
                Your new password will be securely encrypted.
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
                <LockKeyhole
                  size={24}
                  className="text-violet-400"
                />
              </div>

              <h1 className="text-3xl font-bold">
                Reset Password
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Enter the OTP and your new password.
              </p>
            </div>

            {/* Desktop Header */}
            <div className="mb-8 hidden lg:block">
              <h2 className="text-3xl font-bold">
                Reset Password
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Verify the OTP and create a new password.
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

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={Boolean(emailFromState) || isSubmitting}
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  className={`w-full rounded-xl border bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60 ${
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

              {/* OTP */}
              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Reset OTP
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit OTP"
                  disabled={isSubmitting}
                  {...register("otp", {
                    required: "OTP is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "OTP must be exactly 6 digits",
                    },
                  })}
                  onInput={(event) => {
                    event.target.value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);
                  }}
                  className={`w-full rounded-xl border bg-slate-900 px-4 py-3.5 text-center text-lg font-semibold tracking-[0.35em] text-white outline-none transition placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-600 ${
                    errors.otp
                      ? "border-red-500/70"
                      : "border-slate-800 focus:border-violet-500"
                  }`}
                />

                {errors.otp && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.otp.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your new password"
                    disabled={isSubmitting}
                    {...register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message:
                          "Password must be at least 8 characters",
                      },
                    })}
                    className={`w-full rounded-xl border bg-slate-900 px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                      errors.newPassword
                        ? "border-red-500/70"
                        : "border-slate-800 focus:border-violet-500"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-200 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.newPassword && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    disabled={isSubmitting}
                    {...register("confirmPassword", {
                      required:
                        "Please confirm your new password",
                      validate: (value) =>
                        value === newPassword ||
                        "Passwords do not match",
                    })}
                    className={`w-full rounded-xl border bg-slate-900 px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                      errors.confirmPassword
                        ? "border-red-500/70"
                        : "border-slate-800 focus:border-violet-500"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-200 disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.confirmPassword.message}
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
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Reset Password
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

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
