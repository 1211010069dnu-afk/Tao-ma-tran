import {
  ALL_CELL_KEYS,
  CellKey,
  CompetencyDomain,
  CrossCheckDiscrepancy,
  CrossCheckReport,
  MatrixSummaryStats,
  MatrixTopic,
  SpecSummaryStats,
  SpecificationData,
  ThinkingLevelKey,
} from '../types/exam';
import { CELL_KEY_LABELS } from '../data/mathCompetencies';

/**
 * Parses a Matrix cell string such as:
 * - "02TN\n(TD1.2, TD2.1)" -> 2
 * - "1TN\n(GQ1.2)" -> 1
 * - "01(ĐS)\n(GQ2.1)" -> 1
 * - "01TN (TD1.1) + 01ĐS (TD1.3)" -> 2
 */
export function parseCellCommandCount(cellValue: string): number {
  if (!cellValue || !cellValue.trim()) return 0;

  // Match numbers directly preceding TN, ĐS, (ĐS), TLN, TL (case-insensitive)
  const regex = /(\d+)\s*\(?(?:TN|ĐS|DS|TLN|TL)\)?/gi;
  let match: RegExpExecArray | null;
  let sum = 0;
  let foundPattern = false;

  while ((match = regex.exec(cellValue)) !== null) {
    foundPattern = true;
    sum += parseInt(match[1], 10);
  }

  if (foundPattern) {
    return sum;
  }

  // Fallback: if the user typed a plain number at the start of the cell (e.g. "2")
  const leadingNumber = cellValue.trim().match(/^(\d+)\b/);
  if (leadingNumber) {
    return parseInt(leadingNumber[1], 10);
  }

  return 0;
}

/**
 * Calculates full summary statistics for Table I (MA TRẬN)
 */
export function calculateMatrixSummary(topics: MatrixTopic[]): MatrixSummaryStats {
  const byCell: Record<CellKey, number> = {
    TD_Biet: 0,
    TD_Hieu: 0,
    TD_VD: 0,
    GQ_Biet: 0,
    GQ_Hieu: 0,
    GQ_VD: 0,
    MH_Biet: 0,
    MH_Hieu: 0,
    MH_VD: 0,
  };

  const unitTotals: Record<string, number> = {};

  for (const topic of topics) {
    for (const unit of topic.units) {
      let unitSum = 0;
      for (const key of ALL_CELL_KEYS) {
        const count = parseCellCommandCount(unit.cells[key] || '');
        byCell[key] += count;
        unitSum += count;
      }
      unitTotals[unit.id] = unitSum;
    }
  }

  const byDomain: Record<CompetencyDomain, number> = {
    TD: byCell.TD_Biet + byCell.TD_Hieu + byCell.TD_VD,
    GQ: byCell.GQ_Biet + byCell.GQ_Hieu + byCell.GQ_VD,
    MH: byCell.MH_Biet + byCell.MH_Hieu + byCell.MH_VD,
  };

  const byLevel: Record<ThinkingLevelKey, number> = {
    Biet: byCell.TD_Biet + byCell.GQ_Biet + byCell.MH_Biet,
    Hieu: byCell.TD_Hieu + byCell.GQ_Hieu + byCell.MH_Hieu,
    VD: byCell.TD_VD + byCell.GQ_VD + byCell.MH_VD,
  };

  const grandTotal = byDomain.TD + byDomain.GQ + byDomain.MH;

  return {
    byCell,
    byDomain,
    byLevel,
    unitTotals,
    grandTotal,
  };
}

/**
 * Calculates full summary statistics for Table II (BẢNG ĐẶC TẢ)
 * including command counts and exact scores per thinking level (Biết, Hiểu, Vận dụng).
 */
