"use client";

import { useTranslation } from "@tengra/language";
import { Languages, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/utils/utils";

export default function Navbar() {
    const { language, setLanguage, t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === "tr" ? "en" : "tr");
    };

    return (
        <nav className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-transparent border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                            <Image
                                src="/velora-logo.svg"
                                alt="Velora Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Velora
                            </span>
                            <span className="text-xs text-slate-500 font-medium tracking-wider">{t("common.nav_convert")}</span>
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleLanguage}
                            className="p-2 rounded-full glass-button group relative overflow-hidden"
                            aria-label="Switch Language"
                        >
                            <div className="relative z-10 flex items-center gap-2 px-2">
                                <Languages className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white uppercase">
                                    {language}
                                </span>
                            </div>
                        </button>

                        <Link
                            href="https://github.com"
                            target="_blank"
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors border border-white/5 hover:border-white/10"
                        >
                            <span className="text-slate-300">GitHub</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
