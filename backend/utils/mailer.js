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

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_EMAIL || 'poojithareddyelectricals@gmail.com';
const ADMIN_NOTIFICATION_PHONE = process.env.ADMIN_PHONE || '6281752093';

// @desc Send notification to admin when customer books a service
const sendAdminBookingNotification = async (booking) => {
  const visitDateStr = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const emailSubject = `⚡ New Booking Alert: ${booking.serviceType} [${booking.bookingCode}]`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="border-bottom: 2px solid #38bdf8; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #38bdf8; margin: 0; font-size: 22px;">POOJITHA REDDY ELECTRICALS</h2>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Customer Service Request Notification</p>
      </div>

      <div style="background-color: #1e293b; border-left: 4px solid #a855f7; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #c084fc; font-weight: bold;">Reference Code</span>
        <h3 style="margin: 4px 0 0 0; font-size: 24px; color: #f8fafc; letter-spacing: 2px;">${booking.bookingCode}</h3>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #334155;">
          <td style="padding: 10px 0; color: #94a3b8; font-size: 14px; width: 40%;">Service Category:</td>
          <td style="padding: 10px 0; color: #f8fafc; font-weight: bold; font-size: 15px;">${booking.serviceType}</td>
        </tr>
        <tr style="border-bottom: 1px solid #334155;">
          <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Customer Name:</td>
          <td style="padding: 10px 0; color: #f8fafc; font-weight: bold; font-size: 15px;">${booking.customerName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #334155;">
          <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Customer Contact:</td>
          <td style="padding: 10px 0; color: #38bdf8; font-weight: bold; font-size: 15px;">
            <a href="tel:${booking.customerPhone}" style="color: #38bdf8; text-decoration: none;">📞 ${booking.customerPhone}</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #334155;">
          <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Preferred Visit Date:</td>
          <td style="padding: 10px 0; color: #f8fafc; font-weight: bold; font-size: 15px;">📅 ${visitDateStr}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #94a3b8; font-size: 14px; vertical-align: top;">Work Description:</td>
          <td style="padding: 10px 0; color: #cbd5e1; font-size: 14px;">${booking.description || 'No description provided.'}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://poojithareddyelectricals.dpdns.org/#/admin-login" style="background: linear-gradient(135deg, #a855f7, #06b6d4); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">
          Open Admin Panel to Accept / Manage
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
        Poojitha Reddy Electricals • Automatic Booking Dispatch System • Mudanur, YSR Kadapa
      </p>
    </div>
  `;

  // 1. Send Email Notification to poojithareddyelectricals@gmail.com
  let emailDelivered = false;
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"Poojitha Reddy Electricals" <${process.env.EMAIL_USER}>`,
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: emailSubject,
        html: emailHtml
      });
      console.log(`[Email Sent via SMTP] Admin booking alert sent to ${ADMIN_NOTIFICATION_EMAIL}`);
      emailDelivered = true;
    } else {
      // Direct delivery fallback via FormSubmit to poojithareddyelectricals@gmail.com
      try {
        const formSubmitUrl = `https://formsubmit.co/ajax/${ADMIN_NOTIFICATION_EMAIL}`;
        await fetch(formSubmitUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://poojithareddyelectricals.dpdns.org',
            'Referer': 'https://poojithareddyelectricals.dpdns.org/'
          },
          body: JSON.stringify({
            _subject: emailSubject,
            bookingCode: booking.bookingCode,
            service: booking.serviceType,
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            visitDate: visitDateStr,
            description: booking.description || 'None',
            adminPortal: 'https://poojithareddyelectricals.dpdns.org/#/admin-login'
          })
        });
        console.log(`[Email Sent via FormSubmit] Admin booking alert dispatched to ${ADMIN_NOTIFICATION_EMAIL}`);
        emailDelivered = true;
      } catch (fsErr) {
        console.warn('FormSubmit dispatch notice:', fsErr.message);
      }
    }
  } catch (mailErr) {
    console.error('Error dispatching admin email notification:', mailErr.message);
  }

  // 2. Send Mobile Push Alert to 6281752093 via free ntfy topic
  try {
    const ntfyTopic = `poojitha-reddy-bookings-${ADMIN_NOTIFICATION_PHONE}`;
    const messageBody = `Customer: ${booking.customerName}\nPhone: ${booking.customerPhone}\nDate: ${visitDateStr}\nService: ${booking.serviceType}\nRef: ${booking.bookingCode}`;

    await fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: 'POST',
      headers: {
        'Title': `New Booking: ${booking.serviceType}`,
        'Priority': 'urgent',
        'Tags': 'wrench,zap,telephone_receiver',
        'Click': 'https://poojithareddyelectricals.dpdns.org/#/admin-login'
      },
      body: messageBody
    });
    console.log(`[Mobile Push Sent] Booking notification sent to phone topic ${ntfyTopic}`);
  } catch (pushErr) {
    console.warn('Mobile push notification notice:', pushErr.message);
  }

  console.log(`====================================================`);
  console.log(`[NEW BOOKING NOTIFICATION]`);
  console.log(`Ref: ${booking.bookingCode} | Service: ${booking.serviceType}`);
  console.log(`Customer: ${booking.customerName} (${booking.customerPhone})`);
  console.log(`Admin Email: ${ADMIN_NOTIFICATION_EMAIL}`);
  console.log(`Admin Phone: ${ADMIN_NOTIFICATION_PHONE}`);
  console.log(`====================================================`);
};

module.exports = { 
  sendResetCodeEmail,
  sendAdminBookingNotification,
  ADMIN_NOTIFICATION_EMAIL,
  ADMIN_NOTIFICATION_PHONE
};
