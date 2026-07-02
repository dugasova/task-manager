import { create } from 'zustand';
import type { Column, Task, Id } from '../types';

interface KanbanState {
  columns: Column[];
  tasks: Task[];
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
  moveTask: (taskId: Id, targetColumnId: Id, targetIndex: number) => void;
  reorderColumns: (activeId: Id, overId: Id) => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  columns: [],
  tasks: [],

  addColumn: (title) => set((state) => ({
    columns: [...state.columns, { id: crypto.randomUUID(), title }]
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
    tasks: [...state.tasks, { id: crypto.randomUUID(), columnId, content }]
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
              { id: crypto.randomUUID(), text, done: false },
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
}));
