import {
    getPendingFiles,
    updateFileByLocalId
} from "../../services/storage/db.js";
import {
    createFile,
    getFiles
} from "./file.service.js";

const getFileList = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.files)) return response.files;
    return [];
};

export const syncPendingFiles = async(userId) => {
    if (!userId || !navigator.onLine) return { synced: 0, failed: 0 };

    let cloudFiles;
    try {
        cloudFiles = getFileList(await getFiles());
    } catch {
        return { synced: 0, failed: 0, unavailable: true };
    }

    const pendingFiles = await getPendingFiles(userId);
    let synced = 0;
    let failed = 0;

    for (const file of pendingFiles) {
        try {
            let cloudFile = cloudFiles.find((item) =>
                item.localFileId === file.localFileId
            );

            if (!cloudFile) {
                if (!file.fileData) {
                    failed++;
                    continue;
                }

                const response = await createFile({
                    localFileId: file.localFileId,
                    fileName: file.fileName,
                    fileType: file.fileType,
                    mimeType: file.mimeType,
                    size: file.size,
                    categoryId: file.categoryId || null,
                    parentFileId: file.parentFileId || null,
                    isCopy: file.isCopy === true,
                    isEdited: file.isEdited === true,
                    file: file.fileData
                });
                cloudFile = response?.data || response;
                if (!cloudFile?._id) {
                    failed++;
                    continue;
                }
                cloudFiles.push(cloudFile);
            }

            await updateFileByLocalId(file.localFileId, {
                mongoFileId: cloudFile._id,
                fileUrl: cloudFile.fileUrl || null,
                cloudinaryPublicId: cloudFile.cloudinaryPublicId || null,
                cloudinaryResourceType: cloudFile.cloudinaryResourceType || null,
                cloudinaryFormat: cloudFile.cloudinaryFormat || null,
                categoryId: cloudFile.category?._id || cloudFile.category || file.categoryId || null,
                isFavorite: cloudFile.isFavorite === true,
                isDeleted: cloudFile.isDeleted === true,
                syncStatus: "synced"
            });
            synced++;
        } catch (error) {
            failed++;
            console.error(`Pending file sync failed (${file.localFileId}):`, error);
        }
    }

    return { synced, failed };
};
