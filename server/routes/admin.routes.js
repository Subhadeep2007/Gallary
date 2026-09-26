import express from "express";


// ========================================
// CONTROLLER
// ========================================

import {

    dashboard,

    users,

    userDetails,

    activate,

    deactivate,

    removeUser,

    statistics

} from "../controllers/admin/admin.controller.js";


// ========================================
// MIDDLEWARE
// ========================================

import authMiddleware
from "../middleware/auth.middleware.js";

import adminMiddleware
from "../middleware/admin.middleware.js";


// ========================================
// ROUTER
// ========================================

const router =
    express.Router();


// ========================================
// ADMIN PROTECTION
// ========================================

router.use(
    authMiddleware
);

router.use(
    adminMiddleware
);


// ========================================
// DASHBOARD
// ========================================

router.get(

    "/dashboard",

    dashboard

);


// ========================================
// GET ALL USERS
// ========================================

router.get(

    "/users",

    users

);


// ========================================
// GET USER DETAILS
// ========================================

router.get(

    "/users/:userId",

    userDetails

);


// ========================================
// ACTIVATE USER
// ========================================

router.patch(

    "/users/:userId/activate",

    activate

);


// ========================================
// SUSPEND USER
// ========================================

router.patch(

    "/users/:userId/deactivate",

    deactivate

);


// ========================================
// DELETE USER
// ========================================

router.delete(

    "/users/:userId",

    removeUser

);


// ========================================
// PLATFORM STATISTICS
// ========================================

router.get(

    "/statistics",

    statistics

);


// ========================================
// EXPORT
// ========================================

export default router;