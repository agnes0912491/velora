"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Sparkles } from "lucide-react";
import { useTranslation } from "@tengra/language";
import { useState } from "react";

interface AdvancedSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    fileType: string;
    onApply: (settings: AdvancedSettings) => void;
    currentSettings?: AdvancedSettings;
}

export interface AdvancedSettings {
    quality?: number;
    bitrate?: string;
    resolution?: string;
    algorithm: 'standard' | 'velora';
}

const RESOLUTIONS = ['original', '4k', '1080p', '720p', '480p', '360p'];
const VIDEO_BITRATES = ['auto', '8000k', '5000k', '2500k', '1000k', '500k'];
const AUDIO_BITRATES = ['auto', '320k', '256k', '192k', '128k', '64k'];

export default function AdvancedSettingsModal({
    isOpen,
    onClose,
    fileType,
    onApply,
    currentSettings
}: AdvancedSettingsProps) {
    const { t } = useTranslation();
    const [algorithm, setAlgorithm] = useState<'standard' | 'velora'>(currentSettings?.algorithm || 'standard');
    const [quality, setQuality] = useState(currentSettings?.quality || 80);
    const [bitrate, setBitrate] = useState(currentSettings?.bitrate || 'auto');
    const [resolution, setResolution] = useState(currentSettings?.resolution || 'original');

    const handleApply = () => {
        onApply({
            quality,
            bitrate,
            resolution,
            algorithm
        });
        onClose();
    };

    const isVideo = fileType.includes('video');
    const isAudio = fileType.includes('audio');
    const isImage = fileType.includes('image');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl z-50 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <Settings className="w-5 h-5 text-indigo-400" />
                                <h2 className="text-lg font-semibold text-white">
                                    {t("advanced.title") || "Advanced Settings"}
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
                        <div className="p-6 space-y-6">
                            {/* Algorithm Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-300">
                                    {t("advanced.algorithm") || "Compression Algorithm"}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setAlgorithm('standard')}
                                        className={`p-4 rounded-xl border transition-all ${algorithm === 'standard'
                                                ? 'border-indigo-500 bg-indigo-500/10'
                                                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="text-lg font-semibold text-white mb-1">Standard</div>
                                        <div className="text-xs text-slate-400">Default FFmpeg encoding</div>
                                    </button>
                                    <button
                                        onClick={() => setAlgorithm('velora')}
                                        className={`p-4 rounded-xl border transition-all relative overflow-hidden ${algorithm === 'velora'
                                                ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                                                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 text-lg font-semibold text-white mb-1">
                                            <Sparkles className="w-4 h-4 text-purple-400" />
                                            Velora
                                        </div>
                                        <div className="text-xs text-slate-400">Optimized for quality & size</div>
                                    </button>
                                </div>
                            </div>

                            {/* Quality Slider (for images) */}
                            {isImage && (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-slate-300">
                                            {t("advanced.quality") || "Quality"}
                                        </label>
                                        <span className="text-sm text-indigo-400">{quality}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={quality}
                                        onChange={(e) => setQuality(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Smaller file</span>
                                        <span>Better quality</span>
                                    </div>
                                </div>
                            )}

                            {/* Resolution (for video) */}
                            {isVideo && (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-300">
                                        {t("advanced.resolution") || "Resolution"}
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {RESOLUTIONS.map(res => (
                                            <button
                                                key={res}
                                                onClick={() => setResolution(res)}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${resolution === res
                                                        ? 'bg-indigo-500 text-white'
                                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {res === 'original' ? 'Original' : res.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bitrate (for video/audio) */}
                            {(isVideo || isAudio) && (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-300">
                                        {t("advanced.bitrate") || "Bitrate"}
                                    </label>
                                    <select
                                        value={bitrate}
                                        onChange={(e) => setBitrate(e.target.value)}
                                        className="w-full py-3 px-4 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {(isVideo ? VIDEO_BITRATES : AUDIO_BITRATES).map(br => (
                                            <option key={br} value={br}>
                                                {br === 'auto' ? 'Auto (Recommended)' : br}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                {t("common.cancel") || "Cancel"}
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-colors"
                            >
                                {t("common.apply") || "Apply"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
