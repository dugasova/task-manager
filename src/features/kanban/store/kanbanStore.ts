import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Column, Task, Label, Id } from '../types';
import { generateId } from '../../../lib/id';

const safeStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // storage unavailable (private mode, full quota) - state stays in-memory only
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
}));

interface Snapshot {
  columns: Column[];
  tasks: Task[];
  labels: Label[];
}

const MAX_HISTORY = 50;

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  labels: Label[];
  past: Snapshot[];
  future: Snapshot[];
  addColumn: (title: string) => void;
  deleteColumn: (id: Id) => void;
  updateColumnTitle: (id: Id, title: string) => void;
  addTask: (columnId: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  archiveTask: (id: Id) => void;
  restoreTask: (id: Id) => void;
  updateTaskContent: (id: Id, content: string) => void;
  updateTaskDescription: (id: Id, description: string) => void;
  setTaskPriority: (id: Id, priority: Task['priority']) => void;
  addChecklistItem: (taskId: Id, text: string) => void;
  toggleChecklistItem: (taskId: Id, itemId: Id) => void;
  deleteChecklistItem: (taskId: Id, itemId: Id) => void;
  addLabel: (name: string, color: string) => Id;
  deleteLabel: (id: Id) => void;
  toggleTaskLabel: (taskId: Id, labelId: Id) => void;
  moveTask: (taskId: Id, targetColumnId: Id, targetIndex: number) => void;
  reorderColumns: (activeId: Id, overId: Id) => void;
  undo: () => void;
  redo: () => void;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => {
      // Applies an undoable change: snapshots the current columns/tasks/labels onto
      // `past` and clears `future` before writing the new values. Actions that end up
      // no-ops (empty `changes`) skip history so undo doesn't fill up with dead entries.
      const commit = (updater: (state: KanbanState) => Partial<Snapshot>) => {
        const state = get();
        const changes = updater(state);
        if (Object.keys(changes).length === 0) return;

        const snapshot: Snapshot = { columns: state.columns, tasks: state.tasks, labels: state.labels };
        set({
          ...changes,
          past: [...state.past, snapshot].slice(-MAX_HISTORY),
          future: [],
        });
      };

      return {
        columns: [],
        tasks: [],
        labels: [],
        past: [],
        future: [],

        addColumn: (title) => commit((state) => ({
          columns: [...state.columns, { id: generateId(), title }]
        })),
        deleteColumn: (id) => commit((state) => ({
          columns: state.columns.filter((column) => column.id !== id)
        })),
        updateColumnTitle: (id, title) => commit((state) => ({
          columns: state.columns.map((column) =>
            column.id === id ? { ...column, title } : column
          )
        })),
        addTask: (columnId, content) => commit((state) => ({
          tasks: [...state.tasks, { id: generateId(), columnId, content }]
        })),
        deleteTask: (id) => commit((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        })),
        archiveTask: (id) => commit((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, archived: true } : task
          )
        })),
        restoreTask: (id) => commit((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, archived: false } : task
          )
        })),
        updateTaskContent: (id, content) => commit((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, content } : task
          )
        })),
        updateTaskDescription: (id, description) => commit((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, description } : task
          )
        })),
        setTaskPriority: (id, priority) => commit((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, priority } : task
          )
        })),
        addChecklistItem: (taskId, text) => commit((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  checklist: [
                    ...(task.checklist ?? []),
                    { id: generateId(), text, done: false },
                  ],
                }
              : task
          )
        })),
        toggleChecklistItem: (taskId, itemId) => commit((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  checklist: (task.checklist ?? []).map((item) =>
                    item.id === itemId ? { ...item, done: !item.done } : item
                  ),
                }
              : task
          )
        })),
        deleteChecklistItem: (taskId, itemId) => commit((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, checklist: (task.checklist ?? []).filter((item) => item.id !== itemId) }
              : task
          )
        })),
        addLabel: (name, color) => {
          const id = generateId();
          commit((state) => ({ labels: [...state.labels, { id, name, color }] }));
          return id;
        },
        deleteLabel: (id) => commit((state) => ({
          labels: state.labels.filter((label) => label.id !== id),
          tasks: state.tasks.map((task) =>
            task.labelIds?.includes(id)
              ? { ...task, labelIds: task.labelIds.filter((labelId) => labelId !== id) }
              : task
          )
        })),
        toggleTaskLabel: (taskId, labelId) => commit((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task
            const labelIds = task.labelIds ?? []
            return {
              ...task,
              labelIds: labelIds.includes(labelId)
                ? labelIds.filter((id) => id !== labelId)
                : [...labelIds, labelId],
            }
          })
        })),
        moveTask: (taskId, targetColumnId, targetIndex) =>
          commit((state) => {
            const tasks = [...state.tasks];
            const taskIndex = tasks.findIndex((task) => task.id === taskId);

            if (taskIndex === -1) return {};

            const [movedTask] = tasks.splice(taskIndex, 1);
            tasks.splice(targetIndex, 0, movedTask);

            const updatedTasks = tasks.map((task) =>
              task.id === taskId ? { ...task, columnId: targetColumnId } : task
            );

            return { tasks: updatedTasks };
          }),
        reorderColumns: (activeId, overId) =>
          commit((state) => {
            const columns = [...state.columns];
            const activeIndex = columns.findIndex((column) => column.id === activeId);
            const overIndex = columns.findIndex((column) => column.id === overId);

            if (activeIndex === -1 || overIndex === -1) return {};

            const [activeColumn] = columns.splice(activeIndex, 1);
            columns.splice(overIndex, 0, activeColumn);

            return { columns };
          }),
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
      };
    },
    {
      name: 'kanban-storage',
      storage: safeStorage,
      partialize: (state) => ({ columns: state.columns, tasks: state.tasks, labels: state.labels }),
    }
  )
);
