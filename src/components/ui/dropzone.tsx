"use client";

import { useDropzone } from "react-dropzone";
import { Upload, FileUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@tengra/language";

export default function Dropzone({ handleUpload }: { handleUpload: (files: File[]) => void }) {
    const [isHover, setIsHover] = useState(false);
    const { t } = useTranslation();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => handleUpload(acceptedFiles),
        onDragEnter: () => setIsHover(true),
        onDragLeave: () => setIsHover(false),
        onDropRejected: () => setIsHover(false),
        onDropAccepted: () => setIsHover(false),
        accept: {
            "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".ico", ".tif", ".tiff", ".bmp", ".avif"],
            "audio/*": [".mp3", ".wav", ".ogg", ".aac", ".wma", ".flac", ".m4a", ".opus"],
            "video/*": [".mp4", ".mkv", ".mov", ".avi", ".flv", ".webm", ".wmv", ".m4v", ".3gp", ".mpeg", ".ts"]
        }
    });

    return (
        <div
            {...getRootProps()}
            className={`
                cursor-pointer w-full py-16 rounded-2xl border-2 border-dashed 
                transition-all duration-200 flex flex-col items-center justify-center gap-4
                ${isDragActive
                    ? 'border-[#7c8cff] bg-[#7c8cff]/10'
                    : 'border-[rgba(255,255,255,0.12)] hover:border-[#7c8cff]/50 bg-[#22262f]'
                }
            `}
        >
            <input {...getInputProps()} />

            <div className={`
                p-4 rounded-xl bg-[#7c8cff] transition-transform duration-200
                ${isDragActive ? 'scale-110' : 'hover:scale-105'}
            `}>
                {isDragActive ? <FileUp className="w-7 h-7 text-white" /> : <Upload className="w-7 h-7 text-white" />}
            </div>

            <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-1">
                    {isDragActive ? t("common.drop_it") : t("common.upload_title")}
                </h3>
                <p className="text-sm text-[#8b9099]">
                    {t("common.upload_subtitle")}
                </p>
            </div>
        </div>
    );
}
