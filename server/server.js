const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Inspection, Step } = require('./db');
const { calculateHash } = require('./cryptoUtils');

const app = express();
const PORT = 3001;

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
// Serve uploads statically
app.use('/uploads', express.static(uploadDir));

// --- API ROUTES ---

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

    const inspector_selfie_url = `/uploads/${req.files['selfie'][0].filename}`;
    const inspector_id_card_url = `/uploads/${req.files['id_card'][0].filename}`;
    const inspector_rc_url = `/uploads/${req.files['rc_photo'][0].filename}`;

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
    const photo_url = `/uploads/${req.file.filename}`;

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
