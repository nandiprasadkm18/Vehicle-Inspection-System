import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, ShieldCheck, MapPin, Camera } from 'lucide-react';
import CameraCapture from './CameraCapture';

const STEPS = [
    'Braking System',
    'Lights & Signals',
    'Tires & Wheels',
    'Engine & Fluids',
    'Interior Safety',
    'Exterior Body'
];

const InspectionWizard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [geoError, setGeoError] = useState(null);

    // Camera State
    const [showCamera, setShowCamera] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [pendingResult, setPendingResult] = useState(null); // 'PASS' or 'FAIL' waiting for photo

    // Check if we need to resume
    useEffect(() => {
        fetch(`http://localhost:3001/api/inspections/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.inspection.status === 'COMPLETED') {
                    navigate(`/report/${id}`);
                    return;
                }
                const doneCount = data.steps.length;
                if (doneCount < STEPS.length) {
                    setCurrentStepIndex(doneCount);
                } else {
                    setCurrentStepIndex(STEPS.length);
                }
                setCompletedSteps(data.steps);
            });
    }, [id, navigate]);

    const getParams = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ latitude: 0, longitude: 0 }); // Default to 0 if not supported
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                (err) => {
                    console.error("Geo Error", err);
                    setGeoError("Location access denied. Proceeding with null coords.");
                    resolve({ latitude: 0, longitude: 0 });
                }
            );
        });
    }

    // Step 1: User clicks Pass/Fail -> Open Camera
    const initiateStep = (result) => {
        setPendingResult(result);
        setShowCamera(true);
    };

    // Step 2: User takes photo -> Submit entire step
    const handlePhotoCaptured = async (file) => {
        setCapturedPhoto(file);
        setShowCamera(false);
        await submitStep(file, pendingResult);
    };

    const submitStep = async (photoFile, result) => {
        setLoading(true);
        setGeoError(null);
        const stepName = STEPS[currentStepIndex];

        // Get Location
        const { latitude, longitude } = await getParams();

        const formData = new FormData();
        formData.append('step_name', stepName);
        formData.append('result', result);
        formData.append('note', note);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        formData.append('photo', photoFile);

        try {
            const res = await fetch(`http://localhost:3001/api/inspections/${id}/steps`, {
                method: 'POST',
                body: formData
            });
            const newStep = await res.json();

            if (newStep.error) throw new Error(newStep.error);

            setCompletedSteps([...completedSteps, newStep]);
            setNote('');
            setCapturedPhoto(null);
            setPendingResult(null);
            setCurrentStepIndex(prev => prev + 1);
        } catch (err) {
            console.error(err);
            alert("Error recording step: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSeal = async () => {
        setLoading(true);
        try {
            await fetch(`http://localhost:3001/api/inspections/${id}/seal`, {
                method: 'POST'
            });
            navigate(`/report/${id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const progress = (currentStepIndex / STEPS.length) * 100;

    return (
        <div className="max-w-2xl mx-auto animate-fade-in pt-8">
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2 text-gray-400">
                    <span>Inspection Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {geoError && (
                <div className="mb-4 bg-yellow-900/30 text-yellow-200 border border-yellow-500/30 p-4 rounded text-center text-sm">
                    {geoError}
                </div>
            )}

            {currentStepIndex < STEPS.length ? (
                <div className="glass-panel text-center py-12">
                    <div className="flex items-center justify-center gap-2 mb-4 text-gray-500 text-xs uppercase tracking-widest">
                        <MapPin size={14} />
                        <span>Geotagging Active</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Step {currentStepIndex + 1}: {STEPS[currentStepIndex]}</h2>
                    <p className="text-gray-400 mb-8">Inspect the {STEPS[currentStepIndex].toLowerCase()} and record the result.</p>

                    {!showCamera ? (
                        <>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Add optional notes or observations..."
                                className="mb-8 max-w-md mx-auto"
                                rows={3}
                            />

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => initiateStep('FAIL')}
                                    disabled={loading}
                                    className="btn-danger flex items-center gap-2 px-8 py-4 text-lg"
                                >
                                    <X /> FAIL
                                </button>
                                <button
                                    onClick={() => initiateStep('PASS')}
                                    disabled={loading}
                                    className="btn-success flex items-center gap-2 px-8 py-4 text-lg"
                                >
                                    <Check /> PASS
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="animate-fade-in">
                            <h3 className="text-xl font-bold mb-4 text-blue-400">Evidence Required</h3>
                            <p className="text-sm text-gray-400 mb-4">Please take a photo to prove the condition of the {STEPS[currentStepIndex]}.</p>
                            <CameraCapture
                                label={`Proof for ${pendingResult}`}
                                onCapture={handlePhotoCaptured}
                            />
                            <button onClick={() => setShowCamera(false)} className="text-sm text-gray-500 hover:text-white mt-4 underline">
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass-panel text-center py-12">
                    <div className="text-green-400 mb-4 inline-block">
                        <ShieldCheck size={64} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Inspection Complete</h2>
                    <p className="text-gray-300 mb-8 max-w-md mx-auto">
                        All checks recorded with photo evidence and location. Sealing this report will permanently link your identity to these results.
                    </p>
                    <button
                        onClick={handleSeal}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 px-8 py-4 text-lg mx-auto"
                    >
                        Seal & Generate Report <ArrowRight />
                    </button>
                </div>
            )}

            {/* Chain Visualization */}
            <div className="mt-12">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Blockchain Evidence (Live)</h3>
                <div className="space-y-2">
                    {completedSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-4 text-sm font-mono text-gray-400 opacity-60">
                            <div className={`w-3 h-3 rounded-full ${step.result === 'PASS' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div className="truncate flex-1 flex justify-between">
                                <span>Hash: {step.current_hash.substring(0, 16)}...</span>
                                <span className="flex items-center gap-1"><Camera size={10} /> Evidence Stored</span>
                            </div>
                        </div>
                    ))}
                    {completedSteps.length === 0 && <p className="text-gray-600 italic">No events recorded yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default InspectionWizard;
