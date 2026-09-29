import api from "../api/api.js";


// ========================================
// BUILD FILE FORM DATA
// ========================================

const buildFileFormData = (
    fileData
) => {

    const formData =
        new FormData();


    // ========================================
    // ACTUAL FILE
    // ========================================

    const actualFile =
        fileData.file ||
        fileData.fileData;


    if (actualFile) {

        formData.append(
            "file",
            actualFile
        );

    }


    // ========================================
    // FILE METADATA
    // ========================================

    if (fileData.localFileId) {

        formData.append(
            "localFileId",
            fileData.localFileId
        );

    }


    if (fileData.fileName) {

        formData.append(
            "fileName",
            fileData.fileName
        );

    }


    if (fileData.fileType) {

        formData.append(
            "fileType",
            fileData.fileType
        );

    }


    if (fileData.mimeType) {

        formData.append(
            "mimeType",
            fileData.mimeType
        );

    }


    if (
        fileData.size !== undefined &&
        fileData.size !== null
    ) {

        formData.append(
            "size",
            String(fileData.size)
        );

    }


    if (
        fileData.categoryId !== undefined &&
        fileData.categoryId !== null &&
        fileData.categoryId !== ""
    ) {

        formData.append(
            "categoryId",
            fileData.categoryId
        );

    }


    if (
        fileData.parentFileId !== undefined &&
        fileData.parentFileId !== null &&
        fileData.parentFileId !== ""
    ) {

        formData.append(
            "parentFileId",
            fileData.parentFileId
        );

    }


    if (
        fileData.isCopy !== undefined &&
        fileData.isCopy !== null
    ) {

        formData.append(
            "isCopy",
            String(fileData.isCopy)
        );

    }


    if (
        fileData.isEdited !== undefined &&
        fileData.isEdited !== null
    ) {

        formData.append(
            "isEdited",
            String(fileData.isEdited)
        );

    }


    return formData;

};


// ========================================
// CREATE FILE
// ========================================

export const createFile = async(
    fileData
) => {

    const formData =
        buildFileFormData(
            fileData
        );


    const response =
        await api.post(
            "/files",
            formData
        );


    return response.data;

};


// ========================================
// CREATE FILE COPY
// ========================================
//
// Original file remains unchanged.
// New file gets:
// isCopy = true
// parentFileId = original Mongo file ID
// ========================================

export const createFileCopy = async(
    fileData
) => {

    const copyData = {

        ...fileData,

        isCopy: true,

        isEdited: false

    };


    const formData =
        buildFileFormData(
            copyData
        );


    const response =
        await api.post(
            "/files",
            formData
        );


    return response.data;

};


// ========================================
// CREATE EDITED FILE
// ========================================
//
// Original file remains unchanged.
// New file gets:
// isEdited = true
// parentFileId = original Mongo file ID
// ========================================

export const createEditedFile = async(
    fileData
) => {

    const editedData = {

        ...fileData,

        isCopy: false,

        isEdited: true

    };


    const formData =
        buildFileFormData(
            editedData
        );


    const response =
        await api.post(
            "/files",
            formData
        );


    return response.data;

};


// ========================================
// SYNC FILE METADATA
// ========================================

export const syncFile = async(
    fileData
) => {

    const response =
        await api.post(
            "/files/sync",
            fileData
        );


    return response.data;

};


// ========================================
// GET ALL ACTIVE FILES
// ========================================

export const getFiles = async(
    params = {}
) => {

    const response =
        await api.get(
            "/files", {

                params

            }
        );


    return response.data;

};


// ========================================
// GET FILES BY TYPE
// ========================================
//
// Supported:
// image
// video
// audio
// pdf
// ========================================

export const getFilesByType = async(
    fileType
) => {

    const response =
        await api.get(
            "/files", {

                params: {

                    fileType

                }

            }
        );


    return response.data;

};


// ========================================
// GET AUDIO FILES
// ========================================

export const getAudioFiles = async() => {

    return await getFilesByType(
        "audio"
    );

};


// ========================================
// GET IMAGE FILES
// ========================================

export const getImageFiles = async() => {

    return await getFilesByType(
        "image"
    );

};


// ========================================
// GET VIDEO FILES
// ========================================

export const getVideoFiles = async() => {

    return await getFilesByType(
        "video"
    );

};


// ========================================
// GET PDF FILES
// ========================================

export const getPdfFiles = async() => {

    return await getFilesByType(
        "pdf"
    );

};


// ========================================
// GET SINGLE FILE
// ========================================

export const getFileById = async(
    fileId
) => {

    const response =
        await api.get(
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

    const response =
        await api.patch(
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

    const response =
        await api.patch(
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

    const response =
        await api.patch(
            `/files/${fileId}/favorite`
        );


    return response.data;

};


// ========================================
// GET FAVORITES
// ========================================

export const getFavoriteFiles = async() => {

    const response =
        await api.get(
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

    const response =
        await api.delete(
            `/files/${fileId}`
        );


    return response.data;

};


// ========================================
// GET TRASH FILES
// ========================================

export const getTrashFiles = async() => {

    const response =
        await api.get(
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

    const response =
        await api.patch(
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

    const response =
        await api.delete(
            `/files/${fileId}/permanent`
        );


    return response.data;

};


// ========================================
// EMPTY TRASH
// ========================================

export const emptyTrash = async() => {

    const response =
        await api.delete(
            "/files/trash"
        );


    return response.data;

};


// ========================================
// FILE STATISTICS
// ========================================

export const getFileStatistics = async() => {

    const response =
        await api.get(
            "/files/statistics"
        );


    return response.data;

};