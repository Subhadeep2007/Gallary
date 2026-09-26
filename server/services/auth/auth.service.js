import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../../models/user.model.js";
import sendEmail from "../../utils/sendEmail.js";


// =========================================================
// COMMON ERROR HELPER
// =========================================================

const createError = (
    message,
    statusCode = 400
) => {

    const error =
        new Error(message);

    error.statusCode =
        statusCode;

    return error;

};


// =========================================================
// OTP GENERATOR
// =========================================================

const generateOTP = () => {

    return crypto
        .randomInt(
            100000,
            1000000
        )
        .toString();

};


// =========================================================
// ADMIN SECRET CHECK
// =========================================================

const isValidAdminSecret = (
    providedSecret
) => {

    const expectedSecret =
        process.env.ADMIN_SECRET_KEY;


    if (!providedSecret ||
        !expectedSecret
    ) {

        return false;

    }


    const providedBuffer =
        Buffer.from(
            providedSecret
        );

    const expectedBuffer =
        Buffer.from(
            expectedSecret
        );


    if (
        providedBuffer.length !==
        expectedBuffer.length
    ) {

        return false;

    }


    return crypto.timingSafeEqual(
        providedBuffer,
        expectedBuffer
    );

};


// =========================================================
// SEND EMAIL VERIFICATION OTP
// =========================================================

const sendVerificationOTP = async(
    email,
    otp
) => {

    return sendEmail({

        to: email,

        subject: "Verify Your Digital Gallery Account",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                background: #07111f;
                color: #ffffff;
                padding: 40px;
                max-width: 600px;
                margin: auto;
                border-radius: 16px;
            ">

                <h2 style="
                    color: #22d3ee;
                    margin-bottom: 20px;
                ">
                    Digital Gallery
                </h2>

                <p style="
                    font-size: 16px;
                ">
                    Your email verification OTP is:
                </p>

                <div style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #22d3ee;
                    background: #0f1d30;
                    padding: 18px;
                    text-align: center;
                    border-radius: 12px;
                    margin: 25px 0;
                ">
                    ${otp}
                </div>

                <p style="
                    color: #cbd5e1;
                ">
                    This OTP is valid for 10 minutes.
                </p>

                <p style="
                    color: #64748b;
                    font-size: 13px;
                    margin-top: 30px;
                ">
                    If you did not create this account,
                    you can safely ignore this email.
                </p>

            </div>
        `

    });

};


// =========================================================
// SEND PASSWORD RESET OTP
// =========================================================

const sendPasswordResetOTP = async(
    email,
    otp
) => {

    return sendEmail({

        to: email,

        subject: "Digital Gallery Password Reset OTP",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                background: #07111f;
                color: #ffffff;
                padding: 40px;
                max-width: 600px;
                margin: auto;
                border-radius: 16px;
            ">

                <h2 style="
                    color: #22d3ee;
                    margin-bottom: 20px;
                ">
                    Digital Gallery
                </h2>

                <p style="
                    font-size: 16px;
                ">
                    Use the OTP below to reset your password:
                </p>

                <div style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #22d3ee;
                    background: #0f1d30;
                    padding: 18px;
                    text-align: center;
                    border-radius: 12px;
                    margin: 25px 0;
                ">
                    ${otp}
                </div>

                <p style="
                    color: #cbd5e1;
                ">
                    This OTP is valid for 10 minutes.
                </p>

                <p style="
                    color: #64748b;
                    font-size: 13px;
                    margin-top: 30px;
                ">
                    If you did not request a password reset,
                    you can safely ignore this email.
                </p>

            </div>
        `

    });

};


// =========================================================
// ACCESS TOKEN
// =========================================================

const generateAccessToken = (
    user
) => {

    return jwt.sign(

        {
            userId: user._id.toString(),

            role: user.role

        },

        process.env.JWT_SECRET,

        {
            expiresIn: process.env.JWT_EXPIRE ||
                "1d"
        }

    );

};


// =========================================================
// REFRESH TOKEN
// =========================================================

const generateRefreshToken = (
    user
) => {

    return jwt.sign(

        {
            userId: user._id.toString(),

            role: user.role

        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }

    );

};


// =========================================================
// SAFE USER RESPONSE
// =========================================================

