import jwt from "jsonwebtoken";

const authMiddleware = (
    req,
    res,
    next
) => {

    try {

        const authHeader =
            req.headers.authorization;


        // ========================================
        // CHECK AUTHORIZATION HEADER
        // ========================================

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Access token is required"

            });

        }


        // ========================================
        // CHECK BEARER FORMAT
        // ========================================

        const parts =
            authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer" ||
            !parts[1]
        ) {

            return res.status(401).json({

                success: false,

                message: "Invalid authorization format"

            });

        }


        const token =
            parts[1];


        // ========================================
        // VERIFY ACCESS TOKEN
        // ========================================

        const decoded =
            jwt.verify(

                token,

                process.env.JWT_SECRET

            );


        // ========================================
        // ATTACH USER TO REQUEST
        // ========================================

        req.user = decoded;


        next();

    } catch (error) {

        // ========================================
        // TOKEN ERROR
        // ========================================

        return res.status(401).json({

            success: false,

            message: "Invalid or expired access token"

        });

    }

};

export default authMiddleware;