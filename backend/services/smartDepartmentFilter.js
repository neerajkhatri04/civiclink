const { getAllDepartments } = require('./departmentService');

/**
 * Smart Department Filtering Service
 * Solves scalability issues by pre-filtering departments before sending to AI
 */
class SmartDepartmentFilter {
    constructor() {
        this.maxDepartmentsToAI = 15;
        this.relevanceThreshold = 0.3;

        console.log('🔍 Smart Department Filter initialized');
        console.log('   Max departments to AI:', this.maxDepartmentsToAI);
        console.log('   Relevance threshold:', this.relevanceThreshold * 100, '%');
    }

    /**
     * Main method: Get the most relevant departments for a report
     */
    async getRelevantDepartments(reportData) {
        try {
            console.log('🔍 ==================== SMART FILTERING ====================');
            console.log('🔍 Starting smart department filtering...');
            console.log('🔍 Report Zone:', reportData.zone);
            console.log('🔍 Report Description Preview:', reportData.description.substring(0, 100) + '...');

            // Load all departments
            const allDepartmentsResult = await getAllDepartments();
            if (!allDepartmentsResult.success || !allDepartmentsResult.departments) {
                console.log('❌ Failed to load departments');
                return { departments: [], totalInDatabase: 0 };
            }

            const allDepartments = allDepartmentsResult.departments;
            console.log(`📋 Loaded ${allDepartments.length} departments from database`);

            // Stage 1: Geographic Filtering
            console.log('📍 Stage 1: Geographic filtering...');
            const geographicMatches = this.filterByGeography(reportData.zone, allDepartments);
            console.log('📍 Geographic filtering result:', geographicMatches.length, 'departments');

            // Stage 2: Issue Type Filtering
            console.log('🎯 Stage 2: Issue type filtering...');
            const issueMatches = this.filterByIssueType(reportData.description, geographicMatches);
            console.log('🎯 Issue type filtering result:', issueMatches.length, 'departments');

            // Stage 3: Priority Ranking and Final Selection
            console.log('📊 Stage 3: Priority ranking...');
            const rankedDepartments = this.rankByRelevance(reportData, issueMatches);
            const finalDepartments = rankedDepartments.slice(0, this.maxDepartmentsToAI);

            console.log('📊 Ranking departments by relevance...');
            console.log('✅ Final selection:', finalDepartments.length, 'departments for AI');
            console.log('🔍 ========================================================');

            return {
                departments: finalDepartments,
                totalInDatabase: allDepartments.length,
                stats: {
                    totalDepartments: allDepartments.length,
                    afterGeographic: geographicMatches.length,
                    afterIssueType: issueMatches.length,
                    sentToAI: finalDepartments.length,
                    method: 'smart_filtering'
                }
            };

        } catch (error) {
            console.error('❌ Smart filtering failed:', error.message);
            console.log('🔄 Falling back to basic filtering...');

            // Fallback: return all departments
            try {
                const fallbackResult = await getAllDepartments();
                if (fallbackResult.success) {
                    return {
                        departments: fallbackResult.departments,
                        totalInDatabase: fallbackResult.departments.length,
                        stats: { method: 'fallback' }
                    };
                }
            } catch (fallbackError) {
                console.error('❌ Fallback filtering also failed:', fallbackError.message);
            }

            return { departments: [], totalInDatabase: 0 };
        }
    }

