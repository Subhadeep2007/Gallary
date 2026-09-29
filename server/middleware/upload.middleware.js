import multer from "multer";


// ========================================
// MEMORY STORAGE
// ========================================

const storage =
    multer.memoryStorage();


// ========================================
// ALLOWED FILE TYPES
// ========================================

const fileFilter = (
    req,
    file,
    callback
) => {

    const mimeType =
        file.mimetype || "";


    if (
        mimeType.startsWith("image/")
    ) {

        callback(
            null,
            true
        );

        return;
    }


    if (
        mimeType.startsWith("video/")
    ) {

        callback(
            null,
            true
        );

        return;
    }


    if (
        mimeType.startsWith("audio/")
    ) {

        callback(
            null,
            true
        );

        return;
    }


    if (
        mimeType === "application/pdf"
    ) {

        callback(
            null,
            true
        );

        return;
    }


    callback(

        new Error(
            "Only image, video, audio and PDF files are allowed."
        ),

        false

    );

};


// ========================================
// MULTER
// ========================================

const upload =
    multer({

        storage,

        fileFilter

    });


// ========================================
// EXPORT
// ========================================

export default upload;