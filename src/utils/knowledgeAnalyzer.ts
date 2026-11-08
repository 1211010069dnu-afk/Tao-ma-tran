import {
  CellKey,
  CompetencyDomain,
  ExamDocument,
  MatrixTopic,
  SpecificationData,
  ThinkingLevelKey,
} from '../types/exam';
import { CURRICULUM_UNITS, CurriculumUnitDef, matchQuestionToUnitDef } from './examParser';
import { YCCD_DATABASE, YCCDItem } from '../data/yccdDatabase';

export type AuditWarningType =
  | 'missing_mh'
  | 'unnecessary_mh'
  | 'topic_mismatch'
  | 'level_mismatch'
  | 'generic_yccd';

export interface KnowledgeAuditWarning {
  id: string;
  type: AuditWarningType;
  severity: 'high' | 'medium';
  title: string;
  message: string;
  suggestedUnitId?: string;
  suggestedUnitName?: string;
  suggestedCellKey?: CellKey;
  suggestedIndicatorCode?: string;
  suggestedDescription?: string;
}

export interface QuestionSpecMappingItem {
  key: string; // e.g., "TN:ksdn-tn-1" or "DS:ksdn-ds-1:a"
  partType: 'TN' | 'DS' | 'TLN' | 'TL';
  partTitle: string;
  itemId: string;
  subLabel?: 'a' | 'b' | 'c' | 'd';
  questionLabel: string; // e.g., "Câu 1" or "Câu 1a"
  questionText: string;
  stemText?: string;
  unitId: string;
  topicName: string;
  unitName: string;
  description: string;
  cellKey: CellKey;
  domain: CompetencyDomain;
  level: ThinkingLevelKey;
  indicatorCode: string;
  score: number;
  warnings: KnowledgeAuditWarning[];
}

export interface DeepMathAnalysisResult {
  cellKey: CellKey;
  domain: CompetencyDomain;
  level: ThinkingLevelKey;
  indicatorCode: string;
  recommendedDescription: string;
  matchedUnitDef: CurriculumUnitDef;
  isRealWorld: boolean;
  hasParameter: boolean;
  reasoning: string;
}

/**
 * Nguyên văn câu hỏi trong Đề Khảo Sát Chất Lượng Đầu Năm Toán 10 (file 10.pdf)
 */
