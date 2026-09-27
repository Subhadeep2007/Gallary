import api from "../../api/api.js";

// ========================================
// GET PROFILE
// ========================================

export const getProfile = async() => {
    const response = await api.get(
        "/user/profile"
    );

    return response.data;
};


// ========================================
// UPDATE PROFILE
// ========================================

export const updateProfile = async(
    profileData
) => {
    const response = await api.put(
        "/user/profile",
        profileData
    );

    return response.data;
};


// ========================================
// UPLOAD PROFILE IMAGE
// ========================================

export const uploadProfileImage = async(
    formData
) => {
    const response = await api.put(
        "/user/profile-picture",
        formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};