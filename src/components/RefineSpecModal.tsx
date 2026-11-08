import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Loader2,
  Zap,
  Info,
  RotateCcw,
  BookOpen,
  FileCheck2,
  ClipboardPaste,
  PlusCircle,
} from 'lucide-react';
import { MatrixTopic, SpecificationData, CellKey } from '../types/exam';
import { syncMatrixFromSpec } from '../utils/matrixCalculator';
import {
  DEFAULT_TOAN_10_DOCUMENT,
  TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT,
  emptyCells,
} from '../data/sampleToan10';
import {
  parseRawExamText,
  buildDocumentFromParsedExam,
  matchQuestionToUnitDef,
} from '../utils/examParser';

interface RefineSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  specification: SpecificationData;
  matrixTopics: MatrixTopic[];
  onApplyRefinedSpec: (updatedSpec: SpecificationData, updatedTopics: MatrixTopic[]) => void;
}

const SAMPLE_VERBATIM_SPEC_TEXT = `PHẦN I. TRẮC NGHIỆM NHIỀU LỰA CHỌN (12 câu - 3,0 điểm)
Câu 1 [u1 | TD_Biet | TD1.2]: Nhận biết được tam thức bậc hai.
Câu 2 [u1 | TD_Biet | TD2.1]: Nhận biết được định lí về dấu của tam thức bậc hai.
Câu 3 [u1 | GQ_Biet | GQ1.2]: Nhận biết được dấu của tam thức bậc hai từ việc quan sát đồ thị của hàm bậc hai.
Câu 4 [u1 | GQ_Hieu | GQ2.1]: Mô tả được bảng xét dấu của tam thức bậc hai khi biết tam thức bậc hai đó
Câu 5 [u2 | TD_Biet | TD1.3]: Viết được tập nghiệm của bất phương trình bậc hai dựa vào bảng xét dấu hoặc đồ thị của tam thức bậc hai.
Câu 6 [u2 | GQ_Biet | GQ1.4]: Nhận ra được tập nghiệm của một bất phương trình bậc hai cho trước.
Câu 7 [u4 | TD_Biet | TD1.1]: Nhận biết được qui tắc cộng, qui tắc nhân.
Câu 8 [u4 | GQ_Biet | GQ2.1]: Đếm được số khả năng trong bài toán đếm đơn giản sử dụng qui tắc cộng hoặc qui tắc nhân
Câu 9 [u4 | GQ_Hieu | GQ2.1]: Sắp xếp được số khả năng theo thứ tự tăng dần, hoặc giảm dần khi có ba tình huống đếm đơn giản.
Câu 10 [u8 | TD_Biet | TD1.3]: Nhận biết được phương trình đường tròn.
Câu 11 [u8 | GQ_Biet | GQ1.2]: Chỉ ra được tâm và bán kính đường tròn.
Câu 12 [u8 | GQ_Hieu | GQ1.1]: Viết được phương trình đường tròn trong trường hợp đơn giản

PHẦN II. TRẮC NGHIỆM ĐÚNG - SAI (4 câu - 4,0 điểm)
Câu 1 [u3]: Phương trình qui về phương trình bậc hai.
a) [TD_Biet | TD1.3]: Nhận biết được nghiệm của phương trình √(ax² + bx + c) = √(dx² + ex + f) hoặc √(ax² + bx + c) = dx + e.
b) [TD_Hieu | TD1.2]: Viết lại được phương trình √(ax² + bx + c) = √(dx² + ex + f) hoặc √(ax² + bx + c) = dx + e sau khi tiến hành bình phương 2 vế.
c) [GQ_Biet | GQ1.3]: Sắp xếp được phương trình đã biến đổi thành một phương trình bậc hai.
d) [GQ_Hieu | GQ1.5]: Chỉ ra được một nghiệm của phương trình đã cho.

Câu 2 [u5]: Hoán vị, chỉnh hợp và tổ hợp.
a) [TD_Biet | TD1.1]: Nhận biết được khái niệm hoán vị, chỉnh hợp, tổ hợp
b) [TD_Hieu | TD1.3]: Nhận ra một hoán vị, hoặc một tổ hợp, một chỉnh hợp.
c) [GQ_Hieu | GQ1.4]: Tính được số hoán vị n phần tử, chỉnh hợp, hoặc tổ hợp chập k của n phần tử.
d) [GQ_VD | GQ2.1]: Vận dụng tính số hoán vị, chỉnh hợp trong một số trường hợp.

Câu 3 [u6]: Toạ độ của vectơ.
a) [TD_Biet | TD1.1]: Nhận biết được toạ độ của điểm, vectơ đối với một hệ trục toạ độ.
b) [TD_Hieu | TD3.3]: Tìm được toạ độ của một vectơ, độ dài của một vectơ khi biết toạ độ hai đầu mút của nó.
c) [GQ_Hieu | GQ2.1]: Sử dụng được biểu thức toạ độ của các phép toán vectơ trong tính toán.
d) [GQ_VD | GQ3.2]: Vận dụng được phương pháp toạ độ vào bài toán giải tam giác.

Câu 4 [u7]: Đường thẳng trong mặt phẳng toạ độ
a) [TD_Biet | TD1.1]: Nhận biết được VTCP, VTPT của đường thẳng khi biết phương trình của nó.
b) [TD_Hieu | TD1.3]: Giải thích được việc điểm thuộc hay không thuộc đường thẳng có phương trình cho trước.
c) [GQ_Hieu | GQ2.1]: Tính được khoảng cách từ một điểm đến đường thẳng cho trước
d) [GQ_VD | GQ3.2]: Vận dụng được kiến thức về phương trình đường thẳng để giải một số bài toán có liên quan đến thực tiễn.

PHẦN III. TRẮC NGHIỆM TRẢ LỜI NGẮN (6 câu - 3,0 điểm)
Câu 1 [u2 | GQ_VD | GQ3.1]: Giải được bất phương trình bậc hai.
Câu 2 [u3 | MH_VD | MH2.1]: Giải được bài toán thực tiễn qui về phương trình chứa căn thức có dạng: √(ax² + bx + c) = √(dx² + ex + f) ; √(ax² + bx + c) = dx + e.
Câu 3 [u4 | GQ_VD | GQ3.1]: Vận dụng được sơ đồ hình cây trong các bài toán đếm đơn giản các đối tượng trong Toán học, trong các môn học khác cũng như trong thực tiễn.
Câu 4 [u5 | MH_VD | MH2.1]: Vận dụng khái niệm hoán vị, chỉnh hợp, tổ hợp giải quyết bài toán thực tế
Câu 5 [u7 | MH_VD | MH2.1]: Vận dụng được kiến thức về phương trình đường thẳng để giải một số bài toán có liên quan đến thực tiễn.
Câu 6 [u8 | GQ_VD | GQ3.2]: Thiết lập được phương trình đường tròn khi biết toạ độ tâm và bán kính; thiết lập được phương trình tiếp tuyến của đường tròn khi biết toạ độ của tiếp điểm.`;

