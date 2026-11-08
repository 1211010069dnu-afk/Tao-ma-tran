# Kế hoạch nâng cấp Độ chính xác Kiến thức Toán học & Đối chiếu Bản đặc tả (THCS 6–9 & THPT 10–12)

## 1. Mục tiêu nâng cấp
Nâng cấp toàn diện bộ máy nhận diện kiến thức, phân loại mức độ nhận thức (`Biết` – `Hiểu` – `Vận dụng`), gán mã năng lực toán học (`TD`, `GQ`, `MH`) và kiểm định chéo giữa **Đề kiểm tra thực tế** với **Bản đặc tả & Ma trận đề** theo chuẩn Công văn 7991/BGDĐT (Chương trình GDPT 2018):

1. **Mở rộng Kho chuẩn kiến thức & Yêu cầu cần đạt (YCCĐ) toàn cấp THCS (Lớp 6, 7, 8, 9) và THPT (Lớp 10, 11, 12):** Bao phủ đầy đủ các mạch kiến thức Đại số/Số học, Hình học & Đo lường, Thống kê & Xác suất, Giải tích cho cả 7 khối lớp và các đề khảo sát chuyển cấp/đầu năm.
2. **Chuẩn hóa văn phong Yêu cầu cần đạt (YCCĐ):** Kết hợp chuẩn khung YCCĐ GDPT 2018 với dạng toán cụ thể xuất hiện trong đề (ví dụ: *"Nhận biết được khái niệm mệnh đề toán học, mệnh đề phủ định, mệnh đề chứa biến"*, *"Vận dụng được hệ phương trình bậc nhất hai ẩn để giải quyết một số bài toán thực tiễn"*).
3. **Phân tích sâu từng câu hỏi và từng ý `a), b), c), d)` theo cấu trúc toán học:** Tự động bóc tách từng lệnh hỏi trong câu Trắc nghiệm 4 lựa chọn (TN), từng phát biểu `a, b, c, d` trong câu Đúng/Sai (ĐS), Trả lời ngắn (TLN) và từng ý `a, b` trong Tự luận (TL) để xác định chính xác mức độ `Biết / Hiểu / Vận dụng` và mã năng lực `TD / GQ / MH`.
4. **Bảng đối chiếu trực tiếp Câu hỏi – Đặc tả & Cảnh báo kiểm định tri thức tự động:** Hiển thị song song nội dung từng câu hỏi/ý hỏi trong đề với dòng đặc tả tương ứng, tự động phát hiện và cảnh báo khi bài toán thực tế chưa gắn mã `MH`, câu có tham số/biện luận gắn nhầm mức `Biết`, hoặc câu hỏi bị phân loại lệch chủ đề.

---

## 2. Thiết kế chi tiết các hạng mục triển khai

### Hạng mục 1: Mở rộng Cơ sở dữ liệu YCCĐ & Đơn vị kiến thức Toán 6–12 (`src/data/yccdDatabase.ts` & `src/utils/examParser.ts`)
- **Toán THCS (Lớp 6, 7, 8, 9):**
  - **Lớp 6:** Tập hợp các số tự nhiên, Số nguyên, Phân số, Số thập phân, Các hình phẳng trong thực tiễn (Tam giác đều, Hình vuông, Lục giác đều), Tính đối xứng, Hình học trực quan, Thống kê & Xác suất thực nghiệm.
  - **Lớp 7:** Số hữu tỉ, Số thực, Tỉ lệ thức & Đại lượng tỉ lệ, Biểu thức đại số & Đa thức một biến, Góc và đường thẳng song song, Tam giác bằng nhau, Quan hệ giữa các yếu tố trong tam giác, Hình khối trong thực tiễn.
  - **Lớp 8:** Đa thức nhiều biến, Hằng đẳng thức đáng nhớ & Phân tích đa thức thành nhân tử, Phân thức đại số, Hàm số bậc nhất & Đồ thị, Phương trình bậc nhất, Định lí Pythagore, Tứ giác (Hình thang cân, Hình bình hành, Hình chữ nhật, Hình thoi, Hình vuông), Định lí Thalès & Tam giác đồng dạng.
  - **Lớp 9 (Trọng tâm thi vào 10 & Khảo sát đầu năm lớp 10):** Căn bậc hai & Căn bậc ba (Rút gọn biểu thức chứa căn), Phương trình & Hệ hai phương trình bậc nhất hai ẩn, Bất đẳng thức & Bất phương trình bậc nhất một ẩn, Hàm số $y = ax^2$ và Phương trình bậc hai một ẩn (Định lí Viète), Hệ thức lượng trong tam giác vuông (Tỉ số lượng giác), Đường tròn (Vị trí tương đối, Tiếp tuyến, Góc với đường tròn, Đường tròn nội tiếp/ngoại tiếp tam giác đều, hình vuông), Hình trụ – Hình nón – Hình cầu, Một số yếu tố Thống kê (Bảng tần số, tần số tương đối, biểu đồ) & Xác suất cổ điển.
