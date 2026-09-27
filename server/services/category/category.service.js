import mongoose from "mongoose";

import Category from "../../models/category.model.js";
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
// CREATE CATEGORY
// =========================================================

const createCategory = async({
    userId,
    name,
    description = ""
}) => {

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
    // NORMALIZE CATEGORY NAME
    // ========================================

    const normalizedName =
        name
        .trim();


    // ========================================
    // CHECK DUPLICATE CATEGORY
    // ========================================

    const existingCategory =
        await Category.findOne({

            user: userId,

            name: normalizedName

        });


    if (existingCategory) {

        throw createError(

            "Category already exists",

            409

        );

    }


    // ========================================
    // CREATE CATEGORY
    // ========================================

    const category =
        await Category.create({

            user: userId,

            name: normalizedName,

            description: description.trim()

        });


    return category;

};


// =========================================================
// GET ALL USER CATEGORIES
// =========================================================

const getCategories = async(
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


    const categories =
        await Category.find({

            user: userId

        })
        .sort({

            createdAt:
                -1

        })
        .lean();


    return categories;

};


// =========================================================
// GET CATEGORY BY ID
// =========================================================

const getCategoryById = async({
    userId,
    categoryId
}) => {

    // ========================================
    // VALIDATE CATEGORY ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(
            categoryId
        )) {

        throw createError(
            "Invalid category ID",
            400
        );

    }


    // ========================================
    // FIND ONLY USER'S CATEGORY
    // ========================================

    const category =
        await Category.findOne({

            _id: categoryId,

            user: userId

        }).lean();


    if (!category) {

        throw createError(

            "Category not found",

            404

        );

    }


    return category;

};


// =========================================================
// UPDATE CATEGORY
// =========================================================

const updateCategory = async({
    userId,
    categoryId,
    name,
    description
}) => {

    // ========================================
    // VALIDATE CATEGORY ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(
            categoryId
        )) {

        throw createError(
            "Invalid category ID",
            400
        );

    }


    // ========================================
    // NORMALIZE NAME
    // ========================================

    const normalizedName =
        name.trim();


    // ========================================
    // FIND CATEGORY
    // ========================================

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


    // ========================================
    // CHECK DUPLICATE NAME
    // ========================================

    const duplicateCategory =
        await Category.findOne({

            user: userId,

            name: normalizedName,

            _id: {
                $ne: categoryId
            }

        });


    if (duplicateCategory) {

        throw createError(

            "Another category with this name already exists",

            409

        );

    }


    // ========================================
    // UPDATE
    // ========================================

    category.name =
        normalizedName;


    if (
        description !== undefined
    ) {

        category.description =
            description.trim();

    }


    await category.save();


    return category;

};


// =========================================================
// DELETE CATEGORY
// =========================================================

const deleteCategory = async({
    userId,
    categoryId
}) => {

    // ========================================
    // VALIDATE CATEGORY ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(
            categoryId
        )) {

        throw createError(
            "Invalid category ID",
            400
        );

    }


    // ========================================
    // FIND CATEGORY
    // ========================================

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


    // ========================================
    // REMOVE CATEGORY FROM FILES
    // ========================================
    //
    // Files are NOT deleted.
    // Only their category becomes null.
    // ========================================

    await File.updateMany(

        {

            user: userId,

            category: categoryId

        },

        {

            $set: {

                category: null

            }

        }

    );


    // ========================================
    // DELETE CATEGORY
    // ========================================

    await Category.deleteOne({

        _id: categoryId,

        user: userId

    });


    return {

        categoryId,

        message: "Category deleted successfully"

    };

};


// =========================================================
// GET CATEGORY FILE COUNT
// =========================================================

const getCategoryFileCount = async({
    userId,
    categoryId
}) => {

    // ========================================
    // VALIDATE CATEGORY ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(
            categoryId
        )) {

        throw createError(
            "Invalid category ID",
            400
        );

    }


    // ========================================
    // CHECK OWNERSHIP
    // ========================================

    const category =
        await Category.findOne({

            _id: categoryId,

            user: userId

        }).lean();


    if (!category) {

        throw createError(

            "Category not found",

            404

        );

    }


    // ========================================
    // COUNT ACTIVE FILES
    // ========================================

    const count =
        await File.countDocuments({

            user: userId,

            category: categoryId,

            isDeleted: false

        });


    return {

        category,

        fileCount: count

    };

};


// =========================================================
// EXPORTS
// =========================================================

export {

    createCategory,

    getCategories,

    getCategoryById,

    updateCategory,

    deleteCategory,

    getCategoryFileCount

};