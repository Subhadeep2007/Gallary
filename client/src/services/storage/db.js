import Dexie from "dexie";


// ========================================
// DIGITAL GALLERY DATABASE
// ========================================

const db = new Dexie("DigitalGalleryDB");


// Ask Chrome to protect the local gallery from automatic storage eviction.
// This does not override a user's explicit "Clear site data" action; media
// that must survive that action needs to finish uploading to the server.
let persistentStorageRequest;

const requestPersistentStorage = () => {

    if (!persistentStorageRequest) {

        persistentStorageRequest = (async() => {

            try {

                if (
                    typeof navigator !== "undefined" &&
                    navigator.storage &&
                    typeof navigator.storage.persist === "function"
                ) {

                    await navigator.storage.persist();

                }

            } catch (error) {

                // Persistence is a browser-managed enhancement; IndexedDB
                // remains usable if the browser declines the request.
                console.warn(
                    "Persistent browser storage was not granted:",
                    error
                );

            }

        })();

    }

    return persistentStorageRequest;

};


// ========================================
// DATABASE SCHEMA
// ========================================

db.version(1).stores({
    files: "++localId, fileId, userId, name, type, mimeType, size, isFavorite, isTrashed, categoryId, createdAt, updatedAt"
});


// ========================================
// VERSION 2
// ========================================
// Backend field mapping:
//
// localFileId → IndexedDB local file identifier
// fileName    → actual file name
// fileType    → image / video / audio / pdf
// category    → categoryId
// isDeleted   → trash status
//
// Actual File/Blob remains inside IndexedDB.
// MongoDB stores metadata only.
// ========================================

db.version(2).stores({
    files: "++localId, localFileId, mongoFileId, userId, fileName, fileType, mimeType, size, categoryId, isFavorite, isDeleted, deletedAt, syncStatus, createdAt, updatedAt"
});


// ========================================
// VERSION 3
// ========================================
// Cloudinary metadata
// ========================================

db.version(3).stores({
    files: "++localId, localFileId, mongoFileId, userId, fileName, fileType, mimeType, size, categoryId, isFavorite, isDeleted, deletedAt, syncStatus, createdAt, updatedAt, fileUrl, cloudinaryPublicId, cloudinaryResourceType, cloudinaryFormat"
});


// ========================================
// GENERATE LOCAL FILE ID
// ========================================

const generateLocalFileId = () => {

    if (
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString() +
        "-" +
        Math.random().toString(36).slice(2)
    );

};


// ========================================
// ADD FILE
// ========================================

export const addFile = async(fileData) => {

    await requestPersistentStorage();

    const localFileId =
        fileData.localFileId ?
        fileData.localFileId :
        generateLocalFileId();


    const createdAt =
        fileData.createdAt ?
        fileData.createdAt :
        new Date().toISOString();


    const isFavorite =
        fileData.isFavorite === true ?
        true :
        false;


    const isDeleted =
        fileData.isDeleted === true ?
        true :
        false;


    const syncStatus =
        fileData.syncStatus ?
        fileData.syncStatus :
        "pending";


    const isCopy =
        fileData.isCopy === true ?
        true :
        false;


    const isEdited =
        fileData.isEdited === true ?
        true :
        false;


    return await db.files.add({

        localFileId,

        mongoFileId: fileData.mongoFileId || null,

        userId: fileData.userId,

        fileName: fileData.fileName ||
            fileData.name,

        fileType: fileData.fileType ||
            fileData.type,

        mimeType: fileData.mimeType,

        size: fileData.size,

        // Actual Blob/File
        fileData: fileData.fileData,

        categoryId: fileData.categoryId || null,

        isFavorite,

        isDeleted,

        deletedAt: fileData.deletedAt || null,

        syncStatus,

        createdAt,

        updatedAt: new Date().toISOString(),

        parentFileId: fileData.parentFileId || null,

        isCopy,

        isEdited,

        // ========================================
        // CLOUDINARY METADATA
        // ========================================

        fileUrl: fileData.fileUrl || null,

        cloudinaryPublicId: fileData.cloudinaryPublicId || null,

        cloudinaryResourceType: fileData.cloudinaryResourceType || null,

        cloudinaryFormat: fileData.cloudinaryFormat || null

    });

};


// ========================================
// SAVE / UPDATE CLOUD FILE METADATA
// ========================================
// Added for cross-browser/device support.
// No actual Blob is required for a cloud-only
// record because the shared file lives in Cloudinary.
// ========================================