export const KHAO_SAT_DAU_NAM_QUESTION_TEXTS: Record<string, string> = {
  'TN:Câu 1':
    'Câu 1. Cho tập hợp A = {x ∈ ℕ | x ≤ 4}. Tập hợp A viết dưới dạng liệt kê các phần tử là: A. {1; 2; 3; 4}. B. {0; 1; 2; 3; 4}. C. {0; 1; 2; 3}. D. {1; 2; 3}.',
  'TN:Câu 2':
    'Câu 2. Giá trị của biểu thức P = sin 30° · cos 60° + sin 60° · cos 30° bằng: A. 1. B. √3/2. C. 1/2. D. 0.',
  'TN:Câu 3':
    'Câu 3. Mệnh đề phủ định của mệnh đề P: "∀x ∈ ℝ, x² + 1 > 0" là: A. "∃x ∈ ℝ, x² + 1 ≤ 0". B. "∀x ∈ ℝ, x² + 1 ≤ 0". C. "∃x ∈ ℝ, x² + 1 < 0". D. "∃x ∈ ℝ, x² + 1 = 0".',
  'TN:Câu 4':
    'Câu 4. Trong các câu sau, câu nào là một mệnh đề toán học? A. Hôm nay trời đẹp quá! B. Bạn có thích học môn Toán không? C. Số 15 là một số nguyên tố. D. x + 3 = 7.',
  'TN:Câu 5':
    'Câu 5. Đường thẳng biểu diễn hình học tất cả các nghiệm của phương trình bậc nhất hai ẩn 2x - y = 3 đi qua điểm nào sau đây? A. M(2; 1). B. N(1; 2). C. P(0; 3). D. Q(-1; 1).',
  'TN:Câu 6':
    'Câu 6. Đồ thị của hàm số bậc nhất y = -2x + 4 cắt trục tung tại điểm có tung độ bằng: A. 4. B. -2. C. 2. D. -4.',
  'TN:Câu 7':
    'Câu 7. Trong các mệnh đề sau, mệnh đề nào là mệnh đề đúng? A. π là một số hữu tỉ. B. Phương trình x² + 1 = 0 có nghiệm thực. C. 12 chia hết cho 3. D. √2 là số tự nhiên.',
  'TN:Câu 8':
    'Câu 8. Cho góc α (0° ≤ α ≤ 180°). Khẳng định nào sau đây sai? A. sin(180° - α) = sin α. B. cos(180° - α) = -cos α. C. tan(180° - α) = tan α. D. cot(180° - α) = -cot α.',
  'TN:Câu 9':
    'Câu 9. Nghiệm của hệ hai phương trình bậc nhất hai ẩn { x + 2y = 5 ; 2x - y = 0 } là: A. (1; 2). B. (2; 1). C. (-1; 3). D. (0; 5).',
  'TN:Câu 10':
    'Câu 10. Tập nghiệm của bất phương trình bậc nhất một ẩn 2x - 4 > 0 là: A. x > 2. B. x < 2. C. x ≥ 2. D. x > -2.',
  'TN:Câu 11':
    'Câu 11. Cho tam giác ABC vuông tại A có góc B = 60°. Tỉ số lượng giác sin C bằng: A. 1/2. B. √3/2. C. √3. D. √2/2.',
  'TN:Câu 12':
    'Câu 12. Cho hình chữ nhật ABCD có AB = 4 cm, góc ACB = 30°. Độ dài đường chéo AC bằng: A. 8 cm. B. 4√3 cm. C. 2 cm. D. 4√2 cm.',
  'DS:Câu 1:stem':
    'Câu 1 (Đúng/Sai). Xét tính đúng, sai của các mệnh đề sau:',
  'DS:Câu 1:a':
    'a) Mệnh đề A: "Năm 2024 là năm nhuận" là một mệnh đề đúng.',
  'DS:Câu 1:b':
    'b) Câu "x + 5 > 0" là một mệnh đề toán học.',
  'DS:Câu 1:c':
    'c) Với x = 2 thì mệnh đề chứa biến P(x): "2x² - 5x + 3 = 0" trở thành một mệnh đề đúng.',
  'DS:Câu 1:d':
    'd) Mệnh đề "∃x ∈ ℝ: x² - 4x + 4 ≤ 0" là mệnh đề đúng.',
  'DS:Câu 2:stem':
    'Câu 2 (Đúng/Sai). Một ô tô dự định đi hết quãng đường AB dài x (km) (x > 0) với vận tốc dự định 50 km/h. Thực tế trên nửa quãng đường đầu ô tô đi với vận tốc 40 km/h và nửa quãng đường sau đi với vận tốc 60 km/h:',
  'DS:Câu 2:a':
    'a) Thời gian ô tô dự định đi hết quãng đường AB là x/50 (giờ).',
  'DS:Câu 2:b':
    'b) Thời gian thực tế ô tô đi nửa quãng đường đầu là x/80 (giờ) và nửa quãng đường sau là x/120 (giờ).',
  'DS:Câu 2:c':
    'c) Nếu ô tô đến B chậm hơn dự định 15 phút (1/4 giờ) thì phương trình lập được là x/80 + x/120 - x/50 = 1/4.',
  'DS:Câu 2:d':
    'd) Giải phương trình thực tế ta tìm được độ dài quãng đường AB bằng 300 km.',
  'TLN:Câu 1':
    'Câu 1 (Trả lời ngắn). Một cầu trượt trong công viên có độ cao 2,8 m và đặt nghiêng so với mặt đất một góc 28°. Tính chiều dài của mặt cầu trượt (làm tròn kết quả đến hàng phần mười của mét).',
  'TLN:Câu 2':
    'Câu 2 (Trả lời ngắn). Cho tập hợp B = {x ∈ ℤ | -2 ≤ x < 4}. Tập hợp B có bao nhiêu phần tử?',
  'TLN:Câu 3':
    'Câu 3 (Trả lời ngắn). Cho góc nhọn α thỏa mãn cot α = 3 cos α. Tính giá trị của biểu thức M = sin² α + cos α (làm tròn đến hàng phần trăm).',
  'TLN:Câu 4':
    'Câu 4 (Trả lời ngắn). Tìm giá trị của tham số m để phương trình bậc nhất (m² - 4)x = m(m + 2) vô nghiệm.',
  'TL:Câu 1a':
    'Câu 1a (Tự luận - 0,5đ). Cho tập hợp A = {x ∈ ℕ | x là ước của 12}. Hãy viết tập hợp A bằng cách liệt kê các phần tử.',
  'TL:Câu 1b':
    'Câu 1b (Tự luận - 0,5đ). Điền kí hiệu thích hợp (∈, ∉) vào ô trống: 4 [?] A ; 5 [?] A.',
  'TL:Câu 2':
    'Câu 2 (Tự luận - 1,5đ). Cho mệnh đề P: "∀x ∈ ℝ, x² + 2x + 3 > 0". Xét tính đúng sai của mệnh đề P (có giải thích) và lập mệnh đề phủ định của mệnh đề P.',
  'TL:Câu 3':
    'Câu 3 (Tự luận - 0,5đ). Tính giá trị của biểu thức A = sin² 25° + sin² 45° + sin² 65° - tan 35° · tan 55°.',
};

/**
 * Nguyên văn câu hỏi mẫu Giữa Học Kì II Toán 10
 */
