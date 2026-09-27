import { Resend } from "resend";
import nodemailer from "nodemailer";

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


        const emailAccount = process.env.EMAIL?.trim();
        const emailPassword = process.env.PASS?.trim();

        // Prefer the configured Gmail account. Gmail requires an app
        // password when two-step verification is enabled.
        if (emailAccount || emailPassword) {
            if (!emailAccount || !emailPassword) {
                throw new Error("Both EMAIL and PASS are required for Gmail SMTP");
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: emailAccount,
                    pass: emailPassword.replace(/\s/g, ""),
                },
            });

            return await transporter.sendMail({
                from: emailAccount,
                to,
                subject,
                html,
            });
        }

        // Resend can be used when Gmail SMTP credentials are not configured.
        if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
            throw new Error("Configure EMAIL and PASS for Gmail SMTP, or RESEND_API_KEY and EMAIL_FROM for Resend");
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.error("Email sending failed:", error.message);
            throw new Error("Failed to send email", { cause: error });
        }

        return data;

    } catch (error) {

        console.error("Email service error:", error.message);

        throw error;

    }

};

export default sendEmail;
