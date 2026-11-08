/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  initHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo,
} from './historyManager.ts';

describe('HistoryManager', () => {
  it('should initialize correctly with empty past and future', () => {
    const history = initHistory({ count: 1 });
    assert.deepStrictEqual(history.present, { count: 1 });
    assert.strictEqual(history.past.length, 0);
    assert.strictEqual(history.future.length, 0);
    assert.strictEqual(canUndo(history), false);
    assert.strictEqual(canRedo(history), false);
  });

  it('should push new state into history and clear future', () => {
    let history = initHistory('A');
    history = pushHistory(history, 'B');
    assert.strictEqual(history.present, 'B');
    assert.deepStrictEqual(history.past, ['A']);
    assert.strictEqual(canUndo(history), true);
    assert.strictEqual(canRedo(history), false);

    history = pushHistory(history, 'C');
    assert.strictEqual(history.present, 'C');
    assert.deepStrictEqual(history.past, ['A', 'B']);
  });

  it('should correctly undo and redo states', () => {
    let history = initHistory('state 1');
    history = pushHistory(history, 'state 2');
    history = pushHistory(history, 'state 3');

    // Undo to state 2
    history = undoHistory(history);
    assert.strictEqual(history.present, 'state 2');
    assert.deepStrictEqual(history.past, ['state 1']);
    assert.deepStrictEqual(history.future, ['state 3']);
    assert.strictEqual(canUndo(history), true);
    assert.strictEqual(canRedo(history), true);

    // Undo to state 1
    history = undoHistory(history);
    assert.strictEqual(history.present, 'state 1');
    assert.deepStrictEqual(history.past, []);
    assert.deepStrictEqual(history.future, ['state 2', 'state 3']);
    assert.strictEqual(canUndo(history), false);
    assert.strictEqual(canRedo(history), true);

    // Extra undo should be no-op
    history = undoHistory(history);
    assert.strictEqual(history.present, 'state 1');

    // Redo to state 2
    history = redoHistory(history);
    assert.strictEqual(history.present, 'state 2');
    assert.deepStrictEqual(history.past, ['state 1']);
    assert.deepStrictEqual(history.future, ['state 3']);

    // Redo to state 3
    history = redoHistory(history);
    assert.strictEqual(history.present, 'state 3');
    assert.deepStrictEqual(history.past, ['state 1', 'state 2']);
    assert.deepStrictEqual(history.future, []);
    assert.strictEqual(canRedo(history), false);
  });

  it('should clear future when pushing a new state after undo', () => {
    let history = initHistory(1);
    history = pushHistory(history, 2);
    history = pushHistory(history, 3);
    history = undoHistory(history); // present = 2, future = [3]

    // Push new branch 4
    history = pushHistory(history, 4);
    assert.strictEqual(history.present, 4);
    assert.deepStrictEqual(history.past, [1, 2]);
    assert.deepStrictEqual(history.future, []);
    assert.strictEqual(canRedo(history), false);
  });

  it('should respect maxHistory limit to prevent memory bloating', () => {
    let history = initHistory(0);
    for (let i = 1; i <= 10; i++) {
      history = pushHistory(history, i, 5);
    }
    assert.strictEqual(history.present, 10);
    assert.strictEqual(history.past.length, 5);
    assert.deepStrictEqual(history.past, [5, 6, 7, 8, 9]);
  });
});
