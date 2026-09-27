import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async (
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

        const user = await User.findById(decoded.userId).select(
            "role isActive isDeleted refreshToken"
        );

        if (
            !user ||
            user.isDeleted ||
            !user.isActive ||
            !user.refreshToken ||
            user.role !== decoded.role
        ) {
            return res.status(401).json({
                success: false,
                message: "Your session is no longer valid. Please sign in again.",
            });
        }

        req.user = decoded;


        next();

    } catch (error) {

        if (
            error.name !== "JsonWebTokenError" &&
            error.name !== "TokenExpiredError" &&
            error.name !== "NotBeforeError"
        ) {
            return next(error);
        }

        return res.status(401).json({

            success: false,

            message: "Invalid or expired access token"

        });

    }

};

export default authMiddleware;
