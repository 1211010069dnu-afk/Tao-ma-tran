import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeQuestionMathStructure,
  getQuestionSpecMappings,
  suggestYccdRequirementsForUnit,
} from './knowledgeAnalyzer';
import { TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT, DEFAULT_TOAN_10_DOCUMENT } from '../data/sampleToan10';
import { YCCD_DATABASE, MathGrade } from '../data/yccdDatabase';
import { parseRawExamText, buildDocumentFromParsedExam } from './examParser';

describe('Knowledge Analyzer & Curriculum Database (THCS 6-9 & THPT 10-12)', () => {
  it('covers all 7 grades (Grades 6, 7, 8, 9, 10, 11, 12) in YCCD_DATABASE', () => {
    const grades = new Set<MathGrade>(YCCD_DATABASE.map((c) => c.grade));
    const expected: MathGrade[] = ['6', '7', '8', '9', '10', '11', '12'];
    for (const g of expected) {
      assert.equal(grades.has(g), true, `Expected grade ${g} in YCCD_DATABASE`);
    }
  });

  it('analyzes sub-items (a, b, c, d) and questions by mathematical structure and competency code', () => {
    // 1. Definition / direct recognition -> Biết (TD)
    const defAnalysis = analyzeQuestionMathStructure(
      'Cho tập hợp X = {-4; -2; 0; 2; 4}. Điền kí hiệu thích hợp (∈, ∉) vào ô trống.',
      'TN'
    );
    assert.equal(defAnalysis.level, 'Biet');
    assert.equal(defAnalysis.domain, 'TD');

    // 2. Real-world modeling sub-item -> MH
    const mhSubItemAnalysis = analyzeQuestionMathStructure(
      'Ý a) Quãng đường xe thứ nhất đi được sau t giờ là 45t (km).',
      'DS',
      'a',
      'Hai ô tô xuất phát từ A và B trên thực tế chuyển động ngược chiều nhau.'
    );
    assert.equal(mhSubItemAnalysis.isRealWorld, true);
    assert.equal(mhSubItemAnalysis.domain, 'MH');
    assert.equal(mhSubItemAnalysis.level, 'Hieu');

    // 3. Parameter m / multi-step condition -> Vận dụng (GQ)
    const paramAnalysis = analyzeQuestionMathStructure(
      'Cho hai tập hợp A = (-4; 3) và B = (m - 7; m). Tìm tham số m để B là tập con của A.',
      'TL'
    );
    assert.equal(paramAnalysis.hasParameter, true);
    assert.equal(paramAnalysis.level, 'VD');
  });

  it('maps all 28 commands of TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT with 0 false-positive warnings', () => {
    const mappings = getQuestionSpecMappings(TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT);
    assert.equal(mappings.length, 28, 'Should map all 28 commands (12 TN + 8 DS + 4 TLN + 4 TL)');

    const warnings = mappings.flatMap((m) => m.warnings);
    assert.equal(
      warnings.length,
      0,
      `Expected 0 warnings on standard 10.pdf spec, got: ${JSON.stringify(warnings)}`
    );
  });

  it('detects missing MH warning when a real-world problem is tagged as TD instead of MH', () => {
    const clonedDoc = structuredClone(TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT);
    // Change TLN Câu 1 (real-world park slide problem in 10.pdf) from MH_VD to TD_Biet
    const tln1Item = clonedDoc.specification.shortAnswer.find(
      (q) => q.questionLabel === 'Câu 1'
    )!;
    tln1Item.cellKey = 'TD_Biet';
    tln1Item.indicatorCode = 'TD1.1';

    const mappings = getQuestionSpecMappings(clonedDoc);
    const tln1 = mappings.find(
      (m) => m.partType === 'TLN' && m.questionLabel === 'Câu 1'
    )!;
    assert.ok(tln1, 'Should find TLN Câu 1 mapping');
    assert.equal(
      tln1.warnings.some((w) => w.type === 'missing_mh'),
      true,
      'Should flag missing_mh warning when real-world problem lacks MH code'
    );
  });

  it('parses sub-items a, b, c, d independently in examParser and preserves sourceQuestions', () => {
    const sampleExamText = `
      PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.
      Câu 1. Phát biểu nào sau đây là một mệnh đề toán học?
      PHẦN II. Câu trắc nghiệm đúng sai.
      Câu 1. Một xưởng sản xuất gia công bàn ghế có chi phí cố định mỗi tháng.
      a) Biểu thức biểu thị chi phí theo số sản phẩm x là 50x + 200.
      b) Khi sản xuất 10 sản phẩm thì chi phí là 700 nghìn đồng.
      c) Lập bất phương trình để lợi nhuận tối thiểu đạt 15 triệu đồng.
      d) Tìm số sản phẩm tối thiểu cần sản xuất để đạt lợi nhuận lớn nhất.
    `;
    const parsed = parseRawExamText(sampleExamText);
    const built = buildDocumentFromParsedExam(parsed, DEFAULT_TOAN_10_DOCUMENT.header);
    assert.ok(built.sourceQuestions, 'built document should include sourceQuestions');
    assert.equal(
      Object.keys(built.sourceQuestions).length > 0,
      true,
      'sourceQuestions should contain extracted questions and sub-items'
    );
  });

  it('suggests GDPT 2018 YCCĐ items for any topic/unit across grades 6-12', () => {
    const suggestions = suggestYccdRequirementsForUnit(
      'Phương trình lượng giác cơ bản',
      'Hàm số lượng giác và phương trình lượng giác'
    );
    assert.ok(suggestions.length > 0, 'Should return matching YCCĐ items from Grade 11');
  });
});
