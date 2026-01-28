const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'inspection.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath, err);
    } else {
        console.log('Connected to SQLite database at ' + dbPath);
    }
});

db.serialize(() => {
    // Inspections Table
    db.run(`CREATE TABLE IF NOT EXISTS inspections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inspector_name TEXT,
        vehicle_id TEXT,
        inspector_badge_id TEXT,
        start_time TEXT,
        status TEXT DEFAULT 'IN_PROGRESS',
        final_hash TEXT,
        inspector_selfie_url TEXT,
        inspector_id_card_url TEXT,
        password TEXT
    )`);

    // Steps Table
    db.run(`CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inspection_id INTEGER,
        step_name TEXT,
        result TEXT,
        note TEXT,
        timestamp TEXT,
        latitude REAL,
        longitude REAL,
        photo_url TEXT,
        previous_hash TEXT,
        current_hash TEXT,
        FOREIGN KEY(inspection_id) REFERENCES inspections(id)
    )`);
});

// Helper wrappers for Async/Await usage
db.runAsync = function (sql, params) {
    return new Promise((resolve, reject) => {
        this.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

db.getAsync = function (sql, params) {
    return new Promise((resolve, reject) => {
        this.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

db.allAsync = function (sql, params) {
    return new Promise((resolve, reject) => {
        this.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = db;
