import { breavo } from "../config/email.config.js"

export const sendMail = async (emailAddress, otp) => {

    try {
        const result = await breavo.transactionalEmails.sendTransacEmail({
            subject: "OTP verification",
            htmlContent: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verification Code</h2>

        <p>Your verification code is:</p>

        <h1 style="letter-spacing: 6px; color: #333;">
            ${otp}
        </h1>

        <p style="color: #666;">
            This code will expire shortly. Please don't share it with anyone.
        </p>
    </div>
`,
            sender: { name: 'Agent', email: process.env.ADMIN_EMAIL },
            to: [{ email: emailAddress }]
        })
        return result
    } catch (err) {
        console.error("Error while sending mail:", err);
        throw err;
    }
}