const getSafeUser = (
    user
) => {

    return {

        userId: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        profileImage: user.profileImage,

        profileImagePublicId: user.profileImagePublicId,

        isEmailVerified: user.isEmailVerified,

        isActive: user.isActive,

        isDeleted: user.isDeleted

    };

};


// =========================================================
// REGISTER USER
// =========================================================

const registerUser = async({
    name,
    email,
    password
}) => {

    const normalizedEmail =
        email
        .trim()
        .toLowerCase();


    // ========================================
    // CHECK EXISTING USER
    // ========================================

    const existingUser =
        await User.findOne({

            email: normalizedEmail

        });


    if (existingUser) {

        throw createError(

            "User already exists with this email",

            409

        );

    }


    // ========================================
    // HASH PASSWORD
    // ========================================

    const hashedPassword =
        await bcrypt.hash(

            password,

            12

        );


    // ========================================
    // GENERATE OTP
    // ========================================

    const otp =
        generateOTP();


    // ========================================
    // CREATE USER
    // ========================================

    const user =
        await User.create({

            name,

            email: normalizedEmail,

            password: hashedPassword,

            role: "user",

            isEmailVerified: false,

            emailVerificationOTP: otp,

            emailVerificationOTPExpire: new Date(
                Date.now() +
                10 * 60 * 1000
            ),

            isActive: true,

            isDeleted: false

        });


    // ========================================
    // SEND VERIFICATION EMAIL
    // ========================================

    try {

        await sendVerificationOTP(

            normalizedEmail,

            otp

        );

    } catch (error) {

        console.error(

            "Verification email failed:",

            error.message

        );


        throw createError(

            "Account created but verification email could not be sent. Please resend OTP.",

            500

        );

    }


    return {

        message: "Registration successful. Please verify your email.",

        user: getSafeUser(user)

    };

};


// =========================================================
// REGISTER ADMIN
// =========================================================

const registerAdmin = async({
    name,
    email,
    password,
    adminSecretKey
}) => {

    // ========================================
    // CHECK ADMIN SECRET CONFIGURATION
    // ========================================

    if (!process.env.ADMIN_SECRET_KEY) {

        throw createError(

            "Admin secret key is not configured on server",

            500

        );

    }


    // ========================================
    // VERIFY ADMIN SECRET
    // ========================================

    if (!isValidAdminSecret(
            adminSecretKey
        )) {

        throw createError(

            "Invalid admin secret key",

            401

        );

    }


    const normalizedEmail =
        email
        .trim()
        .toLowerCase();


    // ========================================
    // CHECK EXISTING EMAIL
    // ========================================

    const existingUser =
        await User.findOne({

            email: normalizedEmail

        });


    if (existingUser) {

        throw createError(

            "User already exists with this email",

            409

        );

    }


    // ========================================
    // ONLY ONE ADMIN
    // ========================================

    const existingAdmin =
        await User.findOne({

            role: "admin"

        });


    if (existingAdmin) {

        throw createError(

            "Admin account already exists",

            409

        );

    }


    // ========================================
    // HASH PASSWORD
    // ========================================

    const hashedPassword =
        await bcrypt.hash(

            password,

            12

        );


    // ========================================
    // GENERATE OTP
    // ========================================

    const otp =
        generateOTP();


    // ========================================
    // CREATE ADMIN
    // ========================================

    const admin =
        await User.create({

            name,

            email: normalizedEmail,

            password: hashedPassword,

            role: "admin",

            isEmailVerified: false,

            emailVerificationOTP: otp,

            emailVerificationOTPExpire: new Date(
                Date.now() +
                10 * 60 * 1000
            ),

            isActive: true,

            isDeleted: false

        });


    // ========================================
    // SEND ADMIN VERIFICATION EMAIL
    // ========================================

    try {

        await sendVerificationOTP(

            normalizedEmail,

            otp

        );

    } catch (error) {

        console.error(

            "Admin verification email failed:",

            error.message

        );


        throw createError(

            "Admin account created but verification email could not be sent. Please resend OTP.",

            500

        );

    }


    return {

        message: "Admin registration successful. Please verify your email.",

        user: getSafeUser(admin)

    };

};


// =========================================================
// VERIFY EMAIL
// =========================================================

