const { getDepartmentInfo, getAllDepartments } = require('../services/departmentService');
const { sendEmail } = require('../config/email');
const CivicLinkVertexAI = require('./vertexAIService');
const SmartDepartmentFilter = require('./smartDepartmentFilter');
require('dotenv').config();

// Initialize Vertex AI service
let vertexAI = null;
const useRealAI = process.env.USE_REAL_AI === 'true';

// Initialize the Smart Department Filter
const useSmartFiltering = process.env.USE_SMART_FILTERING === 'true';
const smartFilter = useSmartFiltering ? new SmartDepartmentFilter() : null;

console.log('AI Configuration:', {
  useRealAI,
  project: process.env.VERTEX_AI_PROJECT_ID,
  location: process.env.VERTEX_AI_LOCATION,
  model: process.env.VERTEX_AI_MODEL
});

// Initialize Vertex AI if enabled
if (useRealAI) {
  try {
    vertexAI = new CivicLinkVertexAI();
    console.log('✅ Vertex AI service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Vertex AI:', error);
    console.log('🔄 Falling back to simulated AI');
  }
}

// Enhanced function to get departments using smart filtering or legacy method
const getDepartmentsForAI = async (reportData) => {
  if (useSmartFiltering && smartFilter) {
    console.log('🎯 Using Smart Department Filtering...');
    const result = await smartFilter.getRelevantDepartments(reportData);
    console.log(`🎯 Smart Filtering: ${result.departments.length} departments selected from ${result.totalInDatabase} total`);
    console.log(`🎯 Cost Reduction: ~${Math.round((1 - result.departments.length / result.totalInDatabase) * 100)}%`);

    return {
      departments: result.departments,
      filteringStats: {
        totalInDatabase: result.totalInDatabase,
        sentToAI: result.departments.length,
        filteringMethod: 'smart'
      }
    };
  } else {
    console.log('📋 Using Legacy Department Loading...');
    const allDepartments = await getAllDepartments();
    console.log(`📋 Legacy: Loading all ${allDepartments.length} departments`);

    return {
      departments: allDepartments,
      filteringStats: {
        totalInDatabase: allDepartments.length,
        sentToAI: allDepartments.length,
        filteringMethod: 'legacy'
      }
    };
  }
};

