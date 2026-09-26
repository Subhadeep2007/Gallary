import mongoose from "mongoose";

import User from "../../models/user.model.js";
import FileMetadata from "../../models/fileMetadata.model.js";


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
// SAFE USER SELECT
// =========================================================

const getSafeUserQuery = () => {

    return [

        "-password",

        "-refreshToken",

        "-emailVerificationOTP",

        "-emailVerificationOTPExpire",

        "-resetPasswordOTP",

        "-resetPasswordOTPExpire"

    ].join(" ");

};


// =========================================================
// DASHBOARD STATISTICS
// =========================================================

const getDashboardStats = async() => {

    const [

        totalUsers,

        activeUsers,

        inactiveUsers,

        deletedUsers,

        verifiedUsers,

        totalImages,

        totalVideos,

        totalPdfs,

        totalFiles,

        deletedFiles

    ] = await Promise.all([

        // ========================================
        // USERS
        // ========================================

        User.countDocuments({

            role: "user",

            isDeleted: false

        }),


        User.countDocuments({

            role: "user",

            isActive: true,

            isDeleted: false

        }),


        User.countDocuments({

            role: "user",

            isActive: false,

            isDeleted: false

        }),


        User.countDocuments({

            role: "user",

            isDeleted: true

        }),


        User.countDocuments({

            role: "user",

            isEmailVerified: true,

            isDeleted: false

        }),


        // ========================================
        // FILES
        // ========================================

        FileMetadata.countDocuments({

            type: "image",

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            type: "video",

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            type: "pdf",

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            isDeleted: true

        })

    ]);


    return {

        users: {

            total: totalUsers,

            active: activeUsers,

            inactive: inactiveUsers,

            deleted: deletedUsers,

            verified: verifiedUsers

        },


        files: {

            total: totalFiles,

            images: totalImages,

            videos: totalVideos,

            pdfs: totalPdfs,

            deleted: deletedFiles

        }

    };

};


// =========================================================
// GET ALL USERS
// =========================================================

const getAllUsers = async() => {

    const users =
        await User.find({

            role: "user"

        })

    .select(
        getSafeUserQuery()
    )

    .sort({

        createdAt: -1

    })

    .lean();


    return users;

};


// =========================================================
// GET USER BY ID
// =========================================================

const getUserById = async(
    userId
) => {

    // ========================================
    // VALIDATE USER ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(
            userId
        )) {

        throw createError(

            "Invalid user ID",

            400

        );

    }


    // ========================================
    // FIND USER
    // ========================================

    const user =
        await User.findOne({

            _id: userId,

            role: "user"

        })

    .select(
        getSafeUserQuery()
    )

    .lean();


    if (!user) {

        throw createError(

            "User not found",

            404

        );

    }


    // ========================================
    // USER FILE STATISTICS
    // ========================================

    const [

        totalFiles,

        images,

        videos,

        pdfs,

        deletedFiles,

        storageResult

    ] = await Promise.all([

        FileMetadata.countDocuments({

            user: user._id,

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            user: user._id,

            type: "image",

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            user: user._id,

            type: "video",

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            user: user._id,

            type: "pdf",

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            user: user._id,

            isDeleted: true

        }),


        FileMetadata.aggregate([

            {

                $match: {

                    user: user._id,

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

        user,

        files: {

            total: totalFiles,

            images,

            videos,

            pdfs,

            deleted: deletedFiles,

            storageUsed

        }

    };

};


// =========================================================
// ACTIVATE USER
// =========================================================

const activateUser = async(
    userId
) => {

    // ========================================
    // VALIDATE USER ID
    // ========================================

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

        });


    if (!user) {

        throw createError(

            "User not found",

            404

        );

    }


    // ========================================
    // ACTIVATE USER
    // ========================================

    user.isActive =
        true;


    await user.save();


    return {

        userId: user._id,

        isActive: user.isActive

    };

};


// =========================================================
// DEACTIVATE / SUSPEND USER
// =========================================================

const deactivateUser = async(
    userId
) => {

    // ========================================
    // VALIDATE USER ID
    // ========================================

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

        });


    if (!user) {

        throw createError(

            "User not found",

            404

        );

    }


    // ========================================
    // SUSPEND USER
    // ========================================

    user.isActive =
        false;


    // ========================================
    // INVALIDATE SESSION
    // ========================================

    user.refreshToken =
        null;


    await user.save();


    return {

        userId: user._id,

        isActive: user.isActive

    };

};


// =========================================================
// DELETE USER
// =========================================================
//
// IMPORTANT:
// Admin deletion is a soft delete.
// Actual files live in the user's PWA/IndexedDB,
// so the server cannot physically delete those
// local files from the user's device.
// =========================================================

const deleteUser = async(
    userId
) => {

    // ========================================
    // VALIDATE USER ID
    // ========================================

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

        });


    if (!user) {

        throw createError(

            "User not found",

            404

        );

    }


    // ========================================
    // SOFT DELETE ACCOUNT
    // ========================================

    user.isDeleted =
        true;

    user.deletedAt =
        new Date();

    user.isActive =
        false;

    user.refreshToken =
        null;


    await user.save();


    return {

        message: "User account deleted successfully",

        deleted: {

            userId: user._id,

            isDeleted: user.isDeleted,

            deletedAt: user.deletedAt

        }

    };

};


// =========================================================
// PLATFORM STATISTICS
// =========================================================

const getPlatformStatistics = async() => {

    const [

        totalUsers,

        activeUsers,

        inactiveUsers,

        deletedUsers,

        verifiedUsers,

        totalFiles,

        imageFiles,

        videoFiles,

        pdfFiles,

        deletedFiles,

        storageResult

    ] = await Promise.all([

        User.countDocuments({

            role: "user",

            isDeleted: false

        }),


        User.countDocuments({

            role: "user",

            isActive: true,

            isDeleted: false

        }),


        User.countDocuments({

            role: "user",

            isActive: false,

            isDeleted: false

        }),


        User.countDocuments({

            role: "user",

            isDeleted: true

        }),


        User.countDocuments({

            role: "user",

            isEmailVerified: true,

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            type: "image",

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            type: "video",

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            type: "pdf",

            isDeleted: false

        }),


        FileMetadata.countDocuments({

            isDeleted: true

        }),


        FileMetadata.aggregate([

            {

                $match: {

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

        users: {

            total: totalUsers,

            active: activeUsers,

            inactive: inactiveUsers,

            deleted: deletedUsers,

            verified: verifiedUsers

        },


        files: {

            total: totalFiles,

            images: imageFiles,

            videos: videoFiles,

            pdfs: pdfFiles,

            deleted: deletedFiles,

            storageUsed

        }

    };

};


// =========================================================
// EXPORTS
// =========================================================

export {

    getDashboardStats,

    getAllUsers,

    getUserById,

    activateUser,

    deactivateUser,

    deleteUser,

    getPlatformStatistics

};