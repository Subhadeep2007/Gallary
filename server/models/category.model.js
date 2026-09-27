import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({

    // ========================================
    // CATEGORY OWNER
    // ========================================

    user: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true

    },


    // ========================================
    // CATEGORY NAME
    // ========================================

    name: {

        type: String,

        required: true,

        trim: true,

        minlength: 1,

        maxlength: 50

    },


    // ========================================
    // CATEGORY DESCRIPTION
    // ========================================

    description: {

        type: String,

        trim: true,

        maxlength: 200,

        default: ""

    }

}, {

    timestamps: true

});


// ========================================
// ONE CATEGORY NAME PER USER
// ========================================

categorySchema.index({

    user: 1,

    name: 1

}, {

    unique: true

});


const Category =
    mongoose.models.Category ||
    mongoose.model(
        "Category",
        categorySchema
    );


export default Category;