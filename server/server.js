import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/db.js";


dotenv.config();


// ========================================
// SERVER PORT
// ========================================

const PORT =
    process.env.PORT || 8080;


// ========================================
// START SERVER
// ========================================

const startServer = async() => {

    try {

        // ========================================
        // CONNECT DATABASE
        // ========================================

        await connectDB();


        // ========================================
        // START EXPRESS SERVER
        // ========================================

        app.listen(

            PORT,

            () => {

                console.log(
                    `Server running on port ${PORT}`
                );

            }

        );

    } catch (error) {

        console.error(

            "Server startup failed:",

            error.message

        );

        process.exit(1);

    }

};


startServer();