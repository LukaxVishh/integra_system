import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableButtonProps {
  id: number;
  text: string;
  color: string;
  textColor: string;
  bold: boolean;
  onEdit: (id: number, newData: { text: string; color: string; textColor: string; bold: boolean }) => void;
  onDelete: (id: number) => void;
  onOpenTable: (id: number) => void; // ✅ NOVO
  canManage: boolean;
}

const SortableButton: React.FC<SortableButtonProps> = ({
  id,
  text,
  color,
  textColor,
  bold,
  onEdit,
  onDelete,
  onOpenTable,
  canManage,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [editText, setEditText] = useState(text);
  const [editColor, setEditColor] = useState(color);
  const [editTextColor, setEditTextColor] = useState(textColor);
  const [editBold, setEditBold] = useState(bold);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: color,
    color: textColor,
    fontWeight: bold ? "bold" : "normal",
    textAlign: "center" as const,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="p-4 rounded shadow flex justify-between items-center cursor-default"
      >
        <span className="flex-1 text-center">{text}</span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenTable(id)}
            className="p-1 hover:bg-green-100 rounded transition"
            title="Abrir Tabela"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h13v6M9 7V5a2 2 0 012-2h10a2 2 0 012 2v2M9 21h6" />
            </svg>
          </button>

          {canManage && (
            <>
              <div {...attributes} {...listeners} className="cursor-move p-1 hover:bg-gray-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>

              <button onClick={() => setShowEdit(true)} className="p-1 hover:bg-blue-100 rounded transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 13.5V19h5.5l9.5-9.5-5.5-5.5L4 13.5z" />
                </svg>
              </button>

              <button onClick={() => setShowDelete(true)} className="p-1 hover:bg-red-100 rounded transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-4 0a1 1 0 00-1 1v1h6V5a1 1 0 00-1-1m-4 0h4" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow border-2 border-[#acf7b9] w-full max-w-md">
            <h2 className="text-lg font-semibold text-[#0F9D58] mb-4">Editar Botão</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="border border-[#E6F4EA] px-3 py-2 rounded w-full"
                placeholder="Texto"
              />
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm mb-1">Cor Fundo</label>
                  <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Cor Texto</label>
                  <input type="color" value={editTextColor} onChange={(e) => setEditTextColor(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="block text-sm">Negrito</label>
                  <input type="checkbox" checked={editBold} onChange={(e) => setEditBold(e.target.checked)} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  onEdit(id, { text: editText, color: editColor, textColor: editTextColor, bold: editBold });
                  setShowEdit(false);
                }}
                className="px-4 py-2 bg-[#0F9D58] text-white rounded hover:bg-[#0C7A43]"
              >
                Salvar
              </button>
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 border border-[#E6F4EA] text-[#0F9D58] rounded hover:bg-[#E6F4EA]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow border-2 border-[#acf7b9] w-full max-w-sm">
            <h2 className="text-lg font-semibold text-[#0F9D58] mb-4">Confirmar Exclusão</h2>
            <p className="mb-4 text-gray-700">Tem certeza que deseja excluir este botão e sua tabela?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  onDelete(id);
                  setShowDelete(false);
                }}
                className="px-4 py-2 bg-[#0F9D58] text-white rounded hover:bg-[#0C7A43]"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 border border-[#E6F4EA] text-[#0F9D58] rounded hover:bg-[#E6F4EA]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SortableButton;
