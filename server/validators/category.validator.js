import { body, param } from "express-validator";


// ========================================
// CREATE CATEGORY
// ========================================

const createCategorySchema = [

    body("name")
    .trim()
    .notEmpty()
    .withMessage(
        "Category name is required"
    )
    .isLength({
        min: 1,
        max: 2
    })
    .withMessage(
        "Category name must be between 1 and 2 characters"
    ),

    body("description")
    .optional()
    .trim()
    .isLength({
        max: 200
    })
    .withMessage(
        "Description cannot exceed 200 characters"
    )

];


// ========================================
// UPDATE CATEGORY
// ========================================

const updateCategorySchema = [

    param("categoryId")
    .notEmpty()
    .withMessage(
        "Category ID is required"
    )
    .isMongoId()
    .withMessage(
        "Invalid category ID"
    ),

    body("name")
    .trim()
    .notEmpty()
    .withMessage(
        "Category name is required"
    )
    .isLength({
        min: 1,
        max: 50
    })
    .withMessage(
        "Category name must be between 1 and 50 characters"
    ),

    body("description")
    .optional()
    .trim()
    .isLength({
        max: 200
    })
    .withMessage(
        "Description cannot exceed 200 characters"
    )

];


// ========================================
// CATEGORY ID
// ========================================

const categoryIdSchema = [

    param("categoryId")
    .notEmpty()
    .withMessage(
        "Category ID is required"
    )
    .isMongoId()
    .withMessage(
        "Invalid category ID"
    )

];


// ========================================
// EXPORTS
// ========================================

export {

    createCategorySchema,

    updateCategorySchema,

    categoryIdSchema

};