import jwt from "jsonwebtoken"
export const OTP = () => {
    
    return   Math.floor(100000 + Math.random() * 900000)
}
export const generaeteAccesstokenAndRefrehToken = {
    generateaccesToken: async (email, isVerified, _id) => {
        const token = await  jwt.sign(
            {
                "email": email,
                "isVerified": isVerified,
                "_id": _id
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        )
        return token 
    },
    generaterefreshToken: async (_id) => {
        const token = await jwt.sign(
            {
                "_id": _id
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        )
        return token
    }
}
