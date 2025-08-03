// State and Zone mappings for CivicLink
// This file contains the hierarchical mapping of states and their zones

export const STATE_ZONE_MAPPING = {
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

// Get all available states
export const getStates = () => {
    return Object.keys(STATE_ZONE_MAPPING).sort();
};

// Get zones for a specific state
export const getZonesForState = (state) => {
    return STATE_ZONE_MAPPING[state] || [];
};

// Validate if a zone belongs to a state
export const isValidStateZone = (state, zone) => {
    const zones = getZonesForState(state);
    return zones.includes(zone);
};

// Search for state by zone
export const getStateByZone = (zone) => {
    for (const [state, zones] of Object.entries(STATE_ZONE_MAPPING)) {
        if (zones.includes(zone)) {
            return state;
        }
    }
    return null;
};
