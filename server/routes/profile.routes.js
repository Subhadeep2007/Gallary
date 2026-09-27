import express from "express";


// ========================================
// CONTROLLER
// ========================================

import {

    get,

    update,

    updateImage,

    removeImage

} from "../controllers/profile/profile.controller.js";


// ========================================
// VALIDATOR
// ========================================

import {

    updateProfileSchema

} from "../validators/profile.validator.js";


// ========================================
// MIDDLEWARE
// ========================================

import authMiddleware
from "../middleware/auth.middleware.js";

import validate
from "../middleware/validate.middleware.js";

import profileUpload
from "../middleware/profileUpload.middleware.js";


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
// GET PROFILE
// ========================================

router.get(

    "/",

    get

);


// ========================================
// UPDATE PROFILE INFORMATION
// ========================================

router.patch(

    "/",

    updateProfileSchema,

    validate,

    update

);


// ========================================
// UPDATE / REPLACE PROFILE IMAGE
// ========================================

router.patch(

    "/image",

    profileUpload.single(
        "profileImage"
    ),

    updateImage

);


// ========================================
// DELETE PROFILE IMAGE
// ========================================

router.delete(

    "/image",

    removeImage

);


// ========================================
// EXPORT
// ========================================

export default router;