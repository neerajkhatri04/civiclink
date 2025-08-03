const { db } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

const createReport = async (reportData) => {
  try {
    const reportId = uuidv4();
    const report = {
      id: reportId,
      description: reportData.description,
      zone: reportData.zone,
      imageUrl: reportData.imageUrl || null,
      userId: reportData.userId,
      userEmail: reportData.userEmail,
      status: 'Processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('reports').doc(reportId).set(report);

    return { success: true, reportId, report };
  } catch (error) {
    console.error('Error creating report:', error);
    return { success: false, error: error.message };
  }
};

const updateReportStatus = async (reportId, status, additionalData = {}) => {
  try {
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
      ...additionalData
    };

    console.log('🔍 DEBUGGING: Updating report with data:', JSON.stringify(updateData, null, 2));

    await db.collection('reports').doc(reportId).update(updateData);

    console.log('✅ Report updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating report status:', error);
    return { success: false, error: error.message };
  }
};

const getReport = async (reportId) => {
  try {
    const doc = await db.collection('reports').doc(reportId).get();

    if (!doc.exists) {
      return { success: false, error: 'Report not found' };
    }

    return { success: true, report: { id: doc.id, ...doc.data() } };
  } catch (error) {
    console.error('Error getting report:', error);
    return { success: false, error: error.message };
  }
};

const getReportsForFollowup = async () => {
  try {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const snapshot = await db.collection('reports')
      .where('status', '==', 'Complaint Filed')
      .where('createdAt', '<=', fiveDaysAgo.toISOString())
      .get();

    const reports = [];
    snapshot.forEach(doc => {
      reports.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, reports };
  } catch (error) {
    console.error('Error getting reports for followup:', error);
    return { success: false, error: error.message };
  }
};

const getUserReports = async (userId) => {
  try {
    console.log('Fetching reports for user:', userId);

    const snapshot = await db.collection('reports')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      console.log('No reports found for user:', userId);
      return { success: true, reports: [] };
    }

    const reports = [];
    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('Found', reports.length, 'reports for user:', userId);
    return { success: true, reports };
  } catch (error) {
    console.error('Error getting user reports:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createReport,
  updateReportStatus,
  getReport,
  getReportsForFollowup,
  getUserReports
};
