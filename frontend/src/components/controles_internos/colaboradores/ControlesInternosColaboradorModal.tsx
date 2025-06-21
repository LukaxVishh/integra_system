import React, { useEffect, useRef, useState } from "react";
import { ChromePicker } from "react-color";

interface Atividade {
  id: number;
  colaboradorEmail: string;
  nomeTag: string;
  cor: string;
  descricao: string;
  dataInicio: string;
  dataFim?: string | null;
}

interface Props {
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorEmail: string;
  photoUrl?: string;
  canEdit: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ControlesInternosColaboradorModal: React.FC<Props> = ({
  colaboradorId,
  colaboradorNome,
  colaboradorEmail,
  photoUrl,
  canEdit,
  onClose,
  onUpdate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [historico, setHistorico] = useState<Atividade[]>([]);
  const [nomeTag, setNomeTag] = useState("");
  const [cor, setCor] = useState("#0F9D58");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | undefined>(photoUrl);
  const [showPalette, setShowPalette] = useState(false);

  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  useEffect(() => {
    reloadHistorico();
    setUserPhoto(photoUrl);
  }, [colaboradorId]);

  const reloadHistorico = async () => {
    setLoading(true);
    const res = await fetch(
      `http://localhost:5000/controles-internos/colaboradores/atividades/${colaboradorEmail}`,
      { credentials: "include" }
    );
    const data = await res.json();
    setHistorico(data);
    setLoading(false);
  };

  const criarAtividade = async () => {
    if (!nomeTag.trim()) return;
    await fetch(`http://localhost:5000/controles-internos/colaboradores/atividades`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colaboradorEmail, nomeTag, cor, descricao }),
    });
    setNomeTag("");
    setDescricao("");
    setCor("#0F9D58");
    setShowPalette(false);
    await reloadHistorico();
    onUpdate();
  };

  const encerrarAtividade = async (id: number) => {
    await fetch(`http://localhost:5000/controles-internos/colaboradores/atividades/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataFim: new Date().toISOString() }),
    });
    await reloadHistorico();
    onUpdate();
  };

  const handleUploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("File", file);
    setUploading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/users/${colaboradorId}/photo`,
        { method: "POST", credentials: "include", body: formData }
      );
      const data = await res.json();
      setUserPhoto(data.photoUrl);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const primeiroNome = colaboradorNome.split(" ")[0];

  // Fechar paleta ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        paletteRef.current &&
        !paletteRef.current.contains(e.target as Node)
      ) {
        setShowPalette(false);
      }
    };
    if (showPalette) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPalette]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-xl"
        >
          ✕
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div
            className="relative w-14 h-14 rounded-full bg-[#E6F4EA] flex items-center justify-center text-xl font-bold text-[#0F9D58] cursor-pointer overflow-hidden border-2 border-[#0F9D58]"
            onClick={() => fileInputRef.current?.click()}
          >
            {userPhoto ? (
              <img
                src={`http://localhost:5000/${userPhoto}`}
                alt={colaboradorNome}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              primeiroNome[0]
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs rounded-full">
                ...
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-[#0F9D58] whitespace-nowrap">
            Atividades de {primeiroNome}
          </h2>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) handleUploadPhoto(e.target.files[0]);
          }}
        />

        {canEdit && (
          <div className="space-y-3 mb-6 relative">
            <div className="relative">
              <input
                placeholder="Nome da Tag"
                value={nomeTag}
                onChange={(e) => setNomeTag(e.target.value)}
                className="w-full border p-3 pl-4 pr-12 rounded-lg border-[#E6F4EA] focus:ring-2 focus:ring-[#0F9D58]/30 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPalette((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 border border-[#0F9D58] rounded-full p-1 hover:bg-[#0F9D58]/10 transition"
              >
                {/* SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 stroke-[#0F9D58]"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" />
                  <path d="m5 2 5 5" />
                  <path d="M2 13h15" />
                  <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z" />
                </svg>
                <span
                  className="inline-block w-3.5 h-3.5 rounded-full border border-[#0F9D58]"
                  style={{ backgroundColor: cor }}
                ></span>
              </button>

              {/* PALETA ChromePicker DIRETO */}
              {showPalette && (
                <div
                  ref={paletteRef}
                  className="absolute right-0 top-12 z-50 animate-dropdown-enter"
                >
                  <ChromePicker
                    color={cor}
                    onChange={(c) => setCor(c.hex)}
                    disableAlpha
                  />
                </div>
              )}
            </div>

            <textarea
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border p-3 rounded-lg border-[#E6F4EA] focus:ring-2 focus:ring-[#0F9D58]/30 outline-none"
            ></textarea>
            <button
              onClick={criarAtividade}
              className="w-full py-3 bg-[#0F9D58] text-white rounded-full hover:bg-[#128C52] transition flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Adicionar Atividade
            </button>
          </div>
        )}

        <h3 className="text-lg font-semibold text-[#0F9D58] mb-2">Histórico</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <ul className="space-y-4">
            {historico.map((a) => (
              <li
                key={a.id}
                className="border border-[#E6F4EA] p-4 rounded-xl shadow-sm bg-white"
              >
                <span
                  className="inline-block px-3 py-1 text-xs rounded-full text-white mb-2"
                  style={{ background: a.cor }}
                >
                  {a.nomeTag}
                </span>
                <p className="text-sm mb-1">{a.descricao}</p>
                <p className="text-xs text-gray-500">
                  {new Date(a.dataInicio).toLocaleDateString()} →{" "}
                  {a.dataFim
                    ? new Date(a.dataFim).toLocaleDateString()
                    : "Ativo"}
                </p>
                {canEdit && !a.dataFim && (
                  <button
                    onClick={() => encerrarAtividade(a.id)}
                    className="mt-2 px-4 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
                  >
                    Encerrar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ControlesInternosColaboradorModal;