const SAMPLE_MENH_DE_TAP_HOP_SPEC_TEXT = `PHẦN I. TRẮC NGHIỆM NHIỀU LỰA CHỌN (12 câu - 3,0 điểm)
Câu 1 [TD_Biet | TD1.1]: Mệnh đề — Nhận biết được mệnh đề toán học, mệnh đề chứa biến và xác định tính đúng/sai của mệnh đề.
Câu 2 [TD_Biet | TD1.2]: Mệnh đề — Thiết lập và phát biểu được mệnh đề phủ định, mệnh đề kéo theo, mệnh đề đảo, mệnh đề tương đương, mệnh đề chứa kí hiệu ∀, ∃.
Câu 3 [TD_Biet | TD1.1]: Tập hợp và các phép toán trên tập hợp — Nhận biết được các khái niệm cơ bản về tập hợp (tập con, hai tập hợp bằng nhau, tập rỗng) và sử dụng các kí hiệu ⊂, ⊃, ∅, ∈, ∉.
Câu 4 [GQ_Hieu | GQ2.1]: Tập hợp và các phép toán trên tập hợp — Thực hiện được phép toán giao (A ∩ B), hợp (A ∪ B), hiệu (A \\ B), phần bù trên các tập hợp số và khoảng, đoạn, nửa khoảng.
Câu 5 [TD_Biet | TD1.2]: Dấu của tam thức bậc hai — Nhận biết được tam thức bậc hai và định lí về dấu của tam thức bậc hai.
Câu 6 [GQ_Biet | GQ1.4]: Giải bpt bậc hai một ẩn — Nhận ra được tập nghiệm của một bất phương trình bậc hai cho trước.
Câu 7 [TD_Biet | TD1.1]: Qui tắc cộng và qui tắc nhân — Nhận biết được qui tắc cộng, qui tắc nhân.
Câu 8 [GQ_Biet | GQ2.1]: Qui tắc cộng và qui tắc nhân — Đếm được số khả năng trong bài toán đếm đơn giản sử dụng qui tắc cộng hoặc qui tắc nhân.
Câu 9 [GQ_Hieu | GQ2.1]: Hoán vị, chỉnh hợp và tổ hợp — Tính được số các hoán vị, chỉnh hợp, tổ hợp trong bài toán đếm đơn giản.
Câu 10 [TD_Biet | TD1.3]: Đường tròn trong mặt phẳng toạ độ — Nhận biết được phương trình đường tròn.
Câu 11 [GQ_Biet | GQ1.2]: Đường tròn trong mặt phẳng toạ độ — Chỉ ra được tâm và bán kính đường tròn.
Câu 12 [GQ_Hieu | GQ1.1]: Đường tròn trong mặt phẳng toạ độ — Viết được phương trình đường tròn trong trường hợp đơn giản.

PHẦN II. TRẮC NGHIỆM ĐÚNG - SAI (4 câu - 4,0 điểm)
Câu 1: Mệnh đề và Tập hợp (Các phép toán trên tập hợp)
a) [TD_Biet | TD1.1]: Nhận biết được mệnh đề chứa kí hiệu ∀, ∃ và xác định các phần tử thuộc tập hợp (∈, ∉, ⊂, ∅).
b) [TD_Hieu | TD1.3]: Phát biểu được mệnh đề phủ định và biểu diễn được tập hợp dưới dạng khoảng, đoạn, nửa khoảng trên trục số.
c) [GQ_Hieu | GQ2.1]: Thực hiện được phép toán giao (A ∩ B), hợp (A ∪ B), hiệu (A \\ B) và phần bù của hai tập hợp con của ℝ.
d) [MH_VD | MH2.1]: Giải quyết được vấn đề thực tiễn gắn với phép toán trên tập hợp (bài toán đếm bằng biểu đồ Ven hoặc tìm tham số m để A ∩ B ≠ ∅).

Câu 2: Phương trình qui về phương trình bậc hai.
a) [TD_Biet | TD1.3]: Nhận biết được nghiệm của phương trình √(ax² + bx + c) = √(dx² + ex + f) hoặc √(ax² + bx + c) = dx + e.
b) [TD_Hieu | TD1.2]: Viết lại được phương trình √(ax² + bx + c) = √(dx² + ex + f) hoặc √(ax² + bx + c) = dx + e sau khi tiến hành bình phương 2 vế.
c) [GQ_Biet | GQ1.3]: Sắp xếp được phương trình đã biến đổi thành một phương trình bậc hai.
d) [GQ_Hieu | GQ1.5]: Chỉ ra được một nghiệm của phương trình đã cho.

Câu 3: Hoán vị, chỉnh hợp và tổ hợp.
a) [TD_Biet | TD1.1]: Nhận biết được khái niệm hoán vị, chỉnh hợp, tổ hợp.
b) [TD_Hieu | TD1.3]: Nhận ra một hoán vị, hoặc một tổ hợp, một chỉnh hợp.
c) [GQ_Hieu | GQ1.4]: Tính được số hoán vị n phần tử, chỉnh hợp, hoặc tổ hợp chập k của n phần tử.
d) [GQ_VD | GQ2.1]: Vận dụng tính số hoán vị, chỉnh hợp trong một số trường hợp.

Câu 4: Phương pháp toạ độ trong mặt phẳng (Vectơ & Đường thẳng)
a) [TD_Biet | TD1.1]: Nhận biết được toạ độ của điểm, vectơ và VTCP, VTPT của đường thẳng.
b) [TD_Hieu | TD1.3]: Giải thích được điểm thuộc đường thẳng và tính độ dài vectơ, toạ độ trung điểm, trọng tâm tam giác.
c) [GQ_Hieu | GQ2.1]: Tính được khoảng cách từ một điểm đến đường thẳng cho trước bằng phương pháp toạ độ.
d) [GQ_VD | GQ3.2]: Vận dụng được phương pháp toạ độ và phương trình đường thẳng để giải bài toán thực tiễn.

PHẦN III. TRẮC NGHIỆM TRẢ LỜI NGẮN (6 câu - 3,0 điểm)
Câu 1 [MH_VD | MH2.1]: Tập hợp và các phép toán trên tập hợp — Giải quyết bài toán thực tiễn gắn với phép toán trên tập hợp (sử dụng biểu đồ Ven đếm số phần tử của hợp, giao các tập hợp).
Câu 2 [GQ_VD | GQ3.1]: Giải bpt bậc hai một ẩn — Giải được bất phương trình bậc hai và tìm số nghiệm nguyên.
Câu 3 [MH_VD | MH2.1]: Phương trình qui về phương trình bậc hai — Giải được bài toán thực tiễn qui về phương trình chứa căn thức √(ax² + bx + c) = dx + e.
Câu 4 [GQ_VD | GQ3.1]: Qui tắc cộng và qui tắc nhân — Vận dụng được sơ đồ hình cây, qui tắc cộng và qui tắc nhân trong bài toán đếm thực tiễn.
Câu 5 [MH_VD | MH2.1]: Hoán vị, chỉnh hợp và tổ hợp — Vận dụng khái niệm hoán vị, chỉnh hợp, tổ hợp giải quyết bài toán thực tế.
Câu 6 [GQ_VD | GQ3.2]: Đường tròn trong mặt phẳng toạ độ — Thiết lập được phương trình đường tròn và phương trình tiếp tuyến của đường tròn.`;