// Real AI Agent functionality using Vertex AI
const processReportWithAI = async (reportData, reportId = null, updateCallback = null) => {
  try {
    console.log('🤖 ==================== AI PROCESSING ====================');
    console.log('🤖 Processing report with Enhanced AI Pipeline...');
    console.log('🤖 Description:', reportData.description);
    console.log('🤖 Zone:', reportData.zone);
    console.log('🤖 Image URL:', reportData.imageUrl || 'None');
    console.log('🤖 Smart Filtering:', useSmartFiltering ? 'ENABLED' : 'DISABLED');
    console.log('🤖 Timestamp:', new Date().toISOString());
    console.log('🤖 ========================================================');

    // Send smart filtering update
    if (updateCallback && reportId) {
      updateCallback(reportId, {
        type: 'step',
        step: 'Smart Filtering',
        message: 'Analyzing your location and filtering relevant departments...',
        status: 'processing',
        progress: 40
      });
    }

    if (!vertexAI) {
      console.log('⚠️ Vertex AI not available, falling back to simulated AI');
      return await processReportWithSimulatedAI(reportData, reportId, updateCallback);
    }

    // ENHANCED: Get departments using smart filtering or legacy method
    const { departments, filteringStats } = await getDepartmentsForAI(reportData);

    if (departments.length === 0) {
      throw new Error('No departments available for analysis');
    }

    // Send AI analysis update
    if (updateCallback && reportId) {
      updateCallback(reportId, {
        type: 'step',
        step: 'AI Analysis',
        message: `Analyzing report with ${departments.length} departments using advanced AI...`,
        status: 'processing',
        progress: 60,
        departmentCount: departments.length
      });
    }

    // Use our new Vertex AI service to analyze the report with filtered departments
    console.log('🧠 Calling Vertex AI analysis...');
    const aiResult = await vertexAI.analyzeReport(reportData, departments); // Pass filtered departments

    console.log('🧠 ==================== AI RESULT ====================');
    console.log('🧠 Success:', aiResult.success);
    if (aiResult.success) {
      console.log('🧠 Department Found:', aiResult.department.departmentName);
      console.log('🧠 Department Email:', aiResult.department.contactEmail);
      console.log('🧠 Keywords:', aiResult.aiAnalysis.keywords);
      console.log('🧠 Confidence:', aiResult.aiAnalysis.confidence);
      console.log('🧠 Reasoning:', aiResult.aiAnalysis.reasoning);

      // Send AI reasoning update
      if (updateCallback && reportId) {
        updateCallback(reportId, {
          type: 'step',
          step: 'AI Reasoning',
          message: `AI identified this as: ${aiResult.aiAnalysis.keywords.join(', ')}`,
          status: 'processing',
          progress: 75,
          aiReasoning: aiResult.aiAnalysis.reasoning,
          confidence: aiResult.aiAnalysis.confidence,
          keywords: aiResult.aiAnalysis.keywords,
          department: aiResult.department.departmentName
        });
      }
      console.log('🧠 Processing Method:', aiResult.processingMethod);

      // Add filtering statistics to result
      if (useSmartFiltering) {
        console.log('🧠 Filtering Efficiency:');
        console.log('   Departments filtered:', filteringStats.totalInDatabase - filteringStats.sentToAI);
        console.log('   Processing efficiency:', Math.round((1 - filteringStats.sentToAI / filteringStats.totalInDatabase) * 100) + '%');
      }
    } else {
      console.log('🧠 AI Analysis Failed:', aiResult.error);
    }
    console.log('🧠 ====================================================');

    if (!aiResult.success) {
      console.log('⚠️ Vertex AI analysis failed, using fallback');
      return await processReportWithSimulatedAI(reportData);
    }

    // Draft and send email using AI-recommended department
    console.log('📝 Drafting complaint email...');
    const emailContent = draftComplaintEmail(
      reportData,
      aiResult.department,
      aiResult.aiAnalysis.reasoning
    );

    console.log('📝 Email Content Preview:');
    console.log('📝 Subject:', emailContent.subject);
    console.log('📝 Body Length:', emailContent.body.length, 'characters');
    console.log('📝 To Department:', aiResult.department.departmentName);
    console.log('📝 To Email:', aiResult.department.contactEmail);

    // Send email notification update
    if (updateCallback && reportId) {
      updateCallback(reportId, {
        type: 'step',
        step: 'Sending Email',
        message: `Sending complaint email to ${aiResult.department.departmentName}...`,
        status: 'processing',
        progress: 90,
        department: aiResult.department.departmentName,
        departmentEmail: aiResult.department.contactEmail
      });
    }

    console.log('📧 Sending email to department...');
    const emailResult = await sendEmail(
      aiResult.department.contactEmail,
      emailContent.subject,
      emailContent.body
    );

    if (!emailResult.success) {
      console.error('❌ Failed to send complaint email:', emailResult.error);
      return {
        success: false,
        error: 'Failed to send complaint email: ' + emailResult.error
      };
    }

    console.log('✅ ==================== PROCESS COMPLETE ====================');
    console.log('✅ Report processed successfully!');
    console.log('✅ Department:', aiResult.department.departmentName);
    console.log('✅ Email sent to:', aiResult.department.contactEmail);
    console.log('✅ Message ID:', emailResult.messageId);
    console.log('✅ AI Confidence:', aiResult.aiAnalysis.confidence);
    console.log('✅ Keywords extracted:', aiResult.aiAnalysis.keywords.join(', '));
    console.log('✅ ============================================================');

    return {
      success: true,
      department: aiResult.department,
      emailSent: true,
      messageId: emailResult.messageId,
      aiReasoning: aiResult.aiAnalysis.reasoning,
      extractedKeywords: aiResult.aiAnalysis.keywords,
      confidence: aiResult.aiAnalysis.confidence,
      processingMethod: 'vertex_ai',
      alternatives: aiResult.aiAnalysis.alternatives
    };

  } catch (error) {
    console.error('❌ ==================== AI PROCESSING FAILED ====================');
    console.error('❌ Error processing report with Vertex AI:', error.message);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Report data:', reportData);
    console.error('❌ ================================================================');
    console.log('🔄 Falling back to simulated AI...');
    return await processReportWithSimulatedAI(reportData);
  }
};

