import React, { useEffect, useState } from "react";

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
  colaboradorEmail: string;
  onClose: () => void;
  canEdit: boolean;
  onUpdate: () => void; // ✅ Adiciona o onUpdate corretamente
}

const CicloColaboradorModal: React.FC<Props> = ({
  colaboradorEmail,
  onClose,
  canEdit,
  onUpdate, // ✅ Aqui também
}) => {
  const [historico, setHistorico] = useState<Atividade[]>([]);
  const [nomeTag, setNomeTag] = useState("");
  const [cor, setCor] = useState("#0F9D58");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  useEffect(() => {
    reloadHistorico();
  }, [colaboradorEmail]);

  const reloadHistorico = async () => {
    setLoading(true);
    const res = await fetch(`http://localhost:5000/ciclo/colaboradores/atividades/${colaboradorEmail}`, {
      credentials: "include",
    });
    const data = await res.json();
    setHistorico(data);
    setLoading(false);
  };

  const criarAtividade = async () => {
    if (!nomeTag.trim()) return;
    await fetch(`http://localhost:5000/ciclo/colaboradores/atividades`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colaboradorEmail, nomeTag, cor, descricao }),
    });
    setNomeTag("");
    setDescricao("");
    setCor("#0F9D58");
    await reloadHistorico();
    onUpdate(); // ✅ chama o pai para atualizar o organograma principal
  };

  const encerrarAtividade = async (id: number) => {
    await fetch(`http://localhost:5000/ciclo/colaboradores/atividades/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataFim: new Date().toISOString() }),
    });
    await reloadHistorico();
    onUpdate(); // ✅ chama o pai também após encerrar
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Atividades de {colaboradorEmail}</h2>

        {canEdit && (
          <div className="space-y-3 mb-6">
            <input
              placeholder="Nome da Tag"
              value={nomeTag}
              onChange={(e) => setNomeTag(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Cor:</label>
              <input
                type="color"
                value={cor || "#0F9D58"}
                onChange={(e) => setCor(e.target.value)}
              />
            </div>
            <textarea
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border p-2 rounded"
            ></textarea>
            <button
              onClick={criarAtividade}
              className="px-4 py-2 bg-[#0F9D58] text-white rounded hover:bg-[#0c7a43] transition"
            >
              Adicionar Atividade
            </button>
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2">Histórico</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <ul className="space-y-2">
            {historico.map((a) => (
              <li key={a.id} className="border p-3 rounded shadow flex flex-col">
                <span
                  className="inline-block px-2 py-1 text-sm rounded-full text-white mb-1"
                  style={{ background: a.cor }}
                >
                  {a.nomeTag}
                </span>
                <p className="text-sm">{a.descricao}</p>
                <p className="text-xs text-gray-500">
                  {new Date(a.dataInicio).toLocaleDateString()} →{" "}
                  {a.dataFim ? new Date(a.dataFim).toLocaleDateString() : "Ativo"}
                </p>
                {canEdit && !a.dataFim && (
                  <button
                    onClick={() => encerrarAtividade(a.id)}
                    className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded self-start hover:bg-yellow-600 transition"
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

export default CicloColaboradorModal;
