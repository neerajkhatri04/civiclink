const express = require('express');
const router = express.Router();
const CivicLinkVertexAI = require('../services/vertexAIService');

// Test endpoint for Vertex AI
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing Vertex AI integration...');

    const vertexAI = new CivicLinkVertexAI();
    const healthCheck = await vertexAI.healthCheck();

    res.json({
      success: true,
      service: 'CivicLink Vertex AI',
      status: healthCheck.status,
      timestamp: healthCheck.timestamp,
      message: healthCheck.response || healthCheck.error
    });

  } catch (error) {
    console.error('❌ Vertex AI test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      service: 'CivicLink Vertex AI'
    });
  }
});

// Test report analysis
router.post('/analyze', async (req, res) => {
  try {
    const { description, zone } = req.body;

    if (!description || !zone) {
      return res.status(400).json({
        success: false,
        error: 'Description and zone are required'
      });
    }

    console.log('🧪 Testing report analysis...');

    const vertexAI = new CivicLinkVertexAI();
    const result = await vertexAI.analyzeReport({
      description,
      zone,
      imageUrl: null
    });

    res.json(result);

  } catch (error) {
    console.error('❌ Report analysis test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
