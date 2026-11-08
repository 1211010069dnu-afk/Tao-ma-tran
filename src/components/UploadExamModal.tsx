import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  FileCode,
  Wand2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Trash2,
  FileSpreadsheet,
  Key,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { ExamDocument } from '../types/exam';

interface UploadExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDocument: (doc: ExamDocument) => void;
  currentHeader: ExamDocument['header'];
}

const SAMPLE_EXAM_TEXT = `SỞ GD & ĐT ĐỒNG NAI
TRƯỜNG TH-THCS - THPT SONG NGỮ Á CHÂU
ĐỀ KIỂM TRA GIỮA HỌC KÌ II - NĂM HỌC 2025 - 2026
MÔN: TOÁN - KHỐI 10
Thời gian làm bài: 90 phút (không kể thời gian phát đề)

PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (Thí sinh trả lời từ câu 1 đến câu 12).
Câu 1: Biểu thức nào sau đây là một tam thức bậc hai?
A. f(x) = 2x^2 - 5x + 3.   B. f(x) = 3x - 1.   C. f(x) = x^3 - x.   D. f(x) = 1/x^2.
Câu 2: Cho tam thức bậc hai f(x) = ax^2 + bx + c (a khác 0) có biệt thức delta < 0. Định lí về dấu của tam thức bậc hai khẳng định:
A. f(x) cùng dấu với hệ số a với mọi x thuộc R.   B. f(x) trái dấu với hệ số a.   C. f(x) = 0 có hai nghiệm.   D. f(x) luôn âm.
Câu 3: Quan sát đồ thị hàm số bậc hai y = f(x) có nhánh nằm phía trên trục hoành trong khoảng (1; 4). Khi đó dấu của tam thức bậc hai f(x) trên khoảng (1; 4) là:
A. f(x) > 0.   B. f(x) < 0.   C. f(x) = 0.   D. f(x) <= 0.
Câu 4: Cho tam thức bậc hai f(x) = x^2 - 4x + 3. Bảng xét dấu của tam thức bậc hai có f(x) mang dấu âm trên khoảng nào?
A. (1; 3).   B. (-vô cùng; 1).   C. (3; +vô cùng).   D. (-1; 3).
Câu 5: Dựa vào bảng xét dấu của tam thức bậc hai f(x) = -x^2 + 5x - 6, tập nghiệm của bất phương trình bậc hai f(x) >= 0 là:
A. [2; 3].   B. (2; 3).   C. (-vô cùng; 2] hợp [3; +vô cùng).   D. [-3; -2].
Câu 6: Tập nghiệm của bất phương trình bậc hai x^2 - 3x - 4 < 0 là:
A. (-1; 4).   B. [-1; 4].   C. (1; 4).   D. (-vô cùng; -1) hợp (4; +vô cùng).
Câu 7: Một công việc được hoàn thành bởi một trong hai hành động A (có m cách) hoặc B (có n cách) không trùng nhau. Theo qui tắc cộng, số cách thực hiện công việc là:
A. m + n.   B. m . n.   C. m^n.   D. m - n.
Câu 8: Một tổ có 6 học sinh nam và 4 học sinh nữ. Sử dụng qui tắc cộng hoặc qui tắc nhân, số cách chọn 1 học sinh làm tổ trưởng là:
A. 10.   B. 24.   C. 6.   D. 4.
Câu 9: Cho ba tình huống đếm đơn giản: A là số cách chọn 1 quyển sách từ 5 sách Toán và 4 sách Lý; B là số cách chọn 1 bộ quần áo từ 3 áo và 4 quần; C là số cách chọn 1 bút từ 8 cái bút. Sắp xếp theo thứ tự tăng dần số khả năng sử dụng qui tắc cộng và qui tắc nhân:
A. C, A, B.   B. A, B, C.   C. B, A, C.   D. C, B, A.
Câu 10: Phương trình nào sau đây là phương trình đường tròn trong mặt phẳng tọa độ Oxy?
A. (x - 1)^2 + (y + 2)^2 = 9.   B. x^2 + 2y^2 = 4.   C. x^2 - y^2 = 1.   D. x^2 + y^2 + 2x + 4y + 10 = 0.
Câu 11: Trong mặt phẳng Oxy, tâm và bán kính đường tròn (C): (x - 3)^2 + (y + 1)^2 = 16 là:
A. Tâm I(3; -1), bán kính R = 4.   B. Tâm I(-3; 1), R = 4.   C. Tâm I(3; -1), R = 16.   D. Tâm I(-3; 1), R = 16.
Câu 12: Phương trình đường tròn có tâm I(2; -3) và bán kính R = 5 là:
A. (x - 2)^2 + (y + 3)^2 = 25.   B. (x + 2)^2 + (y - 3)^2 = 25.   C. (x - 2)^2 + (y + 3)^2 = 5.   D. (x - 2)^2 + (y - 3)^2 = 25.

PHẦN II. Câu trắc nghiệm đúng sai (Thí sinh trả lời từ câu 1 đến câu 4).
Câu 1: Cho phương trình chứa căn thức căn bậc hai của (2x^2 - 3x + 1) = x - 1.
a) Giá trị x = 0 không phải là nghiệm của phương trình đã cho.
b) Khi tiến hành bình phương hai vế phương trình, ta viết lại được phương trình 2x^2 - 3x + 1 = (x - 1)^2.
c) Sắp xếp và rút gọn phương trình đã biến đổi ta được phương trình bậc hai x^2 - x = 0.
d) Phương trình đã cho có đúng một nghiệm là x = 1.

Câu 2: Một tổ học sinh có 10 người gồm 6 nam và 4 nữ.
a) Mỗi cách sắp xếp 10 học sinh thành một hàng dọc là một hoán vị của 10 phần tử.
b) Mỗi cách chọn 3 học sinh bất kỳ trong 10 học sinh đi trực nhật là một tổ hợp chập 3 của 10 phần tử.
c) Số tổ hợp chập 3 của 10 phần tử bằng 120.
d) Số cách chọn 3 học sinh làm Lớp trưởng, Lớp phó và Bí thư (vận dụng chỉnh hợp) là 720 cách.

Câu 3: Trong mặt phẳng tọa độ Oxy, cho hai điểm A(1; 2), B(4; 6) và vectơ u = (2; -1).
a) Tọa độ của điểm A đối với hệ trục tọa độ Oxy là (1; 2).
b) Tọa độ của vectơ AB là (3; 4) và độ dài vectơ AB bằng 5.
c) Tọa độ của vectơ tổng AB + u là (5; 3).
d) Với điểm C(5; -1), áp dụng phương pháp tọa độ vào bài toán giải tam giác ABC ta tính được chu vi và góc của tam giác.

Câu 4: Trong mặt phẳng tọa độ Oxy, cho đường thẳng d: 3x - 4y + 5 = 0 và điểm M(1; -2).
a) Một vectơ pháp tuyến (VTPT) của đường thẳng d là n = (3; -4).
b) Thay tọa độ điểm M vào phương trình đường thẳng d thấy điểm M không thuộc đường thẳng d.
c) Khoảng cách từ điểm M(1; -2) đến đường thẳng d bằng 16/5.
d) Vận dụng phương trình đường thẳng để tìm vị trí trạm phát sóng trên đường thẳng d sao cho khoảng cách đến khu dân cư M là ngắn nhất.

PHẦN III. Câu trắc nghiệm trả lời ngắn (Thí sinh trả lời từ câu 1 đến câu 6).
Câu 1: Giải bất phương trình bậc hai x^2 - 6x + 5 <= 0 và cho biết có bao nhiêu nghiệm nguyên?
Câu 2: Giải bài toán thực tiễn qui về phương trình chứa căn thức căn bậc hai của (x^2 + 12) = x + 2. Tìm giá trị của x.
Câu 3: Trong một giải thể thao có 4 đội bóng thi đấu theo thể thức loại trực tiếp. Vận dụng sơ đồ hình cây trong bài toán đếm, hãy tính tổng số trận đấu của giải.
Câu 4: Vận dụng khái niệm hoán vị, chỉnh hợp, tổ hợp giải quyết bài toán thực tế: Có bao nhiêu cách chọn một ban đại diện gồm 4 người từ 12 ứng cử viên?
Câu 5: Vận dụng kiến thức về phương trình đường thẳng để giải bài toán thực tiễn: Tính khoảng cách ngắn nhất (km) từ một tàu biển tại tọa độ A(2; 1) đến bờ biển chạy dọc theo đường thẳng 4x + 3y + 4 = 0.
Câu 6: Trong mặt phẳng Oxy, thiết lập phương trình đường tròn (C) tâm I(1; 2) đi qua A(4; 6) và viết phương trình tiếp tuyến của đường tròn tại tiếp điểm A.`;

