import React, { useState } from "react";
import { PersonalInfo, UiTexts, portfolioContent } from "../data/portfolioContent";
import { Mail, Linkedin, Send, CheckCircle2, MessageSquare, Edit3 } from "lucide-react";

interface ContactProps {
  initialSubject?: string;
  personalInfo?: PersonalInfo;
  uiTexts?: UiTexts;
  isEditMode?: boolean;
  onOpenEditor?: () => void;
}

export const Contact: React.FC<ContactProps> = ({
  initialSubject = "",
  personalInfo = portfolioContent.personalInfo,
  uiTexts = portfolioContent.uiTexts,
  isEditMode = false,
  onOpenEditor,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: initialSubject || "Branding e Comunicação",
    message: initialSubject ? `Olá Saullo, gostaria de conversar sobre ${initialSubject}.` : "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setSubmitted(true);

    const mailtoSubject = encodeURIComponent(`[Contato Portfólio] ${formData.interest} - ${formData.name}`);
    const mailtoBody = encodeURIComponent(
      `Nome: ${formData.name}\nEmail: ${formData.email}\nÁrea de Interesse: ${formData.interest}\n\nMensagem:\n${formData.message}`
    );
    const mailtoUrl = `mailto:${personalInfo.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 400);
  };

  return (
    <section id="contato" className="py-16 md:py-24 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Direct Links & Value Proposition (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase tracking-widest text-[#5425D8]">
                {uiTexts.contact.kicker}
              </div>
              {isEditMode && onOpenEditor && (
                <button
                  onClick={onOpenEditor}
                  className="px-3 py-1 rounded-xl bg-[#5425D8] hover:bg-[#8557FF] text-white text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <Edit3 className="w-3 h-3" />
                  Editar Contato
                </button>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-[#17151D] tracking-tight [text-wrap:balance]">
              {uiTexts.contact.title}
            </h2>
            <p className="text-sm text-[#17151D]/70 leading-relaxed">
              {uiTexts.contact.description}
            </p>
          </div>

          {/* Direct Contact Cards */}
          <div className="space-y-3">
            {/* LinkedIn Direct */}
            <a
              href={personalInfo.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white border border-[#17151D]/10 hover:border-[#5425D8]/40 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF0FF] text-[#5425D8] flex items-center justify-center group-hover:bg-[#5425D8] group-hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#17151D]">{uiTexts.contact.linkedinButton}</h4>
                  <p className="text-[11px] text-[#17151D]/60 font-mono">linkedin.com/in/saullo-rosa</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#5425D8] group-hover:translate-x-1 transition-transform">
                Conectar →
              </span>
            </a>

            {/* Email Direct */}
            <a
              href={`mailto:${personalInfo.email}`}
              className="p-4 rounded-2xl bg-white border border-[#17151D]/10 hover:border-[#5425D8]/40 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF0FF] text-[#5425D8] flex items-center justify-center group-hover:bg-[#5425D8] group-hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#17151D]">{uiTexts.contact.emailButton}</h4>
                  <p className="text-[11px] text-[#17151D]/60 font-mono">{personalInfo.email}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#5425D8] group-hover:translate-x-1 transition-transform">
                Enviar E-mail →
              </span>
            </a>
          </div>
        </div>

        {/* Right Column: Contact Message Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#17151D]/10 shadow-sm">
          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-[#17151D]">
                Mensagem Pronta para Disparo!
              </h3>
              <p className="text-xs sm:text-sm text-[#17151D]/70 max-w-sm mx-auto leading-relaxed">
                Seu cliente de e-mail foi aberto com os dados direcionados para <strong>{personalInfo.email}</strong>.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#5425D8] bg-[#EAF0FF] rounded-xl hover:bg-[#5425D8] hover:text-white transition-colors cursor-pointer"
              >
                Enviar Outra Mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-display text-[#17151D] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#5425D8]" />
                  Mensagem Rápida
                </h3>
                <p className="text-xs text-[#17151D]/60">
                  Preencha o formulário para receber um retorno em até 24h úteis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#17151D]/70">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-xl text-[#17151D] focus:outline-hidden focus:ring-2 focus:ring-[#5425D8]/30 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#17151D]/70">
                    Seu E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@empresa.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-xl text-[#17151D] focus:outline-hidden focus:ring-2 focus:ring-[#5425D8]/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#17151D]/70">
                  Área de Interesse
                </label>
                <select
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-xl text-[#17151D] focus:outline-hidden focus:ring-2 focus:ring-[#5425D8]/30 transition-all cursor-pointer"
                >
                  <option value="Branding e Comunicação">Branding Estratégico & Posicionamento</option>
                  <option value="Palestras">Palestra ou Masterclass Corporativa</option>
                  <option value="Gestão de PR">Relações Públicas 360° & Gestão de Crise</option>
                  <option value="IA e Conteúdo">Treinamento / IA Aplicada a Comunicação</option>
                  <option value="Thought Leadership">Thought Leadership para C-Levels</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#17151D]/70">
                  Mensagem / Resumo do Desafio
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Compartilhe seu objetivo e prazo estimado..."
                  className="w-full p-3 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-xl text-[#17151D] focus:outline-hidden focus:ring-2 focus:ring-[#5425D8]/30 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#5425D8] hover:bg-[#8557FF] rounded-xl transition-all duration-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Disparar Solicitação</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
