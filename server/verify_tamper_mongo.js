const mongoose = require('mongoose');
const { Step } = require('./db');

// Reuse existing DB connection logic implicitly via require('./db') 
// but we need to wait for connection.

setTimeout(async () => {
    console.log("--- TAMPERING SIMULATION (MONGO) ---");

    try {
        // 1. Find the last step
        const lastStep = await Step.findOne().sort({ _id: -1 });

        if (!lastStep) {
            console.log("No steps found to tamper with.");
            process.exit(0);
        }

        console.log(`Original Step [ID: ${lastStep._id}]: ${lastStep.step_name} -> ${lastStep.result}`);

        // 2. Flip the result
        const newResult = lastStep.result === 'PASS' ? 'FAIL' : 'PASS';

        console.log(`Tampering: Changing result to ${newResult}...`);

        lastStep.result = newResult;
        // We use .updateOne to avoid hooks if we had any, or just save. 
        // Note: .save() in Mongoose might NOT trigger re-hashing unless we coded it to.
        // But here we explicitly WANT to corrupt data without updating the hash.
        // So we update the field but keep current_hash SAME.

        await Step.updateOne({ _id: lastStep._id }, { result: newResult });

        console.log("Tampering complete. Data changed, Hash remains old.");
        console.log("Run the verification in the app to see the alert.");

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}, 3000); // Wait for DB connection from db.js
