import {
    registerUser,
    registerAdmin,
    verifyEmail as verifyEmailService,
    resendVerificationOTP as resendVerificationOTPService,
    loginUser,
    loginAdmin,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    resetPassword,
    changePassword
} from "../../services/auth/auth.service.js";


// ========================================
// USER REGISTER
// ========================================

const register = async(
    req,
    res,
    next
) => {

    try {

        const user =
            await registerUser(
                req.body
            );

        return res.status(201).json({

            success: true,

            message: "Registration successful. Please verify your email.",

            data: user

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// ADMIN REGISTER
// ========================================

const adminRegister = async(
    req,
    res,
    next
) => {

    try {

        const admin =
            await registerAdmin(
                req.body
            );

        return res.status(201).json({

            success: true,

            message: "Admin registration successful. Please verify your email.",

            data: admin

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// VERIFY EMAIL
// ========================================

const verifyEmail = async(
    req,
    res,
    next
) => {

    try {

        const user =
            await verifyEmailService(
                req.body
            );

        return res.status(200).json({

            success: true,

            message: "Email verified successfully",

            data: user

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// RESEND VERIFICATION OTP
// ========================================

const resendVerificationOTP = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await resendVerificationOTPService(
                req.body.email
            );

        return res.status(200).json({

            success: true,

            message: "Verification OTP sent successfully",

            data: result

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// USER LOGIN
// ========================================

const login = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await loginUser(
                req.body
            );


        // ========================================
        // EMAIL VERIFICATION REQUIRED
        // ========================================

        if (
            result.requiresEmailVerification
        ) {

            return res.status(200).json({

                success: true,

                message: "Your email is not verified. A new verification OTP has been sent to your email.",

                data: {

                    requiresEmailVerification: true,

                    email: result.email

                }

            });

        }


        // ========================================
        // REFRESH TOKEN COOKIE
        // ========================================

        res.cookie(

            "refreshToken",

            result.refreshToken,

            {

                httpOnly: true,

                secure: process.env.NODE_ENV ===
                    "production",

                sameSite: process.env.NODE_ENV ===
                    "production" ?
                    "none" :
                    "lax",

                maxAge: 7 *
                    24 *
                    60 *
                    60 *
                    1000

            }

        );


        return res.status(200).json({

            success: true,

            message: "Login successful",

            data: {

                user: result.user,

                accessToken: result.accessToken

            }

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// ADMIN LOGIN
// ========================================

const adminLogin = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await loginAdmin(
                req.body
            );


        // ========================================
        // EMAIL VERIFICATION REQUIRED
        // ========================================

        if (
            result.requiresEmailVerification
        ) {

            return res.status(200).json({

                success: true,

                message: "Your email is not verified. A new verification OTP has been sent to your email.",

                data: {

                    requiresEmailVerification: true,

                    email: result.email

                }

            });

        }


        // ========================================
        // REFRESH TOKEN COOKIE
        // ========================================

        res.cookie(

            "refreshToken",

            result.refreshToken,

            {

                httpOnly: true,

                secure: process.env.NODE_ENV ===
                    "production",

                sameSite: process.env.NODE_ENV ===
                    "production" ?
                    "none" :
                    "lax",

                maxAge: 7 *
                    24 *
                    60 *
                    60 *
                    1000

            }

        );


        return res.status(200).json({

            success: true,

            message: "Admin login successful",

            data: {

                user: result.user,

                accessToken: result.accessToken

            }

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// REFRESH TOKEN
// ========================================

const refreshToken = async(
    req,
    res,
    next
) => {

    try {

        const token =
            req.cookies.refreshToken;


        const result =
            await refreshAccessToken(
                token
            );


        return res.status(200).json({

            success: true,

            message: "Access token refreshed successfully",

            data: result

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// LOGOUT
// ========================================

const logout = async(
    req,
    res,
    next
) => {

    try {

        const refreshToken =
            req.cookies.refreshToken;


        await logoutUser(
            refreshToken
        );


        res.clearCookie(

            "refreshToken",

            {

                httpOnly: true,

                secure: process.env.NODE_ENV ===
                    "production",

                sameSite: process.env.NODE_ENV ===
                    "production" ?
                    "none" :
                    "lax"

            }

        );


        return res.status(200).json({

            success: true,

            message: "Logout successful"

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// FORGOT PASSWORD
// ========================================

const forgotPasswordController = async(
    req,
    res,
    next
) => {

    try {

        await forgotPassword(
            req.body.email
        );


        return res.status(200).json({

            success: true,

            message: "If the account exists, a password reset OTP has been sent."

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// RESET PASSWORD
// ========================================

const resetPasswordController = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await resetPassword(
                req.body
            );


        return res.status(200).json({

            success: true,

            message: "Password reset successfully",

            data: result

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// CHANGE PASSWORD
// ========================================

const changePasswordController = async(
    req,
    res,
    next
) => {

    try {

        await changePassword({

            userId: req.user.userId,

            currentPassword: req.body.currentPassword,

            newPassword: req.body.newPassword

        });


        return res.status(200).json({

            success: true,

            message: "Password changed successfully"

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// EXPORTS
// ========================================

export {

    register,

    adminRegister,

    verifyEmail,

    resendVerificationOTP,

    login,

    adminLogin,

    refreshToken,

    logout,

    forgotPasswordController,

    resetPasswordController,

    changePasswordController

};