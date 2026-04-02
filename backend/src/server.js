// backend/src/server.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import admin from 'firebase-admin';

import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./schedulite_fcn.json", "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

dotenv.config();
const PORT = process.env.PORT || 5000;

console.log('🚀Starting server...');

//Connecting to MongoDB and starting the app
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅MongoDB connection SUCCESSFULL');
        app.listen(PORT, () => console.log(`✅Server listening on port ${PORT}`));
    })
    .catch((err) => {
        console.error('❌MongoDB connection FAILED:', err)
        process.exit(1);
    });