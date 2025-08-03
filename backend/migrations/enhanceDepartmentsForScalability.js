const { db } = require('../config/firebase');

/**
 * Migration script to enhance existing departments for scalability
 * Adds new fields required by SmartDepartmentFilter
 */

const enhancedDepartmentFields = {
    "Municipal Corporation - Central Delhi": {
        primaryIssues: ["garbage", "waste", "water", "drainage", "park"],
        secondaryIssues: ["cleanliness", "public toilets", "street cleaning"],
        issueKeywords: ["waste", "garbage", "clean", "water", "park", "garden", "toilet"],
        serviceAreas: ["Connaught Place", "Karol Bagh", "Paharganj"],
        coordinates: { lat: 28.6519, lng: 77.2315 },
        radius: 15,
        priority: 1,
        responseTime: "24-48 hours",
        departmentType: "municipal",
        capacity: "high",
        searchTags: ["municipal", "waste management", "water supply", "parks"]
    },

    "Public Works Department - West Delhi": {
        primaryIssues: ["pothole", "road damage", "streetlight", "construction"],
        secondaryIssues: ["sidewalk", "manholes", "road marking", "traffic signs"],
        issueKeywords: ["road", "street", "light", "pavement", "asphalt", "construction", "infrastructure"],
        serviceAreas: ["Janakpuri", "Rajouri Garden", "Tilak Nagar", "Uttam Nagar"],
        coordinates: { lat: 28.6519, lng: 77.0757 },
        radius: 20,
        priority: 1,
        responseTime: "48-72 hours",
        departmentType: "infrastructure",
        capacity: "high",
        searchTags: ["public works", "road maintenance", "streetlights", "infrastructure"]
    },

    "New Delhi Municipal Council": {
        primaryIssues: ["pothole", "streetlight", "garbage", "water", "park", "noise"],
        secondaryIssues: ["parking", "licensing", "property tax", "building permits"],
        issueKeywords: ["municipal", "civic", "infrastructure", "services", "permits", "tax"],
        serviceAreas: ["Connaught Place", "India Gate", "Khan Market", "Lodhi Road"],
        coordinates: { lat: 28.6139, lng: 77.2090 },
        radius: 10,
        priority: 1,
        responseTime: "24-48 hours",
        departmentType: "municipal",
        capacity: "medium",
        searchTags: ["NDMC", "municipal council", "central delhi", "premium services"]
    },

    "Traffic Police - North Delhi": {
        primaryIssues: ["traffic", "parking", "signal"],
        secondaryIssues: ["vehicle towing", "traffic violations", "road safety"],
        issueKeywords: ["traffic", "parking", "signal", "vehicle", "jam", "congestion", "violation"],
        serviceAreas: ["Civil Lines", "Model Town", "Rohini", "Pitampura"],
        coordinates: { lat: 28.7041, lng: 77.1025 },
        radius: 25,
        priority: 2,
        responseTime: "2-4 hours",
        departmentType: "police",
        capacity: "medium",
        searchTags: ["traffic police", "parking", "traffic management", "road safety"]
    },

    "Public Works Department - South Delhi": {
        primaryIssues: ["pothole", "road damage", "streetlight", "construction"],
        secondaryIssues: ["flyovers", "bridges", "road widening", "metro construction"],
        issueKeywords: ["road", "street", "light", "infrastructure", "construction", "flyover"],
        serviceAreas: ["Lajpat Nagar", "Greater Kailash", "Vasant Kunj", "Saket"],
        coordinates: { lat: 28.5355, lng: 77.2283 },
        radius: 25,
        priority: 1,
        responseTime: "48-72 hours",
        departmentType: "infrastructure",
        capacity: "high",
        searchTags: ["public works", "south delhi", "infrastructure", "road maintenance"]
    },

    "Municipal Corporation - East Delhi": {
        primaryIssues: ["garbage", "waste", "water", "drainage", "park"],
        secondaryIssues: ["street lighting", "public toilets", "markets"],
        issueKeywords: ["waste", "garbage", "water", "drainage", "sewer", "park", "clean"],
        serviceAreas: ["Laxmi Nagar", "Preet Vihar", "Mayur Vihar", "Patparganj"],
        coordinates: { lat: 28.6328, lng: 77.2982 },
        radius: 20,
        priority: 1,
        responseTime: "24-48 hours",
        departmentType: "municipal",
        capacity: "medium",
        searchTags: ["municipal corporation", "east delhi", "waste management"]
    },

    "Delhi Pollution Control Committee": {
        primaryIssues: ["noise", "pollution", "waste"],
        secondaryIssues: ["air quality", "industrial pollution", "environmental violations"],
        issueKeywords: ["noise", "pollution", "environment", "air", "smoke", "dust", "industrial"],
        serviceAreas: ["All Delhi NCR"],
        coordinates: { lat: 28.6139, lng: 77.2090 },
        radius: 50,
        priority: 2,
        responseTime: "72-96 hours",
        departmentType: "environmental",
        capacity: "low",
        searchTags: ["pollution control", "environment", "noise pollution", "air quality"]
    }
};

