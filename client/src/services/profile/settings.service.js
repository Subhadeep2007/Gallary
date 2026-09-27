import api from "../api/api";
// ========================================
// GET USER SETTINGS
// ========================================

export const getSettings = async() => {
    const response = await api.get(
        "/user/settings"
    );

    return response.data;
};


// ========================================
// UPDATE USER SETTINGS
// ========================================

export const updateSettings = async(
    settingsData
) => {
    const response = await api.put(
        "/user/settings",
        settingsData
    );

    return response.data;
};