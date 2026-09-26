import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    // ========================================
    // BASIC USER INFORMATION
    // ========================================

    name: {

        type: String,

        required: true,

        trim: true,

        minlength: 2,

        maxlength: 50

    },


    email: {

        type: String,

        required: true,

        unique: true,

        lowercase: true,

        trim: true,

        index: true

    },


    password: {

        type: String,

        required: true,

        minlength: 8

    },


    // ========================================
    // PROFILE
    // ========================================

    profileImage: {

        type: String,

        default: ""

    },

    profileImagePublicId: {

        type: String,

        default: ""

    },


    // ========================================
    // EMAIL VERIFICATION
    // ========================================

    isEmailVerified: {

        type: Boolean,

        default: false

    },

    emailVerificationOTP: {

        type: String,

        default: null

    },

    emailVerificationOTPExpire: {

        type: Date,

        default: null

    },


    // ========================================
    // PASSWORD RESET
    // ========================================

    resetPasswordOTP: {

        type: String,

        default: null

    },

    resetPasswordOTPExpire: {

        type: Date,

        default: null

    },


    // ========================================
    // REFRESH TOKEN
    // ========================================

    refreshToken: {

        type: String,

        default: null

    },


    // ========================================
    // ROLE
    // ========================================

    role: {

        type: String,

        enum: [
            "user",
            "admin"
        ],

        default: "user",

        index: true

    },


    // ========================================
    // ACCOUNT STATUS
    // ========================================

    isActive: {

        type: Boolean,

        default: true,

        index: true

    },

    isDeleted: {

        type: Boolean,

        default: false,

        index: true

    },

    deletedAt: {

        type: Date,

        default: null

    }

}, {

    timestamps: true

});


const User =
    mongoose.models.User ||
    mongoose.model(
        "User",
        userSchema
    );


export default User;