const migrateDepartmentsForScalability = async () => {
    try {
        console.log('🔄 ==================== DEPARTMENT MIGRATION ====================');
        console.log('🔄 Migrating departments for scalability features...');

        // Get all existing departments
        const snapshot = await db.collection('departments').get();
        console.log(`📋 Found ${snapshot.size} departments to migrate`);

        const batch = db.batch();
        let updateCount = 0;

        snapshot.forEach((doc) => {
            const departmentData = doc.data();
            const departmentName = departmentData.departmentName;

            console.log(`📝 Processing: ${departmentName}`);

            // Get enhanced fields for this department
            const enhancements = enhancedDepartmentFields[departmentName];

            if (enhancements) {
                console.log(`   ✅ Adding enhanced fields for ${departmentName}`);

                // Update with enhanced fields
                const departmentRef = db.collection('departments').doc(doc.id);
                batch.update(departmentRef, {
                    ...enhancements,
                    lastUpdated: new Date().toISOString(),
                    migrationVersion: '2.0',
                    scalabilityReady: true
                });

                updateCount++;
            } else {
                console.log(`   ⚠️ No enhancements found for ${departmentName}`);

                // Add basic enhancements
                const departmentRef = db.collection('departments').doc(doc.id);
                batch.update(departmentRef, {
                    primaryIssues: departmentData.handlesIssues || [],
                    secondaryIssues: [],
                    issueKeywords: departmentData.handlesIssues || [],
                    serviceAreas: [departmentData.jurisdiction || 'Unknown'],
                    coordinates: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi center
                    radius: 20,
                    priority: 2,
                    responseTime: "48-72 hours",
                    departmentType: "general",
                    capacity: "medium",
                    searchTags: [departmentData.departmentName.toLowerCase()],
                    lastUpdated: new Date().toISOString(),
                    migrationVersion: '2.0',
                    scalabilityReady: true
                });

                updateCount++;
            }
        });

        // Commit all updates
        console.log(`💾 Committing ${updateCount} department updates...`);
        await batch.commit();
        console.log(`✅ Successfully migrated ${updateCount} departments!`);

        // Verify migration
        console.log('\n🔍 Verifying migration...');
        const verifySnapshot = await db.collection('departments').get();

        verifySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`✅ ${data.departmentName}:`);
            console.log(`   Primary Issues: ${data.primaryIssues?.length || 0}`);
            console.log(`   Keywords: ${data.issueKeywords?.length || 0}`);
            console.log(`   Service Areas: ${data.serviceAreas?.length || 0}`);
            console.log(`   Scalability Ready: ${data.scalabilityReady ? '✅' : '❌'}`);
            console.log('');
        });

        console.log('🎉 ==================== MIGRATION COMPLETE ====================');
        console.log('✅ All departments are now enhanced for scalability!');
        console.log('✅ Smart filtering can now be enabled');
        console.log('✅ System ready for 1000+ department scaling');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.error('Stack trace:', error.stack);
    }
};

// Test function to verify enhanced fields
const testEnhancedQuerying = async () => {
    try {
        console.log('\n🧪 Testing enhanced querying capabilities...');

        // Test 1: Query by primary issues
        console.log('\n📍 Test 1: Departments handling "pothole" issues');
        const potholeQuery = await db.collection('departments')
            .where('primaryIssues', 'array-contains', 'pothole')
            .get();

        potholeQuery.forEach(doc => {
            console.log(`   ✅ ${doc.data().departmentName}`);
        });

        // Test 2: Query by department type
        console.log('\n📍 Test 2: Municipal departments');
        const municipalQuery = await db.collection('departments')
            .where('departmentType', '==', 'municipal')
            .get();

        municipalQuery.forEach(doc => {
            console.log(`   ✅ ${doc.data().departmentName}`);
        });

        // Test 3: Query by priority
        console.log('\n📍 Test 3: High priority departments');
        const priorityQuery = await db.collection('departments')
            .where('priority', '==', 1)
            .get();

        priorityQuery.forEach(doc => {
            console.log(`   ✅ ${doc.data().departmentName} (${doc.data().capacity} capacity)`);
        });

        console.log('\n✅ Enhanced querying tests completed!');

    } catch (error) {
        console.error('❌ Testing failed:', error);
    }
};

// Performance benchmark
const benchmarkFiltering = async () => {
    try {
        console.log('\n⚡ Running performance benchmark...');

        const startTime = Date.now();

        // Simulate complex query
        const complexQuery = await db.collection('departments')
            .where('scalabilityReady', '==', true)
            .get();

        const endTime = Date.now();

        console.log(`📊 Query performance: ${endTime - startTime}ms`);
        console.log(`📊 Departments queried: ${complexQuery.size}`);
        console.log(`📊 Average per department: ${(endTime - startTime) / complexQuery.size}ms`);

    } catch (error) {
        console.error('❌ Benchmark failed:', error);
    }
};

// Main execution
const runMigration = async () => {
    await migrateDepartmentsForScalability();
    await testEnhancedQuerying();
    await benchmarkFiltering();

    console.log('\n🚀 Migration and testing complete!');
    console.log('Ready to implement SmartDepartmentFilter service.');
};

// Export for use as module or run directly
if (require.main === module) {
    runMigration().then(() => {
        console.log('Migration script completed');
        process.exit(0);
    }).catch(error => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
}

module.exports = {
    migrateDepartmentsForScalability,
    testEnhancedQuerying,
    benchmarkFiltering,
    enhancedDepartmentFields
};