const verifyEmail = async({
    email,
    otp
}) => {

    const normalizedEmail =
        email
        .trim()
        .toLowerCase();


    const user =
        await User.findOne({

            email: normalizedEmail

        });


    if (!user) {

        throw createError(

            "User not found",

            404

        );

    }


    if (user.isDeleted) {

        throw createError(

            "This account has been deleted",

            403

        );

    }


    if (user.isEmailVerified) {

        throw createError(

            "Email is already verified",

            400

        );

    }


    if (!user.emailVerificationOTP) {

        throw createError(

            "No verification OTP found. Please request a new OTP.",

            400

        );

    }


    if (!user.emailVerificationOTPExpire ||
        user.emailVerificationOTPExpire <
        new Date()
    ) {

        throw createError(

            "OTP has expired. Please request a new OTP.",

            400

        );

    }


    if (
        user.emailVerificationOTP !==
        otp
    ) {

        throw createError(

            "Invalid OTP",

            400

        );

    }


    // ========================================
    // VERIFY ACCOUNT
    // ========================================

    user.isEmailVerified =
        true;

    user.emailVerificationOTP =
        null;

    user.emailVerificationOTPExpire =
        null;


    await user.save();


    return {

        message: "Email verified successfully.",

        user: getSafeUser(user)

    };

};


// =========================================================
// RESEND VERIFICATION OTP
// =========================================================

const resendVerificationOTP = async(
    email
) => {

    const normalizedEmail =
        email
        .trim()
        .toLowerCase();


    const user =
        await User.findOne({

            email: normalizedEmail

        });


    if (!user) {

        throw createError(

            "User not found",

            404

        );

    }


    if (user.isDeleted) {

        throw createError(

            "This account has been deleted",

            403

        );

    }


    if (user.isEmailVerified) {

        throw createError(

            "Email is already verified",

            400

        );

    }


    const otp =
        generateOTP();


    user.emailVerificationOTP =
        otp;

    user.emailVerificationOTPExpire =
        new Date(
            Date.now() +
            10 * 60 * 1000
        );


    await user.save();


    try {

        await sendVerificationOTP(

            normalizedEmail,

            otp

        );

    } catch (error) {

        console.error(

            "Resend verification email failed:",

            error.message

        );

        throw createError(

            "Failed to send verification OTP. Please try again.",

            500

        );

    }


    return {

        message: "Verification OTP sent successfully."

    };

};


// =========================================================
// USER LOGIN
// =========================================================

const loginUser = async({
    email,
    password
}) => {

    const normalizedEmail =
        email
        .trim()
        .toLowerCase();


    const user =
        await User.findOne({

            email: normalizedEmail,

            role: "user"

        });


    if (!user) {

        throw createError(

            "Invalid email or password",

            401

        );

    }


    if (user.isDeleted) {

        throw createError(

            "This account has been deleted",

            403

        );

    }


    if (!user.isActive) {

        throw createError(

            "Your account has been deactivated",

            403

        );

    }


    // ========================================
    // CHECK PASSWORD
    // ========================================

    const isPasswordValid =
        await bcrypt.compare(

            password,

            user.password

        );


    if (!isPasswordValid) {

        throw createError(

            "Invalid email or password",

            401

        );

    }


    // ========================================
    // EMAIL VERIFICATION
    // ========================================

    if (!user.isEmailVerified) {

        const otp =
            generateOTP();


        user.emailVerificationOTP =
            otp;

        user.emailVerificationOTPExpire =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await user.save();


        try {

            await sendVerificationOTP(

                normalizedEmail,

                otp

            );

        } catch (error) {

            console.error(

                "Login verification email failed:",

                error.message

            );

        }


        return {

            requiresEmailVerification: true,

            email: normalizedEmail

        };

    }


    // ========================================
    // GENERATE TOKENS
    // ========================================

    const accessToken =
        generateAccessToken(user);


    const refreshToken =
        generateRefreshToken(user);


    // ========================================
    // SAVE REFRESH TOKEN
    // ========================================

    user.refreshToken =
        refreshToken;


    await user.save();


    return {

        message: "Login successful.",

        user: getSafeUser(user),

        accessToken,

        refreshToken

    };

};


// =========================================================
// ADMIN LOGIN
// =========================================================