const SAMPLE_KHAO_SAT_DAU_NAM_SPEC_TEXT = `PHẦN I. TRẮC NGHIỆM NHIỀU LỰA CHỌN (12 câu - 3,0 điểm)
Câu 1 [u2 | TD_Biet | TD1.1]: Nhận biết được các khái niệm cơ bản về tập hợp.
Câu 2 [u10 | TD_Biet | TD2.1]: Tính được giá trị lượng giác (đúng hoặc gần đúng) của một góc từ 0⁰ đến 180⁰ bằng máy tính cầm tay.
Câu 3 [u1 | TD_Hieu | TD2.1]: Thiết lập và phát biểu được mệnh đề phủ định, bao gồm mệnh đề có kí hiệu ∀, ∃.
Câu 4 [u1 | TD_Biet | TD1.1]: Nhận biết được mệnh đề toán học và mệnh đề chứa biến trong các trường hợp đơn giản.
Câu 5 [u6 | GQ_Hieu | GQ2.1]: Nhận biết tập nghiệm của phương trình bậc nhất hai ẩn
Câu 6 [u5 | GQ_Biet | GQ1.1]: Nhận biết đặc trưng của đồ thị hàm số bậc nhất, xác định giao điểm với trục tọa độ.
Câu 7 [u1 | TD_Biet | TD1.1]: Xác định được tính đúng/sai và nhận biết mệnh đề toán học trong trường hợp đơn giản.
Câu 8 [u10 | TD_Hieu | TD2.1]: Nhận biết được giá trị lượng giác của một góc từ 0⁰ đến 180⁰.
Câu 9 [u6 | GQ_Hieu | GQ2.1]: Giải được hệ hai phương trình bậc nhất hai ẩn.
Câu 10 [u3 | GQ_Hieu | GQ2.1]: Giải được bất phương trình bậc nhất một ẩn.
Câu 11 [u9 | TD_Hieu | TD1.2]: Giải thích và áp dụng quan hệ giữa các góc trong tam giác vuông.
Câu 12 [u9 | GQ_Hieu | GQ2.1]: Vận dụng hệ thức về cạnh và góc để tính độ dài trong hình phẳng.

PHẦN II. TRẮC NGHIỆM ĐÚNG - SAI (2 câu - 2,0 điểm)
Câu 1 [u1]: Mệnh đề
a) [TD_Biet | TD1.1]: Xác định được tính đúng/sai của một mệnh đề toán học trong những trường hợp đơn giản.
b) [TD_Biet | TD1.1]: Xác định được tính đúng/sai của một mệnh đề toán học trong những trường hợp đơn giản.
c) [TD_Hieu | TD2.1]: Xác định được tính đúng/sai của một mệnh đề toán học trong những trường hợp đơn giản.
d) [TD_Hieu | TD2.1]: Xác định được tính đúng/sai của một mệnh đề toán học trong những trường hợp đơn giản.

Câu 2 [u4]: Giải bài toán bằng cách lập phương trình bậc nhất một ẩn.
a) [MH_Hieu | MH 2.1]: Vận dụng được kiến thức về phương trình bậc nhất một ẩn vào giải quyết bài toán thực tiễn
b) [MH_Hieu | MH 2.1]: Vận dụng được kiến thức về phương trình bậc nhất một ẩn vào giải quyết bài toán thực tiễn
c) [GQ_VD | GQ3.1]: Vận dụng được kiến thức về phương trình bậc nhất một ẩn vào giải quyết bài toán thực tiễn
d) [MH_VD | MH2.1]: Vận dụng được kiến thức về phương trình bậc nhất một ẩn vào giải quyết bài toán thực tiễn

PHẦN III. TRẮC NGHIỆM TRẢ LỜI NGẮN (4 câu - 2,0 điểm)
Câu 1 [u9 | MH_VD | MH 2.1]: Giải quyết được vấn đề thực tiễn gắn với tỉ số lượng giác của góc nhọn
Câu 2 [u2 | GQ_Hieu | GQ2.1]: Đếm số phần tử của tập hợp hữu hạn được mô tả bằng điều kiện.
Câu 3 [u8 | GQ_VD | GQ3.1]: Tính được giá trị (đúng hoặc gần đúng) tỉ số lượng giác của góc nhọn bằng máy tính cầm tay
Câu 4 [u3 | GQ_VD | GQ3.4]: Vận dụng điều kiện nghiệm để tìm tham số của phương trình.

PHẦN IV. TỰ LUẬN (4 lệnh hỏi - 3,0 điểm)
Câu 1a [u2 | TD_Hieu | TD2.1]: Nhận biết và liệt kê các phần tử của tập hợp theo tính chất đã cho.
Câu 1b [u2 | TD_Biet | TD1.1]: Sử dụng đúng kí hiệu ∈, ∉ để biểu diễn quan hệ giữa phần tử và tập hợp.
Câu 2 [u1 | GQ_VD | GQ3.1]: Xác định được tính đúng/sai của một mệnh đề toán học trong những trường hợp đơn giản. Giải thích và phát biểu mệnh đề phủ định của mệnh đề đã cho.
Câu 3 [u10 | GQ_VD | GQ3.1]: Vận dụng các hệ thức lượng giác và tính chất góc phụ, bù để tính giá trị biểu thức.`;

