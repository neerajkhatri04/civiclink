const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async (to, subject, text, html = null) => {
  try {
    console.log('📧 ==================== EMAIL SENDING ====================');
    console.log('📧 From:', process.env.EMAIL_USER);
    console.log('📧 To:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 Message Length:', text.length, 'characters');
    console.log('📧 HTML Content:', html ? 'Yes' : 'No');
    console.log('📧 SMTP Service:', process.env.EMAIL_SERVICE);
    console.log('📧 ========================================================');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      ...(html && { html })
    };

    console.log('📧 Sending email...');
    const result = await transporter.sendMail(mailOptions);

    console.log('✅ EMAIL SUCCESS!');
    console.log('✅ Message ID:', result.messageId);
    console.log('✅ Response:', result.response || 'Email sent successfully');
    console.log('✅ Email sent to:', to);
    console.log('📧 ========================================================');

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ ==================== EMAIL FAILED ====================');
    console.error('❌ From:', process.env.EMAIL_USER);
    console.error('❌ To:', to);
    console.error('❌ Subject:', subject);
    console.error('❌ Error Code:', error.code);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Full Error:', error);
    console.error('❌ ========================================================');

    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail
};
