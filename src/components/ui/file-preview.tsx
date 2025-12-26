"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Image as ImageIcon } from "lucide-react";

interface FilePreviewProps {
    file: File;
    fileType: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function FilePreview({ file, fileType, isOpen, onClose }: FilePreviewProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const isImage = fileType.includes('image');
    const isVideo = fileType.includes('video');
    const isAudio = fileType.includes('audio');

    type WindowWithWebkitAudioContext = Window & {
        webkitAudioContext?: typeof AudioContext;
    };

    const drawWaveform = useCallback(async (audioFile: File, canvas: HTMLCanvasElement) => {
        try {
            const AudioContextClass =
                window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext;
            if (!AudioContextClass) return;

            const audioContext = new AudioContextClass();
            const arrayBuffer = await audioFile.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const data = audioBuffer.getChannelData(0);
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;
            const step = Math.ceil(data.length / width);
            const amp = height / 2;

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let i = 0; i < width; i++) {
                let min = 1.0;
                let max = -1.0;
                for (let j = 0; j < step; j++) {
                    const datum = data[(i * step) + j];
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }
                const yLow = ((1 + min) * amp);
                const yHigh = ((1 + max) * amp);
                ctx.moveTo(i, yLow);
                ctx.lineTo(i, yHigh);
            }
            ctx.stroke();

            await audioContext.close();
        } catch (e) {
            console.error('Waveform error:', e);
        }
    }, []);

    const previewUrl = useMemo(() => {
        if (!isOpen || !file) return null;
        return URL.createObjectURL(file);
    }, [isOpen, file]);

    useEffect(() => {
        if (!previewUrl) return;

        // Draw audio waveform if audio file
        if (isAudio && canvasRef.current) {
            drawWaveform(file, canvasRef.current);
        }

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [drawWaveform, previewUrl, file, isAudio]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl z-50 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <Eye className="w-5 h-5 text-indigo-400" />
                                <h2 className="font-medium text-white truncate max-w-md">
                                    {file.name}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto">
                            {isImage && previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt={file.name}
                                    className="max-w-full max-h-[60vh] rounded-lg object-contain"
                                />
                            )}

                            {isVideo && previewUrl && (
                                <video
                                    src={previewUrl}
                                    controls
                                    className="max-w-full max-h-[60vh] rounded-lg"
                                />
                            )}

                            {isAudio && (
                                <div className="w-full space-y-4">
                                    <canvas
                                        ref={canvasRef}
                                        width={600}
                                        height={150}
                                        className="w-full rounded-lg"
                                    />
                                    {previewUrl && (
                                        <audio
                                            ref={audioRef}
                                            src={previewUrl}
                                            controls
                                            className="w-full"
                                        />
                                    )}
                                </div>
                            )}

                            {!isImage && !isVideo && !isAudio && (
                                <div className="text-center text-slate-500">
                                    <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                    <p>Preview not available for this file type</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
