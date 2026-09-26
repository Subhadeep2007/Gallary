const adminMiddleware = (
    req,
    res,
    next
) => {

    // ========================================
    // CHECK AUTHENTICATION
    // ========================================

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message: "Authentication required"

        });

    }


    // ========================================
    // CHECK ADMIN ROLE
    // ========================================

    if (req.user.role !== "admin") {

        return res.status(403).json({

            success: false,

            message: "Admin access required"

        });

    }


    next();

};

export default adminMiddleware;