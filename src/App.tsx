/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from "react";
import {
  PortfolioData,
  ProjectItem,
  PersonalInfo,
  loadPortfolioData,
  savePortfolioData,
  saveServerPortfolioData,
  fetchServerPortfolioData,
  initialPortfolioContent,
} from "./data/portfolioContent";
import { Navbar } from "./components/Navbar";
import { HeroAbout } from "./components/HeroAbout";
import { Manifesto } from "./components/Manifesto";
import { Services } from "./components/Services";
import { ProjectsGallery } from "./components/ProjectsGallery";
import { ProjectDrawer } from "./components/ProjectDrawer";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { DeveloperAuthModal } from "./components/DeveloperAuthModal";
import { Edit3, Check, Link as LinkIcon, X, LogOut, Eye } from "lucide-react";

const EditorialEditorModal = lazy(() =>
  import("./components/EditorialEditorModal").then((m) => ({ default: m.EditorialEditorModal }))
);

export default function App() {
  const [data, setData] = useState<PortfolioData>(initialPortfolioContent);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [contactSubject, setContactSubject] = useState<string>("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState<"hero" | "services" | "cases" | "manifesto" | "contact">("hero");
  const [editorInitialCaseIndex, setEditorInitialCaseIndex] = useState<number>(0);
  
  // Developer Authentication Status:
  // ONLY true for Saullo on localhost/ais-dev, or if ?admin=true is passed, or if unlocked with password!
  const [isDeveloper, setIsDeveloper] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [copiedCleanLink, setCopiedCleanLink] = useState<boolean>(false);

  // Initialize and check for URL params or saved data
  useEffect(() => {
    // 1. Initial fast local load
    const loaded = loadPortfolioData();
    setData(loaded);

    // 2. Fetch shared server state so any visitor on any device gets latest changes
    fetchServerPortfolioData().then((serverData) => {
      if (serverData) {
        setData(serverData);
      }
    });

    if (typeof window !== "undefined") {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      const params = new URLSearchParams(window.location.search);
      const adminKey = params.get("admin") || params.get("key") || params.get("secret");
      const hasSecretKey =
        adminKey === "saullo" ||
        adminKey === "saullo.rosa" ||
        adminKey === "1234";

      const wantsEdit = params.get("edit") === "true" || params.get("admin") === "true";
      const hasStoredAuth = localStorage.getItem("saullo_dev_authorized") === "true";

      if (hasSecretKey) {
        setIsDeveloper(true);
        setIsEditMode(true);
        localStorage.setItem("saullo_dev_authorized", "true");
      } else if (hasStoredAuth || isLocalhost) {
        setIsDeveloper(true);
        setIsEditMode(wantsEdit || isLocalhost);
      } else {
        setIsDeveloper(false);
        setIsEditMode(false);
        if (wantsEdit) {
          // If someone specifically requested ?edit=true but is not yet authorized, prompt authentication
          setIsAuthModalOpen(true);
        }
      }

      // Secret developer shortcut: Ctrl+Shift+E or Cmd+Shift+E
      const handleShortcut = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
          e.preventDefault();
          if (localStorage.getItem("saullo_dev_authorized") === "true" || isLocalhost) {
            setIsDeveloper(true);
            setIsEditMode((prev) => !prev);
          } else {
            setIsAuthModalOpen(true);
          }
        }
      };
      window.addEventListener("keydown", handleShortcut);
      return () => window.removeEventListener("keydown", handleShortcut);
    }
  }, []);

  const handleUpdateData = (updated: PortfolioData) => {
    setData(updated);
    // Saves both in localStorage and broadcasts to server storage
    saveServerPortfolioData(updated);

    if (selectedProject) {
      const match = updated.projects.find((p) => p.id === selectedProject.id);
      if (match) setSelectedProject(match);
    }
  };

  const handleUpdatePersonalInfo = (updatedProps: Partial<PersonalInfo>) => {
    const updated = {
      ...data,
      personalInfo: {
        ...data.personalInfo,
        ...updatedProps,
      },
    };
    handleUpdateData(updated);
  };

  const handleResetData = () => {
    setData(initialPortfolioContent);
    saveServerPortfolioData(initialPortfolioContent);
    if (typeof window !== "undefined") {
      localStorage.removeItem("saullo_portfolio_data_v2");
    }
  };

  const handleSelectProject = (project: ProjectItem) => {
    setSelectedProject(project);
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
  };

  // Prev / Next project navigation inside drawer (Total 9 cases)
  const currentIndex = selectedProject
    ? data.projects.findIndex((p) => p.id === selectedProject.id)
    : -1;

  const handlePrevProject = () => {
    if (currentIndex > 0) {
      setSelectedProject(data.projects[currentIndex - 1]);
    }
  };

  const handleNextProject = () => {
    if (currentIndex >= 0 && currentIndex < data.projects.length - 1) {
      setSelectedProject(data.projects[currentIndex + 1]);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectServiceFromList = (serviceTitle: string) => {
    setContactSubject(serviceTitle);
    scrollToSection("contato");
  };

  const handleCopyPublicLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      navigator.clipboard.writeText(cleanUrl);
      setCopiedCleanLink(true);
      setTimeout(() => setCopiedCleanLink(false), 2500);
    }
  };

  return (
    <div id="topo" className="min-h-screen flex flex-col bg-[#FAF8FF] text-[#17151D] antialiased">
      {/* Floating Admin Banner (Exibido EXCLUSIVAMENTE para o desenvolvedor autorizado quando o modo de edição está ativo) */}
      {isDeveloper && isEditMode && (
        <div className="sticky top-0 z-50 bg-[#17151D] text-white px-4 py-2 text-xs font-mono border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5CBA] animate-pulse" />
            <span className="text-[#FF5CBA] font-semibold">Painel do Desenvolvedor:</span>
            <span className="text-white/70 hidden sm:inline">
              Altere fotos, testeira, textos e big numbers em tempo real.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditorInitialTab("hero");
                setIsEditorOpen(true);
              }}
              className="px-2.5 py-1 rounded bg-[#5425D8] hover:bg-[#8557FF] text-white flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Edit3 className="w-3 h-3" />
              Painel de Edição
            </button>

            <button
              onClick={handleCopyPublicLink}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Copiar link limpo para divulgar publicamente"
            >
              {copiedCleanLink ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  Link Copiado!
                </>
              ) : (
                <>
                  <LinkIcon className="w-3 h-3" />
                  Copiar Link Público
                </>
              )}
            </button>

            <button
              onClick={() => setIsEditMode(false)}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Pausar edição para visualizar como visitante público"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Ver como Visitante</span>
            </button>

            <button
              onClick={() => {
                setIsDeveloper(false);
                setIsEditMode(false);
                if (typeof window !== "undefined") {
                  localStorage.removeItem("saullo_dev_authorized");
                }
              }}
              className="p-1 text-white/50 hover:text-red-400 rounded hover:bg-white/10 cursor-pointer transition-colors"
              title="Encerrar sessão de desenvolvedor neste navegador"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header com Navegação Integrada (Botão de edição só aparece se isDeveloper === true) */}
      <Navbar
        onContactClick={() => scrollToSection("contato")}
        uiTexts={data.uiTexts}
        isDeveloper={isDeveloper}
        isEditMode={isDeveloper && isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onOpenEditor={() => {
          setEditorInitialTab("hero");
          setIsEditorOpen(true);
        }}
      />

      <main className="flex-1">
        {/* CAMADA 1: Hero / Informações Pessoais e Profissionais */}
        <HeroAbout
          personalInfo={data.personalInfo}
          uiTexts={data.uiTexts}
          onExploreCases={() => scrollToSection("cases")}
          onContactClick={() => scrollToSection("contato")}
          onUpdatePersonalInfo={handleUpdatePersonalInfo}
          onOpenEditor={() => {
            setEditorInitialTab("hero");
            setIsEditorOpen(true);
          }}
          isEditMode={isDeveloper && isEditMode}
        />

        {/* CAMADA 2: Auto-Manifesto */}
        <Manifesto
          manifesto={data.manifesto}
          isEditMode={isDeveloper && isEditMode}
          onOpenEditor={() => {
            setEditorInitialTab("manifesto");
            setIsEditorOpen(true);
          }}
        />

        {/* CAMADA 3: O que o Saullo Rosa pode fazer por mim? */}
        <Services
          services={data.services}
          uiTexts={data.uiTexts}
          onSelectService={handleSelectServiceFromList}
          isEditMode={isDeveloper && isEditMode}
          onOpenEditor={() => {
            setEditorInitialTab("services");
            setIsEditorOpen(true);
          }}
        />

        {/* CAMADA 4: Cases (Projetos com vídeos do YouTube executáveis e fotos) */}
        <ProjectsGallery
          projects={data.projects}
          uiTexts={data.uiTexts}
          onSelectProject={handleSelectProject}
          onOpenEditor={() => {
            setEditorInitialTab("cases");
            setIsEditorOpen(true);
          }}
          isEditMode={isDeveloper && isEditMode}
        />

        {/* Fechamento: Contato Direto & E-mail */}
        <Contact
          initialSubject={contactSubject}
          personalInfo={data.personalInfo}
          uiTexts={data.uiTexts}
          isEditMode={isDeveloper && isEditMode}
          onOpenEditor={() => {
            setEditorInitialTab("contact");
            setIsEditorOpen(true);
          }}
        />
      </main>

      {/* Rodapé Editorial (Com acesso discreto para o desenvolvedor) */}
      <Footer
        personalInfo={data.personalInfo}
        uiTexts={data.uiTexts}
        isDeveloper={isDeveloper}
        isEditMode={isDeveloper && isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onDeveloperUnlock={() => setIsAuthModalOpen(true)}
      />

      {/* Painel Lateral / Drawer de Estudo de Caso com Player de Vídeo do YouTube */}
      <ProjectDrawer
        project={selectedProject}
        onClose={handleCloseProject}
        onPrevProject={handlePrevProject}
        onNextProject={handleNextProject}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex >= 0 && currentIndex < data.projects.length - 1}
        onEditCase={(proj) => {
          const idx = data.projects.findIndex((p) => p.id === proj.id);
          if (idx !== -1) setEditorInitialCaseIndex(idx);
          setEditorInitialTab("cases");
          setIsEditorOpen(true);
        }}
        isEditMode={isDeveloper && isEditMode}
      />

      {/* Modal Geral de Edição Editorial */}
      {isEditorOpen && (
        <Suspense fallback={null}>
          <EditorialEditorModal
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            data={data}
            onSave={handleUpdateData}
            onReset={handleResetData}
            initialTab={editorInitialTab}
            initialCaseIndex={editorInitialCaseIndex}
          />
        </Suspense>
      )}

      {/* Modal de Autenticação do Desenvolvedor (Saullo) */}
      <DeveloperAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsDeveloper(true);
          setIsEditMode(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("saullo_dev_authorized", "true");
          }
        }}
      />
    </div>
  );
}
