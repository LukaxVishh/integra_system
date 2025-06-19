import React, { useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import { useAuth } from "../../../utils/AuthContext";

interface Cell {
  value: string;
  masterCell?: [number, number];
  bgColor?: string;
}

interface Column {
  header: string;
  isLocked: boolean;
}

interface TableData {
  columns: Column[];
  rows: Cell[][];
}

interface Props {
  buttonId: number;
  onClose: () => void; // para voltar para a lista de botões
}

const OrientadorTableEditor: React.FC<Props> = ({ buttonId, onClose }) => {
  const { hasAnyClaim } = useAuth();
  const canManage = hasAnyClaim(["CcCreateOri", "CcUpdateOri", "CanManageAll"]);

  const [table, setTable] = useState<TableData>({
    columns: [{ header: "A", isLocked: false }],
    rows: [[{ value: "" }]],
  });

  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerColor, setPickerColor] = useState("#ffffff");
  const [colorTargetCells, setColorTargetCells] = useState<[number, number][]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Carrega tabela
  useEffect(() => {
    fetch(`http://localhost:5000/ciclo/orientador/buttons/${buttonId}/table`, {
      credentials: "include",
    })
      .then((res) => (res.status === 404 ? null : res.json()))
      .then((data) => {
        if (data) setTable(JSON.parse(data.dataJson));
      });
  }, [buttonId]);

  // ---- Ações de Tabela ----

  const addColumn = () => {
    const newHeader = String.fromCharCode(65 + table.columns.length);
    const newColumns = [...table.columns, { header: newHeader, isLocked: false }];
    const newRows = table.rows.map((row) => [...row, { value: "" }]);
    setTable({ columns: newColumns, rows: newRows });
  };

  const addRow = () => {
    const newRow = table.columns.map(() => ({ value: "" }));
    setTable({ ...table, rows: [...table.rows, newRow] });
  };

  const removeColumn = (ci: number) => {
    if (table.columns.length <= 1) return;
    const newColumns = table.columns.filter((_, idx) => idx !== ci);
    const newRows = table.rows.map((row) => row.filter((_, idx) => idx !== ci));
    const reordered = newColumns.map((col, idx) => ({
      ...col,
      header: String.fromCharCode(65 + idx),
    }));
    setTable({ columns: reordered, rows: newRows });
  };

  const removeRow = (ri: number) => {
    if (table.rows.length <= 1) return;
    const newRows = table.rows.filter((_, idx) => idx !== ri);
    setTable({ ...table, rows: newRows });
  };

  const toggleLock = (ci: number) => {
    if (!canManage) return;
    const updated = [...table.columns];
    updated[ci].isLocked = !updated[ci].isLocked;
    setTable({ ...table, columns: updated });
  };

  const updateCell = (r: number, c: number, val: string) => {
    const updated = table.rows.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri === r && ci === c) return { ...cell, value: val };
        return cell;
      })
    );
    setTable({ ...table, rows: updated });
  };

  const evaluateCell = (cell: Cell): string => {
    if (!cell.value.startsWith("=")) return cell.value;
    try {
      let expr = cell.value.slice(1);
      expr = expr.replace(/([A-Z]+)(\d+)/g, (_, col, row) => {
        const colIdx = col.charCodeAt(0) - 65;
        const rowIdx = parseInt(row) - 1;
        return table.rows[rowIdx]?.[colIdx]?.value || "0";
      });
      return eval(expr).toString();
    } catch {
      return "ERR";
    }
  };

  // MESCLAR CELULAS DA MESMA LINHA (apenas adjacentes)
  const mergeSelectedCells = () => {
    if (selectedCells.length < 2) return;

    // 1️⃣ Verifica se todas estão na mesma linha
    const row = selectedCells[0][0];
    const sameRow = selectedCells.every(([r]) => r === row);
    if (!sameRow) {
      alert("Selecione apenas células da mesma linha.");
      return;
    }

    // 2️⃣ Ordena colunas para garantir que sejam adjacentes
    const cols = selectedCells.map(([_, c]) => c).sort((a, b) => a - b);
    for (let i = 1; i < cols.length; i++) {
      if (cols[i] !== cols[i - 1] + 1) {
        alert("Selecione células adjacentes na mesma linha.");
        return;
      }
    }

    // 3️⃣ Define a célula base: a primeira coluna selecionada
    const baseC = cols[0];

    // 4️⃣ Atualiza a tabela
    const updated = table.rows.map((rowArr, r) =>
      rowArr.map((cell, c) => {
        if (r === row && c === baseC) {
          // célula base: garante que NÃO tenha masterCell
          const newCell: Cell = { ...cell };
          delete newCell.masterCell;
          return newCell;
        }
        if (r === row && cols.includes(c) && c !== baseC) {
          // outras da mesma linha recebem a referência fixa como tupla
          return { ...cell, masterCell: [row, baseC] as [number, number] };
        }
        return cell;
      })
    );

    setTable({ ...table, rows: updated });
    setSelectedCells([]);
  };

  const unmergeSelectedCells = () => {
    let updatedRows = [...table.rows.map((row) => [...row])];

    selectedCells.forEach(([r, c]) => {
      const cell = table.rows[r][c];

      // Se for base da mescla (não tem masterCell), remove masterCell de todas as à direita
      if (!cell.masterCell) {
        for (let ci = c + 1; ci < table.columns.length; ci++) {
          const nextCell = updatedRows[r][ci];
          if (
            nextCell.masterCell &&
            nextCell.masterCell[0] === r &&
            nextCell.masterCell[1] === c
          ) {
            delete nextCell.masterCell;
          } else {
            break; // parou o grupo mesclado
          }
        }
      }

      // Se for célula mesclada, remove masterCell dela e de todas as à direita do grupo base
      if (cell.masterCell) {
        const [baseR, baseC] = cell.masterCell;
        for (let ci = baseC + 1; ci < table.columns.length; ci++) {
          const nextCell = updatedRows[baseR][ci];
          if (
            nextCell.masterCell &&
            nextCell.masterCell[0] === baseR &&
            nextCell.masterCell[1] === baseC
          ) {
            delete nextCell.masterCell;
          } else {
            break;
          }
        }
        delete updatedRows[r][c].masterCell; // remove da própria também
      }

      // Por garantia, sempre remove masterCell da célula selecionada
      delete updatedRows[r][c].masterCell;
    });

    setTable({ ...table, rows: updatedRows });
    setSelectedCells([]);
  };


  const saveTable = async () => {
    await fetch(`http://localhost:5000/ciclo/orientador/buttons/${buttonId}/table`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buttonId,
        dataJson: JSON.stringify(table),
      }),
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose(); // fecha modal/tela
    }, 2000);
  };

  const handleCellClick = (r: number, c: number, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedCells((prev) =>
        prev.some(([sr, sc]) => sr === r && sc === c)
          ? prev.filter(([sr, sc]) => !(sr === r && sc === c))
          : [...prev, [r, c]]
      );
    } else {
      setSelectedCells([[r, c]]);
    }
  };

  const openColorPicker = () => {
    if (selectedCells.length === 0) return;
    setColorTargetCells(selectedCells);
    setPickerColor("#ffffff");
    setShowColorPicker(true);
  };

  const applyColor = () => {
    const updated = table.rows.map((row, ri) =>
      row.map((cell, ci) => {
        if (colorTargetCells.some(([r, c]) => r === ri && c === ci)) {
          return { ...cell, bgColor: pickerColor };
        }
        return cell;
      })
    );
    setTable({ ...table, rows: updated });
    setShowColorPicker(false);
    setColorTargetCells([]);
  };

  // SVGs
  const svg = {
    pintar: (
      <svg aria-label="Pintar" className="w-6 h-6 transition-all duration-200" viewBox="0 0 24 24" fill="none"
        stroke="#0F9D58" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="6" x="2" y="2" rx="2" />
        <path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect width="4" height="6" x="8" y="16" rx="1" />
      </svg>
    ),
    addCol: (
      <svg aria-label="Adicionar coluna" className="w-6 h-6 transition-all duration-200" viewBox="0 0 24 24" fill="none"
        stroke="#0F9D58" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="13" x="3" y="3" rx="1" />
        <path d="m9 22 3-3 3 3" />
        <rect width="7" height="13" x="14" y="3" rx="1" />
      </svg>
    ),
    addRow: (
      <svg aria-label="Adicionar linha" className="w-6 h-6 transition-all duration-200" viewBox="0 0 24 24" fill="none"
        stroke="#0F9D58" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect width="13" height="7" x="3" y="3" rx="1" />
        <path d="m22 15-3-3 3-3" />
        <rect width="13" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
    mesclar: (
      <svg aria-label="Mesclar células" className="w-6 h-6 transition-all duration-200" viewBox="0 0 24 24" fill="none"
        stroke="#0F9D58" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21v-6" />
        <path d="M12 9V3" />
        <path d="M3 15h18" />
        <path d="M3 9h18" />
        <rect width="18" height="18" x="3" y="3" rx="2" />
      </svg>
    ),
    desmesclar: (
      <svg aria-label="Desmesclar células" className="w-6 h-6 transition-all duration-200" viewBox="0 0 24 24" fill="none"
        stroke="#0F9D58" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15V9" />
        <path d="M3 15h18" />
        <path d="M3 9h18" />
        <rect width="18" height="18" x="3" y="3" rx="2" />
      </svg>
    ),
    salvar: (
      <svg aria-label="Salvar tabela" className="w-6 h-6 transition-all duration-200" viewBox="0 0 24 24" fill="none"
        stroke="#0F9D58" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v3a1 1 0 0 0 1 1h5" />
        <path d="M18 18v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6" />
        <path d="M18 22H4a2 2 0 0 1-2-2V6" />
        <path d="M8 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9.172a2 2 0 0 1 1.414.586l2.828 2.828A2 2 0 0 1 22 6.828V16a2 2 0 0 1-2.01 2z" />
      </svg>
    ),
    remover: (
      <svg aria-label="Remover" className="w-5 h-5 transition-all duration-200" viewBox="0 0 24 24" fill="none"
        stroke="#e53935" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </svg>
    ),
  };

  // --- RENDER ---
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-[#0F9D58] mb-2"></h3>

      {/* TOOLBAR */}
      {canManage && (
        <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-[#eafaf2] border border-[#d4f5df] shadow-sm">
          <button onClick={addColumn}
            className="group bg-white hover:bg-[#0F9D58]/10 rounded-full p-2 transition text-[#0F9D58] shadow hover:scale-110"
            aria-label="Adicionar coluna">
            <span className="group-hover:scale-125 group-hover:text-[#128C52]">{svg.addCol}</span>
          </button>
          <button onClick={addRow}
            className="group bg-white hover:bg-[#0F9D58]/10 rounded-full p-2 transition text-[#0F9D58] shadow hover:scale-110"
            aria-label="Adicionar linha">
            <span className="group-hover:scale-125 group-hover:text-[#128C52]">{svg.addRow}</span>
          </button>
          <button onClick={mergeSelectedCells}
            className="group bg-white hover:bg-[#0F9D58]/10 rounded-full p-2 transition text-[#0F9D58] shadow hover:scale-110"
            aria-label="Mesclar células">
            <span className="group-hover:scale-125 group-hover:text-[#128C52]">{svg.mesclar}</span>
          </button>
          <button onClick={unmergeSelectedCells}
            className="group bg-white hover:bg-[#0F9D58]/10 rounded-full p-2 transition text-[#0F9D58] shadow hover:scale-110"
            aria-label="Desmesclar células">
            <span className="group-hover:scale-125 group-hover:text-[#128C52]">{svg.desmesclar}</span>
          </button>
          <button onClick={openColorPicker}
            className="group bg-white hover:bg-[#0F9D58]/10 rounded-full p-2 transition text-[#0F9D58] shadow hover:scale-110"
            aria-label="Pintar células">
            <span className="group-hover:scale-125 group-hover:text-[#128C52]">{svg.pintar}</span>
          </button>
          <button onClick={saveTable}
            className="group bg-white hover:bg-[#0F9D58]/10 rounded-full p-2 transition text-[#0F9D58] shadow hover:scale-110"
            aria-label="Salvar tabela">
            <span className="group-hover:scale-125 group-hover:text-[#128C52]">{svg.salvar}</span>
          </button>
        </div>
      )}

      {/* TABELA */}
      <div className="overflow-auto border border-[#E6F4EA] shadow">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr>
              {table.columns.map((col, ci) => (
                <th key={ci} className={`border px-3 py-2 bg-[#E6F4EA] relative font-semibold text-[#128C52] ${ci === 0 ? "rounded-tl-xl" : ""}
                  ${ci === table.columns.length - 1 ? "rounded-tr-xl" : ""}`}>
                  <div className="flex items-center gap-1 justify-center">
                    <span>{col.header}</span>
                    {canManage && (
                      <>
                        <button
                          aria-label={col.isLocked ? "Destravar" : "Travar"}
                          onClick={() => toggleLock(ci)}
                          className={`rounded-full border border-[#b5efca] px-2 py-1 text-xs ml-1 transition 
                            ${col.isLocked ? "bg-[#0F9D58] text-white shadow-sm" : "bg-white text-[#128C52] hover:bg-[#ebfef2]"}
                          `}
                        >
                          {col.isLocked ? "🔒" : "🔓"}
                        </button>
                        <button
                          aria-label="Remover coluna"
                          onClick={() => removeColumn(ci)}
                          className="rounded-full ml-1 p-1 bg-white text-red-500 hover:bg-red-100 transition border border-red-100"
                        >
                          {svg.remover}
                        </button>
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                if (cell.masterCell) return null;
                let colspan = 1;
                for (let k = ci + 1; k < row.length; k++) {
                  if (
                    row[k]?.masterCell?.[0] === ri &&
                    row[k]?.masterCell?.[1] === ci
                  ) {
                    colspan++;
                  } else {
                    break;
                  }
                }

                // 🔽 Defina aqui, antes do return!
                const isBottomLeft = ri === table.rows.length - 1 && ci === 0;
                const isBottomRight = ri === table.rows.length - 1 && ci === row.length - 1;

                const baseCell = cell;
                const isSelected = selectedCells.some(([sr, sc]) => sr === ri && sc === ci);
                  return (
                    <td
                      key={ci}
                      colSpan={colspan}
                      className={`
                        border px-3 py-2 cursor-pointer align-top
                        ${isSelected ? "ring-2 ring-[#0F9D58] bg-yellow-50" : ""}
                        ${isBottomLeft ? "rounded-bl-xl" : ""}
                        ${isBottomRight ? "rounded-br-xl" : ""}
                      `}
                      style={{
                        backgroundColor: baseCell.bgColor,
                        minWidth: 110,
                        maxWidth: 230,
                        wordBreak: "break-word"
                      }}
                      onClick={(e) => handleCellClick(ri, ci, e)}
                    >
                      {table.columns[ci].isLocked ? (
                        <div className="whitespace-pre-line">{evaluateCell(baseCell)}</div>
                      ) : (
                        <textarea
                          value={baseCell.value}
                          onChange={(e) => updateCell(ri, ci, e.target.value)}
                          disabled={table.columns[ci].isLocked}
                          className="w-full outline-none p-2 min-h-[36px] bg-transparent text-[#222] resize-y"
                          style={{ wordBreak: "break-word", border: "none", boxShadow: "none" }}
                        />
                      )}
                    </td>
                  );
                })}
                {canManage && (() => {
                  const isBottomLeft = false;
                  const isBottomRight = ri === table.rows.length - 1;
                  return (
                    <td
                      className={`
                        border px-2
                        ${isBottomLeft ? "rounded-bl-xl" : ""}
                        ${isBottomRight ? "rounded-br-xl" : ""}
                      `}
                    >
                      {/* botão remover linha */}
                      <button
                        aria-label="Remover linha"
                        onClick={() => removeRow(ri)}
                        className="rounded-full p-1 bg-white text-red-500 hover:bg-red-100 border border-red-100 transition"
                      >
                        {svg.remover}
                      </button>
                    </td>
                  );
                })()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP SUCESSO */}
      {showSuccess && (
        <div className="fixed top-23 left-230 z-50 -translate-x-1/2">
          <div className="bg-white border border-[#14c76e] text-[#14c76e] px-8 py-2 rounded-xl shadow text-lg font-semibold flex items-center gap-3 animate-fade-in">
            <svg className="w-6 h-6" fill="none" stroke="#14c76e" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeOpacity=".18" fill="#14c76e" fillOpacity=".12"/>
              <path d="M7 13l3 3 6-6" stroke="#14c76e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            Tabela salva com sucesso!
          </div>
        </div>
      )}

      {/* PICKER DE COR */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow space-y-4 border border-[#0F9D58]">
            <ChromePicker color={pickerColor} onChange={(c) => setPickerColor(c.hex)} />
            <div className="flex justify-end gap-2">
              <button
                onClick={applyColor}
                className="px-4 py-2 bg-[#0F9D58] text-white rounded shadow hover:bg-[#128C52] transition"
              >
                Aplicar
              </button>
              <button
                onClick={() => setShowColorPicker(false)}
                className="px-4 py-2 border border-[#E6F4EA] text-[#0F9D58] rounded hover:bg-[#E6F4EA] transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrientadorTableEditor;
