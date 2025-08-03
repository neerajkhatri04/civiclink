const { db } = require('../config/firebase');

/**
 * Script to populate the database with 100+ departments across different cities
 * This will help test the smart filtering system at scale
 */

const departmentsData = [
    // Delhi Departments (existing enhanced)
    {
        departmentName: "Municipal Corporation of Delhi - Central",
        jurisdiction: "Central Delhi",
        contactEmail: "central.mcd@delhi.gov.in",
        handlesIssues: ["garbage", "waste", "water", "drainage", "park", "sanitation"],
        primaryIssues: ["garbage", "waste", "water", "drainage", "park"],
        secondaryIssues: ["cleanliness", "public toilets", "street cleaning"],
        issueKeywords: ["waste", "garbage", "clean", "water", "park", "garden", "toilet", "sanitation"],
        serviceAreas: ["Connaught Place", "Karol Bagh", "Paharganj", "India Gate", "Red Fort"],
        coordinates: { lat: 28.6519, lng: 77.2315 },
        priority: 1,
        capacity: "high",
        responseTime: "24-48 hours",
        departmentType: "municipal"
    },
    {
        departmentName: "Public Works Department - Delhi Central",
        jurisdiction: "Central Delhi",
        contactEmail: "pwd.central@delhi.gov.in",
        handlesIssues: ["pothole", "road", "construction", "streetlight", "infrastructure"],
        primaryIssues: ["pothole", "road", "streetlight", "construction"],
        secondaryIssues: ["footpath", "bridge", "flyover"],
        issueKeywords: ["pothole", "road", "street", "light", "construction", "infrastructure"],
        serviceAreas: ["CP", "Rajiv Chowk", "Barakhamba Road", "Parliament Street"],
        coordinates: { lat: 28.6358, lng: 77.2244 },
        priority: 1,
        capacity: "high",
        responseTime: "48-72 hours",
        departmentType: "infrastructure"
    },

    // Mumbai Departments
    {
        departmentName: "Brihanmumbai Municipal Corporation - South",
        jurisdiction: "South Mumbai",
        contactEmail: "bmc.south@mumbai.gov.in",
        handlesIssues: ["garbage", "waste", "water", "drainage", "flooding"],
        primaryIssues: ["garbage", "waste", "water", "drainage"],
        secondaryIssues: ["flooding", "monsoon", "waterlogging"],
        issueKeywords: ["waste", "garbage", "water", "drain", "flood", "monsoon"],
        serviceAreas: ["Colaba", "Fort", "Nariman Point", "Marine Drive", "Churchgate"],
        coordinates: { lat: 18.9220, lng: 72.8347 },
        priority: 1,
        capacity: "high",
        responseTime: "24-48 hours",
        departmentType: "municipal"
    },
    {
        departmentName: "Mumbai Traffic Police - Western",
        jurisdiction: "West Mumbai",
        contactEmail: "traffic.west@mumbaipolice.gov.in",
        handlesIssues: ["traffic", "signal", "parking", "congestion"],
        primaryIssues: ["traffic", "signal", "parking"],
        secondaryIssues: ["congestion", "vehicle", "accident"],
        issueKeywords: ["traffic", "signal", "parking", "jam", "vehicle"],
        serviceAreas: ["Bandra", "Andheri", "Juhu", "Santacruz", "Khar"],
        coordinates: { lat: 19.0544, lng: 72.8440 },
        priority: 1,
        capacity: "medium",
        responseTime: "immediate",
        departmentType: "law_enforcement"
    },
    {
        departmentName: "Mumbai Public Works Department",
        jurisdiction: "Mumbai Metropolitan",
        contactEmail: "pwd@mumbai.gov.in",
        handlesIssues: ["pothole", "road", "bridge", "construction"],
        primaryIssues: ["pothole", "road", "bridge"],
        secondaryIssues: ["footpath", "infrastructure"],
        issueKeywords: ["pothole", "road", "bridge", "construction"],
        serviceAreas: ["All Mumbai", "Metropolitan Area"],
        coordinates: { lat: 19.0760, lng: 72.8777 },
        priority: 1,
        capacity: "high",
        responseTime: "48-72 hours",
        departmentType: "infrastructure"
    },

    // Bangalore Departments
    {
        departmentName: "Bruhat Bengaluru Mahanagara Palike - East",
        jurisdiction: "East Bangalore",
        contactEmail: "bbmp.east@bangalore.gov.in",
        handlesIssues: ["garbage", "waste", "water", "park", "tree"],
        primaryIssues: ["garbage", "waste", "water", "park"],
        secondaryIssues: ["tree", "garden", "environment"],
        issueKeywords: ["waste", "garbage", "water", "park", "tree", "garden"],
        serviceAreas: ["Whitefield", "Marathahalli", "Brookefield", "KR Puram"],
        coordinates: { lat: 12.9716, lng: 77.7946 },
        priority: 1,
        capacity: "medium",
        responseTime: "24-48 hours",
        departmentType: "municipal"
    },
    {
        departmentName: "Bangalore Traffic Police - Central",
        jurisdiction: "Central Bangalore",
        contactEmail: "traffic.central@bangalorepolice.gov.in",
        handlesIssues: ["traffic", "signal", "parking", "congestion"],
        primaryIssues: ["traffic", "signal", "parking"],
        secondaryIssues: ["congestion", "vehicle"],
        issueKeywords: ["traffic", "signal", "parking", "jam"],
        serviceAreas: ["MG Road", "Brigade Road", "Commercial Street", "Cubbon Park"],
        coordinates: { lat: 12.9716, lng: 77.5946 },
        priority: 1,
        capacity: "high",
        responseTime: "immediate",
        departmentType: "law_enforcement"
    },
    {
        departmentName: "Karnataka Public Works Department - Bangalore",
        jurisdiction: "Bangalore Urban",
        contactEmail: "pwd.bangalore@karnataka.gov.in",
        handlesIssues: ["pothole", "road", "highway", "bridge"],
        primaryIssues: ["pothole", "road", "highway"],
        secondaryIssues: ["bridge", "infrastructure"],
        issueKeywords: ["pothole", "road", "highway", "bridge"],
        serviceAreas: ["All Bangalore", "Urban District"],
        coordinates: { lat: 12.9716, lng: 77.5946 },
        priority: 1,
        capacity: "high",
        responseTime: "48-72 hours",
        departmentType: "infrastructure"
    },

    // Chennai Departments
    {
        departmentName: "Greater Chennai Corporation - Zone 1",
        jurisdiction: "North Chennai",
        contactEmail: "gcc.zone1@chennai.gov.in",
        handlesIssues: ["garbage", "waste", "water", "drainage", "flooding"],
        primaryIssues: ["garbage", "waste", "water", "drainage"],
        secondaryIssues: ["flooding", "storm water"],
        issueKeywords: ["waste", "garbage", "water", "drain", "flood"],
        serviceAreas: ["Washermanpet", "Royapuram", "Tondiarpet", "Perambur"],
        coordinates: { lat: 13.1067, lng: 80.2206 },
        priority: 1,
        capacity: "medium",
        responseTime: "24-48 hours",
        departmentType: "municipal"
    },
    {
        departmentName: "Chennai Metropolitan Water Supply",
        jurisdiction: "Chennai Metropolitan",
        contactEmail: "cmwssb@chennai.gov.in",
        handlesIssues: ["water", "supply", "pipeline", "leak", "pressure"],
        primaryIssues: ["water", "supply", "pipeline"],
        secondaryIssues: ["leak", "pressure", "quality"],
        issueKeywords: ["water", "supply", "pipe", "leak", "pressure"],
        serviceAreas: ["All Chennai", "Metropolitan Area"],
        coordinates: { lat: 13.0827, lng: 80.2707 },
        priority: 1,
        capacity: "high",
        responseTime: "12-24 hours",
        departmentType: "utility"
    },

    // Hyderabad Departments
    {
        departmentName: "Greater Hyderabad Municipal Corporation - West",
        jurisdiction: "West Hyderabad",
        contactEmail: "ghmc.west@hyderabad.gov.in",
        handlesIssues: ["garbage", "waste", "water", "drainage", "park"],
        primaryIssues: ["garbage", "waste", "water", "drainage"],
        secondaryIssues: ["park", "garden", "environment"],
        issueKeywords: ["waste", "garbage", "water", "drain", "park"],
        serviceAreas: ["Jubilee Hills", "Banjara Hills", "Mehdipatnam", "Tolichowki"],
        coordinates: { lat: 17.4065, lng: 78.4772 },
        priority: 1,
        capacity: "high",
        responseTime: "24-48 hours",
        departmentType: "municipal"
    },
    {
        departmentName: "Hyderabad Metropolitan Water Supply",
        jurisdiction: "Hyderabad Metropolitan",
        contactEmail: "hmws@hyderabad.gov.in",
        handlesIssues: ["water", "supply", "sewage", "treatment"],
        primaryIssues: ["water", "supply", "sewage"],
        secondaryIssues: ["treatment", "quality"],
        issueKeywords: ["water", "supply", "sewage", "treatment"],
        serviceAreas: ["All Hyderabad", "Metropolitan Area"],
        coordinates: { lat: 17.3850, lng: 78.4867 },
        priority: 1,
        capacity: "high",
        responseTime: "12-24 hours",
        departmentType: "utility"
    },

    // Pune Departments
    {
        departmentName: "Pune Municipal Corporation - Kothrud",
        jurisdiction: "West Pune",
        contactEmail: "pmc.kothrud@pune.gov.in",
        handlesIssues: ["garbage", "waste", "water", "road", "streetlight"],
        primaryIssues: ["garbage", "waste", "water", "road"],
        secondaryIssues: ["streetlight", "maintenance"],
        issueKeywords: ["waste", "garbage", "water", "road", "light"],
        serviceAreas: ["Kothrud", "Karve Nagar", "Warje", "Bavdhan"],
        coordinates: { lat: 18.5074, lng: 73.8077 },
        priority: 2,
        capacity: "medium",
        responseTime: "24-48 hours",
        departmentType: "municipal"
    },
    {
        departmentName: "Pune Traffic Police - Shivajinagar",
        jurisdiction: "Central Pune",
        contactEmail: "traffic.shivajinagar@punepolice.gov.in",
        handlesIssues: ["traffic", "signal", "parking", "congestion"],
        primaryIssues: ["traffic", "signal", "parking"],
        secondaryIssues: ["congestion", "enforcement"],
        issueKeywords: ["traffic", "signal", "parking", "jam"],
        serviceAreas: ["Shivajinagar", "JM Road", "FC Road", "Camp"],
        coordinates: { lat: 18.5314, lng: 73.8447 },
        priority: 1,
        capacity: "medium",
        responseTime: "immediate",
        departmentType: "law_enforcement"
    },

    // Kolkata Departments
    {
        departmentName: "Kolkata Municipal Corporation - South",
        jurisdiction: "South Kolkata",
        contactEmail: "kmc.south@kolkata.gov.in",
        handlesIssues: ["garbage", "waste", "drainage", "water", "park"],
        primaryIssues: ["garbage", "waste", "drainage"],
        secondaryIssues: ["water", "park", "street cleaning"],
        issueKeywords: ["waste", "garbage", "drain", "water", "park"],
        serviceAreas: ["Park Street", "Alipore", "Ballygunge", "Gariahat"],
        coordinates: { lat: 22.5448, lng: 88.3426 },
        priority: 1,
        capacity: "medium",
        responseTime: "24-48 hours",
        departmentType: "municipal"
    },
    {
        departmentName: "West Bengal Public Works Department - Kolkata",
        jurisdiction: "Kolkata Metropolitan",
        contactEmail: "pwd.kolkata@wb.gov.in",
        handlesIssues: ["pothole", "road", "bridge", "flyover"],
        primaryIssues: ["pothole", "road", "bridge"],
        secondaryIssues: ["flyover", "infrastructure"],
        issueKeywords: ["pothole", "road", "bridge", "flyover"],
        serviceAreas: ["All Kolkata", "Metropolitan Area"],
        coordinates: { lat: 22.5726, lng: 88.3639 },
        priority: 1,
        capacity: "high",
        responseTime: "48-72 hours",
        departmentType: "infrastructure"
    },

    // Ahmedabad Departments
    {
        departmentName: "Ahmedabad Municipal Corporation - West",
        jurisdiction: "West Ahmedabad",
        contactEmail: "amc.west@ahmedabad.gov.in",
        handlesIssues: ["garbage", "waste", "water", "sanitation"],
        primaryIssues: ["garbage", "waste", "water"],
        secondaryIssues: ["sanitation", "cleanliness"],
        issueKeywords: ["waste", "garbage", "water", "sanitation"],
        serviceAreas: ["Navrangpura", "Ambawadi", "Paldi", "Vastrapur"],
        coordinates: { lat: 23.0225, lng: 72.5714 },
        priority: 1,
        capacity: "high",
        responseTime: "24-48 hours",
        departmentType: "municipal"
    },
    {
        departmentName: "Gujarat Public Works Department - Ahmedabad",
        jurisdiction: "Ahmedabad District",
        contactEmail: "pwd.ahmedabad@gujarat.gov.in",
        handlesIssues: ["pothole", "road", "highway", "construction"],
        primaryIssues: ["pothole", "road", "highway"],
        secondaryIssues: ["construction", "maintenance"],
        issueKeywords: ["pothole", "road", "highway", "construction"],
        serviceAreas: ["All Ahmedabad", "District Area"],
        coordinates: { lat: 23.0225, lng: 72.5714 },
        priority: 1,
        capacity: "high",
        responseTime: "48-72 hours",
        departmentType: "infrastructure"
    },

    // Jaipur Departments
    {
        departmentName: "Jaipur Municipal Corporation - Pink City",
        jurisdiction: "Central Jaipur",
        contactEmail: "jmc.pinkcity@jaipur.gov.in",
        handlesIssues: ["garbage", "waste", "heritage", "tourism", "cleanliness"],
        primaryIssues: ["garbage", "waste", "heritage"],
        secondaryIssues: ["tourism", "cleanliness", "maintenance"],
        issueKeywords: ["waste", "garbage", "heritage", "tourism", "clean"],
        serviceAreas: ["City Palace", "Hawa Mahal", "Jantar Mantar", "Old City"],
        coordinates: { lat: 26.9124, lng: 75.7873 },
        priority: 1,
        capacity: "medium",
        responseTime: "12-24 hours",
        departmentType: "municipal"
    },

    // Lucknow Departments
    {
        departmentName: "Lucknow Municipal Corporation - Hazratganj",
        jurisdiction: "Central Lucknow",
        contactEmail: "lmc.hazratganj@lucknow.gov.in",
        handlesIssues: ["garbage", "waste", "water", "streetlight"],
        primaryIssues: ["garbage", "waste", "water"],
        secondaryIssues: ["streetlight", "maintenance"],
        issueKeywords: ["waste", "garbage", "water", "light"],
        serviceAreas: ["Hazratganj", "Aminabad", "Chowk", "Gomti Nagar"],
        coordinates: { lat: 26.8467, lng: 80.9462 },
        priority: 2,
        capacity: "medium",
        responseTime: "24-48 hours",
        departmentType: "municipal"
    },

    // Chandigarh Departments
    {
        departmentName: "Chandigarh Municipal Corporation",
        jurisdiction: "Chandigarh UT",
        contactEmail: "cmc@chandigarh.gov.in",
        handlesIssues: ["garbage", "waste", "water", "park", "horticulture"],
        primaryIssues: ["garbage", "waste", "water", "park"],
        secondaryIssues: ["horticulture", "garden", "environment"],
        issueKeywords: ["waste", "garbage", "water", "park", "garden"],
        serviceAreas: ["Sector 17", "Sector 22", "Sector 35", "All Sectors"],
        coordinates: { lat: 30.7333, lng: 76.7794 },
        priority: 1,
        capacity: "high",
        responseTime: "24-48 hours",
        departmentType: "municipal"
    },

    // Specialized Departments
    {
        departmentName: "Delhi Pollution Control Committee",
        jurisdiction: "Delhi NCR",
        contactEmail: "dpcc@delhi.gov.in",
        handlesIssues: ["noise", "pollution", "air quality", "environment"],
        primaryIssues: ["noise", "pollution", "air quality"],
        secondaryIssues: ["environment", "emissions"],
        issueKeywords: ["noise", "pollution", "air", "environment", "emissions"],
        serviceAreas: ["All Delhi", "NCR Region"],
        coordinates: { lat: 28.6139, lng: 77.2090 },
        priority: 2,
        capacity: "medium",
        responseTime: "48-72 hours",
        departmentType: "environmental"
    },
    {
        departmentName: "Mumbai Fire Brigade - South",
        jurisdiction: "South Mumbai",
        contactEmail: "fire.south@mumbai.gov.in",
        handlesIssues: ["fire", "emergency", "rescue", "safety"],
        primaryIssues: ["fire", "emergency", "rescue"],
        secondaryIssues: ["safety", "prevention"],
        issueKeywords: ["fire", "emergency", "rescue", "safety"],
        serviceAreas: ["Fort", "Colaba", "Marine Drive", "Nariman Point"],
        coordinates: { lat: 18.9220, lng: 72.8347 },
        priority: 1,
        capacity: "high",
        responseTime: "immediate",
        departmentType: "emergency"
    }
];

