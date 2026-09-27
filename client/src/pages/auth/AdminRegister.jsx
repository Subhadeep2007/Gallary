import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { registerAdmin } from "../../services/auth/auth.service.js";

const AdminRegister = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      adminSecretKey: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (formData) => {
    const email = formData.email.trim().toLowerCase();

    try {
      setIsSubmitting(true);

      const response = await registerAdmin({
        name: formData.name.trim(),
        email,
        password: formData.password,
        adminSecretKey: formData.adminSecretKey,
      });

      toast.success(
        response?.data?.message ||
          "Admin registration successful. Please verify your email."
      );

      navigate("/verify-email", {
        replace: true,
        state: {
          email,
          role: "admin",
        },
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Admin registration failed. Please try again.";

      /*
        IMPORTANT:

        Backend admin create ho chuka ho sakta hai,
        lekin verification email send fail hone par
        backend 500 return karta hai.

        Is situation mein bhi Verify Email page open karenge,
        taki user "Resend OTP" kar sake.
      */
      const accountCreatedButEmailFailed =
        (
          message.toLowerCase().includes("admin account created") &&
          message.toLowerCase().includes("verification email")
        ) || (
          error?.response?.status === 503 &&
          message.toLowerCase().includes("verification email")
        );

      if (accountCreatedButEmailFailed) {
        toast.error(
          "Admin account created, but verification email was not sent. You can resend the OTP."
        );

        navigate("/verify-email", {
          replace: true,
          state: {
            email,
            role: "admin",
          },
        });

        return;
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left Branding */}
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-950 to-slate-950" />

          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            <Link
              to="/admin/login"
              className="inline-flex w-fit items-center gap-2 text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to admin login
            </Link>

            <div className="max-w-xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
                <ShieldCheck
                  size={30}
                  className="text-violet-400"
                />
              </div>

              <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                Create an
                <span className="block text-violet-400">
                  administrator account
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Administrator access is restricted. Use the authorized
                secret key to create an administration account.
              </p>

              <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
                <KeyRound
                  size={18}
                  className="text-emerald-400"
                />
                Admin registration requires a valid secret key.
              </div>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Digital Gallery
            </p>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">

            {/* Mobile Header */}
            <div className="mb-8 lg:hidden">
              <Link
                to="/admin/login"
                className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <ArrowLeft size={17} />
                Back to admin login
              </Link>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                <ShieldCheck
                  size={24}
                  className="text-violet-400"
                />
              </div>

              <h1 className="text-3xl font-bold">
                Admin Registration
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Create a secure administrator account.
              </p>
            </div>

            {/* Desktop Header */}
            <div className="mb-8 hidden lg:block">
              <h2 className="text-3xl font-bold">
                Admin Registration
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Enter the required details to create your admin account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message:
                        "Name must be at least 2 characters",
                    },
                    maxLength: {
                      value: 50,
                      message:
                        "Name must not exceed 50 characters",
                    },
                  })}
                  className={`w-full rounded-xl border bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                    errors.name
                      ? "border-red-500/70"
                      : "border-slate-800 focus:border-violet-500"
                  }`}
                />

                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
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
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message:
                        "Enter a valid email address",
                    },
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

              {/* Password */}
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
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    disabled={isSubmitting}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message:
                          "Password must be at least 8 characters",
                      },
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-200 disabled:cursor-not-allowed"
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                    {...register("confirmPassword", {
                      required:
                        "Please confirm your password",
                      validate: (value) =>
                        value === password ||
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
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
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

              {/* Admin Secret */}
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
                    {...register("adminSecretKey", {
                      required:
                        "Admin secret key is required",
                    })}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-200 disabled:cursor-not-allowed"
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
                    Creating Admin...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Admin Account
                  </>
                )}
              </button>
            </form>

            {/* Login */}
            <p className="mt-7 text-center text-sm text-slate-400">
              Already have an admin account?{" "}
              <Link
                to="/admin/login"
                className="font-medium text-violet-400 transition hover:text-violet-300"
              >
                Admin Login
              </Link>
            </p>

            {/* User Register */}
            <div className="mt-6 border-t border-slate-800 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Need a regular account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-violet-400 transition hover:text-violet-300"
                >
                  Create user account
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
