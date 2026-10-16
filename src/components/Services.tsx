import React from "react";
import { ServiceItem, UiTexts, portfolioContent } from "../data/portfolioContent";
import { Edit3 } from "lucide-react";

interface ServicesProps {
  services?: ServiceItem[];
  uiTexts?: UiTexts;
  onSelectService?: (serviceTitle: string) => void;
  isEditMode?: boolean;
  onOpenEditor?: () => void;
}

export const Services: React.FC<ServicesProps> = ({
  services = portfolioContent.services,
  uiTexts = portfolioContent.uiTexts,
  onSelectService,
  isEditMode = false,
  onOpenEditor,
}) => {
  return (
    <section id="atuacao" className="py-14 md:py-18 max-w-7xl mx-auto px-6 border-b border-[#17151D]/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="max-w-2xl space-y-1.5">
          <div className="text-xs font-mono uppercase tracking-widest text-[#5425D8]">
            {uiTexts.services.kicker}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[#17151D] tracking-tight [text-wrap:balance]">
            {uiTexts.services.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#17151D]/70 leading-relaxed">
            {uiTexts.services.subtitle}
          </p>
        </div>

        {isEditMode && onOpenEditor && (
          <button
            onClick={onOpenEditor}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#5425D8] hover:bg-[#8557FF] text-white text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Seção
          </button>
        )}
      </div>

      {/* Compact Grid of the Strategic Disciplines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onSelectService && onSelectService(service.title)}
            className="group p-5 rounded-2xl bg-white border border-[#17151D]/10 hover:border-[#5425D8]/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#8557FF] tabular-nums">
                  {service.number}.
                </span>
                <span className="text-[10px] font-mono text-[#5425D8] bg-[#EAF0FF] px-2 py-0.5 rounded-md">
                  {service.keyDeliverable}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold font-display text-[#17151D] group-hover:text-[#5425D8] transition-colors leading-snug">
                {service.title}
              </h3>
              <p className="text-xs text-[#17151D]/70 leading-relaxed">
                {service.shortDescription}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
