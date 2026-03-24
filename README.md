# 🚗 Vehicle Inspection System (VIS)

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5.0-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-V2-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

## ✨ Overview

The **Vehicle Inspection System (VIS)** is a high-integrity, full-stack digital platform designed to modernize and secure the vehicle inspection process. By leveraging **cryptographic data chaining** and rich media evidence, VIS ensures that every inspection record is authentic, tamper-proof, and audit-ready.

It provides a seamless 5-step workflow for inspectors, generating a secure, verifiable chain of evidence for every vehicle assessed.

---

## 🚀 Key Features

*   **🛡️ Cryptographic Integrity**: Every inspection step is linked via an immutable **SHA-256 hash chain**. If any part of the record is tampered with, the chain breaks, highlighting the fraud.
*   **📸 Multi-Step Evidence Capture**: Mandatory real-time capture of:
    1.  **Selfie**: Verify the inspector's identity.
    2.  **ID Card**: Link the inspection to a valid document.
    3.  **Vehicle Photo**: Broad overview of the car.
    4.  **RC Document**: Verification of ownership.
    5.  **Chassis Number**: Unique vehicle identification.
*   **🌍 Geolocation Tracking**: Automatic GNSS logging (latitude/longitude) for every step to verify the physical presence at the vehicle.
*   **📄 Professional PDF Reports**: One-click generation of comprehensive certificates including all high-res photos and cryptographic stamps.
*   **📡 Hybrid Data Storage**: Uses **MongoDB** for primary storage and **SQLite** for edge/local support.

---

## 📂 Project Structure

```text
Vehicle-Inspection-System/
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── App.jsx        # Main routing and logic
│   │   └── main.jsx       # Entry point
│   └── package.json
├── server/                # Node.js + Express Backend
│   ├── uploads/           # Local storage for temp images
│   ├── server.js          # Express server entry point
│   ├── db.js             # MongoDB connection logic
│   ├── db_sqlite.js       # SQLite connection logic
│   ├── cryptoUtils.js     # SHA-256 chaining core logic
│   ├── verify_tamper.js   # Integrity check scripts
│   └── package.json
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS, Lucide-React |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB (Mongoose), SQLite3 |
| **Auth/Certs** | SHA-256 Cryptographic validation |
| **Storage** | Cloudinary (Image CDN) |

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **MongoDB**: A running instance (local or Atlas)
- **Cloudinary**: A free account for image hosting

### Installation

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/nandiprasadkm18/Vehicle-Inspection-System.git
    cd Vehicle-Inspection-System
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/vis
    CLOUDINARY_CLOUD_NAME=your_name
    CLOUDINARY_API_KEY=your_key
    CLOUDINARY_API_SECRET=your_secret
    ```

3.  **Setup Frontend**
    ```bash
    cd ../client
    npm install
    ```

### Running the App

- **Start Backend**: 
  ```bash
  cd server
  node server.js
  ```
- **Start Frontend**: 
  ```bash
  cd client
  npm run dev
  ```

---

## 🔒 Cryptographic Verification

To verify the integrity of the data manually, you can use the built-in scripts in the `server` directory:

```bash
cd server
node verify_tamper.js  # Checks for any modifications in the inspection database
```

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by [Nandiprasad KM](https://github.com/nandiprasadkm18)**
