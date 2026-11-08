import React, { useState } from 'react';
import { X, Wand2, Loader2, CheckCircle2, BookOpen, AlertCircle, Sparkles, Layers, UploadCloud } from 'lucide-react';
import { ExamDocument } from '../types/exam';
import { PRESET_TEMPLATES } from '../data/sampleToan10';
import { YccdBrowserModal } from './YccdBrowserModal';
import { MathGrade } from '../data/yccdDatabase';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDocument: (doc: ExamDocument) => void;
  currentHeader: ExamDocument['header'];
  onOpenUploadExam?: () => void;
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyDocument,
  currentHeader,
  onOpenUploadExam,
}) => {
  const [grade, setGrade] = useState<MathGrade>('10');
  const [examName, setExamName] = useState('KIỂM TRA CUỐI HỌC KÌ II');
  const [schoolYear, setSchoolYear] = useState('2025 – 2026');
  const [duration, setDuration] = useState('90 phút');
  const [topicsInput, setTopicsInput] = useState(
    '1. Đại số tổ hợp: Quy tắc đếm, Hoán vị - Chỉnh hợp - Tổ hợp, Nhị thức Newton\n2. Phương pháp tọa độ trong mặt phẳng: Đường thẳng, Đường tròn, Ba đường conic\n3. Xác suất: Không gian mẫu và biến cố, Xác suất của biến cố'
  );
  const [tnCount, setTnCount] = useState(12);
  const [dsCount, setDsCount] = useState(4);
  const [tlnCount, setTlnCount] = useState(4);
  const [tlCount, setTlCount] = useState(1);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isYccdModalOpen, setIsYccdModalOpen] = useState(false);

  if (!isOpen) return null;

  const estimatedScore =
    tnCount * 0.25 + dsCount * 1.0 + tlnCount * 0.5 + tlCount * 1.0;

  const handleGenerateByAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicsInput.trim()) {
      setErrorMsg('Vui lòng nhập ít nhất một chủ đề hoặc nội dung kiến thức môn Toán.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: currentHeader.department,
          school: currentHeader.school,
          grade,
          examName,
          schoolYear,
          duration,
          topicsInput,
          tnCount,
          dsCount,
          tlnCount,
          tlCount,
          apiKey: (typeof localStorage !== 'undefined' ? localStorage.getItem('user_gemini_api_key') : null) || undefined,
          speedMode: 'fast',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Không thể sinh Ma trận & Đặc tả. Vui lòng thử lại.');
      }

      onApplyDocument(data.document);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi kết nối máy chủ.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 id="ai-modal-title" className="text-base font-bold text-slate-900">
              Tạo Ma Trận & Bảng Đặc Tả Mới Theo Mẫu Chuẩn
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Giữ nguyên 100% khung biểu mẫu, màu sắc và 3 năng lực Toán học (TD, GQ, MH) — chỉ thay đổi nội dung kiến thức.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ tạo đề mới"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Presets Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              1. Chọn nhanh từ Kho Mẫu Chuẩn Chương Trình GDPT 2018:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {PRESET_TEMPLATES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onApplyDocument(structuredClone(preset));
                    onClose();
                  }}
                  className="text-left p-3 rounded-lg border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 transition-colors flex flex-col justify-between gap-2 group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{preset.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {preset.matrixTopics.map((t) => t.topicName).join(' · ')}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-blue-700">
                    Nạp mẫu này →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {onOpenUploadExam && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Bạn đã có sẵn tệp đề kiểm tra môn Toán?
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Tải tệp (.docx, .pdf, .txt) hoặc dán đề để AI bóc tách từng câu hỏi, tự động lập Ma trận &amp; Bảng đặc tả.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUploadExam();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shrink-0 shadow-xs"
              >
                Tải đề thi lên →
              </button>
            </div>
          )}

          <div className="border-t border-slate-200 pt-5">
            <form onSubmit={handleGenerateByAi} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  2. Hoặc nhập Chủ đề mới để AI tự động biên soạn Ma trận & Bảng đặc tả:
                </label>
                <span className="text-xs font-mono-tabular text-slate-600">
                  Tổng điểm cấu hình:{' '}
                  <strong
                    className={
                      Math.abs(estimatedScore - 10) < 0.01
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }
                  >
                    {estimatedScore.toFixed(2).replace('.', ',')} / 10,00 điểm
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label
                    htmlFor="select-grade"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Khối lớp
                  </label>
                  <select
                    id="select-grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as MathGrade)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="6">Khối 6 (THCS)</option>
                    <option value="7">Khối 7 (THCS)</option>
                    <option value="8">Khối 8 (THCS)</option>
                    <option value="9">Khối 9 (THCS)</option>
                    <option value="10">Khối 10 (THPT)</option>
                    <option value="11">Khối 11 (THPT)</option>
                    <option value="12">Khối 12 (THPT)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label
                    htmlFor="input-exam-name"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Tên kỳ kiểm tra
                  </label>
                  <input
                    id="input-exam-name"
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="input-duration"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Thời gian
                  </label>
                  <input
                    id="input-duration"
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Question Counts per Format */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label
                    htmlFor="count-tn"
                    className="block text-[11px] font-medium text-slate-700 mb-1"
                  >
                    1. Số câu TN (0,25đ/câu)
                  </label>
                  <input
                    id="count-tn"
                    type="number"
                    min={0}
                    max={40}
                    value={tnCount}
                    onChange={(e) => setTnCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1 text-xs font-mono-tabular border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="count-ds"
                    className="block text-[11px] font-medium text-slate-700 mb-1"
                  >
                    2. Số câu Đúng/Sai (1đ/câu)
                  </label>
                  <input
                    id="count-ds"
                    type="number"
                    min={0}
                    max={10}
                    value={dsCount}
                    onChange={(e) => setDsCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1 text-xs font-mono-tabular border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="count-tln"
                    className="block text-[11px] font-medium text-slate-700 mb-1"
                  >
                    3. Số câu TLN (0,5đ/câu)
                  </label>
                  <input
                    id="count-tln"
                    type="number"
                    min={0}
                    max={20}
                    value={tlnCount}
                    onChange={(e) => setTlnCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1 text-xs font-mono-tabular border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="count-tl"
                    className="block text-[11px] font-medium text-slate-700 mb-1"
                  >
                    4. Số câu Tự luận (1đ/câu)
                  </label>
                  <input
                    id="count-tl"
                    type="number"
                    min={0}
                    max={10}
                    value={tlCount}
                    onChange={(e) => setTlCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1 text-xs font-mono-tabular border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              {/* Topics Textarea */}
              <div>
                {/* YCCD Quick Browser Banner */}
                <div className="mb-2.5 p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-600 text-white rounded-md shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-950">
                          Chọn nội dung từ Ngân hàng YCCD (Bộ GD&ĐT)
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-200 text-blue-900 rounded">
                          Lớp 6 – 12
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-800">
                        Phân chia theo từng khối lớp và mạch kiến thức giúp tìm kiếm và đưa vào ma trận nhanh chóng.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsYccdModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-xs transition-colors shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Tra cứu & Chọn YCCD
                  </button>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="topics-input"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Danh sách Chủ đề và Nội dung kiến thức cần kiểm tra
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setGrade('10');
                        setTopicsInput(
                          '1. Đại số tổ hợp: Quy tắc cộng và quy tắc nhân, Hoán vị - Chỉnh hợp - Tổ hợp, Nhị thức Newton\n2. Phương pháp tọa độ trong mặt phẳng: Tọa độ của vectơ, Đường thẳng trong mặt phẳng tọa độ, Đường tròn và Ba đường conic\n3. Xác suất: Không gian mẫu và biến cố, Xác suất của biến cố'
                        );
                      }}
                      className="text-blue-700 hover:underline"
                    >
                      Gợi ý Toán 10 HK2
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setGrade('11');
                        setTopicsInput(
                          '1. Hàm số mũ và hàm số lôgarit: Phép tính lũy thừa, Phép tính lôgarit, Hàm số mũ và lôgarit, Phương trình và bất phương trình mũ - lôgarit\n2. Đạo hàm: Định nghĩa và ý nghĩa đạo hàm, Các quy tắc tính đạo hàm\n3. Quan hệ vuông góc trong không gian: Hai đường thẳng vuông góc, Đường thẳng vuông góc với mặt phẳng, Hai mặt phẳng vuông góc, Khoảng cách trong không gian'
                        );
                      }}
                      className="text-blue-700 hover:underline"
                    >
                      Gợi ý Toán 11 HK2
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setGrade('12');
                        setTopicsInput(
                          '1. Nguyên hàm và Tích phân: Nguyên hàm, Tích phân, Ứng dụng hình học của tích phân tính diện tích và thể tích\n2. Phương pháp tọa độ trong không gian Oxyz: Phương trình mặt phẳng, Phương trình đường thẳng trong không gian, Phương trình mặt cầu\n3. Xác suất có điều kiện: Xác suất có điều kiện, Công thức xác suất toàn phần và công thức Bayes'
                        );
                      }}
                      className="text-blue-700 hover:underline"
                    >
                      Gợi ý Toán 12 HK2
                    </button>
                  </div>
                </div>
                <textarea
                  id="topics-input"
                  rows={4}
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  placeholder="Nhập các chương/chủ đề và bài học môn Toán..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 leading-relaxed"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang biên soạn Ma trận & Bảng đặc tả...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Sinh Ma trận & Bảng đặc tả bằng AI
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isYccdModalOpen && (
        <YccdBrowserModal
          isOpen={isYccdModalOpen}
          onClose={() => setIsYccdModalOpen(false)}
          initialGrade={grade}
          onSelectForAi={(selectedText, detectedGrade) => {
            setTopicsInput(selectedText);
            if (detectedGrade) {
              setGrade(detectedGrade);
            }
          }}
        />
      )}
    </div>
  );
};
