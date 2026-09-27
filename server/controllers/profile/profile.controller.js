import {
    getProfile,
    updateProfile,
    updateProfileImage,
    deleteProfileImage
} from "../../services/profile/profile.service.js";


// ========================================
// GET PROFILE
// ========================================

const get = async(
    req,
    res,
    next
) => {

    try {

        const profile =
            await getProfile(
                req.user.userId
            );


        return res.status(200).json({

            success: true,

            message: "Profile fetched successfully",

            data: profile

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// UPDATE PROFILE
// ========================================

const update = async(
    req,
    res,
    next
) => {

    try {

        const profile =
            await updateProfile({

                userId: req.user.userId,

                name: req.body.name

            });


        return res.status(200).json({

            success: true,

            message: "Profile updated successfully",

            data: profile

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// UPDATE PROFILE IMAGE
// ========================================

const updateImage = async(
    req,
    res,
    next
) => {

    try {

        const profile =
            await updateProfileImage({

                userId: req.user.userId,

                file: req.file

            });


        return res.status(200).json({

            success: true,

            message: "Profile image updated successfully",

            data: profile

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// DELETE PROFILE IMAGE
// ========================================

const removeImage = async(
    req,
    res,
    next
) => {

    try {

        const profile =
            await deleteProfileImage(

                req.user.userId

            );


        return res.status(200).json({

            success: true,

            message: "Profile image deleted successfully",

            data: profile

        });

    } catch (error) {

        next(error);

    }

};


// ========================================
// EXPORTS
// ========================================

export {

    get,

    update,

    updateImage,

    removeImage

};