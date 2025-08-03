const express = require('express');
const router = express.Router();
const { sendEmail } = require('../config/email');

// Test email sending
router.post('/test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    const testTo = to || 'khann550@gmail.com'; // Use your email as default
    const testSubject = subject || 'CivicLink Email Test';
    const testMessage = message || 'This is a test email from CivicLink AI system. If you receive this, email configuration is working!';

    console.log('🧪 Testing email configuration...');
    console.log('From:', process.env.EMAIL_USER);
    console.log('To:', testTo);
    console.log('Service:', process.env.EMAIL_SERVICE);

    const result = await sendEmail(testTo, testSubject, testMessage);

    if (result.success) {
      res.json({
        success: true,
        message: 'Email sent successfully!',
        messageId: result.messageId,
        testDetails: {
          from: process.env.EMAIL_USER,
          to: testTo,
          subject: testSubject
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        testDetails: {
          from: process.env.EMAIL_USER,
          to: testTo,
          service: process.env.EMAIL_SERVICE
        }
      });
    }

  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current email configuration (without showing password)
router.get('/config', (req, res) => {
  res.json({
    service: process.env.EMAIL_SERVICE,
    user: process.env.EMAIL_USER,
    passwordSet: !!process.env.EMAIL_PASS,
    passwordLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
  });
});

module.exports = router;
