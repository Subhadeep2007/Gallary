import { body } from "express-validator";


// ========================================
// COMMON USER FIELDS
// ========================================

const nameValidation = body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({
        min: 2,
        max: 50
    })
    .withMessage(
        "Name must be between 2 and 50 characters"
    );


const emailValidation = body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
        "Please provide a valid email"
    )
    .normalizeEmail();


const passwordValidation = body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({
        min: 8
    })
    .withMessage(
        "Password must be at least 8 characters"
    );


// ========================================
// REGISTER USER
// ========================================

const registerSchema = [

    nameValidation,

    emailValidation,

    passwordValidation

];


// ========================================
// REGISTER ADMIN
// ========================================

const adminRegisterSchema = [

    nameValidation,

    emailValidation,

    passwordValidation,

    body("adminSecretKey")
    .trim()
    .notEmpty()
    .withMessage(
        "Admin secret key is required"
    )
    .isString()
    .withMessage(
        "Admin secret key must be a string"
    )

];


// ========================================
// VERIFY EMAIL
// ========================================

const verifyEmailSchema = [

    emailValidation,

    body("otp")
    .trim()
    .notEmpty()
    .withMessage(
        "OTP is required"
    )
    .isLength({
        min: 6,
        max: 6
    })
    .withMessage(
        "OTP must be 6 digits"
    )
    .isNumeric()
    .withMessage(
        "OTP must contain only numbers"
    )

];


// ========================================
// RESEND VERIFICATION OTP
// ========================================

const resendVerificationSchema = [

    emailValidation

];


// ========================================
// LOGIN
// ========================================

const loginSchema = [

    emailValidation,

    body("password")
    .notEmpty()
    .withMessage(
        "Password is required"
    )

];


// ========================================
// ADMIN LOGIN
// ========================================

const adminLoginSchema = [

    emailValidation,

    body("password")
    .notEmpty()
    .withMessage(
        "Password is required"
    ),

    body("adminSecretKey")
    .trim()
    .notEmpty()
    .withMessage(
        "Admin secret key is required"
    )
    .isString()
    .withMessage(
        "Admin secret key must be a string"
    )

];


// ========================================
// FORGOT PASSWORD
// ========================================

const forgotPasswordSchema = [

    emailValidation

];


// ========================================
// RESET PASSWORD
// ========================================

const resetPasswordSchema = [

    emailValidation,

    body("otp")
    .trim()
    .notEmpty()
    .withMessage(
        "OTP is required"
    )
    .isLength({
        min: 6,
        max: 6
    })
    .withMessage(
        "OTP must be 6 digits"
    )
    .isNumeric()
    .withMessage(
        "OTP must contain only numbers"
    ),

    body("newPassword")
    .notEmpty()
    .withMessage(
        "New password is required"
    )
    .isLength({
        min: 8
    })
    .withMessage(
        "Password must be at least 8 characters"
    )

];


// ========================================
// CHANGE PASSWORD
// ========================================

const changePasswordSchema = [

    body("currentPassword")
    .notEmpty()
    .withMessage(
        "Current password is required"
    ),

    body("newPassword")
    .notEmpty()
    .withMessage(
        "New password is required"
    )
    .isLength({
        min: 8
    })
    .withMessage(
        "New password must be at least 8 characters"
    )

];


// ========================================
// EXPORTS
// ========================================

export {

    registerSchema,

    adminRegisterSchema,

    verifyEmailSchema,

    resendVerificationSchema,

    loginSchema,

    adminLoginSchema,

    forgotPasswordSchema,

    resetPasswordSchema,

    changePasswordSchema

};