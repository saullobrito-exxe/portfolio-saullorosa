import React, { useState, useEffect } from "react";
import { PortfolioData, ProjectItem, ServiceItem, ProjectCategory } from "../data/portfolioContent";
import { X, Save, Upload, Plus, Trash2, Check, Video, Image as ImageIcon, RotateCcw, Link as LinkIcon, Download, UploadCloud } from "lucide-react";
import { compressImage } from "../utils/imageOptimizer";
import { LazyImage } from "./LazyImage";

export type EditorTab = "hero" | "services" | "cases" | "manifesto" | "contact";

interface EditorialEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
  onSave: (updated: PortfolioData) => void;
  onReset: () => void;
  initialTab?: EditorTab;
  initialCaseIndex?: number;
}

export const EditorialEditorModal: React.FC<EditorialEditorModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  onReset,
  initialTab = "hero",
  initialCaseIndex = 0,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab);
  const [formData, setFormData] = useState<PortfolioData>(data);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(initialCaseIndex);
  const [savedAlert, setSavedAlert] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Sync state whenever modal is opened or data changes
  useEffect(() => {
    setFormData(data);
    setActiveTab(initialTab);
    if (initialCaseIndex >= 0 && initialCaseIndex < data.projects.length) {
      setSelectedCaseIndex(initialCaseIndex);
    }
  }, [data, isOpen, initialTab, initialCaseIndex]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 800);
  };

  const handleExportBackup = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `saullo-rosa-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === "object" && parsed.personalInfo && parsed.projects) {
          setFormData(parsed);
          alert("Backup carregado com sucesso no editor! Clique em 'Salvar' para gravar no servidor.");
        } else {
          alert("Arquivo JSON inválido. Verifique o formato do arquivo.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (url: string) => void,
    isAvatar = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, {
        maxWidth: isAvatar ? 800 : 1600,
        maxHeight: isAvatar ? 800 : 1200,
        quality: 0.82,
        mimeType: "image/webp",
      });
      onComplete(compressed);
    } catch (err) {
      console.error("Falha ao comprimir imagem:", err);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) onComplete(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const safeCaseIndex = Math.min(Math.max(0, selectedCaseIndex), Math.max(0, formData.projects.length - 1));
  const currentCase = formData.projects[safeCaseIndex] || formData.projects[0];

  const updateCurrentCase = (updatedProps: Partial<ProjectItem>) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[safeCaseIndex] = {
      ...updatedProjects[safeCaseIndex],
      ...updatedProps,
    };
    setFormData({ ...formData, projects: updatedProjects });
  };

  const handleAddNewCase = () => {
    const newId = `case-${Date.now()}`;
    const newCase: ProjectItem = {
      id: newId,
      title: "Novo Estudo de Caso Editorial",
      client: "Novo Cliente",
      category: "Branding e Comunicação",
      shortDescription: "Descrição concisa dos resultados obtidos.",
      coverImage: "/assets/images/project_branding_case_1791888388544.jpg",
      featuredMedia: [
        {
          type: "image",
          url: "/assets/images/project_branding_case_1791888388544.jpg",
          caption: "Mídia de destaque",
        },
      ],
      context: "Contexto e histórico da organização.",
      challenge: "Desafio estratégico identificado.",
      diagnosis: "Diagnóstico técnico e análise de cenário.",
      reasoning: "Raciocínio metodológico aplicado.",
      strategy: "Estratégia editorial desenvolvida.",
      execution: "Execução tática e desdobramentos.",
      impact: "Métricas e resultados alcançados.",
      learnings: "Aprendizados consolidados.",
      tags: ["Estratégia", "Comunicação", "Inovação"],
    };
    const updated = [...formData.projects, newCase];
    setFormData({ ...formData, projects: updated });
    setSelectedCaseIndex(updated.length - 1);
  };

  const handleDeleteCurrentCase = () => {
    if (formData.projects.length <= 1) {
      alert("É necessário manter pelo menos 1 case no portfólio.");
      return;
    }
    if (confirm(`Deseja realmente excluir o case "${currentCase.title}"?`)) {
      const updated = formData.projects.filter((_, idx) => idx !== safeCaseIndex);
      setFormData({ ...formData, projects: updated });
      setSelectedCaseIndex(Math.max(0, safeCaseIndex - 1));
    }
  };

  const addMediaToCurrentCase = (type: "video" | "image" = "video") => {
    const newMedia = [
      ...currentCase.featuredMedia,
      {
        type,
        url: type === "video" ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : "/assets/images/project_branding_case_1791888388544.jpg",
        caption: type === "video" ? "Vídeo demonstrativo" : "Foto do projeto",
      },
    ];
    updateCurrentCase({ featuredMedia: newMedia });
  };

  const removeMediaFromCurrentCase = (index: number) => {
    const newMedia = currentCase.featuredMedia.filter((_, i) => i !== index);
    updateCurrentCase({ featuredMedia: newMedia });
  };

  const handleAddNewService = () => {
    const nextNum = String(formData.services.length + 1).padStart(2, "0");
    const newService: ServiceItem = {
      id: `svc-${Date.now()}`,
      number: nextNum,
      title: "Nova Disciplina de Atuação",
      shortDescription: "Descrição detalhada do escopo e geração de valor.",
      keyDeliverable: "Entregável Chave",
    };
    setFormData({ ...formData, services: [...formData.services, newService] });
  };

  const handleRemoveService = (index: number) => {
    if (formData.services.length <= 1) {
      alert("É necessário manter pelo menos 1 disciplina de atuação.");
      return;
    }
    const updated = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17151D]/70 backdrop-blur-xs"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Editor de Conteúdo"
        className="relative z-50 w-full max-w-5xl bg-[#FAF8FF] text-[#17151D] rounded-3xl shadow-2xl border border-[#17151D]/15 max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#17151D]/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold font-display text-[#17151D]">
              Editor de Conteúdo Integral
            </h2>
            <p className="text-xs text-[#17151D]/60 font-mono">
              Edite textos, títulos, fotos e vídeos de todas as seções do portfólio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#5425D8] hover:bg-[#8557FF] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {savedAlert ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#17151D]/70 hover:text-black rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
              title="Fechar editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#FAF8FF] border-b border-[#17151D]/10 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab("hero")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 cursor-pointer ${
              activeTab === "hero"
                ? "bg-[#5425D8] text-white"
                : "text-[#17151D]/70 hover:bg-black/5"
            }`}
          >
            01. Perfil, Fotos & Testeira
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 cursor-pointer ${
              activeTab === "services"
                ? "bg-[#5425D8] text-white"
                : "text-[#17151D]/70 hover:bg-black/5"
            }`}
          >
            02. O que Saullo Pode Fazer Por Mim
          </button>
          <button
            onClick={() => setActiveTab("cases")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 cursor-pointer ${
              activeTab === "cases"
                ? "bg-[#5425D8] text-white"
                : "text-[#17151D]/70 hover:bg-black/5"
            }`}
          >
            03. Cases, Fotos & Vídeos ({formData.projects.length})
          </button>
          <button
            onClick={() => setActiveTab("manifesto")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 cursor-pointer ${
              activeTab === "manifesto"
                ? "bg-[#5425D8] text-white"
                : "text-[#17151D]/70 hover:bg-black/5"
            }`}
          >
            04. Auto-Manifesto
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 cursor-pointer ${
              activeTab === "contact"
                ? "bg-[#5425D8] text-white"
                : "text-[#17151D]/70 hover:bg-black/5"
            }`}
          >
            05. Contato, Redes & Rodapé
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: HERO / PERFIL / FOTO / TESTEIRA */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              {/* Fotos Principais (Upload de arquivo OU URL direta) */}
              <div className="p-5 rounded-2xl bg-white border border-[#17151D]/10 space-y-4">
                <h3 className="text-sm font-bold font-display text-[#17151D]">
                  Fotos Principais (Foto de Perfil & Foto de Testeira)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Foto de Perfil */}
                  <div className="space-y-2 p-3 bg-[#FAF8FF] rounded-xl border border-[#17151D]/10">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#5425D8] font-semibold block">
                      Foto de Perfil / Retrato
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-18 h-18 rounded-2xl overflow-hidden bg-[#17151D] border border-[#17151D]/15 flex items-center justify-center shrink-0">
                        {formData.personalInfo.photoUrl ? (
                          <LazyImage
                            src={formData.personalInfo.photoUrl}
                            alt="Preview Perfil"
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-white/50 text-center px-1">
                            Arte IA Autoral
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5425D8] hover:bg-[#8557FF] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            {isCompressing ? "Processando..." : "Upload Arquivo"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(
                                  e,
                                  (url) => {
                                    setFormData({
                                      ...formData,
                                      personalInfo: { ...formData.personalInfo, photoUrl: url },
                                    });
                                  },
                                  true
                                )
                              }
                            />
                          </label>
                          {formData.personalInfo.photoUrl && (
                            <button
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  personalInfo: { ...formData.personalInfo, photoUrl: null },
                                })
                              }
                              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Remover foto e usar arte generativa"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formData.personalInfo.photoUrl || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              personalInfo: {
                                ...formData.personalInfo,
                                photoUrl: e.target.value.trim() || null,
                              },
                            })
                          }
                          placeholder="Ou cole a URL direta da foto"
                          className="w-full px-2.5 py-1 text-xs bg-white border border-[#17151D]/15 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Foto de Testeira */}
                  <div className="space-y-2 p-3 bg-[#FAF8FF] rounded-xl border border-[#17151D]/10">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#5425D8] font-semibold block">
                      Foto de Testeira (Banner Superior)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-[#17151D] border border-[#17151D]/15 flex items-center justify-center shrink-0">
                        {formData.personalInfo.headerBannerUrl ? (
                          <LazyImage
                            src={formData.personalInfo.headerBannerUrl}
                            alt="Preview Testeira"
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-white/50 text-center px-1">
                            Gradiente Padrão
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5425D8] hover:bg-[#8557FF] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            {isCompressing ? "Processando..." : "Upload Arquivo"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(
                                  e,
                                  (url) => {
                                    setFormData({
                                      ...formData,
                                      personalInfo: { ...formData.personalInfo, headerBannerUrl: url },
                                    });
                                  },
                                  false
                                )
                              }
                            />
                          </label>
                          {formData.personalInfo.headerBannerUrl && (
                            <button
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  personalInfo: { ...formData.personalInfo, headerBannerUrl: null },
                                })
                              }
                              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Remover testeira"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formData.personalInfo.headerBannerUrl || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              personalInfo: {
                                ...formData.personalInfo,
                                headerBannerUrl: e.target.value.trim() || null,
                              },
                            })
                          }
                          placeholder="Ou cole a URL direta do banner"
                          className="w-full px-2.5 py-1 text-xs bg-white border border-[#17151D]/15 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#17151D]/70">
                    Legenda da Foto / Badge de Identidade
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.photoCaption}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, photoCaption: e.target.value },
                      })
                    }
                    placeholder="Ex: Foto autoral ou identificador do cargo"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                  />
                </div>
              </div>

              {/* Informações Principais do Hero */}
              <div className="p-5 rounded-2xl bg-white border border-[#17151D]/10 space-y-4">
                <h3 className="text-sm font-bold font-display text-[#17151D]">
                  Textos do Hero & Apresentação
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">
                      Kicker Superior do Hero
                    </label>
                    <input
                      type="text"
                      value={formData.uiTexts.hero.kicker}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            hero: { ...formData.uiTexts.hero, kicker: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Nome Completo</label>
                    <input
                      type="text"
                      value={formData.personalInfo.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Cargo / Título</label>
                    <input
                      type="text"
                      value={formData.personalInfo.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, role: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Headline de Posicionamento</label>
                    <input
                      type="text"
                      value={formData.personalInfo.headline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, headline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Minibio Principal</label>
                    <textarea
                      rows={3}
                      value={formData.personalInfo.bioShort}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, bioShort: e.target.value },
                        })
                      }
                      className="w-full p-3 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Trajetória / Sobre</label>
                    <textarea
                      rows={3}
                      value={formData.personalInfo.aboutStory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, aboutStory: e.target.value },
                        })
                      }
                      className="w-full p-3 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Localização</label>
                    <input
                      type="text"
                      value={formData.personalInfo.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, location: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">LinkedIn URL</label>
                    <input
                      type="text"
                      value={formData.personalInfo.linkedinUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, linkedinUrl: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Big Numbers & Métricas de Impacto */}
              <div className="p-5 rounded-2xl bg-white border border-[#17151D]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-display text-[#17151D]">
                    Big Numbers & Métricas de Impacto
                  </h3>
                  <span className="text-[11px] font-mono text-[#8557FF]">
                    Faixa de Destaque no Hero
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.personalInfo.stats.map((stat, sIdx) => (
                    <div key={sIdx} className="p-3.5 bg-[#FAF8FF] rounded-xl border border-[#17151D]/10 space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-[#5425D8] font-semibold">
                          Valor (Métrica #{sIdx + 1})
                        </label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const updatedStats = [...formData.personalInfo.stats];
                            updatedStats[sIdx] = { ...updatedStats[sIdx], value: e.target.value };
                            setFormData({
                              ...formData,
                              personalInfo: { ...formData.personalInfo, stats: updatedStats },
                            });
                          }}
                          className="w-full px-2.5 py-1 text-sm font-bold font-display bg-white border border-[#17151D]/15 rounded text-[#5425D8]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-[#17151D]/70">
                          Rótulo / Título
                        </label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const updatedStats = [...formData.personalInfo.stats];
                            updatedStats[sIdx] = { ...updatedStats[sIdx], label: e.target.value };
                            setFormData({
                              ...formData,
                              personalInfo: { ...formData.personalInfo, stats: updatedStats },
                            });
                          }}
                          className="w-full px-2.5 py-1 text-xs bg-white border border-[#17151D]/15 rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-[#17151D]/70">
                          Detalhe / Contexto
                        </label>
                        <input
                          type="text"
                          value={stat.detail}
                          onChange={(e) => {
                            const updatedStats = [...formData.personalInfo.stats];
                            updatedStats[sIdx] = { ...updatedStats[sIdx], detail: e.target.value };
                            setFormData({
                              ...formData,
                              personalInfo: { ...formData.personalInfo, stats: updatedStats },
                            });
                          }}
                          className="w-full px-2.5 py-1 text-xs bg-white border border-[#17151D]/15 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de Ação do Hero (CTAs) */}
              <div className="p-5 rounded-2xl bg-white border border-[#17151D]/10 space-y-3">
                <h3 className="text-sm font-bold font-display text-[#17151D]">
                  Textos dos Botões de Ação (Hero)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[#17151D]/70">Botão Primário</label>
                    <input
                      type="text"
                      value={formData.uiTexts.hero.ctaPrimary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            hero: { ...formData.uiTexts.hero, ctaPrimary: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[#17151D]/70">Botão Secundário</label>
                    <input
                      type="text"
                      value={formData.uiTexts.hero.ctaSecondary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            hero: { ...formData.uiTexts.hero, ctaSecondary: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[#17151D]/70">Botão LinkedIn</label>
                    <input
                      type="text"
                      value={formData.uiTexts.hero.ctaLinkedin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            hero: { ...formData.uiTexts.hero, ctaLinkedin: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATUAÇÃO / O QUE SAULLO PODE FAZER POR MIM */}
          {activeTab === "services" && (
            <div className="space-y-6">
              {/* Header da Seção */}
              <div className="p-5 rounded-2xl bg-white border border-[#17151D]/10 space-y-4">
                <h3 className="text-sm font-bold font-display text-[#17151D]">
                  Cabeçalho da Seção de Atuação
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Kicker da Seção</label>
                    <input
                      type="text"
                      value={formData.uiTexts.services.kicker}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            services: { ...formData.uiTexts.services, kicker: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#5425D8] font-bold">
                      Título Principal da Seção
                    </label>
                    <input
                      type="text"
                      value={formData.uiTexts.services.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            services: { ...formData.uiTexts.services, title: e.target.value },
                          },
                        })
                      }
                      placeholder="O que o Saullo Rosa pode fazer por mim?"
                      className="w-full px-3 py-2 text-sm font-bold bg-[#FAF8FF] border border-[#5425D8]/40 rounded-lg text-[#17151D]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Subtítulo</label>
                    <textarea
                      rows={2}
                      value={formData.uiTexts.services.subtitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            services: { ...formData.uiTexts.services, subtitle: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Lista de Disciplinas */}
              <div className="p-5 rounded-2xl bg-white border border-[#17151D]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-display text-[#17151D]">
                    Disciplinas e Serviços Cadastrados ({formData.services.length})
                  </h3>
                  <button
                    onClick={handleAddNewService}
                    className="px-3 py-1 text-xs font-semibold text-white bg-[#5425D8] hover:bg-[#8557FF] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Disciplina
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.services.map((svc, sIdx) => (
                    <div key={svc.id} className="p-4 bg-[#FAF8FF] rounded-xl border border-[#17151D]/10 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={svc.number}
                            onChange={(e) => {
                              const updated = [...formData.services];
                              updated[sIdx] = { ...updated[sIdx], number: e.target.value };
                              setFormData({ ...formData, services: updated });
                            }}
                            className="w-12 px-2 py-1 text-xs font-mono font-bold text-[#8557FF] bg-white border border-[#17151D]/15 rounded text-center"
                          />
                          <input
                            type="text"
                            value={svc.title}
                            onChange={(e) => {
                              const updated = [...formData.services];
                              updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                              setFormData({ ...formData, services: updated });
                            }}
                            placeholder="Título da disciplina"
                            className="flex-1 px-3 py-1 text-xs font-bold font-display bg-white border border-[#17151D]/15 rounded"
                          />
                        </div>

                        <button
                          onClick={() => handleRemoveService(sIdx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Excluir disciplina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-[#17151D]/60">Descrição</label>
                          <textarea
                            rows={2}
                            value={svc.shortDescription}
                            onChange={(e) => {
                              const updated = [...formData.services];
                              updated[sIdx] = { ...updated[sIdx], shortDescription: e.target.value };
                              setFormData({ ...formData, services: updated });
                            }}
                            placeholder="Descrição sucinta da disciplina"
                            className="w-full p-2 text-xs bg-white border border-[#17151D]/15 rounded resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-[#17151D]/60">Entregável Chave (Badge)</label>
                          <input
                            type="text"
                            value={svc.keyDeliverable}
                            onChange={(e) => {
                              const updated = [...formData.services];
                              updated[sIdx] = { ...updated[sIdx], keyDeliverable: e.target.value };
                              setFormData({ ...formData, services: updated });
                            }}
                            placeholder="Ex: Playbook Estratégico"
                            className="w-full px-2.5 py-1 text-xs bg-white border border-[#17151D]/15 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CASES / PROJETOS / VÍDEOS & FOTOS */}
          {activeTab === "cases" && (
            <div className="space-y-6">
              {/* Header da Seção de Cases */}
              <div className="p-4 rounded-2xl bg-white border border-[#17151D]/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-mono uppercase text-[#5425D8] font-bold">
                    Cabeçalho da Galeria de Cases
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddNewCase}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5425D8] hover:bg-[#8557FF] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Criar Novo Case
                    </button>
                    <button
                      onClick={handleDeleteCurrentCase}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir Case Atual
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={formData.uiTexts.cases.kicker}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        uiTexts: {
                          ...formData.uiTexts,
                          cases: { ...formData.uiTexts.cases, kicker: e.target.value },
                        },
                      })
                    }
                    placeholder="Kicker (ex: Estudos de Caso)"
                    className="px-2.5 py-1.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.uiTexts.cases.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        uiTexts: {
                          ...formData.uiTexts,
                          cases: { ...formData.uiTexts.cases, title: e.target.value },
                        },
                      })
                    }
                    placeholder="Título da seção de cases"
                    className="px-2.5 py-1.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg font-semibold"
                  />
                  <input
                    type="text"
                    value={formData.uiTexts.cases.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        uiTexts: {
                          ...formData.uiTexts,
                          cases: { ...formData.uiTexts.cases, subtitle: e.target.value },
                        },
                      })
                    }
                    placeholder="Subtítulo da seção"
                    className="px-2.5 py-1.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                  />
                </div>
              </div>

              {/* Seletor de Cases */}
              <div className="p-4 rounded-2xl bg-white border border-[#17151D]/10">
                <label className="text-xs font-mono uppercase tracking-wider text-[#5425D8] font-semibold block mb-2">
                  Selecione o Case para Editar ({formData.projects.length} no Total):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {formData.projects.map((proj, idx) => (
                    <button
                      key={proj.id}
                      onClick={() => setSelectedCaseIndex(idx)}
                      className={`p-3 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                        safeCaseIndex === idx
                          ? "bg-[#5425D8] text-white border-[#5425D8] font-semibold shadow-xs"
                          : "bg-[#FAF8FF] border-[#17151D]/10 hover:border-[#5425D8]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-75 font-mono mb-1">
                        <span>Case 0{idx + 1}</span>
                        <span>{proj.category}</span>
                      </div>
                      <p className="truncate font-display">{proj.title}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulário do Case Selecionado */}
              <div className="p-5 rounded-2xl bg-white border border-[#17151D]/10 space-y-4">
                <div className="flex items-center justify-between border-b border-[#17151D]/10 pb-3">
                  <div>
                    <span className="text-xs font-mono text-[#8557FF] font-semibold">
                      Editando Case #{safeCaseIndex + 1}:
                    </span>
                    <h3 className="text-base font-bold font-display text-[#17151D]">
                      {currentCase.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#17151D]/60">
                    Cliente: {currentCase.client}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Título do Case</label>
                    <input
                      type="text"
                      value={currentCase.title}
                      onChange={(e) => updateCurrentCase({ title: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Cliente / Organização</label>
                    <input
                      type="text"
                      value={currentCase.client}
                      onChange={(e) => updateCurrentCase({ client: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Categoria</label>
                    <select
                      value={currentCase.category}
                      onChange={(e) => updateCurrentCase({ category: e.target.value as ProjectCategory })}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg cursor-pointer"
                    >
                      <option value="Branding e Comunicação">Branding e Comunicação</option>
                      <option value="Palestras">Palestras</option>
                      <option value="Gestão de PR">Gestão de PR</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Tags (Separadas por vírgula)</label>
                    <input
                      type="text"
                      value={currentCase.tags.join(", ")}
                      onChange={(e) => {
                        const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                        updateCurrentCase({ tags });
                      }}
                      placeholder="Branding, IA, Keynote..."
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Descrição Curta</label>
                    <textarea
                      rows={2}
                      value={currentCase.shortDescription}
                      onChange={(e) => updateCurrentCase({ shortDescription: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  {/* Foto de Capa do Case */}
                  <div className="space-y-1 sm:col-span-2 p-3.5 bg-[#FAF8FF] rounded-xl border border-[#17151D]/10">
                    <label className="text-xs font-mono uppercase text-[#5425D8] font-semibold block mb-1">
                      Foto de Capa do Case
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-black/10">
                        <LazyImage
                          src={currentCase.coverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5425D8] hover:bg-[#8557FF] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          {isCompressing ? "Processando..." : "Upload Nova Foto de Capa"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(e, (url) => {
                                updateCurrentCase({ coverImage: url });
                              })
                            }
                          />
                        </label>
                        <input
                          type="text"
                          value={currentCase.coverImage}
                          onChange={(e) => updateCurrentCase({ coverImage: e.target.value })}
                          placeholder="Ou cole a URL da imagem de capa"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#17151D]/15 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mídias & Vídeos do YouTube do Case */}
                  <div className="space-y-3 sm:col-span-2 p-4 bg-[#FAF8FF] rounded-2xl border border-[#17151D]/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono uppercase text-[#5425D8] font-semibold flex items-center gap-1.5">
                          <Video className="w-4 h-4" />
                          Mídias & Vídeos do YouTube do Case
                        </span>
                        <p className="text-[11px] text-[#17151D]/60">
                          Cole links de vídeos do YouTube ou fotos para exibir no carrossel do case.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addMediaToCurrentCase("video")}
                          className="px-2.5 py-1 text-xs font-semibold text-[#5425D8] bg-white border border-[#5425D8]/30 rounded-lg hover:bg-[#5425D8] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          + Vídeo YouTube
                        </button>
                        <button
                          onClick={() => addMediaToCurrentCase("image")}
                          className="px-2.5 py-1 text-xs font-semibold text-[#5425D8] bg-white border border-[#5425D8]/30 rounded-lg hover:bg-[#5425D8] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          + Imagem
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentCase.featuredMedia.map((media, mIdx) => (
                        <div key={mIdx} className="p-3 bg-white rounded-xl border border-[#17151D]/10 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-semibold text-[#8557FF]">
                              Mídia #{mIdx + 1} · {media.type === "video" ? "Vídeo (YouTube)" : "Foto / Imagem"}
                            </span>
                            <div className="flex items-center gap-2">
                              <select
                                value={media.type}
                                onChange={(e) => {
                                  const updated = [...currentCase.featuredMedia];
                                  updated[mIdx] = { ...updated[mIdx], type: e.target.value as "image" | "video" };
                                  updateCurrentCase({ featuredMedia: updated });
                                }}
                                className="px-2 py-0.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded cursor-pointer"
                              >
                                <option value="video">Vídeo (YouTube)</option>
                                <option value="image">Imagem</option>
                              </select>
                              <button
                                onClick={() => removeMediaFromCurrentCase(mIdx)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                title="Remover mídia"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={media.url}
                              onChange={(e) => {
                                const updated = [...currentCase.featuredMedia];
                                updated[mIdx] = { ...updated[mIdx], url: e.target.value };
                                updateCurrentCase({ featuredMedia: updated });
                              }}
                              placeholder={
                                media.type === "video"
                                  ? "https://www.youtube.com/watch?v=..."
                                  : "URL da imagem ou faça upload abaixo"
                              }
                              className="px-3 py-1.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                            />
                            <input
                              type="text"
                              value={media.caption || ""}
                              onChange={(e) => {
                                const updated = [...currentCase.featuredMedia];
                                updated[mIdx] = { ...updated[mIdx], caption: e.target.value };
                                updateCurrentCase({ featuredMedia: updated });
                              }}
                              placeholder="Legenda explicativa da mídia"
                              className="px-3 py-1.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                            />
                          </div>

                          {/* Quick upload para mídia do tipo imagem */}
                          {media.type === "image" && (
                            <div className="pt-1">
                              <label className="text-[11px] font-semibold text-[#5425D8] hover:underline cursor-pointer inline-flex items-center gap-1">
                                <Upload className="w-3 h-3" /> Fazer upload de arquivo para esta mídia
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleImageUpload(e, (url) => {
                                      const updated = [...currentCase.featuredMedia];
                                      updated[mIdx] = { ...updated[mIdx], url };
                                      updateCurrentCase({ featuredMedia: updated });
                                    })
                                  }
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seções detalhadas do case editorial */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Contexto & Histórico</label>
                    <textarea
                      rows={2}
                      value={currentCase.context}
                      onChange={(e) => updateCurrentCase({ context: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Desafio Principal</label>
                    <textarea
                      rows={2}
                      value={currentCase.challenge}
                      onChange={(e) => updateCurrentCase({ challenge: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Diagnóstico Editorial</label>
                    <textarea
                      rows={2}
                      value={currentCase.diagnosis}
                      onChange={(e) => updateCurrentCase({ diagnosis: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Raciocínio & Metodologia</label>
                    <textarea
                      rows={2}
                      value={currentCase.reasoning}
                      onChange={(e) => updateCurrentCase({ reasoning: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Estratégia</label>
                    <textarea
                      rows={2}
                      value={currentCase.strategy}
                      onChange={(e) => updateCurrentCase({ strategy: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Execução Tática</label>
                    <textarea
                      rows={2}
                      value={currentCase.execution}
                      onChange={(e) => updateCurrentCase({ execution: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Impacto & Resultados</label>
                    <textarea
                      rows={2}
                      value={currentCase.impact}
                      onChange={(e) => updateCurrentCase({ impact: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Aprendizados Consolidados</label>
                    <textarea
                      rows={2}
                      value={currentCase.learnings}
                      onChange={(e) => updateCurrentCase({ learnings: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUTO-MANIFESTO */}
          {activeTab === "manifesto" && (
            <div className="space-y-6">
              <div className="space-y-4 p-5 rounded-2xl bg-white border border-[#17151D]/10">
                <h3 className="text-sm font-bold font-display text-[#17151D]">
                  Auto-Manifesto Pop-Tech
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Kicker</label>
                    <input
                      type="text"
                      value={formData.manifesto.kicker}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manifesto: { ...formData.manifesto, kicker: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Citação Lead (Manifesto)</label>
                    <textarea
                      rows={2}
                      value={formData.manifesto.leadQuote}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manifesto: { ...formData.manifesto, leadQuote: e.target.value },
                        })
                      }
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Corpo do Manifesto</label>
                    <textarea
                      rows={4}
                      value={formData.manifesto.bodyParagraph}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manifesto: { ...formData.manifesto, bodyParagraph: e.target.value },
                        })
                      }
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Pilares do Manifesto */}
              <div className="p-5 rounded-2xl bg-white border border-[#17151D]/10 space-y-4">
                <h3 className="text-sm font-bold font-display text-[#17151D]">
                  Os 3 Pilares do Manifesto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.manifesto.pillars.map((pillar, pIdx) => (
                    <div key={pIdx} className="p-3.5 bg-[#FAF8FF] rounded-xl border border-[#17151D]/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pillar.number}
                          onChange={(e) => {
                            const updated = [...formData.manifesto.pillars];
                            updated[pIdx] = { ...updated[pIdx], number: e.target.value };
                            setFormData({
                              ...formData,
                              manifesto: { ...formData.manifesto, pillars: updated },
                            });
                          }}
                          className="w-10 px-1.5 py-1 text-xs font-mono font-bold text-[#8557FF] bg-white border border-[#17151D]/15 rounded text-center"
                        />
                        <input
                          type="text"
                          value={pillar.title}
                          onChange={(e) => {
                            const updated = [...formData.manifesto.pillars];
                            updated[pIdx] = { ...updated[pIdx], title: e.target.value };
                            setFormData({
                              ...formData,
                              manifesto: { ...formData.manifesto, pillars: updated },
                            });
                          }}
                          placeholder="Título do pilar"
                          className="flex-1 px-2 py-1 text-xs font-bold font-display bg-white border border-[#17151D]/15 rounded"
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={pillar.description}
                        onChange={(e) => {
                          const updated = [...formData.manifesto.pillars];
                          updated[pIdx] = { ...updated[pIdx], description: e.target.value };
                          setFormData({
                            ...formData,
                            manifesto: { ...formData.manifesto, pillars: updated },
                          });
                        }}
                        placeholder="Descrição do pilar"
                        className="w-full p-2 text-xs bg-white border border-[#17151D]/15 rounded resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTATO, REDES & RODAPÉ */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#17151D]/10 space-y-4">
                <h3 className="text-sm font-bold font-display text-[#17151D]">
                  Seção de Contato & Chamada
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Kicker</label>
                    <input
                      type="text"
                      value={formData.uiTexts.contact.kicker}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            contact: { ...formData.uiTexts.contact, kicker: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Título Principal</label>
                    <input
                      type="text"
                      value={formData.uiTexts.contact.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            contact: { ...formData.uiTexts.contact, title: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg font-semibold"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Descrição da Proposta de Valor</label>
                    <textarea
                      rows={3}
                      value={formData.uiTexts.contact.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            contact: { ...formData.uiTexts.contact, description: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">E-mail para Recebimento</label>
                    <input
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, email: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">URL do Perfil do LinkedIn</label>
                    <input
                      type="text"
                      value={formData.personalInfo.linkedinUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, linkedinUrl: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Texto Botão LinkedIn</label>
                    <input
                      type="text"
                      value={formData.uiTexts.contact.linkedinButton}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            contact: { ...formData.uiTexts.contact, linkedinButton: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Texto Botão E-mail</label>
                    <input
                      type="text"
                      value={formData.uiTexts.contact.emailButton}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            contact: { ...formData.uiTexts.contact, emailButton: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono uppercase text-[#17151D]/70">Texto de Copyright / Rodapé</label>
                    <input
                      type="text"
                      value={formData.uiTexts.contact.footerCopy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            contact: { ...formData.uiTexts.contact, footerCopy: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Textos da Navbar */}
              <div className="p-5 rounded-2xl bg-white border border-[#17151D]/10 space-y-3">
                <h3 className="text-sm font-bold font-display text-[#17151D]">
                  Textos do Menu Superior (Navbar)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[#17151D]/70">Nome da Marca</label>
                    <input
                      type="text"
                      value={formData.uiTexts.nav.brandName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            nav: { ...formData.uiTexts.nav, brandName: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[#17151D]/70">Texto do Botão CTA</label>
                    <input
                      type="text"
                      value={formData.uiTexts.nav.ctaButton}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          uiTexts: {
                            ...formData.uiTexts,
                            nav: { ...formData.uiTexts.nav, ctaButton: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-[#17151D]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                if (confirm("Deseja restaurar todos os dados originais? Suas alterações salvas no navegador e no servidor serão resetadas.")) {
                  onReset();
                  onClose();
                }
              }}
              className="text-xs font-mono text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Originais
            </button>

            <span className="text-[#17151D]/20 hidden sm:inline">|</span>

            <button
              onClick={handleExportBackup}
              className="text-xs font-mono text-[#5425D8] hover:underline flex items-center gap-1 cursor-pointer"
              title="Baixar arquivo JSON com todos os dados atuais"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Backup JSON
            </button>

            <label className="text-xs font-mono text-[#5425D8] hover:underline flex items-center gap-1 cursor-pointer">
              <UploadCloud className="w-3.5 h-3.5" />
              Importar Backup
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportBackup}
              />
            </label>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#17151D]/70 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#5425D8] hover:bg-[#8557FF] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
