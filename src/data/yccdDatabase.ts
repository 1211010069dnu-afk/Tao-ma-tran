/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NGÂN HÀNG YÊU CẦU CẦN ĐẠT (YCCD) MÔN TOÁN CHƯƠNG TRÌNH GDPT 2018
 * Trích xuất từ file chuẩn của Bộ GD&ĐT: YCCD_51e42c28.pdf
 * Đầy đủ từ Lớp 6 đến Lớp 12 phân chia theo các mạch kiến thức chính.
 */

export type MathGrade = '6' | '7' | '8' | '9' | '10' | '11' | '12';

export type KnowledgeDomain = 
  | 'Số và Đại số'
  | 'Đại số và Một số yếu tố Giải tích'
  | 'Hình học và Đo lường'
  | 'Thống kê và Xác suất'
  | 'Chuyên đề học tập';

export interface YCCDItem {
  id: string;
  grade: MathGrade;
  domain: KnowledgeDomain;
  mainTopic: string; // Tên chủ đề chính (ví dụ: Dấu của tam thức bậc hai, Hàm số lượng giác...)
  subTopic?: string; // Các bài học hoặc đơn vị kiến thức cụ thể
  keywords?: string[]; // Từ khóa tìm kiếm nhanh
  competencySuggestion?: {
    cellKey: 'TD_Biet' | 'TD_Hieu' | 'TD_VD' | 'GQ_Biet' | 'GQ_Hieu' | 'GQ_VD' | 'MH_Biet' | 'MH_Hieu' | 'MH_VD';
    indicatorCode: string;
    levelName: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';
  };
  requirements: string[]; // Danh sách yêu cầu cần đạt chi tiết của Bộ GD&ĐT
}

export const YCCD_DOMAINS: KnowledgeDomain[] = [
  'Số và Đại số',
  'Đại số và Một số yếu tố Giải tích',
  'Hình học và Đo lường',
  'Thống kê và Xác suất',
  'Chuyên đề học tập',
];

export const YCCD_GRADES: MathGrade[] = ['6', '7', '8', '9', '10', '11', '12'];

