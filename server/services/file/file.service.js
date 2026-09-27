import mongoose from "mongoose";

import File from "../../models/file.model.js";
import Category from "../../models/category.model.js";
import User from "../../models/user.model.js";


// =========================================================
// COMMON ERROR HELPER
// =========================================================

const createError = (
    message,
    statusCode = 400
) => {

    const error =
        new Error(message);

    error.statusCode =
        statusCode;

    return error;

};


// =========================================================
// CHECK USER
// =========================================================

const checkUser = async(
    userId
) => {

    if (!mongoose.Types.ObjectId.isValid(
            userId
        )) {

        throw createError(
            "Invalid user ID",
            400
        );

    }


    const user =
        await User.findOne({

            _id: userId,

            role: "user",

            isDeleted: false

        }).select(
            "_id isActive"
        );


    if (!user) {

        throw createError(
            "User not found",
            404
        );

    }


    if (!user.isActive) {

        throw createError(
            "Your account has been deactivated",
            403
        );

    }


    return user;

};


// =========================================================
// CHECK CATEGORY OWNERSHIP
// =========================================================

const checkCategoryOwnership = async({
    userId,
    categoryId
}) => {

    if (!categoryId) {

        return null;

    }


    if (!mongoose.Types.ObjectId.isValid(
            categoryId
        )) {

        throw createError(
            "Invalid category ID",
            400
        );

    }


    const category =
        await Category.findOne({

            _id: categoryId,

            user: userId

        });


    if (!category) {

        throw createError(
            "Category not found",
            404
        );

    }


    return category;

};


// =========================================================
// CREATE FILE METADATA
// =========================================================
//
// Actual file is stored in IndexedDB.
// This creates only the MongoDB metadata record.
// =========================================================

const createFile = async({
    userId,
    localFileId,
    fileName,
    fileType,
    mimeType,
    size,
    categoryId = null,
    parentFileId = null,
    isCopy = false
}) => {

    await checkUser(
        userId
    );


    // ========================================
    // REQUIRED LOCAL FILE ID
    // ========================================

    if (!localFileId) {

        throw createError(
            "Local file ID is required",
            400
        );

    }


    // ========================================
    // FILE TYPE
    // ========================================

    const allowedFileTypes = [

        "image",

        "video",

        "pdf"

    ];


    if (!allowedFileTypes.includes(
            fileType
        )) {

        throw createError(
            "Unsupported file type",
            400
        );

    }


    // ========================================
    // FILE SIZE
    // ========================================

    if (
        typeof size !== "number" ||
        size < 0
    ) {

        throw createError(
            "Invalid file size",
            400
        );

    }


    // ========================================
    // CATEGORY
    // ========================================

    await checkCategoryOwnership({

        userId,

        categoryId

    });


    // ========================================
    // CHECK COPY PARENT
    // ========================================

    if (parentFileId) {

        if (!mongoose.Types.ObjectId.isValid(
                parentFileId
            )) {

            throw createError(
                "Invalid parent file ID",
                400
            );

        }


        const parentFile =
            await File.findOne({

                _id: parentFileId,

                user: userId

            });


        if (!parentFile) {

            throw createError(
                "Parent file not found",
                404
            );

        }

    }


    // ========================================
    // CHECK DUPLICATE LOCAL FILE
    // ========================================

    const existingFile =
        await File.findOne({

            user: userId,

            localFileId

        });


    if (existingFile) {

        throw createError(
            "File already exists",
            409
        );

    }


    // ========================================
    // CREATE
    // ========================================

    const file =
        await File.create({

            user: userId,

            localFileId,

            fileName: fileName.trim(),

            fileType,

            mimeType: mimeType.trim(),

            size,

            category: categoryId,

            parentFile: parentFileId,

            isCopy,

            isFavorite: false,

            isDeleted: false,

            deletedAt: null,

            syncStatus: "synced"

        });


    return file;

};


// =========================================================
// SYNC FILE METADATA
// =========================================================
//
// Used when an offline file becomes online and its
// metadata needs to be synchronized with MongoDB.
// =========================================================

const syncFile = async({
    userId,
    localFileId,
    fileName,
    fileType,
    mimeType,
    size,
    categoryId = null,
    parentFileId = null,
    isCopy = false,
    isFavorite = false,
    isDeleted = false,
    deletedAt = null
}) => {

    await checkUser(
        userId
    );


    if (!localFileId) {

        throw createError(
            "Local file ID is required",
            400
        );

    }


    const allowedFileTypes = [

        "image",

        "video",

        "pdf"

    ];


    if (!allowedFileTypes.includes(
            fileType
        )) {

        throw createError(
            "Unsupported file type",
            400
        );

    }


    await checkCategoryOwnership({

        userId,

        categoryId

    });


    if (parentFileId) {

        if (!mongoose.Types.ObjectId.isValid(
                parentFileId
            )) {

            throw createError(
                "Invalid parent file ID",
                400
            );

        }


        const parentFile =
            await File.findOne({

                _id: parentFileId,

                user: userId

            });


        if (!parentFile) {

            throw createError(
                "Parent file not found",
                404
            );

        }

    }


    const file =
        await File.findOneAndUpdate(

            {

                user: userId,

                localFileId

            },

            {

                $set: {

                    fileName: fileName.trim(),

                    fileType,

                    mimeType: mimeType.trim(),

                    size,

                    category: categoryId,

                    parentFile: parentFileId,

                    isCopy,

                    isFavorite,

                    isDeleted,

                    deletedAt,

                    syncStatus: "synced"

                }

            },

            {

                new: true,

                upsert: true,

                setDefaultsOnInsert: true,

                runValidators: true

            }

        );


    return file;

};


