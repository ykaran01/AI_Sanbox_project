import React, { useState } from "react";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      email,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
            <Code2 className="text-black" size={20} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">
            Welcome back
          </h1>

          <p className="text-sm text-zinc-500 mt-2">
            Sign in to continue to Agent
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm text-zinc-400">
              Email
            </label>

            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 bg-[#111114] border-white/10"
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Password
            </label>

            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 bg-[#111114] border-white/10"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-zinc-200"
          >
            Sign In
          </Button>

        </form>

        {/* Sign up */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?{" "}
          <button className="text-white hover:underline">
            Sign up
          </button>
        </p>

      </div>
    </div>
  );
};

export default SignIn;