// Generate additional departments to reach 100+
const additionalDepartments = [];
const cities = ["Surat", "Indore", "Bhopal", "Kochi", "Coimbatore", "Nashik", "Nagpur", "Kanpur", "Patna", "Gurgaon"];
const departmentTypes = [
    { name: "Municipal Corporation", issues: ["garbage", "waste", "water", "sanitation"] },
    { name: "Public Works Department", issues: ["pothole", "road", "construction", "infrastructure"] },
    { name: "Traffic Police", issues: ["traffic", "signal", "parking", "congestion"] },
    { name: "Water Supply Board", issues: ["water", "supply", "pipeline", "leak"] },
    { name: "Electricity Board", issues: ["electricity", "power", "outage", "transformer"] },
    { name: "Fire Department", issues: ["fire", "emergency", "rescue", "safety"] },
    { name: "Health Department", issues: ["health", "sanitation", "disease", "medical"] },
    { name: "Parks Department", issues: ["park", "garden", "tree", "horticulture"] }
];

const zones = ["North", "South", "East", "West", "Central"];

cities.forEach((city, cityIndex) => {
    zones.forEach((zone, zoneIndex) => {
        departmentTypes.forEach((deptType, typeIndex) => {
            if (additionalDepartments.length < 80) { // Generate 80 more to reach 100+
                const lat = 20 + (cityIndex * 2) + (Math.random() * 0.1);
                const lng = 75 + (cityIndex * 3) + (Math.random() * 0.1);

                additionalDepartments.push({
                    departmentName: `${deptType.name} - ${city} ${zone}`,
                    jurisdiction: `${zone} ${city}`,
                    contactEmail: `${deptType.name.toLowerCase().replace(/ /g, '.')}.${zone.toLowerCase()}@${city.toLowerCase()}.gov.in`,
                    handlesIssues: deptType.issues,
                    primaryIssues: deptType.issues.slice(0, 3),
                    secondaryIssues: deptType.issues.slice(3).concat(["maintenance", "complaints"]),
                    issueKeywords: deptType.issues.concat(["service", "public", "citizen"]),
                    serviceAreas: [`${zone} ${city}`, `${city} District`],
                    coordinates: { lat, lng },
                    priority: Math.random() < 0.3 ? 1 : (Math.random() < 0.7 ? 2 : 3),
                    capacity: Math.random() < 0.4 ? "high" : (Math.random() < 0.8 ? "medium" : "low"),
                    responseTime: ["12-24 hours", "24-48 hours", "48-72 hours"][Math.floor(Math.random() * 3)],
                    departmentType: ["municipal", "infrastructure", "utility", "law_enforcement", "emergency"][Math.floor(Math.random() * 5)]
                });
            }
        });
    });
});

