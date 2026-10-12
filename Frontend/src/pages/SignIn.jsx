
import React, { useState, useContext, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "@/services/service";
import Forgetpassword from "./Forgetpassword";
import { UserConetxt } from "./UserProvider";
import {toast} from "sonner"
const SignIn = () => {
  const { setUserData, user } = useContext(UserConetxt);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {

      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await loginUser({ email, password }, setUserData);

      if (data) {
        toast.success("Login successful!");
        navigate("/", { replace: true });
      }
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#111114] text-white">
      <Forgetpassword open={open} setOpen={setOpen} />

      <div className="flex min-h-screen flex-col lg:flex-row">
       
        <section className="relative flex min-h-[240px] flex-1 flex-col justify-center
          px-6 py-10 sm:px-10 sm:py-12 lg:min-h-screen lg:px-12 xl:px-16">

          <Link
            to="/"
            className="absolute left-6 top-5 text-lg font-semibold
              sm:left-10 sm:top-8 lg:left-12 xl:left-16"
          >
            Box_Agent
          </Link>

          <div className="mx-auto mt-8 w-full max-w-xl lg:mt-0">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Build.
              <br />
              Run.
              <br />
              <span className="text-zinc-500">
                Fix Automatically.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-relaxed
              text-zinc-400 sm:mt-6 sm:text-base lg:text-lg">
              An AI-powered coding agent that writes, executes, and
              automatically fixes your code inside a secure sandbox.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-4
              text-xs text-zinc-400 sm:mt-10 sm:gap-x-8 sm:text-sm">
              <div>
                <p className="font-medium text-white">AI Coding</p>
                <p className="mt-1">Generate code</p>
              </div>

              <div>
                <p className="font-medium text-white">Sandbox</p>
                <p className="mt-1">Run securely</p>
              </div>

              <div>
                <p className="font-medium text-white">Auto Fix</p>
                <p className="mt-1">Fix errors</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Sign-in form */}
        <section className="flex flex-1 items-center justify-center
          border-t border-white/10 bg-[#121218] px-5 py-10
          sm:px-8 lg:min-h-screen lg:border-l lg:border-t-0
          lg:border-white/10 lg:px-10 xl:px-16">

          <div className="w-full max-w-sm">
            <div className="mb-7 text-center sm:mb-8">
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                Sign in to continue to Agent
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm text-zinc-400"
                >
                  Email
                </label>

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 h-11 border-white/10 bg-[#111114]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm text-zinc-400"
                >
                  Password
                </label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 h-11 border-white/10 bg-[#111114] pr-11"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3 top-[22px] text-zinc-500
                      transition-colors hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-white text-black
                  hover:bg-zinc-200 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-white hover:underline"
              >
                Sign Up
              </Link>
            </p>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-5 block w-full text-right text-sm
                text-zinc-300 underline underline-offset-4
                hover:text-white"
            >
              Forgot Password?
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignIn;