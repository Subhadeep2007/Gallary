import express from "express";


// ========================================
// CONTROLLERS
// ========================================

import {

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

} from "../controllers/auth/auth.controller.js";


// ========================================
// VALIDATORS
// ========================================

import {

    registerSchema,

    adminRegisterSchema,

    verifyEmailSchema,

    resendVerificationSchema,

    loginSchema,

    adminLoginSchema,

    forgotPasswordSchema,

    resetPasswordSchema,

    changePasswordSchema

} from "../validators/auth.validator.js";


// ========================================
// MIDDLEWARE
// ========================================

import validate
from "../middleware/validate.middleware.js";

import authMiddleware
from "../middleware/auth.middleware.js";

import authRateLimiter
from "../middleware/rateLimit.middleware.js";


// ========================================
// ROUTER
// ========================================

const router =
    express.Router();


// ========================================
// USER REGISTER
// ========================================

router.get("/register", (req, res) => {
    res.set("Allow", "POST");
    return res.status(405).json({
        success: false,
        message: "Registration requires POST. Open the client registration page or send a POST request with name, email, and password.",
    });
});

router.post(

    "/register",

    authRateLimiter,

    registerSchema,

    validate,

    register

);


// ========================================
// ADMIN REGISTER
// ========================================

router.get("/admin/register", (req, res) => {
    res.set("Allow", "POST");
    return res.status(405).json({
        success: false,
        message: "Admin registration requires POST. Open the client admin registration page or send a POST request with name, email, password, and adminSecretKey.",
    });
});

router.post(

    "/admin/register",

    authRateLimiter,

    adminRegisterSchema,

    validate,

    adminRegister

);


// ========================================
// VERIFY EMAIL
// ========================================

router.post(

    "/verify-email",

    authRateLimiter,

    verifyEmailSchema,

    validate,

    verifyEmail

);


// ========================================
// RESEND VERIFICATION OTP
// ========================================

router.post(

    "/resend-verification",

    authRateLimiter,

    resendVerificationSchema,

    validate,

    resendVerificationOTP

);


// ========================================
// USER LOGIN
// ========================================

router.post(

    "/login",

    authRateLimiter,

    loginSchema,

    validate,

    login

);


// ========================================
// ADMIN LOGIN
// ========================================

router.post(

    "/admin/login",

    authRateLimiter,

    adminLoginSchema,

    validate,

    adminLogin

);


// ========================================
// REFRESH TOKEN
// ========================================

router.post(

    "/refresh-token",

    refreshToken

);


// ========================================
// LOGOUT
// ========================================

router.post(

    "/logout",

    logout

);


// ========================================
// FORGOT PASSWORD
// ========================================

router.post(

    "/forgot-password",

    authRateLimiter,

    forgotPasswordSchema,

    validate,

    forgotPasswordController

);


// ========================================
// RESET PASSWORD
// ========================================

router.post(

    "/reset-password",

    authRateLimiter,

    resetPasswordSchema,

    validate,

    resetPasswordController

);


// ========================================
// CHANGE PASSWORD
// ========================================

router.post(

    "/change-password",

    authMiddleware,

    changePasswordSchema,

    validate,

    changePasswordController

);


// ========================================
// EXPORT
// ========================================

export default router;
