// backend/src/server.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

//Loading env variables
dotenv.config();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

console.log('🚀Starting server...');

//Connecting to MongoDB and starting the app
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅MongoDB connection SUCCESSFULL');
        app.listen(PORT, HOST, () => console.log(`✅Server listening on ${HOST}:${PORT}`));
    })
    .catch((err) => {
        console.error('❌MongoDB connection FAILED:', err)
        process.exit(1);
    });