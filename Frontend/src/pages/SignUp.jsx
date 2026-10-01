import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/services/service";
import Otp from "./Otp";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setusername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [Open, setisOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !name || !password || !username) {
      return;
    }

    try {
      const data = await registerUser({
        email,
        name,
        password,
        username,
      });

      if (data) {
        setisOpen(true);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#111114]">


      <Otp
        Open={Open}
        setisOpen={setisOpen}
        email={email}
      />

   
      <div className="relative w-2/3 min-h-screen bg-[#111114] text-white flex flex-col justify-center px-16">

        <div className="absolute top-8 left-10">
          <h2 className="text-xl font-semibold">
            Box_Agent
          </h2>
        </div>

        <div className="max-w-xl">
          <h1 className="text-5xl font-bold leading-tight">
            Build.
            <br />
            Run.
            <br />
            <span className="text-zinc-500">
              Fix Automatically.
            </span>
          </h1>

          <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
            An AI-powered coding agent that writes, executes, and
            automatically fixes your code inside a secure sandbox.
          </p>

          <div className="flex gap-8 mt-10 text-sm text-zinc-400">
            <div>
              <p className="text-white font-medium">
                AI Coding
              </p>
              <p className="mt-1">
                Generate code
              </p>
            </div>

            <div>
              <p className="text-white font-medium">
                Sandbox
              </p>
              <p className="mt-1">
                Run securely
              </p>
            </div>

            <div>
              <p className="text-white font-medium">
                Auto Fix
              </p>
              <p className="mt-1">
                Fix errors
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/3 min-h-screen border-l border-white/20 bg-[#121218] text-white flex items-center justify-center px-8">

        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold">
              Create an account
            </h1>

            <p className="text-zinc-500 text-sm mt-2">
              Start building with Agent
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="text-sm text-zinc-400">
                Name
              </label>

              <Input
                type="text"
                placeholder="Varun"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-10 bg-[#111114] border-white/10"
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Username
              </label>

              <Input
                type="text"
                placeholder="Vnix"
                value={username}
                onChange={(e) => setusername(e.target.value)}
                className="mt-2 h-10 bg-[#111114] border-white/10"
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Email
              </label>

              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-10 bg-[#111114] border-white/10"
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Password
              </label>

              <div className="relative">

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 h-10 bg-[#111114] border-white/10 pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>

              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-white text-black hover:bg-zinc-200"
            >
              Create Account
            </Button>

          </form>

          {Open && (
            <div className="mt-5">
              <Button
                type="button"
                onClick={() => setisOpen(true)}
                variant="outline"
                className="
                  w-full
                  h-10
                  border-white/10
                  bg-transparent
                  text-zinc-300
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Verify OTP
              </Button>
            </div>
          )}

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}

            <Link
              to="/login"
              className="text-white hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default SignUp;

