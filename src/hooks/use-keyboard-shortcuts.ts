"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcutsOptions {
    onConvert: () => void;
    onClearAll: () => void;
    onDownloadAll: () => void;
    onPaste: (files: File[]) => void;
    canConvert: boolean;
    canDownload: boolean;
}

export default function useKeyboardShortcuts({
    onConvert,
    onClearAll,
    onDownloadAll,
    onPaste,
    canConvert,
    canDownload
}: KeyboardShortcutsOptions) {

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
            return;
        }

        // Enter - Convert
        if (e.key === "Enter" && canConvert) {
            e.preventDefault();
            onConvert();
        }

        // Escape - Clear all
        if (e.key === "Escape") {
            e.preventDefault();
            onClearAll();
        }

        // Ctrl+D - Download all
        if (e.ctrlKey && e.key === "d" && canDownload) {
            e.preventDefault();
            onDownloadAll();
        }
    }, [onConvert, onClearAll, onDownloadAll, canConvert, canDownload]);

    const handlePaste = useCallback(async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }

        if (files.length > 0) {
            e.preventDefault();
            onPaste(files);
        }
    }, [onPaste]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("paste", handlePaste);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("paste", handlePaste);
        };
    }, [handleKeyDown, handlePaste]);
}
