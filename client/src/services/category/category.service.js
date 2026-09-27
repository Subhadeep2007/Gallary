import api from "../api/api.js";


// ========================================
// CREATE CATEGORY
// ========================================

export const createCategory = async(categoryData) => {

    const response = await api.post(
        "/categories",
        categoryData
    );

    return response.data;
};


// ========================================
// GET ALL CATEGORIES
// ========================================

export const getCategories = async() => {

    const response = await api.get(
        "/categories"
    );

    return response.data;
};


// ========================================
// GET SINGLE CATEGORY
// ========================================

export const getCategory = async(categoryId) => {

    const response = await api.get(
        `/categories/${categoryId}`
    );

    return response.data;
};


// ========================================
// UPDATE CATEGORY
// ========================================

export const updateCategory = async(
    categoryId,
    categoryData
) => {

    const response = await api.patch(
        `/categories/${categoryId}`,
        categoryData
    );

    return response.data;
};


// ========================================
// DELETE CATEGORY
// ========================================

export const deleteCategory = async(categoryId) => {

    const response = await api.delete(
        `/categories/${categoryId}`
    );

    return response.data;
};


// ========================================
// GET CATEGORY FILE COUNT
// ========================================

export const getCategoryFileCount = async(categoryId) => {

    const response = await api.get(
        `/categories/${categoryId}/count`
    );

    return response.data;
};