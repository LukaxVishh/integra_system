import React, { useEffect, useState } from "react";
import { useAuth } from "../../../utils/AuthContext";
import ColaboradorCard from "./ColaboradorCard";
import CicloColaboradorModal from "./CicloColaboradorModal";

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

const CicloColaboradores: React.FC = () => {
  const { currentUser, hasClaim, roles } = useAuth();
  const [organograma, setOrganograma] = useState<Gerente | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingColaboradorEmail, setEditingColaboradorEmail] = useState<string | null>(null);

  const isAdmin = roles.includes("Admin");
  const isGerenteCiclo = hasClaim("GerenteCiclo");

  const reloadOrganograma = async () => {
    try {
      const res = await fetch("http://localhost:5000/ciclo/organograma", {
        credentials: "include",
      });
      const data = await res.json();
      setOrganograma(data[0] || null);
    } catch (err) {
      console.error("Erro ao buscar organograma:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadOrganograma();
  }, []);

  const canEdit = (id: string) =>
    isAdmin || isGerenteCiclo || currentUser?.id === id;

  if (loading) return <p>Carregando...</p>;
  if (!organograma) return <p>Nenhum gerente ciclo encontrado.</p>;

  return (
    <div className="tree-container">
      <div className="tree-root-wrapper">
        <div className="tree-root">
          <ColaboradorCard
            id={organograma.id}
            nome={organograma.nome}
            cargo={organograma.cargo}
            photoUrl={organograma.photoUrl}
            tags={organograma.tags}
            historico={organograma.historico}
            canEdit={canEdit(organograma.id)}
            onEdit={() => setEditingColaboradorEmail(organograma.email)}
          />
        </div>
        <div className="tree-root-line"></div>
      </div>

      <div className="tree-trunk">
        {organograma.subordinados.map((sub) => (
          <div key={sub.id} className="tree-branch">
            <div className="tree-branch-line"></div>
            <ColaboradorCard
              id={sub.id}
              nome={sub.nome}
              cargo={sub.cargo}
              photoUrl={sub.photoUrl}
              tags={sub.tags}
              historico={sub.historico}
              canEdit={canEdit(sub.id)}
              onEdit={() => setEditingColaboradorEmail(sub.email)}
            />
          </div>
        ))}
      </div>

      {editingColaboradorEmail && (
        <CicloColaboradorModal
          colaboradorEmail={editingColaboradorEmail}
          onClose={() => setEditingColaboradorEmail(null)}
          canEdit={
            isAdmin || isGerenteCiclo || currentUser?.email === editingColaboradorEmail
          }
          onUpdate={reloadOrganograma}
        />
      )}
    </div>
  );
};

export default CicloColaboradores;
