const { db } = require('../config/firebase');

/**
 * Quick department count checker and small batch adder
 */

async function checkCurrentDepartments() {
    try {
        console.log('📊 Checking current department count...');
        const snapshot = await db.collection('departments').get();
        console.log(`📋 Current departments in database: ${snapshot.size}`);

        if (snapshot.size > 0) {
            console.log('\n🏢 Sample departments:');
            snapshot.docs.slice(0, 5).forEach((doc, index) => {
                const data = doc.data();
                console.log(`   ${index + 1}. ${data.departmentName} (${data.jurisdiction})`);
            });

            if (snapshot.size > 5) {
                console.log(`   ... and ${snapshot.size - 5} more`);
            }
        }

        return snapshot.size;
    } catch (error) {
        console.error('❌ Error checking departments:', error);
        return 0;
    }
}

async function addQuickBatch(count = 20) {
    const quickDepartments = [
        // Tier 2 Cities - 20 departments
        {
            departmentName: "Indore Municipal Corporation - Central",
            jurisdiction: "Central Indore",
            contactEmail: "imc.central@indore.gov.in",
            handlesIssues: ["garbage", "waste", "water", "drainage"],
            primaryIssues: ["garbage", "waste", "water"],
            secondaryIssues: ["drainage", "sanitation"],
            issueKeywords: ["waste", "garbage", "water", "drain"],
            serviceAreas: ["Rajwada", "Sarafa", "Khajrana"],
            coordinates: { lat: 22.7196, lng: 75.8577 },
            priority: 1,
            capacity: "medium",
            responseTime: "24-48 hours",
            departmentType: "municipal"
        },
        {
            departmentName: "Surat Municipal Corporation - Diamond District",
            jurisdiction: "Central Surat",
            contactEmail: "smc.diamond@surat.gov.in",
            handlesIssues: ["garbage", "waste", "water", "industrial"],
            primaryIssues: ["garbage", "waste", "industrial"],
            secondaryIssues: ["water", "pollution"],
            issueKeywords: ["waste", "garbage", "industrial", "diamond"],
            serviceAreas: ["Diamond District", "Varachha", "Katargam"],
            coordinates: { lat: 21.1702, lng: 72.8311 },
            priority: 1,
            capacity: "high",
            responseTime: "12-24 hours",
            departmentType: "municipal"
        },
        {
            departmentName: "Bhopal Municipal Corporation - New Market",
            jurisdiction: "Central Bhopal",
            contactEmail: "bmc.newmarket@bhopal.gov.in",
            handlesIssues: ["garbage", "waste", "water", "heritage"],
            primaryIssues: ["garbage", "waste", "water"],
            secondaryIssues: ["heritage", "tourism"],
            issueKeywords: ["waste", "garbage", "water", "heritage"],
            serviceAreas: ["New Market", "Hamidia Road", "Chowk Bazaar"],
            coordinates: { lat: 23.2599, lng: 77.4126 },
            priority: 1,
            capacity: "medium",
            responseTime: "24-48 hours",
            departmentType: "municipal"
        },
        {
            departmentName: "Nashik Municipal Corporation - Panchavati",
            jurisdiction: "North Nashik",
            contactEmail: "nmc.panchavati@nashik.gov.in",
            handlesIssues: ["garbage", "waste", "water", "religious"],
            primaryIssues: ["garbage", "waste", "water"],
            secondaryIssues: ["religious", "pilgrimage"],
            issueKeywords: ["waste", "garbage", "water", "temple"],
            serviceAreas: ["Panchavati", "Ramkund", "Sita Gufaa"],
            coordinates: { lat: 19.9975, lng: 73.7898 },
            priority: 1,
            capacity: "medium",
            responseTime: "24-48 hours",
            departmentType: "municipal"
        },
        {
            departmentName: "Nagpur Municipal Corporation - Civil Lines",
            jurisdiction: "Central Nagpur",
            contactEmail: "nmc.civillines@nagpur.gov.in",
            handlesIssues: ["garbage", "waste", "water", "administration"],
            primaryIssues: ["garbage", "waste", "water"],
            secondaryIssues: ["administration", "civic"],
            issueKeywords: ["waste", "garbage", "water", "civic"],
            serviceAreas: ["Civil Lines", "Sitabuldi", "Sadar"],
            coordinates: { lat: 21.1458, lng: 79.0882 },
            priority: 1,
            capacity: "medium",
            responseTime: "24-48 hours",
            departmentType: "municipal"
        },
        // PWD Departments
        {
            departmentName: "Madhya Pradesh PWD - Indore",
            jurisdiction: "Indore District",
            contactEmail: "pwd.indore@mp.gov.in",
            handlesIssues: ["pothole", "road", "highway", "bridge"],
            primaryIssues: ["pothole", "road", "highway"],
            secondaryIssues: ["bridge", "infrastructure"],
            issueKeywords: ["pothole", "road", "highway", "bridge"],
            serviceAreas: ["All Indore", "District Roads"],
            coordinates: { lat: 22.7196, lng: 75.8577 },
            priority: 1,
            capacity: "high",
            responseTime: "48-72 hours",
            departmentType: "infrastructure"
        },
        {
            departmentName: "Gujarat PWD - Surat Division",
            jurisdiction: "Surat Division",
            contactEmail: "pwd.surat@gujarat.gov.in",
            handlesIssues: ["pothole", "road", "highway", "construction"],
            primaryIssues: ["pothole", "road", "highway"],
            secondaryIssues: ["construction", "maintenance"],
            issueKeywords: ["pothole", "road", "highway", "construction"],
            serviceAreas: ["Surat Division", "NH Roads"],
            coordinates: { lat: 21.1702, lng: 72.8311 },
            priority: 1,
            capacity: "high",
            responseTime: "48-72 hours",
            departmentType: "infrastructure"
        },
        // Traffic Police
        {
            departmentName: "Indore Traffic Police - MG Road",
            jurisdiction: "Central Indore",
            contactEmail: "traffic.mgroad@indorepolice.gov.in",
            handlesIssues: ["traffic", "signal", "parking", "congestion"],
            primaryIssues: ["traffic", "signal", "parking"],
            secondaryIssues: ["congestion", "enforcement"],
            issueKeywords: ["traffic", "signal", "parking", "jam"],
            serviceAreas: ["MG Road", "Palasia", "Vijay Nagar"],
            coordinates: { lat: 22.7196, lng: 75.8577 },
            priority: 1,
            capacity: "medium",
            responseTime: "immediate",
            departmentType: "law_enforcement"
        },
        {
            departmentName: "Surat Traffic Police - Ring Road",
            jurisdiction: "Surat Urban",
            contactEmail: "traffic.ringroad@suratpolice.gov.in",
            handlesIssues: ["traffic", "signal", "parking", "heavy vehicles"],
            primaryIssues: ["traffic", "signal", "heavy vehicles"],
            secondaryIssues: ["parking", "commercial"],
            issueKeywords: ["traffic", "signal", "truck", "commercial"],
            serviceAreas: ["Ring Road", "Industrial Areas"],
            coordinates: { lat: 21.1702, lng: 72.8311 },
            priority: 1,
            capacity: "high",
            responseTime: "immediate",
            departmentType: "law_enforcement"
        },
        // Water Departments
        {
            departmentName: "Indore Water Supply - Zone 1",
            jurisdiction: "North Indore",
            contactEmail: "water.zone1@indore.gov.in",
            handlesIssues: ["water", "supply", "pipeline", "leak", "pressure"],
            primaryIssues: ["water", "supply", "pipeline"],
            secondaryIssues: ["leak", "pressure", "quality"],
            issueKeywords: ["water", "supply", "pipe", "leak"],
            serviceAreas: ["Vijay Nagar", "Scheme 78", "Indore North"],
            coordinates: { lat: 22.7544, lng: 75.8972 },
            priority: 1,
            capacity: "medium",
            responseTime: "12-24 hours",
            departmentType: "utility"
        },
        // Electricity Boards
        {
            departmentName: "MP Electricity Board - Indore Circle",
            jurisdiction: "Indore Circle",
            contactEmail: "mpeb.indore@mp.gov.in",
            handlesIssues: ["electricity", "power", "outage", "transformer", "line"],
            primaryIssues: ["electricity", "power", "outage"],
            secondaryIssues: ["transformer", "line", "meter"],
            issueKeywords: ["electricity", "power", "outage", "transformer"],
            serviceAreas: ["All Indore", "Rural Areas"],
            coordinates: { lat: 22.7196, lng: 75.8577 },
            priority: 1,
            capacity: "high",
            responseTime: "2-6 hours",
            departmentType: "utility"
        },
        {
            departmentName: "Gujarat Electricity Board - Surat",
            jurisdiction: "Surat District",
            contactEmail: "geb.surat@gujarat.gov.in",
            handlesIssues: ["electricity", "power", "outage", "industrial", "commercial"],
            primaryIssues: ["electricity", "power", "industrial"],
            secondaryIssues: ["outage", "commercial", "load"],
            issueKeywords: ["electricity", "power", "industrial", "commercial"],
            serviceAreas: ["Surat District", "Industrial Areas"],
            coordinates: { lat: 21.1702, lng: 72.8311 },
            priority: 1,
            capacity: "high",
            responseTime: "1-4 hours",
            departmentType: "utility"
        },
        // Fire Departments
        {
            departmentName: "Indore Fire Station - Central",
            jurisdiction: "Central Indore",
            contactEmail: "fire.central@indore.gov.in",
            handlesIssues: ["fire", "emergency", "rescue", "safety", "disaster"],
            primaryIssues: ["fire", "emergency", "rescue"],
            secondaryIssues: ["safety", "disaster", "evacuation"],
            issueKeywords: ["fire", "emergency", "rescue", "safety"],
            serviceAreas: ["Central Indore", "Commercial Areas"],
            coordinates: { lat: 22.7196, lng: 75.8577 },
            priority: 1,
            capacity: "high",
            responseTime: "immediate",
            departmentType: "emergency"
        },
        // Health Departments
        {
            departmentName: "Surat Health Department - Epidemic Control",
            jurisdiction: "Surat Municipal",
            contactEmail: "health.epidemic@surat.gov.in",
            handlesIssues: ["health", "epidemic", "sanitation", "disease", "medical"],
            primaryIssues: ["health", "epidemic", "disease"],
            secondaryIssues: ["sanitation", "medical", "prevention"],
            issueKeywords: ["health", "disease", "epidemic", "medical"],
            serviceAreas: ["All Surat", "High Risk Areas"],
            coordinates: { lat: 21.1702, lng: 72.8311 },
            priority: 1,
            capacity: "high",
            responseTime: "immediate",
            departmentType: "health"
        },
        // Parks and Horticulture
        {
            departmentName: "Indore Parks and Gardens - Zone A",
            jurisdiction: "Central Indore",
            contactEmail: "parks.zonea@indore.gov.in",
            handlesIssues: ["park", "garden", "tree", "horticulture", "environment"],
            primaryIssues: ["park", "garden", "tree"],
            secondaryIssues: ["horticulture", "environment", "maintenance"],
            issueKeywords: ["park", "garden", "tree", "green"],
            serviceAreas: ["Nehru Park", "Regional Park", "Central Gardens"],
            coordinates: { lat: 22.7196, lng: 75.8577 },
            priority: 2,
            capacity: "medium",
            responseTime: "24-48 hours",
            departmentType: "environmental"
        },
        // Environmental Departments
        {
            departmentName: "Gujarat Pollution Control Board - Surat",
            jurisdiction: "Surat Industrial",
            contactEmail: "gpcb.surat@gujarat.gov.in",
            handlesIssues: ["pollution", "industrial", "air quality", "water quality", "noise"],
            primaryIssues: ["pollution", "industrial", "air quality"],
            secondaryIssues: ["water quality", "noise", "emissions"],
            issueKeywords: ["pollution", "industrial", "air", "emissions"],
            serviceAreas: ["Industrial Areas", "GIDC Estates"],
            coordinates: { lat: 21.1702, lng: 72.8311 },
            priority: 2,
            capacity: "medium",
            responseTime: "48-72 hours",
            departmentType: "environmental"
        },
        // Transport Departments
        {
            departmentName: "Indore City Transport - BRTS",
            jurisdiction: "Indore BRTS Corridor",
            contactEmail: "brts@indore.gov.in",
            handlesIssues: ["transport", "bus", "brts", "public transport", "accessibility"],
            primaryIssues: ["transport", "bus", "brts"],
            secondaryIssues: ["public transport", "accessibility", "stations"],
            issueKeywords: ["bus", "brts", "transport", "station"],
            serviceAreas: ["BRTS Corridor", "Bus Stations"],
            coordinates: { lat: 22.7196, lng: 75.8577 },
            priority: 2,
            capacity: "medium",
            responseTime: "12-24 hours",
            departmentType: "transport"
        },
        // Tourism Departments
        {
            departmentName: "MP Tourism - Indore Region",
            jurisdiction: "Indore Tourism Circuit",
            contactEmail: "tourism.indore@mp.gov.in",
            handlesIssues: ["tourism", "heritage", "facilities", "information", "safety"],
            primaryIssues: ["tourism", "heritage", "facilities"],
            secondaryIssues: ["information", "safety", "promotion"],
            issueKeywords: ["tourism", "heritage", "tourist", "facilities"],
            serviceAreas: ["Tourist Places", "Heritage Sites"],
            coordinates: { lat: 22.7196, lng: 75.8577 },
            priority: 3,
            capacity: "low",
            responseTime: "48-72 hours",
            departmentType: "tourism"
        },
        // Education Departments
        {
            departmentName: "Surat Municipal School Board",
            jurisdiction: "Surat Municipal Schools",
            contactEmail: "schools@surat.gov.in",
            handlesIssues: ["education", "school", "infrastructure", "maintenance", "safety"],
            primaryIssues: ["education", "school", "infrastructure"],
            secondaryIssues: ["maintenance", "safety", "facilities"],
            issueKeywords: ["school", "education", "student", "infrastructure"],
            serviceAreas: ["Municipal Schools", "Education Centers"],
            coordinates: { lat: 21.1702, lng: 72.8311 },
            priority: 2,
            capacity: "medium",
            responseTime: "24-48 hours",
            departmentType: "education"
        }
    ];

    console.log(`🚀 Adding ${Math.min(count, quickDepartments.length)} departments...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < Math.min(count, quickDepartments.length); i++) {
        const dept = quickDepartments[i];

        try {
            const departmentWithMeta = {
                ...dept,
                createdAt: new Date().toISOString(),
                migrationVersion: "3.0",
                scalabilityReady: true,
                lastUpdated: new Date().toISOString()
            };

            await db.collection('departments').add(departmentWithMeta);
            successCount++;
            console.log(`✅ Added: ${dept.departmentName}`);

        } catch (error) {
            console.error(`❌ Error: ${dept.departmentName} - ${error.message}`);
            errorCount++;
        }
    }

    console.log(`\n🎉 Quick batch complete: ${successCount} added, ${errorCount} failed`);
    return successCount;
}

async function main() {
    console.log('🔍 Department Management Script');
    console.log('================================');

    const currentCount = await checkCurrentDepartments();

    if (currentCount < 20) {
        console.log('\n🚀 Adding quick batch of 20 departments for testing...');
        await addQuickBatch(20);
    } else {
        console.log('\n✅ Sufficient departments available for testing');
        console.log('💡 Use populateDepartments.js to add the full 100+ department set');
    }

    console.log('\n📊 Final check...');
    await checkCurrentDepartments();
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { checkCurrentDepartments, addQuickBatch };
