const { db } = require('../config/firebase');

const updateAllDepartmentEmails = async () => {
    try {
        console.log('📧 ==================== EMAIL UPDATE SCRIPT ====================');
        console.log('🔄 Updating ALL department contact emails to: neerajkhatri304@gmail.com');
        console.log('📋 This will change the email for every department in the database');
        console.log('⚡ Starting batch update process...\n');

        // Get all departments from the database
        const departmentsSnapshot = await db.collection('departments').get();
        const totalDepartments = departmentsSnapshot.size;

        console.log(`📊 Found ${totalDepartments} departments in the database`);

        if (totalDepartments === 0) {
            console.log('⚠️  No departments found in the database!');
            return;
        }

        // Prepare batch update for better performance
        const batch = db.batch();
        let updateCount = 0;
        const newEmail = 'neerajkhatri304@gmail.com';

        console.log('\n📝 Preparing batch updates...');

        // Process each department
        departmentsSnapshot.forEach((doc) => {
            const departmentData = doc.data();
            const departmentRef = db.collection('departments').doc(doc.id);

            // Update the contactEmail field
            batch.update(departmentRef, {
                contactEmail: newEmail
            });

            updateCount++;
            console.log(`   ${updateCount}. ${departmentData.departmentName || 'Unknown Department'} (${departmentData.jurisdiction || 'Unknown Location'})`);
        });

        console.log(`\n⚡ Executing batch update for ${updateCount} departments...`);

        // Execute all updates in a single batch operation
        await batch.commit();

        console.log(`✅ Successfully updated ${updateCount} department email addresses!`);
        console.log(`📧 All departments now use: ${newEmail}`);

        // Verify the updates by sampling a few departments
        console.log('\n🔍 ==================== VERIFICATION ====================');
        console.log('🔍 Verifying email updates (showing first 10 departments)...');

        const verifySnapshot = await db.collection('departments').limit(10).get();
        let verifyCount = 0;

        verifySnapshot.forEach((doc) => {
            const data = doc.data();
            verifyCount++;
            const status = data.contactEmail === newEmail ? '✅' : '❌';
            console.log(`   ${verifyCount}. ${status} ${data.departmentName}: ${data.contactEmail}`);
        });

        console.log('\n🎉 ==================== SUCCESS ====================');
        console.log(`🎉 Email update completed successfully!`);
        console.log(`📧 All ${totalDepartments} departments now use: ${newEmail}`);
        console.log(`🚀 All future complaint reports will be sent to this email address`);
        console.log('📧 =====================================================');

    } catch (error) {
        console.error('\n❌ ==================== ERROR ====================');
        console.error('❌ Error updating department emails:', error.message);
        console.error('❌ Stack trace:', error.stack);
        console.error('❌ ==============================================');

        // Don't exit the process, just log the error
        return;
    }
};

// Add some startup info
console.log('🚀 CivicLink Department Email Update Script');
console.log('🎯 Target Email: neerajkhatri304@gmail.com');
console.log('📅 Started at:', new Date().toLocaleString());
console.log('');

// Run the update
updateAllDepartmentEmails()
    .then(() => {
        console.log('\n✅ Script execution completed');
        console.log('📅 Finished at:', new Date().toLocaleString());
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error.message);
    });
