import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMatrixSummary,
  calculateSpecSummary,
  crossCheckMatrixAndSpec,
  formatVnScore,
  parseCellCommandCount,
  syncMatrixFromSpec,
  autoBalanceScores,
} from './matrixCalculator';
import {
  DEFAULT_TOAN_10_DOCUMENT,
  TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT,
  TOAN_10_WITH_ESSAY_DOCUMENT,
} from '../data/sampleToan10';

test('parseCellCommandCount extracts exact command counts from various Vietnamese matrix notations', () => {
  assert.equal(parseCellCommandCount('02TN\n(TD1.2, TD2.1)'), 2);
  assert.equal(parseCellCommandCount('02TN,\n02ĐS\n(TD1.1)'), 4);
  assert.equal(parseCellCommandCount('01TN,\n01TL\n(TD1.1)'), 2);
  assert.equal(parseCellCommandCount('1TN\n(GQ1.2)'), 1);
  assert.equal(parseCellCommandCount('1 TN\n(GQ1.1)'), 1);
  assert.equal(parseCellCommandCount('01ĐS\n(TD1.3)'), 1);
  assert.equal(parseCellCommandCount('01(ĐS)\n(GQ2.1)'), 1);
  assert.equal(parseCellCommandCount('01TLN\n(MH2.1)'), 1);
  assert.equal(parseCellCommandCount('02TN (TD1.1) + 01TL (GQ3.1)'), 3);
  assert.equal(parseCellCommandCount(''), 0);
});

test('TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT matches MT_Toan_10_Khaosatdaunam_26-27.pdf 100% (28 commands: 13 TD, 11 GQ, 4 MH; 8 Biết=2,25đ, 13 Hiểu=3,75đ, 7 VD=4đ; 10đ total)', () => {
  const mStats = calculateMatrixSummary(TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT.matrixTopics);
  const sStats = calculateSpecSummary(TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT.specification);
  const check = crossCheckMatrixAndSpec(
    TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT.matrixTopics,
    TOAN_10_KHAO_SAT_DAU_NAM_DOCUMENT.specification
  );

  assert.equal(check.isSynced, true);
  assert.equal(check.discrepancies.length, 0);

  assert.equal(mStats.grandTotal, 28);
  assert.equal(sStats.totalCommands, 28);
  assert.equal(sStats.totalScore, 10);

  assert.equal(sStats.byDomain.TD, 13);
  assert.equal(sStats.byDomain.GQ, 11);
  assert.equal(sStats.byDomain.MH, 4);

  assert.equal(sStats.byLevel.Biet, 8);
  assert.equal(sStats.byLevel.Hieu, 13);
  assert.equal(sStats.byLevel.VD, 7);

  assert.equal(sStats.scoreByLevel.Biet, 2.25);
  assert.equal(sStats.scoreByLevel.Hieu, 3.75);
  assert.equal(sStats.scoreByLevel.VD, 4);

  assert.equal(formatVnScore(sStats.scoreByLevel.Biet), '2,25');
  assert.equal(formatVnScore(sStats.scoreByLevel.Hieu), '3,75');
  assert.equal(formatVnScore(sStats.scoreByLevel.VD), '4');
});

test('DEFAULT_TOAN_10_DOCUMENT matrix summary matches the user PDF exactly (34 commands: 13 TD, 18 GQ, 3 MH; 14 Biết, 11 Hiểu, 9 VD)', () => {
  const stats = calculateMatrixSummary(DEFAULT_TOAN_10_DOCUMENT.matrixTopics);

  assert.equal(stats.grandTotal, 34);
  assert.equal(stats.byDomain.TD, 13);
  assert.equal(stats.byDomain.GQ, 18);
  assert.equal(stats.byDomain.MH, 3);

  assert.equal(stats.byLevel.Biet, 14);
  assert.equal(stats.byLevel.Hieu, 11);
  assert.equal(stats.byLevel.VD, 9);

  assert.equal(stats.byCell.TD_Biet, 9);
  assert.equal(stats.byCell.TD_Hieu, 4);
  assert.equal(stats.byCell.TD_VD, 0);

  assert.equal(stats.byCell.GQ_Biet, 5);
  assert.equal(stats.byCell.GQ_Hieu, 7);
  assert.equal(stats.byCell.GQ_VD, 6);

  assert.equal(stats.byCell.MH_Biet, 0);
  assert.equal(stats.byCell.MH_Hieu, 0);
  assert.equal(stats.byCell.MH_VD, 3);
});

test('DEFAULT_TOAN_10_DOCUMENT specification summary matches the user PDF Page 7 exactly (10 points: 3,5 Biết; 2,75 Hiểu; 3,75 VD)', () => {
  const specStats = calculateSpecSummary(DEFAULT_TOAN_10_DOCUMENT.specification);

  assert.equal(specStats.totalCommands, 34);
  assert.equal(specStats.totalScore, 10);
  assert.equal(specStats.scoreByLevel.Biet, 3.5);
  assert.equal(specStats.scoreByLevel.Hieu, 2.75);
  assert.equal(specStats.scoreByLevel.VD, 3.75);
  assert.equal(formatVnScore(specStats.scoreByLevel.Biet), '3,5');
  assert.equal(formatVnScore(specStats.scoreByLevel.Hieu), '2,75');
  assert.equal(formatVnScore(specStats.scoreByLevel.VD), '3,75');

  const check = crossCheckMatrixAndSpec(
    DEFAULT_TOAN_10_DOCUMENT.matrixTopics,
    DEFAULT_TOAN_10_DOCUMENT.specification
  );
  assert.equal(check.isSynced, true);
  assert.equal(check.discrepancies.length, 0);
});

test('syncMatrixFromSpec rebuilds matrix cells accurately from specification items including Essay (TL)', () => {
  const syncedTopics = syncMatrixFromSpec(
    TOAN_10_WITH_ESSAY_DOCUMENT.matrixTopics,
    TOAN_10_WITH_ESSAY_DOCUMENT.specification
  );
  const check = crossCheckMatrixAndSpec(syncedTopics, TOAN_10_WITH_ESSAY_DOCUMENT.specification);
  assert.equal(check.isSynced, true);

  const specStats = calculateSpecSummary(TOAN_10_WITH_ESSAY_DOCUMENT.specification);
  assert.equal(specStats.totalScore, 10);
});

test('autoBalanceScores balances arbitrary specifications to exactly 10.0 points across all strategies', () => {
  // Test with MOET format
  const balancedMoet = autoBalanceScores(DEFAULT_TOAN_10_DOCUMENT.specification, 'moet_standard');
  const summaryMoet = calculateSpecSummary(balancedMoet);
  assert.equal(summaryMoet.totalScore, 10);

  // Test with 4:3:3 difficulty ratio
  const balanced433 = autoBalanceScores(DEFAULT_TOAN_10_DOCUMENT.specification, 'ratio_433');
  const summary433 = calculateSpecSummary(balanced433);
  assert.equal(summary433.totalScore, 10);

  // Test with 5:3:2 difficulty ratio
  const balanced532 = autoBalanceScores(DEFAULT_TOAN_10_DOCUMENT.specification, 'ratio_532');
  const summary532 = calculateSpecSummary(balanced532);
  assert.equal(summary532.totalScore, 10);
});