// Combine all departments
const allDepartments = [...departmentsData, ...additionalDepartments];

async function populateDepartments() {
    try {
        console.log('🚀 Starting department population...');
        console.log(`📊 Total departments to add: ${allDepartments.length}`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < allDepartments.length; i++) {
            const dept = allDepartments[i];

            try {
                // Add timestamp and migration info
                const departmentWithMeta = {
                    ...dept,
                    createdAt: new Date().toISOString(),
                    migrationVersion: "3.0",
                    scalabilityReady: true,
                    lastUpdated: new Date().toISOString()
                };

                await db.collection('departments').add(departmentWithMeta);
                successCount++;

                if (i % 10 === 0) {
                    console.log(`✅ Progress: ${i + 1}/${allDepartments.length} departments processed`);
                }

            } catch (error) {
                console.error(`❌ Error adding department ${dept.departmentName}:`, error.message);
                errorCount++;
            }

            // Small delay to avoid overwhelming the database
            if (i % 20 === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log('🎉 ==================== POPULATION COMPLETE ====================');
        console.log(`✅ Successfully added: ${successCount} departments`);
        console.log(`❌ Failed to add: ${errorCount} departments`);
        console.log(`📊 Total departments in database: ${successCount} (new) + existing`);
        console.log('🎯 Smart filtering system now ready for large-scale testing!');
        console.log('🌍 Cities covered:', [...new Set(allDepartments.map(d => d.jurisdiction.split(' ').slice(-1)[0]))].join(', '));
        console.log('🏢 Department types:', [...new Set(allDepartments.map(d => d.departmentType))].join(', '));
        console.log('================================================================');

    } catch (error) {
        console.error('❌ Population script failed:', error);
    }
}

// Export for use as module or run directly
if (require.main === module) {
    populateDepartments()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { populateDepartments, allDepartments };