// =========================================================
// GET USER FILES
// =========================================================

const getUserFiles = async({
    userId,
    search = "",
    fileType = null,
    categoryId = null,
    isFavorite = null,
    isDeleted = false,
    sortBy = "createdAt",
    sortOrder = "desc"
}) => {

    await checkUser(
        userId
    );


    // ========================================
    // CATEGORY OWNERSHIP
    // ========================================

    if (categoryId) {

        await checkCategoryOwnership({

            userId,

            categoryId

        });

    }


    // ========================================
    // FILTER
    // ========================================

    const filter = {

        user: userId,

        isDeleted

    };


    // ========================================
    // FILE TYPE FILTER
    // ========================================

    if (fileType) {

        const allowedFileTypes = [

            "image",

            "video",

            "pdf"

        ];


        if (!allowedFileTypes.includes(
                fileType
            )) {

            throw createError(
                "Invalid file type",
                400
            );

        }


        filter.fileType =
            fileType;

    }


    // ========================================
    // CATEGORY FILTER
    // ========================================

    if (categoryId) {

        filter.category =
            categoryId;

    }


    // ========================================
    // FAVORITE FILTER
    // ========================================

    if (
        isFavorite !== null
    ) {

        filter.isFavorite =
            isFavorite;

    }


    // ========================================
    // SEARCH
    // ========================================

    if (
        search &&
        search.trim()
    ) {

        filter.fileName = {

            $regex: search.trim(),

            $options: "i"

        };

    }


    // ========================================
    // SAFE SORT FIELDS
    // ========================================

    const allowedSortFields = [

        "createdAt",

        "updatedAt",

        "fileName",

        "size"

    ];


    if (!allowedSortFields.includes(
            sortBy
        )) {

        sortBy =
            "createdAt";

    }


    const sortDirection =
        sortOrder === "asc" ?
        1 :
        -1;


    const files =
        await File.find(
            filter
        )
        .populate(
            "category",
            "name description"
        )
        .sort({

            [sortBy]: sortDirection

        })
        .lean();


    return files;

};


// =========================================================
// GET FILE BY ID
// =========================================================

const getFileById = async({
    userId,
    fileId
}) => {

    await checkUser(
        userId
    );


    if (!mongoose.Types.ObjectId.isValid(
            fileId
        )) {

        throw createError(
            "Invalid file ID",
            400
        );

    }


    const file =
        await File.findOne({

            _id: fileId,

            user: userId

        })
        .populate(
            "category",
            "name description"
        )
        .lean();


    if (!file) {

        throw createError(
            "File not found",
            404
        );

    }


    return file;

};


// =========================================================
// RENAME FILE
// =========================================================

const renameFile = async({
    userId,
    fileId,
    fileName
}) => {

    await checkUser(
        userId
    );


    if (!mongoose.Types.ObjectId.isValid(
            fileId
        )) {

        throw createError(
            "Invalid file ID",
            400
        );

    }


    if (!fileName ||
        !fileName.trim()
    ) {

        throw createError(
            "File name is required",
            400
        );

    }


    const file =
        await File.findOne({

            _id: fileId,

            user: userId,

            isDeleted: false

        });


    if (!file) {

        throw createError(
            "File not found",
            404
        );

    }


    file.fileName =
        fileName.trim();


    await file.save();


    return file;

};


// =========================================================
// CHANGE FILE CATEGORY
// =========================================================

const changeFileCategory = async({
    userId,
    fileId,
    categoryId = null
}) => {

    await checkUser(
        userId
    );


    if (!mongoose.Types.ObjectId.isValid(
            fileId
        )) {

        throw createError(
            "Invalid file ID",
            400
        );

    }


    await checkCategoryOwnership({

        userId,

        categoryId

    });


    const file =
        await File.findOne({

            _id: fileId,

            user: userId,

            isDeleted: false

        });


    if (!file) {

        throw createError(
            "File not found",
            404
        );

    }


    file.category =
        categoryId;


    await file.save();


    return file;

};


// =========================================================
// TOGGLE FAVORITE
// =========================================================

const toggleFavorite = async({
    userId,
    fileId
}) => {

    await checkUser(
        userId
    );


    if (!mongoose.Types.ObjectId.isValid(
            fileId
        )) {

        throw createError(
            "Invalid file ID",
            400
        );

    }


    const file =
        await File.findOne({

            _id: fileId,

            user: userId,

            isDeleted: false

        });


    if (!file) {

        throw createError(
            "File not found",
            404
        );

    }


    file.isFavorite = !file.isFavorite;


    await file.save();


    return {

        fileId: file._id,

        isFavorite: file.isFavorite

    };

};


