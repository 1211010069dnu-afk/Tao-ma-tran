import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Plus,
  Loader2,
  Zap,
  Info,
  CheckCircle2,
  Layers,
  HelpCircle,
  Key,
} from 'lucide-react';
import { MatrixTopic, SpecificationData } from '../types/exam';

interface AddExamContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopics: MatrixTopic[];
  currentSpec: SpecificationData;
  onApplyAddedContent: (
    updatedTopics: MatrixTopic[],
    updatedSpec: SpecificationData,
    addedUnitsCount: number,
    addedQuestionsCount: number
  ) => void;
}

const SAMPLE_CONTENTS = [
  {
    label: '+ Mệnh đề và Tập hợp',
    text: 'Mệnh đề; Tập hợp và các phép toán trên tập hợp (giao, hợp, hiệu, phần bù, các tập con của ℝ: khoảng, đoạn, nửa khoảng, biểu đồ Ven).',
  },
  {
    label: '+ BPT & Hệ BPT bậc nhất 2 ẩn',
    text: 'Bất phương trình và hệ bất phương trình bậc nhất hai ẩn, biểu diễn miền nghiệm và bài toán thực tiễn tối ưu F = ax + by.',
  },
  {
    label: '+ Hàm số bậc hai & Đồ thị',
    text: 'Hàm số và đồ thị; Hàm số bậc hai y = ax² + bx + c, tọa độ đỉnh, trục đối xứng, bảng biến thiên và bài toán thực tiễn cổng Parabol.',
  },
  {
    label: '+ Hệ thức lượng & Vectơ',
    text: 'Hệ thức lượng trong tam giác (định lí côsin, định lí sin, diện tích tam giác); Các phép toán vectơ và tích vô hướng của hai vectơ.',
  },
  {
    label: '+ Phương trình đường Elip',
    text: 'Phương trình chính tắc của elip: tìm tọa độ các tiêu điểm, các đỉnh, độ dài trục lớn, trục nhỏ, tâm sai và giải bài toán thực tiễn.',
  },
  {
    label: '+ Xác suất cổ điển & Biến cố',
    text: 'Không gian mẫu và biến cố, xác suất của biến cố trong mô hình cổ điển, sử dụng sơ đồ cây và quy tắc đếm.',
  },
];

export const AddExamContentModal: React.FC<AddExamContentModalProps> = ({
  isOpen,
  onClose,
  currentTopics,
  currentSpec,
  onApplyAddedContent,
}) => {
  const [contentText, setContentText] = useState('');
  const [targetTopicId, setTargetTopicId] = useState('new');
  const [tnCount, setTnCount] = useState(2);
  const [dsCount, setDsCount] = useState(1);
  const [tlnCount, setTlnCount] = useState(1);
  const [tlCount, setTlCount] = useState(0);
  const [speedMode, setSpeedMode] = useState<'fast' | 'deep'>('fast');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentText.trim()) {
      setErrorMsg('Vui lòng nhập nội dung bài kiểm tra hoặc đơn vị kiến thức cần bổ sung.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setStatusText('AI đang phân tích nội dung kiến thức và năng lực toán học...');

    try {
      const apiKey =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('user_gemini_api_key') || undefined
          : undefined;

      const response = await fetch('/api/append-exam-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentText: contentText.trim(),
          targetTopicId,
          currentTopics,
          currentSpec,
          counts: {
            tn: tnCount,
            ds: dsCount,
            tln: tlnCount,
            tl: tlCount,
          },
          apiKey,
          speedMode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Không thể bổ sung nội dung. Vui lòng thử lại.');
      }

      onApplyAddedContent(
        data.updatedTopics,
        data.updatedSpec,
        data.addedUnitsCount || 1,
        data.addedQuestionsCount || 0
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Đã xảy ra lỗi trong quá trình xử lý nội dung.');
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-exam-content-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-lg shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 id="add-exam-content-modal-title" className="text-base font-bold text-slate-900">
                AI Bổ Sung Nội Dung Bài Kiểm Tra Vào Ma Trận
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Nhập kiến thức trong đề kiểm tra để AI tự động phân loại mạch nội dung &amp; mã hoá năng lực (TD, GQ, MH).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Ô nhập nội dung bài kiểm tra */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="exam-content-input"
                className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                <span>Nội dung bài kiểm tra / Đơn vị kiến thức cần bổ sung:</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {contentText.length} ký tự
              </span>
            </div>

            <textarea
              id="exam-content-input"
              rows={4}
              required
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Nhập tên bài học, đơn vị kiến thức hoặc dán nội dung các câu hỏi bài kiểm tra...&#10;Ví dụ: Phương trình đường elip: lập phương trình chính tắc elip, xác định tiêu điểm, tiêu cự, tâm sai và giải bài toán chuyển động vệ tinh."
              className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white leading-relaxed font-sans"
            />

            {/* Quick content chips */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-medium mr-1">Mẫu gợi ý:</span>
              {SAMPLE_CONTENTS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setContentText(sample.text)}
                  className="px-2 py-0.5 text-[10px] rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vị trí thêm vào Ma trận (Topic Destination) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label
              htmlFor="target-topic-select"
              className="text-xs font-semibold text-slate-800 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Vị trí phân bổ trên Ma trận:</span>
            </label>
            <select
              id="target-topic-select"
              value={targetTopicId}
              onChange={(e) => setTargetTopicId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="new">✨ Tự động nhận diện &amp; Tạo Chủ đề lớn mới (Khuyên dùng)</option>
              {currentTopics.map((topic, idx) => (
                <option key={topic.id} value={topic.id}>
                  Gộp vào Chủ đề {idx + 1}: {topic.topicName} ({topic.units.length} nội dung)
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">
              Nội dung mới sẽ xuất hiện ở cột <strong>Nội dung</strong> của Ma trận và Bảng đặc tả, tự động đồng bộ hóa lệnh hỏi.
            </p>
          </div>

          {/* Số câu hỏi AI sinh kèm cho nội dung này */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Số câu hỏi AI sinh bổ sung cho nội dung này:</span>
              </span>
              <span className="text-[10px] text-slate-500">
                (Tự động tính điểm &amp; gắn mã GDPT 2018)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white p-2 border border-slate-200 rounded-md">
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                  Trắc nghiệm (TN 0.25đ)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={tnCount}
                  onChange={(e) => setTnCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-bold text-center"
                />
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-md">
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                  Đúng/Sai (ĐS 1.0đ)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={dsCount}
                  onChange={(e) => setDsCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-bold text-center"
                />
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-md">
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                  Trả lời ngắn (TLN 0.5đ)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={tlnCount}
                  onChange={(e) => setTlnCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-bold text-center"
                />
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-md">
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                  Tự luận (TL)
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={tlCount}
                  onChange={(e) => setTlCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* Tốc độ xử lý AI */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-medium">Chế độ phân tích:</span>
              <span className="text-[11px] font-semibold text-blue-700">
                {speedMode === 'fast' ? 'Siêu tốc (Thinking LOW)' : 'Chuyên sâu (Thinking MEDIUM)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSpeedMode(speedMode === 'fast' ? 'deep' : 'fast')}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline"
            >
              Đổi chế độ
            </button>
          </div>

          {/* Processing status banner */}
          {isProcessing && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2.5 text-xs text-blue-900">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              <span>{statusText || 'Đang bổ sung nội dung vào ma trận...'}</span>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isProcessing || !contentText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors shadow-xs"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang thêm vào ma trận...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  AI Phân tích &amp; Thêm vào Ma trận
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
