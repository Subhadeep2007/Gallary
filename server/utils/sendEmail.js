import { Resend } from "resend";

const sendEmail = async({
    to,
    subject,
    html
}) => {

    try {

        // ========================================
        // CHECK REQUIRED DATA
        // ========================================

        if (!to || !subject || !html) {

            const error =
                new Error(
                    "Email recipient, subject and content are required"
                );

            error.statusCode = 400;

            throw error;

        }


        // ========================================
        // CHECK RESEND API KEY
        // ========================================

        if (!process.env.RESEND_API_KEY) {

            const error =
                new Error(
                    "RESEND_API_KEY is not configured"
                );

            error.statusCode = 500;

            throw error;

        }


        // ========================================
        // CHECK EMAIL FROM
        // ========================================

        if (!process.env.EMAIL_FROM) {

            const error =
                new Error(
                    "EMAIL_FROM is not configured"
                );

            error.statusCode = 500;

            throw error;

        }


        // ========================================
        // CREATE RESEND INSTANCE
        // ========================================

        const resend =
            new Resend(
                process.env.RESEND_API_KEY
            );


        // ========================================
        // SEND EMAIL
        // ========================================

        const { data, error } =
        await resend.emails.send({

            from: process.env.EMAIL_FROM,

            to: [
                to
            ],

            subject,

            html

        });


        // ========================================
        // RESEND ERROR
        // ========================================

        if (error) {

            console.error(
                "Email sending failed:",
                error.message
            );

            const emailError =
                new Error(
                    "Failed to send email"
                );

            emailError.statusCode = 500;

            throw emailError;

        }


        return data;

    } catch (error) {

        console.error(
            "Email service error:",
            error.message
        );

        throw error;

    }

};

export default sendEmail;