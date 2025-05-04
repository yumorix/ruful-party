'use client';

import { useState } from 'react';
import { TableData } from '../../lib/utils/validation';
import { ulid } from 'ulid';

interface TableConfigEditorProps {
  tables: TableData[];
  onChange: (tables: TableData[]) => void;
}

export default function TableConfigEditor({ tables, onChange }: TableConfigEditorProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    tables.length > 0 ? tables[0].id : null
  );

  const addTable = () => {
    const newTable: TableData = {
      id: ulid(),
      name: `テーブル ${tables.length + 1}`,
      seatCount: 6,
    };
    const updatedTables = [...tables, newTable];
    onChange(updatedTables);
    setSelectedTableId(newTable.id);
  };

  const removeTable = (id: string) => {
    const updatedTables = tables.filter(table => table.id !== id);
    onChange(updatedTables);

    if (selectedTableId === id) {
      setSelectedTableId(updatedTables.length > 0 ? updatedTables[0].id : null);
    }
  };

  const updateTable = (id: string, updates: Partial<TableData>) => {
    const updatedTables = tables.map(table => (table.id === id ? { ...table, ...updates } : table));
    onChange(updatedTables);
  };

  const selectedTable = tables.find(table => table.id === selectedTableId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">テーブル設定</h4>
        <button
          type="button"
          onClick={addTable}
          className="px-3 py-1 bg-primary-main text-white rounded-md text-sm"
        >
          テーブルを追加
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">テーブルがありません。テーブルを追加してください。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 font-medium border-b">テーブル一覧</div>
            <ul className="divide-y">
              {tables.map(table => (
                <li
                  key={table.id}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                    selectedTableId === table.id ? 'bg-primary-main bg-opacity-10' : ''
                  }`}
                  onClick={() => setSelectedTableId(table.id)}
                >
                  <div className="flex justify-between items-center">
                    <span>{table.name}</span>
                    <span className="text-sm text-gray-500">{table.seatCount}席</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2 border rounded-lg">
            {selectedTable ? (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">テーブル名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                    value={selectedTable.name}
                    onChange={e => updateTable(selectedTable.id, { name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">席数</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-grow relative pt-5">
                      <div className="absolute left-0 top-0 text-xs">
                        <span>2</span>
                      </div>
                      <div className="absolute right-0 top-0 text-xs">
                        <span>12</span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={12}
                        step={1}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        value={selectedTable.seatCount}
                        onChange={e =>
                          updateTable(selectedTable.id, {
                            seatCount: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <input
                      type="number"
                      min={2}
                      max={12}
                      step={1}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                      value={selectedTable.seatCount}
                      onChange={e =>
                        updateTable(selectedTable.id, {
                          seatCount: parseInt(e.target.value) || 2,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeTable(selectedTable.id)}
                    className="px-3 py-1 bg-error-main text-white rounded-md text-sm"
                  >
                    このテーブルを削除
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">テーブルを選択してください</div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">テーブルレイアウトプレビュー</h4>
          <div className="border rounded-lg p-4 bg-white min-h-[200px] flex flex-wrap gap-4 justify-center">
            {tables.map(table => (
              <div
                key={table.id}
                className="border rounded-lg p-2 bg-gray-50 w-[120px] h-[120px] flex flex-col items-center justify-center"
              >
                <div className="text-sm font-medium mb-1">{table.name}</div>
                <div className="text-xs text-gray-500">{table.seatCount}席</div>
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {Array.from({ length: Math.min(table.seatCount, 12) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-primary-main rounded-full"
                      title={`席 ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            ))}
            {tables.length === 0 && (
              <div className="text-center py-8 text-gray-400">テーブルがありません</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
