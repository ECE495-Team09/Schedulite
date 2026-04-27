// backend/src/server.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import admin from 'firebase-admin';
import { startReminderScheduler } from "./jobs/reminderScheduler.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

// Prefer service account JSON provided via env var in CI/CD or use
// Application Default Credentials when running on GCP (Cloud Run).
if (process.env.FCM_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FCM_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Initialized Firebase admin from FIREBASE_SERVICE_ACCOUNT env');
  } catch (err) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env:', err);
    process.exit(1);
  }
} else {
  // On GCP services (Cloud Run) ADC should be available if the service
  // account attached to the service has appropriate permissions.
  admin.initializeApp();
  console.log('✅ Initialized Firebase admin using Application Default Credentials');
}


console.log('🚀Starting server...');

//Connecting to MongoDB and starting the app
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅MongoDB connection SUCCESSFULL');
        startReminderScheduler();
        app.listen(PORT, HOST, () => console.log(`✅Server listening on ${HOST}:${PORT}`));
    })
    .catch((err) => {
        console.error('❌MongoDB connection FAILED:', err)
        process.exit(1);
    });