    /**
     * Stage 1: Filter departments by geographic proximity
     */
    filterByGeography(zone, allDepartments) {
        const departments = [];

        // Primary match: Exact jurisdiction match (normalize case)
        console.log('📍 Searching for exact jurisdiction match:', zone);
        const exactMatches = allDepartments.filter(dept => {
            if (!dept.jurisdiction) return false;

            const deptJurisdiction = dept.jurisdiction.toLowerCase().trim();
            const reportZone = zone.toLowerCase().trim();

            // Check for exact match first
            if (deptJurisdiction === reportZone) {
                return true;
            }

            // Check for city-specific matches (more precise than just direction matching)
            return this.areZonesSimilar(deptJurisdiction, reportZone);
        });

        exactMatches.forEach(dept => {
            departments.push({
                ...dept,
                matchType: 'exact',
                geographicScore: 1.0
            });
        });

        console.log('📍 Exact matches found:', exactMatches.length);
        if (exactMatches.length > 0) {
            console.log('📍 Exact match departments:');
            exactMatches.forEach((dept, index) => {
                console.log(`   ${index + 1}. ${dept.departmentName || 'Unknown'} (${dept.jurisdiction || 'Unknown'})`);
            });
        } else {
            console.log('📍 No exact matches found. Looking for similar jurisdictions...');
            // Show some sample jurisdictions for debugging
            const sampleJurisdictions = allDepartments
                .filter(dept => dept.jurisdiction)
                .slice(0, 10)
                .map(dept => dept.jurisdiction);
            console.log('📍 Sample jurisdictions in database:', sampleJurisdictions);
        }

        // Secondary match: Regional/zone coverage (including metropolitan areas)
        if (departments.length < 10) {
            console.log('📍 Searching for regional departments...');

            // Extract city from the report zone to match only relevant regional departments
            const reportCity = this.extractCityFromZone(zone.toLowerCase());
            console.log('📍 Extracted city from zone:', reportCity);

            const regionalMatches = allDepartments.filter(dept => {
                if (exactMatches.some(exact => exact.id === dept.id)) return false; // Skip exact matches

                if (!dept.jurisdiction) return false;
                const deptJurisdiction = dept.jurisdiction.toLowerCase();

                // Special handling for metropolitan areas like "Delhi NCR", "Mumbai Metropolitan", etc.
                if (this.isMetropolitanZone(zone) && reportCity) {
                    // Include all departments from the same city for metropolitan zones
                    if (deptJurisdiction.includes(reportCity)) {
                        return true;
                    }
                }

                // Check if department has service areas that match the report zone
                const serviceAreaMatch = dept.serviceAreas && dept.serviceAreas.some(area =>
                    area.toLowerCase().includes(zone.toLowerCase()) ||
                    zone.toLowerCase().includes(area.toLowerCase())
                );

                if (serviceAreaMatch) return true;

                // Enhanced city-wide matching for the same city
                if (reportCity) {
                    // For city-based matching, include all departments from the same city
                    // This handles cases like "East Delhi" should match other Delhi departments
                    if (deptJurisdiction.includes(reportCity)) {
                        // Check for city-wide or metropolitan departments
                        const isCityWide = (
                            deptJurisdiction.includes('all') ||
                            deptJurisdiction.includes('citywide') ||
                            deptJurisdiction.includes('metropolitan') ||
                            deptJurisdiction.includes('regional') ||
                            deptJurisdiction.includes('central') ||
                            deptJurisdiction.includes('head office') ||
                            deptJurisdiction.includes('main office')
                        );

                        if (isCityWide) {
                            return true;
                        }

                        // Also include departments from neighboring zones in the same city
                        // This helps when there are no exact matches but related departments exist
                        const isNeighboringZone = this.areZonesInSameCity(zone.toLowerCase(), deptJurisdiction);
                        if (isNeighboringZone) {
                            return true;
                        }
                    }
                }

                return false;
            });

            regionalMatches.forEach(dept => {
                departments.push({
                    ...dept,
                    matchType: 'regional',
                    geographicScore: 0.8
                });
            });

            console.log('📍 Regional matches found:', regionalMatches.length);
            if (regionalMatches.length > 0) {
                console.log('📍 Regional departments:');
                regionalMatches.slice(0, 5).forEach((dept, index) => {
                    console.log(`   ${index + 1}. ${dept.departmentName || 'Unknown'} (${dept.jurisdiction || 'Unknown'})`);
                });
                if (regionalMatches.length > 5) {
                    console.log(`   ... and ${regionalMatches.length - 5} more`);
                }
            }
        }

        // If still no matches, include all departments as fallback
        if (departments.length === 0) {
            console.log('📍 No geographic matches found, including all departments');
            allDepartments.forEach(dept => {
                departments.push({
                    ...dept,
                    matchType: 'fallback',
                    geographicScore: 0.5
                });
            });
        }

        return departments;
    }