export const GIUA_HK2_QUESTION_TEXTS: Record<string, string> = {
  'TN:Câu 1': 'Câu 1. Biểu thức nào sau đây là một tam thức bậc hai? A. f(x) = 2x² - 5x + 3.',
  'TN:Câu 2': 'Câu 2. Cho tam thức bậc hai f(x) = ax² + bx + c (a ≠ 0) có Δ < 0. Định lí về dấu của tam thức bậc hai khẳng định f(x) cùng dấu với hệ số a với mọi x ∈ ℝ.',
  'TN:Câu 3': 'Câu 3. Quan sát đồ thị hàm số bậc hai y = f(x) có nhánh nằm phía trên trục hoành trong khoảng (1; 4). Xác định dấu của f(x) trên khoảng (1; 4).',
  'TN:Câu 4': 'Câu 4. Cho tam thức bậc hai f(x) = x² - 4x + 3. Bảng xét dấu của f(x) mang dấu âm trên khoảng nào?',
  'TN:Câu 5': 'Câu 5. Dựa vào bảng xét dấu của tam thức bậc hai f(x) = -x² + 5x - 6, viết tập nghiệm của bất phương trình f(x) ≥ 0.',
  'TN:Câu 6': 'Câu 6. Tập nghiệm của bất phương trình bậc hai x² - 3x - 4 < 0 là khoảng nào?',
  'TN:Câu 7': 'Câu 7. Một công việc được hoàn thành bởi một trong hai phương án A hoặc B. Nhận biết quy tắc cộng và quy tắc nhân.',
  'TN:Câu 8': 'Câu 8. Một tổ có 6 học sinh nam và 4 học sinh nữ. Đếm số cách chọn 1 học sinh làm tổ trưởng.',
  'TN:Câu 9': 'Câu 9. Sắp xếp theo thứ tự tăng dần số khả năng khi có ba tình huống đếm đơn giản A, B, C.',
  'TN:Câu 10': 'Câu 10. Phương trình nào sau đây là phương trình đường tròn trong mặt phẳng tọa độ Oxy?',
  'TN:Câu 11': 'Câu 11. Trong mặt phẳng Oxy, xác định tâm I và bán kính R của đường tròn (C): (x - 3)² + (y + 1)² = 16.',
  'TN:Câu 12': 'Câu 12. Viết phương trình đường tròn có tâm I(2; -3) và bán kính R = 5.',
  'DS:Câu 1:stem': 'Câu 1 (Đúng/Sai). Cho phương trình chứa căn thức √(2x² - 3x + 1) = x - 1:',
  'DS:Câu 1:a': 'a) Giá trị x = 0 không phải là nghiệm của phương trình đã cho.',
  'DS:Câu 1:b': 'b) Khi tiến hành bình phương hai vế phương trình, ta viết lại được phương trình 2x² - 3x + 1 = (x - 1)².',
  'DS:Câu 1:c': 'c) Sắp xếp và rút gọn phương trình đã biến đổi ta được phương trình bậc hai x² - x = 0.',
  'DS:Câu 1:d': 'd) Phương trình đã cho có đúng một nghiệm là x = 1.',
  'DS:Câu 2:stem': 'Câu 2 (Đúng/Sai). Một tổ học sinh có 10 người gồm 6 nam và 4 nữ:',
  'DS:Câu 2:a': 'a) Mỗi cách sắp xếp 10 học sinh thành một hàng dọc là một hoán vị của 10 phần tử.',
  'DS:Câu 2:b': 'b) Mỗi cách chọn 3 học sinh bất kỳ trong 10 học sinh đi trực nhật là một tổ hợp chập 3 của 10 phần tử.',
  'DS:Câu 2:c': 'c) Số tổ hợp chập 3 của 10 phần tử bằng 120.',
  'DS:Câu 2:d': 'd) Số cách chọn 3 học sinh làm Lớp trưởng, Lớp phó và Bí thư (vận dụng chỉnh hợp) là 720 cách.',
  'DS:Câu 3:stem': 'Câu 3 (Đúng/Sai). Trong mặt phẳng tọa độ Oxy, cho hai điểm A(1; 2), B(4; 6) và vectơ u = (2; -1):',
  'DS:Câu 3:a': 'a) Tọa độ của điểm A đối với hệ trục tọa độ Oxy là (1; 2).',
  'DS:Câu 3:b': 'b) Tọa độ của vectơ AB là (3; 4) và độ dài vectơ AB bằng 5.',
  'DS:Câu 3:c': 'c) Tọa độ của vectơ tổng AB + u là (5; 3).',
  'DS:Câu 3:d': 'd) Với điểm C(5; -1), áp dụng phương pháp tọa độ vào bài toán giải tam giác ABC.',
  'DS:Câu 4:stem': 'Câu 4 (Đúng/Sai). Trong mặt phẳng tọa độ Oxy, cho đường thẳng d: 3x - 4y + 5 = 0 và điểm M(1; -2):',
  'DS:Câu 4:a': 'a) Một vectơ pháp tuyến (VTPT) của đường thẳng d là n = (3; -4).',
  'DS:Câu 4:b': 'b) Thay tọa độ điểm M vào phương trình đường thẳng d thấy điểm M không thuộc đường thẳng d.',
  'DS:Câu 4:c': 'c) Khoảng cách từ điểm M(1; -2) đến đường thẳng d bằng 16/5.',
  'DS:Câu 4:d': 'd) Vận dụng phương trình đường thẳng để tìm vị trí trạm phát sóng trên d sao cho khoảng cách đến M là ngắn nhất.',
  'TLN:Câu 1': 'Câu 1 (Trả lời ngắn). Giải bất phương trình bậc hai x² - 6x + 5 ≤ 0 và tìm số nghiệm nguyên.',
  'TLN:Câu 2': 'Câu 2 (Trả lời ngắn). Giải bài toán thực tiễn qui về phương trình chứa căn thức √(x² + 12) = x + 2.',
  'TLN:Câu 3': 'Câu 3 (Trả lời ngắn). Trong một giải thể thao có 4 đội bóng thi đấu loại trực tiếp. Vận dụng sơ đồ hình cây tính tổng số trận đấu.',
  'TLN:Câu 4': 'Câu 4 (Trả lời ngắn). Vận dụng tổ hợp tính số cách chọn một ban đại diện gồm 4 người từ 12 ứng cử viên.',
  'TLN:Câu 5': 'Câu 5 (Trả lời ngắn). Tính khoảng cách ngắn nhất (km) từ một tàu biển tại tọa độ A(2; 1) đến bờ biển chạy dọc theo đường thẳng 4x + 3y + 4 = 0.',
  'TLN:Câu 6': 'Câu 6 (Trả lời ngắn). Thiết lập phương trình đường tròn (C) tâm I(1; 2) đi qua A(4; 6) và viết phương trình tiếp tuyến tại A.',
};

const REAL_WORLD_KEYWORDS: RegExp[] = [
  /quãng đường/i,
  /vận tốc/i,
  /chuyển động/i,
  /ô tô/i,
  /xe máy/i,
  /tàu biển/i,
  /cầu trượt/i,
  /cột cờ/i,
  /ngọn tháp/i,
  /hải đăng/i,
  /tia nắng/i,
  /mặt đất/i,
  /giác kế/i,
  /lợi nhuận/i,
  /chi phí/i,
  /doanh thu/i,
  /giá tiền/i,
  /giảm giá/i,
  /lãi suất/i,
  /ngân hàng/i,
  /tiết kiệm/i,
  /dân số/i,
  /năng suất/i,
  /xí nghiệp/i,
  /đội sản xuất/i,
  /bồn nước/i,
  /bể nước/i,
  /cổng parabol/i,
  /hầm vòm/i,
  /tầm bay/i,
  /quỹ đạo/i,
  /trạm phát sóng/i,
  /khu dân cư/i,
  /giải thể thao/i,
  /đội bóng/i,
  /khảo sát học sinh/i,
  /bài toán thực tiễn/i,
  /vấn đề thực tiễn/i,
  /trong thực tế/i,
  /thực tiễn/i,
];

