import React, { useState } from "react";
import { EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { loginUser } from "@/services/service";
import { useNavigate } from "react-router-dom";
import Forgetpassword from "./Forgetpassword";
import { UserConetxt } from "./UserProvider";
import { useContext } from "react";

const SignIn = () => {
  const {setUserData ,user} = useContext(UserConetxt)
  const navigate =  useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setshowpassword] = useState(false)
  const [open, setOpen] = useState(false)
  if(user){
      navigate('/')
  }
  const handleSubmit = async(e) => {
    e.preventDefault();
    if(!email || !password)
      return;
    try{
      const data = await loginUser({email,password},setUserData);
      if(data){
        navigate('/')
      }
    }
    catch(err){
      console.log(err.message)
    }
  };

  return (
    <div className="flex w-full h-full bg-amber-300"  >
      <Forgetpassword open={open}  setOpen={setOpen}/>
      <div className="left w-2/3 min-h-screen bg-[#111114] text-white flex flex-col justify-center px-16">

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
            <span className="text-zinc-500">Fix Automatically.</span>
          </h1>

          <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
            An AI-powered coding agent that writes, executes, and
            automatically fixes your code inside a secure sandbox.
          </p>


          <div className="flex gap-8 mt-10 text-sm text-zinc-400">
            <div>
              <p className="text-white font-medium">AI Coding</p>
              <p className="mt-1">Generate code</p>
            </div>

            <div>
              <p className="text-white font-medium">Sandbox</p>
              <p className="mt-1">Run securely</p>
            </div>

            <div>
              <p className="text-white font-medium">Auto Fix</p>
              <p className="mt-1">Fix errors</p>
            </div>
          </div>

        </div>

      </div>
      <div className="  right w-1/3 min-h-screen  border-l border-l-white/20  bg-[#121218] text-white flex items-center justify-center px-4">

        <div className="w-full max-w-sm">

          <div className="text-center mb-6">
            <h1 className="text-4xl font-semibold">
              Welcome back
            </h1>

            <p className=" text-zinc-500 mt-2">
              Sign in to continue to Agent
            </p>
          </div>
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
                  type= {showpassword?"text":"password" }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 h-10 bg-[#111114] border-white/10 pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={()=>{
                    setshowpassword(prev=>!prev)
                  }}
                  className="absolute right-3 top-2/3 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <EyeOff size={18} />
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-white h-10 text-black hover:bg-zinc-200"
            >
              Sign In
            </Button>
          </form>
          <p className="text-center text-sm text-zinc-500 mt-6">
            Don't have an account?{" "}
            <button className="text-white   hover:underline">
              <Link to="/signup" >Sign Up</Link>
            </button>
          </p>
          <button  onClick={()=>{
            setOpen(true)
          }} className="text-center underline w-full  flex justify-end text-sm text-white mt-6">
            Forget Password?
          </button>
        </div>
      </div>
    </div>

  );
};

export default SignIn;