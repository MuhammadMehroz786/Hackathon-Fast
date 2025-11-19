const admin = require('firebase-admin');

// Initialize Firebase Admin
const initializeFirebase = () => {
  try {
    // For development/testing without Firebase
    if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
      console.log('⚠️  Running in mock mode (no Firebase credentials)');
      return null;
    }

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    console.log('✅ Firebase initialized successfully');
    return admin.database();
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('📝 Running in mock mode');
    return null;
  }
};

const db = initializeFirebase();

module.exports = { db, admin };
