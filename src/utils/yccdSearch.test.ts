/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  removeVietnameseDiacritics,
  matchYccdItem,
  filterYccdItems,
} from './yccdSearch.ts';
import { YCCD_DATABASE } from '../data/yccdDatabase.ts';

describe('YCCD Search Utility', () => {
  it('removeVietnameseDiacritics correctly strips tones and d-bar', () => {
    assert.strictEqual(
      removeVietnameseDiacritics('Đạo hàm và Tích phân'),
      'dao ham va tich phan'
    );
    assert.strictEqual(
      removeVietnameseDiacritics('Vectơ trong không gian'),
      'vecto trong khong gian'
    );
    assert.strictEqual(
      removeVietnameseDiacritics('Xác suất & Thống kê'),
      'xac suat & thong ke'
    );
  });

  it('matches items with diacritics and without diacritics', () => {
    const sampleItem = YCCD_DATABASE.find((item) =>
      item.mainTopic.toLowerCase().includes('hàm số bậc hai')
    );
    assert.ok(sampleItem, 'Should find Ham so bac hai in database');

    // Search with exact Vietnamese diacritics
    assert.strictEqual(matchYccdItem(sampleItem, 'bậc hai'), true);
    assert.strictEqual(matchYccdItem(sampleItem, 'parabol'), true);

    // Search without diacritics (unaccented)
    assert.strictEqual(matchYccdItem(sampleItem, 'bac hai'), true);
    assert.strictEqual(matchYccdItem(sampleItem, 'dinh parabol'), true);

    // Unrelated query
    assert.strictEqual(matchYccdItem(sampleItem, 'tích phân bội ba'), false);
  });

  it('filters YCCD database by keyword and grade correctly', () => {
    // Search for 'vecto' across all grades
    const vectoAll = filterYccdItems(YCCD_DATABASE, {
      query: 'vecto',
      grade: 'all',
    });
    assert.ok(vectoAll.length > 0, 'Should find vector topics');
    assert.ok(
      vectoAll.some((item) => item.grade === '10'),
      'Should include Grade 10 vector topics'
    );
    assert.ok(
      vectoAll.some((item) => item.grade === '12'),
      'Should include Grade 12 vector in space topics'
    );

    // Filter specifically to Grade 10
    const vectoG10 = filterYccdItems(YCCD_DATABASE, {
      query: 'vecto',
      grade: '10',
    });
    assert.ok(vectoG10.length > 0);
    assert.ok(vectoG10.every((item) => item.grade === '10'));

    // Filter by domain
    const probG10 = filterYccdItems(YCCD_DATABASE, {
      grade: '10',
      domain: 'Thống kê và Xác suất',
    });
    assert.ok(probG10.length > 0);
    assert.ok(probG10.every((item) => item.domain === 'Thống kê và Xác suất'));
  });

  it('returns all items when query is empty', () => {
    const all = filterYccdItems(YCCD_DATABASE, { query: '' });
    assert.strictEqual(all.length, YCCD_DATABASE.length);
  });
});
