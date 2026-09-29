import {
    body,
    param
} from "express-validator";


// =========================================================
// FILE NAME
// =========================================================

const fileNameValidation =
    body("fileName")

.trim()

.notEmpty()

.withMessage(
    "File name is required"
)

.isLength({
    min: 1,
    max: 255
})

.withMessage(
    "File name must be between 1 and 255 characters"
);


// =========================================================
// LOCAL FILE ID
// =========================================================

const localFileIdValidation =
    body("localFileId")

.trim()

.notEmpty()

.withMessage(
    "Local file ID is required"
)

.isLength({
    min: 1,
    max: 255
})

.withMessage(
    "Invalid local file ID"
);


// =========================================================
// FILE TYPE
// =========================================================

const fileTypeValidation =
    body("fileType")

.trim()

.notEmpty()

.withMessage(
    "File type is required"
)

.isIn([
    "image",
    "video",
    "audio",
    "pdf"
])

.withMessage(
    "Only image, video, audio and pdf files are allowed"
);


// =========================================================
// MIME TYPE
// =========================================================

const mimeTypeValidation =
    body("mimeType")

.trim()

.notEmpty()

.withMessage(
    "MIME type is required"
)

.isString()

.withMessage(
    "Invalid MIME type"
);


// =========================================================
// FILE SIZE
// =========================================================
//
// Maximum allowed file size = 1 GB
// =========================================================

const fileSizeValidation =
    body("size")

.notEmpty()

.withMessage(
    "File size is required"
)

.isInt({
    min: 1,
    max: 1024 * 1024 * 1024
})

.withMessage(
    "File size must be between 1 byte and 1 GB"
);


// =========================================================
// CATEGORY ID
// =========================================================

const categoryIdValidation =
    body("categoryId")

.optional({
    nullable: true
})

.isMongoId()

.withMessage(
    "Invalid category ID"
);


// =========================================================
// PARENT FILE ID
// =========================================================

const parentFileIdValidation =
    body("parentFileId")

.optional({
    nullable: true
})

.isMongoId()

.withMessage(
    "Invalid parent file ID"
);


// =========================================================
// IS COPY
// =========================================================

const isCopyValidation =
    body("isCopy")

.optional()

.isBoolean()

.withMessage(
    "isCopy must be true or false"
);


// =========================================================
// IS EDITED
// =========================================================

const isEditedValidation =
    body("isEdited")

.optional()

.isBoolean()

.withMessage(
    "isEdited must be true or false"
);


// =========================================================
// IS FAVORITE
// =========================================================

const isFavoriteValidation =
    body("isFavorite")

.optional()

.isBoolean()

.withMessage(
    "isFavorite must be true or false"
);


// =========================================================
// IS DELETED
// =========================================================

const isDeletedValidation =
    body("isDeleted")

.optional()

.isBoolean()

.withMessage(
    "isDeleted must be true or false"
);


// =========================================================
// DELETED AT
// =========================================================

const deletedAtValidation =
    body("deletedAt")

.optional({
    nullable: true
})

.isISO8601()

.withMessage(
    "Invalid deletedAt date"
);


// =========================================================
// FILE ID PARAM
// =========================================================

const fileIdSchema = [

    param("fileId")

    .notEmpty()

    .withMessage(
        "File ID is required"
    )

    .isMongoId()

    .withMessage(
        "Invalid file ID"
    )

];


// =========================================================
// CREATE FILE
// =========================================================

const createFileSchema = [

    localFileIdValidation,

    fileNameValidation,

    fileTypeValidation,

    mimeTypeValidation,

    fileSizeValidation,

    categoryIdValidation,

    parentFileIdValidation,

    isCopyValidation,

    isEditedValidation

];


// =========================================================
// SYNC FILE
// =========================================================

const syncFileSchema = [

    localFileIdValidation,

    fileNameValidation,

    fileTypeValidation,

    mimeTypeValidation,

    fileSizeValidation,

    categoryIdValidation,

    parentFileIdValidation,

    isCopyValidation,

    isEditedValidation,

    isFavoriteValidation,

    isDeletedValidation,

    deletedAtValidation

];


// =========================================================
// RENAME FILE
// =========================================================

const renameFileSchema = [

    fileNameValidation

];


// =========================================================
// CHANGE CATEGORY
// =========================================================

const changeCategorySchema = [

    body("categoryId")

    .optional({
        nullable: true
    })

    .isMongoId()

    .withMessage(
        "Invalid category ID"
    )

];


// =========================================================
// EXPORTS
// =========================================================

export {

    createFileSchema,

    syncFileSchema,

    renameFileSchema,

    changeCategorySchema,

    fileIdSchema

};