import type { StateCreator } from 'zustand';
import type { Snapshot, KanbanStore } from '../types';

const MAX_HISTORY = 50;

export interface HistorySlice {
  past: Snapshot[];
  future: Snapshot[];
  commit: (updater: (state: KanbanStore) => Partial<Snapshot>) => void;
  undo: () => void;
  redo: () => void;
}

export const createHistorySlice: StateCreator<KanbanStore, [], [], HistorySlice> = (set, get) => ({
  past: [],
  future: [],

  // Applies an undoable change: snapshots the current columns/tasks/labels onto
  // `past` and clears `future` before writing the new values. Actions that end up
  // no-ops (empty `changes`) skip history so undo doesn't fill up with dead entries.
  commit: (updater) => {
    const state = get();
    const changes = updater(state);
    if (Object.keys(changes).length === 0) return;

    const snapshot: Snapshot = { columns: state.columns, tasks: state.tasks, labels: state.labels };
    set({
      ...changes,
      past: [...state.past, snapshot].slice(-MAX_HISTORY),
      future: [],
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;

    const previous = state.past[state.past.length - 1];
    const currentSnapshot: Snapshot = { columns: state.columns, tasks: state.tasks, labels: state.labels };

    set({
      ...previous,
      past: state.past.slice(0, -1),
      future: [currentSnapshot, ...state.future],
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const next = state.future[0];
    const currentSnapshot: Snapshot = { columns: state.columns, tasks: state.tasks, labels: state.labels };

    set({
      ...next,
      past: [...state.past, currentSnapshot],
      future: state.future.slice(1),
    });
  },
});
