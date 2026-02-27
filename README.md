🛡️ Vehicle Inspection System (VIS)
Next-Generation Digital Inspection & Compliance PlatformVIS is a high-integrity, full-stack platform designed to eliminate fraud in vehicle inspections. By implementing a SHA-256 cryptographic data chain, the system ensures that every inspection record—from the initial selfie to the final RC scan—is immutable and audit-ready.🚀 Technical HighlightsCryptographic Integrity: Uses a "block-style" hashing mechanism where each inspection step contains the hash of the previous step.Proof of Presence: Mandatory GNSS (Global Navigation Satellite System) logging to prevent "armchair" inspections.Rich Media Chain: Real-time upload to Cloudinary with metadata injection for tamper-proof evidence.Modern Stack: Built on React 19 for peak frontend performance and Node.js for scalable asynchronous processing.🛠️ Technology StackLayerTechnologyFrontendReact 19, Vite, Tailwind CSS, Lucide-ReactBackendNode.js, Express.jsDatabaseMongoDB (Primary), SQLite3 (Local/Edge Cache)StorageCloudinary API (Image CDN)SecuritySHA-256 Hashing, JWT Authentication📂 Project StructurePlaintextvehicle-inspection-system/
├── client/                # React 19 Frontend
│   ├── src/components     # UI Components
│   └── src/hooks          # Hardware/Geolocation hooks
├── server/                # Node.js Backend
│   ├── models/            # Mongoose Schemas
│   ├── routes/            # API Endpoints
│   └── utils/             # Crypto & Hash Logic
└── docs/                  # API Documentation
⚙️ Installation & SetupPrerequisitesNode.js v18.0.0+MongoDB Instance (Local or Atlas)Cloudinary Account for media hosting1. Clone & InstallBashgit clone <repository-url>
cd Vehicle-Inspection-System
npm run install-all # If a root package.json exists, otherwise install in /client and /server
2. Environment ConfigurationCreate a .env file in the /server directory:Code snippetPORT=5000
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
JWT_SECRET=your_secure_random_string
3. ExecutionStart Backend:Bashcd server && npm start
Start Frontend:Bashcd client && npm run dev
🏗️ System ArchitectureCapture: React hooks interface with device camera and GPS.Hash: Data is packaged with a timestamp and previous step hash.Store: Images move to Cloudinary; metadata and hashes move to MongoDB.Certify: A PDF is generated, pulling the verified chain to prove no data was altered post-inspection.💼 Use CasesInsurance: Pre-policy inspections to prevent pre-existing damage claims.Fleet: Daily safety checklists for logistics compliance.Resale: Verified "Health Certificates" for used car marketplaces.🤝 ContributingFork the Project.Create your Feature Branch (git checkout -b feature/AmazingFeature).Commit your Changes (git commit -m 'Add AmazingFeature').Push to the Branch (git push origin feature/AmazingFeature).Open a Pull Request.
