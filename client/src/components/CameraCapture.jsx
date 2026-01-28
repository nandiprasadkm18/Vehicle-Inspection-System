import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

const CameraCapture = ({ onCapture, label = "Take Photo" }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera on mobile
            });
            setStream(mediaStream);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Could not access camera. Please allow permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    // Attach stream to video element when it becomes available
    React.useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const capture = useCallback(() => {
        if (!videoRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            setImage(URL.createObjectURL(blob));
            onCapture(file);
            stopCamera();
        }, 'image/jpeg', 0.8);
    }, [onCapture, stream]);

    const retake = () => {
        setImage(null);
        startCamera();
    };

    // Cleanup
    React.useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className="w-full max-w-md mx-auto mb-4 p-4 glass-panel border border-slate-600">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">{label}</h3>

            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

            {!image ? (
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                    {!stream ? (
                        <button onClick={startCamera} className="flex flex-col items-center gap-2 text-gray-400 hover:text-white">
                            <Camera size={48} />
                            <span>Start Camera</span>
                        </button>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <button
                                onClick={capture}
                                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
                            >
                                <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-transparent"></div>
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="relative">
                    <img src={image} alt="Captured" className="w-full rounded-lg" />
                    <button
                        onClick={retake}
                        className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white hover:bg-black/80"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default CameraCapture;