const PARAMETER_OR_VD_KEYWORDS: RegExp[] = [
  /tham số\s*m/i,
  /tìm\s*m\b/i,
  /giá trị của\s*m\b/i,
  /m\^?2\s*-\s*4/i,
  /vô nghiệm/i,
  /nghiệm duy nhất/i,
  /luôn dương/i,
  /luôn âm/i,
  /giá trị lớn nhất/i,
  /giá trị nhỏ nhất/i,
  /nhỏ nhất/i,
  /lớn nhất/i,
  /tối ưu/i,
  /định lí viète/i,
  /hệ thức viète/i,
  /x_1\^2\s*\+\s*x_2\^2/i,
  /x₁²\s*\+\s*x₂²/i,
  /cot\s*α\s*=\s*3\s*cos\s*α/i,
  /sin\^?2\s*25[°⁰]/i,
  /tan\s*35[°⁰]\s*[·.*]\s*tan\s*55[°⁰]/i,
  /xét tính đúng sai.*và lập mệnh đề phủ định/i,
  /chứng minh rằng/i,
  /tiếp tuyến của đường tròn/i,
];

const DIRECT_RECOGNITION_BIET_KEYWORDS: RegExp[] = [
  /câu nào sau đây là (một )?mệnh đề/i,
  /phát biểu nào sau đây là (một )?mệnh đề/i,
  /mệnh đề nào là mệnh đề đúng/i,
  /là một mệnh đề đúng/i,
  /là một mệnh đề toán học/i,
  /điền kí hiệu thích hợp/i,
  /kí hiệu\s*\(?\s*∈\s*,\s*∉\s*\)?/i,
  /dạng liệt kê các phần tử là/i,
  /biểu thức nào sau đây là một tam thức bậc hai/i,
  /phương trình nào sau đây là phương trình đường tròn/i,
  /vectơ pháp tuyến/i,
  /vectơ chỉ phương/i,
  /tọa độ của điểm .* đối với hệ trục/i,
  /cắt trục tung tại điểm có tung độ/i,
  /theo qui tắc cộng/i,
  /theo quy tắc cộng/i,
  /sin\s*30[°⁰]\s*[·.*]?\s*cos\s*60[°⁰]/i,
  /bằng máy tính cầm tay/i,
];

const COMPREHENSION_HIEU_KEYWORDS: RegExp[] = [
  /mệnh đề phủ định của mệnh đề/i,
  /với x\s*=\s*\d+ thì mệnh đề chứa biến/i,
  /∃\s*x\s*∈\s*[Rℝ].*≤\s*0/i,
  /tập nghiệm của bất phương trình/i,
  /nghiệm của hệ (hai )?phương trình/i,
  /biểu diễn hình học tất cả các nghiệm/i,
  /có bao nhiêu phần tử/i,
  /viết tập hợp .* bằng cách liệt kê/i,
  /khẳng định nào sau đây sai.*180[°⁰]\s*-\s*α/i,
  /tam giác .* vuông tại .* góc/i,
  /hình chữ nhật .* độ dài đường chéo/i,
  /bình phương hai vế/i,
  /khoảng cách từ điểm .* đến đường thẳng/i,
  /tọa độ của vectơ/i,
  /thời gian .* dự định đi hết quãng đường/i,
  /thời gian thực tế .* đi nửa quãng đường/i,
];

export function parseCellKey(cellKey: CellKey): {
  domain: CompetencyDomain;
  level: ThinkingLevelKey;
} {
  const [domain, level] = cellKey.split('_') as [CompetencyDomain, ThinkingLevelKey];
  return { domain, level };
}

export function buildCellKey(domain: CompetencyDomain, level: ThinkingLevelKey): CellKey {
  return `${domain}_${level}` as CellKey;
}

export function getDefaultIndicatorForCell(cellKey: CellKey): string {
  const map: Record<CellKey, string> = {
    TD_Biet: 'TD1.1',
    TD_Hieu: 'TD2.1',
    TD_VD: 'TD3.1',
    GQ_Biet: 'GQ1.1',
    GQ_Hieu: 'GQ2.1',
    GQ_VD: 'GQ3.1',
    MH_Biet: 'MH1.1',
    MH_Hieu: 'MH1.2',
    MH_VD: 'MH2.1',
  };
  return map[cellKey] || 'TD1.1';
}

export function isRealWorldQuestionText(text: string): boolean {
  return REAL_WORLD_KEYWORDS.some((rx) => rx.test(text));
}

export function hasParameterOrVDMathStructure(text: string): boolean {
  return PARAMETER_OR_VD_KEYWORDS.some((rx) => rx.test(text));
}

/**
 * Deeply analyzes a single question or sub-item (a, b, c, d) based on its mathematical structure,
 * formulas, and context to determine the accurate GDPT 2018 Competency (TD/GQ/MH), Thinking Level (Biet/Hieu/VD),
 * and YCCĐ description combined with the specific math problem pattern.
 */
