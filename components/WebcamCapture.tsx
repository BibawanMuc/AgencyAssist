
import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X, Check, RefreshCw, Loader2 } from 'lucide-react';

interface WebcamCaptureProps {
    onCapture: (base64Image: string) => void;
    onClose: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);




    const startCamera = async () => {
        setIsLoading(true);
        setError(null);

        // Security check
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                setError("Camera access requires HTTPS or localhost. Please check your connection.");
            } else {
                setError("Camera API not supported in this browser.");
            }
            setIsLoading(false);
            return;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsLoading(false);
        } catch (err: any) {
            console.error("Error accessing webcam:", err);
            // Fallback: try simple constraints
            try {
                const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(simpleStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = simpleStream;
                }
                setIsLoading(false);
            } catch (fallbackErr) {
                setError("Could not access camera. Please allow permissions in your browser settings.");
                setIsLoading(false);
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                // Determine source dimensions based on videoWidth/videoHeight
                // Note: videoWidth/videoHeight are intrinsic dimensions of the video stream
                const width = videoRef.current.videoWidth;
                const height = videoRef.current.videoHeight;

                canvasRef.current.width = width;
                canvasRef.current.height = height;
                context.drawImage(videoRef.current, 0, 0, width, height);

                const dataUrl = canvasRef.current.toDataURL('image/png');
                setCapturedImage(dataUrl);

                // Stop the camera immediately to turn off the light
                stopCamera();
            }
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const handleConfirm = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            onClose();
        }
    };

    useEffect(() => {
        setMounted(true);
        startCamera();
        return () => stopCamera();
    }, []);



    // ... (keep existing methods)

    // Render using Portal to avoid z-index/stacking context issues
    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 rounded-[2rem] p-6 w-full max-w-2xl shadow-2xl relative">
                {/* ... existing modal content ... */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <Camera className="w-6 h-6 text-indigo-500" />
                    Webcam Capture
                </h3>

                {error ? (
                    <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-3xl text-center text-red-400 space-y-4">
                        <div>
                            <p className="font-bold mb-2">Camera Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                        <button
                            onClick={startCamera}
                            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl font-bold transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {!stream && !capturedImage && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-[2rem]">
                                {isLoading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                        <p className="text-slate-400 font-bold">Requesting access...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-slate-400 font-bold">Camera inactive</p>
                                        <button
                                            onClick={startCamera}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
                                        >
                                            Enable Camera
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-slate-700 shadow-inner group">
                            {capturedImage ? (
                                <img src={capturedImage} alt="Captured" className="w-full h-full object-contain transform scale-x-[-1]" />
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            )}

                            {!capturedImage && stream && (
                                <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">Mirror Mode Active</p>
                                </div>
                            )}
                        </div>

                        <canvas ref={canvasRef} className="hidden" />

                        {stream || capturedImage ? (
                            <div className="flex justify-center gap-4">
                                {!capturedImage ? (
                                    <button
                                        onClick={handleCapture}
                                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                                    >
                                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                        Capture Photo
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleRetake}
                                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full font-bold flex items-center gap-2 transition-all"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Retake
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95"
                                        >
                                            <Check className="w-4 h-4" />
                                            Use Photo
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default WebcamCapture;
