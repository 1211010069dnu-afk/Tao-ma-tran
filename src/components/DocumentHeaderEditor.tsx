import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormatInfo, HeaderInfo, ObjectivesInfo } from '../types/exam';

interface DocumentHeaderEditorProps {
  header: HeaderInfo;
  objectives: ObjectivesInfo;
  format: FormatInfo;
  readOnly?: boolean;
  onChangeHeader: (header: HeaderInfo) => void;
  onChangeObjectives: (objectives: ObjectivesInfo) => void;
  onChangeFormat: (format: FormatInfo) => void;
}

export const DocumentHeaderEditor: React.FC<DocumentHeaderEditorProps> = ({
  header,
  objectives,
  format,
  readOnly = false,
  onChangeHeader,
  onChangeObjectives,
  onChangeFormat,
}) => {
  const updateKnowledgeTitle = (id: string, title: string) => {
    onChangeObjectives({
      ...objectives,
      knowledgeSections: objectives.knowledgeSections.map((ks) =>
        ks.id === id ? { ...ks, title } : ks
      ),
    });
  };

  const updateKnowledgeBullet = (ksId: string, bIdx: number, val: string) => {
    onChangeObjectives({
      ...objectives,
      knowledgeSections: objectives.knowledgeSections.map((ks) =>
        ks.id === ksId
          ? {
              ...ks,
              bullets: ks.bullets.map((b, i) => (i === bIdx ? val : b)),
            }
          : ks
      ),
    });
  };

  const addKnowledgeBullet = (ksId: string) => {
    onChangeObjectives({
      ...objectives,
      knowledgeSections: objectives.knowledgeSections.map((ks) =>
        ks.id === ksId
          ? { ...ks, bullets: [...ks.bullets, 'Nội dung kiến thức mới'] }
          : ks
      ),
    });
  };

  const removeKnowledgeBullet = (ksId: string, bIdx: number) => {
    onChangeObjectives({
      ...objectives,
      knowledgeSections: objectives.knowledgeSections.map((ks) =>
        ks.id === ksId
          ? { ...ks, bullets: ks.bullets.filter((_, i) => i !== bIdx) }
          : ks
      ),
    });
  };

  const addKnowledgeSection = () => {
    onChangeObjectives({
      ...objectives,
      knowledgeSections: [
        ...objectives.knowledgeSections,
        {
          id: `ks-${Date.now()}`,
          title: 'Phần Thống kê và Xác suất',
          bullets: ['Nội dung kiến thức 1'],
        },
      ],
    });
  };

  const updateSkill = (idx: number, val: string) => {
    onChangeObjectives({
      ...objectives,
      skills: objectives.skills.map((s, i) => (i === idx ? val : s)),
    });
  };

  const addSkill = () => {
    onChangeObjectives({
      ...objectives,
      skills: [...objectives.skills, 'Yêu cầu cần đạt / kỹ năng mới.'],
    });
  };

  const removeSkill = (idx: number) => {
    onChangeObjectives({
      ...objectives,
      skills: objectives.skills.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="font-doc text-black text-[14.5px] leading-relaxed">
      {/* Quốc hiệu / Tiêu đề 2 cột chuẩn mẫu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5">
        <div className="text-center space-y-0.5">
          {readOnly ? (
            <>
              <div className="uppercase">{header.department}</div>
              <div className="font-bold uppercase">{header.school}</div>
            </>
          ) : (
            <>
              <input
                type="text"
                aria-label="Sở Giáo dục và Đào tạo"
                value={header.department}
                onChange={(e) =>
                  onChangeHeader({ ...header, department: e.target.value })
                }
                className="w-full text-center uppercase bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none"
              />
              <input
                type="text"
                aria-label="Tên trường"
                value={header.school}
                onChange={(e) =>
                  onChangeHeader({ ...header, school: e.target.value })
                }
                className="w-full text-center font-bold uppercase bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none"
              />
            </>
          )}
          <div className="w-36 mx-auto border-b border-black pt-1" />
        </div>

        <div className="text-center space-y-0.5">
          {readOnly ? (
            <>
              <div className="font-bold uppercase">{header.examTitle}</div>
              <div className="font-bold uppercase">{header.examName}</div>
              <div className="font-bold uppercase">{header.gradeAndYear}</div>
              <div className="font-bold">{header.subject}</div>
            </>
          ) : (
            <>
              <input
                type="text"
                aria-label="Tiêu đề thiết kế đề"
                value={header.examTitle}
                onChange={(e) =>
                  onChangeHeader({ ...header, examTitle: e.target.value })
                }
                className="w-full text-center font-bold uppercase bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none"
              />
              <input
                type="text"
                aria-label="Tên kỳ kiểm tra"
                value={header.examName}
                onChange={(e) =>
                  onChangeHeader({ ...header, examName: e.target.value })
                }
                className="w-full text-center font-bold uppercase bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none"
              />
              <input
                type="text"
                aria-label="Khối lớp và năm học"
                value={header.gradeAndYear}
                onChange={(e) =>
                  onChangeHeader({ ...header, gradeAndYear: e.target.value })
                }
                className="w-full text-center font-bold uppercase bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none"
              />
              <input
                type="text"
                aria-label="Môn học"
                value={header.subject}
                onChange={(e) =>
                  onChangeHeader({ ...header, subject: e.target.value })
                }
                className="w-full text-center font-bold bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none"
              />
            </>
          )}
        </div>
      </div>

      {/* I. MỤC ĐÍCH VÀ YÊU CẦU CỦA ĐỀ KIỂM TRA */}
      <div className="space-y-2 mt-2">
        <h3 className="font-bold text-[15px]">
          I. MỤC ĐÍCH VÀ YÊU CẦU CỦA ĐỀ KIỂM TRA
        </h3>

        {/* 1. Kiến thức */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">1. Kiến thức</h4>
            {!readOnly && (
              <button
                type="button"
                onClick={addKnowledgeSection}
                className="no-print inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
              >
                <Plus className="w-3 h-3" />
                Thêm phân môn
              </button>
            )}
          </div>

          {objectives.knowledgeSections.map((ks) => (
            <div key={ks.id} className="space-y-1 pl-1">
              <div className="flex items-center gap-2">
                {readOnly ? (
                  <div className="font-bold">{ks.title}</div>
                ) : (
                  <>
                    <input
                      type="text"
                      aria-label={`Phân môn ${ks.title}`}
                      value={ks.title}
                      onChange={(e) => updateKnowledgeTitle(ks.id, e.target.value)}
                      className="font-bold bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => addKnowledgeBullet(ks.id)}
                      className="no-print text-[11px] font-sans text-blue-700 hover:underline whitespace-nowrap"
                    >
                      + Thêm bài học
                    </button>
                  </>
                )}
              </div>

              <ul className="space-y-0.5 pl-4">
                {ks.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2 group">
                    <span className="select-none">−</span>
                    {readOnly ? (
                      <span>{bullet}</span>
                    ) : (
                      <>
                        <input
                          type="text"
                          aria-label={`Kiến thức ${ks.title} mục ${bIdx + 1}`}
                          value={bullet}
                          onChange={(e) =>
                            updateKnowledgeBullet(ks.id, bIdx, e.target.value)
                          }
                          className="flex-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeKnowledgeBullet(ks.id, bIdx)}
                          aria-label={`Xóa kiến thức ${bullet}`}
                          className="no-print opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 2. Kỹ năng */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">2. Kỹ năng</h4>
            {!readOnly && (
              <button
                type="button"
                onClick={addSkill}
                className="no-print inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
              >
                <Plus className="w-3 h-3" />
                Thêm kỹ năng
              </button>
            )}
          </div>

          <ul className="space-y-1 pl-1">
            {objectives.skills.map((skill, sIdx) => (
              <li key={sIdx} className="flex items-start gap-2 group">
                <span className="select-none">–</span>
                {readOnly ? (
                  <span className="whitespace-pre-line">{skill}</span>
                ) : (
                  <>
                    <textarea
                      aria-label={`Kỹ năng mục ${sIdx + 1}`}
                      value={skill}
                      onChange={(e) => updateSkill(sIdx, e.target.value)}
                      rows={skill.length > 110 ? 2 : 1}
                      className="flex-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 resize-none focus:outline-none leading-snug"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkill(sIdx)}
                      aria-label={`Xóa kỹ năng mục ${sIdx + 1}`}
                      className="no-print opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* II. HÌNH THỨC CỦA ĐỀ KIỂM TRA */}
      <div className="space-y-1 mt-4">
        <h3 className="font-bold text-[15px]">
          II. HÌNH THỨC CỦA ĐỀ KIỂM TRA
        </h3>
        <div className="flex items-center gap-2 font-bold">
          <span>- Hình thức:</span>
          {readOnly ? (
            <span>{format.structureText}</span>
          ) : (
            <input
              type="text"
              aria-label="Hình thức kiểm tra"
              value={format.structureText}
              onChange={(e) =>
                onChangeFormat({ ...format, structureText: e.target.value })
              }
              className="flex-1 font-bold bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none"
            />
          )}
        </div>
        <div className="flex items-center gap-2 font-bold">
          <span>- Thời gian làm bài:</span>
          {readOnly ? (
            <span>{format.durationText}</span>
          ) : (
            <input
              type="text"
              aria-label="Thời gian làm bài"
              value={format.durationText}
              onChange={(e) =>
                onChangeFormat({ ...format, durationText: e.target.value })
              }
              className="w-48 font-bold bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 focus:outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};
