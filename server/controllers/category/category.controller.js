import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoryFileCount
} from "../../services/category/category.service.js";


// ========================================
// CREATE CATEGORY
// ========================================

const create = async(
    req,
    res,
    next
) => {

    try {

        const category =
            await createCategory({

                userId: req.user.userId,

                name: req.body.name,

                description: req.body.description

            });


        return res.status(201).json({

            success: true,

            message: "Category created successfully",

            data: category

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// GET ALL CATEGORIES
// ========================================

const getAll = async(
    req,
    res,
    next
) => {

    try {

        const categories =
            await getCategories(
                req.user.userId
            );


        return res.status(200).json({

            success: true,

            message: "Categories fetched successfully",

            data: categories

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// GET CATEGORY BY ID
// ========================================

const getOne = async(
    req,
    res,
    next
) => {

    try {

        const category =
            await getCategoryById({

                userId: req.user.userId,

                categoryId: req.params.categoryId

            });


        return res.status(200).json({

            success: true,

            message: "Category fetched successfully",

            data: category

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// UPDATE CATEGORY
// ========================================

const update = async(
    req,
    res,
    next
) => {

    try {

        const category =
            await updateCategory({

                userId: req.user.userId,

                categoryId: req.params.categoryId,

                name: req.body.name,

                description: req.body.description

            });


        return res.status(200).json({

            success: true,

            message: "Category updated successfully",

            data: category

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// DELETE CATEGORY
// ========================================

const remove = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await deleteCategory({

                userId: req.user.userId,

                categoryId: req.params.categoryId

            });


        return res.status(200).json({

            success: true,

            message: result.message,

            data: {

                categoryId: result.categoryId

            }

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// GET CATEGORY FILE COUNT
// ========================================

const fileCount = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await getCategoryFileCount({

                userId: req.user.userId,

                categoryId: req.params.categoryId

            });


        return res.status(200).json({

            success: true,

            message: "Category file count fetched successfully",

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

    create,

    getAll,

    getOne,

    update,

    remove,

    fileCount

};