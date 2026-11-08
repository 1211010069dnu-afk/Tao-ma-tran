import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileDown,
  Printer,
  Wand2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit3,
  RotateCcw,
  FileText,
  BookOpen,
  Sparkles,
  HardDrive,
  Check,
  Undo2,
  Redo2,
  UploadCloud,
} from 'lucide-react';
import { ExamDocument } from './types/exam';
import { useDocumentHistory } from './hooks/useDocumentHistory';
import {
  DEFAULT_TOAN_10_DOCUMENT,
  TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT,
  TOAN_10_MENH_DE_TAP_HOP_DOCUMENT,
  PRESET_TEMPLATES,
  emptyCells,
} from './data/sampleToan10';
import { matchQuestionToUnitDef } from './utils/examParser';
import {
  calculateMatrixSummary,
  calculateSpecSummary,
  crossCheckMatrixAndSpec,
  formatVnScore,
  syncMatrixFromSpec,
  autoBalanceScores,
  BalanceStrategy,
} from './utils/matrixCalculator';
import { exportExamDocumentToDocx } from './utils/docxExporter';
import { DocumentHeaderEditor } from './components/DocumentHeaderEditor';
import { MatrixTableEditor } from './components/MatrixTableEditor';
import { SpecTableEditor } from './components/SpecTableEditor';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { UploadExamModal } from './components/UploadExamModal';
import { ExportDocxModal } from './components/ExportDocxModal';
import { AddExamContentModal } from './components/AddExamContentModal';
import { RefineSpecModal } from './components/RefineSpecModal';
import { YccdBrowserModal } from './components/YccdBrowserModal';
import { QuestionSpecMapperModal } from './components/QuestionSpecMapperModal';
import { getQuestionSpecMappings } from './utils/knowledgeAnalyzer';
import { YCCDItem } from './data/yccdDatabase';
import {
  CELL_KEY_LABELS,
  MATH_COMPETENCY_INDICATORS,
} from './data/mathCompetencies';

type ActiveTab = 'editor' | 'compare' | 'competencies';

const LOCAL_STORAGE_KEY = 'mathmatrix_saved_exam_doc_v4';

