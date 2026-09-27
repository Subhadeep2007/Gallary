import Dexie from "dexie";

// ========================================
// DIGITAL GALLERY DATABASE
// ========================================

const db = new Dexie("DigitalGalleryDB");

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
// fileType    → image / video / pdf
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

    return await db.files.add({

        localFileId,

        mongoFileId: fileData.mongoFileId || null,

        userId: fileData.userId,

        fileName: fileData.fileName || fileData.name,

        fileType: fileData.fileType || fileData.type,

        mimeType: fileData.mimeType,

        size: fileData.size,

        fileData: fileData.fileData,

        categoryId: fileData.categoryId || null,

        isFavorite,

        isDeleted,

        deletedAt: fileData.deletedAt || null,

        syncStatus,

        createdAt,

        updatedAt: new Date().toISOString(),

        parentFileId: fileData.parentFileId || null,

        isCopy: fileData.isCopy === true ?
            true :
            false

    });
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
// UPDATE FILE
// ========================================

export const updateFile = async(
    localId,
    updates
) => {

    return await db.files.update(
        localId, {
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
        file.localId, {
            ...updates,

            updatedAt: new Date().toISOString()
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
        file.localId, {
            isDeleted: true,

            deletedAt: new Date().toISOString(),

            updatedAt: new Date().toISOString(),

            syncStatus: "pending"
        }
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
        file.localId, {
            isDeleted: false,

            deletedAt: null,

            updatedAt: new Date().toISOString(),

            syncStatus: "pending"
        }
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
        file.localId, {
            isFavorite: newFavoriteStatus,

            updatedAt: new Date().toISOString(),

            syncStatus: "pending"
        }
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
        file.localId, {
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
        file.localId, {
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
// EXPORT DATABASE
// ========================================

export { db };

export default db;