    /**
     * Stage 2: Filter departments by issue type relevance
     */
    filterByIssueType(description, geographicMatches) {
        console.log('🎯 Analyzing issue types from description...');

        // Extract keywords from description
        const keywords = this.extractIssueKeywords(description);
        console.log('🔤 Extracted keywords:', keywords);

        if (keywords.length === 0) {
            console.log('⚠️ No keywords extracted, keeping all departments');
            return geographicMatches;
        }

        // Score departments by issue relevance
        const scoredDepartments = geographicMatches.map(dept => {
            const issueScore = this.calculateIssueRelevance(keywords, dept);
            return {
                ...dept,
                issueScore,
                totalScore: (dept.geographicScore * 0.6) + (issueScore * 0.4)
            };
        });

        // Filter by relevance threshold
        const relevantDepartments = scoredDepartments.filter(dept =>
            dept.totalScore >= this.relevanceThreshold
        );

        // If no departments meet threshold, keep top half
        if (relevantDepartments.length === 0) {
            console.log('⚠️ No departments meet relevance threshold, keeping top performers');
            const sorted = scoredDepartments.sort((a, b) => b.totalScore - a.totalScore);
            return sorted.slice(0, Math.max(5, Math.floor(scoredDepartments.length / 2)));
        }

        return relevantDepartments;
    }

    /**
     * Stage 3: Rank departments by overall relevance with proper exact match priority
     */
    rankByRelevance(reportData, departments) {
        console.log('📊 Ranking departments by composite score...');

        // First, separate exact matches from others
        const exactMatches = departments.filter(dept => dept.matchType === 'exact');
        const otherMatches = departments.filter(dept => dept.matchType !== 'exact');

        console.log(`📊 Exact matches: ${exactMatches.length}, Other matches: ${otherMatches.length}`);

        // Score and sort exact matches
        const scoredExactMatches = exactMatches
            .map(dept => ({
                ...dept,
                finalScore: this.calculateCompositeScore(dept, reportData),
                matchPriority: 1 // Highest priority
            }))
            .sort((a, b) => b.finalScore - a.finalScore);

        // Score and sort other matches  
        const scoredOtherMatches = otherMatches
            .map(dept => ({
                ...dept,
                finalScore: this.calculateCompositeScore(dept, reportData),
                matchPriority: 2 // Lower priority
            }))
            .sort((a, b) => b.finalScore - a.finalScore);

        // Combine: exact matches first, then others
        return [...scoredExactMatches, ...scoredOtherMatches];
    }

    /**
     * Calculate composite relevance score with enhanced exact match priority
     */
    calculateCompositeScore(dept, reportData) {
        const geographicScore = dept.geographicScore || 0.5;
        const issueScore = dept.issueScore || 0.5;
        const priorityScore = (dept.priority === 1) ? 1.0 : (dept.priority === 2) ? 0.8 : 0.6;

        // Enhanced scoring based on match type
        if (dept.matchType === 'exact') {
            // For exact matches: heavily favor geographic accuracy, but still consider issue relevance
            const geographicWeight = 0.6;  // Increased from 0.4
            const issueWeight = 0.3;       // Reduced from 0.4 
            const priorityWeight = 0.1;    // Reduced from 0.2

            // Give bonus for exact matches
            const exactMatchBonus = 0.2;

            return (geographicScore * geographicWeight) +
                (issueScore * issueWeight) +
                (priorityScore * priorityWeight) +
                exactMatchBonus;
        } else {
            // For regional/other matches: standard scoring
            const geographicWeight = 0.4;
            const issueWeight = 0.4;
            const priorityWeight = 0.2;

            return (geographicScore * geographicWeight) +
                (issueScore * issueWeight) +
                (priorityScore * priorityWeight);
        }
    }