export function analyzeQuestionMathStructure(
  questionText: string,
  partType: 'TN' | 'DS' | 'TLN' | 'TL',
  subLabel?: 'a' | 'b' | 'c' | 'd',
  stemText?: string
): DeepMathAnalysisResult {
  const combinedText = stemText ? `${stemText}\n${questionText}` : questionText;
  const matchedUnitDef = matchQuestionToUnitDef(combinedText);

  const isRealWorld = isRealWorldQuestionText(combinedText);
  const hasParameter = hasParameterOrVDMathStructure(questionText);
  const isDirectBiet = DIRECT_RECOGNITION_BIET_KEYWORDS.some((rx) => rx.test(questionText));
  const isHieu = COMPREHENSION_HIEU_KEYWORDS.some((rx) => rx.test(questionText));

  // Determine Thinking Level (Biet / Hieu / VD) from mathematical structure
  let level: ThinkingLevelKey = 'Hieu';
  let reasoning = '';

  if (hasParameter) {
    level = 'VD';
    reasoning = 'Câu hỏi yêu cầu biện luận tham số, biến đổi tổng hợp hoặc vận dụng nhiều bước suy luận.';
  } else if (isDirectBiet && !isHieu) {
    level = 'Biet';
    reasoning = 'Câu hỏi kiểm tra nhận biết khái niệm, kí hiệu toán học hoặc tính giá trị trực tiếp.';
  } else if (isHieu) {
    level = 'Hieu';
    reasoning = 'Câu hỏi yêu cầu biến đổi đại số/hình học 1–2 bước hoặc giải thích tính chất toán học.';
  } else if (partType === 'DS' && subLabel) {
    if (subLabel === 'a') {
      level = isRealWorld ? 'Hieu' : 'Biet';
      reasoning = 'Ý a) kiểm tra nhận biết ban đầu hoặc biểu diễn đại lượng cơ bản theo ẩn.';
    } else if (subLabel === 'b') {
      level = 'Hieu';
      reasoning = 'Ý b) kiểm tra bước biến đổi hoặc thiết lập biểu thức thành phần.';
    } else if (subLabel === 'c') {
      level = isRealWorld ? 'VD' : 'Hieu';
      reasoning = 'Ý c) kiểm tra thiết lập phương trình/hệ thức hoặc tính toán kết quả trung gian.';
    } else {
      level = 'VD';
      reasoning = 'Ý d) kiểm tra vận dụng tổng hợp hoặc giải quyết trọn vẹn bài toán.';
    }
  } else if (partType === 'TLN' || partType === 'TL') {
    level = isDirectBiet ? 'Biet' : isHieu ? 'Hieu' : 'VD';
    reasoning = 'Câu trả lời ngắn / tự luận phân loại theo số bước suy luận toán học.';
  } else {
    level = 'Biet';
    reasoning = 'Câu trắc nghiệm khách quan nhận biết hoặc tính toán cơ bản.';
  }

  // Determine Competency Domain (TD / GQ / MH)
  let domain: CompetencyDomain = 'TD';
  if (isRealWorld) {
    // Special case: if subLabel is 'c' in a real-world equation-setup problem where 'c' focuses on algebraic equation formulation
    if (partType === 'DS' && subLabel === 'c' && /phương trình lập được|biến đổi phương trình/i.test(questionText)) {
      domain = 'GQ';
    } else {
      domain = 'MH';
    }
  } else if (
    level === 'VD' ||
    /giải phương trình|giải bất phương trình|giải hệ|tìm giá trị|tính giá trị|tính độ dài|khoảng cách|tập nghiệm|phần tử|phương trình đường tròn/i.test(
      questionText
    )
  ) {
    domain = 'GQ';
  } else {
    domain = 'TD';
  }

  // Refine domain for specific known conceptual patterns
  if (
    /mệnh đề phủ định|mệnh đề đúng|là một mệnh đề|khẳng định nào sau đây sai|kí hiệu thích hợp|liệt kê các phần tử/i.test(
      questionText
    ) &&
    level !== 'VD'
  ) {
    domain = 'TD';
  }

  const cellKey = buildCellKey(domain, level);

  // Pick indicatorCode accurately
  let indicatorCode = getDefaultIndicatorForCell(cellKey);
  if (cellKey === 'GQ_VD' && /tham số\s*m|vô nghiệm/i.test(questionText)) {
    indicatorCode = 'GQ3.4';
  } else if (cellKey === 'TD_Biet' && /sin\s*30|cos\s*60|máy tính cầm tay/i.test(questionText)) {
    indicatorCode = 'TD2.1';
  } else if (cellKey === 'TD_Hieu' && /tam giác.*vuông|góc nhọn/i.test(questionText)) {
    indicatorCode = 'TD1.2';
  }

  // Build tailored GDPT 2018 + problem-specific description
  let recommendedDescription = '';
  if (partType === 'DS' && subLabel) {
    recommendedDescription = matchedUnitDef.dsSubTemplates[subLabel].desc;
  } else if (partType === 'TLN') {
    recommendedDescription = matchedUnitDef.tlnTemplate.desc;
  } else if (partType === 'TL') {
    recommendedDescription = matchedUnitDef.tlTemplate.desc;
  } else {
    const matchedTpl =
      matchedUnitDef.tnTemplates.find((t) => t.cellKey === cellKey) ||
      matchedUnitDef.tnTemplates[0];
    recommendedDescription = matchedTpl.desc;
  }

  return {
    cellKey,
    domain,
    level,
    indicatorCode,
    recommendedDescription,
    matchedUnitDef,
    isRealWorld,
    hasParameter,
    reasoning,
  };
}

/**
 * Resolves the display question text for any item in ExamDocument
 */
