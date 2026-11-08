export type CompetencyDomain = 'TD' | 'GQ' | 'MH';
export type ThinkingLevelKey = 'Biet' | 'Hieu' | 'VD';

export type CellKey =
  | 'TD_Biet'
  | 'TD_Hieu'
  | 'TD_VD'
  | 'GQ_Biet'
  | 'GQ_Hieu'
  | 'GQ_VD'
  | 'MH_Biet'
  | 'MH_Hieu'
  | 'MH_VD';

export const ALL_CELL_KEYS: CellKey[] = [
  'TD_Biet',
  'TD_Hieu',
  'TD_VD',
  'GQ_Biet',
  'GQ_Hieu',
  'GQ_VD',
  'MH_Biet',
  'MH_Hieu',
  'MH_VD',
];

export interface HeaderInfo {
  department: string; // VD: SỞ GD & ĐT ĐỒNG NAI
  school: string;     // VD: TRƯỜNG TH-THCS - THPT SONG NGỮ Á CHÂU
  examTitle: string;  // VD: THIẾT KẾ ĐỀ
  examName: string;   // VD: KIỂM TRA GIỮA HỌC KÌ II
  gradeAndYear: string; // VD: KHỐI 10 – NĂM HỌC: 2025 – 2026
  subject: string;    // VD: Môn: Toán
}

export interface KnowledgeSection {
  id: string;
  title: string;      // VD: Phần số và đại số
  bullets: string[];  // VD: ["Tam thức bậc hai và dấu của tam thức bậc hai", ...]
}

export interface ObjectivesInfo {
  knowledgeSections: KnowledgeSection[];
  skills: string[];
}

export interface FormatInfo {
  structureText: string; // VD: 70% trắc nghiệm (nhiều lựa chọn, đúng - sai, trả lời ngắn) – 30% tự luận
  durationText: string;  // VD: 90 phút
  footnoteText: string;  // VD: Kí hiệu: TN - Câu trắc nghiệm nhiều lựa chọn, ĐS - Câu trắc nghiệm Đúng – Sai, TLN – Câu trắc nghiệm trả lời ngắn.
}

export interface MatrixUnit {
  id: string;
  content: string; // VD: Dấu của tam thức bậc hai
  cells: Record<CellKey, string>; // VD: { TD_Biet: "02TN\n(TD1.2, TD2.1)", GQ_Biet: "1TN\n(GQ1.2)", ... }
}

export interface MatrixTopic {
  id: string;
  topicName: string; // VD: BẤT PHƯƠNG TRÌNH BẬC HAI 1 ẨN
  units: MatrixUnit[];
}

/**
 * 1. Trắc nghiệm nhiều lựa chọn (TN)
 */
export interface SpecItemMultipleChoice {
  id: string;
  questionLabel: string; // VD: "Câu 1"
  unitId: string;        // Liên kết tới MatrixUnit.id
  description: string;   // Mạch kiến thức/ Nội dung
  cellKey: CellKey;      // Ô năng lực - cấp độ tư duy (VD: TD_Biet)
  indicatorCode: string; // VD: "TD1.2"
  score: number;         // VD: 0.25
}

/**
 * 2. Trắc nghiệm Đúng/Sai (ĐS) - Mỗi câu có 4 ý a, b, c, d
 */
export interface SpecSubItemTrueFalse {
  subLabel: 'a' | 'b' | 'c' | 'd';
  description: string;
  cellKey: CellKey;
  indicatorCode: string;
}

export interface SpecItemTrueFalse {
  id: string;
  questionLabel: string; // VD: "Câu 1"
  unitId: string;
  score: number;         // VD: 1.0
  subItems: SpecSubItemTrueFalse[];
}

/**
 * 3. Trắc nghiệm trả lời ngắn (TLN)
 */
export interface SpecItemShortAnswer {
  id: string;
  questionLabel: string; // VD: "Câu 1"
  unitId: string;
  description: string;
  cellKey: CellKey;
  indicatorCode: string;
  score: number;         // VD: 0.5
}

/**
 * 4. Tự luận (TL)
 */
export interface SpecItemEssay {
  id: string;
  questionLabel: string; // VD: "Câu 1"
  unitId: string;
  description: string;
  cellKey: CellKey;
  indicatorCode: string;
  score: number;         // VD: 1.0
}

export interface SpecificationData {
  multipleChoice: SpecItemMultipleChoice[];
  trueFalse: SpecItemTrueFalse[];
  shortAnswer: SpecItemShortAnswer[];
  essay: SpecItemEssay[];
}

export interface ExamDocument {
  id: string;
  title: string;
  header: HeaderInfo;
  objectives: ObjectivesInfo;
  format: FormatInfo;
  matrixTopics: MatrixTopic[];
  specification: SpecificationData;
  sourceQuestions?: Record<string, string>;
}

export interface MatrixSummaryStats {
  byCell: Record<CellKey, number>;
  byDomain: Record<CompetencyDomain, number>;
  byLevel: Record<ThinkingLevelKey, number>;
  unitTotals: Record<string, number>;
  grandTotal: number;
}

export interface SpecSummaryStats {
  byCell: Record<CellKey, number>;
  byDomain: Record<CompetencyDomain, number>;
  byLevel: Record<ThinkingLevelKey, number>;
  scoreByLevel: Record<ThinkingLevelKey, number>;
  totalCommands: number;
  totalScore: number;
}

export interface CrossCheckDiscrepancy {
  cellKey: CellKey;
  matrixCount: number;
  specCount: number;
}

export interface CrossCheckReport {
  isSynced: boolean;
  matrixTotal: number;
  specTotal: number;
  discrepancies: CrossCheckDiscrepancy[];
}
