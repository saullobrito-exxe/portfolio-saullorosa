import React from "react";
import { PersonalInfo, UiTexts, portfolioContent } from "../data/portfolioContent";
import { ArrowUp, Lock, Unlock } from "lucide-react";

interface FooterProps {
  personalInfo?: PersonalInfo;
  uiTexts?: UiTexts;
  isEditMode?: boolean;
  isDeveloper?: boolean;
  onToggleEditMode?: () => void;
  onDeveloperUnlock?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  personalInfo = portfolioContent.personalInfo,
  uiTexts = portfolioContent.uiTexts,
  isEditMode = false,
  isDeveloper = false,
  onToggleEditMode,
  onDeveloperUnlock,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#17151D] text-[#FAF8FF] py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-base font-bold font-display tracking-tight text-white block">
              {personalInfo.name}
            </span>
            <p className="text-xs text-white/60 font-mono">
              {personalInfo.role} · Editorial Pop-Tech
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-white/70">
            <a href="#sobre" className="hover:text-white transition-colors">{uiTexts.nav.about}</a>
            <a href="#manifesto" className="hover:text-white transition-colors">{uiTexts.nav.manifesto}</a>
            <a href="#atuacao" className="hover:text-white transition-colors">{uiTexts.nav.services}</a>
            <a href="#cases" className="hover:text-white transition-colors">{uiTexts.nav.cases}</a>
            <a
              href={personalInfo.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF5CBA] hover:text-white transition-colors font-medium"
            >
              LinkedIn
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="p-2 rounded-xl bg-white/10 hover:bg-[#5425D8] text-white transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            title="Voltar ao topo"
          >
            <span>Topo</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40 font-mono">
          <div className="flex items-center gap-2">
            <p>© {new Date().getFullYear()} {personalInfo.name}. {uiTexts.contact.footerCopy}</p>
            {(onToggleEditMode || onDeveloperUnlock) && (
              <button
                onClick={isDeveloper ? onToggleEditMode : onDeveloperUnlock}
                className="opacity-20 hover:opacity-100 text-white transition-opacity p-1 cursor-pointer"
                title={isDeveloper ? (isEditMode ? "Sair do modo de edição" : "Painel de edição") : "Acesso restrito"}
              >
                {isDeveloper && isEditMode ? <Unlock className="w-3 h-3 text-[#FF5CBA]" /> : <Lock className="w-3 h-3" />}
              </button>
            )}
          </div>
          <p>{personalInfo.location}</p>
        </div>
      </div>
    </footer>
  );
};