export const YCCD_DATABASE: YCCDItem[] = [
  // ==========================================
  // LỚP 10 (THPT)
  // ==========================================
  {
    id: 'yccd-10-menh-de',
    grade: '10',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Mệnh đề toán học',
    subTopic: 'Mệnh đề phủ định, đảo, tương đương, điều kiện cần và đủ, kí hiệu ∀, ∃',
    keywords: ['menh de', 'phu dinh', 'tuong duong', 'keo theo', 'dieu kien can', 'dieu kien du', 'moi', 'ton tai'],
    competencySuggestion: { cellKey: 'TD_Biet', indicatorCode: 'TD1.1', levelName: 'Nhận biết' },
    requirements: [
      'Thiết lập và phát biểu được các mệnh đề toán học: mệnh đề phủ định; mệnh đề đảo; mệnh đề tương đương; mệnh đề có chứa kí hiệu ∀, ∃; điều kiện cần, điều kiện đủ, điều kiện cần và đủ.',
      'Xác định được tính đúng/sai của một mệnh đề toán học trong những trường hợp đơn giản.',
      'Hiểu và phân biệt được mệnh đề toán học với các câu khẳng định thông thường.',
    ],
  },
  {
    id: 'yccd-10-tap-hop',
    grade: '10',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Tập hợp và các phép toán trên tập hợp',
    subTopic: 'Tập con, tập rỗng, giao, hợp, hiệu, phần bù, các tập hợp số, biểu đồ Ven',
    keywords: ['tap hop', 'tap con', 'giao', 'hop', 'hieu', 'phan bu', 'bieu do ven', 'khoang', 'doan'],
    competencySuggestion: { cellKey: 'TD_Biet', indicatorCode: 'TD1.2', levelName: 'Nhận biết' },
    requirements: [
      'Nhận biết được các khái niệm cơ bản về tập hợp (tập con, hai tập hợp bằng nhau, tập rỗng) và biết sử dụng các kí hiệu ⊂, ⊃, ∅, ∈, ∉.',
      'Thực hiện được phép toán trên các tập hợp (hợp, giao, hiệu của hai tập hợp, phần bù của một tập con) và biết dùng biểu đồ Ven để biểu diễn chúng.',
      'Biểu diễn và tìm giao, hợp, hiệu của các tập hợp con của tập số thực (khoảng, đoạn, nửa khoảng).',
      'Giải quyết được một số vấn đề thực tiễn gắn với phép toán trên tập hợp (bài toán đếm học sinh, khảo sát).',
    ],
  },
  {
    id: 'yccd-10-bpt-he-bpt-2an',
    grade: '10',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Bất phương trình và hệ bất phương trình bậc nhất hai ẩn',
    subTopic: 'Miền nghiệm phẳng toạ độ và bài toán quy hoạch tuyến tính F = ax + by',
    keywords: ['bat phuong trinh', 'he bat phuong trinh', 'hai an', 'mien nghiem', 'quy hoach tuyen tinh', 'cuc tri'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết được bất phương trình và hệ bất phương trình bậc nhất hai ẩn ax + by ≤ c.',
      'Biểu diễn được miền nghiệm của bất phương trình và hệ bất phương trình bậc nhất hai ẩn trên mặt phẳng toạ độ.',
      'Vận dụng được kiến thức về bất phương trình, hệ bất phương trình bậc nhất hai ẩn vào giải quyết bài toán thực tiễn (tìm giá trị lớn nhất, nhỏ nhất của biểu thức F = ax + by trên miền đa giác lồi).',
    ],
  },
  {
    id: 'yccd-10-ham-so-bac-hai',
    grade: '10',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Hàm số bậc hai và đồ thị Parabola',
    subTopic: 'Đỉnh, trục đối xứng, bảng biến thiên, vẽ Parabola, bài toán cổng vòm quỹ đạo',
    keywords: ['ham so bac hai', 'parabol', 'parabola', 'dinh', 'truc doi xung', 'bien thien', 'cong vom', 'do cao'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1', levelName: 'Thông hiểu' },
    requirements: [
      'Thiết lập được bảng giá trị và bảng biến thiên của hàm số bậc hai y = ax² + bx + c (a ≠ 0).',
      'Vẽ được Parabola là đồ thị hàm số bậc hai; nhận biết các tính chất như toạ độ đỉnh (-b/2a; -Δ/4a), trục đối xứng x = -b/2a, bề lõm.',
      'Giải thích được các tính chất của hàm số bậc hai (đồng biến, nghịch biến, giá trị lớn nhất/nhỏ nhất) thông qua đồ thị.',
      'Vận dụng được kiến thức về hàm số bậc hai và đồ thị vào giải quyết bài toán thực tiễn (độ cao cổng Parabola, tầm bay quỹ đạo ném bóng).',
    ],
  },
  {
    id: 'yccd-10-dau-tam-thuc',
    grade: '10',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Dấu của tam thức bậc hai và Bất phương trình bậc hai một ẩn',
    subTopic: 'Định lí về dấu của tam thức f(x) = ax² + bx + c, giải BPT bậc hai',
    keywords: ['dau tam thuc', 'tam thuc bac hai', 'bat phuong trinh bac hai', 'xet dau', 'delta'],
    competencySuggestion: { cellKey: 'TD_Biet', indicatorCode: 'TD1.2', levelName: 'Nhận biết' },
    requirements: [
      'Giải thích được định lí về dấu của tam thức bậc hai ax² + bx + c từ việc quan sát đồ thị Parabola tương ứng.',
      'Giải được bất phương trình bậc hai một ẩn ax² + bx + c > 0, ≥ 0, < 0, ≤ 0.',
      'Vận dụng được bất phương trình bậc hai một ẩn vào giải quyết bài toán thực tiễn (xác định vận tốc an toàn, tải trọng, kích thước xe qua hầm vòm).',
    ],
  },
  {
    id: 'yccd-10-pt-chua-can',
    grade: '10',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Phương trình quy về phương trình bậc hai (Phương trình chứa căn)',
    subTopic: 'Dạng √(ax² + bx + c) = √(dx² + ex + f) và dạng √(ax² + bx + c) = dx + e',
    keywords: ['phuong trinh chua can', 'can thuc', 'binh phuong hai ve', 'thu lai nghiem'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ1.3', levelName: 'Thông hiểu' },
    requirements: [
      'Giải được phương trình chứa căn thức có dạng: √(ax² + bx + c) = √(dx² + ex + f).',
      'Giải được phương trình chứa căn thức có dạng: √(ax² + bx + c) = dx + e.',
      'Vận dụng phương pháp bình phương hai vế và thử lại nghiệm để loại nghiệm ngoại lai.',
      'Giải quyết được bài toán thực tiễn dẫn về phương trình quy về bậc hai (khoảng cách tàu thuyền, dòng chảy).',
    ],
  },
  {
    id: 'yccd-10-to-hop-xac-suat',
    grade: '10',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Đại số tổ hợp: Quy tắc đếm, Hoán vị, Chỉnh hợp, Tổ hợp, Nhị thức Newton',
    subTopic: 'Quy tắc cộng, quy tắc nhân, sơ đồ cây, công thức Pn, Ank, Cnk, khai triển (a + b)⁴, (a + b)⁵',
    keywords: ['quy tac cong', 'quy tac nhan', 'hoan vi', 'chinh hop', 'to hop', 'nhi thuc newton', 'so do cay'],
    competencySuggestion: { cellKey: 'GQ_VD', indicatorCode: 'GQ3.1', levelName: 'Vận dụng' },
    requirements: [
      'Vận dụng được quy tắc cộng và quy tắc nhân trong các tình huống đếm phương án lựa chọn thực tế.',
      'Vận dụng được sơ đồ hình cây trong các bài toán đếm đối tượng trong Toán học và các môn khoa học.',
      'Tính được số các hoán vị, chỉnh hợp, tổ hợp bằng công thức và máy tính cầm tay.',
      'Khai triển được nhị thức Newton (a + b)ⁿ với số mũ thấp (n = 4 hoặc n = 5) bằng cách vận dụng tổ hợp.',
      'Vận dụng kiến thức tổ hợp vào giải quyết các bài toán sắp xếp, chọn đội tuyển, phân chia công việc.',
    ],
  },
  {
    id: 'yccd-10-he-thuc-luong-vecto',
    grade: '10',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Hệ thức lượng trong tam giác và Vectơ',
    subTopic: 'Định lí côsin, định lí sin, công thức diện tích tam giác, tích vô hướng của hai vectơ',
    keywords: ['he thuc luong', 'dinh li cosin', 'dinh li sin', 'dien tich tam giac', 'vecto', 'tich vo huong', 'goc'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết được giá trị lượng giác của một góc từ 0° đến 180° và quan hệ lượng giác của hai góc bù nhau, phụ nhau.',
      'Giải thích được các hệ thức lượng cơ bản trong tam giác: định lí côsin, định lí sin, các công thức tính diện tích S = 1/2.ab.sinC = abc/4R = pr = √(p(p-a)(p-b)(p-c)).',
      'Mô tả cách giải tam giác và vận dụng vào việc giải quyết một số bài toán đo đạc thực tiễn (chiều cao ngọn hải đăng, khoảng cách giữa hai mốc bờ sông).',
      'Nhận biết khái niệm vectơ, vectơ cùng phương, cùng hướng, độ dài vectơ, vectơ-không.',
      'Thực hiện các phép toán trên vectơ (tổng, hiệu, tích vectơ với một số thực) và tích vô hướng của hai vectơ.',
      'Vận dụng kiến thức vectơ vào giải quyết bài toán vật lý thực tế (hợp lực kéo, công sinh ra do một lực tác dụng).',
    ],
  },
  {
    id: 'yccd-10-toa-do-mat-phang',
    grade: '10',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Phương pháp toạ độ trong mặt phẳng Oxy',
    subTopic: 'Toạ độ vectơ, đường thẳng, góc và khoảng cách, phương trình đường tròn, ba đường conic',
    keywords: ['toa do oxy', 'duong thang', 'vecto phap tuyen', 'khoang cach', 'duong tron', 'conic', 'elip', 'hypebol', 'parabol'],
    competencySuggestion: { cellKey: 'GQ_VD', indicatorCode: 'GQ3.2', levelName: 'Vận dụng' },
    requirements: [
      'Nhận biết toạ độ của vectơ đối với hệ trục Oxy; tính độ dài vectơ, toạ độ trung điểm và toạ độ trọng tâm tam giác.',
      'Sử dụng biểu thức toạ độ của tích vô hướng để tính góc giữa hai vectơ, xét tính vuông góc của hai vectơ.',
      'Mô tả phương trình tổng quát và tham số của đường thẳng; thiết lập phương trình đường thẳng qua một điểm và biết VTPT hoặc VTCP.',
      'Tính khoảng cách từ một điểm đến đường thẳng và góc giữa hai đường thẳng.',
      'Thiết lập phương trình đường tròn khi biết tâm và bán kính; viết phương trình tiếp tuyến của đường tròn tại một điểm.',
      'Nhận biết định nghĩa hình học và phương trình chính tắc của ba đường conic (elip, hypebol, parabol); xác định toạ độ tiêu điểm, đỉnh, độ dài các trục.',
    ],
  },
  {
    id: 'yccd-10-thong-ke-xac-suat',
    grade: '10',
    domain: 'Thống kê và Xác suất',
    mainTopic: 'Thống kê và Xác suất cổ điển',
    subTopic: 'Số gần đúng, sai số, các số đặc trưng đo xu thế trung tâm và mức độ phân tán, không gian mẫu và biến cố',
    keywords: ['thong ke', 'so gan dung', 'sai so', 'trung binh', 'trung vi', 'tu phan vi', 'phuong sai', 'do lech chuan', 'xac suat'],
    competencySuggestion: { cellKey: 'MH_VD', indicatorCode: 'MH2.1', levelName: 'Vận dụng' },
    requirements: [
      'Hiểu khái niệm số gần đúng, sai số tuyệt đối, sai số tương đối, độ chính xác và biết quy tròn số gần đúng.',
      'Tính được các số đặc trưng đo xu thế trung tâm: số trung bình, trung vị, tứ phân vị (Q1, Q2, Q3), mốt của mẫu số liệu.',
      'Tính được các số đặc trưng đo mức độ phân tán: khoảng biến thiên, khoảng tứ phân vị (IQR), phương sai, độ lệch chuẩn.',
      'Nhận biết phép thử ngẫu nhiên, không gian mẫu, biến cố, biến cố đối, biến cố chắc chắn và biến cố không thể.',
      'Tính xác suất của biến cố theo định nghĩa cổ điển P(A) = n(A)/n(Ω) bằng phương pháp liệt kê hoặc tổ hợp.',
    ],
  },
  {
    id: 'yccd-10-chuyen-de',
    grade: '10',
    domain: 'Chuyên đề học tập',
    mainTopic: 'Chuyên đề học tập Toán 10',
    subTopic: 'Hệ phương trình bậc nhất ba ẩn, Quy nạp toán học, Ứng dụng ba đường conic',
    keywords: ['chuyen de 10', 'quy nap', 'he ba an', 'gauss', 'conic ung dung'],
    competencySuggestion: { cellKey: 'GQ_VD', indicatorCode: 'GQ3.1', levelName: 'Vận dụng' },
    requirements: [
      'Giải hệ phương trình bậc nhất ba ẩn bằng phương pháp Gauss hoặc máy tính cầm tay và ứng dụng giải bài toán cân bằng phản ứng hóa học, phân bổ tài chính.',
      'Hiểu và vận dụng nguyên lí quy nạp toán học để chứng minh đẳng thức, bất đẳng thức, tính chia hết.',
      'Vận dụng tính chất tiêu điểm của ba đường conic vào thiết kế chảo parabol vệ tinh, đèn pha, kính viễn vọng thiên văn.',
    ],
  },

  // ==========================================
  // LỚP 11 (THPT)
  // ==========================================
  {
    id: 'yccd-11-luong-giac',
    grade: '11',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Hàm số lượng giác và phương trình lượng giác',
    subTopic: 'Góc lượng giác, công thức lượng giác (cộng, nhân đôi, biến đổi tích-tổng), đồ thị 4 hàm số và PT cơ bản',
    keywords: ['luong giac', 'radian', 'cong thuc cong', 'nhan doi', 'sin', 'cos', 'tan', 'cot', 'phuong trinh luong giac'],
    competencySuggestion: { cellKey: 'TD_Hieu', indicatorCode: 'TD1.3', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết khái niệm góc lượng giác, đường tròn lượng giác, giá trị lượng giác của một góc; đổi đơn vị từ độ sang radian và ngược lại.',
      'Vận dụng các công thức lượng giác cơ bản: công thức cộng, công thức nhân đôi, công thức hạ bậc, công thức biến đổi tích thành tổng và tổng thành tích.',
      'Nhận biết tập xác định, tính chẵn lẻ, chu kì tuần hoàn và đồ thị của các hàm số y = sin x, y = cos x, y = tan x, y = cot x.',
      'Giải các phương trình lượng giác cơ bản: sin x = m, cos x = m, tan x = m, cot x = m và các phương trình quy về phương trình cơ bản.',
    ],
  },
  {
    id: 'yccd-11-day-so-csc-csn',
    grade: '11',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Dãy số. Cấp số cộng và Cấp số nhân',
    subTopic: 'Số hạng tổng quát, tính tăng giảm, bị chặn; Công sai d, công bội q; Tổng n số hạng đầu Sn',
    keywords: ['day so', 'cap so cong', 'cap so nhan', 'cong sai', 'cong boi', 'so hang tong quat', 'tong sn'],
    competencySuggestion: { cellKey: 'GQ_VD', indicatorCode: 'GQ3.1', levelName: 'Vận dụng' },
    requirements: [
      'Nhận biết khái niệm dãy số, dãy số hữu hạn, dãy số vô hạn; xét tính tăng, giảm và tính bị chặn của dãy số.',
      'Nhận biết định nghĩa cấp số cộng, số hạng tổng quát uₙ = u₁ + (n - 1)d, tính chất uₖ = (uₖ₋₁ + uₖ₊₁)/2 và công thức tính tổng Sₙ = n/2.[2u₁ + (n - 1)d].',
      'Nhận biết định nghĩa cấp số nhân, số hạng tổng quát uₙ = u₁·qⁿ⁻¹, tính chất uₖ² = uₖ₋₁·uₖ₊₁ và công thức tính tổng Sₙ = u₁(1 - qⁿ)/(1 - q) (q ≠ 1).',
      'Vận dụng kiến thức cấp số cộng và cấp số nhân vào giải quyết các bài toán thực tế (tính lãi suất, tăng trưởng dân số, phân chia phân kì đầu tư).',
    ],
  },
  {
    id: 'yccd-11-gioi-han-lien-tuc',
    grade: '11',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Giới hạn dãy số, Giới hạn hàm số và Hàm số liên tục',
    subTopic: 'Giới hạn hữu hạn, vô cực, một phía; Tổng cấp số nhân lùi vô hạn; Tính liên tục tại điểm và trên khoảng',
    keywords: ['gioi han', 'lim', 'cap so nhan lui vo han', 'ham so lien tuc', 'dinh li gia tri trung gian'],
    competencySuggestion: { cellKey: 'TD_Hieu', indicatorCode: 'TD2.2', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết khái niệm giới hạn của dãy số; tính các giới hạn cơ bản và tính tổng của một cấp số nhân lùi vô hạn S = u₁/(1 - q).',
      'Nhận biết giới hạn hữu hạn của hàm số tại một điểm, giới hạn tại vô cực, giới hạn một bên (trái, phải); tính các giới hạn dạng 0/0, ∞/∞ bằng phương pháp khử dạng vô định.',
      'Nhận biết khái niệm hàm số liên tục tại một điểm và trên một khoảng; tính chất liên tục của các hàm đa thức, phân thức hữu tỉ, lượng giác.',
      'Vận dụng định lí giá trị trung gian để chứng minh sự tồn tại nghiệm của một phương trình đại số.',
    ],
  },
  {
    id: 'yccd-11-mu-logarit',
    grade: '11',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Hàm số mũ và Hàm số lôgarit',
    subTopic: 'Lũy thừa số mũ thực, Lôgarit, Đồ thị và sự biến thiên của hàm mũ/lôgarit, PT và BPT mũ - lôgarit',
    keywords: ['luy thua', 'logarit', 'ham so mu', 'ham so logarit', 'phuong trinh mu', 'lai kep', 'ph'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1', levelName: 'Thông hiểu' },
    requirements: [
      'Hiểu và vận dụng các tính chất của luỹ thừa với số mũ nguyên, hữu tỉ và số thực.',
      'Nhận biết định nghĩa và các tính chất cơ bản của phép tính lôgarit (lôgarit của tích, thương, luỹ thừa, đổi cơ số).',
      'Nhận dạng tập xác định, chiều biến thiên và đồ thị của hàm số mũ y = aˣ và hàm số lôgarit y = logₐx (a > 0, a ≠ 1).',
      'Giải phương trình, bất phương trình mũ và lôgarit ở dạng cơ bản (đưa về cùng cơ số, đặt ẩn phụ đơn giản).',
      'Vận dụng hàm số mũ và lôgarit vào giải bài toán thực tiễn (công thức lãi kép A = P(1 + r)ⁿ, độ pH hóa học, thang Richter đo cường độ động đất).',
    ],
  },
  {
    id: 'yccd-11-dao-ham',
    grade: '11',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Đạo hàm và Ý nghĩa hình học',
    subTopic: 'Định nghĩa đạo hàm, Ý nghĩa hình học và tiếp tuyến, Bảng đạo hàm sơ cấp, Đạo hàm hàm hợp, Đạo hàm cấp hai',
    keywords: ['dao ham', 'y nghia hinh hoc', 'tiep tuyen', 'he so goc', 'dao ham cap hai', 'van toc', 'gia toc'],
    competencySuggestion: { cellKey: 'GQ_VD', indicatorCode: 'GQ3.1', levelName: 'Vận dụng' },
    requirements: [
      'Nhận biết định nghĩa đạo hàm tại một điểm thông qua giới hạn tỉ số gia hàm và gia đối số; ý nghĩa vật lí (vận tốc tức thời v(t) = s\'(t)).',
      'Mô tả ý nghĩa hình học của đạo hàm: hệ số góc tiếp tuyến k = f\'(x₀); viết phương trình tiếp tuyến của đồ thị hàm số y = f(x) tại điểm M(x₀; y₀).',
      'Tính đạo hàm của các hàm số cơ bản: luỹ thừa xⁿ, căn thức √x, hàm lượng giác (sin, cos, tan, cot), hàm mũ (aˣ, eˣ), hàm lôgarit (logₐx, ln x).',
      'Sử dụng các quy tắc đạo hàm: đạo hàm của tổng, hiệu, tích, thương và quy tắc đạo hàm của hàm hợp (f(u))\' = f\'(u)·u\'.',
      'Tính đạo hàm cấp hai f\'\'(x) và vận dụng tính gia tốc tức thời trong chuyển động a(t) = v\'(t) = s\'\'(t).',
    ],
  },
  {
    id: 'yccd-11-hinh-khong-gian-song-song',
    grade: '11',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Hình học không gian: Quan hệ song song',
    subTopic: 'Điểm, đường thẳng, mặt phẳng; Hai đường thẳng chéo nhau/song song; Đường thẳng song song mặt phẳng; Hai mặt phẳng song song',
    keywords: ['hinh hoc khong gian', 'quan he song song', 'giao tuyen', 'giao diem', 'mat phang song song', 'thales'],
    competencySuggestion: { cellKey: 'TD_Hieu', indicatorCode: 'TD3.3', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết các tiên đề hình học không gian, các cách xác định mặt phẳng; tìm giao tuyến của hai mặt phẳng và giao điểm của đường thẳng với mặt phẳng.',
      'Nhận biết vị trí tương đối của hai đường thẳng trong không gian: cắt nhau, song song, trùng nhau, chéo nhau.',
      'Nhận biết và vận dụng định lí về điều kiện để đường thẳng song song với mặt phẳng.',
      'Nhận biết và vận dụng định lí về hai mặt phẳng song song, tính chất hình lăng trụ, hình hộp và định lí Thalès trong không gian.',
      'Mô tả tính chất của phép chiếu song song và vẽ hình biểu diễn của các hình khối đơn giản trong không gian.',
    ],
  },
  {
    id: 'yccd-11-hinh-khong-gian-vuong-goc',
    grade: '11',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Hình học không gian: Quan hệ vuông góc, Góc và Khoảng cách',
    subTopic: 'Đường thẳng vuông góc mặt phẳng, Hai mặt phẳng vuông góc, Góc giữa đường và mặt, Góc nhị diện, Khoảng cách',
    keywords: ['quan he vuong goc', 'duong vuong goc mat', 'hai mat vuong goc', 'goc nhi dien', 'khoang cach', 'the tich'],
    competencySuggestion: { cellKey: 'GQ_VD', indicatorCode: 'GQ3.2', levelName: 'Vận dụng' },
    requirements: [
      'Nhận biết hai đường thẳng vuông góc; chứng minh đường thẳng vuông góc với mặt phẳng và vận dụng định lí ba đường vuông góc.',
      'Nhận biết hai mặt phẳng vuông góc; chứng minh góc giữa hai mặt phẳng vuông góc; nêu tính chất của hình lăng trụ đứng, hình chóp đều.',
      'Xác định và tính góc giữa đường thẳng và mặt phẳng; góc nhị diện và góc phẳng của góc nhị diện.',
      'Xác định và tính khoảng cách: từ điểm đến đường thẳng, từ điểm đến mặt phẳng, khoảng cách giữa hai đường thẳng song song, giữa hai đường thẳng chéo nhau.',
      'Tính thể tích của khối lăng trụ, khối chóp, khối chóp cụt đều và vận dụng vào giải bài toán thực tế (tính khối lượng bể chứa, vật liệu xây dựng).',
    ],
  },
  {
    id: 'yccd-11-thong-ke-xac-suat',
    grade: '11',
    domain: 'Thống kê và Xác suất',
    mainTopic: 'Thống kê mẫu ghép nhóm & Các quy tắc tính xác suất',
    subTopic: 'Số trung bình, trung vị, tứ phân vị, mốt mẫu ghép nhóm; Biến cố hợp, giao, độc lập; Công thức cộng và nhân xác suất',
    keywords: ['mau ghep nhom', 'trung vi ghep nhom', 'tu phan vi ghep nhom', 'bien co hop', 'bien co giao', 'bien co doc lap', 'cong thuc cong', 'cong thuc nhan'],
    competencySuggestion: { cellKey: 'MH_VD', indicatorCode: 'MH2.1', levelName: 'Vận dụng' },
    requirements: [
      'Hiểu khái niệm mẫu số liệu ghép nhóm và biểu diễn dữ liệu ghép nhóm dưới dạng bảng tần số hoặc biểu đồ.',
      'Tính các số đặc trưng đo xu thế trung tâm cho mẫu ghép nhóm: số trung bình, trung vị, các tứ phân vị (Q1, Q2, Q3) và mốt.',
      'Nhận biết các khái niệm biến cố hợp A ∪ B, biến cố giao A ∩ B và hai biến cố độc lập.',
      'Vận dụng công thức cộng xác suất cho hai biến cố xung khắc P(A ∪ B) = P(A) + P(B) và công thức tổng quát P(A ∪ B) = P(A) + P(B) - P(A ∩ B).',
      'Vận dụng công thức nhân xác suất cho hai biến cố độc lập P(A ∩ B) = P(A)·P(B) trong các tình huống thực tiễn.',
    ],
  },

  // ==========================================
  // LỚP 12 (THPT)
  // ==========================================
  {
    id: 'yccd-12-ung-dung-dao-ham',
    grade: '12',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    subTopic: 'Tính đơn điệu, Cực trị, Giá trị lớn nhất và nhỏ nhất, Đường tiệm cận, Khảo sát hàm số, Bài toán tối ưu',
    keywords: ['khao sat ham so', 'don dieu', 'cuc tri', 'gtln', 'gtnn', 'max min', 'tiem can dung', 'tiem can ngang', 'tiem can xien', 'bai toan toi uu'],
    competencySuggestion: { cellKey: 'GQ_VD', indicatorCode: 'GQ3.1', levelName: 'Vận dụng' },
    requirements: [
      'Nhận biết tính đơn điệu của hàm số dựa vào dấu của đạo hàm cấp một f\'(x); lập bảng biến thiên thể hiện các khoảng đồng biến, nghịch biến.',
      'Nhận biết điểm cực đại, điểm cực tiểu, giá trị cực trị của hàm số thông qua bảng biến thiên hoặc đồ thị.',
      'Tìm giá trị lớn nhất (Max) và giá trị nhỏ nhất (Min) của hàm số trên một đoạn [a; b] hoặc một tập xác định.',
      'Nhận biết và xác định đường tiệm cận đứng, tiệm cận ngang và tiệm cận xiên của đồ thị hàm phân thức.',
      'Khảo sát sự biến thiên và vẽ đồ thị của các hàm số bậc ba, hàm phân thức bậc nhất/bậc nhất y = (ax+b)/(cx+d), hàm phân thức bậc hai/bậc nhất.',
      'Vận dụng đạo hàm và đồ thị hàm số để giải quyết các bài toán tối ưu hoá thực tế trong kinh tế, kỹ thuật (tối thiểu chi phí sản xuất, tối đa hoá doanh thu, thể tích hộp).',
    ],
  },
  {
    id: 'yccd-12-nguyen-ham-tich-phan',
    grade: '12',
    domain: 'Đại số và Một số yếu tố Giải tích',
    mainTopic: 'Nguyên hàm, Tích phân và Ứng dụng hình học',
    subTopic: 'Định nghĩa và tính chất nguyên hàm, Bảng nguyên hàm sơ cấp, Tích phân, Diện tích hình phẳng, Thể tích tròn xoay',
    keywords: ['nguyen ham', 'tich phan', 'dien tich hinh phang', 'the tich vat the', 'the tich tron xoay', 'newton leibniz'],
    competencySuggestion: { cellKey: 'MH_VD', indicatorCode: 'MH2.1', levelName: 'Vận dụng' },
    requirements: [
      'Nhận biết định nghĩa nguyên hàm, các tính chất cơ bản của nguyên hàm và sử dụng thành thạo bảng nguyên hàm của các hàm số sơ cấp.',
      'Nhận biết định nghĩa, tính chất của tích phân và công thức Newton-Leibniz: ∫[a,b] f(x)dx = F(b) - F(a).',
      'Tính tích phân bằng phương pháp đổi biến số đơn giản và phương pháp tích phân từng phần.',
      'Vận dụng tích phân để tính diện tích hình phẳng giới hạn bởi các đường cong đồ thị toạ độ.',
      'Vận dụng tích phân để tính thể tích của vật thể và thể tích khối tròn xoay tạo thành khi quay một hình phẳng quanh trục toạ độ.',
      'Giải quyết các bài toán vật lý, kinh tế thực tế ứng dụng tích phân (tính quãng đường đi được khi biết vận tốc, tính công cơ học).',
    ],
  },
  {
    id: 'yccd-12-toa-do-khong-gian-oxyz',
    grade: '12',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Phương pháp toạ độ trong không gian Oxyz',
    subTopic: 'Toạ độ vectơ và điểm, Phương trình mặt phẳng, Phương trình đường thẳng, Phương trình mặt cầu, Góc và khoảng cách',
    keywords: ['oxyz', 'toa do khong gian', 'mat phang', 'duong thang', 'mat cau', 'khoang cach diem den mat', 'goc'],
    competencySuggestion: { cellKey: 'GQ_VD', indicatorCode: 'GQ3.2', levelName: 'Vận dụng' },
    requirements: [
      'Nhận biết toạ độ điểm, toạ độ vectơ, độ dài vectơ và các phép toán vectơ trong hệ toạ độ Oxyz; tích có hướng của hai vectơ.',
      'Thiết lập phương trình tổng quát của mặt phẳng khi biết một điểm và VTPT; xét vị trí tương đối giữa hai mặt phẳng; tính khoảng cách từ một điểm đến mặt phẳng.',
      'Thiết lập phương trình tham số và chính tắc của đường thẳng trong không gian; xét vị trí tương đối giữa hai đường thẳng, giữa đường thẳng và mặt phẳng.',
      'Thiết lập phương trình mặt cầu khi biết tâm và bán kính; xác định toạ độ tâm và bán kính từ phương trình khai triển.',
      'Tính khoảng cách và góc giữa hai đường thẳng, góc giữa đường thẳng và mặt phẳng, góc giữa hai mặt phẳng trong toạ độ Oxyz.',
    ],
  },
  {
    id: 'yccd-12-thong-ke-ghep-nhom',
    grade: '12',
    domain: 'Thống kê và Xác suất',
    mainTopic: 'Thống kê: Các số đặc trưng đo mức độ phân tán của mẫu ghép nhóm',
    subTopic: 'Khoảng biến thiên, Khoảng tứ phân vị, Phương sai, Độ lệch chuẩn của mẫu số liệu ghép nhóm',
    keywords: ['do phan tan', 'khoang bien thien ghep nhom', 'iqr', 'phuong sai ghep nhom', 'do lech chuan ghep nhom'],
    competencySuggestion: { cellKey: 'MH_VD', indicatorCode: 'MH2.1', levelName: 'Vận dụng' },
    requirements: [
      'Tính khoảng biến thiên và khoảng tứ phân vị (IQR = Q3 - Q1) của mẫu số liệu ghép nhóm.',
      'Tính phương sai s² và độ lệch chuẩn s của mẫu số liệu ghép nhóm theo công thức chuẩn.',
      'Giải thích và vận dụng ý nghĩa của các số đặc trưng đo độ phân tán để so sánh độ biến động, độ rủi ro hoặc mức độ đồng đều của hai tập dữ liệu thực tế.',
    ],
  },
  {
    id: 'yccd-12-xac-suat-co-dieu-kien',
    grade: '12',
    domain: 'Thống kê và Xác suất',
    mainTopic: 'Xác suất có điều kiện và Công thức Bayes',
    subTopic: 'Khái niệm xác suất có điều kiện P(A|B), Công thức xác suất toàn phần, Công thức Bayes, Sơ đồ hình cây',
    keywords: ['xac suat co dieu kien', 'cong thuc xac suat toan phan', 'cong thuc bayes', 'so do cay', 'chan doan y khoa'],
    competencySuggestion: { cellKey: 'MH_VD', indicatorCode: 'MH2.1', levelName: 'Vận dụng' },
    requirements: [
      'Nhận biết định nghĩa xác suất có điều kiện P(A|B) = P(A ∩ B)/P(B) và giải thích ý nghĩa trong thực tế.',
      'Mô tả và vận dụng công thức xác suất toàn phần: P(B) = P(A₁)P(B|A₁) + P(A₂)P(B|A₂) + ... + P(Aₙ)P(B|Aₙ).',
      'Mô tả và vận dụng công thức Bayes để tính xác suất hậu nghiệm P(Aᵢ|B).',
      'Sử dụng bảng dữ liệu chéo 2x2 hoặc sơ đồ cây để giải quyết bài toán kiểm nghiệm chất lượng, độ chính xác của xét nghiệm y khoa.',
    ],
  },
  {
    id: 'yccd-12-chuyen-de',
    grade: '12',
    domain: 'Chuyên đề học tập',
    mainTopic: 'Chuyên đề học tập Toán 12',
    subTopic: 'Biến ngẫu nhiên rời rạc, Phân bố xác suất nhị thức, Ứng dụng toán học trong tài chính',
    keywords: ['chuyen de 12', 'bien ngau nhien', 'ky vong', 'phuong sai', 'nhi thuc', 'tai chinh'],
    competencySuggestion: { cellKey: 'GQ_VD', indicatorCode: 'GQ3.1', levelName: 'Vận dụng' },
    requirements: [
      'Nhận biết biến ngẫu nhiên rời rạc, lập bảng phân bố xác suất; tính kì vọng toán E(X) và phương sai V(X).',
      'Nhận biết và vận dụng phân bố nhị thức B(n, p) trong các phép thử Bernoulli.',
      'Vận dụng mô hình toán học giải quyết bài toán kế hoạch tài chính, lập lịch trả góp ngân hàng, tối ưu danh mục đầu tư.',
    ],
  },

  // ==========================================
  // CẤP TRUNG HỌC CƠ SỞ (LỚP 6 - 9)
  // ==========================================
  {
    id: 'yccd-9-can-thuc',
    grade: '9',
    domain: 'Số và Đại số',
    mainTopic: 'Căn bậc hai và Căn thức bậc hai, Căn bậc ba',
    subTopic: 'Căn bậc hai số học, hằng đẳng thức √(A²) = |A|, trục căn thức, rút gọn biểu thức chứa căn',
    keywords: ['can bac hai', 'can thuc', 'can bac ba', 'truc can thuc', 'rut gon', 'dieu kien xac dinh'],
    competencySuggestion: { cellKey: 'TD_Biet', indicatorCode: 'TD1.1', levelName: 'Nhận biết' },
    requirements: [
      'Nhận biết được khái niệm căn bậc hai, căn bậc hai số học và căn bậc ba của một số thực.',
      'Xác định được điều kiện xác định của căn thức bậc hai √(A) có nghĩa khi A ≥ 0.',
      'Vận dụng được hằng đẳng thức √(A²) = |A| và các phép biến đổi căn thức (đưa thừa số ra ngoài/vào trong dấu căn, khử mẫu, trục căn thức ở mẫu) để rút gọn biểu thức đại số.',
      'Giải quyết được một số bài toán tổng hợp sau rút gọn biểu thức chứa căn (tính giá trị biểu thức, tìm x để biểu thức nguyên hoặc đạt giá trị lớn nhất, nhỏ nhất).',
    ],
  },
  {
    id: 'yccd-9-he-pt-bac-nhat-2an',
    grade: '9',
    domain: 'Số và Đại số',
    mainTopic: 'Phương trình và Hệ hai phương trình bậc nhất hai ẩn',
    subTopic: 'Khái niệm nghiệm, Phương pháp thế, Phương pháp cộng đại số, Giải bài toán bằng cách lập hệ phương trình',
    keywords: ['he phuong trinh', 'bac nhat hai an', 'phuong phap the', 'phuong phap cong', 'lap he phuong trinh', 'bieu dien hinh hoc'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết được khái niệm phương trình bậc nhất hai ẩn ax + by = c, nghiệm và biểu diễn hình học tập nghiệm của phương trình bậc nhất hai ẩn.',
      'Giải được hệ hai phương trình bậc nhất hai ẩn bằng phương pháp thế hoặc phương pháp cộng đại số.',
      'Vận dụng được điều kiện nghiệm của hệ hai phương trình bậc nhất hai ẩn để tìm giá trị của tham số m.',
      'Giải quyết được một số vấn đề thực tiễn gắn với hệ hai phương trình bậc nhất hai ẩn (bài toán chuyển động, năng suất làm việc, toán phần trăm, cân bằng phương trình hóa học).',
    ],
  },
  {
    id: 'yccd-9-bat-dang-thuc-bpt-bac-nhat',
    grade: '9',
    domain: 'Số và Đại số',
    mainTopic: 'Bất đẳng thức và Bất phương trình bậc nhất một ẩn. Phương trình quy về bậc nhất',
    subTopic: 'Phương trình tích, Phương trình chứa ẩn ở mẫu, Tính chất bất đẳng thức, Giải bất phương trình bậc nhất một ẩn ax + b > 0',
    keywords: ['bat dang thuc', 'bat phuong trinh bac nhat mot an', 'phuong trinh tich', 'phuong trinh chua an o mau', 'bac cau'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1', levelName: 'Thông hiểu' },
    requirements: [
      'Giải được phương trình tích (ax + b)(cx + d) = 0 và phương trình chứa ẩn ở mẫu quy về phương trình bậc nhất.',
      'Nhận biết được thứ tự trên tập hợp các số thực, bất đẳng thức và tính chất liên hệ giữa thứ tự và phép cộng, phép nhân.',
      'Nhận biết được khái niệm bất phương trình bậc nhất một ẩn, nghiệm và giải được bất phương trình bậc nhất một ẩn ax + b > 0, < 0, ≥ 0, ≤ 0.',
      'Vận dụng được bất phương trình bậc nhất một ẩn để giải quyết các bài toán thực tiễn (chi phí tối đa, định mức tiêu thụ, điểm số tối thiểu).',
    ],
  },
  {
    id: 'yccd-9-pt-bac-hai-viete',
    grade: '9',
    domain: 'Số và Đại số',
    mainTopic: 'Hàm số y = ax² (a ≠ 0) và Phương trình bậc hai một ẩn, Định lí Viète',
    subTopic: 'Đồ thị Parabol đỉnh O, Công thức nghiệm Δ và Δ\', Định lí Viète và ứng dụng, Bài toán lập phương trình bậc hai',
    keywords: ['pt bac hai', 'cong thuc nghiem', 'viete', 'delta', 'parabol goc o', 'tong va tich hai nghiem', 'tham so m'],
    competencySuggestion: { cellKey: 'GQ_VD', indicatorCode: 'GQ3.1', levelName: 'Vận dụng' },
    requirements: [
      'Thiết lập được bảng giá trị, vẽ được đồ thị Parabol của hàm số y = ax² (a ≠ 0) và nhận biết tính chất đối xứng qua trục tung.',
      'Giải được phương trình bậc hai một ẩn ax² + bx + c = 0 (a ≠ 0) bằng công thức nghiệm hoặc công thức nghiệm thu gọn.',
      'Giải thích được định lí Viète và vận dụng để tính nhẩm nghiệm, tìm hai số biết tổng và tích, tính giá trị biểu thức đối xứng giữa các nghiệm (x₁² + x₂², |x₁ - x₂|) và tìm tham số m.',
      'Vận dụng được phương trình bậc hai một ẩn vào giải quyết một số bài toán thực tiễn (chuyển động, diện tích mảnh đất, bài toán kinh tế).',
    ],
  },
  {
    id: 'yccd-9-he-thuc-luong-tam-giac-vuong',
    grade: '9',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Tỉ số lượng giác của góc nhọn và Hệ thức giữa cạnh và góc trong tam giác vuông',
    subTopic: 'Sin, côsin, tang, côtang của góc nhọn, Tỉ số lượng giác hai góc phụ nhau, Giải tam giác vuông và bài toán đo đạc thực tế',
    keywords: ['ti so luong giac', 'goc nhon', 'tam giac vuong', 'canh huyen', 'goc phu nhau', 'chieu cao thap', 'cau truot', 'giac ke'],
    competencySuggestion: { cellKey: 'MH_VD', indicatorCode: 'MH2.1', levelName: 'Vận dụng' },
    requirements: [
      'Nhận biết được các giá trị sin, côsin, tang, côtang của góc nhọn và giải thích được tỉ số lượng giác của các góc đặc biệt (30°, 45°, 60°) và của hai góc phụ nhau.',
      'Tính được giá trị (đúng hoặc gần đúng) tỉ số lượng giác của góc nhọn bằng máy tính cầm tay.',
      'Giải thích và vận dụng được các hệ thức về cạnh và góc trong tam giác vuông (b = a·sinB = a·cosC; b = c·tanB = c·cotC) để giải tam giác vuông.',
      'Giải quyết được một số vấn đề thực tiễn gắn với tỉ số lượng giác của góc nhọn (tính chiều cao cột cờ, tháp, chiều dài cầu trượt, góc tạo bởi tia nắng mặt trời với mặt đất).',
    ],
  },
  {
    id: 'yccd-9-duong-tron',
    grade: '9',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Đường tròn, Vị trí tương đối, Tiếp tuyến và Góc với đường tròn',
    subTopic: 'Dây và đường kính, Vị trí tương đối đường thẳng và đường tròn, Hai tiếp tuyến cắt nhau, Góc ở tâm, Góc nội tiếp, Tứ giác nội tiếp',
    keywords: ['duong tron', 'tiep tuyen', 'goc o tam', 'goc noi tiep', 'tu giac noi tiep', 'do dai cung', 'hinh quat tron'],
    competencySuggestion: { cellKey: 'TD_Hieu', indicatorCode: 'TD3.3', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết được vị trí tương đối của đường thẳng và đường tròn, của hai đường tròn; dấu hiệu nhận biết tiếp tuyến và tính chất hai tiếp tuyến cắt nhau.',
      'Nhận biết được góc ở tâm, góc nội tiếp và giải thích được mối liên hệ giữa số đo góc nội tiếp, góc ở tâm với số đo cung bị chắn.',
      'Tính được độ dài cung tròn, diện tích hình quạt tròn và diện tích hình vành khuyên.',
      'Nhận biết được tứ giác nội tiếp đường tròn, chứng minh một tứ giác nội tiếp và vận dụng tính chất tổng hai góc đối bằng 180° để chứng minh hình học.',
    ],
  },
  {
    id: 'yccd-9-da-giac-deu',
    grade: '9',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Đường tròn ngoại tiếp, Đường tròn nội tiếp và Đa giác đều',
    subTopic: 'Đường tròn ngoại tiếp/nội tiếp tam giác, Bán kính đường tròn ngoại tiếp tam giác đều và hình vuông, Đa giác đều, Phép quay',
    keywords: ['duong tron ngoai tiep', 'duong tron noi tiep', 'tam giac deu', 'da giac deu', 'phep quay'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1', levelName: 'Thông hiểu' },
    requirements: [
      'Xác định được tâm và bán kính đường tròn ngoại tiếp, đường tròn nội tiếp của tam giác vuông và tam giác đều.',
      'Xác định được tâm và bán kính đường tròn ngoại tiếp hình chữ nhật, hình vuông.',
      'Nhận biết được đa giác đều và phép quay giữ nguyên một đa giác đều trong mặt phẳng và trong thực tiễn.',
    ],
  },
  {
    id: 'yccd-9-hinh-hoc-truc-quan',
    grade: '9',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Hình trụ, Hình nón, Hình cầu',
    subTopic: 'Diện tích xung quanh, Diện tích toàn phần, Thể tích hình trụ, hình nón, hình cầu trong thực tiễn',
    keywords: ['hinh tru', 'hinh non', 'hinh cau', 'dien tich xung quanh', 'the tich'],
    competencySuggestion: { cellKey: 'MH_Biet', indicatorCode: 'MH1.1', levelName: 'Nhận biết' },
    requirements: [
      'Mô tả được các yếu tố đáy, bán kính đáy, chiều cao, đường sinh của hình trụ, hình nón, tâm và bán kính của hình cầu.',
      'Tính được diện tích xung quanh và thể tích của hình trụ (S = 2πrh, V = πr²h), hình nón (S = πrl, V = 1/3πr²h), diện tích mặt cầu và thể tích hình cầu (S = 4πR², V = 4/3πR³).',
      'Giải quyết được một số vấn đề thực tiễn gắn với việc tính diện tích xung quanh và thể tích của hình trụ, hình nón, hình cầu.',
    ],
  },
  {
    id: 'yccd-9-thong-ke-xac-suat',
    grade: '9',
    domain: 'Thống kê và Xác suất',
    mainTopic: 'Bảng tần số, tần số tương đối, mẫu số liệu ghép nhóm và Xác suất cổ điển',
    subTopic: 'Bảng tần số và biểu đồ tần số, Tần số tương đối, Bảng tần số ghép nhóm, Không gian mẫu và xác suất của biến cố',
    keywords: ['tan so', 'tan so tuong doi', 'bieu do tan so', 'mau so lieu ghep nhom', 'khong gian mau', 'xac suat bien co'],
    competencySuggestion: { cellKey: 'MH_Hieu', indicatorCode: 'MH1.2', levelName: 'Thông hiểu' },
    requirements: [
      'Xác định được tần số, tần số tương đối của một giá trị và lập được bảng tần số, bảng tần số tương đối, biểu đồ tần số.',
      'Thiết lập được bảng tần số ghép nhóm, bảng tần số tương đối ghép nhóm và biểu đồ tần số tương đối ghép nhóm (histogram).',
      'Nhận biết được phép thử ngẫu nhiên, không gian mẫu Ω và tính được xác suất của biến cố P(A) = n(A)/n(Ω) trong một số trò chơi, thí nghiệm đơn giản.',
    ],
  },

  // LỚP 8
  {
    id: 'yccd-8-hang-dang-thuc-phan-thuc',
    grade: '8',
    domain: 'Số và Đại số',
    mainTopic: 'Đa thức nhiều biến, Hằng đẳng thức đáng nhớ và Phân thức đại số',
    subTopic: '7 hằng đẳng thức đáng nhớ, Phân tích đa thức thành nhân tử, Rút gọn và tính toán phân thức đại số',
    keywords: ['hang dang thuc', 'phan thuc dai so', 'nhan tu', 'cong tru nhan chia phan thuc', 'da thuc nhieu bien'],
    competencySuggestion: { cellKey: 'TD_Biet', indicatorCode: 'TD1.2', levelName: 'Nhận biết' },
    requirements: [
      'Thực hiện được các phép tính cộng, trừ, nhân, chia đa thức nhiều biến và vận dụng 7 hằng đẳng thức đáng nhớ.',
      'Phân tích được đa thức thành nhân tử bằng phương pháp đặt nhân tử chung, vận dụng hằng đẳng thức và nhóm các hạng tử.',
      'Nhận biết được khái niệm phân thức đại số, điều kiện xác định, tính chất cơ bản và thực hiện được các phép tính cộng, trừ, nhân, chia hai phân thức đại số.',
    ],
  },
  {
    id: 'yccd-8-ham-so-bac-nhat',
    grade: '8',
    domain: 'Số và Đại số',
    mainTopic: 'Hàm số bậc nhất y = ax + b (a ≠ 0) và Phương trình bậc nhất một ẩn',
    subTopic: 'Khái niệm hàm số, Hệ số góc a, Đồ thị đường thẳng, Hai đường thẳng song song/cắt nhau, Giải bài toán bằng cách lập phương trình bậc nhất',
    keywords: ['ham so bac nhat', 'he so goc', 'do thi duong thang', 'pt bac nhat mot an', 'lap phuong trinh'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết được khái niệm hàm số bậc nhất y = ax + b (a ≠ 0), thiết lập bảng giá trị, vẽ đồ thị và xác định giao điểm với hai trục toạ độ.',
      'Nhận biết được hệ số góc của đường thẳng y = ax + b (a ≠ 0) và sử dụng hệ số góc để nhận biết hai đường thẳng song song hoặc cắt nhau.',
      'Giải được phương trình bậc nhất một ẩn ax + b = 0 và giải quyết được một số vấn đề thực tiễn gắn với phương trình bậc nhất (bài toán chuyển động, năng suất, phần trăm).',
    ],
  },
  {
    id: 'yccd-8-tam-giac-dong-dang-thales',
    grade: '8',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Định lí Thalès và Tam giác đồng dạng',
    subTopic: 'Định lí Thalès thuận và đảo, Đường trung bình, Tính chất đường phân giác, Ba trường hợp đồng dạng của tam giác',
    keywords: ['dinh li thales', 'tam giac dong dang', 'ti so dong dang', 'duong phan giac', 'duong trung binh'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1', levelName: 'Thông hiểu' },
    requirements: [
      'Giải thích được định lí Thalès trong tam giác (thuận và đảo), tính chất đường trung bình và tính chất đường phân giác trong của tam giác.',
      'Mô tả được định nghĩa của hai tam giác đồng dạng và giải thích được ba trường hợp đồng dạng của hai tam giác (c-c-c, c-g-c, g-g) và các trường hợp đồng dạng của hai tam giác vuông.',
      'Giải quyết được một số vấn đề thực tiễn gắn với việc vận dụng định lí Thalès và tam giác đồng dạng (đo gián tiếp chiều cao cây, tháp, khoảng cách hai bờ sông).',
    ],
  },
  {
    id: 'yccd-8-tu-giac',
    grade: '8',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Định lí Pythagore và Các hình tứ giác đặc biệt',
    subTopic: 'Định lí Pythagore thuận và đảo, Hình thang cân, Hình bình hành, Hình chữ nhật, Hình thoi, Hình vuông',
    keywords: ['pythagore', 'tu giac', 'hinh thang', 'hinh binh hanh', 'hinh thoi', 'hinh chu nhat', 'hinh vuong'],
    competencySuggestion: { cellKey: 'TD_Hieu', indicatorCode: 'TD1.3', levelName: 'Thông hiểu' },
    requirements: [
      'Giải thích được định lí Pythagore trong tam giác vuông a² + b² = c² và vận dụng tính độ dài đoạn thẳng trong hình phẳng và thực tiễn.',
      'Giải thích được tính chất và dấu hiệu nhận biết của hình thang cân, hình bình hành, hình chữ nhật, hình thoi, hình vuông.',
    ],
  },
  {
    id: 'yccd-8-hinh-chop-deu',
    grade: '8',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Hình chóp tam giác đều và Hình chóp tứ giác đều',
    subTopic: 'Đỉnh, mặt đáy, mặt bên, cạnh bên, trung đoạn; Diện tích xung quanh và thể tích hình chóp đều',
    keywords: ['hinh chop tam giac deu', 'hinh chop tu giac deu', 'trung doan', 'dien tich xung quanh chop deu', 'the tich chop deu'],
    competencySuggestion: { cellKey: 'MH_Hieu', indicatorCode: 'MH1.2', levelName: 'Thông hiểu' },
    requirements: [
      'Mô tả được đỉnh, mặt đáy, mặt bên, cạnh bên, chiều cao và trung đoạn của hình chóp tam giác đều và hình chóp tứ giác đều.',
      'Tính được diện tích xung quanh và thể tích của hình chóp tam giác đều và hình chóp tứ giác đều; vận dụng giải bài toán thực tiễn (mái nhà, kim tự tháp, lều trại).',
    ],
  },
  {
    id: 'yccd-8-thong-ke-xac-suat',
    grade: '8',
    domain: 'Thống kê và Xác suất',
    mainTopic: 'Thu thập, biểu diễn dữ liệu và Xác suất của biến cố',
    subTopic: 'Dữ liệu liên tục và rời rạc, Lựa chọn biểu đồ phù hợp, Xác suất lí thuyết và xác suất thực nghiệm',
    keywords: ['thong ke 8', 'bieu do cot kep', 'bieu do doan thang', 'xac suat bien co', 'xac suat thuc nghiem'],
    competencySuggestion: { cellKey: 'MH_Biet', indicatorCode: 'MH1.1', levelName: 'Nhận biết' },
    requirements: [
      'Phân biệt được dữ liệu là số (liên tục, rời rạc) và dữ liệu không là số; lựa chọn và biểu diễn được dữ liệu vào bảng, biểu đồ thích hợp (biểu đồ cột kép, hình quạt tròn, đoạn thẳng).',
      'Sử dụng được tỉ số để mô tả xác suất của một biến cố ngẫu nhiên trong một số ví dụ đơn giản và nhận biết mối liên hệ giữa xác suất thực nghiệm với xác suất lí thuyết.',
    ],
  },

  // LỚP 7
  {
    id: 'yccd-7-so-huu-ti-so-thuc',
    grade: '7',
    domain: 'Số và Đại số',
    mainTopic: 'Số hữu tỉ, Số thực và Tỉ lệ thức, Đại lượng tỉ lệ',
    subTopic: 'Tập số hữu tỉ Q, Tập số thực R, Căn bậc hai số học, Giá trị tuyệt đối, Tỉ lệ thức, Dãy tỉ số bằng nhau, Đại lượng tỉ lệ thuận và tỉ lệ nghịch',
    keywords: ['so huu ti', 'so thuc', 'can bac hai so hoc', 'ti le thuc', 'day ti so bang nhau', 'ti le thuan', 'ti le nghich'],
    competencySuggestion: { cellKey: 'TD_Biet', indicatorCode: 'TD1.1', levelName: 'Nhận biết' },
    requirements: [
      'Nhận biết được số hữu tỉ, biểu diễn số hữu tỉ trên trục số, thứ tự thực hiện các phép tính cộng, trừ, nhân, chia, luỹ thừa số hữu tỉ.',
      'Nhận biết được số vô tỉ, căn bậc hai số học, tập hợp các số thực ℝ và giá trị tuyệt đối của một số thực.',
      'Vận dụng được tính chất của tỉ lệ thức và tính chất của dãy tỉ số bằng nhau a/b = c/d = (a + c)/(b + d) vào giải bài toán thực tiễn về đại lượng tỉ lệ thuận, tỉ lệ nghịch.',
    ],
  },
  {
    id: 'yccd-7-bieu-thuc-dai-so',
    grade: '7',
    domain: 'Số và Đại số',
    mainTopic: 'Biểu thức đại số và Đa thức một biến',
    subTopic: 'Biểu thức đại số, Đa thức một biến, Bậc và hệ số của đa thức, Phép cộng trừ nhân chia đa thức một biến, Nghiệm của đa thức',
    keywords: ['bieu thuc dai so', 'da thuc mot bien', 'bac cua da thuc', 'nghiem cua da thuc'],
    competencySuggestion: { cellKey: 'TD_Hieu', indicatorCode: 'TD1.2', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết được biểu thức số, biểu thức đại số và tính được giá trị của một biểu thức đại số.',
      'Nhận biết được định nghĩa đa thức một biến, bậc, hệ số cao nhất, hệ số tự do và nghiệm của đa thức một biến.',
      'Thực hiện được các phép tính cộng, trừ, nhân, chia đa thức một biến.',
    ],
  },
  {
    id: 'yccd-7-tam-giac-bang-nhau',
    grade: '7',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Góc, Đường thẳng song song và Tam giác bằng nhau',
    subTopic: 'Hai góc đối đỉnh, Kề bù, Tiên đề Euclid, Ba trường hợp bằng nhau của tam giác (c-c-c, c-g-c, g-c-g), Tam giác cân, Đường trung trực',
    keywords: ['tam giac bang nhau', 'doi dinh', 'song song', 'tam giac can', 'duong trung truc', 'tien de euclid'],
    competencySuggestion: { cellKey: 'TD_Hieu', indicatorCode: 'TD3.3', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết được hai góc đối đỉnh, hai góc kề bù, góc so le trong, góc đồng vị; mô tả dấu hiệu nhận biết và tính chất hai đường thẳng song song, tiên đề Euclid.',
      'Giải thích được định lí về tổng ba góc trong một tam giác bằng 180° và các trường hợp bằng nhau của hai tam giác (c-c-c, c-g-c, g-c-g) cũng như hai tam giác vuông.',
      'Mô tả được tính chất của tam giác cân, tam giác đều và tính chất đường trung trực của một đoạn thẳng.',
    ],
  },
  {
    id: 'yccd-7-quan-he-trong-tam-giac',
    grade: '7',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Quan hệ giữa các yếu tố trong một tam giác và Các đường đồng quy',
    subTopic: 'Quan hệ giữa góc và cạnh đối diện, Đường vuông góc và đường xiên, Bất đẳng thức tam giác, Ba đường trung tuyến, phân giác, trung trực, đường cao',
    keywords: ['bat dang thuc tam giac', 'duong trung tuyen', 'trong tam', 'duong phan giac', 'duong cao', 'truc tam'],
    competencySuggestion: { cellKey: 'GQ_Hieu', indicatorCode: 'GQ2.1', levelName: 'Thông hiểu' },
    requirements: [
      'Giải thích được quan hệ giữa góc và cạnh đối diện trong một tam giác, quan hệ giữa đường vuông góc và đường xiên, và bất đẳng thức tam giác.',
      'Nhận biết được sự đồng quy của ba đường trung tuyến (trọng tâm), ba đường phân giác, ba đường trung trực và ba đường cao (trực tâm) của tam giác.',
    ],
  },
  {
    id: 'yccd-7-hinh-khoi-thuc-tien',
    grade: '7',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Hình hộp chữ nhật, Hình lập phương và Hình lăng trụ đứng',
    subTopic: 'Diện tích xung quanh và thể tích của hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng tam giác, tứ giác',
    keywords: ['hinh hop chu nhat', 'hinh lap phuong', 'hinh lang tru dung', 'the tich be ca'],
    competencySuggestion: { cellKey: 'MH_Hieu', indicatorCode: 'MH1.2', levelName: 'Thông hiểu' },
    requirements: [
      'Mô tả được các yếu tố đỉnh, cạnh, mặt của hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác.',
      'Tính được diện tích xung quanh và thể tích của hình hộp chữ nhật, hình lập phương, hình lăng trụ đứng và giải quyết bài toán thực tiễn (tính thể tích bể nước, căn phòng, thùng hàng).',
    ],
  },
  {
    id: 'yccd-7-thong-ke-xac-suat',
    grade: '7',
    domain: 'Thống kê và Xác suất',
    mainTopic: 'Biểu đồ hình quạt tròn, Biểu đồ đoạn thẳng và Biến cố ngẫu nhiên',
    subTopic: 'Đọc và phân tích dữ liệu từ biểu đồ hình quạt tròn, biểu đồ đoạn thẳng; Biến cố chắc chắn, biến cố không thể, biến cố ngẫu nhiên',
    keywords: ['bieu do hinh quat tron', 'bieu do doan thang', 'bien co chac chan', 'bien co ngau nhien'],
    competencySuggestion: { cellKey: 'MH_Biet', indicatorCode: 'MH1.1', levelName: 'Nhận biết' },
    requirements: [
      'Đọc và mô tả được dữ liệu từ biểu đồ hình quạt tròn, biểu đồ đoạn thẳng và nhận ra xu hướng thay đổi của dữ liệu.',
      'Làm quen với biến cố ngẫu nhiên, biến cố chắc chắn, biến cố không thể và tính xác suất của biến cố trong một số trò chơi đơn giản (tung xúc xắc, rút thẻ).',
    ],
  },

  // LỚP 6
  {
    id: 'yccd-6-so-tu-nhien-so-nguyen',
    grade: '6',
    domain: 'Số và Đại số',
    mainTopic: 'Số tự nhiên và Tập hợp các số nguyên',
    subTopic: 'Tập hợp, Luỹ thừa số mũ tự nhiên, Tính chia hết, Số nguyên tố, ƯCLN, BCNN, Số nguyên âm, Các phép tính trong tập số nguyên Z',
    keywords: ['so tu nhien', 'ucln', 'bcnn', 'so nguyen to', 'chia het', 'so nguyen am', 'thu tu thuc hien phep tinh'],
    competencySuggestion: { cellKey: 'TD_Biet', indicatorCode: 'TD1.1', levelName: 'Nhận biết' },
    requirements: [
      'Sử dụng được thuật ngữ tập hợp, phần tử thuộc (∈) hoặc không thuộc (∉) một tập hợp; thực hiện phép tính cộng, trừ, nhân, chia, luỹ thừa với số mũ tự nhiên.',
      'Vận dụng được dấu hiệu chia hết cho 2, 3, 5, 9; phân tích một số ra thừa số nguyên tố; tìm được ƯCLN và BCNN để giải quyết bài toán thực tiễn (chia tổ, xếp hàng).',
      'Nhận biết được tập hợp các số nguyên ℤ, thứ tự trên tập số nguyên, số đối và thực hiện được các phép tính cộng, trừ, nhân, chia hết trên tập số nguyên.',
    ],
  },
  {
    id: 'yccd-6-phan-so-thap-phan',
    grade: '6',
    domain: 'Số và Đại số',
    mainTopic: 'Phân số và Số thập phân, Bài toán về tỉ số phần trăm',
    subTopic: 'Phân số bằng nhau, Rút gọn và quy đồng phân số, Các phép tính phân số, Số thập phân, Làm tròn số, Hai bài toán cơ bản về phân số và phần trăm',
    keywords: ['phan so', 'rut gon phan so', 'so thap phan', 'ti so phan tram', 'hon so', 'lam tron so'],
    competencySuggestion: { cellKey: 'TD_Hieu', indicatorCode: 'TD1.2', levelName: 'Thông hiểu' },
    requirements: [
      'Nhận biết được phân số với tử và mẫu là các số nguyên; rút gọn phân số, quy đồng mẫu nhiều phân số và thực hiện các phép tính cộng, trừ, nhân, chia phân số.',
      'Thực hiện được các phép tính với số thập phân, làm tròn số thập phân và ước lượng kết quả phép tính.',
      'Giải quyết được một số vấn đề thực tiễn gắn với hai bài toán về phân số, tỉ số và tỉ số phần trăm (tính giá tiền sau giảm giá, lãi suất tiết kiệm).',
    ],
  },
  {
    id: 'yccd-6-hinh-hoc-truc-quan',
    grade: '6',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Các hình phẳng trong thực tiễn và Tính đối xứng của hình phẳng',
    subTopic: 'Tam giác đều, Hình vuông, Lục giác đều, Hình chữ nhật, Hình thoi, Hình bình hành, Hình thang cân, Chu vi và diện tích, Trục đối xứng và tâm đối xứng',
    keywords: ['tam giac deu', 'hinh vuong', 'luc giac deu', 'hinh thoi', 'doi xung', 'chu vi', 'dien tich'],
    competencySuggestion: { cellKey: 'MH_Biet', indicatorCode: 'MH1.1', levelName: 'Nhận biết' },
    requirements: [
      'Nhận biết được tam giác đều, hình vuông, lục giác đều, hình chữ nhật, hình thoi, hình bình hành, hình thang cân và mô tả các yếu tố cơ bản của chúng.',
      'Tính được chu vi và diện tích của hình chữ nhật, hình vuông, hình bình hành, hình thoi, hình thang cân và vận dụng vào bài toán thực tiễn (lát gạch, rào vườn).',
      'Nhận biết được trục đối xứng và tâm đối xứng của một hình phẳng trong toán học và trong tự nhiên.',
    ],
  },
  {
    id: 'yccd-6-doan-thang-goc',
    grade: '6',
    domain: 'Hình học và Đo lường',
    mainTopic: 'Điểm, Đường thẳng, Đoạn thẳng, Trung điểm của đoạn thẳng và Góc',
    subTopic: 'Điểm thuộc đường thẳng, Hai đường thẳng cắt nhau/song song, Tia, Độ dài đoạn thẳng, Trung điểm của đoạn thẳng, Góc và số đo góc',
    keywords: ['doan thang', 'trung diem', 'tia', 'goc nhon', 'goc vuong', 'goc tu', 'goc bet'],
    competencySuggestion: { cellKey: 'TD_Biet', indicatorCode: 'TD1.1', levelName: 'Nhận biết' },
    requirements: [
      'Nhận biết được các quan hệ cơ bản giữa điểm và đường thẳng, ba điểm thẳng hàng, hai đường thẳng cắt nhau, song song, tia và đoạn thẳng.',
      'Nhận biết được trung điểm của đoạn thẳng và tính được độ dài đoạn thẳng.',
      'Nhận biết được khái niệm góc, đỉnh và cạnh của góc, số đo góc và phân biệt được góc nhọn, góc vuông, góc tù, góc bẹt.',
    ],
  },
  {
    id: 'yccd-6-thong-ke-xac-suat',
    grade: '6',
    domain: 'Thống kê và Xác suất',
    mainTopic: 'Một số yếu tố Thống kê và Xác suất thực nghiệm',
    subTopic: 'Thu thập và phân loại dữ liệu, Bảng thống kê, Biểu đồ tranh, Biểu đồ cột, Biểu đồ cột kép, Xác suất thực nghiệm',
    keywords: ['thong ke 6', 'bieu do tranh', 'bieu do cot', 'xac suat thuc nghiem', 'tung xuc xac'],
    competencySuggestion: { cellKey: 'MH_Biet', indicatorCode: 'MH1.1', levelName: 'Nhận biết' },
    requirements: [
      'Thu thập, phân loại và đọc được dữ liệu từ bảng thống kê, biểu đồ tranh, biểu đồ cột và biểu đồ cột kép.',
      'Làm quen với mô hình xác suất trong một số trò chơi, thí nghiệm đơn giản (tung đồng xu, gieo xúc xắc) và tính được xác suất thực nghiệm của một sự kiện.',
    ],
  },
];

