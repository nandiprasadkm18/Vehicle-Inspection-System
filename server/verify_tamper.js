const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { calculateHash } = require('./cryptoUtils');

const dbPath = path.resolve(__dirname, 'inspection.db');
const db = new sqlite3.Database(dbPath);

function runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function tamper() {
    console.log("--- TAMPERING SIMULATION ---");

    // 1. Find the last step (assuming there is data)
    db.get("SELECT * FROM steps ORDER BY id DESC LIMIT 1", async (err, row) => {
        if (!row) {
            console.log("No steps found to tamper with.");
            return;
        }

        console.log(`Original Step [ID: ${row.id}]: ${row.step_name} -> ${row.result}`);

        // 2. Flip the result (PASS -> FAIL or vice versa)
        const newResult = row.result === 'PASS' ? 'FAIL' : 'PASS';

        console.log(`Tampering: Changing result to ${newResult}...`);

        await runQuery(
            `UPDATE steps SET result = ? WHERE id = ?`,
            [newResult, row.id]
        );

        console.log("Tampering complete. The hash chain should now be broken because 'current_hash' in the DB still matches the OLD data, but the data has changed.");
        console.log("Run the verification in the app to see the alert.");
    });
}

tamper();
