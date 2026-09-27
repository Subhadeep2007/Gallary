import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";


// Load the server's .env before configuring Cloudinary. This module is imported
// while Express routes are evaluated, which happens before server.js executes
// dotenv.config() in its body.
dotenv.config({
    path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../.env"
    )
});


// ========================================
// CLOUDINARY CONFIGURATION
// ========================================

cloudinary.config({

    cloud_name: process.env.CLOUD_NAME,

    api_key: process.env.CLOUD_KEY,

    api_secret: process.env.CLOUD_SECRET

});


export default cloudinary;