// Fallback simulated AI (used when real AI fails)
const processReportWithSimulatedAI = async (reportData, reportId = null, updateCallback = null) => {
  try {
    console.log('Using simulated AI fallback...', reportData);

    // Send simulated AI start update
    if (updateCallback && reportId) {
      updateCallback(reportId, {
        type: 'step',
        step: 'Simulated AI Analysis',
        message: 'Using fallback AI to analyze your report...',
        status: 'processing',
        progress: 50
      });
    }

    // Extract issue keywords from description
    const issueKeywords = extractIssueKeywords(reportData.description);
    console.log('Extracted keywords:', issueKeywords);

    // Send keyword extraction update
    if (updateCallback && reportId) {
      updateCallback(reportId, {
        type: 'step',
        step: 'Keyword Analysis',
        message: `Identified keywords: ${issueKeywords.join(', ')}`,
        status: 'processing',
        progress: 65,
        keywords: issueKeywords
      });
    }

    // Find the appropriate department
    let departmentResult = null;
    for (const keyword of issueKeywords) {
      departmentResult = await getDepartmentInfo(keyword, reportData.zone);
      if (departmentResult.success) {
        break;
      }
    }

    if (!departmentResult || !departmentResult.success) {
      // Send department matching failure update
      if (updateCallback && reportId) {
        updateCallback(reportId, {
          type: 'step',
          step: 'Department Matching Failed',
          message: 'Could not find appropriate department for this issue',
          status: 'error',
          progress: 100
        });
      }

      return {
        success: false,
        error: 'No appropriate department found for this issue'
      };
    }

    // Send department found update
    if (updateCallback && reportId) {
      updateCallback(reportId, {
        type: 'step',
        step: 'Department Found',
        message: `Matched with ${departmentResult.department.departmentName}`,
        status: 'processing',
        progress: 80,
        department: departmentResult.department.departmentName
      });
    }

    // Draft and send email
    const emailContent = draftComplaintEmail(reportData, departmentResult.department);

    // Send email notification update
    if (updateCallback && reportId) {
      updateCallback(reportId, {
        type: 'step',
        step: 'Sending Email',
        message: `Sending complaint email to ${departmentResult.department.departmentName}...`,
        status: 'processing',
        progress: 90,
        department: departmentResult.department.departmentName
      });
    }

    const emailResult = await sendEmail(
      departmentResult.department.contactEmail,
      emailContent.subject,
      emailContent.body
    );

    if (!emailResult.success) {
      // Send email failure update
      if (updateCallback && reportId) {
        updateCallback(reportId, {
          type: 'step',
          step: 'Email Send Failed',
          message: 'Failed to send complaint email to department',
          status: 'error',
          progress: 100
        });
      }

      return {
        success: false,
        error: 'Failed to send complaint email'
      };
    }

    return {
      success: true,
      department: departmentResult.department,
      emailSent: true,
      messageId: emailResult.messageId,
      aiReasoning: 'Selected based on keyword matching and zone analysis',
      extractedKeywords: issueKeywords,
      confidence: 0.85, // Simulated confidence score
      processingMethod: 'simulated_ai',
      alternatives: [] // No alternatives in simulated AI for simplicity
    };

  } catch (error) {
    console.error('Error processing report with simulated AI:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const extractIssueKeywords = (description) => {
  const keywordMap = {
    'pothole': ['pothole', 'pithole', 'pot hole', 'road damage', 'crater', 'hole in road', 'road hole', 'pit hole', 'broken road', 'damaged road'],
    'streetlight': ['streetlight', 'street light', 'lamp', 'lighting', 'dark', 'light not working', 'broken light'],
    'garbage': ['garbage', 'trash', 'waste', 'rubbish', 'litter', 'dump', 'refuse'],
    'water': ['water', 'leak', 'pipe', 'drainage', 'sewage', 'flooding', 'water supply'],
    'traffic': ['traffic', 'signal', 'sign', 'congestion', 'jam', 'traffic light'],
    'park': ['park', 'garden', 'playground', 'green space', 'recreation'],
    'noise': ['noise', 'loud', 'disturbance', 'sound', 'pollution'],
    'construction': ['construction', 'building', 'illegal', 'unauthorized', 'permit']
  };

  const lowerDescription = description.toLowerCase();
  const foundKeywords = [];

  // Check for exact phrase matches first
  for (const [mainKeyword, variations] of Object.entries(keywordMap)) {
    for (const variation of variations) {
      if (lowerDescription.includes(variation)) {
        foundKeywords.push(mainKeyword);
        break;
      }
    }
  }

  // Additional smart keyword detection
  const words = lowerDescription.split(/\s+/);

  // Check for road-related issues
  if (words.includes('road') || words.includes('street')) {
    if (words.some(word => ['broken', 'damaged', 'bad', 'cracked', 'hole'].includes(word))) {
      if (!foundKeywords.includes('pothole')) {
        foundKeywords.push('pothole');
      }
    }
  }

  // Check for lighting issues
  if (words.some(word => ['light', 'dark', 'lighting'].includes(word))) {
    if (!foundKeywords.includes('streetlight')) {
      foundKeywords.push('streetlight');
    }
  }

  console.log('Keyword extraction debug:', {
    description: lowerDescription,
    words: words,
    foundKeywords: foundKeywords
  });

  return foundKeywords.length > 0 ? foundKeywords : ['general'];
};

const draftComplaintEmail = (reportData, department, aiReasoning = null) => {
  const subject = `Civic Issue Report - ${reportData.zone} - ${new Date().toLocaleDateString()}`;

  const body = `
Dear ${department.departmentName},

I am writing to report a civic issue in ${reportData.zone} that requires your attention.

Issue Description:
${reportData.description}

Location: ${reportData.zone}
${reportData.imageUrl ? `\nImage Evidence: ${reportData.imageUrl}` : ''}

Date Reported: ${new Date().toLocaleDateString()}
Time Reported: ${new Date().toLocaleTimeString()}

${aiReasoning ? `\nAI Analysis: This issue was routed to your department because ${aiReasoning}` : ''}

This report has been automatically generated through the CivicLink AI platform to ensure prompt and accurate routing of citizen complaints.

Please investigate this matter and take appropriate action. A confirmation of receipt and any updates on the resolution status would be greatly appreciated.

Thank you for your service to the community.

Best regards,
CivicLink AI System
On behalf of a concerned citizen
  `.trim();

  return { subject, body };
};

// Main process function - uses real AI if enabled, otherwise falls back to simulated
const processReport = async (reportData, reportId = null, updateCallback = null) => {
  if (useRealAI) {
    console.log('Using real Vertex AI...');
    return await processReportWithAI(reportData, reportId, updateCallback);
  } else {
    console.log('Using simulated AI...');
    return await processReportWithSimulatedAI(reportData, reportId, updateCallback);
  }
};

const processFollowupReport = async (report) => {
  try {
    const subject = `Follow-up: Civic Issue Report - ${report.zone} - ${report.id}`;

    const body = `
Dear Department,

This is an automated follow-up regarding a civic issue report filed 5 days ago.

Original Report ID: ${report.id}
Issue Description: ${report.description}
Location: ${report.zone}
Date Filed: ${new Date(report.createdAt).toLocaleDateString()}

We have not received any updates on the status of this complaint. Could you please provide an update on the actions taken or planned to address this issue?

Thank you for your attention to this matter.

Best regards,
CivicLink AI System
    `.trim();

    // For follow-up, we need to get the department info again
    const issueKeywords = extractIssueKeywords(report.description);
    let departmentResult = null;

    for (const keyword of issueKeywords) {
      departmentResult = await getDepartmentInfo(keyword, report.zone);
      if (departmentResult.success) {
        break;
      }
    }

    if (!departmentResult || !departmentResult.success) {
      return { success: false, error: 'Department not found for follow-up' };
    }

    const emailResult = await sendEmail(
      departmentResult.department.contactEmail,
      subject,
      body
    );

    return {
      success: emailResult.success,
      messageId: emailResult.messageId,
      error: emailResult.error
    };

  } catch (error) {
    console.error('Error processing follow-up:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  processReport,
  processFollowupReport
};
