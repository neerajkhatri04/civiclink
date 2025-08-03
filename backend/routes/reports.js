const express = require('express');
const multer = require('multer');
const { createReport, updateReportStatus, getReport } = require('../services/reportService');
const { uploadImage } = require('../services/imageService');
const { processReport } = require('../services/aiService');

const router = express.Router();

// Store SSE connections for real-time updates
const sseConnections = new Map();

// Store processing steps for each report
const processingSteps = new Map();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Server-Sent Events endpoint for real-time processing updates
router.get('/process-stream/:reportId', (req, res) => {
  const { reportId } = req.params;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Store connection
  sseConnections.set(reportId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    message: 'Connected to processing stream',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`SSE connection closed for report: ${reportId}`);
    sseConnections.delete(reportId);
  });

  req.on('error', () => {
    console.log(`SSE connection error for report: ${reportId}`);
    sseConnections.delete(reportId);
  });
});

// Helper function to send SSE updates
const sendProcessingUpdate = (reportId, update) => {
  const connection = sseConnections.get(reportId);

  // Store processing step for later storage
  if (update.type === 'step') {
    if (!processingSteps.has(reportId)) {
      processingSteps.set(reportId, []);
    }
    processingSteps.get(reportId).push({
      ...update,
      timestamp: new Date().toISOString()
    });
  }

  if (connection) {
    try {
      connection.write(`data: ${JSON.stringify({
        ...update,
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (error) {
      console.error(`Failed to send SSE update for report ${reportId}:`, error);
      sseConnections.delete(reportId);
    }
  }
};

// Submit a new report
router.post('/submit', upload.single('image'), async (req, res) => {
  try {
    console.log('📝 ==================== NEW REPORT SUBMISSION ====================');
    console.log('📝 Timestamp:', new Date().toISOString());
    console.log('📝 Description:', req.body.description);
    console.log('📝 Zone:', req.body.zone);
    console.log('📝 User ID:', req.body.userId);
    console.log('📝 User Email:', req.body.userEmail);
    console.log('📝 Has Image:', !!req.file);
    console.log('📝 Image Size:', req.file ? `${req.file.size} bytes` : 'N/A');
    console.log('📝 Content Type:', req.file ? req.file.mimetype : 'N/A');
    console.log('📝 ================================================================');

    const { description, zone, userId, userEmail } = req.body;

    // Validate required fields
    if (!description || !zone || !userId || !userEmail) {
      console.error('❌ Validation failed: Missing required fields');
      console.error('❌ Description:', !!description);
      console.error('❌ Zone:', !!zone);
      console.error('❌ User ID:', !!userId);
      console.error('❌ User Email:', !!userEmail);
      return res.status(400).json({
        success: false,
        error: 'Description, zone, and user information are required'
      });
    }

    if (description.length < 20) {
      console.error('❌ Validation failed: Description too short');
      console.error('❌ Description length:', description.length);
      return res.status(400).json({
        success: false,
        error: 'Description must be at least 20 characters long'
      });
    }

    console.log('✅ Validation passed');

    let imageUrl = null;

    // Handle image upload if provided
    if (req.file) {
      console.log('📷 Processing image upload...');
      const uploadResult = await uploadImage(req.file);
      if (!uploadResult.success) {
        console.error('❌ Image upload failed:', uploadResult.error);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image: ' + uploadResult.error
        });
      }
      imageUrl = uploadResult.url;
      console.log('✅ Image uploaded successfully:', imageUrl);
    }

    // Create initial report
    console.log('💾 Creating report in database...');
    const reportData = { description, zone, imageUrl, userId, userEmail };
    const createResult = await createReport(reportData);

    if (!createResult.success) {
      console.error('❌ Failed to create report in database:', createResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create report: ' + createResult.error
      });
    }

    console.log('✅ Report created in database with ID:', createResult.reportId);
    console.log('🚀 Starting AI processing...');

    // Send initial processing update
    sendProcessingUpdate(createResult.reportId, {
      type: 'step',
      step: 'Report Created',
      message: 'Your report has been saved to our database',
      status: 'completed',
      progress: 20
    });

    // Process report with AI in background
    setImmediate(async () => {
      try {
        console.log('🔄 Background AI processing started for report:', createResult.reportId);

        // Send AI processing start update
        sendProcessingUpdate(createResult.reportId, {
          type: 'step',
          step: 'AI Analysis Starting',
          message: 'Our AI agent is analyzing your report...',
          status: 'processing',
          progress: 30
        });

        // Add a small delay to allow frontend to connect to SSE
        await new Promise(resolve => setTimeout(resolve, 2000));

        const aiResult = await processReport(reportData, createResult.reportId, sendProcessingUpdate);

        console.log('🔍 DEBUGGING: AI result structure:', JSON.stringify(aiResult, null, 2));

        if (aiResult.success) {
          console.log('✅ AI processing successful for report:', createResult.reportId);
          console.log('✅ Department assigned:', aiResult.department.departmentName);
          console.log('✅ Email sent:', aiResult.emailSent);

          // Store all AI processing details in the report document
          const processingDetails = {
            aiAnalysis: {
              reasoning: aiResult.aiReasoning,
              confidence: aiResult.confidence,
              keywords: aiResult.extractedKeywords,
              alternatives: aiResult.alternatives,
              processingMethod: aiResult.processingMethod
            },
            processingSteps: processingSteps.get(createResult.reportId) || [],
            emailDetails: {
              sent: aiResult.emailSent,
              messageId: aiResult.messageId,
              timestamp: new Date().toISOString()
            },
            processingTimestamp: new Date().toISOString()
          };

          console.log('🔍 DEBUGGING: Processing details to be stored:', JSON.stringify(processingDetails, null, 2));

          // Send success update
          sendProcessingUpdate(createResult.reportId, {
            type: 'step',
            step: 'Processing Complete',
            message: `Report successfully assigned to ${aiResult.department.departmentName}`,
            status: 'completed',
            progress: 100,
            department: aiResult.department.departmentName,
            emailSent: aiResult.emailSent
          });

          await updateReportStatus(createResult.reportId, 'Complaint Filed', {
            department: aiResult.department.departmentName,
            emailSent: true,
            processingDetails: processingDetails
          });

          // Clean up stored steps
          processingSteps.delete(createResult.reportId);

          console.log('✅ Report status updated to: Complaint Filed');
        } else {
          console.error('❌ AI processing failed for report:', createResult.reportId);
          console.error('❌ Error:', aiResult.error);

          // Send error update
          sendProcessingUpdate(createResult.reportId, {
            type: 'step',
            step: 'Processing Failed',
            message: `AI processing encountered an error: ${aiResult.error}`,
            status: 'error',
            progress: 100,
            error: aiResult.error
          });

          await updateReportStatus(createResult.reportId, 'Failed', {
            error: aiResult.error
          });
        }
      } catch (error) {
        console.error('Background processing error:', error);

        // Send error update
        sendProcessingUpdate(createResult.reportId, {
          type: 'step',
          step: 'Processing Failed',
          message: `System error during processing: ${error.message}`,
          status: 'error',
          progress: 100,
          error: error.message
        });

        await updateReportStatus(createResult.reportId, 'Failed', {
          error: error.message
        });
      }
    });

    res.json({
      success: true,
      message: 'Thank you! Your report has been sent to the AI agent for processing.',
      reportId: createResult.reportId
    });

  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get report status
router.get('/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;

    const result = await getReport(reportId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      report: result.report
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user reports
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('📋 Fetching reports for user:', userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const { getUserReports } = require('../services/reportService');
    const result = await getUserReports(userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    console.log('✅ Found', result.reports.length, 'reports for user');

    res.json({
      success: true,
      reports: result.reports
    });

  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
