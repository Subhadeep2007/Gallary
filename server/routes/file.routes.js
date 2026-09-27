import express from "express";


// ========================================
// CONTROLLER
// ========================================

import {

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

} from "../controllers/file/file.controller.js";


// ========================================
// MIDDLEWARE
// ========================================

import authMiddleware
from "../middleware/auth.middleware.js";


// ========================================
// ROUTER
// ========================================

const router =
    express.Router();


// ========================================
// AUTHENTICATION
// ========================================

router.use(
    authMiddleware
);


// ========================================
// CREATE FILE METADATA
// ========================================

router.post(

    "/",

    create

);


// ========================================
// SYNC FILE METADATA
// ========================================

router.post(

    "/sync",

    sync

);


// ========================================
// FILE STATISTICS
// ========================================

router.get(

    "/statistics",

    statistics

);


// ========================================
// FAVORITES
// ========================================

router.get(

    "/favorites",

    favorites

);


// ========================================
// TRASH
// ========================================

router.get(

    "/trash",

    trash

);


// ========================================
// EMPTY TRASH
// ========================================

router.delete(

    "/trash",

    emptyTrashController

);


// ========================================
// GET ALL ACTIVE FILES
// ========================================

router.get(

    "/",

    getAll

);


// ========================================
// GET FILE BY ID
// ========================================

router.get(

    "/:fileId",

    getOne

);


// ========================================
// RENAME FILE
// ========================================

router.patch(

    "/:fileId/rename",

    rename

);


// ========================================
// CHANGE CATEGORY
// ========================================

router.patch(

    "/:fileId/category",

    changeCategory

);


// ========================================
// TOGGLE FAVORITE
// ========================================

router.patch(

    "/:fileId/favorite",

    favorite

);


// ========================================
// SOFT DELETE
// ========================================

router.delete(

    "/:fileId",

    remove

);


// ========================================
// RESTORE
// ========================================

router.patch(

    "/:fileId/restore",

    restore

);


// ========================================
// PERMANENT DELETE
// ========================================

router.delete(

    "/:fileId/permanent",

    permanentDelete

);


// ========================================
// EXPORT
// ========================================

export default router;