import React, { useState, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Wand2,
  Check,
  Filter,
  Layers,
} from 'lucide-react';
import {
  ALL_CELL_KEYS,
  CellKey,
  ExamDocument,
  MatrixTopic,
  SpecificationData,
} from '../types/exam';
import { CELL_KEY_LABELS } from '../data/mathCompetencies';
import {
  getQuestionSpecMappings,
  QuestionSpecMappingItem,
  KnowledgeAuditWarning,
  analyzeQuestionMathStructure,
  suggestYccdRequirementsForUnit,
  getDefaultIndicatorForCell,
} from '../utils/knowledgeAnalyzer';
import { syncMatrixFromSpec } from '../utils/matrixCalculator';

interface QuestionSpecMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: ExamDocument;
  onApplyChanges: (
    updatedSpec: SpecificationData,
    updatedTopics: MatrixTopic[],
    updatedSourceQuestions: Record<string, string>,
    summaryMessage: string
  ) => void;
}

type FilterPart = 'ALL' | 'WARNINGS' | 'TN' | 'DS' | 'TLN' | 'TL';

export const QuestionSpecMapperModal: React.FC<QuestionSpecMapperModalProps> = ({
  isOpen,
  onClose,
  doc,
  onApplyChanges,
}) => {
  const [draftSpec, setDraftSpec] = useState<SpecificationData>(() =>
    structuredClone(doc.specification)
  );
  const [draftTopics, setDraftTopics] = useState<MatrixTopic[]>(() =>
    structuredClone(doc.matrixTopics)
  );
  const [draftSourceQuestions, setDraftSourceQuestions] = useState<Record<string, string>>(
    () => structuredClone(doc.sourceQuestions || {})
  );
  const [filterPart, setFilterPart] = useState<FilterPart>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedYccdRowKey, setExpandedYccdRowKey] = useState<string | null>(null);
  const [fixedCountBanner, setFixedCountBanner] = useState<string | null>(null);

  // Recompute live working document for real-time audit feedback
  const workingDoc = useMemo<ExamDocument>(
    () => ({
      ...doc,
      matrixTopics: draftTopics,
      specification: draftSpec,
      sourceQuestions: draftSourceQuestions,
    }),
    [doc, draftTopics, draftSpec, draftSourceQuestions]
  );

  const mappings = useMemo(() => getQuestionSpecMappings(workingDoc), [workingDoc]);

  const allUnits = useMemo(
    () =>
      draftTopics.flatMap((t) =>
        t.units.map((u) => ({
          id: u.id,
          topicName: t.topicName,
          unitName: u.content,
          fullLabel: `${t.topicName} — ${u.content}`,
        }))
      ),
    [draftTopics]
  );

  const totalWarningsCount = useMemo(
    () => mappings.reduce((sum, item) => sum + item.warnings.length, 0),
    [mappings]
  );

  const itemsWithWarningsCount = useMemo(
    () => mappings.filter((item) => item.warnings.length > 0).length,
    [mappings]
  );

  const filteredMappings = useMemo(() => {
    return mappings.filter((item) => {
      if (filterPart === 'WARNINGS' && item.warnings.length === 0) return false;
      if (
        filterPart !== 'ALL' &&
        filterPart !== 'WARNINGS' &&
        item.partType !== filterPart
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${item.questionLabel} ${item.questionText} ${item.topicName} ${item.unitName} ${item.description} ${item.indicatorCode}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [mappings, filterPart, searchQuery]);

  if (!isOpen) return null;

  const updateQuestionText = (item: QuestionSpecMappingItem, newText: string) => {
    const rawQLabel = item.subLabel
      ? item.questionLabel.replace(/\s*-\s*Ý\s*[abcd]\)/i, '')
      : item.questionLabel;
    const key = item.subLabel
      ? `${item.partType}:${rawQLabel}:${item.subLabel}`
      : `${item.partType}:${rawQLabel}`;
    setDraftSourceQuestions((prev) => ({
      ...prev,
      [key]: newText,
    }));
  };

  const updateSpecItemFields = (
    item: QuestionSpecMappingItem,
    updates: {
      unitId?: string;
      cellKey?: CellKey;
      indicatorCode?: string;
      description?: string;
    }
  ) => {
    setDraftSpec((prev) => {
      const next = structuredClone(prev);
      if (item.partType === 'TN') {
        next.multipleChoice = next.multipleChoice.map((q) =>
          q.id === item.itemId
            ? {
                ...q,
                unitId: updates.unitId ?? q.unitId,
                cellKey: updates.cellKey ?? q.cellKey,
                indicatorCode: updates.indicatorCode ?? q.indicatorCode,
                description: updates.description ?? q.description,
              }
            : q
        );
      } else if (item.partType === 'DS') {
        next.trueFalse = next.trueFalse.map((q) => {
          if (q.id !== item.itemId) return q;
          return {
            ...q,
            unitId: updates.unitId ?? q.unitId,
            subItems: q.subItems.map((sub) =>
              sub.subLabel === item.subLabel
                ? {
                    ...sub,
                    cellKey: updates.cellKey ?? sub.cellKey,
                    indicatorCode: updates.indicatorCode ?? sub.indicatorCode,
                    description: updates.description ?? sub.description,
                  }
                : sub
            ),
          };
        });
      } else if (item.partType === 'TLN') {
        next.shortAnswer = next.shortAnswer.map((q) =>
          q.id === item.itemId
            ? {
                ...q,
                unitId: updates.unitId ?? q.unitId,
                cellKey: updates.cellKey ?? q.cellKey,
                indicatorCode: updates.indicatorCode ?? q.indicatorCode,
                description: updates.description ?? q.description,
              }
            : q
        );
      } else if (item.partType === 'TL') {
        next.essay = next.essay.map((q) =>
          q.id === item.itemId
            ? {
                ...q,
                unitId: updates.unitId ?? q.unitId,
                cellKey: updates.cellKey ?? q.cellKey,
                indicatorCode: updates.indicatorCode ?? q.indicatorCode,
                description: updates.description ?? q.description,
              }
            : q
        );
      }
      return next;
    });
  };

  const handleApplySingleWarningFix = (
    item: QuestionSpecMappingItem,
    warning: KnowledgeAuditWarning
  ) => {
    updateSpecItemFields(item, {
      unitId: warning.suggestedUnitId,
      cellKey: warning.suggestedCellKey,
      indicatorCode: warning.suggestedIndicatorCode,
      description: warning.suggestedDescription,
    });
    setFixedCountBanner(`Đã chuẩn hóa "${item.questionLabel}" theo gợi ý kiểm định tri thức.`);
  };

  const handleDeepAnalyzeSingleItem = (item: QuestionSpecMappingItem) => {
    const deep = analyzeQuestionMathStructure(
      item.questionText,
      item.partType,
      item.subLabel,
      item.stemText
    );

    // Match unitId in draftTopics if possible
    let matchedUnitId = item.unitId;
    for (const u of allUnits) {
      if (
        u.unitName
          .toLowerCase()
          .includes(deep.matchedUnitDef.unitName.toLowerCase().slice(0, 12)) ||
        deep.matchedUnitDef.unitName
          .toLowerCase()
          .includes(u.unitName.toLowerCase().slice(0, 12))
      ) {
        matchedUnitId = u.id;
        break;
      }
    }

    updateSpecItemFields(item, {
      unitId: matchedUnitId,
      cellKey: deep.cellKey,
      indicatorCode: deep.indicatorCode,
      description: deep.recommendedDescription,
    });
    setFixedCountBanner(
      `Đã phân tích cấu trúc toán học cho ${item.questionLabel} → [${deep.indicatorCode}] (${deep.reasoning})`
    );
  };

  const handleFixAllWarnings = () => {
    let fixedCount = 0;
    for (const item of mappings) {
      if (item.warnings.length > 0) {
        const mergedUpdates: {
          unitId?: string;
          cellKey?: CellKey;
          indicatorCode?: string;
          description?: string;
        } = {};
        for (const w of item.warnings) {
          if (w.suggestedUnitId) mergedUpdates.unitId = w.suggestedUnitId;
          if (w.suggestedCellKey) mergedUpdates.cellKey = w.suggestedCellKey;
          if (w.suggestedIndicatorCode) mergedUpdates.indicatorCode = w.suggestedIndicatorCode;
          if (w.suggestedDescription) mergedUpdates.description = w.suggestedDescription;
        }
        updateSpecItemFields(item, mergedUpdates);
        fixedCount++;
      }
    }
    setFixedCountBanner(
      `Đã tự động chuẩn hóa ${fixedCount} lệnh hỏi có cảnh báo lệch mã năng lực MH / chủ đề / mức độ!`
    );
  };

  const handleSaveAndSync = () => {
    const syncedTopics = syncMatrixFromSpec(draftTopics, draftSpec);
    onApplyChanges(
      draftSpec,
      syncedTopics,
      draftSourceQuestions,
      `Đã cập nhật Bảng đối chiếu Câu hỏi – Đặc tả và đồng bộ Ma trận (${mappings.length} lệnh hỏi).`
    );
    onClose();
  };

  const getDomainBadgeColor = (domain: string) => {
    if (domain === 'MH') return 'bg-amber-100 text-amber-900 border-amber-300';
    if (domain === 'GQ') return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    return 'bg-blue-100 text-blue-900 border-blue-300';
  };

  const getLevelBadgeColor = (level: string) => {
    if (level === 'VD') return 'bg-purple-100 text-purple-900 border-purple-300';
    if (level === 'Hieu') return 'bg-sky-100 text-sky-900 border-sky-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-spec-mapper-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="question-spec-mapper-title"
                className="text-base font-bold tracking-tight flex items-center gap-2"
              >
                <span>Bảng Đối Chiếu Trực Tiếp Câu Hỏi – Đặc Tả & Kiểm Định Tri Thức</span>
                <span className="px-2 py-0.5 text-[11px] font-mono bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full">
                  {mappings.length} lệnh hỏi
                </span>
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Phân tích sâu từng câu và từng ý a, b, c, d theo cấu trúc toán học · Tự động cảnh báo khi câu hỏi thực tế chưa gắn mã MH hoặc lệch chủ đề.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng đối chiếu câu hỏi và đặc tả"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Status & Filter Toolbar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          {/* Top Audit Status Banner */}
          <div
            className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              totalWarningsCount === 0
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/90 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start sm:items-center gap-2.5">
              {totalWarningsCount === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <div>
                <span className="font-bold">
                  {totalWarningsCount === 0
                    ? `Kiểm định Tri thức GDPT 2018: Toàn bộ ${mappings.length}/${mappings.length} lệnh hỏi (bao gồm từng ý a, b, c, d) đều khớp chuẩn chủ đề, mức độ tư duy và mã năng lực TD / GQ / MH!`
                    : `Phát hiện ${totalWarningsCount} cảnh báo kiểm định kiến thức trên ${itemsWithWarningsCount} lệnh hỏi (bài toán thực tế thiếu mã MH, lệch chủ đề hoặc mức độ).`}
                </span>
              </div>
            </div>

            {totalWarningsCount > 0 && (
              <button
                type="button"
                onClick={handleFixAllWarnings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shrink-0 shadow-2xs"
                data-testid="fix-all-audit-warnings-btn"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Tự động chuẩn hóa tất cả ({totalWarningsCount})
              </button>
            )}
          </div>

          {fixedCountBanner && (
            <div className="px-3.5 py-2 bg-blue-950 text-white rounded-lg text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {fixedCountBanner}
              </span>
              <button
                type="button"
                onClick={() => setFixedCountBanner(null)}
                className="text-blue-200 hover:text-white text-[11px] ml-3"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Filter Tabs & Search */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-slate-700 mr-0.5 flex items-center gap-1 whitespace-nowrap">
                <Filter className="w-3.5 h-3.5 text-blue-700" /> Lọc:
              </span>
              <button
                type="button"
                onClick={() => setFilterPart('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  filterPart === 'ALL'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tất cả ({mappings.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPart('WARNINGS')}
                className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  filterPart === 'WARNINGS'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : totalWarningsCount > 0
                    ? 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Cảnh báo ({itemsWithWarningsCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterPart('TN')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  filterPart === 'TN'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Phần I: TN ({mappings.filter((m) => m.partType === 'TN').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPart('DS')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  filterPart === 'DS'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Phần II: Đúng/Sai a,b,c,d ({mappings.filter((m) => m.partType === 'DS').length} ý)
              </button>
              <button
                type="button"
                onClick={() => setFilterPart('TLN')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  filterPart === 'TLN'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Phần III: TLN ({mappings.filter((m) => m.partType === 'TLN').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPart('TL')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  filterPart === 'TL'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Phần IV: Tự luận ({mappings.filter((m) => m.partType === 'TL').length})
              </button>
            </div>

            <div className="relative w-full lg:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm câu hỏi, công thức, mã TD/GQ/MH..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Scrollable Side-by-Side Comparison List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-100/70">
          {filteredMappings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-8 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">
                {filterPart === 'WARNINGS'
                  ? 'Không có cảnh báo lệch kiến thức hoặc thiếu mã MH nào!'
                  : 'Không tìm thấy câu hỏi nào khớp với bộ lọc hiện tại.'}
              </p>
              <p className="text-xs text-slate-500">
                Toàn bộ các câu hỏi và từng ý a, b, c, d đã được đồng bộ chuẩn xác với Bản đặc tả.
              </p>
            </div>
          ) : (
            filteredMappings.map((item) => {
              const hasWarnings = item.warnings.length > 0;
              const isYccdOpen = expandedYccdRowKey === item.key;
              const yccdSuggestions = isYccdOpen
                ? suggestYccdRequirementsForUnit(item.unitName, item.topicName)
                : [];

              return (
                <div
                  key={item.key}
                  className={`bg-white rounded-xl border transition-all overflow-hidden ${
                    hasWarnings
                      ? 'border-amber-400 ring-1 ring-amber-400/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Row Top Bar */}
                  <div
                    className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
                      hasWarnings
                        ? 'bg-amber-50/80 border-amber-200'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 font-bold bg-slate-900 text-white rounded text-[11px]">
                        {item.questionLabel}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {item.partTitle}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`px-2 py-0.5 rounded border text-[11px] font-bold ${getDomainBadgeColor(
                          item.domain
                        )}`}
                      >
                        {item.domain === 'TD'
                          ? 'Tư duy & lập luận (TD)'
                          : item.domain === 'GQ'
                          ? 'Giải quyết vấn đề (GQ)'
                          : 'Mô hình hóa thực tiễn (MH)'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded border text-[11px] font-bold ${getLevelBadgeColor(
                          item.level
                        )}`}
                      >
                        Mức: {item.level === 'Biet' ? 'Biết' : item.level === 'Hieu' ? 'Hiểu' : 'Vận dụng'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono font-bold text-slate-900 text-[11px]">
                        Mã: {item.indicatorCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeepAnalyzeSingleItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
                        title="Phân tích lại cấu trúc toán học của câu hỏi này để tự động gán Đơn vị kiến thức, Mức độ và Mã năng lực"
                      >
                        <Wand2 className="w-3 h-3 text-indigo-600" />
                        Phân tích sâu câu này
                      </button>
                    </div>
                  </div>

                  {/* Warning Alerts (if any) */}
                  {hasWarnings && (
                    <div className="px-4 py-2.5 bg-amber-50/90 border-b border-amber-200 space-y-2">
                      {item.warnings.map((w) => (
                        <div
                          key={w.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-white p-2.5 rounded-lg border border-amber-300"
                        >
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-amber-950">{w.title}</div>
                              <div className="text-[11px] text-amber-900 mt-0.5">
                                {w.message}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplySingleWarningFix(item, w)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-md shrink-0 transition-colors"
                          >
                            <Sparkles className="w-3 h-3" />
                            Áp dụng gợi ý chuẩn hóa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Two-Column Side-by-Side Body: Question Text vs. Specification Mapping */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                    {/* Left Column (5 cols): Original Question & Sub-item Text */}
                    <div className="lg:col-span-5 p-4 bg-slate-50/40 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>1. Nội dung câu hỏi / ý hỏi trong đề kiểm tra:</span>
                        <span className="text-slate-400 font-normal">Có thể sửa/dán đề</span>
                      </div>

                      {item.stemText && (
                        <div className="p-2 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 italic">
                          <span className="font-semibold not-italic text-slate-900">
                            Đề dẫn chung:{' '}
                          </span>
                          {item.stemText}
                        </div>
                      )}

                      <textarea
                        rows={3}
                        aria-label={`Nội dung câu hỏi ${item.questionLabel}`}
                        value={item.questionText}
                        onChange={(e) => updateQuestionText(item, e.target.value)}
                        className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 leading-relaxed"
                      />
                    </div>

                    {/* Right Column (7 cols): Specification Row Mapping */}
                    <div className="lg:col-span-7 p-4 space-y-3 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        {/* Unit Selector */}
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            2. Chủ đề & Đơn vị kiến thức trên Ma trận:
                          </label>
                          <select
                            aria-label={`Đơn vị kiến thức ${item.questionLabel}`}
                            value={item.unitId}
                            onChange={(e) =>
                              updateSpecItemFields(item, { unitId: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                          >
                            {allUnits.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.fullLabel}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Competency & Thinking Level Selector */}
                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            3. Năng lực – Cấp độ tư duy:
                          </label>
                          <select
                            aria-label={`Cấp độ tư duy ${item.questionLabel}`}
                            value={item.cellKey}
                            onChange={(e) => {
                              const newCell = e.target.value as CellKey;
                              updateSpecItemFields(item, {
                                cellKey: newCell,
                                indicatorCode: getDefaultIndicatorForCell(newCell),
                              });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                          >
                            {ALL_CELL_KEYS.map((ck) => (
                              <option key={ck} value={ck}>
                                {CELL_KEY_LABELS[ck].shortLabel} ({ck.startsWith('TD') ? 'Tư duy' : ck.startsWith('GQ') ? 'Giải quyết VĐ' : 'Mô hình hóa'})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Indicator Code */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Mã chỉ báo:
                          </label>
                          <input
                            type="text"
                            aria-label={`Mã chỉ báo ${item.questionLabel}`}
                            list="math-competency-codes"
                            value={item.indicatorCode}
                            onChange={(e) =>
                              updateSpecItemFields(item, {
                                indicatorCode: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-center bg-slate-50 border border-slate-300 rounded-lg text-blue-900 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      {/* YCCĐ Description & Quick GDPT 2018 Picker */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-[11px] font-bold text-slate-700">
                            4. Yêu cầu cần đạt (Chuẩn YCCĐ GDPT 2018 kết hợp sát dạng toán trong đề):
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedYccdRowKey(isYccdOpen ? null : item.key)
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                          >
                            <BookOpen className="w-3 h-3" />
                            {isYccdOpen
                              ? 'Ẩn gợi ý YCCĐ Bộ GD&ĐT'
                              : 'Chọn nhanh câu chữ YCCĐ GDPT 2018'}
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          aria-label={`Yêu cầu cần đạt ${item.questionLabel}`}
                          value={item.description}
                          onChange={(e) =>
                            updateSpecItemFields(item, {
                              description: e.target.value,
                            })
                          }
                          className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 leading-relaxed"
                        />

                        {isYccdOpen && (
                          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5 text-xs">
                            <div className="font-semibold text-blue-950 text-[11px]">
                              Gợi ý chuẩn Yêu cầu cần đạt (GDPT 2018) cho bài &ldquo;{item.unitName}&rdquo;:
                            </div>
                            {yccdSuggestions.length === 0 ? (
                              <p className="text-[11px] text-slate-600">
                                Không có gợi ý riêng, bạn có thể nhấn &ldquo;Phân tích sâu câu này&rdquo; ở góc trên.
                              </p>
                            ) : (
                              <div className="space-y-1">
                                {yccdSuggestions.flatMap((y) =>
                                  y.requirements.map((req, rIdx) => (
                                    <button
                                      key={`${y.id}-${rIdx}`}
                                      type="button"
                                      onClick={() => {
                                        updateSpecItemFields(item, {
                                          description: req,
                                        });
                                        setExpandedYccdRowKey(null);
                                      }}
                                      className="w-full text-left p-2 bg-white hover:bg-blue-100/70 border border-blue-200 rounded text-[11px] text-slate-800 flex items-start justify-between gap-2 transition-colors"
                                    >
                                      <span>
                                        <strong className="text-blue-800">
                                          [Lớp {y.grade} - {y.mainTopic}]:
                                        </strong>{' '}
                                        {req}
                                      </span>
                                      <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            Mọi chỉnh sửa tại đây sẽ tự động cập nhật sang <strong>Bản đặc tả</strong> và đồng bộ số lượng lệnh hỏi trên <strong>Ma trận đề</strong>.
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveAndSync}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
              data-testid="save-question-spec-mapper-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              Lưu & Đồng Bộ Vào Ma Trận + Đặc Tả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
