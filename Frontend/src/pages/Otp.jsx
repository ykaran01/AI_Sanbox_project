
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { verifyotp } from "@/services/service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const Otp = ({Open,setisOpen,email}) => {
  const navigate =  useNavigate()
  const [otp, setotp] = useState("")
  const handleSubmit  = async(e)=>{
    
    if(!otp || otp.length!==6){
      return;
    }
    try{
      const data =  await verifyotp(email,otp)
      if(data){
        navigate('/login')
      }
    }catch(err){
      console.log(err.message)
    }
      
  }

  return (
    <AlertDialog open={Open} onOpenChange={setisOpen} >
      <AlertDialogContent
        className="
          w-[90%] sm:max-w-[300px]
          rounded-2xl
          border border-zinc-800
          bg-black
          p-5
          shadow-2xl shadow-black/50
        "
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className="
              text-center
              text-2xl
              font-bold
              tracking-tight
              text-white
            "
          >
            Verify OTP
          </AlertDialogTitle>

          <AlertDialogDescription
            className="
              text-center
              text-sm
              leading-relaxed
              text-zinc-400
            "
          >
            Enter the 6-digit OTP sent to your email address.
          </AlertDialogDescription>

          <div className="flex flex-col gap-2 pt-5">
            <label
              htmlFor="otp"
              className="
                text-sm
                font-medium
                text-zinc-300
              "
            >
              OTP
            </label>

            <input
              id="otp"
              type="text"
              value={otp}
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              onChange={(e)=>{
                setotp(e.target.value)
              }}
              className="
                h-10
                w-full
                rounded-xl
                border border-zinc-700
                bg-zinc-950
                px-4
                text-center
                text-2xl
                font-semibold
                tracking-[0.6em]
                text-white
              "
            />

            <p
              className="
                pt-1
                text-center
                text-xs
                text-zinc-500
              "
            >
              OTP is valid for 5 minutes
            </p>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-5 bg-black">
          <button
          onClick={()=>handleSubmit()}

            className="
              h-11
              w-full
              rounded-xl
              bg-white
              text-sm
              font-semibold
              text-black

              transition-all
              duration-200

              hover:bg-zinc-200
              hover:scale-[1.01]
            "
          >

            Verify OTP
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Otp;

