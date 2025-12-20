import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let htmlContent = '';
    const commonFooter = `
        <div style="background-color:#F1F5F9; padding:20px; text-align:center; border-top:1px solid #E2E8F0;">
            <p style="color:#64748B; font-size:12px; margin:0;">&copy; 2025 Smart Outpass Management System</p>
        </div>`;

    // ======================================================
    // 1. HOME PASS APPROVAL REQUEST (To Guardian)
    // ======================================================
    if (options.type === 'PASS_APPROVAL') {
        htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0; padding:0; background-color:#F8FAFC; font-family: 'Arial', sans-serif;">
            <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1); margin-top: 40px;">
                <div style="background-color:#7C3AED; padding:30px; text-align:center;">
                    <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:bold;">Approval Required</h1>
                    <p style="color:#ddd6fe; margin:5px 0 0 0; font-size:14px;">Student Home Pass Request</p>
                </div>
                
                <div style="padding:40px 30px;">
                    <p style="color:#334155; font-size:16px; line-height:1.6; margin-bottom:20px;">
                        Hi <strong>${options.name}</strong>,
                    </p>
                    <p style="color:#475569; font-size:15px; line-height:1.6; margin-bottom:20px;">
                        Your ward <strong>${options.studentName}</strong> has requested a Home Pass. Please review the details below:
                    </p>
                    
                    <div style="background-color:#F1F5F9; padding:15px; border-radius:8px; border-left: 4px solid #7C3AED; margin-bottom:30px;">
                        <p style="margin:5px 0; font-size:14px; color:#475569;"><strong>Reason:</strong> ${options.passDetails.reason}</p>
                        <p style="margin:5px 0; font-size:14px; color:#475569;"><strong>Leaving:</strong> ${options.passDetails.fromDate}</p>
                        <p style="margin:5px 0; font-size:14px; color:#475569;"><strong>Returning:</strong> ${options.passDetails.toDate}</p>
                    </div>

                    <div style="text-align:center; margin-bottom:30px;">
                        <a href="${options.actionUrl}" style="background-color:#7C3AED; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">Approve Request</a>
                    </div>

                    <p style="color:#94a3b8; font-size:13px; text-align:center;">
                        If you do not approve this request, no action is needed. The pass will remain pending.
                    </p>
                </div>
                ${commonFooter}
            </div>
        </body>
        </html>
        `;
    } 
    // ======================================================
    // 2. MOVEMENT NOTIFICATION (Check-In / Check-Out Alert)
    // ======================================================
    else if (options.type === 'MOVEMENT_ALERT') {
        const isOut = options.movementDetails.status === 'CHECKED OUT';
        const headerColor = isOut ? '#E11D48' : '#059669'; // Red for Out, Green for In
        const statusText = isOut ? 'Exited Campus' : 'Returned to Campus';

        htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0; padding:0; background-color:#F8FAFC; font-family: 'Arial', sans-serif;">
            <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1); margin-top: 40px;">
                <div style="background-color:${headerColor}; padding:30px; text-align:center;">
                    <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:bold;">Movement Alert</h1>
                    <p style="color:#ffffff; margin:5px 0 0 0; font-size:14px; opacity:0.9;">Smart Outpass Security</p>
                </div>
                
                <div style="padding:40px 30px;">
                    <p style="color:#334155; font-size:16px; line-height:1.6; margin-bottom:20px;">
                        Hi <strong>${options.name}</strong>,
                    </p>
                    <p style="color:#475569; font-size:15px; line-height:1.6; margin-bottom:30px;">
                        This is to inform you that your ward <strong>${options.studentName}</strong> has:
                    </p>
                    
                    <div style="text-align:center; margin-bottom:30px;">
                        <span style="font-size:20px; font-weight:bold; color:${headerColor}; border: 2px solid ${headerColor}; padding: 10px 20px; border-radius: 50px;">
                            ${statusText}
                        </span>
                    </div>

                    <div style="text-align:center; color:#475569;">
                        <p style="margin:5px 0;"><strong>Time:</strong> ${options.movementDetails.time}</p>
                        <p style="margin:5px 0;"><strong>Gate:</strong> ${options.movementDetails.gate}</p>
                    </div>
                </div>
                ${commonFooter}
            </div>
        </body>
        </html>
        `;
    } 
    // ======================================================
    // 3. PASSWORD RESET (Default)
    // ======================================================
    else {
        htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0; padding:0; background-color:#F8FAFC; font-family: 'Arial', sans-serif;">
            <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1); margin-top: 40px;">
                <div style="background-color:#2563EB; padding:30px; text-align:center;">
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
                ${commonFooter}
            </div>
        </body>
        </html>
        `;
    }

    const message = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: htmlContent
    };

    await transporter.sendMail(message);
};

export default sendEmail;