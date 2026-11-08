/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  CheckSquare,
  Square,
  Plus,
  Sparkles,
  Copy,
  Check,
  Layers,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  YCCD_DATABASE,
  YCCD_DOMAINS,
  YCCD_GRADES,
  YCCDItem,
  MathGrade,
  KnowledgeDomain,
} from '../data/yccdDatabase';
import {
  filterYccdItems,
  removeVietnameseDiacritics,
  matchYccdItem,
} from '../utils/yccdSearch';

interface YccdBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Callback when user wants to insert into current exam document
  onInsertToSkills?: (requirements: string[]) => void;
  onInsertToMatrixAndSpec?: (selectedTopics: YCCDItem[]) => void;
  // Callback when used from AI Generator
  onSelectForAi?: (formattedTopics: string, detectedGrade?: MathGrade) => void;
  initialGrade?: MathGrade;
}

const QUICK_SEARCH_CHIPS = [
  'Vectơ',
  'Parabol',
  'Đạo hàm',
  'Tích phân',
  'Xác suất',
  'Không gian',
  'Tam thức bậc hai',
  'Lượng giác',
  'Oxyz',
  'Nhị thức Newton',
];

/**
 * Highlights matches of query within text
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  const cleanQ = query.trim();
  if (!cleanQ) return text;

  try {
    const escaped = cleanQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    if (parts.length > 1) {
      return (
        <>
          {parts.map((part, i) =>
            regex.test(part) ? (
              <mark
                key={i}
                className="bg-amber-200 text-amber-950 font-semibold px-0.5 rounded-xs"
              >
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </>
      );
    }
  } catch (e) {
    // fallback
  }
  return text;
}

export const YccdBrowserModal: React.FC<YccdBrowserModalProps> = ({
  isOpen,
  onClose,
  onInsertToSkills,
  onInsertToMatrixAndSpec,
  onSelectForAi,
  initialGrade,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<MathGrade | 'all'>(
    initialGrade || 'all'
  );
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set());
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter items based on grade, domain, and search query using yccdSearch utility
  const filteredItems = useMemo(() => {
    return filterYccdItems(YCCD_DATABASE, {
      grade: selectedGrade,
      domain: selectedDomain,
      query: searchQuery,
    });
  }, [selectedGrade, selectedDomain, searchQuery]);

  if (!isOpen) return null;

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (selectedItemIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedItemIds(new Set(filteredItems.map((i) => i.id)));
  };

  const collapseAll = () => {
    setExpandedItemIds(new Set());
  };

  const selectedItems = YCCD_DATABASE.filter((item) =>
    selectedItemIds.has(item.id)
  );

  // Handle Action: Copy to clipboard
  const handleCopyText = () => {
    const itemsToCopy = selectedItems.length > 0 ? selectedItems : filteredItems;
    if (itemsToCopy.length === 0) return;

    let text = `DANH SÁCH YÊU CẦU CẦN ĐẠT MÔN TOÁN (GDPT 2018)\n\n`;
    itemsToCopy.forEach((item, idx) => {
      text += `${idx + 1}. [Lớp ${item.grade} - ${item.domain}] ${item.mainTopic}\n`;
      if (item.subTopic) text += `   (Nội dung: ${item.subTopic})\n`;
      item.requirements.forEach((req) => {
        text += `   - ${req}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Handle Action: Apply to AI Generator
  const handleApplyToAi = () => {
    const itemsToUse = selectedItems.length > 0 ? selectedItems : filteredItems.slice(0, 4);
    if (itemsToUse.length === 0) return;

    const formatted = itemsToUse
      .map((item, idx) => {
        const reqSummary = item.requirements.slice(0, 2).join('; ');
        return `${idx + 1}. ${item.mainTopic}: ${item.subTopic || ''} (YCCD: ${reqSummary})`;
      })
      .join('\n');

    const firstGrade = itemsToUse[0]?.grade;
    if (onSelectForAi) {
      onSelectForAi(formatted, firstGrade);
    }
    onClose();
  };

  // Handle Action: Insert to Skills
  const handleInsertSkills = () => {
    if (!onInsertToSkills) return;
    const itemsToUse = selectedItems.length > 0 ? selectedItems : filteredItems;
    const allRequirements: string[] = [];
    itemsToUse.forEach((item) => {
      item.requirements.forEach((req) => {
        allRequirements.push(req);
      });
    });
    onInsertToSkills(allRequirements);
    onClose();
  };

  // Handle Action: Insert to Matrix & Spec
  const handleInsertMatrix = () => {
    if (!onInsertToMatrixAndSpec) return;
    const itemsToUse = selectedItems.length > 0 ? selectedItems : filteredItems;
    onInsertToMatrixAndSpec(itemsToUse);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="yccd-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl my-6 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <BookOpen className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 id="yccd-modal-title" className="text-base font-bold tracking-tight">
                Ngân Hàng Yêu Cầu Cần Đạt (YCCD) Môn Toán – Chương Trình GDPT 2018
              </h2>
              <p className="text-xs text-blue-200">
                Trích xuất chuẩn từ văn bản Bộ GD&ĐT (Lớp 6 đến Lớp 12). Tìm kiếm, lọc và chọn nội dung để đưa vào Ma trận & Đặc tả.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          {/* Top Primary Full-Width Search Bar */}
          <div className="space-y-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
              <input
                ref={searchInputRef}
                type="text"
                data-testid="yccd-search-input"
                placeholder="Tìm kiếm nhanh yêu cầu cần đạt theo chủ đề, bài học, từ khóa (Parabol, Vectơ, Đạo hàm, Tích phân, Xác suất, Lượng giác, Khối đa diện...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-28 py-2.5 text-xs sm:text-sm bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs font-medium transition-all"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                    title="Xóa tìm kiếm"
                    data-testid="yccd-search-clear-btn"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-mono shrink-0">
                  {filteredItems.length} kết quả
                </span>
              </div>
            </div>

            {/* Quick Search Keyword Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                Gợi ý tìm nhanh:
              </span>
              {QUICK_SEARCH_CHIPS.map((chip) => {
                const isActive = searchQuery.toLowerCase() === chip.toLowerCase();
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setSearchQuery(isActive ? '' : chip);
                      searchInputRef.current?.focus();
                    }}
                    className={`px-2.5 py-1 text-[11px] rounded-full transition-colors shrink-0 font-medium ${
                      isActive
                        ? 'bg-blue-700 text-white shadow-2xs font-semibold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Khối Lớp Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-700 shrink-0 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-700" /> Khối Lớp:
            </span>
            <button
              type="button"
              onClick={() => setSelectedGrade('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                selectedGrade === 'all'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Tất cả (Lớp 6 - 12)
            </button>
            {YCCD_GRADES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                  selectedGrade === g
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>

          {/* Row 3: Domain filter & Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-slate-200 text-xs">
            {/* Domain Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-semibold text-slate-700 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-blue-700" /> Mạch kiến thức:
              </span>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full sm:w-[260px] px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="all">Tất cả mạch kiến thức</option>
                <option value="Số và Đại số / Giải tích">
                  Số & Đại số / Giải tích
                </option>
                <option value="Hình học và Đo lường">Hình học & Đo lường</option>
                <option value="Thống kê và Xác suất">Thống kê & Xác suất</option>
                <option value="Chuyên đề học tập">Chuyên đề học tập</option>
              </select>
            </div>

            {/* Batch Selection & Expand All */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-slate-600">
              <button
                type="button"
                onClick={toggleSelectAllFiltered}
                className="inline-flex items-center gap-1.5 font-medium text-blue-700 hover:text-blue-800"
              >
                {selectedItemIds.size === filteredItems.length &&
                filteredItems.length > 0 ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" /> Bỏ chọn ({filteredItems.length})
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" /> Chọn tất cả ({filteredItems.length})
                  </>
                )}
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={expandAll}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline"
              >
                Mở rộng tất cả
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline"
              >
                Thu gọn
              </button>
            </div>
          </div>
        </div>

        {/* Topics List Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-100/60">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300 p-8 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Không tìm thấy chủ đề hoặc yêu cầu cần đạt nào phù hợp với &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-slate-500">
                Hãy thử đổi từ khóa tìm kiếm (hỗ trợ cả tiếng Việt có dấu và không dấu) hoặc chuyển sang khối lớp khác.
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Xóa bộ lọc tìm kiếm
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItemIds.has(item.id);
              // Auto-expand if user is actively searching or explicitly expanded
              const matchesReq =
                searchQuery.trim().length > 1 &&
                item.requirements.some((r) =>
                  matchYccdItem({ ...item, requirements: [r], mainTopic: '', subTopic: '', keywords: [] }, searchQuery)
                );
              const isExpanded = expandedItemIds.has(item.id) || matchesReq;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Topic Card Header */}
                  <div className="p-4 flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelectItem(item.id)}
                      className="mt-0.5 text-blue-700 hover:text-blue-800 shrink-0"
                      aria-label={isSelected ? 'Bỏ chọn chủ đề' : 'Chọn chủ đề'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-700" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-800 rounded">
                          Lớp {item.grade}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded">
                          {item.domain}
                        </span>
                        {item.competencySuggestion && (
                          <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                            Gợi ý: [{item.competencySuggestion.indicatorCode} - {item.competencySuggestion.levelName}]
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {highlightMatch(item.mainTopic, searchQuery)}
                      </h3>
                      {item.subTopic && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          <span className="font-medium text-slate-700">Nội dung:</span>{' '}
                          {highlightMatch(item.subTopic, searchQuery)}
                        </p>
                      )}

                      {/* Expand/Collapse Requirements Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Thu gọn {item.requirements.length} Yêu cầu cần đạt
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-3.5 h-3.5" />
                            Xem {item.requirements.length} Yêu cầu cần đạt chi tiết
                          </>
                        )}
                      </button>

                      {/* Requirements List (expanded or shown when searching and matches) */}
                      {isExpanded && (
                        <div className="mt-3 pl-3 border-l-2 border-blue-200 space-y-2 pt-1 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-r-md">
                          <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
                            Yêu Cầu Cần Đạt (Bộ Giáo dục và Đào tạo):
                          </div>
                          <ul className="space-y-1.5 list-disc pl-4 text-slate-700 leading-relaxed">
                            {item.requirements.map((req, rIdx) => (
                              <li key={rIdx} className="pl-0.5">
                                {highlightMatch(req, searchQuery)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Đã sao chép!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép YCCD đã chọn
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* If opened for AI generation */}
            {onSelectForAi && (
              <button
                type="button"
                onClick={handleApplyToAi}
                disabled={filteredItems.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Đưa vào Tạo Ma trận bằng AI ({selectedItems.length > 0 ? selectedItems.length : filteredItems.length > 4 ? 4 : filteredItems.length} chủ đề)
              </button>
            )}

            {/* If opened from Exam document */}
            {onInsertToMatrixAndSpec && (
              <button
                type="button"
                onClick={handleInsertMatrix}
                disabled={filteredItems.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Chèn vào Ma trận & Bảng đặc tả ({selectedItems.length > 0 ? selectedItems.length : filteredItems.length} chủ đề)
              </button>
            )}

            {onInsertToSkills && (
              <button
                type="button"
                onClick={handleInsertSkills}
                disabled={filteredItems.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Thêm vào Kỹ năng đề thi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
