
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Forgetpassword = ({ open, setOpen }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) return;
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    console.log("OTP verified");
    setStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    console.log("Password reset successfully");
    setOpen(false);
    setStep(1);
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="w-[90%] rounded-2xl border border-zinc-800 bg-black p-7 text-white shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {step === 1 && (
          <>
            <AlertDialogHeader className="space-y-3 pr-8">
              <AlertDialogTitle className="text-center text-2xl font-bold">
                Forgot Password?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm leading-relaxed text-zinc-400">
                Enter your email address and we'll send you a 6-digit OTP.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="text-sm text-zinc-300">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 h-11 rounded-xl border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-white font-semibold text-black hover:bg-zinc-200"
              >
                Send OTP
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <AlertDialogHeader className="space-y-3 pr-8">
              <AlertDialogTitle className="text-center text-2xl font-bold">
                Verify OTP
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm leading-relaxed text-zinc-400">
                Enter the 6-digit OTP sent to
                <span className="ml-1 text-white">{email}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <div>
                <label htmlFor="otp" className="text-sm text-zinc-300">
                  OTP
                </label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="mt-2 h-14 rounded-xl border-zinc-800 bg-zinc-950 text-center text-2xl font-semibold tracking-[0.6em] text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                />
                <p className="mt-2 text-center text-xs text-zinc-600">
                  OTP is valid for 5 minutes
                </p>
              </div>

              <Button
                type="submit"
                disabled={otp.length !== 6}
                className="h-11 w-full rounded-xl bg-white font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Verify OTP
              </Button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <AlertDialogHeader className="space-y-3 pr-8">
              <AlertDialogTitle className="text-center text-2xl font-bold">
                Create New Password
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm leading-relaxed text-zinc-400">
                Your OTP has been verified. Create a new password for your account.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="text-sm text-zinc-300">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 h-11 rounded-xl border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-sm text-zinc-300">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-2 h-11 rounded-xl border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>

              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}

              <Button
                type="submit"
                disabled={!password || !confirmPassword || password !== confirmPassword}
                className="h-11 w-full rounded-xl bg-white font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reset Password
              </Button>
            </form>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Forgetpassword;

