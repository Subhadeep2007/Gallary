import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    activateUser,
    deactivateUser,
    deleteUser,
    getPlatformStatistics
} from "../../services/admin/admin.service.js";


// ========================================
// DASHBOARD
// ========================================

const dashboard = async(
    req,
    res,
    next
) => {

    try {

        const stats =
            await getDashboardStats();


        return res.status(200).json({

            success: true,

            message: "Admin dashboard data fetched successfully",

            data: stats

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// GET ALL USERS
// ========================================

const users = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getAllUsers();


        return res.status(200).json({

            success: true,

            message: "Users fetched successfully",

            data: result

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// GET USER BY ID
// ========================================

const userDetails = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getUserById(
                req.params.userId
            );


        return res.status(200).json({

            success: true,

            message: "User details fetched successfully",

            data: result

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// ACTIVATE USER
// ========================================

const activate = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await activateUser(
                req.params.userId
            );


        return res.status(200).json({

            success: true,

            message: "User activated successfully",

            data: result

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// DEACTIVATE / SUSPEND USER
// ========================================

const deactivate = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await deactivateUser(
                req.params.userId
            );


        return res.status(200).json({

            success: true,

            message: "User suspended successfully",

            data: result

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// DELETE USER
// ========================================

const removeUser = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await deleteUser(
                req.params.userId
            );


        return res.status(200).json({

            success: true,

            message: result.message,

            data: result.deleted

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// PLATFORM STATISTICS
// ========================================

const statistics = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getPlatformStatistics();


        return res.status(200).json({

            success: true,

            message: "Platform statistics fetched successfully",

            data: result

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// EXPORTS
// ========================================

export {

    dashboard,

    users,

    userDetails,

    activate,

    deactivate,

    removeUser,

    statistics

};