const loginAdmin = async({
    email,
    password,
    adminSecretKey
}) => {

    // ========================================
    // CHECK ADMIN SECRET CONFIGURATION
    // ========================================

    if (!process.env.ADMIN_SECRET_KEY) {

        throw createError(

            "Admin secret key is not configured on server",

            500

        );

    }


    // ========================================
    // VERIFY ADMIN SECRET
    // ========================================

    if (!isValidAdminSecret(
            adminSecretKey
        )) {

        throw createError(

            "Invalid admin secret key",

            401

        );

    }


    const normalizedEmail =
        email
        .trim()
        .toLowerCase();


    const admin =
        await User.findOne({

            email: normalizedEmail,

            role: "admin"

        });


    if (!admin) {

        throw createError(

            "Invalid admin credentials",

            401

        );

    }


    if (admin.isDeleted) {

        throw createError(

            "This admin account has been deleted",

            403

        );

    }


    if (!admin.isActive) {

        throw createError(

            "Admin account is deactivated",

            403

        );

    }


    // ========================================
    // CHECK PASSWORD
    // ========================================

    const isPasswordValid =
        await bcrypt.compare(

            password,

            admin.password

        );


    if (!isPasswordValid) {

        throw createError(

            "Invalid admin credentials",

            401

        );

    }


    // ========================================
    // EMAIL VERIFICATION
    // ========================================

    if (!admin.isEmailVerified) {

        const otp =
            generateOTP();


        admin.emailVerificationOTP =
            otp;

        admin.emailVerificationOTPExpire =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await admin.save();


        try {

            await sendVerificationOTP(

                normalizedEmail,

                otp

            );

        } catch (error) {

            console.error(

                "Admin login verification email failed:",

                error.message

            );

        }


        return {

            requiresEmailVerification: true,

            email: normalizedEmail

        };

    }


    // ========================================
    // GENERATE TOKENS
    // ========================================

    const accessToken =
        generateAccessToken(admin);


    const refreshToken =
        generateRefreshToken(admin);


    // ========================================
    // SAVE REFRESH TOKEN
    // ========================================

    admin.refreshToken =
        refreshToken;


    await admin.save();


    return {

        message: "Admin login successful.",

        user: getSafeUser(admin),

        accessToken,

        refreshToken

    };

};


// =========================================================
// REFRESH ACCESS TOKEN
// =========================================================

const refreshAccessToken = async(
    refreshToken
) => {

    if (!refreshToken) {

        throw createError(

            "Refresh token missing",

            401

        );

    }


    let decoded;


    // ========================================
    // VERIFY REFRESH TOKEN
    // ========================================

    try {

        decoded =
            jwt.verify(

                refreshToken,

                process.env.JWT_SECRET

            );

    } catch (error) {

        throw createError(

            "Invalid or expired refresh token",

            401

        );

    }


    // ========================================
    // FIND USER
    // ========================================

    const user =
        await User.findById(

            decoded.userId

        );


    if (!user) {

        throw createError(

            "User not found",

            401

        );

    }


    if (user.isDeleted) {

        throw createError(

            "This account has been deleted",

            403

        );

    }


    if (!user.isActive) {

        throw createError(

            "Your account has been deactivated",

            403

        );

    }


    // ========================================
    // CHECK STORED REFRESH TOKEN
    // ========================================

    if (!user.refreshToken) {

        throw createError(

            "Refresh session not found",

            401

        );

    }


    if (
        user.refreshToken !==
        refreshToken
    ) {

        throw createError(

            "Invalid refresh token",

            401

        );

    }


    // ========================================
    // GENERATE NEW ACCESS TOKEN
    // ========================================

    const accessToken =
        generateAccessToken(user);


    return {

        accessToken,

        user: getSafeUser(user)

    };

};


// =========================================================
// LOGOUT
// =========================================================

const logoutUser = async(
    refreshToken
) => {

    if (!refreshToken) {

        return {

            message: "Logged out successfully."

        };

    }


    try {

        const decoded =
            jwt.verify(

                refreshToken,

                process.env.JWT_SECRET

            );


        await User.findByIdAndUpdate(

            decoded.userId,

            {

                $set: {

                    refreshToken: null

                }

            }

        );

    } catch (error) {

        console.log(

            "Logout token cleanup skipped:",

            error.message

        );

    }


    return {

        message: "Logged out successfully."

    };

};


