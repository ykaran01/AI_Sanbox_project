import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/services/service";
import Otp from "./Otp";
import { toast } from "sonner";
const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [Open, setisOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !name.trim() || !password || !username.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await registerUser({
        email,
        name,
        password,
        username,
      });

      if (data) {

        setisOpen(true);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (err) {
      toast.error(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#111114] text-white">
      <Otp Open={Open} setisOpen={setisOpen} email={email} />

      <div className="flex min-h-screen flex-col lg:flex-row">
        
        <section
          className="relative flex flex-1 flex-col justify-center
          px-6 pb-10 pt-16 sm:px-10 sm:py-12
          lg:min-h-screen lg:px-12 lg:py-16
          xl:px-16"
        >
          <Link
            to="/"
            className="absolute left-6 top-5 text-lg font-semibold
            sm:left-10 sm:top-8 lg:left-12 xl:left-16"
          >
            Box_Agent
          </Link>

          <div className="mx-auto mt-5 w-full max-w-xl lg:mt-0">
            <h1
              className="text-4xl font-bold leading-tight
              sm:text-5xl lg:text-6xl"
            >
              Build.
              <br />
              Run.
              <br />
              <span className="text-zinc-500">
                Fix Automatically.
              </span>
            </h1>

            <p
              className="mt-4 max-w-lg text-sm leading-relaxed
              text-zinc-400 sm:mt-6 sm:text-base lg:text-lg"
            >
              An AI-powered coding agent that writes, executes, and
              automatically fixes your code inside a secure sandbox.
            </p>

            <div
              className="mt-6 flex flex-wrap gap-x-6 gap-y-4
              text-xs text-zinc-400 sm:mt-10 sm:gap-x-8 sm:text-sm"
            >
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

        <section
          className="flex flex-1 items-center justify-center
          border-t border-white/10 bg-[#121218]
          px-5 py-10 sm:px-8 sm:py-12
          lg:min-h-screen lg:border-l lg:border-t-0
          lg:border-white/10 lg:px-10 lg:py-12
          xl:px-16"
        >
          <div className="w-full max-w-sm">
            <div className="mb-6 text-center sm:mb-8">
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Create an account
              </h2>

              <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                Start building with Agent
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm text-zinc-400"
                >
                  Name
                </label>

                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 h-11 border-white/10 bg-[#111114]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="text-sm text-zinc-400"
                >
                  Username
                </label>

                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 h-11 border-white/10 bg-[#111114]"
                  required
                />
              </div>

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
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 h-11 border-white/10 bg-[#111114] pr-11"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3 top-[22px]
                    text-zinc-500 transition-colors hover:text-white"
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
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            {Open && (
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => setisOpen(true)}
                  variant="outline"
                  className="h-11 w-full border-white/10
                  bg-transparent text-zinc-300
                  hover:bg-white/5 hover:text-white"
                >
                  Verify OTP
                </Button>
              </div>
            )}

            <p
              className="mt-6 text-center text-sm leading-relaxed
              text-zinc-500"
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-white hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignUp;