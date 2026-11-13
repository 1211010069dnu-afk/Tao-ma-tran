import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import mammoth from 'mammoth';
import { extractText } from 'unpdf';
import {
  CellKey,
  ExamDocument,
  MatrixTopic,
  SpecificationData,
} from '../types/exam';
import { syncMatrixFromSpec } from '../utils/matrixCalculator';
import { emptyCells, DEFAULT_TOAN_10_DOCUMENT } from '../data/sampleToan10';
import {
  parseRawExamText,
  buildDocumentFromParsedExam,
  matchQuestionToUnitDef,
} from '../utils/examParser';

// ===== Helpers thay cho Buffer / process.env của Node (chạy trên trình duyệt) =====
const process = { env: {} as Record<string, string | undefined> };

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Deterministic fallback builder so that generating a new Matrix & Specification
 * from custom user topics always produces a valid, 100% synchronized document
 * even if the environment has no GEMINI_API_KEY configured.
 */
function buildStructuredFallbackDocument(params: {
  department: string;
  school: string;
  grade: string;
  examName: string;
  schoolYear: string;
  duration: string;
  topicsInput: string;
  tnCount: number;
  dsCount: number;
  tlnCount: number;
  tlCount: number;
}): ExamDocument {
  const lines = params.topicsInput
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const parsedTopics: MatrixTopic[] = lines.map((line, tIdx) => {
    const cleaned = line.replace(/^\d+[\.\)]\s*/, '');
    const [topicTitlePart, unitsPart] = cleaned.includes(':')
      ? cleaned.split(':', 2)
      : [cleaned, cleaned];

    const unitNames = unitsPart
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const safeUnits = unitNames.length > 0 ? unitNames : [topicTitlePart.trim()];

    return {
      id: `topic-${tIdx + 1}`,
      topicName: topicTitlePart.trim().toUpperCase(),
      units: safeUnits.map((uName, uIdx) => ({
        id: `u-${tIdx + 1}-${uIdx + 1}`,
        content: uName,
        cells: emptyCells(),
      })),
    };
  });

  if (parsedTopics.length === 0) {
    parsedTopics.push({
      id: 'topic-1',
      topicName: 'CHỦ ĐỀ TOÁN HỌC',
      units: [{ id: 'u-1-1', content: 'Nội dung trọng tâm', cells: emptyCells() }],
    });
  }

  const flatUnits = parsedTopics.flatMap((t) =>
    t.units.map((u) => ({ id: u.id, content: u.content, topicName: t.topicName }))
  );

  // Build Specification items across the user's units
  const tnCycle: { cellKey: CellKey; code: string; prefix: string }[] = [
    { cellKey: 'TD_Biet', code: 'TD1.1', prefix: 'Nhận biết được khái niệm và định nghĩa cơ bản về' },
    { cellKey: 'TD_Biet', code: 'TD1.2', prefix: 'Nhận biết được tính chất và định lí của' },
    { cellKey: 'GQ_Biet', code: 'GQ1.2', prefix: 'Xác định được công thức hoặc đại lượng đặc trưng của' },
    { cellKey: 'GQ_Hieu', code: 'GQ2.1', prefix: 'Mô tả và thực hiện được phép tính cơ bản trong' },
  ];

  const multipleChoice = Array.from({ length: params.tnCount }, (_, i) => {
    const unit = flatUnits[i % flatUnits.length];
    const pattern = tnCycle[i % tnCycle.length];
    return {
      id: `tn-gen-${i + 1}`,
      questionLabel: `Câu ${i + 1}`,
      unitId: unit.id,
      description: `${pattern.prefix} ${unit.content.toLowerCase()}.`,
      cellKey: pattern.cellKey,
      indicatorCode: pattern.code,
      score: 0.25,
    };
  });

  const trueFalse = Array.from({ length: params.dsCount }, (_, i) => {
    const unit = flatUnits[i % flatUnits.length];
    return {
      id: `ds-gen-${i + 1}`,
      questionLabel: `Câu ${i + 1}`,
      unitId: unit.id,
      score: 1.0,
      subItems: [
        {
          subLabel: 'a' as const,
          description: `Nhận biết được khái niệm, công thức nền tảng của ${unit.content.toLowerCase()}.`,
          cellKey: 'TD_Biet' as CellKey,
          indicatorCode: 'TD1.1',
        },
        {
          subLabel: 'b' as const,
          description: `Giải thích được tính chất hoặc biến đổi tương đương trong ${unit.content.toLowerCase()}.`,
          cellKey: 'TD_Hieu' as CellKey,
          indicatorCode: 'TD1.3',
        },
        {
          subLabel: 'c' as const,
          description: `Thiết lập và tính toán được các đại lượng liên quan đến ${unit.content.toLowerCase()}.`,
          cellKey: 'GQ_Hieu' as CellKey,
          indicatorCode: 'GQ2.1',
        },
        {
          subLabel: 'd' as const,
          description: `Vận dụng kiến thức về ${unit.content.toLowerCase()} để giải quyết bài toán tổng hợp.`,
          cellKey: 'GQ_VD' as CellKey,
          indicatorCode: 'GQ3.2',
        },
      ],
    };
  });

  const shortAnswer = Array.from({ length: params.tlnCount }, (_, i) => {
    const unit = flatUnits[(i + 1) % flatUnits.length];
    const isModeling = i % 2 === 1;
    return {
      id: `tln-gen-${i + 1}`,
      questionLabel: `Câu ${i + 1}`,
      unitId: unit.id,
      description: isModeling
        ? `Giải quyết bài toán thực tiễn thông qua thiết lập mô hình toán học về ${unit.content.toLowerCase()}.`
        : `Vận dụng công thức và phương pháp giải toán để tìm kết quả bài toán ${unit.content.toLowerCase()}.`,
      cellKey: (isModeling ? 'MH_VD' : 'GQ_VD') as CellKey,
      indicatorCode: isModeling ? 'MH2.1' : 'GQ3.1',
      score: 0.5,
    };
  });

  const essay = Array.from({ length: params.tlCount }, (_, i) => {
    const unit = flatUnits[i % flatUnits.length];
    return {
      id: `tl-gen-${i + 1}`,
      questionLabel: `Câu ${i + 1}`,
      unitId: unit.id,
      description: `Trình bày lời giải chi tiết bài toán vận dụng và thực tiễn thuộc mạch kiến thức ${unit.content.toLowerCase()}.`,
      cellKey: 'MH_VD' as CellKey,
      indicatorCode: 'MH2.1',
      score: 1.0,
    };
  });

  const specification: SpecificationData = {
    multipleChoice,
    trueFalse,
    shortAnswer,
    essay,
  };

  const syncedMatrix = syncMatrixFromSpec(parsedTopics, specification);

  return {
    id: `custom-${Date.now()}`,
    title: `Toán ${params.grade} - ${params.examName}`,
    header: {
      department: params.department || 'SỞ GD & ĐT ĐỒNG NAI',
      school: params.school || 'TRƯỜNG TH-THCS - THPT SONG NGỮ Á CHÂU',
      examTitle: 'THIẾT KẾ ĐỀ',
      examName: params.examName.toUpperCase(),
      gradeAndYear: `KHỐI ${params.grade} – NĂM HỌC: ${params.schoolYear}`,
      subject: 'Môn: Toán',
    },
    objectives: {
      knowledgeSections: parsedTopics.map((t, idx) => ({
        id: `ks-gen-${idx + 1}`,
        title: `Chủ đề ${idx + 1}: ${t.topicName}`,
        bullets: t.units.map((u) => u.content),
      })),
      skills: flatUnits.flatMap((u) => [
        `Nhận biết và mô tả được các khái niệm, tính chất cơ bản của ${u.content.toLowerCase()}.`,
        `Vận dụng được kiến thức về ${u.content.toLowerCase()} vào giải quyết bài toán toán học và bài toán thực tiễn.`,
      ]),
    },
    format: {
      structureText:
        params.tlCount > 0
          ? 'Kết hợp trắc nghiệm (nhiều lựa chọn, đúng - sai, trả lời ngắn) và tự luận'
          : '100% trắc nghiệm (nhiều lựa chọn, đúng - sai, trả lời ngắn)',
      durationText: params.duration || '90 phút',
      footnoteText:
        'Kí hiệu: TN - Câu trắc nghiệm nhiều lựa chọn, ĐS - Câu trắc nghiệm Đúng – Sai, TLN – Câu trắc nghiệm trả lời ngắn, TL – Câu tự luận.',
    },
    matrixTopics: syncedMatrix,
    specification,
  };
}

async function callWithTimeout<T>(promise: Promise<T>, ms: number = 10000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('TIMEOUT')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Invokes Gemini with automatic model fallback (gemini-flash-latest -> gemini-3.8-flash -> gemini-3.1-flash-lite)
 * to handle both AI Studio internal keys and user-supplied Google AI Studio API keys reliably.
 */
async function callGeminiWithFallback(
  apiKey: string,
  contents: any,
  config: any,
  speedMode: 'fast' | 'deep' = 'fast'
) {
  const ai = new GoogleGenAI({
    apiKey,
  });

  const thinkingLevel = speedMode === 'deep' ? ThinkingLevel.MEDIUM : ThinkingLevel.LOW;
  const candidateModels = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      return await callWithTimeout(
        ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            ...config,
            thinkingConfig: {
              thinkingLevel: modelName === 'gemini-3.1-flash-lite' ? ThinkingLevel.MINIMAL : thinkingLevel,
            },
          },
        }),
        22000
      );
    } catch (err: any) {
      lastError = err;
    }
  }

  const isQuota =
    String(lastError?.message || '').includes('429') ||
    String(lastError?.message || '').includes('RESOURCE_EXHAUSTED') ||
    String(lastError?.message || '').includes('Quota exceeded');

  if (isQuota) {
    throw new Error('QUOTA_EXCEEDED');
  }
  throw lastError || new Error('GEMINI_CALL_FAILED');
}

type Handler = (req: any, res: any) => Promise<void> | void;
const routeTable: Record<string, Handler> = {};
const app = { post: (path: string, h: Handler) => { routeTable[path] = h; } };