- **Toán THPT (Lớp 10, 11, 12):**
  - Bổ sung chi tiết các mẫu câu đặc tả sát dạng bài cho từng chương của Lớp 10 (Mệnh đề & Tập hợp, Bất phương trình & Hệ BPT bậc nhất hai ẩn, Hàm số bậc hai, Hệ thức lượng trong tam giác, Vectơ, Thống kê, Tổ hợp – Xác suất, Phương pháp tọa độ trong mặt phẳng), Lớp 11 (Lượng giác, Dãy số – CSC – CSN, Giới hạn – Liên tục, Hàm số mũ – Lôgarit, Quan hệ song song & vuông góc trong không gian, Đạo hàm, Xác suất), Lớp 12 (Ứng dụng đạo hàm khảo sát hàm số & tối ưu thực tế, Vectơ & Tọa độ Oxyz, Các số đặc trưng đo mức độ phân tán mẫu số liệu ghép nhóm, Nguyên hàm – Tích phân, Xác suất có điều kiện – Công thức Bayes).

### Hạng mục 2: Bộ phân tích sâu cấu trúc toán học cho từng câu & từng ý `a, b, c, d` (`src/utils/knowledgeAnalyzer.ts` & `src/utils/examParser.ts`)
- **Tách và phân tích độc lập từng ý `a), b), c), d)` của câu Đúng/Sai và Tự luận (`1a, 1b`):**
  - Trích xuất nội dung văn bản riêng của từng ý `a)`, `b)`, `c)`, `d)` từ câu hỏi gốc.
  - **Nhận diện mức độ nhận thức theo cấu trúc toán học của từng câu/ý:**
    - **Mức Biết (`biet`):** Nhận diện khái niệm, định nghĩa (mệnh đề, tập hợp, kí hiệu $\in, \subset$), đọc giá trị trực tiếp từ bảng tần số/biểu đồ/đồ thị, nhận dạng công thức cơ bản (tỉ số lượng giác, nghiệm cơ bản, biệt thức $\Delta$).
    - **Mức Hiểu (`hieu`):** Biến đổi đại số 1–2 bước (rút gọn căn thức, tính giao/hợp/hiệu hai tập hợp $A \cap B, A \cup B, A \setminus B$, tính tần số tương đối, tính xác suất bằng phép đếm trực tiếp, giải hệ phương trình/phương trình tường minh).
    - **Mức Vận dụng (`van_dung`):** Biện luận tham số $m$ (tìm $m$ để $A \subset B$, $A \cap B = \varnothing$, hệ phương trình có nghiệm thỏa điều kiện, phương trình có 2 nghiệm thỏa hệ thức Viète), bài toán thực tế có lời văn (lập hệ phương trình giải bài toán năng suất/chuyển động/phần trăm, tính chiều cao/khoảng cách thực tế bằng giác kế, tối ưu chi phí/lợi nhuận, tính bán kính đường tròn ngoại tiếp gắn với thực tiễn).
  - **Nhận diện mã năng lực toán học (`TD`, `GQ`, `MH`) chính xác:**
    - **Mô hình hóa toán học (`MH1.x – MH3.x`):** Tự động gán khi câu/ý chứa bối cảnh thực tiễn (bài toán thực tế, phần trăm tăng trưởng, giá tiền, chiều cao cột cờ/tháp, tia nắng mặt trời, thống kê điểm thi/chiều cao học sinh, trò chơi xúc xắc/rút thẻ thực tế).
    - **Giải quyết vấn đề toán học (`GQ1.x – GQ3.x`):** Tự động gán khi câu/ý yêu cầu thực hiện quy trình giải phương trình/hệ phương trình, rút gọn biểu thức, tìm tham số $m$, chứng minh hoặc tính toán tổng hợp nhiều bước.
    - **Tư duy và lập luận toán học (`TD1.x – TD3.x`):** Tự động gán khi câu/ý kiểm tra khẳng định đúng/sai về mệnh đề, quan hệ tập hợp, tính chất hình học, đọc và suy luận từ bảng số liệu/biểu đồ.

