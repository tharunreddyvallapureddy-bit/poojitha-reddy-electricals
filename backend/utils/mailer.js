const nodemailer = require('nodemailer');

const sendResetCodeEmail = async (toEmail, code, customerName = 'Customer') => {
  try {
    // If SMTP credentials exist in environment
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"Poojitha Reddy Electricals" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Your Password Reset Code - Poojitha Reddy Electricals',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 550px; margin: 0 auto; border: 1px solid #334155;">
            <h2 style="color: #38bdf8; margin-top: 0;">Poojitha Reddy Electricals</h2>
            <p>Hello <strong>${customerName}</strong>,</p>
            <p>You requested a password reset for your customer account.</p>
            <p>Your 6-digit verification code is:</p>
            <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; text-align: center; font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #38bdf8; margin: 20px 0; border: 1px dashed #38bdf8;">
              ${code}
            </div>
            <p style="color: #94a3b8; font-size: 13px;">This verification code is valid for 15 minutes. If you did not request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Poojitha Reddy Electricals & Handyman Services • Muddanur, YSR Kadapa • 84988 70697</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Email Sent] Password reset code sent to ${toEmail}`);
      return { success: true, method: 'smtp' };
    } else {
      // Fallback mode: Log code to server console
      console.log(`====================================================`);
      console.log(`[PASSWORD RESET CODE FOR ${toEmail}] => ${code}`);
      console.log(`====================================================`);
      return { success: true, method: 'simulated', code };
    }
  } catch (error) {
    console.error('Error sending reset email:', error);
    // Even if real email fails, keep code in dev/simulated mode
    return { success: false, error: error.message, code };
  }
};

module.exports = { sendResetCodeEmail };
