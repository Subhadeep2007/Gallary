import api from "../api/api.js";

// ========================================
// CREATE FILE METADATA
// ========================================

export const createFile = async(fileData) => {
    const response = await api.post(
        "/files",
        fileData
    );

    return response.data;
};

// ========================================
// SYNC FILE METADATA
// ========================================

export const syncFile = async(fileData) => {
    const response = await api.post(
        "/files/sync",
        fileData
    );

    return response.data;
};

// ========================================
// GET ALL ACTIVE FILES
// ========================================

export const getFiles = async(params = {}) => {
    const response = await api.get(
        "/files", {
            params
        }
    );

    return response.data;
};

// ========================================
// GET SINGLE FILE
// ========================================

export const getFileById = async(fileId) => {
    const response = await api.get(
        `/files/${fileId}`
    );

    return response.data;
};

// ========================================
// RENAME FILE
// ========================================

export const renameFile = async(
    fileId,
    fileName
) => {
    const response = await api.patch(
        `/files/${fileId}/rename`, {
            fileName
        }
    );

    return response.data;
};

// ========================================
// CHANGE CATEGORY
// ========================================

export const changeFileCategory = async(
    fileId,
    categoryId
) => {
    const response = await api.patch(
        `/files/${fileId}/category`, {
            categoryId
        }
    );

    return response.data;
};

// ========================================
// TOGGLE FAVORITE
// ========================================

export const toggleFavorite = async(
    fileId
) => {
    const response = await api.patch(
        `/files/${fileId}/favorite`
    );

    return response.data;
};

// ========================================
// GET FAVORITES
// ========================================

export const getFavoriteFiles = async() => {
    const response = await api.get(
        "/files/favorites"
    );

    return response.data;
};

// ========================================
// MOVE FILE TO TRASH
// ========================================

export const moveFileToTrash = async(
    fileId
) => {
    const response = await api.delete(
        `/files/${fileId}`
    );

    return response.data;
};

// ========================================
// GET TRASH FILES
// ========================================

export const getTrashFiles = async() => {
    const response = await api.get(
        "/files/trash"
    );

    return response.data;
};

// ========================================
// RESTORE FILE
// ========================================

export const restoreFile = async(
    fileId
) => {
    const response = await api.patch(
        `/files/${fileId}/restore`
    );

    return response.data;
};

// ========================================
// PERMANENT DELETE
// ========================================

export const permanentlyDeleteFile = async(
    fileId
) => {
    const response = await api.delete(
        `/files/${fileId}/permanent`
    );

    return response.data;
};

// ========================================
// EMPTY TRASH
// ========================================

export const emptyTrash = async() => {
    const response = await api.delete(
        "/files/trash"
    );

    return response.data;
};

// ========================================
// FILE STATISTICS
// ========================================

export const getFileStatistics = async() => {
    const response = await api.get(
        "/files/statistics"
    );

    return response.data;
};