import mongoose from "mongoose";

import User from "../../models/user.model.js";
import File from "../../models/file.model.js";


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
        totalAudios,
        totalPdfs,
        totalFiles,
        deletedFiles,
        storageResult
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

        File.countDocuments({
            fileType: "image",
            isDeleted: false
        }),

        File.countDocuments({
            fileType: "video",
            isDeleted: false
        }),

        File.countDocuments({
            fileType: "audio",
            isDeleted: false
        }),

        File.countDocuments({
            fileType: "pdf",
            isDeleted: false
        }),

        File.countDocuments({
            isDeleted: false
        }),

        File.countDocuments({
            isDeleted: true
        }),


        // ========================================
        // ACTIVE STORAGE
        // ========================================

        File.aggregate([

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

            images: totalImages,

            videos: totalVideos,

            audios: totalAudios,

            pdfs: totalPdfs,

            deleted: deletedFiles,

            storageUsed

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
        audios,
        pdfs,
        deletedFiles,
        storageResult
    ] = await Promise.all([


        // ========================================
        // TOTAL ACTIVE FILES
        // ========================================

        File.countDocuments({

            user: user._id,

            isDeleted: false

        }),


        // ========================================
        // IMAGES
        // ========================================

        File.countDocuments({

            user: user._id,

            fileType: "image",

            isDeleted: false

        }),


        // ========================================
        // VIDEOS
        // ========================================

        File.countDocuments({

            user: user._id,

            fileType: "video",

            isDeleted: false

        }),


        // ========================================
        // AUDIO
        // ========================================

        File.countDocuments({

            user: user._id,

            fileType: "audio",

            isDeleted: false

        }),


        // ========================================
        // PDFS
        // ========================================

        File.countDocuments({

            user: user._id,

            fileType: "pdf",

            isDeleted: false

        }),


        // ========================================
        // DELETED FILES
        // ========================================

        File.countDocuments({

            user: user._id,

            isDeleted: true

        }),


        // ========================================
        // STORAGE USED
        // ========================================

        File.aggregate([

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

            audios,

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
    // ACTIVATE
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
// Admin account deletion is a soft delete.
// Actual Gallery files are stored locally
// inside the user's PWA / IndexedDB.
// Therefore the backend cannot physically
// delete those local files.
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
        audioFiles,
        pdfFiles,
        deletedFiles,
        storageResult
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

        File.countDocuments({

            isDeleted: false

        }),

        File.countDocuments({

            fileType: "image",

            isDeleted: false

        }),

        File.countDocuments({

            fileType: "video",

            isDeleted: false

        }),

        File.countDocuments({

            fileType: "audio",

            isDeleted: false

        }),

        File.countDocuments({

            fileType: "pdf",

            isDeleted: false

        }),

        File.countDocuments({

            isDeleted: true

        }),


        // ========================================
        // TOTAL ACTIVE STORAGE
        // ========================================

        File.aggregate([

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

            audios: audioFiles,

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