function registerRoutes() {
  app.post('/api/generate-exam', async (req, res) => {
    const {
      department = 'SỞ GD & ĐT ĐỒNG NAI',
      school = 'TRƯỜNG TH-THCS - THPT SONG NGỮ Á CHÂU',
      grade = '10',
      examName = 'KIỂM TRA GIỮA HỌC KÌ II',
      schoolYear = '2025 – 2026',
      duration = '90 phút',
      topicsInput = '',
      tnCount = 12,
      dsCount = 4,
      tlnCount = 6,
      tlCount = 0,
      apiKey: clientApiKey = '',
      speedMode = 'fast',
    } = req.body || {};

    if (!topicsInput || ! String(topicsInput).trim()) {
      res.status(400).json({ error: 'Vui lòng nhập danh sách chủ đề môn Toán.' });
      return;
    }

    const baseDoc = buildStructuredFallbackDocument({
      department,
      school,
      grade: String(grade),
      examName: String(examName),
      schoolYear: String(schoolYear),
      duration: String(duration),
      topicsInput: String(topicsInput),
      tnCount: Number(tnCount) || 0,
      dsCount: Number(dsCount) || 0,
      tlnCount: Number(tlnCount) || 0,
      tlCount: Number(tlCount) || 0,
    });

    const activeApiKey = clientApiKey?.trim() || (req.headers['x-gemini-api-key'] as string)?.trim() || process.env.GEMINI_API_KEY;
    if (!activeApiKey || activeApiKey === 'MY_GEMINI_API_KEY' || (!activeApiKey.startsWith('AIzaSy') && activeApiKey.length < 35)) {
      res.json({ document: baseDoc, source: 'structured-builder' });
      return;
    }

    try {
      const unitListDesc = baseDoc.matrixTopics
        .flatMap((t) =>
          t.units.map((u) => `- unitId "${u.id}": ${t.topicName} -> ${u.content}`)
        )
        .join('\n');

      const prompt = `Bạn là chuyên gia xây dựng Ma trận và Bảng đặc tả đề kiểm tra môn Toán THPT theo Chương trình GDPT 2018 của Bộ GD&ĐT Việt Nam.
Hãy biên soạn nội dung chi tiết cho đề kiểm tra Toán Khối ${grade} (${examName}) dựa trên các đơn vị kiến thức sau:
${unitListDesc}

Yêu cầu số lượng câu hỏi:
- Phần 1 (multipleChoice - Trắc nghiệm nhiều lựa chọn): đúng ${tnCount} câu (mỗi câu 0.25 điểm).
- Phần 2 (trueFalse - Trắc nghiệm Đúng/Sai): đúng ${dsCount} câu, mỗi câu gồm 4 ý a, b, c, d (mỗi câu 1.0 điểm).
- Phần 3 (shortAnswer - Trắc nghiệm trả lời ngắn): đúng ${tlnCount} câu (mỗi câu 0.5 điểm).
- Phần 4 (essay - Tự luận): đúng ${tlCount} câu (mỗi câu 1.0 điểm).

Nguyên tắc mô tả Yêu cầu cần đạt (description) SÁT VỚI ĐỀ KIỂM TRA chuẩn GDPT 2018:
- Nêu rõ đối tượng toán học, dạng toán, công thức (ax²+bx+c, VTCP u, VTPT n, đường tròn, khoảng cách, tổ hợp P_n, A_n^k, C_n^k,...) và nhiệm vụ cụ thể mà câu hỏi kiểm tra.
- Viết rõ ràng, súc tích (1 câu trực tiếp < 30 từ), đúng cấu trúc Thông tư Bộ GD&ĐT (VD: "Nhận biết dạng tam thức bậc hai f(x) = ax² + bx + c (a ≠ 0) và xác định hệ số", "Tìm tập nghiệm của bất phương trình bậc hai một ẩn qua bảng xét dấu", "Tính khoảng cách từ điểm đến đường thẳng",...).
- Gán đúng unitId, cellKey và indicatorCode tương ứng từ danh sách đã cung cấp.`;

      const response = await callGeminiWithFallback(
        activeApiKey,
        prompt,
        {
          systemInstruction:
            'Bạn là chuyên gia thẩm định Ma trận & Bảng đặc tả môn Toán GDPT 2018. Hãy tạo đặc tả bám sát đề kiểm tra thực tế, có công thức và điều kiện toán học rõ ràng theo cấu trúc JSON được yêu cầu.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Danh sách 8-12 kỹ năng / yêu cầu cần đạt chi tiết của đề kiểm tra.',
              },
              multipleChoice: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    unitId: { type: Type.STRING },
                    description: { type: Type.STRING },
                    cellKey: { type: Type.STRING },
                    indicatorCode: { type: Type.STRING },
                  },
                  required: ['unitId', 'description', 'cellKey', 'indicatorCode'],
                },
              },
              trueFalse: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    unitId: { type: Type.STRING },
                    subItems: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          subLabel: { type: Type.STRING },
                          description: { type: Type.STRING },
                          cellKey: { type: Type.STRING },
                          indicatorCode: { type: Type.STRING },
                        },
                        required: ['subLabel', 'description', 'cellKey', 'indicatorCode'],
                      },
                    },
                  },
                  required: ['unitId', 'subItems'],
                },
              },
              shortAnswer: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    unitId: { type: Type.STRING },
                    description: { type: Type.STRING },
                    cellKey: { type: Type.STRING },
                    indicatorCode: { type: Type.STRING },
                  },
                  required: ['unitId', 'description', 'cellKey', 'indicatorCode'],
                },
              },
              essay: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    unitId: { type: Type.STRING },
                    description: { type: Type.STRING },
                    cellKey: { type: Type.STRING },
                    indicatorCode: { type: Type.STRING },
                  },
                  required: ['unitId', 'description', 'cellKey', 'indicatorCode'],
                },
              },
            },
            required: ['skills', 'multipleChoice', 'trueFalse', 'shortAnswer', 'essay'],
          },
        });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const validUnitIds = new Set(
        baseDoc.matrixTopics.flatMap((t) => t.units.map((u) => u.id))
      );
      const fallbackUnitId =
        baseDoc.matrixTopics[0]?.units[0]?.id || 'u-1-1';
      const validCells = new Set<CellKey>([
        'TD_Biet',
        'TD_Hieu',
        'TD_VD',
        'GQ_Biet',
        'GQ_Hieu',
        'GQ_VD',
        'MH_Biet',
        'MH_Hieu',
        'MH_VD',
      ]);

      const sanitizeCell = (c: string, fallback: CellKey): CellKey =>
        validCells.has(c as CellKey) ? (c as CellKey) : fallback;
      const sanitizeUnit = (u: string): string =>
        validUnitIds.has(u) ? u : fallbackUnitId;

      if (Array.isArray(parsed.skills) && parsed.skills.length > 0) {
        baseDoc.objectives.skills = parsed.skills;
      }

      if (Array.isArray(parsed.multipleChoice) && parsed.multipleChoice.length > 0) {
        baseDoc.specification.multipleChoice = parsed.multipleChoice.map(
          (item: any, idx: number) => ({
            id: `tn-ai-${idx + 1}`,
            questionLabel: `Câu ${idx + 1}`,
            unitId: sanitizeUnit(item.unitId),
            description: item.description || 'Nhận biết khái niệm toán học.',
            cellKey: sanitizeCell(item.cellKey, 'TD_Biet'),
            indicatorCode: item.indicatorCode || 'TD1.1',
            score: 0.25,
          })
        );
      }

      if (Array.isArray(parsed.trueFalse) && parsed.trueFalse.length > 0) {
        baseDoc.specification.trueFalse = parsed.trueFalse.map(
          (item: any, idx: number) => ({
            id: `ds-ai-${idx + 1}`,
            questionLabel: `Câu ${idx + 1}`,
            unitId: sanitizeUnit(item.unitId),
            score: 1.0,
            subItems: (['a', 'b', 'c', 'd'] as const).map((label, sIdx) => {
              const rawSub = item.subItems?.[sIdx] || {};
              const defaultKey: CellKey =
                sIdx === 0
                  ? 'TD_Biet'
                  : sIdx === 1
                  ? 'TD_Hieu'
                  : sIdx === 2
                  ? 'GQ_Hieu'
                  : 'GQ_VD';
              return {
                subLabel: label,
                description:
                  rawSub.description || `Mệnh đề ${label} kiểm tra kiến thức.`,
                cellKey: sanitizeCell(rawSub.cellKey, defaultKey),
                indicatorCode: rawSub.indicatorCode || 'GQ2.1',
              };
            }),
          })
        );
      }

      if (Array.isArray(parsed.shortAnswer)) {
        baseDoc.specification.shortAnswer = parsed.shortAnswer.map(
          (item: any, idx: number) => ({
            id: `tln-ai-${idx + 1}`,
            questionLabel: `Câu ${idx + 1}`,
            unitId: sanitizeUnit(item.unitId),
            description: item.description || 'Giải bài toán thực tiễn.',
            cellKey: sanitizeCell(item.cellKey, 'MH_VD'),
            indicatorCode: item.indicatorCode || 'MH2.1',
            score: 0.5,
          })
        );
      }

      if (Array.isArray(parsed.essay)) {
        baseDoc.specification.essay = parsed.essay.map(
          (item: any, idx: number) => ({
            id: `tl-ai-${idx + 1}`,
            questionLabel: `Câu ${idx + 1}`,
            unitId: sanitizeUnit(item.unitId),
            description: item.description || 'Bài toán tự luận tổng hợp.',
            cellKey: sanitizeCell(item.cellKey, 'GQ_VD'),
            indicatorCode: item.indicatorCode || 'GQ3.1',
            score: 1.0,
          })
        );
      }

      baseDoc.matrixTopics = syncMatrixFromSpec(
        baseDoc.matrixTopics,
        baseDoc.specification
      );

      res.json({ document: baseDoc, source: 'gemini' });
    } catch (error: any) {
      const isQuota =
        error?.message === 'QUOTA_EXCEEDED' ||
        String(error?.message || '').includes('429') ||
        String(error?.message || '').includes('RESOURCE_EXHAUSTED') ||
        String(error?.message || '').includes('Quota exceeded');

      res.json({
        document: baseDoc,
        source: 'structured-builder',
        warning: isQuota
          ? 'Hạn ngạch miễn phí của model máy chủ đã đạt giới hạn trong ngày. Bạn có thể nhập Gemini API Key cá nhân để tiếp tục tạo đề không giới hạn.'
          : undefined,
        quotaExceeded: isQuota,
      });
    }
  });

  app.post('/api/generate-from-exam', async (req, res) => {
    try {
      const {
        examText = '',
        fileBase64 = '',
        fileMimeType = '',
        fileName = '',
        gradeHint = '',
        examNameHint = '',
        durationHint = '',
        department = 'SỞ GD & ĐT ĐỒNG NAI',
        school = 'TRƯỜNG TH-THCS - THPT SONG NGỮ Á CHÂU',
        schoolYear = '2025 – 2026',
        apiKey: clientApiKey = '',
        speedMode = 'fast',
      } = req.body || {};

      let combinedText = String(examText || '').trim();
      combinedText = combinedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

      // Extract text from file if uploaded
      let isPdf = false;
      if (fileBase64) {
        if (fileMimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
          isPdf = true;
          try {
            const pdfBytes = b64ToBytes(fileBase64);
            const extractedPdf = await extractText(pdfBytes, { mergePages: true });
            if (extractedPdf?.text) {
              combinedText = (extractedPdf.text + '\n\n' + combinedText)
                .trim()
                .replace(/\r\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n');
            }
          } catch (pdfErr: any) {
            console.warn('PDF text extraction warning:', pdfErr?.message);
          }
        } else if (
          fileMimeType.includes('word') ||
          fileName.toLowerCase().endsWith('.docx') ||
          fileName.toLowerCase().endsWith('.doc')
        ) {
          try {
            const bytes = b64ToBytes(fileBase64);
            const extracted = await mammoth.extractRawText({
              arrayBuffer: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
            });
            if (extracted.value) {
              combinedText = (extracted.value + '\n\n' + combinedText).trim().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
            }
          } catch (mErr: any) {
            console.warn('Mammoth docx parse warning:', mErr?.message);
          }
        } else {
          // Plain text / markdown / csv
          try {
            const textBuf = new TextDecoder('utf-8').decode(b64ToBytes(fileBase64));
            combinedText = (textBuf + '\n\n' + combinedText).trim().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
          } catch (tErr: any) {
            console.warn('Text file decode warning:', tErr?.message);
          }
        }
      }

      if (!combinedText && !isPdf) {
        res.status(400).json({ error: 'Vui lòng tải lên tệp đề thi hoặc dán nội dung đề kiểm tra.' });
        return;
      }

      // Build fallback document
      const analysis = parseRawExamText(combinedText);
      if (gradeHint) analysis.detectedGrade = gradeHint;
      if (examNameHint) analysis.detectedExamName = examNameHint;
      if (durationHint) analysis.detectedDuration = durationHint;

      const fallbackDoc = buildDocumentFromParsedExam(analysis, {
        department,
        school,
        examTitle: 'THIẾT KẾ ĐỀ',
        schoolYear,
      });

      const activeApiKey = clientApiKey?.trim() || (req.headers['x-gemini-api-key'] as string)?.trim() || process.env.GEMINI_API_KEY;

      if (!activeApiKey || activeApiKey === 'MY_GEMINI_API_KEY' || (!activeApiKey.startsWith('AIzaSy') && activeApiKey.length < 35)) {
        res.json({ document: fallbackDoc, source: 'structured-parser' });
        return;
      }

      try {
        const detectedStatsHint = `Cấu trúc nhận diện tự động từ đề thi (tham khảo để phân loại nhanh & chính xác):
- Khối lớp: ${analysis.detectedGrade || gradeHint || '10'}
- Thời gian làm bài: ${analysis.detectedDuration || durationHint || '90 phút'}
- Trắc nghiệm nhiều lựa chọn (TN): ~${analysis.questions.filter((q) => q.partType === 'TN').length || '12'} câu
- Đúng/Sai (DS): ~${analysis.questions.filter((q) => q.partType === 'DS').length || '4'} câu
- Trả lời ngắn (TLN): ~${analysis.questions.filter((q) => q.partType === 'TLN').length || '6'} câu
- Tự luận (TL): ~${analysis.questions.filter((q) => q.partType === 'TL').length || '0'} câu`;

        const promptText = `Bạn là chuyên gia thẩm định và xây dựng Ma trận và Bảng đặc tả đề kiểm tra môn Toán theo Chương trình GDPT 2018 của Bộ GD&ĐT Việt Nam.
Hãy phân tích kỹ lưỡng đề kiểm tra sau đây và trích xuất cấu trúc Ma trận & Bảng đặc tả chi tiết:
${detectedStatsHint}

${combinedText ? `\n--- NỘI DUNG ĐỀ THI ---\n${combinedText}\n--- HẾT NỘI DUNG ĐỀ THI ---` : ''}

Yêu cầu phân tích:
1. Xác định Khối lớp (${gradeHint || 'tự nhận diện: 6, 7, 8, 9, 10, 11 hoặc 12'}) và tên kỳ thi (${examNameHint || 'tự nhận diện'}).
2. Phân chia đề thi thành 2-4 Chủ đề lớn (topics) và mỗi chủ đề có các Đơn vị kiến thức cụ thể (units).
3. Phân loại toàn bộ các câu hỏi trong đề:
   - multipleChoice (Phần 1 - Trắc nghiệm nhiều lựa chọn): mỗi câu gán unitNameOrIndex, mô tả ngắn gọn yêu cầu cần đạt, cellKey, indicatorCode, score = 0.25.
   - trueFalse (Phần 2 - Đúng/Sai): mỗi câu gán unitNameOrIndex, score = 1.0, subItems gồm 4 ý a, b, c, d với từng cellKey và indicatorCode.
   - shortAnswer (Phần 3 - Trả lời ngắn): mỗi câu gán unitNameOrIndex, cellKey, indicatorCode, score = 0.5.
   - essay (Phần 4 - Tự luận): mỗi câu gán unitNameOrIndex, cellKey, indicatorCode, score = 1.0 (hoặc số điểm ghi trong đề).
4. Quy tắc cellKey: chỉ dùng một trong 9 mã:
   "TD_Biet", "TD_Hieu", "TD_VD", "GQ_Biet", "GQ_Hieu", "GQ_VD", "MH_Biet", "MH_Hieu", "MH_VD".
5. Quy tắc indicatorCode: TD1.1, TD1.2, TD1.3, TD2.1, TD3.3, GQ1.1, GQ1.2, GQ1.3, GQ1.4, GQ1.5, GQ2.1, GQ3.1, GQ3.2, MH1.1, MH1.2, MH2.1.
6. NGUYÊN TẮC TỐC ĐỘ & ĐỘ CHUẨN XÁC: Mô tả Yêu cầu cần đạt (description) phải ngắn gọn, súc tích (1 câu trực tiếp, dưới 20 từ) theo đúng chuẩn Bảng đặc tả của Bộ GD&ĐT (VD: "Nhận biết được dấu của tam thức bậc hai", "Vận dụng tọa độ điểm giải bài toán tam giác"). Tuyệt đối không viết giải thích dài dòng hay chép lại toàn bộ văn bản câu hỏi.`;

        const contents: any[] = [];
        if (isPdf && fileBase64) {
          contents.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: fileBase64,
            },
          });
        }
        contents.push(promptText);

        const response = await callGeminiWithFallback(
          activeApiKey,
          contents,
          {
            systemInstruction:
              'Bạn là chuyên gia thẩm định đề thi môn Toán THPT chuẩn GDPT 2018 của Bộ GD&ĐT Việt Nam. Hãy phân tích đề thi nhanh, chính xác cao và trả về kết quả JSON với mô tả yêu cầu cần đạt ngắn gọn (1 câu < 20 từ).',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedGrade: { type: Type.STRING },
                detectedExamName: { type: Type.STRING },
                detectedDuration: { type: Type.STRING },
                topics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topicName: { type: Type.STRING },
                      units: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['topicName', 'units'],
                  },
                },
                skills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                multipleChoice: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      unitNameOrIndex: { type: Type.STRING },
                      questionLabel: { type: Type.STRING },
                      description: { type: Type.STRING },
                      cellKey: { type: Type.STRING },
                      indicatorCode: { type: Type.STRING },
                    },
                    required: ['questionLabel', 'description', 'cellKey', 'indicatorCode'],
                  },
                },
                trueFalse: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      unitNameOrIndex: { type: Type.STRING },
                      questionLabel: { type: Type.STRING },
                      subItems: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            subLabel: { type: Type.STRING },
                            description: { type: Type.STRING },
                            cellKey: { type: Type.STRING },
                            indicatorCode: { type: Type.STRING },
                          },
                          required: ['subLabel', 'description', 'cellKey', 'indicatorCode'],
                        },
                      },
                    },
                    required: ['questionLabel', 'subItems'],
                  },
                },
                shortAnswer: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      unitNameOrIndex: { type: Type.STRING },
                      questionLabel: { type: Type.STRING },
                      description: { type: Type.STRING },
                      cellKey: { type: Type.STRING },
                      indicatorCode: { type: Type.STRING },
                    },
                    required: ['questionLabel', 'description', 'cellKey', 'indicatorCode'],
                  },
                },
                essay: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      unitNameOrIndex: { type: Type.STRING },
                      questionLabel: { type: Type.STRING },
                      description: { type: Type.STRING },
                      cellKey: { type: Type.STRING },
                      indicatorCode: { type: Type.STRING },
                    },
                    required: ['questionLabel', 'description', 'cellKey', 'indicatorCode'],
                  },
                },
              },
              required: ['topics', 'multipleChoice', 'trueFalse', 'shortAnswer', 'essay'],
            },
          },
          speedMode
        );

        const parsed = JSON.parse((response.text ?? '{}').trim());

        const generatedTopics: MatrixTopic[] = (
          Array.isArray(parsed.topics) && parsed.topics.length > 0
            ? parsed.topics
            : fallbackDoc.matrixTopics
        ).map((t: any, tIdx: number) => ({
          id: `topic-ai-${tIdx + 1}`,
          topicName: String(t.topicName || `CHỦ ĐỀ ${tIdx + 1}`).toUpperCase(),
          units: (Array.isArray(t.units) && t.units.length > 0 ? t.units : ['Kiến thức trọng tâm']).map(
            (uName: string, uIdx: number) => ({
              id: `u-ai-${tIdx + 1}-${uIdx + 1}`,
              content: String(uName),
              cells: emptyCells(),
            })
          ),
        }));

        const flatGeneratedUnits = generatedTopics.flatMap((t) =>
          t.units.map((u) => ({ id: u.id, content: u.content }))
        );
        const fallbackUnitId = flatGeneratedUnits[0]?.id || 'u-ai-1-1';

        const validCells = new Set<CellKey>([
          'TD_Biet', 'TD_Hieu', 'TD_VD',
          'GQ_Biet', 'GQ_Hieu', 'GQ_VD',
          'MH_Biet', 'MH_Hieu', 'MH_VD',
        ]);
        const sanitizeCell = (c: string, def: CellKey): CellKey =>
          validCells.has(c as CellKey) ? (c as CellKey) : def;

        const resolveAiUnitId = (unitHint: string | undefined, desc: string | undefined, fallbackUnitFromParser?: string): string => {
          const hint = String(unitHint || '').trim().toLowerCase();
          if (hint) {
            const exactOrSub = flatGeneratedUnits.find(
              (u) =>
                u.id.toLowerCase() === hint ||
                u.content.toLowerCase().includes(hint) ||
                hint.includes(u.content.toLowerCase())
            );
            if (exactOrSub) return exactOrSub.id;
            const numMatch = hint.match(/\d+/);
            if (numMatch) {
              const idx = parseInt(numMatch[0], 10) - 1;
              if (idx >= 0 && idx < flatGeneratedUnits.length) {
                return flatGeneratedUnits[idx].id;
              }
            }
          }
          if (desc) {
            const descLower = desc.toLowerCase();
            const byDesc = flatGeneratedUnits.find((u) => {
              const words = u.content.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
              return words.length > 0 && words.filter((w) => descLower.includes(w)).length >= Math.min(2, words.length);
            });
            if (byDesc) return byDesc.id;
          }
          if (fallbackUnitFromParser) {
            const fbUnitContent = fallbackDoc.matrixTopics
              .flatMap((t) => t.units)
              .find((u) => u.id === fallbackUnitFromParser)?.content?.toLowerCase();
            if (fbUnitContent) {
              const matched = flatGeneratedUnits.find(
                (u) =>
                  u.content.toLowerCase().includes(fbUnitContent) ||
                  fbUnitContent.includes(u.content.toLowerCase())
              );
              if (matched) return matched.id;
            }
          }
          return fallbackUnitId;
        };

        const spec: SpecificationData = {
          multipleChoice: (parsed.multipleChoice || []).map((item: any, idx: number) => ({
            id: `tn-ai-${idx + 1}`,
            questionLabel: item.questionLabel || `Câu ${idx + 1}`,
            unitId: resolveAiUnitId(item.unitNameOrIndex, item.description, fallbackDoc.specification.multipleChoice[idx]?.unitId),
            description: item.description || fallbackDoc.specification.multipleChoice[idx]?.description || 'Nhận biết khái niệm toán học trong đề.',
            cellKey: sanitizeCell(item.cellKey, fallbackDoc.specification.multipleChoice[idx]?.cellKey || 'TD_Biet'),
            indicatorCode: item.indicatorCode || fallbackDoc.specification.multipleChoice[idx]?.indicatorCode || 'TD1.1',
            score: 0.25,
          })),
          trueFalse: (parsed.trueFalse || []).map((item: any, idx: number) => ({
            id: `ds-ai-${idx + 1}`,
            questionLabel: item.questionLabel || `Câu ${idx + 1}`,
            unitId: resolveAiUnitId(item.unitNameOrIndex, item.subItems?.[0]?.description, fallbackDoc.specification.trueFalse[idx]?.unitId),
            score: 1.0,
            subItems: (['a', 'b', 'c', 'd'] as const).map((subLabel, sIdx) => {
              const rawSub = item.subItems?.[sIdx] || {};
              const fbSub = fallbackDoc.specification.trueFalse[idx]?.subItems?.[sIdx];
              const defKey: CellKey = fbSub?.cellKey || (sIdx === 0 ? 'TD_Biet' : sIdx === 1 ? 'TD_Hieu' : sIdx === 2 ? 'GQ_Hieu' : 'GQ_VD');
              return {
                subLabel,
                description: rawSub.description || fbSub?.description || `Mệnh đề ${subLabel} trong đề thi.`,
                cellKey: sanitizeCell(rawSub.cellKey, defKey),
                indicatorCode: rawSub.indicatorCode || fbSub?.indicatorCode || 'GQ2.1',
              };
            }),
          })),
          shortAnswer: (parsed.shortAnswer || []).map((item: any, idx: number) => ({
            id: `tln-ai-${idx + 1}`,
            questionLabel: item.questionLabel || `Câu ${idx + 1}`,
            unitId: resolveAiUnitId(item.unitNameOrIndex, item.description, fallbackDoc.specification.shortAnswer[idx]?.unitId),
            description: item.description || fallbackDoc.specification.shortAnswer[idx]?.description || 'Giải bài toán trong đề thi.',
            cellKey: sanitizeCell(item.cellKey, fallbackDoc.specification.shortAnswer[idx]?.cellKey || 'GQ_VD'),
            indicatorCode: item.indicatorCode || fallbackDoc.specification.shortAnswer[idx]?.indicatorCode || 'GQ3.1',
            score: 0.5,
          })),
          essay: (parsed.essay || []).map((item: any, idx: number) => ({
            id: `tl-ai-${idx + 1}`,
            questionLabel: item.questionLabel || `Câu ${idx + 1}`,
            unitId: resolveAiUnitId(item.unitNameOrIndex, item.description, fallbackDoc.specification.essay[idx]?.unitId),
            description: item.description || fallbackDoc.specification.essay[idx]?.description || 'Trình bày lời giải chi tiết cho câu hỏi tự luận.',
            cellKey: sanitizeCell(item.cellKey, fallbackDoc.specification.essay[idx]?.cellKey || 'MH_VD'),
            indicatorCode: item.indicatorCode || fallbackDoc.specification.essay[idx]?.indicatorCode || 'MH2.1',
            score: 1.0,
          })),
        };

        const syncedMatrix = syncMatrixFromSpec(generatedTopics, spec);

        const finalGrade = parsed.detectedGrade || gradeHint || analysis.detectedGrade || '10';
        const finalExamName = parsed.detectedExamName || examNameHint || analysis.detectedExamName || 'KIỂM TRA ĐỊNH KỲ';
        const finalDuration = parsed.detectedDuration || durationHint || analysis.detectedDuration || '90 phút';

        const finalDoc: ExamDocument = {
          id: `ai-exam-${Date.now()}`,
          title: `Toán ${finalGrade} - ${finalExamName}`,
          header: {
            department,
            school,
            examTitle: 'THIẾT KẾ ĐỀ',
            examName: finalExamName.toUpperCase(),
            gradeAndYear: `KHỐI ${finalGrade} – NĂM HỌC: ${schoolYear}`,
            subject: 'Môn: Toán',
          },
          objectives: {
            knowledgeSections: generatedTopics.map((t, idx) => ({
              id: `ks-ai-${idx + 1}`,
              title: `Chủ đề ${idx + 1}: ${t.topicName}`,
              bullets: t.units.map((u) => u.content),
            })),
            skills: Array.isArray(parsed.skills) && parsed.skills.length > 0
              ? parsed.skills
              : fallbackDoc.objectives.skills,
          },
          format: {
            structureText:
              spec.essay.length > 0
                ? 'Kết hợp trắc nghiệm (nhiều lựa chọn, đúng - sai, trả lời ngắn) và tự luận'
                : '100% trắc nghiệm (nhiều lựa chọn, đúng - sai, trả lời ngắn)',
            durationText: finalDuration,
            footnoteText:
              'Kí hiệu: TN - Câu trắc nghiệm nhiều lựa chọn, ĐS - Câu trắc nghiệm Đúng – Sai, TLN – Câu trắc nghiệm trả lời ngắn, TL – Câu tự luận.',
          },
          matrixTopics: syncedMatrix,
          specification: spec,
        };

        res.json({ document: finalDoc, source: 'gemini' });
      } catch (geminiError: any) {
        const isQuota =
          geminiError?.message === 'QUOTA_EXCEEDED' ||
          String(geminiError?.message || '').includes('429') ||
          String(geminiError?.message || '').includes('RESOURCE_EXHAUSTED') ||
          String(geminiError?.message || '').includes('Quota exceeded');

        res.json({
          document: fallbackDoc,
          source: 'structured-parser',
          warning: isQuota
            ? 'Hạn ngạch miễn phí của model máy chủ đã đạt giới hạn trong ngày. Bạn có thể nhập Gemini API Key cá nhân để tiếp tục tạo đề không giới hạn.'
            : undefined,
          quotaExceeded: isQuota,
        });
      }
    } catch (err: any) {
      console.error('Server error handling /api/generate-from-exam:', err);
      res.status(500).json({ error: err?.message || 'Lỗi xử lý đề thi trên máy chủ.' });
    }
  });

  app.post('/api/append-exam-content', async (req, res) => {
    try {
      const {
        contentText = '',
        targetTopicId = 'new',
        currentTopics = [],
        currentSpec = { multipleChoice: [], trueFalse: [], shortAnswer: [], essay: [] },
        counts = { tn: 2, ds: 0, tln: 1, tl: 0 },
        apiKey: clientApiKey = '',
        speedMode = 'fast',
      } = req.body || {};

      const trimmedContent = String(contentText || '').trim();
      if (!trimmedContent) {
        res.status(400).json({ error: 'Vui lòng nhập nội dung bài kiểm tra cần bổ sung.' });
        return;
      }

      const tnCount = Math.max(0, Number(counts?.tn) || 0);
      const dsCount = Math.max(0, Number(counts?.ds) || 0);
      const tlnCount = Math.max(0, Number(counts?.tln) || 0);
      const tlCount = Math.max(0, Number(counts?.tl) || 0);

      const safeTopics: MatrixTopic[] = Array.isArray(currentTopics) ? currentTopics : [];
      const safeSpec: SpecificationData = {
        multipleChoice: Array.isArray(currentSpec?.multipleChoice) ? currentSpec.multipleChoice : [],
        trueFalse: Array.isArray(currentSpec?.trueFalse) ? currentSpec.trueFalse : [],
        shortAnswer: Array.isArray(currentSpec?.shortAnswer) ? currentSpec.shortAnswer : [],
        essay: Array.isArray(currentSpec?.essay) ? currentSpec.essay : [],
      };

      // Deterministic fallback generator using CURRICULUM_UNITS
      const buildFallbackAppend = () => {
        const lines = trimmedContent
          .split(/[\n;]/)
          .map((l) => l.trim().replace(/^\d+[\.\)]\s*/, ''))
          .filter(Boolean);

        const matchedDef = matchQuestionToUnitDef(trimmedContent);
        const isMenhDeTapHop = /mệnh đề|tập hợp/i.test(trimmedContent);

        const newUnitsContent = isMenhDeTapHop
          ? ['Mệnh đề', 'Tập hợp và các phép toán trên tập hợp']
          : lines.length > 0
          ? lines
          : [matchedDef.unitName || trimmedContent];

        const newUnits = newUnitsContent.map((uText, idx) => ({
          id: `u-app-${Date.now()}-${idx + 1}`,
          content: uText,
          cells: emptyCells(),
        }));

        let updatedTopics: MatrixTopic[] = [];
        if (targetTopicId && targetTopicId !== 'new') {
          const found = safeTopics.some((t: MatrixTopic) => t.id === targetTopicId);
          if (found) {
            updatedTopics = safeTopics.map((t: MatrixTopic) =>
              t.id === targetTopicId ? { ...t, units: [...t.units, ...newUnits] } : t
            );
          } else {
            updatedTopics = [
              ...safeTopics,
              {
                id: `topic-app-${Date.now()}`,
                topicName: isMenhDeTapHop ? 'MỆNH ĐỀ VÀ TẬP HỢP' : matchedDef.topicName,
                units: newUnits,
              },
            ];
          }
        } else {
          const detectedTopicName = isMenhDeTapHop
            ? 'MỆNH ĐỀ VÀ TẬP HỢP'
            : matchedDef.topicName || (newUnitsContent[0] || 'Nội dung bổ sung').toUpperCase().slice(0, 45);
          updatedTopics = [
            ...safeTopics,
            {
              id: `topic-app-${Date.now()}`,
              topicName: detectedTopicName,
              units: newUnits,
            },
          ];
        }

        // Append questions to specification using curriculum templates
        const startTn = safeSpec.multipleChoice.length;
        const newTn = Array.from({ length: tnCount }, (_, i) => {
          const unitObj = newUnits[i % newUnits.length];
          const uDef = matchQuestionToUnitDef(unitObj.content + ' ' + trimmedContent);
          const tpl = uDef.tnTemplates[i % uDef.tnTemplates.length];
          return {
            id: `tn-app-${Date.now()}-${i + 1}`,
            questionLabel: `Câu ${startTn + i + 1}`,
            unitId: unitObj.id,
            description: tpl.desc,
            cellKey: tpl.cellKey,
            indicatorCode: tpl.code,
            score: 0.25,
          };
        });

        const startDs = safeSpec.trueFalse.length;
        const newDs = Array.from({ length: dsCount }, (_, i) => {
          const unitObj = newUnits[i % newUnits.length];
          const uDef = matchQuestionToUnitDef(unitObj.content + ' ' + trimmedContent);
          const subTpl = uDef.dsSubTemplates;
          return {
            id: `ds-app-${Date.now()}-${i + 1}`,
            questionLabel: `Câu ${startDs + i + 1}`,
            unitId: unitObj.id,
            score: 1.0,
            subItems: [
              {
                subLabel: 'a' as const,
                description: subTpl.a.desc,
                cellKey: subTpl.a.cellKey,
                indicatorCode: subTpl.a.code,
              },
              {
                subLabel: 'b' as const,
                description: subTpl.b.desc,
                cellKey: subTpl.b.cellKey,
                indicatorCode: subTpl.b.code,
              },
              {
                subLabel: 'c' as const,
                description: subTpl.c.desc,
                cellKey: subTpl.c.cellKey,
                indicatorCode: subTpl.c.code,
              },
              {
                subLabel: 'd' as const,
                description: subTpl.d.desc,
                cellKey: subTpl.d.cellKey,
                indicatorCode: subTpl.d.code,
              },
            ],
          };
        });

        const startTln = safeSpec.shortAnswer.length;
        const newTln = Array.from({ length: tlnCount }, (_, i) => {
          const unitObj = newUnits[i % newUnits.length];
          const uDef = matchQuestionToUnitDef(unitObj.content + ' ' + trimmedContent);
          return {
            id: `tln-app-${Date.now()}-${i + 1}`,
            questionLabel: `Câu ${startTln + i + 1}`,
            unitId: unitObj.id,
            description: uDef.tlnTemplate.desc,
            cellKey: uDef.tlnTemplate.cellKey,
            indicatorCode: uDef.tlnTemplate.code,
            score: 0.5,
          };
        });

        const startTl = safeSpec.essay.length;
        const newTl = Array.from({ length: tlCount }, (_, i) => {
          const unitObj = newUnits[i % newUnits.length];
          const uDef = matchQuestionToUnitDef(unitObj.content + ' ' + trimmedContent);
          return {
            id: `tl-app-${Date.now()}-${i + 1}`,
            questionLabel: `Câu ${startTl + i + 1}`,
            unitId: unitObj.id,
            description: uDef.tlTemplate.desc,
            cellKey: uDef.tlTemplate.cellKey,
            indicatorCode: uDef.tlTemplate.code,
            score: 1.0,
          };
        });

        const updatedSpec: SpecificationData = {
          multipleChoice: [...safeSpec.multipleChoice, ...newTn],
          trueFalse: [...safeSpec.trueFalse, ...newDs],
          shortAnswer: [...safeSpec.shortAnswer, ...newTln],
          essay: [...safeSpec.essay, ...newTl],
        };

        const syncedMatrix = syncMatrixFromSpec(updatedTopics, updatedSpec);
        return {
          updatedTopics: syncedMatrix,
          updatedSpec,
          addedUnitsCount: newUnits.length,
          addedQuestionsCount: tnCount + dsCount + tlnCount + tlCount,
        };
      };

      const fallbackResult = buildFallbackAppend();

      const activeApiKey =
        clientApiKey?.trim() ||
        (req.headers['x-gemini-api-key'] as string)?.trim() ||
        process.env.GEMINI_API_KEY;

      if (!activeApiKey || activeApiKey === 'MY_GEMINI_API_KEY' || (!activeApiKey.startsWith('AIzaSy') && activeApiKey.length < 35)) {
        res.json({ ...fallbackResult, source: 'structured-parser' });
        return;
      }

      try {
        const existingTopicsList = safeTopics
          .map((t: MatrixTopic) => `- Chủ đề "${t.topicName}": ${t.units.map((u) => u.content).join(', ')}`)
          .join('\n');

        const prompt = `Bạn là chuyên gia thẩm định Ma trận và Bảng đặc tả đề kiểm tra môn Toán theo GDPT 2018.
Giáo viên muốn BỔ SUNG thêm nội dung kiến thức bài kiểm tra sau đây vào Ma trận & Bảng đặc tả hiện có:
--- NỘI DUNG BÀI KIỂM TRA BỔ SUNG ---
${trimmedContent}
--- HẾT NỘI DUNG ---

Các chủ đề hiện có trong Ma trận:
${existingTopicsList || '(Chưa có chủ đề)'}

Yêu cầu:
1. Đặt tên Chủ đề (topicName, viết hoa) và các Đơn vị kiến thức cụ thể (units) tương ứng với nội dung được bổ sung.
2. Sinh câu hỏi bổ sung theo số lượng yêu cầu:
   - multipleChoice: ${tnCount} câu (mỗi câu 0.25 điểm)
   - trueFalse: ${dsCount} câu (mỗi câu gồm 4 ý a, b, c, d, 1.0 điểm)
   - shortAnswer: ${tlnCount} câu (mỗi câu 0.5 điểm)
   - essay: ${tlCount} câu (mỗi câu 1.0 điểm)
3. Quy tắc mã cellKey: "TD_Biet", "TD_Hieu", "TD_VD", "GQ_Biet", "GQ_Hieu", "GQ_VD", "MH_Biet", "MH_Hieu", "MH_VD".
4. Quy tắc indicatorCode: TD1.1, TD1.2, TD1.3, TD2.1, TD3.3, GQ1.1, GQ1.2, GQ1.3, GQ1.4, GQ1.5, GQ2.1, GQ3.1, GQ3.2, MH1.1, MH1.2, MH2.1.
5. Mô tả YCCĐ (description) ngắn gọn, súc tích (1 câu trực tiếp < 20 từ) chuẩn GDPT 2018.`;

        const response = await callGeminiWithFallback(
          activeApiKey,
          prompt,
          {
            systemInstruction:
              'Bạn là chuyên gia thẩm định Ma trận & Bảng đặc tả môn Toán GDPT 2018. Hãy phân loại chính xác nội dung bổ sung và sinh câu hỏi ngắn gọn theo JSON schema.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                topicName: { type: Type.STRING },
                units: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                multipleChoice: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      unitName: { type: Type.STRING },
                      description: { type: Type.STRING },
                      cellKey: { type: Type.STRING },
                      indicatorCode: { type: Type.STRING },
                    },
                    required: ['description', 'cellKey', 'indicatorCode'],
                  },
                },
                trueFalse: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      unitName: { type: Type.STRING },
                      subItems: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            subLabel: { type: Type.STRING },
                            description: { type: Type.STRING },
                            cellKey: { type: Type.STRING },
                            indicatorCode: { type: Type.STRING },
                          },
                          required: ['subLabel', 'description', 'cellKey', 'indicatorCode'],
                        },
                      },
                    },
                    required: ['subItems'],
                  },
                },
                shortAnswer: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      unitName: { type: Type.STRING },
                      description: { type: Type.STRING },
                      cellKey: { type: Type.STRING },
                      indicatorCode: { type: Type.STRING },
                    },
                    required: ['description', 'cellKey', 'indicatorCode'],
                  },
                },
                essay: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      unitName: { type: Type.STRING },
                      description: { type: Type.STRING },
                      cellKey: { type: Type.STRING },
                      indicatorCode: { type: Type.STRING },
                    },
                    required: ['description', 'cellKey', 'indicatorCode'],
                  },
                },
              },
              required: ['topicName', 'units'],
            },
          },
          speedMode
        );

        const parsed = JSON.parse((response.text ?? '{}').trim());
        const topicName = String(parsed.topicName || 'CHỦ ĐỀ BỔ SUNG').toUpperCase();
        const unitsList: string[] = Array.isArray(parsed.units) && parsed.units.length > 0 ? parsed.units : [trimmedContent];

        const createdUnits = unitsList.map((uName, idx) => ({
          id: `u-ai-app-${Date.now()}-${idx + 1}`,
          content: String(uName),
          cells: emptyCells(),
        }));

        let finalTopics: MatrixTopic[] = [];
        if (targetTopicId && targetTopicId !== 'new') {
          const found = safeTopics.some((t: MatrixTopic) => t.id === targetTopicId);
          if (found) {
            finalTopics = safeTopics.map((t: MatrixTopic) =>
              t.id === targetTopicId ? { ...t, units: [...t.units, ...createdUnits] } : t
            );
          } else {
            finalTopics = [...safeTopics, { id: `topic-ai-app-${Date.now()}`, topicName, units: createdUnits }];
          }
        } else {
          finalTopics = [...safeTopics, { id: `topic-ai-app-${Date.now()}`, topicName, units: createdUnits }];
        }

        const validCells = new Set<CellKey>([
          'TD_Biet', 'TD_Hieu', 'TD_VD',
          'GQ_Biet', 'GQ_Hieu', 'GQ_VD',
          'MH_Biet', 'MH_Hieu', 'MH_VD',
        ]);
        const sanitizeCell = (c: string, def: CellKey): CellKey =>
          validCells.has(c as CellKey) ? (c as CellKey) : def;

        const findUnitId = (unitNameOrDesc?: string): string => {
          if (!unitNameOrDesc) return createdUnits[0]?.id || 'u-ai-app-1';
          const match = createdUnits.find((u) =>
            u.content.toLowerCase().includes(unitNameOrDesc.toLowerCase()) ||
            unitNameOrDesc.toLowerCase().includes(u.content.toLowerCase())
          );
          return match ? match.id : createdUnits[0]?.id || 'u-ai-app-1';
        };

        const startTn = safeSpec.multipleChoice.length;
        const addedTn = (Array.isArray(parsed.multipleChoice) ? parsed.multipleChoice : []).map((item: any, idx: number) => ({
          id: `tn-ai-app-${Date.now()}-${idx + 1}`,
          questionLabel: `Câu ${startTn + idx + 1}`,
          unitId: findUnitId(item.unitName),
          description: String(item.description || `Nhận biết kiến thức về ${createdUnits[0]?.content || 'nội dung mới'}.`),
          cellKey: sanitizeCell(item.cellKey, 'TD_Biet'),
          indicatorCode: String(item.indicatorCode || 'TD1.1'),
          score: 0.25,
        }));

        const startDs = safeSpec.trueFalse.length;
        const addedDs = (Array.isArray(parsed.trueFalse) ? parsed.trueFalse : []).map((item: any, idx: number) => ({
          id: `ds-ai-app-${Date.now()}-${idx + 1}`,
          questionLabel: `Câu ${startDs + idx + 1}`,
          unitId: findUnitId(item.unitName),
          score: 1.0,
          subItems: (Array.isArray(item.subItems) ? item.subItems : []).slice(0, 4).map((sub: any, sIdx: number) => ({
            subLabel: (['a', 'b', 'c', 'd'][sIdx] || 'a') as 'a' | 'b' | 'c' | 'd',
            description: String(sub.description || `Yêu cầu cần đạt ý ${['a', 'b', 'c', 'd'][sIdx]}`),
            cellKey: sanitizeCell(sub.cellKey, (['TD_Biet', 'TD_Hieu', 'GQ_Hieu', 'GQ_VD'][sIdx] || 'TD_Biet') as CellKey),
            indicatorCode: String(sub.indicatorCode || (['TD1.1', 'TD1.3', 'GQ2.1', 'GQ3.2'][sIdx] || 'TD1.1')),
          })),
        }));

        const startTln = safeSpec.shortAnswer.length;
        const addedTln = (Array.isArray(parsed.shortAnswer) ? parsed.shortAnswer : []).map((item: any, idx: number) => ({
          id: `tln-ai-app-${Date.now()}-${idx + 1}`,
          questionLabel: `Câu ${startTln + idx + 1}`,
          unitId: findUnitId(item.unitName),
          description: String(item.description || `Vận dụng giải bài toán ${createdUnits[0]?.content || 'nội dung mới'}.`),
          cellKey: sanitizeCell(item.cellKey, 'GQ_VD'),
          indicatorCode: String(item.indicatorCode || 'GQ3.1'),
          score: 0.5,
        }));

        const startTl = safeSpec.essay.length;
        const addedTl = (Array.isArray(parsed.essay) ? parsed.essay : []).map((item: any, idx: number) => ({
          id: `tl-ai-app-${Date.now()}-${idx + 1}`,
          questionLabel: `Câu ${startTl + idx + 1}`,
          unitId: findUnitId(item.unitName),
          description: String(item.description || `Vận dụng thực tiễn liên quan đến ${createdUnits[0]?.content || 'nội dung mới'}.`),
          cellKey: sanitizeCell(item.cellKey, 'MH_VD'),
          indicatorCode: String(item.indicatorCode || 'MH2.1'),
          score: 1.0,
        }));

        const finalSpec: SpecificationData = {
          multipleChoice: [...safeSpec.multipleChoice, ...addedTn],
          trueFalse: [...safeSpec.trueFalse, ...addedDs],
          shortAnswer: [...safeSpec.shortAnswer, ...addedTln],
          essay: [...safeSpec.essay, ...addedTl],
        };

        const syncedMatrix = syncMatrixFromSpec(finalTopics, finalSpec);

        res.json({
          updatedTopics: syncedMatrix,
          updatedSpec: finalSpec,
          addedUnitsCount: createdUnits.length,
          addedQuestionsCount: addedTn.length + addedDs.length + addedTln.length + addedTl.length,
          source: 'gemini',
        });
      } catch (geminiError: any) {
        const isQuota =
          geminiError?.message === 'QUOTA_EXCEEDED' ||
          String(geminiError?.message || '').includes('429') ||
          String(geminiError?.message || '').includes('RESOURCE_EXHAUSTED') ||
          String(geminiError?.message || '').includes('Quota exceeded');

        res.json({
          ...fallbackResult,
          source: 'structured-parser',
          warning: isQuota
            ? 'Hạn ngạch miễn phí của model máy chủ đã đạt giới hạn trong ngày. Bạn có thể nhập Gemini API Key cá nhân để tiếp tục tạo đề không giới hạn.'
            : undefined,
          quotaExceeded: isQuota,
        });
      }
    } catch (err: any) {
      console.error('Server error handling /api/append-exam-content:', err);
      res.status(500).json({ error: err?.message || 'Lỗi bổ sung nội dung bài kiểm tra.' });
    }
  });

  app.post('/api/refine-specification', async (req, res) => {
    try {
      const {
        specification,
        matrixTopics = [],
        examText = '',
        customGuidance = '',
        apiKey: clientApiKey = '',
        speedMode = 'fast',
      } = req.body || {};

      if (!specification) {
        res.status(400).json({ error: 'Thiếu dữ liệu bảng đặc tả cần tinh chỉnh.' });
        return;
      }

      const safeSpec: SpecificationData = {
        multipleChoice: Array.isArray(specification.multipleChoice) ? specification.multipleChoice : [],
        trueFalse: Array.isArray(specification.trueFalse) ? specification.trueFalse : [],
        shortAnswer: Array.isArray(specification.shortAnswer) ? specification.shortAnswer : [],
        essay: Array.isArray(specification.essay) ? specification.essay : [],
      };
      const safeTopics: MatrixTopic[] = Array.isArray(matrixTopics) ? matrixTopics : [];

      // Local fallback refiner that maps pasted examText or curriculum units to exact GDPT 2018 requirements
      // AND updates matrixTopics if new topics (such as Mệnh đề & Tập hợp) are present in examText
      const buildLocalRefined = (): { spec: SpecificationData; topics: MatrixTopic[] } => {
        const trimmedExam = String(examText || '').trim();
        if (trimmedExam.length > 15) {
          const parsedAnalysis = parseRawExamText(trimmedExam);
          if (parsedAnalysis.questions.length > 0) {
            const parsedDoc = buildDocumentFromParsedExam(parsedAnalysis);
            return {
              spec: parsedDoc.specification,
              topics: parsedDoc.matrixTopics,
            };
          }
        }

        const defaultSpec = DEFAULT_TOAN_10_DOCUMENT.specification;
        const updatedSpec: SpecificationData = {
          multipleChoice: safeSpec.multipleChoice.map((q, idx) => {
            const ref = defaultSpec.multipleChoice.find((d) => d.unitId === q.unitId && d.cellKey === q.cellKey) || defaultSpec.multipleChoice[idx];
            return {
              ...q,
              description: ref?.description || q.description,
              indicatorCode: ref?.indicatorCode || q.indicatorCode,
            };
          }),
          trueFalse: safeSpec.trueFalse.map((q, idx) => {
            const ref = defaultSpec.trueFalse.find((d) => d.unitId === q.unitId) || defaultSpec.trueFalse[idx];
            return {
              ...q,
              subItems: q.subItems.map((si, sIdx) => ({
                ...si,
                description: ref?.subItems[sIdx]?.description || si.description,
                cellKey: ref?.subItems[sIdx]?.cellKey || si.cellKey,
                indicatorCode: ref?.subItems[sIdx]?.indicatorCode || si.indicatorCode,
              })),
            };
          }),
          shortAnswer: safeSpec.shortAnswer.map((q, idx) => {
            const ref = defaultSpec.shortAnswer.find((d) => d.unitId === q.unitId) || defaultSpec.shortAnswer[idx];
            return {
              ...q,
              description: ref?.description || q.description,
              cellKey: ref?.cellKey || q.cellKey,
              indicatorCode: ref?.indicatorCode || q.indicatorCode,
            };
          }),
          essay: safeSpec.essay,
        };
        return {
          spec: updatedSpec,
          topics: syncMatrixFromSpec(safeTopics, updatedSpec),
        };
      };

      const fallbackRefined = buildLocalRefined();
      const fallbackSpec = fallbackRefined.spec;
      const fallbackTopics = fallbackRefined.topics;

      const activeApiKey =
        clientApiKey?.trim() ||
        (req.headers['x-gemini-api-key'] as string)?.trim() ||
        process.env.GEMINI_API_KEY;

      if (!activeApiKey || activeApiKey === 'MY_GEMINI_API_KEY' || (!activeApiKey.startsWith('AIzaSy') && activeApiKey.length < 35)) {
        res.json({ updatedSpec: fallbackSpec, updatedTopics: fallbackTopics, source: 'structured-rules' });
        return;
      }

      try {
        const questionsOverview = [
          ...safeSpec.multipleChoice.map((q) => `TN - ${q.questionLabel}: hiện tại="${q.description}" (cellKey=${q.cellKey})`),
          ...safeSpec.trueFalse.flatMap((q) =>
            q.subItems.map((si) => `DS - ${q.questionLabel} ý ${si.subLabel}: hiện tại="${si.description}" (cellKey=${si.cellKey})`)
          ),
          ...safeSpec.shortAnswer.map((q) => `TLN - ${q.questionLabel}: hiện tại="${q.description}" (cellKey=${q.cellKey})`),
          ...safeSpec.essay.map((q) => `TL - ${q.questionLabel}: hiện tại="${q.description}" (cellKey=${q.cellKey})`),
        ].join('\n');

        const prompt = `Bạn là chuyên gia thẩm định Ma trận & Bảng đặc tả đề kiểm tra môn Toán chuẩn GDPT 2018 của Bộ GD&ĐT Việt Nam.
Giáo viên phản ánh: Các nội dung trong Bảng đặc tả hiện tại còn chung chung, CHƯA SÁT VỚI ĐỀ KIỂM TRA.
Hãy tinh chỉnh lại cột Yêu cầu cần đạt (description) cho từng câu hỏi để:
1. Nêu rõ đối tượng toán học, dạng thức, công thức (ax²+bx+c, VTCP u, VTPT n, đường tròn, khoảng cách, tổ hợp P_n, A_n^k, C_n^k,...) và nhiệm vụ cụ thể của câu hỏi.
2. Từng ý a, b, c, d của câu Đúng/Sai phải thể hiện cụ thể khẳng định toán học của câu đó.
3. Độ dài súc tích (1 câu trực tiếp < 30 từ), đúng văn phong Thông tư Bộ GD&ĐT.

${examText ? `--- NỘI DUNG ĐỀ THI ĐỐI CHIẾU ---\n${examText}\n--- HẾT NỘI DUNG ĐỀ THI ---` : ''}
${customGuidance ? `--- LỜI DẶN CỦA GIÁO VIÊN: ${customGuidance} ---` : ''}

Danh sách câu hỏi cần tinh chỉnh:
${questionsOverview}

Trả về cấu trúc JSON đúng số lượng câu hỏi và mã định danh.`;

        const response = await callGeminiWithFallback(
          activeApiKey,
          prompt,
          {
            systemInstruction:
              'Bạn là chuyên gia thẩm định đề thi môn Toán THPT chuẩn GDPT 2018. Hãy tinh chỉnh các dòng mô tả YCCĐ trong Bảng đặc tả cho sát với câu hỏi kiểm tra thực tế, có công thức và điều kiện toán học rõ ràng.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                multipleChoice: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['description'],
                  },
                },
                trueFalse: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      subItems: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            subLabel: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ['subLabel', 'description'],
                        },
                      },
                    },
                    required: ['subItems'],
                  },
                },
                shortAnswer: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['description'],
                  },
                },
                essay: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['description'],
                  },
                },
              },
            },
          },
          speedMode
        );

        const parsed = JSON.parse((response.text ?? '{}').trim());

        const updatedSpec: SpecificationData = {
          multipleChoice: safeSpec.multipleChoice.map((q, idx) => ({
            ...q,
            description: parsed.multipleChoice?.[idx]?.description || fallbackSpec.multipleChoice[idx]?.description || q.description,
          })),
          trueFalse: safeSpec.trueFalse.map((q, idx) => ({
            ...q,
            subItems: q.subItems.map((si, sIdx) => ({
              ...si,
              description:
                parsed.trueFalse?.[idx]?.subItems?.[sIdx]?.description ||
                fallbackSpec.trueFalse[idx]?.subItems?.[sIdx]?.description ||
                si.description,
            })),
          })),
          shortAnswer: safeSpec.shortAnswer.map((q, idx) => ({
            ...q,
            description: parsed.shortAnswer?.[idx]?.description || fallbackSpec.shortAnswer[idx]?.description || q.description,
          })),
          essay: safeSpec.essay.map((q, idx) => ({
            ...q,
            description: parsed.essay?.[idx]?.description || fallbackSpec.essay[idx]?.description || q.description,
          })),
        };

        const syncedTopics = syncMatrixFromSpec(fallbackTopics, updatedSpec);
        res.json({ updatedSpec, updatedTopics: syncedTopics, source: 'gemini' });
      } catch (geminiError: any) {
        res.json({ updatedSpec: fallbackSpec, updatedTopics: fallbackTopics, source: 'structured-rules' });
      }
    } catch (err: any) {
      console.error('Server error handling /api/refine-specification:', err);
      res.status(500).json({ error: err?.message || 'Lỗi tinh chỉnh bảng đặc tả.' });
    }
  });
}

