import api from "../api/api";

// ========================================
// GET PROFILE
// ========================================

export const getProfile = async() => {

    const response = await api.get(
        "/profile"
    );

    return response.data?.data ?? response.data;

};


// ========================================
// UPDATE PROFILE
// ========================================

export const updateProfile = async(
    profileData
) => {

    const response = await api.patch(
        "/profile",
        profileData
    );

    return response.data?.data ?? response.data;

};


// ========================================
// UPLOAD / REPLACE PROFILE IMAGE
// ========================================

export const uploadProfileImage = async(
    formData
) => {

    const response = await api.patch(
        "/profile/image",
        formData, {
            headers: {
                "Content-Type": undefined
            }
        }
    );

    return response.data?.data ?? response.data;

};


// ========================================
// DELETE PROFILE IMAGE
// ========================================

export const removeProfileImage = async() => {

    const response = await api.delete(
        "/profile/image"
    );

    return response.data?.data ?? response.data;

};
