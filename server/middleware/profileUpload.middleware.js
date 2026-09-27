import multer from "multer";


// ========================================
// MEMORY STORAGE
// ========================================

const storage =
    multer.memoryStorage();


// ========================================
// PROFILE IMAGE FILTER
// ========================================

const fileFilter = (
    req,
    file,
    callback
) => {

    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp",

        "image/jpg"

    ];


    if (!allowedTypes.includes(
            file.mimetype
        )) {

        const error =
            new Error(
                "Only JPG, JPEG, PNG and WEBP profile images are allowed"
            );

        error.statusCode =
            400;

        return callback(
            error,
            false
        );

    }


    callback(
        null,
        true
    );

};


// ========================================
// MULTER CONFIGURATION
// ========================================

const profileUpload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize: 5 * 1024 * 1024

        }

    });


export default profileUpload;