export const UploadExamModal: React.FC<UploadExamModalProps> = ({
  isOpen,
  onClose,
  onApplyDocument,
  currentHeader,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [examText, setExamText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [gradeHint, setGradeHint] = useState<string>('auto');
  const [examNameHint, setExamNameHint] = useState<string>('');
  const [durationHint, setDurationHint] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

  // Gemini API Key state with LocalStorage persistence
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('user_gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('user_gemini_api_key'));
    } catch {
      return false;
    }
  });
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [speedMode, setSpeedMode] = useState<'fast' | 'deep'>('fast');

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    try {
      if (val.trim()) {
        localStorage.setItem('user_gemini_api_key', val.trim());
      } else {
        localStorage.removeItem('user_gemini_api_key');
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMsg(null);

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1] || '';
      setFileBase64(base64Data);
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc tệp tin. Vui lòng chọn lại.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileBase64('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSampleExam = () => {
    setActiveTab('paste');
    setExamText(SAMPLE_EXAM_TEXT);
    setGradeHint('10');
    setExamNameHint('KIỂM TRA GIỮA HỌC KÌ II');
    setDurationHint('90 phút');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const hasFile = Boolean(selectedFile && fileBase64);
    const hasText = Boolean(examText.trim());

    if (!hasFile && !hasText) {
      setErrorMsg('Vui lòng chọn tệp đề thi (.docx, .pdf, .txt) hoặc dán nội dung đề kiểm tra.');
      return;
    }

    setIsProcessing(true);
    setStatusStep(
      speedMode === 'fast'
        ? 'AI đang phân tích siêu tốc theo chuẩn GDPT 2018 (3–5s)...'
        : 'AI đang phân tích chuyên sâu các câu hỏi và năng lực...'
    );

    try {
      setTimeout(() => {
        setStatusStep('Đang đồng bộ hóa Ma trận & Bảng đặc tả chuẩn GDPT 2018...');
      }, 1500);

      const response = await fetch('/api/generate-from-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examText,
          fileBase64: hasFile ? fileBase64 : undefined,
          fileMimeType: selectedFile?.type,
          fileName: selectedFile?.name,
          gradeHint: gradeHint !== 'auto' ? gradeHint : undefined,
          examNameHint: examNameHint.trim() || undefined,
          durationHint: durationHint.trim() || undefined,
          department: currentHeader.department,
          school: currentHeader.school,
          schoolYear: currentHeader.gradeAndYear.match(/\d{4}\s*[-–]\s*\d{4}/)?.[0] || '2025 – 2026',
          apiKey: apiKey.trim() || undefined,
          speedMode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Không thể xử lý đề thi. Vui lòng thử lại.');
      }

      if (data.warning) {
        setQuotaWarning(data.warning);
      }

      onApplyDocument(data.document);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi trong quá trình phân tích đề thi.');
    } finally {
      setIsProcessing(false);
      setStatusStep('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-exam-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                <Wand2 className="w-4 h-4" />
              </span>
              <h2 id="upload-exam-modal-title" className="text-base font-bold text-slate-900">
                AI Phân Tích Đề Thi → Tự Động Sinh Ma Trận & Bảng Đặc Tả
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Tải lên file đề thi môn Toán có sẵn hoặc dán nội dung. AI sẽ tự động phân loại cấu trúc, nhận diện mạch kiến thức và mã hóa 3 năng lực (TD, GQ, MH) theo chuẩn GDPT 2018.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ tải đề thi"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Key Status & Input Banner */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`flex h-2 w-2 rounded-full ${apiKey.trim() ? 'bg-blue-600' : 'bg-emerald-500'} animate-pulse`} />
              <span className="font-semibold text-slate-800">
                {apiKey.trim() ? 'API Key cá nhân:' : 'Kết nối Gemini AI:'}
              </span>
              <span className="text-slate-600">
                {apiKey.trim()
                  ? 'Đang kích hoạt bằng API Key riêng (Không giới hạn hạn ngạch)'
                  : 'Đã cấu hình tự động qua Server (Miễn phí 20 lượt/ngày)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-blue-700 hover:text-blue-800 hover:underline font-medium flex items-center gap-1 text-[11px] self-start sm:self-auto"
            >
              <Key className="w-3 h-3" />
              {showApiKeyInput ? 'Ẩn cấu hình API Key' : (apiKey.trim() ? 'Đổi API Key' : 'Nhập API Key cá nhân')}
            </button>
          </div>

          {showApiKeyInput && (
            <div className="mt-2.5 p-3 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="custom-api-key" className="font-semibold text-slate-700 text-[11px]">
                  Gemini API Key cá nhân (Tùy chọn - Lưu tự động trên máy của bạn):
                </label>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                >
                  Lấy Key miễn phí tại Google AI Studio
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="custom-api-key"
                    type={isKeyVisible ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="Dán mã API Key của bạn (bắt đầu bằng AIzaSy...)"
                    className="w-full px-3 py-1.5 pr-8 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setIsKeyVisible(!isKeyVisible)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={isKeyVisible ? 'Ẩn key' : 'Xem key'}
                  >
                    {isKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {apiKey.trim() && (
                  <button
                    type="button"
                    onClick={() => handleApiKeyChange('')}
                    className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Lưu ý: API Key được lưu an toàn trong trình duyệt (LocalStorage) của bạn và gửi đến máy chủ xử lý, giúp tránh lỗi vượt quá hạn ngạch (429 Quota Exceeded) khi tạo nhiều đề liên tục.
              </p>
            </div>
          )}

          {quotaWarning && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{quotaWarning}</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Method Selection Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Tải tệp đề thi (.docx, .pdf, .txt)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'paste'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Dán văn bản đề kiểm tra
              </button>
            </div>

            <button
              type="button"
              onClick={handleLoadSampleExam}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Nạp đề mẫu thử nghiệm
            </button>
          </div>

          {/* Tab 1: File Upload */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc,.pdf,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
                id="exam-file-input"
              />

              {!selectedFile ? (
                <label
                  htmlFor="exam-file-input"
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer group text-center"
                >
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    Bấm để chọn tệp hoặc kéo thả tệp đề thi vào đây
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Định dạng hỗ trợ: Microsoft Word (<strong>.docx</strong>), PDF (<strong>.pdf</strong>) hoặc Văn bản (<strong>.txt</strong>)
                  </p>
                  <span className="mt-3 px-3 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-100">
                    Dung lượng tối đa: 25 MB
                  </span>
                </label>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {selectedFile.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB · Sẵn sàng để AI phân tích
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa tệp đã chọn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Paste Raw Exam Text */}
          {activeTab === 'paste' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="exam-text-area" className="text-xs font-medium text-slate-700">
                  Nội dung đề kiểm tra (Bao gồm các phần TN, Đúng/Sai, Trả lời ngắn, Tự luận):
                </label>
                <span className="text-[11px] text-slate-500">
                  {examText.length} ký tự
                </span>
              </div>
              <textarea
                id="exam-text-area"
                rows={8}
                value={examText}
                onChange={(e) => setExamText(e.target.value)}
                placeholder="Dán toàn bộ nội dung đề kiểm tra môn Toán vào đây..."
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-mono leading-relaxed"
              />
            </div>
          )}

          {/* Optional Hints & Overrides */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Tùy chỉnh nhận diện (Tùy chọn):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="modal-grade-hint" className="block text-[11px] text-slate-600 mb-1">
                  Khối lớp:
                </label>
                <select
                  id="modal-grade-hint"
                  value={gradeHint}
                  onChange={(e) => setGradeHint(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white font-medium"
                >
                  <option value="auto">Tự động nhận diện</option>
                  <option value="6">Khối 6 (THCS)</option>
                  <option value="7">Khối 7 (THCS)</option>
                  <option value="8">Khối 8 (THCS)</option>
                  <option value="9">Khối 9 (THCS)</option>
                  <option value="10">Khối 10 (THPT)</option>
                  <option value="11">Khối 11 (THPT)</option>
                  <option value="12">Khối 12 (THPT)</option>
                </select>
              </div>

              <div>
                <label htmlFor="modal-exam-name-hint" className="block text-[11px] text-slate-600 mb-1">
                  Tên kỳ kiểm tra:
                </label>
                <input
                  id="modal-exam-name-hint"
                  type="text"
                  placeholder="VD: KIỂM TRA GIỮA HỌC KÌ II"
                  value={examNameHint}
                  onChange={(e) => setExamNameHint(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label htmlFor="modal-duration-hint" className="block text-[11px] text-slate-600 mb-1">
                  Thời gian làm bài:
                </label>
                <input
                  id="modal-duration-hint"
                  type="text"
                  placeholder="VD: 90 phút"
                  value={durationHint}
                  onChange={(e) => setDurationHint(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
            </div>

            {/* AI Speed & Precision Mode */}
            <div className="pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-700">Tốc độ &amp; Độ chính xác AI:</span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  {speedMode === 'fast'
                    ? '(Thinking LOW – Phân tích nhanh gấp 3-5 lần, chuẩn GDPT 2018)'
                    : '(Thinking MEDIUM – Suy luận đa bước chi tiết)'}
                </span>
              </div>
              <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSpeedMode('fast')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    speedMode === 'fast'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  Siêu tốc (3–5s)
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedMode('deep')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    speedMode === 'deep'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chuyên sâu
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              <div>
                <h5 className="text-xs font-semibold text-blue-900">Đang phân tích đề thi...</h5>
                <p className="text-[11px] text-blue-700">{statusStep}</p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors shadow-xs"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang phân tích đề thi...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Phân tích đề thi &amp; Sinh Ma trận chuẩn
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