export function resolveQuestionTextForSpecItem(
  doc: ExamDocument,
  partType: 'TN' | 'DS' | 'TLN' | 'TL',
  questionLabel: string,
  subLabel?: 'a' | 'b' | 'c' | 'd',
  unitName?: string,
  description?: string
): { questionText: string; stemText?: string } {
  const key = subLabel
    ? `${partType}:${questionLabel}:${subLabel}`
    : `${partType}:${questionLabel}`;
  const stemKey = `${partType}:${questionLabel}:stem`;

  // 1. Check custom sourceQuestions stored on the document
  if (doc.sourceQuestions && doc.sourceQuestions[key]) {
    return {
      questionText: doc.sourceQuestions[key],
      stemText: doc.sourceQuestions[stemKey],
    };
  }

  // 2. Check if document is Khảo sát chất lượng đầu năm Toán 10
  if (
    doc.id === 'toan10-ksdn-26-27' ||
    /khảo sát chất lượng đầu năm/i.test(doc.header.examName)
  ) {
    if (KHAO_SAT_DAU_NAM_QUESTION_TEXTS[key]) {
      return {
        questionText: KHAO_SAT_DAU_NAM_QUESTION_TEXTS[key],
        stemText: KHAO_SAT_DAU_NAM_QUESTION_TEXTS[stemKey],
      };
    }
  }

  // 3. Check if document is Giữa Học Kì II Toán 10
  if (
    doc.id === 'toan10-gk2-achau-original' ||
    /giữa học kì ii/i.test(doc.header.examName)
  ) {
    if (GIUA_HK2_QUESTION_TEXTS[key]) {
      return {
        questionText: GIUA_HK2_QUESTION_TEXTS[key],
        stemText: GIUA_HK2_QUESTION_TEXTS[stemKey],
      };
    }
  }

  // 4. Construct a clear mathematical representation from the unit and specification description
  const cleanLabel = subLabel ? `${questionLabel} - Ý ${subLabel})` : questionLabel;
  return {
    questionText: `${cleanLabel} [${unitName || 'Chuyên đề Toán'}]: Câu hỏi kiểm tra yêu cầu "${description || ''}"`,
  };
}

/**
 * Finds the best matching MatrixUnit in the document's matrixTopics for a given text
 */
export function findBestUnitInMatrixTopics(
  text: string,
  matrixTopics: MatrixTopic[]
): { unitId: string; unitName: string; topicName: string } | null {
  const allUnits = matrixTopics.flatMap((t) =>
    t.units.map((u) => ({
      unitId: u.id,
      unitName: u.content,
      topicName: t.topicName,
    }))
  );

  // 1. Direct mathematical concept matching against units present in matrixTopics
  const lower = text.toLowerCase();
  for (const u of allUnits) {
    const uLower = u.unitName.toLowerCase();
    if (lower.includes('mệnh đề') && uLower.includes('mệnh đề')) return u;
    if ((lower.includes('tập hợp') || lower.includes('phần tử') || lower.includes('∈')) && uLower.includes('tập hợp')) return u;
    if ((lower.includes('hệ hai phương trình') || lower.includes('hệ phương trình')) && uLower.includes('hệ')) return u;
    if (lower.includes('phương trình bậc nhất hai ẩn') && (uLower.includes('hệ') || uLower.includes('hai ẩn'))) return u;
    if (lower.includes('bất phương trình bậc nhất') && uLower.includes('bất phương trình bậc nhất')) return u;
    if ((lower.includes('quãng đường') || lower.includes('lập phương trình')) && uLower.includes('lập phương trình')) return u;
    if (lower.includes('hàm số bậc nhất') && (uLower.includes('hàm số') || uLower.includes('ax + b'))) return u;
    if ((lower.includes('tam giác abc vuông') || lower.includes('hình chữ nhật') || lower.includes('cầu trượt')) && uLower.includes('tam giác vuông')) return u;
    if ((lower.includes('180°') || lower.includes('180⁰') || lower.includes('sin 30') || lower.includes('sin² 25')) && uLower.includes('180')) return u;
    if ((lower.includes('góc nhọn') || lower.includes('cot α')) && uLower.includes('góc nhọn')) return u;
  }

  // 2. Check if any CURRICULUM_UNITS keyword explicitly matches the text
  const explicitMatchedDef = CURRICULUM_UNITS.find((def) =>
    def.keywords.some((kw) => kw.test(text))
  );
  if (explicitMatchedDef) {
    const defLower = explicitMatchedDef.unitName.toLowerCase();
    for (const u of allUnits) {
      const uLower = u.unitName.toLowerCase();
      if (
        uLower.includes(defLower.slice(0, 14)) ||
        defLower.includes(uLower.slice(0, 14))
      ) {
        return u;
      }
    }
  }

  return null;
}

/**
 * Generates the complete list of Side-by-Side Question-to-Specification Mappings
 * and runs automated Knowledge Audit Warnings on every item.
 */
