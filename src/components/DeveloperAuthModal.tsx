import React, { useState } from "react";
import { Lock, X, CheckCircle2, ShieldAlert } from "lucide-react";

interface DeveloperAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeveloperAuthModal: React.FC<DeveloperAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toLowerCase();
    // Senhas válidas para o desenvolvedor
    if (clean === "saullo" || clean === "admin" || clean === "saullo.rosa" || clean === "1234") {
      setError(false);
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17151D]/70 backdrop-blur-xs"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-50 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#17151D]/15 text-[#17151D] animate-fadeIn space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF0FF] text-[#5425D8] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-[#17151D]">
                Acesso do Desenvolvedor
              </h3>
              <p className="text-[10px] text-[#17151D]/60 font-mono">
                Exclusivo para Saullo Brito
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#17151D]/50 hover:text-black rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#17151D]/70 block">
              Chave de Acesso
            </label>
            <input
              type="password"
              autoFocus
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Digite sua senha de desenvolvedor..."
              className="w-full px-3 py-2 text-xs bg-[#FAF8FF] border border-[#17151D]/15 rounded-xl text-[#17151D] focus:outline-hidden focus:ring-2 focus:ring-[#5425D8]/30 transition-all font-mono"
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-600 font-mono flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              Chave incorreta. Tente novamente.
            </p>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-[#17151D]/70 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#5425D8] hover:bg-[#8557FF] rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Entrar
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-[#17151D]/40 font-mono">
          Dica: você também pode acessar adicionando ?admin=true à URL.
        </p>
      </div>
    </div>
  );
};
