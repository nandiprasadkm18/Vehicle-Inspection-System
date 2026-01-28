import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Check, X, ArrowLeft, MapPin, ExternalLink, Trash2, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Report = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [verificationResult, setVerificationResult] = useState('PENDING'); // PENDING, SUCCESS, TAMPERED
    const reportRef = useRef(null);

    const handleDelete = async () => {
        const inputPwd = prompt("Enter the Inspection Password to DELETE:");
        if (!inputPwd) return;

        if (!window.confirm("WARNING: This will permanently destroy this record.")) return;

        try {
            await fetch(`http://localhost:3001/api/inspections/${id}`, { method: 'DELETE' });
            navigate('/');
        } catch (e) {
            console.error(e);
            alert("Delete failed");
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: true,
                windowHeight: reportRef.current.scrollHeight + 100,
                onclone: (clonedDoc) => {
                    const clonedContent = clonedDoc.querySelector('.bg-\\[\\#0f172a\\]');
                    if (clonedContent) {
                        clonedContent.classList.add('pdf-print-mode');
                        clonedContent.classList.remove('bg-[#0f172a]'); // Remove dark bg
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF with custom height to fit entire report on one long page
            const pdf = new jsPDF('p', 'mm', [imgWidth, pageHeight]);

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight);
            pdf.save(`Inspection-Report-${id.substring(0, 8)}.pdf`);
        } catch (err) {
            console.error("PDF Fail", err);
            alert("Failed to generate PDF. Check console for details.");
        }
    };

    useEffect(() => {
        fetch(`http://localhost:3001/api/inspections/${id}`)
            .then(res => res.json())
            .then(fetchedData => {
                setData(fetchedData);
                if (fetchedData && fetchedData.inspection.status === 'COMPLETED') {
                    setVerificationResult('SUCCESS');
                } else {
                    setVerificationResult('PENDING');
                }
            });
    }, [id]);

    if (!data) return <div className="p-8 text-center">Loading Report...</div>;

    const { inspection, steps } = data;
    const verificationUrl = window.location.href;

    return (
        <div className="animate-fade-in pb-12">
            <div className="mb-6 flex justify-between items-center no-print">
                <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 text-blue-400 hover:text-white bg-blue-900/20 hover:bg-blue-600 px-3 py-2 rounded transition-colors"
                    >
                        <Download size={16} /> Download PDF
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 text-red-400 hover:text-white bg-red-900/20 hover:bg-red-600 px-3 py-2 rounded transition-colors"
                    >
                        <Trash2 size={16} /> Delete Report
                    </button>
                </div>
            </div>

            {/* REPORT CONTAINER FOR PDF CAPTURE */}
            <div ref={reportRef} className="bg-[#0f172a] p-8 rounded-xl border border-slate-700">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Main Info Card */}
                    <div className="lg:col-span-2 glass-panel border-l-4 border-l-blue-500 relative overflow-hidden">
                        {verificationResult === 'SUCCESS' && (
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShieldCheck size={120} />
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row justify-between items-start relative z-10 gap-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Inspection Report #{String(inspection.id).substring(0, 8)}...</h1>
                                <div className="space-y-1 mt-4">
                                    <p className="text-gray-400">Vehicle: <span className="text-white font-mono text-lg">{inspection.vehicle_id}</span></p>
                                    <p className="text-gray-400">Inspector: <span className="text-white">{inspection.inspector_name}</span></p>
                                    {inspection.inspector_badge_id && (
                                        <p className="text-gray-400">Badge ID: <span className="text-white font-mono">{inspection.inspector_badge_id}</span></p>
                                    )}
                                    <p className="text-gray-400">Date: <span className="text-white">{new Date(inspection.start_time).toLocaleDateString()}</span></p>

                                    <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-1">
                                        <p className="text-gray-400">Engine No: <span className="text-white font-mono">{inspection.engine_number || 'N/A'}</span></p>
                                        <p className="text-gray-400">Model No: <span className="text-white font-mono">{inspection.model_number || 'N/A'}</span></p>
                                        <p className="text-gray-400">Chassis No: <span className="text-white font-mono">{inspection.chassis_number || 'N/A'}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Inspector Identity Display */}
                            <div className="flex flex-col gap-4">
                                {inspection.inspector_selfie_url && (
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs uppercase text-gray-500 mb-2">Verified Inspector</span>
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/50">
                                            <img
                                                src={`http://localhost:3001${inspection.inspector_selfie_url}`}
                                                alt="Inspector"
                                                className="w-full h-full object-cover"
                                                crossOrigin="anonymous"
                                            />
                                        </div>
                                    </div>
                                )}
                                {inspection.inspector_id_card_url && (
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs uppercase text-gray-500 mb-2">ID Card</span>
                                        <div className="w-32 h-20 rounded overflow-hidden border border-gray-600">
                                            <img
                                                src={`http://localhost:3001${inspection.inspector_id_card_url}`}
                                                alt="ID Card"
                                                className="w-full h-full object-cover"
                                                crossOrigin="anonymous"
                                            />
                                        </div>
                                    </div>
                                )}
                                {inspection.inspector_rc_url && (
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs uppercase text-gray-500 mb-2">RC Card</span>
                                        <div className="w-32 h-20 rounded overflow-hidden border border-gray-600">
                                            <img
                                                src={`http://localhost:3001${inspection.inspector_rc_url}`}
                                                alt="RC Card"
                                                className="w-full h-full object-cover"
                                                crossOrigin="anonymous"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-right">
                                <div className="mb-2 text-sm text-gray-500 uppercase tracking-wider">Verification Status</div>
                                {verificationResult === 'SUCCESS' ? (
                                    <div className="flex items-center gap-2 text-green-400 text-xl font-bold bg-green-900/30 px-4 py-2 rounded-lg border border-green-500/30">
                                        <ShieldCheck /> VERIFIED
                                    </div>
                                ) : (
                                    <div className="text-yellow-500 bg-yellow-900/20 px-4 py-2 rounded">
                                        IN PROGRESS
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* QR Code Card */}
                    <div className="glass-panel flex flex-col items-center justify-center text-center">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Scan to Verify</h3>
                        <div className="bg-white p-4 rounded-lg mb-4">
                            <QRCodeSVG value={verificationUrl} size={150} />
                        </div>
                        <p className="text-xs text-gray-500">Scan this code to view the immutable digital record of this inspection.</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    <h2 className="text-xl font-bold mb-2">Inspection Log</h2>
                    {steps.map((step, idx) => (
                        <div key={idx} className="glass-panel p-4 flex flex-col md:flex-row gap-6 items-start break-inside-avoid">
                            {/* Status Icon */}
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step.result === 'PASS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {step.result === 'PASS' ? <Check size={16} /> : <X size={16} />}
                            </div>

                            {/* Details */}
                            <div className="flex-1 w-full">
                                <div className="flex justify-between mb-1">
                                    <h3 className="font-bold text-lg">{step.step_name}</h3>
                                    <span className="text-xs font-mono text-gray-500">{new Date(step.timestamp).toLocaleTimeString()}</span>
                                </div>

                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-gray-300">{step.note || <span className="italic text-gray-600">No notes</span>}</p>

                                    {step.latitude && (
                                        <div className="flex items-center gap-1 text-xs text-gray-400 px-2 py-1 rounded">
                                            <MapPin size={12} />
                                            {step.latitude.toFixed(4)}, {step.longitude.toFixed(4)}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-black/30 p-2 rounded text-xs font-mono text-gray-500 break-all mt-2">
                                    <div className="flex gap-2">
                                        <span className="text-gray-600">HASH:</span> {step.current_hash}
                                    </div>
                                </div>
                            </div>

                            {/* Evidence Photo */}
                            {step.photo_url && (
                                <div className="flex-shrink-0 w-full md:w-32 h-32 bg-black/50 rounded-lg overflow-hidden border border-gray-700">
                                    <img
                                        src={`http://localhost:3001${step.photo_url}`}
                                        alt="Evidence"
                                        className="w-full h-full object-cover"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {inspection.status === 'COMPLETED' && (
                    <div className="mt-8 text-center text-gray-500 font-mono text-xs">
                        Final Seal Hash: {inspection.final_hash}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Report;
