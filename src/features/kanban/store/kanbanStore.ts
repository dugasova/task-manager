import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeStorage } from './safeStorage';
import { createColumnsSlice } from './slices/columnsSlice';
import { createTasksSlice } from './slices/tasksSlice';
import { createLabelsSlice } from './slices/labelsSlice';
import { createHistorySlice } from './slices/historySlice';
import type { KanbanStore } from './types';

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (...a) => ({
      ...createColumnsSlice(...a),
      ...createTasksSlice(...a),
      ...createLabelsSlice(...a),
      ...createHistorySlice(...a),
    }),
    {
      name: 'kanban-storage',
      storage: safeStorage,
      partialize: (state) => ({ columns: state.columns, tasks: state.tasks, labels: state.labels }),
    }
  )
);

export type { KanbanStore };