### Hạng mục 3: Bảng đối chiếu trực tiếp Câu hỏi – Đặc tả & Cảnh báo kiểm định tri thức (`src/components/QuestionSpecMapperModal.tsx` & tích hợp trong tab Bản đặc tả)
- **Bảng Đối chiếu Câu hỏi – Đặc tả (Side-by-Side Knowledge Inspector):**
  - Hiển thị danh sách toàn bộ các câu hỏi trong đề (`Phần I: Câu 1–12`, `Phần II: Câu 1a–4d`, `Phần III: Câu 1–4`, `Phần IV: Câu 1a–2`) đối chiếu trực tiếp với:
    1. Nội dung gốc của câu hỏi / từng ý `a, b, c, d` trong đề.
    2. Chủ đề & Đơn vị kiến thức đang gán (cho phép đổi nhanh nếu muốn).
    3. Mức độ nhận thức (`Biết` / `Hiểu` / `Vận dụng`) & Mã năng lực (`TD` / `GQ` / `MH`).
    4. Nội dung dòng Yêu cầu cần đạt tương ứng trong Bản đặc tả (có nút gợi ý chuẩn hóa câu chữ YCCĐ sát với câu hỏi đó).
- **Hệ thống Cảnh báo Kiểm định Tri thức tự động (Knowledge Audit Warnings):**
  - Tự động quét và hiển thị cảnh báo trực quan nếu phát hiện:
    - **Cảnh báo Mã năng lực (`MH`):** Câu hỏi/ý hỏi có bối cảnh bài toán thực tế nhưng chưa được gắn mã `MH` (hoặc ngược lại, câu thuần túy đại số nhưng gắn mã `MH`).
    - **Cảnh báo Mức độ nhận thức:** Câu hỏi có chứa tham số $m$ hoặc bài toán lời văn phức tạp nhưng đang đặt ở cột `Biết`, hoặc câu nhận diện định nghĩa cơ bản nhưng đang đặt ở cột `Vận dụng`.
    - **Cảnh báo Lệch chủ đề / Đơn vị kiến thức:** Nội dung câu hỏi chứa từ khóa toán học thuộc chuyên đề khác với Đơn vị kiến thức đang được gán trên bảng đặc tả.
    - **Nút "Tự động chuẩn hóa" (1-Click Fix):** Cho phép giáo viên bấm 1 nút để áp dụng ngay gợi ý sửa mã năng lực, mức độ hoặc câu chữ YCCĐ cho câu hỏi đó, đồng thời tự động cập nhật lại **Ma trận đề** và **Bảng tổng hợp năng lực**.

---

## 3. Kế hoạch kiểm thử & Xác minh
- Viết bộ kiểm thử đơn vị (`src/utils/knowledgeAnalyzer.test.ts` và mở rộng `src/utils/examParser.test.ts`) kiểm tra:
  - Phân tích chính xác từng câu và từng ý `a, b, c, d` trên đề thực tế (bao gồm *Đề khảo sát chất lượng đầu năm Toán 10* và các câu hỏi mẫu THCS/THPT).
  - Kiểm tra bộ phát hiện cảnh báo khi cố tình gắn sai mã `MH`/`TD`/`GQ` hoặc lệch mức độ `Biết/Hiểu/Vận dụng`.
  - Đảm bảo tính năng đồng bộ hai chiều giữa **Bảng đối chiếu Câu hỏi – Đặc tả**, **Bản đặc tả**, **Ma trận đề** và **Xuất file Word (.docx)** hoạt động mượt mà, giữ nguyên 100% các chức năng hiện có.