export default function App() {
  const {
    doc,
    setDoc,
    undo,
    redo,
    canUndo,
    canRedo,
    historyStats,
    resetHistory,
  } = useDocumentHistory<ExamDocument>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.header && parsed.matrixTopics && parsed.specification) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Lỗi khi đọc trạng thái từ LocalStorage:', e);
    }
    return structuredClone(TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT);
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [comparePdfUrl, setComparePdfUrl] = useState<string>(
    '/assets/aistudio/MT_Toan_10_Khaosatdaunam_26-27_438bda3a.pdf'
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isUploadExamModalOpen, setIsUploadExamModalOpen] = useState(false);
  const [isExportDocxModalOpen, setIsExportDocxModalOpen] = useState(false);
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  const [isRefineSpecModalOpen, setIsRefineSpecModalOpen] = useState(false);
  const [isYccdModalOpen, setIsYccdModalOpen] = useState(false);
  const [isQuestionMapperModalOpen, setIsQuestionMapperModalOpen] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // LocalStorage Auto-save status tracking
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  });

  const isInitialMount = useRef(true);

  // Auto-save debounced effect to localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(doc));
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        setLastSavedTime(timeStr);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Không thể lưu vào LocalStorage:', err);
        setSaveStatus('saved');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [doc]);

  const matrixStats = useMemo(
    () => calculateMatrixSummary(doc.matrixTopics),
    [doc.matrixTopics]
  );
  const specStats = useMemo(
    () => calculateSpecSummary(doc.specification),
    [doc.specification]
  );
  const crossCheck = useMemo(
    () => crossCheckMatrixAndSpec(doc.matrixTopics, doc.specification),
    [doc.matrixTopics, doc.specification]
  );
  const knowledgeMappings = useMemo(
    () => getQuestionSpecMappings(doc),
    [doc]
  );
  const knowledgeWarningsCount = useMemo(
    () => knowledgeMappings.reduce((sum, item) => sum + item.warnings.length, 0),
    [knowledgeMappings]
  );

  const showToast = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleUndo = () => {
    if (undo()) {
      showToast('Đã hoàn tác thao tác gần nhất (Ctrl+Z)');
    }
  };

  const handleRedo = () => {
    if (redo()) {
      showToast('Đã làm lại thao tác vừa hoàn tác (Ctrl+Y)');
    }
  };

  const handleSyncMatrixFromSpec = () => {
    const syncedTopics = syncMatrixFromSpec(doc.matrixTopics, doc.specification);
    setDoc(
      (prev) => ({
        ...prev,
        matrixTopics: syncedTopics,
      }),
      { immediate: true }
    );
    showToast(
      'Đã đồng bộ toàn bộ các ô lệnh hỏi và mã năng lực từ Bảng đặc tả lên Ma trận.'
    );
  };

  const handleExportWordWithHeader = async (
    updatedHeader: ExamDocument['header'],
    updatedDuration: string,
    syncToDoc: boolean
  ) => {
    try {
      setIsExportingDocx(true);
      const docToExport: ExamDocument = {
        ...doc,
        header: updatedHeader,
        format: {
          ...doc.format,
          durationText: updatedDuration,
        },
      };

      if (syncToDoc) {
        setDoc(
          (prev) => ({
            ...prev,
            header: updatedHeader,
            format: {
              ...prev.format,
              durationText: updatedDuration,
            },
          }),
          { immediate: true }
        );
      }

      await exportExamDocumentToDocx(docToExport);
      showToast(
        `Đã xuất file Word (.docx) cho ${updatedHeader.school} – ${updatedHeader.examName}.`
      );
    } catch (err) {
      console.error(err);
      showToast('Không thể xuất file Word. Vui lòng thử lại.');
      throw err;
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportWord = () => {
    setIsExportDocxModalOpen(true);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleAutoBalanceScores = (strategy: BalanceStrategy = 'moet_standard') => {
    const balancedSpec = autoBalanceScores(doc.specification, strategy);
    const syncedMatrix = syncMatrixFromSpec(doc.matrixTopics, balancedSpec);
    setDoc(
      (prev) => ({
        ...prev,
        specification: balancedSpec,
        matrixTopics: syncedMatrix,
      }),
      { immediate: true }
    );
    const stratName =
      strategy === 'moet_standard'
        ? 'Chuẩn Bộ GD&ĐT (TN: 0,25đ, ĐS: 1,0đ, TLN: 0,5đ, Tự luận cân đối)'
        : strategy === 'ratio_433'
        ? 'Tỉ lệ độ khó 4 : 3 : 3 (4đ Biết - 3đ Hiểu - 3đ Vận dụng)'
        : 'Tỉ lệ độ khó 5 : 3 : 2 (5đ Biết - 3đ Hiểu - 2đ Vận dụng)';
    showToast(`Đã tự động cân bằng toàn bộ điểm số đạt đúng 10,00 điểm theo ${stratName}.`);
  };

  const handleResetToOriginal = () => {
    const original = structuredClone(TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT);
    resetHistory(original);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(original));
    } catch (e) {
      // ignore
    }
    showToast(
      'Đã khôi phục về dữ liệu gốc: Đề Khảo Sát Chất Lượng Đầu Năm Toán 10 (Trường Song Ngữ Á Châu).'
    );
  };

  const handleLoadKhaoSatDauNamPreset = () => {
    const preset = structuredClone(TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT);
    setDoc(preset, { immediate: true });
    showToast(
      'Đã nạp chuẩn 100% Ma trận & Bảng đặc tả Đề Khảo Sát Chất Lượng Đầu Năm Toán 10 (28 lệnh hỏi, 10,00 điểm).'
    );
  };

  const handleLoadMenhDeTapHopPreset = () => {
    const preset = structuredClone(TOAN_10_MENH_DE_TAP_HOP_DOCUMENT);
    preset.header = structuredClone(doc.header);
    setDoc(preset, { immediate: true });
    showToast(
      'Đã cập nhật Ma trận & Bảng đặc tả đầy đủ bài Mệnh đề và Tập hợp (34 lệnh hỏi, 10,00 điểm).'
    );
  };

  const handleInsertYccdToSkills = (newRequirements: string[]) => {
    if (newRequirements.length === 0) return;
    setDoc(
      (prev) => {
        const existingSet = new Set(prev.objectives.skills);
        const toAdd: string[] = [];
        newRequirements.forEach((req) => {
          if (!existingSet.has(req)) {
            toAdd.push(req);
            existingSet.add(req);
          }
        });
        return {
          ...prev,
          objectives: {
            ...prev.objectives,
            skills: [...prev.objectives.skills, ...toAdd],
          },
        };
      },
      { immediate: true }
    );
    showToast(`Đã thêm ${newRequirements.length} Yêu cầu cần đạt vào mục Kỹ năng của đề thi!`);
  };

  const handleInsertYccdToMatrixAndSpec = (selectedTopics: YCCDItem[]) => {
    if (selectedTopics.length === 0) return;
    setDoc(
      (prev) => {
        const newTopics = structuredClone(prev.matrixTopics);
        const newSpec = structuredClone(prev.specification);

        selectedTopics.forEach((item, idx) => {
          const uniqueSuffix = `${Date.now()}-${idx}`;
          const newTopicId = `topic-yccd-${uniqueSuffix}`;
          const newUnitId = `unit-yccd-${uniqueSuffix}`;

          newTopics.push({
            id: newTopicId,
            topicName: item.mainTopic.toUpperCase(),
            units: [
              {
                id: newUnitId,
                content: item.subTopic || item.mainTopic,
                cells: emptyCells(),
              },
            ],
          });

          const firstReq =
            item.requirements[0] ||
            `Vận dụng kiến thức về ${item.mainTopic.toLowerCase()} vào giải quyết bài toán.`;
          const cellKey = item.competencySuggestion?.cellKey || 'GQ_Hieu';
          const indicatorCode = item.competencySuggestion?.indicatorCode || 'GQ2.1';

          newSpec.multipleChoice.push({
            id: `tn-yccd-${uniqueSuffix}`,
            questionLabel: `Câu ${newSpec.multipleChoice.length + 1}`,
            unitId: newUnitId,
            description: firstReq,
            cellKey: cellKey,
            indicatorCode: indicatorCode,
            score: 0.25,
          });
        });

        const syncedMatrix = syncMatrixFromSpec(newTopics, newSpec);
        return {
          ...prev,
          matrixTopics: syncedMatrix,
          specification: newSpec,
        };
      },
      { immediate: true }
    );
    showToast(`Đã chèn ${selectedTopics.length} chủ đề và YCCD chuẩn vào Ma trận & Bảng đặc tả!`);
  };

  // Count how many times each indicator code is used in the specification
  const indicatorUsageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of doc.specification.multipleChoice) {
      counts[q.indicatorCode] = (counts[q.indicatorCode] || 0) + 1;
    }
    for (const q of doc.specification.trueFalse) {
      for (const sub of q.subItems) {
        counts[sub.indicatorCode] = (counts[sub.indicatorCode] || 0) + 1;
      }
    }
    for (const q of doc.specification.shortAnswer) {
      counts[q.indicatorCode] = (counts[q.indicatorCode] || 0) + 1;
    }
    for (const q of doc.specification.essay) {
      counts[q.indicatorCode] = (counts[q.indicatorCode] || 0) + 1;
    }
    return counts;
  }, [doc.specification]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('editor');
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          MathMatrix Pro
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'editor'
                ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                : ''
            }`}
          >
            Tạo ma trận
          </button>
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5"
          >
            Tạo đề mới
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'compare'
                ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                : ''
            }`}
          >
            Đối chiếu PDF gốc
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('competencies')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'competencies'
                ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                : ''
            }`}
          >
            Bảng mã năng lực
          </button>
          <button
            type="button"
            onClick={() => setIsYccdModalOpen(true)}
            className="hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 flex items-center gap-1.5 text-blue-700 font-semibold"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
            Ngân hàng YCCD (Lớp 6–12)
          </button>
        </nav>

        {/* Zone 3: Undo / Redo controls & Primary Export action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Hoàn tác thao tác gần nhất (Ctrl+Z)"
              data-testid="header-undo-btn"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hoàn tác</span>
            </button>
            <div className="w-[1px] h-3.5 bg-slate-300 mx-0.5" />
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Làm lại thao tác vừa hoàn tác (Ctrl+Y)"
              data-testid="header-redo-btn"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Làm lại</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportWord}
            disabled={isExportingDocx}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
          >
            <FileDown className="w-3.5 h-3.5" />
            {isExportingDocx ? 'Đang tạo .docx...' : 'Xuất Word (.docx)'}
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Control & Analytics Sidebar (Hidden when printing) */}
        <aside
          aria-label="Bảng điều khiển và thống kê ma trận"
          className="no-print w-full lg:w-[310px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-5 space-y-6 lg:sticky lg:top-[57px] lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto self-start"
        >
          {/* Action Deck */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">
              Khởi tạo & Thay nội dung
            </h2>
            <button
              type="button"
              onClick={() => setIsUploadExamModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors shadow-xs"
            >
              <UploadCloud className="w-4 h-4 text-blue-200" />
              Tải Đề Thi → AI Sinh Ma Trận & Đặc Tả
            </button>
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
            >
              <Wand2 className="w-4 h-4 text-blue-600" />
              Nhập Chủ Đề / Tạo Ma Trận Mới
            </button>
            <button
              type="button"
              onClick={() => setIsAddContentModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Bổ Sung Nội Dung Kiểm Tra (AI)
            </button>
            <button
              type="button"
              onClick={() => setIsRefineSpecModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
              title="Rà soát và tinh chỉnh các dòng YCCĐ trong Bảng đặc tả sát đúng từng câu trong đề thi"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Tinh Chỉnh Đặc Tả Sát Đề (AI)
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200/80 transition-colors whitespace-nowrap"
              >
                {isPreviewMode ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    Chế độ Sửa
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Xem bản in
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200/80 transition-colors whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" />
                In / Lưu PDF
              </button>
            </div>

            <div className="pt-1.5 space-y-1.5">
              <button
                type="button"
                onClick={() => setIsQuestionMapperModalOpen(true)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold border rounded-lg transition-colors group ${
                  knowledgeWarningsCount > 0
                    ? 'text-amber-950 bg-amber-50 hover:bg-amber-100 border-amber-300'
                    : 'text-emerald-950 bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200'
                }`}
                data-testid="sidebar-open-question-mapper-btn"
              >
                <div className="flex items-center gap-2">
                  {knowledgeWarningsCount > 0 ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className="text-left font-bold">Đối chiếu Câu hỏi – Đặc tả</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    knowledgeWarningsCount > 0
                      ? 'text-white bg-amber-600'
                      : 'text-emerald-800 bg-emerald-200/80'
                  }`}
                >
                  {knowledgeWarningsCount > 0 ? `${knowledgeWarningsCount} cảnh báo` : 'Chuẩn MH'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsYccdModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-blue-950 bg-blue-50/90 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
                data-testid="sidebar-open-yccd-btn"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-700 shrink-0" />
                  <span className="text-left font-bold whitespace-nowrap">Ngân hàng YCCĐ (Lớp 6–12)</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-200/70 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                  GDPT 2018
                </span>
              </button>
            </div>

            {/* Undo / Redo Sidebar Quick Control */}
            <div className="pt-2">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Lịch sử thao tác</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {canUndo ? `${historyStats.pastCount} bước` : 'Chưa có bước mới'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
                    title="Hoàn tác thao tác gần nhất (Ctrl+Z)"
                    data-testid="sidebar-undo-btn"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Hoàn tác</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
                    title="Làm lại thao tác vừa hoàn tác (Ctrl+Y)"
                    data-testid="sidebar-redo-btn"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                    <span>Làm lại</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                  <span>Phím tắt:</span>
                  <span className="font-mono text-slate-700">Ctrl+Z / Ctrl+Y</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <label
              htmlFor="preset-select"
              className="block text-xs font-bold text-slate-900"
            >
              Chuyển nhanh bộ mẫu có sẵn
            </label>
            <select
              id="preset-select"
              value={doc.id}
              onChange={(e) => {
                const found = PRESET_TEMPLATES.find((p) => p.id === e.target.value);
                if (found) {
                  setDoc(structuredClone(found), { immediate: true });
                  showToast(`Đã nạp mẫu: ${found.title}`);
                }
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
            >
              {PRESET_TEMPLATES.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.title}
                </option>
              ))}
              {!PRESET_TEMPLATES.some((p) => p.id === doc.id) && (
                <option value={doc.id}>{doc.title}</option>
              )}
            </select>
            <button
              type="button"
              onClick={handleResetToOriginal}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Khôi phục mẫu Toán 10 gốc từ file PDF
            </button>
          </div>

          {/* Real-time Matrix & Specification Audit */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900">
                Kiểm toán Ma trận & Đặc tả
              </h2>
              <span className="text-[11px] font-mono-tabular text-slate-500">
                {specStats.totalCommands} lệnh hỏi
              </span>
            </div>

            {/* Sync Status Banner */}
            <div
              className={`p-3 rounded-lg border text-xs ${
                crossCheck.isSynced
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-2">
                {crossCheck.isSynced ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-semibold">
                    {crossCheck.isSynced
                      ? 'Khớp 100% giữa Ma trận & Đặc tả'
                      : `Lệch số lệnh hỏi (Ma trận: ${crossCheck.matrixTotal}, Đặc tả: ${crossCheck.specTotal})`}
                  </div>
                  <p className="text-[11px] opacity-90">
                    {crossCheck.isSynced
                      ? 'Mọi ô năng lực TD, GQ, MH trên 2 bảng đều đồng nhất.'
                      : 'Nhấn nút bên dưới để tự động cập nhật bảng Ma trận theo Bảng đặc tả.'}
                  </p>
                  {!crossCheck.isSynced && (
                    <button
                      type="button"
                      onClick={handleSyncMatrixFromSpec}
                      className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Đồng bộ ngay
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Score & Level Breakdown Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium">Cấp độ tư duy</th>
                    <th className="text-right py-2 px-2 font-medium">Số lệnh</th>
                    <th className="text-right py-2 px-3 font-medium">Điểm số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono-tabular">
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Biết</td>
                    <td className="py-2 px-2 text-right">{specStats.byLevel.Biet}</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {formatVnScore(specStats.scoreByLevel.Biet)}đ
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Hiểu</td>
                    <td className="py-2 px-2 text-right">{specStats.byLevel.Hieu}</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {formatVnScore(specStats.scoreByLevel.Hieu)}đ
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Vận dụng</td>
                    <td className="py-2 px-2 text-right">{specStats.byLevel.VD}</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {formatVnScore(specStats.scoreByLevel.VD)}đ
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="py-2 px-3 font-sans">Tổng cộng</td>
                    <td className="py-2 px-2 text-right">{specStats.totalCommands}</td>
                    <td
                      className={`py-2 px-3 text-right ${
                        Math.abs(specStats.totalScore - 10) < 0.01
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {formatVnScore(specStats.totalScore)}đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 1-Click Auto Balance Scores based on difficulty & MOET structure */}
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/70 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Cân bằng điểm (Thang 10đ)
                </span>
                <span
                  className={`text-[11px] font-mono-tabular font-bold ${
                    Math.abs(specStats.totalScore - 10) < 0.01
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {formatVnScore(specStats.totalScore)} / 10đ
                </span>
              </div>
              <p className="text-[11px] text-emerald-900/80 leading-snug">
                Tự động điều chỉnh điểm số các câu hỏi dựa theo độ khó và cơ cấu đề chỉ với 1 cú click:
              </p>
              <div className="space-y-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleAutoBalanceScores('moet_standard')}
                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-medium text-emerald-950 bg-white hover:bg-emerald-100/80 border border-emerald-300 rounded shadow-2xs transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-semibold text-emerald-900">
                      Chuẩn Bộ GD&ĐT (Khuyến nghị)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      TN 0.25đ · ĐS 1đ · TLN 0.5đ · TL cân đối
                    </div>
                  </div>
                  <span className="text-emerald-700 font-bold ml-1 shrink-0">10đ →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAutoBalanceScores('ratio_433')}
                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded shadow-2xs transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      Tỉ lệ độ khó 4 : 3 : 3
                    </div>
                    <div className="text-[10px] text-slate-500">
                      40% Biết · 30% Hiểu · 30% Vận dụng
                    </div>
                  </div>
                  <span className="text-slate-600 font-bold ml-1 shrink-0">10đ →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAutoBalanceScores('ratio_532')}
                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded shadow-2xs transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      Tỉ lệ độ khó 5 : 3 : 2
                    </div>
                    <div className="text-[10px] text-slate-500">
                      50% Biết · 30% Hiểu · 20% Vận dụng
                    </div>
                  </div>
                  <span className="text-slate-600 font-bold ml-1 shrink-0">10đ →</span>
                </button>
              </div>
            </div>

            {/* 3 Competency Domains Breakdown */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="text-slate-500 font-medium">
                Phân bổ 3 năng lực Toán học:
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>1. Tư duy & lập luận (TD)</span>
                <span className="font-mono-tabular font-semibold">
                  {matrixStats.byDomain.TD} lệnh
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>2. Giải quyết vấn đề (GQ)</span>
                <span className="font-mono-tabular font-semibold">
                  {matrixStats.byDomain.GQ} lệnh
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>3. Mô hình hóa (MH)</span>
                <span className="font-mono-tabular font-semibold">
                  {matrixStats.byDomain.MH} lệnh
                </span>
              </div>
            </div>

            {/* Question Formats Count */}
            <div className="space-y-1 pt-2 border-t border-slate-200 text-xs text-slate-600">
              <div className="font-medium text-slate-700 mb-1">
                Cơ cấu câu hỏi trong Đặc tả:
              </div>
              <div className="flex justify-between">
                <span>Phần 1 (TN nhiều lựa chọn):</span>
                <span className="font-mono-tabular font-medium text-slate-900">
                  {doc.specification.multipleChoice.length} câu
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phần 2 (TN Đúng/Sai):</span>
                <span className="font-mono-tabular font-medium text-slate-900">
                  {doc.specification.trueFalse.length} câu (
                  {doc.specification.trueFalse.length * 4} ý)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phần 3 (TN trả lời ngắn):</span>
                <span className="font-mono-tabular font-medium text-slate-900">
                  {doc.specification.shortAnswer.length} câu
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phần 4 (Tự luận):</span>
                <span className="font-mono-tabular font-medium text-slate-900">
                  {doc.specification.essay.length} câu
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Viewport */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {statusBanner && (
            <div
              role="status"
              className="no-print mb-4 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg flex items-center justify-between shadow-sm"
            >
              <span>{statusBanner}</span>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="text-slate-400 hover:text-white ml-4"
              >
                Đóng
              </button>
            </div>
          )}

          {/* TAB 1: Official Document Live Editor / Print Sheet */}
          {activeTab === 'editor' && (
            <div className="print-sheet max-w-[1160px] mx-auto bg-white border border-slate-200 shadow-xs rounded-sm p-6 md:p-10">
              <DocumentHeaderEditor
                header={doc.header}
                objectives={doc.objectives}
                format={doc.format}
                readOnly={isPreviewMode}
                onChangeHeader={(header) => setDoc({ ...doc, header })}
                onChangeObjectives={(objectives) => setDoc({ ...doc, objectives })}
                onChangeFormat={(format) => setDoc({ ...doc, format })}
              />

              <MatrixTableEditor
                topics={doc.matrixTopics}
                footnoteText={doc.format.footnoteText}
                readOnly={isPreviewMode}
                onChangeTopics={(matrixTopics) => {
                  const usedUnitIds = new Set<string>();
                  doc.specification.multipleChoice.forEach((q) => usedUnitIds.add(q.unitId));
                  doc.specification.trueFalse.forEach((q) => usedUnitIds.add(q.unitId));
                  doc.specification.shortAnswer.forEach((q) => usedUnitIds.add(q.unitId));
                  doc.specification.essay.forEach((q) => usedUnitIds.add(q.unitId));

                  const prevUnitIds = new Set(
                    doc.matrixTopics.flatMap((t) => t.units.map((u) => u.id))
                  );

                  const newSpec = structuredClone(doc.specification);
                  let addedToSpec = false;

                  for (const topic of matrixTopics) {
                    for (const unit of topic.units) {
                      if (!prevUnitIds.has(unit.id) && !usedUnitIds.has(unit.id)) {
                        const matchedDef = matchQuestionToUnitDef(
                          `${topic.topicName} ${unit.content}`
                        );
                        const tpl = matchedDef.tnTemplates[0];
                        newSpec.multipleChoice.push({
                          id: `tn-sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                          questionLabel: `Câu ${newSpec.multipleChoice.length + 1}`,
                          unitId: unit.id,
                          description: tpl.desc,
                          cellKey: tpl.cellKey,
                          indicatorCode: tpl.code,
                          score: 0.25,
                        });
                        addedToSpec = true;
                      }
                    }
                  }

                  if (addedToSpec) {
                    const syncedMatrix = syncMatrixFromSpec(matrixTopics, newSpec);
                    setDoc({
                      ...doc,
                      matrixTopics: syncedMatrix,
                      specification: newSpec,
                    });
                  } else {
                    setDoc({ ...doc, matrixTopics });
                  }
                }}
                onChangeFootnote={(footnoteText) =>
                  setDoc({
                    ...doc,
                    format: { ...doc.format, footnoteText },
                  })
                }
                onSyncFromSpec={handleSyncMatrixFromSpec}
                onOpenYccdBrowser={() => setIsYccdModalOpen(true)}
                onOpenAddContentAi={() => setIsAddContentModalOpen(true)}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
              />

              <SpecTableEditor
                specification={doc.specification}
                matrixTopics={doc.matrixTopics}
                readOnly={isPreviewMode}
                onChangeSpec={(specification) => setDoc({ ...doc, specification })}
                onAutoBalanceScores={handleAutoBalanceScores}
                onOpenYccdBrowser={() => setIsYccdModalOpen(true)}
                onOpenAddContentAi={() => setIsAddContentModalOpen(true)}
                onOpenRefineSpec={() => setIsRefineSpecModalOpen(true)}
                onOpenQuestionMapper={() => setIsQuestionMapperModalOpen(true)}
                auditWarningsCount={knowledgeWarningsCount}
                onLoadMenhDeTapHopPreset={handleLoadMenhDeTapHopPreset}
                onLoadKhaoSatDauNamPreset={handleLoadKhaoSatDauNamPreset}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </div>
          )}

          {/* TAB 2: Side-by-Side Comparison with User's Original Attached PDF */}
          {activeTab === 'compare' && (
            <div className="max-w-[1280px] mx-auto space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div>
                  <h1 className="text-base font-bold text-slate-900">
                    Đối Chiếu Với File Đề & Ma Trận Mẫu Gốc Của Bạn
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setComparePdfUrl(
                          '/assets/aistudio/MT_Toan_10_Khaosatdaunam_26-27_438bda3a.pdf'
                        )
                      }
                      className={`px-2.5 py-1 text-xs rounded border font-medium transition-colors ${
                        comparePdfUrl.includes('MT_Toan_10_Khaosatdaunam')
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      1. Ma trận & Đặc tả Khảo sát đầu năm (MT_Toan_10_Khaosatdaunam_26-27.pdf)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setComparePdfUrl('/assets/aistudio/10_777ea7ef.pdf')
                      }
                      className={`px-2.5 py-1 text-xs rounded border font-medium transition-colors ${
                        comparePdfUrl.includes('10_777ea7ef')
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      2. Đề Khảo sát đầu năm Toán 10 (10.pdf)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setComparePdfUrl(
                          '/assets/aistudio/Matran_dacta_Toan_10_Kiemtragiuahocky2.dox_72da93f7.pdf'
                        )
                      }
                      className={`px-2.5 py-1 text-xs rounded border font-medium transition-colors ${
                        comparePdfUrl.includes('Kiemtragiuahocky2')
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      3. Ma trận & Đặc tả Giữa HK2
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={comparePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Mở PDF gốc toàn màn hình
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
                  >
                    Quay lại Trình soạn thảo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-[780px]">
                  <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
                    <span>1. File PDF Mẫu Gốc Bạn Cung Cấp</span>
                    <span className="text-slate-500 font-normal">Bản gốc</span>
                  </div>
                  <iframe
                    title="File PDF Mẫu Gốc Toán 10"
                    src={comparePdfUrl}
                    className="w-full flex-1 border-0"
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-[780px]">
                  <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
                    <span>2. Bản Thiết Kế Đang Soạn Thảo Hiện Tại</span>
                    <span className="font-mono-tabular text-emerald-700">
                      {specStats.totalCommands} lệnh hỏi · {formatVnScore(specStats.totalScore)} điểm
                    </span>
                  </div>
                  <div className="p-5 overflow-y-auto flex-1">
                    <DocumentHeaderEditor
                      header={doc.header}
                      objectives={doc.objectives}
                      format={doc.format}
                      readOnly={true}
                      onChangeHeader={() => {}}
                      onChangeObjectives={() => {}}
                      onChangeFormat={() => {}}
                    />
                    <MatrixTableEditor
                      topics={doc.matrixTopics}
                      footnoteText={doc.format.footnoteText}
                      readOnly={true}
                      onChangeTopics={() => {}}
                      onChangeFootnote={() => {}}
                      onSyncFromSpec={() => {}}
                    />
                    <SpecTableEditor
                      specification={doc.specification}
                      matrixTopics={doc.matrixTopics}
                      readOnly={true}
                      onChangeSpec={() => {}}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GDPT 2018 Math Competency Reference & Usage Matrix */}
          {activeTab === 'competencies' && (
            <div className="max-w-[1100px] mx-auto bg-white border border-slate-200 rounded-lg p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-base font-bold text-slate-900">
                    Hệ Thống Mã Chỉ Báo Năng Lực Toán Học (Chương Trình GDPT 2018)
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Bảng tra cứu các mã chỉ báo <strong>TD</strong> (Tư duy & lập luận),{' '}
                    <strong>GQ</strong> (Giải quyết vấn đề), <strong>MH</strong> (Mô hình hóa) và tần suất xuất hiện trong đề hiện tại.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
                >
                  Quay lại Biểu mẫu
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-200 py-2.5 px-3 text-left w-24">
                        Mã chỉ báo
                      </th>
                      <th className="border border-slate-200 py-2.5 px-3 text-left w-52">
                        Năng lực thành phần
                      </th>
                      <th className="border border-slate-200 py-2.5 px-3 text-center w-28">
                        Cấp độ gợi ý
                      </th>
                      <th className="border border-slate-200 py-2.5 px-3 text-left">
                        Biểu hiện / Yêu cầu cần đạt trong môn Toán
                      </th>
                      <th className="border border-slate-200 py-2.5 px-3 text-right w-28">
                        Số lần dùng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATH_COMPETENCY_INDICATORS.map((item) => {
                      const count = indicatorUsageCounts[item.code] || 0;
                      const cellKey = `${item.domain}_${item.defaultLevel}` as keyof typeof CELL_KEY_LABELS;
                      const meta = CELL_KEY_LABELS[cellKey];
                      return (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="border border-slate-200 py-2 px-3 font-mono font-bold text-slate-900">
                            {item.code}
                          </td>
                          <td className="border border-slate-200 py-2 px-3 text-slate-700">
                            {meta.domainLabel}
                          </td>
                          <td className="border border-slate-200 py-2 px-3 text-center font-medium text-slate-700">
                            {meta.levelLabel}
                          </td>
                          <td className="border border-slate-200 py-2 px-3 text-slate-600">
                            {item.description}
                          </td>
                          <td className="border border-slate-200 py-2 px-3 text-right font-mono-tabular font-semibold">
                            {count > 0 ? (
                              <span className="text-blue-700">{count} lệnh</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Tạo Ma trận & Đặc tả mới bằng AI hoặc Mẫu nhanh */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentHeader={doc.header}
        onOpenUploadExam={() => setIsUploadExamModalOpen(true)}
        onApplyDocument={(newDoc) => {
          setDoc(newDoc, { immediate: true });
          setActiveTab('editor');
          showToast(`Đã áp dụng nội dung mới: ${newDoc.title}`);
        }}
      />

      {/* Modal Tải đề thi có sẵn để AI phân tích và tự động sinh Ma trận & Đặc tả */}
      {isUploadExamModalOpen && (
        <UploadExamModal
          isOpen={isUploadExamModalOpen}
          onClose={() => setIsUploadExamModalOpen(false)}
          currentHeader={doc.header}
          onApplyDocument={(newDoc) => {
            setDoc(newDoc, { immediate: true });
            setActiveTab('editor');
            showToast(`AI đã phân tích đề thi và tạo thành công: ${newDoc.title}`);
          }}
        />
      )}

      {/* Modal Nhập Tên trường & Kỳ kiểm tra trước khi xuất Word (.docx) */}
      {isExportDocxModalOpen && (
        <ExportDocxModal
          isOpen={isExportDocxModalOpen}
          onClose={() => setIsExportDocxModalOpen(false)}
          currentDoc={doc}
          onExport={handleExportWordWithHeader}
          isExporting={isExportingDocx}
        />
      )}

      {/* Modal AI Bổ Sung Nội Dung Bài Kiểm Tra Vào Ma Trận & Bảng Đặc Tả */}
      {isAddContentModalOpen && (
        <AddExamContentModal
          isOpen={isAddContentModalOpen}
          onClose={() => setIsAddContentModalOpen(false)}
          currentTopics={doc.matrixTopics}
          currentSpec={doc.specification}
          onApplyAddedContent={(updatedTopics, updatedSpec, addedUnits, addedQuestions) => {
            setDoc((prev) => ({
              ...prev,
              matrixTopics: updatedTopics,
              specification: updatedSpec,
            }));
            showToast(
              `Đã bổ sung thành công ${addedUnits} nội dung và ${addedQuestions} câu hỏi mới vào Ma trận & Bảng đặc tả.`
            );
          }}
        />
      )}

      {/* Modal Tinh chỉnh Bảng đặc tả sát đề kiểm tra (AI Polish) */}
      {isRefineSpecModalOpen && (
        <RefineSpecModal
          isOpen={isRefineSpecModalOpen}
          onClose={() => setIsRefineSpecModalOpen(false)}
          specification={doc.specification}
          matrixTopics={doc.matrixTopics}
          onApplyRefinedSpec={(updatedSpec, updatedTopics) => {
            setDoc((prev) => ({
              ...prev,
              specification: updatedSpec,
              matrixTopics: updatedTopics,
            }));
            showToast('Đã tinh chỉnh toàn bộ các dòng YCCĐ trong Bảng đặc tả sát với chuẩn đề kiểm tra.');
          }}
        />
      )}

      {/* Modal Tra cứu & Chọn Yêu Cầu Cần Đạt (YCCD) Bộ GD&ĐT */}
      {isYccdModalOpen && (
        <YccdBrowserModal
          isOpen={isYccdModalOpen}
          onClose={() => setIsYccdModalOpen(false)}
          onInsertToSkills={handleInsertYccdToSkills}
          onInsertToMatrixAndSpec={handleInsertYccdToMatrixAndSpec}
          onSelectForAi={(selectedText) => {
            setIsAiModalOpen(true);
          }}
        />
      )}

      {/* Modal Đối chiếu trực tiếp từng Câu hỏi trong đề với dòng Đặc tả & Kiểm định mã MH */}
      {isQuestionMapperModalOpen && (
        <QuestionSpecMapperModal
          isOpen={isQuestionMapperModalOpen}
          onClose={() => setIsQuestionMapperModalOpen(false)}
          doc={doc}
          onApplyChanges={(updatedSpec, updatedTopics, updatedSourceQuestions, summaryMsg) => {
            setDoc((prev) => ({
              ...prev,
              specification: updatedSpec,
              matrixTopics: updatedTopics,
              sourceQuestions: updatedSourceQuestions,
            }));
            showToast(summaryMsg);
          }}
        />
      )}

      {/* Floating LocalStorage Auto-save Status Badge (Bottom Right Corner) */}
      <div
        className="no-print fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3.5 py-1.5 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md rounded-full text-xs text-slate-700 transition-all select-none hover:shadow-lg"
        data-testid="localstorage-save-badge"
        role="status"
        aria-live="polite"
      >
        {saveStatus === 'saving' ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
            <span className="font-medium text-slate-700">Đang lưu vào máy...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-700">
              Đã lưu bộ nhớ máy <span className="font-mono-tabular text-slate-500">({lastSavedTime})</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
