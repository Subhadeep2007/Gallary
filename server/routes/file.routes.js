import express from "express";


// ========================================
// CONTROLLER
// ========================================

import {

    create,

    signVideo,

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
// VALIDATORS
// ========================================

import {

    createFileSchema,

    syncFileSchema,

    renameFileSchema,

    changeCategorySchema,

    fileIdSchema

} from "../validators/file.validator.js";


// ========================================
// MIDDLEWARE
// ========================================

import authMiddleware
from "../middleware/auth.middleware.js";

import validate
from "../middleware/validate.middleware.js";

import upload
from "../middleware/upload.middleware.js";


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
// CREATE FILE
// ========================================

router.post(

    "/",

    upload.single("file"),

    createFileSchema,

    validate,

    create

);


// ========================================
// DIRECT VIDEO UPLOAD SIGNATURE
// ========================================

router.post(

    "/video-upload-signature",

    signVideo

);


// ========================================
// SYNC FILE METADATA
// ========================================

router.post(

    "/sync",

    createFileSchema,

    validate,

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

    fileIdSchema,

    validate,

    getOne

);


// ========================================
// RENAME FILE
// ========================================

router.patch(

    "/:fileId/rename",

    fileIdSchema,

    renameFileSchema,

    validate,

    rename

);


// ========================================
// CHANGE CATEGORY
// ========================================

router.patch(

    "/:fileId/category",

    fileIdSchema,

    changeCategorySchema,

    validate,

    changeCategory

);


// ========================================
// TOGGLE FAVORITE
// ========================================

router.patch(

    "/:fileId/favorite",

    fileIdSchema,

    validate,

    favorite

);


// ========================================
// SOFT DELETE
// ========================================

router.delete(

    "/:fileId",

    fileIdSchema,

    validate,

    remove

);


// ========================================
// RESTORE
// ========================================

router.patch(

    "/:fileId/restore",

    fileIdSchema,

    validate,

    restore

);


// ========================================
// PERMANENT DELETE
// ========================================

router.delete(

    "/:fileId/permanent",

    fileIdSchema,

    validate,

    permanentDelete

);


// ========================================
// EXPORT
// ========================================

export default router;
