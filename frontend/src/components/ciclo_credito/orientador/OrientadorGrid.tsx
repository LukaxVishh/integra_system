import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAuth } from "../../../utils/AuthContext";
import SortableButton from "./SortableButton";

interface ButtonData {
  id: number;
  text: string;
  color: string;
  textColor: string;
  bold: boolean;
  order: number;
}

interface OrientadorGridProps {
  onButtonClick: (id: number) => void; // ✅ receber prop para abrir tabela
}

const OrientadorGrid: React.FC<OrientadorGridProps> = ({ onButtonClick }) => {
  const { hasAnyClaim } = useAuth();
  const canManage = hasAnyClaim(["CcCreateOri", "CcUpdateOri", "CcDeleteOri", "CanManageAll"]);

  const [buttons, setButtons] = useState<ButtonData[]>([]);
  const [newText, setNewText] = useState("");
  const [newColor, setNewColor] = useState("#E6F4EA");
  const [newTextColor, setNewTextColor] = useState("#000000");
  const [newBold, setNewBold] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  // 🚀 Carrega os botões
  useEffect(() => {
    fetch("http://localhost:5000/ciclo/orientador/buttons", { credentials: "include" })
      .then(res => res.json())
      .then(setButtons)
      .catch(console.error);
  }, []);

  // ✅ Cria novo botão
  const createButton = async () => {
    if (!newText.trim()) return;
    const res = await fetch("http://localhost:5000/ciclo/orientador/buttons", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: newText,
        color: newColor,
        textColor: newTextColor,
        bold: newBold,
      }),
    });
    const data = await res.json();
    setButtons(prev => [...prev, data]);
    setNewText("");
    setNewColor("#E6F4EA");
    setNewTextColor("#000000");
    setNewBold(false);
  };

  // ✅ Atualiza botão
  const updateButton = async (id: number, newData: Omit<ButtonData, "id" | "order">) => {
    const button = buttons.find(b => b.id === id);
    if (!button) return;
    const res = await fetch(`http://localhost:5000/ciclo/orientador/buttons/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newData, order: button.order }),
    });
    const data = await res.json();
    setButtons(prev => prev.map(b => (b.id === id ? data : b)));
  };

  // ✅ Exclui botão E tabela vinculada
  const deleteButton = async (id: number) => {
    await fetch(`http://localhost:5000/ciclo/orientador/buttons/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setButtons(prev => prev.filter(b => b.id !== id));
  };

  // ✅ Arrasta e ordena
  const handleDragEnd = async (event: any) => {
    if (!canManage) return;
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = buttons.findIndex(b => b.id === active.id);
      const newIndex = buttons.findIndex(b => b.id === over.id);
      const newOrder = arrayMove(buttons, oldIndex, newIndex);
      setButtons(newOrder);
      await fetch("http://localhost:5000/ciclo/orientador/buttons/reorder", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder.map(b => b.id)),
      });
    }
  };

  return (
    <div>
      {canManage && (
        <div className="mb-6 p-4 border border-[#E6F4EA] rounded-lg bg-[#F9FAFB] shadow space-y-3">
          <h3 className="text-lg font-semibold text-[#0F9D58]">Ferramentas de Criação</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Texto"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/50 transition"
            />
            <label className="flex items-center gap-2">
              Cor Fundo:{" "}
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="cursor-pointer" />
            </label>
            <label className="flex items-center gap-2">
              Cor Texto:{" "}
              <input type="color" value={newTextColor} onChange={(e) => setNewTextColor(e.target.value)} className="cursor-pointer" />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={newBold} onChange={(e) => setNewBold(e.target.checked)} className="accent-[#0F9D58] cursor-pointer" />{" "}
              <span>Negrito</span>
            </label>
            <button
              onClick={createButton}
              className="px-5 py-2 bg-[#0F9D58] text-white rounded shadow hover:bg-[#0C7A43] transition"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={buttons.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buttons.map(b => (
              <SortableButton
                key={b.id}
                {...b}
                onEdit={updateButton}
                onDelete={deleteButton}
                onOpenTable={onButtonClick} // ✅ Novo botão para abrir tabela
                canManage={canManage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default OrientadorGrid;
