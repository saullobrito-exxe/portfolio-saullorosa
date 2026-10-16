import React, { useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Camera, Edit3, ImagePlus, Linkedin, Mail, MapPin, Trash2, Loader2 } from "lucide-react";
import { PersonalInfo, UiTexts } from "../data/portfolioContent";
import { GenerativeOrganism } from "./GenerativeOrganism";
import { LazyImage } from "./LazyImage";
import { compressImage } from "../utils/imageOptimizer";

interface HeroAboutProps {
  personalInfo: PersonalInfo;
  uiTexts: UiTexts;
  onExploreCases: () => void;
  onContactClick: () => void;
  onUpdatePersonalInfo: (updated: Partial<PersonalInfo>) => void;
  onOpenEditor: () => void;
  isEditMode?: boolean;
}

export const HeroAbout: React.FC<HeroAboutProps> = ({
  personalInfo,
  uiTexts,
  onExploreCases,
  onContactClick,
  onUpdatePersonalInfo,
  onOpenEditor,
  isEditMode = false,
}) => {
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [optimizingField, setOptimizingField] = useState<string | null>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "photoUrl" | "headerBannerUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setOptimizingField(field);
      const isAvatar = field === "photoUrl";
      const compressedDataUrl = await compressImage(file, {
        maxWidth: isAvatar ? 800 : 1600,
        maxHeight: isAvatar ? 800 : 1200,
        quality: 0.82,
        mimeType: "image/webp",
      });
      onUpdatePersonalInfo({ [field]: compressedDataUrl });
    } catch (err) {
      console.error("Falha ao otimizar e salvar imagem:", err);
    } finally {
      setOptimizingField(null);
    }
  };

  return (
    <section id="sobre" className="relative pt-8 pb-14 md:pt-12 md:pb-20 border-b border-[#17151D]/10 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/4 -z-10 w-96 h-96 bg-[#8557FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 -z-10 w-80 h-80 bg-[#FF5CBA]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Main Grid: Photo & Primary Info Consolidation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Testeira, Foto de Perfil & Direct Channels (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start space-y-4">
            {/* Identity Card: Testeira + Foto */}
            <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden border border-[#5425D8]/20 shadow-xl relative group">
              {/* 1. ESPAÇO PARA TESTEIRA (HEADER BANNER) */}
              <div className="relative w-full h-36 sm:h-40 bg-[#17151D] overflow-hidden group/testeira">
                {personalInfo.headerBannerUrl ? (
                  <LazyImage
                    src={personalInfo.headerBannerUrl}
                    alt="Testeira de Apresentação"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/testeira:scale-102"
                    containerClassName="w-full h-full"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#5425D8] via-[#8557FF] to-[#FF5CBA] flex items-center justify-center p-4">
                    <span className="text-xs font-mono text-white/80">
                      Editorial Pop-Tech
                    </span>
                  </div>
                )}

                {/* Testeira Upload Controls (Visível apenas em Modo Edição) */}
                {isEditMode && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover/testeira:opacity-100 transition-opacity">
                    <button
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-black/70 hover:bg-black text-white rounded-lg backdrop-blur-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      title="Upload da foto de testeira"
                    >
                      <ImagePlus className="w-3.5 h-3.5 text-[#FF5CBA]" />
                      <span>Upload Testeira</span>
                    </button>
                    {personalInfo.headerBannerUrl && (
                      <button
                        onClick={() => onUpdatePersonalInfo({ headerBannerUrl: null })}
                        className="p-1 text-white bg-black/70 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Remover testeira"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "headerBannerUrl")}
                />
              </div>

              {/* 2. ESPAÇO PARA FOTO DE PERFIL / RETRATO */}
              <div className="px-6 pb-6 pt-0 relative">
                {/* Avatar / Retrato (Overlapping Testeira) */}
                <div className="relative -mt-16 mb-4 flex items-end justify-between">
                  <div className="relative group/avatar">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-[#FAF8FF] border-4 border-white shadow-lg relative">
                      {personalInfo.photoUrl ? (
                        <LazyImage
                          src={personalInfo.photoUrl}
                          alt={personalInfo.name}
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <GenerativeOrganism
                          className="w-full h-full"
                          intensity="vibrant"
                          label="IA Autoral"
                        />
                      )}

                      {/* Compression indicator badge */}
                      {optimizingField && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-1 z-10">
                          <Loader2 className="w-5 h-5 text-[#FF5CBA] animate-spin mb-1" />
                          <span className="text-[9px] font-mono font-medium text-center leading-tight">
                            Comprimindo...
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Photo Upload Button (Visível apenas em Modo Edição) */}
                    {isEditMode && (
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute bottom-1 right-1 p-2 rounded-xl bg-[#5425D8] hover:bg-[#8557FF] text-white shadow-md transition-all cursor-pointer"
                        title="Fazer upload da sua foto de perfil"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "photoUrl")}
                    />
                  </div>

                  {/* Quick Edit Profile Button (Visível apenas em Modo Edição) */}
                  {isEditMode && (
                    <button
                      onClick={onOpenEditor}
                      className="px-3 py-1.5 text-xs font-mono font-semibold text-[#5425D8] bg-[#EAF0FF] hover:bg-[#5425D8] hover:text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer mb-1"
                      title="Editar textos, foto e testeira"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar Perfil
                    </button>
                  )}
                </div>

                {/* Identity Info inside card */}
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-display text-[#17151D] flex items-center gap-2">
                    {personalInfo.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#8557FF] font-mono">
                    {personalInfo.role}
                  </p>
                  <p className="text-xs text-[#17151D]/65 leading-relaxed pt-1">
                    {personalInfo.photoCaption}
                  </p>
                </div>

                {/* Direct Metadata Row */}
                <div className="pt-3 border-t border-[#17151D]/10 mt-3 flex items-center justify-between text-xs text-[#17151D]/70 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#5425D8]" />
                    {personalInfo.location}
                  </span>
                  <span className="text-[#5425D8] font-semibold">
                    FSB Comunicação
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons under Photo */}
            <div className="w-full max-w-md flex items-center gap-2 pt-1">
              <a
                href={personalInfo.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 text-xs font-semibold text-[#17151D] bg-white hover:bg-[#EAF0FF] border border-[#17151D]/15 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Linkedin className="w-3.5 h-3.5 text-[#5425D8]" />
                {uiTexts.hero.ctaLinkedin}
              </a>
              <a
                href={`mailto:${personalInfo.email}`}
                className="py-2.5 px-3.5 text-xs font-semibold text-[#5425D8] bg-[#EAF0FF] hover:bg-[#5425D8] hover:text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
                title="Enviar e-mail direto"
              >
                <Mail className="w-3.5 h-3.5" />
                E-mail
              </a>
            </div>
          </div>

          {/* Right Column: Personal & Professional Identity Narrative (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            {/* Kicker */}
            <div className="text-xs font-mono uppercase tracking-widest text-[#5425D8]">
              {uiTexts.hero.kicker}
            </div>

            {/* Name & Role Title */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-[#17151D] tracking-tight leading-tight">
                {personalInfo.name}
              </h1>
              <p className="text-base sm:text-lg font-semibold text-[#8557FF] font-display">
                {personalInfo.role}
              </p>
            </div>

            {/* Positioning Headline */}
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[#17151D]/90 leading-snug [text-wrap:balance]">
              {personalInfo.headline}
            </h2>

            {/* Bio Prose (Concise & Impactful) */}
            <p className="text-sm sm:text-base text-[#17151D]/80 leading-relaxed font-normal">
              {personalInfo.bioShort}
            </p>

            <p className="text-xs sm:text-sm text-[#17151D]/70 leading-relaxed font-normal">
              {personalInfo.aboutStory}
            </p>

            {/* Core Competencies & Credentials (Unboxed Metadata) */}
            <div className="pt-2 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs font-mono text-[#17151D]/70">
              {personalInfo.highlights.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span className="font-medium text-[#5425D8]">• {item}</span>
                  {idx < personalInfo.highlights.length - 1 && (
                    <span aria-hidden="true" className="text-[#17151D]/20">/</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* CTAs */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreCases}
                className="px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white bg-[#5425D8] hover:bg-[#8557FF] rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-98"
              >
                {uiTexts.hero.ctaPrimary}
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={onContactClick}
                className="px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#17151D] bg-white hover:bg-[#FAF8FF] border border-[#17151D]/20 rounded-xl transition-colors duration-200 flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {uiTexts.hero.ctaSecondary}
                <ArrowUpRight className="w-4 h-4 text-[#5425D8]" />
              </button>

              {/* Botão de edição visível apenas se em Modo Edição */}
              {isEditMode && (
                <button
                  onClick={onOpenEditor}
                  className="px-4 py-3 text-xs font-mono text-[#5425D8] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar Todos os Textos
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Big Numbers & Métricas de Impacto Row */}
        <div className="mt-12 pt-8 border-t border-[#17151D]/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {personalInfo.stats.map((stat, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="text-2xl md:text-3xl font-bold font-display text-[#5425D8] tabular-nums tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#17151D]">
                  {stat.label}
                </div>
                <div className="text-[11px] text-[#17151D]/60 leading-normal">
                  {stat.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