export const saveCloudFileMetadata = async(
    fileData
) => {

    if (!fileData ||
        !fileData.localFileId
    ) {

        throw new Error(
            "Local file ID is required"
        );

    }


    const existingFile =
        await getFileByLocalId(
            fileData.localFileId
        );


    if (
        existingFile
    ) {

        return await db.files.update(

            existingFile.localId,

            {

                mongoFileId: fileData.mongoFileId ||
                    existingFile.mongoFileId ||
                    null,

                userId: fileData.userId ||
                    existingFile.userId,

                fileName: fileData.fileName ||
                    existingFile.fileName,

                fileType: fileData.fileType ||
                    existingFile.fileType,

                mimeType: fileData.mimeType ||
                    existingFile.mimeType,

                size: fileData.size !== undefined ?
                    fileData.size :
                    existingFile.size,

                categoryId: fileData.categoryId ||
                    existingFile.categoryId ||
                    null,

                isFavorite: fileData.isFavorite === true ?
                    true :
                    existingFile.isFavorite === true,

                isDeleted: fileData.isDeleted === true ?
                    true :
                    existingFile.isDeleted === true,

                deletedAt: fileData.deletedAt ||
                    existingFile.deletedAt ||
                    null,

                syncStatus: "synced",

                parentFileId: fileData.parentFileId ||
                    existingFile.parentFileId ||
                    null,

                isCopy: fileData.isCopy === true ?
                    true :
                    existingFile.isCopy === true,

                isEdited: fileData.isEdited === true ?
                    true :
                    existingFile.isEdited === true,

                fileUrl: fileData.fileUrl ||
                    existingFile.fileUrl ||
                    null,

                cloudinaryPublicId: fileData.cloudinaryPublicId ||
                    existingFile.cloudinaryPublicId ||
                    null,

                cloudinaryResourceType: fileData.cloudinaryResourceType ||
                    existingFile.cloudinaryResourceType ||
                    null,

                cloudinaryFormat: fileData.cloudinaryFormat ||
                    existingFile.cloudinaryFormat ||
                    null,

                updatedAt: new Date().toISOString()

            }

        );

    }


    return await db.files.add({

        localFileId: fileData.localFileId,

        mongoFileId: fileData.mongoFileId ||
            null,

        userId: fileData.userId,

        fileName: fileData.fileName ||
            fileData.name,

        fileType: fileData.fileType ||
            fileData.type,

        mimeType: fileData.mimeType,

        size: fileData.size || 0,

        fileData: fileData.fileData ||
            null,

        categoryId: fileData.categoryId ||
            null,

        isFavorite: fileData.isFavorite === true ?
            true :
            false,

        isDeleted: fileData.isDeleted === true ?
            true :
            false,

        deletedAt: fileData.deletedAt ||
            null,

        syncStatus: "synced",

        createdAt: fileData.createdAt ||
            new Date().toISOString(),

        updatedAt: new Date().toISOString(),

        parentFileId: fileData.parentFileId ||
            null,

        isCopy: fileData.isCopy === true ?
            true :
            false,

        isEdited: fileData.isEdited === true ?
            true :
            false,

        fileUrl: fileData.fileUrl ||
            null,

        cloudinaryPublicId: fileData.cloudinaryPublicId ||
            null,

        cloudinaryResourceType: fileData.cloudinaryResourceType ||
            null,

        cloudinaryFormat: fileData.cloudinaryFormat ||
            null

    });

};


// ========================================
// UPDATE CLOUD FILE METADATA
// ========================================

export const updateCloudFileMetadata = async(
    localFileId,
    cloudData
) => {

    const file =
        await getFileByLocalId(
            localFileId
        );


    if (!file) {

        throw new Error(
            "Local file not found"
        );

    }


    return await db.files.update(

        file.localId,

        {

            fileUrl: cloudData.fileUrl ||
                file.fileUrl ||
                null,

            cloudinaryPublicId: cloudData.cloudinaryPublicId ||
                file.cloudinaryPublicId ||
                null,

            cloudinaryResourceType: cloudData.cloudinaryResourceType ||
                file.cloudinaryResourceType ||
                null,

            cloudinaryFormat: cloudData.cloudinaryFormat ||
                file.cloudinaryFormat ||
                null,

            mongoFileId: cloudData.mongoFileId ||
                file.mongoFileId ||
                null,

            syncStatus: "synced",

            updatedAt: new Date().toISOString()

        }

    );

};


