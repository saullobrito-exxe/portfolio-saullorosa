import React from "react";
import { ManifestoContent, portfolioContent } from "../data/portfolioContent";
import { Quote, Edit3 } from "lucide-react";

interface ManifestoProps {
  manifesto?: ManifestoContent;
  isEditMode?: boolean;
  onOpenEditor?: () => void;
}

export const Manifesto: React.FC<ManifestoProps> = ({
  manifesto = portfolioContent.manifesto,
  isEditMode = false,
  onOpenEditor,
}) => {
  return (
    <section id="manifesto" className="py-16 md:py-24 bg-[#17151D] text-[#FAF8FF] relative overflow-hidden">
      {/* Editorial ambient gradients */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#5425D8]/20 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#FF5CBA]/15 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Kicker + Edit Button */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-xs font-mono uppercase tracking-widest text-[#FF5CBA]">
            {manifesto.kicker}
          </div>
          {isEditMode && onOpenEditor && (
            <button
              onClick={onOpenEditor}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#8557FF] text-white text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar Manifesto
            </button>
          )}
        </div>

        {/* Lead Quote */}
        <div className="relative mb-8">
          <Quote className="w-10 h-10 text-[#8557FF]/30 absolute -top-6 -left-5 -z-10" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display leading-[1.2] text-[#FAF8FF] [text-wrap:balance]">
            "{manifesto.leadQuote}"
          </h2>
        </div>

        {/* Concise Body Essay */}
        <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-3xl mb-12">
          {manifesto.bodyParagraph}
        </p>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 border-t border-white/10">
          {manifesto.pillars.map((pillar) => (
            <div
              key={pillar.number}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 hover:border-[#8557FF]/40 transition-colors"
            >
              <span className="text-xs font-mono text-[#8557FF] font-bold">
                {pillar.number}.
              </span>
              <h3 className="text-base font-semibold text-white font-display">
                {pillar.title}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
