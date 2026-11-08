import React from 'react';
import { Plus, Trash2, RefreshCw, BookOpen, Undo2, Redo2, Sparkles } from 'lucide-react';
import { ALL_CELL_KEYS, CellKey, MatrixTopic } from '../types/exam';
import { calculateMatrixSummary } from '../utils/matrixCalculator';
import { emptyCells } from '../data/sampleToan10';

interface MatrixTableEditorProps {
  topics: MatrixTopic[];
  footnoteText: string;
  readOnly?: boolean;
  onChangeTopics: (topics: MatrixTopic[]) => void;
  onChangeFootnote: (text: string) => void;
  onSyncFromSpec: () => void;
  onOpenYccdBrowser?: () => void;
  onOpenAddContentAi?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const MatrixTableEditor: React.FC<MatrixTableEditorProps> = ({
  topics,
  footnoteText,
  readOnly = false,
  onChangeTopics,
  onChangeFootnote,
  onSyncFromSpec,
  onOpenYccdBrowser,
  onOpenAddContentAi,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const stats = calculateMatrixSummary(topics);

  const handleTopicNameChange = (topicId: string, newName: string) => {
    onChangeTopics(
      topics.map((t) => (t.id === topicId ? { ...t, topicName: newName } : t))
    );
  };

  const handleUnitContentChange = (topicId: string, unitId: string, newContent: string) => {
    onChangeTopics(
      topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              units: t.units.map((u) =>
                u.id === unitId ? { ...u, content: newContent } : u
              ),
            }
          : t
      )
    );
  };

