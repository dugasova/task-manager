import type { StateCreator } from 'zustand';
import type { Label, Id } from '../../types';
import type { KanbanStore } from '../types';
import { generateId } from '../../../../lib/id';

export interface LabelsSlice {
  labels: Label[];
  addLabel: (name: string, color: string) => Id;
  deleteLabel: (id: Id) => void;
}

export const createLabelsSlice: StateCreator<KanbanStore, [], [], LabelsSlice> = (_set, get) => ({
  labels: [],

  addLabel: (name, color) => {
    const id = generateId();
    get().commit((state) => ({ labels: [...state.labels, { id, name, color }] }));
    return id;
  },

  deleteLabel: (id) => get().commit((state) => ({
    labels: state.labels.filter((label) => label.id !== id),
    tasks: state.tasks.map((task) =>
      task.labelIds?.includes(id)
        ? { ...task, labelIds: task.labelIds.filter((labelId) => labelId !== id) }
        : task
    )
  })),
});
