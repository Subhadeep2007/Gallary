import { createHash } from "node:crypto";
import mongoose from "mongoose";

import File from "../../models/file.model.js";
import Category from "../../models/category.model.js";
import User from "../../models/user.model.js";
import cloudinary from "../../config/cloudinary.js";


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
// GET CLOUDINARY RESOURCE TYPE
// =========================================================

const getCloudinaryResourceType = (
    fileType
) => {

    if (
        fileType === "image"
    ) {

        return "image";

    }


    if (
        fileType === "video"
    ) {

        return "video";

    }


    if (
        fileType === "audio"
    ) {

        return "video";

    }


    return "raw";

};


// =========================================================
// UPLOAD FILE TO CLOUDINARY
// =========================================================

const uploadToCloudinary = async({
    file,
    fileType,
    userId,
    localFileId,
    isEdited = false,
    isCopy = false,
    categoryId = null,
    parentFileId = null
}) => {

    if (!file) {

        throw createError(
            "File is required",
            400
        );

    }


    if (!file.buffer) {

        throw createError(
            "File buffer is not available",
            400
        );

    }


    const resourceType =
        getCloudinaryResourceType(
            fileType
        );


    const folder =
        `digital-gallery/${userId}`;


    return new Promise(
        (
            resolve,
            reject
        ) => {

            const uploadStream =
                cloudinary.uploader.upload_stream(

                    {
                        folder,

                        resource_type: resourceType,

                        use_filename: true,

                        unique_filename: true,

                        overwrite: false,

                        filename_override: file.originalname,

                        context: Object.fromEntries(
                            Object.entries({
                                local_file_id: localFileId,
                                file_type: fileType,
                                is_edited: String(isEdited === true),
                                is_copy: String(isCopy === true),
                                category_id: categoryId,
                                parent_file_id: parentFileId
                            }).filter(([, value]) => value !== null && value !== undefined)
                        )

                    },

                    (
                        error,
                        result
                    ) => {

                        if (error) {

                            reject(
                                error
                            );

                            return;

                        }


                        if (!result) {

                            reject(
                                new Error(
                                    "Cloudinary upload failed"
                                )
                            );

                            return;

                        }


                        resolve(
                            result
                        );

                    }

                );


            uploadStream.end(
                file.buffer
            );

        }
    );

};


// =========================================================
// DELETE FILE FROM CLOUDINARY
// =========================================================

const deleteFromCloudinary = async({
    publicId,
    resourceType
}) => {

    if (!publicId) {

        return null;

    }


    try {

        const result =
            await cloudinary.uploader.destroy(

                publicId,

                {
                    resource_type: resourceType || "image",

                    type: "upload"

                }

            );


        return result;

    } catch (error) {

        console.error(
            "Cloudinary delete error:",
            error
        );

        return null;

    }

};


// =========================================================
// CREATE FILE
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
    isCopy = false,
    isEdited = false,
    file
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

        "pdf",

        "audio"

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
    // CLOUDINARY UPLOAD
    // ========================================

    const cloudinaryResult =
        await uploadToCloudinary({

            file,

            fileType,

            userId,

            localFileId,

            isEdited,

            isCopy,

            categoryId,

            parentFileId

        });


    // ========================================
    // CREATE
    // ========================================

    const savedFile =
        await File.create({

            user: userId,

            localFileId,

            fileName: fileName.trim(),

            fileType,

            mimeType: mimeType.trim(),

            size,

            fileUrl: cloudinaryResult.secure_url,

            cloudinaryPublicId: cloudinaryResult.public_id,

            cloudinaryResourceType: cloudinaryResult.resource_type,

            cloudinaryFormat: cloudinaryResult.format || null,

            category: categoryId,

            parentFile: parentFileId,

            isCopy,

            isEdited,

            isFavorite: false,

            isDeleted: false,

            deletedAt: null,

            syncStatus: "synced"

        });


    return savedFile;

};