export function calculateSpecSummary(spec: SpecificationData): SpecSummaryStats {
  const byCell: Record<CellKey, number> = {
    TD_Biet: 0,
    TD_Hieu: 0,
    TD_VD: 0,
    GQ_Biet: 0,
    GQ_Hieu: 0,
    GQ_VD: 0,
    MH_Biet: 0,
    MH_Hieu: 0,
    MH_VD: 0,
  };

  const scoreByLevel: Record<ThinkingLevelKey, number> = {
    Biet: 0,
    Hieu: 0,
    VD: 0,
  };

  let totalScore = 0;

  // 1. Multiple Choice (TN)
  for (const item of spec.multipleChoice) {
    byCell[item.cellKey] += 1;
    const level = CELL_KEY_LABELS[item.cellKey].level;
    scoreByLevel[level] += Number(item.score) || 0;
    totalScore += Number(item.score) || 0;
  }

  // 2. True/False (ĐS) - Each subItem (a, b, c, d) counts as 1 command and shares 1/N of the question's score (typically 0.25 each for 1.0 total)
  for (const item of spec.trueFalse) {
    const qScore = Number(item.score) || 0;
    totalScore += qScore;
    const subCount = item.subItems.length || 1;
    const perSubScore = qScore / subCount;
    for (const sub of item.subItems) {
      byCell[sub.cellKey] += 1;
      const level = CELL_KEY_LABELS[sub.cellKey].level;
      scoreByLevel[level] += perSubScore;
    }
  }

  // 3. Short Answer (TLN)
  for (const item of spec.shortAnswer) {
    byCell[item.cellKey] += 1;
    const level = CELL_KEY_LABELS[item.cellKey].level;
    scoreByLevel[level] += Number(item.score) || 0;
    totalScore += Number(item.score) || 0;
  }

  // 4. Essay (TL)
  for (const item of spec.essay) {
    byCell[item.cellKey] += 1;
    const level = CELL_KEY_LABELS[item.cellKey].level;
    scoreByLevel[level] += Number(item.score) || 0;
    totalScore += Number(item.score) || 0;
  }

  const byDomain: Record<CompetencyDomain, number> = {
    TD: byCell.TD_Biet + byCell.TD_Hieu + byCell.TD_VD,
    GQ: byCell.GQ_Biet + byCell.GQ_Hieu + byCell.GQ_VD,
    MH: byCell.MH_Biet + byCell.MH_Hieu + byCell.MH_VD,
  };

  const byLevel: Record<ThinkingLevelKey, number> = {
    Biet: byCell.TD_Biet + byCell.GQ_Biet + byCell.MH_Biet,
    Hieu: byCell.TD_Hieu + byCell.GQ_Hieu + byCell.MH_Hieu,
    VD: byCell.TD_VD + byCell.GQ_VD + byCell.MH_VD,
  };

  const totalCommands = byDomain.TD + byDomain.GQ + byDomain.MH;

  // Round floating point scores to 2 decimal places
  scoreByLevel.Biet = Math.round(scoreByLevel.Biet * 100) / 100;
  scoreByLevel.Hieu = Math.round(scoreByLevel.Hieu * 100) / 100;
  scoreByLevel.VD = Math.round(scoreByLevel.VD * 100) / 100;
  totalScore = Math.round(totalScore * 100) / 100;

  return {
    byCell,
    byDomain,
    byLevel,
    scoreByLevel,
    totalCommands,
    totalScore,
  };
}

/**
 * Synchronizes Matrix cells directly from the Specification table items
 * by grouping items by (unitId, cellKey, questionType).
 */
export function syncMatrixFromSpec(topics: MatrixTopic[], spec: SpecificationData): MatrixTopic[] {
  // Map: unitId -> cellKey -> type ('TN' | 'ĐS' | 'TLN' | 'TL') -> string[] (indicatorCodes)
  type TypeBucket = Record<'TN' | 'ĐS' | 'TLN' | 'TL', string[]>;
  const map: Record<string, Record<CellKey, TypeBucket>> = {};

  const ensureBucket = (unitId: string, cellKey: CellKey): TypeBucket => {
    if (!map[unitId]) {
      map[unitId] = {} as Record<CellKey, TypeBucket>;
    }
    if (!map[unitId][cellKey]) {
      map[unitId][cellKey] = { TN: [], ĐS: [], TLN: [], TL: [] };
    }
    return map[unitId][cellKey];
  };

  for (const item of spec.multipleChoice) {
    ensureBucket(item.unitId, item.cellKey).TN.push(item.indicatorCode);
  }

  for (const item of spec.trueFalse) {
    for (const sub of item.subItems) {
      ensureBucket(item.unitId, sub.cellKey).ĐS.push(sub.indicatorCode);
    }
  }

  for (const item of spec.shortAnswer) {
    ensureBucket(item.unitId, item.cellKey).TLN.push(item.indicatorCode);
  }

  for (const item of spec.essay) {
    ensureBucket(item.unitId, item.cellKey).TL.push(item.indicatorCode);
  }

  const formatCount = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return topics.map((topic) => ({
    ...topic,
    units: topic.units.map((unit) => {
      const newCells: Record<CellKey, string> = {
        TD_Biet: '',
        TD_Hieu: '',
        TD_VD: '',
        GQ_Biet: '',
        GQ_Hieu: '',
        GQ_VD: '',
        MH_Biet: '',
        MH_Hieu: '',
        MH_VD: '',
      };

      for (const cellKey of ALL_CELL_KEYS) {
        const bucket = map[unit.id]?.[cellKey];
        if (!bucket) continue;

        const activeTypes = (['TN', 'ĐS', 'TLN', 'TL'] as const).filter(
          (qType) => bucket[qType].length > 0
        );
        if (activeTypes.length === 0) continue;

        if (activeTypes.length > 1) {
          const allUniqueCodes = Array.from(
            new Set(activeTypes.flatMap((qType) => bucket[qType].filter(Boolean)))
          );
          const countLines = activeTypes.map(
            (qType) => `${formatCount(bucket[qType].length)}${qType}`
          );
          const codeSuffix =
            allUniqueCodes.length > 0 ? `\n(${allUniqueCodes.join(', ')})` : '';
          newCells[cellKey] = `${countLines.join(',\n')}${codeSuffix}`;
        } else {
          const qType = activeTypes[0];
          const codes = bucket[qType];
          const uniqueCodes = Array.from(new Set(codes.filter(Boolean)));
          const codeSuffix =
            uniqueCodes.length > 0 ? `\n(${uniqueCodes.join(', ')})` : '';
          newCells[cellKey] = `${formatCount(codes.length)}${qType}${codeSuffix}`;
        }
      }

      return {
        ...unit,
        cells: newCells,
      };
    }),
  }));
}

