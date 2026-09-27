import api from "../api/api";


// ========================================
// USER REGISTER
// ========================================

const registerUser = async(
    userData
) => {

    const response =
        await api.post(
            "/auth/register",
            userData
        );

    return response.data;

};


// ========================================
// ADMIN REGISTER
// ========================================

const registerAdmin = async(
    adminData
) => {

    const response =
        await api.post(
            "/auth/admin/register",
            adminData
        );

    return response.data;

};


// ========================================
// VERIFY EMAIL
// ========================================

const verifyEmail = async({
    email,
    otp
}) => {

    const response =
        await api.post(
            "/auth/verify-email", {
                email,
                otp
            }
        );

    return response.data;

};


// ========================================
// RESEND VERIFICATION OTP
// ========================================

const resendVerificationOTP = async(
    email
) => {

    let emailValue = email;

    if (
        typeof email !== "string"
    ) {

        if (
            email &&
            email.email
        ) {

            emailValue =
                email.email;

        } else {

            emailValue = "";

        }

    }


    const response =
        await api.post(
            "/auth/resend-verification", {
                email: emailValue
            }
        );

    return response.data;

};


// ========================================
// USER LOGIN
// ========================================

const loginUser = async({
    email,
    password
}) => {

    const response =
        await api.post(
            "/auth/login", {
                email,
                password
            }
        );

    return response.data;

};


// ========================================
// ADMIN LOGIN
// ========================================

const loginAdmin = async({
    email,
    password,
    adminSecretKey
}) => {

    const response =
        await api.post(
            "/auth/admin/login", {
                email,
                password,
                adminSecretKey
            }
        );

    return response.data;

};


// ========================================
// REFRESH ACCESS TOKEN
// ========================================

const refreshAccessToken = async() => {

    const response =
        await api.post(
            "/auth/refresh-token"
        );

    return response.data;

};


// ========================================
// LOGOUT
// ========================================

const logoutUser = async() => {

    const response =
        await api.post(
            "/auth/logout"
        );

    return response.data;

};


// ========================================
// FORGOT PASSWORD
// ========================================

const forgotPassword = async(
    email
) => {

    const response =
        await api.post(
            "/auth/forgot-password", {
                email
            }
        );

    return response.data;

};


// ========================================
// RESET PASSWORD
// ========================================

const resetPassword = async({
    email,
    otp,
    newPassword
}) => {

    const response =
        await api.post(
            "/auth/reset-password", {
                email,
                otp,
                newPassword
            }
        );

    return response.data;

};


// ========================================
// CHANGE PASSWORD
// ========================================

const changePassword = async({
    currentPassword,
    newPassword
}) => {

    const response =
        await api.post(
            "/auth/change-password", {
                currentPassword,
                newPassword
            }
        );

    return response.data;

};


// ========================================
// EXPORTS
// ========================================

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