    /**
     * Extract issue keywords from description
     */
    extractIssueKeywords(description) {
        const keywordMap = {
            // Road and Traffic
            'road': ['road', 'street', 'pothole', 'traffic', 'signal', 'parking', 'footpath'],
            'traffic': ['traffic', 'signal', 'jam', 'light', 'vehicle', 'parking'],
            'pothole': ['pothole', 'hole', 'damage', 'crater', 'bump'],

            // Water and Drainage
            'water': ['water', 'pipe', 'leak', 'supply', 'pressure', 'shortage'],
            'drainage': ['drainage', 'drain', 'flood', 'waterlog', 'overflow', 'sewer'],
            'sewer': ['sewer', 'sewage', 'smell', 'overflow', 'blocked'],

            // Waste Management
            'garbage': ['garbage', 'waste', 'trash', 'litter', 'dump', 'dirty'],
            'clean': ['clean', 'sweep', 'sanitation', 'hygiene'],

            // Utilities
            'electricity': ['electricity', 'power', 'light', 'pole', 'wire', 'outage'],
            'streetlight': ['streetlight', 'street light', 'lamp', 'lighting', 'dark'],

            // Parks and Environment
            'park': ['park', 'garden', 'tree', 'green', 'playground'],
            'environment': ['pollution', 'air', 'noise', 'smoke', 'dust'],

            // Public Safety
            'safety': ['safety', 'security', 'crime', 'police', 'emergency'],
            'fire': ['fire', 'burn', 'smoke', 'emergency']
        };

        const text = description.toLowerCase();
        const foundKeywords = [];

        for (const [category, words] of Object.entries(keywordMap)) {
            for (const word of words) {
                if (text.includes(word)) {
                    foundKeywords.push(category);
                    break; // Only add category once
                }
            }
        }

        return [...new Set(foundKeywords)]; // Remove duplicates
    }

    /**
     * Calculate how relevant a department is for given keywords
     */
    calculateIssueRelevance(keywords, department) {
        if (keywords.length === 0) return 0.5;

        let totalScore = 0;
        let maxPossibleScore = keywords.length;

        for (const keyword of keywords) {
            let keywordScore = 0;

            // Check primary issues (highest weight)
            if (department.primaryIssues && department.primaryIssues.some(issue =>
                issue.toLowerCase().includes(keyword) || keyword.includes(issue.toLowerCase())
            )) {
                keywordScore = Math.max(keywordScore, 1.0);
            }

            // Check handlesIssues (high weight)
            if (department.handlesIssues && department.handlesIssues.some(issue =>
                issue.toLowerCase().includes(keyword) || keyword.includes(issue.toLowerCase())
            )) {
                keywordScore = Math.max(keywordScore, 0.9);
            }

            // Check secondary issues (medium weight)
            if (department.secondaryIssues && department.secondaryIssues.some(issue =>
                issue.toLowerCase().includes(keyword) || keyword.includes(issue.toLowerCase())
            )) {
                keywordScore = Math.max(keywordScore, 0.7);
            }

            // Check issue keywords (medium weight)
            if (department.issueKeywords && department.issueKeywords.some(issue =>
                issue.toLowerCase().includes(keyword) || keyword.includes(issue.toLowerCase())
            )) {
                keywordScore = Math.max(keywordScore, 0.6);
            }

            // Check department name and description (lower weight)
            const name = (department.departmentName || '').toLowerCase();
            const desc = (department.description || '').toLowerCase();
            if (name.includes(keyword) || desc.includes(keyword)) {
                keywordScore = Math.max(keywordScore, 0.4);
            }

            totalScore += keywordScore;
        }

        return totalScore / maxPossibleScore;
    }

