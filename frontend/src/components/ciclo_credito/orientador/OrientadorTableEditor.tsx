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
}

const OrientadorTableEditor: React.FC<Props> = ({ buttonId }) => {
  const { hasAnyClaim } = useAuth();
  const canManage = hasAnyClaim([
    "CcCreateOri",
    "CcUpdateOri",
    "CanManageAll",
  ]);

  const [table, setTable] = useState<TableData>({
    columns: [{ header: "A", isLocked: false }],
    rows: [[{ value: "" }]],
  });

  const [loading, setLoading] = useState(false);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerColor, setPickerColor] = useState("#ffffff");

  // Para qual célula aplicar cor
  const [colorTargetCells, setColorTargetCells] = useState<[number, number][]>([]);

  // 1️⃣ Carregar tabela existente
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/ciclo/orientador/buttons/${buttonId}/table`, {
      credentials: "include",
    })
      .then((res) => (res.status === 404 ? null : res.json()))
      .then((data) => {
        if (data) setTable(JSON.parse(data.dataJson));
      })
      .finally(() => setLoading(false));
  }, [buttonId]);

  // 2️⃣ Adicionar Coluna
  const addColumn = () => {
    const newHeader = String.fromCharCode(65 + table.columns.length);
    const newColumns = [...table.columns, { header: newHeader, isLocked: false }];
    const newRows = table.rows.map((row) => [...row, { value: "" }]);
    setTable({ columns: newColumns, rows: newRows });
  };

  // 3️⃣ Adicionar Linha
  const addRow = () => {
    const newRow = table.columns.map(() => ({ value: "" }));
    setTable({ ...table, rows: [...table.rows, newRow] });
  };

  // 4️⃣ Remover Coluna e reordenar
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

  // 5️⃣ Remover Linha
  const removeRow = (ri: number) => {
    if (table.rows.length <= 1) return;
    const newRows = table.rows.filter((_, idx) => idx !== ri);
    setTable({ ...table, rows: newRows });
  };

  // 6️⃣ Trava/Destrava Coluna
  const toggleLock = (ci: number) => {
    if (!canManage) return;
    const updated = [...table.columns];
    updated[ci].isLocked = !updated[ci].isLocked;
    setTable({ ...table, columns: updated });
  };

  // 7️⃣ Atualiza célula
  const updateCell = (r: number, c: number, val: string) => {
    const updated = table.rows.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri === r && ci === c) return { ...cell, value: val };
        return cell;
      })
    );
    setTable({ ...table, rows: updated });
  };

  // 8️⃣ Avalia fórmula
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

  // 9️⃣ Mesclar Selecionadas
    const mergeSelectedCells = () => {
    if (selectedCells.length < 2) return;

    const [[baseR, baseC]] = selectedCells;

    const updated = table.rows.map((row, r) =>
        row.map((cell, c) => {
        if (r === baseR && c === baseC) {
            const newCell: Cell = { ...cell };
            delete newCell.masterCell;
            return newCell;
        }
        if (selectedCells.some(([sr, sc]) => sr === r && sc === c)) {
            const newCell: Cell = { ...cell, masterCell: [baseR, baseC] as [number, number] };
            return newCell;
        }
        return cell;
        })
    );

    setTable({ ...table, rows: updated });
    setSelectedCells([]);
    };

  // 🔟 Desmesclar
  const unmergeSelectedCells = () => {
    const updated = table.rows.map((row, r) =>
      row.map((cell, c) => {
        if (selectedCells.some(([sr, sc]) => sr === r && sc === c)) {
          const newCell = { ...cell };
          delete newCell.masterCell;
          return newCell;
        }
        return cell;
      })
    );
    setTable({ ...table, rows: updated });
    setSelectedCells([]);
  };

  // 11️⃣ Salvar tabela
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
    alert("Tabela salva com sucesso!");
  };

  // 12️⃣ Clique em célula
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

  // 13️⃣ Abrir Picker
  const openColorPicker = () => {
    if (selectedCells.length === 0) return;
    setColorTargetCells(selectedCells);
    setPickerColor("#ffffff");
    setShowColorPicker(true);
  };

  // 14️⃣ Aplicar cor
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#0F9D58]">Tabela do Botão</h3>

      {loading && <p>Carregando...</p>}

      <div className="overflow-auto border rounded shadow">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr>
              {table.columns.map((col, ci) => (
                <th key={ci} className="border px-3 py-2 bg-[#E6F4EA] relative">
                  {col.header}
                  {canManage && (
                    <>
                      <button
                        onClick={() => toggleLock(ci)}
                        className={`ml-2 text-xs px-2 rounded ${col.isLocked ? "bg-[#0F9D58] text-white" : "bg-gray-200"}`}
                      >
                        {col.isLocked ? "🔒" : "🔓"}
                      </button>
                      <button onClick={() => removeColumn(ci)} className="ml-1 text-xs text-red-600">❌</button>
                    </>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const baseCell = cell.masterCell
                    ? table.rows[cell.masterCell[0]][cell.masterCell[1]]
                    : cell;
                  const isSelected = selectedCells.some(([sr, sc]) => sr === ri && sc === ci);
                  return (
                    <td
                      key={ci}
                      className={`border px-3 py-2 cursor-pointer ${isSelected ? "bg-yellow-100" : ""}`}
                      style={{ backgroundColor: baseCell.bgColor }}
                      onClick={(e) => handleCellClick(ri, ci, e)}
                    >
                      {table.columns[ci].isLocked ? evaluateCell(baseCell) : (
                        <input
                          value={baseCell.value}
                          onChange={(e) => updateCell(ri, ci, e.target.value)}
                          disabled={table.columns[ci].isLocked}
                          className="w-full border px-1"
                        />
                      )}
                    </td>
                  );
                })}
                {canManage && (
                  <td className="border px-2">
                    <button onClick={() => removeRow(ri)} className="text-xs text-red-600">❌</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={addColumn} className="px-4 py-2 bg-[#0F9D58] text-white rounded">+ Coluna</button>
          <button onClick={addRow} className="px-4 py-2 bg-[#0F9D58] text-white rounded">+ Linha</button>
          <button onClick={mergeSelectedCells} className="px-4 py-2 bg-blue-600 text-white rounded">Mesclar</button>
          <button onClick={unmergeSelectedCells} className="px-4 py-2 bg-yellow-500 text-white rounded">Desmesclar</button>
          <button onClick={openColorPicker} className="px-4 py-2 bg-purple-600 text-white rounded">Pintar</button>
          <button onClick={saveTable} className="px-4 py-2 bg-gray-700 text-white rounded">Salvar Tabela</button>
        </div>
      )}

      {showColorPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow space-y-4">
            <ChromePicker color={pickerColor} onChange={(c) => setPickerColor(c.hex)} />
            <div className="flex justify-end gap-2">
              <button onClick={applyColor} className="px-4 py-2 bg-[#0F9D58] text-white rounded">Aplicar</button>
              <button onClick={() => setShowColorPicker(false)} className="px-4 py-2 border border-[#E6F4EA] text-[#0F9D58] rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrientadorTableEditor;
