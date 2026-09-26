import rateLimit from "express-rate-limit";

const authRateLimiter = rateLimit({

    // ========================================
    // RATE LIMIT WINDOW
    // ========================================

    windowMs: 15 * 60 * 1000,


    // ========================================
    // MAX REQUESTS
    // ========================================

    max: 50,


    // ========================================
    // RESPONSE HEADERS
    // ========================================

    standardHeaders: true,

    legacyHeaders: false,


    // ========================================
    // ERROR RESPONSE
    // ========================================

    message: {

        success: false,

        message: "Too many authentication requests. Please try again after 15 minutes."

    }

});

export default authRateLimiter;