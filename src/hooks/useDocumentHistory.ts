/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  HistoryState,
  initHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo as checkCanUndo,
  canRedo as checkCanRedo,
} from '../utils/historyManager.ts';

export interface SetDocOptions {
  /** If true, record a new history snapshot immediately without debouncing */
  immediate?: boolean;
}

export function useDocumentHistory<T>(initialValue: T | (() => T), maxHistory: number = 50) {
  const [history, setHistory] = useState<HistoryState<T>>(() => {
    const initial = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    return initHistory(initial);
  });

  // Track the baseline state before rapid input changes
  const baselineStateRef = useRef<T>(history.present);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep baseline updated if present changes via undo/redo
  useEffect(() => {
    baselineStateRef.current = history.present;
  }, [history.present]);

  const commitSnapshot = useCallback((nextDoc: T) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setHistory((prev) => {
      if (prev.present === nextDoc) return prev;
      return pushHistory(prev, nextDoc, maxHistory);
    });
    baselineStateRef.current = nextDoc;
  }, [maxHistory]);

  const setDoc = useCallback(
    (
      updater: T | ((prev: T) => T),
      options?: SetDocOptions
    ) => {
      setHistory((prev) => {
        const nextValue =
          typeof updater === 'function'
            ? (updater as (prev: T) => T)(prev.present)
            : updater;

        if (nextValue === prev.present) return prev;

        if (options?.immediate) {
          // Immediately commit snapshot to history
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
          }
          baselineStateRef.current = nextValue;
          return pushHistory(prev, nextValue, maxHistory);
        }

        // For non-immediate (e.g. typing), update present immediately so UI is instant,
        // and schedule history push after user stops typing (400ms)
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          setHistory((currentHistory) => {
            if (currentHistory.present === baselineStateRef.current) {
              return currentHistory;
            }
            const committed = pushHistory(
              {
                ...currentHistory,
                present: baselineStateRef.current,
              },
              currentHistory.present,
              maxHistory
            );
            baselineStateRef.current = currentHistory.present;
            return committed;
          });
          debounceTimerRef.current = null;
        }, 400);

        return {
          ...prev,
          present: nextValue,
        };
      });
    },
    [maxHistory]
  );

  const undo = useCallback((): boolean => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    let performed = false;
    setHistory((prev) => {
      if (!checkCanUndo(prev)) return prev;
      performed = true;
      const nextState = undoHistory(prev);
      baselineStateRef.current = nextState.present;
      return nextState;
    });
    return performed;
  }, []);

  const redo = useCallback((): boolean => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    let performed = false;
    setHistory((prev) => {
      if (!checkCanRedo(prev)) return prev;
      performed = true;
      const nextState = redoHistory(prev);
      baselineStateRef.current = nextState.present;
      return nextState;
    });
    return performed;
  }, []);

  const resetHistory = useCallback((newInitial: T) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    baselineStateRef.current = newInitial;
    setHistory(initHistory(newInitial));
  }, []);

  // Global keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Cmd+Z, Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea with active selection unless they want document undo
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (!modifier) return;

      const key = e.key.toLowerCase();

      if (key === 'z') {
        if (e.shiftKey) {
          // Redo: Ctrl+Shift+Z / Cmd+Shift+Z
          if (!isInput || !checkCanUndo) {
            e.preventDefault();
            redo();
          }
        } else {
          // Undo: Ctrl+Z / Cmd+Z
          // If in text input and text changed locally, let native handle it unless user wants global undo
          // Intercepting with preventDefault when canUndo gives consistent app-wide experience
          if (!isInput) {
            e.preventDefault();
            undo();
          }
        }
      } else if (key === 'y' && !e.shiftKey) {
        // Redo: Ctrl+Y
        if (!isInput) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    doc: history.present,
    setDoc,
    undo,
    redo,
    canUndo: checkCanUndo(history),
    canRedo: checkCanRedo(history),
    historyStats: {
      pastCount: history.past.length,
      futureCount: history.future.length,
    },
    resetHistory,
    commitSnapshot,
  };
}
