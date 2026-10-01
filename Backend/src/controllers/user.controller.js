import { OTP, OTP, generaeteAccesstokenAndRefrehToken } from "../helper/helperFunction.js";
import { User } from "../models/user.module.js";
import { ApiError } from "../utils/Apierror.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
// import { uploadOnCloudnary } from "../Util/cloudnary.js";
import { sendMail } from "../helper/email.helper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { tempUserModel } from "../models/tempUser.model.js";
import { redisConnection } from "../db/connetDB.js";


const cookieOptions = {
    // httpOnly: true,
    // secure: true,
    // sameSite: "none",
    maxAge: 4 * 24 * 60 * 60 * 1000
};

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, username } = req.body;

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (user) {
        throw new ApiError(400, "Email or username already used");
    }

    const otp = OTP();
    const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 12);

    const existingTempUser = await tempUserModel.findOne({ email });

    if (existingTempUser) {
        existingTempUser.name = name;
        existingTempUser.email = email;
        existingTempUser.username = username;
        existingTempUser.verifyOTP = otp;
        existingTempUser.expireOTP = otpExpiryTime;
        existingTempUser.password = hashedPassword;

        await existingTempUser.save();
    } else {
        await tempUserModel.create({
            email,
            name,
            password: hashedPassword,
            username,
            verifyOTP: otp,
            expireOTP: otpExpiryTime
        });
    }

    await sendMail(email, otp);

    res.status(200).json(
        new ApiResponse(200, null, "OTP sent successfully")
    );
});

export const verifyUser = asyncHandler(async (req, res) => {
    const { OTP: enteredOTP, email } = req.body;

    const user = await tempUserModel.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.expireOTP || user.expireOTP.getTime() < Date.now()) {
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    if (Number(enteredOTP) !== Number(user.verifyOTP)) {
        throw new ApiError(401, "OTP is wrong");
    }

    const existingUser = await User.findOne({
        $or: [
            { email: user.email },
            { username: user.username }
        ]
    });

    if (existingUser) {
        await tempUserModel.deleteOne({ _id: user._id });
        throw new ApiError(400, "Email or username already used");
    }

    await User.create({
        name: user.name,
        email: user.email,
        password: user.password,
        username: user.username,
        isVerified: true
    });

    await tempUserModel.deleteOne({ _id: user._id });

    res.status(200).json(
        new ApiResponse(200, null, "User is verified")
    );
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isVerified) {
        throw new ApiError(403, "Please verify your email first");
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    const accessToken =
        await generaeteAccesstokenAndRefrehToken.generateaccesToken(
            user.email,
            user.isVerified,
            user._id
        );

    const refreshToken =
        await generaeteAccesstokenAndRefrehToken.generaterefreshToken(
            user._id
        );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = user.toObject();

    delete loggedInUser.password;
    delete loggedInUser.refreshToken;
    delete loggedInUser.verifyOTP;
    delete loggedInUser.expireOTP;

    res.status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", refreshToken)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser },
                "User logged in successfully"
            )
        );
});

// export const addOrUpdateAvatar = asyncHandler(async (req, res) => {
//     const { _id } = req.user;

//     if (!req.file) {
//         throw new ApiError(400, "Avatar file is required");
//     }

//     const uploadedImage = await uploadOnCloudnary(req.file.buffer);

//     if (!uploadedImage?.secure_url) {
//         throw new ApiError(500, "Failed to upload avatar");
//     }

//     const user = await User.findByIdAndUpdate(
//         _id,
//         {
//             $set: {
//                 avatar: uploadedImage.secure_url
//             }
//         },
//         {
//             new: true,
//             runValidators: true
//         }
//     );

//     if (!user) {
//         throw new ApiError(404, "User not found");
//     }

//     res.status(200).json(
//         new ApiResponse(
//             200,
//             { avatar: user.avatar },
//             "Avatar updated successfully"
//         )
//     );
// });

export const getUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const user = await User.findById(_id).select(
        "-verifyOTP -expireOTP -password -refreshToken"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    );
});

export const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        throw new ApiError(401, "Refresh token not found");
    }

    let decoded;

    try {
        decoded = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { _id } = decoded;

    if (!_id) {
        throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findOne({
        _id,
        refreshToken: token
    });

    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    const accessToken =
        await generaeteAccesstokenAndRefrehToken.generateaccesToken(
            user.email,
            user.isVerified,
            user._id
        );

    res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                null,
                "Token generated successfully"
            )
        );
});

export const changeName = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { name } = req.body;

    if (!name || !name.trim()) {
        throw new ApiError(400, "Name is required");
    }

    const user = await User.findByIdAndUpdate(
        _id,
        {
            $set: {
                name: name.trim()
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "User name successfully changed"
        )
    );
});

export const logout = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const user = await User.findByIdAndUpdate(
        _id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const options = {
        sameSite: "none",
        secure: true,
        httpOnly: true
    };

    res.clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "User logged out successfully"
            )
        );
});

export const changepassword =  asyncHandler(async(req,res)=>{
    const {newpassword} = req.body
    if(!redisConnection.get(`${req.user.email}`)==1){
        throw new ApiError(401,"Unauthorised")
    }
    const password = await bcrypt.hash(newpassword,12)
     await User.findOneAndUpdate({
        _id:req.user._id
    },{
        $set:{password:password}
    })

    await redisConnection.del(`${req.user.email}`)
    res.status(200).json(new ApiResponse(200,null,"Password Change successfully"))


})

export const sendingOtP = asyncHandler(async(req,res)=>{
        
    const {email} = req.body
    if(!email){
          throw new ApiError(404,"email Not found")
    }
    const user =  await User.findOne({email:email})
    if(!user){
        throw new ApiError(401,"Unauthorised")
    }
    const OTP = OTP()
    await sendMail(email,OTP)
    redisConnection.set(email,OTP)
    redisConnection.ttl(email,5*60)
    res.status(200).json(new ApiResponse(200,null,"OTP sent"))

})

export const verifying = asyncHandler(async(req,res)=>{
    const {otp,email} = req.body
    
    const getOtp = redisConnection.get(email)
    if(getOtp){
        throw new ApiError(401,"OTP not found")
    }
    if(otp!==getOtp){
        throw new ApiError(401,"OTP not Correct")
    }
    redisConnection.set(email,1)
    redisConnection.ttl(email,5*60)
    res.status(200).json(new ApiResponse(200,null,"OTP is correct"))
})