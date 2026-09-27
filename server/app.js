import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";


// ========================================
// ROUTES
// ========================================

import authRoutes
from "./routes/auth.routes.js";

import adminRoutes
from "./routes/admin.routes.js";

import categoryRoutes
from "./routes/category.routes.js";

import fileRoutes
from "./routes/file.routes.js";


// ========================================
// ERROR MIDDLEWARE
// ========================================

import errorMiddleware
from "./middleware/error.middleware.js";


dotenv.config();


const app =
    express();


// ========================================
// SECURITY
// ========================================

app.use(
    helmet()
);


// ========================================
// REQUEST LOGGER
// ========================================

if (
    process.env.NODE_ENV !==
    "production"
) {

    app.use(
        morgan("dev")
    );

}


// ========================================
// CORS
// ========================================

app.use(

    cors({

        origin: process.env.FRONTEND_URL,

        credentials: true

    })

);


// ========================================
// BODY PARSER
// ========================================

app.use(

    express.json({

        limit: "10mb"

    })

);

app.use(

    express.urlencoded({

        extended: true,

        limit: "10mb"

    })

);


// ========================================
// COOKIE PARSER
// ========================================

app.use(
    cookieParser()
);


// ========================================
// HEALTH CHECK
// ========================================

app.get(
    "/",
    (req, res) => {

        return res.status(200).json({

            success: true,

            message: "Digital Gallery API is running"

        });

    }
);


// ========================================
// AUTH ROUTES
// ========================================

app.use(

    "/api/auth",

    authRoutes

);


// ========================================
// ADMIN ROUTES
// ========================================

app.use(

    "/api/admin",

    adminRoutes

);


// ========================================
// CATEGORY ROUTES
// ========================================

app.use(

    "/api/categories",

    categoryRoutes

);


// ========================================
// FILE ROUTES
// ========================================

app.use(

    "/api/files",

    fileRoutes

);


// ========================================
// 404 ROUTE
// ========================================

app.use(

    (req, res) => {

        return res.status(404).json({

            success: false,

            message: `Route not found: ${req.method} ${req.originalUrl}`

        });

    }

);


// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use(
    errorMiddleware
);


export default app;