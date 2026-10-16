import React, { useState } from "react";
import { ArrowUpRight, Menu, X, Edit3, Settings } from "lucide-react";
import { portfolioContent, UiTexts } from "../data/portfolioContent";

interface NavbarProps {
  onContactClick: () => void;
  uiTexts?: UiTexts;
  isEditMode?: boolean;
  isDeveloper?: boolean;
  onToggleEditMode?: () => void;
  onOpenEditor?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onContactClick,
  uiTexts = portfolioContent.uiTexts,
  isEditMode = false,
  isDeveloper = false,
  onToggleEditMode,
  onOpenEditor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const nav = uiTexts.nav;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF8FF]/90 border-b border-[#17151D]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <a
          href="#topo"
          className="text-lg md:text-xl font-bold tracking-tight text-[#17151D] hover:text-[#5425D8] transition-colors whitespace-nowrap shrink-0 font-display flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#5425D8]" />
          {nav.brandName}
        </a>

        {/* Zone 2: 4 Consolidated Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#17151D]/80">
          <a
            href="#sobre"
            className="hover:text-[#5425D8] transition-colors whitespace-nowrap shrink-0"
          >
            {nav.about}
          </a>
          <a
            href="#manifesto"
            className="hover:text-[#5425D8] transition-colors whitespace-nowrap shrink-0"
          >
            {nav.manifesto}
          </a>
          <a
            href="#atuacao"
            className="hover:text-[#5425D8] transition-colors whitespace-nowrap shrink-0"
          >
            {nav.services}
          </a>
          <a
            href="#cases"
            className="hover:text-[#5425D8] transition-colors whitespace-nowrap shrink-0"
          >
            {nav.cases}
          </a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isDeveloper && onToggleEditMode && (
            <button
              onClick={isEditMode && onOpenEditor ? onOpenEditor : onToggleEditMode}
              className={`px-3.5 py-2 text-xs font-mono font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                isEditMode
                  ? "bg-[#5425D8] text-white hover:bg-[#8557FF] shadow-xs"
                  : "bg-black/5 hover:bg-black/10 text-[#17151D]"
              }`}
              title={isEditMode ? "Abrir Painel de Edição" : "Ativar Modo de Edição de Conteúdo"}
            >
              <Edit3 className="w-3.5 h-3.5 text-[#FF5CBA]" />
              <span>{isEditMode ? "Painel de Edição" : "Editar Portfólio"}</span>
            </button>
          )}

          <button
            onClick={onContactClick}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#17151D] hover:bg-[#5425D8] rounded-lg transition-all duration-200 shadow-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
          >
            {nav.ctaButton}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#17151D] hover:text-[#5425D8] transition-colors"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#17151D]/10 bg-[#FAF8FF] px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-4 text-base font-medium text-[#17151D]">
            <a
              href="#sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#5425D8] py-1 border-b border-black/5"
            >
              {nav.about}
            </a>
            <a
              href="#manifesto"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#5425D8] py-1 border-b border-black/5"
            >
              {nav.manifesto}
            </a>
            <a
              href="#atuacao"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#5425D8] py-1 border-b border-black/5"
            >
              {nav.services}
            </a>
            <a
              href="#cases"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#5425D8] py-1 border-b border-black/5"
            >
              {nav.cases}
            </a>
          </nav>
          <div className="pt-2 space-y-2">
            {isDeveloper && onToggleEditMode && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isEditMode && onOpenEditor) onOpenEditor();
                  else onToggleEditMode();
                }}
                className={`w-full py-2.5 text-xs font-mono font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  isEditMode
                    ? "bg-[#5425D8] text-white"
                    : "bg-black/5 text-[#17151D]"
                }`}
              >
                <Edit3 className="w-4 h-4 text-[#FF5CBA]" />
                <span>{isEditMode ? "Abrir Painel de Edição" : "Ativar Modo de Edição"}</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onContactClick();
              }}
              className="w-full py-3 text-sm font-semibold uppercase tracking-wider text-white bg-[#17151D] hover:bg-[#5425D8] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {nav.ctaButton}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
