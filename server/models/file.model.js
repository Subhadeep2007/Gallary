import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({

    // ========================================
    // OWNER
    // ========================================

    user: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true

    },


    // ========================================
    // LOCAL FILE ID
    // ========================================

    localFileId: {

        type: String,

        required: true,

        trim: true

    },


    // ========================================
    // FILE INFORMATION
    // ========================================

    fileName: {

        type: String,

        required: true,

        trim: true,

        maxlength: 255

    },


    fileType: {

        type: String,

        enum: [

            "image",

            "video",

            "pdf"

        ],

        required: true,

        index: true

    },


    mimeType: {

        type: String,

        required: true,

        trim: true

    },


    // ========================================
    // FILE SIZE
    // ========================================

    size: {

        type: Number,

        required: true,

        min: 0

    },


    // ========================================
    // CATEGORY
    // ========================================

    category: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Category",

        default: null,

        index: true

    },


    // ========================================
    // EDIT / COPY
    // ========================================

    parentFile: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "File",

        default: null

    },


    isCopy: {

        type: Boolean,

        default: false

    },


    // ========================================
    // SOFT DELETE
    // ========================================

    isDeleted: {

        type: Boolean,

        default: false,

        index: true

    },


    deletedAt: {

        type: Date,

        default: null

    },


    // ========================================
    // SYNC STATUS
    // ========================================

    syncStatus: {

        type: String,

        enum: [

            "pending",

            "synced"

        ],

        default: "pending",

        index: true

    }

}, {

    timestamps: true

});


// ========================================
// UNIQUE LOCAL FILE PER USER
// ========================================

fileSchema.index({

    user: 1,

    localFileId: 1

}, {

    unique: true

});


const File =
    mongoose.models.File ||
    mongoose.model(
        "File",
        fileSchema
    );


export default File;