"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ArrowLeft, Mail, KeyRound, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/authApi";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [step, setStep] = useState<"DETAILS" | "OTP">("DETAILS");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSendingOtp(true);
    try {
      await authApi.sendOtp(email.trim());
      toast.success(`Verification code dispatched to ${email.trim()}`);
      setStep("OTP");
      setResendCooldown(60);
    } catch (err: any) {
      const msg = err.message || "Failed to send verification code.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    setError(null);
    try {
      await authApi.sendOtp(email.trim());
      toast.success(`New verification code sent to ${email.trim()}`);
      setResendCooldown(60);
    } catch (err: any) {
      const msg = err.message || "Failed to resend code.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        otp: cleanOtp,
      });
      toast.success("Email verified! Welcome to AVA.");
      router.push("/chat");
    } catch (err: any) {
      const msg = err.message || "Verification failed. Please check the code.";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-black to-black px-4 py-12 select-none overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-8 z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 border border-indigo-400/30">
            <Sparkles className="h-7 w-7 drop-shadow-sm" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">AVA</h1>
          <p className="mt-1.5 text-sm font-medium text-zinc-400">
            {step === "DETAILS" ? "Create your AVA account" : "Verify your email"}
          </p>
        </div>

        {/* Multi-step Form Card */}
        <div className="rounded-3xl border border-white/[0.1] bg-[#0a0a0e]/85 p-7 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 p-3.5 text-xs font-medium text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          {step === "DETAILS" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Input
                  id="name"
                  type="text"
                  label="Full Name"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <Input
                  id="password"
                  type="password"
                  label="Password (min 8 chars)"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="default"
                isLoading={isSendingOtp}
                className="w-full mt-2 gap-2 h-10 shadow-lg shadow-indigo-500/25"
              >
                <span>Continue &amp; Send Code</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <div className="rounded-2xl bg-[#111118] p-3.5 border border-white/[0.1] text-xs shadow-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate font-medium text-white">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("DETAILS");
                      setOtp("");
                      setError(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline shrink-0 cursor-pointer ml-2"
                  >
                    Change
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-zinc-400">
                  Enter the 6-digit verification code sent to your inbox.
                </p>
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="block text-xs font-semibold text-zinc-300 mb-1.5"
                >
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="text-center font-mono text-xl tracking-widest h-12 bg-[#0c0c12] border-white/[0.12] text-white"
                    required
                  />
                  <KeyRound className="absolute right-3.5 top-3.5 h-5 w-5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                {resendCooldown > 0 ? (
                  <span className="text-zinc-500 font-mono text-[11px]">
                    Resend code in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Resend code</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setStep("DETAILS")}
                  className="flex items-center gap-1 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back</span>
                </button>
              </div>

              <Button
                type="submit"
                variant="default"
                isLoading={isLoading}
                disabled={otp.trim().length !== 6}
                className="w-full gap-2 h-10 shadow-lg shadow-indigo-500/25"
              >
                <span>Verify &amp; Create Account</span>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

