import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import CameraCapture from './CameraCapture';

const Dashboard = ({ onLogout }) => {
    const [inspections, setInspections] = useState([]);
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [inspectorName, setInspectorName] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [inspectorBadgeId, setInspectorBadgeId] = useState('');
    const [engineNumber, setEngineNumber] = useState('');
    const [modelNumber, setModelNumber] = useState('');
    const [chassisNumber, setChassisNumber] = useState('');
    const [password, setPassword] = useState('');
    const [selfie, setSelfie] = useState(null);
    const [idCardPhoto, setIdCardPhoto] = useState(null);
    const [rcPhoto, setRcPhoto] = useState(null);
    const [submissionError, setSubmissionError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetch(`${API_URL}/api/inspections`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setInspections(data);
                } else {
                    console.error("API returned non-array:", data);
                    setInspections([]); // Fallback to empty array
                }
            })
            .catch(err => {
                console.error('Network/Server Error:', err);
                setInspections([]);
            });
    }, []);

    const handleStartInspection = async (e) => {
        e.preventDefault();
        if (!inspectorName || !vehicleId || !password || !selfie || !inspectorBadgeId || !idCardPhoto || !rcPhoto || !engineNumber || !modelNumber || !chassisNumber) {
            setSubmissionError("All fields (Selfie, ID Card, RC Photo, Vehicle Details) are required.");
            return;
        }

        const formData = new FormData();
        formData.append('inspector_name', inspectorName);
        formData.append('vehicle_id', vehicleId);
        formData.append('inspector_badge_id', inspectorBadgeId);
        formData.append('engine_number', engineNumber);
        formData.append('model_number', modelNumber);
        formData.append('chassis_number', chassisNumber);
        formData.append('password', password);
        formData.append('selfie', selfie);
        formData.append('id_card', idCardPhoto);
        formData.append('rc_photo', rcPhoto);

        try {
            const res = await fetch(`${API_URL}/api/inspections`, {
                method: 'POST',
                body: formData
            });

            const responseText = await res.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("Server returned non-JSON response:", responseText);
                throw new Error("Server Error: " + responseText.substring(0, 100)); // Show start of HTML error
            }

            if (data.error) throw new Error(data.error);

            navigate(`/inspect/${data.id}`);
        } catch (err) {
            console.error(err);
            setSubmissionError(err.message || "Failed to start inspection.");
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header - Only show 'New' button if we have inspections (otherwise show it in center) */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Vehicle Inspection System</h1>
                    <p className="text-gray-400">Tamper-Evident Inspection Records</p>
                </div>
                <div className="flex items-center gap-4">
                    {inspections.length > 0 && !isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus size={20} /> New Inspection
                        </button>
                    )}
                    <button
                        onClick={onLogout}
                        className="bg-red-900/40 hover:bg-red-900/60 text-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {isCreating && (
                <div className="glass-panel mb-8 animate-fade-in">
                    <h2 className="text-xl font-bold mb-4">Start New Inspection</h2>
                    {submissionError && <div className="p-3 mb-4 bg-red-900/30 border border-red-500/50 rounded text-red-200">{submissionError}</div>}

                    <form onSubmit={handleStartInspection}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-300">Inspector Name</label>
                                    <input
                                        value={inspectorName}
                                        onChange={e => setInspectorName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-300">Inspector ID / Badge #</label>
                                    <input
                                        value={inspectorBadgeId}
                                        onChange={e => setInspectorBadgeId(e.target.value)}
                                        placeholder="e.g. INS-8821"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-300">Vehicle ID / License Plate</label>
                                    <input
                                        value={vehicleId}
                                        onChange={e => setVehicleId(e.target.value)}
                                        placeholder="e.g. KA01AB1234"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-gray-300">Engine Number</label>
                                        <input
                                            value={engineNumber}
                                            onChange={e => setEngineNumber(e.target.value)}
                                            placeholder="Engine No."
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-gray-300">Model Number</label>
                                        <input
                                            value={modelNumber}
                                            onChange={e => setModelNumber(e.target.value)}
                                            placeholder="Model No."
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-gray-300">Chassis Number</label>
                                        <input
                                            value={chassisNumber}
                                            onChange={e => setChassisNumber(e.target.value)}
                                            placeholder="Chassis No."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-300">Set Report Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Secret Password for this Report"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <CameraCapture
                                    label="1. Inspector Selfie (Required)"
                                    onCapture={(file) => setSelfie(file)}
                                />
                                <CameraCapture
                                    label="2. Photo of ID Card (Required)"
                                    onCapture={(file) => setIdCardPhoto(file)}
                                />
                                <CameraCapture
                                    label="3. Registration Certificate (RC) (Required)"
                                    onCapture={(file) => setRcPhoto(file)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-8 border-t border-slate-700 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="bg-gray-600 text-white hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-success">
                                Start Session
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {inspections.map(insp => (
                    <div key={insp.id} className="glass-panel flex justify-between items-center hover:bg-slate-800 transition-colors">
                        <div>
                            <h3 className="text-xl font-bold">{insp.vehicle_id}</h3>
                            <div className="text-sm text-gray-400 flex gap-4 mt-1">
                                <span className="flex items-center gap-1"><UserIcon /> {insp.inspector_name}</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {new Date(insp.start_time).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`status-badge ${insp.status === 'COMPLETED' ? 'status-verified' : 'bg-blue-900 text-blue-200'}`}>
                                {insp.status}
                            </span>
                            <Link to={insp.status === 'COMPLETED' ? `/report/${insp.id}` : `/inspect/${insp.id}`}>
                                <button className="bg-slate-700 hover:bg-slate-600 p-2 rounded-full">
                                    <FileText size={20} />
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Empty State Hero */}
                {!isCreating && inspections.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center p-12 min-h-[60vh] animate-fade-in glass-panel border-none bg-transparent shadow-none backdrop-filter-none">
                        <div className="bg-white/10 p-8 rounded-full mb-8 shadow-inner ring-1 ring-white/20">
                            <FileText size={64} className="text-blue-300 opacity-80" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                            No Inspections Found
                        </h2>
                        <p className="text-blue-200/70 max-w-lg mb-10 text-lg leading-relaxed">
                            Start a new verifiable inspection session to create an immutable, tamper-evident record on the secure ledger.
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="btn-primary flex items-center gap-3 px-10 py-5 text-xl font-bold shadow-2xl hover:scale-105 transition-transform"
                        >
                            <Plus size={28} /> Start New Inspection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

export default Dashboard;
