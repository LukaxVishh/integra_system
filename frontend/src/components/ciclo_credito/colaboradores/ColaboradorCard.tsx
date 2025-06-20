import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface Tag {
  id: number;
  name: string;
  color: string;
  descricao: string;
}

interface ColaboradorCardProps {
  id: string;
  nome: string;
  cargo: string;
  photoUrl?: string;
  tags: Tag[];
  historico: string[];
  canEdit: boolean;
  onEdit: (id: string) => void;
  showTooltip?: boolean;
}

const ColaboradorCard: React.FC<ColaboradorCardProps> = ({
  id,
  nome,
  cargo,
  photoUrl,
  tags,
  historico,
  canEdit,
  onEdit,
  showTooltip,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [openPosition, setOpenPosition] = useState<"top" | "bottom">("top");
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);
  const [internalHover, setInternalHover] = useState(false);

  const isHovering = showTooltip ?? internalHover;

  useEffect(() => {
    if (!cardRef.current || !isHovering) return;

    const rect = cardRef.current.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    const position = spaceAbove < 150 && spaceBelow > spaceAbove ? "bottom" : "top";
    setOpenPosition(position);

    const left = rect.left + rect.width / 2;
    const top = position === "top" ? rect.top : rect.bottom;

    setTooltipPos({ left, top });
  }, [isHovering]);

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={() => setInternalHover(true)}
        onMouseLeave={() => setInternalHover(false)}
        className="relative flex items-center bg-white border border-[#E6F4EA] rounded-lg shadow p-3 w-60 hover:shadow-md transition-all duration-300"
      >
        {/* Foto ou inicial */}
        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[#E6F4EA] flex items-center justify-center text-lg font-bold text-[#0F9D58] overflow-hidden">
          {photoUrl ? (
            <img
              src={`http://localhost:5000/${photoUrl}`}
              alt={nome}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            nome[0]
          )}
        </div>

        {/* Nome + Cargo */}
        <div className="ml-3 flex-1 overflow-hidden">
          <p className="text-sm font-semibold text-gray-800 break-words">{nome}</p>
          <p className="text-xs text-gray-500 break-words">{cargo}</p>
        </div>

        {/* Ícone de engrenagem */}
        {canEdit && (
          <button
            onClick={() => onEdit(id)}
            aria-label={`Editar ${nome}`}
            className="ml-2 text-gray-500 hover:text-gray-800 flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>

      {/* Tooltip */}
      {isHovering && tooltipPos &&
        createPortal(
          <div
            className="fixed z-[9999] w-60 max-w-[90vw] bg-white border border-[#E6F4EA] rounded-lg shadow-xl p-4 text-left pointer-events-none transition-opacity duration-200"
            style={{
              left: Math.min(Math.max(tooltipPos.left, 100), window.innerWidth - 100),
              top: openPosition === "top" ? tooltipPos.top - 8 : tooltipPos.top + 8,
              transform: `translate(-50%, ${openPosition === "top" ? "-100%" : "0"})`,
            }}
          >
            <h4 className="text-sm font-bold text-[#0F9D58] mb-2">Atividades</h4>
            {tags.map((tag) => (
              <div key={tag.id} className="mb-2">
                <span
                  className="inline-block px-2 py-0.5 text-xs rounded-full mr-1 text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
                <p className="text-xs text-gray-700">{tag.descricao}</p>
              </div>
            ))}

            {historico.length > 0 && (
              <>
                <h4 className="text-sm font-bold text-[#0F9D58] mt-3">Histórico</h4>
                <ul className="text-xs text-gray-600 list-disc ml-3">
                  {historico.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default ColaboradorCard;