// =========================================================
// FORGOT PASSWORD
// =========================================================

const forgotPassword = async(
    email
) => {

    const normalizedEmail =
        email
        .trim()
        .toLowerCase();


    const user =
        await User.findOne({

            email: normalizedEmail

        });


    if (!user) {

        throw createError(

            "No account found with this email",

            404

        );

    }


    if (user.isDeleted) {

        throw createError(

            "This account has been deleted",

            403

        );

    }


    if (!user.isActive) {

        throw createError(

            "Your account has been deactivated",

            403

        );

    }


    const otp =
        generateOTP();


    user.resetPasswordOTP =
        otp;

    user.resetPasswordOTPExpire =
        new Date(
            Date.now() +
            10 * 60 * 1000
        );


    await user.save();


    try {

        await sendPasswordResetOTP(

            normalizedEmail,

            otp

        );

    } catch (error) {

        console.error(

            "Password reset email failed:",

            error.message

        );

        throw createError(

            "Failed to send password reset OTP. Please try again.",

            500

        );

    }


    return {

        message: "Password reset OTP sent successfully."

    };

};


// =========================================================
// RESET PASSWORD
// =========================================================

const resetPassword = async({
    email,
    otp,
    newPassword
}) => {

    const normalizedEmail =
        email
        .trim()
        .toLowerCase();


    const user =
        await User.findOne({

            email: normalizedEmail

        });


    if (!user) {

        throw createError(

            "User not found",

            404

        );

    }


    if (user.isDeleted) {

        throw createError(

            "This account has been deleted",

            403

        );

    }


    if (!user.resetPasswordOTP) {

        throw createError(

            "No password reset OTP found",

            400

        );

    }


    if (!user.resetPasswordOTPExpire ||
        user.resetPasswordOTPExpire <
        new Date()
    ) {

        throw createError(

            "OTP has expired. Please request a new one.",

            400

        );

    }


    if (
        user.resetPasswordOTP !==
        otp
    ) {

        throw createError(

            "Invalid OTP",

            400

        );

    }


    // ========================================
    // HASH NEW PASSWORD
    // ========================================

    const hashedPassword =
        await bcrypt.hash(

            newPassword,

            12

        );


    user.password =
        hashedPassword;


    user.resetPasswordOTP =
        null;

    user.resetPasswordOTPExpire =
        null;


    // ========================================
    // INVALIDATE OLD SESSION
    // ========================================

    user.refreshToken =
        null;


    await user.save();


    return {

        message: "Password reset successfully. Please login again."

    };

};


// =========================================================
// CHANGE PASSWORD
// =========================================================

const changePassword = async({
    userId,
    currentPassword,
    newPassword
}) => {

    const user =
        await User.findById(
            userId
        );


    if (!user) {

        throw createError(

            "User not found",

            404

        );

    }


    if (user.isDeleted) {

        throw createError(

            "This account has been deleted",

            403

        );

    }


    if (!user.isActive) {

        throw createError(

            "Your account has been deactivated",

            403

        );

    }


    // ========================================
    // CHECK CURRENT PASSWORD
    // ========================================

    const isCurrentPasswordValid =
        await bcrypt.compare(

            currentPassword,

            user.password

        );


    if (!isCurrentPasswordValid) {

        throw createError(

            "Current password is incorrect",

            401

        );

    }


    // ========================================
    // SAME PASSWORD CHECK
    // ========================================

    if (
        currentPassword ===
        newPassword
    ) {

        throw createError(

            "New password must be different from current password",

            400

        );

    }


    // ========================================
    // HASH NEW PASSWORD
    // ========================================

    const hashedPassword =
        await bcrypt.hash(

            newPassword,

            12

        );


    user.password =
        hashedPassword;


    // ========================================
    // INVALIDATE OLD SESSION
    // ========================================

    user.refreshToken =
        null;


    await user.save();


    return {

        message: "Password changed successfully. Please login again."

    };

};


// =========================================================
// EXPORTS
// =========================================================

export {

    registerUser,

    registerAdmin,

    verifyEmail,

    resendVerificationOTP,

    loginUser,

    loginAdmin,

    refreshAccessToken,

    logoutUser,

    forgotPassword,

    resetPassword,

    changePassword

};