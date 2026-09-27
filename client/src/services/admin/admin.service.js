import api from "../api/api";
// ========================================
// GET ADMIN DASHBOARD
// ========================================

export const getAdminDashboard = async() => {
    const response = await api.get(
        "/admin/dashboard"
    );

    return response.data;
};


// ========================================
// GET ALL USERS
// ========================================

export const getAdminUsers = async() => {
    const response = await api.get(
        "/admin/users"
    );

    return response.data;
};


// ========================================
// GET USER DETAILS
// ========================================

export const getAdminUserDetails = async(
    userId
) => {
    const response = await api.get(
        `/admin/users/${userId}`
    );

    return response.data;
};


// ========================================
// ACTIVATE USER
// ========================================

export const activateAdminUser = async(
    userId
) => {
    const response = await api.patch(
        `/admin/users/${userId}/activate`
    );

    return response.data;
};


// ========================================
// DEACTIVATE USER
// ========================================

export const deactivateAdminUser = async(
    userId
) => {
    const response = await api.patch(
        `/admin/users/${userId}/deactivate`
    );

    return response.data;
};


// ========================================
// DELETE USER
// ========================================

export const deleteAdminUser = async(
    userId
) => {
    const response = await api.delete(
        `/admin/users/${userId}`
    );

    return response.data;
};


// ========================================
// GET PLATFORM STATISTICS
// ========================================

export const getAdminStatistics = async() => {
    const response = await api.get(
        "/admin/statistics"
    );

    return response.data;
};