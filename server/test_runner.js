const http = require('http');

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTest() {
    console.log("=== STARTING HAPPY PATH TEST ===");

    // 1. Start Inspection
    const insp = await request('POST', '/inspections', { inspector_name: "Test Bot", vehicle_id: "TEST-001" });
    console.log("1. Started Inspection:", insp.id);

    // 2. Add Steps
    const s1 = await request('POST', `/inspections/${insp.id}/steps`, { step_name: "Brakes", result: "PASS", note: "Good" });
    console.log("2. Step 1 Recorded. Hash:", s1.current_hash.substring(0, 20) + "...");

    const s2 = await request('POST', `/inspections/${insp.id}/steps`, { step_name: "Tires", result: "PASS", note: "New" });
    console.log("3. Step 2 Recorded. Hash:", s2.current_hash.substring(0, 20) + "...");

    // 3. Seal
    const sealed = await request('POST', `/inspections/${insp.id}/seal`, {});
    console.log("4. Sealed Inspection. Final Hash:", sealed.final_hash.substring(0, 20) + "...");

    // 4. Verify Fetch
    const report = await request('GET', `/inspections/${insp.id}`);
    console.log("5. Fetched Report. Inspector:", report.inspection.inspector_name);

    if (report.inspection.status === 'COMPLETED') {
        console.log("SUCCESS: Inspection completed and retrievable.");
    } else {
        console.error("FAIL: Inspection status invalid.");
    }
}

runTest();
