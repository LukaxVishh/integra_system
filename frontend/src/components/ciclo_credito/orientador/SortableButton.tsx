import React, { useState, useRef, useEffect } from "react";
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
  onOpenTable: (id: number) => void;
  canManage: boolean;
}

const SortableButton: React.FC<SortableButtonProps> = ({
  id,
  text,
  color,
  textColor,
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [animateState, setAnimateState] = useState<"entering" | "exiting" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        toggleMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const toggleMenu = () => {
    if (menuOpen) {
      setAnimateState("exiting");
      setTimeout(() => {
        setMenuOpen(false);
        setAnimateState(null);
      }, 200);
    } else {
      setMenuOpen(true);
      setAnimateState("entering");
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: color,
    color: textColor,
    fontWeight: "bold" as "bold",
    textAlign: "center" as const,
  };

  const svgSheet = (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="text-green-600">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <line x1="3" x2="21" y1="9" y2="9"/>
      <line x1="3" x2="21" y1="15" y2="15"/>
      <line x1="9" x2="9" y1="9" y2="21"/>
      <line x1="15" x2="15" y1="9" y2="21"/>
    </svg>
  );

  const svgPencil = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="text-blue-600">
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
      <path d="m15 5 4 4"/>
    </svg>
  );

  const svgChevronDown = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="p-4 rounded shadow flex justify-between items-center cursor-default relative"
      >
        <span className="flex-1 text-center">{text}</span>

        <div className="flex items-center space-x-2">
          {!canManage && (
            <button
              onClick={() => onOpenTable(id)}
              className="ml-2 p-1 hover:bg-green-50 rounded transition"
              title="Abrir Tabela"
            >
              {svgSheet}
            </button>
          )}

          {canManage && (
            <>
              <div {...attributes} {...listeners} className="cursor-move p-1 hover:bg-gray-100 rounded" title="Mover">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <div ref={menuRef} className="relative">
                <button onClick={toggleMenu} className="p-1 hover:bg-gray-100 rounded transition" aria-label="Ações">
                  {svgChevronDown}
                </button>
                {menuOpen && (
                  <div className={`absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded shadow-lg flex flex-col gap-1 p-2 overflow-hidden ${
                    animateState === "entering" ? "animate-dropdown-enter" :
                    animateState === "exiting" ? "animate-dropdown-exit" : ""
                  }`}>
                    <button onClick={() => { toggleMenu(); onOpenTable(id); }} className="p-2 hover:bg-green-50 rounded transition">{svgSheet}</button>
                    <button onClick={() => { toggleMenu(); setShowEdit(true); }} className="p-2 hover:bg-blue-50 rounded transition">{svgPencil}</button>
                    <button onClick={() => { toggleMenu(); setShowDelete(true); }} className="p-2 hover:bg-red-50 rounded transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-4 0a1 1 0 00-1 1v1h6V5a1 1 0 00-1-1m-4 0h4" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-dropdown-enter">
          <div className="bg-white p-6 rounded shadow border-2 border-[#0F9D58] w-full max-w-md">
            <h2 className="text-lg font-semibold text-[#0F9D58] mb-4">Editar Botão</h2>
            <div className="space-y-4">
              <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E6F4EA] gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z"/></svg>
                <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} placeholder="Texto" className="outline-none border-none bg-transparent w-24 text-[#111]" />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E6F4EA] gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="16" height="6" x="2" y="2" rx="2"/><path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect width="4" height="6" x="8" y="16" rx="1"/></svg>
                  <label className="relative flex items-center">
                    <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-6 h-6 opacity-0 absolute cursor-pointer" />
                    <span className="inline-block w-6 h-6 rounded-full border border-[#E6F4EA]" style={{ background: editColor }}></span>
                  </label>
                </div>
                <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E6F4EA] gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>
                  <label className="relative flex items-center">
                    <input type="color" value={editTextColor} onChange={(e) => setEditTextColor(e.target.value)} className="w-6 h-6 opacity-0 absolute cursor-pointer" />
                    <span className="inline-block w-6 h-6 rounded-full border border-[#E6F4EA]" style={{ background: editTextColor }}></span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => { onEdit(id, { text: editText, color: editColor, textColor: editTextColor, bold: true }); setShowEdit(false); }} className="px-4 py-2 bg-[#0F9D58] text-white rounded hover:bg-[#0C7A43]">Salvar</button>
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 border border-[#E6F4EA] text-[#0F9D58] rounded hover:bg-[#E6F4EA]">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-dropdown-enter">
          <div className="bg-white p-6 rounded shadow border-2 border-[#0F9D58] w-full max-w-sm">
            <h2 className="text-lg font-semibold text-[#0F9D58] mb-4">Confirmar Exclusão</h2>
            <p className="mb-4 text-gray-700">Tem certeza que deseja excluir este botão e sua tabela?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => { onDelete(id); setShowDelete(false); }} className="px-4 py-2 bg-[#0F9D58] text-white rounded hover:bg-[#0C7A43]">Confirmar</button>
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 border border-[#E6F4EA] text-[#0F9D58] rounded hover:bg-[#E6F4EA]">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-dropdown-enter {
          animation: dropdownEnter 0.22s ease forwards;
        }
        .animate-dropdown-exit {
          animation: dropdownExit 0.2s ease forwards;
        }
        @keyframes dropdownEnter {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dropdownExit {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(12px) scale(0.95); }
        }
      `}</style>
    </>
  );
};

export default SortableButton;
