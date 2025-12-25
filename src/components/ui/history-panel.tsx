"use client";

import { motion, AnimatePresence } from "framer-motion";
import { History, X, Trash2 } from "lucide-react";
import { HistoryItem } from "@/hooks/use-converter";
import { formatBytes } from "@/utils/utils";
import { useTranslation } from "@tengra/language";

interface HistoryPanelProps {
    history: HistoryItem[];
    onClear: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function HistoryPanel({ history, onClear, isOpen, onClose }: HistoryPanelProps) {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <History className="w-5 h-5 text-indigo-400" />
                                <h2 className="text-lg font-semibold text-white">
                                    {t("history.title") || "Conversion History"}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {history.length > 0 && (
                                    <button
                                        onClick={onClear}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Clear History"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {history.length === 0 ? (
                                <div className="text-center text-slate-500 py-12">
                                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>{t("history.empty") || "No conversions yet"}</p>
                                </div>
                            ) : (
                                history.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-medium text-slate-200 truncate flex-1 mr-2">
                                                {item.file_name}
                                            </h3>
                                            <span className="text-xs text-slate-500">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-300 uppercase text-xs">
                                                {item.from}
                                            </span>
                                            <span className="text-slate-500">→</span>
                                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded uppercase text-xs">
                                                {item.to}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-xs">
                                            <span className="text-slate-400">
                                                {formatBytes(item.original_size)} → {formatBytes(item.converted_size)}
                                            </span>
                                            {item.savings_percent !== 0 && (
                                                <span className={item.savings_percent > 0 ? "text-emerald-400" : "text-red-400"}>
                                                    {item.savings_percent > 0 ? `↓ ${item.savings_percent}%` : `↑ ${Math.abs(item.savings_percent)}%`}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