  const handleCellChange = (
    topicId: string,
    unitId: string,
    cellKey: CellKey,
    value: string
  ) => {
    onChangeTopics(
      topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              units: t.units.map((u) =>
                u.id === unitId
                  ? { ...u, cells: { ...u.cells, [cellKey]: value } }
                  : u
              ),
            }
          : t
      )
    );
  };

  const handleAddUnit = (topicId: string) => {
    const newUnitId = `u-${Date.now()}`;
    onChangeTopics(
      topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              units: [
                ...t.units,
                {
                  id: newUnitId,
                  content: 'Nội dung kiến thức mới',
                  cells: emptyCells(),
                },
              ],
            }
          : t
      )
    );
  };

  const handleDeleteUnit = (topicId: string, unitId: string) => {
    onChangeTopics(
      topics
        .map((t) =>
          t.id === topicId
            ? { ...t, units: t.units.filter((u) => u.id !== unitId) }
            : t
        )
        .filter((t) => t.units.length > 0)
    );
  };

  const handleAddTopic = () => {
    const now = Date.now();
    onChangeTopics([
      ...topics,
      {
        id: `topic-${now}`,
        topicName: 'CHỦ ĐỀ MỚI',
        units: [
          {
            id: `u-${now}`,
            content: 'Đơn vị kiến thức 1',
            cells: emptyCells({ TD_Biet: '01TN\n(TD1.1)' }),
          },
        ],
      },
    ]);
  };

  return (
    <section aria-labelledby="matrix-heading" className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <h3 id="matrix-heading" className="font-doc font-bold text-base text-black">
            I. MA TRẬN
          </h3>
          {!readOnly && onUndo && onRedo && (
            <div className="no-print inline-flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1 text-slate-700 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Hoàn tác chỉnh sửa ma trận (Ctrl+Z)"
                data-testid="matrix-undo-btn"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1 text-slate-700 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Làm lại chỉnh sửa ma trận (Ctrl+Y)"
                data-testid="matrix-redo-btn"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        {!readOnly && (
          <div className="no-print flex items-center gap-2">
            <button
              type="button"
              onClick={onSyncFromSpec}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
              title="Tự động tổng hợp lại các ô Ma trận dựa trên Bảng đặc tả"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Đồng bộ từ Bảng đặc tả
            </button>
            {onOpenYccdBrowser && (
              <button
                type="button"
                onClick={onOpenYccdBrowser}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                Chọn từ YCCD Bộ GD&ĐT
              </button>
            )}
            {onOpenAddContentAi && (
              <button
                type="button"
                onClick={onOpenAddContentAi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                title="Nhập thêm nội dung bài kiểm tra để AI bổ sung vào Ma trận và Bảng đặc tả"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                AI Thêm nội dung
              </button>
            )}
            <button
              type="button"
              onClick={handleAddTopic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm Chủ đề
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="exam-table" data-testid="matrix-table">
          <thead>
            <tr>
              <th rowSpan={3} className="exam-header-green w-[13%]">
                Chủ đề
              </th>
              <th rowSpan={3} className="exam-header-green w-[18%]">
                Nội dung
              </th>
              <th colSpan={9} className="exam-header-green">
                Năng lực Toán học – Cấp độ tư duy
              </th>
              <th rowSpan={3} className="exam-header-green w-[6%]">
                Tổng
                <br />
                lệnh
                <br />
                hỏi
              </th>
            </tr>
            <tr>
              <th colSpan={3} className="exam-header-green">
                Tư duy và lập luận toán học
                <br />
                (TD)
              </th>
              <th colSpan={3} className="exam-header-green">
                Giải quyết vấn đề toán học
                <br />
                (GQ)
              </th>
              <th colSpan={3} className="exam-header-green">
                Mô hình hóa toán học
                <br />
                (MH)
              </th>
            </tr>
            <tr>
              <th className="exam-header-green w-[6.5%]">Biết</th>
              <th className="exam-header-green w-[6.5%]">Hiểu</th>
              <th className="exam-header-green w-[6.5%]">VD</th>
              <th className="exam-header-green w-[6.5%]">Biết</th>
              <th className="exam-header-green w-[6.5%]">Hiểu</th>
              <th className="exam-header-green w-[6.5%]">VD</th>
              <th className="exam-header-green w-[6.5%]">Biết</th>
              <th className="exam-header-green w-[6.5%]">Hiểu</th>
              <th className="exam-header-green w-[6.5%]">VD</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) =>
              topic.units.map((unit, uIdx) => {
                const unitSum = stats.unitTotals[unit.id] || 0;
                return (
                  <tr key={unit.id} className="group hover:bg-slate-50/70">
                    {uIdx === 0 && (
                      <td
                        rowSpan={topic.units.length}
                        className="font-bold text-center align-middle bg-white"
                      >
                        {readOnly ? (
                          <div className="whitespace-pre-line">{topic.topicName}</div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <textarea
                              aria-label={`Tên chủ đề ${topic.topicName}`}
                              value={topic.topicName}
                              onChange={(e) =>
                                handleTopicNameChange(topic.id, e.target.value)
                              }
                              rows={3}
                              className="w-full text-center font-bold bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded p-1 resize-none text-[13px] leading-snug focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddUnit(topic.id)}
                              className="no-print inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-sans font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors whitespace-nowrap"
                              title="Thêm mạch nội dung vào chủ đề này"
                            >
                              <Plus className="w-3 h-3" />
                              Thêm nội dung
                            </button>
                          </div>
                        )}
                      </td>
                    )}

                    <td className="text-center align-middle relative">
                      {readOnly ? (
                        <div className="whitespace-pre-line">{unit.content}</div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <textarea
                            aria-label={`Nội dung ${unit.content}`}
                            value={unit.content}
                            onChange={(e) =>
                              handleUnitContentChange(
                                topic.id,
                                unit.id,
                                e.target.value
                              )
                            }
                            rows={2}
                            className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded p-1 resize-none text-[13px] leading-snug focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteUnit(topic.id, unit.id)}
                            aria-label={`Xóa nội dung ${unit.content}`}
                            className="no-print opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-opacity shrink-0"
                            title="Xóa dòng nội dung này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {ALL_CELL_KEYS.map((cellKey) => {
                      const val = unit.cells[cellKey] || '';
                      const computedRows = Math.max(
                        2,
                        val.split('\n').length + (val.length > 14 ? 1 : 0)
                      );
                      return (
                        <td key={cellKey} className="text-center align-middle p-1 min-w-[54px]">
                          {readOnly ? (
                            <div className="whitespace-pre-line text-center">
                              {val}
                            </div>
                          ) : (
                            <textarea
                              aria-label={`${unit.content} - ${cellKey}`}
                              value={val}
                              onChange={(e) =>
                                handleCellChange(
                                  topic.id,
                                  unit.id,
                                  cellKey,
                                  e.target.value
                                )
                              }
                              placeholder="—"
                              rows={computedRows}
                              className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-blue-50/30 rounded p-0.5 resize-none text-[12.5px] leading-tight placeholder:text-slate-200 focus:outline-none"
                            />
                          )}
                        </td>
                      );
                    })}

                    <td className="text-center font-semibold tabular-nums bg-slate-50/60">
                      {unitSum > 0 ? unitSum : ''}
                    </td>
                  </tr>
                );
              })
            )}

            {/* 4 Dòng tổng kết màu cam nhạt (#F8CBAD) chuẩn theo mẫu PDF */}
            <tr>
              <td colSpan={2} className="exam-summary-orange">
                Tổng lệnh hỏi
              </td>
              <td colSpan={3} className="exam-summary-orange tabular-nums" data-testid="matrix-sum-td">
                {stats.byDomain.TD}
              </td>
              <td colSpan={3} className="exam-summary-orange tabular-nums" data-testid="matrix-sum-gq">
                {stats.byDomain.GQ}
              </td>
              <td colSpan={3} className="exam-summary-orange tabular-nums" data-testid="matrix-sum-mh">
                {stats.byDomain.MH}
              </td>
              <td className="exam-summary-orange tabular-nums" data-testid="matrix-grand-total">
                {stats.grandTotal}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="exam-summary-orange">
                Biết
              </td>
              <td className="exam-summary-orange tabular-nums">
                {stats.byCell.TD_Biet || ''}
              </td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange tabular-nums">
                {stats.byCell.GQ_Biet || ''}
              </td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange tabular-nums">
                {stats.byCell.MH_Biet || ''}
              </td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange tabular-nums" data-testid="matrix-sum-biet">
                {stats.byLevel.Biet}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="exam-summary-orange">
                Hiểu
              </td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange tabular-nums">
                {stats.byCell.TD_Hieu || ''}
              </td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange tabular-nums">
                {stats.byCell.GQ_Hieu || ''}
              </td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange tabular-nums">
                {stats.byCell.MH_Hieu || ''}
              </td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange tabular-nums" data-testid="matrix-sum-hieu">
                {stats.byLevel.Hieu}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="exam-summary-orange">
                Vận dụng
              </td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange tabular-nums">
                {stats.byCell.TD_VD || ''}
              </td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange tabular-nums">
                {stats.byCell.GQ_VD || ''}
              </td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange"></td>
              <td className="exam-summary-orange tabular-nums">
                {stats.byCell.MH_VD || ''}
              </td>
              <td className="exam-summary-orange tabular-nums" data-testid="matrix-sum-vd">
                {stats.byLevel.VD}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Dòng chú thích kí hiệu dưới bảng Ma trận */}
      <div className="mt-2 font-doc italic font-bold text-[13.5px] text-black">
        {readOnly ? (
          <p>{footnoteText}</p>
        ) : (
          <input
            type="text"
            aria-label="Kí hiệu chú thích cuối bảng Ma trận"
            value={footnoteText}
            onChange={(e) => onChangeFootnote(e.target.value)}
            className="w-full font-doc italic font-bold bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none"
          />
        )}
      </div>
    </section>
  );
};
