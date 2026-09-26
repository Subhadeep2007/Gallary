const errorMiddleware = (
    error,
    req,
    res,
    next
) => {

    console.error(
        "ERROR:",
        error.message
    );


    // ========================================
    // DEFAULT ERROR VALUES
    // ========================================

    let statusCode =
        error.statusCode || 500;

    let message =
        error.message ||
        "Internal server error";


    // ========================================
    // MONGOOSE VALIDATION ERROR
    // ========================================

    if (
        error.name ===
        "ValidationError"
    ) {

        statusCode = 400;

        message =
            Object.values(
                error.errors
            )
            .map(
                (item) => item.message
            )
            .join(", ");

    }


    // ========================================
    // MONGOOSE CAST ERROR
    // ========================================

    if (
        error.name ===
        "CastError"
    ) {

        statusCode = 400;

        message =
            "Invalid ID or invalid data";

    }


    // ========================================
    // DUPLICATE KEY ERROR
    // ========================================

    if (
        error.code === 11000
    ) {

        statusCode = 409;

        const field =
            Object.keys(
                error.keyValue || {}
            )[0];

        message =
            field ?
            `${field} already exists` :
            "Duplicate data already exists";

    }


    // ========================================
    // MULTER ERROR
    // ========================================

    if (
        error.name ===
        "MulterError"
    ) {

        statusCode = 400;

        if (
            error.code ===
            "LIMIT_FILE_SIZE"
        ) {

            message =
                "File size limit exceeded";

        } else {

            message =
                error.message ||
                "File upload failed";

        }

    }


    // ========================================
    // JSON PARSE ERROR
    // ========================================

    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
    ) {

        statusCode = 400;

        message =
            "Invalid JSON format";

    }


    // ========================================
    // SEND RESPONSE
    // ========================================

    return res.status(
        statusCode
    ).json({

        success: false,

        message

    });

};

export default errorMiddleware;