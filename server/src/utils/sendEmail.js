import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or your SMTP host
        auth: {
            user: process.env.EMAIL_USER, // Put these in your .env file
            pass: process.env.EMAIL_PASS
        }
    });

    // "Nice View" - Professional HTML Template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background-color:#F8FAFC; font-family: 'Arial', sans-serif;">
        <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1); margin-top: 40px;">
            <div style="background-color:#2563EB; padding:30px;CX text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:bold;">Smart Outpass</h1>
                <p style="color:#bfdbfe; margin:5px 0 0 0; font-size:14px;">Password Reset Request</p>
            </div>
            
            <div style="padding:40px 30px;">
                <p style="color:#334155; font-size:16px; line-height:1.6; margin-bottom:20px;">
                    Hi <strong>${options.name}</strong>,
                </p>
                <p style="color:#475569; font-size:15px; line-height:1.6; margin-bottom:30px;">
                    You requested to reset your password. Please click the button below to create a new secure password. This link will expire in 10 minutes.
                </p>
                
                <div style="text-align:center; margin-bottom:30px;">
                    <a href="${options.resetUrl}" style="background-color:#2563EB; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">Reset My Password</a>
                </div>

                <p style="color:#94a3b8; font-size:13px; text-align:center;">
                    If you didn't request this, you can safely ignore this email.
                </p>
            </div>

            <div style="background-color:#F1F5F9; padding:20px; text-align:center; border-top:1px solid #E2E8F0;">
                <p style="color:#64748B; font-size:12px; margin:0;">&copy; 2025 Smart Outpass Management System</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const message = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: htmlTemplate
    };

    await transporter.sendMail(message);
};

export default sendEmail;