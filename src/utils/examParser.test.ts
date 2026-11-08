import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseRawExamText, detectMathTopics, buildDocumentFromParsedExam } from './examParser';
import { crossCheckMatrixAndSpec } from './matrixCalculator';

describe('Exam Parser Utility', () => {
  test('detectMathTopics correctly identifies curriculum topics', () => {
    const sample = 'Câu 1: Cho tam thức bậc hai f(x) = ax^2 + bx + c. Câu 2: Trong mặt phẳng Oxy, cho vectơ u và v.';
    const topics = detectMathTopics(sample);
    assert.ok(topics.length >= 2);
    assert.ok(topics.some((t) => t.name.includes('BẤT PHƯƠNG TRÌNH BẬC HAI')));
    assert.ok(topics.some((t) => t.name.includes('TOẠ ĐỘ') || t.name.includes('TỌA ĐỘ')));
  });

  test('parseRawExamText extracts grade, duration, and question parts', () => {
    const rawExam = `
SỞ GD & ĐT ĐỒNG NAI
ĐỀ KIỂM TRA GIỮA HỌC KÌ II - MÔN TOÁN LỚP 10
Thời gian làm bài: 90 phút

PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.
Câu 1. Tập xác định của hàm số là gì?
Câu 2. Cho tam thức bậc hai f(x) > 0.
Câu 3. Tọa độ của vectơ đơn vị là gì?

PHẦN II. Câu trắc nghiệm đúng sai.
Câu 1. Cho hàm số y = f(x).
a) Tập xác định là R.
b) Đồ thị đi qua gốc tọa độ.
c) Hàm số đồng biến trên khoảng.
d) Giá trị nhỏ nhất bằng 0.

PHẦN III. Câu trắc nghiệm trả lời ngắn.
Câu 1. Tìm số nghiệm nguyên của bất phương trình.
Câu 2. Một chiếc cổng parabol có chiều cao bao nhiêu mét?

PHẦN IV. Tự luận.
Câu 1. Giải bài toán thực tế bằng phương pháp tọa độ.
    `;

    const parsed = parseRawExamText(rawExam);
    assert.strictEqual(parsed.detectedGrade, '10');
    assert.strictEqual(parsed.detectedExamName, 'KIỂM TRA GIỮA HỌC KÌ II');
    assert.strictEqual(parsed.detectedDuration, '90 phút');
    assert.ok(parsed.questions.length >= 6);

    const tnCount = parsed.questions.filter((q) => q.partType === 'TN').length;
    const dsCount = parsed.questions.filter((q) => q.partType === 'DS').length;
    const tlnCount = parsed.questions.filter((q) => q.partType === 'TLN').length;
    const tlCount = parsed.questions.filter((q) => q.partType === 'TL').length;

    assert.strictEqual(tnCount, 3);
    assert.strictEqual(dsCount, 1);
    assert.strictEqual(tlnCount, 2);
    assert.strictEqual(tlCount, 1);
  });

  test('buildDocumentFromParsedExam generates 100% synchronized matrix and specification', () => {
    const rawExam = `
ĐỀ KIỂM TRA HỌC KÌ II - KHỐI 10
PHẦN I. Câu trắc nghiệm nhiều lựa chọn
Câu 1. Câu hỏi 1
Câu 2. Câu hỏi 2
PHẦN II. Đúng sai
Câu 1. Đề bài 1
PHẦN III. Trả lời ngắn
Câu 1. Câu hỏi 1
    `;
    const parsed = parseRawExamText(rawExam);
    const doc = buildDocumentFromParsedExam(parsed, {
      department: 'SỞ GD ĐỒNG NAI',
      school: 'THPT CHUYÊN',
    });

    assert.ok(doc.matrixTopics.length > 0);
    assert.strictEqual(doc.specification.multipleChoice.length, 2);
    assert.strictEqual(doc.specification.trueFalse.length, 1);
    assert.strictEqual(doc.specification.shortAnswer.length, 1);

    const check = crossCheckMatrixAndSpec(doc.matrixTopics, doc.specification);
    assert.strictEqual(check.isSynced, true);
    assert.strictEqual(check.discrepancies.length, 0);
  });

  test('detects MỆNH ĐỀ VÀ TẬP HỢP and maps questions to Mệnh đề & Tập hợp units in Specification Table', () => {
    const rawExam = `
ĐỀ KIỂM TRA TOÁN 10
PHẦN I. Câu trắc nghiệm nhiều lựa chọn
Câu 1. Câu nào sau đây là một mệnh đề toán học?
Câu 2. Cho hai tập hợp A = (-2; 3] và B = [1; 5). Tìm giao của hai tập hợp A ∩ B.
PHẦN II. Câu trắc nghiệm đúng sai
Câu 1. Cho mệnh đề chứa biến P(x): "x^2 - 4 = 0" và tập hợp X = {-2; 2}.
a) P(2) là mệnh đề đúng.
b) Mệnh đề phủ định của P(x) có chứa kí hiệu với mọi ∀x.
c) Tập hợp X là tập con của R.
d) Số phần tử của tập hợp A ∪ B là 4.
PHẦN III. Trả lời ngắn
Câu 1. Lớp 10A có 40 học sinh, trong đó 25 em giỏi Toán, 20 em giỏi Anh, 10 em giỏi cả hai môn. Hỏi có bao nhiêu học sinh giỏi ít nhất một môn?
    `;
    const parsed = parseRawExamText(rawExam);
    const doc = buildDocumentFromParsedExam(parsed);

    const hasMenhDeTopic = doc.matrixTopics.some((t) =>
      t.topicName.includes('MỆNH ĐỀ VÀ TẬP HỢP')
    );
    assert.strictEqual(hasMenhDeTopic, true);

    const allUnitContents = doc.matrixTopics.flatMap((t) =>
      t.units.map((u) => u.content)
    );
    assert.ok(allUnitContents.some((c) => c.includes('Mệnh đề')));
    assert.ok(allUnitContents.some((c) => c.includes('Tập hợp')));

    const check = crossCheckMatrixAndSpec(doc.matrixTopics, doc.specification);
    assert.strictEqual(check.isSynced, true);
  });

  test('parses 10.pdf (ĐỀ KHẢO SÁT CHẤT LƯỢNG ĐẦU NĂM TOÁN 10) into exact 28-command Matrix & Specification matching MT_Toan_10_Khaosatdaunam_26-27.pdf', () => {
    const raw10Pdf = `
SỞ GD&ĐT ĐỒNG NAI
TRƯỜNG TH – THCS – THPT SONG NGỮ Á CHÂU
ĐỀ KHẢO SÁT CHẤT LƯỢNG ĐẦU NĂM
NĂM HỌC: 2026 – 2027
MÔN: TOÁN - LỚP 10
Thời gian làm bài: 90 phút

PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.
Câu 1. Cho X = {x ∈ ℝ | 2x² - 5x + 3 = 0}, khẳng định nào sau đây đúng:
Câu 2. Tính giá trị của biểu thức P = sin 30° cos 60° + sin 60° cos 30°
Câu 3. Cho mệnh đề P: "∀x ∈ ℝ, x² + x + 1 > 0". Mệnh đề phủ định của mệnh đề P là:
Câu 4. Trong các câu sau, có bao nhiêu câu là mệnh đề?
Câu 5. Đường thẳng biểu diễn hình học tất cả các nghiệm của phương trình bậc nhất hai ẩn 2x - y = 1 là đường thẳng nào?
Câu 6. Hàm số bậc nhất nào dưới đây có đồ thị đi qua điểm M(1; -1) và cắt trục tung tại điểm có tung độ bằng 1?
Câu 7. Phát biểu nào sau đây là một mệnh đề đúng?
Câu 8. Cho góc α tù. Khẳng định nào sau đây sai?
Câu 9. Gọi (x0; y0) là nghiệm của hệ phương trình {2x + 3y = -2; -3x - 2y = -2}.
Câu 10. Tìm nghiệm của bất phương trình 2x - 4 > 0?
Câu 11. Cho tam giác ABC vuông tại A, hệ thức nào sau đây không đúng?
Câu 12. Cho hình chữ nhật ABCD có AB = 2, AD = 2√3. Số đo góc ABD là

PHẦN II. Câu trắc nghiệm đúng sai.
Câu 1. Cho hai mệnh đề P: "-2 là một số nguyên" và Q: "√2 là một số hữu tỉ"
a) Mệnh đề P là mệnh đề đúng.
b) Mệnh đề Q là mệnh đề sai.
c) Mệnh đề P ⇒ Q là mệnh đề sai.
d) Mệnh đề Q ⇒ P là mệnh đề sai.
Câu 2. Quãng đường AB dài 150 km. Một xe tải khởi hành từ A đến B với vận tốc dự định.
a) Thời gian đi nửa quãng đường đầu là 75/x (giờ).
b) Thời gian đi nửa quãng đường sau là 75/(x+5) (giờ).
c) Phương trình biểu thị mối liên hệ thời gian là 75/x - 75/(x+5) = 1/4.
d) Vận tốc dự định ban đầu của xe tải là 55 km/h.

PHẦN III. Câu trắc nghiệm trả lời ngắn.
Câu 1. Trong một công viên có một cầu trượt có mặt phẳng cầu trượt nghiêng so với mặt đất một góc 28°.
Câu 2. Cho tập hợp X = {n ∈ ℕ | n là bội của 2 và 6, n ≤ 38}. Tập X có bao nhiêu phần tử?
Câu 3. Cho góc nhọn α thỏa mãn cot α = 3 cos α. Giá trị của sin α bằng bao nhiêu?
Câu 4. Cho phương trình (m² - 4)x = m(m + 2). Tìm m để phương trình vô nghiệm.

PHẦN IV. Tự luận.
Câu 1. Cho tập hợp X = {a ∈ ℤ | -12 < a < 9, a chia hết cho 3}.
a) Hãy viết tập hợp X bằng cách liệt kê các phần tử. Tập hợp X có bao nhiêu phần tử?
b) Điền kí hiệu ∈; ∉ vào ô trống: -9 □ X ; -12 □ X.
Câu 2. Xét tính đúng sai (có giải thích) của mỗi mệnh đề sau và phát biểu mệnh đề phủ định của nó.
Câu 3. Không dùng máy tính cầm tay, tính giá trị của biểu thức A = sin² 25° + sin² 45° + sin² 60° + sin² 65°.
    `;

    const parsed = parseRawExamText(raw10Pdf);
    assert.strictEqual(parsed.detectedExamName, 'ĐỀ KHẢO SÁT CHẤT LƯỢNG ĐẦU NĂM');
    const doc = buildDocumentFromParsedExam(parsed);

    assert.strictEqual(doc.matrixTopics.length, 2);
    assert.strictEqual(doc.matrixTopics[0].topicName, 'ĐẠI SỐ');
    assert.strictEqual(doc.matrixTopics[1].topicName, 'HÌNH HỌC');
    assert.strictEqual(doc.specification.multipleChoice.length, 12);
    assert.strictEqual(doc.specification.trueFalse.length, 2);
    assert.strictEqual(doc.specification.shortAnswer.length, 4);
    assert.strictEqual(doc.specification.essay.length, 4);
    assert.strictEqual(doc.specification.essay[0].questionLabel, 'Câu 1a');
    assert.strictEqual(doc.specification.essay[1].questionLabel, 'Câu 1b');

    const check = crossCheckMatrixAndSpec(doc.matrixTopics, doc.specification);
    assert.strictEqual(check.isSynced, true);
    assert.strictEqual(check.specTotal, 28);
  });
});


