import { CellKey, CompetencyDomain, ThinkingLevelKey } from '../types/exam';

export interface CompetencyMetadata {
  code: string;
  domain: CompetencyDomain;
  defaultLevel: ThinkingLevelKey;
  description: string;
}

export const CELL_KEY_LABELS: Record<
  CellKey,
  { domain: CompetencyDomain; level: ThinkingLevelKey; domainLabel: string; levelLabel: string; shortLabel: string }
> = {
  TD_Biet: { domain: 'TD', level: 'Biet', domainLabel: 'Tư duy và lập luận toán học (TD)', levelLabel: 'Biết', shortLabel: 'TD - Biết' },
  TD_Hieu: { domain: 'TD', level: 'Hieu', domainLabel: 'Tư duy và lập luận toán học (TD)', levelLabel: 'Hiểu', shortLabel: 'TD - Hiểu' },
  TD_VD:   { domain: 'TD', level: 'VD',   domainLabel: 'Tư duy và lập luận toán học (TD)', levelLabel: 'Vận dụng', shortLabel: 'TD - VD' },
  GQ_Biet: { domain: 'GQ', level: 'Biet', domainLabel: 'Giải quyết vấn đề toán học (GQ)', levelLabel: 'Biết', shortLabel: 'GQ - Biết' },
  GQ_Hieu: { domain: 'GQ', level: 'Hieu', domainLabel: 'Giải quyết vấn đề toán học (GQ)', levelLabel: 'Hiểu', shortLabel: 'GQ - Hiểu' },
  GQ_VD:   { domain: 'GQ', level: 'VD',   domainLabel: 'Giải quyết vấn đề toán học (GQ)', levelLabel: 'Vận dụng', shortLabel: 'GQ - VD' },
  MH_Biet: { domain: 'MH', level: 'Biet', domainLabel: 'Mô hình hóa toán học (MH)', levelLabel: 'Biết', shortLabel: 'MH - Biết' },
  MH_Hieu: { domain: 'MH', level: 'Hieu', domainLabel: 'Mô hình hóa toán học (MH)', levelLabel: 'Hiểu', shortLabel: 'MH - Hiểu' },
  MH_VD:   { domain: 'MH', level: 'VD',   domainLabel: 'Mô hình hóa toán học (MH)', levelLabel: 'Vận dụng', shortLabel: 'MH - VD' },
};