registerRoutes();

/**
 * Chạy handler tại trình duyệt, trả về Response giống hệt server cũ.
 */
export async function handleApiRequest(path: string, body: any): Promise<Response> {
  const handler = routeTable[path];
  if (!handler) {
    return new Response(JSON.stringify({ error: 'Không tìm thấy API: ' + path }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  let status = 200;
  let payload: any = {};
  const res = {
    status(code: number) { status = code; return res; },
    json(data: any) { payload = data; return res; },
  };
  try {
    await handler({ body: body || {}, headers: {} }, res);
  } catch (err: any) {
    status = 500;
    payload = { error: err?.message || 'Lỗi xử lý.' };
  }
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Chặn fetch('/api/...') và xử lý ngay trên trình duyệt (GitHub Pages không có server).
 */
export function installApiShim() {
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : (input as Request).url;
    const m = url.match(/\/api\/[A-Za-z0-9\-_]+/);
    if (m && routeTable[m[0]]) {
      let body: any = {};
      try {
        const raw = init?.body ?? (input instanceof Request ? await input.clone().text() : undefined);
        body = typeof raw === 'string' ? JSON.parse(raw) : {};
      } catch { body = {}; }
      return handleApiRequest(m[0], body);
    }
    return realFetch(input as any, init);
  };
}