// =========================================================
// SYNC FILE METADATA
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
    isEdited = false,
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

        "pdf",

        "audio"

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

                    isEdited,

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

    // Rebuild missing Mongo metadata from the account's Cloudinary folder so
    // assets survive an interrupted metadata write and appear on other devices.
    await recoverMissingCloudinaryFiles(userId);

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

            "pdf",

            "audio"

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


    // ========================================
    // DELETE CLOUDINARY FILE
    // ========================================

    if (
        file.cloudinaryPublicId
    ) {

        await deleteFromCloudinary({

            publicId: file.cloudinaryPublicId,

            resourceType: file.cloudinaryResourceType

        });

    }


    // ========================================
    // DELETE MONGODB METADATA
    // ========================================

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


    const trashFiles =
        await File.find({

            user: userId,

            isDeleted: true

        })
        .select(
            "_id cloudinaryPublicId cloudinaryResourceType"
        )
        .lean();


    // ========================================
    // DELETE CLOUDINARY FILES
    // ========================================

    for (
        let i = 0; i < trashFiles.length; i++
    ) {

        const file =
            trashFiles[i];


        if (
            file.cloudinaryPublicId
        ) {

            await deleteFromCloudinary({

                publicId: file.cloudinaryPublicId,

                resourceType: file.cloudinaryResourceType

            });

        }

    }


    // ========================================
    // DELETE MONGODB RECORDS
    // ========================================

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

        audios,

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
        // AUDIOS
        // ========================================

        File.countDocuments({

            user: userId,

            fileType: "audio",

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

        storageResult.length > 0

        ?
        storageResult[0].totalSize

        : 0;


    return {

        total,

        images,

        videos,

        audios,

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


// =========================================================
// RECOVER CLOUD FILES WITHOUT A MONGODB RECORD
// =========================================================

const cloudinaryReconcileCache = new Map();
const CLOUDINARY_RECONCILE_INTERVAL = 30_000;

const inferCloudFileType = (asset) => {
    const format = String(asset.format || "").toLowerCase();
    const name = String(asset.display_name || asset.public_id || "").toLowerCase();
    const extension = name.split(".").pop();
    const effectiveFormat = format || extension;

    // Cloudinary can store PDFs as image assets or raw assets depending on
    // the upload path, so identify their format before mapping resource types.
    if (effectiveFormat === "pdf") return "pdf";
    if (asset.resource_type === "image") return "image";
    if (asset.resource_type === "video") {
        return ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(effectiveFormat)
            ? "audio"
            : "video";
    }
    return "audio";
};

const inferCloudMimeType = (asset, fileType) => {
    const format = String(asset.format || "").toLowerCase();
    if (fileType === "pdf") return "application/pdf";
    if (fileType === "image") return `image/${format === "jpg" ? "jpeg" : format || "octet-stream"}`;
    if (fileType === "video") return `video/${format || "mp4"}`;

    const audioMimeTypes = {
        mp3: "audio/mpeg",
        m4a: "audio/mp4",
        aac: "audio/aac",
        wav: "audio/wav",
        ogg: "audio/ogg",
        webm: "audio/webm",
        flac: "audio/flac"
    };
    return audioMimeTypes[format] || `audio/${format || "octet-stream"}`;
};

const getCloudinaryFolderResources = async(userId) => {
    const folder = `digital-gallery/${userId}`;
    const assets = [];
    const resourceTypes = ["image", "video", "raw"];
    let dynamicFolderListingAvailable = true;

    for (const resourceType of resourceTypes) {
        let nextCursor;
        do {
            try {
                const page = await cloudinary.api.resources_by_asset_folder(
                    folder,
                    {
                        resource_type: resourceType,
                        max_results: 500,
                        next_cursor: nextCursor,
                        context: true
                    }
                );
                assets.push(...(page.resources || []));
                nextCursor = page.next_cursor;
            } catch {
                dynamicFolderListingAvailable = false;
                break;
            }
        } while (nextCursor);

        if (!dynamicFolderListingAvailable) break;
    }

    if (dynamicFolderListingAvailable) return assets;

    // Fixed-folder accounts use public-ID prefixes. List each resource type
    // so non-image uploads are included too.
    assets.length = 0;
    for (const resourceType of resourceTypes) {
        let nextCursor;
        do {
            const page = await cloudinary.api.resources({
                resource_type: resourceType,
                type: "upload",
                prefix: `${folder}/`,
                max_results: 500,
                next_cursor: nextCursor,
                context: true
            });
            assets.push(...(page.resources || []));
            nextCursor = page.next_cursor;
        } while (nextCursor);
    }

    return assets;
};

const recoverMissingCloudinaryFiles = async(userId) => {
    const now = Date.now();
    const lastReconcile = cloudinaryReconcileCache.get(String(userId)) || 0;
    if (now - lastReconcile < CLOUDINARY_RECONCILE_INTERVAL) return;

    try {
        const assets = await getCloudinaryFolderResources(userId);
        for (const asset of assets) {
            if (!asset.public_id || !asset.resource_type) continue;

            const context = asset.context?.custom || asset.context || {};
            const contextType = ["image", "video", "audio", "pdf"].includes(context.file_type)
                ? context.file_type
                : null;
            const contextLocalFileId = typeof context.local_file_id === "string"
                ? context.local_file_id
                : null;
            const fileType = contextType || inferCloudFileType(asset);
            const localFileId = contextLocalFileId || `cloud-${createHash("sha256").update(`${asset.resource_type}:${asset.public_id}`).digest("hex")}`;

            const existing = await File.findOne({
                user: userId,
                $or: [
                    { cloudinaryPublicId: asset.public_id },
                    { localFileId },
                    ...(asset.secure_url ? [{ fileUrl: asset.secure_url }] : [])
                ]
            });

            if (existing) {
                let changed = false;
                if (existing.fileType !== fileType) {
                    existing.fileType = fileType;
                    existing.mimeType = inferCloudMimeType(asset, fileType);
                    changed = true;
                }
                if (!existing.cloudinaryPublicId || !existing.fileUrl) {
                    existing.cloudinaryPublicId = asset.public_id;
                    existing.cloudinaryResourceType = asset.resource_type;
                    existing.cloudinaryFormat = asset.format || null;
                    existing.fileUrl = asset.secure_url || cloudinary.url(asset.public_id, {
                        secure: true,
                        resource_type: asset.resource_type,
                        type: "upload",
                        format: asset.format || undefined
                    });
                    changed = true;
                }
                if (changed) {
                    await existing.save();
                }
                continue;
            }

            const fileName = asset.display_name || asset.original_filename || asset.public_id.split("/").pop();

            await File.updateOne(
                { user: userId, localFileId },
                {
                    $setOnInsert: {
                        user: userId,
                        localFileId,
                        fileName,
                        fileType,
                        mimeType: inferCloudMimeType(asset, fileType),
                        size: asset.bytes || 0,
                        fileUrl: asset.secure_url || cloudinary.url(asset.public_id, {
                            secure: true,
                            resource_type: asset.resource_type,
                            type: "upload",
                            format: asset.format || undefined
                        }),
                        cloudinaryPublicId: asset.public_id,
                        cloudinaryResourceType: asset.resource_type,
                        cloudinaryFormat: asset.format || null,
                        category: mongoose.Types.ObjectId.isValid(context.category_id)
                            ? context.category_id
                            : null,
                        parentFile: mongoose.Types.ObjectId.isValid(context.parent_file_id)
                            ? context.parent_file_id
                            : null,
                        isCopy: context.is_copy === true || context.is_copy === "true",
                        isEdited: context.is_edited === true || context.is_edited === "true",
                        isFavorite: false,
                        isDeleted: false,
                        deletedAt: null,
                        syncStatus: "synced",
                        createdAt: asset.created_at ? new Date(asset.created_at) : new Date()
                    }
                },
                { upsert: true }
            );
        }

        cloudinaryReconcileCache.set(String(userId), Date.now());
    } catch (error) {
        // Cloudinary recovery is best effort: keep the MongoDB gallery usable
        // if the provider's Admin API is temporarily unavailable.
        console.error("Cloudinary gallery reconciliation failed:", error.message);
    }
};
