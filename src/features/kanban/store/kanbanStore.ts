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

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  labels: Label[];
  addColumn: (title: string) => void;
  deleteColumn: (id: Id) => void;
  updateColumnTitle: (id: Id, title: string) => void;
  addTask: (columnId: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  updateTaskContent: (id: Id, content: string) => void;
  updateTaskDescription: (id: Id, description: string) => void;
  addChecklistItem: (taskId: Id, text: string) => void;
  toggleChecklistItem: (taskId: Id, itemId: Id) => void;
  deleteChecklistItem: (taskId: Id, itemId: Id) => void;
  addLabel: (name: string, color: string) => Id;
  deleteLabel: (id: Id) => void;
  toggleTaskLabel: (taskId: Id, labelId: Id) => void;
  moveTask: (taskId: Id, targetColumnId: Id, targetIndex: number) => void;
  reorderColumns: (activeId: Id, overId: Id) => void;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      columns: [],
      tasks: [],
      labels: [],

      addColumn: (title) => set((state) => ({
        columns: [...state.columns, { id: generateId(), title }]
      })),
      deleteColumn: (id) => set((state) => ({
        columns: state.columns.filter((column) => column.id !== id)
      })),
      updateColumnTitle: (id, title) => set((state) => ({
        columns: state.columns.map((column) =>
          column.id === id ? { ...column, title } : column
        )
      })),
      addTask: (columnId, content) => set((state) => ({
        tasks: [...state.tasks, { id: generateId(), columnId, content }]
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id)
      })),
      updateTaskContent: (id, content) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, content } : task
        )
      })),
      updateTaskDescription: (id, description) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, description } : task
        )
      })),
      addChecklistItem: (taskId, text) => set((state) => ({
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
      toggleChecklistItem: (taskId, itemId) => set((state) => ({
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
      deleteChecklistItem: (taskId, itemId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, checklist: (task.checklist ?? []).filter((item) => item.id !== itemId) }
            : task
        )
      })),
      addLabel: (name, color) => {
        const id = generateId();
        set((state) => ({ labels: [...state.labels, { id, name, color }] }));
        return id;
      },
      deleteLabel: (id) => set((state) => ({
        labels: state.labels.filter((label) => label.id !== id),
        tasks: state.tasks.map((task) =>
          task.labelIds?.includes(id)
            ? { ...task, labelIds: task.labelIds.filter((labelId) => labelId !== id) }
            : task
        )
      })),
      toggleTaskLabel: (taskId, labelId) => set((state) => ({
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
        set((state) => {
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
        set((state) => {
          const columns = [...state.columns];
          const activeIndex = columns.findIndex((column) => column.id === activeId);
          const overIndex = columns.findIndex((column) => column.id === overId);

          if (activeIndex === -1 || overIndex === -1) return {};

          const [activeColumn] = columns.splice(activeIndex, 1);
          columns.splice(overIndex, 0, activeColumn);

          return { columns };
        }),
    }),
    {
      name: 'kanban-storage',
      storage: safeStorage,
      partialize: (state) => ({ columns: state.columns, tasks: state.tasks, labels: state.labels }),
    }
  )
);
