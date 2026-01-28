require('dotenv').config();
require('dotenv').config();
require('dotenv').config();
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { connectDB, Inspection, Step } = require('./db');
const { calculateHash } = require('./cryptoUtils');

const app = express();
const PORT = 3001;

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'vehicle-inspection',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

app.use(cors({
    origin: '*', // Allow all origins for Vercel deployment
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("Database connection failure:", err);
        res.status(500).json({ error: "Database connection failed" });
    }
});
// app.use('/uploads', express.static(uploadDir)); // Removed local static serve

// --- API ROUTES ---
app.get('/', (req, res) => {
    res.send('Vehicle Inspection System API is Running. Use /api/inspections to interact.');
});

// Expects multipart/form-data: inspector_name, vehicle_id, password, inspector_badge_id, engine_number, model_number, chassis_number, selfie (file), id_card (file), rc_photo (file)
app.post('/api/inspections', upload.fields([
    { name: 'selfie', maxCount: 1 },
    { name: 'id_card', maxCount: 1 },
    { name: 'rc_photo', maxCount: 1 }
]), async (req, res) => {
    const { inspector_name, vehicle_id, password, inspector_badge_id, engine_number, model_number, chassis_number } = req.body;
    const start_time = new Date().toISOString();

    // File checks
    if (!req.files || !req.files['selfie'] || !req.files['id_card'] || !req.files['rc_photo']) {
        return res.status(400).json({ error: "Selfie, ID Card, and RC Photo are all required" });
    }

    // Cloudinary returns the full URL in `path`
    const inspector_selfie_url = req.files['selfie'][0].path;
    const inspector_id_card_url = req.files['id_card'][0].path;
    const inspector_rc_url = req.files['rc_photo'][0].path;

    try {
        const newInspection = new Inspection({
            inspector_name,
            vehicle_id,
            inspector_badge_id,
            engine_number,
            model_number,
            chassis_number,
            start_time,
            password,
            inspector_selfie_url,
            inspector_id_card_url,
            inspector_rc_url
        });
        const saved = await newInspection.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Record Inspection Step (With Photo Evidence)
// Expects multipart/form-data: step_name, result, note, latitude, longitude, photo (file)
app.post('/api/inspections/:id/steps', upload.single('photo'), async (req, res) => {
    const inspection_id = req.params.id;
    const { step_name, result, note, latitude, longitude } = req.body;
    const timestamp = new Date().toISOString();

    // File check
    if (!req.file) {
        return res.status(400).json({ error: "Evidence photo is required" });
    }
    const photo_url = req.file.path;

    try {
        // Get the last step to find the previous hash
        const lastStep = await Step.findOne({ inspection_id }).sort({ _id: -1 });

        // Initial hash for the first step is the hash of the inspection ID
        const previous_hash = lastStep ? lastStep.current_hash : calculateHash(inspection_id.toString());

        // Create data payload for current hash (INCLUDES DATA + PHOTO URL)
        const dataToHash = {
            inspection_id,
            step_name,
            result,
            note,
            timestamp, // The timestamp of reception
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            photo_url,
            previous_hash
        };

        const current_hash = calculateHash(dataToHash);

        const newStep = new Step({
            inspection_id,
            step_name,
            result,
            note,
            timestamp,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            photo_url,
            previous_hash,
            current_hash
        });

        const saved = await newStep.save();
        res.json({ ...dataToHash, current_hash, id: saved._id });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Complete & Seal Inspection
app.post('/api/inspections/:id/seal', async (req, res) => {
    const inspection_id = req.params.id;
    try {
        const lastStep = await Step.findOne({ inspection_id }).sort({ _id: -1 });
        if (!lastStep) return res.status(400).json({ error: "Cannot seal empty inspection" });

        const final_hash = lastStep.current_hash;

        await Inspection.findByIdAndUpdate(inspection_id, {
            status: 'COMPLETED',
            final_hash: final_hash
        });

        res.json({ success: true, final_hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get Inspection & Steps
app.get('/api/inspections/:id', async (req, res) => {
    const inspection_id = req.params.id;
    try {
        const inspection = await Inspection.findById(inspection_id);
        if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

        const steps = await Step.find({ inspection_id }).sort({ _id: 1 });
        res.json({ inspection, steps });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. List All Inspections
app.get('/api/inspections', async (req, res) => {
    try {
        const inspections = await Inspection.find().sort({ _id: -1 });
        res.json(inspections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Delete Inspection (Password Protected Check could be added here)
app.delete('/api/inspections/:id', async (req, res) => {
    const inspection_id = req.params.id;
    try {
        // In a real app we would verify the password here first!
        await Step.deleteMany({ inspection_id });
        await Inspection.findByIdAndDelete(inspection_id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
