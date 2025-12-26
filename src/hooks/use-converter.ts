"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export type Action = {
    file: File;
    file_name: string;
    file_size: number;
    from: string;
    to: string | null;
    file_type: string;
    is_converting?: boolean;
    is_converted?: boolean;
    is_error?: boolean;
    url?: string;
    output?: string;
    // Compression stats
    original_size?: number;
    converted_size?: number;
    savings_percent?: number;
    // Advanced settings
    quality?: number;
    bitrate?: string;
    resolution?: string;
    algorithm?: 'standard' | 'velora';
};

export type HistoryItem = {
    id: string;
    file_name: string;
    from: string;
    to: string;
    original_size: number;
    converted_size: number;
    savings_percent: number;
    timestamp: number;
};

const HISTORY_KEY = "velora_conversion_history";
const MAX_HISTORY = 20;

export default function useConverter() {
    const [isLoaded] = useState(true);
    const [isLoading] = useState(false);
    const [actions, setActions] = useState<Action[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const ffmpegRef = useRef(null);

    // Load history from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            if (saved) setHistory(JSON.parse(saved));
        } catch { }
    }, []);

    // Save history to localStorage
    const addToHistory = useCallback((item: HistoryItem) => {
        setHistory(prev => {
            const updated = [item, ...prev].slice(0, MAX_HISTORY);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    }, []);

    const reset = () => {
        setActions([]);
        setLogs([]);
        setProgress(0);
    };

    const convert = async () => {
        setLogs(prev => [...prev, "Starting server-side conversion..."]);
        setActions(prev => prev.map(a => ({ ...a, is_converting: true, is_converted: false, is_error: false })));

        let completed = 0;
        const total = actions.filter(a => a.to).length;

        for (const action of actions) {
            if (!action.to) continue;

            try {
                setLogs(prev => [...prev, `Uploading ${action.file_name}...`]);

                const formData = new FormData();
                formData.append("file", action.file);
                formData.append("to", action.to);

                // Add advanced settings if present
                if (action.quality) formData.append("quality", action.quality.toString());
                if (action.bitrate) formData.append("bitrate", action.bitrate);
                if (action.resolution) formData.append("resolution", action.resolution);
                if (action.algorithm) formData.append("algorithm", action.algorithm);

                const response = await fetch("/api/convert", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "Server Error");
                }

                setLogs(prev => [...prev, `Processing ${action.file_name}...`]);

                // Get compression stats from headers
                const originalSize = parseInt(response.headers.get("X-Original-Size") || "0");
                const convertedSize = parseInt(response.headers.get("X-Converted-Size") || "0");
                const savingsPercent = parseInt(response.headers.get("X-Savings-Percent") || "0");

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const outputName = `converted_${action.file_name.split('.')[0]}.${action.to}`;

                // Update action with compression stats
                setActions(prev => prev.map(a => {
                    if (a.file_name === action.file_name) {
                        return {
                            ...a,
                            is_converting: false,
                            is_converted: true,
                            url,
                            output: outputName,
                            original_size: originalSize,
                            converted_size: convertedSize,
                            savings_percent: savingsPercent
                        };
                    }
                    return a;
                }));

                // Add to history
                addToHistory({
                    id: Date.now().toString(),
                    file_name: action.file_name,
                    from: action.from,
                    to: action.to,
                    original_size: originalSize,
                    converted_size: convertedSize,
                    savings_percent: savingsPercent,
                    timestamp: Date.now()
                });

                completed++;
                setProgress((completed / total) * 100);

                const savingsText = savingsPercent > 0
                    ? ` (${savingsPercent}% saved!)`
                    : savingsPercent < 0
                        ? ` (${Math.abs(savingsPercent)}% larger)`
                        : "";
                setLogs(prev => [...prev, `✓ ${action.file_name} converted${savingsText}`]);

            } catch (error) {
                const message = error instanceof Error ? error.message : "Conversion failed";
                console.error(error);
                setLogs(prev => [...prev, `✗ Error: ${message}`]);
                setActions(prev => prev.map(a => {
                    if (a.file_name === action.file_name) {
                        return { ...a, is_converting: false, is_error: true };
                    }
                    return a;
                }));
            }
        }
        setLogs(prev => [...prev, "All operations finished."]);
    };

    return {
        isLoaded,
        isLoading,
        actions,
        setActions,
        convert,
        reset,
        progress,
        ffmpegRef,
        logs,
        history,
        clearHistory
    };
}