// =========================================================
// GET FAVORITES
// =========================================================

const getFavoriteFiles = async({
    userId
}) => {

    return getUserFiles({

        userId,

        isFavorite: true,

        isDeleted: false,

        sortBy: "createdAt",

        sortOrder: "desc"

    });

};


// =========================================================
// SOFT DELETE
// =========================================================

const softDeleteFile = async({
    userId,
    fileId
}) => {

    await checkUser(
        userId
    );


    if (!mongoose.Types.ObjectId.isValid(
            fileId
        )) {

        throw createError(
            "Invalid file ID",
            400
        );

    }


    const file =
        await File.findOne({

            _id: fileId,

            user: userId

        });


    if (!file) {

        throw createError(
            "File not found",
            404
        );

    }


    if (file.isDeleted) {

        throw createError(
            "File is already in trash",
            400
        );

    }


    file.isDeleted =
        true;

    file.deletedAt =
        new Date();


    await file.save();


    return file;

};


// =========================================================
// GET TRASH
// =========================================================

const getTrashFiles = async({
    userId
}) => {

    return getUserFiles({

        userId,

        isDeleted: true,

        sortBy: "deletedAt",

        sortOrder: "desc"

    });

};


// =========================================================
// RESTORE FILE
// =========================================================

const restoreFile = async({
    userId,
    fileId
}) => {

    await checkUser(
        userId
    );


    if (!mongoose.Types.ObjectId.isValid(
            fileId
        )) {

        throw createError(
            "Invalid file ID",
            400
        );

    }


    const file =
        await File.findOne({

            _id: fileId,

            user: userId

        });


    if (!file) {

        throw createError(
            "File not found",
            404
        );

    }


    if (!file.isDeleted) {

        throw createError(
            "File is not in trash",
            400
        );

    }


    file.isDeleted =
        false;

    file.deletedAt =
        null;


    await file.save();


    return file;

};


// =========================================================
// PERMANENT DELETE
// =========================================================
//
// Only MongoDB metadata is deleted here.
// The actual file is inside IndexedDB and must be
// removed from the user's device by the PWA.
// =========================================================

const permanentlyDeleteFile = async({
    userId,
    fileId
}) => {

    await checkUser(
        userId
    );


    if (!mongoose.Types.ObjectId.isValid(
            fileId
        )) {

        throw createError(
            "Invalid file ID",
            400
        );

    }


    const file =
        await File.findOne({

            _id: fileId,

            user: userId,

            isDeleted: true

        });


    if (!file) {

        throw createError(
            "File not found in trash",
            404
        );

    }


    await File.deleteOne({

        _id: fileId,

        user: userId

    });


    return {

        fileId,

        message: "File permanently deleted"

    };

};


// =========================================================
// EMPTY TRASH
// =========================================================

const emptyTrash = async({
    userId
}) => {

    await checkUser(
        userId
    );


    const result =
        await File.deleteMany({

            user: userId,

            isDeleted: true

        });


    return {

        deletedCount: result.deletedCount || 0,

        message: "Trash emptied successfully"

    };

};


// =========================================================
// GET FILE COUNTS
// =========================================================

const getFileStatistics = async({
    userId
}) => {

    await checkUser(
        userId
    );


    const [

        total,

        images,

        videos,

        pdfs,

        favorites,

        deleted,

        storageResult

    ] = await Promise.all([


        // ========================================
        // TOTAL
        // ========================================

        File.countDocuments({

            user: userId,

            isDeleted: false

        }),


        // ========================================
        // IMAGES
        // ========================================

        File.countDocuments({

            user: userId,

            fileType: "image",

            isDeleted: false

        }),


        // ========================================
        // VIDEOS
        // ========================================

        File.countDocuments({

            user: userId,

            fileType: "video",

            isDeleted: false

        }),


        // ========================================
        // PDFS
        // ========================================

        File.countDocuments({

            user: userId,

            fileType: "pdf",

            isDeleted: false

        }),


        // ========================================
        // FAVORITES
        // ========================================

        File.countDocuments({

            user: userId,

            isFavorite: true,

            isDeleted: false

        }),


        // ========================================
        // TRASH
        // ========================================

        File.countDocuments({

            user: userId,

            isDeleted: true

        }),


        // ========================================
        // STORAGE
        // ========================================

        File.aggregate([

            {

                $match: {

                    user: new mongoose.Types.ObjectId(
                        userId
                    ),

                    isDeleted: false

                }

            },

            {

                $group: {

                    _id: null,

                    totalSize: {

                        $sum: "$size"

                    }

                }

            }

        ])

    ]);


    const storageUsed =
        storageResult.length > 0 ?
        storageResult[0].totalSize :
        0;


    return {

        total,

        images,

        videos,

        pdfs,

        favorites,

        deleted,

        storageUsed

    };

};


// =========================================================
// EXPORTS
// =========================================================

export {

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

};