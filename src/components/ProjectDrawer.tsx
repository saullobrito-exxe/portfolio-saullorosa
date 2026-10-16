import React, { useEffect, useState } from "react";
import { ProjectItem } from "../data/portfolioContent";
import { X, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Share2, Check, Edit3, Video, Image as ImageIcon } from "lucide-react";
import { MediaRenderer } from "./MediaRenderer";

interface ProjectDrawerProps {
  project: ProjectItem | null;
  onClose: () => void;
  onPrevProject: () => void;
  onNextProject: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onEditCase?: (project: ProjectItem) => void;
  isEditMode?: boolean;
}

export const ProjectDrawer: React.FC<ProjectDrawerProps> = ({
  project,
  onClose,
  onPrevProject,
  onNextProject,
  hasPrev,
  hasNext,
  onEditCase,
  isEditMode = false,
}) => {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [project?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrevProject();
      if (e.key === "ArrowRight" && hasNext) onNextProject();
    };

    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose, onPrevProject, onNextProject, hasPrev, hasNext]);

  if (!project) return null;

  const currentMedia = project.featuredMedia[activeMediaIndex] || {
    type: "image",
    url: project.coverImage,
    caption: project.title,
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17151D]/60 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Drawer Container (Editorial Slide-over panel) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className="relative z-50 w-full max-w-4xl bg-[#FAF8FF] text-[#17151D] shadow-2xl h-full flex flex-col border-l border-[#17151D]/15 overflow-hidden animate-slideInRight"
      >
        {/* Sticky Top Header Bar with navigation & close */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#FAF8FF]/95 backdrop-blur-md border-b border-[#17151D]/10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#5425D8] font-semibold">
              Estudo de Caso Editorial
            </span>
            <span className="text-xs text-[#17151D]/40">·</span>
            <span className="text-xs text-[#17151D]/70 font-medium">
              {project.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onEditCase && isEditMode && (
              <button
                onClick={() => onEditCase(project)}
                className="px-2.5 py-1.5 text-xs text-[#5425D8] bg-[#EAF0FF] hover:bg-[#5425D8] hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-mono"
                title="Editar este case"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar Case</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 text-xs text-[#17151D]/70 hover:text-[#5425D8] hover:bg-black/5 rounded-lg transition-colors flex items-center gap-1.5"
              title="Copiar link do case"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">Copiado</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">Compartilhar</span>
                </>
              )}
            </button>

            {/* Prev Case Button */}
            <button
              onClick={onPrevProject}
              disabled={!hasPrev}
              className={`p-2 rounded-lg transition-colors ${
                hasPrev
                  ? "text-[#17151D] hover:bg-black/5 cursor-pointer"
                  : "text-[#17151D]/20 cursor-not-allowed"
              }`}
              title="Caso anterior (Seta esquerda)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Case Button */}
            <button
              onClick={onNextProject}
              disabled={!hasNext}
              className={`p-2 rounded-lg transition-colors ${
                hasNext
                  ? "text-[#17151D] hover:bg-black/5 cursor-pointer"
                  : "text-[#17151D]/20 cursor-not-allowed"
              }`}
              title="Próximo caso (Seta direita)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-[#17151D]/80 hover:text-white hover:bg-[#5425D8] rounded-lg transition-all ml-1 cursor-pointer"
              title="Fechar (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          {/* Project Title & Client Header */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-[#8557FF]">
              Cliente: <strong className="text-[#17151D]">{project.client}</strong>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-[#17151D] leading-[1.15] [text-wrap:balance]">
              {project.title}
            </h2>
            <p className="text-base sm:text-lg text-[#17151D]/75 leading-relaxed font-normal">
              {project.shortDescription}
            </p>
          </div>

          {/* Featured Media Showcase (Supports Executable YouTube Video Embeds & Images) */}
          <div className="space-y-3">
            <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-black border border-[#17151D]/15 shadow-md">
              <MediaRenderer
                url={currentMedia.url}
                type={currentMedia.type}
                alt={currentMedia.caption || project.title}
                caption={currentMedia.caption}
              />
            </div>

            {/* Caption */}
            {currentMedia.caption && (
              <p className="text-xs text-[#17151D]/70 font-mono tracking-tight px-1 flex items-center gap-1.5">
                {currentMedia.type === "video" || currentMedia.url.includes("youtu") ? (
                  <Video className="w-3.5 h-3.5 text-[#5425D8]" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-[#8557FF]" />
                )}
                {currentMedia.caption}
              </p>
            )}

            {/* Media Pagination / Selector if multiple items exist */}
            {project.featuredMedia.length > 1 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-mono text-[#17151D]/50 mr-2">Mídias:</span>
                {project.featuredMedia.map((m, mIdx) => {
                  const isVid = m.type === "video" || m.url.includes("youtu");
                  const isActive = activeMediaIndex === mIdx;

                  return (
                    <button
                      key={mIdx}
                      onClick={() => setActiveMediaIndex(mIdx)}
                      className={`px-3 py-1 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-[#5425D8] text-white shadow-xs"
                          : "bg-white text-[#17151D]/70 border border-[#17151D]/10 hover:bg-black/5"
                      }`}
                    >
                      {isVid ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                      <span>{isVid ? "Vídeo" : "Foto"} #{mIdx + 1}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Case Study Structured Breakdown (Editorial Architecture) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* 1. Contexto */}
            <div className="space-y-2 p-6 rounded-xl bg-white border border-[#17151D]/10">
              <span className="text-xs font-mono uppercase tracking-wider text-[#5425D8] font-bold">
                01. Contexto de Mercado
              </span>
              <p className="text-sm text-[#17151D]/85 leading-relaxed">
                {project.context}
              </p>
            </div>

            {/* 2. Desafio */}
            <div className="space-y-2 p-6 rounded-xl bg-white border border-[#17151D]/10">
              <span className="text-xs font-mono uppercase tracking-wider text-[#FF5CBA] font-bold">
                02. O Desafio Crítico
              </span>
              <p className="text-sm text-[#17151D]/85 leading-relaxed">
                {project.challenge}
              </p>
            </div>

            {/* 3. Diagnóstico */}
            <div className="space-y-2 p-6 rounded-xl bg-white border border-[#17151D]/10">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8557FF] font-bold">
                03. Diagnóstico Estratégico
              </span>
              <p className="text-sm text-[#17151D]/85 leading-relaxed">
                {project.diagnosis}
              </p>
            </div>

            {/* 4. Raciocínio (Reasoning) */}
            <div className="space-y-2 p-6 rounded-xl bg-white border border-[#17151D]/10">
              <span className="text-xs font-mono uppercase tracking-wider text-[#326BFF] font-bold">
                04. Raciocínio & Tese Central
              </span>
              <p className="text-sm text-[#17151D]/85 leading-relaxed">
                {project.reasoning}
              </p>
            </div>
          </div>

          {/* Full-width Section: Estratégia e Execução */}
          <div className="space-y-6 pt-2">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#EAF0FF]/60 via-white to-[#FAF8FF] border border-[#5425D8]/20 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#5425D8] font-bold">
                05. Estratégia Adotada
              </span>
              <p className="text-base text-[#17151D]/90 leading-relaxed font-medium">
                {project.strategy}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#17151D]/10 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#17151D] font-bold">
                06. Execução em Campo
              </span>
              <p className="text-sm sm:text-base text-[#17151D]/80 leading-relaxed">
                {project.execution}
              </p>
            </div>
          </div>

          {/* Impacto & Aprendizados (High-Contrast Editorial Callouts) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Impacto */}
            <div className="p-6 rounded-2xl bg-[#5425D8] text-white space-y-2 shadow-md">
              <span className="text-xs font-mono uppercase tracking-wider text-[#FF5CBA] font-bold">
                07. Impacto & Resultados Mensurados
              </span>
              <p className="text-base font-semibold leading-relaxed text-white">
                {project.impact}
              </p>
            </div>

            {/* Aprendizados */}
            <div className="p-6 rounded-2xl bg-[#17151D] text-white space-y-2 shadow-md">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8557FF] font-bold">
                08. Principais Aprendizados
              </span>
              <p className="text-sm leading-relaxed text-white/90">
                {project.learnings}
              </p>
            </div>
          </div>

          {/* Tags (Zero-Pill: Clean unboxed metadata with typographic separators) */}
          <div className="pt-6 border-t border-[#17151D]/10 flex flex-wrap items-center gap-2 text-xs font-mono text-[#17151D]/60">
            <span className="font-semibold text-[#5425D8]">Tags Estratégicas:</span>
            {project.tags.map((tag, tIdx) => (
              <React.Fragment key={tIdx}>
                <span>{tag}</span>
                {tIdx < project.tags.length - 1 && <span aria-hidden="true">·</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Footer Navigation within Drawer */}
          <div className="pt-8 flex items-center justify-between border-t border-[#17151D]/10">
            <button
              onClick={onPrevProject}
              disabled={!hasPrev}
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                hasPrev
                  ? "text-[#5425D8] hover:text-[#8557FF] cursor-pointer"
                  : "text-[#17151D]/20 cursor-not-allowed"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Caso Anterior
            </button>

            <button
              onClick={onNextProject}
              disabled={!hasNext}
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                hasNext
                  ? "text-[#5425D8] hover:text-[#8557FF] cursor-pointer"
                  : "text-[#17151D]/20 cursor-not-allowed"
              }`}
            >
              Próximo Caso
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
