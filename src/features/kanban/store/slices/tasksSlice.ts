import type { StateCreator } from 'zustand';
import type { Task, Id } from '../../types';
import type { KanbanStore } from '../types';
import { generateId } from '../../../../lib/id';

export interface TasksSlice {
  tasks: Task[];
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
  toggleTaskLabel: (taskId: Id, labelId: Id) => void;
  moveTask: (taskId: Id, targetColumnId: Id, targetIndex: number) => void;
}

export const createTasksSlice: StateCreator<KanbanStore, [], [], TasksSlice> = (_set, get) => ({
  tasks: [],

  addTask: (columnId, content) => get().commit((state) => ({
    tasks: [...state.tasks, { id: generateId(), columnId, content }]
  })),

  deleteTask: (id) => get().commit((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id)
  })),

  archiveTask: (id) => get().commit((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, archived: true } : task
    )
  })),

  restoreTask: (id) => get().commit((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, archived: false } : task
    )
  })),

  updateTaskContent: (id, content) => get().commit((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, content } : task
    )
  })),

  updateTaskDescription: (id, description) => get().commit((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, description } : task
    )
  })),

  setTaskPriority: (id, priority) => get().commit((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, priority } : task
    )
  })),

  addChecklistItem: (taskId, text) => get().commit((state) => ({
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

  toggleChecklistItem: (taskId, itemId) => get().commit((state) => ({
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

  deleteChecklistItem: (taskId, itemId) => get().commit((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId
        ? { ...task, checklist: (task.checklist ?? []).filter((item) => item.id !== itemId) }
        : task
    )
  })),

  toggleTaskLabel: (taskId, labelId) => get().commit((state) => ({
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
    get().commit((state) => {
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
});