    /**
     * Check if a zone represents a metropolitan/regional area
     */
    isMetropolitanZone(zone) {
        const lowerZone = zone.toLowerCase();

        // Common metropolitan area patterns
        const metropolitanKeywords = [
            'ncr', 'metropolitan', 'metro', 'region', 'area', 'greater',
            'all', 'entire', 'whole', 'citywide', 'urban', 'district'
        ];

        return metropolitanKeywords.some(keyword => lowerZone.includes(keyword));
    }

    /**
     * Extract city name from zone string
     */
    extractCityFromZone(zone) {
        const cities = [
            'mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'kolkata',
            'hyderabad', 'pune', 'indore', 'surat', 'ahmedabad', 'jaipur',
            'lucknow', 'chandigarh', 'kochi', 'coimbatore', 'nashik', 'nagpur',
            'kanpur', 'patna', 'gurgaon', 'noida', 'bhopal'
        ];

        const lowerZone = zone.toLowerCase();

        // Direct city match
        for (const city of cities) {
            if (lowerZone.includes(city)) {
                return city;
            }
        }

        // Handle special cases
        if (lowerZone.includes('bengaluru')) return 'bangalore';
        if (lowerZone.includes('bangalore')) return 'bangalore';

        return null;
    }

    /**
     * Check if two zone names are similar (more precise matching)
     */
    areZonesSimilar(zone1, zone2) {
        // Extract city and direction from zone names
        const extractCityAndDirection = (zone) => {
            const lower = zone.toLowerCase();
            let city = '';
            let direction = '';

            // Common city patterns
            const cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'indore', 'surat', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh'];
            const directions = ['north', 'south', 'east', 'west', 'central', 'centre', 'center'];

            // Find city
            for (const c of cities) {
                if (lower.includes(c)) {
                    city = c;
                    break;
                }
            }

            // Find direction
            for (const d of directions) {
                if (lower.includes(d)) {
                    direction = d === 'centre' || d === 'center' ? 'central' : d;
                    break;
                }
            }

            return { city, direction };
        };

        const zone1Parts = extractCityAndDirection(zone1);
        const zone2Parts = extractCityAndDirection(zone2);

        // Only match if both city AND direction match
        if (zone1Parts.city && zone2Parts.city && zone1Parts.direction && zone2Parts.direction) {
            return zone1Parts.city === zone2Parts.city && zone1Parts.direction === zone2Parts.direction;
        }

        // If no clear city/direction pattern, allow broader matching for same base location
        const cleanZone1 = zone1.replace(/\s+(north|south|east|west|central|centre|center)\s*/gi, '').trim();
        const cleanZone2 = zone2.replace(/\s+(north|south|east|west|central|centre|center)\s*/gi, '').trim();

        if (cleanZone1 && cleanZone2 && cleanZone1 === cleanZone2) {
            return true;
        }

        return false;
    }

    /**
     * Check if two zones are in the same city (for regional matching)
     */
    areZonesInSameCity(zone1, zone2) {
        const extractCityAndDirection = (zone) => {
            const lower = zone.toLowerCase();
            let city = '';
            let direction = '';

            // Common city patterns
            const cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'indore', 'surat', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh'];
            const directions = ['north', 'south', 'east', 'west', 'central', 'centre', 'center'];

            // Find city
            for (const c of cities) {
                if (lower.includes(c)) {
                    city = c;
                    break;
                }
            }

            // Find direction
            for (const d of directions) {
                if (lower.includes(d)) {
                    direction = d === 'centre' || d === 'center' ? 'central' : d;
                    break;
                }
            }

            return { city, direction };
        };

        const zone1Parts = extractCityAndDirection(zone1);
        const zone2Parts = extractCityAndDirection(zone2);

        // Return true if they're in the same city (regardless of direction)
        return zone1Parts.city && zone2Parts.city && zone1Parts.city === zone2Parts.city;
    }
}

module.exports = SmartDepartmentFilter;
