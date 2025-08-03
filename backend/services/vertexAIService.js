const { VertexAI } = require('@google-cloud/vertexai');
const { getDepartmentInfo, getAllDepartments } = require('./departmentService');
const path = require('path');
require('dotenv').config();

// Simple fallback department for emergency cases
const fallbackDepartment = [{
    departmentName: 'General Administration',
    contactEmail: 'admin@civiclink.com',
    handlesIssues: ['general', 'unclassified'],
    jurisdiction: 'All Zones',
    description: 'General administration for unclassified issues'
}];

class CivicLinkVertexAI {
    constructor() {
        this.projectId = process.env.VERTEX_AI_PROJECT_ID;
        this.location = process.env.VERTEX_AI_LOCATION || 'us-central1';
        this.modelName = process.env.VERTEX_AI_MODEL || 'gemini-2.0-flash-lite-001';

        console.log('🚀 Initializing CivicLink Vertex AI (Multi-Project Setup):');
        console.log('   Vertex AI Project:', this.projectId);
        console.log('   Location:', this.location);
        console.log('   Model:', this.modelName);

        try {
            // Configure Vertex AI with specific service account if provided
            const vertexAIServiceAccountPath = process.env.VERTEX_AI_SERVICE_ACCOUNT_KEY;
            let vertexAIConfig = {
                project: this.projectId,
                location: this.location
            };

            if (vertexAIServiceAccountPath) {
                try {
                    const serviceAccount = require(path.join(__dirname, '..', vertexAIServiceAccountPath));
                    // Set credentials for Vertex AI
                    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '..', vertexAIServiceAccountPath);
                    console.log('✅ Using dedicated Vertex AI service account');
                } catch (keyError) {
                    console.warn('⚠️ Vertex AI service account not found, using default credentials');
                }
            }

            this.vertexAI = new VertexAI(vertexAIConfig);

            // Try multiple models in order of preference
            const modelOptions = [
                this.modelName,
                'gemini-2.0-flash-lite-001',
                'gemini-1.5-flash',
                'gemini-1.0-pro',
                'gemini-pro'
            ];

            let modelInitialized = false;
            for (const modelName of modelOptions) {
                try {
                    this.model = this.vertexAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            temperature: 0.3,
                            topP: 0.8,
                            maxOutputTokens: 1024
                        }
                    });
                    this.actualModel = modelName;
                    modelInitialized = true;
                    console.log(`✅ Using model: ${modelName}`);
                    break;
                } catch (modelError) {
                    console.log(`⚠️ Model ${modelName} not available, trying next...`);
                }
            }

            if (!modelInitialized) {
                throw new Error('No compatible models found');
            }

            console.log('✅ Vertex AI initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Vertex AI:', error);
            throw error;
        }
    }

    /**
     * Analyze civic issue report and recommend appropriate department
     * @param {Object} reportData - The report data to analyze
     * @param {Array} providedDepartments - Optional array of pre-filtered departments
     */
    async analyzeReport(reportData, providedDepartments = null) {
        try {
            console.log('🧠 ==================== VERTEX AI ANALYSIS ====================');
            console.log('🧠 Analyzing report with Vertex AI...');
            console.log('🧠 Description:', reportData.description);
            console.log('🧠 Zone:', reportData.zone);
            console.log('🧠 Image URL:', reportData.imageUrl || 'None');
            console.log('🧠 Project:', this.projectId);
            console.log('🧠 Model:', this.actualModel || this.modelName);
            console.log('🧠 Location:', this.location);
            console.log('🧠 Pre-filtered Departments:', providedDepartments ? `YES (${providedDepartments.length})` : 'NO (will fetch all)');
            console.log('🧠 ==============================================================');

            // Use provided departments or get all available departments for context
            let departments = [];

            if (providedDepartments && providedDepartments.length > 0) {
                console.log('✅ Using pre-filtered departments from smart filtering:');
                departments = providedDepartments;
                departments.forEach((dept, index) => {
                    console.log(`   ${index + 1}. ${dept.departmentName} (${dept.jurisdiction})`);
                    console.log(`      Handles: ${dept.handlesIssues?.join(', ') || 'Not specified'}`);
                    console.log(`      Email: ${dept.contactEmail}`);
                });
            } else {
                console.log('📋 No pre-filtered departments provided, fetching all from database...');
                try {
                    const departmentsResult = await getAllDepartments();
                    console.log('📋 Database result:', {
                        success: departmentsResult.success,
                        departmentCount: departmentsResult.departments ? departmentsResult.departments.length : 0
                    });

                    departments = departmentsResult.success ? departmentsResult.departments : [];

                    if (departments.length > 0) {
                        console.log('✅ Using real departments from database:');
                        departments.forEach((dept, index) => {
                            console.log(`   ${index + 1}. ${dept.departmentName} (${dept.jurisdiction})`);
                            console.log(`      Handles: ${dept.handlesIssues?.join(', ') || 'Not specified'}`);
                            console.log(`      Email: ${dept.contactEmail}`);
                        });
                    } else {
                        console.warn('⚠️ No departments returned from database, using fallback department');
                        departments = fallbackDepartment;
                        console.log('⚠️ Using fallback department:', departments.map(d => d.departmentName).join(', '));
                    }
                } catch (dbError) {
                    console.warn('⚠️ Database error, using fallback department:', dbError.message);
                    departments = fallbackDepartment;
                    console.log('⚠️ Fallback department loaded:', departments.map(d => d.departmentName).join(', '));
                }
            }

            if (departments.length === 0) {
                console.warn('⚠️ No departments available at all, using fallback department');
                departments = fallbackDepartment;
            }

            // Create department context for AI
            const departmentContext = departments.map(dept => ({
                name: dept.departmentName,
                email: dept.contactEmail,
                handles: dept.handlesIssues,
                jurisdiction: dept.jurisdiction,
                description: dept.description
            }));

            const systemInstruction = `You are CivicLink AI, an expert system for analyzing civic issue reports and routing them to appropriate municipal departments.

AVAILABLE DEPARTMENTS:
${JSON.stringify(departmentContext, null, 2)}

ANALYSIS INSTRUCTIONS:
1. Carefully analyze the citizen's report description and location
2. Extract key issue keywords from the description
3. Match the issue to the most appropriate department based on:
   - Issue type compatibility with department's handlesIssues array
   - Geographic jurisdiction match with the reported zone
   - Department's specialized expertise

KEYWORD MAPPING GUIDE:
- Road issues (potholes, cracks, damage): "pothole", "road_maintenance"
- Street lighting: "streetlight", "lighting"  
- Waste management: "garbage", "waste"
- Water/drainage: "water", "drainage", "sewage"
- Traffic management: "traffic", "signals"
- Parks/recreation: "park", "recreation"
- Noise complaints: "noise", "disturbance"
- Construction issues: "construction", "building"

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "success": true,
  "issueKeywords": ["keyword1", "keyword2"],
  "confidence": 0.95,
  "recommendedDepartment": {
    "departmentName": "Exact Department Name",
    "contactEmail": "department@example.com",
    "reasoning": "Brief explanation of selection logic"
  },
  "alternativeDepartments": [
    {
      "departmentName": "Alternative Department",
      "reasoning": "Why this could also handle the issue"
    }
  ]
}

If no suitable department found:
{
  "success": false,
  "error": "No appropriate department found",
  "issueKeywords": ["extracted", "keywords"],
  "suggestions": "What additional information might help"
}

Be precise, analytical, and ensure department names match exactly with available departments.`;

            const fullPrompt = `${systemInstruction}

CIVIC ISSUE ANALYSIS REQUEST:

Report Description: "${reportData.description}"
Location/Zone: "${reportData.zone}"
${reportData.imageUrl ? `Image Evidence: ${reportData.imageUrl}` : 'No image provided'}
Report Time: ${new Date().toISOString()}

Please analyze this civic issue and recommend the most appropriate municipal department to handle it. Consider both the nature of the issue and geographic jurisdiction.`;

            console.log('🤖 Sending request to Vertex AI...');
            console.log('📤 Full prompt length:', fullPrompt.length, 'characters');

            const result = await this.model.generateContent(fullPrompt);
            console.log('📨 Vertex AI response received');

            // Handle different response formats
            let responseText;
            if (result.response && typeof result.response.text === 'function') {
                responseText = result.response.text();
                console.log('📥 Extracted response using .text() method');
            } else if (result.response && result.response.candidates && result.response.candidates[0]) {
                responseText = result.response.candidates[0].content.parts[0].text;
                console.log('📥 Extracted response from candidates array');
            } else if (result.response && result.response.text) {
                responseText = result.response.text;
                console.log('📥 Extracted response from .text property');
            } else {
                console.error('❌ Unable to extract text from AI response structure:', Object.keys(result));
                throw new Error('Unable to extract text from AI response');
            }

            console.log('📝 Raw AI Response length:', responseText.length, 'characters');
            console.log('📝 Raw AI Response preview:', responseText.substring(0, 200) + '...');

            // Parse AI response
            let aiAnalysis;
            try {
                console.log('🔍 Attempting to parse AI response...');
                // Clean and extract JSON from response
                const cleanedResponse = responseText.trim();
                const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);

                if (!jsonMatch) {
                    console.error('❌ No JSON found in AI response');
                    console.log('📝 Full response for debugging:', responseText);
                    throw new Error('No JSON found in AI response');
                }

                console.log('🔍 Found JSON match, length:', jsonMatch[0].length, 'characters');
                aiAnalysis = JSON.parse(jsonMatch[0]);
                console.log('✅ Successfully parsed AI Analysis');
                console.log('📊 AI Analysis structure:', {
                    success: aiAnalysis.success,
                    hasRecommendedDepartment: !!aiAnalysis.recommendedDepartment,
                    confidence: aiAnalysis.confidence,
                    issueKeywords: aiAnalysis.issueKeywords?.length || 0,
                    alternativeDepartments: aiAnalysis.alternativeDepartments?.length || 0
                });

            } catch (parseError) {
                console.error('❌ Failed to parse AI response:', parseError.message);
                console.log('📝 Raw response that failed to parse:', responseText);
                throw new Error(`AI response parsing failed: ${parseError.message}`);
            }

            // Validate AI response structure
            if (!aiAnalysis.success) {
                console.log('⚠️ AI analysis marked as unsuccessful');
                console.log('📋 AI Error:', aiAnalysis.error);
                console.log('🔤 Issue Keywords:', aiAnalysis.issueKeywords);
                console.log('💡 AI Suggestions:', aiAnalysis.suggestions);
                return {
                    success: false,
                    error: aiAnalysis.error || 'AI could not analyze the report',
                    issueKeywords: aiAnalysis.issueKeywords || [],
                    suggestions: aiAnalysis.suggestions
                };
            }

            console.log('✅ AI analysis marked as successful');
            console.log('🎯 Recommended Department:', aiAnalysis.recommendedDepartment?.departmentName);
            console.log('📈 Confidence Score:', aiAnalysis.confidence);
            console.log('🔤 Issue Keywords:', aiAnalysis.issueKeywords);
            console.log('💭 AI Reasoning:', aiAnalysis.recommendedDepartment?.reasoning);

            // Verify recommended department exists in database
            const recommendedDept = departments.find(dept =>
                dept.departmentName === aiAnalysis.recommendedDepartment.departmentName
            );

            if (!recommendedDept) {
                console.error('❌ AI recommended non-existent department:', aiAnalysis.recommendedDepartment.departmentName);
                console.log('📋 Available departments:', departments.map(d => d.departmentName));

                // Instead of throwing error, try to find a suitable fallback department
                let fallbackDept = null;

                // Try to match by keywords
                const keywords = aiAnalysis.issueKeywords || [];
                console.log('🔍 Searching for fallback department using keywords:', keywords);

                for (const keyword of keywords) {
                    fallbackDept = departments.find(dept =>
                        dept.handlesIssues && dept.handlesIssues.includes(keyword)
                    );
                    if (fallbackDept) {
                        console.log('✅ Found fallback department by keyword:', keyword, '→', fallbackDept.departmentName);
                        break;
                    }
                }

                // If no fallback found, use the first available department
                if (!fallbackDept && departments.length > 0) {
                    fallbackDept = departments[0];
                    console.log('✅ Using first available department as fallback:', fallbackDept.departmentName);
                }

                if (!fallbackDept) {
                    console.error('❌ No fallback department found at all');
                    throw new Error(`No suitable department found for issue keywords: ${keywords.join(', ')}`);
                }

                console.log('🔄 Returning fallback department solution');
                return {
                    success: true,
                    department: fallbackDept,
                    aiAnalysis: {
                        keywords: aiAnalysis.issueKeywords,
                        confidence: aiAnalysis.confidence * 0.8, // Reduce confidence for fallback
                        reasoning: `AI recommended "${aiAnalysis.recommendedDepartment.departmentName}" but using "${fallbackDept.departmentName}" as fallback. Original reasoning: ${aiAnalysis.recommendedDepartment.reasoning}`,
                        alternatives: aiAnalysis.alternativeDepartments || []
                    },
                    processingMethod: 'vertex_ai_with_fallback'
                };
            }

            console.log('✅ Department validation successful');
            console.log('🏢 Matched Department Details:', {
                name: recommendedDept.departmentName,
                email: recommendedDept.contactEmail,
                jurisdiction: recommendedDept.jurisdiction,
                handlesIssues: recommendedDept.handlesIssues?.slice(0, 5).join(', ') || 'Not specified'
            });

            console.log('🎯 Final AI Analysis Result:', {
                success: true,
                departmentName: recommendedDept.departmentName,
                confidence: aiAnalysis.confidence,
                keywords: aiAnalysis.issueKeywords,
                processingMethod: 'vertex_ai'
            });

            return {
                success: true,
                department: recommendedDept,
                aiAnalysis: {
                    keywords: aiAnalysis.issueKeywords,
                    confidence: aiAnalysis.confidence,
                    reasoning: aiAnalysis.recommendedDepartment.reasoning,
                    alternatives: aiAnalysis.alternativeDepartments || []
                },
                processingMethod: 'vertex_ai'
            };

        } catch (error) {
            console.error('❌ ================== VERTEX AI ERROR ==================');
            console.error('❌ Vertex AI analysis failed:', error.message);
            console.error('❌ Error details:', {
                name: error.name,
                code: error.code,
                status: error.status,
                statusText: error.statusText
            });
            console.error('❌ Stack trace:', error.stack);
            console.error('❌ ===================================================');
            throw error; // Let the calling function handle fallback
        }
    }

    /**
     * Extract and classify issue keywords using AI
     */
    async extractIssueKeywords(description) {
        try {
            const prompt = `Analyze this civic issue description and extract relevant keywords:

Description: "${description}"

Extract keywords that help categorize this civic issue. Focus on:
- Type of infrastructure (road, light, drainage, etc.)
- Nature of problem (broken, damaged, not working, etc.)
- Location indicators (street, park, building, etc.)

Return a JSON array of the most relevant keywords:
["keyword1", "keyword2", "keyword3"]`;

            const result = await this.model.generateContent(prompt);

            // Handle different response formats
            let responseText;
            if (result.response && typeof result.response.text === 'function') {
                responseText = result.response.text();
            } else if (result.response && result.response.candidates && result.response.candidates[0]) {
                responseText = result.response.candidates[0].content.parts[0].text;
            } else if (result.response && result.response.text) {
                responseText = result.response.text;
            } else {
                throw new Error('Unable to extract text from AI response');
            }

            try {
                // Extract JSON array from response
                const jsonMatch = responseText.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (parseError) {
                console.warn('Failed to parse keyword extraction response');
            }

            // Fallback: basic keyword extraction
            return this.fallbackKeywordExtraction(description);

        } catch (error) {
            console.error('AI keyword extraction failed:', error);
            return this.fallbackKeywordExtraction(description);
        }
    }

    /**
     * Fallback keyword extraction when AI fails
     */
    fallbackKeywordExtraction(description) {
        const keywordMap = {
            'pothole': ['pothole', 'pit hole', 'road damage', 'crater', 'hole in road', 'broken road', 'damaged road'],
            'streetlight': ['streetlight', 'street light', 'lamp', 'lighting', 'dark', 'light not working'],
            'garbage': ['garbage', 'trash', 'waste', 'rubbish', 'litter', 'dump'],
            'water': ['water', 'leak', 'pipe', 'drainage', 'sewage', 'flooding'],
            'traffic': ['traffic', 'signal', 'sign', 'congestion', 'jam'],
            'park': ['park', 'garden', 'playground', 'recreation'],
            'noise': ['noise', 'loud', 'disturbance', 'sound'],
            'construction': ['construction', 'building', 'illegal', 'unauthorized']
        };

        const lowerDescription = description.toLowerCase();
        const foundKeywords = [];

        for (const [mainKeyword, variations] of Object.entries(keywordMap)) {
            for (const variation of variations) {
                if (lowerDescription.includes(variation)) {
                    foundKeywords.push(mainKeyword);
                    break;
                }
            }
        }

        return foundKeywords.length > 0 ? foundKeywords : ['general'];
    }

    /**
     * Health check for Vertex AI service
     */
    async healthCheck() {
        try {
            const testPrompt = 'Respond with "CivicLink AI is operational" if you can process this message.';
            const result = await this.model.generateContent(testPrompt);

            // Handle different response formats
            let response;
            if (result.response && typeof result.response.text === 'function') {
                response = result.response.text();
            } else if (result.response && result.response.candidates && result.response.candidates[0]) {
                response = result.response.candidates[0].content.parts[0].text;
            } else if (result.response && result.response.text) {
                response = result.response.text;
            } else {
                response = 'Response received but format unknown';
            }

            return {
                status: 'healthy',
                response: response,
                model: this.actualModel,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                model: this.actualModel,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = CivicLinkVertexAI;
