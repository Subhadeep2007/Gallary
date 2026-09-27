import User from "../../models/user.model.js";
import cloudinary from "../../config/cloudinary.js";


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
// SAFE USER DATA
// =========================================================

const getSafeUser = (
    user
) => {

    return {

        userId: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        profileImage: user.profileImage,

        profileImagePublicId: user.profileImagePublicId,

        isEmailVerified: user.isEmailVerified,

        isActive: user.isActive,

        createdAt: user.createdAt,

        updatedAt: user.updatedAt

    };

};


// =========================================================
// CHECK USER
// =========================================================

const checkUser = async(
    userId
) => {

    const user =
        await User.findById(
            userId
        );


    if (!user) {

        throw createError(
            "User not found",
            404
        );

    }


    if (user.isDeleted) {

        throw createError(
            "This account has been deleted",
            403
        );

    }


    if (!user.isActive) {

        throw createError(
            "Your account has been deactivated",
            403
        );

    }


    return user;

};


// =========================================================
// GET PROFILE
// =========================================================

const getProfile = async(
    userId
) => {

    const user =
        await checkUser(
            userId
        );


    return getSafeUser(
        user
    );

};


// =========================================================
// UPDATE PROFILE INFORMATION
// =========================================================

const updateProfile = async({
    userId,
    name
}) => {

    const user =
        await checkUser(
            userId
        );


    // ========================================
    // NAME VALIDATION
    // ========================================

    if (
        name === undefined
    ) {

        throw createError(
            "Name is required",
            400
        );

    }


    const trimmedName =
        name.trim();


    if (!trimmedName) {

        throw createError(
            "Name cannot be empty",
            400
        );

    }


    if (
        trimmedName.length < 2 ||
        trimmedName.length > 50
    ) {

        throw createError(
            "Name must be between 2 and 50 characters",
            400
        );

    }


    // ========================================
    // UPDATE
    // ========================================

    user.name =
        trimmedName;


    await user.save();


    return getSafeUser(
        user
    );

};


// =========================================================
// CLOUDINARY UPLOAD HELPER
// =========================================================

const uploadProfileImage = (
    buffer
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const stream =
                cloudinary.uploader.upload_stream(

                    {
                        folder: "digital-gallery/profiles",

                        resource_type: "image",

                        transformation: [

                            {
                                width: 500,

                                height: 500,

                                crop: "limit"

                            }

                        ]

                    },

                    (
                        error,
                        result
                    ) => {

                        if (error) {

                            return reject(
                                error
                            );

                        }


                        resolve(
                            result
                        );

                    }

                );


            stream.end(
                buffer
            );

        }
    );

};


// =========================================================
// DELETE CLOUDINARY IMAGE
// =========================================================

const deleteCloudinaryImage = async(
    publicId
) => {

    if (!publicId) {

        return;

    }


    try {

        await cloudinary.uploader.destroy(

            publicId,

            {
                resource_type: "image"
            }

        );

    } catch (error) {

        console.error(

            "Cloudinary image deletion failed:",

            error.message

        );

    }

};


// =========================================================
// UPDATE PROFILE IMAGE
// =========================================================

const updateProfileImage = async({
    userId,
    file
}) => {

    const user =
        await checkUser(
            userId
        );


    // ========================================
    // CHECK FILE
    // ========================================

    if (!file) {

        throw createError(
            "Profile image is required",
            400
        );

    }


    // ========================================
    // UPLOAD NEW IMAGE
    // ========================================

    let uploadedImage;


    try {

        uploadedImage =
            await uploadProfileImage(
                file.buffer
            );

    } catch (error) {

        console.error(

            "Cloudinary profile upload failed:",

            error.message

        );

        throw createError(

            "Failed to upload profile image",

            500

        );

    }


    // ========================================
    // STORE OLD PUBLIC ID
    // ========================================

    const oldPublicId =
        user.profileImagePublicId;


    // ========================================
    // UPDATE DATABASE
    // ========================================

    try {

        user.profileImage =
            uploadedImage.secure_url;

        user.profileImagePublicId =
            uploadedImage.public_id;


        await user.save();

    } catch (error) {

        // ========================================
        // CLEAN NEW ORPHAN IMAGE
        // ========================================

        await deleteCloudinaryImage(

            uploadedImage.public_id

        );


        throw error;

    }


    // ========================================
    // DELETE OLD IMAGE
    // ========================================

    if (
        oldPublicId &&
        oldPublicId !==
        uploadedImage.public_id
    ) {

        await deleteCloudinaryImage(
            oldPublicId
        );

    }


    return getSafeUser(
        user
    );

};


// =========================================================
// DELETE PROFILE IMAGE
// =========================================================

const deleteProfileImage = async(
    userId
) => {

    const user =
        await checkUser(
            userId
        );


    // ========================================
    // CHECK EXISTING IMAGE
    // ========================================

    if (!user.profileImage &&
        !user.profileImagePublicId
    ) {

        throw createError(
            "Profile image not found",
            404
        );

    }


    const publicId =
        user.profileImagePublicId;


    // ========================================
    // REMOVE FROM DATABASE
    // ========================================

    user.profileImage =
        "";

    user.profileImagePublicId =
        "";


    await user.save();


    // ========================================
    // DELETE FROM CLOUDINARY
    // ========================================

    if (publicId) {

        await deleteCloudinaryImage(
            publicId
        );

    }


    return getSafeUser(
        user
    );

};


// =========================================================
// EXPORTS
// =========================================================

export {

    getProfile,

    updateProfile,

    updateProfileImage,

    deleteProfileImage

};