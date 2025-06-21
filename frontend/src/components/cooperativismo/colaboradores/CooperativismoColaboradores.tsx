import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../utils/AuthContext";
import ColaboradorCard from "./ColaboradorCard";
import CooperativismoColaboradorModal from "./CooperativismoColaboradorModal";

interface Tag {
  id: number;
  name: string;
  color: string;
  descricao: string;
}

interface Subordinado {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  photoUrl?: string;
  tags: Tag[];
  historico: string[];
}

interface Gerente extends Subordinado {
  subordinados: Subordinado[];
}

const CooperativismoColaboradores: React.FC = () => {
  const { currentUser, hasClaim, roles } = useAuth();
  const [organograma, setOrganograma] = useState<Gerente | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingColaborador, setEditingColaborador] = useState<Subordinado | null>(null);

  const isAdmin = roles.includes("Admin");
  const isGerenteCooperativismo = hasClaim("GerenteCooperativismo");

  const reloadOrganograma = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/cooperativismo/organograma", {
        credentials: "include",
      });
      const data = await res.json();
      setOrganograma(data[0] || null);
    } catch (err) {
      console.error("Erro ao buscar organograma:", err);
      alert("Erro ao carregar organograma. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadOrganograma();
  }, [reloadOrganograma]);

  const canEdit = (id: string) =>
    isAdmin || isGerenteCooperativismo || currentUser?.id === id;

  if (loading) return <p className="animate-pulse text-gray-500">Carregando colaboradores...</p>;
  if (!organograma) return <p>Nenhum gerente Cooperativismo encontrado.</p>;

  return (
    <div className="tree-container">
      <div className="tree-root-wrapper">
        <div className="tree-root animate-slideUpFade">
          <ColaboradorCard
            id={organograma.id}
            nome={organograma.nome}
            cargo={organograma.cargo}
            photoUrl={organograma.photoUrl}
            tags={organograma.tags}
            historico={organograma.historico}
            canEdit={canEdit(organograma.id)}
            onEdit={() => setEditingColaborador(organograma)}
          />
        </div>
        <div className="tree-root-line"></div>
      </div>

      <div className="tree-trunk">
        {organograma.subordinados.map((sub, idx) => (
          <div
            key={sub.id}
            className="tree-branch animate-slideUpFade"
            style={{ animationDelay: `${(idx + 1) * 0.1}s` }}
          >
            <div className="tree-branch-line"></div>
            <ColaboradorCard
              id={sub.id}
              nome={sub.nome}
              cargo={sub.cargo}
              photoUrl={sub.photoUrl}
              tags={sub.tags}
              historico={sub.historico}
              canEdit={canEdit(sub.id)}
              onEdit={() => setEditingColaborador(sub)}
            />
          </div>
        ))}
      </div>

      {editingColaborador && (
        <CooperativismoColaboradorModal
          key={editingColaborador.email}
          colaboradorId={editingColaborador.id}
          colaboradorNome={editingColaborador.nome}
          colaboradorEmail={editingColaborador.email}
          onClose={() => setEditingColaborador(null)}
          canEdit={
            isAdmin || isGerenteCooperativismo || currentUser?.id === editingColaborador.id
          }
          onUpdate={reloadOrganograma}
        />
      )}
    </div>
  );
};

export default CooperativismoColaboradores;