// ========================================
// GET CLOUD FILE BY LOCAL ID
// ========================================

export const getCloudFileByLocalId = async(
    localFileId
) => {

    const file =
        await getFileByLocalId(
            localFileId
        );


    if (!file) {

        return null;

    }


    if (
        file.fileUrl
    ) {

        return file;

    }


    return null;

};


// ========================================
// GET ALL CLOUD FILES
// ========================================

export const getCloudFiles = async(
    userId
) => {

    const files =
        await getAllFiles(
            userId
        );


    return files.filter(
        (file) => {

            return Boolean(
                file.fileUrl
            );

        }
    );

};


// ========================================
// GET ALL LOCAL FILES
// ========================================

export const getLocalFiles = async() => {

    const files =
        await db.files
        .orderBy("createdAt")
        .reverse()
        .toArray();


    return files;

};


// ========================================
// GET ALL ACTIVE FILES
// ========================================

export const getAllFiles = async(userId) => {

    const files =
        await db.files
        .where("userId")
        .equals(userId)
        .toArray();


    return files
        .filter((file) => {

            return file.isDeleted !== true;

        })
        .sort((a, b) => {

            return (
                new Date(b.createdAt) -
                new Date(a.createdAt)
            );

        });

};


// ========================================
// GET ACTIVE LOCAL FILES
// ========================================

export const getActiveLocalFiles = async() => {

    const files =
        await db.files
        .toArray();


    return files
        .filter((file) => {

            return file.isDeleted !== true;

        })
        .sort((a, b) => {

            return (
                new Date(b.createdAt) -
                new Date(a.createdAt)
            );

        });

};


// ========================================
// GET FAVORITE FILES
// ========================================

export const getFavoriteFiles = async(userId) => {

    const files =
        await db.files
        .where("userId")
        .equals(userId)
        .toArray();


    return files
        .filter((file) => {

            return (
                file.isFavorite === true &&
                file.isDeleted !== true
            );

        })
        .sort((a, b) => {

            return (
                new Date(b.updatedAt) -
                new Date(a.updatedAt)
            );

        });

};


// ========================================
// GET FAVORITE LOCAL FILES
// ========================================

export const getFavoriteLocalFiles = async() => {

    const files =
        await db.files
        .toArray();


    return files
        .filter((file) => {

            return (
                file.isFavorite === true &&
                file.isDeleted === false
            );

        })
        .sort((a, b) => {

            return (
                new Date(b.updatedAt) -
                new Date(a.updatedAt)
            );

        });

};


// ========================================
// GET TRASH FILES
// ========================================

export const getAllTrashFiles = async(userId) => {

    const files =
        await db.files
        .where("userId")
        .equals(userId)
        .toArray();


    return files
        .filter((file) => {

            return file.isDeleted === true;

        })
        .sort((a, b) => {

            const firstDate =
                a.deletedAt ?
                new Date(a.deletedAt) :
                new Date(a.updatedAt);


            const secondDate =
                b.deletedAt ?
                new Date(b.deletedAt) :
                new Date(b.updatedAt);


            return secondDate - firstDate;

        });

};


// ========================================
// GET TRASH LOCAL FILES
// ========================================

export const getTrashLocalFiles = async() => {

    const files =
        await db.files
        .toArray();


    return files
        .filter((file) => {

            return file.isDeleted === true;

        })
        .sort((a, b) => {

            const firstDate =
                a.deletedAt ?
                new Date(a.deletedAt) :
                new Date(a.updatedAt);


            const secondDate =
                b.deletedAt ?
                new Date(b.deletedAt) :
                new Date(b.updatedAt);


            return secondDate - firstDate;

        });

};


// ========================================
// GET SINGLE FILE BY LOCAL ID
// ========================================

export const getFileByLocalId = async(
    localFileId
) => {

    const file =
        await db.files
        .where("localFileId")
        .equals(localFileId)
        .first();


    return file;

};


// ========================================
// GET LOCAL FILE BY ID
// ========================================

export const getLocalFileById = async(
    localFileId
) => {

    if (!localFileId) {

        return null;

    }


    const file =
        await db.files
        .where("localFileId")
        .equals(localFileId)
        .first();


    return file || null;

};


// ========================================
// GET SINGLE FILE BY MONGO ID
// ========================================