export const MATH_COMPETENCY_INDICATORS: CompetencyMetadata[] = [
  // Tư duy và lập luận toán học (TD)
  { code: 'TD1.1', domain: 'TD', defaultLevel: 'Biet', description: 'Thực hiện được các thao tác tư duy (so sánh, phân tích, tổng hợp, đặc biệt hóa, khái quát hóa) ở mức độ đơn giản.' },
  { code: 'TD1.2', domain: 'TD', defaultLevel: 'Biet', description: 'Chỉ ra được chứng cứ, lí lẽ và biết lập luận hợp lí trước khi kết luận.' },
  { code: 'TD1.3', domain: 'TD', defaultLevel: 'Biet', description: 'Giải thích hoặc điều chỉnh được cách thức giải quyết vấn đề về phương diện toán học.' },
  { code: 'TD2.1', domain: 'TD', defaultLevel: 'Biet', description: 'Nêu và trả lời được câu hỏi khi lập luận, giải quyết vấn đề.' },
  { code: 'TD2.2', domain: 'TD', defaultLevel: 'Hieu', description: 'Chứng minh được mệnh đề toán học không quá phức tạp.' },
  { code: 'TD3.1', domain: 'TD', defaultLevel: 'Hieu', description: 'Sử dụng được các phương pháp lập luận, quy nạp và suy diễn để nhìn ra những cách thức khác nhau trong giải quyết vấn đề.' },
  { code: 'TD3.2', domain: 'TD', defaultLevel: 'VD', description: 'Đặt và trả lời được các câu hỏi có tính phản biện trong lập luận toán học.' },
  { code: 'TD3.3', domain: 'TD', defaultLevel: 'Hieu', description: 'Vận dụng được các thao tác tư duy và lập luận trong các bài toán hình học và đại số.' },

  // Giải quyết vấn đề toán học (GQ)
  { code: 'GQ1.1', domain: 'GQ', defaultLevel: 'Hieu', description: 'Nhận biết, phát hiện được vấn đề cần giải quyết bằng toán học.' },
  { code: 'GQ1.2', domain: 'GQ', defaultLevel: 'Biet', description: 'Xác định được thông tin đã biết và thông tin cần tìm từ đồ thị, bảng biểu hoặc công thức.' },
  { code: 'GQ1.3', domain: 'GQ', defaultLevel: 'Biet', description: 'Chuyển đổi được bài toán về dạng phương trình/bất phương trình quen thuộc.' },
  { code: 'GQ1.4', domain: 'GQ', defaultLevel: 'Biet', description: 'Lựa chọn được công thức, quy tắc toán học phù hợp để giải quyết vấn đề.' },
  { code: 'GQ1.5', domain: 'GQ', defaultLevel: 'Hieu', description: 'Kiểm tra và chọn lọc được nghiệm hoặc kết quả phù hợp với điều kiện bài toán.' },
  { code: 'GQ2.1', domain: 'GQ', defaultLevel: 'Hieu', description: 'Thiết lập và thực hiện được quy trình giải quyết vấn đề toán học qua nhiều bước.' },
  { code: 'GQ2.2', domain: 'GQ', defaultLevel: 'Hieu', description: 'Sử dụng được các kiến thức, kĩ năng toán học tương thích để giải bài toán.' },
  { code: 'GQ3.1', domain: 'GQ', defaultLevel: 'VD', description: 'Vận dụng tổng hợp kiến thức đại số/giải tích để giải quyết vấn đề toán học hoặc liên môn.' },
  { code: 'GQ3.2', domain: 'GQ', defaultLevel: 'VD', description: 'Vận dụng phương pháp tọa độ, hình học hoặc xác suất thống kê trong tình huống mới.' },

  // Mô hình hóa toán học (MH)
  { code: 'MH1.1', domain: 'MH', defaultLevel: 'Biet', description: 'Xác định được mô hình toán học (công thức, phương trình, bảng, đồ thị) cho tình huống xuất hiện trong bài toán thực tiễn.' },
  { code: 'MH1.2', domain: 'MH', defaultLevel: 'Hieu', description: 'Thiết lập được phương trình/hệ phương trình mô tả tình huống thực tế.' },
  { code: 'MH2.1', domain: 'MH', defaultLevel: 'VD', description: 'Giải quyết được những vấn đề toán học trong mô hình được thiết lập từ bài toán thực tiễn.' },
  { code: 'MH3.1', domain: 'MH', defaultLevel: 'VD', description: 'Thể hiện và đánh giá được lời giải trong ngữ cảnh thực tế và cải tiến được mô hình nếu cách giải quyết không phù hợp.' },
];

export const QUICK_MATH_FORMULAS = [
  { label: 'PT chứa căn dạng 1', text: '√(ax² + bx + c) = √(dx² + ex + f)' },
  { label: 'PT chứa căn dạng 2', text: '√(ax² + bx + c) = dx + e' },
  { label: 'Tam thức bậc hai', text: 'f(x) = ax² + bx + c (a ≠ 0)' },
  { label: 'Tổ hợp & Chỉnh hợp', text: 'Pₙ = n!, Aₙᵏ, Cₙᵏ' },
  { label: 'Phương trình đường tròn', text: '(x - a)² + (y - b)² = R²' },
  { label: 'Khoảng cách điểm - đường thẳng', text: 'd(M, Δ) = |ax₀ + by₀ + c| / √(a² + b²)' },
  { label: 'Vectơ & Tọa độ', text: 'u⃗ = (x; y), |AB⃗| = √((x_B - x_A)² + (y_B - y_A)²)' },
];
