import express from "express";


// ========================================
// CONTROLLER
// ========================================

import {

    create,

    getAll,

    getOne,

    update,

    remove,

    fileCount

} from "../controllers/category/category.controller.js";


// ========================================
// VALIDATORS
// ========================================

import {

    createCategorySchema,

    updateCategorySchema,

    categoryIdSchema

} from "../validators/category.validator.js";


// ========================================
// MIDDLEWARE
// ========================================

import authMiddleware
from "../middleware/auth.middleware.js";

import validate
from "../middleware/validate.middleware.js";


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
// CREATE CATEGORY
// ========================================

router.post(

    "/",

    createCategorySchema,

    validate,

    create

);


// ========================================
// GET ALL CATEGORIES
// ========================================

router.get(

    "/",

    getAll

);


// ========================================
// GET CATEGORY BY ID
// ========================================

router.get(

    "/:categoryId",

    categoryIdSchema,

    validate,

    getOne

);


// ========================================
// GET CATEGORY FILE COUNT
// ========================================

router.get(

    "/:categoryId/count",

    categoryIdSchema,

    validate,

    fileCount

);


// ========================================
// UPDATE CATEGORY
// ========================================

router.patch(

    "/:categoryId",

    updateCategorySchema,

    validate,

    update

);


// ========================================
// DELETE CATEGORY
// ========================================

router.delete(

    "/:categoryId",

    categoryIdSchema,

    validate,

    remove

);


// ========================================
// EXPORT
// ========================================

export default router;