/**
 * Compares Matrix summary against Specification summary to detect any discrepancies
 */
export function crossCheckMatrixAndSpec(topics: MatrixTopic[], spec: SpecificationData): CrossCheckReport {
  const mStats = calculateMatrixSummary(topics);
  const sStats = calculateSpecSummary(spec);

  const discrepancies: CrossCheckDiscrepancy[] = [];
  for (const key of ALL_CELL_KEYS) {
    if (mStats.byCell[key] !== sStats.byCell[key]) {
      discrepancies.push({
        cellKey: key,
        matrixCount: mStats.byCell[key],
        specCount: sStats.byCell[key],
      });
    }
  }

  return {
    isSynced: discrepancies.length === 0 && mStats.grandTotal === sStats.totalCommands,
    matrixTotal: mStats.grandTotal,
    specTotal: sStats.totalCommands,
    discrepancies,
  };
}

/**
 * Balancing strategies for 10-point scale:
 * 1. 'moet_standard': Standard MOET 2018 exam format:
 *    - Multiple Choice (TN): 0.25 pt / question
 *    - True/False (ĐS): 1.0 pt / question (0.25 pt per sub-item)
 *    - Short Answer (TLN): 0.5 pt / question
 *    - Essay (TL): remaining points evenly distributed, rounded to 0.25 or 0.5 pt to reach exactly 10.0 pts.
 * 2. 'ratio_433': 40% Biết (4.0 pts), 30% Hiểu (3.0 pts), 30% Vận dụng (3.0 pts).
 * 3. 'ratio_532': 50% Biết (5.0 pts), 30% Hiểu (3.0 pts), 20% Vận dụng (2.0 pts).
 */
export type BalanceStrategy = 'moet_standard' | 'ratio_433' | 'ratio_532';

