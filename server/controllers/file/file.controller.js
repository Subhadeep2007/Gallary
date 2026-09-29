import {
    createFile,
    syncFile,
    getUserFiles,
    getFileById,
    renameFile,
    changeFileCategory,
    toggleFavorite,
    getFavoriteFiles,
    softDeleteFile,
    getTrashFiles,
    restoreFile,
    permanentlyDeleteFile,
    emptyTrash,
    getFileStatistics
} from "../../services/file/file.service.js";


// ========================================
// CREATE FILE
// ========================================

const create = async(
    req,
    res,
    next
) => {

    try {

        // ========================================
        // FILE REQUIRED
        // ========================================

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "File is required"

            });

        }


        const file =
            await createFile({

                userId: req.user.userId,

                localFileId: req.body.localFileId,

                fileName: req.body.fileName ||
                    req.file.originalname,

                fileType: req.body.fileType,

                mimeType: req.body.mimeType ||
                    req.file.mimetype,

                size: Number(
                    req.body.size ||
                    req.file.size
                ),

                categoryId: req.body.categoryId,

                parentFileId: req.body.parentFileId,

                isCopy: req.body.isCopy,

                isEdited: req.body.isEdited,

                file: req.file

            });


        return res.status(201).json({

            success: true,

            message: "File uploaded successfully",

            data: file

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// SYNC FILE METADATA
// ========================================

const sync = async(
    req,
    res,
    next
) => {

    try {

        const file =
            await syncFile({

                userId: req.user.userId,

                localFileId: req.body.localFileId,

                fileName: req.body.fileName,

                fileType: req.body.fileType,

                mimeType: req.body.mimeType,

                size: req.body.size,

                categoryId: req.body.categoryId,

                parentFileId: req.body.parentFileId,

                isCopy: req.body.isCopy,

                isEdited: req.body.isEdited,

                isFavorite: req.body.isFavorite,

                isDeleted: req.body.isDeleted,

                deletedAt: req.body.deletedAt

            });


        return res.status(200).json({

            success: true,

            message: "File metadata synchronized successfully",

            data: file

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// GET USER FILES
// ========================================

const getAll = async(
    req,
    res,
    next
) => {

    try {

        const {

            search,

            fileType,

            categoryId,

            isFavorite,

            sortBy,

            sortOrder

        } = req.query;


        let favoriteFilter =
            null;


        if (
            isFavorite !== undefined
        ) {

            if (
                isFavorite === "true"
            ) {

                favoriteFilter =
                    true;

            } else if (
                isFavorite === "false"
            ) {

                favoriteFilter =
                    false;

            } else {

                return res.status(400).json({

                    success: false,

                    message: "isFavorite must be true or false"

                });

            }

        }


        const files =
            await getUserFiles({

                userId: req.user.userId,

                search,

                fileType,

                categoryId,

                isFavorite: favoriteFilter,

                isDeleted: false,

                sortBy,

                sortOrder

            });


        return res.status(200).json({

            success: true,

            message: "Files fetched successfully",

            data: files

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// GET FILE BY ID
// ========================================

const getOne = async(
    req,
    res,
    next
) => {

    try {

        const file =
            await getFileById({

                userId: req.user.userId,

                fileId: req.params.fileId

            });


        return res.status(200).json({

            success: true,

            message: "File fetched successfully",

            data: file

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// RENAME FILE
// ========================================

const rename = async(
    req,
    res,
    next
) => {

    try {

        const file =
            await renameFile({

                userId: req.user.userId,

                fileId: req.params.fileId,

                fileName: req.body.fileName

            });


        return res.status(200).json({

            success: true,

            message: "File renamed successfully",

            data: file

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// CHANGE CATEGORY
// ========================================

const changeCategory = async(
    req,
    res,
    next
) => {

    try {

        const file =
            await changeFileCategory({

                userId: req.user.userId,

                fileId: req.params.fileId,

                categoryId: req.body.categoryId

            });


        return res.status(200).json({

            success: true,

            message: "File category updated successfully",

            data: file

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// TOGGLE FAVORITE
// ========================================

const favorite = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await toggleFavorite({

                userId: req.user.userId,

                fileId: req.params.fileId

            });


        return res.status(200).json({

            success: true,

            message: result.isFavorite ?
                "File added to favorites" :
                "File removed from favorites",

            data: result

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// GET FAVORITES
// ========================================

const favorites = async(
    req,
    res,
    next
) => {

    try {

        const files =
            await getFavoriteFiles({

                userId: req.user.userId

            });


        return res.status(200).json({

            success: true,

            message: "Favorite files fetched successfully",

            data: files

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// SOFT DELETE FILE
// ========================================

const remove = async(
    req,
    res,
    next
) => {

    try {

        const file =
            await softDeleteFile({

                userId: req.user.userId,

                fileId: req.params.fileId

            });


        return res.status(200).json({

            success: true,

            message: "File moved to trash successfully",

            data: file

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// GET TRASH
// ========================================

const trash = async(
    req,
    res,
    next
) => {

    try {

        const files =
            await getTrashFiles({

                userId: req.user.userId

            });


        return res.status(200).json({

            success: true,

            message: "Trash files fetched successfully",

            data: files

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// RESTORE FILE
// ========================================

const restore = async(
    req,
    res,
    next
) => {

    try {

        const file =
            await restoreFile({

                userId: req.user.userId,

                fileId: req.params.fileId

            });


        return res.status(200).json({

            success: true,

            message: "File restored successfully",

            data: file

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// PERMANENT DELETE
// ========================================

const permanentDelete = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await permanentlyDeleteFile({

                userId: req.user.userId,

                fileId: req.params.fileId

            });


        return res.status(200).json({

            success: true,

            message: result.message,

            data: {

                fileId: result.fileId

            }

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// EMPTY TRASH
// ========================================

const emptyTrashController = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await emptyTrash({

                userId: req.user.userId

            });


        return res.status(200).json({

            success: true,

            message: result.message,

            data: {

                deletedCount: result.deletedCount

            }

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// FILE STATISTICS
// ========================================

const statistics = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getFileStatistics({

                userId: req.user.userId

            });


        return res.status(200).json({

            success: true,

            message: "File statistics fetched successfully",

            data: result

        });

    } catch (
        error
    ) {

        next(error);

    }

};


// ========================================
// EXPORTS
// ========================================

export {

    create,

    sync,

    getAll,

    getOne,

    rename,

    changeCategory,

    favorite,

    favorites,

    remove,

    trash,

    restore,

    permanentDelete,

    emptyTrashController,

    statistics

};