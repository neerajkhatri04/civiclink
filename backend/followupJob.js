const { getReportsForFollowup, updateReportStatus } = require('./services/reportService');
const { processFollowupReport } = require('./services/aiService');

const runFollowupJob = async () => {
  try {
    console.log('Starting follow-up job...');

    const result = await getReportsForFollowup();

    if (!result.success) {
      console.error('Failed to get reports for follow-up:', result.error);
      return;
    }

    console.log(`Found ${result.reports.length} reports for follow-up`);

    for (const report of result.reports) {
      try {
        console.log(`Processing follow-up for report: ${report.id}`);

        const followupResult = await processFollowupReport(report);

        if (followupResult.success) {
          await updateReportStatus(report.id, 'Follow-up Sent');
          console.log(`Follow-up sent for report: ${report.id}`);
        } else {
          console.error(`Failed to send follow-up for report ${report.id}:`, followupResult.error);
        }
      } catch (error) {
        console.error(`Error processing follow-up for report ${report.id}:`, error);
      }
    }

    console.log('Follow-up job completed');

  } catch (error) {
    console.error('Follow-up job error:', error);
  }
};

// Run the job
runFollowupJob();
