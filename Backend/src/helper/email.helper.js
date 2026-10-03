import {breavo} from "../config/email.config.js"

export const sendMail = async(emailAddress,otp)=>{

    try{
        const result = await breavo.transactionalEmails.sendTransacEmail({
            subject:"OTP verification",
            htmlContent:`<div> 
            Your verification Code <br/>
            ${otp}</div>`,
            sender:{name:'Agent',email:process.env.ADMIN_EMAIL},
            to:[{email:emailAddress}]
        })
        return result
    }catch(err){
        console.error("Error while sending mail:", err);
        throw err;
    }
}