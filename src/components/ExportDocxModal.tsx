import React, { useState, useEffect } from 'react';
import {
  X,
  FileDown,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Sparkles,
  School,
  SlidersHorizontal,
} from 'lucide-react';
import { ExamDocument } from '../types/exam';

interface ExportDocxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDoc: ExamDocument;
  onExport: (
    updatedHeader: ExamDocument['header'],
    updatedDuration: string,
    syncToDoc: boolean
  ) => Promise<void>;
  isExporting: boolean;
}

const COMMON_EXAMS = [
  'KIỂM TRA GIỮA HỌC KÌ I',
  'KIỂM TRA CUỐI HỌC KÌ I',
  'KIỂM TRA GIỮA HỌC KÌ II',
  'KIỂM TRA CUỐI HỌC KÌ II',
  'KHẢO SÁT CHẤT LƯỢNG ĐẦU NĂM',
  'THI THỬ TỐT NGHIỆP THPT',
];

export const ExportDocxModal: React.FC<ExportDocxModalProps> = ({
  isOpen,
  onClose,
  currentDoc,
  onExport,
  isExporting,
}) => {
  const [school, setSchool] = useState(currentDoc.header.school);
  const [examName, setExamName] = useState(currentDoc.header.examName);
  const [department, setDepartment] = useState(currentDoc.header.department);
  const [examTitle, setExamTitle] = useState(currentDoc.header.examTitle);
  const [gradeAndYear, setGradeAndYear] = useState(currentDoc.header.gradeAndYear);
  const [durationText, setDurationText] = useState(currentDoc.format.durationText);
  const [syncToDoc, setSyncToDoc] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state whenever modal opens or currentDoc changes
  useEffect(() => {
    if (isOpen) {
      setSchool(currentDoc.header.school || '');
      setExamName(currentDoc.header.examName || '');
      setDepartment(currentDoc.header.department || '');
      setExamTitle(currentDoc.header.examTitle || 'THIẾT KẾ ĐỀ');
      setGradeAndYear(currentDoc.header.gradeAndYear || '');
      setDurationText(currentDoc.format.durationText || '90 phút');
      setErrorMsg(null);
    }
  }, [isOpen, currentDoc]);

  if (!isOpen) return null;

  const handleUpperSchool = () => {
    setSchool((prev) => prev.toUpperCase());
  };

  const handleUpperExamName = () => {
    setExamName((prev) => prev.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school.trim()) {
      setErrorMsg('Vui lòng nhập Tên trường học.');
      return;
    }
    if (!examName.trim()) {
      setErrorMsg('Vui lòng nhập Tên kỳ kiểm tra.');
      return;
    }

    setErrorMsg(null);
    try {
      const updatedHeader: ExamDocument['header'] = {
        ...currentDoc.header,
        school: school.trim(),
        examName: examName.trim(),
        department: department.trim() || currentDoc.header.department,
        examTitle: examTitle.trim() || 'THIẾT KẾ ĐỀ',
        gradeAndYear: gradeAndYear.trim() || currentDoc.header.gradeAndYear,
      };

      await onExport(updatedHeader, durationText.trim() || currentDoc.format.durationText, syncToDoc);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi khi tạo tệp Word.');
    }
  };

  // Build live filename preview
  const safeExam = examName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/gi, '');
  const safeSchool = school
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/gi, '');
  const previewFileName = `MaTran_DacTa_Toan_${safeExam || 'KiemTra'}${safeSchool ? '_' + safeSchool : ''}.docx`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-docx-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-700 text-white rounded-lg shadow-2xs">
              <FileDown className="w-5 h-5" />
            </span>
            <div>
              <h2 id="export-docx-modal-title" className="text-base font-bold text-slate-900">
                Xuất File Word (.docx) — Ma Trận &amp; Bảng Đặc Tả
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập tên trường và kỳ kiểm tra để in hoa chuẩn biểu mẫu Bộ GD&amp;ĐT trước khi tải về.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Fields: Trường & Kỳ kiểm tra */}
          <div className="grid grid-cols-1 gap-4">
            {/* School Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="export-school" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-700" />
                  <span>Tên trường / Cơ quan giáo dục:</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleUpperSchool}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  VIẾT HOA
                </button>
              </div>
              <input
                id="export-school"
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="VD: TRƯỜNG TH-THCS - THPT SONG NGỮ Á CHÂU"
                className="w-full px-3 py-2 text-xs font-semibold uppercase border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />
            </div>

            {/* Exam Period / Exam Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="export-exam-name" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-700" />
                  <span>Kỳ kiểm tra / Bài khảo sát:</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleUpperExamName}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  VIẾT HOA
                </button>
              </div>
              <input
                id="export-exam-name"
                type="text"
                required
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="VD: KIỂM TRA GIỮA HỌC KÌ II"
                className="w-full px-3 py-2 text-xs font-semibold uppercase border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />

              {/* Quick Exam Chips */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-medium mr-1">Chọn nhanh:</span>
                {COMMON_EXAMS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setExamName(item)}
                    className={`px-2 py-0.5 text-[10px] rounded-md border transition-colors ${
                      examName.trim().toUpperCase() === item
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Details Collapsible / Grid */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-2">
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              <span>Thông tin bổ sung văn bản (Tùy chọn):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="export-department" className="block text-[11px] text-slate-600 mb-1">
                  Sở GD &amp; ĐT:
                </label>
                <input
                  id="export-department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="VD: SỞ GD & ĐT ĐỒNG NAI"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label htmlFor="export-grade-year" className="block text-[11px] text-slate-600 mb-1">
                  Khối &amp; Năm học:
                </label>
                <input
                  id="export-grade-year"
                  type="text"
                  value={gradeAndYear}
                  onChange={(e) => setGradeAndYear(e.target.value)}
                  placeholder="VD: KHỐI 10 – NĂM HỌC: 2025 – 2026"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label htmlFor="export-duration" className="block text-[11px] text-slate-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Thời gian làm bài:</span>
                </label>
                <input
                  id="export-duration"
                  type="text"
                  value={durationText}
                  onChange={(e) => setDurationText(e.target.value)}
                  placeholder="VD: 90 phút"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Live Document Header Preview */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Xem trước tiêu đề trong file Word:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Font: Times New Roman</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded text-center grid grid-cols-2 gap-2 text-[11.5px] leading-tight font-serif select-none">
              <div className="border-r border-slate-100 pr-2">
                <p className="uppercase text-slate-700">{department || 'SỞ GD & ĐT ...'}</p>
                <p className="font-bold uppercase text-slate-900 mt-0.5">{school || 'TÊN TRƯỜNG ...'}</p>
                <div className="w-16 mx-auto border-b border-black my-1" />
              </div>
              <div className="pl-2">
                <p className="font-bold uppercase text-slate-900">{examTitle || 'THIẾT KẾ ĐỀ'}</p>
                <p className="font-bold uppercase text-blue-900 mt-0.5">{examName || 'KỲ KIỂM TRA ...'}</p>
                <p className="font-bold uppercase text-slate-700 mt-0.5">{gradeAndYear || 'NĂM HỌC ...'}</p>
                <p className="font-bold text-slate-800 mt-0.5">{currentDoc.header.subject}</p>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
              <span className="font-semibold text-slate-700">Tên tệp tải về:</span>
              <span className="font-mono text-blue-700 text-[10.5px]">{previewFileName}</span>
            </div>
          </div>

          {/* Sync Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="export-sync-doc"
              type="checkbox"
              checked={syncToDoc}
              onChange={(e) => setSyncToDoc(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="export-sync-doc" className="text-xs text-slate-700 cursor-pointer">
              Đồng thời cập nhật thông tin tên trường và kỳ kiểm tra này vào tài liệu hiện tại trên màn hình
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isExporting || !school.trim() || !examName.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors shadow-xs"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo file Word (.docx)...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Tải file Word (.docx)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
