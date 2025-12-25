"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatBytes } from "@/utils/utils";

interface CompressionStatsProps {
    originalSize: number;
    convertedSize: number;
    savingsPercent: number;
}

export default function CompressionStats({ originalSize, convertedSize, savingsPercent }: CompressionStatsProps) {
    const isSavings = savingsPercent > 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm ${isSavings
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-orange-500/10 border border-orange-500/20'
                }`}
        >
            {isSavings ? (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
            ) : (
                <TrendingUp className="w-4 h-4 text-orange-400" />
            )}

            <div className="flex items-center gap-2">
                <span className="text-slate-400">{formatBytes(originalSize)}</span>
                <span className="text-slate-600">→</span>
                <span className={isSavings ? "text-emerald-400 font-medium" : "text-orange-400 font-medium"}>
                    {formatBytes(convertedSize)}
                </span>
            </div>

            <div className={`ml-auto font-bold ${isSavings ? 'text-emerald-400' : 'text-orange-400'}`}>
                {isSavings ? `-${savingsPercent}%` : `+${Math.abs(savingsPercent)}%`}
            </div>
        </motion.div>
    );
}