const VALID_CELL_KEYS = new Set<CellKey>([
  'TD_Biet', 'TD_Hieu', 'TD_VD',
  'GQ_Biet', 'GQ_Hieu', 'GQ_VD',
  'MH_Biet', 'MH_Hieu', 'MH_VD',
]);

function inferCellKeyFromText(text: string, fallback: CellKey): { cellKey: CellKey; indicatorCode: string } {
  const codeMatch = text.match(/\b(TD|GQ|MH)\s*(\d+\.\d+)\b/i);
  const compPrefix = codeMatch ? codeMatch[1].toUpperCase() : fallback.split('_')[0];
  const indicatorCode = codeMatch ? `${compPrefix}${codeMatch[2]}` : `${compPrefix}1.1`;

  for (const ck of VALID_CELL_KEYS) {
    if (text.includes(ck)) {
      return { cellKey: ck, indicatorCode };
    }
  }

  const lower = text.toLowerCase();
  let level: 'Biet' | 'Hieu' | 'VD' = fallback.split('_')[1] as 'Biet' | 'Hieu' | 'VD';
  if (lower.includes('vận dụng') || lower.includes('thiết lập được phương trình tiếp tuyến') || lower.includes('thực tiễn') || lower.includes('biểu đồ ven')) {
    level = 'VD';
  } else if (
    lower.includes('mô tả') ||
    lower.includes('sắp xếp') ||
    lower.includes('phân biệt') ||
    lower.includes('tính được') ||
    lower.includes('thực hiện được') ||
    lower.includes('sử dụng được') ||
    lower.includes('giải được') ||
    lower.includes('biết bình phương') ||
    lower.includes('viết lại được') ||
    lower.includes('viết được phương trình đường tròn') ||
    lower.includes('viết được phương trình tham số')
  ) {
    level = 'Hieu';
  } else if (lower.includes('nhận biết') || lower.includes('nhận ra') || lower.includes('chỉ ra') || lower.includes('đếm được')) {
    level = 'Biet';
  }

  const candidate = `${compPrefix}_${level}` as CellKey;
  return {
    cellKey: VALID_CELL_KEYS.has(candidate) ? candidate : fallback,
    indicatorCode,
  };
}

