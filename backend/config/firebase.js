const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

// Multi-project configuration
const firebaseServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './serviceAccountKey-firebase.json';
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;

console.log('🔥 Configuring Firebase for multi-project setup:');
console.log('   Firebase Project:', firebaseProjectId);
console.log('   Service Account:', firebaseServiceAccountPath);

let firebaseApp;
try {
  // Try to load Firebase-specific service account
  let serviceAccount;
  try {
    serviceAccount = require(path.join(__dirname, '..', firebaseServiceAccountPath));
    console.log('✅ Loaded Firebase service account');
  } catch (keyError) {
    console.warn('⚠️ Firebase service account not found, trying fallback...');
    // Fallback to the existing serviceAccountKey.json
    serviceAccount = require('../serviceAccountKey.json');
    console.log('✅ Using fallback service account');
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: firebaseProjectId,
    storageBucket: `${firebaseProjectId}.appspot.com`
  });

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

const db = admin.firestore();

// Storage configuration - can use either project
const storageProjectId = process.env.FIREBASE_PROJECT_ID; // Use Firebase project for storage
const storage = new Storage({
  projectId: storageProjectId,
  keyFilename: path.join(__dirname, '..', firebaseServiceAccountPath)
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || `${storageProjectId}.appspot.com`);

console.log('📦 Storage configured for project:', storageProjectId);

module.exports = {
  admin,
  db,
  storage,
  bucket
};
