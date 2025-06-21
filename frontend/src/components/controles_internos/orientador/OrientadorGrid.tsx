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
  onButtonClick: (id: number) => void;
}

const OrientadorGrid: React.FC<OrientadorGridProps> = ({ onButtonClick }) => {
  const { hasAnyClaim } = useAuth();
  const canManage = hasAnyClaim([
    "CiCreateOri",
    "CiUpdateOri",
    "CiDeleteOri",
    "CanManageAll",
  ]);

  const [buttons, setButtons] = useState<ButtonData[]>([]);
  const [newText, setNewText] = useState("");
  const [newColor, setNewColor] = useState("#E6F4EA");
  const [newTextColor, setNewTextColor] = useState("#000000");
  const [newBold, setNewBold] = useState(true);
  const [showTools, setShowTools] = useState(false);
  const [toolsAnimateState, setToolsAnimateState] = useState<
    "entering" | "exiting" | null
  >(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetch("http://localhost:5000/controles-internos/orientador/buttons", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setButtons)
      .catch(console.error);
  }, []);

  const createButton = async () => {
    if (!newText.trim()) return;
    const res = await fetch("http://localhost:5000/controles-internos/orientador/buttons", {
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
    setButtons((prev) => [...prev, data]);
    setNewText("");
    setNewColor("#E6F4EA");
    setNewTextColor("#000000");
    setNewBold(true);
  };

  const updateButton = async (
    id: number,
    newData: Omit<ButtonData, "id" | "order">
  ) => {
    const button = buttons.find((b) => b.id === id);
    if (!button) return;
    const res = await fetch(
      `http://localhost:5000/controles-internos/orientador/buttons/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newData, order: button.order }),
      }
    );
    const data = await res.json();
    setButtons((prev) => prev.map((b) => (b.id === id ? data : b)));
  };

  const deleteButton = async (id: number) => {
    await fetch(`http://localhost:5000/controles-internos/orientador/buttons/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setButtons((prev) => prev.filter((b) => b.id !== id));
  };

  const handleDragEnd = async (event: any) => {
    if (!canManage || !showTools) return;
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = buttons.findIndex((b) => b.id === active.id);
      const newIndex = buttons.findIndex((b) => b.id === over.id);
      const newOrder = arrayMove(buttons, oldIndex, newIndex);
      setButtons(newOrder);
      await fetch("http://localhost:5000/controles-internos/orientador/buttons/reorder", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder.map((b) => b.id)),
      });
    }
  };

  const toggleTools = () => {
    if (showTools) {
      setToolsAnimateState("exiting");
      setTimeout(() => {
        setShowTools(false);
        setToolsAnimateState(null);
      }, 200);
    } else {
      setShowTools(true);
      setToolsAnimateState("entering");
    }
  };

  const canDoAdmin = canManage && showTools;

  return (
    <div className="relative">
      {canManage && (
        <button
          onClick={toggleTools}
          className={`fixed top-24 right-10 p-1 rounded-full shadow bg-white border border-[#E6F4EA] hover:bg-[#F0FDF4] transition z-50 ${
            showTools ? "ring-1 ring-[#5bc87e]" : ""
          }`}
          title="Modo Admin"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0F9D58"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}

      {canDoAdmin && (
        <div
          className={`mb-6 p-4 border border-[#E6F4EA] rounded-lg bg-[#F9FAFB] shadow space-y-3 ${
            toolsAnimateState === "entering"
              ? "animate-dropdown-enter"
              : toolsAnimateState === "exiting"
              ? "animate-dropdown-exit"
              : ""
          }`}
        >
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E6F4EA] gap-2 w-full max-w-[500px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                stroke="#0F9D58"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z" />
              </svg>
              <input
                type="text"
                placeholder="Texto"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="flex-grow outline-none border-none bg-transparent focus:ring-0 text-[#111]"
              />
            </div>

            <div
              onClick={() => setNewBold(!newBold)}
              className={`flex items-center bg-white rounded-lg px-3 py-2 border border-[#E6F4EA] cursor-pointer transition ${
                newBold ? "bg-[#0F9D58] text-green-700" : "bg-[#0F9D58] text-green-200"
              }`}
              title="Negrito"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
              </svg>
            </div>

            <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E6F4EA] gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                stroke="#0F9D58"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 20h16" />
                <path d="m6 16 6-12 6 12" />
                <path d="M8 12h8" />
              </svg>
              <label className="relative flex items-center">
                <input
                  type="color"
                  value={newTextColor}
                  onChange={(e) => setNewTextColor(e.target.value)}
                  className="w-6 h-6 opacity-0 absolute cursor-pointer"
                  style={{ left: 0 }}
                />
                <span
                  className="inline-block w-6 h-6 rounded-full border border-[#E6F4EA]"
                  style={{ background: newTextColor }}
                ></span>
              </label>
            </div>

            <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E6F4EA] gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                stroke="#0F9D58"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect width="16" height="6" x="2" y="2" rx="2" />
                <path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect width="4" height="6" x="8" y="16" rx="1" />
              </svg>
              <label className="relative flex items-center">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-6 h-6 opacity-0 absolute cursor-pointer"
                  style={{ left: 0 }}
                />
                <span
                  className="inline-block w-6 h-6 rounded-full border border-[#E6F4EA]"
                  style={{ background: newColor }}
                ></span>
              </label>
            </div>

            <button
              onClick={createButton}
              className="flex items-center gap-2 px-5 py-2 bg-[#0F9D58] text-white rounded-lg shadow hover:bg-[#0C7A43] transition font-semibold"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              Adicionar
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={buttons.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buttons.map((b) => (
              <SortableButton
                key={b.id}
                {...b}
                onEdit={updateButton}
                onDelete={deleteButton}
                onOpenTable={onButtonClick}
                canManage={canDoAdmin}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
    </div>
  );
};

export default OrientadorGrid;
