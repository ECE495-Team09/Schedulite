// backend/src/server.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import admin from 'firebase-admin';
import { startReminderScheduler } from "./jobs/reminderScheduler.js";

import fs from "fs";


dotenv.config();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

const serviceAccount = JSON.parse(process.env.FCM_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


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