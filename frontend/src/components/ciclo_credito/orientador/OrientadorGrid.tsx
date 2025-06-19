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

  const sensors = useSensors(useSensor(PointerSensor));

  // 🚀 Carrega os botões
  useEffect(() => {
    fetch("http://localhost:5000/ciclo/orientador/buttons", { credentials: "include" })
      .then(res => res.json())
      .then(setButtons)
      .catch(console.error);
  }, []);

  // ✅ Cria novo botão (sempre bold)
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
        bold: true, // sempre bold
      }),
    });
    const data = await res.json();
    setButtons(prev => [...prev, data]);
    setNewText("");
    setNewColor("#E6F4EA");
    setNewTextColor("#000000");
  };

  // ✅ Atualiza botão (sempre bold)
  const updateButton = async (id: number, newData: Omit<ButtonData, "id" | "order">) => {
    const button = buttons.find(b => b.id === id);
    if (!button) return;
    const res = await fetch(`http://localhost:5000/ciclo/orientador/buttons/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newData, bold: true, order: button.order }), // sempre bold
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
          <div className="flex flex-wrap gap-3 items-center">

            {/* Texto do botão */}
            <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E6F4EA] gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-type-outline-icon" viewBox="0 0 24 24">
                <path d="M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z"/>
              </svg>
              <input
                type="text"
                placeholder="Texto"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="outline-none border-none bg-transparent focus:ring-0 w-24 text-[#111]"
              />
            </div>

            {/* Cor de fundo do botão */}
            <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E6F4EA] gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paint-roller-icon" viewBox="0 0 24 24">
                <rect width="16" height="6" x="2" y="2" rx="2"/><path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect width="4" height="6" x="8" y="16" rx="1"/>
              </svg>
              <label className="relative flex items-center">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-6 h-6 opacity-0 absolute cursor-pointer"
                  style={{ left: 0 }}
                  title="Cor do Botão"
                />
                {/* Preview círculo */}
                <span
                  className="inline-block w-6 h-6 rounded-full border border-[#E6F4EA]"
                  style={{ background: newColor }}
                ></span>
              </label>
            </div>

            {/* Cor do texto */}
            <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E6F4EA] gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-baseline-icon" viewBox="0 0 24 24">
                <path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/>
              </svg>
              <label className="relative flex items-center">
                <input
                  type="color"
                  value={newTextColor}
                  onChange={(e) => setNewTextColor(e.target.value)}
                  className="w-6 h-6 opacity-0 absolute cursor-pointer"
                  style={{ left: 0 }}
                  title="Cor da Fonte"
                />
                {/* Preview círculo */}
                <span
                  className="inline-block w-6 h-6 rounded-full border border-[#E6F4EA]"
                  style={{ background: newTextColor }}
                ></span>
              </label>
            </div>

            {/* Botão adicionar */}
            <button
              onClick={createButton}
              className="flex items-center gap-2 px-5 py-2 bg-[#0F9D58] text-white rounded-lg shadow hover:bg-[#0C7A43] transition font-semibold"
              title="Adicionar botão"
            >
              <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
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
