/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function initHistory<T>(initial: T): HistoryState<T> {
  return {
    past: [],
    present: initial,
    future: [],
  };
}

export function pushHistory<T>(
  state: HistoryState<T>,
  next: T,
  maxHistory: number = 50
): HistoryState<T> {
  // If next is identical reference to present, do nothing
  if (state.present === next) {
    return state;
  }

  const newPast = [...state.past, state.present];
  if (newPast.length > maxHistory) {
    newPast.splice(0, newPast.length - maxHistory);
  }

  return {
    past: newPast,
    present: next,
    future: [], // New branch clears future
  };
}

export function undoHistory<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.past.length === 0) {
    return state;
  }

  const previous = state.past[state.past.length - 1];
  const newPast = state.past.slice(0, state.past.length - 1);

  return {
    past: newPast,
    present: previous,
    future: [state.present, ...state.future],
  };
}

export function redoHistory<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.future.length === 0) {
    return state;
  }

  const next = state.future[0];
  const newFuture = state.future.slice(1);

  return {
    past: [...state.past, state.present],
    present: next,
    future: newFuture,
  };
}

export function canUndo<T>(state: HistoryState<T>): boolean {
  return state.past.length > 0;
}

export function canRedo<T>(state: HistoryState<T>): boolean {
  return state.future.length > 0;
}
