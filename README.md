# 🛡️ Vehicle Inspection System (VIS)
### *Next-Generation Digital Inspection & Compliance Platform*

**VIS** is a high-integrity, full-stack platform designed to eliminate fraud in vehicle inspections. By implementing a **SHA-256 cryptographic data chain**, the system ensures that every inspection record—from the initial selfie to the final RC scan—is immutable and audit-ready.

---

## 🚀 Technical Highlights

* **Cryptographic Integrity**: Implements a "block-style" hashing mechanism where each inspection step contains the hash of the previous step.
* **Proof of Presence**: Mandatory GNSS (Global Navigation Satellite System) logging to prevent "armchair" inspections.
* **Rich Media Chain**: Real-time upload to Cloudinary with metadata injection for tamper-proof evidence.
* **Modern Stack**: Built on **React 19** for peak frontend performance and **Node.js** for scalable asynchronous processing.



---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide-React |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Primary), SQLite3 (Edge support) |
| **Storage** | Cloudinary API (High-performance Image CDN) |
| **Security** | SHA-256 Hashing, JWT Authentication |

---
user

password
## 📂 Project Structure

```text
vehicle-inspection-system/
├── client/                # React 19 Frontend
│   ├── src/components     # UI Components
│   └── src/hooks          # Hardware/Geolocation hooks
├── server/                # Node.js Backend
│   ├── models/            # Mongoose Schemas
│   ├── routes/            # API Endpoints
│   └── utils/             # Crypto & Hash Logic
└── docs/                  # API Documentation

🏗️ Architecture & Workflow
Capture: React hooks interface with device camera and GPS.

Hash: Data is packaged with a timestamp and previous step hash.

Store: Images move to Cloudinary; metadata and hashes move to MongoDB.

Certify: A PDF is generated, pulling the verified chain to prove no data was altered post-inspection.

⚙️ Installation & Setup
Prerequisites
Node.js v18.0.0+

MongoDB Instance (Local or Atlas)

Cloudinary Account for media hosting

1. Clone & Install
Bash
git clone <repository-url>
cd Vehicle-Inspection-System
# Install dependencies for both folders
cd server && npm install
cd ../client && npm install
2. Environment Configuration
Create a .env file in the /server directory:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
JWT_SECRET=your_secure_random_string
3. Execution
Start Backend Server:

Bash
cd server
node server.js
Start Frontend Development:

Bash
cd client
npm run dev
💼 Professional Use Cases
Insurance Underwriting: Trusted pre-insurance vehicle health audits.

Fleet Management: Lifecycle safety checks for logistics and rental fleets.

Pre-Owned Sales: Building buyer confidence through certified inspection reports.

Regulatory Compliance: Tamper-proof governmental safety inspections.
