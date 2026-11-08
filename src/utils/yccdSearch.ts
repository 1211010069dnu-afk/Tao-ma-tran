/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { YCCDItem, MathGrade } from '../data/yccdDatabase';

/**
 * Removes Vietnamese diacritics/accents and converts to lowercase
 * to enable accent-insensitive search (e.g. 'dao ham' matches 'Đạo hàm')
 */
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
    .toLowerCase();
}

/**
 * Tests whether a YCCDItem matches a search query using both
 * case-insensitive and diacritic-insensitive comparisons across
 * mainTopic, subTopic, requirements list, and keywords.
 * Also supports multi-term queries where each word matches across the item.
 */
export function matchYccdItem(item: YCCDItem, query: string): boolean {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return true;

  const rawQuery = cleanQuery;
  const noAccentQuery = removeVietnameseDiacritics(cleanQuery);

  // Build combined searchable strings for the item
  const combinedRaw = [
    item.mainTopic,
    item.subTopic || '',
    ...item.requirements,
    ...(item.keywords || []),
  ]
    .join(' ')
    .toLowerCase();

  const combinedNoAccent = removeVietnameseDiacritics(combinedRaw);

  // 1. Direct whole-phrase match
  if (combinedRaw.includes(rawQuery) || combinedNoAccent.includes(noAccentQuery)) {
    return true;
  }

  // 2. Multi-term match: each space-separated word in query must be present
  const terms = cleanQuery.split(/\s+/).filter(Boolean);
  if (terms.length > 1) {
    const allTermsMatch = terms.every((term) => {
      const termNoAccent = removeVietnameseDiacritics(term);
      return combinedRaw.includes(term) || combinedNoAccent.includes(termNoAccent);
    });
    if (allTermsMatch) return true;
  }

  return false;
}

export interface YccdFilterOptions {
  grade?: MathGrade | 'all';
  domain?: string;
  query?: string;
}

/**
 * Filters a list of YCCD items by Grade, Domain, and Search Query.
 */
export function filterYccdItems(
  items: YCCDItem[],
  options: YccdFilterOptions
): YCCDItem[] {
  const { grade = 'all', domain = 'all', query = '' } = options;

  return items.filter((item) => {
    // Grade filter
    if (grade !== 'all' && item.grade !== grade) {
      return false;
    }

    // Domain filter
    if (domain !== 'all') {
      if (domain === 'Số và Đại số / Giải tích') {
        if (
          item.domain !== 'Số và Đại số' &&
          item.domain !== 'Đại số và Một số yếu tố Giải tích'
        ) {
          return false;
        }
      } else if (item.domain !== domain) {
        return false;
      }
    }

    // Search query
    if (query && !matchYccdItem(item, query)) {
      return false;
    }

    return true;
  });
}
