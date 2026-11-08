import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, ChevronDown, BookOpen, Undo2, Redo2 } from 'lucide-react';
import {
  ALL_CELL_KEYS,
  CellKey,
  MatrixTopic,
  SpecificationData,
} from '../types/exam';
import {
  calculateSpecSummary,
  formatVnScore,
  BalanceStrategy,
} from '../utils/matrixCalculator';
import {
  CELL_KEY_LABELS,
  MATH_COMPETENCY_INDICATORS,
  QUICK_MATH_FORMULAS,
} from '../data/mathCompetencies';

interface SpecTableEditorProps {
  specification: SpecificationData;
  matrixTopics: MatrixTopic[];
  readOnly?: boolean;
  onChangeSpec: (spec: SpecificationData) => void;
  onAutoBalanceScores?: (strategy: BalanceStrategy) => void;
  onOpenYccdBrowser?: () => void;
  onOpenAddContentAi?: () => void;
  onOpenRefineSpec?: () => void;
  onOpenQuestionMapper?: () => void;
  auditWarningsCount?: number;
  onLoadMenhDeTapHopPreset?: () => void;
  onLoadKhaoSatDauNamPreset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const DEFAULT_CODE_BY_CELL: Record<CellKey, string> = {
  TD_Biet: 'TD1.1',
  TD_Hieu: 'TD1.3',
  TD_VD: 'TD3.2',
  GQ_Biet: 'GQ1.2',
  GQ_Hieu: 'GQ2.1',
  GQ_VD: 'GQ3.1',
  MH_Biet: 'MH1.1',
  MH_Hieu: 'MH1.2',
  MH_VD: 'MH2.1',
};

export const SpecTableEditor: React.FC<SpecTableEditorProps> = ({
  specification,
  matrixTopics,
  readOnly = false,
  onChangeSpec,
  onAutoBalanceScores,
  onOpenYccdBrowser,
  onOpenAddContentAi,
  onOpenRefineSpec,
  onOpenQuestionMapper,
  auditWarningsCount = 0,
  onLoadMenhDeTapHopPreset,
  onLoadKhaoSatDauNamPreset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const [isBalanceMenuOpen, setIsBalanceMenuOpen] = useState(false);
  const stats = calculateSpecSummary(specification);
  const allUnits = matrixTopics.flatMap((t) =>
    t.units.map((u) => ({
      id: u.id,
      topicName: t.topicName,
      label: `${t.topicName} — ${u.content}`,
      shortLabel: u.content,
    }))
  );
  const unitMap = new Map(allUnits.map((u) => [u.id, u]));
  const defaultUnitId = allUnits[0]?.id || 'u1';

  // Count how many commands in Bảng đặc tả belong to each unitId
  const unitCommandCounts: Record<string, number> = {};
  for (const q of specification.multipleChoice) {
    unitCommandCounts[q.unitId] = (unitCommandCounts[q.unitId] || 0) + 1;
  }
  for (const q of specification.trueFalse) {
    unitCommandCounts[q.unitId] =
      (unitCommandCounts[q.unitId] || 0) + q.subItems.length;
  }
  for (const q of specification.shortAnswer) {
    unitCommandCounts[q.unitId] = (unitCommandCounts[q.unitId] || 0) + 1;
  }
  for (const q of specification.essay) {
    unitCommandCounts[q.unitId] = (unitCommandCounts[q.unitId] || 0) + 1;
  }

  const hasMenhDeTapHopInSpec = allUnits.some(
    (u) =>
      /mệnh đề|tập hợp/i.test(u.topicName) ||
      /mệnh đề|tập hợp/i.test(u.shortLabel)
  );

  // --- Handlers for Section 1: Multiple Choice (TN) ---
  const addMultipleChoice = () => {
    const nextNum = specification.multipleChoice.length + 1;
    onChangeSpec({
      ...specification,
      multipleChoice: [
        ...specification.multipleChoice,
        {
          id: `tn-${Date.now()}`,
          questionLabel: `Câu ${nextNum}`,
          unitId: defaultUnitId,
          description: 'Nhận biết được khái niệm / tính chất toán học cơ bản.',
          cellKey: 'TD_Biet',
          indicatorCode: 'TD1.1',
          score: 0.25,
        },
      ],
    });
  };

  const deleteMultipleChoice = (id: string) => {
    const filtered = specification.multipleChoice
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, questionLabel: `Câu ${idx + 1}` }));
    onChangeSpec({ ...specification, multipleChoice: filtered });
  };

  // --- Handlers for Section 2: True / False (ĐS) ---
  const addTrueFalse = () => {
    const nextNum = specification.trueFalse.length + 1;
    onChangeSpec({
      ...specification,
      trueFalse: [
        ...specification.trueFalse,
        {
          id: `ds-${Date.now()}`,
          questionLabel: `Câu ${nextNum}`,
          unitId: defaultUnitId,
          score: 1.0,
          subItems: [
            {
              subLabel: 'a',
              description: 'Nhận biết được khái niệm hoặc công thức cơ bản.',
              cellKey: 'TD_Biet',
              indicatorCode: 'TD1.1',
            },
            {
              subLabel: 'b',
              description: 'Hiểu và giải thích được tính chất hoặc điều kiện.',
              cellKey: 'TD_Hieu',
              indicatorCode: 'TD1.3',
            },
            {
              subLabel: 'c',
              description: 'Thực hiện phép tính hoặc biến đổi tìm kết quả.',
              cellKey: 'GQ_Hieu',
              indicatorCode: 'GQ2.1',
            },
            {
              subLabel: 'd',
              description: 'Vận dụng giải quyết bài toán tổng hợp hoặc thực tiễn.',
              cellKey: 'GQ_VD',
              indicatorCode: 'GQ3.2',
            },
          ],
        },
      ],
    });
  };

  const deleteTrueFalse = (id: string) => {
    const filtered = specification.trueFalse
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, questionLabel: `Câu ${idx + 1}` }));
    onChangeSpec({ ...specification, trueFalse: filtered });
  };

  // --- Handlers for Section 3: Short Answer (TLN) ---
  const addShortAnswer = () => {
    const nextNum = specification.shortAnswer.length + 1;
    onChangeSpec({
      ...specification,
      shortAnswer: [
        ...specification.shortAnswer,
        {
          id: `tln-${Date.now()}`,
          questionLabel: `Câu ${nextNum}`,
          unitId: defaultUnitId,
          description: 'Vận dụng kiến thức giải bài toán thực tiễn hoặc tìm giá trị biểu thức.',
          cellKey: 'MH_VD',
          indicatorCode: 'MH2.1',
          score: 0.5,
        },
      ],
    });
  };

  const deleteShortAnswer = (id: string) => {
    const filtered = specification.shortAnswer
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, questionLabel: `Câu ${idx + 1}` }));
    onChangeSpec({ ...specification, shortAnswer: filtered });
  };

  // --- Handlers for Section 4: Essay (TL) ---
  const addEssay = () => {
    const nextNum = specification.essay.length + 1;
    onChangeSpec({
      ...specification,
      essay: [
        ...specification.essay,
        {
          id: `tl-${Date.now()}`,
          questionLabel: `Câu ${nextNum}`,
          unitId: defaultUnitId,
          description: 'Trình bày lời giải chi tiết bài toán vận dụng / thực tiễn.',
          cellKey: 'GQ_VD',
          indicatorCode: 'GQ3.1',
          score: 1.0,
        },
      ],
    });
  };

  const deleteEssay = (id: string) => {
    const filtered = specification.essay
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, questionLabel: `Câu ${idx + 1}` }));
    onChangeSpec({ ...specification, essay: filtered });
  };

  const totalDsSubRows = specification.trueFalse.reduce(
    (acc, q) => acc + q.subItems.length,
    0
  );

  const renderCompetency9Cells = (
    activeCellKey: CellKey,
    indicatorCode: string,
    onSelectCell: (newCell: CellKey, newCode: string) => void,
    rowContextLabel: string
  ) => {
    return ALL_CELL_KEYS.map((colKey) => {
      const isSelected = colKey === activeCellKey;
      const colMeta = CELL_KEY_LABELS[colKey];
      return (
        <td
          key={colKey}
          onClick={() => {
            if (!readOnly && !isSelected) {
              onSelectCell(colKey, DEFAULT_CODE_BY_CELL[colKey]);
            }
          }}
          className={`text-center align-middle p-0.5 min-w-[38px] transition-colors ${
            !readOnly && !isSelected
              ? 'cursor-pointer hover:bg-blue-50/60'
              : ''
          } ${isSelected ? 'bg-blue-50/40 font-semibold' : ''}`}
          title={
            readOnly
              ? undefined
              : `Nhấn để đặt câu hỏi này vào cột ${colMeta.shortLabel}`
          }
        >
          {isSelected ? (
            readOnly ? (
              <span className="text-[12px] whitespace-nowrap">{indicatorCode}</span>
            ) : (
              <input
                type="text"
                aria-label={`Mã chỉ báo năng lực ${rowContextLabel}`}
                value={indicatorCode}
                onChange={(e) => onSelectCell(colKey, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full min-w-[36px] text-center font-semibold bg-transparent border border-transparent hover:border-blue-400 focus:bg-white focus:border-blue-600 rounded px-0 py-0.5 text-[12px] focus:outline-none"
              />
            )
          ) : null}
        </td>
      );
    });
  };

  return (
    <section aria-labelledby="spec-heading" className="mt-8 page-break-before">
      {/* Datalist for standard GDPT 2018 Math Competency Codes */}
      <datalist id="math-competency-codes">
        {MATH_COMPETENCY_INDICATORS.map((ind) => (
          <option key={ind.code} value={ind.code}>
            {ind.code} — {ind.description}
          </option>
        ))}
      </datalist>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <h3 id="spec-heading" className="font-doc font-bold text-base text-black">
            II. BẢNG ĐẶC TẢ
          </h3>
          {!readOnly && onUndo && onRedo && (
            <div className="no-print inline-flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1 text-slate-700 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Hoàn tác chỉnh sửa đặc tả (Ctrl+Z)"
                data-testid="spec-undo-btn"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1 text-slate-700 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Làm lại chỉnh sửa đặc tả (Ctrl+Y)"
                data-testid="spec-redo-btn"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="no-print flex flex-wrap items-center gap-1.5">
            {onLoadKhaoSatDauNamPreset && (
              <button
                type="button"
                onClick={onLoadKhaoSatDauNamPreset}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-950 bg-emerald-100 border border-emerald-300 rounded hover:bg-emerald-200 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                title="Nạp chuẩn 100% Ma trận & Bảng đặc tả Đề Khảo Sát Chất Lượng Đầu Năm Toán 10 (2026-2027)"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                Nạp Chuẩn Đề Khảo Sát Đầu Năm (28 lệnh)
              </button>
            )}
            {!hasMenhDeTapHopInSpec && onLoadMenhDeTapHopPreset && (
              <button
                type="button"
                onClick={onLoadMenhDeTapHopPreset}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-950 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                title="Bổ sung ngay bài Mệnh đề và Tập hợp vào Ma trận & Bảng đặc tả"
              >
                <Plus className="w-3.5 h-3.5 text-blue-700" />
                Bổ sung Mệnh đề & Tập hợp
              </button>
            )}
            {onOpenYccdBrowser && (
              <button
                type="button"
                onClick={onOpenYccdBrowser}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                Chọn từ YCCD Bộ GD&ĐT
              </button>
            )}
            {onOpenAddContentAi && (
              <button
                type="button"
                onClick={onOpenAddContentAi}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                title="Nhập thêm nội dung bài kiểm tra để AI bổ sung vào Ma trận và Bảng đặc tả"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                AI Thêm nội dung
              </button>
            )}
            {onOpenQuestionMapper && (
              <button
                type="button"
                onClick={onOpenQuestionMapper}
                data-testid="spec-open-question-mapper-btn"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap shrink-0 shadow-2xs border ${
                  auditWarningsCount > 0
                    ? 'text-amber-950 bg-amber-100 border-amber-400 hover:bg-amber-200'
                    : 'text-blue-950 bg-blue-100 border-blue-300 hover:bg-blue-200'
                }`}
                title="Mở bảng đối chiếu trực tiếp nội dung từng câu hỏi & từng ý a, b, c, d trong đề với dòng đặc tả"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                <span>Đối chiếu Câu hỏi – Đặc tả</span>
                {auditWarningsCount > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-700 text-white text-[10px] font-mono">
                    {auditWarningsCount} cảnh báo
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white text-[10px] font-mono">
                    Chuẩn
                  </span>
                )}
              </button>
            )}
            {onOpenRefineSpec && (
              <button
                type="button"
                onClick={onOpenRefineSpec}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                title="Rà soát và tinh chỉnh các dòng YCCĐ trong Bảng đặc tả sát đúng với từng câu hỏi trong đề kiểm tra"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                ✨ Tinh chỉnh sát đề thi
              </button>
            )}
            <button
              type="button"
              onClick={addMultipleChoice}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              Thêm câu TN
            </button>
            <button
              type="button"
              onClick={addTrueFalse}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              Thêm câu Đúng/Sai (4 ý)
            </button>
            <button
              type="button"
              onClick={addShortAnswer}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              Thêm câu TLN
            </button>
            <button
              type="button"
              onClick={addEssay}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" />
              Thêm câu Tự luận (TL)
            </button>

            {onAutoBalanceScores && (
              <div className="relative inline-block text-left">
                <div className="inline-flex rounded-md shadow-xs">
                  <button
                    type="button"
                    onClick={() => onAutoBalanceScores('moet_standard')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-l-md hover:bg-emerald-100 transition-colors whitespace-nowrap"
                    title="1-Click: Tự động phân bổ lại điểm số các câu hỏi tròn đúng 10,00 điểm theo chuẩn Bộ GD&ĐT"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Cân bằng 10đ
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBalanceMenuOpen(!isBalanceMenuOpen)}
                    aria-label="Chọn chiến lược phân bổ điểm"
                    className="px-1.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-l-0 border-emerald-300 rounded-r-md hover:bg-emerald-100 transition-colors"
                  >
                    <ChevronDown className="w-3 h-3 text-emerald-700" />
                  </button>
                </div>

                {isBalanceMenuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-20 text-xs text-slate-700"
                    onMouseLeave={() => setIsBalanceMenuOpen(false)}
                  >
                    <div className="px-3 py-1 font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
                      Chọn chiến lược phân bổ:
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onAutoBalanceScores('moet_standard');
                        setIsBalanceMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex flex-col"
                    >
                      <span className="font-semibold text-slate-900">
                        Chuẩn Bộ GD&ĐT (Khuyến nghị)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        TN 0.25đ · ĐS 1.0đ · TLN 0.5đ · Tự luận cân đối
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAutoBalanceScores('ratio_433');
                        setIsBalanceMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex flex-col"
                    >
                      <span className="font-semibold text-slate-900">
                        Tỉ lệ độ khó 4 : 3 : 3
                      </span>
                      <span className="text-[11px] text-slate-500">
                        40% Biết (4đ) · 30% Hiểu (3đ) · 30% Vận dụng (3đ)
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAutoBalanceScores('ratio_532');
                        setIsBalanceMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex flex-col"
                    >
                      <span className="font-semibold text-slate-900">
                        Tỉ lệ độ khó 5 : 3 : 2
                      </span>
                      <span className="text-[11px] text-slate-500">
                        50% Biết (5đ) · 30% Hiểu (3đ) · 20% Vận dụng (2đ)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thanh tóm tắt các Mạch kiến thức / Bài học đang có trong Bảng đặc tả */}
      <div className="no-print mb-2.5 p-2.5 bg-blue-50/70 border border-blue-200 rounded-md text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <span className="font-bold text-blue-950">
            Các bài học / mạch kiến thức đang có trong Bảng đặc tả ({allUnits.length} nội dung):
          </span>
          {!hasMenhDeTapHopInSpec && onLoadMenhDeTapHopPreset && (
            <button
              type="button"
              onClick={onLoadMenhDeTapHopPreset}
              className="px-2 py-0.5 text-[11px] font-semibold text-blue-900 bg-white border border-blue-300 rounded hover:bg-blue-100 transition-colors"
            >
              + Thêm bài Mệnh đề & Tập hợp vào Đặc tả
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {allUnits.map((u) => {
            const count = unitCommandCounts[u.id] || 0;
            return (
              <span
                key={u.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium ${
                  count > 0
                    ? 'bg-white border-blue-200 text-slate-800 shadow-2xs'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <span className="font-bold text-blue-900">{u.topicName}:</span>
                <span>{u.shortLabel}</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                  {count} lệnh
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {!readOnly && (
        <div className="no-print mb-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded border border-slate-200">
          <span className="font-medium text-slate-700 mr-1">
            Mẹo chỉnh sửa nhanh:
          </span>
          <span>
            Nhấn vào bất kỳ ô trống nào trong 9 cột <strong>TD / GQ / MH</strong> để chuyển mức độ tư duy của câu hỏi. Công thức mẫu:
          </span>
          {QUICK_MATH_FORMULAS.slice(0, 4).map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(f.text);
              }}
              className="px-2 py-0.5 text-[11px] font-mono bg-white border border-slate-300 rounded hover:border-blue-500 hover:text-blue-700 transition-colors whitespace-nowrap"
              title="Nhấn để sao chép công thức này"
            >
              {f.text}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="exam-table" data-testid="spec-table">
          <thead>
            <tr>
              <th rowSpan={3} className="exam-header-green w-[8%]">
                Dạng
                <br />
                thức
              </th>
              <th rowSpan={3} colSpan={2} className="exam-header-green w-[7%]">
                Câu
              </th>
              <th rowSpan={3} className="exam-header-green w-[35%]">
                Mạch kiến thức/ Nội dung
              </th>
              <th colSpan={9} className="exam-header-green">
                Năng lực Toán học – Cấp độ tư duy
              </th>
              <th rowSpan={3} className="exam-header-green w-[5.5%]">
                Điểm
              </th>
            </tr>
            <tr>
              <th colSpan={3} className="exam-header-green">
                Tư duy và lập luận toán
                <br />
                học (TD)
              </th>
              <th colSpan={3} className="exam-header-green">
                Giải quyết vấn đề toán học
                <br />
                (GQ)
              </th>
              <th colSpan={3} className="exam-header-green">
                Mô hình hóa toán
                <br />
                học (MH)
              </th>
            </tr>
            <tr>
              <th className="exam-header-green w-[4.9%]">Biết</th>
              <th className="exam-header-green w-[4.9%]">Hiểu</th>
              <th className="exam-header-green w-[4.9%]">VD</th>
              <th className="exam-header-green w-[4.9%]">Biết</th>
              <th className="exam-header-green w-[4.9%]">Hiểu</th>
              <th className="exam-header-green w-[4.9%]">VD</th>
              <th className="exam-header-green w-[4.9%]">Biết</th>
              <th className="exam-header-green w-[4.9%]">Hiểu</th>
              <th className="exam-header-green w-[4.9%]">VD</th>
            </tr>
          </thead>

          <tbody>
            {/* 1. Trắc nghiệm nhiều lựa chọn */}
            {specification.multipleChoice.map((item, idx) => {
              const unitInfo = unitMap.get(item.unitId);
              return (
                <tr key={item.id} className="group hover:bg-slate-50/70">
                  {idx === 0 && (
                    <td
                      rowSpan={specification.multipleChoice.length}
                      className="font-bold text-center align-middle bg-white"
                    >
                      1. Trắc
                      <br />
                      nghiệm
                      <br />
                      nhiều lựa
                      <br />
                      chọn
                    </td>
                  )}
                  <td colSpan={2} className="text-center align-middle whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <span>{item.questionLabel}</span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => deleteMultipleChoice(item.id)}
                          aria-label={`Xóa TN ${item.questionLabel}`}
                          className="no-print opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
                          title="Xóa câu này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="text-left align-middle">
                    {readOnly ? (
                      <div className="whitespace-pre-line">{item.description}</div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-sans">
                          <span className="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                            Bài học:
                          </span>
                          <select
                            aria-label={`Mạch kiến thức TN ${item.questionLabel}`}
                            value={item.unitId}
                            onChange={(e) => {
                              const updated = specification.multipleChoice.map((q) =>
                                q.id === item.id ? { ...q, unitId: e.target.value } : q
                              );
                              onChangeSpec({ ...specification, multipleChoice: updated });
                            }}
                            className="bg-blue-50/60 border border-blue-200 rounded px-1.5 py-0.5 text-[11px] font-semibold text-blue-950 max-w-[320px] truncate focus:outline-none focus:border-blue-600"
                          >
                            {allUnits.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          aria-label={`Nội dung TN ${item.questionLabel}`}
                          value={item.description}
                          onChange={(e) => {
                            const updated = specification.multipleChoice.map((q) =>
                              q.id === item.id
                                ? { ...q, description: e.target.value }
                                : q
                            );
                            onChangeSpec({ ...specification, multipleChoice: updated });
                          }}
                          rows={2}
                          className="w-full text-left bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded p-1 resize-none text-[13px] leading-snug focus:outline-none"
                        />
                      </div>
                    )}
                  </td>
                  {renderCompetency9Cells(
                    item.cellKey,
                    item.indicatorCode,
                    (newCell, newCode) => {
                      const updated = specification.multipleChoice.map((q) =>
                        q.id === item.id
                          ? { ...q, cellKey: newCell, indicatorCode: newCode }
                          : q
                      );
                      onChangeSpec({ ...specification, multipleChoice: updated });
                    },
                    `TN ${item.questionLabel}`
                  )}
                  <td className="text-center align-middle tabular-nums">
                    {readOnly ? (
                      formatVnScore(item.score)
                    ) : (
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        aria-label={`Điểm TN ${item.questionLabel}`}
                        value={item.score}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const updated = specification.multipleChoice.map((q) =>
                            q.id === item.id ? { ...q, score: val } : q
                          );
                          onChangeSpec({ ...specification, multipleChoice: updated });
                        }}
                        className="w-14 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded py-0.5 text-[13px] tabular-nums focus:outline-none"
                      />
                    )}
                  </td>
                </tr>
              );
            })}

            {/* 2. Trắc nghiệm Đúng/Sai */}
            {specification.trueFalse.map((q, qIdx) => {
              const unitInfo = unitMap.get(q.unitId);
              return q.subItems.map((sub, sIdx) => {
                const isVeryFirstRow = qIdx === 0 && sIdx === 0;
                return (
                  <tr
                    key={`${q.id}-${sub.subLabel}`}
                    className="group hover:bg-slate-50/70"
                  >
                    {isVeryFirstRow && (
                      <td
                        rowSpan={totalDsSubRows}
                        className="font-bold text-center align-middle bg-white"
                      >
                        2. Trắc
                        <br />
                        nghiệm
                        <br />
                        Đúng/ Sai
                      </td>
                    )}
                    {sIdx === 0 && (
                      <td
                        rowSpan={q.subItems.length}
                        className="text-center align-middle bg-white w-[5%]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{q.questionLabel}</span>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => deleteTrueFalse(q.id)}
                              aria-label={`Xóa Đúng/Sai ${q.questionLabel}`}
                              className="no-print opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
                              title="Xóa câu Đúng/Sai này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="text-center align-middle w-[3%] font-medium">
                      {sub.subLabel}
                    </td>
                    <td className="text-left align-middle">
                      {readOnly ? (
                        <div className="whitespace-pre-line">{sub.description}</div>
                      ) : (
                        <div className="space-y-1">
                          {sIdx === 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-sans">
                              <span className="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                                Bài học ({q.questionLabel}):
                              </span>
                              <select
                                aria-label={`Mạch kiến thức Đúng/Sai ${q.questionLabel}`}
                                value={q.unitId}
                                onChange={(e) => {
                                  const updated = specification.trueFalse.map((item) =>
                                    item.id === q.id
                                      ? { ...item, unitId: e.target.value }
                                      : item
                                  );
                                  onChangeSpec({ ...specification, trueFalse: updated });
                                }}
                                className="bg-blue-50/60 border border-blue-200 rounded px-1.5 py-0.5 text-[11px] font-semibold text-blue-950 max-w-[320px] truncate focus:outline-none focus:border-blue-600"
                              >
                                {allUnits.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          <textarea
                            aria-label={`Nội dung Đúng/Sai ${q.questionLabel} ý ${sub.subLabel}`}
                            value={sub.description}
                            onChange={(e) => {
                              const updated = specification.trueFalse.map((item) =>
                                item.id === q.id
                                  ? {
                                      ...item,
                                      subItems: item.subItems.map((si) =>
                                        si.subLabel === sub.subLabel
                                          ? { ...si, description: e.target.value }
                                          : si
                                      ),
                                    }
                                  : item
                              );
                              onChangeSpec({ ...specification, trueFalse: updated });
                            }}
                            rows={2}
                            className="w-full text-left bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded p-1 resize-none text-[13px] leading-snug focus:outline-none"
                          />
                        </div>
                      )}
                    </td>
                    {renderCompetency9Cells(
                      sub.cellKey,
                      sub.indicatorCode,
                      (newCell, newCode) => {
                        const updated = specification.trueFalse.map((item) =>
                          item.id === q.id
                            ? {
                                ...item,
                                subItems: item.subItems.map((si) =>
                                  si.subLabel === sub.subLabel
                                    ? {
                                        ...si,
                                        cellKey: newCell,
                                        indicatorCode: newCode,
                                      }
                                    : si
                                ),
                              }
                            : item
                        );
                        onChangeSpec({ ...specification, trueFalse: updated });
                      },
                      `Đúng/Sai ${q.questionLabel} ý ${sub.subLabel}`
                    )}
                    {sIdx === 0 && (
                      <td
                        rowSpan={q.subItems.length}
                        className="text-center align-middle tabular-nums bg-white"
                      >
                        {readOnly ? (
                          formatVnScore(q.score)
                        ) : (
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            aria-label={`Điểm Đúng/Sai ${q.questionLabel}`}
                            value={q.score}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const updated = specification.trueFalse.map((item) =>
                                item.id === q.id ? { ...item, score: val } : item
                              );
                              onChangeSpec({ ...specification, trueFalse: updated });
                            }}
                            className="w-14 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded py-0.5 text-[13px] tabular-nums focus:outline-none"
                          />
                        )}
                      </td>
                    )}
                  </tr>
                );
              });
            })}

            {/* 3. Trắc nghiệm trả lời ngắn */}
            {specification.shortAnswer.map((item, idx) => {
              const unitInfo = unitMap.get(item.unitId);
              return (
                <tr key={item.id} className="group hover:bg-slate-50/70">
                  {idx === 0 && (
                    <td
                      rowSpan={specification.shortAnswer.length}
                      className="font-bold text-center align-middle bg-white"
                    >
                      3. Trắc
                      <br />
                      nghiệm
                      <br />
                      trả lời
                      <br />
                      ngắn
                    </td>
                  )}
                  <td colSpan={2} className="text-center align-middle whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <span>{item.questionLabel}</span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => deleteShortAnswer(item.id)}
                          aria-label={`Xóa TLN ${item.questionLabel}`}
                          className="no-print opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
                          title="Xóa câu này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="text-left align-middle">
                    {readOnly ? (
                      <div className="whitespace-pre-line">{item.description}</div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-sans">
                          <span className="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                            Bài học:
                          </span>
                          <select
                            aria-label={`Mạch kiến thức TLN ${item.questionLabel}`}
                            value={item.unitId}
                            onChange={(e) => {
                              const updated = specification.shortAnswer.map((q) =>
                                q.id === item.id ? { ...q, unitId: e.target.value } : q
                              );
                              onChangeSpec({ ...specification, shortAnswer: updated });
                            }}
                            className="bg-blue-50/60 border border-blue-200 rounded px-1.5 py-0.5 text-[11px] font-semibold text-blue-950 max-w-[320px] truncate focus:outline-none focus:border-blue-600"
                          >
                            {allUnits.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          aria-label={`Nội dung TLN ${item.questionLabel}`}
                          value={item.description}
                          onChange={(e) => {
                            const updated = specification.shortAnswer.map((q) =>
                              q.id === item.id
                                ? { ...q, description: e.target.value }
                                : q
                            );
                            onChangeSpec({ ...specification, shortAnswer: updated });
                          }}
                          rows={3}
                          className="w-full text-left bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded p-1 resize-none text-[13px] leading-snug focus:outline-none"
                        />
                      </div>
                    )}
                  </td>
                  {renderCompetency9Cells(
                    item.cellKey,
                    item.indicatorCode,
                    (newCell, newCode) => {
                      const updated = specification.shortAnswer.map((q) =>
                        q.id === item.id
                          ? { ...q, cellKey: newCell, indicatorCode: newCode }
                          : q
                      );
                      onChangeSpec({ ...specification, shortAnswer: updated });
                    },
                    `TLN ${item.questionLabel}`
                  )}
                  <td className="text-center align-middle tabular-nums">
                    {readOnly ? (
                      formatVnScore(item.score)
                    ) : (
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        aria-label={`Điểm TLN ${item.questionLabel}`}
                        value={item.score}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const updated = specification.shortAnswer.map((q) =>
                            q.id === item.id ? { ...q, score: val } : q
                          );
                          onChangeSpec({ ...specification, shortAnswer: updated });
                        }}
                        className="w-14 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded py-0.5 text-[13px] tabular-nums focus:outline-none"
                      />
                    )}
                  </td>
                </tr>
              );
            })}

            {/* 4. Tự luận (TL) - Hiển thị khi có câu hỏi Tự luận */}
            {specification.essay.map((item, idx) => {
              const unitInfo = unitMap.get(item.unitId);
              return (
                <tr key={item.id} className="group hover:bg-slate-50/70">
                  {idx === 0 && (
                    <td
                      rowSpan={specification.essay.length}
                      className="font-bold text-center align-middle bg-white"
                    >
                      4. Tự
                      <br />
                      luận
                    </td>
                  )}
                  <td colSpan={2} className="text-center align-middle whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <span>{item.questionLabel}</span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => deleteEssay(item.id)}
                          aria-label={`Xóa Tự luận ${item.questionLabel}`}
                          className="no-print opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
                          title="Xóa câu Tự luận này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="text-left align-middle">
                    {readOnly ? (
                      <div className="whitespace-pre-line">{item.description}</div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-sans">
                          <span className="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                            Bài học:
                          </span>
                          <select
                            aria-label={`Mạch kiến thức Tự luận ${item.questionLabel}`}
                            value={item.unitId}
                            onChange={(e) => {
                              const updated = specification.essay.map((q) =>
                                q.id === item.id ? { ...q, unitId: e.target.value } : q
                              );
                              onChangeSpec({ ...specification, essay: updated });
                            }}
                            className="bg-blue-50/60 border border-blue-200 rounded px-1.5 py-0.5 text-[11px] font-semibold text-blue-950 max-w-[320px] truncate focus:outline-none focus:border-blue-600"
                          >
                            {allUnits.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          aria-label={`Nội dung Tự luận ${item.questionLabel}`}
                          value={item.description}
                          onChange={(e) => {
                            const updated = specification.essay.map((q) =>
                              q.id === item.id
                                ? { ...q, description: e.target.value }
                                : q
                            );
                            onChangeSpec({ ...specification, essay: updated });
                          }}
                          rows={2}
                          className="w-full text-left bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded p-1 resize-none text-[13px] leading-snug focus:outline-none"
                        />
                      </div>
                    )}
                  </td>
                  {renderCompetency9Cells(
                    item.cellKey,
                    item.indicatorCode,
                    (newCell, newCode) => {
                      const updated = specification.essay.map((q) =>
                        q.id === item.id
                          ? { ...q, cellKey: newCell, indicatorCode: newCode }
                          : q
                      );
                      onChangeSpec({ ...specification, essay: updated });
                    },
                    `Tự luận ${item.questionLabel}`
                  )}
                  <td className="text-center align-middle tabular-nums">
                    {readOnly ? (
                      formatVnScore(item.score)
                    ) : (
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        aria-label={`Điểm Tự luận ${item.questionLabel}`}
                        value={item.score}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const updated = specification.essay.map((q) =>
                            q.id === item.id ? { ...q, score: val } : q
                          );
                          onChangeSpec({ ...specification, essay: updated });
                        }}
                        className="w-14 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded py-0.5 text-[13px] tabular-nums focus:outline-none"
                      />
                    )}
                  </td>
                </tr>
              );
            })}

            {/* 4 Dòng tổng kết màu cam nhạt (#F8CBAD) chuẩn theo Trang 7 của PDF */}
            <tr>
              <td className="exam-summary-orange">
                Tổng lệnh
                <br />
                hỏi
              </td>
              <td colSpan={3} className="exam-summary-orange tabular-nums" data-testid="spec-total-commands">
                {stats.totalCommands}
              </td>
              <td colSpan={3} className="exam-summary-orange tabular-nums">
                {stats.byDomain.TD}
              </td>
              <td colSpan={3} className="exam-summary-orange tabular-nums">
                {stats.byDomain.GQ}
              </td>
              <td colSpan={3} className="exam-summary-orange tabular-nums">
                {stats.byDomain.MH}
              </td>
              <td className="exam-summary-orange tabular-nums" data-testid="spec-total-score">
                {formatVnScore(stats.totalScore)}
              </td>
            </tr>
            <tr>
              <td className="exam-summary-orange">Biết</td>
              <td colSpan={3} className="exam-summary-orange tabular-nums">
                {stats.byLevel.Biet}
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
              <td className="exam-summary-orange tabular-nums" data-testid="spec-score-biet">
                {formatVnScore(stats.scoreByLevel.Biet)}
              </td>
            </tr>
            <tr>
              <td className="exam-summary-orange">Hiểu</td>
              <td colSpan={3} className="exam-summary-orange tabular-nums">
                {stats.byLevel.Hieu}
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
              <td className="exam-summary-orange tabular-nums" data-testid="spec-score-hieu">
                {formatVnScore(stats.scoreByLevel.Hieu)}
              </td>
            </tr>
            <tr>
              <td className="exam-summary-orange">Vận dụng</td>
              <td colSpan={3} className="exam-summary-orange tabular-nums">
                {stats.byLevel.VD}
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
              <td className="exam-summary-orange tabular-nums" data-testid="spec-score-vd">
                {formatVnScore(stats.scoreByLevel.VD)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