export function autoBalanceScores(
  spec: SpecificationData,
  strategy: BalanceStrategy = 'moet_standard'
): SpecificationData {
  const newSpec: SpecificationData = structuredClone(spec);

  if (strategy === 'moet_standard') {
    const tnCount = newSpec.multipleChoice.length;
    const dsCount = newSpec.trueFalse.length;
    const tlnCount = newSpec.shortAnswer.length;
    const tlCount = newSpec.essay.length;

    // Apply baseline standard weights
    newSpec.multipleChoice.forEach((q) => {
      q.score = 0.25;
    });
    newSpec.trueFalse.forEach((q) => {
      q.score = 1.0;
    });
    newSpec.shortAnswer.forEach((q) => {
      q.score = 0.5;
    });

    const allocated = tnCount * 0.25 + dsCount * 1.0 + tlnCount * 0.5;
    const remaining = 10.0 - allocated;

    if (tlCount > 0) {
      // Distribute remaining evenly among essay questions, rounded to 0.25
      const rawPerEssay = remaining / tlCount;
      const perEssay = Math.max(0.25, Math.round(rawPerEssay * 4) / 4);
      let runningSum = allocated;
      newSpec.essay.forEach((q, idx) => {
        if (idx === tlCount - 1) {
          const finalScore = Math.max(0.25, Math.round((10.0 - runningSum) * 100) / 100);
          q.score = finalScore;
        } else {
          q.score = perEssay;
          runningSum += perEssay;
        }
      });
    } else if (remaining !== 0 && tlnCount > 0) {
      // If no essay and remaining points differ from 10.0, adjust short answers (higher cognitive questions)
      const adjustedTLN = Math.max(0.25, Math.round(((10.0 - (tnCount * 0.25 + dsCount * 1.0)) / tlnCount) * 4) / 4);
      let running = tnCount * 0.25 + dsCount * 1.0;
      newSpec.shortAnswer.forEach((q, idx) => {
        if (idx === tlnCount - 1) {
          q.score = Math.max(0.25, Math.round((10.0 - running) * 100) / 100);
        } else {
          q.score = adjustedTLN;
          running += adjustedTLN;
        }
      });
    }
    return newSpec;
  }

  // Strategy based on cognitive difficulty (Biết / Hiểu / Vận dụng)
  const targetLevelScores: Record<ThinkingLevelKey, number> =
    strategy === 'ratio_433'
      ? { Biet: 4.0, Hieu: 3.0, VD: 3.0 }
      : { Biet: 5.0, Hieu: 3.0, VD: 2.0 };

  // Count items by thinking level across all commands (counting ĐS subItems as 1 each)
  const levelCounts: Record<ThinkingLevelKey, number> = { Biet: 0, Hieu: 0, VD: 0 };

  for (const q of newSpec.multipleChoice) {
    levelCounts[CELL_KEY_LABELS[q.cellKey].level] += 1;
  }
  for (const q of newSpec.trueFalse) {
    for (const sub of q.subItems) {
      levelCounts[CELL_KEY_LABELS[sub.cellKey].level] += 1;
    }
  }
  for (const q of newSpec.shortAnswer) {
    levelCounts[CELL_KEY_LABELS[q.cellKey].level] += 1;
  }
  for (const q of newSpec.essay) {
    levelCounts[CELL_KEY_LABELS[q.cellKey].level] += 1;
  }

  // Calculate per-command score for each level
  const perCommandScore: Record<ThinkingLevelKey, number> = {
    Biet: levelCounts.Biet > 0 ? targetLevelScores.Biet / levelCounts.Biet : 0,
    Hieu: levelCounts.Hieu > 0 ? targetLevelScores.Hieu / levelCounts.Hieu : 0,
    VD: levelCounts.VD > 0 ? targetLevelScores.VD / levelCounts.VD : 0,
  };

  // Assign scores
  for (const q of newSpec.multipleChoice) {
    const lvl = CELL_KEY_LABELS[q.cellKey].level;
    q.score = Math.max(0.1, Math.round(perCommandScore[lvl] * 20) / 20); // round to 0.05
  }

  for (const q of newSpec.trueFalse) {
    let qTotal = 0;
    for (const sub of q.subItems) {
      const lvl = CELL_KEY_LABELS[sub.cellKey].level;
      qTotal += perCommandScore[lvl];
    }
    q.score = Math.max(0.25, Math.round(qTotal * 4) / 4); // round to 0.25
  }

  for (const q of newSpec.shortAnswer) {
    const lvl = CELL_KEY_LABELS[q.cellKey].level;
    q.score = Math.max(0.25, Math.round(perCommandScore[lvl] * 4) / 4);
  }

  for (const q of newSpec.essay) {
    const lvl = CELL_KEY_LABELS[q.cellKey].level;
    q.score = Math.max(0.5, Math.round(perCommandScore[lvl] * 2) / 2);
  }

  // Fine-tune total to exactly 10.00
  const currentTotal = calculateSpecSummary(newSpec).totalScore;
  const diff = Math.round((10.0 - currentTotal) * 100) / 100;

  if (diff !== 0) {
    if (newSpec.essay.length > 0) {
      newSpec.essay[newSpec.essay.length - 1].score = Math.max(
        0.25,
        Math.round((newSpec.essay[newSpec.essay.length - 1].score + diff) * 100) / 100
      );
    } else if (newSpec.shortAnswer.length > 0) {
      newSpec.shortAnswer[newSpec.shortAnswer.length - 1].score = Math.max(
        0.25,
        Math.round((newSpec.shortAnswer[newSpec.shortAnswer.length - 1].score + diff) * 100) / 100
      );
    } else if (newSpec.trueFalse.length > 0) {
      newSpec.trueFalse[newSpec.trueFalse.length - 1].score = Math.max(
        0.25,
        Math.round((newSpec.trueFalse[newSpec.trueFalse.length - 1].score + diff) * 100) / 100
      );
    }
  }

  return newSpec;
}

/**
 * Formats a number in Vietnamese decimal notation (e.g., 0.25 -> "0,25", 3.5 -> "3,5", 10 -> "10")
 */
export function formatVnScore(score: number): string {
  const rounded = Math.round(score * 100) / 100;
  return rounded.toString().replace('.', ',');
}

