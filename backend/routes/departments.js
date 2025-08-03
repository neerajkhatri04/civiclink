const express = require('express');
const { getAllDepartments } = require('../services/departmentService');

const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const result = await getAllDepartments();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      departments: result.departments
    });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