export const RefineSpecModal: React.FC<RefineSpecModalProps> = ({
  isOpen,
  onClose,
  specification,
  matrixTopics,
  onApplyRefinedSpec,
}) => {
  const [examText, setExamText] = useState('');
  const [customGuidance, setCustomGuidance] = useState('');
  const [speedMode, setSpeedMode] = useState<'fast' | 'deep'>('fast');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewSpec, setPreviewSpec] = useState<SpecificationData | null>(null);
  const [previewTopics, setPreviewTopics] = useState<MatrixTopic[] | null>(null);
  const [activeTab, setActiveTab] = useState<'options' | 'preview'>('options');

  if (!isOpen) return null;

  /**
   * Parses either:
   * 1) A custom Specification Table text pasted by the teacher (with "Câu 1...", "a) ...", or bracketed metadata)
   * 2) Or a raw Exam paper text (with questions & choices)
   * Dynamically registers any matched curriculum topics/units (including Mệnh đề & Tập hợp).
   */
  const parseCustomSpecOrExam = (rawInput: string): { spec: SpecificationData; topics: MatrixTopic[] } => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return {
        spec: structuredClone(specification),
        topics: structuredClone(matrixTopics),
      };
    }

    const baseTopics: MatrixTopic[] =
      matrixTopics.length > 0
        ? structuredClone(matrixTopics)
        : structuredClone(DEFAULT_TOAN_10_DOCUMENT.matrixTopics);

    const ensureUnitInTopics = (topicName: string, unitName: string): string => {
      for (const t of baseTopics) {
        for (const u of t.units) {
          if (
            u.content.toLowerCase().includes(unitName.toLowerCase().slice(0, 14)) ||
            unitName.toLowerCase().includes(u.content.toLowerCase().slice(0, 14))
          ) {
            return u.id;
          }
        }
      }
      let targetTopic = baseTopics.find(
        (t) =>
          t.topicName.toLowerCase().includes(topicName.toLowerCase().slice(0, 12)) ||
          topicName.toLowerCase().includes(t.topicName.toLowerCase().slice(0, 12))
      );
      if (!targetTopic) {
        targetTopic = {
          id: `topic-custom-${baseTopics.length + 1}`,
          topicName: topicName.toUpperCase(),
          units: [],
        };
        if (topicName.includes('MỆNH ĐỀ')) {
          baseTopics.unshift(targetTopic);
        } else {
          baseTopics.push(targetTopic);
        }
      }
      const newUnitId = `u-custom-${Date.now().toString().slice(-3)}-${targetTopic.units.length + 1}`;
      targetTopic.units.push({
        id: newUnitId,
        content: unitName,
        cells: emptyCells(),
      });
      return newUnitId;
    };

    const resolveUnitFromBracketOrContent = (rawLine: string, fallbackUnitId: string): string => {
      const flatUnits = baseTopics.flatMap((t) => t.units);
      const bracketMatch = rawLine.match(/\[(u\d+)[^\]]*\]/i);
      if (bracketMatch) {
        const uId = bracketMatch[1].toLowerCase();
        if (flatUnits.some((u) => u.id.toLowerCase() === uId)) return uId;
      }

      const lower = rawLine.toLowerCase();
      if (lower.includes('tập hợp') || lower.includes('giao') || lower.includes('hợp') || lower.includes('phần bù') || lower.includes('biểu đồ ven') || lower.includes('tập con')) {
        return ensureUnitInTopics('MỆNH ĐỀ VÀ TẬP HỢP', 'Tập hợp và các phép toán trên tập hợp');
      }
      if (lower.includes('mệnh đề') && !lower.includes('các mệnh đề sau')) {
        return ensureUnitInTopics('MỆNH ĐỀ VÀ TẬP HỢP', 'Mệnh đề');
      }

      const matchedDef = matchQuestionToUnitDef(rawLine);
      if (matchedDef) {
        return ensureUnitInTopics(matchedDef.topicName, matchedDef.unitName);
      }
      return fallbackUnitId;
    };

    const cleanDescription = (line: string): string => {
      return line
        .replace(/^Câu\s*\d+\s*(\[[^\]]*\])?\s*[:.-]?\s*/i, '')
        .replace(/^[a-d]\s*[).:-]\s*(\[[^\]]*\])?\s*[:.-]?\s*/i, '')
        .replace(/^[-•*+]\s*/, '')
        .trim();
    };

    const isSpecFormat =
      /\[(u\d+|TD_|GQ_|MH_)/i.test(trimmed) ||
      /(Nhận biết được|Mô tả được|Viết được|Vận dụng được|Thiết lập được|Tính được|Thực hiện được|Phân biệt được)/i.test(trimmed);

    if (isSpecFormat) {
      const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      let section: 'TN' | 'DS' | 'TLN' | 'TL' = 'TN';
      const tnList: SpecificationData['multipleChoice'] = [];
      const dsList: SpecificationData['trueFalse'] = [];
      const tlnList: SpecificationData['shortAnswer'] = [];
      const tlList: SpecificationData['essay'] = [];

      let currentDs: SpecificationData['trueFalse'][number] | null = null;

      for (const line of lines) {
        if (/PHẦN\s*(I|1)\b|TRẮC NGHIỆM NHIỀU LỰA CHỌN/i.test(line)) {
          section = 'TN';
          currentDs = null;
          continue;
        }
        if (/PHẦN\s*(II|2)\b|ĐÚNG\s*[-–—]\s*SAI/i.test(line)) {
          section = 'DS';
          currentDs = null;
          continue;
        }
        if (/PHẦN\s*(III|3)\b|TRẢ LỜI NGẮN/i.test(line)) {
          section = 'TLN';
          currentDs = null;
          continue;
        }
        if (/PHẦN\s*(IV|4)\b|TỰ LUẬN/i.test(line)) {
          section = 'TL';
          currentDs = null;
          continue;
        }

        const cauMatch = line.match(/^Câu\s*(\d+)/i);
        const subMatch = line.match(/^([a-d])\s*[).:-]/i);

        if (section === 'DS') {
          if (cauMatch) {
            const qNum = parseInt(cauMatch[1], 10);
            const defaultDs = DEFAULT_TOAN_10_DOCUMENT.specification.trueFalse[qNum - 1];
            const uId = resolveUnitFromBracketOrContent(line, defaultDs?.unitId || 'u3');
            currentDs = {
              id: `ds-${qNum}`,
              questionLabel: `Câu ${qNum}`,
              unitId: uId,
              score: 1.0,
              subItems: structuredClone(
                defaultDs?.subItems || [
                  { subLabel: 'a', description: '', cellKey: 'TD_Biet', indicatorCode: 'TD1.1' },
                  { subLabel: 'b', description: '', cellKey: 'TD_Hieu', indicatorCode: 'TD1.2' },
                  { subLabel: 'c', description: '', cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1' },
                  { subLabel: 'd', description: '', cellKey: 'GQ_VD', indicatorCode: 'GQ3.2' },
                ]
              ),
            };
            dsList.push(currentDs);
            continue;
          }
          if (subMatch && currentDs) {
            const label = subMatch[1].toLowerCase() as 'a' | 'b' | 'c' | 'd';
            const sIdx = ['a', 'b', 'c', 'd'].indexOf(label);
            if (sIdx !== -1) {
              const existingSub = currentDs.subItems[sIdx];
              const { cellKey, indicatorCode } = inferCellKeyFromText(line, existingSub.cellKey);
              const desc = cleanDescription(line);
              currentDs.subItems[sIdx] = {
                subLabel: label,
                description: desc || existingSub.description,
                cellKey,
                indicatorCode,
              };
            }
            continue;
          }
        }

        if (cauMatch) {
          const qNum = parseInt(cauMatch[1], 10);
          const desc = cleanDescription(line);
          if (section === 'TN') {
            const defTn = DEFAULT_TOAN_10_DOCUMENT.specification.multipleChoice[qNum - 1];
            const uId = resolveUnitFromBracketOrContent(line, defTn?.unitId || 'u1');
            const { cellKey, indicatorCode } = inferCellKeyFromText(line, defTn?.cellKey || 'TD_Biet');
            tnList.push({
              id: `tn-${qNum}`,
              questionLabel: `Câu ${qNum}`,
              unitId: uId,
              description: desc || defTn?.description || '',
              cellKey,
              indicatorCode: defTn && !line.includes('|') ? defTn.indicatorCode : indicatorCode,
              score: 0.25,
            });
          } else if (section === 'TLN') {
            const defTln = DEFAULT_TOAN_10_DOCUMENT.specification.shortAnswer[qNum - 1];
            const uId = resolveUnitFromBracketOrContent(line, defTln?.unitId || 'u2');
            const { cellKey, indicatorCode } = inferCellKeyFromText(line, defTln?.cellKey || 'GQ_VD');
            tlnList.push({
              id: `tln-${qNum}`,
              questionLabel: `Câu ${qNum}`,
              unitId: uId,
              description: desc || defTln?.description || '',
              cellKey,
              indicatorCode: defTln && !line.includes('|') ? defTln.indicatorCode : indicatorCode,
              score: 0.5,
            });
          } else if (section === 'TL') {
            const uId = resolveUnitFromBracketOrContent(line, 'u7');
            const { cellKey, indicatorCode } = inferCellKeyFromText(line, 'MH_VD');
            tlList.push({
              id: `tl-${qNum}`,
              questionLabel: `Câu ${qNum}`,
              unitId: uId,
              description: desc,
              cellKey,
              indicatorCode,
              score: 1.0,
            });
          }
        }
      }

      const finalSpec: SpecificationData = {
        multipleChoice: tnList.length > 0 ? tnList : specification.multipleChoice,
        trueFalse: dsList.length > 0 ? dsList : specification.trueFalse,
        shortAnswer: tlnList.length > 0 ? tlnList : specification.shortAnswer,
        essay: tlList.length > 0 ? tlList : specification.essay,
      };
      return {
        spec: finalSpec,
        topics: syncMatrixFromSpec(baseTopics, finalSpec),
      };
    }

    // Otherwise parse as an Exam Paper
    const parsedExam = parseRawExamText(trimmed);
    const builtDoc = buildDocumentFromParsedExam(parsedExam);
    return {
      spec: builtDoc.specification,
      topics: builtDoc.matrixTopics,
    };
  };

  const handleLoadKhaoSatDauNamStandard = () => {
    const ksdnSpec = structuredClone(TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT.specification);
    const ksdnTopics = structuredClone(TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT.matrixTopics);
    setExamText(SAMPLE_KHAO_SAT_DAU_NAM_SPEC_TEXT);
    setPreviewSpec(ksdnSpec);
    setPreviewTopics(ksdnTopics);
    setActiveTab('preview');
  };

  const handleLoadMenhDeTapHopPreset = () => {
    setExamText(SAMPLE_MENH_DE_TAP_HOP_SPEC_TEXT);
    const { spec, topics } = parseCustomSpecOrExam(SAMPLE_MENH_DE_TAP_HOP_SPEC_TEXT);
    setPreviewSpec(spec);
    setPreviewTopics(topics);
    setActiveTab('preview');
  };

  const handleLoadVerbatimPdfStandard = () => {
    const stdSpec = structuredClone(DEFAULT_TOAN_10_DOCUMENT.specification);
    const stdTopics = syncMatrixFromSpec(
      structuredClone(DEFAULT_TOAN_10_DOCUMENT.matrixTopics),
      stdSpec
    );
    setExamText(SAMPLE_VERBATIM_SPEC_TEXT);
    setPreviewSpec(stdSpec);
    setPreviewTopics(stdTopics);
    setActiveTab('preview');
  };

  const handleStartRefinement = async (useAi: boolean) => {
    setIsProcessing(true);
    setErrorMsg(null);

    if (!useAi || !examText.trim()) {
      const { spec, topics } = parseCustomSpecOrExam(examText);
      setPreviewSpec(spec);
      setPreviewTopics(topics);
      setActiveTab('preview');
      setIsProcessing(false);
      return;
    }

    const localParsed = parseCustomSpecOrExam(examText);
    if (/\[(u\d+|TD_|GQ_|MH_)/i.test(examText)) {
      setPreviewSpec(localParsed.spec);
      setPreviewTopics(localParsed.topics);
      setActiveTab('preview');
      setIsProcessing(false);
      return;
    }

    try {
      const apiKey =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('user_gemini_api_key') || undefined
          : undefined;

      const response = await fetch('/api/refine-specification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specification: localParsed.spec,
          matrixTopics: localParsed.topics,
          examText: examText.trim(),
          customGuidance: customGuidance.trim(),
          apiKey,
          speedMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Lỗi máy chủ (${response.status})`);
      }

      const data = await response.json();
      if (data.updatedSpec) {
        const resultTopics = data.updatedTopics || localParsed.topics;
        const synced = syncMatrixFromSpec(resultTopics, data.updatedSpec);
        setPreviewSpec(data.updatedSpec);
        setPreviewTopics(synced);
        setActiveTab('preview');
      } else {
        setPreviewSpec(localParsed.spec);
        setPreviewTopics(localParsed.topics);
        setActiveTab('preview');
      }
    } catch {
      setPreviewSpec(localParsed.spec);
      setPreviewTopics(localParsed.topics);
      setActiveTab('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!previewSpec) return;
    const targetTopics = previewTopics || matrixTopics;
    const syncedTopics = syncMatrixFromSpec(targetTopics, previewSpec);
    onApplyRefinedSpec(previewSpec, syncedTopics);
    onClose();
  };

  const activeUnits = (previewTopics || matrixTopics).flatMap((t) =>
    t.units.map((u) => ({ id: u.id, label: `${t.topicName} — ${u.content}`, short: u.content }))
  );

  const updatePreviewTnDesc = (idx: number, newDesc: string) => {
    if (!previewSpec) return;
    const next = structuredClone(previewSpec);
    if (next.multipleChoice[idx]) {
      next.multipleChoice[idx].description = newDesc;
      setPreviewSpec(next);
    }
  };

  const updatePreviewTnUnit = (idx: number, newUnitId: string) => {
    if (!previewSpec) return;
    const next = structuredClone(previewSpec);
    if (next.multipleChoice[idx]) {
      next.multipleChoice[idx].unitId = newUnitId;
      setPreviewSpec(next);
    }
  };

  const updatePreviewDsDesc = (qIdx: number, sIdx: number, newDesc: string) => {
    if (!previewSpec) return;
    const next = structuredClone(previewSpec);
    if (next.trueFalse[qIdx]?.subItems[sIdx]) {
      next.trueFalse[qIdx].subItems[sIdx].description = newDesc;
      setPreviewSpec(next);
    }
  };

  const updatePreviewDsUnit = (qIdx: number, newUnitId: string) => {
    if (!previewSpec) return;
    const next = structuredClone(previewSpec);
    if (next.trueFalse[qIdx]) {
      next.trueFalse[qIdx].unitId = newUnitId;
      setPreviewSpec(next);
    }
  };

  const updatePreviewTlnDesc = (idx: number, newDesc: string) => {
    if (!previewSpec) return;
    const next = structuredClone(previewSpec);
    if (next.shortAnswer[idx]) {
      next.shortAnswer[idx].description = newDesc;
      setPreviewSpec(next);
    }
  };

  const updatePreviewTlnUnit = (idx: number, newUnitId: string) => {
    if (!previewSpec) return;
    const next = structuredClone(previewSpec);
    if (next.shortAnswer[idx]) {
      next.shortAnswer[idx].unitId = newUnitId;
      setPreviewSpec(next);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Cập Nhật & Tinh Chỉnh Bảng Đặc Tả Sát Đề Kiểm Tra
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Đồng bộ Ma trận 100%
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Hỗ trợ đầy đủ bài Mệnh đề & Tập hợp, Bất phương trình, Đại số tổ hợp, Phương pháp tọa độ, Hệ thức lượng, Vectơ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('options')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'options'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              1. Nhập Bảng đặc tả / Đề kiểm tra
            </button>
            <button
              type="button"
              onClick={() => {
                if (previewSpec) setActiveTab('preview');
                else handleStartRefinement(false);
              }}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              2. Kiểm tra & Chỉnh sửa từng câu ({previewSpec ? 'Đã sẵn sàng' : 'Xem toàn bộ 34 lệnh hỏi'})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button
              type="button"
              onClick={handleLoadKhaoSatDauNamStandard}
              className="px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Nạp chuẩn Đề Khảo Sát Đầu Năm (28 lệnh - 10đ)
            </button>
            <button
              type="button"
              onClick={handleLoadVerbatimPdfStandard}
              className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Nạp chuẩn PDF GK2 Toán 10 gốc
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {activeTab === 'options' ? (
            <div className="space-y-4">
              {/* Feature highlight banner */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-start gap-3">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed space-y-1">
                  <div>
                    <strong>Đề của bạn có bài Mệnh đề & Tập hợp?</strong> Nhấn nút màu xanh <strong>"+ Nạp Đặc tả có bài Mệnh đề & Tập hợp"</strong> ở góc trên bên phải để bổ sung ngay Chủ đề <strong>MỆNH ĐỀ VÀ TẬP HỢP</strong> (gồm 2 bài: <em>Mệnh đề</em> và <em>Tập hợp và các phép toán trên tập hợp</em>) vào cả Bảng Đặc Tả và Ma Trận, hoặc dán trực tiếp đề thi / bảng đặc tả của bạn vào ô bên dưới.
                  </div>
                </div>
              </div>

              {/* Paste Custom Spec or Exam Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <ClipboardPaste className="w-3.5 h-3.5 text-emerald-600" />
                    Dán Bảng đặc tả của bạn hoặc Nội dung đề kiểm tra vào đây:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setExamText(SAMPLE_MENH_DE_TAP_HOP_SPEC_TEXT)}
                      className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                    >
                      Điền mẫu có bài Mệnh đề & Tập hợp
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamText(SAMPLE_VERBATIM_SPEC_TEXT)}
                      className="text-[11px] text-blue-700 hover:underline font-medium cursor-pointer"
                    >
                      Điền mẫu GK2 Toán 10
                    </button>
                  </div>
                </div>
                <textarea
                  value={examText}
                  onChange={(e) => setExamText(e.target.value)}
                  placeholder={`Ví dụ dán Bảng đặc tả hoặc Đề kiểm tra có bài Mệnh đề - Tập hợp:\nCâu 1: Phát biểu nào sau đây là một mệnh đề toán học?\nCâu 2: Tìm mệnh đề phủ định của mệnh đề P: "∀x ∈ ℝ, x² + 1 > 0".\nCâu 3: Cho hai tập hợp A = [-2; 3] và B = (1; 5). Tìm A ∩ B, A ∪ B.\n...`}
                  rows={10}
                  className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono resize-y leading-relaxed"
                />
              </div>

              {/* Custom Guidance */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú / Yêu cầu thêm cho AI (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={customGuidance}
                  onChange={(e) => setCustomGuidance(e.target.value)}
                  placeholder="VD: Đề có bài Mệnh đề và Tập hợp, hãy đưa đầy đủ vào Ma trận và Bảng đặc tả..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Speed Mode */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Chế độ xử lý:</span>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setSpeedMode('fast')}
                      className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                        speedMode === 'fast'
                          ? 'bg-white font-semibold text-emerald-800 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Zap className="w-3 h-3 text-amber-500" />
                      Nhanh & Chính xác
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeedMode('deep')}
                      className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                        speedMode === 'deep'
                          ? 'bg-white font-semibold text-emerald-800 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      AI Chuyên sâu
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Tự động đồng bộ Chủ đề, Đơn vị kiến thức, Số câu & Điểm số sang Ma trận
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  Toàn bộ nội dung Bảng đặc tả ({previewSpec?.multipleChoice.length || 0} câu TN, {previewSpec?.trueFalse.length || 0} câu ĐS, {previewSpec?.shortAnswer.length || 0} câu TLN, {previewSpec?.essay.length || 0} lệnh TL):
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleLoadKhaoSatDauNamStandard}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Nạp chuẩn Đề Khảo Sát Đầu Năm
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadVerbatimPdfStandard}
                    className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Khôi phục PDF GK2 gốc
                  </button>
                </div>
              </div>

              {/* Full Editable Preview Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs max-h-[55vh] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2 px-3 text-left w-24 font-semibold">Phần / Câu</th>
                      <th className="py-2 px-3 text-left w-48 font-semibold">Bài học / Đơn vị kiến thức</th>
                      <th className="py-2 px-3 text-left w-24 font-semibold">Mức độ</th>
                      <th className="py-2 px-3 text-left font-semibold">Nội dung Yêu cầu cần đạt (YCCĐ) trong Bảng đặc tả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewSpec?.multipleChoice.map((q, idx) => (
                      <tr key={q.id} className="hover:bg-slate-50/80">
                        <td className="py-1.5 px-3 font-semibold text-slate-800">
                          {q.questionLabel} <span className="text-[10px] text-blue-600 font-normal">(TN)</span>
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={q.unitId}
                            onChange={(e) => updatePreviewTnUnit(idx, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[11px] text-slate-700 truncate"
                          >
                            {activeUnits.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.short}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 px-3 text-slate-500 font-mono text-[11px]">
                          {q.cellKey}
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={q.description}
                            onChange={(e) => updatePreviewTnDesc(idx, e.target.value)}
                            className="w-full px-2 py-1 text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 focus:bg-white rounded focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                    {previewSpec?.trueFalse.flatMap((q, qIdx) =>
                      q.subItems.map((sub, sIdx) => (
                        <tr key={`${q.id}-${sub.subLabel}`} className="hover:bg-emerald-50/40 bg-emerald-50/15">
                          <td className="py-1.5 px-3 font-semibold text-emerald-950">
                            {q.questionLabel} - ý {sub.subLabel}) <span className="text-[10px] text-emerald-700 font-normal">(ĐS)</span>
                          </td>
                          <td className="py-1.5 px-2">
                            {sIdx === 0 ? (
                              <select
                                value={q.unitId}
                                onChange={(e) => updatePreviewDsUnit(qIdx, e.target.value)}
                                className="w-full bg-white border border-emerald-200 rounded px-1.5 py-1 text-[11px] text-emerald-900 font-medium truncate"
                              >
                                {activeUnits.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.short}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[11px] text-slate-400 pl-2">↳ cùng bài câu {qIdx + 1}</span>
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-slate-500 font-mono text-[11px]">
                            {sub.cellKey}
                          </td>
                          <td className="py-1.5 px-3">
                            <input
                              type="text"
                              value={sub.description}
                              onChange={(e) => updatePreviewDsDesc(qIdx, sIdx, e.target.value)}
                              className="w-full px-2 py-1 text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 focus:bg-white rounded focus:outline-none"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                    {previewSpec?.shortAnswer.map((q, idx) => (
                      <tr key={q.id} className="hover:bg-amber-50/40 bg-amber-50/15">
                        <td className="py-1.5 px-3 font-semibold text-amber-950">
                          {q.questionLabel} <span className="text-[10px] text-amber-700 font-normal">(TLN)</span>
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={q.unitId}
                            onChange={(e) => updatePreviewTlnUnit(idx, e.target.value)}
                            className="w-full bg-white border border-amber-200 rounded px-1.5 py-1 text-[11px] text-amber-900 truncate"
                          >
                            {activeUnits.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.short}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 px-3 text-slate-500 font-mono text-[11px]">
                          {q.cellKey}
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={q.description}
                            onChange={(e) => updatePreviewTlnDesc(idx, e.target.value)}
                            className="w-full px-2 py-1 text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 focus:bg-white rounded focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                    {previewSpec?.essay.map((q, idx) => (
                      <tr key={q.id} className="hover:bg-purple-50/40 bg-purple-50/15">
                        <td className="py-1.5 px-3 font-semibold text-purple-950">
                          {q.questionLabel} <span className="text-[10px] text-purple-700 font-normal">(TL)</span>
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={q.unitId}
                            onChange={(e) => {
                              if (!previewSpec) return;
                              const next = structuredClone(previewSpec);
                              if (next.essay[idx]) {
                                next.essay[idx].unitId = e.target.value;
                                setPreviewSpec(next);
                              }
                            }}
                            className="w-full bg-white border border-purple-200 rounded px-1.5 py-1 text-[11px] text-purple-900 truncate"
                          >
                            {activeUnits.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.short}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 px-3 text-slate-500 font-mono text-[11px]">
                          {q.cellKey}
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={q.description}
                            onChange={(e) => {
                              if (!previewSpec) return;
                              const next = structuredClone(previewSpec);
                              if (next.essay[idx]) {
                                next.essay[idx].description = e.target.value;
                                setPreviewSpec(next);
                              }
                            }}
                            className="w-full px-2 py-1 text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 focus:bg-white rounded focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {activeTab === 'options' ? (
              <>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStartRefinement(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                >
                  ⚡ Phân tích & Xem trước ngay
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStartRefinement(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Phân tích & Đồng bộ Bảng đặc tả
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Áp dụng vào Bảng đặc tả & Ma trận
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
