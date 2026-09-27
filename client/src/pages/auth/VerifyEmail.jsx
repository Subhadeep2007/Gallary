import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  verifyEmail,
  resendVerificationOTP,
} from "../../services/auth/auth.service.js";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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
    },
  });
  const enteredEmail = watch("email");

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      const email = formData.email.trim().toLowerCase();

      const response = await verifyEmail({
        email,
        otp: formData.otp,
      });

      toast.success(
        response?.data?.message || "Email verified successfully!"
      );

      navigate(location.state?.role === "admin" ? "/admin/login" : "/login", {
        replace: true,
        state: {
          verified: true,
          email,
        },
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Email verification failed. Please try again.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    const email = (enteredEmail || "").trim().toLowerCase();

    if (!email) {
      toast.error("Email address is required.");
      return;
    }

    try {
      setIsResending(true);

      const response = await resendVerificationOTP(email);

      toast.success(
        response?.data?.message ||
          "A new verification OTP has been sent to your email."
      );

      setResendCooldown(60);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to resend OTP. Please try again.";

      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left Section */}
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-950 to-slate-950" />

          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            <Link
              to="/login"
              className="inline-flex w-fit items-center gap-2 text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to login
            </Link>

            <div className="max-w-xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
                <MailCheck
                  size={30}
                  className="text-violet-400"
                />
              </div>

              <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                Verify your
                <span className="block text-violet-400">
                  email address
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                We sent a verification code to your email address.
                Enter the OTP to activate your Digital Gallery account.
              </p>

              <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
                <ShieldCheck
                  size={18}
                  className="text-emerald-400"
                />
                Email verification helps keep your account secure.
              </div>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Digital Gallery
            </p>
          </div>
        </div>

        {/* Right Section */}
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
                <MailCheck
                  size={24}
                  className="text-violet-400"
                />
              </div>

              <h1 className="text-3xl font-bold">
                Verify Email
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Enter the OTP sent to your email.
              </p>
            </div>

            {/* Desktop Header */}
            <div className="mb-8 hidden lg:block">
              <h2 className="text-3xl font-bold">
                Verify Email
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Enter the verification code sent to your email.
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
                  disabled={Boolean(emailFromState) || isSubmitting}
                  autoComplete="email"
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
                  Verification OTP
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

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <MailCheck size={18} />
                    Verify Email
                  </>
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Didn't receive the OTP?
              </p>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || resendCooldown > 0}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-violet-400 transition hover:text-violet-300 disabled:cursor-not-allowed disabled:text-slate-600"
              >
                <RefreshCw
                  size={16}
                  className={isResending ? "animate-spin" : ""}
                />

                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : "Resend OTP"}
              </button>
            </div>

            {/* Login */}
            <div className="mt-7 border-t border-slate-800 pt-6 text-center">
              <p className="text-sm text-slate-400">
                Already verified?{" "}
                <Link
                  to={location.state?.role === "admin" ? "/admin/login" : "/login"}
                  className="font-medium text-violet-400 transition hover:text-violet-300"
                >
                  Login
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
