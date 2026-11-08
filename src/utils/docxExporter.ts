import {
  AlignmentType,
  BorderStyle,
  Document,
  PageOrientation,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { ALL_CELL_KEYS, CellKey, ExamDocument } from '../types/exam';
import {
  calculateMatrixSummary,
  calculateSpecSummary,
  formatVnScore,
} from './matrixCalculator';

const FONT_FAMILY = 'Times New Roman';
const GREEN_FILL = 'C6E0B4';
const ORANGE_FILL = 'F8CBAD';

const standardBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
};

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

function makeCellParagraphs(
  text: string,
  options: {
    bold?: boolean;
    italics?: boolean;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    size?: number;
  } = {}
): Paragraph[] {
  const lines = (text || '').split('\n');
  return lines.map(
    (line) =>
      new Paragraph({
        alignment: options.align ?? AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: line,
            bold: options.bold ?? false,
            italics: options.italics ?? false,
            font: FONT_FAMILY,
            size: options.size ?? 22, // 11pt in tables
          }),
        ],
      })
  );
}

function makeTableCell(
  text: string,
  options: {
    bold?: boolean;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    fill?: string;
    rowSpan?: number;
    columnSpan?: number;
    widthPct?: number;
  } = {}
): TableCell {
  return new TableCell({
    rowSpan: options.rowSpan,
    columnSpan: options.columnSpan,
    verticalAlign: VerticalAlign.CENTER,
    borders: standardBorders,
    width: options.widthPct
      ? { size: options.widthPct, type: WidthType.PERCENTAGE }
      : undefined,
    shading: options.fill
      ? { fill: options.fill, type: ShadingType.CLEAR, color: 'auto' }
      : undefined,
    children: makeCellParagraphs(text, {
      bold: options.bold,
      align: options.align ?? AlignmentType.CENTER,
    }),
  });
}

