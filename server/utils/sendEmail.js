import { Resend } from "resend";

const resend = new Resend(
    process.env.RESEND_API_KEY
);

const sendEmail = async({
    to,
    subject,
    html
}) => {

    try {

        if (!to || !subject || !html) {

            const error =
                new Error(
                    "Email recipient, subject and content are required"
                );

            error.statusCode = 400;

            throw error;

        }


        if (!process.env.RESEND_API_KEY) {

            const error =
                new Error(
                    "RESEND_API_KEY is not configured"
                );

            error.statusCode = 500;

            throw error;

        }


        if (!process.env.EMAIL_FROM) {

            const error =
                new Error(
                    "EMAIL_FROM is not configured"
                );

            error.statusCode = 500;

            throw error;

        }


        const { data, error } =
        await resend.emails.send({

            from: process.env.EMAIL_FROM,

            to: [to],

            subject,

            html

        });


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