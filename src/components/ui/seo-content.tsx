"use client";

import { useTranslation } from "@tengra/language";
import { Shield, Zap, Infinity, Lock } from "lucide-react";

export default function SEOContent() {
    const { dictionary } = useTranslation();
    const t = dictionary as { common?: { title?: string } };

    // Since we might need specific SEO texts that aren't in translations yet, 
    // I'll provide fallbacks or add them to translations. 
    // But for maximum impact, I'll use direct text with language detection for now 
    // to ensure they are high-quality SEO strings.

    const isTr = t.common?.title?.includes("Dönüştürücü") ?? false;

    return (
        <section className="mt-24 border-t border-white/5 pt-16 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-[#8b9099]">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                        {isTr ? "Neden Velora Dosya Dönüştürücü?" : "Why Choose Velora File Converter?"}
                    </h2>
                    <div className="space-y-6 text-sm leading-relaxed">
                        <p>
                            {isTr
                                ? "Velora, dosyalarınızı tarayıcınızda veya güvenli sunucularımızda en yüksek hızla dönüştürmeniz için tasarlandı. HEIC'ten JPG'ye, MP4'ten MP3'e veya WebP'den PNG'ye kadar 100'den fazla formatı destekliyoruz. Gizliliğiniz bizim için her şeyden önemli; dosyalarınız asla kalıcı olarak saklanmaz."
                                : "Velora is designed for high-speed file conversions directly in your browser or via our secure servers. Supporting over 100+ formats including HEIC to JPG, MP4 to MP3, and WebP to PNG, we prioritize your privacy. Your files are never stored permanently."}
                        </p>
                        <p>
                            {isTr
                                ? "Gelişmiş algoritmalarımız sayesinde görüntü kalitesinden ödün vermeden dosya boyutlarını küçültebilir, videolarınızı optimize edebilir ve iş akışınızı hızlandırabilirsiniz. Tamamen ücretsiz ve sınırsız dönüştürme deneyimi NovaClip güvencesiyle sunulmaktadır."
                                : "Our advanced algorithms allow you to reduce file sizes without compromising quality, optimize videos, and speed up your workflow. Experience a completely free and unlimited conversion tool powered by NovaClip technology."}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#1a1d24] border border-white/5 p-5 rounded-2xl">
                        <Shield className="w-6 h-6 text-[#6dd4a0] mb-3" />
                        <h3 className="text-white font-semibold text-sm mb-2">{isTr ? "Güvenli İşlem" : "Secure Processing"}</h3>
                        <p className="text-xs">{isTr ? "Uçtan uca şifreli ve gizlilik odaklı mimari." : "End-to-end encrypted and privacy focused architecture."}</p>
                    </div>
                    <div className="bg-[#1a1d24] border border-white/5 p-5 rounded-2xl">
                        <Zap className="w-6 h-6 text-[#7c8cff] mb-3" />
                        <h3 className="text-white font-semibold text-sm mb-2">{isTr ? "Yüksek Hız" : "Ultra Performance"}</h3>
                        <p className="text-xs">{isTr ? "Saniyeler içinde büyük dosyaları dönüştürün." : "Convert large files in a matter of seconds."}</p>
                    </div>
                    <div className="bg-[#1a1d24] border border-white/5 p-5 rounded-2xl">
                        <Infinity className="w-6 h-6 text-[#f07178] mb-3" />
                        <h3 className="text-white font-semibold text-sm mb-2">{isTr ? "Sınırsız Kullanım" : "Unlimited Access"}</h3>
                        <p className="text-xs">{isTr ? "Dosya sayısı sınırı olmadan özgürce kullanın." : "No limits on the number of files you can convert."}</p>
                    </div>
                    <div className="bg-[#1a1d24] border border-white/5 p-5 rounded-2xl">
                        <Lock className="w-6 h-6 text-[#ffd333] mb-3" />
                        <h3 className="text-white font-semibold text-sm mb-2">{isTr ? "Gizlilik Garantisi" : "Privacy Guaranteed"}</h3>
                        <p className="text-xs">{isTr ? "Dosyalarınız işlem biter bitmez silinir." : "Deleted immediately after processing finishes."}</p>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-[#8b9099]/30">
                Velora · {new Date().getFullYear()}
            </div>
        </section>
    );
}
