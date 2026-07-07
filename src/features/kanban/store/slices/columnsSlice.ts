import type { StateCreator } from 'zustand';
import type { Column, Id } from '../../types';
import type { KanbanStore } from '../types';
import { generateId } from '../../../../lib/id';

export interface ColumnsSlice {
  columns: Column[];
  addColumn: (title: string) => void;
  deleteColumn: (id: Id) => void;
  updateColumnTitle: (id: Id, title: string) => void;
  reorderColumns: (activeId: Id, overId: Id) => void;
}

export const createColumnsSlice: StateCreator<KanbanStore, [], [], ColumnsSlice> = (_set, get) => ({
  columns: [],

  addColumn: (title) => get().commit((state) => ({
    columns: [...state.columns, { id: generateId(), title }]
  })),

  deleteColumn: (id) => get().commit((state) => ({
    columns: state.columns.filter((column) => column.id !== id)
  })),

  updateColumnTitle: (id, title) => get().commit((state) => ({
    columns: state.columns.map((column) =>
      column.id === id ? { ...column, title } : column
    )
  })),

  reorderColumns: (activeId, overId) =>
    get().commit((state) => {
      const columns = [...state.columns];
      const activeIndex = columns.findIndex((column) => column.id === activeId);
      const overIndex = columns.findIndex((column) => column.id === overId);

      if (activeIndex === -1 || overIndex === -1) return {};

      const [activeColumn] = columns.splice(activeIndex, 1);
      columns.splice(overIndex, 0, activeColumn);

      return { columns };
    }),
});
