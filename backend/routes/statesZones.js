const express = require('express');
const router = express.Router();

// State and Zone mappings - matches frontend data
const STATE_ZONE_MAPPING = {
    'Delhi': [
        'South Delhi',
        'North Delhi',
        'East Delhi',
        'West Delhi',
        'Central Delhi',
        'NDMC Area',
        'Delhi NCR'
    ],
    'Maharashtra': [
        'South Mumbai',
        'West Mumbai',
        'Mumbai Metropolitan',
        'West Pune',
        'Central Pune',
        'North Nashik',
        'Central Nagpur'
    ],
    'Karnataka': [
        'Central Bangalore',
        'East Bangalore',
        'Bangalore Urban'
    ],
    'Tamil Nadu': [
        'North Chennai',
        'Chennai Metropolitan'
    ],
    'West Bengal': [
        'South Kolkata',
        'Kolkata Metropolitan'
    ],
    'Telangana': [
        'West Hyderabad',
        'Hyderabad Metropolitan'
    ],
    'Madhya Pradesh': [
        'North Indore',
        'South Indore',
        'East Indore',
        'West Indore',
        'Central Indore',
        'Indore District',
        'Indore Circle',
        'Indore BRTS Corridor',
        'Indore Tourism Circuit',
        'Central Bhopal'
    ],
    'Gujarat': [
        'North Surat',
        'South Surat',
        'East Surat',
        'West Surat',
        'Central Surat',
        'Surat Municipal',
        'Surat Division',
        'Surat Industrial',
        'Surat Municipal Schools',
        'Surat Urban',
        'Surat District',
        'West Ahmedabad',
        'Ahmedabad District'
    ],
    'Rajasthan': [
        'Central Jaipur'
    ],
    'Uttar Pradesh': [
        'Central Lucknow'
    ],
    'Chandigarh': [
        'Chandigarh UT'
    ]
};

/**
 * GET /api/states-zones
 * Get all states and their zones
 */
router.get('/', (req, res) => {
    try {
        console.log('📍 State-Zone data requested');

        res.json({
            success: true,
            data: {
                states: Object.keys(STATE_ZONE_MAPPING).sort(),
                stateZoneMapping: STATE_ZONE_MAPPING,
                totalStates: Object.keys(STATE_ZONE_MAPPING).length,
                totalZones: Object.values(STATE_ZONE_MAPPING).reduce((total, zones) => total + zones.length, 0)
            }
        });
    } catch (error) {
        console.error('❌ Error fetching state-zone data:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/states-zones/states
 * Get list of all available states
 */
router.get('/states', (req, res) => {
    try {
        console.log('🏛️  States list requested');

        const states = Object.keys(STATE_ZONE_MAPPING).sort();

        res.json({
            success: true,
            data: {
                states: states,
                count: states.length
            }
        });
    } catch (error) {
        console.error('❌ Error fetching states:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/states-zones/zones/:state
 * Get zones for a specific state
 */
router.get('/zones/:state', (req, res) => {
    try {
        const { state } = req.params;
        console.log(`🏙️  Zones requested for state: ${state}`);

        const zones = STATE_ZONE_MAPPING[state];

        if (!zones) {
            return res.status(404).json({
                success: false,
                error: `State '${state}' not found`
            });
        }

        res.json({
            success: true,
            data: {
                state: state,
                zones: zones,
                count: zones.length
            }
        });
    } catch (error) {
        console.error('❌ Error fetching zones:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