export async function exportExamDocumentToDocx(doc: ExamDocument): Promise<void> {
  const matrixStats = calculateMatrixSummary(doc.matrixTopics);
  const specStats = calculateSpecSummary(doc.specification);

  // 1. Header Table (2 columns, borderless)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: doc.header.department, font: FONT_FAMILY, size: 24 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: doc.header.school, bold: true, font: FONT_FAMILY, size: 24 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [
                  new TextRun({ text: '──────────────────', bold: true, font: FONT_FAMILY, size: 22 }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorders,
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: doc.header.examTitle, bold: true, font: FONT_FAMILY, size: 24 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: doc.header.examName, bold: true, font: FONT_FAMILY, size: 24 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: doc.header.gradeAndYear, bold: true, font: FONT_FAMILY, size: 24 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [
                  new TextRun({ text: doc.header.subject, bold: true, font: FONT_FAMILY, size: 24 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 2. Section I & II Paragraphs (Mục đích & Hình thức)
  const introParagraphs: Paragraph[] = [
    new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({
          text: 'I. MỤC ĐÍCH VÀ YÊU CẦU CỦA ĐỀ KIỂM TRA',
          bold: true,
          font: FONT_FAMILY,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [
        new TextRun({ text: '1. Kiến thức', bold: true, font: FONT_FAMILY, size: 24 }),
      ],
    }),
  ];

  for (const ks of doc.objectives.knowledgeSections) {
    introParagraphs.push(
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({ text: ks.title, bold: true, font: FONT_FAMILY, size: 24 }),
        ],
      })
    );
    for (const b of ks.bullets) {
      introParagraphs.push(
        new Paragraph({
          spacing: { before: 30, after: 30 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: `−  ${b}`, font: FONT_FAMILY, size: 24 }),
          ],
        })
      );
    }
  }

  introParagraphs.push(
    new Paragraph({
      spacing: { before: 80, after: 60 },
      children: [
        new TextRun({ text: '2. Kỹ năng', bold: true, font: FONT_FAMILY, size: 24 }),
      ],
    })
  );

  for (const skill of doc.objectives.skills) {
    introParagraphs.push(
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({ text: `– ${skill}`, font: FONT_FAMILY, size: 24 }),
        ],
      })
    );
  }

  introParagraphs.push(
    new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({
          text: 'II. HÌNH THỨC CỦA ĐỀ KIỂM TRA',
          bold: true,
          font: FONT_FAMILY,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: `- Hình thức: ${doc.format.structureText}`,
          bold: true,
          font: FONT_FAMILY,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 40, after: 160 },
      children: [
        new TextRun({
          text: `- Thời gian làm bài: ${doc.format.durationText}`,
          bold: true,
          font: FONT_FAMILY,
          size: 24,
        }),
      ],
    })
  );

  // 3. Table I: MA TRẬN
  const matrixRows: TableRow[] = [
    // Header Row 1
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell('Chủ đề', { bold: true, fill: GREEN_FILL, rowSpan: 3, widthPct: 12 }),
        makeTableCell('Nội dung', { bold: true, fill: GREEN_FILL, rowSpan: 3, widthPct: 18 }),
        makeTableCell('Năng lực Toán học – Cấp độ tư duy', {
          bold: true,
          fill: GREEN_FILL,
          columnSpan: 9,
          widthPct: 63,
        }),
        makeTableCell('Tổng\nlệnh\nhỏi', { bold: true, fill: GREEN_FILL, rowSpan: 3, widthPct: 7 }),
      ],
    }),
    // Header Row 2
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell('Tư duy và lập luận toán học\n(TD)', {
          bold: true,
          fill: GREEN_FILL,
          columnSpan: 3,
        }),
        makeTableCell('Giải quyết vấn đề toán học\n(GQ)', {
          bold: true,
          fill: GREEN_FILL,
          columnSpan: 3,
        }),
        makeTableCell('Mô hình hóa toán học\n(MH)', {
          bold: true,
          fill: GREEN_FILL,
          columnSpan: 3,
        }),
      ],
    }),
    // Header Row 3
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell('Biết', { bold: true, fill: GREEN_FILL }),
        makeTableCell('Hiểu', { bold: true, fill: GREEN_FILL }),
        makeTableCell('VD', { bold: true, fill: GREEN_FILL }),
        makeTableCell('Biết', { bold: true, fill: GREEN_FILL }),
        makeTableCell('Hiểu', { bold: true, fill: GREEN_FILL }),
        makeTableCell('VD', { bold: true, fill: GREEN_FILL }),
        makeTableCell('Biết', { bold: true, fill: GREEN_FILL }),
        makeTableCell('Hiểu', { bold: true, fill: GREEN_FILL }),
        makeTableCell('VD', { bold: true, fill: GREEN_FILL }),
      ],
    }),
  ];

  // Matrix Data Rows
  for (const topic of doc.matrixTopics) {
    topic.units.forEach((unit, uIdx) => {
      const cells: TableCell[] = [];
      if (uIdx === 0) {
        cells.push(
          makeTableCell(topic.topicName, {
            bold: true,
            rowSpan: topic.units.length,
          })
        );
      }
      cells.push(makeTableCell(unit.content, { align: AlignmentType.CENTER }));
      for (const key of ALL_CELL_KEYS) {
        cells.push(makeTableCell(unit.cells[key] || ''));
      }
      const uTotal = matrixStats.unitTotals[unit.id] || 0;
      cells.push(makeTableCell(uTotal > 0 ? `${uTotal}` : ''));
      matrixRows.push(new TableRow({ children: cells }));
    });
  }

  // Matrix Summary Rows (4 orange rows matching Page 3 of PDF)
  matrixRows.push(
    new TableRow({
      children: [
        makeTableCell('Tổng lệnh hỏi', { bold: true, fill: ORANGE_FILL, columnSpan: 2 }),
        makeTableCell(`${matrixStats.byDomain.TD}`, { bold: true, fill: ORANGE_FILL, columnSpan: 3 }),
        makeTableCell(`${matrixStats.byDomain.GQ}`, { bold: true, fill: ORANGE_FILL, columnSpan: 3 }),
        makeTableCell(`${matrixStats.byDomain.MH}`, { bold: true, fill: ORANGE_FILL, columnSpan: 3 }),
        makeTableCell(`${matrixStats.grandTotal}`, { bold: true, fill: ORANGE_FILL }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell('Biết', { bold: true, fill: ORANGE_FILL, columnSpan: 2 }),
        makeTableCell(matrixStats.byCell.TD_Biet ? `${matrixStats.byCell.TD_Biet}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(matrixStats.byCell.GQ_Biet ? `${matrixStats.byCell.GQ_Biet}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(matrixStats.byCell.MH_Biet ? `${matrixStats.byCell.MH_Biet}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(`${matrixStats.byLevel.Biet}`, { bold: true, fill: ORANGE_FILL }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell('Hiểu', { bold: true, fill: ORANGE_FILL, columnSpan: 2 }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(matrixStats.byCell.TD_Hieu ? `${matrixStats.byCell.TD_Hieu}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(matrixStats.byCell.GQ_Hieu ? `${matrixStats.byCell.GQ_Hieu}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(matrixStats.byCell.MH_Hieu ? `${matrixStats.byCell.MH_Hieu}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(`${matrixStats.byLevel.Hieu}`, { bold: true, fill: ORANGE_FILL }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell('Vận dụng', { bold: true, fill: ORANGE_FILL, columnSpan: 2 }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(matrixStats.byCell.TD_VD ? `${matrixStats.byCell.TD_VD}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(matrixStats.byCell.GQ_VD ? `${matrixStats.byCell.GQ_VD}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(matrixStats.byCell.MH_VD ? `${matrixStats.byCell.MH_VD}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell(`${matrixStats.byLevel.VD}`, { bold: true, fill: ORANGE_FILL }),
      ],
    })
  );

  const matrixTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: matrixRows,
  });

  // 4. Table II: BẢNG ĐẶC TẢ (14 internal grid columns to accommodate Câu + a/b/c/d sub-column seamlessly)
  const specRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell('Dạng\nthức', { bold: true, fill: GREEN_FILL, rowSpan: 3, widthPct: 9 }),
        makeTableCell('Câu', { bold: true, fill: GREEN_FILL, rowSpan: 3, columnSpan: 2, widthPct: 8 }),
        makeTableCell('Mạch kiến thức/ Nội dung', { bold: true, fill: GREEN_FILL, rowSpan: 3, widthPct: 31 }),
        makeTableCell('Năng lực Toán học – Cấp độ tư duy', {
          bold: true,
          fill: GREEN_FILL,
          columnSpan: 9,
          widthPct: 45,
        }),
        makeTableCell('Điểm', { bold: true, fill: GREEN_FILL, rowSpan: 3, widthPct: 7 }),
      ],
    }),
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell('Tư duy và lập luận toán học\n(TD)', { bold: true, fill: GREEN_FILL, columnSpan: 3 }),
        makeTableCell('Giải quyết vấn đề toán học\n(GQ)', { bold: true, fill: GREEN_FILL, columnSpan: 3 }),
        makeTableCell('Mô hình hóa toán học\n(MH)', { bold: true, fill: GREEN_FILL, columnSpan: 3 }),
      ],
    }),
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell('Biết', { bold: true, fill: GREEN_FILL }),
        makeTableCell('Hiểu', { bold: true, fill: GREEN_FILL }),
        makeTableCell('VD', { bold: true, fill: GREEN_FILL }),
        makeTableCell('Biết', { bold: true, fill: GREEN_FILL }),
        makeTableCell('Hiểu', { bold: true, fill: GREEN_FILL }),
        makeTableCell('VD', { bold: true, fill: GREEN_FILL }),
        makeTableCell('Biết', { bold: true, fill: GREEN_FILL }),
        makeTableCell('Hiểu', { bold: true, fill: GREEN_FILL }),
        makeTableCell('VD', { bold: true, fill: GREEN_FILL }),
      ],
    }),
  ];

  const makeCompetencyCellsForSpec = (activeKey: CellKey, code: string): TableCell[] =>
    ALL_CELL_KEYS.map((k) => makeTableCell(k === activeKey ? code : ''));

  const formatSpecDescriptionWithUnit = (
    _unitId: string,
    description: string,
    _showUnitPrefix = false
  ): string => {
    return description;
  };

  // Section 1: Multiple Choice (TN)
  doc.specification.multipleChoice.forEach((item, idx) => {
    const rowCells: TableCell[] = [];
    if (idx === 0) {
      rowCells.push(
        makeTableCell('1. Trắc\nnghiệm\nnhiều lựa\nchọn', {
          bold: true,
          rowSpan: doc.specification.multipleChoice.length,
        })
      );
    }
    rowCells.push(makeTableCell(item.questionLabel, { columnSpan: 2 }));
    rowCells.push(
      makeTableCell(formatSpecDescriptionWithUnit(item.unitId, item.description), {
        align: AlignmentType.LEFT,
      })
    );
    rowCells.push(...makeCompetencyCellsForSpec(item.cellKey, item.indicatorCode));
    rowCells.push(makeTableCell(formatVnScore(item.score)));
    specRows.push(new TableRow({ children: rowCells }));
  });

  // Section 2: True/False (ĐS)
  const totalDsSubRows = doc.specification.trueFalse.reduce(
    (acc, q) => acc + q.subItems.length,
    0
  );
  let isFirstDsRow = true;
  for (const q of doc.specification.trueFalse) {
    q.subItems.forEach((sub, sIdx) => {
      const rowCells: TableCell[] = [];
      if (isFirstDsRow) {
        rowCells.push(
          makeTableCell('2. Trắc\nnghiệm\nĐúng/ Sai', {
            bold: true,
            rowSpan: totalDsSubRows,
          })
        );
        isFirstDsRow = false;
      }
      if (sIdx === 0) {
        rowCells.push(makeTableCell(q.questionLabel, { rowSpan: q.subItems.length }));
      }
      rowCells.push(makeTableCell(sub.subLabel));
      rowCells.push(
        makeTableCell(formatSpecDescriptionWithUnit(q.unitId, sub.description, sIdx === 0), {
          align: AlignmentType.LEFT,
        })
      );
      rowCells.push(...makeCompetencyCellsForSpec(sub.cellKey, sub.indicatorCode));
      if (sIdx === 0) {
        rowCells.push(
          makeTableCell(formatVnScore(q.score), { rowSpan: q.subItems.length })
        );
      }
      specRows.push(new TableRow({ children: rowCells }));
    });
  }

  // Section 3: Short Answer (TLN)
  doc.specification.shortAnswer.forEach((item, idx) => {
    const rowCells: TableCell[] = [];
    if (idx === 0) {
      rowCells.push(
        makeTableCell('3. Trắc\nnghiệm\ntrả lời\nngắn', {
          bold: true,
          rowSpan: doc.specification.shortAnswer.length,
        })
      );
    }
    rowCells.push(makeTableCell(item.questionLabel, { columnSpan: 2 }));
    rowCells.push(
      makeTableCell(formatSpecDescriptionWithUnit(item.unitId, item.description), {
        align: AlignmentType.LEFT,
      })
    );
    rowCells.push(...makeCompetencyCellsForSpec(item.cellKey, item.indicatorCode));
    rowCells.push(makeTableCell(formatVnScore(item.score)));
    specRows.push(new TableRow({ children: rowCells }));
  });

  // Section 4: Essay (TL) if present
  doc.specification.essay.forEach((item, idx) => {
    const rowCells: TableCell[] = [];
    if (idx === 0) {
      rowCells.push(
        makeTableCell('4. Tự luận', {
          bold: true,
          rowSpan: doc.specification.essay.length,
        })
      );
    }
    rowCells.push(makeTableCell(item.questionLabel, { columnSpan: 2 }));
    rowCells.push(
      makeTableCell(formatSpecDescriptionWithUnit(item.unitId, item.description), {
        align: AlignmentType.LEFT,
      })
    );
    rowCells.push(...makeCompetencyCellsForSpec(item.cellKey, item.indicatorCode));
    rowCells.push(makeTableCell(formatVnScore(item.score)));
    specRows.push(new TableRow({ children: rowCells }));
  });

  // Spec Summary Rows (4 orange rows matching Page 7 of PDF)
  specRows.push(
    new TableRow({
      children: [
        makeTableCell('Tổng lệnh\nhỏi', { bold: true, fill: ORANGE_FILL }),
        makeTableCell(`${specStats.totalCommands}`, { bold: true, fill: ORANGE_FILL, columnSpan: 3 }),
        makeTableCell(`${specStats.byDomain.TD}`, { bold: true, fill: ORANGE_FILL, columnSpan: 3 }),
        makeTableCell(`${specStats.byDomain.GQ}`, { bold: true, fill: ORANGE_FILL, columnSpan: 3 }),
        makeTableCell(`${specStats.byDomain.MH}`, { bold: true, fill: ORANGE_FILL, columnSpan: 3 }),
        makeTableCell(formatVnScore(specStats.totalScore), { bold: true, fill: ORANGE_FILL }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell('Biết', { bold: true, fill: ORANGE_FILL }),
        makeTableCell(`${specStats.byLevel.Biet}`, { bold: true, fill: ORANGE_FILL, columnSpan: 3 }),
        makeTableCell(specStats.byCell.TD_Biet ? `${specStats.byCell.TD_Biet}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(specStats.byCell.GQ_Biet ? `${specStats.byCell.GQ_Biet}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(specStats.byCell.MH_Biet ? `${specStats.byCell.MH_Biet}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(formatVnScore(specStats.scoreByLevel.Biet), { bold: true, fill: ORANGE_FILL }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell('Hiểu', { bold: true, fill: ORANGE_FILL }),
        makeTableCell(`${specStats.byLevel.Hieu}`, { bold: true, fill: ORANGE_FILL, columnSpan: 3 }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(specStats.byCell.TD_Hieu ? `${specStats.byCell.TD_Hieu}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(specStats.byCell.GQ_Hieu ? `${specStats.byCell.GQ_Hieu}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(specStats.byCell.MH_Hieu ? `${specStats.byCell.MH_Hieu}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(formatVnScore(specStats.scoreByLevel.Hieu), { bold: true, fill: ORANGE_FILL }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell('Vận dụng', { bold: true, fill: ORANGE_FILL }),
        makeTableCell(`${specStats.byLevel.VD}`, { bold: true, fill: ORANGE_FILL, columnSpan: 3 }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(specStats.byCell.TD_VD ? `${specStats.byCell.TD_VD}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(specStats.byCell.GQ_VD ? `${specStats.byCell.GQ_VD}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell('', { fill: ORANGE_FILL }),
        makeTableCell(specStats.byCell.MH_VD ? `${specStats.byCell.MH_VD}` : '', { bold: true, fill: ORANGE_FILL }),
        makeTableCell(formatVnScore(specStats.scoreByLevel.VD), { bold: true, fill: ORANGE_FILL }),
      ],
    })
  );

  const specTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: specRows,
  });

  const wordDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          headerTable,
          ...introParagraphs,
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: 'I. MA TRẬN', bold: true, font: FONT_FAMILY, size: 24 }),
            ],
          }),
          matrixTable,
          new Paragraph({
            spacing: { before: 120, after: 200 },
            children: [
              new TextRun({
                text: doc.format.footnoteText,
                bold: true,
                italics: true,
                font: FONT_FAMILY,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: 'II. BẢNG ĐẶC TẢ', bold: true, font: FONT_FAMILY, size: 24 }),
            ],
          }),
          specTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(wordDoc);
  const url = URL.createObjectURL(blob);
  const safeExam = doc.header.examName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/gi, '');
  const safeSchool = doc.header.school
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/gi, '');
  const a = document.createElement('a');
  a.href = url;
  a.download = `MaTran_DacTa_Toan_${safeExam || 'KiemTra'}${safeSchool ? '_' + safeSchool : ''}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
