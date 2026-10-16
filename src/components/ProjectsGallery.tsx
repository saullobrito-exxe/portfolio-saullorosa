import React, { useState, useMemo } from "react";
import { ProjectCategory, ProjectItem, UiTexts } from "../data/portfolioContent";
import { ArrowUpRight, Search, Filter, Video } from "lucide-react";
import { LazyImage } from "./LazyImage";

interface ProjectsGalleryProps {
  projects: ProjectItem[];
  uiTexts: UiTexts;
  onSelectProject: (project: ProjectItem) => void;
  onOpenEditor?: () => void;
  isEditMode?: boolean;
}

export const ProjectsGallery: React.FC<ProjectsGalleryProps> = ({
  projects,
  uiTexts,
  onSelectProject,
  onOpenEditor,
  isEditMode = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | "Todos">("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: (ProjectCategory | "Todos")[] = [
    "Todos",
    "Branding e Comunicação",
    "Palestras",
    "Gestão de PR"
  ];

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      Todos: projects.length,
      "Branding e Comunicação": projects.filter((p) => p.category === "Branding e Comunicação").length,
      Palestras: projects.filter((p) => p.category === "Palestras").length,
      "Gestão de PR": projects.filter((p) => p.category === "Gestão de PR").length,
    };
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      const matchesCategory =
        activeCategory === "Todos" || item.category === activeCategory;
      const matchesQuery =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesQuery;
    });
  }, [projects, activeCategory, searchQuery]);

  return (
    <section id="cases" className="py-16 md:py-24 max-w-7xl mx-auto px-6 border-b border-[#17151D]/10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-[#5425D8]">
            {uiTexts.cases.kicker}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-[#17151D] tracking-tight [text-wrap:balance]">
            {uiTexts.cases.title}
          </h2>
          <p className="text-sm text-[#17151D]/70 leading-relaxed">
            {uiTexts.cases.subtitle}
          </p>
        </div>

        {/* Quick Search Input & Editor Button */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px] max-w-xs">
            <Search className="w-4 h-4 text-[#17151D]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar case, cliente ou tag..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#17151D]/15 rounded-xl text-[#17151D] placeholder:text-[#17151D]/40 focus:outline-hidden focus:ring-2 focus:ring-[#5425D8]/30 transition-all shadow-xs"
            />
          </div>

          {onOpenEditor && isEditMode && (
            <button
              onClick={onOpenEditor}
              className="px-3.5 py-2 text-xs font-mono font-semibold text-[#5425D8] bg-[#EAF0FF] hover:bg-[#5425D8] hover:text-white rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Editar Cases
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs (Segmented Control / Interactive Filter) */}
      <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-[#17151D]/10">
        <div className="flex items-center gap-1.5 mr-3 text-xs font-mono text-[#17151D]/60 hidden sm:flex">
          <Filter className="w-3.5 h-3.5" />
          Filtrar:
        </div>
        {categories.map((cat) => {
          const count = categoryCounts[cat];
          const isActive = activeCategory === cat;
          const label = cat === "Todos" ? uiTexts.cases.filterAll : cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-[#5425D8] text-white shadow-xs font-semibold"
                  : "bg-white text-[#17151D]/70 hover:text-[#17151D] hover:bg-white/90 border border-[#17151D]/10"
              }`}
            >
              <span>{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? "bg-white/20 text-white" : "bg-black/5 text-[#17151D]/60"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#17151D]/10">
          <p className="text-base font-semibold text-[#17151D]">Nenhum estudo de caso encontrado.</p>
          <p className="text-xs text-[#17151D]/60">Tente buscar por outro termo ou limpe os filtros de categoria.</p>
          <button
            onClick={() => {
              setActiveCategory("Todos");
              setSearchQuery("");
            }}
            className="px-4 py-2 text-xs font-medium text-[#5425D8] bg-[#EAF0FF] rounded-lg mt-2 cursor-pointer"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project) => {
            const hasVideo = project.featuredMedia.some(
              (m) => m.type === "video" || m.url.includes("youtu")
            );

            return (
              <article
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group flex flex-col bg-white rounded-2xl border border-[#17151D]/10 hover:border-[#5425D8]/40 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer active:scale-99"
              >
                {/* Card Media Preview */}
                <div className="relative w-full aspect-16/10 bg-[#17151D] overflow-hidden">
                  <LazyImage
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                    {/* Unboxed Metadata (Category & Client) */}
                    <div className="text-white text-xs font-mono space-x-1 flex items-center justify-between w-full">
                      <div>
                        <span className="text-[#FF5CBA] font-semibold">{project.category}</span>
                        <span className="text-white/40"> / </span>
                        <span className="text-white/80">{project.client}</span>
                      </div>
                      {hasVideo && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-[#FF5CBA] bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          <Video className="w-3 h-3" /> Vídeo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold font-display text-[#17151D] group-hover:text-[#5425D8] transition-colors line-clamp-2 leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#17151D]/70 line-clamp-3 leading-relaxed">
                      {project.shortDescription}
                    </p>
                  </div>

                  {/* Footer Action and Tag */}
                  <div className="pt-3 border-t border-[#17151D]/5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#5425D8] group-hover:text-[#8557FF] flex items-center gap-1">
                      {uiTexts.cases.viewCaseButton}
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                    <span className="text-[11px] font-mono text-[#17151D]/50">
                      {project.tags[0]}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