export const getFileByMongoId = async(
    mongoFileId
) => {

    const file =
        await db.files
        .where("mongoFileId")
        .equals(mongoFileId)
        .first();


    return file;

};


// ========================================
// GET LOCAL FILE BY MONGO ID
// ========================================

export const getLocalFileByMongoId = async(
    mongoId
) => {

    if (!mongoId) {

        return null;

    }


    const file =
        await db.files
        .where("mongoFileId")
        .equals(mongoId)
        .first();


    return file || null;

};


// ========================================
// UPDATE FILE
// ========================================

export const updateFile = async(
    localId,
    updates
) => {

    return await db.files.update(

        localId,

        {

            ...updates,

            updatedAt: new Date().toISOString()

        }

    );

};


// ========================================
// UPDATE FILE BY LOCAL FILE ID
// ========================================

export const updateFileByLocalId = async(
    localFileId,
    updates
) => {

    const file =
        await getFileByLocalId(
            localFileId
        );


    if (!file) {

        throw new Error(
            "Local file not found"
        );

    }


    return await db.files.update(

        file.localId,

        {

            ...updates,

            updatedAt: new Date().toISOString()

        }

    );

};


// ========================================
// UPDATE LOCAL FILE
// ========================================

export const updateLocalFile = async(
    localFileId,
    updates
) => {

    const file =
        await getLocalFileById(
            localFileId
        );


    if (!file) {

        throw new Error(
            "Local file not found"
        );

    }


    await db.files
        .where("localFileId")
        .equals(localFileId)
        .modify({

            ...updates,

            updatedAt: new Date().toISOString()

        });


    return await getLocalFileById(
        localFileId
    );

};


// ========================================
// RENAME LOCAL FILE
// ========================================

export const renameLocalFile = async(
    localFileId,
    fileName
) => {

    if (!fileName) {

        throw new Error(
            "File name is required"
        );

    }


    return await updateLocalFile(

        localFileId,

        {

            fileName: fileName.trim()

        }

    );

};


// ========================================
// MARK FILE AS DELETED
// ========================================

export const moveFileToTrash = async(
    localFileId
) => {

    const file =
        await getFileByLocalId(
            localFileId
        );


    if (!file) {

        throw new Error(
            "File not found"
        );

    }


    return await db.files.update(

        file.localId,

        {

            isDeleted: true,

            deletedAt: new Date().toISOString(),

            updatedAt: new Date().toISOString(),

            syncStatus: "pending"

        }

    );

};


// ========================================
// MOVE LOCAL FILE TO TRASH
// ========================================

export const moveLocalFileToTrash = async(
    localFileId
) => {

    return await moveFileToTrash(
        localFileId
    );

};


// ========================================
// RESTORE FILE
// ========================================

export const restoreFile = async(
    localFileId
) => {

    const file =
        await getFileByLocalId(
            localFileId
        );


    if (!file) {

        throw new Error(
            "File not found"
        );

    }


    return await db.files.update(

        file.localId,

        {

            isDeleted: false,

            deletedAt: null,

            updatedAt: new Date().toISOString(),

            syncStatus: "pending"

        }

    );

};


// ========================================
// RESTORE LOCAL FILE
// ========================================

export const restoreLocalFile = async(
    localFileId
) => {

    return await restoreFile(
        localFileId
    );

};


// ========================================
// TOGGLE FAVORITE
// ========================================

export const toggleFavorite = async(
    localFileId
) => {

    const file =
        await getFileByLocalId(
            localFileId
        );


    if (!file) {

        throw new Error(
            "File not found"
        );

    }


    const newFavoriteStatus =
        file.isFavorite === true ?
        false :
        true;


    return await db.files.update(

        file.localId,

        {

            isFavorite: newFavoriteStatus,

            updatedAt: new Date().toISOString(),

            syncStatus: "pending"

        }

    );

};


// ========================================
// TOGGLE LOCAL FAVORITE
// ========================================

export const toggleLocalFavorite = async(
    localFileId
) => {

    return await toggleFavorite(
        localFileId
    );

};


// ========================================
// PERMANENT DELETE LOCAL FILE
// ========================================

export const deleteFilePermanently = async(
    localFileId
) => {

    const file =
        await getFileByLocalId(
            localFileId
        );


    if (!file) {

        throw new Error(
            "File not found"
        );

    }


    return await db.files.delete(
        file.localId
    );

};


