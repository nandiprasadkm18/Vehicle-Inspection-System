const http = require('http');
const crypto = require('crypto');

function calculateHash(data) {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(str).digest('hex');
}

function request(method, path) {
    return new Promise((resolve, reject) => {
        const options = { hostname: 'localhost', port: 3001, path: '/api' + path, method: method };
        http.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function verifyLastInspection() {
    console.log("=== VERIFYING INTEGRITY ===");
    // Get all
    const list = await request('GET', '/inspections');
    if (list.length === 0) { console.log("No inspections"); return; }

    // Check last one
    const id = list[list.length - 1].id;
    const data = await request('GET', `/inspections/${id}`);

    const { inspection, steps } = data;
    console.log(`Checking Inspection #${inspection.id} (${inspection.vehicle_id})...`);

    let prevHash = calculateHash(inspection.id.toString());
    let valid = true;

    for (const step of steps) {
        // 1. Check Link
        if (step.previous_hash !== prevHash) {
            console.error(`[CRITICAL] Chain Broken at Step ${step.id} (${step.step_name})`);
            console.error(`   Expected Prev: ${prevHash}`);
            console.error(`   Found Prev:    ${step.previous_hash}`);
            valid = false;
        }

        // 2. Re-calculate Current Hash
        const dataToHash = {
            inspection_id: step.inspection_id.toString(), // Fix: DB might return int, but we hashed string or vice versa. server used string for ID? server.js:77: calculateHash(inspection_id.toString())
            // Wait, server.js used:
            // const inspection_id = req.params.id; // String from express
            // ... calculateHash(inspection_id.toString())

            // For step: 
            // const dataToHash = { inspection_id, step_name, result, note, timestamp, previous_hash };
            // Note: inspection_id from req.params is string.
            // In DB response, inspection_id is number. We must convert to string to match original hash input.

            // However, step.inspection_id from SQLite is number.
            step_name: step.step_name,
            result: step.result,
            note: step.note,
            timestamp: step.timestamp,
            previous_hash: step.previous_hash
        };

        // Important: object key order must match server.js
        // Server: { inspection_id, step_name, result, note, timestamp, previous_hash }
        // We constructed it same order above.

        const calculated = calculateHash({
            inspection_id: step.inspection_id.toString(),
            step_name: step.step_name,
            result: step.result,
            note: step.note,
            timestamp: step.timestamp,
            previous_hash: step.previous_hash
        });

        if (calculated !== step.current_hash) {
            console.error(`[CRITICAL] Data Modified at Step ${step.id}`);
            console.error(`   storedHash:    ${step.current_hash}`);
            console.error(`   calculated:    ${calculated}`);
            valid = false;
        }

        prevHash = step.current_hash;
    }

    if (valid) {
        console.log("✅ INSPECTION VALID. Chain is intact.");
    } else {
        console.log("❌ TAMPERING DETECTED. The digital evidence does not match the records.");
    }
}

verifyLastInspection();
