"use client";

import Navbar from "@/components/ui/navbar";
import Dropzone from "@/components/ui/dropzone";
import useConverter, { Action } from "@/hooks/use-converter";
import useKeyboardShortcuts from "@/hooks/use-keyboard-shortcuts";
import { useTranslation } from "@tengra/language";
import { useEffect, useState, useCallback } from "react";
import { Download, Loader2, File, CheckCircle2, XCircle, RefreshCw, AlertTriangle, History, Eye, Settings, Trash2 } from "lucide-react";
import { formatBytes } from "@/utils/utils";
import { AnimatePresence, motion } from "framer-motion";
import HistoryPanel from "@/components/ui/history-panel";
import AdvancedSettingsModal, { AdvancedSettings } from "@/components/ui/advanced-settings";
import FilePreview from "@/components/ui/file-preview";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function Home() {
  const { isLoaded, actions, setActions, convert, reset, progress, logs, history, clearHistory } = useConverter();
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [previewAction, setPreviewAction] = useState<Action | null>(null);

  useEffect(() => { setIsReady(true); }, []);

  const handleUpload = useCallback((files: File[]) => {
    const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setSizeError(`Max 100MB: ${oversizedFiles.map(f => f.name).join(", ")}`);
      setTimeout(() => setSizeError(null), 4000);
      files = files.filter(f => f.size <= MAX_FILE_SIZE);
    }
    if (files.length === 0) return;
    const newActions: Action[] = files.map((file) => ({
      file, file_name: file.name, file_size: file.size,
      from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
      to: null, file_type: file.type, is_converting: false, is_converted: false, is_error: false, algorithm: 'standard' as const,
    }));
    setActions(prev => [...prev, ...newActions]);
  }, [setActions]);

  const updateAction = (file_name: string, to: string) => {
    setActions(prev => prev.map(action => action.file_name === file_name ? { ...action, to } : action));
  };

  const download = (action: Action) => {
    const a = document.createElement("a");
    a.href = action.url; a.download = action.output;
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(action.url); document.body.removeChild(a);
  };

  const downloadAll = useCallback(() => {
    actions.filter(a => a.is_converted).forEach(action => download(action));
  }, [actions]);

  const applyAdvancedSettings = (settings: AdvancedSettings) => {
    if (!selectedAction) return;
    setActions(prev => prev.map(a => a.file_name === selectedAction.file_name ? { ...a, ...settings } : a));
  };

  const canConvert = isLoaded && !actions.some(a => a.is_converting) && actions.some(a => a.to && !a.is_converted);
  const canDownload = actions.some(a => a.is_converted);

  useKeyboardShortcuts({ onConvert: convert, onClearAll: reset, onDownloadAll: downloadAll, onPaste: handleUpload, canConvert, canDownload });

  const formats: Record<string, string[]> = {
    "video": ["mp4", "mkv", "avi", "mov", "webm", "gif", "flv", "wmv", "mpeg", "3gp", "ts"],
    "audio": ["mp3", "wav", "ogg", "aac", "flac", "m4a", "wma", "opus"],
    "image": ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "ico", "avif"]
  };

  const convertedCount = actions.filter(a => a.is_converted).length;
  const totalCount = actions.filter(a => a.to).length;

  if (!isReady) return null;

  return (
    <>
      <Navbar />

      {/* Modals */}
      <HistoryPanel history={history} onClear={clearHistory} isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <AdvancedSettingsModal isOpen={advancedOpen} onClose={() => { setAdvancedOpen(false); setSelectedAction(null); }} fileType={selectedAction?.file_type || ""} onApply={applyAdvancedSettings} currentSettings={selectedAction ? { algorithm: selectedAction.algorithm || 'standard', quality: selectedAction.quality, bitrate: selectedAction.bitrate, resolution: selectedAction.resolution } : undefined} />
      {previewAction && <FilePreview file={previewAction.file} fileType={previewAction.file_type} isOpen={!!previewAction} onClose={() => setPreviewAction(null)} />}

      {/* Error Toast */}
      <AnimatePresence>
        {sizeError && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-[#f07178] rounded-xl text-white font-medium flex items-center gap-2 shadow-lg">
            <AlertTriangle className="w-4 h-4" /> {sizeError}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto">

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{t("common.title")}</h1>
          <p className="text-[#8b9099] text-lg max-w-lg mx-auto">{t("common.description")}</p>
        </header>

        {/* Upload Area */}
        <section className="mb-8">
          <Dropzone handleUpload={handleUpload} />
        </section>

        {/* Files List */}
        <AnimatePresence>
          {actions.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Header Row */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{t("common.files")} ({actions.length})</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setHistoryOpen(true)} className="p-2 text-[#8b9099] hover:text-white hover:bg-[#2a2f3a] rounded-lg transition-colors" title="History">
                    <History className="w-5 h-5" />
                  </button>
                  <button onClick={reset} className="p-2 text-[#8b9099] hover:text-[#f07178] hover:bg-[#f07178]/10 rounded-lg transition-colors" title="Clear All">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {actions.some(a => a.is_converting) && (
                <div className="bg-[#22262f] rounded-full h-2 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(convertedCount / totalCount) * 100}%` }} className="bg-[#7c8cff] h-full rounded-full" />
                </div>
              )}

              {/* File Cards */}
              <div className="space-y-3">
                {actions.map((action, idx) => (
                  <motion.div key={idx} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`glass-panel p-4 flex items-center gap-4 ${action.is_error ? 'border-[#f07178]/40' : action.is_converted ? 'border-[#6dd4a0]/40' : ''}`}>

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${action.is_error ? 'bg-[#f07178]/20 text-[#f07178]' : action.is_converted ? 'bg-[#6dd4a0]/20 text-[#6dd4a0]' : 'bg-[#2a2f3a] text-[#7c8cff]'}`}>
                      {action.is_error ? <XCircle className="w-5 h-5" /> : action.is_converted ? <CheckCircle2 className="w-5 h-5" /> : action.is_converting ? <Loader2 className="w-5 h-5 animate-spin" /> : <File className="w-5 h-5" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm">{action.file_name}</p>
                      <p className="text-xs text-[#8b9099]">{formatBytes(action.file_size)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!action.is_converting && !action.is_converted && (
                        <>
                          <button onClick={() => setPreviewAction(action)} className="p-2 text-[#8b9099] hover:text-white rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedAction(action); setAdvancedOpen(true); }} className="p-2 text-[#8b9099] hover:text-white rounded-lg transition-colors"><Settings className="w-4 h-4" /></button>
                          <select value={action.to || ""} onChange={(e) => updateAction(action.file_name, e.target.value)} className="input-field text-sm py-2 pr-8 min-w-[100px]">
                            <option value="" disabled>{t("common.select_format")}</option>
                            {action.file_type.includes("image") && formats.image.filter(f => f !== action.from.toLowerCase()).map(f => (<option key={f} value={f}>{f.toUpperCase()}</option>))}
                            {action.file_type.includes("video") && formats.video.filter(f => f !== action.from.toLowerCase()).map(f => (<option key={f} value={f}>{f.toUpperCase()}</option>))}
                            {action.file_type.includes("audio") && formats.audio.filter(f => f !== action.from.toLowerCase()).map(f => (<option key={f} value={f}>{f.toUpperCase()}</option>))}
                          </select>
                          <button onClick={() => setActions(prev => prev.filter(a => a.file_name !== action.file_name))} className="p-2 text-[#8b9099] hover:text-[#f07178] rounded-lg transition-colors"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}

                      {action.is_converting && <span className="text-xs text-[#7c8cff] font-medium">{t("common.converting")}</span>}

                      {action.is_converted && (
                        <div className="flex items-center gap-3">
                          {action.savings_percent !== undefined && action.savings_percent !== 0 && (
                            <span className={`text-xs font-medium ${action.savings_percent > 0 ? 'text-[#6dd4a0]' : 'text-[#f07178]'}`}>
                              {action.savings_percent > 0 ? `↓${action.savings_percent}%` : `↑${Math.abs(action.savings_percent)}%`}
                            </span>
                          )}
                          <button onClick={() => download(action)} className="flex items-center gap-2 px-4 py-2 bg-[#6dd4a0] hover:bg-[#7de4b0] text-[#1a1d24] font-medium rounded-lg transition-colors">
                            <Download className="w-4 h-4" /> {t("common.download")}
                          </button>
                        </div>
                      )}

                      {action.is_error && <span className="text-xs text-[#f07178] font-medium">{t("common.error")}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4">
                {canDownload && actions.every(a => a.is_converted) && (
                  <button onClick={downloadAll} className="flex items-center gap-2 px-5 py-3 bg-[#6dd4a0] hover:bg-[#7de4b0] text-[#1a1d24] font-semibold rounded-xl transition-colors">
                    <Download className="w-5 h-5" /> {t("common.download_all")}
                  </button>
                )}
                <div className="flex-1" />
                <button onClick={convert} disabled={!canConvert} className="flex items-center gap-2 px-6 py-3 bg-[#7c8cff] hover:bg-[#9aa6ff] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
                  {actions.some(a => a.is_converting) ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                  {actions.some(a => a.is_converting) ? t("common.converting") : t("common.convert_all")}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Supported Formats */}
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-white text-center mb-6">{t("common.supported_formats")}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { type: "video", label: t("formats.video"), items: formats.video },
              { type: "audio", label: t("formats.audio"), items: formats.audio },
              { type: "image", label: t("formats.image"), items: formats.image },
            ].map(cat => (
              <div key={cat.type} className="glass-panel p-4">
                <h3 className="text-sm font-medium text-[#8b9099] mb-3">{cat.label}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map(fmt => (
                    <span key={fmt} className="px-2 py-1 text-xs bg-[#2a2f3a] text-[#e8eaed] rounded uppercase">{fmt}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Keyboard Shortcuts Hint */}
        <footer className="mt-12 text-center text-xs text-[#8b9099]">
          <p><kbd className="px-2 py-1 bg-[#22262f] rounded">Ctrl+V</kbd> paste • <kbd className="px-2 py-1 bg-[#22262f] rounded">Enter</kbd> convert • <kbd className="px-2 py-1 bg-[#22262f] rounded">Esc</kbd> clear</p>
        </footer>
      </main>
    </>
  );
}