export function getQuestionSpecMappings(doc: ExamDocument): QuestionSpecMappingItem[] {
  const unitMap = new Map<string, { topicName: string; unitName: string }>();
  for (const topic of doc.matrixTopics) {
    for (const unit of topic.units) {
      unitMap.set(unit.id, { topicName: topic.topicName, unitName: unit.content });
    }
  }

  const fallbackUnit = doc.matrixTopics[0]?.units[0]
    ? {
        id: doc.matrixTopics[0].units[0].id,
        topicName: doc.matrixTopics[0].topicName,
        unitName: doc.matrixTopics[0].units[0].content,
      }
    : { id: 'u1', topicName: 'ĐẠI SỐ', unitName: 'Mệnh đề' };

  const items: QuestionSpecMappingItem[] = [];

  const auditSingleItem = (
    key: string,
    partType: 'TN' | 'DS' | 'TLN' | 'TL',
    questionLabel: string,
    subLabel: 'a' | 'b' | 'c' | 'd' | undefined,
    questionText: string,
    stemText: string | undefined,
    unitId: string,
    topicName: string,
    unitName: string,
    description: string,
    cellKey: CellKey,
    indicatorCode: string
  ): KnowledgeAuditWarning[] => {
    const warnings: KnowledgeAuditWarning[] = [];
    const { domain, level } = parseCellKey(cellKey);
    const fullContextText = `${stemText || ''} ${questionText} ${description}`;

    // 1. Check Real-world problem without MH competency code
    // Note: In DS Câu 2c of Khảo Sát Đầu Năm, setting up the algebraic equation is intentionally GQ_VD while a, b, d are MH.
    const isRealWorld = isRealWorldQuestionText(fullContextText);
    const isIntentionalEquationStep =
      partType === 'DS' &&
      subLabel === 'c' &&
      domain === 'GQ' &&
      /phương trình|lập phương trình/i.test(fullContextText);

    if (isRealWorld && domain !== 'MH' && !isIntentionalEquationStep) {
      const suggestedCellKey = buildCellKey('MH', level === 'Biet' ? 'Hieu' : level);
      const suggestedCode = level === 'VD' ? 'MH2.1' : 'MH1.2';
      warnings.push({
        id: `${key}-missing-mh`,
        type: 'missing_mh',
        severity: 'high',
        title: 'Bài toán thực tiễn chưa gắn mã Mô hình hóa (MH)',
        message: `Nội dung câu hỏi có bối cảnh thực tiễn nhưng đang gắn mã "${indicatorCode}" (${domain}). Theo chuẩn GDPT 2018, câu hỏi thực tiễn nên gắn năng lực Mô hình hóa toán học (${suggestedCode}).`,
        suggestedCellKey,
        suggestedIndicatorCode: suggestedCode,
      });
    }

    // 2. Check Topic / Unit mismatch
    // Only check when questionText is a real question (not the auto-generated placeholder)
    const isPlaceholderQuestion = questionText.includes('Câu hỏi kiểm tra yêu cầu');
    if (!isPlaceholderQuestion) {
      const bestUnit = findBestUnitInMatrixTopics(
        `${stemText || ''} ${questionText}`,
        doc.matrixTopics
      );
      if (bestUnit && bestUnit.unitId !== unitId) {
        // Verify that the current unit isn't already semantically equivalent
        const currLower = unitName.toLowerCase();
        const bestLower = bestUnit.unitName.toLowerCase();
        const isCloselyRelated =
          (currLower.includes('lượng giác') && bestLower.includes('lượng giác')) ||
          (currLower.includes('tam giác vuông') && bestLower.includes('lượng giác')) ||
          (currLower.includes('phương trình') && bestLower.includes('phương trình'));

        if (!isCloselyRelated) {
          warnings.push({
            id: `${key}-topic-mismatch`,
            type: 'topic_mismatch',
            severity: 'high',
            title: `Lệch Đơn vị kiến thức (${unitName} → ${bestUnit.unitName})`,
            message: `Nội dung toán học của câu hỏi thuộc về "${bestUnit.unitName}" (${bestUnit.topicName}), nhưng dòng đặc tả đang gắn vào "${unitName}".`,
            suggestedUnitId: bestUnit.unitId,
            suggestedUnitName: bestUnit.unitName,
          });
        }
      }
    }

    // 3. Check Cognitive Level mismatch (e.g., parameter m placed in Biết)
    if (
      level === 'Biet' &&
      (/tham số\s*m|tìm\s*m\b|vô nghiệm|giá trị lớn nhất|giá trị nhỏ nhất|tối ưu/i.test(
        questionText
      ) ||
        /^vận dụng/i.test(description.trim()))
    ) {
      const suggestedCellKey = buildCellKey(domain === 'TD' ? 'GQ' : domain, 'VD');
      const suggestedCode = getDefaultIndicatorForCell(suggestedCellKey);
      warnings.push({
        id: `${key}-level-mismatch-vd`,
        type: 'level_mismatch',
        severity: 'medium',
        title: 'Mức độ nhận thức thấp hơn độ khó câu hỏi (Đang ở mức Biết)',
        message: `Câu hỏi có chứa tham số hoặc yêu cầu vận dụng nhiều bước nhưng đang đặt ở mức "Biết". Gợi ý chuyển sang mức "Vận dụng" (${suggestedCode}).`,
        suggestedCellKey,
        suggestedIndicatorCode: suggestedCode,
      });
    }

    // 4. Check Generic placeholder YCCĐ description
    if (
      /khái niệm \/ tính chất toán học cơ bản|thực hiện phép biến đổi theo công thức cơ bản|thiết lập phương trình \/ bất phương trình theo điều kiện|giải và biện luận để tìm kết quả|vận dụng giải quyết bài toán tổng hợp hoặc thực tiễn/i.test(
        description
      )
    ) {
      const matchedDef = matchQuestionToUnitDef(`${topicName} ${unitName} ${questionText}`);
      const suggestedDesc =
        partType === 'DS' && subLabel
          ? matchedDef.dsSubTemplates[subLabel].desc
          : partType === 'TLN'
          ? matchedDef.tlnTemplate.desc
          : partType === 'TL'
          ? matchedDef.tlTemplate.desc
          : matchedDef.tnTemplates[0].desc;

      warnings.push({
        id: `${key}-generic-yccd`,
        type: 'generic_yccd',
        severity: 'medium',
        title: 'Mô tả YCCĐ còn chung chung, chưa sát đơn vị kiến thức',
        message: `Nội dung đặc tả hiện tại là câu mẫu chung. Gợi ý chuẩn hóa theo đúng YCCĐ GDPT 2018 của bài "${unitName}".`,
        suggestedDescription: suggestedDesc,
      });
    }

    return warnings;
  };

  // 1. Multiple Choice (TN)
  for (const q of doc.specification.multipleChoice) {
    const uMeta = unitMap.get(q.unitId) || fallbackUnit;
    const { questionText, stemText } = resolveQuestionTextForSpecItem(
      doc,
      'TN',
      q.questionLabel,
      undefined,
      uMeta.unitName,
      q.description
    );
    const { domain, level } = parseCellKey(q.cellKey);
    const key = `TN:${q.id}`;
    const warnings = auditSingleItem(
      key,
      'TN',
      q.questionLabel,
      undefined,
      questionText,
      stemText,
      q.unitId,
      uMeta.topicName,
      uMeta.unitName,
      q.description,
      q.cellKey,
      q.indicatorCode
    );

    items.push({
      key,
      partType: 'TN',
      partTitle: 'Phần I. Trắc nghiệm nhiều lựa chọn',
      itemId: q.id,
      questionLabel: q.questionLabel,
      questionText,
      stemText,
      unitId: q.unitId,
      topicName: uMeta.topicName,
      unitName: uMeta.unitName,
      description: q.description,
      cellKey: q.cellKey,
      domain,
      level,
      indicatorCode: q.indicatorCode,
      score: q.score,
      warnings,
    });
  }

  // 2. True/False (ĐS - 4 sub-items a, b, c, d per question)
  for (const q of doc.specification.trueFalse) {
    const uMeta = unitMap.get(q.unitId) || fallbackUnit;
    for (const sub of q.subItems) {
      const { questionText, stemText } = resolveQuestionTextForSpecItem(
        doc,
        'DS',
        q.questionLabel,
        sub.subLabel,
        uMeta.unitName,
        sub.description
      );
      const { domain, level } = parseCellKey(sub.cellKey);
      const key = `DS:${q.id}:${sub.subLabel}`;
      const warnings = auditSingleItem(
        key,
        'DS',
        q.questionLabel,
        sub.subLabel,
        questionText,
        stemText,
        q.unitId,
        uMeta.topicName,
        uMeta.unitName,
        sub.description,
        sub.cellKey,
        sub.indicatorCode
      );

      items.push({
        key,
        partType: 'DS',
        partTitle: 'Phần II. Trắc nghiệm Đúng/Sai (Phân tích từng ý a, b, c, d)',
        itemId: q.id,
        subLabel: sub.subLabel,
        questionLabel: `${q.questionLabel} - Ý ${sub.subLabel})`,
        questionText,
        stemText,
        unitId: q.unitId,
        topicName: uMeta.topicName,
        unitName: uMeta.unitName,
        description: sub.description,
        cellKey: sub.cellKey,
        domain,
        level,
        indicatorCode: sub.indicatorCode,
        score: Number((q.score / 4).toFixed(2)),
        warnings,
      });
    }
  }

  // 3. Short Answer (TLN)
  for (const q of doc.specification.shortAnswer) {
    const uMeta = unitMap.get(q.unitId) || fallbackUnit;
    const { questionText, stemText } = resolveQuestionTextForSpecItem(
      doc,
      'TLN',
      q.questionLabel,
      undefined,
      uMeta.unitName,
      q.description
    );
    const { domain, level } = parseCellKey(q.cellKey);
    const key = `TLN:${q.id}`;
    const warnings = auditSingleItem(
      key,
      'TLN',
      q.questionLabel,
      undefined,
      questionText,
      stemText,
      q.unitId,
      uMeta.topicName,
      uMeta.unitName,
      q.description,
      q.cellKey,
      q.indicatorCode
    );

    items.push({
      key,
      partType: 'TLN',
      partTitle: 'Phần III. Trắc nghiệm trả lời ngắn',
      itemId: q.id,
      questionLabel: q.questionLabel,
      questionText,
      stemText,
      unitId: q.unitId,
      topicName: uMeta.topicName,
      unitName: uMeta.unitName,
      description: q.description,
      cellKey: q.cellKey,
      domain,
      level,
      indicatorCode: q.indicatorCode,
      score: q.score,
      warnings,
    });
  }

  // 4. Essay (TL)
  for (const q of doc.specification.essay) {
    const uMeta = unitMap.get(q.unitId) || fallbackUnit;
    const { questionText, stemText } = resolveQuestionTextForSpecItem(
      doc,
      'TL',
      q.questionLabel,
      undefined,
      uMeta.unitName,
      q.description
    );
    const { domain, level } = parseCellKey(q.cellKey);
    const key = `TL:${q.id}`;
    const warnings = auditSingleItem(
      key,
      'TL',
      q.questionLabel,
      undefined,
      questionText,
      stemText,
      q.unitId,
      uMeta.topicName,
      uMeta.unitName,
      q.description,
      q.cellKey,
      q.indicatorCode
    );

    items.push({
      key,
      partType: 'TL',
      partTitle: 'Phần IV. Tự luận',
      itemId: q.id,
      questionLabel: q.questionLabel,
      questionText,
      stemText,
      unitId: q.unitId,
      topicName: uMeta.topicName,
      unitName: uMeta.unitName,
      description: q.description,
      cellKey: q.cellKey,
      domain,
      level,
      indicatorCode: q.indicatorCode,
      score: q.score,
      warnings,
    });
  }

  return items;
}

/**
 * Finds matching GDPT 2018 YCCĐ requirements for a given unit name or question text
 */
export function suggestYccdRequirementsForUnit(
  unitName: string,
  topicName: string
): YCCDItem[] {
  const combined = `${topicName} ${unitName}`.toLowerCase();
  const scored = YCCD_DATABASE.map((item) => {
    let score = 0;
    const mainLower = item.mainTopic.toLowerCase();
    const subLower = (item.subTopic || '').toLowerCase();
    if (combined.includes(mainLower.slice(0, 10)) || mainLower.includes(unitName.toLowerCase().slice(0, 10))) {
      score += 5;
    }
    if (subLower && combined.includes(subLower.slice(0, 10))) {
      score += 3;
    }
    for (const kw of item.keywords || []) {
      if (combined.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    return { item, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((x) => x.item);
}