// ========================================
// PERMANENT DELETE LOCAL FILE
// ========================================

export const permanentlyDeleteLocalFile = async(
    localFileId
) => {

    return await deleteFilePermanently(
        localFileId
    );

};


// ========================================
// EMPTY LOCAL TRASH
// ========================================

export const emptyLocalTrash = async(
    userId
) => {

    const trashFiles =
        await getAllTrashFiles(
            userId
        );


    const localIds =
        trashFiles.map((file) => {

            return file.localId;

        });


    if (localIds.length === 0) {

        return 0;

    }


    await db.files.bulkDelete(
        localIds
    );


    return localIds.length;

};


// ========================================
// GET FILES BY TYPE
// ========================================

export const getLocalFilesByType = async(
    fileType
) => {

    const allowedTypes = [

        "image",

        "video",

        "audio",

        "pdf"

    ];


    if (!allowedTypes.includes(
            fileType
        )) {

        throw new Error(
            "Invalid file type"
        );

    }


    const files =
        await db.files
        .where("fileType")
        .equals(fileType)
        .toArray();


    return files.filter((file) => {

        return file.isDeleted !== true;

    });

};


// ========================================
// GET FILE BLOB
// ========================================

export const getLocalFileBlob = async(
    localFileId
) => {

    const file =
        await getLocalFileById(
            localFileId
        );


    if (!file) {

        return null;

    }


    return file.fileData;

};


// ========================================
// CHECK FILE EXISTS
// ========================================

export const localFileExists = async(
    localFileId
) => {

    const file =
        await getLocalFileById(
            localFileId
        );


    if (file) {

        return true;

    }


    return false;

};


// ========================================
// MARK AS SYNCED
// ========================================

export const markFileAsSynced = async(
    localFileId,
    mongoFileId
) => {

    const file =
        await getFileByLocalId(
            localFileId
        );


    if (!file) {

        throw new Error(
            "File not found"
        );

    }


    return await db.files.update(

        file.localId,

        {

            mongoFileId,

            syncStatus: "synced",

            updatedAt: new Date().toISOString()

        }

    );

};


// ========================================
// MARK AS PENDING
// ========================================

export const markFileAsPending = async(
    localFileId
) => {

    const file =
        await getFileByLocalId(
            localFileId
        );


    if (!file) {

        throw new Error(
            "File not found"
        );

    }


    return await db.files.update(

        file.localId,

        {

            syncStatus: "pending",

            updatedAt: new Date().toISOString()

        }

    );

};


// ========================================
// GET PENDING FILES
// ========================================

export const getPendingFiles = async(
    userId
) => {

    const files =
        await db.files
        .where("userId")
        .equals(userId)
        .toArray();


    return files.filter((file) => {

        return file.syncStatus === "pending";

    });

};


// ========================================
// GET USER FILE COUNT
// ========================================

export const getFileCounts = async(
    userId
) => {

    const files =
        await db.files
        .where("userId")
        .equals(userId)
        .toArray();


    const activeFiles =
        files.filter((file) => {

            return file.isDeleted !== true;

        });


    const images =
        activeFiles.filter((file) => {

            return file.fileType === "image";

        }).length;


    const videos =
        activeFiles.filter((file) => {

            return file.fileType === "video";

        }).length;


    const audios =
        activeFiles.filter((file) => {

            return file.fileType === "audio";

        }).length;


    const pdfs =
        activeFiles.filter((file) => {

            return file.fileType === "pdf";

        }).length;


    const favorites =
        activeFiles.filter((file) => {

            return file.isFavorite === true;

        }).length;


    const trash =
        files.filter((file) => {

            return file.isDeleted === true;

        }).length;


    return {

        total: activeFiles.length,

        images,

        videos,

        audios,

        pdfs,

        favorites,

        trash

    };

};


// ========================================
// CLEAR USER FILES
// ========================================

export const clearUserFiles = async(
    userId
) => {

    const files =
        await db.files
        .where("userId")
        .equals(userId)
        .toArray();


    const localIds =
        files.map((file) => {

            return file.localId;

        });


    if (localIds.length === 0) {

        return;

    }


    await db.files.bulkDelete(
        localIds
    );

};


// ========================================
// CLEAR COMPLETE LOCAL DATABASE
// ========================================

export const clearLocalDatabase = async() => {

    await db.files.clear();

    return true;

};


// ========================================
// EXPORT DATABASE
// ========================================

export { db };


export default db;
